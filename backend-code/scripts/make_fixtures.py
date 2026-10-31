"""Builds the fictional sample projects in fixtures/ (GitHub API shapes). Run: python scripts/make_fixtures.py"""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "fixtures"
U = lambda login: {"login": login}


def sha(text: str) -> str:
    return hashlib.sha1(text.encode()).hexdigest()


def write(folder: Path, name: str, data) -> None:
    folder.mkdir(parents=True, exist_ok=True)
    (folder / name).write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def httpcache() -> None:
    repo = "acme/httpcache"
    folder = ROOT / "acme-httpcache"
    base = f"https://github.com/{repo}"
    api = f"https://api.github.com/repos/{repo}"
    write(folder, "repo.json", {"full_name": repo, "language": "Python", "updated_at": "2026-10-30T08:00:00Z",
                                 "description": "Fictional sample project used for demos and tests."})
    pulls = [
        (118, 1000118, "Add simple fixed-wait retry", "mtrent", "2026-01-09T08:00:00Z",
         "Added a simple fixed-wait retry of 1 second on failed HTTP requests. I also retry health checks so flaky nodes can recover. A fixed wait keeps the code easy to read."),
        (176, 1000176, "Use exponential backoff for retries", "priya-n", "2026-03-14T09:00:00Z",
         "We should wait longer after each failed try, starting at half a second and doubling each time. This spreads out retry attempts naturally so recovered services have breathing room."),
        (205, 1000205, "Document retry settings", "mtrent", "2026-05-02T10:00:00Z", "Documented the retry settings in the README. No code changes."),
        (231, 1000231, "Do not retry health checks", "elenar", "2026-06-18T11:00:00Z",
         "Health checks should fail fast rather than retrying so unhealthy nodes leave the pool immediately. This reverses part of the earlier health check retry."),
        (240, 1000240, "Move retry module to src/net", "leok", "2026-06-12T12:00:00Z",
         "Moved the retry module to src/net so networking code lives together. No behavior changes."),
        (260, 1000260, "Cap total retry wait", "samv", "2026-08-02T13:00:00Z",
         "Caps backoff at 10 seconds total across all attempts so requests do not hang indefinitely."),
    ]
    write(folder, "pulls.json", [{"id": i, "number": n, "title": t, "body": b, "user": U(u), "created_at": d, "state": "closed",
                                  "merged_at": d, "html_url": f"{base}/pull/{n}"} for n, i, t, u, d, b in pulls])
    issues = [
        (170, 2000170, "Retry storms during the staging outage", "samv", "2026-02-28T08:30:00Z",
         "During the staging outage all workers retried at the same moment and overwhelmed the database. We need the wait to grow after each failure."),
        (181, 2000181, "Make the retry count configurable", "leok", "2026-03-20T09:00:00Z", "Users should be able to choose how many tries they want."),
        (199, 2000199, "Add jitter to retries?", "elenar", "2026-04-10T09:00:00Z", "How about adding a small random delay so clients do not retry at the same moment?"),
        (222, 2000222, "Health checks flapping", "elenar", "2026-05-30T09:00:00Z", "Health checks keep flapping during deploys. The retry may be making it worse."),
    ]
    write(folder, "issues.json", [{"id": i, "number": n, "title": t, "body": b, "user": U(u), "created_at": d, "state": "open",
                                   "html_url": f"{base}/issues/{n}"} for n, i, t, u, d, b in issues])
    ic = [  # (id, number, user, date, body)
        (1893401, 170, "priya-n", "2026-02-28T10:00:00Z", "We should wait longer after each failed try, starting at half a second and doubling each time."),
        (1893404, 170, "mtrent", "2026-03-01T09:00:00Z", "How about using an outside retry library like tenacity?"),
        (1893412, 170, "priya-n", "2026-03-01T10:30:00Z", "An outside library adds an unnecessary external dependency for what is only about 20 lines of code."),
        (1893411, 170, "mtrent", "2026-03-15T09:00:00Z", "Fair point, using an outside retry library would add too much overhead. I am dropping that idea."),
        (1893402, 176, "mtrent", "2026-03-14T10:00:00Z", "Should we use an outside retry library like tenacity instead of writing custom loop code?"),
        (1893405, 176, "elenar", "2026-03-14T10:30:00Z", "Let us wait until requests cluster in real production use before tuning jitter. Adding a small random delay can come later."),
        (1893410, 176, "priya-n", "2026-03-14T11:30:00Z", "Agreed on the doubling. LGTM, merging this."),
        (1893413, 181, "samv", "2026-03-21T09:00:00Z", "We need a clear configuration design for limits and timeouts before adding settings."),
        (1893414, 199, "mtrent", "2026-04-11T09:00:00Z", "Let us wait until we see requests cluster before we add it."),
        (1893408, 118, "priya-n", "2026-01-09T09:00:00Z", "Fixed wait is a solid first step to handle quick network blips. I agree we should retry health checks too. LGTM, merging."),
        (1893409, 118, "leok", "2026-01-10T09:00:00Z", "+1 for retrying health checks so one blip does not drop a node."),
        (1893415, 231, "leok", "2026-06-18T12:00:00Z", "LGTM, merging."),
        (1893416, 260, "priya-n", "2026-08-02T14:00:00Z", "LGTM, merging."),
        (1893421, 176, "elenar", "2026-03-14T12:00:00Z", "Unit tests are passing across all supported Python versions in continuous integration."),
        # comments that must be left out
        (1893422, 176, "samv", "2026-03-14T12:05:00Z", "+1"),
        (1893423, 176, "github-actions[bot]", "2026-03-14T12:06:00Z", "Coverage is 91.2%."),
        (1893424, 260, "mtrent", "2026-08-02T14:30:00Z", "\U0001F44D"),
        (1893425, 205, "elenar", "2026-05-02T11:00:00Z", "> Documented the retry settings in the README."),
        (1893426, 260, "leok", "2026-08-02T15:00:00Z", "Thanks!"),
        (1893427, 240, "samv", "2026-06-12T13:00:00Z", "```\nnone\n```"),
    ]
    prs = {n for n, *_ in pulls}
    write(folder, "issue_comments.json", [{"id": i, "body": b, "user": U(u), "created_at": d,
                                           "html_url": f"{base}/{'pull' if n in prs else 'issues'}/{n}#issuecomment-{i}",
                                           "issue_url": f"{api}/issues/{n}"} for i, n, u, d, b in ic])
    rc = [
        (1893418, 176, "leok", "2026-03-14T10:45:00Z", "src/http_retry.py", 11, "-1 on the library. An outside retry library adds a dependency for about 20 lines of code."),
        (1893419, 176, "leok", "2026-03-14T11:00:00Z", "src/http_retry.py", 5, "We should let users choose how many tries they want through configuration."),
        (1893420, 240, "priya-n", "2026-06-12T12:30:00Z", "src/net/retry.py", 1, "Nice move. Keeping the module name stable helps imports."),
    ]
    write(folder, "review_comments.json", [{"id": i, "body": b, "user": U(u), "created_at": d, "path": p, "line": ln,
                                            "html_url": f"{base}/pull/{n}#discussion_r{i}",
                                            "pull_request_url": f"{api}/pulls/{n}"} for i, n, u, d, p, ln, b in rc])
    people = {
        "priya-n": ("Priya Nair", ["priya@acme.dev", "priya.nair@old-lab.edu"]),
        "mtrent": ("Marcus Trent", ["marcus@acme.dev", "marcus.t@gmail.com"]),
        "leok": ("Leo Kim", ["leo.k@acme.dev"]),
        "elenar": ("Elena Rossi", ["elena@acme.dev", "4410+elenar@users.noreply.github.com"]),
        "samv": ("Sam Verma", ["sam@acme.dev"]),
    }
    messages = [
        ("mtrent", 0, "2026-01-09T07:50:00Z", "Add fixed-wait retry"), ("mtrent", 0, "2026-01-09T07:55:00Z", "Retry health checks too"),
        ("mtrent", 1, "2026-01-15T10:00:00Z", "Document retry backoff configuration parameters in the project README"),
        ("leok", 0, "2026-01-20T10:00:00Z", "Unit tests for the retry loop"), ("priya-n", 0, "2026-02-02T10:00:00Z", "Fix typo in retry log message"),
        ("samv", 0, "2026-02-10T10:00:00Z", "Add staging benchmark script"), ("priya-n", 1, "2026-03-13T10:00:00Z", "Use exponential backoff for retries"),
        ("priya-n", 0, "2026-03-14T08:30:00Z", "Add backoff tests"), ("elenar", 0, "2026-03-18T10:00:00Z", "Update CI matrix"),
        ("leok", 0, "2026-03-25T10:00:00Z", "Add retry count option draft"), ("priya-n", 1, "2026-04-03T10:00:00Z", "Earlier implementation was located at src/http_retry.py before moving to new module structure."),
        ("samv", 0, "2026-04-14T10:00:00Z", "Run benchmarks against the staging cluster"), ("elenar", 1, "2026-04-20T10:00:00Z", "Pin test dependencies"),
        ("mtrent", 0, "2026-05-02T09:30:00Z", "Update README for retry settings"), ("leok", 0, "2026-05-10T10:00:00Z", "Refactor session helpers"),
        ("elenar", 1, "2026-05-15T10:00:00Z", "Unit tests are passing across all supported Python versions in continuous integration."),
        ("samv", 0, "2026-05-28T10:00:00Z", "Add flaky health check test"), ("leok", 0, "2026-06-12T11:30:00Z", "Move retry module to src/net"),
        ("priya-n", 1, "2026-06-12T11:45:00Z", "Rename retry module after move"), ("elenar", 0, "2026-06-18T10:30:00Z", "Do not retry health checks"),
        ("mtrent", 0, "2026-06-25T10:00:00Z", "Bump version to 0.4.0"), ("leok", 0, "2026-07-02T10:00:00Z", "Add connection pool metrics"),
        ("samv", 0, "2026-07-20T10:00:00Z", "Cap total retry wait at ten seconds"), ("elenar", 0, "2026-07-30T10:00:00Z", "Handle empty response bodies"),
        ("priya-n", 0, "2026-08-02T13:30:00Z", "Merge cap on total wait"), ("mtrent", 1, "2026-08-10T10:00:00Z", "Pin documentation build tools"),
        ("leok", 0, "2026-08-15T10:00:00Z", "Tidy retry module docstrings"), ("priya-n", 1, "2026-08-25T10:00:00Z", "Refactor error types in retry module for cleaner stack traces"),
        ("samv", 0, "2026-09-01T10:00:00Z", "Add changelog entry"), ("elenar", 0, "2026-09-10T10:00:00Z", "Fix flaky timeout test"),
        ("casey", 0, "2026-09-12T10:00:00Z", "Fix spelling in docs"),
    ]
    commits = []
    for login, email_i, date, msg in messages:
        if login == "casey":
            name, email, author = "Casey Dev", "casey@example.org", None
        else:
            name, emails = people[login]
            email, author = emails[email_i % len(emails)], U(login)
        commits.append({"sha": sha(msg + date), "html_url": f"{base}/commit/{sha(msg + date)}",
                        "commit": {"message": msg, "author": {"name": name, "email": email, "date": date}}, "author": author})
    write(folder, "commits.json", commits)
    write(folder, "identities.json", [
        {"login": "priya-n", "name": "Priya N.", "other": "Discourse: priya_n"},
        {"login": "mtrent", "name": "Marcus T.", "other": "Mailing list: M. Trent"},
        {"login": "leok", "name": "Leo K.", "other": "Slack: @leok"},
        {"login": "elenar", "name": "Elena R.", "other": "IRC: elena_r"},
        {"login": "samv", "name": "Sam V.", "other": "Matrix: @sam_v"},
    ])
    write(folder, "maintainers_list.json", [
        {"idea": "Use an outside retry library", "reason": "It adds a dependency for about 20 lines of code"},
        {"idea": "Add random jitter right away", "reason": "Better to wait until requests cluster in real use"},
        {"idea": "Keep the fixed one-second wait", "reason": "A fixed wait makes every client retry at the same moment"},
    ])


