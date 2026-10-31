"""Real Gemma 4 through a running Ollama. Skipped unless CYPHER_LIVE=1 (CI never runs this)."""
import os

import pytest

from cypher import prompts
from cypher.llm import OllamaLLM

pytestmark = [pytest.mark.ollama, pytest.mark.skipif(os.environ.get("CYPHER_LIVE") != "1", reason="set CYPHER_LIVE=1 with Ollama running")]


def test_gemma_answers_a_schema_constrained_question(tmp_path):
    llm = OllamaLLM(cache_dir=tmp_path / "cache")
    assert llm.health()["model_present"], "run: ollama pull gemma4:e2b"
    reply = llm.call("same_idea", prompts.P3_SYSTEM,
                     prompts.p3_user("Use an outside retry library", "Use a third-party retry package"), prompts.P3_SCHEMA)
    assert isinstance(reply["same"], bool)
    assert llm.live_calls == 1


def test_gemma_finds_a_proposal_in_a_tiny_window(tmp_path):
    llm = OllamaLLM(cache_dir=tmp_path / "cache")
    quotes = ["How about using an outside retry library like tenacity?",
              "An outside library adds an unnecessary dependency for about 20 lines of code.",
              "Fair point, I am dropping that idea."]
    reply = llm.call("find_proposals", prompts.P1_SYSTEM, prompts.p1_user(quotes), prompts.P1_SCHEMA)
    assert reply["approaches"], "Gemma should find the library idea"
