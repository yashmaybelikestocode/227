"""Blind test. What is sealed is CYPHER'S FINDINGS. The maintainers' list is opened only after sealing.

- seal(): writes the predicted rejected ideas with a UTC timestamp and a SHA-256 fingerprint.
- score(): re-checks the fingerprint, then (and only then) reads the maintainers' list and compares.
"""
from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from . import config, prompts
from .llm import LLMError
from .models import Analysis, EvalPair, EvalResult
from .textutil import jaccard, tokens

MATCH_THRESHOLD = 0.35


def _now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _canonical(payload: dict) -> str:
    return json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def sealed_dir() -> Path:
    path = config.data_dir() / "sealed"
    path.mkdir(parents=True, exist_ok=True)
    return path


def predictions_from(analysis: Analysis) -> list[dict]:
    return [
        {"idea": d.title, "reason": d.reason.text, "statement_ids": list(d.statement_ids)}
        for d in analysis.decisions if d.status == "rejected"
    ]


def seal(name: str, predictions: list[dict]) -> dict:
    """Write the findings and their fingerprint. Does not accept or look at any maintainers' list."""
    payload = {"name": name, "saved_at": _now(), "predictions": predictions}
    record = {**payload, "fingerprint": "sha256:" + hashlib.sha256(_canonical(payload).encode("utf-8")).hexdigest()}
    path = sealed_dir() / f"{name}.json"
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))  # a sealed result is never overwritten
    path.write_text(json.dumps(record, indent=2, ensure_ascii=False), encoding="utf-8")
    return record


def load_sealed(name: str) -> dict:
    path = sealed_dir() / f"{name}.json"
    if not path.exists():
        raise FileNotFoundError("Cypher's findings have not been sealed yet. Seal them before opening the maintainers' list.")
    record = json.loads(path.read_text(encoding="utf-8"))
    payload = {"name": record["name"], "saved_at": record["saved_at"], "predictions": record["predictions"]}
    expected = "sha256:" + hashlib.sha256(_canonical(payload).encode("utf-8")).hexdigest()
    if record.get("fingerprint") != expected:
        raise ValueError("The sealed findings were changed after sealing. This is not a valid blind test.")
    return record


def _llm_match(llm, predicted: str, official: str) -> bool:
    if llm is None:
        return False
    try:
        reply = llm.call("judge_match", prompts.P6_SYSTEM, prompts.p6_user(predicted, official), prompts.P6_SCHEMA,
                         payload={"predicted": predicted, "official": official})
        return reply.get("match") is True
    except LLMError as exc:
        if exc.fatal:
            raise
        return False


def score(name: str, gold: list[dict], llm=None, gold_bytes: Optional[bytes] = None, overrides: Optional[dict] = None) -> EvalResult:
    record = load_sealed(name)  # fingerprint is verified here, BEFORE the gold list is used
    gold_read_at = _now()
    predictions = record["predictions"]
    overrides = overrides or {}
    used: set[int] = set()
    pairs: list[EvalPair] = []
    agree = 0
    for item in gold:
        idea = item["idea"]
        best_i, best = -1, 0.0
        forced = overrides.get(idea)
        for i, pred in enumerate(predictions):
            if i in used:
                continue
            if forced and pred["idea"] == forced:
                best_i, best = i, 1.0
                break
            s = jaccard(tokens(pred["idea"]), tokens(idea))
            if s > best:
                best_i, best = i, s
        matched = best_i >= 0 and best >= MATCH_THRESHOLD
        if not matched and best_i >= 0:
            matched = _llm_match(llm, predictions[best_i]["idea"], idea)
        if matched:
            used.add(best_i)
            pred = predictions[best_i]
            if item.get("reason") and jaccard(tokens(pred["reason"]), tokens(item["reason"])) >= 0.2:
                agree += 1
            pairs.append(EvalPair(idea, pred["idea"], pred["statement_ids"], "found"))
        else:
            pairs.append(EvalPair(idea, None, [], "missed"))
    found = sum(1 for p in pairs if p.kind == "found")
    official = len(gold)
    precision = round(100 * len(used) / len(predictions)) if predictions else 0
    return EvalResult(
        saved_at=record["saved_at"], fingerprint=record["fingerprint"], official=official, found=found,
        accuracy_percent=round(100 * found / official) if official else 0, precision_percent=precision, pairs=pairs,
        extras=[p["idea"] for i, p in enumerate(predictions) if i not in used], reason_agreement=agree,
        gold_sha256="sha256:" + hashlib.sha256(gold_bytes).hexdigest() if gold_bytes else "", gold_read_at=gold_read_at,
    )


def load_gold(path: Path) -> tuple[list[dict], bytes]:
    raw = Path(path).read_bytes()
    return json.loads(raw.decode("utf-8")), raw
