# MegaETH Technical Design

High-level architecture and design patterns for MegaETH liquid staking protocol.

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        MegaETH Stack                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    User Layer                             │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │   │
│  │  │ Web UI       │  │ Mobile App   │  │ API Gateway  │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │   │
│  └────────────────────┬───────────────────────────────────┘   │
│                       │ (JSON RPC / REST)                      │
│  ┌────────────────────┴───────────────────────────────────┐   │
│  │                 Smart Contracts                         │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  LiquidStakingCore                               │  │   │
│  │  │  - Deposit/Withdraw logic                        │  │   │
│  │  │  - Validator accounting                          │  │   │
│  │  │  - Fee distribution                              │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  LiquidStakingToken (LST)                        │  │   │
│  │  │  - ERC20 token representing staked ETH           │  │   │
│  │  │  - Rebase or non-rebase variant                  │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  WithdrawalQueue                                 │  │   │
│  │  │  - FIFO unbonding queue                          │  │   │
│  │  │  - Claim processing                              │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  OperatorRegistry                                │  │   │
│  │  │  - Validator operator management                 │  │   │
│  │  │  - Operator commission tracking                  │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  SLAEnforcer                                     │  │   │
│  │  │  - Uptime tracking                               │  │   │
│  │  │  - Penalty calculation                           │  │   │
│  │  │  - Validator slashing                            │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  └────────────────────┬───────────────────────────────────┘   │
│                       │ (Events)                                │
│  ┌────────────────────┴───────────────────────────────────┐   │
│  │              Validator Layer                           │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │   │
│  │  │ Validator 1  │  │ Validator 2  │  │ Validator N  │ │   │
│  │  │ (Consensus)  │  │ (Consensus)  │  │ (Consensus)  │ │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                       │ (Attestations)                           │
│  ┌────────────────────┴───────────────────────────────────┐   │
│  │              Ethereum Network                          │   │
│  │  (Consensus Layer, Execution Layer)                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Smart Contract Architecture

### Core Components

#### 1. **LiquidStakingCore**
Main staking contract managing deposits, withdrawals, and validator accounting.

**Key Functions:**
```solidity
deposit(amount)              // User deposits ETH, receives LST
withdraw(amount)             // Request withdrawal (queued)
distributeRewards(rewards)   // Distribute validator rewards
penalizeValidator(pubkey)    // SLA penalty enforcement
```

**Data Structures:**
```solidity
struct Validator {
    bytes pubkey                    // Validator public key
    uint256 balance                 // Current ETH balance
    uint256 lastRewardTime          // Timestamp of last reward
    uint256 penaltyCount            // Number of penalties
    ValidatorStatus status          // Active, Pending, Exited
}

struct Deposit {
    address user                    // Depositor address
    uint256 amount                  // Deposit amount (wei)
    uint256 timestamp               // Deposit time
    uint256 lstReceived             // LST tokens minted
}
```

#### 2. **LiquidStakingToken (LST)**
ERC20 token representing staked ETH. Two variants:

**Rebase Variant:**
- Token supply fixed, balance updates with rewards
- Users see balance increase when validators earn rewards
- Example: stETH (Lido)

**Non-Rebase Variant:**
- Token supply increases, balance fixed
- Total supply grows with rewards
- Example: rETH (Rocket Pool)

**Implementation:** (Non-rebase recommended for simplicity)
```solidity
mapping(address => uint256) balances        // Token balance per user
mapping(address => uint256) allowance       // Approved spending
uint256 totalSupply                         // Total LST in circulation

// Exchange rate grows over time
// 1 ETH deposited = 1.0 LST initially
// After rewards: 1.0 LST = 1.05 ETH (5% rewards)
```

#### 3. **WithdrawalQueue**
FIFO queue for processing exit requests.

**Flow:**
1. User calls `requestWithdrawal(amount)` → enqueued
2. Contract waits for validator exit (~27 hours on Ethereum)
3. Withdrawal processed, user claims ETH

