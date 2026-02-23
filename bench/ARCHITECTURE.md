# Self-Optimizing Benchmark Architecture

## Overview

The self-optimizing benchmark system automatically improves model performance through continuous feedback loops.

## Components

### 1. run_benchmark.py
Core benchmark runner - executes prompts against models, records results.

### 2. benchmark_supervisor.py
Orchestrates multiple benchmark runs, aggregates results, detects variance.

### 3. meta_harness_loop.py
Main loop that runs improvement cycles:
1. Run benchmark → Detect variance → Apply policy gates → Generate recommendations → Enforce routing → Repeat

### 4. self_optimizing_policy.py
Decision gates:
- Restraint floor (safety)
- Variance threshold
- Regression detection
- Extended phase minimum accuracy

### 5. harness_feedback_loop.py
Generates recommendations based on results:
- Which models to use for which phases
- Warm-up requirements
- Fallback strategies

### 6. routing_enforcer.py
Applies routing rules automatically:
- Routes models to appropriate phases
- Falls back to backup models when needed
- Logs all decisions

### 7. routing_config.json
Defines routing strategy:
- Tier 1: Online models (Minimax, Claude) - use cloud credits first
- Tier 2: Local models (LFM, mistral) - fallback when offline

### 8. config_manager.py
Reads/writes configuration files.

### 9. routing_log.py
Audit trail for all routing decisions.

## Flow

```
┌─────────────────┐
│ run_benchmark   │
└────────┬────────┘
         ↓
┌─────────────────┐
│ supervisor      │──→ Detect variance
└────────┬────────┘
         ↓
┌─────────────────┐
│ policy gates    │──→ Pass/fail decisions
└────────┬────────┘
         ↓
┌─────────────────┐
│ feedback loop   │──→ Generate recommendations
└────────┬────────┘
         ↓
┌─────────────────┐
│ routing enforce │──→ Apply routing rules
└────────┬────────┘
         ↓
    Repeat
```

## Usage

```bash
# Run a benchmark
python3 run_benchmark.py lfm2.5-thinking:1.2b atomic atomic

# Run supervisor (multiple runs)
python3 benchmark_supervisor.py

# Run meta loop (full optimization cycle)
python3 meta_harness_loop.py

# Apply routing rules
python3 routing_enforcer.py
```

## Configuration

- `routing_config.json` - Routing strategy
- `harness/phase2_config.json` - Model configurations
