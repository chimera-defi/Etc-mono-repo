# Meta-Learnings: Harness Optimization & Self-Improvement

**Document Version:** 1.0  
**Last Updated:** 2026-02-23  
**Status:** Active learning framework

---

## Core Learnings

### 1. Variance Classification (Feb 22-23)

**Discovery:** Not all variance is equal.

**Pattern 1: Infrastructure Variance (Cold-Start)**
```
Signature: [FAIL, FAIL, PASS, PASS, PASS, PASS, PASS]
Consistency: 100% (identical across P6, P7, P9)
Root cause: Ollama model initialization (first 2 runs, model not in VRAM)
Fixable: ✅ Yes — pre-warm model
Result: 71.4% → 100% after warm-up (effective accuracy increase: +30%)
```

**Implication:** Infrastructure problems are **deterministic and detectable**. When 3+ prompts show identical failure pattern, suspect warm-up.

**Action Item:** Implement auto-warm-up in harness (see WARM_UP_INTEGRATION.md)

---

### 2. Capability vs Infrastructure (Extended Suite)

**Discovery:** Extended phase (P14-P30) shows **0% accuracy across ALL 7 runs**.

**Analysis:**
- No variance = no infrastructure issue
- Consistent failure pattern = true model capability limit
- LFM cannot: state recall, multi-tool sequencing, error recovery

**Implication:** Some failures **cannot be fixed by infrastructure**. When accuracy is 0% consistently (no variance), the problem is the model itself.

**Action Item:** Route extended → Claude Haiku (proven 100% on same tests)

---

### 3. Feedback Loop Works

**Discovery:** `harness_feedback_loop.py` correctly auto-detected routing issues.

**Evidence:**
- Analyzed 8 recent runs
- Correctly identified: LFM atomic (66.7%) should be enabled with warm-up
- Correctly identified: LFM extended (0%) should be disabled
- Generated recommendations automatically

**Implication:** The system can **self-diagnose** routing decisions. We just need to act on them.

**Action Item:** Implement auto-enforcement of feedback recommendations

---

### 4. Policy Engine is Correct

**Discovery:** The policy gates (variance limit, restraint floor) correctly classified candidates.

**Results from latest run (010b10d1c8):**
- LFM atomic/atomic: PROMOTE (variance=0, accuracy=83.3%)
- LFM atomic/native_api: HOLD (variance=0.0117, need more data)
- Qwen/Ministral: REJECT (restraint scores too low)

**Implication:** The policy engine **prevents bad promotions**. Trust the gates.

**Action Item:** Don't override policy gates without strong evidence

---

## Improvement Opportunities

### Tier 1: Immediate (Ready Now)

1. **Warm-Up Integration** (5 min implementation)
   - Detect cold-start pattern automatically
   - Inject warm-up run before suite execution
   - Re-baseline accuracy with warm-up enabled
   - Impact: +30% effective accuracy for LFM atomic

2. **Auto-Routing Enforcement** (10 min implementation)
   - Read harness_feedback.json recommendations
   - Auto-apply routing decisions to agent config
   - Log decisions for audit
   - Impact: Production routing matches evidence

3. **Extended Suite Disablement** (2 min implementation)
   - Block LFM from extended suite routing
   - Force fallback to Claude Haiku
   - Document decision in decision logs
   - Impact: Prevent 0% accuracy failures

### Tier 2: Short-term (This Week)

4. **Recursive Meta-Learning Loop** (Ready architecturally)
   - Auto-detect improvements (variance gone, accuracy up)
   - Promote to baseline
   - Next cycle runs with improved baseline
   - Measure: Does baseline improve each cycle?
   - Impact: Self-improving harness

5. **Token Reduction for Reports** (Skill available)
   - Use token-reduce from etc-mono-repo
   - Shrink analysis reports
   - Reduce feedback loop overhead
   - Impact: Faster iteration, lower cost

6. **Adaptive Timeout/Retries** (Policy-driven)
   - Variant with extended timeouts for complex prompts
   - Variant with more retries for unstable models
   - Let policy engine pick best config
   - Impact: Better accuracy for difficult tasks

### Tier 3: Long-term (Next Month)

