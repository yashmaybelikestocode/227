import json
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import pytest

from cypher.llm import LLMError, OllamaLLM, assert_gemma

SCHEMA = {"type": "object", "required": ["same"], "properties": {"same": {"type": "boolean"}}}


class FakeOllama:
    def __init__(self, answer, reject_schema=False):
        self.answer, self.reject_schema, self.requests = answer, reject_schema, []
        outer = self

        class H(BaseHTTPRequestHandler):
            def log_message(self, *a):
                pass

            def do_GET(self):
                data = json.dumps({"models": [{"name": "gemma4:e2b"}]}).encode()
                self.send_response(200), self.send_header("Content-Length", str(len(data))), self.end_headers()
                self.wfile.write(data)

            def do_POST(self):
                body = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
                outer.requests.append(body)
                if outer.reject_schema and isinstance(body["format"], dict):
                    self.send_response(400), self.send_header("Content-Length", "0"), self.end_headers()
                    return
                data = json.dumps({"message": {"content": json.dumps(outer.answer)}}).encode()
                self.send_response(200), self.send_header("Content-Length", str(len(data))), self.end_headers()
                self.wfile.write(data)

        self.server = ThreadingHTTPServer(("127.0.0.1", 0), H)
        self.url = f"http://127.0.0.1:{self.server.server_address[1]}"
        threading.Thread(target=self.server.serve_forever, daemon=True).start()

    def close(self):
        self.server.shutdown()


def make(fake, tmp_path, mode="live"):
    return OllamaLLM(model="gemma4:e2b", url=fake.url, mode=mode, cache_dir=tmp_path / "cache")


def test_only_gemma4_is_allowed():
    assert assert_gemma("gemma4:e2b") == "gemma4:e2b"
    for bad in ("llama3", "gpt-4o", "gemma3:4b", "mistral"):
        with pytest.raises(LLMError):
            assert_gemma(bad)
    with pytest.raises(LLMError):
        OllamaLLM(model="llama3")


def test_call_sends_local_request_validates_and_caches(tmp_path):
    fake = FakeOllama({"same": True})
    try:
        llm = make(fake, tmp_path)
        assert llm.call("same_idea", "sys", "user", SCHEMA) == {"same": True}
        body = fake.requests[0]
        assert body["model"] == "gemma4:e2b" and body["stream"] is False
        assert body["options"]["temperature"] == 0 and body["options"]["num_predict"] <= 1024 and body["think"] is False
        assert body["format"] == SCHEMA  # structured output
        assert llm.call("same_idea", "sys", "user", SCHEMA) == {"same": True}
        assert len(fake.requests) == 1 and llm.live_calls == 1 and llm.cache_hits == 1
        assert llm.health()["model_present"] is True
    finally:
        fake.close()


def test_replay_mode_never_calls_the_model(tmp_path):
    fake = FakeOllama({"same": True})
    try:
        llm = make(fake, tmp_path, mode="replay")
        with pytest.raises(LLMError):
            llm.call("same_idea", "sys", "user", SCHEMA)
        assert fake.requests == []
    finally:
        fake.close()


def test_falls_back_to_plain_json_mode_when_schema_is_rejected(tmp_path):
    fake = FakeOllama({"same": False}, reject_schema=True)
    try:
        llm = make(fake, tmp_path)
        assert llm.call("same_idea", "sys", "user", SCHEMA) == {"same": False}
        assert [r["format"] for r in fake.requests] == [SCHEMA, "json"]
    finally:
        fake.close()


def test_answer_that_breaks_the_schema_is_refused(tmp_path):
    fake = FakeOllama({"same": "maybe"})
    try:
        with pytest.raises(LLMError):
            make(fake, tmp_path).call("same_idea", "sys", "user", SCHEMA)
    finally:
        fake.close()


def test_unreachable_ollama_is_a_fatal_clear_error(tmp_path):
    llm = OllamaLLM(model="gemma4:e2b", url="http://127.0.0.1:9", cache_dir=tmp_path / "c")
    with pytest.raises(LLMError) as err:
        llm.call("same_idea", "sys", "user", SCHEMA)
    assert err.value.fatal and "ollama serve" in str(err.value)
    assert llm.health()["ollama_reachable"] is False
