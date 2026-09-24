# Decisions

## Naming
- **Protocol name:** MeshProof (working title). May change before launch.
- **Token ticker:** $VIEM (tentative). Check for collisions before mainnet.
- **Contract prefix:** `Viem` (e.g., `ViemRegistry`, `ViemChannels`)

## Tech Stack
- **EVM client library:** viem (not ethers.js, not web3.js)
- **P2P stack:** libp2p (not custom DHT/WebRTC)
- **L2:** Base Mainnet (follows AntSeed; consider Arbitrum or OP Stack later)
- **Payment token:** USDC (same as AntSeed)
- **Emissions token:** $VIEM ERC-20 with mintable supply controlled by Rewards contract

## Architecture
- **Micro-channels:** per-job, not per-session
- **Batch settlement:** time-triggered (hourly) with manual override
- **Quality oracle:** 3-of-5 multisig with stake-weighted node set
- **Registry attestation:** stake-based, no flat fee
- **ve lock:** minimum 1 week, maximum 2 years, no early exit (must wait)

## Scope Cuts (Explicit)
- **No cross-chain:** Base only for MVP; bridges add unacceptable trust assumptions
- **No fiat on/off ramp:** Buyers must acquire USDC externally
- **No model training:** Inference only; fine-tuning is out of scope
- **No centralized fallback:** If no P2P provider is available, job fails; no hosted backup
- **No browser provider:** Providers run headless/server only; browser WebRTC is buyer-only
