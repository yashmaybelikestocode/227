"""Command line: cypher doctor | analyze | serve | blind-run | blind-score | contract."""
from __future__ import annotations

import argparse
import json
import shutil
import sys
from pathlib import Path

from . import api, blind, config, pipeline, sources
from .github_client import GitHubClient, GitHubError
from .llm import LLMError, OllamaLLM


def _doctor(_args) -> int:
    ok = True
    print(f"Python {sys.version.split()[0]}", "OK" if sys.version_info >= (3, 10) else "NEEDS 3.10 or newer")
    print("git", "found" if shutil.which("git") else "NOT FOUND (needed for the code view in a later stage)")
    print("GITHUB_TOKEN", "found" if config.github_token() else "not set (fine for sample projects; real repos hit GitHub's low limit)")
    try:
        llm = OllamaLLM()
    except LLMError as exc:
        print("Model:", exc)
        return 1
    info = llm.health()
    print(f"Ollama at {llm.url}:", "reachable" if info["ollama_reachable"] else "NOT reachable. Start it with: ollama serve")
    print(f"Model {llm.model}:", "present" if info.get("model_present") else f"NOT found. Run: ollama pull {llm.model}")
    print(f"LLM mode: {llm.mode} (live asks Gemma; replay only uses recorded answers)")
    ok = info["ollama_reachable"] and info.get("model_present", False)
    return 0 if ok else 1


def _load(args):
    if args.discussion:
        return sources.load_discussion(Path(args.discussion)), Path(args.discussion).stem
    fixture = args.fixture or (sources.fixture_for_repo(args.repo) if args.repo else None)
    if fixture:
        raw = sources.load_fixture(fixture)
        return sources.normalize(raw), raw.repo
    if args.repo:
        since = api.since_from_range(args.range)
        raw = GitHubClient(cache_dir=config.data_dir() / "http_cache").fetch_repo(args.repo, since)
        return sources.normalize(raw, since), args.repo
    raise SystemExit("Give --fixture NAME, --repo owner/name or --discussion FILE.")


_last_line = [""]


def _progress(summary):
    done = sum(1 for s in summary.steps if s.state in ("done", "skipped"))
    working = [s for s in summary.steps if s.state == "working"]
    if not working and not summary.done:
        return
    label = working[0].label if working else "finished"
    count = f" ({working[0].count} windows sent to Gemma so far)" if working and working[0].key == "find" and working[0].count is not None else ""
    line = f"  step {done}/{len(summary.steps)}: {label}{count}"
    if line != _last_line[0]:
        _last_line[0] = line
        print(line, flush=True)


def _analyze(args) -> int:
    norm, repo = _load(args)
    llm = OllamaLLM()
    print(f"Reading {repo} with {llm.model} ({llm.mode})")
    analysis = pipeline.analyze(norm, repo, args.question or "", args.range or "", llm, progress=_progress,
                                analysis_id=args.id)
    analysis.stats["fixture"] = args.fixture or ""
    api.save_analysis(analysis)
    if args.out:
        from .models import to_dict
        Path(args.out).parent.mkdir(parents=True, exist_ok=True)
        Path(args.out).write_text(json.dumps(to_dict(analysis), indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"Also wrote {args.out}")
    s = analysis.summary
    print(f"\nRead {s.prs} pull requests, {s.issues} issues, {s.comments} comments and {s.commits} commits.")
    print(f"Found {s.statements_used} statements with an exact quote. {s.statements_left_out} were left out.")
    for d in analysis.decisions:
        print(f"  [{d.status:10}] {d.title}  ({d.grouped_count} statements, {d.confidence})")
    print("Model calls:", analysis.stats["live_calls"], "live,", analysis.stats["cache_hits"], "from the recorded cache.")
    print("Verifier:", analysis.stats["verifier"])
    print(f"Saved .cypher/analyses/{analysis.id}.json")
    return 0


def _blind_run(args) -> int:
    norm = sources.load_discussion(Path(args.discussion))
    llm = OllamaLLM()
    analysis = pipeline.analyze(norm, norm.title, "", "", llm, progress=_progress, analysis_id=Path(args.discussion).stem)
    record = blind.seal(Path(args.discussion).stem, blind.predictions_from(analysis))
    print(f"Sealed {len(record['predictions'])} rejected ideas at {record['saved_at']}")
    print("Fingerprint:", record["fingerprint"])
    return 0


def _blind_score(args) -> int:
    gold, raw = blind.load_gold(Path(args.gold))
    llm = None
    try:
        llm = OllamaLLM()
    except LLMError:
        pass
    result = blind.score(args.name, gold, llm=llm, gold_bytes=raw)
    out = config.out_dir()
    from .models import to_dict
    (out / f"blind_score_{args.name}.json").write_text(json.dumps(to_dict(result), indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Accuracy {result.accuracy_percent}%  Precision {result.precision_percent}%  (found {result.found} of {result.official})")
    return 0


def _contract(args) -> int:
    from .contract import check
    problems = check(Path(args.types))
    if not problems:
        print("The backend sends every field the frontend types ask for.")
        return 0
    print("Differences found:")
    for p in problems:
        print(" -", p)
    return 1


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(prog="cypher", description="Evidence-backed decisions from open-source discussions (local Gemma 4).")
    sub = parser.add_subparsers(dest="cmd", required=True)
    sub.add_parser("doctor", help="check Python, git, Ollama and the model").set_defaults(fn=_doctor)
    p = sub.add_parser("analyze", help="read a project and find decisions")
    p.add_argument("--fixture"), p.add_argument("--repo"), p.add_argument("--discussion"), p.add_argument("--question")
    p.add_argument("--range"), p.add_argument("--id"), p.add_argument("--out", help="also write the analysis JSON here")
    p.set_defaults(fn=_analyze)
    p = sub.add_parser("serve", help="start the API for the frontend")
    p.add_argument("--port", type=int, default=8000)
    p.set_defaults(fn=lambda a: api.serve(a.port) or 0)
    p = sub.add_parser("blind-run", help="analyze a discussion and seal Cypher's findings (never opens the maintainers' list)")
    p.add_argument("discussion")
    p.set_defaults(fn=_blind_run)
    p = sub.add_parser("blind-score", help="open the maintainers' list and score the sealed findings")
    p.add_argument("name"), p.add_argument("--gold", required=True)
    p.set_defaults(fn=_blind_score)
    p = sub.add_parser("contract", help="compare backend fields with the frontend's types.ts")
    p.add_argument("--types", default="frontend-final/src/types.ts")
    p.set_defaults(fn=_contract)
    args = parser.parse_args(argv)
    try:
        return args.fn(args)
    except (LLMError, GitHubError, FileNotFoundError, ValueError) as exc:
        print("Error:", exc, file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
