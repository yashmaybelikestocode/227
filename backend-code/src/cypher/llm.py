"""Local Gemma 4 through Ollama. This is the ONLY model the product may use.

Rules enforced in code:
- the model name must start with "gemma4" (anything else is refused);
- only the local Ollama server is called (no cloud API, no fallback model);
- every answer is validated against a JSON schema and cached on disk, so runs can be replayed.
"""
from __future__ import annotations

import hashlib
import json
import re
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any, Optional

from . import config
from .schema import errors as schema_errors


class LLMError(Exception):
    """Gemma did not give a usable answer. fatal=True means Ollama itself could not be reached."""

    def __init__(self, message: str, fatal: bool = False):
        super().__init__(message)
        self.fatal = fatal


def assert_gemma(model: str) -> str:
    if not model.lower().startswith("gemma4"):
        raise LLMError(
            f"Model '{model}' is not allowed. Cypher only uses Gemma 4 (a name starting with 'gemma4'), running locally."
        )
    return model


def _loads(content: str) -> Any:
    text = content.strip()
    text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text)
    return json.loads(text)


class OllamaLLM:
    def __init__(self, model: Optional[str] = None, url: Optional[str] = None, mode: Optional[str] = None,
                 cache_dir: Optional[Path] = None, timeout: int = 120):
        self.model = assert_gemma(model or config.model_name())
        self.url = (url or config.ollama_url()).rstrip("/")
        self.mode = mode or config.llm_mode()
        self.cache_dir = Path(cache_dir) if cache_dir else config.data_dir() / "llm_cache"
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.timeout = timeout
        self.live_calls = 0
        self.cache_hits = 0

    # -- health -----------------------------------------------------------------------------
    def health(self) -> dict:
        try:
            with urllib.request.urlopen(self.url + "/api/tags", timeout=5) as resp:
                data = json.loads(resp.read().decode("utf-8"))
        except Exception as exc:  # noqa: BLE001
            return {"ollama_reachable": False, "model_present": False, "error": str(exc)}
        names = [m.get("name", "") for m in data.get("models", [])]
        present = any(n == self.model or n.startswith(self.model + ":") or n.split(":")[0] == self.model for n in names)
        return {"ollama_reachable": True, "model_present": present, "models": names}

    # -- calls ------------------------------------------------------------------------------
    def _key(self, system: str, user: str, schema: dict) -> str:
        blob = json.dumps([self.model, system, user, schema], sort_keys=True)
        return hashlib.sha256(blob.encode("utf-8")).hexdigest()

    def _post(self, body: dict) -> dict:
        req = urllib.request.Request(
            self.url + "/api/chat",
            data=json.dumps(body).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=self.timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))

    def _request(self, system: str, user: str, schema: dict, use_schema: bool) -> Any:
        body = {
            "model": self.model,
            "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}],
            "stream": False,
            "format": schema if use_schema else "json",
            "think": False,
            "options": {"temperature": 0, "seed": 7, "num_ctx": config.num_ctx(), "num_predict": 1024},
            "keep_alive": "10m",
        }
        reply = self._post(body)
        return _loads(reply["message"]["content"])

    def call(self, name: str, system: str, user: str, schema: dict, payload: Any = None) -> dict:
        key = self._key(system, user, schema)
        path = self.cache_dir / f"{key}.json"
        if path.exists():
            self.cache_hits += 1
            return json.loads(path.read_text(encoding="utf-8"))
        if self.mode == "replay":
            raise LLMError(f"No recorded answer for '{name}' and CYPHER_LLM_MODE=replay. Run once in live mode first.")
        last: Optional[Exception] = None
        use_schema = True
        for attempt in range(2):
            try:
                self.live_calls += 1
                result = self._request(system, user, schema, use_schema)
                problems = schema_errors(result, schema)
                if problems:
                    raise LLMError("Answer did not match the schema: " + "; ".join(problems[:3]))
                path.write_text(json.dumps(result), encoding="utf-8")
                return result
            except urllib.error.HTTPError as exc:
                last = exc
                if exc.code == 400 and use_schema:  # this Ollama build may not accept schemas: use plain JSON mode
                    use_schema = False
            except (urllib.error.URLError, TimeoutError, json.JSONDecodeError, KeyError, LLMError) as exc:
                last = exc
        unreachable = isinstance(last, (urllib.error.URLError, TimeoutError)) and not isinstance(last, urllib.error.HTTPError)
        hint = " Is Ollama running? Start it with: ollama serve" if unreachable else ""
        raise LLMError(f"Gemma did not give a usable answer for '{name}': {last}.{hint}", fatal=unreachable)
