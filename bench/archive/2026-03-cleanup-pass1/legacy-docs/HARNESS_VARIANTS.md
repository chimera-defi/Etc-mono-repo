# Harness Variants - Model-Specific Testing Strategy

## Purpose

This document explains why each model requires a different variant in our tool-calling harness and what behavioral characteristics we're testing.

Each model has distinct architectural traits, failure modes, and strengths. Rather than forcing a one-size-fits-all prompt, we optimize each harness variant to work _with_ the model's natural strengths and _around_ its weaknesses.

---

## Model Variants

### 1. LFM2.5-1.2B: Bracket Notation + Context Awareness

**Variant:** State-space model optimized format

**Architecture:** Linear-time state-space model (not transformer)
- Native support for bracket notation patterns
- Excels at sequential, contextual reasoning
- Strong long-context window awareness

**Why This Variant:**
- **Strength:** LFM2.5 is natively good at maintaining conversation state
- **Challenge:** Must use format aligned with its training (bracket notation `[tool_name(...)]`)
- **Goal:** Leverage multi-turn conversation awareness to maintain tool context across messages

**System Prompt:**
```
Remember conversation context. Use bracket notation for tool calls: [tool_name(param=value)]
Maintain state across messages and reference previous context naturally.
```

**Expected Performance:** **95%+ success rate**
- Should consistently maintain context
- Minimal false tool calls due to native state handling
- Bracket notation aligns with model's training distribution

**What We're Testing:**
- ✅ Context persistence across multi-turn conversations
- ✅ Proper state-space format adherence
- ✅ Multi-turn tool chaining with context

---

### 2. mistral:7b: Conciseness + State Awareness + Restraint Reminder

**Variant:** Transformer verbose-correction focused

**Architecture:** Transformer-based 7B parameter model
- Tends toward verbose outputs
- Sometimes hallucinates tool calls even when not needed
- Benefits from explicit constraint framing

