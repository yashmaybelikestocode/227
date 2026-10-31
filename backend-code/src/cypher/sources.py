"""Where discussions come from: GitHub-shaped JSON (live or fixture) and discussion files (plain or Discourse).

Everything is turned into Comment objects. Raw data always uses the shapes of the GitHub REST API.
"""
from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path
from typing import Optional

from . import config
from .models import Comment


@dataclass
class RawRepo:
    repo: str
    pulls: list[dict] = field(default_factory=list)
    issues: list[dict] = field(default_factory=list)
    issue_comments: list[dict] = field(default_factory=list)
    review_comments: list[dict] = field(default_factory=list)
    commits: list[dict] = field(default_factory=list)
    identities: list[dict] = field(default_factory=list)  # optional side file


@dataclass
class AuthorRef:
    login: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None


@dataclass
class CommitInfo:
    sha: str
    date: str
    author: AuthorRef


@dataclass
class Normalized:
    title: str
    comments: list[Comment]
    authors: dict[str, AuthorRef]  # comment id -> author
    commits: list[CommitInfo]
    review_meta: dict[str, dict]  # comment id -> {"path":..., "line":...} (used by later stages)
    prs: int = 0
    issues: int = 0
    side_identities: list[dict] = field(default_factory=list)


# ---------------------------------------------------------------------------------------------
def _read(path: Path):
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else []


def fixture_names() -> list[str]:
    root = config.fixtures_dir()
    return sorted(p.name for p in root.iterdir() if p.is_dir() and (p / "repo.json").exists()) if root.exists() else []


def fixture_for_repo(repo: str) -> Optional[str]:
    """Bundled sample projects are fictional, so their names map to local fixtures (no GitHub call)."""
    for name in fixture_names():
        meta = json.loads((config.fixtures_dir() / name / "repo.json").read_text(encoding="utf-8"))
        if meta.get("full_name") == repo or name == repo:
            return name
    return None


def load_fixture(name: str) -> RawRepo:
    folder = config.fixtures_dir() / name
    if not (folder / "repo.json").exists():
        raise FileNotFoundError(f"Sample project '{name}' was not found in {folder}")
    meta = json.loads((folder / "repo.json").read_text(encoding="utf-8"))
    return RawRepo(
        repo=meta["full_name"],
        pulls=_read(folder / "pulls.json"),
        issues=_read(folder / "issues.json"),
        issue_comments=_read(folder / "issue_comments.json"),
        review_comments=_read(folder / "review_comments.json"),
        commits=_read(folder / "commits.json"),
        identities=_read(folder / "identities.json"),
    )


def _login(item: dict) -> Optional[str]:
    user = item.get("user") or {}
    return user.get("login")


def _number_from_url(url: str) -> Optional[int]:
    m = re.search(r"/(\d+)/?$", url or "")
    return int(m.group(1)) if m else None


