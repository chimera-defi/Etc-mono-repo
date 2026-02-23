## Adversarial Validation (Applied to Idea Validation Bot)

This doc runs “red-team” tests against the **Idea Validation Bot** concept itself, and produces concrete kill criteria + experiments.

### 1) DIY / Substitution Test
**Attack**: Users can already speak into a generic LLM (or dictation) and ask “make me a PRD.” Why install/pay?

**What must be true to win**
- Output quality is consistently higher (structure, completeness, fewer hallucinations).
- The product guarantees coverage (state machine interview), not “chat”.
- It produces **agent-ready artifacts** (tasks, acceptance criteria, API/data model) with strong defaults.

**Mitigation / wedge**
- Make the wedge **workflow + structure + export formats**, not model IQ.
- Provide “PRD + build plan + tickets + repo scaffold prompts” in one tap.

**Kill criteria**
- If 10 target users say “I can get the same result with ChatGPT in 5 minutes” after trying the product.

### 2) Distribution Reality Test
**Attack**: It’s a consumer-ish mobile app. App store acquisition is expensive; founders are hard to reach at scale.

**Mitigation**
- Start as **text-first web** (or desktop) with export to agents; add mobile voice as a feature later.
- Target a tight ICP: “people actively building with coding agents this month.”
- Use distribution channels where they already are (dev communities, agent tool ecosystems).

**Kill criteria**
- No repeat use after first PRD (retention < 15% week-2) even when output quality is high.

### 3) Adversarial UX Test (People hate being challenged)
**Attack**: “Adversarial mode” may feel negative; users churn when criticized.

**Mitigation**
- Position as “stress test” / “pre-mortem” with supportive tone.
- Make it optional with a clear “why this matters” preview.
- Offer “confidence meter” + “what to do next” (experiments) not just criticism.

**Kill criteria**
- Users abandon specifically at adversarial stage > 2x baseline drop-off.

### 4) Liability / Trust Test
**Attack**: Users interpret outputs as business advice; wrong claims harm them.

**Mitigation**
- Strong disclaimers; avoid legal/financial assertions.
- Mark claims as: **user-provided / inferred / uncertain**.
- Provide “evidence needed” prompts and encourage customer interviews.

**Kill criteria**
- Users repeatedly ask for definitive answers that the system cannot responsibly provide.

### 5) Cost / Pricing Test
**Attack**: STT + LLM costs can exceed willingness-to-pay for casual ideators.

**Mitigation**
- Compress tokens: structured extraction, section-by-section generation, caching.
- Offer pricing aligned to value: per-report credits, or “builder plan”.
- Provide a non-voice mode to reduce STT cost.

**Kill criteria**
- Gross margin < 70% at plausible pricing (e.g., $10-$20/mo) for typical usage.

### 6) “Why now?” Test
**Attack**: This becomes a commodity; models improve and everyone ships “PRD generator.”

**Mitigation**
- Own a spec format and integrations (agent-ready exports, templates, ticketing, repo scaffolds).
- Build a library of interview flows by domain (SaaS, marketplace, consumer, devtools).

**Kill criteria**
- No measurable quality advantage over baseline prompts on a standardized evaluation set.

---

## Highest-Leverage Experiments (Do these first)

1. **Wizard-of-Oz prototype**: run 10 users through the flow manually (voice optional). Measure: “ready to build?” and willingness to pay.
2. **Baseline comparison**: compare outputs vs “generic LLM PRD prompt” on the same input; blind-rate quality.
3. **Retention probe**: ask users to come back 48h later to refine; see if they do.

