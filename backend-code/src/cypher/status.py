"""Status and confidence rules. Plain Python; when in doubt the answer is 'unresolved'."""
from __future__ import annotations

from dataclasses import dataclass

DECISIVE = {"close_accept", "close_reject", "defer"}


@dataclass
class Stance:
    statement_id: str
    person_id: str
    date: str
    stance: str  # support | oppose | neutral | withdraw | close_accept | close_reject | defer


def _ordered(stances: list[Stance]) -> list[Stance]:
    return sorted(stances, key=lambda s: (s.date, s.statement_id))


def resolve_status(stances: list[Stance], proposer_id: str) -> str:
    """Return accepted | rejected | deferred | unresolved.

    1. The last decisive signal (close_accept, close_reject, defer) wins.
    2. Without one: two or more supporters and no objection means accepted.
    3. The proposer dropping their own idea after someone else objected means rejected.
    4. Anything else is unresolved."""
    items = _ordered(stances)
    decisive = [s for s in items if s.stance in DECISIVE]
    if decisive:
        last = decisive[-1].stance
        return {"close_accept": "accepted", "close_reject": "rejected", "defer": "deferred"}[last]
    supporters = {s.person_id for s in items if s.stance == "support"}
    opposers = {s.person_id for s in items if s.stance == "oppose"}
    last_support = max((s.date for s in items if s.stance == "support"), default="")
    opposed_after = any(s.stance == "oppose" and s.date > last_support for s in items)
    if len(supporters) >= 2 and not opposed_after and not opposers:
        return "accepted"
    first_oppose = min((s.date for s in items if s.stance == "oppose" and s.person_id != proposer_id), default="")
    withdrew_after_objection = bool(first_oppose) and any(
        s.stance == "withdraw" and s.person_id == proposer_id and s.date >= first_oppose for s in items)
    if withdrew_after_objection:
        return "rejected"
    return "unresolved"


def decision_confidence(statement_count: int, author_count: int) -> str:
    if statement_count >= 3 and author_count >= 2:
        return "high"
    if statement_count >= 2:
        return "medium"
    return "low"


def overall_confidence(levels: list[str]) -> str:
    if not levels:
        return "low"
    if levels.count("high") >= 2:
        return "high"
    if "high" in levels or "medium" in levels:
        return "medium"
    return "low"
