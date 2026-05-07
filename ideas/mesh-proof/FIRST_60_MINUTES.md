# First 60 Minutes

## Minute 0-10: Clone & Install
```bash
git clone https://github.com/AntSeed/antseed antseed-reference
cd mesh-proof
bun install  # or: npm install
```

Verify:
- [ ] `node --version` ≥ 20
- [ ] `forge --version` installed (Foundry)
- [ ] `git config core.hooksPath .githooks` (if in this repo)

## Minute 10-25: Scaffold Contracts
```bash
cd contracts
forge init --force
```

Create:
- `src/ViemRegistry.sol` — stub with `attest()` and `slash()`
- `src/ViemChannels.sol` — stub with `open()`, `claim()`, `reclaim()`, `batchClaim()`
- `src/ViemRewards.sol` — stub with `updateScore()` and `distribute()`

Verify:
- [ ] `forge build` passes
- [ ] `forge test` runs (empty suite passes)

## Minute 25-40: Scaffold SDK
```bash
cd ../sdk
bun init
bun add viem @libp2p/kad-dht @libp2p/gossipsub @libp2p/quic @chainsafe/libp2p-noise
```

Create:
- `src/mesh.ts` — libp2p node bootstrap + topic join
- `src/channels.ts` — viem client + EIP-712 signing for micro-channels
- `src/registry.ts` — viem read/write for attestations

Verify:
- [ ] `bun run build` passes
- [ ] `bun test` runs (empty suite passes)

## Minute 40-50: Scaffold Oracle
```bash
cd ../oracle
bun init
bun add bullmq ioredis postgres
```

Create:
- `src/scheduler.ts` — BullMQ cron for weekly benchmark runs
- `src/benchmark.ts` — stub prompt runner (returns mock accuracy)
- `src/score-aggregator.ts` — reads benchmark + ratings, writes composite score

Verify:
- [ ] `bun run build` passes
- [ ] Redis + Postgres connection stubs work

## Minute 50-60: End-to-End Smoke Test
1. Start local Anvil node:
   ```bash
   anvil --fork-url https://mainnet.base.org
   ```
2. Deploy contract stubs:
   ```bash
   cd contracts && forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
   ```
3. Run SDK unit test: open a micro-channel on local fork
4. Verify channel state is readable via `cast call`

Done when:
- [ ] Contracts deploy without revert
- [ ] SDK can open a micro-channel on local Anvil
- [ ] `forge test` + `bun test` both pass
- [ ] All changes committed with `[Agent: <model>]` attribution
