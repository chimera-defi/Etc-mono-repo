# Tasks

## Phase 1: Contracts (Weeks 1-3)

- [ ] 1.1 Scaffold Foundry project + CI
  - Done: `forge build` and `forge test` pass in CI

- [ ] 1.2 ViemRegistry.sol
  - Done: `attest()`, `slash()`, `deactivate()` implemented and fuzz-tested
  - Depends: slashing proof format (Q2)

- [ ] 1.3 ViemChannels.sol
  - Done: `open()`, `claim()`, `reclaim()`, `batchClaim()` implemented
  - Done: Replay protection verified by fuzz test
  - Done: Gas snapshot for batchClaim at n=1, 10, 100, 1000

- [ ] 1.4 ViemRewards.sol
  - Done: `updateScore()`, `distribute()`, `lock()`, `voteGauge()` implemented
  - Depends: tokenomics spreadsheet (Q6)

- [ ] 1.5 VIEM ERC-20
  - Done: Mintable by Rewards contract only; no premint beyond initial allocation

- [ ] 1.6 Base Sepolia deployment script
  - Done: `Deploy.s.sol` deploys all contracts in correct dependency order

## Phase 2: SDK (Weeks 3-5)

- [ ] 2.1 Mesh SDK
  - Done: libp2p node bootstrap + gossipsub join + peer ranking
  - Done: Discovery latency benchmark: p50 < 2s

- [ ] 2.2 Channel SDK
  - Done: EIP-712 signing + viem contract writes
  - Done: Batch queue + auto-submission

- [ ] 2.3 Registry SDK
  - Done: Read attestations + write attestation with stake

- [ ] 2.4 End-to-end test
  - Done: Buyer → discovery → channel → prompt → output → claim flow passes on Sepolia

## Phase 3: Quality Oracle (Weeks 5-7)

- [ ] 3.1 Oracle infrastructure
  - Done: Postgres schema + BullMQ queues + Redis
  - Done: 3-of-5 multisig configuration

- [ ] 3.2 Benchmark runner
  - Done: Deterministic prompt execution for 5 models
  - Done: Output hash comparison + accuracy score

- [ ] 3.3 Score aggregator
  - Done: Weekly cron aggregates benchmarks + buyer ratings
  - Done: Composite score formula implemented

- [ ] 3.4 Onchain feed
  - Done: Multisig submits `updateScore()` successfully

## Phase 4: Frontend (Weeks 6-8)

- [ ] 4.1 Discovery page
  - Done: Search, filter, provider grid, latency sparklines

- [ ] 4.2 Job console
  - Done: Prompt input, provider card, channel stepper, output viewer

- [ ] 4.3 Provider dashboard
  - Done: Earnings, jobs, quality history, attestations, batch queue

- [ ] 4.4 Governance page
  - Done: Lock UI, gauge voting, fee claim

- [ ] 4.5 Mobile responsiveness
  - Done: Job console usable on iPhone SE

## Phase 5: Testnet Hardening (Weeks 8-10)

- [ ] 5.1 Base Sepolia load test
  - Done: 1000 inference jobs in 24h

- [ ] 5.2 Security audit
  - Done: External audit report with no critical/high findings

- [ ] 5.3 Bug bounty
  - Done: Immunefi program live

- [ ] 5.4 Legal opinion
  - Done: Written opinion on R6 and R8

## Phase 6: Mainnet Launch (Week 11+)

- [ ] 6.1 Mainnet deployment
  - Done: All contracts deployed; ownership transferred to multisig

- [ ] 6.2 Provider recruitment
  - Done: ≥10 providers staked and serving

- [ ] 6.3 Community launch
  - Done: Announcement + documentation site live
