# Staking Pool Contract Prototype

**Created:** 2025-12-26
**Status:** Prototype (Base Noir, not yet Aztec-specific)

## Overview

Basic staking pool logic implemented in Noir. This is a prototype to validate:
1. Core staking math compiles in Noir
2. Share calculation works correctly
3. Fee logic is correct

## Current Implementation

- **calculate_shares**: Converts deposit amount to pool shares
- **calculate_withdrawal**: Converts shares back to tokens (with rewards)
- **calculate_fee**: Calculates protocol fee in basis points

## Test Results

```
[staking_pool] Running 5 test functions
[staking_pool] Testing test_fee_calculation ... ok
[staking_pool] Testing test_withdrawal_with_rewards ... ok
[staking_pool] Testing test_main ... ok
[staking_pool] Testing test_proportional_deposit ... ok
[staking_pool] Testing test_initial_deposit ... ok
[staking_pool] 5 tests passed
```

## Compilation

Requires nargo (Noir compiler):
```bash
# Install nargo
curl -L https://raw.githubusercontent.com/noir-lang/noirup/refs/heads/main/install | bash
source ~/.bashrc
noirup

# Compile
cd staking_pool
nargo compile

# Test
nargo test
```

## Next Steps (Aztec Integration)

To convert to full Aztec contract:
1. Install aztec-nargo (from Docker image or aztec-up)
2. Add `#[aztec(contract)]` macro
3. Convert functions to `#[public]` / `#[private]`
4. Add storage with `Map<AztecAddress, U128>` for balances
5. Deploy to devnet: `https://next.devnet.aztec-labs.com`

## Key Devnet Info

- **RPC URL**: `https://next.devnet.aztec-labs.com`
- **L1 Chain ID**: 11155111 (Sepolia)
- **Staking Asset**: `0x3dae418ad4dbd49e00215d24079a10ac3bc9ef4f`
- **Node Version**: 3.0.0-devnet.20251212
