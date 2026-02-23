# Benchmark Harness Architecture V2: Self-Optimizing Core

**Focus:** The recursive improvement loop IS the architecture, not a feature of it.

**Date:** 2026-02-23  
**Status:** Redesign before implementation

---

## Core Concept: The Optimization Loop

The system is fundamentally a **feedback loop that improves itself automatically**:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    THE SELF-OPTIMIZING LOOP                         │
│                    (This IS the architecture)                        │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                                                                            │
│  INPUT: Baseline Config                                                  │
│  (Best performing spec from prior cycle, or initial guess)               │
│                                                                            │
│         ▼                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ PHASE 1: GENERATE IMPROVEMENT CANDIDATES                           │ │
│  │                                                                     │ │
│  │ From baseline, create N variations:                                │ │
│  │  • Different variant (native_api → atomic)                         │ │
│  │  • Different timeout (60s → 120s)                                  │ │
│  │  • Different retry count (r1 → r2)                                 │ │
│  │  • Different isolation mode (i0 → i1)                              │ │
│  │                                                                     │ │
│  │ Output: [Baseline, Candidate-1, Candidate-2, ...]                 │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│         ▼                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ PHASE 2: EVALUATE ALL SPECS (Multiple Runs)                        │ │
│  │                                                                     │ │
│  │ For each spec (baseline + candidates):                             │ │
│  │  • Run 7 times on same prompts                                     │ │
│  │  • Collect: accuracy, variance, latency, restraint                 │ │
│  │  • Analyze: pattern detection (cold-start vs capability)           │ │
│  │                                                                     │ │
│  │ Output: {baseline: {...}, candidates: [...]}, each with metrics   │ │
│  │ Key insight: Variance analysis reveals problem TYPE                │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│         ▼                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ PHASE 3: APPLY DECISION GATES                                      │ │
│  │                                                                     │ │
│  │ For each candidate, check gates:                                   │ │
│  │  • Gate 1: Min samples >= 3? (enough data?)                        │ │
│  │  • Gate 2: Variance <= 0.0025? (stable?)                           │ │
│  │  • Gate 3: No regression? (better or same as baseline?)            │ │
│  │  • Gate 4: Restraint >= 0.80? (model constrained?)                 │ │
│  │                                                                     │ │
│  │ Result per candidate: PROMOTE | HOLD | REJECT                     │ │
│  │                                                                     │ │
│  │ Output: Decision matrix + reasoning                                │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│         ▼                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ PHASE 4: AUTO-DIAGNOSE & RECOMMEND                                 │ │
│  │                                                                     │ │
│  │ Analyze patterns:                                                  │ │
│  │  • Cold-start pattern [F,F,P,P,P,P,P]? → Recommend warm-up       │ │
│  │  • Zero variance 0%? → Recommend routing to better model          │ │
│  │  • High variance? → Recommend more retries                         │ │
│  │                                                                     │ │
│  │ Output: Auto-generated recommendations                             │ │
│  │ Key: NO human tuning needed                                        │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│         ▼                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ PHASE 5: PICK WINNER & LEARN                                       │ │
│  │                                                                     │ │
│  │ If any candidate PROMOTED:                                         │ │
│  │  • New baseline = best promoting candidate                         │ │
│  │  • Record: Why it won (metrics + gates)                            │ │
│  │  • Store: In meta_loop_history.json                                │ │
│  │                                                                     │ │
│  │ Key insight: Baseline improves monotonically (if learning works)   │ │
│  │                                                                     │ │
│  │ Output: {promoted_baseline, reason, metrics}                       │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│         ▼                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ PHASE 6: ENFORCE RECOMMENDATIONS                                   │ │
│  │                                                                     │ │
│  │ Apply auto-diagnosed recommendations:                              │ │
│  │  • Enable warm-up if cold-start detected                           │ │
│  │  • Route to fallback model if capability limit detected            │ │
│  │  • Adjust config if high variance detected                         │ │
│  │                                                                     │ │
│  │ Store all decisions:                                               │ │
│  │  • routing_config.json (enforcement rules)                         │ │
│  │  • routing_decisions.log (audit trail)                             │ │
│  │                                                                     │ │
│  │ Output: System auto-applies learnings                              │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│         ▼                                                                  │
│  OUTPUT: Improved Baseline (for next cycle)                              │
│  Better OR same, never worse (gates prevent regression)                  │
│                                                                            │
│  ┌─ IF improved: Use as baseline for Cycle N+1                           │
│  └─ IF no improvement: Try different candidates next time                │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │ LOOP CLOSES: New Baseline → Phase 1 (repeat)                        │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
└─────────────────────────────────────────────────────────────────────────┘

