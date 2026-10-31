import json
import threading
import time
import urllib.error
import urllib.request

import pytest

from cypher import api
from rule_llm import RuleLLM


@pytest.fixture
def server(monkeypatch):
    monkeypatch.setattr(api, "llm_factory", lambda: RuleLLM())
    srv = api.make_server(0)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    yield f"http://127.0.0.1:{srv.server_address[1]}"
    srv.shutdown()


def req(base, path, body=None, origin=None):
    headers = {"Content-Type": "application/json"}
    if origin:
        headers["Origin"] = origin
    r = urllib.request.Request(base + path, data=json.dumps(body).encode() if body is not None else None, headers=headers,
                               method="POST" if body is not None else "GET")
    try:
        with urllib.request.urlopen(r, timeout=10) as resp:
            return resp.status, json.loads(resp.read()), dict(resp.headers)
    except urllib.error.HTTPError as exc:
        return exc.code, json.loads(exc.read()), dict(exc.headers)


def wait_done(base, job):
    for _ in range(100):
        status, summary, _ = req(base, f"/api/imports/{job}/summary")
        assert status == 200
        if summary["done"] or summary["error"]:
            return summary
        time.sleep(0.05)
    raise AssertionError("import did not finish")


def test_full_flow_matches_the_frontend_contract(server):
    status, body, _ = req(server, "/api/imports", {"fixture": "acme-httpcache", "question": "Why do we retry failed requests?"})
    assert status == 200
    job = body["analysis_id"]
    summary = wait_done(server, job)
    assert summary["error"] is None and summary["done"] is True
    assert [s["key"] for s in summary["steps"]][:4] == ["prs", "issues", "comments", "commits"]
    assert summary["steps"][-1]["state"] == "skipped"  # renames come in a later stage
    status, a, _ = req(server, f"/api/analyses/{job}")
    assert status == 200
    assert {"id", "repo", "question", "range_label", "summary", "short_answer", "based_on", "decisions", "timeline",
            "confidence", "comments", "statements", "left_out", "people"} <= set(a)
    assert {"id", "title", "status", "proposer_id", "reason", "statement_ids", "grouped_count", "later_changes"} <= set(a["decisions"][0])
    assert {"id", "comment_id", "start", "end", "quote", "decision_id"} <= set(a["statements"][0])
    assert {"id", "github_id", "person_id", "date", "where", "kind", "ref_number", "url", "text"} <= set(a["comments"][0])
    assert {"id", "display_name", "identities", "commits", "comments", "first_at", "last_at"} <= set(a["people"][0])
    assert a["summary"]["statements_used"] == len(a["statements"]) and a["summary"]["statements_left_out"] == len(a["left_out"])
    assert a["repo"] == "acme/httpcache"


def test_blind_seal_comes_first_then_reveal(server):
    job = req(server, "/api/imports", {"repo": "acme/httpcache"})[1]["analysis_id"]  # sample names map to the fixture
    wait_done(server, job)
    status, body, _ = req(server, f"/api/analyses/{job}/blind/reveal", {})
    assert status == 400 and "sealed" in body["error"]
    status, sealed, _ = req(server, f"/api/analyses/{job}/blind/seal", {})
    assert status == 200 and sealed["fingerprint"].startswith("sha256:")
    status, result, _ = req(server, f"/api/analyses/{job}/blind/reveal", {})
    assert status == 200 and result["official"] == 3 and result["found"] == 1 and result["accuracy_percent"] == 33
    assert result["fingerprint"] == sealed["fingerprint"] and result["saved_at"] == sealed["saved_at"]


def test_unbuilt_parts_answer_501_and_errors_are_plain(server):
    job = req(server, "/api/imports", {"fixture": "acme-billing-api"})[1]["analysis_id"]
    wait_done(server, job)
    for path in (f"/api/analyses/{job}/files", f"/api/analyses/{job}/files/src/retry.py", f"/api/analyses/{job}/people/priya-n"):
        status, body, _ = req(server, path)
        assert status == 501 and body == {"error": "Not built yet"}
    assert req(server, f"/api/analyses/{job}/people/x/split", {})[0] == 501
    assert req(server, "/api/analyses/nope")[0] == 404
    assert req(server, "/api/imports/nope/summary")[0] == 404
    assert req(server, "/api/imports", {})[0] == 400


def test_health_repos_and_cors(server):
    status, health, _ = req(server, "/api/health")
    assert status == 200 and health["model"].startswith("gemma4") and "ollama_reachable" in health
    status, repos, headers = req(server, "/api/repos", origin="http://localhost:5173")
    assert {r["name"] for r in repos} >= {"acme/httpcache", "acme/billing-api"}
    assert headers["Access-Control-Allow-Origin"] == "http://localhost:5173"
    _, _, other = req(server, "/api/repos", origin="http://evil.example")
    assert "Access-Control-Allow-Origin" not in other


def test_a_missing_model_is_reported_not_hidden(monkeypatch, server):
    from cypher.llm import LLMError

    def broken():
        raise LLMError("Is Ollama running? Start it with: ollama serve", fatal=True)

    monkeypatch.setattr(api, "llm_factory", broken)
    job = req(server, "/api/imports", {"fixture": "acme-httpcache"})[1]["analysis_id"]
    summary = wait_done(server, job)
    assert summary["done"] is False and "ollama serve" in summary["error"]
