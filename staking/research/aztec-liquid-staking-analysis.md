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
│                    SMART CONTRACT LAYER (Noir + Solidity)                        │
│                                                                                   │
│  ┌────────────────────────────────────────────────────────────────────────┐     │
│  │                     CORE CONTRACTS (Noir/Solidity)                      │     │
│  │                                                                          │     │
│  │  ┌──────────────────────────┐      ┌───────────────────────────┐       │     │
│  │  │  LiquidStakingCore.nr    │◄─────┤  stAZTEC.sol (ERC20)      │       │     │
│  │  │                          │      │  - Reward-bearing token    │       │     │
│  │  │  - deposit()             │      │  - Exchange rate oracle    │       │     │
│  │  │  - requestWithdrawal()   │      │  - Transfer logic          │       │     │
│  │  │  - claimWithdrawal()     │      └───────────────────────────┘       │     │
│  │  │  - Private state option  │                                           │     │
│  │  └────────┬─────────────────┘                                           │     │
│  │           │                                                              │     │
│  │           ▼                                                              │     │
│  │  ┌──────────────────────────┐      ┌───────────────────────────┐       │     │
│  │  │  VaultManager.sol        │◄─────┤  StakeRouter.sol          │       │     │
│  │  │                          │      │                            │       │     │
│  │  │  - Pool aggregation      │      │  - Validator selection     │       │     │
│  │  │  - 200k batch creation   │      │  - Performance scoring     │       │     │
│  │  │  - Liquidity buffer      │      │  - Diversity algo          │       │     │
│  │  │  - Validator tracking    │      │  - Rebalancing logic       │       │     │
│  │  └────────┬─────────────────┘      └───────────────────────────┘       │     │
│  │           │                                                              │     │
│  │           ▼                                                              │     │
│  │  ┌──────────────────────────┐      ┌───────────────────────────┐       │     │
│  │  │  RewardsDistributor.sol  │      │  WithdrawalQueue.sol       │       │     │
│  │  │                          │      │                            │       │     │
│  │  │  - Collect rewards       │      │  - FIFO queue              │       │     │
│  │  │  - Protocol fee (10%)    │      │  - Unbonding tracker       │       │     │
│  │  │  - Insurance fund (5%)   │      │  - Express withdrawals     │       │     │
│  │  │  - Update exchange rate  │      │  - Batch processing        │       │     │
│  │  └──────────────────────────┘      └───────────────────────────┘       │     │
│  │                                                                          │     │
│  └──────────────────────────────────────────────────────────────────────────┘    │
│                                                                                   │
│  ┌────────────────────────────────────────────────────────────────────────┐     │
│  │                   ORACLE & GOVERNANCE CONTRACTS                         │     │
│  │                                                                          │     │
│  │  ┌──────────────────────────┐      ┌───────────────────────────┐       │     │
│  │  │  ValidatorOracle.sol     │      │  GovernanceProxy.sol       │       │     │
│  │  │                          │      │                            │       │     │
│  │  │  - Performance metrics   │      │  - Snapshot voting         │       │     │
│  │  │  - Slashing detection    │      │  - Parameter updates       │       │     │
│  │  │  - Rewards tracking      │      │  - Emergency pause         │       │     │
│  │  │  - Multi-sig updates     │      │  - Upgrade timelock        │       │     │
│  │  └──────────────────────────┘      └───────────────────────────┘       │     │
│  │                                                                          │     │
│  └──────────────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────┼───────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      BOT INFRASTRUCTURE (TypeScript/Node.js)                     │
│                                                                                   │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐  │
│  │   Staking Bot        │  │   Rewards Bot        │  │  Withdrawal Bot      │  │
│  │   (Keeper #1)        │  │   (Keeper #2)        │  │  (Keeper #3)         │  │
│  │                      │  │                      │  │                      │  │
│  │ - Monitor pool       │  │ - Claim rewards      │  │ - Process queue      │  │
│  │ - Trigger 200k batch │  │ - Update rates       │  │ - Unstake validators │  │
│  │ - Select validators  │  │ - Compound yields    │  │ - Fulfill requests   │  │
│  │ - Execute stakes     │  │ - Fee distribution   │  │ - Manage buffer      │  │
│  │                      │  │                      │  │                      │  │
│  │ Trigger: Pool ≥ 200k │  │ Trigger: Every epoch │  │ Trigger: Queue > 0   │  │
│  └──────────────────────┘  └──────────────────────┘  └──────────────────────┘  │
│                                                                                   │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐  │
│  │  Rebalancing Bot     │  │   Oracle Bot         │  │  Monitoring Bot      │  │
│  │  (Keeper #4)         │  │   (Keeper #5)        │  │  (Alert System)      │  │
│  │                      │  │                      │  │                      │  │
│  │ - Track performance  │  │ - Fetch metrics      │  │ - Health checks      │  │
│  │ - Migrate poor nodes │  │ - Update oracle      │  │ - Slashing alerts    │  │
│  │ - Optimize spread    │  │ - Verify data        │  │ - Gas price monitor  │  │
│  │ - Geographic balance │  │ - Multi-sig submit   │  │ - Anomaly detection  │  │
│  │                      │  │                      │  │                      │  │
│  │ Trigger: Daily/Event │  │ Trigger: Every epoch │  │ Trigger: Continuous  │  │
│  └──────────────────────┘  └──────────────────────┘  └──────────────────────┘  │
│                                                                                   │
│  Technology Stack:                                                                │
│  - Runtime: Node.js 20+ (TypeScript 5.3+)                                        │
│  - Web3 Library: viem or ethers.js v6                                            │
│  - Queue: BullMQ (Redis-backed)                                                  │
│  - Monitoring: Prometheus + Grafana                                              │
│  - Alerts: PagerDuty / Telegram Bot                                              │
│  - Deployment: Docker + Kubernetes                                               │
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
│  │     │  PublicLiquidStaking.sol             │                     │    │
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

## Noir vs. Solidity: Language Comparison & Challenges

### Overview

Our liquid staking protocol will use a **hybrid architecture**:
- **Noir** for privacy-enabled features (optional private deposits/withdrawals)
- **Solidity** for public state management (vault pooling, ERC-20 token, governance)

This section details the differences, challenges, and best practices for working with Noir.

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

### Recommended Architecture for Liquid Staking

#### **Hybrid Approach: Solidity + Noir**

```
┌─────────────────────────────────────────────────────┐
│              SOLIDITY CONTRACTS                      │
│                                                       │
│  ✓ stAZTEC.sol (ERC-20 token)                        │
│  ✓ VaultManager.sol (pool aggregation)               │
│  ✓ RewardsDistributor.sol (fee distribution)         │
│  ✓ WithdrawalQueue.sol (unbonding)                   │
│  ✓ ValidatorOracle.sol (performance data)            │
│  ✓ GovernanceProxy.sol (voting)                      │
│                                                       │
│  Why Solidity: Public state, ERC-20 compatibility,   │
│  mature tooling, gas-efficient for non-ZK ops        │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│              NOIR CONTRACTS (OPTIONAL)               │
│                                                       │
│  ✓ PrivateLiquidStaking.nr                           │
│    - #[private] deposit_private()                    │
│    - #[private] withdraw_private()                   │
│    - Private balance tracking                        │
│                                                       │
│  ✓ PrivateGovernance.nr                              │
│    - Anonymous voting                                │
│    - Hidden vote weights                             │
│                                                       │
│  Why Noir: Privacy features, encrypted balances,     │
│  anonymous transactions                              │
└─────────────────────────────────────────────────────┘
```

**Recommendation:** Start with **Solidity-only MVP**, add Noir privacy features in v2.

**Rationale:**
1. **Faster development:** Solidity tooling is mature
2. **Lower risk:** Noir is newer, less battle-tested
3. **Easier audits:** More auditors know Solidity
4. **Privacy is optional:** Most users are fine with public staking

**Noir as Differentiator:** Once MVP is live and secure, add Noir privacy features as **unique selling point** vs. competitors.

### Development Tools & Workflow

#### **Solidity Stack:**
```bash
# Foundry (recommended for testing/deployment)
forge init liquid-staking
forge test              # Run tests
forge build             # Compile
forge script Deploy     # Deploy contracts

# Hardhat (alternative, more plugins)
npx hardhat test
npx hardhat deploy
```

#### **Noir Stack:**
```bash
# Install Noir (via noirup)
curl -L https://install.noir-lang.org | bash
noirup

# Project setup
nargo new private-staking
cd private-staking

# Development commands
nargo check             # Type check
nargo test              # Run tests
nargo compile           # Compile to circuit
nargo info              # Show circuit size

# Example output
Circuit size: 12,845 gates  # Lower is better!
```

#### **Integration Testing:**
```typescript
// Test Solidity + Noir integration
import { deployContracts } from './deploy';
import { compileNoirCircuit } from '@noir-lang/noir_js';

describe('Hybrid Liquid Staking', () => {
  it('should handle private deposit -> public staking flow', async () => {
    // 1. Deploy Solidity contracts
    const { vaultManager, stAztec } = await deployContracts();

    // 2. Compile Noir circuit
    const circuit = await compileNoirCircuit('PrivateLiquidStaking');

    // 3. Generate proof of private deposit
    const proof = await circuit.generateProof({ amount: 50000 });

    // 4. Submit proof to Solidity contract
    await vaultManager.verifyAndDeposit(proof);

    // 5. Verify stAZTEC minted
    expect(await stAztec.balanceOf(user)).to.equal(50000);
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

✅ **Use Solidity for:**
- Public state management
- ERC-20 tokens
- Vault pooling and staking logic
- Governance (non-privacy-sensitive)
- Oracle contracts

✅ **Use Noir for:**
- Optional private deposits/withdrawals
- Anonymous governance voting
- Encrypted balance tracking
- Differentiating feature (v2)

⚠️ **Noir Gotchas:**
1. Fixed-size arrays only (no dynamic)
2. Loops unroll → huge circuits (use unconstrained)
3. Field arithmetic wraps (use u64/u128 for safety)
4. Bit ops are expensive (avoid in circuits)
5. Debugging is limited (test extensively)
6. Unconstrained = unproven (add constraints!)

🎯 **Recommended Strategy:**
1. **Phase 1:** Solidity-only MVP (3-4 months)
2. **Phase 2:** Add Noir privacy features (2-3 months)
3. **Phase 3:** Optimize circuit sizes and UX

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

### Minimum Required Bots (5 Core + 1 Optional)

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

#### **Bot #4: Rebalancing Keeper**

**Purpose:** Monitor validator performance and migrate stake from underperformers.

**Responsibilities:**
- Daily performance check:
  - Query `ValidatorOracle.getPerformanceScores()`
  - Identify validators with <95% uptime or slashing events
  - Unstake from poor performers
  - Restake to high performers
- Maintain geographic diversity (50+ validators across 6 continents)

**Trigger:** Daily (or after slashing event)

**Technology Stack:**
```typescript
// rebalancing-keeper/src/index.ts

interface ValidatorScore {
  address: string;
  uptime: number;        // 0-100%
  slashingEvents: number;
  blocksProposed: number;
  geographicRegion: string;
}

async function rebalanceStake() {
  // Get all validator scores
  const scores: ValidatorScore[] = await client.readContract({
    address: VALIDATOR_ORACLE_ADDRESS,
    abi: validatorOracleAbi,
    functionName: 'getAllValidatorScores'
  });

  // Find underperformers (uptime <95% or slashed)
  const poorPerformers = scores.filter(v =>
    v.uptime < 95 || v.slashingEvents > 0
  );

  // Find top performers
  const topPerformers = scores
    .filter(v => v.uptime >= 99 && v.slashingEvents === 0)
    .sort((a, b) => b.uptime - a.uptime)
    .slice(0, 10);

  // Migrate stake
  for (const poor of poorPerformers) {
    const target = selectDiverseValidator(topPerformers);

    await wallet.writeContract({
      address: VAULT_MANAGER_ADDRESS,
      abi: vaultManagerAbi,
      functionName: 'migrateStake',
      args: [poor.address, target.address, 200_000n * 10n**18n]
    });

    console.log(`Migrated stake from ${poor.address} to ${target.address}`);
  }
}

// Run daily at 2 AM UTC
import { CronJob } from 'cron';
new CronJob('0 2 * * *', rebalanceStake, null, true, 'UTC');
```

**Dependencies:**
```json
{
  "dependencies": {
    "cron": "^3.1.0",
    "viem": "^2.7.0"
  }
}
```

---

#### **Bot #5: Oracle Keeper**

**Purpose:** Fetch validator performance metrics and update on-chain oracle.

**Responsibilities:**
- Every epoch:
  - Query Aztec node for validator metrics:
    - Blocks proposed / attested
    - Uptime
    - Slashing events
    - Rewards earned
  - Aggregate data
  - Submit to `ValidatorOracle.updateMetrics()` via multi-sig
- Use Chainlink-style multi-oracle approach (5-of-9 consensus)

**Trigger:** Every epoch

**Technology Stack:**
```typescript
// oracle-keeper/src/index.ts
import axios from 'axios';

interface ValidatorMetrics {
  address: string;
  blocksProposed: number;
  blocksAttested: number;
  uptime: number;
  rewardsEarned: bigint;
  slashingEvents: number;
  lastUpdate: number;
}

async function fetchAndUpdateMetrics() {
  // Fetch from Aztec node RPC
  const response = await axios.post(AZTEC_NODE_RPC, {
    jsonrpc: '2.0',
    method: 'aztec_getValidatorMetrics',
    params: [],
    id: 1
  });

  const metrics: ValidatorMetrics[] = response.data.result;

  // Hash metrics for multi-sig verification
  const metricsHash = hashMetrics(metrics);

  // Sign with keeper private key
  const signature = await wallet.signMessage({
    message: metricsHash
  });

  // Submit to oracle (requires 5-of-9 keepers to submit)
  await wallet.writeContract({
    address: VALIDATOR_ORACLE_ADDRESS,
    abi: validatorOracleAbi,
    functionName: 'submitMetrics',
    args: [metrics, signature]
  });

  console.log(`Oracle updated with ${metrics.length} validator metrics`);
}
```

---

#### **Bot #6: Monitoring & Alerts (Optional but Recommended)**

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

Gas Costs (estimated):
Staking tx: 1-2/day @ $0.50 = $30/month
Rewards tx: ~250/month @ $0.20 = $50/month
Withdrawal tx: ~100/month @ $0.30 = $30/month
Oracle updates: ~250/month @ $0.40 = $100/month
Rebalancing: ~10/month @ $0.50 = $5/month
-----------------------------------------
Total Gas: ~$215/month

TOTAL MONTHLY COST: ~$514/month
```

**Break-even Analysis:**
```
At $50M TVL, 8% APR, 10% protocol fee:
Monthly revenue: $50M * 0.08 * 0.10 / 12 = $33,333

Infrastructure cost: $514
Profit margin: 98.5% 🎉
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

#### 3.1 Validator Oracle
**Purpose:** Track validator performance and status

**Data Collection:**
- Block proposal success rate
- Attestation performance
- Uptime metrics
- Slashing events
- Rewards earned
- Geographic location
- Node software version

**Implementation:**
```typescript
interface ValidatorMetrics {
    address: string;
    blocksProposed: number;
    blocksSuccessful: number;
    attestations: number;
    uptime: number; // percentage
    slashingEvents: SlashingEvent[];
    totalRewards: bigint;
    lastUpdated: timestamp;
}
```

**Oracle Update Frequency:**
- Critical metrics (slashing): Real-time
- Performance metrics: Every epoch (~6.4 minutes on Ethereum, TBD for Aztec)
- Rewards: Every block or epoch

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
**Required Automation:**

1. **Staking Bot**
   - Monitors deposit pool
   - Triggers batch staking when 200k AZTEC accumulated
   - Selects validators via Stake Router

2. **Rewards Bot**
   - Claims rewards from validators
   - Triggers exchange rate update
   - Compounds rewards

3. **Withdrawal Bot**
   - Processes withdrawal queue
   - Unstakes from validators as needed
   - Fulfills withdrawal requests

4. **Rebalancing Bot**
   - Monitors validator performance
   - Migrates stake from poor performers
   - Maintains target distribution

**Incentive Structure:**
- Keeper reward: 0.1% of transaction value
- Gas costs reimbursed from protocol fees

---

### 4. Security Considerations

#### 4.1 Smart Contract Security

**Critical Vulnerabilities to Address:**

1. **Reentrancy Attacks**
   - Use OpenZeppelin's ReentrancyGuard
   - Checks-Effects-Interactions pattern
   - Pull over push for withdrawals

2. **Oracle Manipulation**
   - Multi-source oracle data
   - Median calculation vs single source
   - Staleness checks (reject data >1 epoch old)

3. **Validator Cartel Risk**
   - Maximum stake per validator (e.g., 5% of TVL)
   - Geographic diversity requirements
   - Forced rotation mechanism

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
- [ ] Develop core smart contracts (Solidity/Noir)
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
| Team capacity constraints | Medium | Medium | Hire experienced Solidity/Noir devs, outsource non-core |
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
