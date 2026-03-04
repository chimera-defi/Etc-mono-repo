# PR245 Reproducibility Guide

This document reproduces the benchmark/fallback packaging work for PR #245 without fabricating new benchmark claims.

## Scope

- Captures run-time environment and git state
- Captures local Ollama model inventory (`ollama list` or local API fallback)
- Generates manifests under `bench/repro/manifests/`
- Generates SHA256 checksums under `bench/repro/checksums/`
- Optionally runs a minimal smoke benchmark (`--smoke`)

## Prerequisites

From repository root:

```bash
command -v bash git sha256sum >/dev/null
```

For model inventory (at least one must work):

```bash
command -v ollama >/dev/null
# or local API reachable:
curl -fsS http://127.0.0.1:11434/api/tags >/dev/null
```

Optional smoke benchmark:

- `python3`
- Local Ollama server reachable
- At least one local model available in `ollama list`

## Steps

1. Run packaging only:

```bash
bash bench/ops/reproduce_pr245.sh
```

2. Run packaging + smoke benchmark:

```bash
bash bench/ops/reproduce_pr245.sh --smoke
```

3. Review generated artifacts:

```bash
ls -la bench/repro/manifests
ls -la bench/repro/checksums
cat bench/repro/manifests/run_manifest_pr245.json
cat bench/repro/checksums/sha256sums.txt
```

## Output Files

Generated locally by the script (not intended to be committed):

- `bench/repro/manifests/env_manifest.json`
- `bench/repro/manifests/run_manifest_pr245.json`
- `bench/repro/manifests/model_inventory_pr245.json`
- `bench/repro/manifests/git_status_pr245.txt`
- `bench/repro/manifests/git_diff_stat_pr245.txt`
- `bench/repro/checksums/sha256sums.txt`

If a fallback trace artifact exists in `bench/`, the script records it and includes it in the run manifest/checksums.
