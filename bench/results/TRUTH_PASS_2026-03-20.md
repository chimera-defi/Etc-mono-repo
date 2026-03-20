# Truth Pass Report — 2026-03-20

## Scope

A stricter validation pass was requested after the architecture/north-star refactor.

- Canonical managed run: `bench/selfopt/benchmark_supervisor.py`
- Freshness: cache cleared before run (`bench/.cache/*.json`)
- Additional explicit local-model verification for GLM: direct runner, non-cached, non-saved

## Canonical supervisor run

- **Run ID:** `09bac3c467`
- **Manifest:** `bench/supervisor_runs/09bac3c467/manifest.json`
- **Summary:** `bench/supervisor_runs/09bac3c467/summary.json`
- **Route report:** `python3 bench/ops/route_trace_report.py --one-line`

### Result (managed)
- `lfm2.5-thinking:1.2b` atomic/atomic: **11/12 (91.7%)**, failed: `P10`
- Attribution: `served_by=lfm2.5-thinking:1.2b`, `fallback_used=false`
- Cache signal from job output: **Hits 0 / Misses 1**

## Targeted GLM verification (explicit local check)

Because GLM is not in current supervisor default truth-refresh matrix, GLM was validated via direct canonical runner command:

```bash
python3 bench/core/run_benchmark.py glm-4.7-flash:latest atomic atomic --no-cache --no-save --timeout 90 --max-retries 1
```

### Result (direct, non-cached)
- `glm-4.7-flash:latest` atomic/atomic: **9/12 (75.0%)**, failed: `P7,P10,P12`

## Operational cleanup verification

After completion:

```bash
ollama stop glm-4.7-flash:latest
ollama stop lfm2.5-thinking:1.2b
ollama ps
```

Final state: **no active loaded model runners**.

## Notes

- This report distinguishes managed canonical evidence (supervisor run artifacts) from targeted direct-model verification.
- Smoke/preflight runs remain non-canonical benchmark truth unless intentionally promoted through canonical managed flow.
