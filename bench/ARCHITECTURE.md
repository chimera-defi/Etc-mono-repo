# Benchmark Harness Architecture

**Current Status:** Production-ready, self-optimizing  
**Last Updated:** 2026-02-23  
**Diagram Version:** 1.0

---

## System Overview

The harness is a **closed-loop, self-optimizing system** that:
- Runs benchmarks across model/phase/variant combinations
- Collects metrics (accuracy, restraint, latency)
- Uses a policy engine to make routing decisions
- Generates feedback recommendations
- Iteratively improves itself through metadata analysis

```
┌─────────────────────────────────────────────────────────────┐
│                    BENCHMARK HARNESS LOOP                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ DISCOVER     │  │  EVALUATE    │  │  ANALYZE     │     │
│  │ Candidates   │─→│  Candidates  │─→│ & Recommend  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         ▲                                      │             │
│         └──────────────────────────────────────┘             │
│                    (Feedback Loop)                           │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Layer 1: Runner (Low-Level)

**Component:** `run_benchmark.py`  
**Responsibility:** Execute a single model on a single phase/variant

### Input
```
Model: "lfm2.5-thinking:1.2b"
Phase: "atomic" | "extended"
Variant: "native_api" | "atomic"
Timeout: 60s
Retries: 1-2
```

### Output
```json
{
  "model": "...",
  "phase": "...",
  "passed": 8,
  "total": 12,
  "accuracy": 0.667,
  "failed_prompts": ["P6", "P7"],
  "latency_p50_ms": 30000.0,
  "restraint_score": 0.33
}
```

### Execution
- Isolated call mode: `--isolate-call` (subprocess per prompt)
- Retry logic: On timeout, retry up to N times
- Fail-fast: `--fail-fast` stops early on consistent failures
- Debug: `--debug-log` captures full prompt responses

---

## Layer 2: Supervisor (Mid-Level)

**Component:** `benchmark_supervisor.py`  
**Responsibility:** Run a single job (1 model × 1 phase), then aggregate variance

### Input
```
Job config: {model, phase, variant, timeout, retries}
Runs: N (typically 7 for variance detection)
```

### Process
1. **Run 1-N:** Execute runner N times, collect results
2. **Aggregate:** Compute median accuracy + variance across runs
3. **Variance Detection:** Flag prompts that pass/fail inconsistently
4. **Pattern Analysis:** Identify cold-start vs capability issues

### Output
```json
{
  "run_id": "010b10d1c8",
  "job_summaries": [
    {
      "model": "lfm2.5-thinking:1.2b",
      "phase": "atomic",
      "passed": 8,
      "total": 12,
      "accuracy": 0.667,
      "variance": 0.0117,
      "failed_prompts": ["P6", "P7", "P9", "P10"]
    }
  ],
  "variance": {
    "inconsistent_prompts": [
      {
        "prompt_id": "P6",
        "runs": 7,
        "pass_rate": 0.714,
        "outcomes": [false, false, true, true, true, true, true]
      }
    ]
  }
}
```

**Key Feature:** Variance tracking reveals **cold-start patterns** vs **capability limits**

---

## Layer 3: Meta Harness (High-Level Optimization)

**Component:** `meta_harness_loop.py`  
**Responsibility:** Run N cycles of baseline + candidate matrix, make promotion decisions

### Architecture
```
┌──────────────────────────────────────────────────────────┐
│             META HARNESS LOOP (Multi-Cycle)              │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  Cycle 1: Baseline + Candidates A, B, C                  │
│  ├─→ Supervisor runs (7 jobs each)                       │
│  ├─→ Policy engine: Promote / Hold / Reject              │
│  └─→ Update history.json                                 │
│                                                            │
│  Cycle 2: New baseline + new candidates D, E, F          │
│  ├─→ Supervisor runs (7 jobs each)                       │
│  ├─→ Policy engine decision                              │
│  └─→ Append to history.json                              │
│                                                            │
│  Cycle 3...                                              │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

### Input (from CLI)
```bash
python3 meta_harness_loop.py \
  --baseline "lfm2.5-thinking:1.2b / atomic / native_api / t60 r1 i0" \
  --candidates "... t60 r1 i1" "... t60 r2 i1" "... t60 r1 i0" \
  --cycles 3
```

