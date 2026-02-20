# Phase 3 Strategy: Retry Survivors with Improved Harness

**Date:** Feb 19, 2026  
**Status:** Planning  
**Objective:** Validate improvements from Phase 2 harness variants and finalize model selection

---

## 1. Early-Exit Rules (Decision Gates)

### Rule 1.1: Skip Phase 3 if Atomic Failure Rate >50%
- **Trigger:** Model fails >6/12 prompts in Phase 1 atomic suite
- **Action:** Archive model, don't retry
- **Rationale:** Fundamental tool-calling inability won't improve with harness tweaks alone

### Rule 1.2: Skip Phase 3 if Restraint = 0
- **Trigger:** Model calls tools when it shouldn't (false positives, restraint factor <0.1)
- **Action:** Flag as unsafe, skip extended phases
- **Applies To:** qwen2.5:3b (restraint 0.33 → needs verification post-Phase 2)
- **Rationale:** Safety-critical; don't retry if model can't learn "don't call tools"

### Rule 1.3: Prioritize Phase 3 if Atomic ≥90%
- **Trigger:** Model scores ≥11/12 in Phase 1 atomic
- **Action:** Fast-track to Phase 3 with full extended suite
- **Applies To:** LFM2.5-1.2B (95.55%)
- **Rationale:** Already production-ready; Phase 3 is validation + margin of error

---

## 2. Phase 3 Candidates

| Model | Score | Restraint | Early-Exit? | Phase 3 Path | Priority |
|-------|-------|-----------|----------|-----------|----------|
| **LFM2.5-1.2B** | 11/12 (95.55%) | 1.0 ✅ | **Fast-Track** | Full extended suite | **HIGH** |
| **mistral:7b** | 8/12 (66.7%) | 0.83 ✅ | **Proceed** | Phase 1 atomic + extended | **HIGH** |
| **gpt-oss:latest** | 7/8 (87.5%)* | ? | **Conditional** | Rerun atomic (60s timeout) then Phase 1 | **MEDIUM** |
| **qwen2.5:3b** | 7/12 (62.2%) | 0.33 ⚠️ | **Hold** | Phase 2 harness only, no retry | **SKIP** |

**Notes:**
- *gpt-oss: Incomplete phase 1 (P9 hung 206s). Must rerun with timeout safeguard.
- qwen: Restraint <0.5 is unsafe. Only retry if Phase 2 harness improves restraint >0.5.

### Candidate Profiles

#### LFM2.5-1.2B (Already Winner)
- **Current:** 11/12 (95.55%), perfect restraint
- **Phase 2 Variant:** Bracket notation `[tool(...)]` (optional, may not improve score)
- **Phase 3 Goal:** Validate 95%+ consistency across extended suite (P13-P30)
- **Expected Improvement:** Minimal (already near ceiling); focus on consistency
- **Risk:** Low (unlikely to regress)

#### mistral:7b (Qualified, Needs Lift)
- **Current:** 8/12 (66.7%), good restraint (0.83)
- **Phase 2 Variant:** Native tools API + verbose system prompt tuning
- **Phase 3 Goal:** Reach ≥75% overall (need 9/12 on atomic or better on extended)
- **Gap:** Missing ~2-3 points through improved prompting or tool format
- **Risk:** Moderate (may plateau)
- **If Successful:** Qualified as secondary fallback

#### gpt-oss:latest (Incomplete, Conditional)
- **Current:** 7/8 (87.5%) partial + P9 hung (200s+ timeout)
- **Phase 2 Variant:** Fast inference mode, 60s per-prompt safeguard
- **Phase 3 Goal:** Complete atomic suite without timeout, validate full score
- **Risk:** High (may repeat timeout, infrastructure issue)
- **Path:** Rerun atomic phase first. If completes: proceed to extended. If hangs again: archive.

#### qwen2.5:3b (Unsafe, On Hold)
- **Current:** 7/12 (62.2%), restraint 0.33 (false positives)
- **Phase 2 Variant:** Enhanced system prompt + safety constraints
- **Phase 3 Gate:** Only proceed if Phase 2 restraint improves to >0.5
- **If Restraint ≤0.33 Post-Phase2:** Archive (unsafe for fallback)

---

## 3. Retry Strategy (Phase 3 Execution)

### 3.1 Harness Improvements (Locked from Phase 2)

