# Acceptance Test Matrix

## Discovery (Viem Mesh)

| Test ID | Scenario | Input | Expected Result | Priority |
|---------|----------|-------|-----------------|----------|
| A1 | Provider comes online | New provider stakes + attests + joins mesh | Discoverable within 5s | P0 |
| A2 | Buyer searches for model | `model_hash=X` with ≥1 provider | Ranked list within 2s | P0 |
| A3 | No providers for model | `model_hash=Y` with 0 providers | Empty list + helpful message | P1 |
| A4 | Provider churn | Provider disconnects mid-mesh | Removed from active list within 10s | P1 |

## Payments (Viem Channels)

| Test ID | Scenario | Input | Expected Result | Priority |
|---------|----------|-------|-----------------|----------|
| A5 | Open micro-channel | Buyer signs EIP-712 for jobId=X | Onchain channel created with correct amount + timeout | P0 |
| A6 | Claim on success | Provider submits buyer-signed claim | USDC transferred to provider; channel settled | P0 |
| A7 | Reclaim on timeout | Timeout passes without claim | Buyer can reclaim full amount | P0 |
| A8 | Batch claim | 100 jobIds with valid signatures | All settled; aggregate gas < 20% of individual | P0 |
| A9 | Replay attack | Same signature submitted twice | Second submission reverts | P0 |

## Registry (Viem Registry)

| Test ID | Scenario | Input | Expected Result | Priority |
|---------|----------|-------|-----------------|----------|
| A10 | Attest model | Provider stakes 1000 VIEM + model_hash | Attestation active onchain | P0 |
| A11 | Slash wrong model | Oracle submits proof provider served wrong hash | Stake partially slashed; attestation deactivated | P1 |
| A12 | Attestation expiry | Attestation passes expiry date | No longer discoverable | P1 |

## Quality (Viem Quality)

| Test ID | Scenario | Input | Expected Result | Priority |
|---------|----------|-------|-----------------|----------|
| A13 | Benchmark run | Weekly cron triggers | All providers scored; scores onchain within 24h | P0 |
| A14 | Score multiplier | Provider at 90th percentile | Receives 1.9x base reward | P1 |
| A15 | Oracle consensus | 3-of-5 agree on score | Score update succeeds | P0 |
| A16 | Oracle deadlock | 2-2 split (1 offline) | Score update skipped; no slashing | P1 |

## End-to-End

| Test ID | Scenario | Input | Expected Result | Priority |
|---------|----------|-------|-----------------|----------|
| A17 | Full buyer journey | Search → select → pay → prompt → output | Job completes; buyer pays; provider earns | P0 |
| A18 | Provider failover | Selected provider churns mid-job | Buyer auto-fails over to next provider within 5s | P1 |
| A19 | ve lock + vote | User locks 1000 VIEM for 1 year | veVIEM minted; can vote next epoch | P1 |
| A20 | Fee claim | veVIEM holder claims after epoch | Non-zero USDC received | P1 |
