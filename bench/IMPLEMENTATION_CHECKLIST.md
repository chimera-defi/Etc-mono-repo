# Self-Optimizing Harness: Implementation Guide

**Status:** Ready for parallel implementation  
**Timeline:** 3-5 days to production  
**Effort:** Low (mostly stubs provided)

---

## Quick Overview

This document consolidates the implementation plan and execution strategy for the self-improving benchmark harness. The goal is to close the optimization loop + implement improvements + ship PR.

## Execution Phases

```
PHASE 0: Loop Closure (Foundation)
  ├─ Task 0.1 → config_manager.py
  ├─ Task 0.2 → routing_config.json schema
  ├─ Task 0.3 → routing_enforcer.py (complete)
  └─ Task 0.4 → meta_harness_loop.py (add enforcer call)

PHASE 1: Features (Parallel after 0.1 complete)
  ├─ Task 1.1 → warm_up integration
  ├─ Task 1.2 → extended suite safety
  ├─ Task 1.3 → lock file PID check
  └─ Task 1.4 → benchmark_supervisor.py config reading

PHASE 2: Tests (Parallel after features done)
  ├─ Task 2.1 → config_manager tests
  ├─ Task 2.2 → routing_enforcer tests
  ├─ Task 2.3 → run_benchmark.py feature tests
  ├─ Task 2.4 → meta_harness_loop tests
  └─ Task 2.5 → integration tests (warm-up + routing)

PHASE 3: Integration (Serial, after tests)
  ├─ Task 3.1 → Full loop dry-run
  └─ Task 3.2 → Verify loop closes

PHASE 4: PR & Docs (After integration passes)
  ├─ Task 4.1 → Update docs + MEMORY.md
  ├─ Task 4.2 → Create PR
  └─ Task 4.3 → Run final checks
```

---

## Phase 1: Infrastructure Improvements (2-3 days)

These fix known issues and improve baseline accuracy.

### Task 1.1: Warm-Up Integration
**Files:** WARM_UP_INTEGRATION.md (reference)

- [ ] Modify `run_benchmark.py`
  - [ ] Add `--enable-warmup` flag
  - [ ] Add warm-up logic: invoke LLM once before suite
  - [ ] Use simple prompt: "What is 2+2?"
  - [ ] Timeout: 10 seconds
  - [ ] Log: "Warm-up complete"

- [ ] Modify `benchmark_supervisor.py`
  - [ ] Warm-up only on first run (run_idx == 0)
  - [ ] Track: warm-up success/failure
  - [ ] Output: include warm-up status in results

- [ ] Create `warm_up_test.py`
  - [ ] Test without warm-up (baseline)
  - [ ] Test with warm-up
  - [ ] Compare accuracy
  - [ ] Expected: 71.4% → 100%

- [ ] Verify results
  - [ ] Does accuracy improve 30%?
  - [ ] Does variance go to 0?
  - [ ] Is pattern [PPPPPPPP]?

- [ ] Commit: `chore: add warm-up phase for LFM cold-start`

**Expected Outcome:** LFM atomic baseline: 66.7% → 100% (with warm-up)

---

### Task 1.2: Extended Suite Disablement  
**Files:** EXTENDED_SUITE_DISABLEMENT.md (reference)

- [ ] Modify `run_benchmark.py`
  - [ ] Add `validate_model_phase_compatibility()` function
  - [ ] Rule: lfm2.5-thinking:1.2b + extended → route to haiku
  - [ ] Log decision: "Routed from LFM to Haiku"
  - [ ] Allow override: `--force-model` flag (for testing)

- [ ] Create `routing_log.py`
  - [ ] Function: `log_routing_decision()`
  - [ ] Write to: `routing_decisions.jsonl` (append-only)
  - [ ] Fields: timestamp, original_model, fallback, reason

- [ ] Modify `self_optimizing_policy.py`
  - [ ] Add gate: `extended_phase_min_accuracy = 0.30`
  - [ ] Logic: if phase=='extended' and accuracy < 0.30 → reject
  - [ ] LFM will fail this gate (0%)

- [ ] Create `extended_suite_safety_test.py`
  - [ ] Test 1: Can we block LFM extended?
  - [ ] Test 2: Does fallback to Haiku work?
  - [ ] Test 3: Is decision logged?
  - [ ] Expected: All 3 tests PASS

- [ ] Verify results
  - [ ] Are LFM extended requests blocked?
  - [ ] Do they correctly route to Haiku?
  - [ ] Is audit trail accurate?

- [ ] Commit: `safety: disable LFM for extended suite with fallback`

**Expected Outcome:** Extended phase: 0% → 100% (auto-fallback to Haiku)

---

### Task 1.3: Routing Enforcement
**Files:** ROUTING_DECISIONS.md (reference)

- [ ] Modify `harness_feedback_loop.py`
  - [ ] Output structured routing config (JSON)
  - [ ] Include: allow/disable, fallback, requirements
  - [ ] Example: `{"model": "lfm...", "action": "disable", "fallback": "haiku"}`

