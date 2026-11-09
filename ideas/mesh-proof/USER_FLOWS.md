# User Flows

## Flow 1: Buyer Onboarding + First Inference Job

1. Buyer installs `mesh-proof` CLI or opens web app
2. App generates ephemeral wallet or connects existing wallet (viem + RainbowKit)
3. Buyer searches for model (e.g., "Llama-3.1-70B") or pastes a `model_hash`
4. App queries Viem Mesh and returns ranked provider list (latency, quality score, price)
5. Buyer selects provider, reviews attestation onchain (model hash, stake, metadataURI)
6. Buyer opens micro-channel (approves USDC, signs EIP-712, onchain tx)
7. Buyer types prompt; app encrypts and sends via QUIC
8. Provider runs inference; encrypted response streams back
9. Buyer reviews output; signs `claim` if satisfied
10. Provider submits claim immediately or queues for batch
11. App shows job history + cost breakdown

## Flow 2: Provider Onboarding

1. Provider downloads `viem-provider` Docker image or npm package
2. Provider imports or generates wallet
3. Provider selects model weights (open-weight only) and computes `model_hash`
4. Provider stakes $VIEM and calls `attest(model_hash, stake, metadataURI)`
5. Provider node joins gossipsub topic for that model hash
6. Provider node accepts encrypted prompts, runs inference, returns output
7. Provider node automatically queues `claim` signatures and submits batch hourly
8. Provider dashboard shows: jobs served, earnings, quality score, rank

## Flow 3: Quality Oracle Operation

1. Oracle node set (3-of-5 multisig) spins up independent infrastructure
2. Weekly cron triggers benchmark job run
3. Each oracle sends identical deterministic prompts to all providers for a given model
4. Oracle nodes independently score outputs against known-good hashes
5. Oracle nodes aggregate buyer ratings from past epoch
6. Oracle multisig calls `updateScore(provider, newScore)` for each provider
7. Score updates are public; anyone can verify benchmark prompts and expected outputs

## Flow 4: veVIEM Governance

1. User acquires $VIEM
2. User calls `lock(amount, duration)` on ViemStaking (1 week to 2 years)
3. User receives veVIEM proportional to amount * duration
4. User visits gauge voting page
5. User allocates veVIEM across provider gauges (or "all providers" meta-gauge)
6. Next epoch rewards are distributed according to gauge weights
7. User claims fee share from ViemFeeDistributor
8. User can increase lock duration or amount; cannot early exit

## Flow 5: Dispute / Slashing

1. Buyer suspects provider served wrong model (output quality is far below expectation)
2. Buyer submits evidence to quality oracle (job_id, output hash, expected model_hash)
3. Oracle nodes independently verify by re-running the same prompt on the attested model
4. If ≥3 oracles agree provider was wrong, multisig calls `slash(provider, attestationIndex, proof)`
5. Provider stake is partially burned and partially sent to buyer as bounty
6. Provider attestation is deactivated; provider must re-attest with new stake

## Failure Paths

- **No providers online:** App shows "No providers for this model. Try later or run a local provider."
- **Channel timeout:** Buyer auto-reclaims USDC after timeout; provider gets nothing
- **Provider churn mid-job:** Mesh detects disconnect; buyer auto-fails over to next ranked provider
- **Oracle deadlocked (2-2 split):** Score update skipped for that provider that epoch; no slashing occurs
- **Buyer out of USDC:** App prompts to acquire USDC; job cannot proceed