All Phase 3 retries use Phase 2-optimized variants:

```json
{
  "lfm": {
    "format": "bracket_notation",
    "system_prompt": "v1_atomic",
    "timeout_per_prompt": 120,
    "retry_on_timeout": false
  },
  "mistral": {
    "format": "native_tools_api",
    "system_prompt": "v2_verbose_judgment",
    "timeout_per_prompt": 60,
    "retry_on_timeout": true
  },
  "gpt_oss": {
    "format": "native_tools_api",
    "system_prompt": "v1_atomic",
    "timeout_per_prompt": 60,
    "fast_inference": true,
    "retry_on_timeout": true
  }
}
```

### 3.2 Retry Sequence

**Phase 3a: Atomic Re-validation (P1-P12)**
1. Run all 12 prompts again with Phase 2 harness
2. Record score, latency, failures
3. Compare Phase 1 → Phase 3 scores
4. Calculate delta: `(Phase3_Score - Phase1_Score) / Phase1_Score * 100`

**Phase 3b: Extended Suite (P13-P30, if atomic passes)**
1. Run only if candidate reaches ≥Phase1_Score on atomic re-run
2. 18 prompts (conversation, failure handling, state tracking)
3. Record all results
4. Compare with standalone Phase 1 extended baseline (if exists)

### 3.3 Comparison Framework

```
Candidate: mistral

| Phase | Score | Atomic | Extended | Avg Latency |
|-------|-------|--------|----------|-------------|
| Phase 1 | 8/12 | 66.7% | N/A | 21.4s |
| Phase 3 | ?/?? | ??% | ?? | ??s |
| **Delta** | | **+X.X%** | | **ΔYs** |
| Assessment | | Pass/Fail | | Accept/Reject |
```

**Accept Criteria for Phase 3:**
- Atomic: Score ≥ Phase 1 (no regression)
- Extended: If run, score ≥ 60% or +5% from Phase 1
- Latency: Within 10s of Phase 1 baseline (no slowdown)

---

## 4. Success Criteria

### 4.1 LFM2.5-1.2B
| Criterion | Target | Phase 1 | Pass Condition |
|-----------|--------|---------|----------------|
| Atomic Score | ≥95% | 95.55% | ≥11/12 |
| Restraint | ≥1.0 | 1.0 | = 1.0 |
| Consistency | ≥90% on extended | N/A | ≥27/30 on P13-P30 |
| **Outcome** | **Lock as Primary** | — | All ≥ targets |

**Fallback:** If score drops <90%, investigate Phase 2 variant impact.

### 4.2 mistral:7b
| Criterion | Target | Phase 1 | Gap |
|-----------|--------|---------|-----|
| Atomic Score | ≥75% | 66.7% | +8.3% (need 1 more point) |
| Restraint | ≥0.8 | 0.83 | ✅ |
| Extended (P13-P30) | ≥70% | N/A | TBD |
| **Outcome** | **Qualify if ≥75%** | — | Conditional |

**Path to Success:**
- Phase 2 prompting improves by 1+ points → Phase 3 validates → Lock as secondary fallback
- If Phase 3 stays ≤66.7% → Archive as insufficient

### 4.3 gpt-oss:latest
| Criterion | Target | Phase 1 | Status |
|-----------|--------|---------|--------|
| Complete P1-P12 | No timeout | Partial (P9 hung) | ⚠️ Critical |
| Atomic Score | ≥75% | 87.5%* | TBD on completion |
| Restraint | ≥0.8 | ? | Unknown |
| **Outcome** | **Qualify if complete + ≥75%** | — | Conditional |

**Go/No-Go Gate:** If P3 re-run times out again → Archive (infrastructure incompatibility)

### 4.4 qwen2.5:3b
| Criterion | Target | Phase 1 | Status |
|-----------|--------|---------|--------|
| Restraint | >0.5 | 0.33 | ⚠️ Unsafe |
| Phase 2 Improvement | +0.2 min | 0.33 | Must verify |
| **Outcome** | **Archive if restraint ≤0.5** | — | On Hold |

---

## 5. Decision Tree

