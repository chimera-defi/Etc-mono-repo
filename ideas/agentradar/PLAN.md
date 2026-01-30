# AgentRadar (AR) Protocol Plan

## Phase 0 - Spec and modeling
- Finalize reverse-Kelly formula and parameters
- Define validation attestation schema
- Model agent death spiral (simulations)

## Phase 1 - Core contracts (prototype)
- ERC-8004 interfaces (identity, reputation, validation)
- AgentRadarCredit.sol with escrow mechanics
- VouchingVault.sol with first-loss slashing
- RateEngine.sol with borrow rate updates

## Phase 2 - Off-chain indexing and scoring
- Index ERC-8004 registries
- Reputation aggregation + x402 verification
- Validation scoring pipeline

## Phase 3 - Risk controls
- Circuit breaker on deteriorating P
- Caps per AgentID and per voucher vault
- Emergency pause and risk overrides

## Phase 4 - MVP deployment
- Testnet deployment
- Wallet UI for lenders/vouchers/agents
- Public dashboard for agent stats

## Phase 5 - Launch readiness
- Security review + audits
- Parameter tuning from testnet data
- Governance launch

## Deliverables checklist
- Spec and plan finalized
- Contract prototypes with tests
- Indexer and scoring pipeline
- Dashboard metrics for lenders and agents
- Risk controls and emergency ops docs
