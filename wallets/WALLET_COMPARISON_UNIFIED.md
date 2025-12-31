# Crypto Wallet Comparison for Developers

> **TL;DR:** Use **Rabby** (92) for development (tx simulation + stability), **Trust** (85) or **Rainbow** (82) for production. Use **MetaMask** (68) last for compatibility only — it has ~8 releases/month which is too much churn. Only wallets with ✅ in the "Core" column have both mobile + browser extension.

**Data Sources:** GitHub REST API (Nov 2024, activity Nov 2025), [WalletBeat](https://walletbeat.fyi) (Dec 2025)

**Related:** See [Hardware Wallet Comparison](./HARDWARE_WALLET_COMPARISON.md) for cold storage, [Neo-Bank Comparison](./NEOBANK_COMPARISON.md) for banking, and [Ramp Comparison](./RAMP_COMPARISON.md) for infrastructure.

---

## Table of Contents

- [Complete Wallet Comparison](#complete-wallet-comparison-all-24-evm-wallets)
- [Quick Recommendations](#-quick-recommendations)
- [Desktop App Wallets (Frame-like)](#-desktop-app-wallets-frame-like-architecture)
- [GitHub Metrics](#github-metrics-stars-issues-code-quality)
- [Scoring Methodology](#-wallet-scores-developer-focused-methodology)
- [Security Audits](#-security-audits-from-walletbeat--github)
- [Known Quirks & Gotchas](#-known-quirks--gotchas)
- [Account Type Support](#account-type-support-from-walletbeat)
- [Hardware Wallet Support](#hardware-wallet-support-from-walletbeat)
- [ENS & Address Resolution](#ens--address-resolution-from-walletbeat)
- [Browser Integration](#browser-integration-from-walletbeat)
- [EIP Support Matrix](#-eip-support-matrix)
- [EIP-7702 Wallet Support](#-eip-7702-wallet-support-pectra-upgrade)
- [Gas Estimation & Transaction Preview](#-gas-estimation--transaction-preview)
- [Mobile Deep-linking & Integration](#-mobile-deep-linking--integration)
- [Developer Experience Benchmarks](#-developer-experience-benchmarks)
- [Monetization & Business Model](#-monetization--business-model)
- [Security Features](#-security-features-tx-simulation--scam-protection)
- [Privacy & Data Collection](#-privacy--data-collection)
- [Data Sources & Verification](#data-sources--verification)
- [Changelog](#-changelog)
- [Contributing](#-contributing-add-a-new-wallet)

---

## Complete Wallet Comparison (All 26 Wallets)

| Wallet | Score | Core | Rel/Mo | RPC | GitHub | Active | Chains | Devices | Testnets | License | API | Audits | Funding | Tx Sim | Scam | Account | ENS/Naming | HW | Best For | Rec |
|--------|-------|------|--------|-----|--------|--------|--------|---------|----------|---------|-----|--------|---------|--------|------|---------|------------|-----|----------|-----|
| **Rabby** | 92 | ✅ | ~6 | ✅ | [Rabby](https://github.com/RabbyHub/Rabby) | ✅ | ⟠ | 📱🌐💻 | ✅ | ✅ MIT | 🌐 Public | ⚠️ Mob | 🟢 DeBank | ✅ | ✅ | EOA+Safe | ⚠️ Import only | ✅ | Development | 🟢 |
| **Trust** | 85 | ✅ | ~3 | ✅ | [wallet-core](https://github.com/trustwallet/wallet-core) | ✅ | ⟠₿◎△⚛●+ | 📱🌐 | ✅ | ⚠️ Apache | ❌ Closed | ✅ 2023 | 🟢 Binance | ❌ | ⚠️ | EOA+7702 | ✅ Basic | ✅ | Multi-chain | 🟢 |
| **Rainbow** | 82 | ✅ | ~4 | ⚠️ | [rainbow](https://github.com/rainbow-me/rainbow) | ✅ | ⟠ | 📱🌐 | ✅ | ✅ GPL-3 | ❌ Closed | ❓ None | 🟡 VC | ❌ | ⚠️ | EOA | ✅ Full | ✅ | NFT/Ethereum | 🟢 |
| **Brave** | 78 | ✅ | ~2 | ✅ | [brave-browser](https://github.com/brave/brave-browser) | ✅ | ⟠₿◎ | 📱🌐💻§ | ✅ | ✅ MPL-2 | ⚠️ Browser | 🐛 H1 | 🟢 Brave | ❌ | ⚠️ | EOA | ❌ None | ✅ | Brave users | 🟢 |
| **Coinbase** | 75 | ✅ | ~2 | ✅ | [coinbase-wallet-sdk](https://github.com/coinbase/coinbase-wallet-sdk) | ⚠️ | ⟠₿◎ | 📱🌐 | ✅ | ⚠️ Partial | ⚠️ Limited | ❓ Priv | 🟢 Coinbase | ✅ | ✅ | EOA+4337 | ✅ Full+cb.id | ✅ | AA/Production | 🟢 |
| **MetaMask** | 68 | ✅ | ~8 | ✅ | [metamask-extension](https://github.com/MetaMask/metamask-extension) | ✅ | ⟠ | 📱🌐 | ✅ | ⚠️ Src-Avail | ⚠️ Infura | ✅ 2025 | 🟢 Consensys | ⚠️ | ⚠️ | EOA+7702 | ✅ Full | ✅ | Compatibility | 🟡 |
| **Phantom** | 65 | ✅ | ? | ✅ | Private | 🔒 | ⟠₿◎ | 📱🌐 | ❌ | ❌ Prop | ❌ Closed | ❓ Priv | 🟢 VC $109M | ✅ | ✅ | EOA | ❌ None | ⚠️ | Solana-first | 🟡 |
| **OKX** | 62 | ✅ | ? | ✅ | Private | 🔒 | ⟠₿◎△⚛+ | 📱🌐 | ✅ | ❌ Prop | ❌ Closed | ❓ Priv | 🟢 OKX | ⚠️ | ⚠️ | EOA+7702 | ❌ None | ✅ | EIP-7702 | 🟡 |
| **Safe** | 58 | ❌ | ~3 | ✅ | [safe-wallet-monorepo](https://github.com/safe-global/safe-wallet-monorepo) | ✅ | ⟠ | 📱🔗† | ✅ | ✅ GPL-3 | ✅ Open | ✅ Certora | 🟢 Grants | ✅ | ✅ | Safe+4337 | ✅ Full | ✅ | Treasury/DAO | 🟡 |
| **Enkrypt** | 55 | ❌ | ~2 | ✅ | [enKrypt](https://github.com/enkryptcom/enKrypt) | ✅ | ⟠₿◎●+ | 🌐 | ✅ | ✅ MIT | ⚠️ Partial | ❓ None | 🟢 MEW | ❌ | ⚠️ | EOA | ✅ Basic | ✅ | Multi-chain ext | 🟡 |
| **Ambire** | 62 | ❌ | ~2 | ✅ | [extension](https://github.com/AmbireTech/extension) | ✅ | ⟠ | 🌐 | ✅ | ✅ GPL-3 | ❌ Closed | ✅ 2025 | 🟡 VC | ✅ | ✅ | 7702+4337 | ✅ Basic | ✅ | Smart wallet | 🟡 |
| **Wigwam** | 58 | ❌ | ~2 | ✅ | [wigwam](https://github.com/wigwamapp/wigwam) | ✅ | ⟠ | 🌐 | ✅ | ✅ MIT | ❌ Closed | ❓ None | 🔴 Unknown | ❌ | ⚠️ | EOA | ❌ None | ✅ | Stability | 🟡 |
| **Ledger Live** | 50 | ❌ | ~4 | ✅ | [ledger-live](https://github.com/LedgerHQ/ledger-live) | ✅ | ⟠₿◎△⚛●+ | 📱💻 | ✅ | ✅ MIT | ⚠️ Limited | ✅ Ledger | 🟢 Ledger | ❌ | ⚠️ | EOA | ❌ None | ✅‡ | Hardware users | 🟡 |
| **MEW** | 50 | ❌ | ~3 | ✅ | [MyEtherWallet](https://github.com/MyEtherWallet/MyEtherWallet) | ✅ | ⟠ | 📱🔗 | ✅ | ✅ MIT | ⚠️ Partial | ❓ None | 🟢 Self | ❌ | ⚠️ | EOA | ✅ Full | ✅ | Ethereum | 🟡 |
| **Sequence** | 48 | ❌ | ~3 | ✅ | [sequence.js](https://github.com/0xsequence/sequence.js) | ✅ | ⟠ | 🔗 | ✅ | ✅ Apache | ⚠️ Partial | ✅ 2024 | 🟡 VC | ⚠️ | ⚠️ | 4337 | ❌ None | ❌ | Gaming/Embed | 🟡 |
| **Daimo** | 45 | ❌ | ~2 | ❌ | [daimo](https://github.com/daimo-eth/daimo) | ✅ | ⟠ | 📱 | ❌ | ✅ GPL-3 | ❌ Closed | ✅ 2023 | 🟡 VC | ❌ | ⚠️ | 4337 | ✅ Basic | ❌ | Payments | 🟡 |
| **Zerion** | 45 | ✅ | ? | ✅ | Private | 🔒 | ⟠◎ | 📱🌐 | ✅ | ❌ Prop | ❌ Closed | ❓ Priv | 🟡 VC | ❌ | ⚠️ | EOA | ✅ Basic | ✅ | Portfolio | ⚪ |
| **Uniswap** | 42 | ❌ | ~5 | ⚠️ | [interface](https://github.com/Uniswap/interface) | ✅ | ⟠ | 📱🔗 | ✅ | ✅ GPL-3 | ⚠️ Limited | ❓ None | 🟢 Uniswap | ❌ | ⚠️ | EOA | ❌ None | ❌ | DeFi/Swaps | 🟡 |
| **Taho** | 50 | ❌ | ~1 | ✅ | [extension](https://github.com/tahowallet/extension) | ✅ | ⟠ | 🌐 | ✅ | ✅ GPL-3 | ⚠️ Alchemy | ❓ None | 🔴 Grants | ❌ | ⚠️ | EOA | ❌ None | ✅ | Community | 🟡 |
| **imToken** | 38 | ❌ | ~1 | ✅ | [token-core](https://github.com/consenlabs/token-core-monorepo) | ❌ | ⟠₿⚛ | 📱 | ✅ | ⚠️ Apache | ❌ Closed | ⚠️ 2018 | 🟡 VC | ❌ | ⚠️ | EOA | ✅ Basic | ⚠️ | Multi-chain | 🔴 |
| **1inch** | 35 | ❌ | ? | ⚠️ | Private | 🔒 | ⟠ | 📱 | ✅ | ❌ Prop | ⚠️ DEX API | ❓ Priv | 🟢 Token | ❌ | ⚠️ | EOA | ❌ None | ❌ | DeFi | ⚪ |
| **Frame** | 32 | ❌ | ~1 | ✅ | [frame](https://github.com/floating/frame) | ❌ | ⟠ | 💻⚡ | ✅ | ✅ GPL-3 | ✅ None | ❓ None | 🔴 Donate | ✅ | ⚠️ | EOA | ❌ None | ✅ | ~~Desktop~~ | 🔴 |
| **Argent** | 30 | ⚠️ | ~1 | ✅ | [argent-x](https://github.com/argentlabs/argent-x) | ❌ | ⟠⧫ | 📱🌐⁂ | ✅ | ✅ GPL-3 | ❌ Closed | ❓ None | 🔴 VC | ❌ | ⚠️ | 4337 | ❌ None | ✅ | ~~Starknet~~ | 🔴 |
| **Block** | 10 | ❌ | ~2 | ✅ | [extension](https://github.com/block-wallet/extension) | ❌ | ⟠ | 🌐 | ✅ | ✅ MIT | ❌ Closed | ❓ None | 🔴 Unknown | ❌ | ⚠️ | EOA | ❌ None | ✅ | ~~Stability~~ | 🔴 |
| **Kohaku**∆ | 45 | ❌ | 0 | ✅ | [kohaku-extension](https://github.com/ethereum/kohaku-extension) | ❌ | ⟠ | 🌐 | ✅ | ✅ GPL-3 | ❌ Closed | ❓ Fork | 🟡 EF | ✅ | ✅ | 7702+4337 | ✅ Basic | ✅ | ~~Privacy~~ | 🔴 |
| **Status** | 52 | ❌ | ~2 | ⚠️ | [status-mobile](https://github.com/status-im/status-mobile) | ✅ | ⟠ | 📱 | ✅ | ✅ MPL-2 | ⚠️ Waku | ❓ None | 🟢 Status | ❌ | ⚠️ | EOA | ✅ Basic | ✅ | Privacy/Messaging | 🟡 |

**Quick Reference:**
- **Score:** 0-100 (see [Scoring Methodology](#-wallet-scores-weighted-methodology)) | **Core:** ✅ Both mobile+ext | **Rel/Mo:** Releases/month (lower = stable)
- **Chains:** ⟠ EVM | ₿ Bitcoin | ◎ Solana | △ Move (Sui/Aptos) | ⚛ Cosmos | ● Polkadot | ⧫ Starknet | + Other
- **Devices:** 📱 Mobile | 🌐 Browser Extension | 💻 Desktop App | 🔗 Web App | ⚡ Browser Proxy (Frame-style: desktop app injects into browser)
- **API:** ✅ Open (self-hostable) | 🌐 Public (no auth) | ⚠️ Partial/Provider | ❌ Closed (proprietary)
- **Status:** ✅ Active | ⚠️ Slow | ❌ Inactive | 🔒 Private
- **Rec:** 🟢 Recommended | 🟡 Situational | 🔴 Avoid | ⚪ Not for dev

**Detailed Legend:** See [Column Definitions](#column-definitions) below for complete explanations.

**⚠️ Core Criteria:** Wallets need BOTH mobile app AND browser extension. Wallets marked ❌ in "Core" column don't meet this requirement.

### GitHub Metrics (Stars, Issues, Code Quality)

| Wallet | Last Commit | Stars | Issues | Ratio | Stability |
|--------|-------------|-------|--------|-------|-----------|
| **Rabby** | Dec 16, 2025 | 1,750 | 110 | 6.3% | ⭐⭐⭐⭐ |
| **Trust** | Dec 5, 2025 | 3,386 | 69 | 2.0% | ⭐⭐⭐ |
| **Rainbow** | Dec 2, 2025 | 4,256 | 16 | 0.4% | ⭐⭐⭐ |
| **Brave** | Dec 15, 2025 | 20,875 | 10,093 | 48.4% | ⭐⭐⭐⭐ |
| **Coinbase** | Jul 11, 2025 | 1,705 | 46 | 2.7% | ⭐⭐⭐⭐ |
| **MetaMask** | Dec 15, 2025 | 12,974 | 2,391 | 18.4% | ⭐⭐ |
| **Phantom** | Private | - | - | - | ⭐⭐⭐ |
| **OKX** | Private | - | - | - | ⭐⭐⭐⭐ |
| **Safe** | Dec 15, 2025 | 528 | 105 | 19.9% | ⭐⭐⭐⭐ |
| **Enkrypt** | Nov 27, 2025 | 413 | 25 | 6.1% | ⭐⭐⭐⭐ |
| **Ambire** | Dec 10, 2025 | 60 | 1 | 1.7% | ⭐⭐⭐⭐ |
| **Wigwam** | Dec 11, 2025 | 83 | 7 | 8.4% | ⭐⭐⭐⭐ |
| **Ledger Live** | Dec 15, 2025 | 541 | 80 | 14.8% | ⭐⭐⭐⭐ |
| **MEW** | Nov 27, 2025 | 1,570 | 52 | 3.3% | ⭐⭐⭐⭐ |
| **Sequence** | Dec 14, 2025 | 312 | 25 | 8.0% | ⭐⭐⭐⭐ |
| **Daimo** | Nov 30, 2025 | 408 | 227 | 55.6% | ⭐⭐⭐ |
| **Zerion** | Private | - | - | - | ⭐⭐⭐ |
| **Uniswap** | Dec 12, 2025 | 5,429 | 798 | 14.7% | ⭐⭐⭐ |
| **Taho** | Dec 5, 2025 | 3,183 | 339 | 10.7% | ⭐⭐⭐ |
| **imToken** | May 2025 | 800+ | 50+ | ~6% | ⭐⭐⭐ |
| **1inch** | Private | - | - | - | ⭐⭐⭐ |
| **Frame** | Feb 01, 2025 | 1,166 | 95 | 8.1% | ⭐⭐⭐⭐ |
| **Argent** | Mar 14, 2025 | 642 | 95 | 14.8% | ⭐⭐⭐⭐ |
| **Block** | Nov 27, 2024 | 96 | 45 | 46.9% | ⭐⭐⭐⭐ |
| **Kohaku**∆ | Aug 12, 2025 | 62 | 14 | 22.6% | ⭐⭐ |

**GitHub Legend:**
- **Ratio:** Issues ÷ Stars (lower = better code quality). Rainbow 0.3% is excellent, MetaMask 19.4% indicates maintenance burden.
- **Stability:** ⭐⭐ = High churn (>6 rel/mo) | ⭐⭐⭐ = Medium | ⭐⭐⭐⭐ = Stable (<3 rel/mo)
- **Private:** Closed-source repos have no public metrics

**Data Sources:** GitHub REST API (verified Nov 2025), [WalletBeat](https://walletbeat.fyi) (Dec 2025)

---

## 🎯 Quick Recommendations

**Quick Answers:** Best for development? **Rabby** (92). Most stable? **Trust** (85). Best code quality? **Rainbow** (82). Why not MetaMask? **MetaMask** (68) has ~8 rel/mo = too much churn. See [full comparison table](#complete-wallet-comparison-all-24-evm-wallets) for all 24 wallets.

**Jump to:** [Comparison Table](#complete-wallet-comparison-all-24-evm-wallets) | [Scoring Methodology](#-wallet-scores-weighted-methodology) | [Features Matrix](#wallet-features-matrix) | [EIP Support](#-eip-support-matrix) | [Developer Experience](#-developer-experience-benchmarks)

### ✅ Top Picks (Meet Core Criteria: Mobile + Browser Extension)

| Rank | Wallet | Score | Best For |
|------|--------|-------|----------|
| 🥇 | **Rabby** | 92 | Development — tx simulation, catches bugs before mainnet |
| 🥈 | **Trust** | 85 | Production — most stable (~3 rel/mo), 163 chains, wide adoption |
| 🥉 | **Rainbow** | 82 | Production — best code quality (0.3% issue ratio), curated chains |
| 4 | **Brave** | 78 | Maximum stability — ~2 rel/mo, built into browser |
| 5 | **Coinbase** | 75 | Account Abstraction — EIP-4337 support ⚠️ SDK dev slowed |

### Use Case Recommendations

**For Development (Daily Driver):**
- **Rabby** (92) — Best tx simulation, both platforms, active
- **Trust** (85) — Most stable (~3 rel/mo), wide adoption
- **Rainbow** (82) — Excellent code quality (0.3% issue ratio)

**For Production Testing:**
- **Trust** (85) — Wide user adoption, 163 chains
- **Rainbow** (82) — Great mobile UX, curated chains
- **Coinbase** (75) — AA support, enterprise backing ⚠️ SDK dev slowed

**For Maximum Stability:**
- **Brave** (78) — ~2 rel/mo, built into browser
- **Trust** (85) — ~3 rel/mo, very stable
- **Coinbase** (75) — ~2 rel/mo, stable API

**For Account Abstraction / EIP-7702:**
- **Trust** (85) — EIP-7702 support, most chains (163)
- **Coinbase** (75) — EIP-4337 in browser extension
- **OKX** (62) — EIP-7702 support, proprietary
- **MetaMask** (68) — EIP-7702 support, but high churn

**For Compatibility Testing (Use Last):**
- **MetaMask** (68) — Most widely supported, but ~8 rel/mo = test last

### ⚠️ Good Wallets That DON'T Meet Core Criteria

**Browser Extension Only (No Mobile):**
- **Enkrypt** (55) — 75+ chains, great for multi-chain testing
- **Ambire** (62) — Smart wallet with tx simulation, EIP-7702 support
- **Taho** (40) — Community-owned, open source, resumed active dev

**Mobile/Web Only (No Browser Extension):**
- **Safe** (58) — Enterprise multi-sig, requires WalletConnect
- **Ledger Live** (50) — Hardware wallet users
- **MEW** (50) — Classic Ethereum, web + mobile

**Avoid ❌ (Inactive/Abandoned):**
- **Block Wallet** — Abandoned (no commits since Nov 2024)
- **Frame** — Inactive (no commits since Feb 2025)
- **Argent** — Inactive, Starknet-only desktop
- **Kohaku** — Stale Ambire v5.18.0 fork (no commits since Aug 2025)
- **imToken** — Inactive (180+ days)

### 💻 Desktop App Wallets (Frame-like Architecture)

**Question:** *"Are there other wallets similar to Frame which has a desktop app and a minimal extension?"*

**Frame's Architecture:** Frame is unique — it's a **native desktop application** that injects into browsers via a **localhost proxy** rather than using a traditional browser extension. This approach offers:
- Better security (keys stay in a native app, not a browser sandbox)
- System-level hardware wallet integration
- Privacy (no default RPC, zero tracking)
- Works across any browser without installing multiple extensions

**Wallets with Desktop Apps:**

| Wallet | Desktop Type | Browser Integration | Status | Notes |
|--------|--------------|---------------------|--------|-------|
| **Frame** | ✅ Native + Proxy | System proxy injection | ❌ Inactive | Only wallet with Frame-style architecture |
| **Rabby** | ✅ Native App | Separate browser extension | ✅ Active | Desktop app is supplementary to extension |
| **Ledger Live** | ✅ Native App | WalletConnect only | ✅ Active | No browser injection, uses WC for dApps |
| **Brave** | 🌐 Built into browser | Built-in (is the browser) | ✅ Active | Wallet is part of Brave browser |

**Answer:** Currently, **no other active wallet uses Frame's exact architecture** (desktop app + browser proxy). The closest alternatives are:
1. **Rabby** — Has a desktop app, but it works alongside (not replaces) the browser extension
2. **Ledger Live** — Desktop-native, but uses WalletConnect for browser dApps instead of injection
3. **Brave Wallet** — Native desktop experience, but you must use the Brave browser

**If you need Frame-like privacy & desktop-first UX:**
- For active wallets: **Rabby** (desktop + extension) or **Brave** (built into browser)
- For hardware wallets: **Ledger Live** (desktop + mobile, no browser extension)
- For maximum privacy: **Rabby with custom RPCs** (closest to Frame's privacy model)

⚠️ **Frame is inactive** (no commits since Feb 2025) — if you're using it, consider migrating to Rabby.

---

### ⚠️ MetaMask: Why It's Ranked Lower

MetaMask scores 68 (🟡 Situational) despite being the industry standard:
- **~8 releases/month** — highest churn of any wallet
- **19.3% issue/star ratio** — indicates maintenance challenges
- **Frequent breaking changes** — requires constant testing
- **Use for:** Compatibility testing only (test with MetaMask last)

---

## 📊 Wallet Scores (Developer-Focused Methodology)

**Original Goal:** Find stable MetaMask alternatives with BOTH mobile + browser extension for developer use.

**Quick Reference:** Score = Core (25) + Stability (20) + DevExp (25) + Activity (15) + FOSS (10) + Security (5) = 100 total

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
| **Ambire** | 62 | 0/25 | 18/20 | 17/25 | 15/15 | 10/10 | 2/5 | ❌ No mobile app |
| **Wigwam** | 58 | 0/25 | 18/20 | 15/25 | 15/15 | 10/10 | 0/5 | ❌ No mobile — browser ext only |
| **Ledger Live** | 50 | 0/25 | 16/20 | 9/25 | 15/15 | 10/10 | 0/5 | ❌ No browser extension |
| **MEW** | 50 | 0/25 | 17/20 | 8/25 | 15/15 | 10/10 | 0/5 | ❌ No browser extension |
| **Sequence** | 48 | 0/25 | 15/20 | 8/25 | 15/15 | 5/10 | 5/5 | ❌ Web SDK only |
| **Daimo** | 45 | 0/25 | 18/20 | 2/25 | 15/15 | 10/10 | 0/5 | ❌ Mobile only, no testnets |
| **Zerion** | 45 | 25/25 | 12/20 | 3/25 | 5/15 | 0/10 | 0/5 | Proprietary, not for dev |
| **Uniswap** | 42 | 0/25 | 15/20 | 2/25 | 15/15 | 10/10 | 0/5 | ❌ No browser extension |
| **Taho** | 50 | 0/25 | 17/20 | 3/25 | 15/15 | 10/10 | 5/5 | ❌ No mobile, risky funding |
| **imToken** | 38 | 0/25 | 19/20 | 9/25 | 0/15 | 8/10 | 2/5 | ❌ Inactive, mobile only |
| **1inch** | 35 | 0/25 | 15/20 | 10/25 | 5/15 | 0/10 | 5/5 | ❌ Mobile only, proprietary |
| **Frame** | 32 | 0/25 | 12/20 | 10/25 | 0/15 | 10/10 | 0/5 | ❌ Inactive, desktop only |
| **Argent** | 30 | 0/25 | 15/20 | 0/25 | 0/15 | 10/10 | 5/5 | ❌ Inactive, Starknet desktop |
| **Block** | 10 | 0/25 | 0/20 | 0/25 | 0/15 | 10/10 | 0/5 | ❌ Abandoned (1+ year), browser ext only |
| **Kohaku**∆ | 45 | 0/25 | 20/20 | 15/25 | 0/15 | 10/10 | 0/5 | ❌ Stale Ambire fork (Aug 2025) |

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
| **EIP-7702 / Cutting Edge** | MetaMask, Ambire, Trust, OKX | [4 wallets support 7702](https://github.com/fireblocks-labs/awesome-eip-7702#wallets-support-updates) |
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
6. **Desktop-Mobile Sync** — Most wallets don't automatically sync between desktop and mobile. Users can import the same seed phrase on both platforms to access the same accounts, but transactions and state don't sync in real-time.

### Integration Best Practices

1. **Use EIP-6963** for wallet detection (modern standard, but always fall back to `window.ethereum`)
2. **Use EIP-712 for message signing** — Enables human-readable display (foundational for clear signing)
3. **Consider EIP-7730 for enhanced clear signing** — Provides formatting metadata for better display (especially important for hardware wallets like Ledger)
4. **Support multiple wallets** — Don't lock users into one wallet
5. **Test with multiple wallets** — Each has quirks and edge cases
6. **Handle errors gracefully** — Wallet errors vary significantly between implementations
7. **Provide clear error messages** — Help users debug connection issues
8. **Test on both desktop and mobile** — User experiences differ across platforms
9. **Monitor wallet updates** — Breaking changes happen, especially with high-release-frequency wallets
10. **Use TypeScript** — Catch integration issues early with type checking
11. **Document wallet-specific quirks** — Save time for future maintenance
12. **Consider wallet abstraction libraries** — wagmi, ethers.js, viem reduce dependency on specific wallets

### Stability Maintenance

1. **Pin wallet versions** in development (if possible)
2. **Monitor release notes** for breaking changes
3. **Test after wallet updates** before deploying to production
4. **Have fallback wallets** — Don't depend on a single wallet
5. **Track wallet issues** — Monitor GitHub, Discord, and community forums
6. **Consider wallet abstraction** — Reduces dependency on specific wallet implementations

---

## Column Definitions

Complete explanations for all table columns:

| Column | Values | Meaning |
|--------|--------|---------|
| **Score** | 0-100 | Weighted score prioritizing core criteria, stability, and developer experience. See [Scoring Methodology](#-wallet-scores-weighted-methodology) |
| **Core** | ✅ / ⚠️ / ❌ | ✅ = Has BOTH mobile + browser extension (core criteria) | ⚠️ = Partial (e.g., Starknet-only desktop) | ❌ = Missing one or both |
| **Rel/Mo** | Number or ? | Releases per month (lower = more stable; MetaMask ~8/mo is high churn) | ? = Unknown (private repo) |
| **RPC** | ✅ / ⚠️ / ❌ | ✅ = Custom RPC support | ⚠️ = Limited | ❌ = No custom RPC |
| **Chains** | Number, 10+, Any, EVM, ETH+ | Built-in chain count. Exact numbers (94, 163) = verified count. 10+, 20+ = at least X. Any = unrestricted custom RPC. EVM = any EVM chain. ETH+ = Ethereum + L2s. Sources: [Rabby API](https://api.rabby.io/v1/chain/list), [Trust registry](https://github.com/trustwallet/wallet-core/blob/master/registry.json) |
| **Devices** | 📱🌐💻🔗⚡ | 📱 = Mobile app | 🌐 = Browser Extension | 💻 = Desktop app | 🔗 = Web App | ⚡ = Browser Proxy (desktop app that injects into browser via localhost, like Frame) |
| **Testnets** | ✅ / ❌ | ✅ = Custom chain/testnet support | ❌ = No testnet support |
| **License** | ✅ / ⚠️ / ❌ | ✅ = FOSS (MIT, GPL, MPL, Apache) | ⚠️ = Source-Available/Partial | ❌ = Proprietary |
| **API** | ✅ / 🌐 / ⚠️ / ❌ | ✅ Open = Backend APIs are open source AND self-hostable (e.g., Safe) | 🌐 Public = APIs publicly accessible without auth, but code is proprietary (e.g., Rabby/DeBank) | ⚠️ Partial = Uses third-party providers (Infura, Alchemy) or has limited open APIs | ❌ Closed = Proprietary backend APIs |
| **Audits** | ✅ / ⚠️ / ❓ / 🐛 | ✅ = Recent (2023+) | ⚠️ = Old/Issues | ❓ = None/Private | 🐛 = HackerOne bug bounty |
| **Funding** | 🟢 / 🟡 / 🔴 | 🟢 = Sustainable | 🟡 = VC-dependent | 🔴 = Risky/Unknown |
| **Tx Sim** | ✅ / ⚠️ / ❌ | ✅ = Built-in transaction simulation | ⚠️ = Plugin/limited | ❌ = None |
| **Scam** | ✅ / ⚠️ / ❌ | ✅ = Built-in scam/phishing alerts | ⚠️ = Basic protection | ❌ = None |
| **Account** | EOA, Safe, 4337, 7702, combinations | EOA = Standard Externally Owned Account | Safe = Multi-sig | 4337 = Smart Account (EIP-4337) | 7702 = Upgraded EOA (EIP-7702) |
| **ENS/Naming** | ✅ Full / ✅ Basic / ⚠️ / ❌ | ✅ Full = Mainnet ENS + subdomains | ✅ Basic = Mainnet ENS only | ⚠️ Import only = Can import but not send to .eth | ✅ Full+cb.id = Full ENS + custom domains | ❌ = No ENS support |
| **HW** | ✅ / ⚠️ / ❌ | ✅ = Hardware wallet support (Ledger/Trezor) | ⚠️ = Limited support | ❌ = No hardware wallet support |
| **Active** | ✅ / ⚠️ / ❌ / 🔒 | ✅ = Active (≤30 days since last commit) | ⚠️ = Slow (1-4 months) | ❌ = Inactive (4+ months) | 🔒 = Private repo |
| **Rec** | 🟢 / 🟡 / 🔴 / ⚪ | 🟢 = Recommended (score 75+) | 🟡 = Situational (score 50-74) | 🔴 = Avoid (score <50 or inactive) | ⚪ = Not for developers |

**Special Notes:**
- † Safe is web app only — requires WalletConnect
- § Brave Wallet is built into Brave browser
- ‡ Ledger Live is hardware wallet companion
- ⁂ Argent desktop extension is Starknet-only
- ∆ Kohaku is a stale fork of Ambire v5.18.0 under Ethereum Foundation — use Ambire instead
- ~~Strikethrough~~ = was recommended, now inactive

**Tracked EIPs:** EIP-712 (Typed Data), EIP-2612 (Permit), EIP-4337 (Account Abstraction), EIP-5792 (Wallet Call API), EIP-7702 (Set EOA Code), EIP-7710 (Smart Contract Delegation) — see [EIP Support Matrix](#-eip-support-matrix)

---

## Wallet Features Matrix

Comprehensive feature comparison across account types, hardware wallet support, ENS, and browser integration.

### Account Type Support

| Wallet | Default | EOA | Safe | EIP-4337 | EIP-7702 | MPC | Notes |
|--------|---------|-----|------|----------|----------|-----|-------|
| **MetaMask** | EOA | ✅ | ❌ | ❌ | ✅ | ❌ | First major wallet with EIP-7702 |
| **Rabby** | EOA | ✅ | ✅ | ❌ | ❌ | ❌ | Can connect to existing Safes |
| **Trust** | EOA | ✅ | ❌ | ❌ | ✅ | ❌ | [7702 support added](https://beincrypto.com/trust-wallet-ethereum-eip7702-support/) |
| **Safe** | Safe | ❌ | ✅ | ✅ | ❌ | ❌ | Native multi-sig wallet |
| **Coinbase** | EOA | ✅ | ❌ | ✅ | ❌ | ❌ | Smart wallet option |
| **Rainbow** | EOA | ✅ | ❌ | ❌ | ❌ | ❌ | Standard EOA |
| **Ambire** | 7702 | ✅ | ❌ | ✅ | ✅ | ❌ | [Hybrid AA + EIP-7702](https://blog.ambire.com/eip-7702-wallet/) |
| **OKX** | EOA | ✅ | ❌ | ❌ | ✅ | ❌ | [7702 support](https://web3.okx.com/help/okx-wallet-to-support-eip-7702) |
| **Sequence** | 4337 | ❌ | ❌ | ✅ | ❌ | ❌ | Native smart wallet |
| **Daimo** | 4337 | ❌ | ❌ | ✅ | ❌ | ❌ | Payments-focused |
| **Phantom** | EOA | ✅ | ❌ | ❌ | ❌ | ❌ | Solana-first |
| **Enkrypt** | EOA | ✅ | ❌ | ❌ | ❌ | ❌ | Standard EOA |
| **MEW** | EOA | ✅ | ❌ | ❌ | ❌ | ❌ | Classic Ethereum |
| **Brave** | EOA | ✅ | ❌ | ❌ | ❌ | ❌ | Standard EOA |
| **Ledger Live** | EOA | ✅ | ❌ | ❌ | ❌ | ❌ | Hardware companion |
| **Uniswap** | EOA | ✅ | ❌ | ❌ | ❌ | ❌ | DeFi-focused |
| **Taho** | EOA | ✅ | ❌ | ❌ | ❌ | ❌ | Community wallet |
| **Zerion** | EOA | ✅ | ❌ | ❌ | ❌ | ❌ | Portfolio tracker |
| **Wigwam** | EOA | ✅ | ❌ | ❌ | ❌ | ❌ | EVM-focused |
| **Argent** | 4337 | ❌ | ❌ | ✅ | ❌ | ❌ | Starknet-focused |
| **Frame** | EOA | ✅ | ❌ | ❌ | ❌ | ❌ | Desktop-only |
| **1inch** | EOA | ✅ | ❌ | ❌ | ❌ | ❌ | Mobile-only |
| **imToken** | EOA | ✅ | ❌ | ❌ | ❌ | ❌ | Standard EOA |
| **Block** | EOA | ✅ | ❌ | ❌ | ❌ | ❌ | Standard EOA |

**Account Types:** EOA = Standard Externally Owned Account | Safe = Multi-sig | 4337 = Smart Account (EIP-4337) | 7702 = Upgraded EOA (EIP-7702) | MPC = Multi-Party Computation

#### Hardware Wallet Support

See [Hardware Wallet Comparison](./HARDWARE_WALLET_COMPARISON.md) for detailed hardware wallet analysis and recommendations.

| Wallet | Ledger | Trezor | Keystone | GridPlus | Other | Notes |
|--------|--------|--------|----------|----------|-------|-------|
| **MetaMask** | ✅ WebUSB | ✅ WebUSB | ✅ QR | ✅ WebUSB | KeepKey, OneKey | Best HW wallet integration |
| **Rabby** | ✅ WebUSB | ✅ WebUSB | ✅ QR | ✅ WebUSB | ✅ Others | Good HW wallet support |
| **Trust** | ✅ WebUSB | ✅ WebUSB | ✅ QR | ✅ WebUSB | ✅ Others | Wide HW wallet support |
| **Rainbow** | ✅ WebUSB+BT | ✅ WebUSB | - | - | - | Good HW wallet support |
| **Coinbase** | ✅ | ✅ | - | - | - | Full HW wallet support |
| **Safe** | ✅ WebUSB | ✅ WebUSB | ✅ WalletConnect | ✅ WalletConnect | - | Multi-sig + HW wallets |
| **Enkrypt** | ✅ WebUSB | ✅ WebUSB | ✅ QR | ✅ WebUSB | ✅ Others | Excellent HW wallet support |
| **Ambire** | ✅ WebUSB | ✅ WebUSB | ❌ | ✅ WebUSB | - | Good HW wallet support |
| **Brave** | ✅ WebUSB | ✅ WebUSB | ✅ QR | ✅ WebUSB | ✅ Others | Built-in HW wallet support |
| **Ledger Live** | ✅ | ❌ | ❌ | ❌ | ❌ | Ledger-only (companion app) |
| **MEW** | ✅ WebUSB | ✅ WebUSB | ✅ QR | ✅ WebUSB | ✅ Others | Classic HW wallet support |
| **Phantom** | ✅ WebUSB | ❌ | ❌ | ❌ | - | Solana-first, EVM secondary |
| **OKX** | ✅ WebUSB | ✅ WebUSB | ✅ QR | ✅ WebUSB | ✅ Others | Good HW wallet support |
| **Sequence** | ❌ | ❌ | ❌ | ❌ | ❌ | Web SDK only, no HW wallets |
| **Daimo** | ❌ | ❌ | ❌ | ❌ | ❌ | Mobile-only, no HW wallets |
| **Uniswap** | ❌ | ❌ | ❌ | ❌ | ❌ | DeFi-focused, no HW wallets |
| **Taho** | ✅ WebUSB | ✅ WebUSB | ✅ QR | ✅ WebUSB | ✅ Others | Good HW wallet support |
| **Zerion** | ✅ WebUSB | ✅ WC only | ✅ WC only | ✅ WC only | - | Portfolio + HW wallets |
| **Wigwam** | ✅ WebUSB | ✅ WebUSB | ✅ QR | ✅ WebUSB | ✅ Others | Good HW wallet support |
| **Argent** | ✅ WebUSB | ✅ WebUSB | ✅ WalletConnect | ✅ WalletConnect | - | HW wallet support |
| **Frame** | ✅ WebUSB | ✅ WebUSB | ✅ QR | ✅ WebUSB | ✅ Others | Desktop HW wallet support |
| **1inch** | ❌ | ❌ | ❌ | ❌ | ❌ | Mobile-only, no HW wallets |
| **imToken** | ❌ | ❌ | ✅ QR | ❌ | imKey (BT) | Mobile-only, limited HW support |
| **Block** | ✅ WebUSB | ✅ WebUSB | ✅ QR | ✅ WebUSB | ✅ Others | Good HW wallet support |

**Connection Types:** WebUSB, Bluetooth (BT), QR code, WalletConnect (WC). See [Hardware Wallet Comparison](./HARDWARE_WALLET_COMPARISON.md) for hardware wallet recommendations.

### ENS & Address Resolution

| Wallet | Mainnet ENS | Subdomains | Offchain | L2 ENS | Custom Domains | Notes |
|--------|-------------|------------|----------|--------|----------------|-------|
| **MetaMask** | ✅ | ✅ | ✅ | ❌ | ❌ | Full ENS support |
| **Coinbase** | ✅ | ✅ | ✅ | ❌ | ✅ (cb.id) | Full ENS + cb.id domains |
| **Rainbow** | ✅ | ✅ | ❌ | ❌ | ❌ | Full ENS support |
| **Safe** | ✅ | ✅ | ❌ | ❌ | ❌ | Full ENS support |
| **MEW** | ✅ | ✅ | ❌ | ❌ | ❌ | Full ENS support |
| **Trust** | ✅ | ❌ | ❌ | ❌ | ❌ | Basic ENS (mainnet only) |
| **Rabby** | ⚠️ Import only | ❌ | ❌ | ❌ | ❌ | Import only (can't send to .eth) |
| **Enkrypt** | ✅ | ❌ | ❌ | ❌ | ❌ | Basic ENS (mainnet only) |
| **Ambire** | ✅ | ❌ | ❌ | ❌ | ❌ | Basic ENS (mainnet only) |
| **Daimo** | ✅ | ❌ | ❌ | ❌ | ❌ | Basic ENS (mainnet only) |
| **Zerion** | ✅ | ❌ | ❌ | ❌ | ❌ | Basic ENS (mainnet only) |
| **imToken** | ✅ | ❌ | ❌ | ❌ | ❌ | Basic ENS (mainnet only) |
| **Phantom** | ❌ | ❌ | ❌ | ❌ | ❌ | No ENS support |
| **OKX** | ❌ | ❌ | ❌ | ❌ | ❌ | No ENS support |
| **Sequence** | ❌ | ❌ | ❌ | ❌ | ❌ | No ENS support |
| **Uniswap** | ❌ | ❌ | ❌ | ❌ | ❌ | No ENS support |
| **Taho** | ❌ | ❌ | ❌ | ❌ | ❌ | No ENS support |
| **Wigwam** | ❌ | ❌ | ❌ | ❌ | ❌ | No ENS support |
| **Argent** | ❌ | ❌ | ❌ | ❌ | ❌ | No ENS support |
| **Frame** | ❌ | ❌ | ❌ | ❌ | ❌ | No ENS support |
| **Brave** | ❌ | ❌ | ❌ | ❌ | ❌ | No ENS support |
| **Ledger Live** | ❌ | ❌ | ❌ | ❌ | ❌ | No ENS support |
| **1inch** | ❌ | ❌ | ❌ | ❌ | ❌ | No ENS support |
| **Block** | ❌ | ❌ | ❌ | ❌ | ❌ | No ENS support |

**ENS Support Levels:** ✅ Full = Mainnet + subdomains + offchain + L2s | ✅ Basic = Mainnet ENS only | ⚠️ Import only = Can import but not send to .eth | ❌ = No ENS support

### Browser Integration

| Wallet | EIP-1193 | EIP-2700 | EIP-6963 | WC v2 | In-App Browser | Notes |
|--------|----------|----------|----------|-------|----------------|-------|
| **MetaMask** | ✅ | ✅ | ✅ | ✅ | ✅ (mobile) | Standard wallet injection |
| **Rabby** | ✅ | ✅ | ✅ | ✅ | ❌ | Standard wallet injection |
| **Trust** | ✅ | ✅ | ✅ | ✅ | ✅ (mobile) | Standard wallet injection |
| **Rainbow** | ✅ | ✅ | ✅ | ✅ | ✅ (mobile) | Standard wallet injection |
| **Coinbase** | ✅ | ✅ | ✅ | ✅ | ✅ | Standard wallet injection |
| **Brave** | ✅ | ✅ | ✅ | ❌ | ❌ | Built into browser |
| **Enkrypt** | ✅ | ✅ | ✅ | ❌ | ❌ | Browser extension only |
| **Ambire** | ✅ | ✅ | ✅ | ✅ | ❌ | Browser extension only |
| **Phantom** | ✅ | ✅ | ✅ | ✅ | ✅ | Standard wallet injection |
| **OKX** | ✅ | ✅ | ✅ | ✅ | ✅ | Standard wallet injection |
| **Sequence** | ✅ | ✅ | ✅ | ✅ | ❌ | Web SDK only |
| **Taho** | ✅ | ✅ | ✅ | ❌ | ❌ | Browser extension only |
| **Zerion** | ✅ | ✅ | ✅ | ✅ | ✅ | Standard wallet injection |
| **Wigwam** | ✅ | ✅ | ✅ | ✅ | ✅ | Standard wallet injection |
| **Frame** | ✅ | ✅ | ❌ | ❌ | ❌ | Desktop-only |
| **Block** | ✅ | ✅ | ✅ | ✅ | ✅ | Standard wallet injection |
| **Safe** | N/A | N/A | N/A | ✅ | ❌ | Web app only (WalletConnect) |
| **Ledger Live** | N/A | N/A | N/A | ✅ | ❌ | Mobile/desktop app (WalletConnect) |
| **MEW** | N/A | N/A | N/A | ✅ | ✅ (mobile) | Web + mobile (WalletConnect) |
| **Uniswap** | N/A | N/A | N/A | ✅ | ✅ | Web + mobile (WalletConnect) |
| **Daimo** | N/A | N/A | N/A | ✅ | ❌ | Mobile-only (WalletConnect) |
| **1inch** | N/A | N/A | N/A | ✅ | ✅ | Mobile-only (WalletConnect) |
| **imToken** | N/A | N/A | N/A | ✅ | ✅ | Mobile-only (WalletConnect) |
| **Argent** | N/A | N/A | N/A | ✅ | ✅ | Mobile + Starknet desktop (WalletConnect) |

**Browser Integration Standards:**
- **EIP-1193:** Provider API (`window.ethereum`) — standard wallet injection
- **EIP-2700:** Provider Events (`accountsChanged`, `chainChanged`) — event handling
- **EIP-6963:** Multi-Wallet Discovery — modern standard for detecting multiple wallets
- **WC v2:** WalletConnect v2 (current standard; v1 deprecated June 2023)
- **N/A:** Mobile-only or web-app wallets don't inject into browser (use WalletConnect instead)

---

## 📋 EIP Support Matrix

Detailed EIP support for developers building dApps:

| Wallet | EIP-712 | EIP-2612 | EIP-4337 | EIP-5792 | EIP-7702 | EIP-7710 | Typed Data |
|--------|---------|----------|----------|----------|----------|----------|------------|
| **MetaMask** | ✅ | ✅ | ⚠️ Snap | ⚠️ Partial | ✅ | ⚠️ Alpha | ✅ v4 |
| **Rabby** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ v4 |
| **Safe** | ✅ | ✅ | ✅ | ⚠️ Partial | ❌ | ❌ | ✅ v4 |
| **Rainbow** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ v4 |
| **Coinbase** | ✅ | ✅ | ✅ | ⚠️ Partial | ❌ | ❌ | ✅ v4 |
| **Trust** | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ v4 |
| **Ambire** | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ v4 |
| **Brave** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ v4 |
| **Ledger Live** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ v4 |
| **Sequence** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ v4 |
| **Uniswap** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ v4 |
| **Enkrypt** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ v4 |
| **MEW** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ v4 |
| **Phantom** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ v4 |
| **Daimo** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ v4 |
| **Frame** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ v4 |
| **OKX** | ✅ | ✅ | ❌ | ⚠️ Partial | ✅ | ❌ | ✅ v4 |
| **Zerion** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ v4 |
| **Taho** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ v4 |
| **Argent** | ✅ | ✅ | ✅ | ⚠️ Partial | ❌ | ❌ | ✅ v4 |

**EIP Definitions:**
- **EIP-712:** Typed structured data hashing and signing (common for permits, orders) — Foundational standard for human-readable message signing
- **EIP-2612:** Permit extension for ERC-20 (gasless approvals)
- **EIP-4337:** Account Abstraction (smart contract wallets, paymasters) — enables **gas abstraction** (pay gas in any token like USDC), **sponsored transactions** (someone else pays your gas), batching, and social recovery
- **EIP-5792:** Wallet Call API (`wallet_sendCalls` method for batch transactions, atomic operations)
- **EIP-7702:** Set EOA account code (upgrade EOA to smart account temporarily) — enables batching, gas sponsorship, and session keys for regular wallets without converting to smart contract wallet
- **EIP-7710:** Smart Contract Delegation (⚠️ Draft) — enables **persistent sessions** with dApps without repeated signing, **delegated permissions** to AI agents or automated systems, and shareable invite links with bounded capabilities. Works with EIP-4337. Related: EIP-7715 (wallet API for granting permissions). MetaMask has alpha support via [Delegation Framework](https://github.com/MetaMask/delegation-framework) (Gated Alpha).
- **EIP-7730:** Structured Data Clear Signing Format — Proposed by Ledger, currently Draft status. Standardizes JSON format for clear-signing smart contract calls and typed messages. Designed for hardware wallets with limited screen space. **Wallet support status unknown** — too new for widespread adoption (as of Dec 2025)
- **Typed Data:** eth_signTypedData version support (v4 is current standard)

**Clear Signing & Safety Features:**
- **Clear Signing** refers to wallets displaying structured data in human-readable format when users sign messages or transactions, rather than showing opaque hexadecimal strings
- **EIP-712** is the foundational standard that enables human-readable message signing — all modern wallets support it
- **EIP-7730** builds on EIP-712 by adding formatting metadata for better display (especially important for hardware wallets like Ledger)
- **Enhanced clear signing:** Rabby offers enhanced domain verification and address highlighting (via EIP-712)
- **Safety features:** All wallets include phishing protection; Rabby adds transaction simulation and risk checks

**EIP Support Status:**
- ✅ **Full Support:** Wallet implements the complete EIP specification
- ⚠️ **Partial Support:** Wallet has limited or experimental implementation (see details below)
- ❌ **No Support:** Wallet does not implement this EIP

**EIP-5792 Partial Support Details:**
- **MetaMask:** Experimental/limited support — may require specific configurations or extensions
- **Coinbase:** Partial implementation — supports `wallet_sendCalls` but may have limitations
- **OKX:** Partial implementation — supports batch transactions via EIP-5792 methods
- **Safe:** Partial support — smart contract wallets can batch, but EIP-5792 API may be limited
- **Argent:** Partial support — smart contract wallet batching available, EIP-5792 API support varies
- **Sequence:** ✅ Full support — native implementation of EIP-5792 `wallet_sendCalls` API

**Developer Notes:**
- All modern wallets support EIP-712 — use it for permits and orders
- EIP-2612 (permit) is widely supported — prefer gasless approvals
- EIP-4337 requires bundler infrastructure — only relevant for smart wallets
- EIP-5792 is new (2024) — Sequence has full support; MetaMask, Coinbase, OKX, Safe, and Argent have partial support. Standardizes `wallet_sendCalls` for atomic batch transactions.
- EIP-7702 is cutting edge — MetaMask, Ambire, Trust, and OKX support it ([source](https://github.com/fireblocks-labs/awesome-eip-7702#wallets-support-updates))
- EIP-7710 is Draft status — MetaMask has ⚠️ Alpha support via the [Delegation Framework](https://github.com/MetaMask/delegation-framework) (Gated Alpha, not yet GA). Enables persistent dApp sessions without repeated signing, delegated permissions to AI agents, and shareable invite links with bounded capabilities.

---

## 🔧 EIP-7702 Wallet Support (Pectra Upgrade)

EIP-7702 allows EOAs (Externally Owned Accounts) to temporarily delegate to smart contract code, enabling features like batching, gas sponsorship, and session keys without converting to a full smart contract wallet.

### Wallets with EIP-7702 Support

| Wallet | Status | Default | Source |
|--------|--------|---------|--------|
| **MetaMask** | ✅ Live | EOA | [MetaMask Smart Accounts](https://metamask.io/news/metamask-feature-update-smart-accounts) |
| **Trust Wallet** | ✅ Live | EOA | [BeInCrypto Report](https://beincrypto.com/trust-wallet-ethereum-eip7702-support/) |
| **Ambire** | ✅ Live | 7702 | [Ambire Blog](https://blog.ambire.com/eip-7702-wallet/) |
| **OKX** | ✅ Live | EOA | [OKX Help Center](https://web3.okx.com/help/okx-wallet-to-support-eip-7702) |
| Safe | 🔬 POC | Safe | [safe-eip7702](https://github.com/5afe/safe-eip7702) (experimental) |

### What EIP-7702 Enables

- **Batching:** Multiple operations in one atomic transaction (e.g., approve + swap)
- **Gas Sponsorship:** Account X pays gas for account Y's transactions
- **Session Keys:** Delegate limited permissions to sub-keys (e.g., spend limits)
- **Privilege De-escalation:** Grant apps limited access without full account control

### Developer Resources

- [EIP-7702 Specification](https://eips.ethereum.org/EIPS/eip-7702)
- [Awesome EIP-7702](https://github.com/fireblocks-labs/awesome-eip-7702) — Curated list of tools, guides, and implementations
- [7702 Checker](https://7702checker.azfuller.com/) — Check chain support for EIP-7702
- [MetaMask Delegation Framework](https://github.com/MetaMask/delegation-framework) — Reference implementation
- [Viem EIP-7702 Support](https://viem.sh/experimental/eip7702) — TypeScript library support

**Note:** EIP-7702 was activated in Ethereum's Pectra upgrade. Check [7702 Beat](https://swiss-knife.xyz/7702beat) for current chain and wallet adoption status.

### Wallets to Watch for Future 7702 Support

| Wallet | Status | Evidence |
|--------|--------|----------|
| **Uniswap** | 🔬 Contract deployed | [Calibur](https://github.com/Uniswap/calibur) v1.0.0 on mainnet, audited by OpenZeppelin & Cantina |
| **Bitget** | 📡 On 7702 Beat | Listed on [swiss-knife.xyz/7702beat](https://swiss-knife.xyz/7702beat), no official announcement |
| **Coinbase** | ⏳ Expected | Has EIP-4337; 7702 likely coming |

*Wallets are only added to the "Supported" table when verified by [awesome-eip-7702](https://github.com/fireblocks-labs/awesome-eip-7702) or official announcement.*

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

**Quick Tips:**
- Use wallet abstraction libraries (wagmi, viem) to avoid locking to one wallet
- Prioritize: Developer-friendly (Rabby, Safe) → Stable & active (Rainbow, Enkrypt, Trust) → MetaMask (compatibility only)
- Test with multiple wallets — each has quirks

### Use Wallet Abstraction

```bash
npm install wagmi viem
```

Abstract wallet dependencies so you're not locked to any single wallet. See [Integration Best Practices](#integration-best-practices) for detailed guidance.

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
| [MetaMask/metamask-extension](https://github.com/MetaMask/metamask-extension) | Dec 15, 2025 | ✅ Active |
| [RabbyHub/Rabby](https://github.com/RabbyHub/Rabby) | Dec 16, 2025 | ✅ Active |
| [coinbase/coinbase-wallet-sdk](https://github.com/coinbase/coinbase-wallet-sdk) | Jul 11, 2025 | ⚠️ Slow |
| [trustwallet/wallet-core](https://github.com/trustwallet/wallet-core) | Dec 5, 2025 | ✅ Active |
| [rainbow-me/rainbow](https://github.com/rainbow-me/rainbow) | Dec 2, 2025 | ✅ Active |
| [tahowallet/extension](https://github.com/tahowallet/extension) | Dec 5, 2025 | ✅ Active |
| [MyEtherWallet/MyEtherWallet](https://github.com/MyEtherWallet/MyEtherWallet) | Nov 27, 2025 | ✅ Active |
| [AmbireTech/extension](https://github.com/AmbireTech/extension) | Dec 10, 2025 | ✅ Active |
| [block-wallet/extension](https://github.com/block-wallet/extension) | Nov 27, 2024 | ❌ Inactive |
| [wigwamapp/wigwam](https://github.com/wigwamapp/wigwam) | Dec 11, 2025 | ✅ Active |
| [safe-global/safe-wallet-monorepo](https://github.com/safe-global/safe-wallet-monorepo) | Dec 15, 2025 | ✅ Active |
| [argentlabs/argent-x](https://github.com/argentlabs/argent-x) | Mar 14, 2025 | ❌ Inactive |
| [floating/frame](https://github.com/floating/frame) | Feb 01, 2025 | ❌ Inactive |
| [brave/brave-browser](https://github.com/brave/brave-browser) | Dec 15, 2025 | ✅ Active |
| [enkryptcom/enKrypt](https://github.com/enkryptcom/enKrypt) | Nov 27, 2025 | ✅ Active |
| [ethereum/kohaku-extension](https://github.com/ethereum/kohaku-extension) | Aug 12, 2025 | ❌ Stale Fork |

**Not Verified (private repos):** OKX, 1inch, Zerion, Phantom

---

## ⚠️ Activity Status Details (November 2025)

Several previously recommended wallets have **stopped active development**. See the "Alt" column in the main table for recommended alternatives.

| Wallet | Last Commit | Status | Note |
|--------|-------------|--------|------|
| **Block Wallet** | Nov 2024 | ❌ INACTIVE | 1 year without commits |
| **Frame** | Feb 2025 | ❌ INACTIVE | 10 months without commits |
| **Argent-X** | Mar 2025 | ❌ INACTIVE | 8 months without commits |
| **Kohaku**∆ | Aug 2025 | ❌ STALE FORK | Ethereum Foundation fork of Ambire v5.18.0 — use Ambire instead |
| **Coinbase SDK** | Jul 2025 | ⚠️ SLOW | 5 months without commits |
| **Ambire** | Dec 2025 | ✅ ACTIVE | Active development, v5.32.2 released Dec 10, 2025 |
| **Wigwam** | Dec 2025 | ✅ ACTIVE | Resumed development Dec 11, 2025 |
| **Taho** | Dec 2025 | ✅ ACTIVE | Resumed development Dec 5, 2025 |

---

## 📝 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a complete history of changes to wallet statuses, recommendations, and documentation structure.

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

*Last updated: December 17, 2025. Verified and corrected Devices column: Added ⚡ emoji for browser proxy (Frame-style); fixed Wigwam (browser-only, no mobile), Block Wallet (browser-only, no mobile), Safe (has mobile app). Added "Desktop App Wallets (Frame-like Architecture)" section explaining Frame's unique design. Full wallet validation via GitHub API refresh. Data from [WalletBeat](https://walletbeat.fyi), [awesome-eip-7702](https://github.com/fireblocks-labs/awesome-eip-7702), [7702 Beat](https://swiss-knife.xyz/7702beat), and GitHub API.*
