# Cypher: evidence-backed decisions from open-source discussions

Cypher reads the pull requests, issues, comments and commits of one repository (read-only) and recovers **what the team
decided, what it decided against, what it postponed and what is still open**, with the exact quote behind every claim.
Hacktoberfest 2026, Hack Day Sonipat, Problem 06 (project name in the hackathon: DecisionTrace).

The only AI model is **Gemma 4, running locally through Ollama**. No cloud AI, no fallback model, no embedding model.

## Quick start

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"          # the product itself needs no third-party packages
ollama serve                     # in another terminal
ollama pull gemma4:e2b
cypher doctor                    # checks Python, git, Ollama and the model
cypher analyze --fixture acme-httpcache     # read the invented sample project with real Gemma
cypher serve                     # API for the frontend on http://127.0.0.1:8000
```

Optional: put `GITHUB_TOKEN=...` (a read-only token) in `.env` to read real public repositories.
Sample projects (`acme/httpcache`, `acme/billing-api`) are invented, bundled in `fixtures/`, and work offline.

Tests: `pytest -q` (no network and no Ollama needed). Real-Gemma tests: `CYPHER_LIVE=1 pytest -q -m ollama`.

## How it works

1. **Fetch** pull requests, issues, issue comments, review comments and commits (GET requests only).
2. **Statements:** every comment is split into sentences with exact character offsets. `quote == text[start:end]` always.
   Quoted replies, code blocks, bot comments and reactions never become statements; comments that yield none are listed as
   *left out* with a plain reason and counted.
3. **Gemma (small windows):** for windows of at most 10 consecutive statements that contain a cue phrase, Gemma 4 returns only
   numbers and labels: which ideas appear (P1), how each statement stands on an idea (P2), whether two ideas are the same
   when plain text overlap is unsure (P3), and a short reason (P5). Gemma never writes quotes, names, dates or links.
4. **Verifier gates** drop and count anything unsupported: invalid JSON, invented statement numbers, malformed proposals,
   "ideas" that are really reactions (LGTM, agreed, merge), closing signals (approve, reject, postpone) that the model did not
   also list as part of the same idea, and reasons that do not share enough words with the statements they cite (then the
   quote itself is shown, shortened). Gemma's thinking mode is switched off for these small questions. The stance labels
   behind every status are kept in the analysis (`stats.stance_trace`) so a person can check them.
5. **Plain Python** decides: duplicate grouping (text overlap), status rules (the last decisive signal wins; when in doubt the
   status is `unresolved`), confidence (from counts, never from what the model says), timeline and people.
6. **People:** commit email, GitHub login and one other handle are merged with deterministic rules and a plain reason each;
   never by display name alone.
7. **Blind test:** `blind-run` analyzes a discussion and seals **Cypher's findings** (UTC time + SHA-256) without ever
   opening the maintainers' list; `blind-score` then re-checks the seal and opens the list.

Every Gemma answer is validated against a JSON schema and recorded in `.cypher/llm_cache/`, so a run can be replayed
(`CYPHER_LLM_MODE=replay`) quickly and identically.

## API (`cypher serve`)

| Endpoint | Status |
|---|---|
| `GET /api/health`, `GET /api/repos` | built |
| `POST /api/imports`, `GET /api/imports/{id}/summary` | built (runs in the background; poll the summary) |
| `GET /api/analyses/{id}` | built |
| `POST /api/analyses/{id}/blind/seal`, `.../blind/reveal` | built (seal first, then reveal) |
| `GET /api/analyses/{id}/files[/path]`, `.../people/{id}`, `.../people/{id}/split`, `.../undo-split` | **not built yet**: answer `501 {"error": "Not built yet"}` |

Field names match `frontend-final/src/types.ts`. Check with `cypher contract`.

## Limits (please read)

- Gemma 4 E2B is a small model. It can miss implicit or sarcastic rejections, mislabel stance in long multi-person
  arguments, and word reasons weakly. The verifier, the `unresolved` default and the left-out counts exist because of this.
  Duplicate grouping can merge two different ideas that use similar words; the app shows the grouped statements so a person can check.
- **Not built yet:** later-change tags (`Adjusted later`, `Undone later`) and the cross-PR effect timeline, decisions attached
  to lines of code, rename tracking (`git log --follow`), the `edited after fetching` left-out reason, PR review bodies,
  and the people detail/split endpoints. The frontend shows sample data for those pages until they exist.
- The short answer is built from templates around verified reasons, not free text from Gemma.
- Accuracy numbers on the invented sample project and toy discussion come from tiny test sets and the scripted test
  double. They say nothing about how well real Gemma does on real PEP discussions. Run the blind test on the organizers' data.
- The model may have seen famous PEPs during training. Ideas without a verified quote from the discussion are dropped.
- GitHub rate limits apply without a token; at most 10 pages (1,000 items) per list are read.

## Input formats for the blind test

Plain: `{"title": "...", "url": "...", "posts": [{"id": "1", "author": "ana", "date": "...", "url": "...", "text": "..."}]}`
Discourse topic JSON (`post_stream.posts[]` with `id`, `username`, `created_at`, `cooked` or `raw`). Maintainers' list:
`[{"idea": "...", "reason": "..."}]`.

```bash
cypher blind-run discussion.json
cypher blind-score discussion --gold maintainers_list.json
```

## Licence

MIT
