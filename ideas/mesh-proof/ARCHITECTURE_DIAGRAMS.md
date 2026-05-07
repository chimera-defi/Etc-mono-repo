# Architecture Diagrams

## System Context

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Buyer     │◄───────►│  Viem Mesh  │◄───────►│  Provider   │
│   Client    │  QUIC   │  (libp2p)   │  QUIC   │   Node      │
└──────┬──────┘         └─────────────┘         └──────┬──────┘
       │                                               │
       │         ┌─────────────┐                       │
       └────────►│  Base L2    │◄──────────────────────┘
                 │  Contracts  │
                 │  - Registry │
                 │  - Channels │
                 │  - Rewards  │
                 └──────┬──────┘
                        │
                 ┌──────┴──────┐
                 │  Quality    │
                 │  Oracle     │
                 │  (offchain) │
                 └─────────────┘
```

## Channel Lifecycle

```
Buyer                ViemChannels                Provider
  │                        │                        │
  │── open(jobId, amount) ─►│                        │
  │                        │◄────── claim(sig) ─────│
  │                        │                        │
  │◄── reclaim() ──────────│ (if timeout)           │
  │                        │                        │
  │                        │◄── batchClaim([]) ─────│ (hourly)
```

## Registry + Quality Flow

```
Provider           ViemRegistry           Quality Oracle
   │                      │                      │
   │── attest(hash) ─────►│                      │
   │                      │                      │
   │◄── active attestation│                      │
   │                      │                      │
   │─────────────────────────────────────────────►│── run benchmarks
   │                      │◄── updateScore() ────│
   │                      │                      │
   │◄── quality score     │                      │
```

## veVIEM Governance

```
User           ViemStaking           ViemRewards           ViemFeeDistributor
 │                  │                      │                      │
 │── lock() ──────► │                      │                      │
 │◄── veVIEM ───────│                      │                      │
 │                  │                      │                      │
 │── voteGauge() ──►│                      │                      │
 │                  │◄── epoch end ────────│                      │
 │                  │                      │                      │
 │◄── distribute() ─│                      │                      │
 │                                      ◄───│── claimFees() ──────│
 │◄── USDC ─────────────────────────────────│                      │
```

## Data Flow (Job Execution)

```
1. Buyer queries Mesh ──► gossipsub topic for model_hash
2. Mesh returns ranked providers
3. Buyer selects provider P
4. Buyer opens MicroChannel onchain
5. Buyer encrypts prompt ──► Mesh ──► Provider P
6. Provider P runs inference
7. Provider P encrypts output ──► Mesh ──► Buyer
8. Buyer signs claim
9. Provider submits claim or queues for batch
10. Weekly: Oracle updates quality scores
11. Rewards contract distributes $VIEM
```
