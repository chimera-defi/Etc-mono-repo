# Token Rate Benchmark Results

**Date:** 2026-02-23  
**Benchmark Tool:** token_benchmark.py (updated)

## Changes Made

1. **Updated Minimax API Configuration:**
   - Changed API base URL from `http://localhost:8000/v1` to `https://api.minimax.io/v1`
   - Updated model name from `minimax/MiniMax-M2.5` to `MiniMax-M2.5`
   - Added support for `MINIMAX_API_KEY` environment variable
   - Added Authorization header support for Minimax API calls

2. **API Key Configuration:**
   - OpenRouter: Uses `OPENROUTER_API_KEY` environment variable
   - Minimax: Uses `MINIMAX_API_KEY` environment variable

## ⚠️ API Keys Required

Both required API keys are **NOT available** in the current environment:

| Provider | Environment Variable | Status |
|----------|---------------------|--------|
| OpenRouter | `OPENROUTER_API_KEY` | ❌ Not set |
| Minimax | `MINIMAX_API_KEY` | ❌ Not set |

The API keys in `/root/.openclaw/openclaw.json` are redacted (shown as `__OPENCLAW_REDACTED__`).

## How to Run Benchmarks

To run the benchmarks, set the API keys as environment variables:

```bash
# OpenRouter benchmarks
cd /root/.openclaw/workspace/bench/token_benchmark
OPENROUTER_API_KEY=<your_key> python token_benchmark.py --mode openrouter --concurrency 1 --output results/openrouter_c1.json
OPENROUTER_API_KEY=<your_key> python token_benchmark.py --mode openrouter --concurrency 2 --output results/openrouter_c2.json
OPENROUTER_API_KEY=<your_key> python token_benchmark.py --mode openrouter --concurrency 4 --output results/openrouter_c4.json
OPENROUTER_API_KEY=<your_key> python token_benchmark.py --mode openrouter --concurrency 8 --output results/openrouter_c8.json

# Minimax benchmarks
MINIMAX_API_KEY=<your_key> python token_benchmark.py --mode minimax --concurrency 1 --output results/minimax_c1.json
MINIMAX_API_KEY=<your_key> python token_benchmark.py --mode minimax --concurrency 2 --output results/minimax_c2.json
MINIMAX_API_KEY=<your_key> python token_benchmark.py --mode minimax --concurrency 4 --output results/minimax_c4.json
MINIMAX_API_KEY=<your_key> python token_benchmark.py --mode minimax --concurrency 8 --output results/minimax_c8.json
```

## Expected Results Structure

Once API keys are provided, results will include:

| Mode | Concurrency | Successful | Avg Latency (ms) | Avg TPS | P50 (ms) | P95 (ms) |
|------|-------------|------------|------------------|---------|----------|----------|
| openrouter | 1 | ? | ? | ? | ? | ? |
| openrouter | 2 | ? | ? | ? | ? | ? |
| openrouter | 4 | ? | ? | ? | ? | ? |
| openrouter | 8 | ? | ? | ? | ? | ? |
| minimax | 1 | ? | ? | ? | ? | ? |
| minimax | 2 | ? | ? | ? | ? | ? |
| minimax | 4 | ? | ? | ? | ? | ? |
| minimax | 8 | ? | ? | ? | ? | ? |

---

## Output Files

All results should be saved to `results/` directory:
- `openrouter_c1.json`, `openrouter_c2.json`, `openrouter_c4.json`, `openrouter_c8.json`
- `minimax_c1.json`, `minimax_c2.json`, `minimax_c4.json`, `minimax_c8.json`
- `SUMMARY.md` (this file)
