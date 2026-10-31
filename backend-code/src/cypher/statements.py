"""Split comments into statements with exact character offsets.

Invariant (checked in tests): statement.quote == comment.text[start:end].
"""
from __future__ import annotations

import re
from typing import Optional

from .models import Comment, Statement

ABBREV = {"e.g", "i.e", "vs", "etc", "mr", "mrs", "dr", "approx", "cf", "fig", "no", "inc", "eg", "ie"}
_BOUNDARY = re.compile(r"([.!?]+[\"')\]]*)(\s+)")
_FENCE = re.compile(r"```.*?```", re.S)
_QUOTE_TAG = re.compile(r"\[quote[^\]]*\].*?\[/quote\]", re.S | re.I)
_QUOTE_LINE = re.compile(r"^[ \t]*>.*$", re.M)
_BULLET = re.compile(r"^\s*(?:[-*+]|\d+[.)])\s+")

REASON_TEXT = {
    "no_quote": "No exact quote could be found",
    "reaction_only": "The comment was only a reaction",
    "edited": "The text was edited after it was fetched",
    "bot": "The comment was written by a bot",
}
REACTIONS = {"+1", "-1", "thanks", "thank you", "thx", "ty", "ok", "okay", "nice", "great", "good", "cool"}
BOT_NAMES = {"github-actions", "codecov", "dependabot", "renovate", "stale", "coveralls"}


def is_bot(login: Optional[str]) -> bool:
    if not login:
        return False
    low = login.lower()
    return low.endswith("[bot]") or low in BOT_NAMES


def masked_spans(text: str) -> list[tuple[int, int]]:
    """Parts of a comment that must never become statements (code, quoted replies)."""
    spans: list[tuple[int, int]] = []
    for rx in (_FENCE, _QUOTE_TAG, _QUOTE_LINE):
        spans.extend((m.start(), m.end()) for m in rx.finditer(text))
    spans.sort()
    merged: list[tuple[int, int]] = []
    for start, end in spans:
        if merged and start <= merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], end))
        else:
            merged.append((start, end))
    return merged


def _unmasked(text: str) -> list[tuple[int, int]]:
    out: list[tuple[int, int]] = []
    pos = 0
    for start, end in masked_spans(text):
        if start > pos:
            out.append((pos, start))
        pos = max(pos, end)
    if pos < len(text):
        out.append((pos, len(text)))
    return out


def _sentence_ranges(text: str, start: int, end: int) -> list[tuple[int, int]]:
    ranges: list[tuple[int, int]] = []
    pos = start
    for m in _BOUNDARY.finditer(text, start, end):
        before = text[max(start, m.start(1) - 14) : m.start(1)]
        found = re.findall(r"[A-Za-z.]+$", before)
        word = found[0].lower().strip(".") if found else ""
        is_initial = len(word) == 1 and word.isalpha() and m.group(1).startswith(".")
        nxt = text[m.end(2)] if m.end(2) < end else ""
        if word in ABBREV or is_initial or (nxt and nxt.islower()):
            continue
        ranges.append((pos, m.end(1)))
        pos = m.end(2)
    ranges.append((pos, end))
    return ranges


def split_text(text: str) -> list[tuple[int, int]]:
    """Return (start, end) offsets of statements in the original text."""
    result: list[tuple[int, int]] = []
    for seg_start, seg_end in _unmasked(text):
        for line in re.finditer(r"[^\n]+", text[seg_start:seg_end]):
            line_start = seg_start + line.start()
            line_end = seg_start + line.end()
            bullet = _BULLET.match(text[line_start:line_end])
            if bullet:
                line_start += bullet.end()
            for s, e in _sentence_ranges(text, line_start, line_end):
                while s < e and text[s].isspace():
                    s += 1
                while e > s and text[e - 1].isspace():
                    e -= 1
                if e - s >= 3 and re.search(r"[^\W_]", text[s:e]):
                    result.append((s, e))
    return result


def is_reaction_only(text: str) -> bool:
    cleaned = re.sub(r"[\s!.,]+$", "", text.strip().lower())
    if cleaned in REACTIONS:
        return True
    without_votes = re.sub(r"[+-]1", "", text)
    return text.strip() != "" and not re.search(r"[^\W_]", without_votes)


def split_comment(comment: Comment, bot: bool = False) -> tuple[list[Statement], Optional[str]]:
    """Return (statements, left_out_reason). A reason is returned only if there are no statements."""
    if bot:
        return [], "bot"
    if is_reaction_only(comment.text):
        return [], "reaction_only"
    statements = []
    for n, (start, end) in enumerate(split_text(comment.text), start=1):
        quote = comment.text[start:end]
        assert quote == comment.text[start:end]
        statements.append(Statement(id=f"{comment.id}.s{n}", comment_id=comment.id, start=start, end=end, quote=quote))
    if not statements:
        return [], "no_quote"
    return statements, None
