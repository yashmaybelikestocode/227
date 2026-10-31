"""The whole analysis: statements -> approaches (Gemma) -> groups -> decisions -> timeline.

Stage 1 scope: no code anchors, no rename trail, no later-change tags (those endpoints answer 501).
"""
from __future__ import annotations

import re
import uuid
from collections import Counter, defaultdict
from typing import Callable, Optional

from . import identities, prompts
from .extract import Approach, mine_thread, pick_reason_statements
from .grouping import group_approaches
from .llm import LLMError
from .models import (Analysis, Claim, Comment, Decision, ImportStep, ImportSummary, LeftOut, Statement, TimelineEntry)
from .sources import Normalized
from .statements import REASON_TEXT, is_bot, split_comment
from .status import Stance, decision_confidence, overall_confidence, resolve_status
from .textutil import tokens
from .verify import Verifier, fallback_reason

STATUS_ORDER = {"accepted": 0, "rejected": 1, "deferred": 2, "unresolved": 3}

STEP_DEFS = [
    ("prs", "Fetching pull requests"),
    ("issues", "Fetching issues"),
    ("comments", "Fetching comments"),
    ("commits", "Fetching commits"),
    ("split", "Splitting discussions into statements"),
    ("people", "Merging people who use more than one name"),
    ("find", "Finding decisions"),
    ("group", "Grouping similar statements"),
    ("renames", "Following file renames"),
]

Progress = Callable[[ImportSummary], None]


def new_summary() -> ImportSummary:
    return ImportSummary(steps=[ImportStep(k, label) for k, label in STEP_DEFS])


def _set(summary: ImportSummary, key: str, state: str, count: Optional[int], progress: Optional[Progress]) -> None:
    for step in summary.steps:
        if step.key == key:
            step.state, step.count = state, count
    if progress:
        progress(summary)


def _sentence(text: str) -> str:
    text = text.strip()
    return text if text[-1:] in ".!?" else text + "."


