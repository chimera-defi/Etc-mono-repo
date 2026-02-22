# Comprehensive Benchmark In Progress

**Start Time:** Saturday, 2026-02-14 09:25 GMT+1  
**Status:** 🔄 Running (Est. completion: ~12:00–13:00 GMT+1, 3–4 hours from start)

---

## Task

Comprehensive benchmark of all 19 Ollama models against 11 canonical prompts (P0–P10).

### Models Being Tested
1. smollm:1.7b
2. tinyllama:1.1b
3. phi:latest
4. mistral:7b
5. qwen2.5:14b
6. gemma2:9b
7. gpt-oss:latest
8. glm-4.7-flash:latest
9. qwen3:14b
10. devstral-small-2:latest
11. mistral-small3.2:latest
12. ministral-3:latest
13. qwen3:8b
14. glm4:9b-chat-q4_K_M
15. phi3:3.8b
16. gemma2:2b
17. llama3.2:3b
18. qwen2.5:3b
19. qwen3:4b

### Prompt Suite (11 total)
- **P0**: Heartbeat sanity (exact match)
- **P1**: Router JSON (JSON validation)
- **P2**: One-sentence summary (max-sentences)
- **P3**: Single token choice (high/low)
- **P4**: Extract integer (regex)
- **P5**: Rewrite short (max-words)
- **P6**: Exact three bullets (structure)
- **P7**: Typed JSON (type validation)
- **P8**: Yes/no (choice)
- **P9**: ISO date (exact format)
- **P10**: Complex multi-part operator prompt (noop)

---

## Execution Infrastructure

### Running Processes
- **Primary benchmark:** `run_bench.py --targets ollama --run-id untested_models_comprehensive_2026_02_14 --resume`
  - Sequential execution (1 model at a time)
  - Avoiding GPU/CPU contention
  
- **Finalization monitor:** `finalize_and_report.py`
  - Waits for primary benchmark to complete
  - Auto-generates all reports (CSV, JSON, Markdown)
  - Updates aggregate summary

- **Progress monitors:** Multiple scripts tracking completion %

### Output Location
```
/root/.openclaw/workspace/dev/Etc-mono-repo/bench/openclaw_llm_bench/runs/
  ├── untested_models_comprehensive_2026_02_14/     (Primary run)
  │   ├── results.jsonl                             (Raw results)
  │   ├── results_comprehensive.csv                 (Will be generated)
  │   ├── metrics_comprehensive.json                (Will be generated)
  │   ├── COMPREHENSIVE_RESULTS.md                  (Will be generated)
  │   └── config.json, inventory.json, resources_*
  └── AGGREGATE_SUMMARY.md                          (Will be updated)
```

---

## Expected Data Collection

### Per Prompt (× 19 models × 11 prompts = 209 rows)
- Model name
- Prompt ID & name
- E2E latency (milliseconds)
- Success flag (valid parse)
- Objective pass flag (validator rules)
- Failure type (if applicable)
- Output length
- Raw output
- Parsed output
- Tool calls (if any)

### Per Model Aggregate
- Total tests (11)
- Success count & rate (%)
- Objective pass count & rate (%)
- Latency: mean, p50, p95, p99 (ms)
- Error taxonomy (breakdown of failure types)
- Average output length (chars)

---

## Report Format

### 1. CSV (`results_comprehensive.csv`)
209 rows × 8 columns:
- model, prompt_id, prompt_name, e2e_ms, success, objective_pass, failure_type, output_length

### 2. JSON (`metrics_comprehensive.json`)
Per-model summary:
```json
{
  "qwen2.5:3b": {
    "total_tests": 11,
    "success_count": 10,
    "success_rate_percent": 90.9,
    "objective_pass_count": 9,
    "objective_pass_rate_percent": 81.8,
    "latency": {
      "mean_ms": 1234.5,
      "p50_ms": 1100,
      "p95_ms": 2500,
      "p99_ms": 3000
    },
    "avg_output_length": 156.4,
    "error_taxonomy": {
      "json_parse_error": 1
    }
  }
}
```

### 3. Markdown (`COMPREHENSIVE_RESULTS.md`)
- Rankings table (best→worst by success rate)
- Categories: high (≥80%), medium (50–80%), low (<50%)
- Hidden gems (good efficiency despite lower success)
- Per-model details with error breakdowns

### 4. Aggregate (`AGGREGATE_SUMMARY.md`)
- Merged results from all historical + new runs
- Global rankings across all iterations

---

## Key Metrics

- **Success Rate %:** Percentage of prompts with valid parseable responses
- **Objective Pass Rate %:** Percentage of prompts satisfying validator rules
- **Latency Percentiles:** 50th, 95th, 99th percentile response times
- **Error Taxonomy:** Classification of failure modes (json_parse_error, key_rule_failed, etc.)

---

## Execution Strategy

1. **Sequential by model** - Run all 11 prompts for model 1, then model 2, etc. (avoids GPU/CPU contention)
2. **Resume capability** - If interrupted, `--resume` flag skips already-completed cells
3. **Resource tracking** - Capture RAM/CPU/disk before/after each model block
4. **Timeout handling** - Generous 300-second timeout per prompt for slower models

---

## Next Steps (Post-Completion)

1. ✅ Benchmark execution (in progress)
2. ✅ Report generation (automatic via finalization script)
3. ⏳ Merge into AGGREGATE_SUMMARY.md
4. ⏳ Identify hidden gems (good latency + moderate success)
5. ⏳ Generate production recommendations by tier

---

## Monitoring

Real-time progress can be checked with:
```bash
python3 monitor_progress.py /root/.openclaw/workspace/dev/Etc-mono-repo/bench/openclaw_llm_bench/runs/untested_models_comprehensive_2026_02_14
```

Expected output at various completion milestones:
- **25% (55 tests):** ~6–8 models started
- **50% (105 tests):** ~10 models completed
- **75% (157 tests):** ~17 models completed
- **100% (209 tests):** All complete, reports auto-generated

---

## Troubleshooting

If benchmark stalls:
- Check `/proc/<pid>` for main process
- Check results.jsonl for recent timestamp
- Review run logs for error messages
- Verify Ollama server is responsive: `curl http://localhost:11434/v1/models`

---

**This document auto-updates as benchmark progresses.**
