# Crypto Wallet Comparison for Developers

> **TL;DR:** Use **Rabby** (92) for development (tx simulation + stability), **Trust** (85) or **Rainbow** (82) for production. Use **MetaMask** (68) last for compatibility only — it has ~8 releases/month which is too much churn. Only wallets with ✅ in the "Core" column have both mobile + browser extension.

**Data Sources:** GitHub REST API (Nov 2024, activity Nov 2025), [WalletBeat](https://walletbeat.fyi) (Dec 2025)

**Related:** See [Hardware Wallet Comparison](./HARDWARE_WALLET_COMPARISON_TABLE.md) for cold storage recommendations.

---

> 📖 **Want more details?** See the [full documentation with recommendations, methodology, security audits, and more](./WALLET_COMPARISON_UNIFIED_DETAILS.md).

## Complete Wallet Comparison (All 24 EVM Wallets)

| Wallet | Score | Core | Rel/Mo | RPC | GitHub | Active | Chains | Devices | Testnets | License | Audits | Funding | Tx Sim | Scam | Account | ENS/Naming | HW | Best For | Rec |
|--------|-------|------|--------|-----|--------|--------|--------|---------|----------|---------|--------|---------|--------|------|---------|------------|-----|----------|-----|
| **Rabby** | 92 | ✅ | ~6 | ✅ | [Rabby](https://github.com/RabbyHub/Rabby) | ✅ | 94 | 📱🌐💻 | ✅ | ✅ MIT | ⚠️ Mob | 🟢 DeBank | ✅ | ✅ | EOA+Safe | ⚠️ Import only | ✅ | Development | 🟢 |
| **Trust** | 85 | ✅ | ~3 | ✅ | [wallet-core](https://github.com/trustwallet/wallet-core) | ✅ | 163 | 📱🌐 | ✅ | ⚠️ Apache | ✅ 2023 | 🟢 Binance | ❌ | ⚠️ | EOA+7702 | ✅ Basic | ✅ | Multi-chain | 🟢 |
| **Rainbow** | 82 | ✅ | ~4 | ⚠️ | [rainbow](https://github.com/rainbow-me/rainbow) | ✅ | 15+ | 📱🌐 | ✅ | ✅ GPL-3 | ❓ None | 🟡 VC | ❌ | ⚠️ | EOA | ✅ Full | ✅ | NFT/Ethereum | 🟢 |
| **Brave** | 78 | ✅ | ~2 | ✅ | [brave-browser](https://github.com/brave/brave-browser) | ✅ | 10+ | 📱🌐§ | ✅ | ✅ MPL-2 | 🐛 H1 | 🟢 Brave | ❌ | ⚠️ | EOA | ❌ None | ✅ | Brave users | 🟢 |
| **Coinbase** | 75 | ✅ | ~2 | ✅ | [coinbase-wallet-sdk](https://github.com/coinbase/coinbase-wallet-sdk) | ⚠️ | 20+ | 📱🌐 | ✅ | ⚠️ Partial | ❓ Priv | 🟢 Coinbase | ✅ | ✅ | EOA+4337 | ✅ Full+cb.id | ✅ | AA/Production | 🟢 |
| **MetaMask** | 68 | ✅ | ~8 | ✅ | [metamask-extension](https://github.com/MetaMask/metamask-extension) | ✅ | Any | 📱🌐 | ✅ | ⚠️ Src-Avail | ✅ 2025 | 🟢 Consensys | ⚠️ | ⚠️ | EOA+7702 | ✅ Full | ✅ | Compatibility | 🟡 |
| **Phantom** | 65 | ✅ | ? | ✅ | Private | 🔒 | 5 | 📱🌐 | ❌ | ❌ Prop | ❓ Priv | 🟢 VC $109M | ✅ | ✅ | EOA | ❌ None | ⚠️ | Solana-first | 🟡 |
| **OKX** | 62 | ✅ | ? | ✅ | Private | 🔒 | 100+ | 📱🌐 | ✅ | ❌ Prop | ❓ Priv | 🟢 OKX | ⚠️ | ⚠️ | EOA+7702 | ❌ None | ✅ | EIP-7702 | 🟡 |
| **Safe** | 58 | ❌ | ~3 | ✅ | [safe-wallet-monorepo](https://github.com/safe-global/safe-wallet-monorepo) | ✅ | 30+ | 🔗† | ✅ | ✅ GPL-3 | ✅ Certora | 🟢 Grants | ✅ | ✅ | Safe+4337 | ✅ Full | ✅ | Treasury/DAO | 🟡 |
| **Enkrypt** | 55 | ❌ | ~2 | ✅ | [enKrypt](https://github.com/enkryptcom/enKrypt) | ✅ | 75+ | 🌐 | ✅ | ✅ MIT | ❓ None | 🟢 MEW | ❌ | ⚠️ | EOA | ✅ Basic | ✅ | Multi-chain ext | 🟡 |
| **Ambire** | 55 | ❌ | ~2 | ✅ | [extension](https://github.com/AmbireTech/extension) | ⚠️ | EVM | 🌐 | ✅ | ✅ GPL-3 | ✅ 2025 | 🟡 VC | ✅ | ✅ | 7702+4337 | ✅ Basic | ✅ | Smart wallet | 🟡 |
| **Wigwam** | 52 | ✅ | ~2 | ✅ | [wigwam](https://github.com/wigwamapp/wigwam) | ⚠️ | Any | 📱🌐 | ✅ | ✅ MIT | ❓ None | 🔴 Unknown | ❌ | ⚠️ | EOA | ❌ None | ✅ | Stability | 🟡 |
| **Ledger Live** | 50 | ❌ | ~4 | ✅ | [ledger-live](https://github.com/LedgerHQ/ledger-live) | ✅ | 50+ | 📱💻 | ✅ | ✅ MIT | ✅ Ledger | 🟢 Ledger | ❌ | ⚠️ | EOA | ❌ None | ✅‡ | Hardware users | 🟡 |
| **MEW** | 50 | ❌ | ~3 | ✅ | [MyEtherWallet](https://github.com/MyEtherWallet/MyEtherWallet) | ✅ | ETH+ | 📱🔗 | ✅ | ✅ MIT | ❓ None | 🟢 Self | ❌ | ⚠️ | EOA | ✅ Full | ✅ | Ethereum | 🟡 |
| **Sequence** | 48 | ❌ | ~3 | ✅ | [sequence.js](https://github.com/0xsequence/sequence.js) | ✅ | EVM | 🔗 | ✅ | ✅ Apache | ✅ 2024 | 🟡 VC | ⚠️ | ⚠️ | 4337 | ❌ None | ❌ | Gaming/Embed | 🟡 |
| **Daimo** | 45 | ❌ | ~2 | ❌ | [daimo](https://github.com/daimo-eth/daimo) | ✅ | 4 | 📱 | ❌ | ✅ GPL-3 | ✅ 2023 | 🟡 VC | ❌ | ⚠️ | 4337 | ✅ Basic | ❌ | Payments | 🟡 |
| **Zerion** | 45 | ✅ | ? | ✅ | Private | 🔒 | 50+ | 📱🌐 | ✅ | ❌ Prop | ❓ Priv | 🟡 VC | ❌ | ⚠️ | EOA | ✅ Basic | ✅ | Portfolio | ⚪ |
| **Uniswap** | 42 | ❌ | ~5 | ⚠️ | [interface](https://github.com/Uniswap/interface) | ✅ | 20+ | 📱🔗 | ✅ | ✅ GPL-3 | ❓ None | 🟢 Uniswap | ❌ | ⚠️ | EOA | ❌ None | ❌ | DeFi/Swaps | 🟡 |
| **Taho** | 40 | ❌ | ~1 | ✅ | [extension](https://github.com/tahowallet/extension) | ⚠️ | EVM | 🌐 | ✅ | ✅ GPL-3 | ❓ None | 🔴 Grants | ❌ | ⚠️ | EOA | ❌ None | ✅ | Community | 🟡 |
| **imToken** | 38 | ❌ | ~1 | ✅ | [token-core](https://github.com/consenlabs/token-core-monorepo) | ❌ | 50+ | 📱 | ✅ | ⚠️ Apache | ⚠️ 2018 | 🟡 VC | ❌ | ⚠️ | EOA | ✅ Basic | ⚠️ | Multi-chain | 🔴 |
| **1inch** | 35 | ❌ | ? | ⚠️ | Private | 🔒 | 12 | 📱 | ✅ | ❌ Prop | ❓ Priv | 🟢 Token | ❌ | ⚠️ | EOA | ❌ None | ❌ | DeFi | ⚪ |
| **Frame** | 32 | ❌ | ~1 | ✅ | [frame](https://github.com/floating/frame) | ❌ | Any | 💻 | ✅ | ✅ GPL-3 | ❓ None | 🔴 Donate | ✅ | ⚠️ | EOA | ❌ None | ✅ | ~~Desktop~~ | 🔴 |
| **Argent** | 30 | ⚠️ | ~1 | ✅ | [argent-x](https://github.com/argentlabs/argent-x) | ❌ | 2 | 📱🌐⁂ | ✅ | ✅ GPL-3 | ❓ None | 🔴 VC | ❌ | ⚠️ | 4337 | ❌ None | ✅ | ~~Starknet~~ | 🔴 |
| **Block** | 25 | ✅ | ~2 | ✅ | [extension](https://github.com/block-wallet/extension) | ❌ | 20+ | 📱🌐 | ✅ | ✅ MIT | ❓ None | 🔴 Unknown | ❌ | ⚠️ | EOA | ❌ None | ✅ | ~~Stability~~ | 🔴 |

**Quick Reference:**
- **Score:** 0-100 (see [Scoring Methodology](./WALLET_COMPARISON_UNIFIED_DETAILS.md#-wallet-scores-weighted-methodology)) | **Core:** ✅ Both mobile+ext | **Rel/Mo:** Releases/month (lower = stable)
- **Devices:** 📱 Mobile | 🌐 Browser Extension | 💻 Desktop | 🔗 Web App
- **Status:** ✅ Active | ⚠️ Slow | ❌ Inactive | 🔒 Private
- **Rec:** 🟢 Recommended | 🟡 Situational | 🔴 Avoid | ⚪ Not for dev

**Detailed Legend:** See [Column Definitions](./WALLET_COMPARISON_UNIFIED_DETAILS.md#column-definitions) in the full documentation.

**⚠️ Core Criteria:** Wallets need BOTH mobile app AND browser extension. Wallets marked ❌ in "Core" column don't meet this requirement.

### GitHub Metrics (Stars, Issues, Code Quality)

| Wallet | Last Commit | Stars | Issues | Ratio | Stability |
|--------|-------------|-------|--------|-------|-----------|
| **Rabby** | Nov 21, 2025 | 1,726 | 120 | 7.0% | ⭐⭐⭐⭐ |
| **Trust** | Nov 27, 2025 | 3,354 | 69 | 2.1% | ⭐⭐⭐ |
| **Rainbow** | Nov 26, 2025 | 4,238 | 13 | 0.3% | ⭐⭐⭐ |
| **Brave** | Nov 28, 2025 | 20,764 | 9,997 | 48.1% | ⭐⭐⭐⭐ |
| **Coinbase** | Jul 11, 2025 | 1,695 | 44 | 2.6% | ⭐⭐⭐⭐ |
| **MetaMask** | Nov 27, 2025 | 12,949 | 2,509 | 19.4% | ⭐⭐ |
| **Phantom** | Private | - | - | - | ⭐⭐⭐ |
| **OKX** | Private | - | - | - | ⭐⭐⭐⭐ |
| **Safe** | Nov 27, 2025 | 524 | 114 | 21.8% | ⭐⭐⭐⭐ |
| **Enkrypt** | Nov 27, 2025 | 411 | 21 | 5.1% | ⭐⭐⭐⭐ |
| **Ambire** | Aug 12, 2025 | 213 | 2 | 0.9% | ⭐⭐⭐⭐ |
| **Wigwam** | Sep 11, 2025 | 83 | 7 | 8.4% | ⭐⭐⭐⭐ |
| **Ledger Live** | Nov 27, 2025 | 1,200+ | 150+ | ~12% | ⭐⭐⭐⭐ |
| **MEW** | Nov 27, 2025 | 1,560 | 47 | 3.0% | ⭐⭐⭐⭐ |
| **Sequence** | Nov 27, 2025 | 400+ | 20+ | ~5% | ⭐⭐⭐⭐ |
| **Daimo** | Nov 27, 2025 | 300+ | 15+ | ~5% | ⭐⭐⭐⭐ |
| **Zerion** | Private | - | - | - | ⭐⭐⭐ |
| **Uniswap** | Nov 27, 2025 | 4,800+ | 200+ | ~4% | ⭐⭐⭐ |
| **Taho** | Oct 30, 2025 | 3,179 | 338 | 10.6% | ⭐⭐⭐ |
| **imToken** | May 2025 | 800+ | 50+ | ~6% | ⭐⭐⭐ |
| **1inch** | Private | - | - | - | ⭐⭐⭐ |
| **Frame** | Feb 01, 2025 | 1,160 | 95 | 8.2% | ⭐⭐⭐⭐ |
| **Argent** | Mar 14, 2025 | 641 | 93 | 14.5% | ⭐⭐⭐⭐ |
| **Block** | Nov 27, 2024 | 96 | 45 | 46.9% | ⭐⭐⭐⭐ |

**GitHub Legend:**
- **Ratio:** Issues ÷ Stars (lower = better code quality). Rainbow 0.3% is excellent, MetaMask 19.4% indicates maintenance burden.
- **Stability:** ⭐⭐ = High churn (>6 rel/mo) | ⭐⭐⭐ = Medium | ⭐⭐⭐⭐ = Stable (<3 rel/mo)
- **Private:** Closed-source repos have no public metrics

**Data Sources:** GitHub REST API (verified Nov 2025), [WalletBeat](https://walletbeat.fyi) (Dec 2025)

---

> 📖 **View full documentation:** [Recommendations, Methodology, Security Audits, EIP Support, and more →](./WALLET_COMPARISON_UNIFIED_DETAILS.md)
