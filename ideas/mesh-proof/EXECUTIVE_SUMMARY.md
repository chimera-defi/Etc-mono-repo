# Executive Summary

## Thesis

Fork AntSeed's P2P AI inference marketplace into a faster-scaling, incentive-sharper protocol called **MeshProof**.

AntSeed proves that DHT/WebRTC discovery + encrypted direct inference + gasless USDC channels works. The fork must keep what works and aggressively improve what limits scale:
- **Discovery latency** — move from pure DHT to hybrid gossipsub + DHT with latency-weighted peer scoring
- **Payment granularity** — replace single cumulative channels with per-job micro-channels + batch settlement
- **Provider heterogeneity** — support CPU, GPU, and TPU inference providers with dynamic pricing, not flat USDC
- **Incentive alignment** — replace activity-only $ANTS rewards with a dual emissions model: activity + stake-weighted quality score
- **Model registry** — add an onchain attestation layer so buyers know what model/version they are actually calling

## Product Shape

- **Viem Mesh** — P2P discovery layer (libp2p gossipsub + DHT + QUIC) replacing raw WebRTC for NAT traversal resilience
- **Viem Channels** — per-job micro-payment channels with batched settlement, swappable channel backends (EIP-712 USDC, ERC-20 $VIEM, or native ETH wrapper)
- **Viem Registry** — onchain model attestation and version pinning; providers stake $VIEM to list a model hash
- **Viem Quality** — offchain inference-quality oracle network (derived from buyer feedback + deterministic benchmark jobs) that feeds into reward distribution
- **MeshProof Derivatives** — optional DeFi layer: lock $VIEM for veVIEM, vote on provider reward weights, earn a share of channel fees

## Why This Is Interesting

- AntSeed demonstrates real demand for uncensorable, KYC-free AI compute
- The bottleneck is not cryptography; it is discovery latency, provider heterogeneity, and honest quality signaling
- A fork that fixes these three bottlenecks can absorb the next 10x of providers and buyers without centralizing

## Core Warning

If the fork compromises on:
- **Verifiable inference** (buyers cannot prove they received the wrong output)
- **Honest quality scores** (staked providers can game the oracle)
- **Payment finality** (channels are not economically secure against double-spend)

then it recentralizes by reputation and trust, defeating the original purpose.

## Recommendation

Proceed as a spec-first fork pack. The highest-leverage improvements are (1) per-job micro-channels + batch settlement, (2) model attestation registry, and (3) quality-weighted emissions. Build in that order.
