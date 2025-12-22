# Aztec Liquid Staking Protocol - Technical Analysis & Architecture

**Date:** December 22, 2025
**Status:** Pre-implementation Analysis
**Priority:** 🔥 URGENT - Tier 1 Opportunity

---

## Executive Summary

Aztec Network presents a **first-mover opportunity** for liquid staking on a privacy-focused Ethereum L2. With native staking live since November 2025, a 200,000 AZTEC minimum stake requirement, and only two unidentified teams currently building fractional staking solutions, there is a narrow window to capture significant market share.

**Key Facts:**
- **Launch:** November 2025 (Mainnet live)
- **Validators:** 500+ sequencers at launch, now ~1,000 in validator set
- **Minimum Stake:** 200,000 AZTEC (~$6,000 at token sale prices)
- **Token Sale:** Dec 2-6, 2025 - 19,476 ETH raised, 16,700 participants
- **Liquid Staking Status:** ❌ NOT AVAILABLE (two teams building)
- **Network Type:** Privacy-first ZK-Rollup L2 on Ethereum
- **Backing:** Vitalik-supported project

---

## Architecture Diagram

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              USER LAYER                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Retail     │  │ Institutional│  │     DeFi     │  │   Wallets    │        │
│  │    Users     │  │   Investors  │  │  Protocols   │  │  (Metamask)  │        │
│  │ (<200k AZTEC)│  │  (Any amount)│  │  (Aave, etc) │  │              │        │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘        │
│         │                 │                  │                  │                │
│         └─────────────────┴──────────────────┴──────────────────┘                │
│                                      │                                           │
└──────────────────────────────────────┼───────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER (Next.js/React)                            │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │  - Deposit/Withdrawal UI                                                 │    │
│  │  - stAZTEC Balance Display                                               │    │
│  │  - Real-time APR/Exchange Rate                                           │    │
│  │  - Optional: Private transaction interface                               │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────┼───────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    SMART CONTRACT LAYER (100% Noir)                              │
│                                                                                   │
│  ┌────────────────────────────────────────────────────────────────────────┐     │
│  │                     CORE CONTRACTS (Noir Only)                          │     │
│  │                                                                          │     │
│  │  ┌──────────────────────────┐      ┌───────────────────────────┐       │     │
│  │  │  LiquidStakingCore.nr    │◄─────┤  StakedAztecToken.nr      │       │     │
│  │  │                          │      │  - Reward-bearing token    │       │     │
│  │  │  #[public]               │      │  - Public balances (Map)   │       │     │
│  │  │  - deposit()             │      │  - Transfer logic          │       │     │
│  │  │  - requestWithdrawal()   │      │  - Exchange rate tracking  │       │     │
│  │  │  - claimWithdrawal()     │      └───────────────────────────┘       │     │
│  │  │                          │                                           │     │
│  │  │  #[private] (Optional)   │                                           │     │
│  │  │  - deposit_private()     │                                           │     │
│  │  │  - withdraw_private()    │                                           │     │
│  │  └────────┬─────────────────┘                                           │     │
│  │           │                                                              │     │
│  │           ▼                                                              │     │
│  │  ┌──────────────────────────┐      ┌───────────────────────────┐       │     │
│  │  │  VaultManager.nr         │◄─────┤  ValidatorRegistry.nr     │       │     │
│  │  │                          │      │                            │       │     │
│  │  │  #[public]               │      │  #[public]                 │       │     │
│  │  │  - Pool aggregation      │      │  - OUR validator addresses │       │     │
│  │  │  - 200k batch creation   │      │  - Performance tracking    │       │     │
│  │  │  - Liquidity buffer      │      │  - Uptime monitoring       │       │     │
│  │  │  - Stake to OUR nodes    │      │  - Slashing protection     │       │     │
│  │  └────────┬─────────────────┘      └───────────────────────────┘       │     │
│  │           │                                                              │     │
│  │           ▼                                                              │     │
│  │  ┌──────────────────────────┐      ┌───────────────────────────┐       │     │
│  │  │  RewardsManager.nr       │      │  WithdrawalQueue.nr        │       │     │
│  │  │                          │      │                            │       │     │
│  │  │  #[public]               │      │  #[public]                 │       │     │
│  │  │  - Collect from OUR nodes│      │  - FIFO queue              │       │     │
│  │  │  - Protocol fee (10%)    │      │  - Unbonding tracker       │       │     │
│  │  │  - Update exchange rate  │      │  - Batch processing        │       │     │
│  │  │  - Compound yields       │      │  - Instant withdraw buffer │       │     │
│  │  └──────────────────────────┘      └───────────────────────────┘       │     │
│  │                                                                          │     │
│  └──────────────────────────────────────────────────────────────────────────┘    │
│                                                                                   │
│  NOTE: All contracts written in Noir (.nr files)                                 │
│  - #[public] functions execute on Aztec sequencers                               │
│  - #[private] functions execute on user PXE (optional privacy features)          │
│  - NO Solidity - Aztec only supports Noir contracts                              │
└──────────────────────────────────────┼───────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      BOT INFRASTRUCTURE (TypeScript/Node.js)                     │
│                                                                                   │
│  Core Philosophy: We run OUR OWN validators. Users delegate AZTEC to us.        │
│  Capital: $0 in AZTEC (users provide), only server costs (~$400/mo/validator)   │
│                                                                                   │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐  │
│  │   Staking Keeper     │  │   Rewards Keeper     │  │  Withdrawal Keeper   │  │
│  │   (Bot #1)           │  │   (Bot #2)           │  │  (Bot #3)            │  │
│  │                      │  │                      │  │                      │  │
│  │ - Monitor pool       │  │ - Claim from OUR     │  │ - Process queue      │  │
│  │ - Batch to 200k      │  │   validator nodes    │  │ - Unstake from OUR   │  │
│  │ - Stake to OUR nodes │  │ - Update stAZTEC rate│  │   nodes if needed    │  │
│  │ - Track activation   │  │ - Protocol fee (10%) │  │ - Fulfill withdrawals│  │
│  │                      │  │ - Compound yields    │  │ - Manage liquidity   │  │
│  │ Trigger: Pool ≥ 200k │  │ Trigger: Every epoch │  │ Trigger: Queue > 0   │  │
│  └──────────────────────┘  └──────────────────────┘  └──────────────────────┘  │
│                                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │  Monitoring & Alerts (Bot #4 - Optional but Recommended)                 │   │
│  │                                                                            │   │
│  │  - Health checks on OUR validators (uptime, sync status)                 │   │
│  │  - Track staking pool, rewards, withdrawal queue                         │   │
│  │  - Alert on slashing events affecting OUR nodes                          │   │
│  │  - Gas price monitoring                                                   │   │
│  │  - Anomaly detection (TVL drops, rate changes)                           │   │
│  │  - Telegram/PagerDuty alerts                                             │   │
│  │                                                                            │   │
│  │  Trigger: Continuous monitoring                                           │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                   │
│  Technology Stack:                                                                │
│  - Runtime: Node.js 20+ (TypeScript 5.3+)                                        │
│  - Web3 Library: viem (recommended for Aztec)                                    │
│  - Queue: BullMQ (Redis-backed job scheduling)                                   │
│  - Monitoring: Prometheus + Grafana                                              │
│  - Alerts: PagerDuty / Telegram Bot                                              │
│  - Deployment: Docker + Kubernetes (3 nodes for HA)                              │
│                                                                                   │
│  Simplified from 6 bots to 3-4 because:                                          │
│  ✓ No Rebalancing Bot - we control validators, just monitor OUR nodes           │
│  ✓ No Oracle Bot - validator metrics from Aztec network directly                │
│  ✓ No Migrator Bot - stake goes to OUR validators only                          │
└──────────────────────────────────────┼───────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           AZTEC NETWORK LAYER                                    │
│                                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       ┌──────────────┐   │
│  │  Sequencer 1 │  │  Sequencer 2 │  │  Sequencer N │  ...  │ Sequencer 50+│   │
│  │  200k AZTEC  │  │  200k AZTEC  │  │  200k AZTEC  │       │  200k AZTEC  │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       └──────┬───────┘   │
│         │                 │                  │                       │           │
│         └─────────────────┴──────────────────┴───────────────────────┘           │
│                                      │                                           │
│                                      ▼                                           │
│                          ┌─────────────────────────┐                            │
│                          │  Aztec Staking Contract │                            │
│                          │  - Stake management     │                            │
│                          │  - Reward distribution  │                            │
│                          │  - Slashing logic       │                            │
│                          │  - Governance votes     │                            │
│                          └─────────────────────────┘                            │
│                                      │                                           │
│                                      ▼                                           │
│                          ┌─────────────────────────┐                            │
│                          │   Prover Network        │                            │
│                          │   (14-level proof tree) │                            │
│                          └─────────────────────────┘                            │
│                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────┘


### Data Flow: Deposit Transaction

┌──────┐                                                                    ┌──────┐
│ User │                                                                    │Aztec │
│      │                                                                    │ Net  │
└──┬───┘                                                                    └───┬──┘
   │                                                                            │
   │ 1. deposit(50,000 AZTEC)                                                  │
   ├──────────────────────────────────►┌─────────────────────┐                │
   │                                    │ LiquidStakingCore   │                │
   │                                    └──────────┬──────────┘                │
   │                                               │                           │
   │                                    2. Calculate stAZTEC amount            │
   │                                               │ (50,000 / exchange_rate)  │
   │                                               │                           │
   │                                    ┌──────────▼──────────┐                │
   │                                    │  stAZTEC.mint()     │                │
   │◄───────────────────────────────────┤  Transfer to user   │                │
   │ 3. Receive stAZTEC tokens          └──────────┬──────────┘                │
   │                                               │                           │
   │                                    4. Update VaultManager                 │
   │                                               │                           │
   │                                    ┌──────────▼──────────┐                │
   │                                    │  VaultManager       │                │
   │                                    │  total += 50k       │                │
   │                                    │  pool = 250k total  │                │
   │                                    └──────────┬──────────┘                │
   │                                               │                           │
   │                                    ┌──────────▼──────────┐                │
   │                                    │ Check: pool >= 200k?│                │
   │                                    │      YES             │                │
   │                                    └──────────┬──────────┘                │
   │                                               │                           │
   │                                    5. Emit StakingNeeded event            │
   │                                               │                           │
   │                                    ┌──────────▼──────────┐                │
   │                                    │   Staking Bot       │                │
   │                                    │   (Listening)       │                │
   │                                    └──────────┬──────────┘                │
   │                                               │                           │
   │                                    6. Execute staking tx                  │
   │                                               │                           │
   │                                    ┌──────────▼──────────┐                │
   │                                    │  StakeRouter        │                │
   │                                    │  selectValidator()  │                │
   │                                    └──────────┬──────────┘                │
   │                                               │                           │
   │                                    7. Stake 200k to validator             │
   │                                               │                           │
   │                                               ├───────────────────────────►│
   │                                               │  stakeTo(validator_addr,  │
   │                                               │          200,000 AZTEC)   │
   │                                               │                           │
   │                                               │◄──────────────────────────┤
   │                                               │  Staking confirmed        │
   │                                    ┌──────────▼──────────┐                │
   │                                    │  Update VaultManager│                │
   │                                    │  pool -= 200k       │                │
   │                                    │  staked += 200k     │                │
   │                                    │  new batch created  │                │
   │                                    └─────────────────────┘                │
   │                                                                            │
   │  8. User sees stAZTEC in wallet                                           │
   │     and earns rewards automatically                                       │
   │                                                                            │
```

### Privacy Architecture (Optional Private Deposits)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      PRIVACY-ENABLED ARCHITECTURE                        │
│                                                                           │
│  User Device (PXE - Private Execution Environment)                       │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │                                                                  │     │
│  │  1. User initiates private deposit                              │     │
│  │     ┌──────────────────────────────────────┐                    │     │
│  │     │  PrivateLiquidStaking.nr             │                    │     │
│  │     │  #[private]                          │                    │     │
│  │     │  fn deposit_private(amount: Field)   │                    │     │
│  │     └───────────┬──────────────────────────┘                    │     │
│  │                 │                                                │     │
│  │  2. Generate ZK proof of deposit                                │     │
│  │                 │                                                │     │
│  │     ┌───────────▼──────────────────────────┐                    │     │
│  │     │  Noir Circuit Compilation            │                    │     │
│  │     │  - Prove: user has X AZTEC           │                    │     │
│  │     │  - Prove: transfer is valid          │                    │     │
│  │     │  - Hide: amount, sender identity     │                    │     │
│  │     └───────────┬──────────────────────────┘                    │     │
│  │                 │                                                │     │
│  │  3. Client-side proof generation                                │     │
│  │                 │                                                │     │
│  │     ┌───────────▼──────────────────────────┐                    │     │
│  │     │  ZK Proof Generated                  │                    │     │
│  │     │  Public inputs: commitment hash      │                    │     │
│  │     │  Private: actual amount, nullifier   │                    │     │
│  │     └───────────┬──────────────────────────┘                    │     │
│  │                 │                                                │     │
│  └─────────────────┼────────────────────────────────────────────────┘    │
│                    │                                                      │
│                    ▼                                                      │
│  Aztec Network (Public State)                                            │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                   │    │
│  │  4. Submit proof to public contract                              │    │
│  │     ┌──────────────────────────────────────┐                     │    │
│  │     │  LiquidStakingCore.nr                │                     │    │
│  │     │  verifyAndProcess(proof)             │                     │    │
│  │     └───────────┬──────────────────────────┘                     │    │
│  │                 │                                                 │    │
│  │  5. Verify proof without knowing amount                          │    │
│  │                 │                                                 │    │
│  │     ┌───────────▼──────────────────────────┐                     │    │
│  │     │  if proof.verify() == true:          │                     │    │
│  │     │    - Update public total (encrypted) │                     │    │
│  │     │    - Mint stAZTEC to commitment addr │                     │    │
│  │     │    - Emit event (no personal info)   │                     │    │
│  │     └──────────────────────────────────────┘                     │    │
│  │                                                                   │    │
│  └───────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  Result: Observers see "someone staked something" but not who or how much│
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 100% Noir Architecture: Critical Understanding

### ⚠️ IMPORTANT: Aztec ONLY Supports Noir Contracts

**There is NO Solidity on Aztec.** All smart contracts must be written in Noir (.nr files).

Our liquid staking protocol will be written **entirely in Noir** using the Aztec.nr framework:
- **#[public] functions** for transparent state (vault pooling, token balances, staking logic)
- **#[private] functions** for optional privacy features (anonymous deposits/withdrawals)

This section details Noir's unique characteristics, limitations, and best practices for building production contracts.

### Language Fundamentals

| Aspect | Solidity | Noir |
|--------|----------|------|
| **Primary Purpose** | General smart contracts for EVM | Zero-knowledge circuit programming |
| **Syntax Inspiration** | JavaScript, C++, Python | Rust |
| **Execution Model** | EVM bytecode | ACIR (Abstract Circuit Intermediate Representation) |
| **State Model** | Account-based (public) | UTXO (private) + Account (public) |
| **Compilation Target** | EVM opcodes | ZK circuits → proofs |
| **Learning Curve** | Moderate (familiar to web devs) | Steep (requires ZK understanding) |
| **Tooling Maturity** | Excellent (Hardhat, Foundry, Remix) | Good and improving (Noir 1.0+) |
| **Debugging** | Rich (console.log, stack traces) | Limited (constraint errors) |
| **Gas Model** | EVM gas (per opcode) | Circuit size (gates/constraints) |

### Key Differences

#### 1. **Type System**

**Solidity:**
```solidity
uint256 balance;        // 256-bit unsigned integer
address user;           // 20-byte Ethereum address
mapping(address => uint256) balances;
bool isActive;
```

**Noir:**
```noir
Field balance;          // Prime field element (~254 bits)
AztecAddress user;      // Aztec-specific address type
mapping(AztecAddress => PrivateBalance) balances;  // Private state
bool is_active;         // Underscore naming convention
```

**Critical Gotcha:** Noir's `Field` type wraps around at prime modulus, not 2^256. Integer overflow works differently!

#### 2. **Arrays and Loops**

**Solidity:**
```solidity
uint256[] public dynamicArray;  // Dynamic sizing
for (uint i = 0; i < dynamicArray.length; i++) {
    // Dynamic loop bounds
}
```

**Noir:**
```noir
fn process_items<N>(items: [Field; N]) {  // Fixed-size array (compile-time)
    for i in 0..N {  // Loop unrolled at compile time
        // Each iteration adds gates to circuit
    }
}
```

**Critical Limitation:** Arrays must be fixed-size at compile time. No dynamic arrays or nested arrays (arrays of arrays).

**Performance Impact:** Loops are "unrolled" - a 100-iteration loop creates 100x the circuit constraints. Optimize aggressively!

#### 3. **Private vs. Public Functions**

**Solidity:**
```solidity
function deposit(uint256 amount) public {
    // All state changes are public on-chain
    balances[msg.sender] += amount;
}
```

**Noir (Aztec):**
```noir
#[private]  // Executes on client, generates proof
fn deposit_private(amount: Field) {
    // Private state updated locally
    let sender = context.msg_sender();
    storage.private_balances.at(sender).add(amount);
    // Only proof is submitted on-chain
}

#[public]   // Executes on sequencer, like Solidity
fn update_total(amount: Field) {
    storage.total_staked.write(
        storage.total_staked.read() + amount
    );
}
```

**Key Difference:** Private functions run on user's device (PXE - Private Execution Environment), public functions run on sequencers.

#### 4. **Unconstrained Functions**

**Noir:**
```noir
unconstrained fn calculate_complex_hash(data: Field) -> Field {
    // Runs off-circuit (no ZK constraints generated)
    // Useful for expensive computations
    // WARNING: Results are NOT proven! Must constrain elsewhere
    poseidon::hash(data)
}

fn verify_hash(data: Field) {
    let hash = calculate_complex_hash(data);  // Call unconstrained
    assert(hash == expected_hash);  // Constraint added here!
}
```

**Critical Security Issue:** Unconstrained code can produce any value. Always constrain outputs!

From [OpenZeppelin's Guide](https://www.openzeppelin.com/news/developer-guide-to-building-safe-noir-circuits):
> "Circuit code without constraints can be 'proven' to create any outcome. When switching to unconstrained, appropriate constraints must still be laid down elsewhere."

### Development Challenges & Solutions

#### Challenge 1: **Circuit Size Explosion**

**Problem:** Noir converts all logic to ZK constraints. Complex code = huge circuits = slow proving.

**Example:**
```noir
// BAD: Creates massive circuit
fn process_all_validators(validators: [ValidatorInfo; 1000]) {
    for i in 0..1000 {  // 1000x circuit size!
        // Complex validation logic
        validate_performance(validators[i]);
    }
}

// GOOD: Use unconstrained + selective constraints
unconstrained fn find_best_validator(
    validators: [ValidatorInfo; 1000]
) -> u32 {
    // Run off-circuit (fast)
    let mut best_index = 0;
    for i in 0..1000 {
        if validators[i].performance > validators[best_index].performance {
            best_index = i;
        }
    }
    best_index
}

fn select_validator() -> ValidatorInfo {
    let index = find_best_validator(all_validators);
    let selected = all_validators[index];
    // Only constrain the selected validator
    constrain(selected.is_valid());
    selected
}
```

**Solution:** Push computation to unconstrained functions, verify results in constrained code.

#### Challenge 2: **No Dynamic Data Structures**

**Problem:** Can't use dynamic arrays, hashmaps with runtime sizing, or variable-length strings.

**Workaround:**
```noir
// BAD: Won't compile
fn store_deposits(deposits: [Field]) {  // No dynamic size!
    // ...
}

// GOOD: Use compile-time generic + actual length tracking
fn store_deposits<N>(
    deposits: [Field; N],   // Max size at compile time
    actual_length: u32      // Track actual usage
) {
    for i in 0..N {
        if i < actual_length {
            process(deposits[i]);
        }
    }
}
```

**For Liquid Staking:** Pre-allocate max validator count (e.g., 100), track actual count separately.

#### Challenge 3: **Bit Operations Are Expensive**

**Problem:** Bitwise ops (<<, >>, &, |, ^) create many constraints.

```noir
// EXPENSIVE: Bit shifts in circuits
fn calculate_share(amount: Field) -> Field {
    amount >> 4  // Costs ~32 gates per bit!
}

// BETTER: Use division (cheaper in circuits)
fn calculate_share(amount: Field) -> Field {
    amount / 16  // Fewer constraints
}
```

**Solution:** Avoid bit manipulation in constrained functions. Use unconstrained if necessary.

#### Challenge 4: **Field Arithmetic Wraparound**

**Problem:** Noir's `Field` type uses modular arithmetic (wraps at prime ~2^254).

```noir
fn calculate_rewards(stake: Field) -> Field {
    stake * APR_MULTIPLIER  // Could wrap around!
}
```

**Solution:** Use smaller integer types (u64, u128) when possible, or add overflow checks.

```noir
fn calculate_rewards(stake: u128) -> u128 {
    // u128 has explicit overflow checks
    stake * APR_MULTIPLIER
}
```

**Best Practice from Noir Docs:**
> "If proving efficiency is a priority, fields should be used as default. Smaller integer types (e.g., u64) incur extra range constraints."

**Trade-off:** Field = faster proving, less safe. u64/u128 = slower proving, safer.

#### Challenge 5: **Debugging is Hard**

**Solidity:**
```solidity
console.log("Balance:", balance);  // Easy debugging
```

**Noir:**
```noir
// Limited debugging - mostly compile-time errors
fn deposit(amount: Field) {
    // Error: "Constraint failed at line 42"
    // No stack traces, no runtime logs
}
```

**Solution:**
1. Use `nargo test` extensively (unit tests are your friend)
2. Use `nargo info` to check circuit size
3. Break code into small, testable functions
4. Add explicit assertions for debugging

```noir
#[test]
fn test_deposit() {
    let result = calculate_exchange_rate(1000, 100);
    assert(result == 10);  // Will show which constraint failed
}
```

### Correct Architecture for Aztec Liquid Staking

#### **100% Noir Approach** (Only Option on Aztec)

```
┌─────────────────────────────────────────────────────┐
│              ALL CONTRACTS IN NOIR                   │
│                                                       │
│  ✓ StakedAztecToken.nr (token with public balances) │
│  ✓ LiquidStakingCore.nr (main deposit/withdraw)     │
│  ✓ VaultManager.nr (pool aggregation)               │
│  ✓ RewardsManager.nr (fee distribution)             │
│  ✓ WithdrawalQueue.nr (unbonding queue)             │
│  ✓ ValidatorRegistry.nr (track OUR validators)      │
│                                                       │
│  All using #[public] functions for transparent state│
│  Optional #[private] functions for privacy features │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│         OPTIONAL PRIVACY FEATURES (Phase 2)          │
│                                                       │
│  ✓ #[private] deposit_private() in Core contract    │
│  ✓ #[private] withdraw_private() in Core contract   │
│  ✓ Private balance notes (UTXO model)               │
│  ✓ Anonymous governance voting                      │
│                                                       │
│  Privacy via Noir's #[private] functions            │
│  Executed client-side in PXE, ZK proofs submitted   │
└─────────────────────────────────────────────────────┘
```

**Recommendation:** Start with **#[public] Noir functions** (MVP), add #[private] privacy features in Phase 2.

**Rationale:**
1. **Required approach:** Aztec ONLY runs Noir, not Solidity
2. **Simpler MVP:** Public functions are easier to debug and audit
3. **Privacy as differentiator:** Add private deposits/withdrawals later as unique feature
4. **Proven pattern:** Token contract tutorial shows this public → private progression

**Development Path:**
- **Phase 1 (3-4 months):** Public Noir contracts, standard transparent liquid staking
- **Phase 2 (2-3 months):** Add #[private] functions for anonymous staking
- **Phase 3:** Advanced privacy features (hidden balances, anonymous governance)

### Development Tools & Workflow

#### **Aztec Noir Stack** (Required for Aztec Development)

```bash
# Install Aztec tooling (includes Noir compiler)
bash -i <(curl -s install.aztec.network)

# Or install via npm
npm install -g @aztec/cli

# Initialize Aztec project
aztec-nargo new liquid-staking
cd liquid-staking

# Development commands
aztec-nargo check           # Type check Noir code
aztec-nargo compile         # Compile to Aztec contracts
aztec-nargo test            # Run Noir unit tests
aztec-nargo info            # Show circuit size

# Example output
Functions:
  deposit (public): 2,450 gates
  withdraw (public): 1,890 gates
  deposit_private (private): 12,845 gates  # Private functions larger
```

#### **Aztec Sandbox** (Local Development Network)

```bash
# Start local Aztec node
aztec start --sandbox

# In another terminal - deploy contracts
aztec-cli deploy StakedAztecToken

# Interact with contracts
aztec-cli send deposit --args 100000 --contract-address 0x...
```

#### **Testing Workflow:**
```typescript
// Test Noir contracts with TypeScript
import { AztecSDK, Contract } from '@aztec/aztec.js';
import { liquidStakingArtifact } from './artifacts';

describe('Liquid Staking on Aztec', () => {
  let sdk: AztecSDK;
  let contract: Contract;

  beforeAll(async () => {
    // Connect to Aztec sandbox
    sdk = await AztecSDK.new({ rpcUrl: 'http://localhost:8080' });

    // Deploy Noir contract
    contract = await Contract.deploy(sdk, liquidStakingArtifact);
  });

  it('should deposit and mint stAZTEC', async () => {
    // Call #[public] function
    const tx = await contract.methods.deposit(50000).send().wait();

    // Verify stAZTEC balance
    const balance = await contract.methods.balanceOf(userAddress).call();
    expect(balance).toBe(50000n);
  });

  it('should handle private deposits', async () => {
    // Call #[private] function (executes in PXE)
    const tx = await contract.methods.deposit_private(50000).send().wait();

    // Private balance only visible to owner
    const privateBalance = await contract.methods
      .get_private_balance(userAddress)
      .call();
    expect(privateBalance).toBe(50000n);
  });
});
```

### Learning Resources

**Noir:**
- [Aztec Documentation](https://docs.aztec.network/) - Official docs
- [ZKCamp Aztec Course](https://github.com/ZKCamp/aztec-noir-course) - Free course
- [Noir Language Docs](https://noir-lang.org/docs/) - Language reference
- [OpenZeppelin Noir Guide](https://www.openzeppelin.com/news/developer-guide-to-building-safe-noir-circuits) - Security best practices

**Aztec Development:**
- [Smart Contracts Guide](https://docs.aztec.network/developers/docs/guides/smart_contracts)
- [Token Contract Tutorial](https://docs.aztec.network/tutorials/contract_tutorials/token_contract)
- [Testing Contracts](https://docs.aztec.network/guides/developer_guides/smart_contracts/testing_contracts/testing)

### Key Takeaways

✅ **ALL contracts must be written in Noir** (Aztec requirement):
- StakedAztecToken.nr - token with public balances
- LiquidStakingCore.nr - deposits, withdrawals
- VaultManager.nr - pool aggregation, staking batches
- RewardsManager.nr - rewards collection, fee distribution
- WithdrawalQueue.nr - unbonding queue management
- ValidatorRegistry.nr - track OUR validator nodes

✅ **Use #[public] functions for:**
- All transparent state management (MVP approach)
- Token balances and transfers
- Vault pooling and staking logic
- Rewards distribution
- Withdrawal queue

✅ **Use #[private] functions for (Phase 2):**
- Optional anonymous deposits/withdrawals
- Hidden balance tracking (UTXO notes)
- Private governance voting
- Differentiating privacy features

⚠️ **Noir Gotchas:**
1. Fixed-size arrays only (no dynamic arrays)
2. Loops unroll at compile time → huge circuits (use unconstrained)
3. Field arithmetic wraps around prime (use u64/u128 for safety)
4. Bit operations are expensive (avoid in circuits)
5. Debugging is limited (test extensively with `nargo test`)
6. Unconstrained functions are NOT proven (must add constraints elsewhere)

🎯 **Recommended Strategy:**
1. **Phase 1:** #[public] Noir contracts only (MVP - 3-4 months)
2. **Phase 2:** Add #[private] privacy features (2-3 months)
3. **Phase 3:** Optimize circuit sizes and advanced privacy UX

---

## Noir Contract Implementation Guide (Breadcrumbs for Future Developers)

### Overview for Future Developers

This section provides concrete guidance for implementing the liquid staking protocol in Noir. **Use this as a reference when actually building the contracts.**

**Key Contracts to Build:**
1. StakedAztecToken.nr - Token representing staked AZTEC
2. LiquidStakingCore.nr - Main deposit/withdrawal entry point
3. VaultManager.nr - Pool management and validator tracking
4. RewardsManager.nr - Rewards collection and distribution
5. WithdrawalQueue.nr - Unbonding queue management

**Essential Documentation Links:**
- **Start Here:** [Aztec Token Contract Tutorial](https://docs.aztec.network/developers/docs/tutorials/contract_tutorials/token_contract) - Follow this pattern for stAZTEC token
- **Storage Patterns:** [Aztec Storage Documentation](https://docs.aztec.network/developers/docs/concepts/storage) - How to structure contract state
- **Public/Private Functions:** [Understanding #[public] and #[private]](https://hackmd.io/@erayack/SJfsQKM4n) - Critical for architecture
- **Noir Language:** [Noir Documentation](https://noir-lang.org/docs/) - Language reference
- **Testing:** [Aztec Testing Guide](https://docs.aztec.network/developers/docs/guides/smart_contracts/testing) - How to test contracts

### Contract Structure Example: StakedAztecToken.nr

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
        // Token balances (public for DeFi composability)
        balances: Map<AztecAddress, PublicMutable<u128, Context>, Context>,

        // Exchange rate (basis points: 10000 = 1.0, 10500 = 1.05)
        exchange_rate: PublicMutable<u64, Context>,

        // Total supply
        total_supply: PublicMutable<u128, Context>,
    }

    #[public]
    #[initializer]
    fn constructor() {
        storage.exchange_rate.write(10000); // Start at 1.0
        storage.total_supply.write(0);
    }

    #[public]
    fn mint(to: AztecAddress, amount: u128) {
        // Access control: only LiquidStakingCore can mint
        let sender = context.msg_sender();
        assert(sender == LIQUID_STAKING_CORE, "Unauthorized");

        let balance = storage.balances.at(to).read();
        storage.balances.at(to).write(balance + amount);

        let supply = storage.total_supply.read();
        storage.total_supply.write(supply + amount);
    }

    #[public]
    fn transfer(to: AztecAddress, amount: u128) {
        let from = context.msg_sender();

        let from_balance = storage.balances.at(from).read();
        assert(from_balance >= amount, "Insufficient balance");

        storage.balances.at(from).write(from_balance - amount);

        let to_balance = storage.balances.at(to).read();
        storage.balances.at(to).write(to_balance + amount);
    }
}
```

**Pattern:** Start with this token contract, following the [Aztec token tutorial](https://docs.aztec.network/developers/docs/tutorials/contract_tutorials/token_contract).

### Key Implementation Notes

**1. Storage Types (from [Aztec docs](https://docs.aztec.network/developers/docs/concepts/storage)):**
```noir
// Public state - visible to all
PublicMutable<T, Context> - Single public value
Map<K, PublicMutable<V, Context>, Context> - Public mapping

// Private state - only visible to note owner (Phase 2)
PrivateSet<Note, Context> - Set of private notes
PrivateMutable<Note, Context> - Single private note
```

**2. Function Types:**
```noir
#[public] - Executes on sequencer, transparent state
#[private] - Executes on user PXE, generates ZK proof
unconstrained - Runs off-circuit, NOT proven (use carefully!)
```

**3. Fixed-Size Arrays (Noir Limitation):**
```noir
// Validators must be fixed size
our_validators: [AztecAddress; 100]  // Max 100 validators

// Track actual count separately
validator_count: PublicMutable<u32, Context>
```

**4. Access Control Pattern:**
```noir
fn only_admin() {
    let caller = context.msg_sender();
    assert(caller == ADMIN_ADDRESS, "Only admin");
}

fn only_keeper() {
    let caller = context.msg_sender();
    assert(caller == KEEPER_ADDRESS, "Only keeper");
}
```

### Development Workflow

```bash
# 1. Install Aztec tooling
bash -i <(curl -s install.aztec.network)

# 2. Create project
aztec-nargo new aztec-liquid-staking
cd aztec-liquid-staking

# 3. Write contracts in src/
# StakedAztecToken.nr
# LiquidStakingCore.nr
# etc.

# 4. Compile
aztec-nargo compile

# 5. Test
aztec-nargo test

# 6. Deploy to sandbox
aztec start --sandbox  # In separate terminal
aztec-cli deploy StakedAztecToken
```

### Critical Gotchas for Noir

⚠️ **Arrays must be fixed-size**
```noir
// ❌ Won't compile
validators: [AztecAddress]

// ✅ Correct
validators: [AztecAddress; 100]
actual_count: u32
```

⚠️ **Loops unroll at compile time**
```noir
// ❌ Huge circuit (10,000 gates!)
for i in 0..1000 {
    process(validators[i]);
}

// ✅ Use unconstrained for heavy iteration
unconstrained fn find_best() -> u32 { ... }
```

⚠️ **Field arithmetic wraps around**
```noir
// ❌ Risky: Field wraps at prime modulus
amount: Field = stake * multiplier;

// ✅ Safer: u128 has overflow checks
amount: u128 = stake * multiplier;
```

⚠️ **Access control is critical**
```noir
// ❌ Anyone can mint!
#[public]
fn mint(to: AztecAddress, amount: u128) {
    storage.balances.at(to).write(amount);
}

// ✅ Only authorized contracts
#[public]
fn mint(to: AztecAddress, amount: u128) {
    assert(context.msg_sender() == CORE_CONTRACT, "Unauthorized");
    storage.balances.at(to).write(amount);
}
```

### Testing Strategy

```typescript
// TypeScript tests using Aztec.js
import { AztecSDK, Contract } from '@aztec/aztec.js';

describe('Liquid Staking', () => {
  it('should deposit and mint stAZTEC', async () => {
    const tx = await liquidStaking.methods.deposit(50000).send().wait();
    const balance = await stAztec.methods.balanceOf(user).call();
    expect(balance).toBe(50000n);
  });

  it('should update exchange rate after rewards', async () => {
    await rewardsManager.methods.claim_rewards().send().wait();
    const rate = await stAztec.methods.get_exchange_rate().call();
    expect(rate).toBeGreaterThan(10000n); // Should appreciate
  });
});
```

### Resources for Implementation

**Must-Read Documentation:**
1. [Developing Smart Contracts](https://docs.aztec.network/developers/docs/guides/smart_contracts) - Overview of Aztec contract development
2. [Token Contract Tutorial](https://docs.aztec.network/developers/docs/tutorials/contract_tutorials/token_contract) - Complete working example
3. [Understanding Private/Public](https://hackmd.io/@erayack/SJfsQKM4n) - Technical deep dive
4. [Noir Language Reference](https://noir-lang.org/docs/) - Language documentation

**Example Contracts:**
- [Aztec Token Contract](https://github.com/AztecProtocol/aztec-packages/tree/master/noir-projects/noir-contracts/contracts/token_contract) - Reference implementation
- [Aztec Noir Contracts](https://github.com/AztecProtocol/aztec-packages/tree/master/noir-projects/noir-contracts) - More examples

**Getting Help:**
- [Aztec Discord](https://discord.gg/aztec) - Active developer community
- [Aztec GitHub Discussions](https://github.com/AztecProtocol/aztec-packages/discussions) - Technical Q&A

### Implementation Checklist

When building each contract, verify:

- [ ] Storage layout uses correct types (PublicMutable, Map)
- [ ] Functions marked #[public] or #[private] correctly
- [ ] Access control on sensitive functions (mint, burn, admin)
- [ ] Arrays are fixed-size with count tracking
- [ ] Integer types prevent overflow (u128 vs Field)
- [ ] Events emitted for bot monitoring
- [ ] Unit tests cover all functions
- [ ] Integration tests cover cross-contract calls

---

## Capital Requirements & Business Model (Corrected Understanding)

### ⚠️ CRITICAL: Zero AZTEC Capital Required

**Common Misconception:** We need $180k-$600k in AZTEC to run validators.
**Reality:** We need **$0 in AZTEC**. Users provide ALL the capital.

### How the Economics Actually Work

#### **Traditional Validator Economics (Wrong for Us):**
```
Solo Validator:
├─ Buy 200,000 AZTEC (~$6,000)
├─ Run validator node
├─ Earn 100% of staking rewards
└─ Capital Requirement: $6,000/validator

50 Validators:
└─ Capital Requirement: $300,000 in AZTEC ❌
```

#### **Liquid Staking Protocol Economics (Our Model):**
```
Our Protocol:
├─ Users deposit THEIR AZTEC to our contracts
├─ Smart contracts pool deposits to 200k batches
├─ Smart contracts stake to OUR validator nodes
├─ OUR validators earn rewards
├─ We take 10% protocol fee, users get 90%
└─ Capital Requirement: $0 in AZTEC ✅

We only pay for:
├─ Server infrastructure: ~$400/month per validator node
├─ Smart contract development & audits: $200k one-time
├─ Bot infrastructure: ~$300/month
└─ Team salaries: $50k/month (3-5 people)
```

### Why This Model Works

**Users delegate their AZTEC to us via smart contracts:**
1. User deposits 10,000 AZTEC into LiquidStakingCore.nr
2. Contract mints stAZTEC tokens to user (1:1 initially)
3. Contract pools deposits from many users
4. When pool reaches 200,000 AZTEC → VaultManager stakes to OUR validator
5. OUR validator earns rewards
6. RewardsManager collects rewards, takes 10% fee, distributes 90% to stakers
7. stAZTEC exchange rate increases (users' tokens become more valuable)

**We NEVER own the AZTEC:** Smart contracts custody it, stake it, manage it.

### Capital Requirements Breakdown

**What We Actually Need:**

```
One-Time Costs:
├─ Smart contract development: $100k (4 engineers × 3 months)
├─ Security audits: $100k (2 audits)
├─ Legal/incorporation: $10k
└─ Total: $210k

Monthly Operating Costs:
├─ Validator infrastructure: $400/node × N nodes
│   (Start with 1-3 nodes, scale as TVL grows)
├─ Bot infrastructure: $300/month (Kubernetes, Redis, monitoring)
├─ Team salaries: $50k/month (can start with 2-3 people)
├─ Insurance/reserves: $5k/month
└─ Total: ~$56k/month (assuming 3 validators to start)

AZTEC Capital:
└─ $0 - Users provide ALL staking capital ✅
```

### Revenue Model

**Revenue = TVL × Staking APR × Protocol Fee**

```
Example with $10M TVL:
├─ Total Value Locked: $10,000,000 in AZTEC
├─ Staking APR: 8% (estimated)
├─ Annual rewards: $800,000
├─ Protocol fee: 10%
├─ Our annual revenue: $80,000
└─ Monthly revenue: $6,667

Example with $50M TVL:
├─ Total Value Locked: $50,000,000
├─ Annual rewards: $4,000,000 (at 8% APR)
├─ Our annual revenue: $400,000
└─ Monthly revenue: $33,333 ✅ Profitable!

Example with $200M TVL:
├─ Annual rewards: $16,000,000
├─ Our annual revenue: $1,600,000
└─ Monthly revenue: $133,333 💰
```

### Break-Even Analysis

```
Monthly costs: ~$56k
Required monthly revenue: $56k
Required TVL at 8% APR, 10% fee: $84M

More realistic break-even scenarios:
├─ At $50M TVL: $33k/month revenue (need lower costs)
├─ At $100M TVL: $66k/month revenue (profitable!) ✅
└─ At $200M TVL: $133k/month revenue (2.4x costs)

Timeline to break-even: 6-12 months post-launch
(Assuming gradual TVL growth from $10M → $100M)
```

### Secondary Revenue Stream (Future)

**Offering OUR validators to other protocols:**
```
Other liquid staking protocols can delegate to OUR validators
├─ We charge them 5-8% commission on rewards
├─ They don't need to run infrastructure
├─ We earn fees from both retail users AND B2B protocols
└─ Potential additional revenue: $50k-$200k/year
```

### Why This Is a Great Business

**Low Capital Intensity:**
- No need to raise millions for AZTEC
- Users provide all staking capital
- We just build software + run servers

**High Margins:**
- Software scales infinitely
- Server costs grow linearly with TVL
- Revenue grows linearly with TVL
- Profit margin improves as we scale

**Network Effects:**
- More TVL → more validators → better decentralization
- Better decentralization → more trust → more TVL
- stAZTEC becomes DeFi primitive → more utility → more TVL

**Risk Profile:**
```
Low financial risk:
├─ No AZTEC capital at risk
├─ Smart contract risk (mitigate with audits)
├─ Validator slashing risk (mitigate with diversification)
└─ Relatively small upfront investment ($210k)

High upside:
├─ If Aztec succeeds → massive TAM ($500M-$2B)
├─ 40% market share of 50% staking rate = $100M-$400M TVL
├─ At $200M TVL = $1.6M annual revenue
└─ Software business with 70%+ margins
```

---

## Bot Infrastructure & Automation

### Overview

Liquid staking protocols require 24/7 automation for:
1. **Staking:** Batch deposits into 200k AZTEC units
2. **Rewards:** Claim and distribute yields
3. **Withdrawals:** Process unbonding queue
4. **Rebalancing:** Migrate stake from poor performers
5. **Oracle Updates:** Track validator performance
6. **Monitoring:** Alert on anomalies/slashing

All bots will be written in **TypeScript/Node.js** for:
- ✅ Strong typing (TypeScript)
- ✅ Mature Web3 libraries (viem, ethers.js)
- ✅ Easy async/await (promises)
- ✅ Rich ecosystem (npm packages)
- ✅ Team familiarity (most devs know JS/TS)

### Required Bots (3 Core + 1 Optional Monitoring)

#### **Bot #1: Staking Keeper**

**Purpose:** Monitor deposit pool and trigger staking when ≥200k AZTEC accumulated.

**Responsibilities:**
- Watch `DepositProcessed` events from `LiquidStakingCore`
- Query `VaultManager.getPoolBalance()` every block
- When balance ≥ 200k AZTEC:
  - Call `StakeRouter.selectValidator()` (get best validator)
  - Call `VaultManager.stakeToValidator(validatorAddr, 200000)`
  - Verify transaction success
  - Log staking event

**Trigger:** Event-based + polling (every 12 seconds / 1 block)

**Technology Stack:**
```typescript
// staking-keeper/src/index.ts
import { createPublicClient, createWalletClient, parseAbi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { aztec } from 'viem/chains';  // Custom Aztec chain config

const client = createPublicClient({
  chain: aztec,
  transport: http(process.env.AZTEC_RPC_URL)
});

const wallet = createWalletClient({
  account: privateKeyToAccount(process.env.KEEPER_PRIVATE_KEY),
  chain: aztec,
  transport: http(process.env.AZTEC_RPC_URL)
});

// Watch for deposits
client.watchContractEvent({
  address: VAULT_MANAGER_ADDRESS,
  abi: parseAbi(['event DepositProcessed(address user, uint256 amount)']),
  eventName: 'DepositProcessed',
  onLogs: async (logs) => {
    await checkAndStake();
  }
});

async function checkAndStake() {
  const poolBalance = await client.readContract({
    address: VAULT_MANAGER_ADDRESS,
    abi: vaultManagerAbi,
    functionName: 'getPoolBalance'
  });

  if (poolBalance >= 200_000n * 10n**18n) {  // 200k AZTEC
    const validator = await selectBestValidator();

    const tx = await wallet.writeContract({
      address: VAULT_MANAGER_ADDRESS,
      abi: vaultManagerAbi,
      functionName: 'stakeToValidator',
      args: [validator, 200_000n * 10n**18n]
    });

    console.log(`Staked 200k AZTEC to ${validator}, tx: ${tx}`);
  }
}
```

**Dependencies:**
```json
{
  "dependencies": {
    "viem": "^2.7.0",
    "dotenv": "^16.3.0",
    "pino": "^8.16.0",  // Logging
    "@sentry/node": "^7.91.0"  // Error tracking
  }
}
```

**Deployment:**
- Dockerized Node.js app
- Deployed on AWS ECS / GCP Cloud Run
- Auto-restart on failure
- Secret management: AWS Secrets Manager

---

#### **Bot #2: Rewards Keeper**

**Purpose:** Claim staking rewards from validators and update stAZTEC exchange rate.

**Responsibilities:**
- Every epoch (~6.4 min on Ethereum, TBD for Aztec):
  - Call `RewardsDistributor.claimAllRewards()`
  - Calculate new exchange rate
  - Update `stAZTEC.updateExchangeRate(newRate)`
  - Distribute protocol fees to treasury
  - Add to insurance fund

**Trigger:** Time-based (every epoch) + event-based (reward distribution events)

**Technology Stack:**
```typescript
// rewards-keeper/src/index.ts
import { BullMQ } from 'bullmq';  // Queue for scheduling
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);
const queue = new Queue('rewards', { connection: redis });

// Schedule rewards claim every epoch
await queue.add(
  'claim-rewards',
  {},
  { repeat: { every: 384000 } }  // 6.4 min in ms
);

// Worker to process jobs
const worker = new Worker('rewards', async (job) => {
  console.log('Claiming rewards...');

  // 1. Claim from all validators
  const tx1 = await wallet.writeContract({
    address: REWARDS_DISTRIBUTOR_ADDRESS,
    abi: rewardsDistributorAbi,
    functionName: 'claimAllRewards'
  });
  await waitForTransaction(tx1);

  // 2. Get new total
  const totalAztec = await getTotalControlledAztec();
  const totalStAztec = await getStAztecSupply();

  // 3. Update exchange rate
  const newRate = totalAztec / totalStAztec;
  const tx2 = await wallet.writeContract({
    address: STAZTEC_ADDRESS,
    abi: stAztecAbi,
    functionName: 'updateExchangeRate',
    args: [newRate]
  });

  console.log(`Exchange rate updated: ${newRate}`);
}, { connection: redis });
```

**Dependencies:**
```json
{
  "dependencies": {
    "bullmq": "^5.1.0",  // Job queue
    "ioredis": "^5.3.2",  // Redis client
    "viem": "^2.7.0"
  }
}
```

---

#### **Bot #3: Withdrawal Keeper**

**Purpose:** Process withdrawal queue and fulfill unstaking requests.

**Responsibilities:**
- Monitor `WithdrawalQueue.getQueueLength()`
- When queue has requests:
  - Check liquidity buffer (10% of TVL)
  - If buffer sufficient: instant withdrawal
  - If buffer insufficient: unstake from validators
  - Process withdrawals in FIFO order
  - Wait for unbonding period (~7 days estimated)
  - Transfer AZTEC to users

**Trigger:** Event-based (`WithdrawalRequested`) + polling

**Technology Stack:**
```typescript
// withdrawal-keeper/src/index.ts

async function processWithdrawals() {
  const queueLength = await client.readContract({
    address: WITHDRAWAL_QUEUE_ADDRESS,
    abi: withdrawalQueueAbi,
    functionName: 'getQueueLength'
  });

  if (queueLength === 0n) return;

  const buffer = await client.readContract({
    address: VAULT_MANAGER_ADDRESS,
    abi: vaultManagerAbi,
    functionName: 'getLiquidityBuffer'
  });

  // Process up to buffer amount instantly
  const processable = await client.readContract({
    address: WITHDRAWAL_QUEUE_ADDRESS,
    abi: withdrawalQueueAbi,
    functionName: 'getProcessableAmount',
    args: [buffer]
  });

  if (processable > 0n) {
    const tx = await wallet.writeContract({
      address: WITHDRAWAL_QUEUE_ADDRESS,
      abi: withdrawalQueueAbi,
      functionName: 'processWithdrawals',
      args: [processable]
    });

    console.log(`Processed ${processable} AZTEC in withdrawals`);
  }

  // If buffer insufficient, trigger validator unstaking
  if (queueLength > processable) {
    await triggerValidatorUnstaking();
  }
}

// Run every 5 minutes
setInterval(processWithdrawals, 5 * 60 * 1000);
```

---

#### **Bot #4: Monitoring & Alerts (Optional but Recommended)**

**Purpose:** Health checks, anomaly detection, and alerts.

**Responsibilities:**
- Monitor all keeper bots (are they running?)
- Track gas prices (pause if too high)
- Detect anomalies:
  - Sudden TVL drop >20%
  - Exchange rate anomalies
  - Slashing events
- Send alerts via PagerDuty / Telegram

**Technology Stack:**
```typescript
// monitoring-bot/src/index.ts
import { Telegraf } from 'telegraf';  // Telegram bot
import Prometheus from 'prom-client';  // Metrics

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const ALERT_CHAT_ID = process.env.ALERT_CHAT_ID;

// Prometheus metrics
const tvlGauge = new Prometheus.Gauge({
  name: 'aztec_liquid_staking_tvl',
  help: 'Total value locked in AZTEC'
});

const exchangeRateGauge = new Prometheus.Gauge({
  name: 'staztec_exchange_rate',
  help: 'stAZTEC to AZTEC exchange rate'
});

async function monitorHealth() {
  // Check TVL
  const tvl = await getTotalValueLocked();
  tvlGauge.set(Number(tvl) / 1e18);

  // Check for anomalies
  const tvlChange = (tvl - previousTVL) / previousTVL;
  if (Math.abs(tvlChange) > 0.2) {  // 20% change
    await bot.telegram.sendMessage(
      ALERT_CHAT_ID,
      `🚨 ALERT: TVL changed by ${(tvlChange * 100).toFixed(2)}%`
    );
  }

  // Check slashing
  const slashingEvents = await checkForSlashing();
  if (slashingEvents.length > 0) {
    await bot.telegram.sendMessage(
      ALERT_CHAT_ID,
      `⚠️ SLASHING DETECTED: ${slashingEvents.length} validator(s) slashed`
    );
  }

  // Check gas prices
  const gasPrice = await client.getGasPrice();
  if (gasPrice > MAX_GAS_PRICE) {
    await bot.telegram.sendMessage(
      ALERT_CHAT_ID,
      `⛽ High gas: ${gasPrice / 1e9} gwei - pausing keepers`
    );
    await pauseAllKeepers();
  }
}

// Run every minute
setInterval(monitorHealth, 60 * 1000);
```

**Dependencies:**
```json
{
  "dependencies": {
    "telegraf": "^4.15.0",  // Telegram bot
    "prom-client": "^15.1.0",  // Prometheus metrics
    "@sentry/node": "^7.91.0",  // Error tracking
    "viem": "^2.7.0"
  }
}
```

---

### Complete Bot Infrastructure Diagram

```
┌───────────────────────────────────────────────────────────────────────┐
│                     BOT ORCHESTRATION LAYER                            │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │               Kubernetes Cluster (3 nodes)                       │  │
│  │                                                                   │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │  │
│  │  │ Staking Bot  │  │ Rewards Bot  │  │Withdrawal Bot│           │  │
│  │  │  (Pod 1)     │  │  (Pod 2)     │  │  (Pod 3)     │           │  │
│  │  │              │  │              │  │              │           │  │
│  │  │ Replicas: 2  │  │ Replicas: 2  │  │ Replicas: 2  │           │  │
│  │  │ (HA)         │  │ (HA)         │  │ (HA)         │           │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘           │  │
│  │         │                 │                  │                   │  │
│  │         └─────────────────┴──────────────────┘                   │  │
│  │                           │                                       │  │
│  │                           ▼                                       │  │
│  │  ┌────────────────────────────────────────────────────────────┐  │  │
│  │  │              Redis (BullMQ Queue)                           │  │  │
│  │  │  - Job scheduling                                           │  │  │
│  │  │  - Rate limiting                                            │  │  │
│  │  │  - Distributed locks (prevent duplicate execution)         │  │  │
│  │  └────────────────────────────────────────────────────────────┘  │  │
│  │                                                                   │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │  │
│  │  │Rebalance Bot │  │  Oracle Bot  │  │ Monitor Bot  │           │  │
│  │  │  (Pod 4)     │  │  (Pod 5)     │  │  (Pod 6)     │           │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘           │  │
│  │         │                 │                  │                   │  │
│  └─────────┼─────────────────┼──────────────────┼───────────────────┘  │
│            │                 │                  │                       │
└────────────┼─────────────────┼──────────────────┼───────────────────────┘
             │                 │                  │
             ▼                 ▼                  ▼
┌───────────────────────────────────────────────────────────────────────┐
│                   OBSERVABILITY STACK                                  │
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐    │
│  │   Prometheus     │  │     Grafana      │  │    Sentry.io     │    │
│  │   (Metrics)      │  │  (Dashboards)    │  │(Error Tracking)  │    │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘    │
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐                           │
│  │   PagerDuty      │  │  Telegram Bot    │                           │
│  │ (On-call alerts) │  │  (Team alerts)   │                           │
│  └──────────────────┘  └──────────────────┘                           │
└───────────────────────────────────────────────────────────────────────┘
```

### Deployment Specification

**Infrastructure:**
- **Cloud Provider:** AWS or GCP
- **Orchestration:** Kubernetes (EKS/GKE)
- **Nodes:** 3x t3.medium (2 vCPU, 4GB RAM each)
- **Redis:** ElastiCache / Cloud Memorystore (for BullMQ)
- **Secrets:** AWS Secrets Manager / GCP Secret Manager

**Docker Container Example:**
```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY dist/ ./dist/

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node dist/healthcheck.js || exit 1

# Run bot
CMD ["node", "dist/index.js"]
```

**Kubernetes Deployment:**
```yaml
# k8s/staking-keeper.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: staking-keeper
spec:
  replicas: 2  # High availability
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
        - name: KEEPER_PRIVATE_KEY
          valueFrom:
            secretKeyRef:
              name: aztec-secrets
              key: keeper-pk
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
```

### Cost Estimate

**⚠️ Disclaimer:** These estimates are speculative based on Ethereum L2 benchmarks. Actual Aztec costs may vary significantly as the network is new. Update these estimates after testnet deployment and real-world testing.

**Monthly Infrastructure Costs:**
```
Kubernetes cluster (3 nodes): $150/month
Redis (managed): $50/month
Monitoring (Grafana Cloud): $49/month
Alerts (PagerDuty): $19/month
Error tracking (Sentry): $26/month
Domain/SSL: $5/month
-----------------------------------------
Total Infrastructure: ~$299/month

Gas Costs (estimated - based on Ethereum L2 analogues):
Staking tx: 1-2/day @ $0.50 = $30/month
Rewards tx: ~250/month @ $0.20 = $50/month
Withdrawal tx: ~100/month @ $0.30 = $30/month
Monitoring queries: Minimal (read-only)
-----------------------------------------
Total Gas: ~$110/month (conservative estimate)

TOTAL MONTHLY COST: ~$409/month
```

**Note:** Removed Oracle and Rebalancing bots from cost estimates (we consume Aztec's metrics directly and run our own validators).

**Break-even Analysis:**
```
At $50M TVL, 8% APR, 10% protocol fee:
Monthly revenue: $50M * 0.08 * 0.10 / 12 = $33,333

Infrastructure cost: ~$409
Profit margin: 98.8% 🎉

Break-even TVL: ~$6.1M (very achievable)
```

---

## Technical Requirements Analysis

### 1. Core Smart Contract Architecture

#### 1.1 Liquid Staking Contract (LSC)
**Purpose:** Main entry point for users to deposit and withdraw AZTEC tokens

**Key Functions:**
```typescript
// Deposit AZTEC and receive stAZTEC
function deposit(uint256 amount) returns (uint256 stAztecAmount)

// Request withdrawal (enters queue)
function requestWithdrawal(uint256 stAztecAmount) returns (uint256 requestId)

// Claim withdrawn AZTEC after unbonding period
function claimWithdrawal(uint256 requestId) returns (uint256 aztecAmount)

// Get current exchange rate
function getExchangeRate() returns (uint256 rate)
```

**Critical Features:**
- Accept deposits of any size (no 200k minimum for users)
- Pool deposits to create 200k AZTEC validator units
- Handle fractional ownership via stAZTEC tokens
- Manage withdrawal queue during unbonding periods
- Emergency pause mechanism

#### 1.2 stAZTEC Token Contract
**Token Model Options:**

**Option A: Rebasing Token (like Lido's stETH)**
- Balance increases automatically as rewards accrue
- Pros: Intuitive for users (1 AZTEC → 1 stAZTEC at start)
- Cons: Complex DeFi integration, tax implications

**Option B: Reward-Bearing Token (like Rocket Pool's rETH)**
- Fixed supply, value appreciates vs AZTEC
- Pros: Simpler DeFi integration, cleaner tax treatment
- Cons: Exchange rate calculation needed

**Recommendation:** **Option B (Reward-Bearing)** for better DeFi composability

**Token Features:**
- ERC-20 compatible
- Transfer restrictions during unstaking period
- Oracle for exchange rate
- Permit (EIP-2612) for gasless approvals

#### 1.3 Vault Manager
**Purpose:** Pool management and validator coordination

**Responsibilities:**
- Aggregate user deposits into 200k AZTEC batches
- Distribute batches across validators
- Track which validators hold protocol stake
- Rebalance stake across validator set
- Handle validator exits and migrations

**Key Data Structures:**
```typescript
struct ValidatorBatch {
    address validatorAddress;
    uint256 stakedAmount; // Always 200k or 0
    uint256 activatedTimestamp;
    uint256 accumulatedRewards;
    bool isActive;
}

struct UserPosition {
    uint256 stAztecBalance;
    uint256[] withdrawalRequests;
    uint256 depositedAztec;
    uint256 claimedRewards;
}
```

#### 1.4 Stake Router
**Purpose:** Intelligent validator selection and distribution

**Selection Criteria:**
- Performance metrics (block proposal success rate)
- Geographic distribution
- Slashing history
- Commission rates (if validators offer different rates)
- Uptime statistics

**Algorithm:**
```typescript
function selectValidator() returns (address) {
    // 1. Filter out slashed validators
    // 2. Weight by performance score
    // 3. Apply geographic diversity bonus
    // 4. Random selection from top performers
    // 5. Return validator address
}
```

#### 1.5 Rewards Distributor
**Purpose:** Collect and distribute staking rewards

**Mechanism:**
- Monitor block rewards from each validator
- Calculate protocol fee (5-10% suggested)
- Update stAZTEC exchange rate
- Compound rewards automatically
- Handle edge cases (slashing, validator downtime)

**Fee Structure:**
```
Total Rewards: 100%
├─ Protocol Fee: 10% (5% operations, 5% insurance fund)
└─ Stakers: 90% (distributed via stAZTEC appreciation)
```

#### 1.6 Withdrawal Queue
**Purpose:** Manage unbonding period and withdrawals

**Process:**
1. User requests withdrawal by burning stAZTEC
2. Request enters queue with timestamp
3. Protocol unstakes from validators (respecting unbonding period)
4. User claims AZTEC after unbonding complete

**Queue Management:**
- FIFO (First In, First Out) processing
- Batch processing for gas efficiency
- Maintain liquidity buffer (5-10% of TVL unstaked)
- Express withdrawal option (premium fee, instant liquidity from buffer)

---

### 2. Aztec-Specific Technical Considerations

#### 2.1 Privacy Integration
**Challenge:** Aztec is privacy-focused, but liquid staking requires public state

**Solution Architecture:**
- **Public contracts** for pooling and validator management
- **Private transactions** for user deposits/withdrawals (optional)
- **Hybrid approach:** Users can choose public or private participation

**Privacy Features to Leverage:**
```noir
// Noir contract for private staking deposits
contract PrivateStaking {
    // Private state for user balances
    mapping(AztecAddress => private PrivateBalance) private_balances;

    // Public state for total staked
    public total_staked: Field;

    // Allow users to stake privately
    #[private]
    fn deposit_private(amount: Field) -> Field {
        // Generate ZK proof of deposit
        // Update private balance
        // Increment public total
    }
}
```

#### 2.2 Sequencer Architecture Integration
**Aztec's Unique Model:**
- Sequencers are randomly selected from validator set
- Block proposers receive rewards
- Provers share in rewards (14-level proof tree)
- Governance participation tied to staking

**Liquid Staking Implications:**
- Protocol must run sequencers OR delegate to existing operators
- Need to capture both proposer and prover rewards
- Governance voting rights: delegate to users or protocol-managed?

**Governance Strategy:**
```
Option 1: Snapshot-style delegation
- stAZTEC holders vote on how protocol votes
- Maintains decentralization

Option 2: Protocol governance committee
- Elected committee manages protocol's voting power
- More efficient but more centralized

Recommendation: Option 1 (Snapshot delegation)
```

#### 2.3 Slashing and Risk Management
**Aztec Slashing Redesign (2025):**
- Penalties for longer outages (>20 minutes)
- Better consensus guarantees
- Less punitive for home stakers

**Protocol Risk Mitigation:**
1. **Diversification:** Stake across 50+ validators minimum
2. **Insurance Fund:** 5% of fees go to slashing insurance
3. **Performance Monitoring:** Remove underperforming validators
4. **Slashing Coverage:** Protocol absorbs first X% of slashing losses

**Insurance Fund Math:**
```
Target Insurance: 5% of TVL
At 1M AZTEC TVL: 50k AZTEC insurance fund
Expected slashing rate: <0.1% annually
Coverage ratio: 50x expected losses
```

---

### 3. Oracle and Off-Chain Infrastructure

#### 3.1 Consuming Aztec Validator Metrics
**Purpose:** Monitor OUR validator performance using Aztec's built-in metrics

**⚠️ Important:** We DON'T build our own oracle. Aztec Network provides validator metrics via its RPC API. We simply READ these metrics to monitor OUR validators.

**Available Metrics from Aztec RPC:**
- Block proposal success rate
- Attestation performance
- Uptime metrics
- Slashing events
- Rewards earned
- Node software version

**How We Consume Metrics:**
```typescript
// Query Aztec node RPC for OUR validator metrics
async function getOurValidatorMetrics() {
  const response = await axios.post(AZTEC_NODE_RPC, {
    jsonrpc: '2.0',
    method: 'aztec_getValidatorMetrics',
    params: [OUR_VALIDATOR_ADDRESSES],
    id: 1
  });

  const metrics = response.data.result;

  // Use metrics for monitoring/alerting
  for (const validator of metrics) {
    if (validator.uptime < 95) {
      alertTeam(`Validator ${validator.address} uptime low: ${validator.uptime}%`);
    }
    if (validator.slashingEvents.length > 0) {
      alertTeam(`CRITICAL: Validator ${validator.address} was slashed!`);
    }
  }

  return metrics;
}
```

**Monitoring Frequency:**
- Critical metrics (slashing): Real-time monitoring via Monitoring Bot
- Performance metrics: Every epoch (for alerts)
- Rewards: Every epoch (for exchange rate updates)

#### 3.2 Exchange Rate Oracle
**Purpose:** Calculate stAZTEC:AZTEC exchange rate

**Formula:**
```
exchange_rate = (total_aztec_controlled) / (total_stAztec_supply)

Where:
total_aztec_controlled = staked_aztec + pending_rewards + liquidity_buffer - slashing_losses
```

**Update Triggers:**
- New rewards received
- Deposits/withdrawals processed
- Slashing event
- Minimum: Once per epoch

#### 3.3 Keeper Bots
**Required Automation:** (See detailed implementation in Bot Infrastructure section)

1. **Staking Keeper**
   - Monitors deposit pool
   - Triggers batch staking when 200k AZTEC accumulated
   - Stakes to OUR validator nodes (round-robin or least-loaded)

2. **Rewards Keeper**
   - Claims rewards from OUR validators
   - Updates stAZTEC exchange rate
   - Distributes protocol fee to treasury

3. **Withdrawal Keeper**
   - Processes withdrawal queue (FIFO)
   - Unstakes from OUR validators when needed
   - Fulfills withdrawal requests after unbonding

4. **Monitoring Bot** (Optional)
   - Monitors OUR validator health via Aztec RPC metrics
   - Alerts team of slashing events or downtime
   - Tracks gas prices and pauses operations if too high

**Incentive Structure:**
- Bots run by protocol team (no external keeper rewards needed)
- Gas costs paid from protocol fee treasury

---

### 4. Security Considerations

#### 4.1 Smart Contract Security

**Critical Vulnerabilities to Address:**

1. **Reentrancy Attacks**
   - Use OpenZeppelin's ReentrancyGuard
   - Checks-Effects-Interactions pattern
   - Pull over push for withdrawals

2. **Exchange Rate Manipulation**
   - Validate total_aztec_controlled calculations
   - Multiple sources for validator reward data
   - Sanity checks on exchange rate changes (max 1% per epoch)
   - Emergency pause if anomalous rate detected

3. **Validator Infrastructure Risk**
   - Run OUR validators with high uptime SLA (>99%)
   - Geographic diversity (multiple data centers)
   - Redundant infrastructure to prevent slashing
   - Monitoring and alerting for validator issues

4. **Upgrade Risk**
   - Timelock on upgrades (48-72 hours)
   - Multi-sig governance (5-of-9 or similar)
   - Emergency pause function (separate from upgrades)

**Audit Requirements:**
- Minimum 2 independent audits (Trail of Bits, OpenZeppelin, ConsenSys Diligence, etc.)
- Formal verification of critical functions
- Bug bounty program ($1M+ pool)
- Gradual TVL ramp (cap at $10M for first month)

#### 4.2 Economic Security

**Attack Vectors:**

1. **Liquidity Squeeze**
   - Risk: All users withdraw simultaneously
   - Mitigation: Withdrawal queue + liquidity buffer + gradual unstaking

2. **Oracle Manipulation**
   - Risk: Fake validator performance data to steal rewards
   - Mitigation: Multiple oracle sources, slashing for false reporting

3. **Validator Collusion**
   - Risk: Protocol-controlled validators collude to extract value
   - Mitigation: Stake across diverse, independent operators

**Economic Parameters:**
```
Liquidity Buffer: 10% of TVL (maintained unstaked)
Max Withdrawal Per Epoch: 5% of TVL
Unbonding Period: Match Aztec's native unbonding (likely ~7 days)
Protocol Fee: 10% of rewards
Insurance Fund: 5% of TVL target
```

---

## Development Roadmap

### Phase 1: Research & Design (Weeks 1-2)
- [ ] Deep dive on Aztec staking contract internals
- [ ] Identify the two teams building fractional staking
- [ ] Assess partnership vs. competition strategy
- [ ] Finalize smart contract architecture
- [ ] Design tokenomics and fee structure
- [ ] Create formal specification document

### Phase 2: MVP Development (Weeks 3-6)
- [ ] Develop core smart contracts (Noir only)
- [ ] Implement stAZTEC token contract
- [ ] Build Vault Manager and Stake Router
- [ ] Create basic frontend (deposit/withdraw UI)
- [ ] Develop keeper bot infrastructure
- [ ] Internal security review

### Phase 3: Testnet Deployment (Weeks 7-8)
- [ ] Deploy to Aztec testnet
- [ ] Internal testing with team funds
- [ ] Bug bounty (private, $50k pool)
- [ ] Performance optimization
- [ ] Documentation and developer guides

### Phase 4: Security & Audit (Weeks 9-12)
- [ ] Engage 2+ audit firms
- [ ] Address audit findings
- [ ] Formal verification of critical paths
- [ ] Public bug bounty ($500k-$1M pool)
- [ ] Mainnet deployment preparation

### Phase 5: Mainnet Launch (Week 13+)
- [ ] Deploy to Aztec mainnet
- [ ] TVL cap: $1M (Week 1)
- [ ] TVL cap: $10M (Month 1)
- [ ] TVL cap: $50M (Month 2)
- [ ] Remove cap after 3 months of operation
- [ ] DeFi integrations (Uniswap, lending protocols)

### Phase 6: Expansion (Month 4+)
- [ ] Governance token launch (if applicable)
- [ ] Advanced features (flash withdrawals, strategies)
- [ ] Multi-sig to DAO transition
- [ ] Cross-chain bridges for stAZTEC
- [ ] Institutional product tier

**Total Time to Market: 3-4 months**

---

## Competitive Landscape: The Two Teams

### What We Know

From Aztec's official communications and web research:
- **Two teams** are confirmed to be building fractional staking solutions
- Target launch: **Token transferability date** (TBD, post-TGE)
- **No public disclosure** of team names or project details
- Focus: Enable staking for holders with <200,000 AZTEC

### Intelligence Gathering Strategy

**Immediate Actions:**
1. **Aztec Foundation Outreach**
   - Contact Aztec Labs/Foundation
   - Request information on ecosystem projects
   - Inquire about partnership opportunities

2. **Community Research**
   - Monitor Aztec Discord/Telegram
   - Track GitHub activity (Aztec ecosystem repos)
   - Follow Aztec team members on Twitter/X
   - Attend Aztec community calls

3. **Competitive Analysis Framework**
   ```
   For each identified team, research:
   ├─ Team background (prior projects, experience)
   ├─ Funding status (bootstrapped vs. VC-backed)
   ├─ Technical approach (architecture, privacy features)
   ├─ Timeline to market (launch date estimates)
   ├─ Market positioning (institutional vs. retail)
   └─ Partnership strategy (independent vs. Aztec-supported)
   ```

### Likely Team Profiles

**Team Type 1: Existing LST Protocol**
- **Example Candidates:** Lido, Rocket Pool, Ankr (multi-chain expansion)
- **Advantages:** Brand recognition, existing user base, proven tech
- **Disadvantages:** Slower to market, less Aztec-specific optimization
- **Likelihood:** Medium (requires Aztec-specific development)

**Team Type 2: Aztec Native Project**
- **Example Candidates:** Projects building on Aztec from early days
- **Advantages:** Deep Aztec knowledge, privacy-first design, community support
- **Disadvantages:** Less liquid staking experience, smaller team
- **Likelihood:** High (aligns with "two teams building" narrative)

**Team Type 3: New Startup**
- **Example Candidates:** Stealth teams from Ethereum staking space
- **Advantages:** Focused entirely on Aztec opportunity, fast-moving
- **Disadvantages:** No track record, limited resources
- **Likelihood:** High (startup velocity needed for this opportunity)

### Competitive Strategy Options

**Option A: Partner with One Team**
- Combine resources to build superior product
- Share market rather than fragment
- Faster time to market via collaboration
- Risk: Partner may defect or underperform

**Option B: Compete Directly**
- Build independently, aim to be first/best
- Capture 100% of market vs. sharing
- Differentiate via features (privacy, UX, DeFi integrations)
- Risk: Winner-takes-most market dynamics

**Option C: Build Different Product Tier**
- Team 1 targets retail, Team 2 targets institutional
- Avoid direct competition via segmentation
- Potential collaboration on infrastructure
- Risk: Market may prefer one-stop-shop solution

**Recommendation:** **Option B (Compete)** with **Option C (Differentiation) fallback**
- Attempt to be first to market with retail product
- If outpaced, pivot to institutional tier with DVT integration
- Monitor both competitors closely and adapt strategy

---

## Market Sizing & Business Model

### Total Addressable Market (TAM)

**Aztec Token Sale Metrics:**
- ETH Raised: 19,476 ETH (~$73M at $3,750/ETH)
- Participants: 16,700 individuals
- Average Investment: ~$4,370 per participant

**Staking Assumptions:**
```
Scenario A (Conservative):
├─ Participants with <200k AZTEC: 90% (15,030 people)
├─ Average holdings: $4,000 per person
├─ Staking rate: 30% (similar to early Ethereum)
└─ TAM: $18M TVL

Scenario B (Moderate):
├─ Total AZTEC market cap: $500M (year 1 estimate)
├─ Staking rate: 50% (mature market)
├─ Liquid staking capture: 40% (vs. native staking)
└─ TAM: $100M TVL

Scenario C (Optimistic):
├─ Total AZTEC market cap: $2B (if privacy narrative takes off)
├─ Staking rate: 70% (Ethereum-like participation)
├─ Liquid staking capture: 60% (dominant solution)
└─ TAM: $840M TVL
```

**Target Market Share:**
- Year 1: 40-60% of liquid staking market
- Year 2: Maintain 30-50% (as competitors enter)

**Revenue Projections:**
```
Year 1 (Conservative):
├─ TVL: $20M average
├─ Staking APR: 8% (estimated Aztec rewards)
├─ Protocol Fee: 10% of rewards
├─ Annual Revenue: $160k
└─ Monthly Revenue: $13k

Year 1 (Moderate):
├─ TVL: $50M average
├─ Staking APR: 8%
├─ Protocol Fee: 10%
├─ Annual Revenue: $400k
└─ Monthly Revenue: $33k

Year 2 (Optimistic):
├─ TVL: $200M average
├─ Staking APR: 6% (lower as network matures)
├─ Protocol Fee: 10%
├─ Annual Revenue: $1.2M
└─ Monthly Revenue: $100k
```

### Business Model

**Revenue Streams:**
1. **Staking Fees:** 10% of all staking rewards (primary)
2. **Express Withdrawal Fee:** 0.5% for instant withdrawals (secondary)
3. **Performance Fees:** 20% of excess returns vs. baseline (optional)

**Cost Structure:**
```
Fixed Costs:
├─ Smart contract audits: $200k (one-time)
├─ Infrastructure (servers, oracles): $5k/month
├─ Team salaries (3-5 people): $50k/month
└─ Legal/compliance: $10k/month

Variable Costs:
├─ Gas fees (keeper bots): ~0.5% of fees
├─ Insurance fund: 5% of fees
└─ Bug bounty payouts: Capped at $1M
```

**Break-Even Analysis:**
```
Monthly costs: ~$65k
Required monthly revenue: $65k
Required TVL at 10% fee, 8% APR: $97.5M

Realistic break-even: 6-12 months post-launch
```

---

## Risk Analysis

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Smart contract exploit | Medium | Critical | Multiple audits, gradual TVL ramp, insurance fund |
| Aztec protocol bug | Low | High | Diversification, insurance, close monitoring |
| Oracle failure | Medium | High | Multi-source oracles, fallback mechanisms |
| Slashing event | Medium | Medium | Validator diversification, insurance fund |
| Noir compatibility issues | Medium | Medium | Hybrid public/private approach, extensive testing |

### Market Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Competitors launch first | High | High | Sprint to market, differentiate via features |
| Low AZTEC staking demand | Medium | Critical | Market research, user interviews, marketing |
| AZTEC price collapse | Medium | Medium | Revenue in AZTEC + ETH hedge, sustainable costs |
| Regulatory crackdown | Low | High | Legal review, decentralization, geographic diversity |
| Lido/major player enters | Low | High | First-mover advantage, Aztec-specific optimization |

### Operational Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Team capacity constraints | Medium | Medium | Hire experienced Noir devs (Solidity background helpful), outsource non-core |
| Aztec ecosystem too small | Medium | High | Multi-chain expansion plan (backup options) |
| Governance attacks | Low | Medium | Multi-sig, timelocks, community involvement |
| Key person dependency | Medium | Medium | Documentation, knowledge sharing, redundancy |

---

## Next Steps (Immediate Actions)

### Week 1: Intelligence & Strategy
- [ ] **Day 1-2:** Contact Aztec Foundation (partnerships team)
- [ ] **Day 2-3:** Deep dive Aztec staking contract (on-chain + docs)
- [ ] **Day 3-4:** Identify competitor teams (Discord, GitHub, Twitter)
- [ ] **Day 4-5:** User interviews (token sale participants)
- [ ] **Day 5-7:** Finalize architecture and strategy doc

### Week 2: Team & Resources
- [ ] Assemble core team (2-3 developers, 1 designer, 1 product)
- [ ] Engage audit firms (get on their calendar ASAP)
- [ ] Set up development infrastructure (testnet nodes, etc.)
- [ ] Create project roadmap and Gantt chart
- [ ] Secure initial funding ($200k-$500k for 6 months runway)

### Week 3-4: Kick-off Development
- [ ] Smart contract development sprint 1
- [ ] Frontend mockups and designs
- [ ] Technical specification document (detailed)
- [ ] Risk assessment and security review (internal)
- [ ] Community engagement (Twitter, Discord presence)

---

## Conclusion

Aztec liquid staking represents a **rare first-mover opportunity** in a nascent but promising ecosystem. The combination of:

1. ✅ **High barrier to entry** (200k AZTEC minimum)
2. ✅ **Strong backing** (Vitalik, successful token sale)
3. ✅ **Privacy narrative** (unique positioning)
4. ✅ **Limited competition** (only 2 known teams)
5. ✅ **Growing ecosystem** (500+ validators, active development)

...creates an ideal environment for a well-executed liquid staking protocol to capture significant value.

**Key Success Factors:**
- **Speed:** Launch before or shortly after competitors
- **Security:** Bulletproof smart contracts (this is non-negotiable)
- **UX:** Simple, intuitive interface (lower barrier than competition)
- **Privacy:** Leverage Aztec's unique privacy features
- **Community:** Build trust with Aztec community early

**Estimated Timeline:** 3-4 months to mainnet launch
**Estimated Investment:** $200k-$500k (development + audits)
**Target Year 1 TVL:** $50M-$100M
**Target Year 1 Revenue:** $400k-$800k

**Recommendation:** **PROCEED** with full development and launch ASAP.

---

## Sources & References

- [Aztec Network](https://aztec.network/)
- [Aztec Staking Dashboard](https://stake.aztec.network/)
- [$AZTEC TGE: Next Steps For Holders](https://aztec.network/blog/aztec-tge-next-steps)
- [What Is Aztec Network (AZTEC)? A Vitalik-backed Privacy ETH L2 | CoinGecko](https://www.coingecko.com/learn/what-is-aztec-network-ethereum-privacy-layer-2)
- [Analyzing Aztec's Decentralized Sequencer Solution | Gate.com](https://www.gate.com/learn/articles/analyzing-aztecs-decentralized-sequencer-solution/1918)
- [Aztec Documentation | Privacy-first zkRollup](https://docs.aztec.network/)
- [Running a Sequencer | Aztec Documentation](https://docs.aztec.network/the_aztec_network/setup/sequencer_management)
- [Aztec Network Token Sale Explained](https://laikalabs.ai/en/blogs/aztec-network-token-sale-overview)
- Internal research: `liquid-staking-landscape-2025.md`
- Internal research: `OPPORTUNITIES.md`

---

**Document Version:** 1.0
**Last Updated:** December 22, 2025
**Next Review:** January 2026 (or upon competitor identification)
