# AgentRadar (AR) Protocol

**Status:** Specification Phase | **Last Updated:** January 30, 2026

> The Bloomberg Terminal + Aave for AI Agents

## Problem Statement

The autonomous machine economy faces a critical "Discovery-Trust Gap": there is no reliable way for developers, lenders, and users to discover trustworthy AI agents, assess their risk profiles, or provide them with the capital they need to operate. Current solutions rely on off-chain monitoring that lacks financial accountability.

## Solution: Trust-as-a-Service (TaaS)

AgentRadar is the flagship Trust-as-a-Service (TaaS) platform designed to be the central discovery and financial hub for the ERC-8004 ecosystem. By merging Ethos-style vouching with a Reverse Kelly risk engine, AgentRadar creates an on-chain, financially accountable trust layer.

## Key Features

| Feature | Description |
|---------|-------------|
| **Reputation-Collateralized Lending** | Turn on-chain agent performance into liquid credit ratings |
| **Ethos Vouching Vaults** | Stake on emerging agents to earn "Trust Premiums" |
| **Reverse Kelly Risk Engine** | Dynamic interest rates based on validation success rates |
| **TEE/zkML Attestation** | Hardware-signed proofs for agent validation |
| **Credit Market** | Decentralized lending pools for verified agents |

## Target Users

| Persona | Use Case |
|---------|----------|
| **Developers** | Register agents, request credit lines, buy validation attestations |
| **Lenders** | Provide liquidity to verified agent pools, earn "Machine Interest" |
| **Vouchers** | Stake on emerging agents, earn "Trust Premium", act as first-loss insurance |

## MVP Scope

### Phase 1: Core Registry & Identity
- ERC-721 AgentID minting via AgentRadar
- Basic reputation indexing from ERC-8004 feedback
- Simple dashboard for agent discovery

### Phase 2: Vouching Mechanism
- Vouching Vaults for $AR/ETH staking
- Credit multiplier system (1 ETH vouched = up to 5 ETH credit)
- Voucher revenue share (20% of agent net revenue)

### Phase 3: Lending & Risk Engine
- Reverse Kelly interest rate calculation
- Tiered agent classification (Alpha/Beta/Testing)
- Job Escrow contract with TEE attestation gates

## Technical Stack

- **Standard:** Native ERC-8004 Compliance (Identity, Reputation, Validation)
- **Smart Contracts:** Solidity (AgentRadarEscrow.sol, VouchingVault.sol)
- **Attestation:** TEE proofs, zkML verification
- **Frontend:** React dashboard for agent discovery and management

## Next Steps

1. Run Monte Carlo simulation on Reverse Kelly Interest Engine
2. Draft `AgentRadarEscrow.sol` interface
3. Design staker-to-agent revenue distribution logic
4. Competitive analysis vs AgentOps (off-chain monitoring)

## Related Documents

- [SPEC.md](./SPEC.md) - Full technical specification
- [RESEARCH_PROMPT.md](./RESEARCH_PROMPT.md) - Continuation prompts for further development

## Decision Log

| Date | Decision |
|------|----------|
| 2026-01-30 | Initial specification created based on ERC-8004 ecosystem requirements |
| 2026-01-30 | Chose Reverse Kelly Criterion for risk pricing over traditional actuarial models |
| 2026-01-30 | Selected 20% revenue share for vouchers as market-competitive rate |
