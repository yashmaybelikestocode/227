"""Read-only GitHub REST client. Only HTTP GET is ever used. Nothing is posted to GitHub."""
from __future__ import annotations

import hashlib
import json
import re
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Callable, Optional

from . import config
from .sources import RawRepo

API = "https://api.github.com"


class GitHubError(Exception):
    pass


def _default_fetch(url: str, headers: dict) -> tuple[int, dict, bytes]:
    req = urllib.request.Request(url, headers=headers, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.status, dict(resp.headers), resp.read()
    except urllib.error.HTTPError as exc:
        return exc.code, dict(exc.headers or {}), exc.read() if hasattr(exc, "read") else b""


class GitHubClient:
    def __init__(self, token: Optional[str] = None, fetch: Optional[Callable] = None,
                 cache_dir: Optional[Path] = None, max_pages: int = 10, sleep: Callable[[float], None] = time.sleep):
        self.token = token if token is not None else config.github_token()
        self.fetch = fetch or _default_fetch
        self.cache_dir = cache_dir
        self.max_pages = max_pages
        self.sleep = sleep
        if cache_dir:
            Path(cache_dir).mkdir(parents=True, exist_ok=True)

    def _headers(self) -> dict:
        headers = {"Accept": "application/vnd.github+json", "User-Agent": "cypher-readonly"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers

    def _get(self, url: str) -> tuple[list, Optional[str]]:
        cache_file = None
        if self.cache_dir:
            cache_file = Path(self.cache_dir) / (hashlib.sha256(url.encode()).hexdigest() + ".json")
            if cache_file.exists():
                cached = json.loads(cache_file.read_text(encoding="utf-8"))
                return cached["data"], cached.get("next")
        status, headers, body = 0, {}, b""
        for attempt in range(3):
            status, headers, body = self.fetch(url, self._headers())
            if status >= 500:
                self.sleep(1.5 * (attempt + 1))
                continue
            break
        lower = {k.lower(): v for k, v in headers.items()}
        if status == 403 and lower.get("x-ratelimit-remaining") == "0":
            reset = lower.get("x-ratelimit-reset", "?")
            raise GitHubError(f"GitHub's rate limit is used up. It resets at unix time {reset}. Add a GITHUB_TOKEN to get more requests.")
        if status == 404:
            raise GitHubError("GitHub could not find this repository, or it is private.")
        if status == 401:
            raise GitHubError("GitHub did not accept the token. Check GITHUB_TOKEN.")
        if status != 200:
            raise GitHubError(f"GitHub answered with status {status}.")
        data = json.loads(body.decode("utf-8"))
        nxt = None
        match = re.search(r'<([^>]+)>;\s*rel="next"', lower.get("link", ""))
        if match:
            nxt = match.group(1)
        if cache_file:
            cache_file.write_text(json.dumps({"data": data, "next": nxt}), encoding="utf-8")
        return data, nxt

    def paginate(self, path: str, params: Optional[dict] = None) -> list:
        query = "&".join(f"{k}={v}" for k, v in {"per_page": 100, **(params or {})}.items() if v is not None)
        url: Optional[str] = f"{API}{path}?{query}"
        out: list = []
        pages = 0
        while url and pages < self.max_pages:
            data, url = self._get(url)
            out.extend(data)
            pages += 1
        return out

    def fetch_repo(self, repo: str, since: Optional[str] = None) -> RawRepo:
        if not re.fullmatch(r"[\w.-]+/[\w.-]+", repo):
            raise GitHubError("Use the form owner/name, for example acme/httpcache.")
        base = f"/repos/{repo}"
        pulls = self.paginate(f"{base}/pulls", {"state": "all", "sort": "updated", "direction": "desc"})
        issues_all = self.paginate(f"{base}/issues", {"state": "all", "since": since})
        issues = [i for i in issues_all if "pull_request" not in i]
        issue_comments = self.paginate(f"{base}/issues/comments", {"since": since})
        review_comments = self.paginate(f"{base}/pulls/comments", {"since": since})
        commits = self.paginate(f"{base}/commits", {"since": since})
        return RawRepo(repo, pulls, issues, issue_comments, review_comments, commits, [])
