## Intelligence Exchange Open Questions

These questions must be answered before the MVP build can be one-shot executed. They represent genuine unknown unknowns or decisions that require human input.

---

### Q1: What are the exact MVP task types and their scoring rubrics?

This is the most critical pre-build question. The platform cannot score quality without explicit rubrics. Proposed MVP set:

| Task Type | Scoring Signal | Auto-Scorable? |
|---|---|---|
| Code review | ESLint/ruff findings correctly identified, severity rating matches CI output | Yes (against CI results) |
| Test generation | Tests added pass, coverage delta >= threshold, no flaky tests | Yes (run tests) |
| PR summary | Structured output hits required fields, no hallucinated facts vs. diff | Partial (rule-based) |

**Decision needed:** Confirm this set or replace with alternatives. Each task type requires a dedicated scoring module to be built.

---

### Q2: Worker economics — is the math viable?

The fundamental tension: workers pay for AI compute with their own API keys and get paid per completed job. For this to work:

```
worker_payout_per_job > (avg_tokens_used × model_cost_per_token) + time_cost
```

Example for a "code review" job:
- Claude Sonnet input: ~4K tokens context + 1K output = ~$0.02 API cost
- Job payout at 10% platform take-rate: if buyer pays $0.30, worker gets $0.27, profit = $0.25

This works at current model prices, but:
- Workers on GPT-4o face ~4x higher API costs at the same output quality.
- Workers using local/free models (Ollama, local LLaMA) have near-zero compute cost — but quality scoring must handle output variance.

**Decision needed:** Set minimum job floor prices per task type. Define acceptable model tiers for each task class. Decide if local/unmetered models are allowed.

---

### Q3: How do you prevent workers from gaming quality scores?

Known attack vectors:
1. **Fake CI results**: worker returns fabricated lint pass/fail outputs without actually running the code.
2. **Template spam**: worker returns a slightly modified template that passes structural validation but adds no value.
3. **Sybil supply**: one actor registers multiple workers to capture available jobs.
4. **Replay attacks**: worker submits a prior job's output for a new job in the same task class.

**Mitigations needed (pick before build):**
- Reproducible test execution in an isolated sandbox (prevent fake CI).
- Semantic diversity check against recent submissions by the same worker.
- Rate limiting on claim velocity per worker account.
- Trust tier gating: new workers (T0) face score thresholds before accessing higher-value jobs.

**Decision needed:** Which mitigations are in MVP vs Phase 2? The sandbox approach (Decision for fake CI prevention) is expensive to build early but critical for trust.

---

### Q4: How does the platform differentiate from Daydreams?

Daydreams (taskmarket + router) is the closest existing competitor. From their docs:
- Agent-first task market with `claim`, `bounty`, and `auction` modes.
- Strong protocol surface (agent cards, A2A messaging).
- OpenRouter integration for model routing.

**The gap Intelligence Exchange must own:**
1. **Fiat-first supply onboarding**: Daydreams is crypto-native (payment rails require wallet setup). Intelligence Exchange's Stripe Connect onboarding is accessible to non-crypto developers.
2. **Worker runtime + quality assurance**: Daydreams treats workers as black boxes. Intelligence Exchange actively scores outputs and enforces quality thresholds.
3. **Enterprise compliance posture**: Daydreams is open protocol. Intelligence Exchange can target regulated buyers who need auditable execution chains.

**Decision needed:** Is this differentiation enough for launch? Or should the MVP copy Daydreams' protocol surface and compete on compliance + quality?

---

### Q5: What is the Stripe Connect KYC implication for worker onboarding?

Stripe Connect requires workers (as "connected accounts") to provide:
- Name, date of birth, address (for individuals).
- Tax ID or EIN (for businesses).
- Bank account for payouts.

This is a significant onboarding friction for a "side income from spare compute" positioning. Options:

1. **Accept the friction**: use Stripe Express accounts (easiest), workers see a Stripe-hosted form.
2. **Platform holds funds**: platform accumulates worker earnings in a ledger balance; worker withdraws manually via a simpler flow (but delays platform regulatory classification).
3. **Crypto payout rail**: allow workers to receive payment to a crypto address (no KYC needed for the platform, but regulatory gray area).

**Decision needed from:** founder (risk tolerance) + legal review.

---

### Q6: What is the provider ToS compliance strategy?

Using Claude API or OpenAI API to complete jobs for third parties may violate provider Terms of Service. Key provisions:

- Anthropic ToS: prohibits "use the API to build products that compete with Anthropic" and requires users to not share API keys.
- OpenAI ToS: prohibits "resale" and requires user accounts to be the actual account holder.

**The BYOK model partially mitigates this**: workers use their own keys, executing jobs for their own account. The platform never holds or routes through provider credentials. However, this is a novel legal position.

**Decision needed:** Obtain legal review of the BYOK execution model before launch. Determine if "worker uses their own key to complete a buyer's job" constitutes prohibited resale under applicable ToS. This could be a go/no-go blocker.

---

### Q7: What is the dispute resolution process in detail?

When a buyer disputes an accepted job, what happens?

Current spec says "dispute workflow with replayable artifacts" but is not specific. Required decisions:

1. **Evidence standard**: what must the buyer submit to open a dispute? (e.g., specific test failure, incorrect fact claim)
2. **Dispute window**: how long after acceptance can a buyer dispute? (Proposed: 72 hours)
3. **Arbitration**: who decides — platform reviewer, automated re-score, or third party?
4. **Outcome options**: refund buyer only, clawback worker payout, or shared liability?
5. **Appeals**: can workers appeal a dispute decision?

**Decision needed from:** product lead + legal.

---

### Q8: What tech does the quality scorer use?

The "semantic grader model" mentioned in the spec needs to be specified:

Options:
1. **Rule-based only** (for code tasks): lint output parsing, test runner result parsing. Fast, cheap, deterministic. Limited to structured task types.
2. **LLM grader** (for prose tasks): a second LLM call evaluates the output against a rubric. Adds ~$0.02-0.05 per job in grading costs; introduces model-grader bias.
3. **Hybrid**: rule-based first pass, LLM fallback for ambiguous cases.

**Decision needed:** Which approach for MVP? Rule-based only is strongly recommended for the MVP task set (all scorable code tasks), with LLM grader as Phase 2 for prose task expansion.

---

## Resolved Decisions

| Question | Resolution | Source |
|---|---|---|
| Broker API tech | Hono + Bun | ARCHITECTURE_DECISIONS.md D2 |
| Job queue | BullMQ + Redis | ARCHITECTURE_DECISIONS.md D3 |
| Worker daemon | TypeScript CLI | ARCHITECTURE_DECISIONS.md D4 |
| Worker auth model | BYOK (bring own API key) | ARCHITECTURE_DECISIONS.md D5 |
| Payment rail | Stripe Connect (fiat-first) | ARCHITECTURE_DECISIONS.md D6 |
| MVP task market mode | claim only | ARCHITECTURE_DECISIONS.md D12 |
| Supply onboarding | Curated (manual review) | ARCHITECTURE_DECISIONS.md D7 |
| Database | Postgres + Redis | ARCHITECTURE_DECISIONS.md D1/D3 |
