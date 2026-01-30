# AgentRadar (AR) Protocol Spec

Version: 1.1 (Jan 2026)
Status: continuous iteration
Framework: ERC-8004 (Identity, Reputation, Validation)

## 1) Executive summary
AgentRadar is a decentralized trust-as-a-service (TaaS) and liquidity protocol that turns ERC-8004 agent performance into bankable credit. It blends Ethos-style vouching with reverse-Kelly rate mechanics to enable under-collateralized, validation-gated credit for on-chain agents.

## 2) Core integration (ERC-8004)
- Identity Registry (ERC-721): each agent is an AgentID NFT.
- Reputation Registry: aggregated feedback scores (0-100), tied to economic activity via x402 proof-of-payment.
- Validation Registry: proof of work attestations from TEEs (SGX) or zkML provers.

AgentRadar acts as the indexing and financial interface across the three registries.

## 3) Ethos vouching (social collateral)
- Vouching vaults: vouchers stake $AR to back a specific AgentID.
- First-loss capital: if the agent fails validation, vouchers are slashed and lenders compensated.
- Trust premium: 20% of agent-generated revenue is distributed to vouchers.

## 4) Reverse Kelly interest engine
Borrow rates are computed from validation success probability (P), discouraging risky agents.

Parameters:
- R_f: base risk-free rate (e.g., stETH yield).
- P: success probability from Validation Registry.
- lambda: multiplier based on utilization.

Effect: as P decreases, borrow rates increase sharply, pricing out failing agents.

## 5) Tokenomics and revenue
- Lenders: provide ETH/USDC; earn yield.
- Vouchers: stake $AR; earn trust premium; absorb first-loss slashing.
- Validators: earn micro-fees for attestations.
- Protocol: 10% interest spread + 5% of slashing events.

## 6) Credit flow (high level)
1) Agent registers AgentID (ERC-8004 Identity).
2) Voucher stakes $AR into AgentID vault.
3) Agent requests credit with validation gating.
4) Escrow releases 50% at job start, 50% after validation pass.
5) Repayments and fees flow to lenders, vouchers, validators, and protocol.

## 7) Protocol components
- AgentID (ERC-721) registry integration
- Reputation aggregator (x402-verified feedback)
- Validation interface (TEE/zkML attestations)
- AgentRadarCredit (credit + escrow)
- VouchingVault (voucher staking + slashing)
- RateEngine (reverse-Kelly)
- Treasury (protocol fees)

## 8) Risks
- Oracle and registry integrity
- Adversarial validation spoofing
- Voucher cartelization
- Liquidity evaporation during high default periods

## 9) Open questions
- Finalize exact reverse-Kelly function
- Define validation attestation schema for 8004
- Slashing and dispute resolution flow
- Minimum viable success probability thresholds
