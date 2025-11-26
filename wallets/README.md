# Wallet Research

Developer-focused comparison of WalletConnect-compatible wallets to find stable MetaMask alternatives.

## Quick Recommendations

| Use Case | Wallet | Why |
|----------|--------|-----|
| Development | **Rabby** | Transaction simulation, risk checks |
| Production | **Coinbase Wallet** | Stable API, Account Abstraction |
| Max Stability | **Block Wallet** | Only 1.7 releases/month |
| Enterprise | **Safe** | Multi-sig, EIP-4337 |
| Avoid | MetaMask | 8 releases/month, 2,496 open issues |

## Documents

| File | Description |
|------|-------------|
| [WALLET_COMPARISON_UNIFIED.md](./WALLET_COMPARISON_UNIFIED.md) | Unified comparison of 10+ wallets with verified GitHub metrics |
| [walletconnect-wallet-research.md](./walletconnect-wallet-research.md) | Original detailed research with methodology |

## Key Metrics (Verified November 2024)

| Wallet | Issues | Ratio | Releases/mo | Recommendation |
|--------|--------|-------|-------------|----------------|
| MetaMask | 2,496 | 19.3% | ~8 | 🔴 Avoid |
| Rabby | 107 | 6.2% | ~5.7 | 🟢 Development |
| Coinbase | 44 | 2.6% | - | 🟢 Production |
| Block | 45 | 46.9%* | ~1.7 | 🟢 Stability |
| Rainbow | 11 | 0.3% | ~4.3 | 🟡 NFT focus |

*Small community (96 stars), absolute count is fine.

## Source

Research from PR #62 of [chimera-defi/ethglobal-argentina-25](https://github.com/chimera-defi/ethglobal-argentina-25). Data verified via GitHub REST API.
