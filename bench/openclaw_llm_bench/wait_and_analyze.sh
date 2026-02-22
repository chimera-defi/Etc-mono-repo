#!/bin/bash

set -e

RESULTS="runs/20260214_093023/results.jsonl"
TARGET=209

echo "[$(date)] Waiting for benchmark completion..."
echo "Target: $TARGET result records"
echo ""

while true; do
    COUNT=$(grep -c '"record_type": "result"' "$RESULTS" 2>/dev/null || echo "0")
    PCT=$((COUNT * 100 / TARGET))
    
    if [ "$COUNT" -ge "$TARGET" ]; then
        echo ""
        echo "====================================="
        echo "✓ BENCHMARK COMPLETE!"
        echo "====================================="
        echo ""
        echo "Running analysis..."
        python3 generate_aggregate_summary.py 20260214_093023
        echo ""
        echo "✓ Analysis complete!"
        echo ""
        echo "Output files:"
        echo "  - runs/20260214_093023/summary.json"
        echo "  - runs/20260214_093023/ranking.md"
        echo "  - runs/20260214_093023/results.csv"
        echo "  - AGGREGATE_SUMMARY.md"
        break
    fi
    
    # Print progress every 11 records (roughly one model)
    if [ $((COUNT % 11)) -eq 0 ] && [ $COUNT -gt 0 ]; then
        MODELS=$((COUNT / 11))
        echo "[$(date '+%H:%M')] ${MODELS}/19 models | ${COUNT}/${TARGET} prompts (${PCT}%)"
    fi
    
    sleep 30
done
