"""Settings read from environment variables at call time (so tests can change them)."""
from __future__ import annotations

import os
from pathlib import Path


def repo_root() -> Path:
    env = os.environ.get("CYPHER_ROOT")
    if env:
        return Path(env)
    # src/cypher/config.py -> repository root is two levels above src/
    here = Path(__file__).resolve()
    candidate = here.parents[2]
    if (candidate / "fixtures").exists():
        return candidate
    return Path.cwd()


def data_dir() -> Path:
    path = Path(os.environ.get("CYPHER_DATA", repo_root() / ".cypher"))
    path.mkdir(parents=True, exist_ok=True)
    return path


def out_dir() -> Path:
    path = Path(os.environ.get("CYPHER_OUT", repo_root() / "examples" / "output"))
    path.mkdir(parents=True, exist_ok=True)
    return path


def fixtures_dir() -> Path:
    return Path(os.environ.get("CYPHER_FIXTURES", repo_root() / "fixtures"))


def model_name() -> str:
    return os.environ.get("CYPHER_MODEL", "gemma4:e2b")


def ollama_url() -> str:
    return os.environ.get("CYPHER_OLLAMA_URL", "http://127.0.0.1:11434").rstrip("/")


def num_ctx() -> int:
    return min(int(os.environ.get("CYPHER_NUM_CTX", "4096")), 8192)


def llm_mode() -> str:
    """'live' calls Ollama (and caches answers); 'replay' only uses cached answers."""
    return os.environ.get("CYPHER_LLM_MODE", "live")


def github_token() -> str | None:
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        return token
    env_file = repo_root() / ".env"
    if env_file.exists():
        for line in env_file.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line.startswith("GITHUB_TOKEN="):
                return line.split("=", 1)[1].strip().strip('"').strip("'") or None
    return None
