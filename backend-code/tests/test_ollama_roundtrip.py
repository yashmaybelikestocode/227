"""The real OllamaLLM client + real prompts + the pipeline, talking to a FAKE local Ollama server whose answers come from
the scripted rules. Proves the HTTP round trip, schema checks, caching and replay. It does NOT prove how good Gemma is."""
import json
import re
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from cypher import pipeline, prompts, sources
from cypher.llm import OllamaLLM
from rule_llm import RuleLLM


def statements_in(user):
    return [m.group(2) for m in re.finditer(r"^\[s(\d+)\] (.*)$", user, re.M)]


def answer(rule, system, user):
    quotes = statements_in(user)
    own_comment = list(range(len(quotes)))
    if system == prompts.P1_SYSTEM:
        return rule.call("find_proposals", "", "", {}, {"statements": quotes, "comments": own_comment})
    if system == prompts.P2_SYSTEM:
        label = re.search(r"^Approach: (.*)$", user, re.M).group(1)
        return rule.call("stance", "", "", {}, {"statements": quotes, "comments": own_comment, "label": label})
    if system == prompts.P3_SYSTEM:
        a, b = re.search(r"Idea A: (.*)\nIdea B: (.*)", user).groups()
        strip = lambda s: re.sub(r" \(.*\)$", "", s)
        return rule.call("same_idea", "", "", {}, {"a": strip(a), "b": strip(b)})
    if system == prompts.P5_SYSTEM:
        return rule.call("reason", "", "", {}, {"statements": quotes})
    raise AssertionError("unexpected prompt")


def start_fake():
    rule, seen = RuleLLM(), []

    class H(BaseHTTPRequestHandler):
        def log_message(self, *a):
            pass

        def do_POST(self):
            body = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
            seen.append(body)
            reply = answer(rule, body["messages"][0]["content"], body["messages"][1]["content"])
            data = json.dumps({"message": {"content": json.dumps(reply)}}).encode()
            self.send_response(200), self.send_header("Content-Length", str(len(data))), self.end_headers()
            self.wfile.write(data)

    server = ThreadingHTTPServer(("127.0.0.1", 0), H)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return server, seen


def run(llm):
    raw = sources.load_fixture("acme-httpcache")
    return pipeline.analyze(sources.normalize(raw), raw.repo, "Why do we retry failed requests?", "", llm)


def test_pipeline_over_http_then_replay(tmp_path):
    server, seen = start_fake()
    url = f"http://127.0.0.1:{server.server_address[1]}"
    try:
        live = OllamaLLM(model="gemma4:e2b", url=url, mode="live", cache_dir=tmp_path / "cache")
        first = run(live)
        assert live.live_calls == len(seen) > 5 and first.stats["live_calls"] == live.live_calls
        assert all(b["model"] == "gemma4:e2b" and b["stream"] is False and isinstance(b["format"], dict) for b in seen)
        status = {d.title: d.status for d in first.decisions}
        assert status["Use an outside retry library"] == "rejected" and status["Wait longer after each failed try"] == "accepted"
        assert first.stats["verifier"]["dropped"] == 0
    finally:
        server.shutdown()
    # server is gone: replay must work from the recorded answers alone and give the same decisions
    replay = OllamaLLM(model="gemma4:e2b", url=url, mode="replay", cache_dir=tmp_path / "cache")
    second = run(replay)
    assert replay.live_calls == 0 and replay.cache_hits == live.live_calls
    assert [(d.title, d.status, d.statement_ids) for d in second.decisions] == [(d.title, d.status, d.statement_ids) for d in first.decisions]
