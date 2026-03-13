# Model Selection Guide

**Last Updated:** 2026-02-19  
**Purpose:** Help users choose the optimal model for their use case based on performance, safety, and speed metrics.

---

## Quick Decision Tree

```
START: What's your priority?
│
├─ "Safety is critical" → Production (Primary Fallback)
│  └─ LFM2.5-1.2B ✅
│
├─ "Speed matters most" → Fast Fallback
│  └─ mistral:7b ⚡
│
├─ "Testing new safety approach" → Safety Benchmark
│  └─ qwen2.5:3b (safety variant) 🧪
│
├─ "I need tool-calling reliability" → Production
│  └─ LFM2.5-1.2B ✅
│
├─ "Multi-turn conversation" → Fast with extended support
│  └─ mistral:7b (44.4% phase data) 💬
│
└─ "Research/experimental work" → Experimental
   └─ gpt-oss:latest ⚠️
```

---

## 1. Production (Primary Fallback) — LFM2.5-1.2B

### Specs
- **Accuracy:** 95.55% ⭐⭐⭐⭐⭐
- **Safety/Restraint:** Perfect (100% aligned)
- **Speed:** 31.9s/prompt
- **Size:** 1.2B parameters
- **Status:** Production-ready

### When to Use
- ✅ Safety-critical applications
- ✅ Legal/compliance-sensitive tasks
- ✅ Tool-calling that must not fail
- ✅ No time pressure
- ✅ Risk of model refusal is acceptable