KEY: Each cycle learns something. System improves by doing, not by tuning.
```

---

## What Makes It "Self-Optimizing"

**Traditional benchmarking (manual):**
```
1. Run benchmark
2. Human reads results
3. Human thinks "what to try next"
4. Human modifies config
5. Run again
6. Repeat
```

**Self-optimizing (automatic):**
```
1. Run benchmark (multiple specs)
2. System analyzes results
3. System detects patterns
4. System recommends improvements
5. System applies recommendations
6. System picks winner automatically
7. Winner becomes baseline
8. Repeat (baseline improves each cycle)
```

**The magic:** Steps 2-7 are automatic. No human in the loop.

---

## The Three Layers (Supporting the Loop)

The loop needs infrastructure. This is what layers do:

### Layer 1: EXECUTION (Runs the experiments)
```
run_benchmark.py
  ├─ Invoke model on prompts
  ├─ Measure: accuracy, latency, restraint
  ├─ Handle: retries, timeouts, failures
  └─ Output: Single run result {accuracy: 0.667, ...}
```

**Why this layer:** Loop needs raw data. Runner generates it.

---

### Layer 2: EVALUATION (Analyzes the data)
```
benchmark_supervisor.py
  ├─ Run spec 7 times
  ├─ Aggregate: median, variance
  ├─ Detect patterns: [F,F,P,P,P,P,P] vs [F,F,F,F,F,F,F]
  └─ Output: Analyzed result {accuracy: 0.667, variance: 0.0117, pattern: [F,F,P...]}

self_optimizing_policy.py
  ├─ Apply gate 1: min samples?
  ├─ Apply gate 2: variance?
  ├─ Apply gate 3: regression?
  ├─ Apply gate 4: restraint?
  └─ Output: Decision {promote | hold | reject, reason}
```

**Why this layer:** Loop needs to classify results. Gates do it.

---

### Layer 3: ORCHESTRATION (Controls the loop)
```
meta_harness_loop.py
  ├─ Run cycle N
  ├─ Collect all results
  ├─ Apply policy decisions
  ├─ Pick winner
  ├─ Store in history
  └─ Prepare for cycle N+1

harness_feedback_loop.py
  ├─ Analyze patterns
  ├─ Auto-diagnose issues
  ├─ Generate recommendations
  └─ Output: harness_feedback.json

routing_enforcer.py
  ├─ Read recommendations
  ├─ Generate routing_config.json
  ├─ Log to routing_decisions.log
  └─ Make recommendations actionable
