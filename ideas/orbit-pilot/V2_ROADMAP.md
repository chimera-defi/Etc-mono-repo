# Orbit Pilot — V2 roadmap (product + monetization)

**Status:** planning — V1 remains the shipped CLI; nothing here is committed scope until explicitly adopted.

**Related:** [`V1_SHIPPED.md`](./V1_SHIPPED.md) · [`V1_ROADMAP.md`](./V1_ROADMAP.md) · [`FRONTEND_VISION.md`](./FRONTEND_VISION.md) · [`SPEC.md`](./SPEC.md)

---

## 1. Why V2 is separate from V1

V1 optimizes for **trust, auditability, and agent-parseable CLI contracts** (local-first, policy-gated automation). V2 adds **distribution, collaboration, and recurring value** that justify payment — usually **hosted**, **data**, or **governance**, not “pay to run `orbit plan`.”

---

## 2. Audiences (multi-segment)

| Segment | What they pay for | Typical wedge |
|---------|-------------------|---------------|
| **Solo / indie builders** | Time saved, fewer missed sites, sane defaults | Free/open CLI + cheap **templates / registry subscription** or **hosted trigger** |
| **Agencies** | Multi-client runs, approvals, client-facing reports | **Team workspace**, **per-campaign or per-seat** billing, **white-label export** |
| **Internal platform teams** | Standardization, compliance, SSO, audit | **Private registry**, **policy packs**, **enterprise license**, **VPC / self-host** option |
| **Agents (automated)** | API keys, metered usage, programmatic launches | **Usage-priced API**, **agent auth** (scoped tokens), optional **x402 / micropayment** experiments |

**Design constraint:** one **primary buyer** per GTM motion, even if the product serves many segments over time (see §5).

---

## 3. Monetization options (multi-strategy menu)

These can be **combined**; the art is not stacking every lever on day one.

### A. Open core

- **Free:** CLI, local generate/publish patterns, core schemas, community registry baseline.
- **Paid:** cloud console, team features, curated registry updates, SLA, enterprise license.

**Fit:** indie funnel → agency/enterprise upsell.

### B. Hosted services (SaaS)

Examples: managed **webhook + job runner**, **scheduled runs in cloud**, **encrypted secret references** (not raw secrets in your DB if avoidable), **run history / replay** for teams.

**Fit:** agencies and platform teams who refuse to operate cron + infra per client.

### C. Data / curation subscriptions

Maintained **platform definitions** (URLs, modes, selector hints where allowed, **ToS / risk notes**), **launch playbooks** (“WalletRadar-shaped” profiles as living templates).

**Fit:** recurring revenue without locking the engine; aligns with “registry growth” as product.

### D. Commercial license + support

Same codebase (or fork), **B2B license** for organizations with strict OSS policies; **onboarding**, **custom publishers**, **private registry hosting**.

**Fit:** internal platform teams; higher touch, fewer seats.

### E. Usage / API metering (including agents)

**REST or MCP-adjacent** “enqueue launch / status” with **API keys**, **quotas**, optional **prepaid credits**. “Agentic payments” (e.g. **HTTP 402** + payment proofs, crypto rails, or Stripe metered) belong here as **experiments** once the **human legal + ToS** story is clear — automation money movement adds **fraud, chargeback, and liability** surface.

**Fit:** agents and integrations; pair with strict **scopes** and **human approval** for high-risk steps.

### F. What to avoid as the main monetization

- Paywalling **basic CLI** without a clearly better paid tier (substitutes appear quickly).
- **Surveillance-style telemetry** as the business model (undermines trust for a launch/credentials-adjacent tool).

---

## 4. V2 capability themes (product, not pricing detail)

Rough buckets to spec before build:

1. **Identity & billing** — orgs, seats, API keys, usage records; Stripe (or equivalent) as default.
2. **Hosted orchestration** — optional cloud execution of `pipeline`-shaped jobs with audit export.
3. **Collaboration** — approvals, comments on runs, shared registries, role-based policy.
4. **Operator UI** — extends [`FRONTEND_VISION.md`](./FRONTEND_VISION.md); paid tier differentiator for teams.
5. **Curated registry / compliance layer** — versioned packs, changelog, “last verified” metadata.
6. **Agent contracts** — stable HTTP API mirroring CLI JSON shapes; rate limits; webhook signing parity with today’s model.

**Order of operations:** ship **(1) + minimal (6)** before heavy UI if the goal is agent + indie distribution; add **(4) + (3)** when agencies are the primary buyer.

### 4.1 Local operator intelligence (Claude / Codex / Cursor / local LLM) — not a PyPI dependency

V1 **does not** ship or require an LLM inside the Python package. Operators may **pair** Orbit Pilot with **local** tools that control a browser (Claude Code + MCP, Cursor, Codex CLI, a self-hosted model, etc.). The **contract** is:

- **Orbit (deterministic):** `launch.yaml`, registry, `orbit plan` / `generate` / `pipeline`, packs, `orbit work --json`, optional Playwright (`orbit-pilot[browser]`).
- **Operator agent (non-deterministic):** reads `orbit work --json` (including **`operator_agent_guide`**), opens `submit_url` in the user’s browser, pastes public copy from `payload` / `PROMPT_USER.txt`, returns **`orbit mark-done`** with the live URL.

