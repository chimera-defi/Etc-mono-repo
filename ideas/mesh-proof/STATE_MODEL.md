# State Model

## Onchain State

### ViemRegistry
```solidity
mapping(address => Attestation[]) public providerAttestations;
mapping(bytes32 modelHash => address[]) public providersByModel;
mapping(address => uint256) public totalStaked;

struct Attestation {
    bytes32 modelHash;
    uint256 stake;
    uint256 createdAt;
    uint256 expiresAt;
    bytes metadataURI;
    bool active;
}
```

### ViemChannels
```solidity
mapping(bytes32 jobId => MicroChannel) public channels;
mapping(address buyer => uint256) public buyerNonce;

struct MicroChannel {
    address buyer;
    address provider;
    uint256 amount;
    uint256 timeout;
    uint256 nonce;
    bool settled;
}
```

### ViemStaking / Rewards
```solidity
mapping(address provider => uint256) public qualityScore; // 0-10000 (basis points)
mapping(address provider => uint256) public lastRewardEpoch;
mapping(address => uint256) public veBalance;
mapping(address => uint256) public veUnlockTime;

uint256 public constant EPOCH_LENGTH = 7 days;
uint256 public totalVeSupply;
```

## Offchain State

### Quality Oracle (Postgres)
```sql
CREATE TABLE benchmark_runs (
    id SERIAL PRIMARY KEY,
    provider_address TEXT NOT NULL,
    model_hash BYTEA NOT NULL,
    prompt_id TEXT NOT NULL,
    output_hash BYTEA NOT NULL,
    expected_hash BYTEA NOT NULL,
    accuracy FLOAT NOT NULL,
    ran_at TIMESTAMP NOT NULL
);

CREATE TABLE buyer_ratings (
    id SERIAL PRIMARY KEY,
    job_id BYTEA NOT NULL,
    provider_address TEXT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE provider_scores (
    provider_address TEXT PRIMARY KEY,
    benchmark_accuracy FLOAT,
    avg_buyer_rating FLOAT,
    uptime FLOAT,
    composite_score FLOAT,
    updated_at TIMESTAMP NOT NULL
);
```

### Mesh Peer Store (LevelDB / libp2p peer store)
- PeerId → multiaddrs
- PeerId → supported model hashes
- PeerId → latency history (circular buffer, last 100 samples)
- PeerId → successful job count / failed job count

## State Transitions

### Provider Onboarding
1. `approve(ViemRegistry, stakeAmount)`
2. `ViemRegistry.attest(modelHash, stakeAmount, metadataURI)`
3. Provider joins gossipsub topic `viem-inference-v1/<modelHashPrefix>`
4. Offchain: mesh peer store updated with model hash + latency baseline

### Job Execution
1. Buyer: `ViemChannels.open(jobId, provider, amount, timeout, sig)`
2. Offchain: encrypted prompt sent via QUIC
3. Offchain: provider runs inference, returns output
4. Buyer signs `claim` message (EIP-712)
5. Provider submits `claim` immediately or queues for batch
6. Onchain: `channels[jobId].settled = true`

### Timeout / Reclaim
1. If `block.timestamp > channels[jobId].timeout` and `!settled`
2. Buyer calls `reclaim(jobId)`
3. Onchain: USDC returned to buyer; channel marked settled

### Weekly Quality Update
1. Oracle runs benchmark jobs across all providers
2. Oracle aggregates buyer ratings from past epoch
3. Oracle computes composite score
4. Oracle multisig calls `ViemRewards.updateScore(provider, newScore)`
5. Rewards contract updates `qualityScore[provider]`

### Reward Distribution
1. At epoch boundary, `ViemRewards.distribute()`
2. For each provider: `reward = baseReward * qualityMultiplier * veGaugeVotes`
3. Mint/transfer $VIEM to provider
4. Distribute channel fee share to veVIEM holders
