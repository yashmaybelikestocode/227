"""What happens when the model gives sloppy answers (as a small model sometimes does)."""
from cypher import pipeline
from cypher.models import Comment
from cypher.sources import AuthorRef, Normalized


def norm(posts):
    comments, authors = [], {}
    for i, (who, text) in enumerate(posts):
        cid = f"post:{i}"
        comments.append(Comment(cid, str(i), "", f"2026-02-0{i + 1}T10:00:00Z", f"Post {i}", "issue_comment", i, "", text, "discussion"))
        authors[cid] = AuthorRef(login=who)
    return Normalized("t", comments, authors, [], {}, 0, 0, [])


class Scripted:
    """Answers exactly what the test says. Not a model."""
    model, mode, live_calls, cache_hits = "scripted-test-model", "test", 0, 0

    def __init__(self, proposals, stances):
        self.proposals, self.stances = proposals, stances

    def call(self, name, system, user, schema, payload=None):
        if name == "find_proposals":
            return {"approaches": self.proposals}
        if name == "stance":
            return {"stances": self.stances}
        if name == "reason":
            return {"reason": "We should use integer cents because floats round badly", "statements": [1]}
        return {"same": False, "match": False}


POSTS = [("ana", "We should use integer cents for money because floats round badly."),
         ("ben", "How about floating point numbers instead?"),
         ("cho", "LGTM, merging this."),
         ("ana", "Fair point on floats, I am dropping that idea.")]


def run(proposals, stances):
    return pipeline.analyze(norm(POSTS), "t", "", "", Scripted(proposals, stances))


def test_empty_statement_list_is_repaired_from_the_proposer():
    a = run([{"label": "Use integer cents for money", "proposer": 1, "statements": []}], [{"statement": 1, "stance": "support"}])
    assert [d.title for d in a.decisions] == ["Use integer cents for money"]
    assert a.stats["verifier"]["dropped"] == 0


def test_reactions_are_not_ideas():
    a = run([{"label": "Merge LGTM", "proposer": 3, "statements": [3]},
             {"label": "Agree on cents", "proposer": 1, "statements": [1]}], [])
    assert a.decisions == []
    assert a.stats["verifier"]["dropped_by_gate"]["not_an_idea"] == 2


def test_a_general_lgtm_cannot_close_an_idea_it_does_not_belong_to():
    proposals = [{"label": "Use floating point numbers", "proposer": 2, "statements": [2, 4]}]
    stances = [{"statement": 2, "stance": "support"}, {"statement": 3, "stance": "close_accept"},  # LGTM is not part of this idea
               {"statement": 4, "stance": "withdraw"}]
    a = run(proposals, stances)
    assert a.stats["verifier"]["dropped_by_gate"]["closing_signal_not_about_this_idea"] == 1
    assert a.decisions[0].status != "accepted"


def test_a_closing_signal_that_belongs_to_the_idea_counts():
    proposals = [{"label": "Use integer cents for money", "proposer": 1, "statements": [1, 3]}]
    stances = [{"statement": 1, "stance": "support"}, {"statement": 3, "stance": "close_accept"}]
    a = run(proposals, stances)
    assert a.decisions[0].status == "accepted"


def test_stance_trace_is_kept_for_transparency():
    a = run([{"label": "Use integer cents for money", "proposer": 1, "statements": [1]}], [{"statement": 1, "stance": "support"}])
    trace = a.stats["stance_trace"][0]
    assert trace["decision"] == "Use integer cents for money" and trace["stances"][0]["stance"] == "support"
