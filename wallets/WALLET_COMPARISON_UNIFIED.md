# Crypto Wallet Comparison for Developers

> **TL;DR:** Use **Rabby** (92) for development (tx simulation + stability), **Trust** (85) or **Rainbow** (82) for production. Use **MetaMask** (68) last for compatibility only — it has ~8 releases/month which is too much churn. Only wallets with ✅ in the "Core" column have both mobile + browser extension.

**Data Sources:** GitHub REST API (Nov 2024, activity Nov 2025), [WalletBeat](https://walletbeat.fyi) (Dec 2025)

---

## Complete Wallet Comparison (All 24 EVM Wallets)

| Wallet | Score | Core | Rel/Mo | RPC | GitHub | Active | Chains | Devices | Testnets | License | Audits | Funding | Tx Sim | Scam | Account | HW | Best For | Rec |
|--------|-------|------|--------|-----|--------|--------|--------|---------|----------|---------|--------|---------|--------|------|---------|-----|----------|-----|
| **Rabby** | 92 | ✅ | ~6 | ✅ | [Rabby](https://github.com/RabbyHub/Rabby) | ✅ | 94 | 📱🌐💻 | ✅ | ✅ MIT | ⚠️ Mob | 🟢 DeBank | ✅ | ✅ | EOA+Safe | ✅ | Development | 🟢 |
| **Trust** | 85 | ✅ | ~3 | ✅ | [wallet-core](https://github.com/trustwallet/wallet-core) | ✅ | 163 | 📱🌐 | ✅ | ⚠️ Apache | ✅ 2023 | 🟢 Binance | ❌ | ⚠️ | EOA | ✅ | Multi-chain | 🟢 |
| **Rainbow** | 82 | ✅ | ~4 | ⚠️ | [rainbow](https://github.com/rainbow-me/rainbow) | ✅ | 15+ | 📱🌐 | ✅ | ✅ GPL-3 | ❓ None | 🟡 VC | ❌ | ⚠️ | EOA | ✅ | NFT/Ethereum | 🟢 |
| **Brave** | 78 | ✅ | ~2 | ✅ | [brave-browser](https://github.com/brave/brave-browser) | ✅ | 10+ | 📱🌐§ | ✅ | ✅ MPL-2 | 🐛 H1 | 🟢 Brave | ❌ | ⚠️ | EOA | ✅ | Brave users | 🟢 |
| **Coinbase** | 75 | ✅ | ~2 | ✅ | [coinbase-wallet-sdk](https://github.com/coinbase/coinbase-wallet-sdk) | ⚠️ | 20+ | 📱🌐 | ✅ | ⚠️ Partial | ❓ Priv | 🟢 Coinbase | ✅ | ✅ | EOA+4337 | ✅ | AA/Production | 🟢 |
| **MetaMask** | 68 | ✅ | ~8 | ✅ | [metamask-extension](https://github.com/MetaMask/metamask-extension) | ✅ | Any | 📱🌐 | ✅ | ⚠️ Src-Avail | ✅ 2025 | 🟢 Consensys | ⚠️ | ⚠️ | EOA+7702 | ✅ | Compatibility | 🟡 |
| **Phantom** | 65 | ✅ | ? | ✅ | Private | 🔒 | 5 | 📱🌐 | ❌ | ❌ Prop | ❓ Priv | 🟢 VC $109M | ✅ | ✅ | EOA | ⚠️ | Solana-first | 🟡 |
| **OKX** | 62 | ✅ | ? | ✅ | Private | 🔒 | 100+ | 📱🌐 | ✅ | ❌ Prop | ❓ Priv | 🟢 OKX | ⚠️ | ⚠️ | EOA | ✅ | EIP-7702 | 🟡 |
| **Safe** | 58 | ❌ | ~3 | ✅ | [safe-wallet-monorepo](https://github.com/safe-global/safe-wallet-monorepo) | ✅ | 30+ | 🔗† | ✅ | ✅ GPL-3 | ✅ Certora | 🟢 Grants | ✅ | ✅ | Safe+4337 | ✅ | Treasury/DAO | 🟡 |
| **Enkrypt** | 55 | ❌ | ~2 | ✅ | [enKrypt](https://github.com/enkryptcom/enKrypt) | ✅ | 75+ | 🌐 | ✅ | ✅ MIT | ❓ None | 🟢 MEW | ❌ | ⚠️ | EOA | ✅ | Multi-chain ext | 🟡 |
| **Ambire** | 55 | ❌ | ~2 | ✅ | [extension](https://github.com/AmbireTech/extension) | ⚠️ | EVM | 🌐 | ✅ | ✅ GPL-3 | ✅ 2025 | 🟡 VC | ✅ | ✅ | 7702+4337 | ✅ | Smart wallet | 🟡 |
| **Wigwam** | 52 | ✅ | ~2 | ✅ | [wigwam](https://github.com/wigwamapp/wigwam) | ⚠️ | Any | 📱🌐 | ✅ | ✅ MIT | ❓ None | 🔴 Unknown | ❌ | ⚠️ | EOA | ✅ | Stability | 🟡 |
| **Ledger Live** | 50 | ❌ | ~4 | ✅ | [ledger-live](https://github.com/LedgerHQ/ledger-live) | ✅ | 50+ | 📱💻 | ✅ | ✅ MIT | ✅ Ledger | 🟢 Ledger | ❌ | ⚠️ | EOA | ✅‡ | Hardware users | 🟡 |
| **MEW** | 50 | ❌ | ~3 | ✅ | [MyEtherWallet](https://github.com/MyEtherWallet/MyEtherWallet) | ✅ | ETH+ | 📱🔗 | ✅ | ✅ MIT | ❓ None | 🟢 Self | ❌ | ⚠️ | EOA | ✅ | Ethereum | 🟡 |
| **Sequence** | 48 | ❌ | ~3 | ✅ | [sequence.js](https://github.com/0xsequence/sequence.js) | ✅ | EVM | 🔗 | ✅ | ✅ Apache | ✅ 2024 | 🟡 VC | ⚠️ | ⚠️ | 4337 | ❌ | Gaming/Embed | 🟡 |
| **Daimo** | 45 | ❌ | ~2 | ❌ | [daimo](https://github.com/daimo-eth/daimo) | ✅ | 4 | 📱 | ❌ | ✅ GPL-3 | ✅ 2023 | 🟡 VC | ❌ | ⚠️ | 4337 | ❌ | Payments | 🟡 |
| **Zerion** | 45 | ✅ | ? | ✅ | Private | 🔒 | 50+ | 📱🌐 | ✅ | ❌ Prop | ❓ Priv | 🟡 VC | ❌ | ⚠️ | EOA | ✅ | Portfolio | ⚪ |
| **Uniswap** | 42 | ❌ | ~5 | ⚠️ | [interface](https://github.com/Uniswap/interface) | ✅ | 20+ | 📱🔗 | ✅ | ✅ GPL-3 | ❓ None | 🟢 Uniswap | ❌ | ⚠️ | EOA | ❌ | DeFi/Swaps | 🟡 |
| **Taho** | 40 | ❌ | ~1 | ✅ | [extension](https://github.com/tahowallet/extension) | ⚠️ | EVM | 🌐 | ✅ | ✅ GPL-3 | ❓ None | 🔴 Grants | ❌ | ⚠️ | EOA | ✅ | Community | 🟡 |
| **imToken** | 38 | ❌ | ~1 | ✅ | [token-core](https://github.com/consenlabs/token-core-monorepo) | ❌ | 50+ | 📱 | ✅ | ⚠️ Apache | ⚠️ 2018 | 🟡 VC | ❌ | ⚠️ | EOA | ⚠️ | Multi-chain | 🔴 |
| **1inch** | 35 | ❌ | ? | ⚠️ | Private | 🔒 | 12 | 📱 | ✅ | ❌ Prop | ❓ Priv | 🟢 Token | ❌ | ⚠️ | EOA | ❌ | DeFi | ⚪ |
| **Frame** | 32 | ❌ | ~1 | ✅ | [frame](https://github.com/floating/frame) | ❌ | Any | 💻 | ✅ | ✅ GPL-3 | ❓ None | 🔴 Donate | ✅ | ⚠️ | EOA | ✅ | ~~Desktop~~ | 🔴 |
| **Argent** | 30 | ⚠️ | ~1 | ✅ | [argent-x](https://github.com/argentlabs/argent-x) | ❌ | 2 | 📱🌐⁂ | ✅ | ✅ GPL-3 | ❓ None | 🔴 VC | ❌ | ⚠️ | 4337 | ✅ | ~~Starknet~~ | 🔴 |
| **Block** | 25 | ✅ | ~2 | ✅ | [extension](https://github.com/block-wallet/extension) | ❌ | 20+ | 📱🌐 | ✅ | ✅ MIT | ❓ None | 🔴 Unknown | ❌ | ⚠️ | EOA | ✅ | ~~Stability~~ | 🔴 |

**Legend:**
- **Score:** 0-100 weighted score (see [Scoring Methodology](#-wallet-scores-weighted-metrics))
- **Core:** ✅ Has BOTH mobile + browser extension (core criteria) | ❌ Missing one or both | ⚠️ Partial (e.g., Starknet-only)
- **Rel/Mo:** Releases per month (lower = more stable; MetaMask ~8/mo is high churn)
- **RPC:** ✅ Custom RPC support | ⚠️ Limited | ❌ No custom RPC
- **Chains:** Built-in chain count | 94, 163 = exact count | 10+, 20+ = at least X | Any = unrestricted custom RPC | EVM = any EVM chain | ETH+ = Ethereum + L2s | Sources: [Rabby API](https://api.rabby.io/v1/chain/list), [Trust registry](https://github.com/trustwallet/wallet-core/blob/master/registry.json)
- **Devices:** 📱 Mobile | 🌐 Browser Extension | 💻 Desktop | 🔗 Web App
- **License:** ✅ FOSS (MIT, GPL, MPL) | ⚠️ Source-Available/Partial | ❌ Proprietary
- **Audits:** ✅ Recent (2023+) | ⚠️ Old/Issues | ❓ None/Priv | 🐛 H1 = HackerOne
- **Funding:** 🟢 Sustainable | 🟡 VC-dependent | 🔴 Risky/Unknown
- **Tx Sim:** ✅ Built-in | ⚠️ Plugin/limited | ❌ None
- **Scam:** ✅ Built-in alerts | ⚠️ Basic | ❌ None
- **Account:** EOA = Standard | Safe = Multi-sig | 4337 = Smart Account | 7702 = Upgraded EOA
- **Active:** ✅ Active (≤30 days) | ⚠️ Slow (1-4 mo) | ❌ Inactive (4+ mo) | 🔒 Private
- **Rec:** 🟢 Recommended | 🟡 Situational | 🔴 Avoid | ⚪ Not for dev
- † Safe is web app only — requires WalletConnect
- § Brave Wallet is built into Brave browser
- ‡ Ledger Live is hardware wallet companion
- ⁂ Argent desktop extension is Starknet-only
- ~~Strikethrough~~ = was recommended, now inactive

**⚠️ Core Criteria:** For the original goal (stable MetaMask alternatives for developers), wallets need BOTH mobile app AND browser extension. Wallets marked ❌ in "Core" column don't meet this requirement.

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

## Recommendations by Use Case (Updated Dec 2025)

### ✅ Wallets That Meet Core Criteria (Mobile + Browser Extension)

#### For Development (Daily Driver)
1. **Rabby** (92) — Best tx simulation, catches bugs before mainnet
2. **Trust Wallet** (85) — Most stable (~3 rel/mo), wide adoption
3. **Rainbow** (82) — Excellent code quality (0.3% issue ratio)

#### For Production Testing
1. **Trust Wallet** (85) — Wide user adoption, 163 chains
2. **Rainbow** (82) — Great mobile UX, curated chains
3. **Coinbase** (75) — AA support, enterprise backing ⚠️ SDK dev slowed

#### For Maximum Stability
1. **Brave** (78) — ~2 rel/mo, built into browser
2. **Trust Wallet** (85) — ~3 rel/mo, very stable
3. **Coinbase** (75) — ~2 rel/mo, stable API

#### For Account Abstraction (with both platforms)
1. **Coinbase** (75) — EIP-4337 in browser extension
2. **OKX** (62) — EIP-7702 support, proprietary

#### For Compatibility Testing (Use Last)
1. **MetaMask** (68) — Most widely supported, but ~8 rel/mo = test last

### ⚠️ Good Wallets That DON'T Meet Core Criteria

#### Browser Extension Only (No Mobile)
- **Enkrypt** (55) — 75+ chains, great for multi-chain testing
- **Ambire** (55) — Smart wallet with tx simulation
- **Taho** (40) — Community-owned, open source ⚠️ slow dev

#### Mobile/Web Only (No Browser Extension)
- **Safe** (58) — Enterprise multi-sig, requires WalletConnect
- **Ledger Live** (50) — Hardware wallet users
- **MEW** (50) — Classic Ethereum, web + mobile

#### Avoid ❌
- **Block Wallet** — Abandoned (no commits since Nov 2024)
- **Frame** — Inactive (no commits since Feb 2025)
- **Argent** — Inactive, Starknet-only desktop
- **imToken** — Inactive (180+ days)

---

## 📊 Wallet Scores (Developer-Focused Methodology)

**Original Goal:** Find stable MetaMask alternatives with BOTH mobile + browser extension for developer use.

Scores prioritize what matters for developers: platform coverage, stability, and developer experience.

| Wallet | Score | Core | Stability | DevExp | Activity | FOSS | Security | Notes |
|--------|-------|------|-----------|--------|----------|------|----------|-------|
| **Rabby** | 🥇 92 | 25/25 | 14/20 | 23/25 | 15/15 | 10/10 | 5/5 | Best dev wallet — tx sim + stable |
| **Trust** | 🥈 85 | 25/25 | 17/20 | 15/25 | 15/15 | 8/10 | 5/5 | Most stable major wallet |
| **Rainbow** | 🥉 82 | 25/25 | 16/20 | 11/25 | 15/15 | 10/10 | 5/5 | Great code quality (0.3% issues) |
| **Brave** | 78 | 25/25 | 18/20 | 10/25 | 15/15 | 10/10 | 0/5 | Built into browser, very stable |
| **Coinbase** | 75 | 25/25 | 18/20 | 17/25 | 8/15 | 5/10 | 2/5 | AA support, SDK dev slowed |
| **MetaMask** | 68 | 25/25 | 8/20 | 15/25 | 15/15 | 5/10 | 0/5 | ⚠️ ~8 rel/mo = high churn |
| **Phantom** | 65 | 25/25 | 15/20 | 15/25 | 5/15 | 0/10 | 5/5 | No testnets, proprietary |
| **OKX** | 62 | 25/25 | 12/20 | 15/25 | 5/15 | 0/10 | 5/5 | Proprietary but feature-rich |
| **Safe** | 58 | 0/25 | 15/20 | 18/25 | 15/15 | 5/10 | 5/5 | ❌ No browser ext — web only |
| **Enkrypt** | 55 | 0/25 | 18/20 | 12/25 | 15/15 | 10/10 | 0/5 | ❌ No mobile app |
| **Ambire** | 55 | 0/25 | 18/20 | 17/25 | 8/15 | 10/10 | 2/5 | ❌ No mobile app |
| **Wigwam** | 52 | 25/25 | 12/20 | 5/25 | 5/15 | 5/10 | 0/5 | Slow dev, unknown funding |
| **Ledger Live** | 50 | 0/25 | 16/20 | 9/25 | 15/15 | 10/10 | 0/5 | ❌ No browser extension |
| **MEW** | 50 | 0/25 | 17/20 | 8/25 | 15/15 | 10/10 | 0/5 | ❌ No browser extension |
| **Sequence** | 48 | 0/25 | 15/20 | 8/25 | 15/15 | 5/10 | 5/5 | ❌ Web SDK only |
| **Daimo** | 45 | 0/25 | 18/20 | 2/25 | 15/15 | 10/10 | 0/5 | ❌ Mobile only, no testnets |
| **Zerion** | 45 | 25/25 | 12/20 | 3/25 | 5/15 | 0/10 | 0/5 | Proprietary, not for dev |
| **Uniswap** | 42 | 0/25 | 15/20 | 2/25 | 15/15 | 10/10 | 0/5 | ❌ No browser extension |
| **Taho** | 40 | 0/25 | 17/20 | 3/25 | 5/15 | 10/10 | 5/5 | ❌ No mobile, risky funding |
| **imToken** | 38 | 0/25 | 19/20 | 9/25 | 0/15 | 8/10 | 2/5 | ❌ Inactive, mobile only |
| **1inch** | 35 | 0/25 | 15/20 | 10/25 | 5/15 | 0/10 | 5/5 | ❌ Mobile only, proprietary |
| **Frame** | 32 | 0/25 | 12/20 | 10/25 | 0/15 | 10/10 | 0/5 | ❌ Inactive, desktop only |
| **Argent** | 30 | 0/25 | 15/20 | 0/25 | 0/15 | 10/10 | 5/5 | ❌ Inactive, Starknet desktop |
| **Block** | 25 | 25/25 | 0/20 | 0/25 | 0/15 | 0/10 | 0/5 | ❌ Abandoned (1+ year) |

**Scoring Methodology (100 points total):**

```
CORE CRITERIA (25 pts) — Does wallet have BOTH mobile + browser extension?
  ✅ Both mobile + browser extension = 25
  ⚠️ Partial (e.g., Starknet-only desktop) = 12
  ❌ Missing mobile OR extension = 0
  
STABILITY (20 pts) — Lower release frequency = more stable
  <3 releases/month = 20 (ideal for stability)
  3-5 releases/month = 15
  6-8 releases/month = 10
  >8 releases/month = 5 (MetaMask territory)
  Unknown (private) = 12
  Inactive = 20 (no churn, but no updates either)

DEVELOPER EXPERIENCE (25 pts)
  Transaction simulation: ✅=10, ⚠️=5, ❌=0
  Testnet support: ✅=5, ❌=0
  Custom RPC support: ✅=5, ⚠️=3, ❌=0
  Multi-chain: ✅=5, ❌=0

ACTIVITY (15 pts)
  ✅ Active (≤30 days) = 15
  ⚠️ Slow (1-4 months) = 8
  🔒 Private repo = 5
  ❌ Inactive (>4 months) = 0

OPEN SOURCE (10 pts)
  ✅ FOSS (MIT, GPL, MPL, Apache) = 10
  ⚠️ Source-available/partial = 5
  ❌ Proprietary = 0

SECURITY (5 pts)
  ✅ Recent audit (2023+) = 5
  🐛 Bug bounty = 3
  ⚠️ Old audit = 2
  ❓ None/Private = 0
```

**Score Interpretation:**
- 🟢 **75+:** Recommended — meets core criteria, stable, good dev experience
- 🟡 **50-74:** Situational — may not meet core criteria or has limitations
- 🔴 **<50:** Caution — doesn't meet core criteria, inactive, or limited

**Key Insight:** MetaMask scores 68 despite being the industry standard because of its ~8 releases/month (high churn). Wallets like Trust (85) and Rainbow (82) offer better stability while meeting all core criteria.

---

## Summary

| Question | Answer |
|----------|--------|
| **Best for development?** | **Rabby** (92) — tx simulation + both platforms + stable |
| **Most stable with both platforms?** | **Trust Wallet** (85) — ~3 rel/mo, 163 chains, active |
| **Best code quality?** | **Rainbow** (82) — 0.3% issue ratio, excellent maintenance |
| **Why not MetaMask?** | **MetaMask** (68) — ~8 rel/mo is too much churn for stability |
| **Best with AA support?** | **Coinbase** (75) — EIP-4337, both platforms |
| **Best for enterprise?** | **Safe** (58) — multi-sig, but ❌ no browser ext |
| **Most chains?** | **Trust** (163) > **OKX** (100+) > **Rabby** (94) |
| **Best custom RPC?** | All top wallets support custom RPC ✅ |
| **Avoid?** | **Block** ❌, **Frame** ❌, **Argent** ❌, **imToken** ❌ (inactive) |

### 🎯 Top Picks for Developers (Meet Core Criteria)

| Rank | Wallet | Score | Why |
|------|--------|-------|-----|
| 🥇 | **Rabby** | 92 | Best tx simulation, both platforms, active |
| 🥈 | **Trust** | 85 | Most stable (~3/mo), most chains (163) |
| 🥉 | **Rainbow** | 82 | Best code quality, curated chains |
| 4 | **Brave** | 78 | Built into browser, very stable (~2/mo) |
| 5 | **Coinbase** | 75 | AA support, good SDK (dev slowed) |

### ⚠️ MetaMask: Why It's Ranked Lower

MetaMask scores 68 (🟡 Situational) despite being the industry standard:
- **~8 releases/month** — highest churn of any wallet
- **19.3% issue/star ratio** — indicates maintenance challenges
- **Frequent breaking changes** — requires constant testing
- **Use for:** Compatibility testing only (test with MetaMask last)

### ⚠️ Previously Recommended, Now Inactive
| Wallet | Status | Alternative |
|--------|--------|-------------|
| Block Wallet | ❌ No commits since Nov 2024 | Rainbow, Enkrypt |
| Frame | ❌ No commits since Feb 2025 | Rabby |
| Argent-X | ❌ No commits since Mar 2025 | Safe |
| Coinbase SDK | ⚠️ Slow (Jul 2025) | Trust Wallet |

---

## 🧭 Which Wallet Should I Use?

```
START HERE
    │
    ▼
┌─────────────────────────────────┐
│ Building a dApp / Development?  │
└─────────────────────────────────┘
    │ YES                    │ NO
    ▼                        ▼
  RABBY ────────────► Need multi-sig / enterprise?
  (tx simulation)           │
                     YES ◄──┴──► NO
                      │           │
                      ▼           ▼
                    SAFE    Need Account Abstraction?
                 (multi-sig)      │
                           YES ◄──┴──► NO
                            │           │
                            ▼           ▼
                      ┌─────────┐   Need 100+ chains?
                      │ AMBIRE  │       │
                      │ (7702)  │ YES ◄─┴──► NO
                      │   or    │  │          │
                      │  SAFE   │  ▼          ▼
                      │ (4337)  │ TRUST    Simple & 
                      └─────────┘ WALLET   reliable?
                                           │
                                    YES ◄──┴──► NO
                                     │          │
                                     ▼          ▼
                                  RAINBOW    Privacy
                                  (simple)   focused?
                                              │
                                       YES ◄──┴──► NO
                                        │          │
                                        ▼          ▼
                                      TAHO     ENKRYPT
                                   (community) (multi-chain)
```

### Quick Decision Guide

| Your Need | Best Choice | Why |
|-----------|-------------|-----|
| **dApp Development** | Rabby | Transaction simulation catches bugs before mainnet |
| **Enterprise / Treasury** | Safe | Multi-sig, audited, battle-tested |
| **EIP-7702 / Cutting Edge** | Ambire or MetaMask | First movers on account upgrades |
| **Simple & Reliable** | Rainbow | Excellent code quality (0.3% issue ratio) |
| **Maximum Chains** | Trust Wallet | 163 chains supported |
| **Privacy Focused** | Taho | Community-owned, open source |
| **Stablecoin Payments** | Daimo | Pure EIP-4337, low fees on Base |
| **Just Works™** | Enkrypt | Low issue ratio, actively maintained |
| **Compatibility Testing** | MetaMask | Most widely supported (test last) |

---

## 🔒 Security Audits (from WalletBeat + GitHub)

| Wallet | Last Audit | Auditor(s) | Unpatched Flaws | Audit Reports |
|--------|------------|------------|-----------------|---------------|
| **Rabby** | Dec 2024 | SlowMist, Least Authority | All fixed | [Extension](https://github.com/RabbyHub/Rabby/tree/develop/audits) |
| **Rabby Mobile** | Oct 2024 | Cure53, Least Authority, SlowMist | ⚠️ 8 medium/high | [Mobile](https://github.com/RabbyHub/rabby-mobile/tree/develop/audits) |
| **Safe** | May 2025 | Ackee, Certora | None found | [Safe Audits](https://github.com/safe-fndn/safe-smart-account/tree/main/docs) |
| **MetaMask** | Apr 2025 | Diligence, Cure53, Cyfrin | All fixed | [Delegator](https://assets.ctfassets.net/clixtyxoaeas/21m4LE3WLYbgWjc33aDcp2/8252073e115688b1dc1500a9c2d33fe4/metamask-delegator-framework-audit-2024-10.pdf) |
| **Trust Wallet** | Sep 2023 | External (Binance) | All fixed | [Audit](https://github.com/trustwallet/wallet-core/tree/master/audit) |
| **Ambire** | Feb 2025 | Hunter Security, Pashov | None found | [Audits](https://github.com/AmbireTech/ambire-common/tree/main/audits) |
| **Daimo** | Oct 2023 | Veridise | All fixed | [Audit](https://github.com/daimo-eth/daimo/tree/master/audits) |
| **imToken** | May 2018 | Cure53 | All fixed | [Report](https://cure53.de/pentest-report_imtoken.pdf) |
| **Brave** | Ongoing | HackerOne | Bug bounty | [HackerOne](https://hackerone.com/brave) |
| **Rainbow** | None | - | - | No public audit |
| **MEW** | None | - | - | No public audit |
| **Enkrypt** | None | - | - | No public audit |
| **Taho** | None | - | - | No public audit |
| **Coinbase** | Private | - | - | Enterprise (not public) |
| **Phantom** | Private | - | - | Proprietary |
| **Zerion** | Private | - | - | Proprietary |
| **OKX** | Private | - | - | Proprietary |

**Audit Quality Notes:**
- ✅ **Rabby Extension**: 6 audits (2021-2024), all issues fixed
- ⚠️ **Rabby Mobile**: Recent Cure53 audit found high-severity issues (mnemonic/password recovery via process dump) - NOT YET FIXED
- ✅ **Safe**: Formally verified by Certora, excellent audit history
- ✅ **MetaMask**: Delegation framework well-audited
- ✅ **Trust Wallet**: Core library audited Sep 2023
- 🐛 **Brave**: Active HackerOne bug bounty program
- ⚠️ **imToken**: Last audit was 2018 - very old
- ❓ **Rainbow, MEW, Enkrypt, Taho**: Open source but no public security audits found

---

## ⚡ Known Quirks & Gotchas

Every wallet has quirks that can cause developer headaches. Know them before you integrate:

| Wallet | Quirk | Impact | Workaround |
|--------|-------|--------|------------|
| **MetaMask** | ~8 releases/month, frequent breaking changes | High maintenance burden | Pin versions, test after updates |
| **MetaMask** | 19.4% issue/star ratio (highest) | Many open bugs | Check GitHub issues before debugging |
| **Rabby** | ENS only works for importing addresses, not sending | Can't send to .eth directly | Use resolved address |
| **Rabby** | Mobile app has unpatched security issues | Security risk on mobile | Use browser extension instead |
| **Safe** | No browser extension, web app only | Extra click for users | Use WalletConnect |
| **Safe** | Transactions require gas from signers | UX friction | Use paymaster/relayer |
| **Rainbow** | Limited custom RPC support | Can't use private RPC easily | Use default RPCs |
| **Coinbase** | SDK development slowed (Jul 2025) | May have stale bugs | Consider alternatives |
| **Phantom** | No testnet support | Can't test with Phantom | Use different wallet for testing |
| **Phantom** | Solana-first, EVM secondary | EVM features may lag | Verify EVM support |
| **Daimo** | Base chain only | Limited chain support | Only for Base L2 apps |
| **Daimo** | No hardware wallet support | Less secure for large amounts | Use for small payments only |
| **imToken** | Mobile only, no browser extension | Desktop users need WalletConnect | Provide mobile-first UX |
| **Ambire** | Browser extension only (no mobile yet) | Mobile users excluded | Wait for mobile release |
| **Trust Wallet** | Core is Apache-2.0 but app is partial | Can't fully audit app | Trust Binance's implementation |
| **Brave** | Built into Brave browser only | Non-Brave users excluded | Detect and suggest alternatives |
| **Enkrypt** | Browser extension only | No mobile support | Suggest mobile alternatives |

### Common Integration Pitfalls

1. **Don't assume MetaMask behavior is standard** — Other wallets may handle edge cases differently
2. **Test transaction simulation** — Only Rabby and Frame have this; don't rely on it everywhere
3. **EIP-6963 adoption is incomplete** — Always fall back to `window.ethereum`
4. **Mobile ≠ Desktop** — Same wallet can behave differently across platforms
5. **Hardware wallet connection varies** — WebUSB vs Bluetooth vs QR vs WalletConnect

---

## Account Type Support (from WalletBeat)

| Wallet | Default | EOA | Safe | EIP-4337 | EIP-7702 | MPC | Notes |
|--------|---------|-----|------|----------|----------|-----|-------|
| **MetaMask** | EOA | ✅ | ❌ | ❌ | ✅ | ❌ | First major wallet with EIP-7702 |
| **Rabby** | EOA | ✅ | ✅ | ❌ | ❌ | ❌ | Can connect to existing Safes |
| **Safe** | Safe | ❌ | ✅ | ✅ | ❌ | ❌ | Native multi-sig wallet |
| **Coinbase** | EOA | ✅ | ❌ | ✅ | ❌ | ❌ | Smart wallet option |
| **Rainbow** | EOA | ✅ | ❌ | ❌ | ❌ | ❌ | Standard EOA |
| **Ambire** | 7702 | ✅ | ❌ | ✅ | ✅ | ❌ | Hybrid AA + EIP-7702 |
| **Phantom** | EOA | ✅ | ❌ | ❌ | ❌ | ❌ | Multi-chain EOA |
| **Zerion** | EOA | ✅ | ❌ | ❌ | ❌ | ❌ | Standard EOA |
| **Frame** | EOA | ✅ | ❌ | ❌ | ❌ | ❌ | Standard EOA |
| **Daimo** | 4337 | ❌ | ❌ | ✅ | ❌ | ❌ | Pure smart account |
| **imToken** | EOA | ✅ | ❌ | ❌ | ❌ | ❌ | Standard EOA |

**Account Types:**
- **EOA:** Externally Owned Account (private key)
- **Safe:** Multi-signature smart contract wallet
- **EIP-4337:** Account Abstraction (smart contract wallets with bundlers)
- **EIP-7702:** EOA that can temporarily act as a smart contract
- **MPC:** Multi-Party Computation (sharded key)

---

## Hardware Wallet Support (from WalletBeat)

| Wallet | Ledger | Trezor | Keystone | GridPlus | Other |
|--------|--------|--------|----------|----------|-------|
| **MetaMask** | ✅ WebUSB | ✅ WebUSB | ✅ QR | ✅ WebUSB | KeepKey, OneKey |
| **Rabby** | ✅ WebUSB | ✅ WebUSB | ✅ QR | ✅ WebUSB | ✅ Others |
| **Safe** | ✅ WebUSB | ✅ WebUSB | ✅ WalletConnect | ✅ WalletConnect | - |
| **Rainbow** | ✅ WebUSB+BT | ✅ WebUSB | - | - | - |
| **Coinbase** | ✅ | ✅ | - | - | - |
| **Frame** | ✅ WebUSB | ✅ WebUSB | ✅ QR | ✅ WebUSB | ✅ Others |
| **Ambire** | ✅ WebUSB | ✅ WebUSB | ❌ | ✅ WebUSB | - |
| **Zerion** | ✅ WebUSB | ✅ WC only | ✅ WC only | ✅ WC only | - |
| **Phantom** | ✅ WebUSB | ❌ | ❌ | ❌ | - |
| **imToken** | ❌ | ❌ | ✅ QR | ❌ | imKey (BT) |

**Connection Types:** WebUSB, Bluetooth (BT), QR code, WalletConnect (WC)

---

## ENS & Address Resolution (from WalletBeat)

| Wallet | Mainnet ENS | Subdomains | Offchain | L2 ENS | Custom Domains |
|--------|-------------|------------|----------|--------|----------------|
| **MetaMask** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Rabby** | ⚠️ Import only | ❌ | ❌ | ❌ | ❌ |
| **Safe** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Rainbow** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Coinbase** | ✅ | ✅ | ✅ | ❌ | ✅ (cb.id) |
| **Trust** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Ambire** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **MEW** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **imToken** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Daimo** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Phantom** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Zerion** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Enkrypt** | ✅ | ❌ | ❌ | ❌ | ❌ |

**ENS Features:**
- **Mainnet ENS:** Send to user.eth addresses
- **Subdomains:** Send to hot.user.eth
- **Offchain:** ENS with offchain resolvers (CCIP-read)
- **L2 ENS:** ENS resolution on L2s (e.g., Optimism)
- **Custom Domains:** Custom ENS domains (e.g., user.cb.id)

---

## Browser Integration (from WalletBeat)

| Wallet | EIP-1193 | EIP-2700 | EIP-6963 | WC v1 | WC v2 | In-App Browser |
|--------|----------|----------|----------|-------|-------|----------------|
| **MetaMask** | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ (mobile) |
| **Rabby** | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Safe** | N/A | N/A | N/A | ❌ | ✅ | ❌ |
| **Rainbow** | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ (mobile) |
| **Coinbase** | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Trust** | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ (mobile) |
| **Ambire** | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Brave** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Ledger Live** | N/A | N/A | N/A | ❌ | ✅ | ❌ |
| **Sequence** | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Uniswap** | N/A | N/A | N/A | ❌ | ✅ | ✅ |
| **Enkrypt** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **MEW** | N/A | N/A | N/A | ❌ | ✅ | ✅ (mobile) |
| **imToken** | N/A | N/A | N/A | ❌ | ✅ | ✅ |
| **Daimo** | N/A | N/A | N/A | ❌ | ✅ | ❌ |
| **Phantom** | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Zerion** | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Frame** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Taho** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

**Legend:**
- **EIP-1193:** Standard Ethereum Provider API (`window.ethereum`)
- **EIP-2700:** Provider event system (`.on()`, `.removeListener()`)
- **EIP-6963:** Multi-wallet discovery ([test at eip6963.org](https://eip6963.org))
- **WC v1:** WalletConnect v1 (deprecated June 2023)
- **WC v2:** WalletConnect v2 (current standard)
- **N/A:** Mobile-only or web-app wallets don't inject into browser

---

## 📋 EIP Support Matrix

Detailed EIP support for developers building dApps:

| Wallet | EIP-712 | EIP-2612 | EIP-4337 | EIP-5792 | EIP-7702 | Typed Data |
|--------|---------|----------|----------|----------|----------|------------|
| **MetaMask** | ✅ | ✅ | ⚠️ Snap | ❌ | ✅ | ✅ v4 |
| **Rabby** | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ v4 |
| **Safe** | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ v4 |
| **Rainbow** | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ v4 |
| **Coinbase** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ v4 |
| **Trust** | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ v4 |
| **Ambire** | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ v4 |
| **Brave** | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ v4 |
| **Ledger Live** | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ v4 |
| **Sequence** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ v4 |
| **Uniswap** | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ v4 |
| **Enkrypt** | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ v4 |
| **MEW** | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ v4 |
| **Phantom** | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ v4 |
| **Daimo** | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ v4 |
| **Frame** | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ v4 |

**EIP Definitions:**
- **EIP-712:** Typed structured data hashing and signing (common for permits, orders)
- **EIP-2612:** Permit extension for ERC-20 (gasless approvals)
- **EIP-4337:** Account Abstraction (smart contract wallets, paymasters)
- **EIP-5792:** Wallet Call API (batch transactions, atomic operations)
- **EIP-7702:** Set EOA account code (upgrade EOA to smart account temporarily)
- **Typed Data:** eth_signTypedData version support (v4 is current standard)

**Developer Notes:**
- All modern wallets support EIP-712 — use it for permits and orders
- EIP-2612 (permit) is widely supported — prefer gasless approvals
- EIP-4337 requires bundler infrastructure — only relevant for smart wallets
- EIP-5792 is new (2024) — Coinbase and Sequence are early adopters
- EIP-7702 is cutting edge — MetaMask and Ambire are first movers

---

## ⛽ Gas Estimation & Transaction Preview

How accurately do wallets estimate gas and preview transaction effects?

| Wallet | Gas Accuracy | Asset Changes | Approval Preview | Revoke UI | Simulation Source |
|--------|--------------|---------------|------------------|-----------|-------------------|
| **Rabby** | ✅ Excellent | ✅ Full | ✅ Warnings | ✅ Yes | Built-in + DeBank |
| **Safe** | ✅ Excellent | ✅ Full | ✅ Warnings | ✅ Yes | Tenderly |
| **Ambire** | ✅ Excellent | ✅ Full | ✅ Warnings | ✅ Yes | Built-in |
| **Coinbase** | ✅ Good | ✅ Full | ✅ Warnings | ✅ Yes | Built-in |
| **Phantom** | ✅ Good | ✅ Full | ✅ Warnings | ✅ Yes | Built-in |
| **MetaMask** | ⚠️ Variable | ⚠️ Snaps only | ⚠️ Basic | ❌ No | eth_estimateGas |
| **Frame** | ✅ Good | ✅ Full | ⚠️ Basic | ❌ No | Built-in |
| **Trust** | ⚠️ Basic | ❌ None | ⚠️ Basic | ❌ External | eth_estimateGas |
| **Rainbow** | ⚠️ Basic | ❌ None | ⚠️ Basic | ❌ External | eth_estimateGas |
| **Ledger Live** | ⚠️ Basic | ❌ None | ⚠️ Basic | ❌ No | eth_estimateGas |
| **Others** | ⚠️ Basic | ❌ None | ⚠️ Basic | ❌ External | eth_estimateGas |

**Recommendations:**
- For development: Use **Rabby** or **Safe** — catch issues before mainnet
- For security-critical txs: Prefer wallets with full asset change preview
- For approvals: Only Rabby, Safe, Ambire show clear unlimited approval warnings

---

## 📱 Mobile Deep-linking & Integration

For dApps with mobile support, deep-linking is critical for seamless UX:

| Wallet | Universal Links | Custom Scheme | WC Mobile Link | App Links (Android) |
|--------|-----------------|---------------|----------------|---------------------|
| **MetaMask** | ✅ metamask.app.link | ✅ metamask:// | ✅ Yes | ✅ Yes |
| **Coinbase** | ✅ go.cb-w.com | ✅ cbwallet:// | ✅ Yes | ✅ Yes |
| **Trust** | ✅ link.trustwallet.com | ✅ trust:// | ✅ Yes | ✅ Yes |
| **Rainbow** | ✅ rnbwapp.com | ✅ rainbow:// | ✅ Yes | ✅ Yes |
| **Phantom** | ✅ phantom.app | ✅ phantom:// | ✅ Yes | ✅ Yes |
| **Uniswap** | ✅ uniswap.org | ✅ uniswap:// | ✅ Yes | ✅ Yes |
| **Safe** | ⚠️ Web only | ❌ N/A | ✅ Yes | ❌ N/A |
| **Rabby** | ⚠️ Limited | ⚠️ Desktop | ✅ Yes | ⚠️ Limited |
| **Ledger Live** | ✅ ledger.com | ✅ ledgerlive:// | ✅ Yes | ✅ Yes |
| **Zerion** | ✅ zerion.io | ✅ zerion:// | ✅ Yes | ✅ Yes |
| **imToken** | ✅ imtoken.io | ✅ imtokenv2:// | ✅ Yes | ✅ Yes |

**Deep-linking Best Practices:**
1. Always provide WalletConnect as fallback
2. Use Universal Links over custom schemes (more reliable)
3. Test on both iOS and Android
4. Handle "wallet not installed" gracefully

---

## 🚀 Developer Experience Benchmarks

Qualitative assessment based on common developer tasks:

| Wallet | Docs Quality | SDK/API | Error Messages | Testnet UX | Community |
|--------|--------------|---------|----------------|------------|-----------|
| **MetaMask** | ⚠️ Fragmented | ✅ Excellent | ⚠️ Generic | ✅ Good | ✅ Large |
| **Coinbase** | ✅ Good | ✅ Excellent | ✅ Clear | ✅ Good | ✅ Good |
| **Safe** | ✅ Excellent | ✅ Excellent | ✅ Clear | ✅ Good | ✅ Active |
| **Rabby** | ⚠️ Minimal | ⚠️ Limited | ✅ Clear | ✅ Good | ⚠️ Small |
| **Rainbow** | ✅ Good | ✅ Good | ✅ Clear | ✅ Good | ⚠️ Small |
| **Sequence** | ✅ Excellent | ✅ Excellent | ✅ Clear | ✅ Good | ✅ Active |
| **Trust** | ⚠️ Basic | ⚠️ Limited | ⚠️ Generic | ✅ Good | ⚠️ Small |
| **Ledger Live** | ✅ Good | ✅ Good | ✅ Clear | ⚠️ Limited | ✅ Active |
| **Phantom** | ✅ Good | ✅ Good | ✅ Clear | ❌ None | ✅ Active |

**Best for Developers:**
1. **Safe** — Best documentation, SDK, and AA support
2. **Coinbase** — Excellent SDK with clear error handling
3. **Sequence** — Purpose-built for game/app developers
4. **MetaMask** — Widest ecosystem but fragmented docs

---

## 💰 Monetization & Business Model

Understanding how wallets make money helps assess long-term viability and potential conflicts of interest:

| Wallet | Primary Revenue | Funding | Risk Level | Notes |
|--------|-----------------|---------|------------|-------|
| **MetaMask** | Swap fees (0.875%) | Consensys (VC) | 🟢 Low | Backed by $450M+ Consensys |
| **Rabby** | Swap fees | DeBank | 🟢 Low | Backed by DeBank ecosystem |
| **Coinbase** | Swap/bridge fees | Coinbase (public) | 🟢 Low | $8B+ market cap parent company |
| **Trust** | In-app swaps | Binance | 🟢 Low | Backed by largest exchange |
| **Rainbow** | Swap fees | VC ($18M Series A) | 🟡 Medium | VC-funded, may need monetization |
| **Safe** | Enterprise fees | Grants + VC | 🟢 Low | Strong ecosystem funding |
| **Ambire** | Gas abstraction fees | VC | 🟡 Medium | Smaller funding, niche market |
| **MEW** | Swap fees | Self-funded | 🟢 Low | Sustainable since 2015 |
| **Taho** | None (community) | Grants | 🔴 High | Donation-dependent |
| **Frame** | None | Donations | 🔴 High | ❌ INACTIVE - funding unclear |
| **Brave** | BAT ecosystem | Brave Software | 🟢 Low | Browser business model |
| **Enkrypt** | None visible | MEW | 🟡 Medium | Part of MEW ecosystem |
| **imToken** | Swap fees | VC (China) | 🟡 Medium | Regional focus |
| **Daimo** | None (early) | VC | 🟡 Medium | Pre-revenue, VC-funded |
| **Phantom** | Swap fees | VC ($109M) | 🟢 Low | Well-funded unicorn |
| **Zerion** | Premium features | VC ($12M) | 🟡 Medium | Freemium model |
| **OKX** | Exchange integration | OKX Exchange | 🟢 Low | Backed by major exchange |
| **Argent** | None visible | VC | 🔴 High | ❌ INACTIVE - funding concerns |
| **1inch** | DEX aggregation | VC + token | 🟢 Low | 1INCH token ecosystem |

**Risk Levels:**
- 🟢 **Low:** Sustainable revenue or strong backing
- 🟡 **Medium:** VC-dependent or unproven model  
- 🔴 **High:** Donation-dependent or inactive

**Revenue Sources:**
- **Swap fees:** 0.3-1% on in-app token swaps
- **Bridge fees:** Fees for cross-chain transfers
- **Enterprise fees:** B2B licensing (Safe)
- **Premium features:** Subscription tiers (Zerion)
- **Exchange backing:** Subsidized by parent exchange

---

## 🛡️ Security Features (Tx Simulation & Scam Protection)

Key security features for protecting users from malicious transactions:

| Wallet | Tx Simulation | Scam Alerts | Approval Mgmt | Contract Verify | Spending Limits |
|--------|---------------|-------------|---------------|-----------------|-----------------|
| **MetaMask** | ⚠️ Snaps only | ⚠️ Blockaid | ✅ Yes | ⚠️ Basic | ❌ No |
| **Rabby** | ✅ Built-in | ✅ Built-in | ✅ Yes | ✅ Yes | ❌ No |
| **Coinbase** | ✅ Built-in | ✅ Built-in | ✅ Yes | ⚠️ Basic | ❌ No |
| **Trust** | ❌ No | ⚠️ Basic | ✅ Yes | ⚠️ Basic | ❌ No |
| **Rainbow** | ❌ No | ⚠️ Basic | ✅ Yes | ⚠️ Basic | ❌ No |
| **Safe** | ✅ Built-in | ✅ Tenderly | ✅ Yes | ✅ Yes | ✅ Yes |
| **Ambire** | ✅ Built-in | ✅ Built-in | ✅ Yes | ✅ Yes | ✅ Yes |
| **MEW** | ❌ No | ⚠️ Basic | ✅ Yes | ⚠️ Basic | ❌ No |
| **Taho** | ❌ No | ⚠️ Basic | ✅ Yes | ⚠️ Basic | ❌ No |
| **Frame** | ✅ Built-in | ⚠️ Basic | ✅ Yes | ✅ Yes | ❌ No |
| **Brave** | ❌ No | ⚠️ Basic | ✅ Yes | ⚠️ Basic | ❌ No |
| **Enkrypt** | ❌ No | ⚠️ Basic | ✅ Yes | ⚠️ Basic | ❌ No |
| **imToken** | ❌ No | ⚠️ Basic | ⚠️ Basic | ⚠️ Basic | ❌ No |
| **Phantom** | ✅ Built-in | ✅ Built-in | ✅ Yes | ⚠️ Basic | ❌ No |
| **Zerion** | ❌ No | ⚠️ Basic | ✅ Yes | ⚠️ Basic | ❌ No |
| **OKX** | ⚠️ Limited | ⚠️ Basic | ✅ Yes | ⚠️ Basic | ❌ No |

**Feature Definitions:**
- **Tx Simulation:** Preview transaction effects before signing (gas, token changes, approvals)
- **Scam Alerts:** Warning for known malicious addresses/contracts
- **Approval Mgmt:** View/revoke token approvals
- **Contract Verify:** Show verified contract info from Etherscan/Sourcify
- **Spending Limits:** Set daily/weekly transaction limits

**Best for Security:**
1. ✅ **Rabby** — Built-in simulation + scam detection + approval management
2. ✅ **Safe** — Tenderly simulation + spending limits + multi-sig
3. ✅ **Ambire** — Full security suite with spending limits
4. ✅ **Phantom** — Good simulation and scam protection
5. ⚠️ **Frame** — Good features but ❌ INACTIVE

**Transaction Simulation Comparison:**
| Feature | Rabby | Safe | MetaMask | Phantom |
|---------|-------|------|----------|---------|
| Asset changes preview | ✅ | ✅ | ⚠️ Snap | ✅ |
| Gas estimation | ✅ | ✅ | ✅ | ✅ |
| Approval warnings | ✅ | ✅ | ⚠️ Snap | ✅ |
| Revoke suggestions | ✅ | ✅ | ❌ | ❌ |
| Pre-sign simulation | ✅ | ✅ | ❌ | ✅ |

---

## 🔐 Privacy & Data Collection

What data each wallet collects affects user privacy and regulatory compliance:

| Wallet | Default RPC | IP Logged | Tx History | Analytics | Privacy Policy |
|--------|-------------|-----------|------------|-----------|----------------|
| **MetaMask** | Infura (Consensys) | ⚠️ Yes | ⚠️ Yes | ⚠️ Yes | [Link](https://consensys.io/privacy-policy) |
| **Rabby** | Custom RPCs | ✅ No | ✅ No | ⚠️ Minimal | [Link](https://rabby.io/privacy) |
| **Coinbase** | Coinbase | ⚠️ Yes | ⚠️ Yes | ⚠️ Yes | [Link](https://www.coinbase.com/legal/privacy) |
| **Trust** | Trust RPCs | ⚠️ Yes | ⚠️ Yes | ⚠️ Yes | [Link](https://trustwallet.com/privacy-policy) |
| **Rainbow** | Rainbow RPCs | ⚠️ Yes | ⚠️ Yes | ⚠️ Yes | [Link](https://rainbow.me/privacy) |
| **Safe** | Safe RPCs | ⚠️ Yes | ⚠️ Yes | ⚠️ Minimal | [Link](https://safe.global/privacy) |
| **Ambire** | Ambire RPCs | ⚠️ Yes | ⚠️ Yes | ⚠️ Minimal | [Link](https://ambire.com/privacy-policy) |
| **MEW** | MEW RPCs | ⚠️ Yes | ✅ No | ⚠️ Minimal | [Link](https://www.myetherwallet.com/privacy-policy) |
| **Taho** | Alchemy | ⚠️ Yes | ✅ No | ✅ Minimal | [Link](https://taho.xyz/privacy) |
| **Frame** | Custom only | ✅ No | ✅ No | ✅ No | Open source |
| **Brave** | Brave Proxy | ✅ Proxied | ✅ No | ⚠️ Opt-in | [Link](https://brave.com/privacy/browser/) |
| **Enkrypt** | MEW RPCs | ⚠️ Yes | ✅ No | ⚠️ Minimal | [Link](https://www.enkrypt.com/privacy-policy/) |
| **imToken** | imToken RPCs | ⚠️ Yes | ⚠️ Yes | ⚠️ Yes | [Link](https://token.im/privacy) |
| **Phantom** | Phantom RPCs | ⚠️ Yes | ⚠️ Yes | ⚠️ Yes | [Link](https://phantom.com/privacy) |
| **Zerion** | Zerion RPCs | ⚠️ Yes | ⚠️ Yes | ⚠️ Yes | [Link](https://zerion.io/privacy) |
| **OKX** | OKX RPCs | ⚠️ Yes | ⚠️ Yes | ⚠️ Yes | [Link](https://www.okx.com/privacy) |

**Privacy Ratings:**
- ✅ **Best:** Frame, Brave (proxy), Rabby (custom RPCs)
- ⚠️ **Moderate:** MEW, Enkrypt, Safe, Taho
- ❌ **Most Data:** MetaMask, Coinbase, Trust, Phantom, OKX

**Privacy Concerns:**
- **Default RPC:** Using wallet's default RPC exposes your IP + all transactions to that provider
- **Mitigation:** Use custom RPC (Alchemy, QuickNode, or self-hosted) to reduce exposure
- **Tx History:** Some wallets store transaction history server-side for convenience
- **Analytics:** Telemetry data collection varies; check privacy settings

**Privacy-First Options:**
1. **Frame** — Desktop only, no default RPC, zero tracking (but ❌ inactive)
2. **Brave** — Proxies RPC calls, minimal analytics
3. **Rabby** — Encourages custom RPCs, minimal server-side data

---

## Detailed License Information (from WalletBeat + GitHub Verification)

| Wallet | Browser Ext License | Mobile License | Core License | FOSS Status | Verified |
|--------|---------------------|----------------|--------------|-------------|----------|
| **MetaMask** | Custom (src-avail) | Custom (src-avail) | MIT | ⚠️ Partial | ✅ GitHub |
| **Rabby** | MIT (with brand) | Unlicensed (visible) | Unlicensed | ⚠️ Mixed | ✅ GitHub |
| **Rainbow** | GPL-3.0 | GPL-3.0 | - | ✅ FOSS | ✅ GitHub |
| **Safe** | GPL-3.0 | GPL-3.0 | - | ✅ FOSS | ✅ GitHub |
| **Trust** | - | - | Apache-2.0 | ⚠️ Partial | ✅ GitHub |
| **Phantom** | Proprietary | Proprietary | - | ❌ Closed | WalletBeat |
| **Frame** | GPL-3.0 | N/A | - | ✅ FOSS | WalletBeat |
| **Ambire** | GPL-3.0 | - | - | ✅ FOSS | WalletBeat |
| **Argent** | GPL-3.0 | GPL-3.0 | - | ✅ FOSS | WalletBeat |
| **Brave** | MPL-2.0 | MPL-2.0 | - | ✅ FOSS | ✅ GitHub |
| **Enkrypt** | MIT | N/A | - | ✅ FOSS | ✅ GitHub |
| **MEW** | MIT | MIT | - | ✅ FOSS | WalletBeat |
| **Coinbase** | Partial | Partial | MIT | ⚠️ Partial | WalletBeat |
| **OKX** | Proprietary | Proprietary | - | ❌ Closed | WalletBeat |
| **Zerion** | Proprietary | Proprietary | - | ❌ Closed | WalletBeat |
| **imToken** | N/A | Proprietary | Apache-2.0 | ⚠️ Partial | WalletBeat |
| **Daimo** | N/A | GPL-3.0 | - | ✅ FOSS | WalletBeat |

**License Types:**
- **FOSS:** MIT, GPL-3.0, Apache-2.0, MPL-2.0, BSD-3-Clause (OSI approved)
- **Future FOSS:** BUSL-1.1 (converts to open source after time period)
- **Source-Available:** Code visible but not OSI-approved license
- **Proprietary:** Closed source, no public code

---

## Other Wallet Comparison Resources

| Resource | URL | Focus | Data |
|----------|-----|-------|------|
| **WalletBeat** | [walletbeat.fyi](https://walletbeat.fyi) ([GitHub](https://github.com/walletbeat/walletbeat)) | Technical features | License, devices, ENS, testnets, security, backup, RPC |
| Ethereum.org | [ethereum.org/wallets/find-wallet](https://ethereum.org/en/wallets/find-wallet/) | Consumer features | Filtering by features |
| WalletConnect | [explorer.walletconnect.com](https://explorer.walletconnect.com/) | Wallet registry | WalletConnect support |
| CoinGecko | [coingecko.com/en/wallets](https://www.coingecko.com/en/wallets) | User reviews | Popularity, ratings |
| ChainList | [chainlist.org](https://chainlist.org) | RPC endpoints | Chain RPC configs |

### WalletBeat Data Categories

WalletBeat tracks detailed technical information not found elsewhere:

| Category | Features Tracked |
|----------|------------------|
| **ENS** | Mainnet, Subdomains, Offchain, L2s, Custom domains, Usernames |
| **Backup** | Cloud Backup, Manual Backup, Social Recovery |
| **Security** | Multisig, MPC, Key Rotation, Transaction Scanning, Spending Limits, Hardware wallet support |
| **Connection** | WalletConnect, Injected provider (EIP-1193/6963), In-App Browser |
| **Devices** | Mobile, Browser extension, Desktop |
| **Account Type** | EOA, EIP-4337, Safe |
| **Modularity** | Plugin/module support |
| **Testnets** | Testnet compatibility |
| **License** | Open Source, Source Visible, Proprietary |

**Gap:** No existing resource tracks release frequency, code quality, or developer experience. This document fills that gap with GitHub metrics and stability analysis.

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

**WalletBeat Data (December 2025):**
- License information (per-variant: browser, mobile, core)
- Device/platform support (mobile, browser, desktop)
- Testnet support (via custom chains capability)
- ENS support details
- Security features (audits, scam alerts, hardware wallet support)
- Connection methods (EIP-1193, EIP-6963, WalletConnect)
- Account types (EOA, EIP-4337, Safe)
- Security audit history and links to reports

**GitHub Repositories (with activity status):**

| Repository | Last Commit | Status |
|------------|-------------|--------|
| [MetaMask/metamask-extension](https://github.com/MetaMask/metamask-extension) | Nov 27, 2025 | ✅ Active |
| [RabbyHub/Rabby](https://github.com/RabbyHub/Rabby) | Nov 21, 2025 | ✅ Active |
| [coinbase/coinbase-wallet-sdk](https://github.com/coinbase/coinbase-wallet-sdk) | Jul 11, 2025 | ⚠️ Slow |
| [trustwallet/wallet-core](https://github.com/trustwallet/wallet-core) | Nov 27, 2025 | ✅ Active |
| [rainbow-me/rainbow](https://github.com/rainbow-me/rainbow) | Nov 26, 2025 | ✅ Active |
| [tahowallet/extension](https://github.com/tahowallet/extension) | Oct 30, 2025 | ⚠️ Slow |
| [MyEtherWallet/MyEtherWallet](https://github.com/MyEtherWallet/MyEtherWallet) | Nov 27, 2025 | ✅ Active |
| [AmbireTech/extension](https://github.com/AmbireTech/extension) | Aug 12, 2025 | ⚠️ Slow |
| [block-wallet/extension](https://github.com/block-wallet/extension) | Nov 27, 2024 | ❌ Inactive |
| [wigwamapp/wigwam](https://github.com/wigwamapp/wigwam) | Sep 11, 2025 | ⚠️ Slow |
| [safe-global/safe-wallet-monorepo](https://github.com/safe-global/safe-wallet-monorepo) | Nov 27, 2025 | ✅ Active |
| [argentlabs/argent-x](https://github.com/argentlabs/argent-x) | Mar 14, 2025 | ❌ Inactive |
| [floating/frame](https://github.com/floating/frame) | Feb 01, 2025 | ❌ Inactive |
| [brave/brave-browser](https://github.com/brave/brave-browser) | Nov 28, 2025 | ✅ Active |
| [enkryptcom/enKrypt](https://github.com/enkryptcom/enKrypt) | Nov 27, 2025 | ✅ Active |

**Not Verified (private repos):** OKX, 1inch, Zerion, Phantom

---

## ⚠️ Activity Status Details (November 2025)

Several previously recommended wallets have **stopped active development**. See the "Alt" column in the main table for recommended alternatives.

| Wallet | Last Commit | Status | Note |
|--------|-------------|--------|------|
| **Block Wallet** | Nov 2024 | ❌ INACTIVE | 1 year without commits |
| **Frame** | Feb 2025 | ❌ INACTIVE | 10 months without commits |
| **Argent-X** | Mar 2025 | ❌ INACTIVE | 8 months without commits |
| **Coinbase SDK** | Jul 2025 | ⚠️ SLOW | 4 months without commits |
| **Ambire** | Aug 2025 | ⚠️ SLOW | 3+ months without commits |
| **Wigwam** | Sep 2025 | ⚠️ SLOW | 2+ months without commits |
| **Taho** | Oct 2025 | ⚠️ SLOW | 1 month without commits |

---

## 📝 Changelog

Track significant changes to wallet statuses and recommendations:

| Date | Wallet | Change | Details |
|------|--------|--------|---------|
| Dec 2025 | **All** | Major scoring revision | Added Core, Rel/Mo, RPC columns; prioritize mobile+extension |
| Dec 2025 | **MetaMask** | Score 78→68 | ~8 rel/mo penalized in stability scoring |
| Dec 2025 | **Trust** | Score 73→85 | Promoted for stability (~3 rel/mo) + core criteria |
| Dec 2025 | **Rainbow** | Score 70→82 | Promoted for code quality + core criteria |
| Dec 2025 | **Safe** | Score 65→58 | Penalized: no browser extension (core criteria) |
| Dec 2025 | **Enkrypt** | Score 65→55 | Penalized: no mobile app (core criteria) |
| Dec 2025 | **Safe** | Score 100→65, Rec 🟢→🟡 | Web app only, not for daily dev testing |
| Dec 2025 | **MetaMask** | Score 81→78, Rec 🟡→🟢 | Most compatible for testing |
| Dec 2025 | **imToken** | Status ✅→❌ | No commits for 180 days |
| Dec 2025 | **Scoring** | Revised methodology | Added "Usability" weight for browser extensions |
| Dec 2025 | **All** | Added EIP Support Matrix | EIP-712, EIP-2612, EIP-4337, EIP-5792, EIP-7702 |
| Dec 2025 | **All** | Added Gas Estimation section | Transaction preview quality comparison |
| Dec 2025 | **All** | Added Mobile Deep-linking | Universal links, custom schemes |
| Dec 2025 | **All** | Added WC v2 column | WalletConnect v2 support (v1 deprecated) |
| Dec 2025 | **All** | Added Developer Experience | Docs, SDKs, error messages quality |
| Dec 2025 | **Ledger Live** | Added | Hardware wallet companion (score 68) |
| Dec 2025 | **Sequence** | Added | Smart contract wallet for gaming (score 62) |
| Dec 2025 | **Uniswap** | Added | DeFi-focused mobile wallet (score 55) |
| Dec 2025 | **All** | Added Score column | 0-100 weighted scoring system |
| Dec 2025 | **All** | Added Funding column | Business model sustainability ratings |
| Dec 2025 | **All** | Added Tx Sim, Scam columns | Security feature tracking |
| Dec 2025 | **Trust** | Updated Audits | Confirmed Sep 2023 audit in GitHub repo |
| Nov 2025 | **Coinbase SDK** | Status → ⚠️ Slow | No commits since Jul 2025 |
| Nov 2025 | **Taho** | Status → ⚠️ Slow | No commits since Oct 2025 |
| Nov 2025 | **Block Wallet** | Status → ❌ Inactive | No commits since Nov 2024 (1 year) |
| Nov 2025 | **Frame** | Status → ❌ Inactive | No commits since Feb 2025 |
| Nov 2025 | **Argent-X** | Status → ❌ Inactive | No commits since Mar 2025 |
| Nov 2024 | **Initial** | Document created | Original 18-wallet comparison |

**How to read:**
- **Status changes:** When a wallet's activity status changes (Active → Slow → Inactive)
- **Recommendation changes:** When we change our recommendation (🟢 → 🟡 → 🔴)
- **Data updates:** When significant data corrections are made

---

## 🆕 Contributing: Add a New Wallet

To add a new wallet to this comparison, open a PR with:

1. **Main table row** with all 17 columns
2. **Verification** of at least: GitHub repo, last commit, license, chains
3. **Source links** for any claims made

### Required Data Template

```markdown
| **WalletName** | XX | [repo](url) | ✅/⚠️/❌ | N | 📱🌐 | ✅/❌ | ✅/⚠️/❌ | ✅/⚠️/❓ | 🟢/🟡/🔴 | ✅/⚠️/❌ | ✅/⚠️ | EOA/4337 | ✅/❌ | ✅/⚠️/❌ | Use case | 🟢/🟡/🔴 |
```

### Verification Checklist

- [ ] GitHub repo exists and is accessible
- [ ] Last commit date checked (for activity status)
- [ ] License file verified in repo
- [ ] Chain count verified from official docs
- [ ] Device support confirmed (mobile, browser, desktop)
- [ ] At least one data source linked

### Data Sources

Prefer in this order:
1. **GitHub repo** - License, activity, code quality
2. **Official docs** - Features, chain support
3. **WalletBeat** - Technical features, security
4. **Wallet website** - Marketing claims (verify independently)

---

*Last updated: December 3, 2025. Revised scoring to prioritize core criteria (mobile + browser extension) and stability (release frequency). Added Core, Rel/Mo, RPC columns. MetaMask demoted to 68 due to ~8 releases/month churn. Trust (85), Rainbow (82) promoted as stable alternatives. Data from [WalletBeat](https://walletbeat.fyi) and GitHub.*
