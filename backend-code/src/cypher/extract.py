"""Find ideas (approaches) and how people stand on them. Gemma gives small answers; Python verifies them."""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Callable, Optional

from . import prompts
from .llm import LLMError
from .models import Comment, Statement
from .status import DECISIVE, Stance
from .textutil import shorten_words, tokens
from .verify import Verifier

WINDOW = 10
OVERLAP = 2

# Cue phrases: only windows that contain at least one are sent to Gemma (keeps a small model fast and focused).
CUE_PHRASES = [
    "instead", "alternative", "rather", "let's", "let us", "we should", "should we", "i propose", "how about",
    "maybe use", "won't work", "because", "not worth", "out of scope", "later", "for now", "postpone", "defer",
    "decided", "agreed", "agree", "reject", "lgtm", "merging", "approved", "dropping", "wait until", "fail fast",
    "we need", "should be able", "caps", "adds", "overhead", "dependency", "unnecessary", "+1", "-1",
]
_CUE = re.compile("|".join(re.escape(p) for p in CUE_PHRASES), re.I)


def has_cue(quotes: list[str]) -> bool:
    return any(_CUE.search(q) for q in quotes)


@dataclass
class Approach:
    label: str
    proposer_sid: str
    statement_ids: list[str]
    thread: str
    stances: list[Stance] = field(default_factory=list)


def windows(items: list, size: int = WINDOW, overlap: int = OVERLAP):
    step = max(1, size - overlap)
    start = 0
    while start < len(items):
        yield items[start : start + size]
        if start + size >= len(items):
            break
        start += step


NOT_AN_IDEA = re.compile(r"\b(lgtm|merge|merging|merged|agree|agreed|approve|approved|thanks|thank)\b", re.I)


def clean_label(label: str) -> str:
    words = re.sub(r"\s+", " ", (label or "").strip().strip('."\'')).split()
    return " ".join(words[:8])


def mine_thread(llm, thread_statements: list[Statement], comments: dict[str, Comment], verifier: Verifier,
                tick: Optional[Callable[[int, int], None]] = None) -> tuple[list[Approach], int, int]:
    """Return (approaches, windows_total, windows_sent)."""
    approaches: list[Approach] = []
    total = sent = 0

    def meta(sid_to_stmt: dict[str, Statement], sid: str) -> tuple[str, str]:
        c = comments[sid_to_stmt[sid].comment_id]
        return c.person_id, c.date

    for window in windows(thread_statements):
        total += 1
        quotes = [s.quote for s in window]
        by_id = {s.id: s for s in window}
        if not has_cue(quotes):
            if tick:
                tick(total, sent)
            continue
        sent += 1
        try:
            found = llm.call("find_proposals", prompts.P1_SYSTEM, prompts.p1_user(quotes), prompts.P1_SCHEMA,
                             payload={"statements": quotes, "comments": [s.comment_id for s in window]})
        except LLMError as exc:
            if exc.fatal:
                raise
            verifier.drop("llm_error", str(exc)[:120])
            continue
        for item in found.get("approaches", []):
            label = clean_label(item.get("label", ""))
            idxs = verifier.valid_indexes(item.get("statements", []), len(window))
            proposer_idx = item.get("proposer")
            if not label or not isinstance(proposer_idx, int) or not (1 <= proposer_idx <= len(window)):
                verifier.drop("proposal_shape", f"label={label!r} proposer={proposer_idx!r} statements={item.get('statements')!r}")
                continue
            if NOT_AN_IDEA.search(label) or len(tokens(window[proposer_idx - 1].quote)) < 3:
                verifier.drop("not_an_idea", f"label={label!r} proposer statement={window[proposer_idx - 1].quote[:60]!r}")
                continue
            if proposer_idx not in idxs:  # the proposer's own statement is always part of the idea
                idxs.insert(0, proposer_idx)
            verifier.ok()
            approach = Approach(label, window[proposer_idx - 1].id, [window[i - 1].id for i in idxs], window[0].comment_id and comments[window[0].comment_id].thread)
            try:
                reply = llm.call("stance", prompts.P2_SYSTEM, prompts.p2_user(label, quotes), prompts.P2_SCHEMA,
                                 payload={"label": label, "statements": quotes, "comments": [s.comment_id for s in window]})
            except LLMError as exc:
                if exc.fatal:
                    raise
                verifier.drop("llm_error", str(exc)[:120])
                reply = {"stances": []}
            seen: set[int] = set()
            about_this_idea = {window[i - 1].id for i in idxs}
            for entry in reply.get("stances", []):
                i = entry.get("statement")
                if not isinstance(i, int) or not (1 <= i <= len(window)):
                    verifier.drop("stance_index", f"statement={i!r}")
                    continue
                if i in seen:
                    continue
                seen.add(i)
                sid = window[i - 1].id
                if entry["stance"] in DECISIVE and sid not in about_this_idea:
                    # a closing signal (approve, reject, postpone) only counts if the model also listed that
                    # statement as part of this same idea; a general "LGTM" must not close a different idea
                    verifier.drop("closing_signal_not_about_this_idea", f"{entry['stance']} on {window[i - 1].quote[:50]!r}")
                    continue
                person, date = meta(by_id, sid)
                approach.stances.append(Stance(sid, person, date, entry["stance"]))
                verifier.ok()
            if approach.proposer_sid not in {s.statement_id for s in approach.stances}:
                person, date = meta(by_id, approach.proposer_sid)
                approach.stances.append(Stance(approach.proposer_sid, person, date, "support"))
            approaches.append(approach)
        if tick:
            tick(total, sent)
    return approaches, total, sent


REASON_WORDS = re.compile(
    r"\b(because|so that|so|adds?|spreads?|overhead|dependency|since|otherwise|avoid|prevent|instead of|rather than|"
    r"too much|unnecessary|only about|overwhelmed|fail fast|breathing room|hang)\b", re.I)


def pick_reason_statements(statements: list[Statement]) -> list[Statement]:
    with_reason = [s for s in statements if REASON_WORDS.search(s.quote)]
    chosen = with_reason or statements
    return chosen[:4]


def short_quote(statement: Statement) -> str:
    return shorten_words(statement.quote, 25)
