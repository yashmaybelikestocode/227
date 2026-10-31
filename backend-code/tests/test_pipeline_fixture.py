from cypher import pipeline, sources
from cypher.models import to_dict


def run(llm, name="acme-httpcache"):
    raw = sources.load_fixture(name)
    return pipeline.analyze(sources.normalize(raw), raw.repo, "Why do we retry failed requests?", "Last 6 months", llm)


def test_four_statuses_and_grouping(llm):
    a = run(llm)
    by_title = {d.title: d for d in a.decisions}
    assert by_title["Wait longer after each failed try"].status == "accepted"
    assert by_title["Use an outside retry library"].status == "rejected"
    assert by_title["Add a small random delay"].status == "deferred"
    assert by_title["Let users choose how many tries"].status == "unresolved"
    lib = by_title["Use an outside retry library"]
    kinds = {next(c.kind for c in a.comments if c.id == s.comment_id) for s in a.statements if s.id in lib.statement_ids}
    assert lib.grouped_count >= 3 and len(kinds) >= 2  # same idea stated in an issue, a PR comment and a review comment
    assert [d.status for d in a.decisions] == sorted((d.status for d in a.decisions), key=["accepted", "rejected", "deferred", "unresolved"].index)


def test_every_quote_is_exact_and_every_claim_points_to_real_statements(llm):
    a = run(llm)
    comments = {c.id: c for c in a.comments}
    ids = {s.id for s in a.statements}
    for s in a.statements:
        assert comments[s.comment_id].text[s.start : s.end] == s.quote
    claims = [d.reason for d in a.decisions] + a.short_answer + [t.text for t in a.timeline]
    for claim in claims:
        assert claim.statement_ids and set(claim.statement_ids) <= ids
    for d in a.decisions:
        assert set(d.statement_ids) <= ids


def test_statement_belongs_to_one_decision_and_counts_match(llm):
    a = run(llm)
    owners = {}
    for d in a.decisions:
        for sid in d.statement_ids:
            owners.setdefault(sid, []).append(d.id)
    assert all(len(v) == 1 for v in owners.values())
    for s in a.statements:
        if s.decision_id:
            assert s.decision_id in {d.id for d in a.decisions}
    assert a.summary.statements_used == len(a.statements)
    assert a.summary.statements_left_out == len(a.left_out) >= 5
    assert a.summary.done is True
    assert {x.reason for x in a.left_out} >= {"The comment was only a reaction", "The comment was written by a bot", "No exact quote could be found"}


def test_people_are_merged_not_duplicated(llm):
    a = run(llm)
    names = [p.display_name for p in a.people]
    assert len(names) == len(set(names))
    priya = next(p for p in a.people if p.display_name == "Priya N.")
    kinds = {i.kind for i in priya.identities}
    assert kinds == {"commit_email", "github_login", "other_handle"}
    assert len([i for i in priya.identities if i.kind == "commit_email"]) == 2
    assert any(p.display_name == "Casey Dev" for p in a.people)  # never merged by name alone
    assert all(c.person_id for c in a.comments)


def test_stage_one_has_no_later_changes_and_json_is_plain(llm):
    a = run(llm)
    assert all(d.later_changes == [] for d in a.decisions)
    import json
    json.dumps(to_dict(a))  # must be serialisable


def test_other_sample_project(llm):
    a = run(llm, "acme-billing-api")
    statuses = {d.title: d.status for d in a.decisions}
    assert statuses["Store money as integer cents"] == "accepted"
    assert statuses["Use floating point numbers for prices"] == "rejected"