### Output
```json
{
  "cycle": 1,
  "baseline_results": { ... },
  "candidate_results": {
    "candidate-1": { ... },
    "candidate-2": { ... }
  },
  "policy_decisions": {
    "candidate-1": { decision: "promote", reason: "..." },
    "candidate-2": { decision: "hold", reason: "..." }
  },
  "new_canonical": "candidate-1"
}
```

Appends to **`meta_loop_history.json`** for long-term trend analysis.

---

## Layer 4: Policy Engine (Decision Logic)

**Component:** `self_optimizing_policy.py`  
**Responsibility:** Gate mechanism for promotion decisions

### Decision Gates

```
┌─────────────────────────────────────────┐
│     CANDIDATE EVALUATION                │
├─────────────────────────────────────────┤
│                                         │
│ Gate 1: Min Samples (n >= 3)           │
│         ↓ PASS/FAIL                     │
│                                         │
│ Gate 2: Accuracy Variance <= 0.0025    │
│         ↓ (if FAIL → HOLD)              │
│                                         │
│ Gate 3: No Regression vs Baseline      │
│         ↓ (if FAIL → REJECT)            │
│                                         │
│ Gate 4: Restraint Score >= 0.80        │
│         ↓ (if FAIL → REJECT)            │
│                                         │
│ All PASS → PROMOTE                      │
│                                         │
└─────────────────────────────────────────┘
```

### Decisions

