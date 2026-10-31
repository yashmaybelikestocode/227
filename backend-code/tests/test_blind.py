import json
from pathlib import Path

import pytest

from cypher import blind, cli, pipeline, sources
from rule_llm import RuleLLM

ROOT = Path(__file__).resolve().parents[1]


def test_seal_then_score_arithmetic():
    preds = [{"idea": "Use an outside retry library", "reason": "adds a dependency for 20 lines", "statement_ids": ["a"]},
             {"idea": "Rewrite everything in Rust", "reason": "no", "statement_ids": ["b"]}]
    record = blind.seal("t1", preds)
    assert record["fingerprint"].startswith("sha256:") and record["saved_at"].endswith("Z")
    gold = [{"idea": "Use an outside retry library", "reason": "It adds a dependency for about 20 lines of code"},
            {"idea": "Add random jitter right away", "reason": "wait"}]
    result = blind.score("t1", gold, llm=None)
    assert (result.official, result.found) == (2, 1)
    assert result.accuracy_percent == 50 and result.precision_percent == 50
    assert [p.kind for p in result.pairs] == ["found", "missed"]
    assert result.pairs[0].statement_ids == ["a"] and result.extras == ["Rewrite everything in Rust"]
    assert result.reason_agreement == 1


def test_cannot_score_before_sealing():
    with pytest.raises(FileNotFoundError):
        blind.score("never-sealed", [{"idea": "x", "reason": "y"}])


def test_sealed_findings_cannot_be_changed_or_overwritten():
    first = blind.seal("t2", [{"idea": "A", "reason": "r", "statement_ids": []}])
    again = blind.seal("t2", [{"idea": "B", "reason": "r", "statement_ids": []}])
    assert again["fingerprint"] == first["fingerprint"]  # a sealed result is never replaced
    path = blind.sealed_dir() / "t2.json"
    data = json.loads(path.read_text())
    data["predictions"][0]["idea"] = "tampered"
    path.write_text(json.dumps(data))
    with pytest.raises(ValueError):
        blind.score("t2", [{"idea": "A", "reason": "r"}])


def test_blind_run_never_reads_the_maintainers_list(monkeypatch):
    opened = []
    real_text, real_bytes = Path.read_text, Path.read_bytes
    monkeypatch.setattr(Path, "read_text", lambda self, *a, **k: (opened.append(str(self)), real_text(self, *a, **k))[1])
    monkeypatch.setattr(Path, "read_bytes", lambda self, *a, **k: (opened.append(str(self)), real_bytes(self, *a, **k))[1])
    monkeypatch.setattr(cli, "OllamaLLM", lambda: RuleLLM())
    assert cli.main(["blind-run", str(ROOT / "eval" / "toy_discussion.json")]) == 0
    assert opened and not any("gold" in p or "maintainers_list" in p for p in opened)


def test_blind_test_end_to_end_on_the_invented_toy_discussion(monkeypatch):
    monkeypatch.setattr(cli, "OllamaLLM", lambda: RuleLLM())
    assert cli.main(["blind-run", str(ROOT / "eval" / "toy_discussion.json")]) == 0
    assert cli.main(["blind-score", "toy_discussion", "--gold", str(ROOT / "eval" / "toy_gold.json")]) == 0
    from cypher import config
    out = json.loads((config.out_dir() / "blind_score_toy_discussion.json").read_text())
    assert out["official"] == 2 and out["found"] == 1 and out["accuracy_percent"] == 50
    assert out["gold_sha256"].startswith("sha256:") and out["fingerprint"].startswith("sha256:")


def test_fixture_maintainers_list_scoring():
    raw = sources.load_fixture("acme-httpcache")
    analysis = pipeline.analyze(sources.normalize(raw), raw.repo, "", "", RuleLLM())
    blind.seal("fx", blind.predictions_from(analysis))
    gold = json.loads((ROOT / "fixtures" / "acme-httpcache" / "maintainers_list.json").read_text())
    result = blind.score("fx", gold, llm=RuleLLM())
    assert result.found == 1 and result.accuracy_percent == 33 and result.precision_percent == 100
