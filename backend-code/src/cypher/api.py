"""HTTP API (standard library only). The frontend talks to this through the Vite /api proxy."""
from __future__ import annotations

import json
import re
import threading
import uuid
from datetime import datetime, timedelta, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Callable, Optional
from urllib.parse import urlparse

from . import blind, config, pipeline, sources
from .github_client import GitHubClient, GitHubError
from .llm import LLMError, OllamaLLM
from .models import Analysis, ImportSummary, to_dict

ALLOWED_ORIGINS = {"http://localhost:5173", "http://127.0.0.1:5173"}
NOT_BUILT = "Not built yet"

JOBS: dict[str, dict] = {}
_LOCK = threading.Lock()
llm_factory: Callable[[], object] = lambda: OllamaLLM()
github_factory: Callable[[], GitHubClient] = lambda: GitHubClient(cache_dir=config.data_dir() / "http_cache")


def since_from_range(label: Optional[str], custom: Optional[str] = None) -> Optional[str]:
    if custom:
        return custom
    days = {"last 2 weeks": 14, "last month": 30, "last 6 months": 182, "last year": 365}.get((label or "").strip().lower())
    if not days:
        return None
    return (datetime.now(timezone.utc) - timedelta(days=days)).strftime("%Y-%m-%dT%H:%M:%SZ")


def _analysis_path(analysis_id: str) -> Path:
    folder = config.data_dir() / "analyses"
    folder.mkdir(parents=True, exist_ok=True)
    return folder / f"{analysis_id}.json"


def save_analysis(analysis: Analysis) -> None:
    _analysis_path(analysis.id).write_text(json.dumps(to_dict(analysis), ensure_ascii=False), encoding="utf-8")


def load_analysis_dict(analysis_id: str) -> Optional[dict]:
    if not re.fullmatch(r"[\w.-]+", analysis_id):
        return None
    path = _analysis_path(analysis_id)
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else None


# -------------------------------------------------------------------------------------------
def run_job(job_id: str, params: dict) -> None:
    job = JOBS[job_id]
    summary: ImportSummary = job["summary"]
    try:
        repo = params.get("repo") or ""
        fixture = params.get("fixture") or sources.fixture_for_repo(repo)
        for key in ("prs", "issues", "comments", "commits"):
            pipeline._set(summary, key, "working", None, None)
        if fixture:
            raw = sources.load_fixture(fixture)
            norm = sources.normalize(raw)  # sample projects ignore the date range
            repo = raw.repo
        else:
            since = since_from_range(params.get("range"), params.get("since"))
            raw = github_factory().fetch_repo(repo, since)
            norm = sources.normalize(raw, since)
        llm = llm_factory()
        analysis = pipeline.analyze(norm, repo, params.get("question") or "", params.get("range") or "",
                                    llm, summary=summary, analysis_id=job_id)
        analysis.stats["fixture"] = fixture or ""
        save_analysis(analysis)
        job["analysis_id"] = analysis.id
    except (LLMError, GitHubError, FileNotFoundError, ValueError) as exc:
        summary.error = str(exc)
    except Exception as exc:  # noqa: BLE001  (never leave the page waiting forever)
        summary.error = f"Something went wrong while reading this project: {exc}"


def start_import(params: dict) -> str:
    job_id = f"{re.sub(r'[^a-z0-9]+', '-', (params.get('fixture') or params.get('repo') or 'project').lower()).strip('-')}-{uuid.uuid4().hex[:6]}"
    with _LOCK:
        JOBS[job_id] = {"summary": pipeline.new_summary(), "analysis_id": None}
    thread = threading.Thread(target=run_job, args=(job_id, params), daemon=True)
    thread.start()
    JOBS[job_id]["thread"] = thread
    return job_id


