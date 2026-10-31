"""Small text helpers: tokens, stemming, overlap. Plain algorithms only (no AI models)."""
from __future__ import annotations

import re

STOP = set(
    """a an the and or but if then so of to in on at for from with by as is are was were be been being it its this that
    these those we you i they he she our your their my me us do does did done not no yes can could should would will
    just also very more most than too up out about into over under again further once here there when where why how
    all any both each few other some such only own same s t don""".split()
)


def stem(word: str) -> str:
    for suffix in ("ing", "ed", "es", "s", "ly"):
        if len(word) > len(suffix) + 3 and word.endswith(suffix):
            return word[: -len(suffix)]
    return word


def tokens(text: str) -> set[str]:
    words = re.findall(r"[a-z0-9]+", text.lower())
    return {stem(w) for w in words if w not in STOP and len(w) > 1}


def jaccard(a: set[str], b: set[str]) -> float:
    if not a or not b:
        return 0.0
    return len(a & b) / len(a | b)


def overlap_share(claim: str, evidence: list[str]) -> float:
    """Share of the claim's content words that also appear in the evidence."""
    claim_tokens = tokens(claim)
    if not claim_tokens:
        return 0.0
    evidence_tokens: set[str] = set()
    for item in evidence:
        evidence_tokens |= tokens(item)
    return len(claim_tokens & evidence_tokens) / len(claim_tokens)


def shorten_words(text: str, limit: int) -> str:
    words = text.split()
    if len(words) <= limit:
        return " ".join(words)
    return " ".join(words[:limit]).rstrip(",;:") + "..."
