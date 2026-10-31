import pytest

from rule_llm import RuleLLM


@pytest.fixture(autouse=True)
def isolated_data(tmp_path, monkeypatch):
    monkeypatch.setenv("CYPHER_DATA", str(tmp_path / "data"))
    monkeypatch.setenv("CYPHER_OUT", str(tmp_path / "out"))
    monkeypatch.delenv("GITHUB_TOKEN", raising=False)
    monkeypatch.setenv("CYPHER_ROOT", str(__import__("pathlib").Path(__file__).resolve().parents[1]))
    yield


@pytest.fixture
def llm():
    return RuleLLM()
