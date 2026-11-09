# Architecture Decisions

## ADR-001: libp2p gossipsub + DHT instead of raw WebRTC

**Context:** AntSeed uses DHT + WebRTC. NAT traversal failure rate is high for corporate/firewalled buyers.

**Decision:** Use libp2p with gossipsub for topic-based provider discovery, kad-dht for peer routing, and QUIC as primary transport (WebRTC fallback).

**Consequences:**
- (+) Better NAT traversal via QUIC + relay nodes
- (+) Gossipsub gives sub-second mesh formation for hot topics
- (-) Heavier dependency tree (libp2p modules)
- (-) Requires bootstrap relay nodes (can be community-run)

## ADR-002: Per-job micro-channels + batch settlement

**Context:** AntSeed uses a single cumulative EIP-712 channel per session. This cannot express per-job pricing or partial refund on failure.

**Decision:** Each job gets a micro-channel (EIP-712 typed data). Providers queue signatures and submit `batchClaim()` once per hour or once gas is economical.

**Consequences:**
- (+) Buyer pays exactly per job; can reclaim on failure
- (+) Batch settlement amortizes gas across many jobs
- (-) More onchain state (one MicroChannel struct per job)
- (-) Requires offchain queue infrastructure

## ADR-003: Onchain model attestation registry

**Context:** AntSeed has no onchain signal for which model a provider runs. Buyers trust the provider's self-report.

**Decision:** Providers stake $VIEM to attest a `model_hash` + `metadataURI`. Attestations are slashable if the provider serves a different model.

**Consequences:**
- (+) Buyers can verify model identity onchain
- (+) Sybil resistance via stake
- (-) Slashing requires an objective proof mechanism (benchmark jobs)
- (-) Model updates require re-attestation

## ADR-004: Offchain quality oracle with onchain feed

**Context:** Pure onchain quality measurement is impossible (inference output is offchain).

**Decision:** Run deterministic benchmark jobs offchain weekly. Aggregate buyer feedback offchain. Post a single `quality_score` update onchain per provider per epoch.

**Consequences:**
- (+) Objective, reproducible quality measurement
- (+) Minimal onchain gas (one update per provider per week)
- (-) Requires trusted oracle nodes (mitigated by staking + multisig)
- (-) Delay between quality change and reward adjustment (≤1 week)

## ADR-005: veVIEM vote-escrow for reward gauge voting

**Context:** Activity-only emissions ($ANTS) incentivizes volume over quality.

**Decision:** Add a ve-style lock: lock $VIEM for 1 week to 2 years. veVIEM holders vote on provider reward gauges. Voters earn a share of channel fees.

**Consequences:**
- (+) Long-term aligned incentives
- (+) Governance participates in fee revenue
- (-) Added contract complexity (gauge controller + fee distributor)
- (-) Smaller token float early in protocol life

## ADR-006: TypeScript SDK built on viem

**Context:** AntSeed uses a custom TS SDK. Viem is now the standard for Base/EVM TypeScript interaction.

**Decision:** Build the client SDK on `viem` + `@libp2p/*` for all onchain and P2P operations.

**Consequences:**
- (+) Familiar API for Base/EVM developers
- (+) Strong typing for contract ABIs
- (-) New dependency; must stay current with viem releases
