# Crypto Wallet Comparison for Developers

> **TL;DR:** Use **Rabby** for development (transaction simulation), **Trust Wallet** for production (163 chains, active), and **MetaMask** only for compatibility testing.

**Data Source:** GitHub REST API (Nov 2024, activity updated Nov 28, 2025)

---

## ⚠️ Inactive Wallets (Nov 2025)

| Wallet | Last Commit | Note |
|--------|-------------|------|
| **Block Wallet** | Nov 2024 | ❌ 1 year inactive |
| **Frame** | Feb 2025 | ❌ 10 months inactive |
| **Argent-X** | Mar 2025 | ❌ 8 months inactive |
| **Coinbase SDK** | Jul 2025 | ⚠️ 4 months slow |

---

## Complete Wallet Comparison

| Wallet | GitHub | Last Commit | Chains | Custom RPC | Stars | Issues | Rec |
|--------|--------|-------------|--------|------------|-------|--------|-----|
| **Rabby** | [RabbyHub/Rabby](https://github.com/RabbyHub/Rabby) | Nov 21, 2025 | 94 | ✅ | 1,726 | 120 | 🟢 |
| **Trust** | [trustwallet/wallet-core](https://github.com/trustwallet/wallet-core) | Nov 27, 2025 | 163 | ✅ | 3,354 | 69 | 🟢 |
| **Rainbow** | [rainbow-me/rainbow](https://github.com/rainbow-me/rainbow) | Nov 26, 2025 | 15+ | ⚠️ | 4,238 | 13 | 🟢 |
| **Safe** | [safe-global/safe-wallet-monorepo](https://github.com/safe-global/safe-wallet-monorepo) | Nov 27, 2025 | 30+ | ✅ | 524 | 114 | 🟢 |
| **Enkrypt** | [enkryptcom/enKrypt](https://github.com/enkryptcom/enKrypt) | Nov 27, 2025 | 75+ | ✅ | 411 | 21 | 🟢 |
| **Brave** | [brave/brave-browser](https://github.com/brave/brave-browser) | Nov 28, 2025 | 10+ | ✅ | 20,764 | 9,997 | 🟢 |
| **MetaMask** | [MetaMask/metamask-extension](https://github.com/MetaMask/metamask-extension) | Nov 27, 2025 | Any | ✅ | 12,949 | 2,509 | 🟡 |
| **Coinbase** | [coinbase/coinbase-wallet-sdk](https://github.com/coinbase/coinbase-wallet-sdk) | Jul 11, 2025 | 20+ | ⚠️ | 1,695 | 44 | 🟡 |
| **Wigwam** | [wigwamapp/wigwam](https://github.com/wigwamapp/wigwam) | Sep 11, 2025 | Any | ✅ | 83 | 7 | 🟡 |
| **OKX** | Private | - | 100+ | ✅ | - | - | 🟡 |
| **Phantom** | Private | - | 5 | ❌ | - | - | 🟡 |
| **Block** | [block-wallet/extension](https://github.com/block-wallet/extension) | Nov 2024 | 20 | ✅ | 96 | 45 | 🔴 |
| **Frame** | [floating/frame](https://github.com/floating/frame) | Feb 2025 | Any | ✅ | 1,160 | 95 | 🔴 |
| **Argent** | [argentlabs/argent-x](https://github.com/argentlabs/argent-x) | Mar 2025 | 2 | ❌ | 641 | 93 | 🔴 |
| **Zerion** | Private | - | ? | ? | - | - | ⚪ |
| **1inch** | Private | - | ? | ? | - | - | ⚪ |

**Legend:** 🟢 Recommended | 🟡 Situational | 🔴 Avoid (inactive) | ⚪ Not for dev  
**Chains:** Built-in chain count (all support custom chains except noted)  
**Custom RPC:** ✅ Full | ⚠️ Limited | ❌ None

---

## Quick Recommendations

| Use Case | Wallet | Why |
|----------|--------|-----|
| Development | **Rabby** | Transaction simulation, 94 chains |
| Production | **Trust Wallet** | 163 chains, very active |
| Enterprise | **Safe** | Multi-sig, EIP-4337 |
| Multi-ecosystem | **Enkrypt** | EVM + Polkadot (75+ chains) |
| Compatibility | **MetaMask** | Most widely supported |

---

## Resources

| Resource | URL | Focus |
|----------|-----|-------|
| **WalletBeat** | [walletbeat.fyi](https://walletbeat.fyi) ([GitHub](https://github.com/walletbeat/walletbeat)) | RPC config, ENS, security features |
| Ethereum.org | [ethereum.org/wallets](https://ethereum.org/en/wallets/find-wallet/) | Consumer features |
| WalletConnect | [explorer.walletconnect.com](https://explorer.walletconnect.com/) | Wallet registry |
| ChainList | [chainlist.org](https://chainlist.org) | RPC endpoints |

---

## Data Sources

- **Chain counts:** [Rabby API](https://api.rabby.io/v1/chain/list) (94), [Trust registry](https://github.com/trustwallet/wallet-core/blob/master/registry.json) (163), Enkrypt repo (75)
- **Custom RPC timing:** [WalletBeat](https://walletbeat.fyi) data
- **Activity status:** GitHub API (Nov 28, 2025)

*Last updated: November 28, 2025*
