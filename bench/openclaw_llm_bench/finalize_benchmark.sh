#!/bin/bash
# Finalize comprehensive benchmark and generate all reports
set -euo pipefail

RUN_FOLDER="${1:-.}"
BENCH_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Finalizing Comprehensive Benchmark ==="
echo "Run folder: $RUN_FOLDER"

# Check if results exist
RESULTS_JSONL="$RUN_FOLDER/results.jsonl"
if [ ! -f "$RESULTS_JSONL" ]; then
    echo "Error: $RESULTS_JSONL not found"
    exit 1
fi

# Count tests
TOTAL_TESTS=$(grep -c '"record_type": "result"' "$RESULTS_JSONL" || true)
echo "Total tests in results.jsonl: $TOTAL_TESTS"

# Run analysis
echo "Generating comprehensive analysis..."
python3 "$BENCH_DIR/analyze_comprehensive.py" "$RUN_FOLDER"

# Run aggregate
echo "Updating aggregate summary..."
python3 "$BENCH_DIR/aggregate_runs.py"

echo "=== Benchmark Finalization Complete ==="
echo "Output files:"
echo "  - $RUN_FOLDER/results_comprehensive.csv"
echo "  - $RUN_FOLDER/metrics_comprehensive.json"
echo "  - $RUN_FOLDER/COMPREHENSIVE_RESULTS.md"
echo "  - $BENCH_DIR/runs/AGGREGATE_SUMMARY.md"