**V2 commercial angle — “batteries included” / resell intelligence:** a paid SKU can bundle **curated registry + launch playbooks + policy packs + support** *without* bundling a model API key. Buyers still bring **their own** Claude/Codex/local LLM subscription (or you resell **seats** via a partner program, separately from PyPI). Positioning: you sell **orchestration + curation + compliance posture**; the coding agent is the **execution surface** the customer already pays for. Avoid implying Orbit bypasses site ToS or runs unattended posting without human accountability.

---

## 5. Go-to-market (GTM) and primary buyer

**GTM choice drives pricing and roadmap**, not the reverse.

### Phase A — Indie-first (default recommendation)

- **Primary buyer:** solo builder (low ACV, high volume word-of-mouth).
- **Motion:** OSS / PyPI CLI, great docs (`HUMAN_GUIDE`, `AGENTS`), templates, public registry, community.
- **First paid:** small **Pro** (curated registry + extra platforms, or hosted webhook runner), not enterprise sales.

### Phase B — Agency pull-through

- **Primary buyer:** agency lead (medium ACV).
- **Motion:** case studies, multi-client workspaces, reports, approval flows.
- **Pricing:** per-seat or per-active-campaign; avoid opaque “contact us” until pipeline exists.

### Phase C — Enterprise / platform

- **Primary buyer:** internal platform or security-conscious org.
- **Motion:** SSO, audit exports, private registry, contractual ToS posture, optional self-host.
- **Pricing:** annual license + services; separate from indie tier.

**Rule of thumb:** pick **one primary buyer per quarter** for positioning; secondary segments still use the product, but **homepage and pricing** should read clean for one ICP at a time.

### 5.1 Pricing hypothesis (illustrative — replace after validation)

**Not a price list.** Dollar bands are **alignment only** until you run a few design-partner conversations and pick the **first paid SKU** (registry subscription vs hosted runner vs seats).

| Tier | Primary buyer | Anchor (monthly unless noted) | Core value | Typical limits |
|------|----------------|------------------------------|------------|----------------|
| **Free / OSS** | Indie, agents hacking locally | $0 | CLI, community registry baseline, schemas, local audit | No cloud history, no team RBAC, self-supported |
| **Indie Pro** | Solo builder shipping launches | ~$12–29/mo | **Curated registry pack** (updates + ToS/risk notes) *or* **hosted webhook / N scheduled cloud runs/mo** *or* **“Launch OS” bundle** (playbooks + operator-agent prompt pack + priority docs — BYO Claude/Codex/local LLM) | 1 seat, 1 org, modest API quota if included |
| **Agency** | Shop running many clients | ~$99–399/mo + **per seat** *or* **per active campaign** | Team workspace, client-separated runs, approval queue, white-label HTML/PDF export, shared curated registry | Seats/campaign caps; overage or upgrade path |
| **Enterprise** | Internal platform / regulated org | **Annual** (e.g. low five figures+) + optional PS | SSO (SAML), private registry hosting, policy packs, VPC / self-host option, SLA, named CSM | Contractual; separate from self-serve SKUs |
| **Agent / API add-on** | Any tier + autonomous integrations | **Metered** or **prepaid credits** | Scoped API keys, `pipeline`-shaped enqueue + status, rate limits aligned with JSON schemas | Hard cap + human-gated modes for browser assist |

**First paid SKU (choose one to avoid muddy positioning):**

| Option | Why pick it | Risk |
|--------|-------------|------|
| **Curated registry subscription** | Fast to ship (data product), clear recurring value, no execution liability in your cloud | You must maintain freshness; churn if updates lag |
| **Hosted runner** (webhook + job queue) | Agencies pay for “no cron on my side”; natural upsell from CLI | Ops + security + secret-handling burden |
| **Team seats** | Obvious for agencies once a minimal UI exists | Slower if UI is thin; competes with “we’ll use CLI + Notion” |

**Agentic payment overlay (optional, on top of a tier):** prepaid **API credits** or Stripe metered (e.g. per successful `pipeline` job or per 1k API calls) — **not** a substitute for ToS-compliant posting; keep browser-assist and high-risk paths **off** or **human-approval** gated for paid automation.

---

## 6. “Agentic payments” (explicit caution)

If agents pay per action:

- Define **what is sold** (API quota, curated registry access, hosted run minute) vs **what is not** (bypassing site ToS).
- Prefer **pre-authorized budgets** and **human gates** for browser-assisted or high-risk modes.
- Legal/compliance review before positioning as “unattended paid posting.”

---

## 7. Open decisions (fill in before implementation)

- [ ] Default license for “core” vs “enterprise” build (e.g. OSS + commercial add-on vs single license).
- [ ] First paid SKU (one thing: registry subscription vs hosted runner vs team seats).
- [ ] **Operator-intelligence bundle:** what is in-box (templates, skill updates, support office hours) vs strictly BYO API keys for Claude/OpenAI/etc.
- [ ] Data residency and secret handling policy for any cloud V2.
- [ ] Whether V2 cloud is **required** for revenue or **optional** alongside self-hosted enterprise.

---

## 8. Document maintenance

When V2 scope is adopted: add tasks to [`TASKS.md`](./TASKS.md) and, if needed, a **V2** section in [`SPEC.md`](./SPEC.md). Until then, treat this file as the **single monetization + GTM scratchpad** for Orbit Pilot.