def billing() -> None:
    repo = "acme/billing-api"
    folder = ROOT / "acme-billing-api"
    base = f"https://github.com/{repo}"
    api = f"https://api.github.com/repos/{repo}"
    write(folder, "repo.json", {"full_name": repo, "language": "Go", "updated_at": "2026-10-29T08:00:00Z",
                                 "description": "Fictional sample project used for demos and tests."})
    write(folder, "pulls.json", [{"id": 3000031, "number": 31, "title": "Store money as integer cents", "user": U("dana-p"),
                                  "created_at": "2026-04-02T09:00:00Z", "merged_at": "2026-04-03T09:00:00Z", "state": "closed",
                                  "html_url": f"{base}/pull/31",
                                  "body": "We should store money as integer cents. Floating point rounding errors showed up in the monthly totals."}])
    write(folder, "issues.json", [])
    comments = [
        (3893001, "ravi-s", "2026-04-02T10:00:00Z", "How about using floating point numbers for prices instead?"),
        (3893002, "dana-p", "2026-04-02T10:20:00Z", "Floating point numbers are not worth it because rounding errors would break the monthly totals."),
        (3893003, "ravi-s", "2026-04-02T11:00:00Z", "Fair point, I am dropping that idea."),
        (3893004, "mei-l", "2026-04-02T12:00:00Z", "Agreed on integer cents. LGTM, merging."),
    ]
    write(folder, "issue_comments.json", [{"id": i, "body": b, "user": U(u), "created_at": d, "html_url": f"{base}/pull/31#issuecomment-{i}",
                                           "issue_url": f"{api}/issues/31"} for i, u, d, b in comments])
    write(folder, "review_comments.json", [])
    write(folder, "commits.json", [
        {"sha": sha("c1"), "html_url": f"{base}/commit/{sha('c1')}", "commit": {"message": "Store money as integer cents",
         "author": {"name": "Dana Park", "email": "dana@acme.dev", "date": "2026-04-02T08:00:00Z"}}, "author": U("dana-p")},
        {"sha": sha("c2"), "html_url": f"{base}/commit/{sha('c2')}", "commit": {"message": "Add rounding tests",
         "author": {"name": "Ravi S", "email": "ravi@acme.dev", "date": "2026-04-03T08:00:00Z"}}, "author": U("ravi-s")},
    ])
    write(folder, "identities.json", [])
    write(folder, "maintainers_list.json", [{"idea": "Use floating point numbers for prices", "reason": "Rounding errors would break the totals"}])


