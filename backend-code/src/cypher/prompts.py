"""Prompts and JSON schemas for Gemma. Gemma only returns numbers (statement indexes), labels and enums.
It never writes quotes, names, dates or links: Python fills those in from stored data."""
from __future__ import annotations

STANCES = ["support", "oppose", "neutral", "withdraw", "close_accept", "close_reject", "defer"]

_SHARED = (
    "You help maintainers understand a software discussion. Statements are numbered like [s3]. "
    "Use ONLY the statements you are given. Never invent statements, people, dates or quotes. "
    "Answer with JSON only."
)

P1_SYSTEM = (
    _SHARED
    + " Task: find the ideas (approaches) that someone proposes or argues for or against, such as a design choice or a "
    "library to use. Give each a short label of at most 8 words in plain English, the number of the statement where it "
    "is first proposed, and the numbers of all statements that propose, support, question or argue against it. "
    "ALWAYS include the proposer's number in the list of statements. An idea is a concrete design choice, library or action; "
    "a reaction such as LGTM, agreed, thanks or merge is never an idea. "
    "If there is no real idea, return an empty list."
)
P1_SCHEMA = {
    "type": "object",
    "required": ["approaches"],
    "properties": {
        "approaches": {
            "type": "array",
            "maxItems": 4,
            "items": {
                "type": "object",
                "required": ["label", "proposer", "statements"],
                "properties": {
                    "label": {"type": "string"},
                    "proposer": {"type": "integer"},
                    "statements": {"type": "array", "items": {"type": "integer"}},
                },
            },
        }
    },
}

P2_SYSTEM = (
    _SHARED
    + " Task: for the approach given, say how each relevant statement stands towards it. Allowed values: "
    "support, oppose, neutral, withdraw (the speaker drops their own idea), close_accept (someone approves, merges "
    "or finally agrees), close_reject (someone clearly rejects it), defer (postpone it to later). "
    "Skip statements that are not about this approach. Use close_accept, close_reject or defer ONLY when the statement "
    "itself is about THIS approach; a general LGTM that follows a different idea does not count for this one. "
    "oppose means the speaker argues against it (for example says it is unnecessary or adds a dependency)."
)
P2_SCHEMA = {
    "type": "object",
    "required": ["stances"],
    "properties": {
        "stances": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["statement", "stance"],
                "properties": {"statement": {"type": "integer"}, "stance": {"type": "string", "enum": STANCES}},
            },
        }
    },
}

P3_SYSTEM = _SHARED + " Task: decide whether two ideas are the same idea. Answer {\"same\": true} or {\"same\": false}."
P3_SCHEMA = {"type": "object", "required": ["same"], "properties": {"same": {"type": "boolean"}}}

P5_SYSTEM = (
    _SHARED
    + " Task: in at most 25 words of plain English, say WHY the team decided what they did about this approach, using "
    "only the statements given. Also list the numbers of the statements you used."
)
P5_SCHEMA = {
    "type": "object",
    "required": ["reason", "statements"],
    "properties": {"reason": {"type": "string"}, "statements": {"type": "array", "items": {"type": "integer"}}},
}

P6_SYSTEM = _SHARED + " Task: decide whether two short descriptions mean the same idea. Answer {\"match\": true} or {\"match\": false}."
P6_SCHEMA = {"type": "object", "required": ["match"], "properties": {"match": {"type": "boolean"}}}


def numbered(quotes: list[str]) -> str:
    return "\n".join(f"[s{i}] {q}" for i, q in enumerate(quotes, start=1))


def p1_user(quotes: list[str]) -> str:
    return "Statements:\n" + numbered(quotes)


def p2_user(label: str, quotes: list[str]) -> str:
    return f"Approach: {label}\n\nStatements:\n" + numbered(quotes)


def p3_user(a: str, b: str) -> str:
    return f"Idea A: {a}\nIdea B: {b}"


def p5_user(label: str, quotes: list[str]) -> str:
    return f"Approach: {label}\n\nStatements:\n" + numbered(quotes)


def p6_user(predicted: str, official: str) -> str:
    return f"Description 1: {predicted}\nDescription 2: {official}"
