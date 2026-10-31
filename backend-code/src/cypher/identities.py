"""Merge one person's identities: commit email, GitHub login, plus one other handle.

Rules (each stores a plain reason):
  R1 a commit that GitHub links to a login joins that commit email to the login
  R2 the same email seen on two logins joins them
  R3 an identities side file joins extra emails and one other handle to a login
  R4 a GitHub 'noreply' email joins the login inside it
Never merge on a display name alone.
"""
from __future__ import annotations

import re
from collections import Counter
from typing import Optional

from .models import Identity, Person
from .sources import AuthorRef, CommitInfo


class _Union:
    def __init__(self) -> None:
        self.parent: dict[tuple, tuple] = {}
        self.reason: dict[tuple, str] = {}

    def find(self, x: tuple) -> tuple:
        self.parent.setdefault(x, x)
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]
            x = self.parent[x]
        return x

    def join(self, a: tuple, b: tuple, reason: str) -> None:
        ra, rb = self.find(a), self.find(b)
        self.reason.setdefault(b, reason)
        self.reason.setdefault(a, self.reason.get(a, ""))
        if ra != rb:
            self.parent[rb] = ra


def _noreply_login(email: str) -> Optional[str]:
    m = re.fullmatch(r"(?:\d+\+)?([\w.-]+)@users\.noreply\.github\.com", email or "", re.I)
    return m.group(1) if m else None


def author_key(ref: AuthorRef) -> Optional[tuple]:
    if ref.login:
        return ("login", ref.login)
    if ref.email:
        return ("email", ref.email.lower())
    return None


def resolve(comment_authors: dict[str, AuthorRef], commits: list[CommitInfo], side: list[dict],
            comment_dates: dict[str, str]) -> tuple[list[Person], dict[str, str]]:
    """Return (people, comment_id -> person_id)."""
    uf = _Union()
    names: dict[tuple, Counter] = {}
    for ref in [c.author for c in commits]:
        key = author_key(ref)
        if key is None:
            continue
        uf.find(key)
        if ref.login and ref.email:
            email = ("email", ref.email.lower())
            reason = "Same commit as the GitHub account"
            nr = _noreply_login(ref.email)
            if nr and nr.lower() == ref.login.lower():
                reason = "GitHub private email for this account"
            uf.join(("login", ref.login), email, reason)
        if ref.name:
            names.setdefault(key, Counter())[ref.name] += 1
    for ref in comment_authors.values():
        key = author_key(ref)
        if key:
            uf.find(key)
    for entry in side:
        login = entry.get("login")
        if not login:
            continue
        for email in entry.get("emails", []):
            uf.join(("login", login), ("email", email.lower()), "Listed in the project's identity file")
        if entry.get("other"):
            uf.join(("login", login), ("handle", entry["other"]), "Listed in the project's identity file")
    # R2 (the same email on two logins) needs no extra code: both logins join the same email node.

    groups: dict[tuple, list[tuple]] = {}
    for key in list(uf.parent):
        groups.setdefault(uf.find(key), []).append(key)

    display: dict[tuple, str] = {}
    side_names = {e["login"]: e.get("name") for e in side if e.get("login") and e.get("name")}
    for root, members in groups.items():
        name = None
        for m in members:
            if m[0] == "login" and m[1] in side_names:
                name = side_names[m[1]]
        if not name:
            counter: Counter = Counter()
            for m in members:
                counter.update(names.get(m, Counter()))
            if counter:
                name = counter.most_common(1)[0][0]
        if not name:
            logins = sorted(m[1] for m in members if m[0] == "login")
            name = logins[0] if logins else sorted(m[1] for m in members)[0]
        display[root] = name

    person_ids: dict[tuple, str] = {}
    used: set[str] = set()
    for root, members in sorted(groups.items(), key=lambda kv: display[kv[0]].lower()):
        base = re.sub(r"[^a-z0-9]+", "-", display[root].lower()).strip("-") or "person"
        pid, k = base, 2
        while pid in used:
            pid, k = f"{base}-{k}", k + 1
        used.add(pid)
        person_ids[root] = pid

    mapping: dict[str, str] = {}
    for cid, ref in comment_authors.items():
        key = author_key(ref)
        if key:
            mapping[cid] = person_ids[uf.find(key)]
        else:
            mapping[cid] = "unknown"

    people: list[Person] = []
    for root, members in groups.items():
        pid = person_ids[root]
        identities: list[Identity] = []
        for m in sorted(members, key=lambda x: (["email", "login", "handle"].index(x[0]) if x[0] in ("email", "login", "handle") else 3, x[1])):
            if m[0] == "login":
                identities.append(Identity("github_login", m[1], "GitHub account used in comments and commits"))
            elif m[0] == "email":
                identities.append(Identity("commit_email", m[1], uf.reason.get(m, "Seen on commits")))
            elif m[0] == "handle":
                label = m[1].split(":")[0] if ":" in m[1] else None
                identities.append(Identity("other_handle", m[1], uf.reason.get(m, "Listed in the project's identity file"), label))
        member_set = set(members)
        commit_dates = [c.date for c in commits if author_key(c.author) and uf.find(author_key(c.author)) == root]
        comment_ids = [cid for cid, ref in comment_authors.items() if author_key(ref) in member_set or (author_key(ref) and uf.find(author_key(ref)) == root)]
        comment_ids = [cid for cid in comment_ids if not cid.startswith("commit:")]
        dates = commit_dates + [comment_dates[c] for c in comment_ids if comment_dates.get(c)]
        people.append(Person(pid, display[root], identities, len(commit_dates), len(comment_ids),
                             min(dates) if dates else "", max(dates) if dates else ""))
    people.sort(key=lambda p: (-(p.commits + p.comments), p.display_name))
    return people, mapping
