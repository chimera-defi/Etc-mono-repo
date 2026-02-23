# Token Rate Benchmark Harness

A lightweight Python harness for benchmarking token throughput and latency across different LLM providers.

## Quick Start

```bash
# Install dependencies
pip install aiohttp

# Run benchmark with OpenRouter (Auto)
python token_benchmark.py --mode openrouter --concurrency 1

# Run benchmark with local Minimax M2.5
python token_benchmark.py --mode minimax --concurrency 1

# Run with specific number of prompts
python token_benchmark.py --mode openrouter --concurrency 5 --prompts 10

# Save results to file
python token_benchmark.py --mode openrouter --output results.json
```

## Configuration

### Environment Variables
- `OPENROUTER_API_KEY` - API key for OpenRouter (required for openrouter mode)

### Command Line Options
- `--mode` - API mode: `openrouter` or `minimax` (default: openrouter)
- `--concurrency` - Number of concurrent requests (default: 1)
- `--prompts` - Number of prompts to run (default: all ~30)
- `--output` - Output JSON file path (optional)
- `--api-key` - Override API key (or use env var)

## Output Format

The benchmark outputs JSON with:
- **Summary stats**: avg latency, tokens/sec, p50/p95 latency
- **Per-prompt results**: timestamps, token counts, errors

```json
{
  "mode": "openrouter",
  "concurrency": 1,
  "num_prompts": 30,
  "successful_runs": 30,
  "avg_latency_ms": 1234.5,
  "avg_tokens_per_second": 45.6,
  "p50_latency_ms": 1200.0,
  "p95_latency_ms": 1500.0,
  "results": [...]
}
```

## Prompt Set

The harness includes ~30 representative prompts across categories:
- Simple factual questions
- Reasoning tasks
- Coding tasks
- Writing tasks
- Creative tasks
- Opinions/analysis
- Comparisons
- Technical explanations

## Testing Different Concurrency Levels

```bash
# Sequential (baseline)
python token_benchmark.py --mode openrouter --concurrency 1

# Moderate concurrency
python token_benchmark.py --mode openrouter --concurrency 5

# High concurrency
python token_benchmark.py --mode openrouter --concurrency 10
```
