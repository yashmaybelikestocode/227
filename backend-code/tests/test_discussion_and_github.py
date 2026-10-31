import json
from pathlib import Path

import pytest

from cypher import pipeline, sources
from cypher.github_client import GitHubClient, GitHubError
from cypher.statements import split_text
from rule_llm import RuleLLM


def test_discourse_topic_is_cleaned_and_quotes_are_skipped(tmp_path):
    topic = {"title": "Topic", "url": "https://example.invalid/t/1", "post_stream": {"posts": [
        {"id": 11, "username": "ana", "created_at": "2026-02-01T09:00:00Z", "post_number": 1,
         "cooked": "<p>I propose a new keyword.</p><pre>code. here.</pre>"},
        {"id": 12, "username": "ben", "created_at": "2026-02-01T10:00:00Z", "post_number": 2,
         "cooked": '<aside class="quote"><blockquote>I propose a new keyword.</blockquote></aside><p>That is not worth it.</p>'}]}}
    path = tmp_path / "t.json"
    path.write_text(json.dumps(topic))
    norm = sources.load_discussion(path)
    assert [c.text for c in norm.comments] == ["I propose a new keyword.", "That is not worth it."]
    assert norm.authors["post:12"].login == "ben" and norm.comments[1].url.endswith("/2")


def test_plain_discussion_runs_through_the_pipeline():
    norm = sources.load_discussion(Path(__file__).resolve().parents[1] / "eval" / "toy_discussion.json")
    a = pipeline.analyze(norm, norm.title, "", "", RuleLLM())
    status = {d.title: d.status for d in a.decisions}
    assert status["Reuse the existing with keyword"] == "rejected"
    assert status["Add a new keyword for the syntax"] == "accepted"


def fake_github(calls):
    def fetch(url, headers):
        calls.append(url)
        assert headers["User-Agent"] == "cypher-readonly" and "Authorization" not in headers
        if "/pulls/comments" in url or "/issues/comments" in url:
            return 200, {}, b"[]"
        if "/pulls?" in url:
            if "page=2" in url:
                return 200, {}, json.dumps([{"id": 2, "number": 2}]).encode()
            return 200, {"Link": '<https://api.github.com/repos/o/r/pulls?per_page=100&page=2>; rel="next"'}, json.dumps([{"id": 1, "number": 1}]).encode()
        if "/issues?" in url:
            return 200, {}, json.dumps([{"id": 5, "number": 5}, {"id": 6, "number": 1, "pull_request": {}}]).encode()
        if "/commits?" in url:
            return 200, {}, b"[]"
        return 404, {}, b"{}"
    return fetch


def test_github_client_paginates_filters_prs_and_caches(tmp_path):
    calls = []
    client = GitHubClient(token="", fetch=fake_github(calls), cache_dir=tmp_path / "cache")
    raw = client.fetch_repo("o/r")
    assert [p["number"] for p in raw.pulls] == [1, 2]
    assert [i["number"] for i in raw.issues] == [5]  # PRs are not issues
    count = len(calls)
    GitHubClient(token="", fetch=fake_github(calls), cache_dir=tmp_path / "cache").fetch_repo("o/r")
    assert len(calls) == count  # second run is served from the disk cache
    assert all(u.startswith("https://api.github.com/repos/o/r") for u in calls)  # only GET reads, nothing else


def test_github_errors_are_plain_english():
    with pytest.raises(GitHubError, match="rate limit"):
        GitHubClient(token="", fetch=lambda u, h: (403, {"X-RateLimit-Remaining": "0", "X-RateLimit-Reset": "1"}, b"{}")).fetch_repo("o/r")
    with pytest.raises(GitHubError, match="could not find"):
        GitHubClient(token="", fetch=lambda u, h: (404, {}, b"{}")).fetch_repo("o/r")
    with pytest.raises(GitHubError, match="owner/name"):
        GitHubClient(token="", fetch=lambda u, h: (200, {}, b"[]")).fetch_repo("not a repo")


def test_server_errors_are_retried():
    seen = []

    def fetch(url, headers):
        seen.append(url)
        return (502, {}, b"") if len(seen) < 3 else (200, {}, b"[]")

    client = GitHubClient(token="", fetch=fetch, sleep=lambda s: None)
    assert client.paginate("/repos/o/r/commits") == []
    assert len(seen) == 3


def test_date_range_filters_live_data():
    raw = sources.load_fixture("acme-httpcache")
    everything = sources.normalize(raw)
    recent = sources.normalize(raw, since="2026-06-01T00:00:00Z")
    assert 0 < len(recent.comments) < len(everything.comments)
    assert all(c.date >= "2026-06-01" for c in recent.comments)
