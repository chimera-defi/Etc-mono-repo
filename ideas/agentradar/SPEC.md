# AgentRadar Protocol Specification v1.1

**Status:** Continuous Iteration
**Standard:** Native ERC-8004 Compliance (Identity, Reputation, Validation)
**Vision:** The Bloomberg Terminal + Aave for AI Agents

---

## 1. The AgentRadar Dashboard (UX/UI)

AgentRadar is the front-end gateway to the decentralized registries. It serves three primary user personas:

- **Developers:** Register agents, request credit lines, and buy validation attestations.
- **Lenders:** Provide liquidity to "Verified" agent pools to earn high-yield "Machine Interest."
- **Vouchers (The Ethos Layer):** Stake on emerging agents to earn a "Trust Premium" while acting as the first-loss insurance layer.

---

## 2. Core DeFi Mechanics: "Reputation-Collateralized Lending"

AgentRadar turns an agent's on-chain performance (ERC-8004) into a liquid credit rating.

### 2.1 The Ethos Vouching Model

New agents use AgentRadar Vouching Vaults to build creditworthiness:

| Step | Description |
|------|-------------|
| **Bootstrapping** | Vouchers stake $AR tokens or ETH on an AgentID |
| **The Multiplier** | Every 1 ETH of "Vouched" capital unlocks up to 5 ETH of credit (depending on agent's Validation Score) |
| **Risk/Reward** | Vouchers earn 20% of the agent's net revenue but are slashed first if the Validation Registry records a critical failure |

### 2.2 The Reverse Kelly Risk Engine

To protect lenders, the protocol uses a Reverse Kelly Criterion to price interest. Unlike traditional pools, the interest rate is a function of the Validation Success Rate (P):

| Agent Tier | Success Rate (P) | Interest Premium |
|------------|------------------|------------------|
| **Alpha-Level** | P > 99% | Near-zero premiums |
| **Beta/Testing** | P < 80% | 50%+ premiums (financial barrier against unstable code) |

The formula ensures that:
- High-performing agents get cheap capital
- Risky agents face prohibitive borrowing costs
- The protocol remains solvent during sudden performance drops

---

## 3. High-Level Architecture (Continuous Iteration)

The system operates as a "Trust Sandwich":

```
┌─────────────────────────────────────────────────────────┐
│  LIQUIDITY LAYER (Top)                                  │
│  AgentRadar Credit Market calculates loan rate and      │
│  releases funds into "Job Escrow"                       │
├─────────────────────────────────────────────────────────┤
│  REPUTATION & VALIDATION (Middle)                       │
│  AgentRadar indexers aggregate:                         │
│  - Feedback (Reputation)                                │
│  - Hardware-signed TEE proofs (Validation)              │
├─────────────────────────────────────────────────────────┤
│  IDENTITY (Bottom)                                      │
│  Agent mints ERC-721 AgentID via AgentRadar             │
└─────────────────────────────────────────────────────────┘
```

### Core Contracts

| Contract | Purpose |
|----------|---------|
| `AgentID.sol` | ERC-721 identity token for registered agents |
| `VouchingVault.sol` | Handles $AR/ETH staking on AgentIDs |
| `AgentRadarEscrow.sol` | Releases funds only after TEE attestation |
| `CreditMarket.sol` | Reverse Kelly interest calculation & lending pools |
| `ValidationRegistry.sol` | Stores TEE/zkML attestation proofs |

---

## 4. Business Models & Tokenomics

| Feature | Monetization |
|---------|--------------|
| **Trust Indexing** | API fees for dApps querying the "AgentRadar Verified" list |
| **Validation as a Service** | 1% fee on every TEE/zkML attestation posted via AgentRadar nodes |
| **Liquidity Spread** | Protocol takes 10% cut of interest paid by agents to lenders |
| **Slashing Bounties** | 5% of slashed voucher stake is burnt, 5% paid to reporter |

### Token Utility ($AR)

- **Staking:** Required for vouching on agents
- **Governance:** Vote on protocol parameters (multipliers, fee rates)
- **Fee Discounts:** Reduced attestation fees when paying in $AR
- **Slashing:** $AR is slashed from vouchers on agent failure

---

## 5. Contract Interfaces (Draft)

### AgentRadarEscrow.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAgentRadarEscrow {
    /// @notice Deposit funds for an agent job
    /// @param agentId The ERC-721 AgentID
    /// @param amount The amount to escrow
    /// @param jobId Unique identifier for the job
    function depositForJob(
        uint256 agentId,
        uint256 amount,
        bytes32 jobId
    ) external payable;

    /// @notice Release escrowed funds after TEE attestation
    /// @param jobId The job to release funds for
    /// @dev Only callable after ValidationRegistry confirms "Job_Start" attestation
    function releaseOnAttestation(bytes32 jobId) external;

    /// @notice Slash voucher stake on critical failure
    /// @param agentId The failed agent
    /// @param severity Failure severity (determines slash percentage)
    function slashOnFailure(uint256 agentId, uint8 severity) external;

    /// @notice Check if job has valid TEE attestation
    /// @param jobId The job to check
    /// @return hasAttestation Whether Job_Start attestation exists
    function hasValidAttestation(bytes32 jobId) external view returns (bool);
}
```

### VouchingVault.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IVouchingVault {
    /// @notice Stake tokens to vouch for an agent
    /// @param agentId The agent to vouch for
    /// @param amount Amount of $AR or ETH to stake
    function vouch(uint256 agentId, uint256 amount) external payable;

    /// @notice Withdraw vouch stake (subject to cooldown)
    /// @param agentId The agent to unvouch from
    /// @param amount Amount to withdraw
    function unvouch(uint256 agentId, uint256 amount) external;

    /// @notice Claim accumulated trust premiums
    /// @param agentId The agent to claim premiums from
    function claimPremiums(uint256 agentId) external;

    /// @notice Get credit multiplier for an agent based on vouch amount
    /// @param agentId The agent to check
    /// @return multiplier Credit multiplier (1x to 5x)
    function getCreditMultiplier(uint256 agentId) external view returns (uint256);

    /// @notice Get total vouched amount for an agent
    /// @param agentId The agent to check
    /// @return total Total vouched capital
    function getTotalVouched(uint256 agentId) external view returns (uint256);
}
```

