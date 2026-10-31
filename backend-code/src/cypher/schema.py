"""Tiny JSON-schema checker (type, properties, required, items, enum, minItems, maxItems)."""
from __future__ import annotations

from typing import Any

_TYPES = {
    "object": dict,
    "array": list,
    "string": str,
    "integer": int,
    "number": (int, float),
    "boolean": bool,
}


def errors(value: Any, schema: dict, path: str = "$") -> list[str]:
    out: list[str] = []
    expected = schema.get("type")
    if expected:
        py = _TYPES[expected]
        ok = isinstance(value, py)
        if expected in ("integer", "number") and isinstance(value, bool):
            ok = False
        if not ok:
            return [f"{path}: expected {expected}"]
    if "enum" in schema and value not in schema["enum"]:
        out.append(f"{path}: {value!r} not in {schema['enum']}")
    if isinstance(value, dict):
        for key in schema.get("required", []):
            if key not in value:
                out.append(f"{path}.{key}: missing")
        for key, sub in schema.get("properties", {}).items():
            if key in value:
                out.extend(errors(value[key], sub, f"{path}.{key}"))
    if isinstance(value, list):
        if "minItems" in schema and len(value) < schema["minItems"]:
            out.append(f"{path}: too few items")
        if "maxItems" in schema and len(value) > schema["maxItems"]:
            out.append(f"{path}: too many items")
        if "items" in schema:
            for i, item in enumerate(value):
                out.extend(errors(item, schema["items"], f"{path}[{i}]"))
    return out


def is_valid(value: Any, schema: dict) -> bool:
    return not errors(value, schema)