**Data:**
```solidity
struct WithdrawalRequest {
    address user                    // Requester
    uint256 lstAmount               // LST to burn
    uint256 ethAmount               // ETH to claim
    uint256 requestTime             // When requested
    uint256 processTime             // When processed (0 if pending)
    Status status                   // Pending, Processed, Claimed
}

Queue<WithdrawalRequest> queue              // FIFO queue
```

#### 4. **OperatorRegistry**
Manages validator operators (Validator-as-a-Service).

**Functions:**
```solidity
registerOperator(address, commission%)     // Onboard new operator
deregisterOperator(address)                // Remove operator
assignValidators(operator, pubkeys[])      // Assign validators
getOperatorRewards(operator)                // Fetch rewards
```

**Data:**
```solidity
struct Operator {
    address address                 // Operator wallet
    uint256 commission              // Fee in BPS (e.g., 500 = 5%)
    uint256 validatorCount          // Number of validators
    uint256 totalRewards            // Lifetime rewards
    OperatorStatus status           // Active, Inactive, Exited
}
```

#### 5. **SLAEnforcer**
Tracks validator uptime and enforces SLA penalties.

**Mechanism:**
1. Monitor validator attestations on-chain
2. If validator offline >N hours: trigger penalty
3. Reduce validator's reward for next period
4. Distribute penalty to protocol/stakers

**Data:**
```solidity
struct ValidatorMetrics {
    uint256 totalAttestations       // Total opportunities
    uint256 successfulAttestations  // Actual attestations
    uint256 lastUpdateTime          // Timestamp
    uint256 downtime                // Cumulative offline minutes
}

uint256 SLA_PENALTY_DOWNTIME = 60 minutes    // Trigger threshold
uint256 SLA_PENALTY_BPS = 100               // 1% fee reduction
```

## Data Flow

### Deposit Flow
```
User deposits ETH
    ↓
[LiquidStakingCore] validates amount
    ↓
Transfers ETH to contract
    ↓
Mints LST tokens (1:1 exchange rate)
    ↓
Event: Deposited(user, eth, lst)
    ↓
LST sent to user wallet
```

### Validator Reward Distribution
```
Ethereum consensus layer generates rewards
    ↓
Validator exits and claims rewards
    ↓
[LiquidStakingCore] receives rewards
    ↓
[SLAEnforcer] checks validator uptime
    ↓
If penalties: reduce reward amount
    ↓
Calculate fee shares:
  - Protocol: 5% of rewards
  - Operators: 2% + commission
  - Stakers: 93% of rewards
    ↓
Update validator balance in registry
    ↓
LST balance updates (if rebase) or
  Exchange rate updates (if non-rebase)
    ↓
Event: RewardsDistributed(validator, amount, penalties)
```

### Withdrawal Flow
```
User requests withdrawal
    ↓
[WithdrawalQueue] enqueues request
    ↓
Waits for validator exit (27 hours)
    ↓
Validator exits and sends ETH to contract
    ↓
[WithdrawalQueue] processes exit
    ↓
User claims ETH
    ↓
LST tokens burned
    ↓
Event: WithdrawalClaimed(user, eth)
```

## Fee Structure

**Total Fees:** 5% + 2% + 3% = 10% (competitive with Lido at 10%)

```
┌─────────────────────────────────────┐
│  Validator Rewards (before fees)    │
│  Example: 1 ETH                     │
└────────────────┬────────────────────┘
                 │
         ┌───────┴─────────┐
         ↓                 ↓
    ┌─────────┐      ┌──────────┐
    │ Fees    │      │ Stakers  │
    │ (10%)   │      │ Share    │
    │ 0.1 ETH │      │ (90%)    │
    └────┬────┘      │ 0.9 ETH  │
         │           └──────────┘
    ┌────┴──────────┐
    │               │
    ↓               ↓
┌──────────┐  ┌──────────────┐
│Protocol  │  │ Operator     │
│(5%)      │  │(2% base +    │
│0.05 ETH  │  │commission)   │
└──────────┘  │0.05 ETH      │
              │(more with    │
              │high volume)  │
              └──────────────┘
```