---

## 6. Risk Considerations

### Solvency Risk

**Scenario:** An "Alpha" agent (99% success) suddenly drops to 40% success rate.

**Mitigation Layers:**
1. **Voucher First-Loss:** Vouchers absorb initial losses via slashing
2. **Dynamic Repricing:** Reverse Kelly immediately increases interest rate
3. **Credit Line Reduction:** Available credit shrinks as reputation drops
4. **Circuit Breakers:** Automatic pause on rapid reputation degradation

### Oracle Risk

- TEE attestations must be verified on-chain
- Multiple attestation providers reduce single-point-of-failure risk
- zkML provides cryptographic proof of model behavior

### Smart Contract Risk

- Formal verification of core contracts
- Time-locked upgrades with governance approval
- Bug bounty program for security researchers

---

## 7. Competitive Differentiation

| Feature | AgentRadar | AgentOps | Traditional DeFi |
|---------|------------|----------|------------------|
| **Monitoring** | On-chain, financially accountable | Off-chain dashboards | N/A |
| **Trust Layer** | Ethos-style vouching with slashing | Manual reviews | Over-collateralization |
| **Risk Pricing** | Reverse Kelly (performance-based) | N/A | Static interest rates |
| **Agent-Native** | ERC-8004 compliant | Generic monitoring | Not agent-aware |
| **Incentive Alignment** | Vouchers have skin-in-the-game | No financial stake | Collateral-based |

---

## 8. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)
- [ ] Deploy AgentID ERC-721 contract
- [ ] Build basic AgentRadar dashboard
- [ ] Integrate ERC-8004 reputation indexing

### Phase 2: Vouching (Weeks 5-8)
- [ ] Deploy VouchingVault contract
- [ ] Implement credit multiplier logic
- [ ] Build voucher dashboard with premium tracking

### Phase 3: Lending (Weeks 9-12)
- [ ] Deploy CreditMarket with Reverse Kelly engine
- [ ] Deploy AgentRadarEscrow with TEE gates
- [ ] Integrate ValidationRegistry for attestations

### Phase 4: Launch (Weeks 13-16)
- [ ] Security audits
- [ ] Testnet deployment
- [ ] Mainnet launch with limited caps
- [ ] Progressive decentralization

---

## 9. Open Questions

1. **Gas Optimization:** How to distribute trust premiums in real-time without excessive gas costs?
   - Consider: Merkle-based claim system, L2 deployment, batch distributions

2. **Attestation Latency:** How quickly must TEE attestations be verified for Job_Start?
   - Consider: Optimistic verification with fraud proofs

3. **Cross-Chain:** Should AgentRadar support agents operating across multiple chains?
   - Consider: Canonical AgentID on L1, bridged reputation to L2s

4. **Governance:** What parameters should be governance-controlled?
   - Consider: Fee rates, multiplier caps, slashing percentages, circuit breaker thresholds
