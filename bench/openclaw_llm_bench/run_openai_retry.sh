#!/bin/bash
# Run OpenAI Codex benchmark with exponential backoff retry logic
# This script retries rate-limited requests with exponential backoff
# 
# Usage:
#   export OPENAI_API_KEY="your-api-key-here"
#   ./run_openai_retry.sh
#
# Or pass API key as argument:
#   ./run_openai_retry.sh "your-api-key-here"

set -e

API_KEY="${1:-${OPENAI_API_KEY}}"

if [ -z "$API_KEY" ]; then
    echo "❌ Error: OPENAI_API_KEY not set"
    echo "Usage: export OPENAI_API_KEY='...' && $0"
    echo "   or: $0 'your-api-key'"
    exit 1
fi

cd "$(dirname "$0")"

echo "Starting OpenAI Codex benchmark with exponential backoff retry..."
echo "  - Config: gpt-5-codex (high/low thinking)"
echo "  - Config: openai-codex/gpt-5.3-codex (high/low thinking)"
echo "  - Retry: Exponential backoff (1s, 2s, 4s, 8s, 16s)"
echo "  - Respects Retry-After header"
echo ""

export OPENAI_API_KEY="$API_KEY"

RUN_ID="openai_retry_phase2a_$(date +%Y-%m-%d_%H%M%S)"

python3 run_bench.py \
  --run-id "$RUN_ID" \
  --targets "openai_responses" \
  --openai-model "gpt-5-codex" \
  --timeout-s 300 \
  --resume

echo ""
echo "✓ Benchmark run complete: runs/$RUN_ID/"
echo "  - Check: runs/$RUN_ID/summary.md"
echo "  - Results: runs/$RUN_ID/results.jsonl"
