### Aztec Liquid Staking (stAZTEC) — Next Agent Handoff

**Date:** 2025-12-27  
**Scope:** `staking/aztec/` (docs + Noir contracts + scripts)  
**Intent:** Identify gaps/unknowns; provide parallel, specialized workstreams with copy/paste prompts.

---

### 0) Verified snapshot (what’s actually true in this repo)

- **Repo structure exists and is coherent** under `staking/aztec/` (README links into docs + contracts).
- **Noir unit tests run in CI-friendly mode** (no Aztec tooling required):
  - Verified locally in this workspace: `nargo version = 1.0.0-beta.17`
  - Verified: `staking/aztec/contracts/staking-math-tests` runs **34 tests** and they all pass.
- **Aztec devnet endpoint exists** (public JSON-RPC): `https://next.devnet.aztec-labs.com` (used across docs/scripts).

What is **NOT** verified in this workspace:
- Any **deployment** (local sandbox or devnet) of our Noir contracts.
- Any **end-to-end** “deposit -> mint -> stake -> rewards -> withdraw -> claim” flow.
- Any **real token transfer** integration (currently stubbed in `aztec-staking-pool`).

---

### 1) What exists today (implementation inventory)

#### Contracts (Noir / Aztec)

- **Prototype monolith**: `staking/aztec/contracts/aztec-staking-pool/`
  - Contract: `StakingPool` (share-based pool with fee + admin controls)
  - **Known limitation**: token transfer integration is **TODO**.
  - This is a useful *math+state baseline*, but it is **not** the full liquid staking system described in docs.

- **Modular “real protocol” direction (partially implemented)**:
  - `staking/aztec/contracts/staked-aztec-token/` → `StakedAztecToken` (transferable, exchange-rate token)
  - `staking/aztec/contracts/withdrawal-queue/` → `WithdrawalQueue` (FIFO + unbonding gating)
  - `staking/aztec/contracts/validator-registry/` → `ValidatorRegistry` (validator status + stake accounting)
  - **Missing**: `LiquidStakingCore`, `VaultManager`, `RewardsManager` (called out in `staking/aztec/README.md`)

#### Tests
- `staking/aztec/contracts/staking-math-tests/`: **34 passing tests**
  - Covers share math + exchange-rate conversion math + withdrawal timing math + round-robin selection math.

#### Scripts
- `staking/aztec/scripts/setup-env.sh`: installs nargo, docker, extracts aztec-nargo, caches Aztec deps
- `staking/aztec/scripts/smoke-test.sh`: validates toolchain + runs unit tests + checks devnet
- `staking/aztec/scripts/query-devnet.mjs`: queries devnet via AztecJS (requires JS deps)

---

### 2) The big gaps (CEO/COO/CMO view)

#### A) Architecture contradictions (must resolve early)

- **Two competing architectures currently coexist**:
  - A **single** `StakingPool` contract (monolith prototype), and
  - A **multi-contract** system (token/core/vault/rewards/queue/registry) described in `docs/IMPLEMENTATION-PLAN.md` and `docs/liquid-staking-analysis.md`.

**Decision needed:** Are we shipping **(1) monolith MVP** first, or **(2) modular MVP** first?  
Right now docs imply modular, but only the monolith has a “complete” deposit/withdraw loop (even though transfers are stubbed).

#### B) L1 vs L2 reality check (likely the #1 technical/business risk)

Multiple docs imply:
- Users deposit on Aztec (Noir contracts), and protocol stakes to validators.

But devnet discovery in `ASSUMPTIONS.md` shows **L1 contract addresses** (e.g., `stakingAssetAddress` on Sepolia), which strongly suggests **staking may be mediated by L1 contracts**.

If staking/unstaking/rewards are **L1**, we need:
- A **cross-layer design** (L2 contract state + L1 staking actions + L1<->L2 messaging), and likely
- Off-chain bots that hold L1 keys and pay L1 gas.

This is not yet designed in a “ship-ready” way.

#### C) “Liquid” token viability pre-TGE

Docs note: tokens are **non-transferable until TGE (Feb 2026+)**. If the underlying is non-transferable, **liquid staking may be impossible** or only meaningful post-TGE. This is a product/marketing/BD gating question.

#### D) Missing go-to-market mechanics (liquidity + integrations)

The plan says “canonical stAZTEC/AZTEC pool” but currently lacks:
- a confirmed Aztec-native DEX venue(s),
- pool creation steps, token metadata requirements,
- incentive plan details,
- a liquidity + withdrawal pressure policy (buffer targets, caps).

#### E) Operations & security not “company-grade” yet

Missing or not yet made explicit:
- key management (who holds admin keys, how rotated, how stored),
- emergency controls & incident response,
- audit readiness package and threat model,
- insurance/slashing policy (who bears losses; how exchange-rate updates reflect it).

---

### 3) Known unknowns (explicit questions to answer)

These must be turned into “✅ verified” entries in `docs/ASSUMPTIONS.md`, with artifacts.

