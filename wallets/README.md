# Wallet Research

Developer-focused comparison of crypto wallets to find stable MetaMask alternatives.

## 📊 Main Comparison Table

**→ [WALLET_COMPARISON_UNIFIED.md](./WALLET_COMPARISON_UNIFIED.md)** — Single source of truth with 19 EVM wallets

| Column | Description |
|--------|-------------|
| GitHub | Repository link |
| Last Commit | Most recent commit date |
| Active | ✅/⚠️/❌ activity status |
| Chains | Built-in chain count |
| RPC | Custom RPC support |
| Stars/Issues/Ratio | GitHub metrics |
| Stability | ⭐ rating |
| **Devices** | 📱 Mobile / 🌐 Browser / 💻 Desktop |
| **Testnets** | Custom chain / testnet support |
| **License** | ✅ FOSS / ⚠️ Source-Avail / ❌ Proprietary |
| Tx Sim | Transaction simulation |
| EIP-4337 | Account abstraction |
| Best For | Use case |
| Rec | 🟢/🟡/🔴 recommendation |

---

## ⚠️ Activity Status Alert (Nov 2025)

Several previously recommended wallets have **stopped active development**:
- ❌ **Block Wallet** — No commits since Nov 2024 (1 year!)
- ❌ **Frame** — No commits since Feb 2025
- ❌ **Argent-X** — No commits since Mar 2025
- ⚠️ **Coinbase SDK** — Slow (last commit Jul 2025)

---

## Quick Recommendations

| Use Case | Wallet | Devices | Testnets | License | Status |
|----------|--------|---------|----------|---------|--------|
| Development | **Rabby** | 📱🌐💻 | ✅ | ✅ MIT | ✅ Active |
| Production | **Trust Wallet** | 📱🌐 | ✅ | ⚠️ Partial | ✅ Active |
| Production | **Rainbow** | 📱🌐 | ✅ | ✅ GPL-3 | ✅ Active |
| Enterprise | **Safe** | 📱🌐 | ✅ | ✅ GPL-3 | ✅ Active |
| Multi-chain | **Enkrypt** | 🌐 | ✅ | ✅ MIT | ✅ Active |
| Ethereum | **MEW** | 📱🔗 | ✅ | ✅ MIT | ✅ Active |
| Smart Wallet | **Ambire** | 📱🌐 | ✅ | ✅ GPL-3 | ⚠️ Slow |
| Community | **Taho** | 🌐 | ✅ | ✅ GPL-3 | ⚠️ Slow |
| Avoid | ~~Block Wallet~~ | - | - | - | ❌ Inactive |
| Avoid | ~~Frame~~ | - | - | - | ❌ Inactive |

**Devices:** 📱 Mobile | 🌐 Browser Extension | 💻 Desktop | 🔗 Web App

---

## Documents

- **[WALLET_COMPARISON_UNIFIED.md](./WALLET_COMPARISON_UNIFIED.md)** — Complete 18-column comparison table (single source of truth)
- [walletconnect-wallet-research.md](./walletconnect-wallet-research.md) — Original detailed research

## External Resources

| Resource | URL | Focus |
|----------|-----|-------|
| **WalletBeat** | [walletbeat.fyi](https://walletbeat.fyi) | Technical features, RPC config, ENS, security |
| Ethereum.org | [ethereum.org/wallets](https://ethereum.org/en/wallets/find-wallet/) | Consumer features |
| WalletConnect | [explorer.walletconnect.com](https://explorer.walletconnect.com/) | Wallet registry |
| ChainList | [chainlist.org](https://chainlist.org) | RPC endpoints |

## Data Sources

- Original data: GitHub REST API (November 2024)
- Activity status: GitHub REST API (November 29, 2025)
- Chain counts: [Rabby API](https://api.rabby.io/v1/chain/list), [Trust registry](https://github.com/trustwallet/wallet-core/blob/master/registry.json)
- **License, devices, testnets:** [WalletBeat](https://walletbeat.fyi) (December 2025)
- Additional wallets discovered: WalletBeat registry, GitHub search

See [PR #62](https://github.com/chimera-defi/ethglobal-argentina-25/pull/62) for original methodology.
