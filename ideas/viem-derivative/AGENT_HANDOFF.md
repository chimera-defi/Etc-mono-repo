# Agent Handoff

## Context Summary

Viem Derivative is a fork of AntSeed protocol targeting faster-scaling P2P AI inference on Base. The idea pack lives at `ideas/viem-derivative/`. Core improvements over AntSeed: hybrid gossipsub+DHT discovery, per-job micro-channels with batch settlement, onchain model attestation registry, offchain quality oracle with stake-weighted rewards, and a veVIEM governance layer.

## Current State

- **Status:** Spec-first idea pack. No runtime code exists yet.
- **Done:** README, EXECUTIVE_SUMMARY, PRD, SPEC, ARCHITECTURE_DECISIONS, STATE_MODEL, OPEN_QUESTIONS, FIRST_60_MINUTES, DECISIONS, RISK_REGISTER, COMPETITOR_ANALYSIS
- **Not done:** Contracts, SDK, oracle, frontend
- **Blockers:** None yet (this is an idea pack)

## Key Files

| File | Purpose |
|------|---------|
| `EXECUTIVE_SUMMARY.md` | Thesis + product shape + warning |
| `PRD.md` | User stories + acceptance criteria |
| `SPEC.md` | System architecture + data flow + tech stack |
| `STATE_MODEL.md` | Onchain + offchain state + transitions |
| `ARCHITECTURE_DECISIONS.md` | ADR-001 through ADR-006 |
| `OPEN_QUESTIONS.md` | 19 open questions (technical, economic, legal, market, product) |
| `FIRST_60_MINUTES.md` | Bootstrap script for day-one development |
| `TASKS.md` | Phased build plan |

## Next Steps

1. Resolve OPEN_QUESTIONS.md Q1, Q2, Q3 before contract implementation
2. Decide tokenomics (Q6, Q7, Q8) before Rewards contract design
3. Build contracts first (Registry → Channels → Rewards), then SDK, then oracle
4. Run FIRST_60_MINUTES.md smoke test as acceptance gate

## Decision Log

- libp2p gossipsub + DHT chosen over raw WebRTC (ADR-001)
- Per-job micro-channels + batch settlement chosen over cumulative channels (ADR-002)
- Onchain model attestation registry added (ADR-003)
- Offchain quality oracle with onchain feed chosen (ADR-004)
- veVIEM vote-escrow added for gauge voting (ADR-005)
- viem chosen as EVM client library (ADR-006)

## Known Traps

- Do not implement slashing without a concrete proof mechanism (Q2)
- Do not expose channel mechanics in buyer UX unless explicitly requested (Q17)
- Do not add cross-chain or fiat ramps in MVP (explicit scope cuts)
- Do not launch without addressing legal risks R6 and R8
