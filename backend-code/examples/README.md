# Examples

| File | What it is | Produced by |
|---|---|---|
| `input/toy_discussion.json` | A tiny **invented** discussion (not a real PEP) in the plain format | hand-written |
| `output/analysis_SCRIPTED_STANDIN_not_gemma.json` | The analysis of the sample project `acme-httpcache` | **a scripted keyword stand-in used by the tests, not Gemma** |
| `output/analysis.json` | The same analysis | **live Gemma 4** (created by `scripts/make_examples.sh`) |
| `output/blind_score_toy_discussion.json` | Blind-test score for the toy discussion | **live Gemma 4** (created by `scripts/make_examples.sh`) |

The first two rows exist so the folder is never empty. Replace them with real output before you submit:

```bash
ollama serve                  # in another terminal
ollama pull gemma4:e2b
scripts/make_examples.sh      # writes analysis.json and the blind score
```

Delete `analysis_SCRIPTED_STANDIN_not_gemma.json` once the real files exist. Anything produced by the stand-in carries
`"model": "scripted-test-model"` in its `stats`, so it can never be mistaken for Gemma.