## Validator Key Management

**Two-Key Model:**

1. **Staking Key** (held by protocol)
   - Used for attestations (high frequency)
   - Compressed/optimized
   - Rotated periodically for security

2. **Withdrawal Key** (held by validator/operator)
   - Used for validator exit
   - Kept secure, rarely used
   - Critical for fund recovery

**Implementation:**
```
┌──────────────────────────────────────┐
│ Validator Credentials                │
├──────────────────────────────────────┤
│ Staking Pubkey:                      │
│   0x8d3bfff9e3fd...                  │
│   (Used for: attestations, proposals)│
│                                      │
│ Withdrawal Credentials:              │
│   0x00abcdefabcd...                  │
│   (Used for: exit, fund recovery)    │
│                                      │
│ Operator Signature:                  │
│   [Signed by: validator's address]   │
│   (Proves operator owns keys)        │
└──────────────────────────────────────┘
```

## Monitoring & Observability

**Key Metrics:**
```
validator_balance_eth              // Current balance per validator
validator_uptime_percent           // Attestation success rate
validator_is_proposing             // Current status
network_participation_rate         // Network-wide % participating
pending_withdrawal_count           // Queued exits
average_withdrawal_time            // Queue processing time
protocol_tvl_eth                   // Total value locked
lst_exchange_rate                  // ETH per LST
```

**Alerting Thresholds:**
```
CRITICAL:
  - Validator offline >5 min
  - Balance declining >1% unexpectedly
  - Network participation <90%

HIGH:
  - Disk usage >80%
  - RPC endpoint timeout

MEDIUM:
  - Pending withdrawals growing
  - Exchange rate drift >0.5%
```

## Security Considerations

### 1. **Key Management**
- ✅ Operator keys stored separately from staking keys
- ✅ Withdrawal keys air-gapped (not on validator node)
- ✅ Regular key rotation (quarterly)
- ✅ Multi-sig for emergency exits

### 2. **Smart Contract Risk**
- ✅ No minting unbacked LST
- ✅ Validator balance must match staked ETH
- ✅ Overflow/underflow protection (Solidity 0.8+)
- ✅ Reentrancy guards on external calls

### 3. **Operational Risk**
- ✅ 2-of-3 multi-sig for upgrade authority
- ✅ Timelock on contract upgrades (48h)
- ✅ Pause mechanism for emergency stops
- ✅ Rate limiting on large withdrawals

### 4. **Slashing Risk**
- ✅ Automatic SLA penalties for downtime
- ✅ Validator insurance pool (future)
- ✅ Transparent penalty distribution
- ✅ Appeal mechanism for incorrect penalties

## Performance Characteristics

**Throughput:**
- Deposits: ~1000 per block (limited by gas)
- Withdrawals: ~500 per block
- Reward distributions: ~100 validators per tx

**Latency:**
- Deposit confirmation: 1 block (~12s)
- Withdrawal request → processing: ~27 hours
- Reward distribution: Daily (off-chain calculation)

**Gas Costs (Ethereum L1):**
```
Operation               Gas Cost      Cost @ 100 gwei, $4000/ETH
─────────────────────────────────────────────────────────────
Single deposit          ~50,000 gas    $0.20
Single withdrawal       ~30,000 gas    $0.12
Reward distribution     ~100,000 gas   $0.40 (per 100 validators)
  (amortized per validator)
```

## Comparison with Competitors

| Feature | MegaETH | Lido | Rocket Pool |
|---------|---------|------|-------------|
| Fee | 5-7% | 10% | 15% |
| SLA | ✅ Enforced | ❌ None | ⚠️ Partial |
| NaaS | ✅ Full | ❌ None | ✅ Limited |
| Decentralization | ⚠️ Scaling | ❌ Centralized | ✅ High |
| TVL | TBD | $40B+ | $5B+ |

---

**Architecture Version:** 1.0  
**Last Updated:** February 21, 2026  
**Status:** Design Phase Complete