def eval_fixtures() -> None:
    folder = Path(__file__).resolve().parents[1] / "eval"
    folder.mkdir(exist_ok=True)
    posts = [
        ("1", "ana", "2026-02-01T09:00:00Z", "I propose we add a new keyword for async context managers. How about reusing the existing with keyword instead?"),
        ("2", "ben", "2026-02-01T10:00:00Z", "Reusing the with keyword is not worth it because it would break existing parsers. I am against it."),
        ("3", "ana", "2026-02-01T11:00:00Z", "Fair point, I am dropping that idea."),
        ("4", "cho", "2026-02-02T09:00:00Z", "We should postpone the syntax change for now and revisit it later."),
        ("5", "ben", "2026-02-02T10:00:00Z", "We should add the new keyword. LGTM, approved."),
    ]
    (folder / "toy_discussion.json").write_text(json.dumps({
        "title": "Toy discussion (invented, not a real PEP)", "url": "https://example.invalid/toy",
        "posts": [{"id": i, "author": a, "date": d, "url": f"https://example.invalid/toy/{i}", "text": t} for i, a, d, t in posts]}, indent=2) + "\n")
    (folder / "toy_gold.json").write_text(json.dumps([
        {"idea": "Reuse the existing with keyword", "reason": "It would break existing parsers"},
        {"idea": "Change the syntax right now", "reason": "Better to postpone it"}], indent=2) + "\n")


if __name__ == "__main__":
    httpcache()
    billing()
    eval_fixtures()
    print("fixtures written")
