# SPEC — MeshProof

## System Overview

MeshProof is a protocol stack with four layers:
1. **Viem Mesh** — P2P discovery and transport
2. **Viem Registry** — onchain model attestation and provider staking
3. **Viem Channels** — per-job micro-payment channels with batch settlement
4. **Viem Quality** — offchain quality oracle + reward distribution engine

## Architecture

```
┌─────────────────────────────────────────────┐
│           Buyer Client (TS/Viem)            │
├─────────────┬───────────────┬───────────────┤
│  Mesh SDK   │  Channel SDK  │  Registry SDK │
│ (discovery) │ (payments)    │  (attestation)│
├─────────────┴───────────────┴───────────────┤
│            Viem Quality Oracle              │
│     (benchmark jobs + buyer feedback)       │
├─────────────────────────────────────────────┤
│           Base L2 (Solidity contracts)        │
│  Registry │ Channels │ Staking │ Rewards  │
└─────────────────────────────────────────────┘
```

## Components

### 1. Viem Mesh (libp2p + QUIC)
- **Gossipsub topic:** `viem-inference-v1/<model_hash_prefix>`
- **DHT:** peer routing for fallback when gossipsub mesh is sparse
- **QUIC transport:** primary; WebRTC as fallback for browsers
- **Peer scoring:** latency + successful job count + quality score

### 2. Viem Registry (Solidity)
```solidity
struct Attestation {
    bytes32 modelHash;
    uint256 stake;
    uint256 expiresAt;
    bytes metadataURI; // ipfs://... pointing to model card
}

mapping(address provider => Attestation[]) public attestations;

function attest(bytes32 modelHash, uint256 stake, bytes calldata metadataURI) external;
function slash(address provider, uint256 attestationIndex, bytes calldata proof) external; // oracle only
```

### 3. Viem Channels (Solidity)
```solidity
struct MicroChannel {
    address buyer;
    address provider;
    uint256 amount;        // USDC wei
    uint256 timeout;       // unix timestamp
    bytes32 jobId;         // unique per job
    uint256 nonce;         // per-buyer monotonic
    bool settled;
}

function open(bytes32 jobId, address provider, uint256 amount, uint256 timeout, bytes calldata sig) external;
function claim(bytes32 jobId, bytes calldata sig) external; // provider claims with buyer sig
function reclaim(bytes32 jobId) external; // buyer reclaims after timeout

// Batch settlement
function batchClaim(bytes32[] calldata jobIds, bytes calldata sigs) external;
```

### 4. Viem Quality (offchain TS + onchain feed)
- **Benchmark jobs:** deterministic prompts with known-good outputs, run weekly by oracle nodes
- **Buyer feedback:** optional rating (1-5) stored offchain, aggregated onchain as moving average
- **Score formula:** `quality = 0.6 * benchmark_accuracy + 0.3 * buyer_rating + 0.1 * uptime`
- **Reward multiplier:** `multiplier = 1 + (quality_percentile / 100)` (1.0x to 2.0x)

## Data Flow

### Job Lifecycle
1. Buyer queries Mesh for providers running `model_hash=X`
2. Buyer selects provider, opens MicroChannel onchain
3. Buyer sends encrypted prompt via Mesh (noise cipher or TLS over QUIC)
4. Provider runs inference, returns output
5. Buyer signs `claim` if satisfied; provider submits or queues for batch
6. If timeout or bad output, buyer lets timeout expire and calls `reclaim`
7. Weekly: Quality oracle updates scores; Rewards contract distributes $VIEM

## Tech Stack

| Layer | Tech |
|-------|------|
| Discovery | libp2p (gossipsub, kad-dht, quic-go) |
| Client SDK | TypeScript + viem + @libp2p/* |
| Smart Contracts | Solidity ^0.8.20, Foundry |
| L2 | Base Mainnet |
| Payment Token | USDC (0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913) |
| Emissions Token | $VIEM ERC-20 (new) |
| Quality Oracle | Node.js + BullMQ + Redis + Postgres |
| Frontend | Next.js 15 + shadcn/ui |

## Deployment Addresses (Future)

| Contract | Network | Address |
|----------|---------|---------|
| ViemRegistry | Base | TBD |
| ViemChannels | Base | TBD |
| ViemStaking | Base | TBD |
| ViemRewards | Base | TBD |
| VIEM Token | Base | TBD |
| USDC | Base | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |

## Security Model

- **Registry slash:** only callable by Quality Oracle multisig (3-of-5)
- **Channel replay:** jobId uniqueness enforced onchain; nonces scoped to buyer+contract
- **Quality oracle bribery:** oracle nodes must stake $VIEM; slashable if consensus diverges from public benchmarks
- **Provider Sybil:** stake per attestation + mesh peer scoring makes Sybil costly