```
Phase 3 Start
│
├─→ LFM2.5-1.2B
│   ├─ Run P1-P12 (atomic) + P13-P30 (extended)
│   ├─ If Score ≥ 11/12: ✅ LOCK as Primary Fallback
│   ├─ If Score = 10/12: ⚠️ Investigate Phase 2 variant impact
│   └─ If Score < 10/12: 🔄 Revert Phase 2 variant, retry
│
├─→ mistral:7b
│   ├─ Run P1-P12 (atomic) with Phase 2 variant
│   ├─ If Score ≥ 9/12 (≥75%):
│   │  ├─ Run P13-P30 (extended)
│   │  ├─ If Extended ≥ 70%: ✅ LOCK as Secondary Fallback
│   │  └─ If Extended < 70%: ⚠️ Conditional (doc limitations)
│   ├─ If Score = 8/12 (66.7%): 🤔 Borderline
│   │  ├─ Check Phase 2 system prompt impact
│   │  └─ If no improvement: 📦 Archive (gap too wide)
│   └─ If Score < 8/12: 📦 ARCHIVE
│
├─→ gpt-oss:latest
│   ├─ Run P1-P12 with 60s timeout safeguard
│   ├─ If completes (no timeout):
│   │  ├─ Score ≥ 7/8 (87.5%): ✅ Proceed to P13-P30
│   │  └─ Score < 7/8: ⚠️ Investigate Phase 2 impact
│   └─ If times out: 📦 ARCHIVE (infrastructure incompatibility)
│
└─→ qwen2.5:3b
    ├─ Phase 2 harness optimization ONLY
    ├─ If restraint improves to >0.5: Proceed to Phase 3
    └─ If restraint ≤0.5: 📦 ARCHIVE (safety risk)
```

---

## 6. Timeline

### Phase 3 Schedule

| Step | Owner | Duration | Deadline |
|------|-------|----------|----------|
| 1. Prepare Phase 2 harness configs | Bench | 30 min | Feb 19, 23:00 |
| 2. Run LFM2.5 atomic re-test | Bench | 15 min (P1-P12) | Feb 20, 06:00 |
| 3. Run mistral atomic re-test | Bench | 20 min | Feb 20, 07:00 |
| 4. Run gpt-oss atomic re-test (60s timeout) | Bench | 25 min | Feb 20, 08:00 |
| 5. Evaluate gpt-oss pass/fail | QA | 10 min | Feb 20, 08:30 |
| 6. Run extended suite (P13-P30) on passing candidates | Bench | 1.5h per model | Feb 20, 12:00 |
| 7. Compare Phase 1 → Phase 3 deltas | QA | 30 min | Feb 20, 14:00 |
| 8. Decision + Lock winner | QA | 20 min | Feb 20, 14:30 |
| 9. Archive losers + document lessons | Ops | 30 min | Feb 20, 15:00 |

**Total Time:** ~4 hours (parallelizable: atomic tests can run in parallel)

### Parallelization
- **Atomic tests (P1-P12):** Run LFM + mistral + gpt-oss in parallel → 25 min total
- **Extended suites:** Serial (after atomic validation) → 1.5h each
- **Decision + Archive:** Sequential → 50 min

**Optimized Timeline:** Feb 20, 06:00 - 15:00 (9 hours wall clock, ~4 CPU hours)

---

## 7. Resource Estimate

### Compute

| Phase | Model | Prompts | Avg Latency | Total Time |
|-------|-------|---------|-------------|------------|
| 3a (Atomic) | LFM2.5 | 12 | 32s | 6 min |
| 3a (Atomic) | mistral | 12 | 21s | 4 min |
| 3a (Atomic) | gpt-oss | 12 | ? | 8 min (est.) |
| 3b (Extended) | LFM2.5 | 18 | 32s | 10 min |
| 3b (Extended) | mistral | 18 | 21s | 6 min |
| 3b (Extended) | gpt-oss | 18 | ? | 12 min (est.) |
| **Total** | — | 90 | — | **46 min** |

**Infrastructure:**
- Ollama server (LFM2.5, mistral, qwen)
- OpenClaw LLM API (gpt-oss)
- Bench harness (Python, <1GB memory)
- Storage: ~2MB per candidate (results JSON)

### Dependencies
- Phase 2 harness configs (locked, ready)
- Phase 1 baseline scores (ready)
- Extended prompt suite P13-P30 (ready in `extended_benchmark_suite.json`)

### No Blockers
✅ All dependencies satisfied as of Feb 19, 22:00

---

## 8. Next Steps After Phase 3