def analyze(norm: Normalized, repo: str, question: str, range_label: str, llm, progress: Optional[Progress] = None,
            analysis_id: Optional[str] = None, summary: Optional[ImportSummary] = None) -> Analysis:
    if llm is None:
        raise LLMError("No model is available.", fatal=True)
    summary = summary or new_summary()
    verifier = Verifier()
    real_comments = [c for c in norm.comments if c.kind != "commit_message"]
    _set(summary, "prs", "done", norm.prs, progress)
    _set(summary, "issues", "done", norm.issues, progress)
    _set(summary, "comments", "done", len(real_comments), progress)
    _set(summary, "commits", "done", len(norm.commits), progress)
    summary.prs, summary.issues, summary.comments, summary.commits = norm.prs, norm.issues, len(real_comments), len(norm.commits)

    # people (needed so every comment has a person)
    _set(summary, "people", "working", None, progress)
    people, person_of = identities.resolve(norm.authors, norm.commits, norm.side_identities, {c.id: c.date for c in norm.comments})
    for c in norm.comments:
        c.person_id = person_of.get(c.id, "unknown")
    _set(summary, "people", "done", len(people), progress)

    # statements
    _set(summary, "split", "working", None, progress)
    comments = {c.id: c for c in norm.comments}
    statements: list[Statement] = []
    left_out: list[LeftOut] = []
    by_comment: dict[str, list[Statement]] = {}
    for c in norm.comments:
        found, reason = split_comment(c, bot=is_bot(norm.authors[c.id].login))
        if reason:
            left_out.append(LeftOut(c.id, REASON_TEXT[reason]))
        else:
            statements.extend(found)
            by_comment[c.id] = found
    quote_of = {s.id: s.quote for s in statements}
    stmt_of = {s.id: s for s in statements}
    summary.statements_used, summary.statements_left_out = len(statements), len(left_out)
    _set(summary, "split", "done", len(statements), progress)

    # approaches per thread (commit messages are never sent to the model)
    threads: dict[str, list[Statement]] = defaultdict(list)
    for c in sorted(norm.comments, key=lambda x: (x.date, x.id)):
        if c.kind == "commit_message":
            continue
        threads[c.thread].extend(by_comment.get(c.id, []))
    approaches: list[Approach] = []
    windows_total = windows_sent = 0
    _set(summary, "find", "working", 0, progress)
    for thread_id, items in threads.items():
        found, total, sent = mine_thread(llm, items, comments, verifier,
                                         tick=lambda t, s: _set(summary, "find", "working", windows_sent + s, progress))
        approaches.extend(found)
        windows_total += total
        windows_sent += sent
    _set(summary, "group", "working", None, progress)
    groups = group_approaches(approaches, llm, verifier, lambda sid: quote_of[sid])
    _set(summary, "find", "done", len(approaches), progress)

    # decisions
    decisions: list[Decision] = []
    trace: list[dict] = []
    for group in groups:
        decision = _build_decision(len(decisions) + 1, group, comments, stmt_of, llm, verifier)
        if decision:
            decisions.append(decision)
            trace.append({"decision": decision.title, "status": decision.status, "stances": [
                {"statement": stmt_of[s.statement_id].quote[:80], "person": s.person_id, "date": s.date[:10], "stance": s.stance}
                for a in group for s in sorted(a.stances, key=lambda x: (x.date, x.statement_id))]})
    decisions.sort(key=lambda d: (STATUS_ORDER[d.status], min(comments[stmt_of[s].comment_id].date for s in d.statement_ids)))
    for n, d in enumerate(decisions, start=1):
        d.id = f"d{n}"
        for sid in d.statement_ids:
            if stmt_of[sid].decision_id is None:
                stmt_of[sid].decision_id = d.id
    _set(summary, "group", "done", len(decisions), progress)
    _set(summary, "renames", "skipped", None, progress)  # built in a later stage

    timeline = _timeline(decisions, comments, stmt_of)
    answer = _short_answer(decisions, question)
    analysis = Analysis(
        id=analysis_id or f"{re.sub(r'[^a-z0-9]+', '-', repo.lower()).strip('-')}-{uuid.uuid4().hex[:6]}",
        repo=repo, question=question, range_label=range_label, summary=summary, short_answer=answer,
        based_on=_based_on(decisions, comments, stmt_of), decisions=decisions, timeline=timeline,
        confidence=overall_confidence([d.confidence for d in decisions]), comments=norm.comments,
        statements=statements, left_out=left_out, people=people,
        stats={
            "model": getattr(llm, "model", "scripted-test-model"),
            "mode": getattr(llm, "mode", "test"),
            "live_calls": getattr(llm, "live_calls", 0),
            "cache_hits": getattr(llm, "cache_hits", 0),
            "windows_total": windows_total,
            "windows_sent_to_model": windows_sent,
            "verifier": {**verifier.counts(), "dropped_details": verifier.dropped[:25]},
            "stance_trace": trace,
        },
    )
    summary.done = True
    if progress:
        progress(summary)
    return analysis


# -------------------------------------------------------------------------------------------
def _build_decision(n: int, group: list[Approach], comments: dict[str, Comment], stmt_of: dict[str, Statement], llm,
                    verifier: Verifier) -> Optional[Decision]:
    def info(sid: str) -> tuple[str, str]:
        c = comments[stmt_of[sid].comment_id]
        return c.person_id, c.date

    stances = [s for a in group for s in a.stances]
    proposers = sorted((info(a.proposer_sid)[1], a.proposer_sid) for a in group)
    proposer_sid = proposers[0][1]
    proposer_id = info(proposer_sid)[0]
    status = resolve_status(stances, proposer_id)

    core: list[str] = []
    for a in group:
        for sid in a.statement_ids:
            if sid not in core:
                core.append(sid)
    for s in stances:
        if s.stance in ("oppose", "close_accept", "close_reject", "defer") and s.statement_id not in core:
            core.append(s.statement_id)
    core.sort(key=lambda sid: (info(sid)[1], sid))
    label_source = max(group, key=lambda a: len(a.statement_ids))
    title = label_source.label[:1].upper() + label_source.label[1:]

    candidates = pick_reason_statements([stmt_of[sid] for sid in core])
    reason = _reason(title, candidates, llm, verifier)
    everyone = {info(s.statement_id)[0] for s in stances} | {info(sid)[0] for sid in core}
    return Decision(id=f"tmp{n}", title=title, status=status, proposer_id=proposer_id, reason=reason, statement_ids=core,
                    grouped_count=len(core), later_changes=[], confidence=decision_confidence(len(core), len(everyone)))


