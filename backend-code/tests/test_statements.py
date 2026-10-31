from cypher.models import Comment
from cypher.statements import REASON_TEXT, is_bot, split_comment, split_text


def quotes(text):
    return [text[s:e] for s, e in split_text(text)]


def c(text):
    return Comment("c1", "1", "p", "2026-01-01T00:00:00Z", "PR #1 comment", "pr_comment", 1, "", text, "pr:1")


def test_sentences_keep_exact_offsets_and_skip_abbreviations_urls_versions():
    text = "We use e.g. Python 3.11 and v1.2.3. See https://example.com/a.b/c for details! Is it OK? Yes."
    assert quotes(text) == [
        "We use e.g. Python 3.11 and v1.2.3.", "See https://example.com/a.b/c for details!", "Is it OK?", "Yes."]


def test_code_blocks_and_quoted_replies_never_become_statements():
    assert quotes("Intro sentence.\n```python\nx = 1. y = 2\n```\nAfter code.") == ["Intro sentence.", "After code."]
    assert quotes("> old text. more\nMy reply is here.") == ["My reply is here."]
    assert quotes("[quote=\"bob\"]Old words here.[/quote]\nNew words here.") == ["New words here."]


def test_bullets_and_unicode():
    assert quotes("- first point\n- second point\n1. third point") == ["first point", "second point", "third point"]
    assert quotes("Café is nice. Привет мир.") == ["Café is nice.", "Привет мир."]


def test_split_comment_invariant_and_ids():
    comment = c("We should wait longer. LGTM, merging.")
    statements, reason = split_comment(comment)
    assert reason is None and [s.id for s in statements] == ["c1.s1", "c1.s2"]
    for s in statements:
        assert comment.text[s.start : s.end] == s.quote


def test_left_out_reasons():
    assert split_comment(c("+1"))[1] == "reaction_only"
    assert split_comment(c("\U0001F44D"))[1] == "reaction_only"
    assert split_comment(c("Thanks!"))[1] == "reaction_only"
    assert split_comment(c("> only a quote"))[1] == "no_quote"
    assert split_comment(c("```\ncode only\n```"))[1] == "no_quote"
    assert split_comment(c("Coverage is 91.2%."), bot=True)[1] == "bot"
    assert is_bot("github-actions[bot]") and is_bot("dependabot") and not is_bot("priya-n")
    assert set(REASON_TEXT) == {"no_quote", "reaction_only", "edited", "bot"}
