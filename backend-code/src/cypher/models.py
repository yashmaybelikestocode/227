"""Data shapes. Field names match the frontend (frontend-final/src/types.ts)."""
from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any, Optional


def to_dict(obj: Any) -> Any:
    return asdict(obj)


@dataclass
class Identity:
    kind: str  # commit_email | github_login | other_handle
    value: str
    merged_because: str
    label: Optional[str] = None


@dataclass
class Person:
    id: str
    display_name: str
    identities: list[Identity]
    commits: int
    comments: int
    first_at: str
    last_at: str


@dataclass
class Comment:
    id: str
    github_id: str
    person_id: str
    date: str
    where: str
    kind: str  # pr_comment | issue_comment | review_comment | commit_message
    ref_number: Optional[int]
    url: str
    text: str
    thread: str = ""


@dataclass
class Statement:
    id: str
    comment_id: str
    start: int
    end: int
    quote: str
    decision_id: Optional[str] = None


@dataclass
class LeftOut:
    comment_id: str
    reason: str


@dataclass
class Claim:
    text: str
    statement_ids: list[str]


@dataclass
class LaterChange:
    effect: str  # modified | reversed
    pr_number: int
    date: str
    note: Claim


@dataclass
class Decision:
    id: str
    title: str
    status: str  # accepted | rejected | deferred | unresolved
    proposer_id: str
    reason: Claim
    statement_ids: list[str]
    grouped_count: int
    later_changes: list[LaterChange] = field(default_factory=list)
    confidence: str = "low"


@dataclass
class TimelineEntry:
    date: str
    pr_number: int
    text: Claim
    effect: Optional[str] = None


@dataclass
class ImportStep:
    key: str
    label: str
    count: Optional[int] = None
    state: str = "waiting"  # waiting | working | done | skipped


@dataclass
class ImportSummary:
    steps: list[ImportStep]
    prs: int = 0
    issues: int = 0
    comments: int = 0
    commits: int = 0
    statements_used: int = 0
    statements_left_out: int = 0
    done: bool = False
    error: Optional[str] = None


@dataclass
class Analysis:
    id: str
    repo: str
    question: str
    range_label: str
    summary: ImportSummary
    short_answer: list[Claim]
    based_on: str
    decisions: list[Decision]
    timeline: list[TimelineEntry]
    confidence: str
    comments: list[Comment]
    statements: list[Statement]
    left_out: list[LeftOut]
    people: list[Person]
    stats: dict = field(default_factory=dict)  # model calls, dropped counts (honest accounting)


@dataclass
class EvalPair:
    official_idea: str
    found_idea: Optional[str]
    statement_ids: list[str]
    kind: str  # found | missed


@dataclass
class EvalResult:
    saved_at: str
    fingerprint: str
    official: int
    found: int
    accuracy_percent: int
    precision_percent: int
    pairs: list[EvalPair]
    extras: list[str]
    reason_agreement: int = 0
    gold_sha256: str = ""
    gold_read_at: str = ""