# -------------------------------------------------------------------------------------------
class Handler(BaseHTTPRequestHandler):
    server_version = "cypher"

    def log_message(self, fmt, *args):  # quiet
        return

    # helpers
    def _cors(self) -> None:
        origin = self.headers.get("Origin", "")
        if origin in ALLOWED_ORIGINS:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

    def _send(self, status: int, body: object) -> None:
        data = json.dumps(body, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self._cors()
        self.end_headers()
        self.wfile.write(data)

    def _error(self, status: int, message: str) -> None:
        self._send(status, {"error": message})

    def _body(self) -> dict:
        length = int(self.headers.get("Content-Length") or 0)
        if not length:
            return {}
        try:
            return json.loads(self.rfile.read(length).decode("utf-8"))
        except json.JSONDecodeError:
            return {}

    def do_OPTIONS(self):  # noqa: N802
        self.send_response(204)
        self._cors()
        self.end_headers()

    # routes
    def do_GET(self):  # noqa: N802
        path = urlparse(self.path).path.rstrip("/")
        try:
            if path == "/api/health":
                return self._health()
            if path == "/api/repos":
                return self._send(200, [self._repo_meta(n) for n in sources.fixture_names()])
            m = re.fullmatch(r"/api/imports/([\w.-]+)/summary", path)
            if m:
                job = JOBS.get(m.group(1))
                if not job:
                    return self._error(404, "This import was not found. Start a new one.")
                return self._send(200, to_dict(job["summary"]))
            m = re.fullmatch(r"/api/analyses/([\w.-]+)", path)
            if m:
                data = load_analysis_dict(m.group(1))
                if data is None:
                    return self._error(404, "The analysis is not ready yet or does not exist.")
                return self._send(200, data)
            if re.fullmatch(r"/api/analyses/[\w.-]+/(files|people)(/.*)?", path):
                return self._error(501, NOT_BUILT)
            return self._error(404, "Unknown address.")
        except Exception as exc:  # noqa: BLE001
            return self._error(500, f"Something went wrong: {exc}")

    def do_POST(self):  # noqa: N802
        path = urlparse(self.path).path.rstrip("/")
        try:
            if path == "/api/imports":
                params = self._body()
                if not (params.get("repo") or params.get("fixture")):
                    return self._error(400, "Tell Cypher which project to read, for example acme/httpcache.")
                return self._send(200, {"analysis_id": start_import(params)})
            m = re.fullmatch(r"/api/analyses/([\w.-]+)/blind/(seal|reveal)", path)
            if m:
                return self._blind(m.group(1), m.group(2))
            if re.fullmatch(r"/api/analyses/[\w.-]+/people/[\w.-]+/(split|undo-split)", path):
                return self._error(501, NOT_BUILT)
            return self._error(404, "Unknown address.")
        except Exception as exc:  # noqa: BLE001
            return self._error(500, f"Something went wrong: {exc}")

    # handlers
    def _repo_meta(self, name: str) -> dict:
        meta = json.loads((config.fixtures_dir() / name / "repo.json").read_text(encoding="utf-8"))
        return {"name": meta["full_name"], "language": meta.get("language", ""), "updated_at": meta.get("updated_at", ""),
                "description": meta.get("description", ""), "sample": True}

    def _health(self) -> None:
        info = {"ok": True, "model": config.model_name(), "mode": config.llm_mode(), "ollama_reachable": False,
                "model_present": False}
        try:
            info.update(OllamaLLM().health())
        except LLMError as exc:
            info.update({"error": str(exc)})
        info["ok"] = bool(info.get("ollama_reachable") and info.get("model_present"))  # ready to analyze
        self._send(200, info)

    def _blind(self, analysis_id: str, action: str) -> None:
        data = load_analysis_dict(analysis_id)
        if data is None:
            return self._error(404, "The analysis is not ready yet or does not exist.")
        if action == "seal":
            predictions = [
                {"idea": d["title"], "reason": d["reason"]["text"], "statement_ids": d["statement_ids"]}
                for d in data["decisions"] if d["status"] == "rejected"
            ]
            record = blind.seal(analysis_id, predictions)
            return self._send(200, {"saved_at": record["saved_at"], "fingerprint": record["fingerprint"]})
        body = self._body()
        gold = body.get("gold")
        gold_bytes = None
        if gold is None:
            fixture = (data.get("stats") or {}).get("fixture")
            gold_file = config.fixtures_dir() / fixture / "maintainers_list.json" if fixture else None
            if not gold_file or not gold_file.exists():
                return self._error(400, "No maintainers' list was provided for this project.")
            gold, gold_bytes = blind.load_gold(gold_file)
        try:
            blind.load_sealed(analysis_id)
        except FileNotFoundError as exc:
            return self._error(400, str(exc))
        except ValueError as exc:
            return self._error(409, str(exc))
        try:
            result = blind.score(analysis_id, gold, llm=llm_factory(), gold_bytes=gold_bytes)
        except LLMError:
            result = blind.score(analysis_id, gold, llm=None, gold_bytes=gold_bytes)
        self._send(200, to_dict(result))


def make_server(port: int = 8000, host: str = "127.0.0.1") -> ThreadingHTTPServer:
    return ThreadingHTTPServer((host, port), Handler)


def serve(port: int = 8000) -> None:
    server = make_server(port)
    print(f"Cypher API running at http://127.0.0.1:{port}  (model: {config.model_name()}, mode: {config.llm_mode()})")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
