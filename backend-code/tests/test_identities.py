from cypher import identities
from cypher.sources import AuthorRef, CommitInfo


def commit(login, email, name, date="2026-01-01"):
    return CommitInfo("abc", date, AuthorRef(login, name, email))


def test_commit_email_joins_github_login_and_side_file_adds_other_handle():
    commits = [commit("priya-n", "priya@acme.dev", "Priya Nair"), commit("priya-n", "old@lab.edu", "P. Nair")]
    side = [{"login": "priya-n", "name": "Priya N.", "other": "Discourse: priya_n"}]
    people, mapping = identities.resolve({"c1": AuthorRef(login="priya-n")}, commits, side, {"c1": "2026-02-01"})
    assert len(people) == 1
    p = people[0]
    assert p.display_name == "Priya N." and mapping["c1"] == p.id
    assert {(i.kind, i.value) for i in p.identities} == {
        ("github_login", "priya-n"), ("commit_email", "priya@acme.dev"), ("commit_email", "old@lab.edu"),
        ("other_handle", "Discourse: priya_n")}
    reasons = {i.value: i.merged_because for i in p.identities}
    assert reasons["priya@acme.dev"] == "Same commit as the GitHub account"
    assert reasons["Discourse: priya_n"] == "Listed in the project's identity file"
    assert p.commits == 2 and p.comments == 1


def test_noreply_email_joins_login_with_its_own_reason():
    commits = [commit("elenar", "4410+elenar@users.noreply.github.com", "Elena")]
    people, _ = identities.resolve({}, commits, [], {})
    assert people[0].identities[0].merged_because == "GitHub private email for this account"


def test_never_merge_on_a_display_name_alone():
    commits = [commit(None, "sam@one.org", "Sam Lee"), commit(None, "sam@two.org", "Sam Lee")]
    people, _ = identities.resolve({}, commits, [], {})
    assert len(people) == 2


def test_same_email_on_two_logins_joins_them():
    commits = [commit("a1", "shared@x.org", "A"), commit("a2", "shared@x.org", "A")]
    people, _ = identities.resolve({}, commits, [], {})
    assert len(people) == 1 and {i.value for i in people[0].identities if i.kind == "github_login"} == {"a1", "a2"}