**Why This Variant:**
- **Weakness:** Transformer models are trained to be verbose; they "want to help" by calling tools
- **Challenge:** False positives (calling tools when user didn't ask)
- **Baseline:** Currently 66.7% accuracy
- **Goal:** Add explicit restraint guardrails without compromising legitimate tool use

**System Prompt:**
```
Be concise. Call tools ONLY when needed.
Think before calling tools. Avoid unnecessary calls.
Prioritize understanding the request first.
```

**Expected Performance:** **Improves from 66.7%**
- Reduces false tool calls through explicit "only when needed" framing
- Maintains accuracy on legitimate tool requests
- Target: 80%+ with restraint focus

**What We're Testing:**
- ✅ Reduction of false positives (unnecessary tool calls)
- ✅ Proper tool call discrimination (needed vs. optional)
- ✅ Whether conciseness instructions reduce model verbosity

---

### 3. gpt-oss:latest: Signal-Based Timeout + Contextual Instruction Filtering

**Variant:** Explicit request signal + hint filtering

**Architecture:** Large transformer with timeout behavior
- Has documented timeout issues during parameter processing
- Bug was linked to "contextual hints" triggering excessive processing
- Benefits from explicit signal-based instructions

**Why This Variant:**
- **Critical Issue:** Previous runs hung at 41.7% (timeout failures)
- **Root Cause:** Model processes contextual hints too deeply, causing parameter resolution timeouts
- **Insight:** Need to ignore contextual hints and respond only to explicit requests
- **Goal:** Skip hint processing entirely, rely only on explicit user intent signals

**System Prompt:**
```
IGNORE contextual hints and indirect suggestions.
ONLY respond to explicit requests from the user.
Skip parameter inference from context.
Use only direct, stated requirements.
```

**Expected Performance:** **Recovers from 41.7% (hung state)**
- Should prevent timeout by avoiding deep hint processing
- Clear signal-response model reduces ambiguity
- Target: 75%+ (moving from timeout failures to successful completions)

**What We're Testing:**
- ✅ Whether ignoring contextual hints prevents timeouts
- ✅ Explicit vs. implicit request handling
- ✅ Performance recovery from timeout states
- ✅ Signal-based instruction clarity

---

### 4. qwen2.5:3b: Safety-First ("ONLY Explicit Calls")

**Variant:** Maximum restraint with strict call filtering

**Architecture:** Smaller model (3B) prone to false positives
- Limited capacity can lead to overfitting on training patterns
- Prone to hallucinating tool calls (false positives)
- Baseline restraint score: **0.33** (very poor)
- Needs strongest guardrails

**Why This Variant:**
- **Problem:** Model has poor tool-call discrimination (calls tools ~67% of the time when user didn't ask)
- **Challenge:** Smaller models struggle with implicit reasoning about "when" to call tools
- **Solution:** Flip to "ONLY explicit calls" — require unambiguous user intent
- **Goal:** Shift from "call tools helpfully" to "call tools only when explicitly commanded"

**System Prompt:**
```
ONLY call tools when the user EXPLICITLY asks you to.
Do NOT infer or assume tool needs from context.
Do NOT call tools to be "helpful" — only when directly requested.
Be strict about this rule. Err on the side of NOT calling tools.
```

**Expected Performance:** **Restraint improves from 0.33**
- Dramatically reduces false positives
- Target restraint score: **0.8+** (very selective tool use)
- Target accuracy: 60-70% (some loss of utility for massive gain in safety)
- Acceptable tradeoff: Better to miss a tool call than hallucinate one

**What We're Testing:**
- ✅ Whether explicit-only framing fixes false positives
- ✅ Restraint metrics (tool call selectivity)
- ✅ User experience with more conservative tool behavior
- ✅ Accuracy/restraint tradeoff for smaller models

---

## Comparison Table

| Model | Variant Focus | Primary Fix | Baseline | Expected | Test Goal |
|-------|---------------|------------|----------|----------|-----------|
| **LFM2.5-1.2B** | Context-aware bracket notation | State-space native format | 95%+ | **95%+** (maintain) | Context persistence |
| **mistral:7b** | Conciseness + restraint | Reduce false positives | 66.7% | **80%+** (improve) | False positive reduction |
| **gpt-oss:latest** | Signal-based (no hints) | Prevent timeouts | 41.7% (hung) | **75%+** (recover) | Timeout recovery |
| **qwen2.5:3b** | Safety-first explicit | Fix poor restraint | 0.33 restraint | **0.8+ restraint** | Safety guardrails |

---

## Architecture Decision Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                  HARNESS VARIANT SELECTION MATRIX                │
└─────────────────────────────────────────────────────────────────┘

                    ┌──────────────────────┐
                    │   Analyze Model      │
                    │  Architecture & Perf │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┼─────────────┐
                 │             │             │
        ┌────────v──────┐  ┌──v──────┐  ┌──v─────────┐
        │ Attention     │  │ State-  │  │ Parameter  │
        │ Pattern?      │  │ Space?  │  │ Stability? │
        │ (Transformer) │  │ (SSM)   │  │ (Large TF) │
        └────┬───────┬──┘  └────┬────┘  └──────┬─────┘
             │       │          │              │
        ┌────v───┐ ┌─v───────┐  │         ┌────v─────┐
        │ Verbose│ │  Use    │  │         │Timeouts? │
        │ + False│ │Bracket  │  │         │Try Signal│
        │Positives│ │Notation │  │         │Filtering │
        └────┬───┘ └─┬───────┘  │         └────┬─────┘
             │       │          │              │
        VARIANT 2  VARIANT 1  CHECK   VARIANT 3
        Add Strict  Context   Next →
        Restraint   Aware     │
                              │
                         ┌────v────┐
                         │False Pos │
                         │Prob >50%?│
                         └────┬─────┘
                              │
                         ┌────v─────────┐
                         │  VARIANT 4    │
                         │ONLY Explicit  │
                         └───────────────┘

```

---

## Testing Methodology

### Per-Model Validation

1. **LFM2.5-1.2B**
   - Run multi-turn conversation tests
   - Verify bracket notation parsing
   - Measure context retention across 5+ exchanges
   - Expected: Zero context drops, 95%+ format compliance

2. **mistral:7b**
   - Run mixed request types (tool + non-tool requests)
   - Measure false positive rate on non-tool requests
   - Compare to baseline (66.7%)
   - Target: <20% false positive rate

3. **gpt-oss:latest**
   - Run timeout-prone parameter-heavy requests
   - Measure completion rate (not hung)
   - Measure latency (should be faster without hint processing)
   - Target: <5% timeout rate, 75%+ accuracy

4. **qwen2.5:3b**
   - Run implicit vs. explicit tool request batches
   - Measure restraint score (% times user didn't ask but didn't call)
   - Measure false positive rate
   - Target: 0.8+ restraint, <0.33 FP rate

---

## Success Criteria

✅ **PASS** if:
- Each model meets or exceeds expected performance baseline
- Variant reasoning is validated (e.g., restraint prompt actually reduces FP for qwen2.5)
- No regressions: existing working requests still work
- Latency acceptable (<2s per call for most requests)

❌ **FAIL** if:
- Performance drops below baseline
- Variant trade-offs not acceptable (e.g., restraint costs too much accuracy)
- New failure modes introduced

---

## Notes

- **Flexibility:** These are starting variants; adjust based on test results
- **Future:** Could add temperature/penalty variations if variants plateau
- **Monitoring:** Track metrics per variant in `bench/results/` for each run
- **Rollout:** Only promote variant to production if it beats baseline by 10%+ or fixes critical issue