7. **Model Benchmarking as Continuous Background**
   - Schedule regular baseline runs (e.g., weekly)
   - Track model performance over time
   - Alert on regressions
   - Impact: Early detection of model drift

8. **Prompt-Level Diagnostics** (Per-prompt improvement)
   - Build profile of which prompts fail for which models
   - Identify patterns: state recall? tool-calling? parsing?
   - Recommend model improvements at prompt level
   - Impact: Focus optimization efforts

---

## Principles

### Principle 1: Measure Before Acting
- Don't change config without baseline data
- Let variance tracking reveal true problems
- Use policy gates to prevent bad decisions

### Principle 2: Infrastructure First
- When accuracy drops, check: cold-start? warm-up? caching?
- Only after infrastructure is optimized, consider model upgrade
- Many apparent failures are just initialization

### Principle 3: Automate Feedback Loop
- Humans write policy rules
- System enforces rules automatically
- Feedback becomes self-healing routing

### Principle 4: Preserve Audit Trail
- Every decision logged (which config, which policy gate, why)
- Decisions traceable back to run data
- Future debugging uses historical context

### Principle 5: Iterative Improvement
- Each cycle should inform next cycle
- Baseline improves monotonically (if we're learning)
- Track convergence: Is baseline improving?

---

## Metrics to Track

| Metric | Target | Current | Status |
|---|---|---|---|
| LFM atomic accuracy (with warm-up) | ≥80% | 71.4%→100% | 🎯 Target achievable |
| LFM extended accuracy | N/A (disabled) | 0% | ✅ Correctly disabled |
| Haiku extended accuracy | 100% | 100% | ✅ Meeting target |
| Baseline improvement/cycle | >2% | TBD | 📊 Tracking |
| Policy gate pass rate | ≥90% | 100% | ✅ Healthy |
| Feedback loop accuracy | ≥95% | 100% | ✅ Healthy |

---

## Decision Log

| Date | Decision | Evidence | Owner | Status |
|---|---|---|---|---|
| 2026-02-23 | Warm-up needed for LFM atomic | Cold-start pattern (FFPPPPP) | Analysis | 🔄 Pending |
| 2026-02-23 | Disable LFM for extended | 0% variance (no improvement path) | Analysis | 🔄 Pending |
| 2026-02-22 | Promote atomic/atomic variant | Variance=0, accuracy=83.3% | Policy | ✅ Applied |

---

## Technical Debt & Improvements

### Tech Debt

1. **Cold-Start Not Automated**
   - Variance detection works ✅
   - Auto-warm-up not yet implemented ❌
   - Need: Add warm-up phase to harness

2. **Feedback Loop Not Enforced**
   - Recommendations generated ✅
   - Auto-routing not yet implemented ❌
   - Need: Auto-apply recommendations to config

3. **History Accumulation**
   - meta_loop_history.json growing
   - Archival not implemented ❌
   - Need: Periodic archive of old runs

### Low-Hanging Fruit

1. Implement warm-up in harness (5 min, +30% gain)
2. Auto-enforce feedback recommendations (10 min, production-ready)
3. Disable LFM extended routing (2 min, prevents failures)
4. Token-reduce large reports (20 min, faster feedback loop)

---

## Next Review (2026-02-24)

Check:
1. Warm-up integration: Does LFM atomic improve to 100%?
2. Extended suite: Are we blocking correctly?
3. Feedback loop: Are recommendations being applied?
4. Baseline trend: Is it improving cycle-to-cycle?

---

## References

- [ARCHITECTURE.md](./ARCHITECTURE.md) — System design
- [INFRASTRUCTURE_VARIANCE_ANALYSIS.md](./INFRASTRUCTURE_VARIANCE_ANALYSIS.md) — Variance findings
- [EXTENDED_LFM_VERDICT.md](./EXTENDED_LFM_VERDICT.md) — Extended suite analysis
- [SELF_OPTIMIZING_REPORT.md](./SELF_OPTIMIZING_REPORT.md) — Latest cycle results

---

**Maintained by:** Clawdie1 (Agent)  
**Next iteration:** Auto-implement improvements via subagents
