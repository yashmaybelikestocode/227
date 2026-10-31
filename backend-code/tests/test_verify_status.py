from cypher.status import Stance, decision_confidence, overall_confidence, resolve_status
from cypher.textutil import overlap_share
from cypher.verify import Verifier


def st(i, person, date, stance):
    return Stance(f"s{i}", person, date, stance)


def test_invented_indexes_are_dropped():
    v = Verifier()
    assert v.valid_indexes([1, 2, 9, 0, -1, 2, "x"], 3) == [1, 2]


def test_reason_must_be_grounded_in_cited_quotes():
    v = Verifier()
    quotes = ["An outside library adds an unnecessary external dependency for about 20 lines of code."]
    assert v.reason("An outside library adds an unnecessary dependency for about 20 lines of code.", quotes)
    assert not v.reason("The CEO demanded a rewrite in Rust because of licensing.", quotes)
    assert not v.reason("", quotes)
    assert overlap_share("totally unrelated words here", quotes) == 0


def test_counts():
    v = Verifier()
    v.ok()
    v.drop("proposal_shape", "bad")
    counts = v.counts()
    assert counts["produced"] == 2 and counts["verified"] == 1 and counts["dropped"] == 1
    assert counts["dropped_by_gate"] == {"proposal_shape": 1}


def test_status_rules():
    assert resolve_status([st(1, "a", "1", "support"), st(2, "b", "2", "close_accept")], "a") == "accepted"
    assert resolve_status([st(1, "a", "1", "support"), st(2, "b", "2", "close_reject")], "a") == "rejected"
    assert resolve_status([st(1, "a", "1", "support"), st(2, "b", "2", "defer")], "a") == "deferred"
    # the last decisive signal wins
    assert resolve_status([st(1, "a", "1", "close_accept"), st(2, "b", "2", "close_reject")], "a") == "rejected"
    # two supporters and nobody objecting
    assert resolve_status([st(1, "a", "1", "support"), st(2, "b", "2", "support")], "a") == "accepted"
    # an objection after the support means it is not settled
    assert resolve_status([st(1, "a", "1", "support"), st(2, "b", "2", "support"), st(3, "c", "3", "oppose")], "a") == "unresolved"
    # proposer drops their own idea after someone objected
    assert resolve_status([st(1, "a", "1", "support"), st(2, "b", "2", "oppose"), st(3, "a", "3", "withdraw")], "a") == "rejected"
    # withdrawing without any objection is not a rejection by others
    assert resolve_status([st(1, "a", "1", "support"), st(2, "a", "2", "withdraw")], "a") == "unresolved"


def test_when_in_doubt_unresolved():
    assert resolve_status([], "a") == "unresolved"
    assert resolve_status([st(1, "a", "1", "support")], "a") == "unresolved"
    assert resolve_status([st(1, "a", "1", "oppose"), st(2, "b", "2", "neutral")], "a") == "unresolved"


def test_confidence_comes_from_counts():
    assert decision_confidence(3, 2) == "high"
    assert decision_confidence(3, 1) == "medium"
    assert decision_confidence(1, 1) == "low"
    assert overall_confidence(["high", "high", "low"]) == "high"
    assert overall_confidence(["medium"]) == "medium"
    assert overall_confidence([]) == "low"