- **Staking surface**: Is staking performed on **L1**, **L2**, or both?
- **Token location**: Is the stakable asset on L1, L2, or bridged? What token standard/pattern is used?
- **Unbonding and slashing**: Exact unbonding period, exact slashing mechanics, and who bears losses.
- **Time source**: Current `WithdrawalQueue` accepts timestamps as parameters (user/core supplied). That’s unsafe unless validated against chain-provided time. What is the correct Aztec “time” primitive to use?
- **Events/indexing**: What is the supported event/log model for Aztec Noir contracts, and how do bots consume it?
- **Auth model**: How does Aztec handle delegated actions (AuthWit or equivalent) for token transfers and contract-to-contract calls?

---

### 4) Unknown unknowns (risk register starter)

- **Aztec protocol churn**: devnet APIs, SDK, and contract macros evolve quickly → build may break without warning.
- **Ecosystem surface uncertainty**: DEX/lending/wallet/PXE availability may lag → liquidity + UX could be constrained.
- **Competitor timing**: Olla (Kryha) and others may ship sooner than expected.
- **Regulatory**: Liquid staking + validator operations may trigger licensing/marketing constraints (jurisdiction dependent).

---

### 5) Parallelizable workstreams (assignable + specialized)

Each workstream below can be assigned to a different agent/team in parallel.

#### Workstream 1 — Protocol architecture “L1/L2 truth”

- **Owner profile**: Aztec protocol engineer / systems architect
- **Goal**: Determine the real staking interaction model (L1/L2), and produce a concrete message-flow spec.
- **Deliverable**: `staking/aztec/docs/ARCHITECTURE_L1_L2.md` including:
  - where tokens live, who custody is, how staking occurs, how rewards accrue, how withdrawals unwind,
  - required bots and which chain(s) they transact on,
  - minimal viable path to ship.

**Prompt to assign:**
```markdown
You are the protocol architect. In `staking/aztec/`, resolve the core unknown: is Aztec staking performed on L1, L2, or both?

Deliver:
1) A written spec `staking/aztec/docs/ARCHITECTURE_L1_L2.md` describing:
   - where the staking asset lives (L1 vs L2),
   - how our contracts/bots initiate stake/unstake,
   - how rewards and slashing propagate into stAZTEC exchange rate,
   - what cross-layer messaging is required (if any).
2) Update `staking/aztec/docs/ASSUMPTIONS.md` with ✅/❌ statuses and citations or test plans.

Avoid guessing: mark unknowns explicitly and propose verification steps.
```

#### Workstream 2 — Contract architecture decision + consolidation

- **Owner profile**: Lead Noir engineer
- **Goal**: Decide whether `aztec-staking-pool` is (a) the MVP or (b) a prototype; remove ambiguity in docs.
- **Deliverable**: A short decision note + doc updates clarifying the chosen contract architecture and roadmap.

**Prompt to assign:**
```markdown
You are the lead Noir engineer. In `staking/aztec/contracts/`, there is both a monolith (`aztec-staking-pool`) and a modular protocol direction (staked token / queue / registry + TODO core/vault/rewards).

Deliver:
1) A decision note in `staking/aztec/docs/CONTRACT_ARCH_DECISION.md`:
   - choose “monolith MVP” or “modular MVP”,
   - justify based on deployment complexity, auditability, and Aztec constraints.
2) Update `staking/aztec/README.md` + `staking/aztec/docs/IMPLEMENTATION-PLAN.md` to reflect that choice.
```

#### Workstream 3 — Finish the devnet loop (deploy + call + evidence)

- **Owner profile**: tooling/devnet engineer
- **Goal**: Complete the “compile → deploy → call” loop and record tx hashes + addresses.
- **Deliverable**: A dated entry in `docs/ASSUMPTIONS.md` Validation Log with reproducible commands and results.

**Prompt to assign:**
```markdown
You are responsible for proving we can deploy and interact with a Noir contract on Aztec devnet.

Deliver:
- Deploy *one* contract (start with `aztec-staking-pool`) to `https://next.devnet.aztec-labs.com`
- Call a public function (e.g., `deposit` with a minimal amount, or any safe view call)
- Record: tool versions, command log, contract address, tx hash in `staking/aztec/docs/ASSUMPTIONS.md` → Validation Log.

If token transfers block deposit, call a view method and record the successful interaction anyway.
```

#### Workstream 4 — MVP contracts missing (Core/Vault/Rewards) + timestamp hardening

- **Owner profile**: Noir smart contract engineer
- **Goal**: Implement `LiquidStakingCore`, `VaultManager`, `RewardsManager` (or adapt monolith), and remove unsafe timestamp parameters.
- **Deliverable**: Compiling contracts + math-test additions (where possible) + clear “how-to-wire” docs.

**Prompt to assign:**
```markdown
Implement the missing MVP contracts in `staking/aztec/contracts/`:
- LiquidStakingCore
- VaultManager
- RewardsManager