- [ ] Create `routing_enforcer.py`
  - [ ] Function: `generate_routing_rules(recommendations)`
  - [ ] Input: harness_feedback.json
  - [ ] Output: routing_config.json
  - [ ] Logic: Convert recommendations to enforcement rules

- [ ] Create `routing_test.py`
  - [ ] Test 1: Can we read feedback recommendations?
  - [ ] Test 2: Do we generate correct routing config?
  - [ ] Test 3: Are decisions auditable?
  - [ ] Expected: All 3 tests PASS

- [ ] Verify results
  - [ ] Is routing_config.json generated?
  - [ ] Are LFM rules correct?
  - [ ] Is audit trail complete?

- [ ] Commit: `chore: implement auto-routing enforcement`

**Expected Outcome:** Data-driven routing, all decisions auditable

---

## Phase 2: Measurement & Validation (1-2 days)

Verify that improvements work as expected.

### Task 2.1: Re-run LFM Atomic Suite
**With Warm-Up Enabled**

- [ ] Run: `python3 benchmark_supervisor.py lfm2.5 atomic --enable-warmup`
  - [ ] 7 runs (as before)
  - [ ] Compare to baseline (without warm-up)
  - [ ] Measure: Does accuracy improve 30%?

- [ ] Document results
  - [ ] Create: `WARM_UP_VALIDATION_RESULTS.json`
  - [ ] Include: before/after accuracy, variance, pattern
  - [ ] Example: `{before: 0.714, after: 1.0, improvement: 0.286}`

- [ ] Verify patterns
  - [ ] Without warm-up: [F,F,P,P,P,P,P]
  - [ ] With warm-up: [P,P,P,P,P,P,P]
  - [ ] Variance: high → 0?

- [ ] Update META_LEARNINGS.md
  - [ ] Section: "Warm-Up Effectiveness"
  - [ ] Record: Achieved improvement +X%
  - [ ] Decision: Include warm-up in baseline

- [ ] Expected: ✅ PASS (100% accuracy with warm-up)

---

### Task 2.2: Verify Extended Suite Auto-Fallback
**Test LFM Extended Routing**

- [ ] Run: `python3 run_benchmark.py lfm2.5-thinking:1.2b extended extended`
  - [ ] Check: Does it block?
  - [ ] Check: Does it route to Haiku?
  - [ ] Check: Does Haiku succeed (100%)?

- [ ] Verify audit trail
  - [ ] Check: `routing_decisions.jsonl`
  - [ ] Look for: LFM → Haiku routing decision
  - [ ] Verify: Timestamp, reason, fallback model

- [ ] Update META_LEARNINGS.md
  - [ ] Section: "Extended Suite Routing"
  - [ ] Record: LFM blocked, Haiku auto-applied
  - [ ] Decision: Routing working correctly

- [ ] Expected: ✅ PASS (Extended phase now 100%)

---

### Task 2.3: Verify Routing Enforcement
**Test Automatic Rule Application**

- [ ] Run: `python3 routing_enforcer.py`
  - [ ] Input: harness_feedback.json
  - [ ] Output: routing_config.json
  - [ ] Check: Are rules correct?

- [ ] Inspect routing_config.json
  ```json
  {
    "rules": [
      {"model": "lfm2.5-thinking:1.2b", "phase": "extended", "allow": false},
      {"model": "lfm2.5-thinking:1.2b", "phase": "atomic", "allow": true}
    ]
  }
  ```

- [ ] Check audit trail
  - [ ] File: routing_decisions.log
  - [ ] Verify: Each rule logged with reason
  - [ ] Trace: Back to run data

- [ ] Update META_LEARNINGS.md
  - [ ] Section: "Routing Enforcement"
  - [ ] Record: Auto-routing working, decisions traceable

- [ ] Expected: ✅ PASS (Routing enforced automatically)

---

## Phase 3: Integration & Next Cycle (1 day)

Run the full cycle with improvements integrated.

### Task 3.1: Update Meta-Harness Baseline
**Promote Improved Config**

- [ ] Update `meta_harness_loop.py`
  - [ ] New baseline: lfm2.5 atomic atomic (with warm-up)
  - [ ] Previous baseline: lfm2.5 atomic native_api (no warm-up)
  - [ ] Baseline improvement: 66.7% → 100%

- [ ] Run Cycle 2
  - [ ] Command: `python3 meta_harness_loop.py --cycles 1 --baseline "..."`
  - [ ] Candidates: try different timeouts/retries
  - [ ] Measure: Can we beat 100% on atomic?

- [ ] Document Cycle 2 results
  - [ ] Create: `CYCLE_2_RESULTS.json`
  - [ ] Include: Candidates tested, winner, improvement
  - [ ] Update: `meta_loop_history.json`

---

### Task 3.2: Generate Next Report
**Full System Summary**

- [ ] Run: `python3 harness_feedback_loop.py`
  - [ ] Analyze: Last 8 runs
  - [ ] Generate: New recommendations
  - [ ] Output: harness_feedback.json (updated)

- [ ] Generate report
  - [ ] Run: `python3 meta_harness_loop.py --report` (or manual)
  - [ ] Output: SELF_OPTIMIZING_REPORT.md (updated)
  - [ ] Include: Improvements made, new baseline, next steps

