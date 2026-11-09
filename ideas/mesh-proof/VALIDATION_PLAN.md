# Validation Plan

## Pre-Build Validation

Before writing a single line of contract code, validate:

1. **AntSeed contract review:** Read AntSeedDeposits, AntseedChannels, AntseedStaking on BaseScan. Verify the exact storage layout and event signatures we will fork or replace.
2. **libp2p feasibility:** Run a 2-node gossipsub test in a local network with one node behind NAT. Confirm message latency < 500ms.
3. **Benchmark determinism test:** Pick 5 open-weight models (e.g., Llama-3.1-8B, Qwen2.5-7B, Mistral-7B). Run identical prompts 10 times each. Confirm output hash consistency ≥ 8/10 for code/math prompts.
4. **Tokenomics sanity check:** Model emissions + fee split in a spreadsheet. Ensure provider APY is competitive with centralized API margins at year 1 and year 3.

## Build Validation (Per Phase)

### Phase 1: Contracts
- [ ] Foundry fuzz tests for channel open/claim/reclaim invariants
- [ ] Slashing proof format agreed upon by 2 independent reviewers
- [ ] Gas snapshot for batchClaim at n=1, 10, 100, 1000

### Phase 2: SDK
- [ ] Discovery latency benchmark: 100 searches, p50 and p99
- [ ] End-to-end encrypted prompt test with wireshark/tcpdump capture confirming no plaintext
- [ ] Channel EIP-712 signature verifyable onchain via cast call

### Phase 3: Oracle
- [ ] Benchmark job runs for 10 providers; scores computed independently by 2 oracle nodes; results match
- [ ] Buyer rating ingestion: 1000 ratings processed in < 10 seconds
- [ ] Score update gas cost: < 50k gas per provider per epoch

### Phase 4: Frontend
- [ ] Lighthouse performance score ≥ 90
- [ ] Discovery page loads ranked providers within 3s on 3G
- [ ] Mobile job console usable on iPhone SE form factor

## Post-Build Validation

1. **Testnet deployment:** Deploy all contracts to Base Sepolia. Run 100 real inference jobs via SDK.
2. **Economic audit:** Hire external tokenomics reviewer to validate emissions curve and fee split.
3. **Legal review:** Opinion letter on VIEM token classification and provider liability.
4. **Bug bounty:** Open Immunefi program with $50k TVL-matched rewards before mainnet.

## Success Criteria

- Discovery p50 latency < 2s (validated by benchmark)
- BatchClaim gas at n=100 < 20% of individual claims (validated by gas snapshot)
- Benchmark determinism ≥ 80% for code/math (validated by test)
- No critical or high-severity findings from contract audit (validated by audit report)