- **PROMOTE:** New baseline (replaces current)
- **HOLD:** Wait for more data (re-evaluate next cycle)
- **REJECT:** Discard (doesn't meet gates)

---

## Layer 5: Feedback Loop (Autonomous Recommendations)

**Component:** `harness_feedback_loop.py`  
**Responsibility:** Analyze recent runs, emit routing recommendations

### Analysis
1. **Model+Phase Accuracy:** Aggregate last 8 runs
2. **Hot Failures:** Track prompts that fail >2 times
3. **Recommendation Rules:**
   - Extended phase + accuracy < 50% → "disable_for_stateful"
   - Atomic phase + accuracy >= 80% → "allow_for_bounded_tasks"

### Output
```json
{
  "model_phase_accuracy": {
    "lfm2.5-thinking:1.2b::atomic": {
      "passed": 48,
      "total": 72,
      "accuracy": 0.667
    },
    "lfm2.5-thinking:1.2b::extended": {
      "passed": 0,
      "total": 63,
      "accuracy": 0.0
    }
  },
  "recommendations": [
    {
      "type": "routing",
      "target": "lfm2.5-thinking:1.2b::extended",
      "action": "disable_for_stateful",
      "reason": "low extended accuracy 0%"
    },
    {
      "type": "routing",
      "target": "lfm2.5-thinking:1.2b::atomic",
      "action": "allow_for_bounded_tasks",
      "reason": "strong atomic accuracy 66.7%"
    }
  ]
}
```

---

## Complete Data Flow

```
USER COMMAND
    ↓
meta_harness_loop.py (discover candidates)
    ↓
FOR each candidate:
    ↓
    benchmark_supervisor.py (run N times)
        ↓
        FOR each run:
            ↓
            run_benchmark.py (execute model on prompts)
                ↓
                Output: {accuracy, restraint, latency, failed_prompts}
    ↓
    Aggregate: median, variance, pattern detection
        ↓
        Flag inconsistent prompts (cold-start pattern detection)
    ↓
self_optimizing_policy.py (evaluate gates)
    ↓
    Decision: PROMOTE / HOLD / REJECT
    ↓
Update baseline if PROMOTE
    ↓
Append to meta_loop_history.json
    ↓
harness_feedback_loop.py (analyze trends)
    ↓
Output recommendations: routing decisions, hot failures
    ↓
SELF_OPTIMIZING_REPORT.md (human-readable summary)
```

---

## Current Routing Rules (from harness_feedback.json)

```python
# Routing 1: Extended Phase Disqualification
if phase == "extended" and accuracy < 0.50:
    → Disable model for extended (stateful) operations
    → Use Claude Haiku instead

# Routing 2: Atomic Phase Enablement  
if phase == "atomic" and accuracy >= 0.80:
    → Allow model for bounded (non-stateful) tasks
    → Pre-warm model if cold-start detected

# Routing 3: Hot Failure Tracking
if prompt fails in >2 recent runs:
    → Flag as high-variance
    → Investigate: cold-start vs capability?
```

---

## Self-Improvement Mechanism

### How It Improves Itself

**Cycle N:**
1. Run baseline + variants
2. Policy engine decides: Which config is best?
3. Promote winning variant → becomes new baseline
4. Metrics saved to history.json

**Cycle N+1:**
1. Discover NEW candidates (different timeouts, retries, isolate modes)
2. Run against new baseline (the promoted variant from N)
3. Policy engine: Does this beat the previous winner?
4. If yes: Promote → new baseline

**Recursive Improvement:**
- Each cycle, the baseline gets stronger (if we find improvements)
- History accumulates → detect long-term trends
- Variance data informs: Is variance fixable (infrastructure) or permanent (capability)?

---

## Recent Discoveries (Feb 22-23)

### Variance Classification

**Infrastructure Variance (Fixable):**
- Pattern: `[FAIL, FAIL, PASS, PASS, PASS, PASS, PASS]`
- Root cause: Ollama cold-start (model not in VRAM on runs 1-2)
- Solution: Pre-warm model before production runs
- Impact: Increases effective accuracy by 30% after warm-up

**Capability Variance (Not Fixable):**
- Pattern: `0/9 on all 7 runs` (zero variance)
- Root cause: Model lacks stateful reasoning, multi-tool sequencing
- Solution: Disable for stateful tasks, use Haiku instead
- Impact: Accept limitation, route to better model

---

## Next Iteration: Automated Harness Improvement

### Goal
Make the harness **self-healing** by:

1. **Warm-up Detection** (Already implemented in variance analysis)
   - Identify cold-start patterns automatically
   - Inject warm-up run before production
   - Re-baseline with warm-up enabled

2. **Adaptive Routing** (Ready to implement)
   - Auto-route extended → Haiku (0% with LFM detected)
   - Auto-route atomic → LFM with warm-up (66.7% is viable)
   - Document routing decision in logs

3. **Recursive Meta-Learning** (Architecture ready)
   - Meta-harness learns which config improvements actually work
   - Feedback loop surfaces: "Warm-up improved accuracy by X%"
   - Next cycle: Incorporate warm-up into baseline config
   - Result: Harness improves its own baseline iteratively

4. **Token Reduction** (Skill available in etc-mono-repo)
   - Use token-reduce skill to shrink analysis reports
   - Reduces feedback loop overhead
   - Improves turnaround time for iterations

---

## Files and Ownership

| File | Purpose | Owned By |
|---|---|---|
| `run_benchmark.py` | Single model execution | Harness core |
| `benchmark_supervisor.py` | Multi-run aggregation | Supervisor |
| `meta_harness_loop.py` | Cycle orchestration | Meta-harness |
| `self_optimizing_policy.py` | Gate evaluation | Policy engine |
| `harness_feedback_loop.py` | Recommendation generation | Feedback |
| `meta_loop_history.json` | Long-term trend storage | History |
| `SELF_OPTIMIZING_REPORT.md` | Human-readable summary | Reporting |
| `harness_feedback.json` | Routing recommendations | Routing |

---

## Usage Examples

### Run Meta-Harness (Full Optimization Cycle)
```bash
python3 bench/meta_harness_loop.py \
  --baseline "lfm2.5-thinking:1.2b atomic native_api t60 r1 i0" \
  --candidates \
    "lfm2.5-thinking:1.2b atomic native_api t60 r1 i1" \
    "lfm2.5-thinking:1.2b atomic native_api t60 r2 i1" \
  --cycles 3
```

### Check Feedback & Routing Decisions
```bash
python3 bench/harness_feedback_loop.py
# → Outputs: harness_feedback.json (recommendations)
```

### View History & Trends
```bash
jq '.[] | {cycle: .cycle_index, baseline: .baseline, decisions: .variance}' bench/meta_loop_history.json
```

---

## Diagrams Legend

```
┌──────┐  = Component boundary
│      │
├──────┤  = Section divider
│      │
└──────┘  = End of component

→        = Data flow / call chain
↓        = Sequence flow (top to bottom)
```

---

**Next Action:** Implement warm-up harness improvement + adaptive routing  
**Timeline:** Ready for immediate iteration  
**Status:** Architecture complete, ready for enhancement phase