- [ ] Review report
  - [ ] Check: Does it show warm-up impact?
  - [ ] Check: Does it show fallback working?
  - [ ] Check: Does it show baseline improvement?

---

### Task 3.3: Update Documentation
**Capture Learnings**

- [ ] Update META_LEARNINGS.md
  - [ ] Add: "Cycle 2 Results"
  - [ ] Add: "Warm-Up Effectiveness: Confirmed"
  - [ ] Add: "Routing Enforcement: Operational"
  - [ ] Add: "Next iteration priorities"

- [ ] Update ARCHITECTURE.md
  - [ ] Add section: "Deployed Improvements (Feb 23)"
  - [ ] Describe: Warm-up, fallback routing, enforcement

- [ ] Commit all documentation
  - [ ] `docs: update architecture with Feb 23 improvements`

---

## Final: Verification Checklist

Run these before marking complete.

### Critical Path Tests
- [ ] `python3 warm_up_test.py` → PASS
- [ ] `python3 extended_suite_safety_test.py` → PASS
- [ ] `python3 routing_test.py` → PASS
- [ ] `python3 meta_harness_loop.py --cycles 1` → Completes

### Metrics Verification
- [ ] LFM atomic: 66.7% → 100% (with warm-up)
- [ ] LFM extended: 0% → 100% (fallback to Haiku)
- [ ] Extended phase: No more 0% failures
- [ ] All routing decisions logged

### Documentation Verification
- [ ] ARCHITECTURE_V2_SELF_OPTIMIZING.md explains system
- [ ] META_LEARNINGS.md captures discoveries
- [ ] Implementation docs provided for each improvement
- [ ] All decisions traceable to run data

### Production Readiness
- [ ] No breaking changes to existing harness
- [ ] Rollback plan documented
- [ ] All improvements optional (can be disabled)
- [ ] Audit trail complete

---

## Commits Required

```bash
# Phase 1.1
git commit -m "chore: add warm-up phase for LFM cold-start mitigation"

# Phase 1.2
git commit -m "safety: disable LFM for extended suite with intelligent fallback"

# Phase 1.3
git commit -m "chore: implement auto-routing enforcement from feedback loop"

# Phase 2 & 3
git commit -m "docs: update architecture with Feb 23-24 improvements
- Warm-up validation: +30% improvement confirmed
- Extended suite: Auto-fallback to Haiku working
- Routing enforcement: Automatic + auditable
- Cycle 2 baseline: 100% on atomic with warm-up"
```

---

## Timeline Estimate

| Phase | Task | Effort | Owner | Days |
|---|---|---|---|---|
| 1 | Warm-up integration | 30 min | Dev | 0.5 |
| 1 | Extended disablement | 20 min | Dev | 0.5 |
| 1 | Routing enforcement | 30 min | Dev | 0.5 |
| 2 | Measurement | 2 hours | QA | 1 |
| 3 | Integration | 1 hour | Dev | 0.5 |
| 3 | Documentation | 1 hour | Dev | 0.5 |
| — | **TOTAL** | **6 hours** | — | **3-4 days** |

---

## Success Criteria

✅ All tasks complete when:
1. Warm-up improves LFM atomic by ≥25%
2. Extended suite never returns 0% (auto-fallback works)
3. All routing decisions logged and auditable
4. Cycle 2 runs successfully with new baseline
5. Documentation updated with improvements

---

## If Something Goes Wrong

### Warm-up breaks accuracy
- Rollback: `git revert <commit_sha>`
- Investigate: Is warm-up prompt interfering?
- Alternative: Run warm-up in separate process

### Fallback routing doesn't work
- Check: Is `validate_model_phase_compatibility()` called?
- Debug: Does code reach the routing logic?
- Log: Is `routing_decisions.jsonl` being written?

### Routing enforcement fails
- Check: Is `routing_enforcer.py` being called?
- Debug: Does it read `harness_feedback.json` correctly?
- Fallback: Apply routing rules manually

---

## Core Files (Working)

### Python Scripts
```
run_benchmark.py           # Main runner
benchmark_supervisor.py    # Variance detection
meta_harness_loop.py      # Cycle orchestration
config_manager.py          # Config system
routing_enforcer.py        # Auto-apply recommendations
harness_feedback_loop.py  # Recommendations
self_optimizing_policy.py # Decision gates
lock_manager.py           # Stale lock handling
routing_log.py           # Audit trail
```

### Tests
```
test_config_manager.py
test_integration_loop.py  
test_warmup_invoked_when_config_enabled.py
```

### Reference Docs
```
ARCHITECTURE_V2_SELF_OPTIMIZING.md  # System architecture
EXECUTE_LOCALLY.md                  # How to run
EXECUTION_SUMMARY.md               # Results summary
META_LEARNINGS.md                  # Learnings
ROUTING_DECISIONS.md               # Routing logic
WARM_UP_INTEGRATION.md             # Warm-up details
```

---

**Owner:** Clawdie1 (Agent)  
**Status:** Ready for implementation  
**Start Date:** 2026-02-23  
**Target Completion:** 2026-02-26
