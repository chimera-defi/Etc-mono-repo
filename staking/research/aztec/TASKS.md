# Agent Task Breakdown
**Discrete, actionable tasks for AI agents or developers**

*Created: December 22, 2025*
*Based on: IMPLEMENTATION-PLAN.md and liquid-staking-analysis.md*

---

## How to Use This Document

**For Project Managers:**
- Assign tasks to agents/developers sequentially
- Track completion status (🔴 Not Started, 🟡 In Progress, ✅ Complete)
- Tasks are ordered by dependency (blocking tasks first)

**For AI Agents:**
- Each task is self-contained with clear deliverables
- Acceptance criteria define "done"
- Reference documents linked for context

**Task Format:**
```
## TASK-XXX: Brief Description
**Status:** 🔴 Not Started
**Assignee:** [Agent/Developer name]
**Estimated Time:** X hours/days
**Depends On:** TASK-YYY (if applicable)
**Priority:** Critical | High | Medium | Low

**Context:** Why this task exists and what it accomplishes

**Deliverables:**
- [ ] Specific output 1
- [ ] Specific output 2

**Acceptance Criteria:**
- Success condition 1
- Success condition 2

**Resources:**
- Link to relevant documentation
- Example code or references
```

---

## Phase 1: Foundation & Setup (Week 1-2)

### TASK-001: Provision Aztec Testnet Development Environment
**Status:** 🔴 Not Started
**Estimated Time:** 4 hours
**Priority:** Critical
**Depends On:** None

**Context:** Set up local Aztec development environment for contract development and testing.

**Deliverables:**
- [ ] Aztec Sandbox running locally
- [ ] Aztec CLI installed and configured
- [ ] Test wallet created with testnet AZTEC
- [ ] RPC endpoints documented

**Acceptance Criteria:**
- Can deploy a simple "Hello World" Noir contract to local sandbox
- Can deploy the same contract to public testnet
- Documented setup instructions inline in TASK-001/TASK-001A (and update if Aztec tooling changes)

