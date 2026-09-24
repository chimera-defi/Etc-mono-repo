# Source Notes

## AntSeed Protocol (Original)

- **GitHub (monorepo):** https://github.com/AntSeed/antseed
  - TS P2P SDK
  - CLI / desktop client
  - Solidity payment contracts
  - Plugin system
- **Docs:** https://antseed.com/docs
- **Payments Guide:** https://antseed.com/docs/guides/payments
- **Lightpaper:** https://antseed.com/docs/lightpaper
- **Original tweet:** https://x.com/antseedai/status/2051286974011761080

### Core Contracts (Base Mainnet, verified)
- `AntseedDeposits` (holds USDC): `0x0F7a3a8f4Da01637d1202bb5443fcF7F88F99fD2`
- `AntseedChannels` (sessions, swappable, no funds): `0xBA66d3b4fbCf472F6F11D6F9F96aaCE96516F09d`
- `AntseedStaking`: `0x3652E6B22919bd322A25723B94BB207602E5c8e6`
- `USDC`: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- `$ANTS` ERC-20 (emissions, Base): `0xa87EE81b2C0Bc659307ca2D9ffdC38514DD85263`
- `$DIEM` Proxy Pool test (Venice.ai integration, DeFi staking): `0x56E58Abb25C3298Ce11f0B6F1B9b0DA6F97e4Cb3` (Ethereum)

### Protocol Architecture
- **Discovery:** DHT + WebRTC P2P
- **Inference:** Direct encrypted connection (no central server)
- **Payments:** Cumulative EIP-712 payment channels (gasless USDC)
- **Rewards:** Activity-based $ANTS emissions
- **Governance:** No KYC, no gatekeepers

## Fork Improvements (MeshProof)

1. **Discovery:** libp2p gossipsub + DHT + QUIC replaces raw WebRTC for better NAT traversal and lower latency
2. **Payments:** Per-job micro-channels + batch settlement instead of single cumulative channel
3. **Model Registry:** Onchain attestation of model hashes with provider staking
4. **Quality Oracle:** Offchain deterministic benchmark + buyer feedback → stake-weighted reward split
5. **DeFi Layer:** veVIEM vote-escrow for provider reward gauge voting + fee share

## Open Questions from Source Material

- How does AntSeed handle provider churn mid-session? (not documented)
- What is the exact emission curve for $ANTS? (not in lightpaper)
- Is there slashing for dishonest providers? (contracts suggest no)
- How does $DIEM pool relate to $ANTS staking? (test only)
