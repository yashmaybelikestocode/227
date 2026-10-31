"""Verifier gates. Anything Gemma returns that fails a gate is dropped and counted."""
from __future__ import annotations

from collections import Counter
from dataclasses import dataclass, field

from .models import Comment, Statement
from .textutil import overlap_share, shorten_words

REASON_MIN_OVERLAP = 0.4


@dataclass
class Verifier:
    produced: int = 0
    verified: int = 0
    dropped: list[dict] = field(default_factory=list)

    def ok(self) -> None:
        self.produced += 1
        self.verified += 1

    def drop(self, gate: str, detail: str) -> None:
        self.produced += 1
        self.dropped.append({"gate": gate, "detail": detail})

    def counts(self) -> dict:
        by_gate = Counter(item["gate"] for item in self.dropped)
        return {"produced": self.produced, "verified": self.verified, "dropped": len(self.dropped), "dropped_by_gate": dict(by_gate)}

    # -- gates ------------------------------------------------------------------------------
    def valid_indexes(self, indexes: list[int], size: int) -> list[int]:
        """Keep only indexes 1..size (each once). Invented indexes are dropped."""
        seen: list[int] = []
        for i in indexes:
            if isinstance(i, int) and 1 <= i <= size and i not in seen:
                seen.append(i)
        return seen

    def quote_matches(self, statement: Statement, comment: Comment) -> bool:
        return comment.text[statement.start : statement.end] == statement.quote

    def reason(self, text: str, cited_quotes: list[str]) -> bool:
        words = len(text.split())
        return 0 < words <= 40 and overlap_share(text, cited_quotes) >= REASON_MIN_OVERLAP


def fallback_reason(quote: str) -> str:
    """When Gemma's wording is not grounded in the cited statements, show the quote itself (shortened)."""
    return shorten_words(quote, 25)
