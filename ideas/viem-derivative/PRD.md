# PRD — Viem Derivative

## Problem Statement

AntSeed proves P2P AI inference is viable, but three bottlenecks prevent 10x scale:
1. **Discovery latency** — DHT + WebRTC alone is slow for new peers behind complex NAT
2. **Payment rigidity** — one cumulative channel per session cannot express per-job pricing or partial payment on failure
3. **Quality blindness** — buyers have no onchain signal for which provider runs which model, and no objective quality score

## User Stories

### Primary: AI Inference Buyer
- **As a buyer**, I want to discover providers running a specific model version within <2s so that I can route my prompt quickly
- **As a buyer**, I want to pay per-job with partial refund on timeout/wrong output so that I do not overpay for bad inference
- **As a buyer**, I want to see a staked, attested model hash for each provider so that I know what model I am actually calling

### Primary: Inference Provider
- **As a provider**, I want to list multiple model hashes with a single stake so that I can serve diverse workloads
- **As a provider**, I want my reward rate to scale with objective quality scores, not just job count, so that good inference earns more
- **As a provider**, I want batched settlement so that I am not bleeding gas on every micro-job

### Secondary: Token Staker / DAO Participant
- **As a staker**, I want to lock $VIEM for veVIEM and vote on provider reward gauges so that I earn fee share and steer emissions
- **As a voter**, I want quality scores to be transparent and tamper-evident so that my vote reflects real provider performance

## Acceptance Criteria

### Discovery (Viem Mesh)
- Given a buyer searches for `model_hash=X`, when the mesh has ≥1 provider, then the buyer receives ranked provider list within 2s
- Given a provider comes online, when it stakes and attests a model, then it is discoverable within 5s

### Payments (Viem Channels)
- Given a job costs $0.001 USDC, when the buyer opens a micro-channel, then the provider can claim on completion or buyer can reclaim on timeout (≤15m)
- Given 100 micro-channels, when batch settlement runs, then aggregate gas is <20% of 100 individual settlements

### Registry (Viem Registry)
- Given a provider stakes 1000 $VIEM, when they attest `model_hash=X`, then the attestation is onchain and slashable if the hash is provably wrong
- Given a provider updates their model, when they publish a new hash, then old attestations expire and buyers see the new hash

### Quality (Viem Quality)
- Given deterministic benchmark jobs run weekly, when scores are computed, then top 10% providers receive ≥2x the per-job reward of bottom 50%
- Given a buyer disputes output quality, when ≥3 quality oracles agree, then the provider's quality score is adjusted and a portion of stake is slashed

## Non-Functional Requirements

### Performance
- Discovery p50 latency: <2s
- Inference handshake: <500ms after discovery
- Batch settlement gas: <20% of individual settlements at n=100

### Security
- Micro-channel replay resistance: nonces + chain-id + contract address scoped
- Registry attestation: stake ≥ cost of serving 1h of benchmark jobs
- Quality oracle: ≥3 independent oracle nodes, stake-weighted consensus

### Reliability
- Provider churn: buyer auto-fails over to next ranked provider within 5s
- Batch settlement: daily cron + manual trigger, both functional
- Registry uptime: L2 Base, so dependent on Base sequencer uptime
