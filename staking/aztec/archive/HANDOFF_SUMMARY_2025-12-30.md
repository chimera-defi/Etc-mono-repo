# Aztec Liquid Staking — Archive Summary 2025-12-30 (Compressed 2026-06-07)

**Date:** 2025-12-30 | **Status:** All 7 contracts complete (earlier architecture)

This was the original 7-contract architecture before simplification to 3 contracts in Jan 2026.

## Contracts (7-contract era)
liquid-staking-core (37 fn) · rewards-manager (33 fn) · vault-manager (28 fn) ·
withdrawal-queue (24 fn) · aztec-staking-pool (21 fn) · validator-registry (20 fn) ·
staked-aztec-token (13 fn) = 176 functions total

## Test Results
64/64 unit tests passing. Categories: share/deposit math, exchange rate, fees,
withdrawal timing, validator round-robin, cross-contract flows, integration, edge cases.

## Architecture (archived)
User → LiquidStakingCore → StakedAztecToken (mint/burn) + WithdrawalQueue
Keeper → VaultManager → ValidatorRegistry → LiquidStakingCore (notify_staked)

> Note: superseded by 3-contract simplification (2026-01-23). See parent HANDOFF.md.
