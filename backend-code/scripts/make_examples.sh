#!/usr/bin/env bash
# Produces the examples/ outputs with the REAL local Gemma 4. Needs: ollama serve + ollama pull gemma4:e2b.
set -euo pipefail
cd "$(dirname "$0")/.."
cypher doctor
cypher analyze --fixture acme-httpcache --question "Why do we retry failed requests?" --range "Last 6 months" \
  --id httpcache-analysis --out examples/output/analysis.json
rm -f .cypher/sealed/toy_discussion.json            # allow a fresh blind run
cypher blind-run eval/toy_discussion.json            # seals Cypher's findings first
cypher blind-score toy_discussion --gold eval/toy_gold.json
echo "Done. See examples/output/ and tell the team which mode produced it (live Gemma)."
