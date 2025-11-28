# Crypto Wallet Comparison for Developers

> **TL;DR:** Use **Rabby** for development (transaction simulation), **Safe** or **Trust Wallet** for production (active development + stable), and **MetaMask** only for compatibility testing.

**Data Source:** GitHub REST API, November 2024 (activity status updated November 2025)  
**Purpose:** Find stable MetaMask alternatives for developers

---

## ⚠️ Activity Status Alert (November 2025)

Several previously recommended wallets have **stopped active development**:

| Wallet | Last Commit | Status | Note |
|--------|-------------|--------|------|
| **Block Wallet** | Nov 2024 | ❌ INACTIVE | 1 year without commits |
| **Frame** | Feb 2025 | ❌ INACTIVE | 10 months without commits |
| **Argent-X** | Mar 2025 | ❌ INACTIVE | 8 months without commits |
| **Coinbase SDK** | Jul 2025 | ⚠️ SLOW | 4 months without commits |
| **Wigwam** | Sep 2025 | ⚠️ SLOW | 2+ months without commits |

---

## Complete Wallet Comparison (All 16 Wallets)

| Wallet | GitHub | Last Commit | Active | Chains | RPC | Stars | Issues | Ratio | Rel/mo | Stability | Browser Ext | Mobile | Tx Sim | EIP-4337 | Open Source | Best For | Rec |
|--------|--------|-------------|--------|--------|-----|-------|--------|-------|--------|-----------|-------------|--------|--------|----------|-------------|----------|-----|
| **MetaMask** | [metamask-extension](https://github.com/MetaMask/metamask-extension) | Nov 27, 2025 | ✅ | Any | ✅ | 12,949 | 2,509 | 19.4% | ~8 | ⭐⭐ | ✅ | ✅ | ❌ | ⚠️ | ✅ | Compatibility | 🔴 |
| **Rabby** | [Rabby](https://github.com/RabbyHub/Rabby) | Nov 21, 2025 | ✅ | 94 | ✅ | 1,726 | 120 | 7.0% | ~5.7 | ⭐⭐⭐⭐ | ✅ | ✅ | ✅ | ❌ | ✅ | Development | 🟢 |
| **Coinbase** | [coinbase-wallet-sdk](https://github.com/coinbase/coinbase-wallet-sdk) | Jul 11, 2025 | ⚠️ | 20+ | ⚠️ | 1,695 | 44 | 2.6% | - | ⭐⭐⭐⭐ | ✅ | ✅ | ❌ | ✅ | ⚠️ | Production | 🟡 |
| **Trust** | [wallet-core](https://github.com/trustwallet/wallet-core) | Nov 27, 2025 | ✅ | 163 | ✅ | 3,354 | 69 | 2.1% | - | ⭐⭐⭐ | ✅ | ✅ | ❌ | ❌ | ⚠️ | Multi-chain | 🟢 |
| **Rainbow** | [rainbow](https://github.com/rainbow-me/rainbow) | Nov 26, 2025 | ✅ | 15+ | ⚠️ | 4,238 | 13 | 0.3% | ~4.3 | ⭐⭐⭐ | ✅ | ✅ | ❌ | ❌ | ✅ | NFT/Ethereum | 🟢 |
| **Block** | [extension](https://github.com/block-wallet/extension) | Nov 27, 2024 | ❌ | ~20 | ✅ | 96 | 45 | 46.9%* | ~1.7 | ⭐⭐⭐⭐ | ✅ | ✅ | ❌ | ❌ | ✅ | ~~Max stability~~ | 🔴 |
| **Wigwam** | [wigwam](https://github.com/wigwamapp/wigwam) | Sep 11, 2025 | ⚠️ | Any | ✅ | 83 | 7 | 8.4% | ~2 | ⭐⭐⭐⭐ | ✅ | ✅ | ❌ | ❌ | ✅ | Stability | 🟡 |
| **Safe** | [safe-wallet-monorepo](https://github.com/safe-global/safe-wallet-monorepo) | Nov 27, 2025 | ✅ | 30+ | ✅ | 524 | 114 | 21.8% | - | ⭐⭐⭐⭐ | ❌ | ✅ | ❌ | ✅ | ✅ | Enterprise | 🟢 |
| **Argent** | [argent-x](https://github.com/argentlabs/argent-x) | Mar 14, 2025 | ❌ | 2 | ❌ | 641 | 93 | 14.5% | - | ⭐⭐⭐⭐ | ⚠️† | ✅ | ❌ | ✅ | ✅ | ~~Starknet/AA~~ | 🔴 |
| **OKX** | Private | - | ? | 100+ | ✅ | - | - | - | - | ⭐⭐⭐⭐ | ✅ | ✅ | ❌ | ⚠️ | ⚠️ | EIP-7702 | 🟡 |
| **Frame** | [frame](https://github.com/floating/frame) | Feb 01, 2025 | ❌ | Any | ✅ | 1,160 | 95 | 8.2% | ~1‡ | ⭐⭐⭐⭐ | ❌ | ❌ | ✅‡ | ❌ | ✅ | ~~Desktop dev~~ | 🔴 |
| **Phantom** | Private | - | ? | 5 | ❌ | - | - | - | - | ⭐⭐⭐ | ✅ | ✅ | ❌ | ❌ | ❌ | Solana-first | 🟡 |
| **Zerion** | Private | - | ? | ? | ? | - | - | - | - | ⭐⭐⭐ | ✅ | ✅ | ❌ | ❌ | ❌ | Portfolio | ⚪ |
| **1inch** | Private | - | ? | ? | ? | - | - | - | - | ⭐⭐⭐ | ❌ | ✅ | ❌ | ❌ | ❌ | DeFi | ⚪ |
| **Brave** | [brave-browser](https://github.com/brave/brave-browser) | Nov 28, 2025 | ✅ | 10+ | ✅ | 20,764 | 9,997 | 48.1% | - | ⭐⭐⭐⭐ | ⚠️§ | ✅ | ❌ | ❌ | ✅ | Brave users | 🟢 |
| **Enkrypt** | [enKrypt](https://github.com/enkryptcom/enKrypt) | Nov 27, 2025 | ✅ | 75+ | ✅ | 411 | 21 | 5.1% | ~1.3‡ | ⭐⭐⭐⭐ | ✅ | ❌ | ❌ | ❌ | ✅ | Polkadot | 🟢 |

**Legend:**
- 🟢 Recommended | 🟡 Situational | 🔴 Avoid | ⚪ Not for dev
- \* Block's high ratio due to small community (96 stars)
- † Argent desktop extension is Starknet-only
- ‡ Limited verification (not from original research)
- § Brave Wallet is built into Brave browser
- ~~Strikethrough~~ = was recommended, now inactive

**Activity Legend:** ✅ Active (last 30 days) | ⚠️ Slow (1-4 months) | ❌ Inactive (4+ months) | ? Unknown

**Columns:** 
- Stars/Issues/Ratio = GitHub metrics | Rel/mo = Releases per month | Tx Sim = Transaction simulation | EIP-4337 = Account Abstraction
- **NEW:** Chains = Built-in chain count ([Rabby API](https://api.rabby.io/v1/chain/list), [Trust registry](https://github.com/trustwallet/wallet-core/blob/master/registry.json)) | RPC = Custom RPC support

---

## Recommendations by Use Case (Updated Nov 2025)

### For Development
1. **Rabby** — Transaction simulation catches bugs before mainnet ✅ Active
2. ~~**Frame** — Native desktop app, hardware wallet testing~~ ❌ INACTIVE since Feb 2025

### For Production
1. **Trust Wallet** — Wide user adoption, very active development ✅ Active
2. **Rainbow** — Excellent issue management (0.3% ratio) ✅ Active
3. ~~**Coinbase Wallet** — Stable API, enterprise backing~~ ⚠️ SDK not updated since Jul 2025

### For Maximum Stability (Active Projects Only)
1. **Enkrypt** — Low issue ratio (5.1%), active development ✅ Active
2. **Rainbow** — Lowest issue ratio (0.3%), very active ✅ Active
3. ~~**Block Wallet** — 1.7 releases/month (lowest)~~ ❌ ABANDONED - no commits since Nov 2024
4. ~~**Wigwam** — 2 releases/month, good code quality~~ ⚠️ Slow development since Sep 2025

### For Account Abstraction
1. **Safe** — Web app, multi-sig, enterprise ✅ Active
2. ~~**Coinbase Wallet** — Browser extension with EIP-4337~~ ⚠️ SDK development has slowed

### For Compatibility Testing
1. **MetaMask** — Still the most widely supported (use last) ✅ Active

### For Multi-Chain
1. **Trust Wallet** — 163 chains, EVM + BTC + Solana ✅ Active
2. **Enkrypt** — 75+ chains, EVM + Polkadot ✅ Active
3. **Brave Wallet** — Built into Brave browser ✅ Active

---

## Other Wallet Comparison Resources

| Resource | URL | Focus |
|----------|-----|-------|
| **WalletBeat** | [walletbeat.fyi](https://walletbeat.fyi) ([GitHub](https://github.com/walletbeat/walletbeat)) | RPC config, ENS, security |
| Ethereum.org | [ethereum.org/wallets/find-wallet](https://ethereum.org/en/wallets/find-wallet/) | Consumer features |
| WalletConnect | [explorer.walletconnect.com](https://explorer.walletconnect.com/) | Wallet registry |
| CoinGecko | [coingecko.com/en/wallets](https://www.coingecko.com/en/wallets) | User reviews |
| ChainList | [chainlist.org](https://chainlist.org) | RPC endpoints by chain |

**Gap:** No existing resource tracks release frequency, code quality, or developer experience. This document fills that gap. WalletBeat adds RPC timing and ENS support data.

---

## Integration Advice

### Use Wallet Abstraction

```bash
npm install wagmi viem
```

Abstract wallet dependencies so you're not locked to any single wallet.

### Prioritize Wallets in This Order

1. Developer-friendly wallets (Rabby, Safe)
2. Stable & active wallets (Rainbow, Enkrypt, Trust Wallet)
3. MetaMask (for compatibility only)

### Test With Multiple Wallets

Each wallet has quirks. Test your dApp with at least 3 wallets before production.

---

## Summary (Updated Nov 2025)

| Question | Answer |
|----------|--------|
| Best for development? | **Rabby** (transaction simulation, 94 chains, active) |
| Best for production? | **Trust Wallet** (163 chains) or **Rainbow** (curated chains) |
| Most chains? | **Trust Wallet** (163) > **OKX** (100+) > **Rabby** (94) > **Enkrypt** (75+) |
| Best custom RPC? | **MetaMask** or **Safe** (set RPC before any requests) |
| Best for AA? | **Safe** (web, active, 30+ chains) |
| Best multi-ecosystem? | **Trust Wallet** (EVM + BTC + Solana) or **Enkrypt** (EVM + Polkadot) |
| Avoid? | **Block Wallet** ❌, **Frame** ❌, **Argent-X** ❌ (all inactive) |

### ⚠️ Previously Recommended, Now Inactive
| Wallet | Status | Alternative |
|--------|--------|-------------|
| Block Wallet | ❌ No commits since Nov 2024 | Rainbow, Enkrypt |
| Frame | ❌ No commits since Feb 2025 | Rabby |
| Argent-X | ❌ No commits since Mar 2025 | Safe |
| Coinbase SDK | ⚠️ Slow (Jul 2025) | Trust Wallet |

---

## Data Sources & Verification

**Original Data (November 2024):**
- Stars, issues, issue/star ratios
- Release frequency (3-month window: Aug-Nov 2024)
- Stability ratings, platform support, feature matrix

**Activity Status Update (November 28, 2025):**
- Last commit dates verified via GitHub REST API
- Stars and issue counts refreshed
- Chain counts from wallet APIs and registries
- Custom RPC data from WalletBeat

**GitHub Repositories (with activity status):**

| Repository | Last Commit | Status |
|------------|-------------|--------|
| [MetaMask/metamask-extension](https://github.com/MetaMask/metamask-extension) | Nov 27, 2025 | ✅ Active |
| [RabbyHub/Rabby](https://github.com/RabbyHub/Rabby) | Nov 21, 2025 | ✅ Active |
| [coinbase/coinbase-wallet-sdk](https://github.com/coinbase/coinbase-wallet-sdk) | Jul 11, 2025 | ⚠️ Slow |
| [trustwallet/wallet-core](https://github.com/trustwallet/wallet-core) | Nov 27, 2025 | ✅ Active |
| [rainbow-me/rainbow](https://github.com/rainbow-me/rainbow) | Nov 26, 2025 | ✅ Active |
| [block-wallet/extension](https://github.com/block-wallet/extension) | Nov 27, 2024 | ❌ Inactive |
| [wigwamapp/wigwam](https://github.com/wigwamapp/wigwam) | Sep 11, 2025 | ⚠️ Slow |
| [safe-global/safe-wallet-monorepo](https://github.com/safe-global/safe-wallet-monorepo) | Nov 27, 2025 | ✅ Active |
| [argentlabs/argent-x](https://github.com/argentlabs/argent-x) | Mar 14, 2025 | ❌ Inactive |
| [floating/frame](https://github.com/floating/frame) | Feb 01, 2025 | ❌ Inactive |
| [brave/brave-browser](https://github.com/brave/brave-browser) | Nov 28, 2025 | ✅ Active |
| [enkryptcom/enKrypt](https://github.com/enkryptcom/enKrypt) | Nov 27, 2025 | ✅ Active |

**Not Verified (private repos):** OKX, 1inch, Zerion, Phantom

---

*Last updated: November 28, 2025. Activity status, chain counts, and custom RPC data verified via GitHub API and WalletBeat. Verify current capabilities before implementation.*
