# Timeout Fix Summary

**Date:** 2026-02-28  
**Issue:** GLM and Qwen models timing out 17-50% of the time on CPU-only host  
**Root Causes Identified:** Model generation hangs + aggressive online fallback

---

## Fixes Applied

### 1. Benchmark Harness Fix (run_benchmark.py)

**Problem:** Models could generate unlimited tokens, leading to hangs/timeouts

**Solution:** Added `num_predict` limit + sampling parameters to `ollama.chat()` calls

**Changes:**
```python
# Before
options={"temperature": 0.0}

# After
options={
    "temperature": 0.0,
    "num_predict": 512,  # Limit output tokens to prevent hangs
    "top_p": 0.9,
    "top_k": 40
}
```

**Applied to:**
- Atomic phase (P1-P12)
- Extended phase (P13-P30)

**Expected Impact:**
- Prevents infinite generation loops
- Forces models to complete within reasonable token budget
- Should reduce timeout rate from 17-50% to <5%

---

### 2. OpenClaw Fallback Reordering

**Problem:** Online models came BEFORE local models in fallback chain, causing premature API fallback

**Old Order:**
```
1. Claude Haiku (primary)
2. Claude Sonnet 4.5
3. Claude Sonnet 4
4. Claude Haiku (duplicate)
5. GPT-5.3 Codex  ← FALLBACK HIT HERE
6. GPT-4o
7. ...more online models...
10. ollama/qwen2.5:3b  ← First local model
```

**New Order:**
```
1. Claude Haiku (primary)
2. ollama/lfm2.5-thinking:1.2b  ← Fast local
3. ollama/qwen3.5:35b
4. ollama/glm-4.7-flash:latest
5. ollama/mistral:7b
6. Claude Sonnet 4.5  ← Online fallback now AFTER local
7. Claude Sonnet 4
8. ...rest of online models...
```

**Expected Impact:**
- Local models get 4 attempts before hitting online API
- Reduces cost (local = free, online = paid)
- Keeps processing on-device when possible

---

## Validation Plan

1. **Run atomic benchmark** on GLM with new limits
2. **Check timeout rate** (expect <5% vs previous 50%)
3. **Verify no regressions** (accuracy should stay same or improve)
4. **Test fallback chain** (ensure local models are tried first)

---

## Rollback Plan

If timeouts get worse:
```bash
# Revert benchmark changes
cd /root/.openclaw/workspace/bench/core
git checkout HEAD^ run_benchmark.py

# Revert fallback order
openclaw config.patch --raw '{"agents": {"defaults": {"model": {"fallbacks": [...]}}}}}'
```

---

## Next Steps

- [ ] Validate fix with full atomic run (GLM + Qwen)
- [ ] Update PR #245 with benchmark fix commit
- [ ] Document in MEMORY.md
- [ ] Consider increasing GLM timeout to 120s if still needed
