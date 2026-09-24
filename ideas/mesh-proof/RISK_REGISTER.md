# Risk Register

| ID | Risk | Likelihood | Impact | Mitigation | Owner |
|----|------|------------|--------|------------|-------|
| R1 | Quality oracle collusion (nodes bribed to inflate scores) | Medium | High | Stake-weighted consensus + public benchmark data + multisig | Protocol dev |
| R2 | Provider Sybil attack (many low-quality providers with minimal stake) | Medium | Medium | Minimum stake per attestation + mesh peer scoring | Protocol dev |
| R3 | Buyer fraud (claims good output was bad to avoid payment) | Medium | Medium | Timeout reclaim only (no instant dispute); quality oracle adjusts long-term score, not per-job payment | Protocol dev |
| R4 | Smart contract exploit in Channels or Registry | Low | Critical | Foundry fuzzing + formal verification (Certora) + audit | Protocol dev |
| R5 | libp2p dependency vulnerability | Low | High | Pin versions + Snyk/Dependabot + fork fallback | SDK dev |
| R6 | Model creator legal action (redistribution violates ToS) | Medium | High | Only open-weight models for MVP; clear TOS in client | Legal / Product |
| R7 | Base sequencer downtime | Low | Medium | Channels have offchain timeout grace period; batch settlement retries | Protocol dev |
| R8 | VIEM token classified as security | Medium | High | No US marketing; utility-only framing; no profit promises | Legal |
| R9 | Discovery latency remains >2s despite gossipsub | Medium | Medium | Bootstrap relay nodes in 3 regions; fallback to direct DHT query | SDK dev |
| R10 | Benchmark job determinism impossible for generative models | High | Medium | Restrict MVP benchmarks to code/math/classification only | Quality oracle dev |

## Risk Heat Map

- **Critical (red):** R4, R6, R8
- **High (orange):** R1, R3, R9
- **Medium (yellow):** R2, R5, R7, R10