```

**Why this layer:** Loop needs to be orchestrated. Orchestrator does it.

---

## Data Flow for Self-Optimization

```
┌─ Baseline Spec
│  {model: lfm, phase: atomic, variant: native_api, t: 60, r: 1}
│  [Cycle 1 winner, or initial guess]
│
├─ Generate Candidates
│  Candidate-1: variant: atomic   (change 1 thing)
│  Candidate-2: timeout: 120s     (change 1 thing)
│  Candidate-3: retries: 2        (change 1 thing)
│
├─ Evaluate
│  Run each 7 times on same prompts
│  Baseline: [0.667, 0.667, 0.667, 0.667, 0.667, 0.667, 0.667] → median 0.667, var 0.0
│  Cand-1:   [0.833, 0.833, 0.833, 0.833, 0.833, 0.833, 0.833] → median 0.833, var 0.0 ✓
│  Cand-2:   [0.667, 0.667, 0.667, 0.667, 0.667, 0.667, 0.667] → median 0.667, var 0.0
│  Cand-3:   [0.667, 0.667, 0.667, 0.667, 0.667, 0.667, 0.667] → median 0.667, var 0.0
│
├─ Apply Gates
│  Baseline: No gates (is baseline)
│  Cand-1: Gate1✓ Gate2✓ Gate3✓ Gate4✓ → PROMOTE (median 0.833 > baseline 0.667)
│  Cand-2: Gate1✓ Gate2✓ Gate3✗ Gate4✓ → REJECT (no improvement)
│  Cand-3: Gate1✓ Gate2✓ Gate3✗ Gate4✓ → REJECT (no improvement)
│
├─ Auto-Diagnose
│  Baseline pattern: [P,P,P,P,P,P,P] at 0.667
│    Diagnosis: Clean runs, no infrastructure issue, but suboptimal
│    Recommendation: Try different variant (done - Cand-1 worked!)
│
│  Extended phase for LFM: [F,F,F,F,F,F,F] at 0.0
│    Diagnosis: Zero variance = model capability limit
│    Recommendation: Route to claude-haiku for extended
│
├─ Store Results
│  Winner: Candidate-1 (variant: atomic)
│  Baseline accuracy improved: 0.667 → 0.833 (+16.6%)
│  Record in meta_loop_history.json
│  {cycle: 1, baseline_was: native_api, winner: atomic, improvement: 0.166}
│
├─ Cycle N+1 Uses New Baseline
│  NEW baseline: atomic variant (0.833)
│  NEW candidates: timeout variants, retry variants, etc.
│  Can we beat 0.833? → Find out in next cycle
│
└─ LEARNING: System now knows variant matters, warmup helps, extended needs fallback
   This knowledge persists in recommendations & routing rules.
```

---

## The Improvement Curve (What We Expect)

```
                    BASELINE IMPROVEMENT OVER CYCLES
                    
Accuracy %
│
100 ├──────────────────────────┐ ← Ceiling (model capability limit)
 95 │                          │
 90 │                        ┌─┘
 85 │                      ┌─┘
 80 │                    ┌─┘─ Cycle 2: New candidates vs atomic baseline
 75 │                  ┌─┘    (try timeout, retries)
 70 │              ┌─┘─ Cycle 1: atomic vs native_api baseline
 65 │            ┌─┘    (improvement found: +16.6%)
 60 │          ──┘      Initial: native_api baseline (66.7%)
    │
    └──────────┴──┴──┴──┴──┴──┴──→ Cycle
      Cycle 1  2  3  4  5  6  7

