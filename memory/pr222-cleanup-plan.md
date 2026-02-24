# PR #222 Clean Reorg Plan

## Current State
- 22 Python files, 7 configs, 13 docs - too much clutter
- Duplicates from failed reorg attempts
- Unknown what's actually in PR

## Target: Clean, Essential Only

### Keep (Essential - ~12 files):
```
bench/
├── run_benchmark.py          # Main entry point
├── benchmark_supervisor.py   # Runs benchmarks
├── config_manager.py         # Config handling
├── routing_enforcer.py       # Feedback → routing rules
├── meta_harness_loop.py      # Self-optimizing loop
├── self_optimizing_policy.py # Policy decisions
├── harness_feedback_loop.py  # Feedback collection
├── baseline_tracker.py       # Tracks baseline
├── result_cache.py           # Caching
├── error_recovery.py         # Error handling
├── routing_config.json       # Routing rules
└── phase2_config.json       # Phase 2 config
```

### Delete (~30+ files):
- All test files (test_*.py, routing_test.py)
- All result/aggregate scripts
- All debug scripts
- Old docs (keep 1 README max)
- Duplicates

## Execution
1. Delete non-essential from local bench/
2. Commit clean state
3. Push to PR branch
4. Verify PR files

## Rules
- No secrets (paths are workspace-relative, not root)
- No openclaw-specific files
- One purpose: self-optimizing benchmark harness
