## Intelligence Exchange (Worker-Driven AI Job Marketplace)

**Status**: Exploration (docs-first)

### Concept
A marketplace where teams and agents buy/sell **AI job execution capacity** using contributor workers (local or hosted) that fulfill jobs through a central broker.

### Thesis
The direct "unused subscription/credit resale" framing is weak and fragile. The viable product is a brokered execution marketplace: workers fulfill jobs, platform scores outputs, and settlement is based on accepted work.

### Docs
- `EXECUTIVE_SUMMARY.md`: concise human-readable overview
- `PRD.md`: business model, GTM, TAM framing, risks
- `SPEC.md`: technical architecture and execution plan
- `ARCHITECTURE_DIAGRAMS.md`: human-readable architecture diagrams
- `ARCHITECTURE_DECISIONS.md`: key architecture decisions and tradeoffs
- `COMPETITOR_ANALYSIS.md`: category-level competitive framing and wedge
- `FEASIBILITY_ANALYSIS.md`: execution and operational feasibility
- `ADVERSARIAL_TESTS.md`: explicit red-team tests and kill conditions
- `RESEARCH_NOTES.md`: sourced notes and open evidence gaps
- `VALIDATION_PLAN.md`: phased discovery and pilot plan (broad to deep)
- `GO_NO_GO_SCORECARD.md`: final stage gate before build commitment
- `PILOT_SCORECARD_TEMPLATE.md`: per-pilot measurement template
- `FINANCIAL_MODEL.md`: scenario economics model and thresholds
- `RISK_REGISTER.md`: likelihood/impact risk table with mitigations
- `90_DAY_EXECUTION_PLAN.md`: phased execution plan and deliverables
- `UX_AND_PAYMENTS_FLOW.md`: buyer/seller UX and payment rail design
- `ALTERNATIVES_AND_VARIANTS.md`: strategic alternatives and phased variants
- `RESEARCH_PROMPT.md`: focused prompt for evidence refresh
- `AGENT_HANDOFF.md`: implementation handoff guidance
- `TASKS.md`: milestone and phase checklist
- `DECISIONS.md`: locked choices and rationale
- `SPEC_STAGE_CHECKLIST.md`: depth checklist for this pack
- `REFINEMENTS.md`: iteration history and next refinement targets
- `MULTIPASS_REVIEW.md`: review passes and findings
- `META_LEARNINGS.md`: reusable learnings for future idea packs

### Recommended Read Order (Low Context -> Deep Context)
1. `EXECUTIVE_SUMMARY.md`
2. `PRD.md`
3. `SPEC.md`
4. `ARCHITECTURE_DIAGRAMS.md`
5. `VALIDATION_PLAN.md`
6. remaining deep-dive docs as needed

### Primary Sources
- OpenAI Service Credit Terms (non-transferability): https://openai.com/policies/service-credit-terms/
- OpenAI Business Terms (service credits): https://openai.com/policies/may-2025-business-terms/
- Anthropic Credit Terms (no transfer): https://www.anthropic.com/legal/credit-terms
- OpenRouter BYOK model routing context: https://openrouter.ai/docs/use-cases/byok
- Vast.ai marketplace context: https://docs.vast.ai/documentation/pricing
- TensorDock marketplace context: https://marketplace.tensordock.com/
- Agent Commerce Protocol overview (Stripe + OpenAI): https://docs.stripe.com/agents
- Stripe payments rails: https://docs.stripe.com/payments
