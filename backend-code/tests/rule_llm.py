"""A SCRIPTED STAND-IN for Gemma, used only in tests. It is NOT a model and is never used by the product.
It follows simple keyword rules on the invented sample projects so the pipeline can be tested offline."""
import re

from cypher.textutil import jaccard, tokens

APPROACHES = [
    ("Use an outside retry library", r"outside (retry )?librar|tenacity|external dependency|on the library"),
    ("Wait longer after each failed try", r"wait longer|doubl|exponential|grow after each|breathing room"),
    ("Add a small random delay", r"random delay|jitter"),
    ("Let users choose how many tries", r"choose how many|how many tries|configurat"),
    ("Retry health checks too", r"retry health checks|retrying health checks"),
    ("Fail health checks fast without retrying", r"fail fast"),
    ("Cap total retry wait", r"caps? backoff|total wait|10 seconds total"),
    ("Store money as integer cents", r"integer cents"),
    ("Use floating point numbers for prices", r"floating point"),
    ("Reuse the existing with keyword", r"with keyword"),
    ("Add a new keyword for the syntax", r"new keyword|syntax change"),
]
PROPOSAL = re.compile(r"should|how about|let us|let's|we need|added|caps|moved|i also retry|maybe use|propos|instead", re.I)
GENERIC = re.compile(r"lgtm|merging|approved|fair point|against it|wait until|dropping that idea", re.I)


def _matches(text):
    return [label for label, rx in APPROACHES if re.search(rx, text, re.I)]


def _stance(text):
    s = text.lower()
    if re.search(r"before adding|clear configuration design", s):
        return "neutral"
    if re.search(r"dropping that idea|withdraw|fair point", s):
        return "withdraw"
    if re.search(r"rejecting|rejected|not keeping", s):
        return "close_reject"
    if re.search(r"lgtm|merging|approved", s):
        return "close_accept"
    if re.search(r"wait until|for now|postpone|can come later|revisit it later", s):
        return "defer"
    if re.search(r"-1|unnecessary|not worth|adds a dependency|too much overhead|against it|would break", s):
        return "oppose"
    if re.search(r"\+1|agree|solid first step|we should|we need|how about|should we|added|i also retry|caps|propos", s):
        return "support"
    return "neutral"


def _attach(quotes, comments):
    """For each statement index return the approach it talks about (generic closers attach to the previous match)."""
    owner = {}
    last_overall = None
    last_in_comment = {}
    for i, q in enumerate(quotes):
        found = _matches(q)
        if found:
            owner[i] = found[0]
            last_overall = found[0]
            last_in_comment[comments[i]] = found[0]
        elif GENERIC.search(q):
            target = last_in_comment.get(comments[i]) or last_overall
            if target:
                owner[i] = target
    return owner


class RuleLLM:
    model = "scripted-test-model"
    mode = "test"
    live_calls = 0
    cache_hits = 0

    def __init__(self):
        self.calls = []

    def call(self, name, system, user, schema, payload=None):
        self.calls.append(name)
        if name == "find_proposals":
            quotes, comments = payload["statements"], payload["comments"]
            owner = _attach(quotes, comments)
            out = []
            for label, _ in APPROACHES:
                idxs = [i for i, lab in owner.items() if lab == label]
                proposals = [i for i in idxs if PROPOSAL.search(quotes[i]) and _matches(quotes[i])]
                if proposals:
                    out.append({"label": label, "proposer": proposals[0] + 1, "statements": [i + 1 for i in sorted(idxs)]})
            return {"approaches": out}
        if name == "stance":
            quotes, comments, label = payload["statements"], payload["comments"], payload["label"]
            owner = _attach(quotes, comments)
            return {"stances": [{"statement": i + 1, "stance": _stance(quotes[i])} for i, lab in sorted(owner.items()) if lab == label]}
        if name == "same_idea":
            return {"same": jaccard(tokens(payload["a"]), tokens(payload["b"])) >= 0.75}  # strict, like a careful model
        if name == "reason":
            quotes = payload["statements"]
            return {"reason": " ".join(quotes[0].split()[:20]), "statements": [1]}
        if name == "judge_match":
            return {"match": jaccard(tokens(payload["predicted"]), tokens(payload["official"])) >= 0.3}
        raise AssertionError(f"unknown call {name}")