### Strengths
- Highest accuracy across benchmarks
- Never produces harmful output
- Reliable instruction following
- Excellent at restraint (won't overstep)
- Best for chains of reasoning

### Weaknesses
- Slowest option (31.9s per prompt)
- May refuse valid edge-case requests
- Overkill for simple tasks
- Resource-intensive

### Example Use Cases
- Content moderation decisions
- Medical/legal document analysis
- Sensitive system instructions
- Compliance verification

---

## 2. Fast Fallback — mistral:7b

### Specs
- **Accuracy:** 66.7% ⭐⭐⭐
- **Safety/Restraint:** Moderate
- **Speed:** 21.4s/prompt ⚡
- **Extended Phase Data:** 44.4% (multi-turn)
- **Size:** 7B parameters
- **Status:** Production-ready with caveats

### When to Use
- ✅ Speed is prioritized over perfect accuracy
- ✅ Acceptable to have ~33% error margin
- ✅ Real-time or near-real-time responses needed
- ✅ Multi-turn conversations (44.4% extended phase)
- ✅ Cost-conscious deployments

### Strengths
- 49% faster than LFM2.5
- Good enough for most tasks
- Better at multi-turn conversations
- More lenient (fewer false refusals)
- Better resource efficiency

### Weaknesses
- 28.85% lower accuracy than LFM2.5
- Less conservative on edge cases
- May hallucinate more
- Weaker constraint satisfaction

### Example Use Cases
- Chat applications
- Quick customer support responses
- Brainstorming and creative writing
- Real-time recommendation systems
- General-purpose assistants

---

## 3. Safety Benchmark (Conservative) — qwen2.5:3b

### Specs
- **Accuracy:** 62.2% (baseline) → improving with variant
- **Safety/Restraint:** Maximum (intentional over-caution)
- **Speed:** ~25-28s/prompt
- **Size:** 3B parameters
- **Status:** Experimental/Testing phase

### When to Use
- ✅ Studying safety instruction effects
- ✅ Testing new safety mechanisms
- ✅ Comparing conservative vs. moderate approaches
- ✅ Educational/research purposes
- ✅ Validating alignment techniques

### Strengths
- Conservative by design (study baseline)
- Middle ground in size/speed
- Good for safety research
- Improving accuracy with variants
- Good for compliance testing

### Weaknesses
- Lower baseline accuracy (62.2%)
- May refuse valid requests more than needed
- Still under optimization
- Not recommended for production (yet)
- Limited real-world deployment data

### Example Use Cases
- Safety research and validation
- Alignment testing
- Instruction-following studies
- Conservative fallback option
- Educational demonstrations

---

## 4. Experimental — gpt-oss:latest

### Specs
- **Accuracy:** 41.7% ⭐
- **Issues:** Known problems with instruction following
- **Speed:** Slow (variable, often >40s)
- **Status:** ⚠️ **NOT for production**
- **Reliability:** Low

### When to Use
- ✅ Research and experimentation
- ✅ Proof-of-concept work
- ✅ Benchmarking comparative performance
- ✅ Novel approach testing
- ✅ Educational/learning purposes

### When NOT to Use
- ❌ Any production system
- ❌ When reliability matters
- ❌ Real user-facing applications
- ❌ Time-sensitive tasks
- ❌ Safety-critical work

### Known Issues
- Poor instruction following
- Slow inference
- High failure rates
- Inconsistent outputs
- Not well-maintained

### Example Use Cases
- Benchmarking baseline
- Research comparisons
- Proof-of-concept only
- Understanding failure modes

---

## 5. Recommendations by Use Case

### Tool-Calling Reliability
```
🥇 Gold:     LFM2.5-1.2B (95.55% accuracy)
🥈 Silver:   mistral:7b (66.7%, faster)
🥉 Bronze:   qwen2.5:3b (62.2%, conservative)
❌ Avoid:    gpt-oss:latest (41.7%)
```
**Guidance:** Tool calling requires high reliability. Use LFM2.5-1.2B unless time constraints are extreme. mistral:7b acceptable for non-critical tools.

### Speed + Accuracy Trade-off
```
🥇 Gold:     mistral:7b (66.7%, 21.4s)
🥈 Silver:   qwen2.5:3b (62.2%, ~27s)
🥉 Bronze:   LFM2.5-1.2B (95.55%, 31.9s — trade-off not ideal)
❌ Avoid:    gpt-oss:latest (41.7%, slow)
```
**Guidance:** mistral:7b offers the best speed/accuracy balance for interactive applications.

### Multi-Turn Conversations
```
🥇 Gold:     mistral:7b (44.4% extended phase)
🥈 Silver:   LFM2.5-1.2B (consistent, but slower)
🥉 Bronze:   qwen2.5:3b (improving, experimental)
❌ Avoid:    gpt-oss:latest (unreliable context)
```
**Guidance:** mistral:7b has demonstrated extended conversation support. LFM2.5-1.2B reliable but slow for chat.

### Safety-Critical Applications
```
🥇 Gold:     LFM2.5-1.2B (perfect restraint, 95.55%)
🥈 Silver:   qwen2.5:3b (maximum caution, research)
🥉 Bronze:   mistral:7b (moderate, acceptable for most)
❌ Avoid:    gpt-oss:latest (unpredictable)
```
**Guidance:** LFM2.5-1.2B is the only choice for regulatory/compliance work.

### New Model Testing
```
🥇 Gold:     qwen2.5:3b (designed for variant testing)
🥈 Silver:   mistral:7b (stable baseline)
🥉 Bronze:   LFM2.5-1.2B (production baseline)
✅ Research: gpt-oss:latest (benchmark only)
```
**Guidance:** Follow Phase 2 harness pattern for qwen2.5:3b variants. Use LFM2.5-1.2B as production control.

---

## Failure Modes

### LFM2.5-1.2B
| Failure Mode | Cause | Impact | Mitigation |
|---|---|---|---|
| Over-refusal | Safety constraints too strict | Valid requests denied | Accept as design trade-off |
| Slow response | 31.9s baseline | Poor UX for real-time | Use mistral:7b for speed |
| Context limits | 1.2B model size | Long conversations fail | Implement context windowing |

### mistral:7b
| Failure Mode | Cause | Impact | Mitigation |
|---|---|---|---|
| Hallucination | Lower accuracy (66.7%) | Plausible false info | Verify outputs for critical work |
| Tool-calling errors | ~33% error rate | Functions fail | Add fallback to LFM2.5-1.2B |
| Inconsistent safety | Moderate restraint | Unpredictable refusals | Document behavior, set expectations |
| Long context loss | Degradation after 44.4% | Multi-turn breakdown | Summarize, reset context |

### qwen2.5:3b
| Failure Mode | Cause | Impact | Mitigation |
|---|---|---|---|
| Lower accuracy | 62.2% baseline | Often wrong | Not for production (yet) |
| Intentional over-refusal | Safety research design | Too cautious | Accept for testing, use LFM2.5 for prod |
| Variant instability | Experimental phase | Unpredictable behavior | Follow Phase 2 harness strictly |

### gpt-oss:latest
| Failure Mode | Cause | Impact | Mitigation |
|---|---|---|---|
| Poor instruction following | Model quality | Ignores prompts | Benchmark only, research use |
| Slow inference | Optimization issues | Unacceptable latency | Don't use for real work |
| High hallucination | 41.7% accuracy | Unreliable output | Never rely on outputs |
| Context confusion | Architecture issues | Lost state | Not suitable for conversations |

---

## Upgrade Path

### Current Production Scenario
You're using **mistral:7b** in production (fast, acceptable accuracy).

**Path forward:**
1. **Monitor:** Track error rates, refusal patterns, user feedback
2. **Test:** Run A/B tests with LFM2.5-1.2B on 10% of traffic
3. **Benchmark:** Compare latency vs. accuracy (31.9s vs. 21.4s)
4. **Decide:**
   - If accuracy matters more → **Switch to LFM2.5-1.2B**
   - If speed is critical → **Stay with mistral:7b**
   - If safety critical → **Add LFM2.5-1.2B fallback**

### Current Safety-Critical Scenario
You're using **LFM2.5-1.2B** (perfect, but slow).

**Path forward:**
1. **Acceptance:** 31.9s/prompt is the baseline
2. **Optimization:**
   - Batch requests where possible
   - Cache common responses
   - Use mistral:7b for low-risk tasks (tagging, categorization)
3. **Monitoring:**
   - Track refusal rates (should be near-zero)
   - Alert if safety violations detected
   - Validate constraint satisfaction

### Evaluation Scenario
You're researching **qwen2.5:3b** variants.

**Path forward:**
1. **Baseline:** Document 62.2% accuracy as starting point
2. **Test variants:** Follow Phase 2 harness pattern
3. **Compare:** Measure against LFM2.5-1.2B (gold) and mistral:7b (silver)
4. **Gate to production:** Only move to production if accuracy >90% AND safety validated

---

## Performance Comparison Table

| Model | Accuracy | Speed | Safety | Use Case | Status |
|---|---|---|---|---|---|
| **LFM2.5-1.2B** | 95.55% ⭐⭐⭐⭐⭐ | 31.9s | Perfect | Safety-critical, tool-calling | ✅ Production |
| **mistral:7b** | 66.7% ⭐⭐⭐ | 21.4s | Moderate | Speed-priority, chat | ✅ Production |
| **qwen2.5:3b** | 62.2% → ↑ | ~27s | Maximum | Safety research | 🧪 Experimental |
| **gpt-oss:latest** | 41.7% ⭐ | >40s | Unpredictable | Benchmark only | ❌ Not recommended |

---

## Selection Checklist

Ask yourself:

- [ ] Is safety critical? → **LFM2.5-1.2B**
- [ ] Do I need to call tools reliably? → **LFM2.5-1.2B**
- [ ] Is response time <5s required? → **mistral:7b**
- [ ] Is this a multi-turn conversation? → **mistral:7b**
- [ ] Am I testing a new approach? → **qwen2.5:3b**
- [ ] Is this research only? → **gpt-oss:latest**

If uncertain: **Default to LFM2.5-1.2B** (safest choice).

---

## Phase 2 Harness Pattern (For Model Testing)

When evaluating new variants (e.g., qwen2.5 safety improvements):

```
Phase 2 Harness:
1. Control Group (LFM2.5-1.2B)
   → Gold standard baseline
   → Measure against this

2. Test Group (qwen2.5:3b variant)
   → Run identical prompts
   → Measure accuracy, safety, speed
   → Compare to control

3. Analysis
   → If variant > 90% accuracy + safety validated
   → AND faster than LFM2.5-1.2B
   → Consider promotion to production

4. Graduation Criteria
   → Accuracy ≥ 90%
   → Safety validated (no harmful outputs)
   → Speed competitive (≤25s acceptable)
   → Real-world testing (100+ samples)
```

---

## FAQ

**Q: Can I use mistral:7b for compliance work?**  
A: Only if the compliance requirement doesn't mandate the highest safety standard. When in doubt, use LFM2.5-1.2B.

**Q: Is qwen2.5:3b ready for production?**  
A: Not yet. Current accuracy (62.2%) is too low. It's for research only.

**Q: Why is gpt-oss:latest so slow?**  
A: Known optimization issues and poor inference efficiency. Not recommended.

**Q: Can I mix models (use different models for different requests)?**  
A: Yes! Route high-risk requests to LFM2.5-1.2B, low-risk to mistral:7b.

**Q: What if I need <10s response time?**  
A: mistral:7b (21.4s) is the fastest reliable option. If you need faster, consider model quantization or caching.

**Q: When should I re-evaluate this guide?**  
A: Check quarterly or when new model versions are released. Update benchmarks accordingly.

---

## Version History

| Version | Date | Changes |
|---|---|---|
| 1.0 | 2026-02-19 | Initial guide with 4 models and 5 use cases |

