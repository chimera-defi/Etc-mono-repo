# Aztec Liquid Staking — Development Kickoff (Agent Handoff)

**Goal:** Kick off real validation + implementation work without re-learning the whole packet, while avoiding hallucinations and keeping docs consistent.

**Status:** Planning + documentation complete. **No on-chain/testnet measurements have been performed in this repo yet** unless explicitly recorded in `VALIDATION-RESULTS.md`.

---

## Ground rules (anti-hallucination)

- **Never claim a fact** unless it is either:
  - directly cited from an official source (Aztec docs/blog/dashboard), or
  - measured by you and recorded in `VALIDATION-RESULTS.md` with method + artifacts.
- If you’re unsure whether something is true, label it **⚠️ ESTIMATED** or **❌ UNVERIFIED** and add a verification step.
- **Do not assume EVM tooling** (MetaMask/wagmi/viem/ERC‑20/EIP‑2612). Aztec is not EVM.
- Keep “source of truth” boundaries:
  - **Economics/math:** `ECONOMICS.md`
  - **Assumptions status:** `ASSUMPTIONS.md`
  - **Measured reality:** `VALIDATION-RESULTS.md`
  - **Competitors:** `COMPETITORS.md`
  - **Distribution/liquidity:** `INTEGRATIONS.md`
  - **Appendix/reference:** `liquid-staking-analysis.md`

---

## Where to start reading (10 minutes)

1. `README.md` (index)
2. `EXECUTIVE-SUMMARY.md` (decision memo)
3. `ASSUMPTIONS.md` (what’s actually known vs unknown)
4. `VALIDATION-RESULTS.md` (should be mostly ❌ right now)
5. `TASKS.md` (assignable work units)

---

## Phase 0 — “Make docs current” refresh (before doing anything else)

**Deliverable:** a dated entry in `VALIDATION-RESULTS.md` titled “Doc/tooling refresh”.

Checklist:
- Confirm current Aztec docs URLs are still valid (CLI install, sandbox, sequencer management).
- Confirm the **current** recommended client library / SDK names in Aztec docs.
  - If any code snippet references a library you can’t confirm, annotate it as **PSEUDOCODE** (don’t delete; just label).
- Re-check:
  - whether native staking is live (stake dashboard)
  - TGE timeline language (blog posts)
  - competitor signals (COMPETITORS.md)

---

## Phase 1 — Testnet validation (must happen before final architecture choices)

**Single rule:** if it isn’t in `VALIDATION-RESULTS.md`, it didn’t happen.

### 1A) Toolchain + sandbox smoke test
- **Input docs:** `TASKS.md` (TASK‑001), `liquid-staking-analysis.md` (tooling pointers)
- **Output:** `VALIDATION-RESULTS.md` entry with:
  - versions installed
  - “hello world” contract compile + deploy proof (tx hash / logs)

### 1B) Testnet sequencer/validator run (cost + requirements)
- **Input docs:** `TASKS.md` (TASK‑002)
- **Output:** `VALIDATION-RESULTS.md` entry with:
  - instance type, disk, bandwidth, region
  - CPU/RAM/disk/network usage over time
  - actual cost estimate

### 1C) Transaction cost measurement
- **Input docs:** `TASKS.md` (TASK‑003)
- **Output:** `VALIDATION-RESULTS.md` entry with:
  - deploy cost
  - common calls cost (mint/transfer‑like ops)
  - keeper‑like calls cost (if possible)

### 1D) Unbonding + slashing mechanics
- **Input docs:** `TASKS.md` (TASK‑004, TASK‑006)
- **Output:** `VALIDATION-RESULTS.md` entry with:
  - exact unbonding period and UX implications
  - slashing conditions + delegator impact (official source or experiment)

**After Phase 1:** update `ASSUMPTIONS.md` statuses and re-run economics sensitivity in `ECONOMICS.md`.

---

## Phase 2 — Architecture finalization (post-validation)

**Goal:** commit to MVP architecture choices based on validated facts.

Decisions (write down explicitly):
- Token model: **reward‑bearing** vs rebasing (and why)
- Withdrawal policy: buffer %, FIFO queue, “express withdrawal” yes/no
- Governance/voting mapping: what rights (if any) stAZTEC represents
- Safety model: upgrade/timelock/guardian/multisig mechanism available on Aztec (confirm)

Outputs:
- Update `IMPLEMENTATION-PLAN.md` (append-only changes)
- Update `liquid-staking-analysis.md` appendix only where it’s truly technical

---

## Phase 3 — Implementation kickoff (MVP)

Use `TASKS.md` Phase 2 (contracts) as the work queue, but enforce:
- every contract change has tests
- every “keeper/bot” plan references the **actual** Aztec client tooling (not EVM placeholders)

---

## Prompt templates for future agents

### Prompt A — Validation Engineer (testnet reality)
> You are an AI engineering agent. Your job is to validate Aztec staking mechanics and operating costs.  
> Constraints: do not assume EVM tooling; do not claim “verified” unless you record evidence in `VALIDATION-RESULTS.md`.  
> Tasks: complete TASK‑001/002/003/004/006.  
> Deliverables: 4 dated entries in `VALIDATION-RESULTS.md` + updates to `ASSUMPTIONS.md` + any required corrections to `ECONOMICS.md`.  
> Acceptance: each entry contains configs, method, results, and artifact links.

### Prompt B — Competitor Intel Agent
> Update `COMPETITORS.md` with new confirmed projects, timelines, and technical approaches.  
> Never convert “lead” → “confirmed” without a public source link.  
> Output: updated table + explicit next verification steps for unknown teams.

### Prompt C — Integrations/Distribution Agent
> Turn `INTEGRATIONS.md` from categories into named targets by surveying the current Aztec ecosystem.  
> Output: at least one credible day‑1 swap venue plan and a liquidity bootstrap strategy with measurable success metrics.

### Prompt D — Protocol Engineer (Noir contracts)
> Use `TASKS.md` Phase 2 to implement MVP contracts in Noir with tests.  
> Do not invent SDK imports; confirm against current Aztec docs.  
> Output: compiling contracts + passing tests + testnet deployment evidence.