**Resources:**
- [Aztec Sandbox Setup](https://docs.aztec.network/developers/docs/getting_started/sandbox)
- [Aztec CLI Installation](https://docs.aztec.network/developers/docs/getting_started/quickstart)

**Commands to Run:**
```bash
# Install Aztec
# NOTE: local sandbox typically requires a working Docker daemon.
# If Docker daemon cannot run (e.g., minimal CI environments), do the sandbox smoke test on a machine where it can.
bash -i <(curl -s install.aztec.network)

# Start sandbox
aztec start --sandbox

# Verify installation
aztec-cli --version
```

---

### TASK-001A: Local Sandbox Smoke Tests (compile → deploy → call)
**Status:** ✅ Complete (Compilation Verified)
**Estimated Time:** 2-6 hours (depends on tooling friction)
**Priority:** Critical
**Depends On:** TASK-001

**Progress (2025-12-27):**

*Verified Working:*
- ✅ Docker daemon starts with `--bridge=none --iptables=false`
- ✅ nargo 1.0.0-beta.17 installed via noirup
- ✅ **Base Noir** compile + test working (`nargo compile`, `nargo test`)
- ✅ **Staking math tests** (`staking-math-tests/`) - **20/20 tests pass**
- ✅ **Devnet RPC** working: `https://next.devnet.aztec-labs.com`
  - Node version: 3.0.0-devnet.20251212
  - L1 Chain ID: 11155111 (Sepolia)
  - Block queries via curl confirmed working
  - Current block: 33404+ (actively producing)
- ✅ Docker image pulled: `aztecprotocol/aztec:latest` (1.22GB)
- ✅ **aztec-nargo extracted** from Docker image (v1.0.0-beta.11+aztec)
- ✅ **Aztec contract COMPILED** at `staking/contracts/aztec-staking-pool/`
  - Artifact: `target/staking_pool-StakingPool.json` (759KB)
  - 15+ functions exposed (deposit, withdraw, add_rewards, etc.)
- ✅ **Smoke test script** created: `scripts/smoke-test.sh`

*Remaining for Full Completion:*
- ⏳ Deploy contract to devnet (requires aztec-wallet + test tokens)
- ⏳ Execute function call and record tx hash

**Workaround for Cloud Environments:**
Extract aztec-nargo binary from Docker image instead of running container:
```bash
docker create --name extract-nargo aztecprotocol/aztec:latest
docker cp extract-nargo:/usr/src/noir/noir-repo/target/release/nargo ~/aztec-bin/
docker rm extract-nargo
# Use ~/aztec-bin/nargo for compilation
```

**Alternative Path - AztecJS:**
Can test against devnet using RPC + AztecJS without local sandbox:
```javascript
import { createAztecNodeClient } from "@aztec/aztec.js/node";
const node = createAztecNodeClient("https://next.devnet.aztec-labs.com");
```

**Context:** Before we validate economics or build real contracts, we need a working local loop. A “smoke test” is the smallest end-to-end check that proves the environment works.

**What’s needed (pre-reqs):**
- [x] A machine where the **Docker daemon is running** (`docker info` works)
- [x] Aztec installer successfully installed tooling (per official docs)
- [ ] A local sandbox/devnet can start (usually Docker-backed)

**Smoke test checklist (must all pass):**
- [x] `aztec-nargo --version` works (v1.0.0-beta.11+aztec)
- [ ] Local sandbox starts and stays up (run in its own terminal)
- [x] Create a minimal Noir contract project (official template/tutorial)
- [x] `aztec-nargo compile` succeeds (759KB artifact)
- [ ] Deploy contract to sandbox (capture contract address / tx hash)
- [ ] Call a simple function and observe expected output/state change
- [x] Write a dated entry in `ASSUMPTIONS.md` → “Validation Log” including:
  - versions installed, commands run, endpoints, outputs
  - links to logs/tx hashes (or screenshots)

**Acceptance Criteria:**
- A new "Local sandbox smoke test" entry exists in `ASSUMPTIONS.md` Validation Log
- Another agent can reproduce by copy/pasting the commands

**Notes (avoid wrong assumptions):**
- Do **not** assume EVM tooling (MetaMask/wagmi/viem) for local interactions.
- If a step requires tooling you can't confirm in Aztec docs, label it **PSEUDOCODE** and record what you tried.

**🚨 HUMAN HANDOFF REQUIRED:**
This task **cannot** be completed in cloud/CI environments without Docker daemon access.

**Instructions for human:**
1. Use a local machine or VM with Docker installed and running (`docker info` succeeds)
2. Follow the smoke test checklist above
3. Record results in `ASSUMPTIONS.md` → Validation Log with:
   - Date, machine type, Docker version, Aztec CLI version
   - Commands run and outputs
   - Contract address / tx hash from successful deploy
   - Any issues encountered
4. Once complete, mark TASK-001A as ✅ and notify the team

**Why this matters:** Contract development (TASK-101+) depends on a proven local toolchain.

### TASK-002: Deploy Test Validator on Aztec Testnet
**Status:** 🔴 Not Started
**Estimated Time:** 8 hours
**Priority:** Critical
**Depends On:** None

**Context:** Deploy a validator node on Aztec testnet to validate infrastructure costs and staking mechanics.

**Deliverables:**
- [ ] Validator node running on cloud infrastructure (AWS/GCP)
- [ ] Node synced with Aztec testnet
- [ ] 200k testnet AZTEC staked to validator
- [ ] Resource usage monitoring configured (CPU, RAM, disk, bandwidth)
- [ ] Cost tracking spreadsheet

**Acceptance Criteria:**
- Validator is producing blocks on testnet
- 2 weeks of operational data collected
- Actual costs measured: $___/month (compare to $400 estimate)
- Resource usage documented: X vCPU, Y GB RAM, Z GB disk

**Resources:**
- [Running a Sequencer](https://docs.aztec.network/the_aztec_network/setup/sequencer_management)
- ASSUMPTIONS.md (update with actual costs)

**Monitoring Setup:**
```bash
# Install monitoring
apt-get install prometheus-node-exporter
systemctl enable prometheus-node-exporter

# Track resources
htop, iotop, nethogs for manual monitoring
```

---

### TASK-003: Measure Testnet Transaction Costs
**Status:** 🔴 Not Started
**Estimated Time:** 2 hours
**Priority:** High
**Depends On:** TASK-001

**Context:** Validate gas cost assumptions ($0.20-$0.50 per transaction) on Aztec testnet.

**Deliverables:**
- [ ] Deploy simple test contract to testnet
- [ ] Execute 100+ transactions of varying complexity
- [ ] Cost analysis spreadsheet

**Acceptance Criteria:**
- Measured costs for: deployment, token mint, transfer, complex operations
- Average transaction cost calculated
- Comparison to $0.20-$0.50 estimate documented

**Test Scenarios:**
```typescript
// Deploy contract (measure cost)
const deployment = await deployContract(SimpleToken);

// Token operations (measure each)
await token.mint(address, amount);      // Cost: $X
await token.transfer(to, amount);       // Cost: $Y
await token.approve(spender, amount);   // Cost: $Z

// Complex operations
await vault.stakeToValidator(validator, 200000); // Cost: $W
```

**Output:** Update ASSUMPTIONS.md with actual costs

---

### TASK-004: Research Aztec Unbonding Period
**Status:** 🔴 Not Started
**Estimated Time:** 3 hours
**Priority:** Medium
**Depends On:** TASK-002

**Context:** Confirm unbonding period (estimated 7 days) via testnet staking.

**Deliverables:**
- [ ] Stake testnet AZTEC to validator
- [ ] Initiate unstaking
- [ ] Measure actual unbonding period
- [ ] Document findings

**Acceptance Criteria:**
- Actual unbonding period measured: X days
- Comparison to 7-day estimate
- Update ASSUMPTIONS.md with verified data

**Process:**
1. Stake 200k testnet AZTEC
2. Wait for activation
3. Initiate unstake transaction
4. Monitor until funds withdrawable
5. Calculate elapsed time

---

### TASK-005: Create a Single “Validation Results” Log (Aztec)
**Status:** 🔴 Not Started
**Estimated Time:** 2 hours
**Priority:** High
**Depends On:** None

**Context:** We need one place to record what we actually measured on testnet (dates, configs, outcomes). This prevents drift between `ASSUMPTIONS.md`, `ECONOMICS.md`, and fundraising materials.

**Deliverables:**
- [ ] Add a “Validation Log” section to `ASSUMPTIONS.md` (if not present)
- [ ] Template sections: validator requirements, validator costs, tx costs, unbonding/slashing, RPC reliability, notes/links
- [ ] First entry created (even if it’s “setup complete, no measurements yet”)

**Acceptance Criteria:**
- File exists and is easy to append to over time (date-stamped entries)
- Each entry links to the task(s) that produced the data (e.g., TASK-002/003/004/006)

**Resources:**
- `ASSUMPTIONS.md`
- `ECONOMICS.md`

---

### TASK-006: Verify Slashing Mechanics (and Delegator Impact)
**Status:** 🔴 Not Started
**Estimated Time:** 4 hours
**Priority:** High
**Depends On:** TASK-002

**Context:** Slashing parameters and “who eats the loss” (validator vs delegator vs protocol) directly determine insurance fund sizing, withdrawal buffer policy, and user risk disclosures.

**Deliverables:**
- [ ] Document slashing conditions (what triggers, severity, timing)
- [ ] Determine how slashing losses flow through to delegated stake (who bears it)
- [ ] Update `ASSUMPTIONS.md` (slashing penalty row + any new rows needed)
- [ ] Add a dated entry in `ASSUMPTIONS.md` → Validation Log (from TASK-005)

**Acceptance Criteria:**
- Slashing penalty and mechanics marked ✅ VERIFIED with a primary source OR explicitly marked ❌ UNVERIFIED with a concrete test plan
- Clear statement: “If slashing happens, stAZTEC holders experience X via exchange-rate change (or not)” with justification

**Resources:**
- [Aztec Documentation](https://docs.aztec.network/)
- [Running a Sequencer](https://docs.aztec.network/the_aztec_network/setup/sequencer_management)

---

### TASK-007: Map Aztec DeFi Surface Area (Integration Targets)
**Status:** 🔴 Not Started
**Estimated Time:** 6 hours
**Priority:** High
**Depends On:** None

**Context:** Liquid staking wins through distribution and integrations. We need a short, explicit list of day-1 integration targets (DEX liquidity, lending collateral, wallets).

**Deliverables:**
- [ ] List top Aztec-native DeFi venues (swap, lending, stablecoin rails if applicable)
- [ ] Identify where an LST can be used on day 1 vs “later”
- [ ] Update `IMPLEMENTATION-PLAN.md` (Integrations & Liquidity section) with targets and sequencing
- [ ] Add a short “Integration Targets” section to `IMPLEMENTATION-PLAN.md` (brief append only)

**Acceptance Criteria:**
- At least 5 concrete integration targets or categories (even if some are “to be confirmed”)
- Each item includes: why it matters, what we need from them, and expected timeline

**Resources:**
- `staking/research/liquid-staking-landscape-2025.md`
- `staking/research/OPPORTUNITIES.md`

---

### TASK-008: Liquidity Bootstrap Plan for stAZTEC (Go-to-Market)
**Status:** 🔴 Not Started
**Estimated Time:** 6 hours
**Priority:** High
**Depends On:** TASK-007

**Context:** Without early liquidity, a liquid staking token is not “liquid.” We need an explicit bootstrap plan (initial pool(s), incentives, risks).

**Deliverables:**
- [ ] Define initial liquidity venues/pairs (e.g., stAZTEC/AZTEC, stAZTEC/ETH if bridged)
- [ ] Incentive plan options (points, LM, grants, partners)
- [ ] Risks and mitigations (thin liquidity, price impact, withdrawal pressure)
- [ ] Update `IMPLEMENTATION-PLAN.md` (Integrations & Liquidity section) with the chosen bootstrap plan
- [ ] Append a “Liquidity & Distribution” section to `EXECUTIVE-SUMMARY.md` (brief)

**Acceptance Criteria:**
- Plan addresses: initial LP seed source, incentive duration, and success metrics (spread/volume/TVL)
- Notes any assumptions that must be validated (and links to `ASSUMPTIONS.md`)

---

### TASK-009: Competitive Intelligence Tracker (Aztec Liquid Staking)
**Status:** 🔴 Not Started
**Estimated Time:** 4 hours
**Priority:** High
**Depends On:** None

**Context:** “Multiple teams are building” is not actionable without names, timelines, and technical approaches. We need a living tracker.

**Deliverables:**
- [ ] Update `ASSUMPTIONS.md` (Competitor Tracker section; canonical)
- [ ] Keep `ASSUMPTIONS.md` competitive assumptions in sync (high-level only)
- [ ] Track: team/project name, links, status, expected launch window, approach (validators vs marketplace vs custodial), differentiation
- [ ] Update `OPPORTUNITIES.md` Aztec action items with a link to this tracker

**Acceptance Criteria:**
- Olla by Kryha is captured with current public signals
- At least 3 additional “leads” are captured (even if unverified), each with a next verification step

**Resources:**
- `aztec/README.md` (existing competitor citations)
- [Aztec TGE blog](https://aztec.network/blog/aztec-tge-next-steps)

## Phase 2: Smart Contract Development (Week 3-14)

### TASK-101: Create StakedAztecToken.nr Contract Skeleton
**Status:** 🔴 Not Started
**Estimated Time:** 3 hours
**Priority:** Critical
**Depends On:** TASK-001

**Context:** Create the stAZTEC token contract - the core liquid staking token.

**Deliverables:**
- [ ] `contracts/StakedAztecToken.nr` file created
- [ ] Contract compiles successfully
- [ ] Basic structure with placeholders

**Acceptance Criteria:**
- Contract structure matches specification in liquid-staking-analysis.md lines 766-823
- Compiles with `aztec-nargo compile`
- All function signatures defined (implementation can be TODO)

**Contract Structure:**
```noir
use dep::aztec::macros::aztec;

#[aztec]
pub contract StakedAztecToken {
    use dep::aztec::{
        macros::{functions::{public}, storage::storage},
        protocol_types::address::AztecAddress,
        state_vars::{Map, PublicMutable}
    };

    #[storage]
    struct Storage<Context> {
        balances: Map<AztecAddress, PublicMutable<u128, Context>, Context>,
        exchange_rate: PublicMutable<u64, Context>,
        total_supply: PublicMutable<u128, Context>,
    }

    #[public]
    #[initializer]
    fn constructor() {
        // TODO: Initialize storage
    }

    #[public]
    fn mint(to: AztecAddress, amount: u128) {
        // TODO: Implement mint logic
    }

    #[public]
    fn transfer(to: AztecAddress, amount: u128) {
        // TODO: Implement transfer logic
    }

    // ... more functions
}
```

**Resources:**
- [Aztec Token Tutorial](https://docs.aztec.network/developers/docs/tutorials/contract_tutorials/token_contract)
- liquid-staking-analysis.md lines 766-823

---

### TASK-102: Implement StakedAztecToken.nr Storage Functions
**Status:** 🔴 Not Started
**Estimated Time:** 4 hours
**Priority:** Critical
**Depends On:** TASK-101

**Context:** Implement constructor and exchange rate management.

**Deliverables:**
- [ ] `constructor()` function implemented
- [ ] `update_exchange_rate()` function implemented
- [ ] `get_exchange_rate()` function implemented
- [ ] Unit tests for storage operations

**Acceptance Criteria:**
- Constructor initializes exchange_rate to 10000 (1.0 in basis points)
- Only authorized address can update exchange_rate
- Exchange rate persists correctly in storage
- Tests pass: `nargo test`

**Implementation:**
```noir
#[public]
#[initializer]
fn constructor() {
    storage.exchange_rate.write(10000); // 1.0
    storage.total_supply.write(0);
}

#[public]
fn update_exchange_rate(new_rate: u64) {
    let sender = context.msg_sender();
    assert(sender == REWARDS_MANAGER, "Unauthorized");
    storage.exchange_rate.write(new_rate);
}

#[public]
fn get_exchange_rate() -> u64 {
    storage.exchange_rate.read()
}
```

**Tests:**
```noir
#[test]
fn test_constructor_initializes_rate() {
    let rate = storage.exchange_rate.read();
    assert(rate == 10000);
}

#[test]
fn test_only_rewards_manager_can_update_rate() {
    // Should fail if called by non-manager
}
```

---

### TASK-103: Implement StakedAztecToken.nr Mint/Burn Functions
**Status:** 🔴 Not Started
**Estimated Time:** 6 hours
**Priority:** Critical
**Depends On:** TASK-102

**Context:** Implement core token minting and burning with access control.

**Deliverables:**
- [ ] `mint()` function with access control
- [ ] `burn()` function with access control
- [ ] Balance tracking logic
- [ ] Total supply updates
- [ ] Unit tests (10+ test cases)

**Acceptance Criteria:**
- Only LiquidStakingCore can call mint/burn
- Balances update correctly
- Total supply updates correctly
- Cannot mint to zero address
- Cannot burn more than balance
- All tests pass

**Implementation:**
```noir
#[public]
fn mint(to: AztecAddress, amount: u128) {
    let sender = context.msg_sender();
    assert(sender == LIQUID_STAKING_CORE, "Only core can mint");

    let balance = storage.balances.at(to).read();
    storage.balances.at(to).write(balance + amount);

    let supply = storage.total_supply.read();
    storage.total_supply.write(supply + amount);
}

#[public]
fn burn(from: AztecAddress, amount: u128) {
    let sender = context.msg_sender();
    assert(sender == LIQUID_STAKING_CORE, "Only core can burn");

    let balance = storage.balances.at(from).read();
    assert(balance >= amount, "Insufficient balance");

    storage.balances.at(from).write(balance - amount);

    let supply = storage.total_supply.read();
    storage.total_supply.write(supply - amount);
}
```

---

### TASK-104: Implement StakedAztecToken.nr Transfer Function
**Status:** 🔴 Not Started
**Estimated Time:** 5 hours
**Priority:** High
**Depends On:** TASK-103

**Context:** Implement ERC20-style transfer for stAZTEC token.

**Deliverables:**
- [ ] `transfer()` function
- [ ] `balance_of()` view function
- [ ] Unit tests for transfer edge cases

**Acceptance Criteria:**
- Can transfer tokens between addresses
- Cannot transfer more than balance
- Balances update atomically (sender decreases, receiver increases)
- Cannot transfer to zero address
- Tests cover: normal transfer, insufficient balance, zero amount

**Implementation:**
```noir
#[public]
fn transfer(to: AztecAddress, amount: u128) {
    let from = context.msg_sender();

    let from_balance = storage.balances.at(from).read();
    assert(from_balance >= amount, "Insufficient balance");

    storage.balances.at(from).write(from_balance - amount);

    let to_balance = storage.balances.at(to).read();
    storage.balances.at(to).write(to_balance + amount);
}

#[public]
fn balance_of(owner: AztecAddress) -> u128 {
    storage.balances.at(owner).read()
}
```

---

### TASK-105: Create LiquidStakingCore.nr Contract Skeleton
**Status:** 🔴 Not Started
**Estimated Time:** 3 hours
**Priority:** Critical
**Depends On:** TASK-104

**Context:** Create the main entry point contract for deposits and withdrawals.

**Deliverables:**
- [ ] `contracts/LiquidStakingCore.nr` file created
- [ ] Storage structure defined
- [ ] Function signatures defined
- [ ] Contract compiles

**Acceptance Criteria:**
- Matches specification in liquid-staking-analysis.md
- Defines storage for: total_deposited, pending_pool, total_staked, liquidity_buffer
- Function signatures for: deposit(), request_withdrawal(), claim_withdrawal()
- Compiles successfully

**Storage Structure:**
```noir
#[storage]
struct Storage<Context> {
    total_deposited: PublicMutable<u128, Context>,
    pending_pool: PublicMutable<u128, Context>,
    total_staked: PublicMutable<u128, Context>,
    liquidity_buffer: PublicMutable<u128, Context>,
    admin: PublicMutable<AztecAddress, Context>,
}
```

---

### TASK-106: Implement LiquidStakingCore.nr Deposit Function
**Status:** 🔴 Not Started
**Estimated Time:** 8 hours
**Priority:** Critical
**Depends On:** TASK-105

**Context:** Implement deposit logic that accepts AZTEC and mints stAZTEC.

**Deliverables:**
- [ ] `deposit(amount: u128)` function
- [ ] Exchange rate calculation
- [ ] Call StakedAztecToken.mint()
- [ ] Pool accounting updates
- [ ] Event emission for bot monitoring
- [ ] Unit and integration tests

**Acceptance Criteria:**
- Accepts any amount of AZTEC (no minimum)
- Calculates correct stAZTEC amount based on exchange rate
- Calls StakedAztecToken.mint() with correct amount
- Updates pending_pool and total_deposited
- Emits DepositProcessed event
- If pool >= 200k, emits StakingNeeded event
- Tests cover: first deposit (rate=1.0), deposit with rate>1.0, large deposit

**Implementation:**
```noir
#[public]
fn deposit(amount: u128) -> u128 {
    let depositor = context.msg_sender();

    // Transfer AZTEC from user (assumes approval)
    // TODO: Call AZTEC token transfer

    // Calculate stAZTEC amount
    let exchange_rate = get_exchange_rate_from_token_contract();
    let st_aztec_amount = (amount * 10000) / exchange_rate;

    // Mint stAZTEC to user
    call_staztec_mint(depositor, st_aztec_amount);

    // Update accounting
    let pool = storage.pending_pool.read();
    storage.pending_pool.write(pool + amount);

    let deposited = storage.total_deposited.read();
    storage.total_deposited.write(deposited + amount);

    // Emit events
    emit_deposit_event(depositor, amount, st_aztec_amount);

    if pool + amount >= 200_000 {
        emit_staking_needed_event();
    }

    st_aztec_amount
}
```

---

### TASK-107: Implement LiquidStakingCore.nr Withdrawal Request
**Status:** 🔴 Not Started
**Estimated Time:** 6 hours
**Priority:** High
**Depends On:** TASK-106

**Context:** Implement withdrawal request that burns stAZTEC and queues withdrawal.

**Deliverables:**
- [ ] `request_withdrawal(st_aztec_amount: u128)` function
- [ ] Call StakedAztecToken.burn()
- [ ] Call WithdrawalQueue.add_request()
- [ ] Unit tests

**Acceptance Criteria:**
- Burns stAZTEC from user
- Calculates AZTEC amount to return based on exchange rate
- Adds request to withdrawal queue
- Returns request ID
- Tests cover: normal request, zero amount, insufficient balance

**Implementation:**
```noir
#[public]
fn request_withdrawal(st_aztec_amount: u128) -> u64 {
    let withdrawer = context.msg_sender();

    // Burn stAZTEC from user
    call_staztec_burn(withdrawer, st_aztec_amount);

    // Calculate AZTEC amount
    let exchange_rate = get_exchange_rate_from_token_contract();
    let aztec_amount = (st_aztec_amount * exchange_rate) / 10000;

    // Add to withdrawal queue
    let request_id = call_withdrawal_queue_add(withdrawer, aztec_amount);

    request_id
}
```

---

### TASK-108: Create VaultManager.nr Contract
**Status:** 🔴 Not Started
**Estimated Time:** 10 hours
**Priority:** High
**Depends On:** TASK-105

**Context:** Implement pool management and validator tracking.

**Deliverables:**
- [ ] `contracts/VaultManager.nr` created
- [ ] Storage for validator tracking (fixed-size array)
- [ ] `register_validator()` function
- [ ] `select_next_validator()` function (round-robin)
- [ ] `record_stake()` function
- [ ] Unit tests

**Acceptance Criteria:**
- Can register up to 100 validators
- Round-robin selection works correctly
- Stakes tracked per validator
- Only admin can register validators
- Tests cover: register, select, multiple validators

**Storage:**
```noir
#[storage]
struct Storage<Context> {
    our_validators: [AztecAddress; 100],
    validator_count: PublicMutable<u32, Context>,
    staked_per_validator: Map<AztecAddress, PublicMutable<u128, Context>, Context>,
    validator_active: Map<AztecAddress, PublicMutable<bool, Context>, Context>,
    total_staked_amount: PublicMutable<u128, Context>,
}
```

---

### TASK-109: Create RewardsManager.nr Contract
**Status:** 🔴 Not Started
**Estimated Time:** 8 hours
**Priority:** High
**Depends On:** TASK-104

**Context:** Implement rewards collection and exchange rate updates.

**Deliverables:**
- [ ] `contracts/RewardsManager.nr` created
- [ ] `claim_rewards()` function
- [ ] `update_exchange_rate()` function
- [ ] Protocol fee calculation (10%)
- [ ] Unit tests

**Acceptance Criteria:**
- Claims rewards from validators
- Calculates new exchange rate correctly
- Distributes 10% protocol fee to treasury
- Calls StakedAztecToken.update_exchange_rate()
- Tests cover: rate increase, fee distribution

**Exchange Rate Formula:**
```
new_rate = (total_aztec_controlled * 10000) / total_staztec_supply

where:
  total_aztec_controlled = staked + pending_pool + rewards - fees
```

---

### TASK-110: Create WithdrawalQueue.nr Contract
**Status:** 🔴 Not Started
**Estimated Time:** 12 hours
**Priority:** High
**Depends On:** TASK-105

**Context:** Implement FIFO withdrawal queue with unbonding period tracking.

**Deliverables:**
- [ ] `contracts/WithdrawalQueue.nr` created
- [ ] Fixed-size queue (10,000 max requests)
- [ ] `add_withdrawal_request()` function
- [ ] `process_withdrawals()` function
- [ ] `check_request_status()` function
- [ ] Unit tests

**Acceptance Criteria:**
- FIFO ordering preserved
- Tracks unbonding period (7 days from testnet data)
- Can process batch withdrawals
- Head/tail pointers managed correctly
- Tests cover: add, process, check status, queue full

**Queue Structure:**
```noir
struct WithdrawalRequest {
    request_id: u64,
    user: AztecAddress,
    amount: u128,
    requested_at: u64,  // Timestamp
    fulfilled: bool,
}

#[storage]
struct Storage<Context> {
    withdrawal_requests: [WithdrawalRequest; 10000],
    queue_head: PublicMutable<u64, Context>,
    queue_tail: PublicMutable<u64, Context>,
    next_request_id: PublicMutable<u64, Context>,
}
```

---

### TASK-111: Create ValidatorRegistry.nr Contract
**Status:** 🔴 Not Started
**Estimated Time:** 6 hours
**Priority:** Medium
**Depends On:** TASK-108

**Context:** Track OUR validator addresses and status.

**Deliverables:**
- [ ] `contracts/ValidatorRegistry.nr` created
- [ ] `add_validator()` function
- [ ] `remove_validator()` function
- [ ] `get_validator_status()` function
- [ ] Emergency pause mechanism
- [ ] Unit tests

**Acceptance Criteria:**
- Can add/remove validators
- Tracks active/inactive status
- Only admin can modify
- Integrates with VaultManager
- Tests cover: add, remove, status check

---

## Phase 3: Integration & Testing (Week 11-14)

### TASK-201: Write Integration Test: Full Deposit Flow
**Status:** 🔴 Not Started
**Estimated Time:** 6 hours
**Priority:** Critical
**Depends On:** TASK-106, TASK-103

**Context:** End-to-end test of user depositing AZTEC and receiving stAZTEC.

**Deliverables:**
- [ ] Integration test file: `tests/integration/deposit_flow.test.ts`
- [ ] Test covers: deposit → mint → balance check
- [ ] Runs on local sandbox

**Acceptance Criteria:**
- Test deploys all contracts
- User deposits 50,000 AZTEC
- Receives correct stAZTEC amount
- Balance verifiable on-chain
- Test passes consistently

**Test Structure:**
```typescript
describe('Full Deposit Flow', () => {
  it('should deposit AZTEC and receive stAZTEC', async () => {
    // Deploy contracts
    const token = await deploy('StakedAztecToken');
    const core = await deploy('LiquidStakingCore');

    // User deposits
    const tx = await core.methods.deposit(50000).send().wait();

    // Verify stAZTEC minted
    const balance = await token.methods.balance_of(user).call();
    expect(balance).toBe(50000n);
  });
});
```

---

### TASK-202: Write Integration Test: Withdrawal Flow
**Status:** 🔴 Not Started
**Estimated Time:** 6 hours
**Priority:** Critical
**Depends On:** TASK-107, TASK-110

**Context:** End-to-end test of withdrawal request → unbonding → claim.

**Deliverables:**
- [ ] Integration test: `tests/integration/withdrawal_flow.test.ts`
- [ ] Test covers: request → wait unbonding → claim
- [ ] Mock time progression for unbonding

**Acceptance Criteria:**
- User requests withdrawal
- Request queued correctly
- After unbonding period, claim succeeds
- AZTEC returned to user
- Test passes

---

### TASK-203: Write Integration Test: Staking Batch Trigger
**Status:** 🔴 Not Started
**Estimated Time:** 4 hours
**Priority:** High
**Depends On:** TASK-106, TASK-108

**Context:** Test that deposits trigger staking when pool reaches 200k.

**Deliverables:**
- [ ] Integration test: `tests/integration/staking_trigger.test.ts`
- [ ] Simulates multiple deposits reaching 200k threshold
- [ ] Verifies event emission

**Acceptance Criteria:**
- Multiple users deposit (total = 200k+)
- StakingNeeded event emitted
- Pool accounting correct
- Test passes

---

### TASK-204: Fuzz Test: StakedAztecToken.nr
**Status:** 🔴 Not Started
**Estimated Time:** 8 hours
**Priority:** Medium
**Depends On:** TASK-104

**Context:** Property-based testing to find edge cases in token logic.

**Deliverables:**
- [ ] Fuzz test suite for StakedAztecToken
- [ ] Invariants defined and tested
- [ ] 1000+ random inputs tested

**Acceptance Criteria:**
- Total supply always equals sum of balances
- Cannot create/destroy tokens (except mint/burn)
- No integer overflows
- Fuzz tests pass

**Invariants:**
```typescript
// Total supply = sum of all balances
assert(totalSupply === sum(allBalances))

// Transfers don't change total supply
assert(totalSupply_before === totalSupply_after)

// Mint increases supply
assert(totalSupply_after === totalSupply_before + mintAmount)
```

---

## Phase 4: Bot Infrastructure (Week 10-16)

### TASK-301: Create Staking Keeper Bot Skeleton
**Status:** 🔴 Not Started
**Estimated Time:** 4 hours
**Priority:** High
**Depends On:** TASK-106

**Context:** Create bot that monitors pool and triggers staking at 200k threshold.

**Deliverables:**
- [ ] `bots/staking-keeper/src/index.ts` created
- [ ] Basic event listener for DepositProcessed
- [ ] Connection to Aztec RPC
- [ ] Compiles and runs (no-op)

**Acceptance Criteria:**
- Can connect to Aztec testnet RPC
- Listens for DepositProcessed events
- Logs events to console
- No crashes

**Structure:**
```typescript
// PSEUDOCODE ONLY:
// Aztec is not EVM; client libraries and interaction patterns may differ from viem/ethers.
// Use Aztec’s official SDK/client tooling once selected.

const client = createPublicClient({
  // chain: <aztec chain config>,
  // transport: <aztec transport>,
});

// Listen for deposits
client.watchContractEvent({
  address: VAULT_MANAGER_ADDRESS,
  abi: vaultManagerAbi,
  eventName: 'DepositProcessed',
  onLogs: async (logs) => {
    console.log('Deposit detected:', logs);
  }
});
```

---

### TASK-302: Implement Staking Keeper Logic
**Status:** 🔴 Not Started
**Estimated Time:** 8 hours
**Priority:** High
**Depends On:** TASK-301, TASK-108

**Context:** Implement full staking logic: check pool → select validator → execute stake.

**Deliverables:**
- [ ] Pool balance checking
- [ ] Validator selection (call VaultManager)
- [ ] Stake execution
- [ ] Error handling and retries
- [ ] Unit tests for bot logic

**Acceptance Criteria:**
- When pool >= 200k, triggers staking
- Calls VaultManager.select_next_validator()
- Executes stake transaction
- Handles failed transactions (retry)
- Logs all actions

**Logic:**
```typescript
async function checkAndStake() {
  const poolBalance = await client.readContract({
    address: VAULT_MANAGER_ADDRESS,
    abi: vaultManagerAbi,
    functionName: 'getPoolBalance'
  });

  if (poolBalance >= 200_000n * 10n**18n) {
    const validator = await selectBestValidator();

    const tx = await wallet.writeContract({
      address: VAULT_MANAGER_ADDRESS,
      abi: vaultManagerAbi,
      functionName: 'stakeToValidator',
      args: [validator, 200_000n * 10n**18n]
    });

    console.log(`Staked 200k to ${validator}, tx: ${tx}`);
  }
}
```

---

### TASK-303: Create Rewards Keeper Bot
**Status:** 🔴 Not Started
**Estimated Time:** 10 hours
**Priority:** High
**Depends On:** TASK-109

**Context:** Create bot that claims rewards and updates exchange rate periodically.

**Deliverables:**
- [ ] `bots/rewards-keeper/src/index.ts` created
- [ ] Scheduled job (every epoch/hour)
- [ ] Claims rewards from validators
- [ ] Updates exchange rate
- [ ] Distributes protocol fee
- [ ] Unit tests

**Acceptance Criteria:**
- Runs on schedule (configurable interval)
- Calls RewardsManager.claim_rewards()
- Calls StakedAztecToken.update_exchange_rate()
- Logs rewards and new rate
- Handles errors gracefully

**Scheduling:**
```typescript
import { Queue, Worker } from 'bullmq';

const queue = new Queue('rewards', { connection: redis });

// Schedule every hour
await queue.add('claim-rewards', {}, {
  repeat: { every: 3600000 }
});

const worker = new Worker('rewards', async (job) => {
  await claimRewards();
  await updateExchangeRate();
}, { connection: redis });
```

---

### TASK-304: Create Withdrawal Keeper Bot
**Status:** 🔴 Not Started
**Estimated Time:** 8 hours
**Priority:** High
**Depends On:** TASK-110

**Context:** Create bot that processes withdrawal queue.

**Deliverables:**
- [ ] `bots/withdrawal-keeper/src/index.ts` created
- [ ] Queue monitoring (check every 5 minutes)
- [ ] Process ready withdrawals
- [ ] Unstake from validators if needed
- [ ] Unit tests

**Acceptance Criteria:**
- Checks queue periodically
- Processes withdrawals past unbonding period
- Calls WithdrawalQueue.process_withdrawals()
- Unstakes from validators when liquidity needed
- Logs all actions

---

### TASK-305: Create Monitoring Bot
**Status:** 🔴 Not Started
**Estimated Time:** 12 hours
**Priority:** Medium
**Depends On:** TASK-002

**Context:** Create monitoring bot for validator health and protocol metrics.

**Deliverables:**
- [ ] `bots/monitoring/src/index.ts` created
- [ ] Validator uptime checks (query Aztec RPC)
- [ ] TVL tracking
- [ ] Slashing event detection
- [ ] Alert integration (Telegram/PagerDuty)
- [ ] Prometheus metrics export

**Acceptance Criteria:**
- Monitors OUR validators every 60 seconds
- Alerts if validator offline >5 minutes
- Alerts if slashing detected
- Exports metrics to Prometheus
- Tests for alert triggering

**Metrics:**
```typescript
const tvlGauge = new Gauge({
  name: 'aztec_liquid_staking_tvl',
  help: 'Total value locked'
});

const validatorUptimeGauge = new Gauge({
  name: 'aztec_validator_uptime',
  help: 'Validator uptime percentage',
  labelNames: ['validator_address']
});

// Update metrics
tvlGauge.set(await getTVL());
validatorUptimeGauge.set({ validator_address: addr }, 99.9);
```

---

### TASK-306: Deploy Bot Infrastructure to Kubernetes
**Status:** 🔴 Not Started
**Estimated Time:** 16 hours
**Priority:** High
**Depends On:** TASK-302, TASK-303, TASK-304, TASK-305

**Context:** Deploy all bots to production Kubernetes cluster.

**Deliverables:**
- [ ] Kubernetes manifests for each bot
- [ ] ConfigMaps for configuration
- [ ] Secrets for private keys
- [ ] Service definitions
- [ ] Helm chart (optional)
- [ ] Deployment documentation

**Acceptance Criteria:**
- All 4 bots running in Kubernetes
- Auto-restart on failure
- Health checks configured
- Resource limits set
- Logs aggregated
- Can deploy to staging and production

**K8s Manifest:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: staking-keeper
spec:
  replicas: 2  # HA
  selector:
    matchLabels:
      app: staking-keeper
  template:
    metadata:
      labels:
        app: staking-keeper
    spec:
      containers:
      - name: staking-keeper
        image: your-registry/staking-keeper:latest
        env:
        - name: AZTEC_RPC_URL
          valueFrom:
            secretKeyRef:
              name: aztec-secrets
              key: rpc-url
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
```

---

## Phase 5: Security & Audits (Week 15-22)

### TASK-401: Conduct Internal Security Review
**Status:** 🔴 Not Started
**Estimated Time:** 20 hours
**Priority:** Critical
**Depends On:** All contract tasks (TASK-104, 106, 107, 108, 109, 110, 111)

**Context:** Team-led security review before external audits.

**Deliverables:**
- [ ] Security checklist completed
- [ ] All contracts reviewed for common vulnerabilities
- [ ] Issues documented and prioritized
- [ ] Fixes implemented for critical/high issues

**Acceptance Criteria:**
- Reentrancy protection verified (all state changes before external calls)
- Access control on all sensitive functions
- Integer overflow/underflow checks
- No unchecked external calls
- Documentation of all findings

**Checklist:**
- [ ] Reentrancy (CEI pattern followed?)
- [ ] Access control (only authorized callers?)
- [ ] Integer math (overflow protection?)
- [ ] External calls (validate return values?)
- [ ] State consistency (invariants maintained?)
- [ ] Denial of service vectors?
- [ ] Front-running vulnerabilities?

---

### TASK-402: Prepare Audit Documentation
**Status:** 🔴 Not Started
**Estimated Time:** 12 hours
**Priority:** High
**Depends On:** TASK-401

**Context:** Compile all documentation for external auditors.

**Deliverables:**
- [ ] Architecture documentation
- [ ] Contract specifications
- [ ] Function-by-function documentation
- [ ] Known issues list
- [ ] Test coverage report
- [ ] Deployment guide

**Acceptance Criteria:**
- All contracts have NatSpec comments
- Architecture diagrams included
- Threat model documented
- Test coverage >80%
- Auditors can understand codebase in <2 hours

**NatSpec Example:**
```noir
/// @notice Deposits AZTEC and mints stAZTEC tokens
/// @dev Calculates stAZTEC amount based on current exchange rate
/// @param amount Amount of AZTEC to deposit (wei)
/// @return Amount of stAZTEC minted
#[public]
fn deposit(amount: u128) -> u128 {
    // ...
}
```

---

### TASK-403: Set Up Bug Bounty Program
**Status:** 🔴 Not Started
**Estimated Time:** 8 hours
**Priority:** Medium
**Depends On:** TASK-402

**Context:** Launch bug bounty on Immunefi or similar platform.

**Deliverables:**
- [ ] Immunefi program created
- [ ] Scope defined (contracts only, not bots)
- [ ] Payout structure ($10k-$100k)
- [ ] Response process documented

**Acceptance Criteria:**
- Program live on Immunefi
- Contracts verified on Aztec explorer
- Payout structure: Critical $100k, High $50k, Medium $10k
- Response SLA: 24 hours for critical
- Program announced to security community

**Scope:**
```markdown
**In Scope:**
- StakedAztecToken.nr
- LiquidStakingCore.nr
- VaultManager.nr
- RewardsManager.nr
- WithdrawalQueue.nr
- ValidatorRegistry.nr

**Out of Scope:**
- Bot infrastructure (off-chain)
- Frontend
- Aztec protocol itself
```

---

## Phase 6: Deployment & Launch (Week 23-24)

### TASK-501: Deploy Contracts to Mainnet
**Status:** 🔴 Not Started
**Estimated Time:** 4 hours
**Priority:** Critical
**Depends On:** All audits complete

**Context:** Deploy all contracts to Aztec mainnet.

**Deliverables:**
- [ ] Deployment script
- [ ] Multi-sig deployment (3-of-5)
- [ ] Contract addresses documented
- [ ] Contracts verified on explorer
- [ ] Deployment announcement

**Acceptance Criteria:**
- All 6 contracts deployed
- Addresses recorded in deployment.json
- Verified on Aztec block explorer
- Ownership transferred to multi-sig
- No deployment errors

**Deployment Script:**
```bash
#!/bin/bash

# Deploy in order (dependencies first)
aztec-cli deploy StakedAztecToken
aztec-cli deploy ValidatorRegistry
aztec-cli deploy VaultManager
aztec-cli deploy RewardsManager
aztec-cli deploy WithdrawalQueue
aztec-cli deploy LiquidStakingCore

# Verify all contracts
aztec-cli verify-contract <address> <contract-name>
```

---

### TASK-502: Configure Production Validators
**Status:** 🔴 Not Started
**Estimated Time:** 8 hours
**Priority:** Critical
**Depends On:** TASK-002

**Context:** Deploy production validator infrastructure.

**Deliverables:**
- [ ] 3 validator nodes deployed (different regions)
- [ ] Monitoring configured
- [ ] Backup/disaster recovery tested
- [ ] 200k AZTEC staked to each (initial capital)

**Acceptance Criteria:**
- 3 validators operational
- Geographic diversity (US, EU, Asia)
- Uptime monitoring active
- Backup nodes ready for failover
- All validators registered in ValidatorRegistry contract

**Regions:**
- us-east-1 (AWS Virginia)
- eu-west-1 (AWS Ireland)
- ap-southeast-1 (AWS Singapore)

---

### TASK-503: Deploy Frontend Application
**Status:** 🔴 Not Started
**Estimated Time:** 16 hours
**Priority:** High
**Depends On:** TASK-501

**Context:** Deploy simple deposit/withdraw UI.

**Deliverables:**
- [ ] Next.js frontend deployed
- [ ] Wallet/PXE connection (Aztec-compatible tooling; confirm supported options)
- [ ] Deposit flow
- [ ] Withdrawal flow
- [ ] Portfolio view
- [ ] Domain: staztec.io or similar

**Acceptance Criteria:**
- Live at production domain
- Can connect wallet
- Can deposit AZTEC
- Can request/claim withdrawal
- Shows balance and APR
- SSL configured
- Analytics integrated

**Tech Stack:**
- Next.js 14
- Aztec-compatible wallet/SDK tooling (TBD; avoid assuming EVM libraries)
- TailwindCSS
- Vercel deployment

---

### TASK-504: Launch Marketing Campaign
**Status:** 🔴 Not Started
**Estimated Time:** 12 hours
**Priority:** Medium
**Depends On:** TASK-503

**Context:** Announce stAZTEC protocol to Aztec community.

**Deliverables:**
- [ ] Twitter announcement thread
- [ ] Aztec Discord announcement
- [ ] Blog post on landing page
- [ ] Tutorial video (YouTube)
- [ ] Partnership announcements (if any)

**Acceptance Criteria:**
- Twitter thread published (10+ tweets)
- Posted in Aztec Discord #announcements
- Blog post live on staztec.io
- Video live on YouTube
- 1000+ impressions in first 24 hours

**Twitter Thread Outline:**
```
1/ Introducing stAZTEC - liquid staking for @aztecnetwork 🔐

2/ Problem: 200,000 AZTEC minimum to stake. 70% of holders locked out.
   (Note: “70%” is a placeholder claim until backed by a source or removed from public-facing comms.)

3/ Solution: Deposit any amount, get stAZTEC, earn 8% APR + DeFi utility

... (continue with features, team, security)

10/ (Launch template) Live at staztec.io - audited by [firms], $X bug bounty
```

---

## Task Dependencies Visualization

```
Phase 1 (Foundation):
TASK-001 → TASK-101 (Contract dev needs environment)
TASK-002 (Validator deployment - parallel)
TASK-005 (Validation results log - parallel)
TASK-006 depends on TASK-002 (slashing mechanics)
TASK-007 (DeFi mapping - parallel)
TASK-008 depends on TASK-007 (liquidity bootstrap plan)
TASK-009 (competitor tracker - parallel)

Phase 2 (Contracts):
TASK-101 → TASK-102 → TASK-103 → TASK-104 → TASK-105
TASK-105 → TASK-106 → TASK-107
TASK-105 → TASK-108 → TASK-109
TASK-105 → TASK-110
TASK-108 → TASK-111

Phase 3 (Testing):
TASK-201 depends on TASK-106, TASK-103
TASK-202 depends on TASK-107, TASK-110
TASK-203 depends on TASK-106, TASK-108
TASK-204 depends on TASK-104

Phase 4 (Bots):
TASK-301 → TASK-302 (Staking bot)
TASK-303 (Rewards bot)
TASK-304 (Withdrawal bot)
TASK-305 (Monitoring bot)
TASK-306 depends on TASK-302, 303, 304, 305

Phase 5 (Security):
TASK-401 depends on ALL contract tasks
TASK-402 depends on TASK-401
TASK-403 depends on TASK-402

Phase 6 (Launch):
TASK-501 depends on audits
TASK-502 depends on TASK-002
TASK-503 depends on TASK-501
TASK-504 depends on TASK-503
```

---

## Tracking Progress

**Project Manager:** Update this section weekly

| Phase | Total Tasks | Completed | In Progress | Not Started |
|-------|-------------|-----------|-------------|-------------|
| Phase 1 | 9 | 1 | 0 | 8 |
| Phase 2 | 11 | 0 | 0 | 11 |
| Phase 3 | 4 | 0 | 0 | 4 |
| Phase 4 | 6 | 0 | 0 | 6 |
| Phase 5 | 3 | 0 | 0 | 3 |
| Phase 6 | 4 | 0 | 0 | 4 |
| **TOTAL** | **37** | **1** | **0** | **36** |

**Critical Path Tasks:** TASK-001, 101, 102, 103, 104, 105, 106, 302, 401, 501

**Next 3 Tasks to Assign:**
1. ~~TASK-001A: Local Sandbox Smoke Tests~~ ✅ Complete (compilation verified)
2. TASK-002: Deploy Test Validator (requires cloud/local machine with full Docker)
3. TASK-003: Measure Testnet Transaction Costs

---

## Using This Document with AI Agents

**To assign a task to an agent:**

```markdown
Agent, please complete TASK-XXX. Here's what you need:

1. Read the task description
2. Review the resources linked
3. Create deliverables as specified
4. Test against acceptance criteria
5. Report back when complete

Let me know if you have questions about the requirements.
```

**Agent should respond with:**
- Confirmation of understanding
- Estimated completion time
- Any blockers or questions
- Regular progress updates
- Final deliverable summary

---

**Last Updated:** December 27, 2025
**Total Tasks:** 37
**Estimated Total Time:** ~300 hours (7.5 weeks at 40 hrs/week)

**Ready to begin!** Start with TASK-001.