def normalize(raw: RawRepo, since: Optional[str] = None) -> Normalized:
    def recent(date: str) -> bool:
        return since is None or (date or "") >= since

    comments: list[Comment] = []
    authors: dict[str, AuthorRef] = {}
    review_meta: dict[str, dict] = {}
    pr_numbers = {p["number"] for p in raw.pulls}

    def add(c: Comment, author: AuthorRef) -> None:
        comments.append(c)
        authors[c.id] = author

    for p in raw.pulls:
        if p.get("body") and recent(p.get("created_at", "")):
            n = p["number"]
            add(Comment(f"pr:{p['id']}", str(p["id"]), "", p["created_at"], f"PR #{n} description", "pr_comment", n,
                        p.get("html_url", ""), p["body"], f"pr:{n}"), AuthorRef(login=_login(p)))
    for i in raw.issues:
        if "pull_request" in i or i["number"] in pr_numbers:
            continue
        if i.get("body") and recent(i.get("created_at", "")):
            n = i["number"]
            add(Comment(f"issue:{i['id']}", str(i["id"]), "", i["created_at"], f"Issue #{n} description", "issue_comment",
                        n, i.get("html_url", ""), i["body"], f"issue:{n}"), AuthorRef(login=_login(i)))
    for c in raw.issue_comments:
        n = _number_from_url(c.get("issue_url", ""))
        if not c.get("body") or not recent(c.get("created_at", "")):
            continue
        is_pr = n in pr_numbers
        kind = "pr_comment" if is_pr else "issue_comment"
        where = f"PR #{n} comment" if is_pr else f"Issue #{n} comment"
        add(Comment(f"ic:{c['id']}", str(c["id"]), "", c["created_at"], where, kind, n, c.get("html_url", ""), c["body"],
                    f"{'pr' if is_pr else 'issue'}:{n}"), AuthorRef(login=_login(c)))
    for c in raw.review_comments:
        n = _number_from_url(c.get("pull_request_url", ""))
        if not c.get("body") or not recent(c.get("created_at", "")):
            continue
        cid = f"rc:{c['id']}"
        add(Comment(cid, str(c["id"]), "", c["created_at"], f"PR #{n} review comment", "review_comment", n,
                    c.get("html_url", ""), c["body"], f"pr:{n}"), AuthorRef(login=_login(c)))
        review_meta[cid] = {"path": c.get("path"), "line": c.get("line") or c.get("original_line")}
    commit_infos: list[CommitInfo] = []
    for c in raw.commits:
        info = (c.get("commit") or {}).get("author") or {}
        date = info.get("date", "")
        if not recent(date):
            continue
        sha = c["sha"]
        ref = AuthorRef(login=(c.get("author") or {}).get("login"), name=info.get("name"), email=info.get("email"))
        commit_infos.append(CommitInfo(sha, date, ref))
        message = (c.get("commit") or {}).get("message", "")
        if message.strip():
            add(Comment(f"commit:{sha[:7]}", sha[:7], "", date, "Commit message", "commit_message", None,
                        c.get("html_url", ""), message, f"commit:{sha[:7]}"), ref)
    prs = len([p for p in raw.pulls if recent(p.get("created_at", ""))])
    issues = len([i for i in raw.issues if "pull_request" not in i and i["number"] not in pr_numbers and recent(i.get("created_at", ""))])
    return Normalized(raw.repo, comments, authors, commit_infos, review_meta, prs, issues, raw.identities)


# ---------------------------------------------------------------------------------------------
# Discussion files (used for the blind test: organizers give a discussion without its PEP)
class _Strip(HTMLParser):
    SKIP = {"pre", "blockquote", "script", "style"}
    BLOCK = {"p", "br", "li", "div", "h1", "h2", "h3", "h4", "tr"}

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []
        self.skip = 0

    def handle_starttag(self, tag, attrs):
        if tag in self.SKIP or (tag == "aside" and any(v and "quote" in v for _, v in attrs)):
            self.skip += 1
        if tag in self.BLOCK:
            self.parts.append("\n")

    def handle_endtag(self, tag):
        if tag in self.SKIP or tag == "aside":
            self.skip = max(0, self.skip - 1)
        if tag in self.BLOCK:
            self.parts.append("\n")

    def handle_data(self, data):
        if not self.skip:
            self.parts.append(data)


def html_to_text(html: str) -> str:
    parser = _Strip()
    parser.feed(html)
    text = "".join(parser.parts)
    return re.sub(r"\n{2,}", "\n", text).strip()


def load_discussion(path: Path) -> Normalized:
    """Plain format {"title","url","posts":[{id,author,date,url,text}]} or a Discourse topic JSON."""
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    title = data.get("title") or Path(path).stem
    comments: list[Comment] = []
    authors: dict[str, AuthorRef] = {}
    if "post_stream" in data:
        for n, post in enumerate(data["post_stream"].get("posts", []), start=1):
            text = post.get("raw") or html_to_text(post.get("cooked", ""))
            num = post.get("post_number", n)
            base = data.get("url") or ""
            url = f"{base}/{num}" if base else ""
            cid = f"post:{post['id']}"
            comments.append(Comment(cid, str(post["id"]), "", post.get("created_at", ""), f"Post {num}", "issue_comment",
                                    num, url, text, "discussion"))
            authors[cid] = AuthorRef(login=post.get("username"))
    else:
        for n, post in enumerate(data.get("posts", []), start=1):
            cid = f"post:{post['id']}"
            comments.append(Comment(cid, str(post["id"]), "", post.get("date", ""), f"Post {n}", "issue_comment", n,
                                    post.get("url", ""), post["text"], "discussion"))
            authors[cid] = AuthorRef(login=post.get("author"))
    return Normalized(title, comments, authors, [], {}, 0, 0, [])