KEY:
• Each step up = one cycle found improvement
• Flat line = no improvement found (ceiling reached or exploration exhausted)
• Line never goes down (gates prevent regression)
• At some point: plateau (model limit) or need new model tier
```

---

## What Needs to Change for True Self-Optimization

**Currently working:**
- ✅ Variance detection
- ✅ Policy gates
- ✅ Recommendation generation
- ✅ History tracking

**Missing: Enforcement Loop Closure**
Currently:
1. System recommends: "Enable warm-up"
2. Recommendations sit in harness_feedback.json
3. Humans read them manually
4. Humans apply them manually
5. System never automatically acts

**What's needed:**
1. System recommends: "Enable warm-up"
2. System checks: Is warm-up enabled?
3. System auto-enables if not
4. System re-runs with warm-up
5. System verifies improvement
6. System updates config permanently

**Missing piece: routing_enforcer.py + config management**

---

## Three Components of True Self-Optimization

### Component 1: Variance-Driven Diagnosis
```
Input: Raw metrics from 7 runs
Process: Detect pattern [F,F,P,P,P,P,P] or [F,F,F,F,F,F,F]
Output: Diagnosis (cold-start vs capability)
Status: ✅ WORKING (benchmark_supervisor.py)
```

### Component 2: Automatic Recommendations
```
Input: Variance diagnosis
Process: "Cold-start? → try warm-up" "0%? → route to Haiku"
Output: recommendations in harness_feedback.json
Status: ✅ WORKING (harness_feedback_loop.py)
```

### Component 3: Enforcement & Auto-Learning
```
Input: Recommendations
Process: Apply to config, re-run, verify improvement, store decision
Output: Updated routing rules, improved baseline
Status: 🔴 MISSING (routing_enforcer.py exists but not auto-applying)
```

**Missing piece #3 is what makes it truly self-optimizing.**

---

## The Plan (Fixed)

Instead of just implementing features, we need to close the loop:

### Phase 0: Architecture Completion (Today - 1 hour)
- [ ] Complete routing_enforcer.py (read recommendations → apply config)
- [ ] Create config management (routing_config.json is source of truth)
- [ ] Create auto-apply mechanism (system reads config on startup)
- [ ] Design feedback flow: Diagnosis → Recommendation → Enforcement → New Baseline

### Phase 1: Implementation (Tomorrow - 3 hours)
- [ ] Modify run_benchmark.py to read routing_config.json
- [ ] Modify meta_harness_loop.py to call routing_enforcer
- [ ] Create auto-apply tests
- [ ] Implement lock fix (PID-based)

### Phase 2: Validation (Day 3 - 2 hours)
- [ ] Does warm-up recommendation auto-apply?
- [ ] Does extended fallback auto-enforce?
- [ ] Are decisions traceable?

### Phase 3: Full Loop Test (Day 4 - 1 hour)
- [ ] Run Cycle 1: Baseline vs variants
- [ ] System recommends improvement
- [ ] System auto-applies improvement
- [ ] Run Cycle 2: Is new baseline better?
- [ ] Verify: System learned and improved

---

## True Self-Optimization Checklist

✅ = System does it automatically (no human intervention)

- [ ] ✅ Run multiple specs
- [ ] ✅ Detect variance patterns
- [ ] ✅ Classify patterns (cold-start vs capability)
- [ ] ✅ Generate recommendations
- [ ] ✅ **Auto-apply recommendations** ← KEY MISSING PIECE
- [ ] ✅ Measure improvement
- [ ] ✅ Update baseline
- [ ] ✅ Store decisions with reasoning
- [ ] ✅ Next cycle uses improved baseline
- [ ] ✅ Repeat until ceiling

**Without step 5 (auto-apply), it's not self-optimizing—it's just reporting.**

---

## Success Definition

The system is truly self-optimizing when:

1. **Autonomous:** Cycles run without human intervention
2. **Learning:** Each cycle improves (or explains why not)
3. **Auditable:** Every decision traceable to data
4. **Closed-loop:** Recommendations automatically become reality
5. **Improving:** Baseline better than before (monotonic improvement)

---

## Architecture Summary (Redesigned)

```
THE SELF-OPTIMIZING LOOP

Phase 1 (Generate)  →  Phase 2 (Evaluate)  →  Phase 3 (Decide)
                              ↓
                    Phase 6 (Enforce)  ←  Phase 4 (Diagnose)
                              ↓
                         Phase 5 (Learn)
                              ↓
                    [New Baseline for Cycle N+1]
                              ↓
                         [LOOP REPEATS]

Layers support the loop:
- Layer 1 (Runner): Generate data for evaluation
- Layer 2 (Evaluator): Analyze data for decisions
- Layer 3 (Orchestrator): Control the loop + auto-apply learnings
```

---

## Next Step

Before any code: **Do we agree this is what self-optimization should be?**

If yes:
1. Finalize Phase 0 (architecture completion)
2. Then implement Phase 1-3 in sequence
3. Verify loop closure before considering complete

If no:
- What's missing from this model?
- What should true self-optimization include?

---

**Current Status:** 🟡 Architecture redesigned, awaiting approval  
**Next Action:** Review + feedback on loop design  
**Then:** Implement with loop closure in mind (not just features)
