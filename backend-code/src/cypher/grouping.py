"""Group duplicate approaches (the same idea said in different places) with plain text overlap.
Only borderline pairs are sent to Gemma (P3)."""
from __future__ import annotations

from typing import Callable

from . import prompts
from .extract import Approach
from .llm import LLMError
from .textutil import jaccard, tokens
from .verify import Verifier

SAME = 0.6
BORDERLINE = 0.3


def _text_tokens(a: Approach, quote_of: Callable[[str], str]) -> set[str]:
    return tokens(" ".join(quote_of(sid) for sid in a.statement_ids))


def similarity(a: Approach, b: Approach, quote_of: Callable[[str], str]) -> float:
    label = jaccard(tokens(a.label), tokens(b.label))
    text = jaccard(_text_tokens(a, quote_of), _text_tokens(b, quote_of))
    return max(label, 0.9 * text)


def group_approaches(approaches: list[Approach], llm, verifier: Verifier, quote_of: Callable[[str], str]) -> list[list[Approach]]:
    groups: list[list[Approach]] = []
    for approach in approaches:
        placed = False
        best, best_score = None, 0.0
        for group in groups:
            score = max(similarity(approach, member, quote_of) for member in group)
            if score > best_score:
                best, best_score = group, score
        if best is not None:
            if best_score >= SAME:
                best.append(approach)
                placed = True
            elif best_score >= BORDERLINE and llm is not None:
                head = best[0]
                try:
                    reply = llm.call("same_idea", prompts.P3_SYSTEM,
                                     prompts.p3_user(f"{head.label} ({quote_of(head.proposer_sid)})",
                                                     f"{approach.label} ({quote_of(approach.proposer_sid)})"),
                                     prompts.P3_SCHEMA, payload={"a": head.label, "b": approach.label})
                    if reply.get("same") is True:
                        best.append(approach)
                        placed = True
                    verifier.ok()
                except LLMError as exc:
                    if exc.fatal:
                        raise
                    verifier.drop("llm_error", str(exc)[:120])
        if not placed:
            groups.append([approach])
    return groups