### 8.1 Scenario A: LFM2.5 Confirmed + mistral Qualified

```
✅ Phase 3 Complete

1. Lock LFM2.5-1.2B
   → Set as primary in openclaw.json fallback
   → Timeout: 120s per prompt
   → System prompt: v1_atomic (bracket notation)
   → Update MEMORY.md: "LFM2.5 production-ready"

2. Qualify mistral:7b as secondary (if ≥75% or ≥70% extended)
   → Document limitations (not for critical judgment tasks)
   → Reserve for load-balancing (primary down)
   → Mark in openclaw.json with fallback_secondary

3. Archive gpt-oss (if timeout repeated or <75%)
   → Document: "Infrastructure incompatibility"
   → Keep results for historical record

4. Archive qwen (safety risk: restraint 0.33)
   → Document: "False positives in tool-calling"
   → Recommend future review with improved RLHF
```

### 8.2 Scenario B: mistral Fails Phase 3

```
❌ Phase 3 Inconclusive

1. LFM2.5 → Lock as primary (unchanged)

2. mistral fails to reach ≥75%
   → Evaluate if Phase 2 system prompt helps other models
   → If not: Archive mistral, recommend ollama:mistral-large instead

3. gpt-oss passes?
   → Could become secondary fallback (if complete + ≥75%)
   → Otherwise: Archive

4. Escalate to Phase 4: Alternative model evaluation
   → Test ollama:mistral-large or ollama:llama2-70b
   → or switch to external API (Claude 3 Opus fallback)
```

### 8.3 Phase 3 Output Files

Create post-Phase 3 folder:

```
/root/.openclaw/workspace/bench/phase3_results/
├── PHASE3_RESULTS.md          # Final scores, deltas, decisions
├── lfm2.5_phase3_atomic.json  # Full 12-prompt results
├── lfm2.5_phase3_extended.json  # P13-P30 results
├── mistral_phase3_atomic.json
├── mistral_phase3_extended.json
├── gpt_oss_phase3_atomic.json
└── DECISION.md                # Winner selection + reasoning
```

### 8.4 Lock Winner for openclaw.json

```json
{
  "fallback_llm": {
    "primary": {
      "model": "lfm2.5",
      "format": "bracket_notation",
      "timeout_seconds": 120,
      "system_prompt_version": "v1_atomic"
    },
    "secondary": {
      "model": "mistral:7b",  // if qualified
      "format": "native_tools_api",
      "timeout_seconds": 60,
      "system_prompt_version": "v2_verbose_judgment"
    },
    "phase3_validated": "2026-02-20T15:00Z",
    "phase3_candidate_scores": {
      "lfm2.5": "11/12 → ?/12",
      "mistral": "8/12 → ?/12",
      "gpt_oss": "partial → [decision]",
      "qwen": "archived"
    }
  }
}
```

### 8.5 Document Lessons Learned

Update `/root/.openclaw/workspace/bench/LESSONS_LEARNED.md`:

```markdown
## Phase 3 Takeaways

- **LFM2.5 robustness:** Score remained stable (95%+) across variants
- **Mistral bottleneck:** System prompt verbosity helps, but still misses judgment
- **gpt-oss timeout:** Infrastructure issue, not model limitation
- **qwen restraint:** Safety-critical; false positives prevent production use

### Recommendations for Future Phases
1. Test longer-context mistral variant (e.g., mistral-large)
2. Investigate gpt-oss timeout (likely OOM or slow inference)
3. Consider qwen with RLHF fine-tuning on tool-calling safety
4. Measure latency-accuracy tradeoff (faster models vs. accuracy)
```

---

## Summary

| Aspect | Details |
|--------|---------|
| **Objective** | Validate Phase 2 improvements, lock winner for openclaw.json |
| **Candidates** | LFM2.5 (fast-track), mistral (conditional), gpt-oss (if complete), qwen (hold) |
| **Duration** | 4 CPU hours, ~9 hours wall clock on Feb 20 |
| **Success** | LFM2.5 ≥95% (expected), mistral ≥75% (conditional) |
| **Output** | phase3_results/ folder + DECISION.md + updated openclaw.json |
| **Risk** | Low (LFM2.5 unlikely to regress; gpt-oss timeout repeats possible) |

**Next Action:** Execute Phase 3a (atomic re-validation) on Feb 20, 06:00 UTC+1
