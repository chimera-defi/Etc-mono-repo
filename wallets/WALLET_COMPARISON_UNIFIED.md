# Crypto Wallet Comparison for Developers

> **TL;DR:** Use **Rabby** for development (transaction simulation), **Safe** or **Trust Wallet** for production (active development + stable), and **MetaMask** only for compatibility testing.

**Data Sources:** GitHub REST API (Nov 2024, activity Nov 2025), [WalletBeat](https://walletbeat.fyi) (Dec 2025)

---

## Complete Wallet Comparison (All 19 EVM Wallets)

| Wallet | GitHub | Last Commit | Active | Chains | RPC | Stars | Issues | Ratio | Stability | Devices | Testnets | License | Tx Sim | EIP-4337 | Best For | Rec |
|--------|--------|-------------|--------|--------|-----|-------|--------|-------|-----------|---------|----------|---------|--------|----------|----------|-----|
| **MetaMask** | [metamask-extension](https://github.com/MetaMask/metamask-extension) | Nov 27, 2025 | ✅ | Any | ✅ | 12,949 | 2,509 | 19.4% | ⭐⭐ | 📱🌐 | ✅ | ⚠️ Src-Avail | ❌ | ⚠️ | Compatibility | 🔴 |
| **Rabby** | [Rabby](https://github.com/RabbyHub/Rabby) | Nov 21, 2025 | ✅ | 94 | ✅ | 1,726 | 120 | 7.0% | ⭐⭐⭐⭐ | 📱🌐💻 | ✅ | ✅ MIT/⚠️ | ✅ | ❌ | Development | 🟢 |
| **Coinbase** | [coinbase-wallet-sdk](https://github.com/coinbase/coinbase-wallet-sdk) | Jul 11, 2025 | ⚠️ | 20+ | ⚠️ | 1,695 | 44 | 2.6% | ⭐⭐⭐⭐ | 📱🌐 | ✅ | ⚠️ Partial | ❌ | ✅ | Production | 🟡 |
| **Trust** | [wallet-core](https://github.com/trustwallet/wallet-core) | Nov 27, 2025 | ✅ | 163 | ✅ | 3,354 | 69 | 2.1% | ⭐⭐⭐ | 📱🌐 | ✅ | ⚠️ Partial | ❌ | ❌ | Multi-chain | 🟢 |
| **Rainbow** | [rainbow](https://github.com/rainbow-me/rainbow) | Nov 26, 2025 | ✅ | 15+ | ⚠️ | 4,238 | 13 | 0.3% | ⭐⭐⭐ | 📱🌐 | ✅ | ✅ GPL-3 | ❌ | ❌ | NFT/Ethereum | 🟢 |
| **Taho** | [extension](https://github.com/tahowallet/extension) | Oct 30, 2025 | ⚠️ | EVM | ✅ | 3,179 | 338 | 10.6% | ⭐⭐⭐ | 🌐 | ✅ | ✅ GPL-3 | ❌ | ❌ | Community | 🟡 |
| **MEW** | [MyEtherWallet](https://github.com/MyEtherWallet/MyEtherWallet) | Nov 27, 2025 | ✅ | ETH/EVM | ✅ | 1,560 | 47 | 3.0% | ⭐⭐⭐⭐ | 📱🔗 | ✅ | ✅ MIT | ❌ | ❌ | Ethereum | 🟢 |
| **Ambire** | [wallet](https://github.com/AmbireTech/wallet) | Aug 12, 2025 | ⚠️ | EVM | ✅ | 213 | 2 | 0.9% | ⭐⭐⭐⭐ | 📱🌐 | ✅ | ✅ GPL-3 | ❌ | ✅ | Smart wallet | 🟡 |
| **Block** | [extension](https://github.com/block-wallet/extension) | Nov 27, 2024 | ❌ | ~20 | ✅ | 96 | 45 | 46.9% | ⭐⭐⭐⭐ | 📱🌐 | ✅ | ✅ MIT | ❌ | ❌ | ~~Stability~~ | 🔴 |
| **Wigwam** | [wigwam](https://github.com/wigwamapp/wigwam) | Sep 11, 2025 | ⚠️ | Any | ✅ | 83 | 7 | 8.4% | ⭐⭐⭐⭐ | 📱🌐 | ✅ | ✅ MIT | ❌ | ❌ | Stability | 🟡 |
| **Safe** | [safe-wallet-monorepo](https://github.com/safe-global/safe-wallet-monorepo) | Nov 27, 2025 | ✅ | 30+ | ✅ | 524 | 114 | 21.8% | ⭐⭐⭐⭐ | 📱🌐 | ✅ | ✅ GPL-3 | ❌ | ✅ | Enterprise | 🟢 |
| **Argent** | [argent-x](https://github.com/argentlabs/argent-x) | Mar 14, 2025 | ❌ | 2 | ❌ | 641 | 93 | 14.5% | ⭐⭐⭐⭐ | 📱🌐† | ✅ | ✅ GPL-3 | ❌ | ✅ | ~~Starknet~~ | 🔴 |
| **OKX** | Private | - | ? | 100+ | ✅ | - | - | - | ⭐⭐⭐⭐ | 📱🌐 | ✅ | ❌ Proprietary | ❌ | ⚠️ | EIP-7702 | 🟡 |
| **Frame** | [frame](https://github.com/floating/frame) | Feb 01, 2025 | ❌ | Any | ✅ | 1,160 | 95 | 8.2% | ⭐⭐⭐⭐ | 💻 | ✅ | ✅ GPL-3 | ✅ | ❌ | ~~Desktop~~ | 🔴 |
| **Phantom** | Private | - | ? | 5 | ❌ | - | - | - | ⭐⭐⭐ | 📱🌐 | ❌ | ❌ Proprietary | ❌ | ❌ | Solana-first | 🟡 |
| **Zerion** | Private | - | ? | ? | ? | - | - | - | ⭐⭐⭐ | 📱🌐 | ? | ❌ Proprietary | ❌ | ❌ | Portfolio | ⚪ |
| **1inch** | Private | - | ? | ? | ? | - | - | - | ⭐⭐⭐ | 📱 | ? | ❌ Proprietary | ❌ | ❌ | DeFi | ⚪ |
| **Brave** | [brave-browser](https://github.com/brave/brave-browser) | Nov 28, 2025 | ✅ | 10+ | ✅ | 20,764 | 9,997 | 48.1% | ⭐⭐⭐⭐ | 📱🌐§ | ✅ | ✅ MPL-2 | ❌ | ❌ | Brave users | 🟢 |
| **Enkrypt** | [enKrypt](https://github.com/enkryptcom/enKrypt) | Nov 27, 2025 | ✅ | 75+ | ✅ | 411 | 21 | 5.1% | ⭐⭐⭐⭐ | 🌐 | ✅ | ✅ MIT | ❌ | ❌ | Multi-chain | 🟢 |

**Legend:**
- 🟢 Recommended | 🟡 Situational | 🔴 Avoid | ⚪ Not for dev
- **Devices:** 📱 Mobile | 🌐 Browser Extension | 💻 Desktop | 🔗 Web App
- **License:** ✅ FOSS (MIT, GPL, MPL) | ⚠️ Source-Available/Partial | ❌ Proprietary
- † Argent desktop extension is Starknet-only
- § Brave Wallet is built into Brave browser
- ~~Strikethrough~~ = was recommended, now inactive

**Activity:** ✅ Active (last 30 days) | ⚠️ Slow (1-4 months) | ❌ Inactive (4+ months) | ? Unknown

**Columns:** Chains = Built-in chain count | RPC = Custom RPC support | Testnets = Custom chains/testnet support | Tx Sim = Transaction simulation | EIP-4337 = Account Abstraction

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

### For Multi-Chain EVM
1. **Trust Wallet** — 163 chains ✅ Active
2. **Enkrypt** — 75+ EVM chains ✅ Active
3. **Brave Wallet** — Built into Brave browser ✅ Active

### For Classic Ethereum
1. **MEW (MyEtherWallet)** — Web + mobile, 3.0% issue ratio, active ✅ Active

---

## Summary

| Question | Answer |
|----------|--------|
| Best for development? | **Rabby** (transaction simulation, 94 EVM chains, active) |
| Best for production? | **Trust Wallet** (163 chains) or **Rainbow** (curated chains) |
| Most EVM chains? | **Trust Wallet** (163) > **OKX** (100+) > **Rabby** (94) > **Enkrypt** (75+) |
| Best custom RPC? | **MetaMask** or **Safe** (set RPC before any requests) |
| Best for AA? | **Safe** (web, active, 30+ chains) or **Ambire** (smart wallet) |
| Best multi-chain EVM? | **Trust Wallet** or **Enkrypt** (both 75+ EVM chains) |
| Best classic Ethereum? | **MEW** (MyEtherWallet) - web + mobile, active, excellent code quality |
| Best community-owned? | **Taho** (formerly Tally Ho) - 3,179 stars, open source |
| Avoid? | **Block Wallet** ❌, **Frame** ❌, **Argent-X** ❌ (all inactive) |

### ⚠️ Previously Recommended, Now Inactive
| Wallet | Status | Alternative |
|--------|--------|-------------|
| Block Wallet | ❌ No commits since Nov 2024 | Rainbow, Enkrypt |
| Frame | ❌ No commits since Feb 2025 | Rabby |
| Argent-X | ❌ No commits since Mar 2025 | Safe |
| Coinbase SDK | ⚠️ Slow (Jul 2025) | Trust Wallet |

---

## Detailed License Information (from WalletBeat)

| Wallet | Browser Ext License | Mobile License | Core License | FOSS Status |
|--------|---------------------|----------------|--------------|-------------|
| **MetaMask** | Proprietary src-avail | Proprietary src-avail | MIT | ⚠️ Partial |
| **Rabby** | MIT | Unlicensed (visible) | Unlicensed | ⚠️ Mixed |
| **Rainbow** | GPL-3.0 | GPL-3.0 | - | ✅ FOSS |
| **Safe** | GPL-3.0 | GPL-3.0 | - | ✅ FOSS |
| **Phantom** | Proprietary | Proprietary | - | ❌ Closed |
| **Frame** | GPL-3.0 | N/A | - | ✅ FOSS |
| **Ambire** | GPL-3.0 | GPL-3.0 | - | ✅ FOSS |
| **Argent** | GPL-3.0 | GPL-3.0 | - | ✅ FOSS |
| **Brave** | MPL-2.0 | MPL-2.0 | - | ✅ FOSS |
| **Enkrypt** | MIT | N/A | - | ✅ FOSS |
| **Trust** | Apache-2.0 (core) | - | Apache-2.0 | ⚠️ Partial |
| **MEW** | MIT | MIT | - | ✅ FOSS |
| **Coinbase** | Partial | Partial | MIT | ⚠️ Partial |
| **OKX** | Proprietary | Proprietary | - | ❌ Closed |
| **Zerion** | Proprietary | Proprietary | - | ❌ Closed |
| **1inch** | Proprietary | Proprietary | - | ❌ Closed |

**License Types:**
- **FOSS:** MIT, GPL-3.0, Apache-2.0, MPL-2.0, BSD-3-Clause
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
| [AmbireTech/wallet](https://github.com/AmbireTech/wallet) | Aug 12, 2025 | ⚠️ Slow |
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

*Last updated: December 1, 2025. Added license, device, and testnet data from [WalletBeat](https://walletbeat.fyi). Activity status, chain counts verified via GitHub API. Verify current capabilities before implementation.*