Also address the security footgun: any function that accepts a timestamp parameter must be replaced with a chain-provided timestamp source, or otherwise validated.

Constraints:
- Keep logic testable via `staking-math-tests` where feasible.
- Avoid introducing Aztec runtime dependencies into the pure-math tests.

Deliver:
1) New contract folders + `src/main.nr` + `Nargo.toml` for each.
2) Update `staking/aztec/docs/TASKS.md` status and add any new tasks you discover.
```

#### Workstream 5 — Keeper bots (real SDK, not EVM pseudocode)

- **Owner profile**: TS backend engineer with AztecJS familiarity
- **Goal**: Define and scaffold bots against the *real* Aztec SDK/event model.
- **Deliverable**: A minimal runnable bot skeleton + docs on how to run it (even if it only polls state).

**Prompt to assign:**
```markdown
Build the keeper bot scaffolding using Aztec’s official JS SDK (not viem/ethers assumptions).

Deliver:
1) `staking/aztec/bots/` skeleton with one bot that can connect to devnet and query a contract/state.
2) A short doc `staking/aztec/docs/BOTS.md` describing:
   - what triggers exist (events vs polling),
   - how to authenticate/sign txs,
   - how to run locally.
3) Add a TODO list for staking/rewards/withdrawal keeper logic.
```

#### Workstream 6 — Security package (audit-ready)

- **Owner profile**: security engineer / audit-prep specialist
- **Goal**: Create a threat model + invariants + audit packet outline specific to Aztec/Noir.
- **Deliverable**: `staking/aztec/docs/SECURITY.md` + checklist that maps to contract code.

**Prompt to assign:**
```markdown
Create an audit-ready security package for `staking/aztec/`.

Deliver:
- `staking/aztec/docs/SECURITY.md` including threat model, invariants, attack surfaces, admin model, and incident response.
- A list of “must-fix before audit” items, including timestamp trust, access control, and any external-call patterns.
- Update `staking/aztec/docs/TASKS.md` with security tasks (pre-audit and audit support).
```

#### Workstream 7 — Liquidity + integrations + launch plan

- **Owner profile**: ecosystem BD / growth
- **Goal**: Make “liquid” real: identify venues and a realistic launch sequencing plan.
- **Deliverable**: A concrete integration target list + liquidity bootstrap plan with success metrics.

**Prompt to assign:**
```markdown
Produce a practical liquidity + integration plan for stAZTEC on Aztec.

Deliver:
1) Identify the likely DEX/swap venue(s) and wallet surfaces on Aztec (or confirm none exist yet).
2) Draft `staking/aztec/docs/LIQUIDITY_PLAN.md` with:
   - canonical pool pair(s),
   - bootstrap approach (partners vs incentives),
   - risk policy (caps, buffer, withdrawal pressure),
   - success metrics (spread, depth, volume).
3) Update `staking/aztec/docs/IMPLEMENTATION-PLAN.md` (Integrations & Liquidity section) accordingly.
```

#### Workstream 8 — Company ops + fundraising realism pass

- **Owner profile**: COO/CEO operator
- **Goal**: Turn this into a shippable company plan: ops runbooks, hiring, legal, fundraising “truthy” narrative.
- **Deliverable**: Ops checklist + fundraising data room checklist with blockers called out.

**Prompt to assign:**
```markdown
Act as COO/CEO. Produce an execution-grade checklist for:
- key management, on-call/incident response, infrastructure ownership,
- hiring plan with role definitions and interview loops,
- legal + compliance to investigate (jurisdiction-agnostic flags),
- fundraising narrative corrections (especially “liquid token pre-TGE” and any L1 gas/capital realities).

Deliver:
- `staking/aztec/docs/OPERATIONS.md`
- updates to `staking/aztec/docs/FUNDRAISING.md` where claims need stronger sourcing or caveats
```

---

### 6) “First 72 hours” plan (parallel and unblock-first)

- **P0 (blockers)**
  - **Confirm L1/L2 staking architecture** (Workstream 1)
  - **Complete devnet deploy+call evidence** (Workstream 3)
  - **Choose monolith vs modular MVP** (Workstream 2)
  - **Confirm transferability constraints (pre/post TGE)** (Workstream 7)

- **P1 (buildable immediately)**
  - Implement `LiquidStakingCore` skeleton + safe time source decisions (Workstream 4)
  - Start bots skeleton with real SDK patterns (Workstream 5)
  - Start security threat model + invariants (Workstream 6)

---

### 7) Quick “do not step on rakes” notes for the next agent

- **Do not assume EVM tooling** (ethers/viem/wagmi). Treat those as placeholders unless verified in current Aztec docs.
- **Do not trust caller-supplied timestamps**. Any time-based gating must use chain-provided time or a defensible, validated mechanism.
- **Keep docs consistent with reality**: if something wasn’t deployed and recorded in `ASSUMPTIONS.md` Validation Log, treat it as unverified.