def _reason(title: str, candidates: list[Statement], llm, verifier: Verifier) -> Claim:
    quotes = [c.quote for c in candidates]
    try:
        reply = llm.call("reason", prompts.P5_SYSTEM, prompts.p5_user(title, quotes), prompts.P5_SCHEMA,
                         payload={"label": title, "statements": quotes})
        idxs = verifier.valid_indexes(reply.get("statements", []), len(candidates))
        text = re.sub(r"\s+", " ", reply.get("reason", "")).strip()
        cited = [candidates[i - 1] for i in idxs]
        if text and cited and verifier.reason(text, [c.quote for c in cited]):
            verifier.ok()
            return Claim(_sentence(text), [c.id for c in cited])
        verifier.drop("reason_not_grounded", f"{text[:80]!r}")
    except LLMError as exc:
        if exc.fatal:
            raise
        verifier.drop("llm_error", str(exc)[:120])
    first = candidates[0]
    return Claim(_sentence(fallback_reason(first.quote)), [first.id])


def _short_answer(decisions: list[Decision], question: str = "") -> list[Claim]:
    """Template sentences built from verified reasons. Decisions closest to the question come first."""
    wanted = tokens(question)

    def rank(d: Decision) -> tuple:
        relevance = len(wanted & tokens(d.title + " " + d.reason.text)) if wanted else 0
        return (-relevance, STATUS_ORDER[d.status], -len(d.statement_ids))

    out: list[Claim] = []
    for d in sorted(decisions, key=rank):
        if len(out) == 3:
            break
        if d.status == "accepted":
            text = f"The team decided to go with \"{d.title}\". {d.reason.text}"
        elif d.status == "rejected":
            text = f"The team decided against \"{d.title}\". {d.reason.text}"
        elif d.status == "deferred":
            text = f"\"{d.title}\" was postponed. {d.reason.text}"
        else:
            continue
        out.append(Claim(text, list(d.reason.statement_ids)))
    return out


def _thread_label(thread: str) -> tuple[str, int]:
    kind, _, num = thread.partition(":")
    return kind, int(num) if num.isdigit() else 0


def _based_on(decisions: list[Decision], comments: dict[str, Comment], stmt_of: dict[str, Statement]) -> str:
    per_thread: Counter = Counter()
    seen: set[tuple[str, str]] = set()
    for d in decisions:
        for sid in d.statement_ids:
            c = comments[stmt_of[sid].comment_id]
            if c.thread.startswith(("pr:", "issue:")) and (c.thread, c.id) not in seen:
                seen.add((c.thread, c.id))
                per_thread[c.thread] += 1
    if not per_thread:
        return "No decisions were found in these discussions."
    parts = []
    for thread, count in per_thread.most_common(2):
        kind, num = _thread_label(thread)
        noun = "pull request" if kind == "pr" else "issue"
        parts.append((count, noun, num))
    first = f"{parts[0][0]} comments in {parts[0][1]} #{parts[0][2]}"
    if len(parts) == 1:
        return f"Based on {first}."
    return f"Based on {first} and {parts[1][0]} comments in #{parts[1][2]}."


def _timeline(decisions: list[Decision], comments: dict[str, Comment], stmt_of: dict[str, Statement]) -> list[TimelineEntry]:
    per_pr: dict[int, list[tuple[Decision, list[str]]]] = defaultdict(list)
    for d in decisions:
        by_pr: dict[int, list[str]] = defaultdict(list)
        for sid in d.statement_ids:
            c = comments[stmt_of[sid].comment_id]
            kind, num = _thread_label(c.thread)
            if kind == "pr":
                by_pr[num].append(sid)
        for num, sids in by_pr.items():
            per_pr[num].append((d, sids))
    entries: list[TimelineEntry] = []
    for num, items in per_pr.items():
        d, sids = max(items, key=lambda item: len(item[1]))
        date = min(comments[stmt_of[s].comment_id].date for s in sids)
        in_pr = [s for s in d.reason.statement_ids if s in sids]
        claim = Claim(d.reason.text, in_pr) if in_pr else Claim(_sentence(f"{d.title}"), [sids[0]])
        entries.append(TimelineEntry(date=date, pr_number=num, text=claim))
    entries.sort(key=lambda e: (e.date, e.pr_number))
    return entries
