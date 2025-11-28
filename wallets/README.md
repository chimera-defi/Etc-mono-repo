# Wallet Research

Developer-focused comparison of crypto wallets to find stable MetaMask alternatives.

## 📊 Main Comparison Table

**→ [WALLET_COMPARISON_UNIFIED.md](./WALLET_COMPARISON_UNIFIED.md)** — Single source of truth with 18 columns:

| Column | Description |
|--------|-------------|
| GitHub | Repository link |
| Last Commit | Most recent commit date |
| Active | ✅/⚠️/❌ activity status |
| Chains | Built-in chain count |
| RPC | Custom RPC support |
| Stars/Issues/Ratio | GitHub metrics |
| Rel/mo | Releases per month |
| Stability | ⭐ rating |
| Browser Ext/Mobile | Platform support |
| Tx Sim | Transaction simulation |
| EIP-4337 | Account abstraction |
| Open Source | License status |
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

| Use Case | Wallet | Chains | Custom RPC | Status |
|----------|--------|--------|------------|--------|
| Development | **Rabby** | 94 | ✅ | ✅ Active |
| Production | **Trust Wallet** | 163 | ✅ | ✅ Active |
| Production | **Rainbow** | 15+ | ⚠️ | ✅ Active |
| Enterprise | **Safe** | 30+ | ✅ | ✅ Active |
| Multi-chain | **Enkrypt** | 75+ | ✅ | ✅ Active |
| Avoid | ~~Block Wallet~~ | - | - | ❌ Inactive |
| Avoid | ~~Frame~~ | - | - | ❌ Inactive |

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
- Activity status: GitHub REST API (November 28, 2025)
- Chain counts: [Rabby API](https://api.rabby.io/v1/chain/list), [Trust registry](https://github.com/trustwallet/wallet-core/blob/master/registry.json)
- Custom RPC data: [WalletBeat](https://github.com/walletbeat/walletbeat)

See [PR #62](https://github.com/chimera-defi/ethglobal-argentina-25/pull/62) for original methodology.
