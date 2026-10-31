"""Check that the backend field names match the frontend's TypeScript types."""
from __future__ import annotations

import dataclasses
import re
from pathlib import Path

from . import models

CHECKED = ["Person", "Comment", "Statement", "LeftOut", "Claim", "LaterChange", "Decision", "TimelineEntry", "ImportStep",
           "ImportSummary", "Analysis", "EvalResult"]


def ts_fields(source: str, name: str) -> set[str] | None:
    """Top-level field names of `interface Name {...}` or `type Name = {...}`."""
    m = re.search(rf"(?:interface\s+{name}\s*|type\s+{name}\s*=\s*)\{{", source)
    if not m:
        return None
    depth, i = 1, m.end()
    start = i
    while i < len(source) and depth:
        depth += {"{": 1, "}": -1}.get(source[i], 0)
        i += 1
    body = source[start : i - 1]
    fields: set[str] = set()
    depth = 0
    for line in re.split(r"[;\n]", body):
        line = line.strip()
        if depth == 0:
            m2 = re.match(r"([A-Za-z_]\w*)\??\s*:", line)
            if m2:
                fields.add(m2.group(1))
        depth += line.count("{") - line.count("}")
    return fields


def check(types_ts: Path) -> list[str]:
    source = types_ts.read_text(encoding="utf-8")
    problems: list[str] = []
    for name in CHECKED:
        cls = getattr(models, name)
        ours = {f.name for f in dataclasses.fields(cls)}
        theirs = ts_fields(source, name)
        if theirs is None:
            problems.append(f"{name}: not found in {types_ts.name}")
            continue
        missing = theirs - ours
        if missing:
            problems.append(f"{name}: the frontend expects {sorted(missing)} but the backend does not send them")
    return problems
