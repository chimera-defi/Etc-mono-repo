# Crypto Wallet Comparison for Developers

> **TL;DR:** Use **Rabby** for development (transaction simulation), **Safe** or **Trust Wallet** for production (active development + stable), and **MetaMask** only for compatibility testing.

**Data Sources:** GitHub REST API (Nov 2024, activity Nov 2025), [WalletBeat](https://walletbeat.fyi) (Dec 2025)

---

## Complete Wallet Comparison (All 19 EVM Wallets)

| Wallet | GitHub | Active | Chains | Devices | Testnets | License | Account Type | HW Wallets | EIP-4337 | Best For | Rec |
|--------|--------|--------|--------|---------|----------|---------|--------------|------------|----------|----------|-----|
| **MetaMask** | [metamask-extension](https://github.com/MetaMask/metamask-extension) | ✅ | Any | 📱🌐 | ✅ | ⚠️ Src-Avail | EOA+7702 | ✅ Ledger/Trezor/Keystone/GridPlus | ⚠️ | Compatibility | 🔴 |
| **Rabby** | [Rabby](https://github.com/RabbyHub/Rabby) | ✅ | 94 | 📱🌐💻 | ✅ | ✅ MIT | EOA+Safe | ✅ Ledger/Trezor/Keystone/GridPlus | ❌ | Development | 🟢 |
| **Coinbase** | [coinbase-wallet-sdk](https://github.com/coinbase/coinbase-wallet-sdk) | ⚠️ | 20+ | 📱🌐 | ✅ | ⚠️ Partial | EOA+4337 | ✅ Ledger/Trezor | ✅ | Production | 🟡 |
| **Trust** | [wallet-core](https://github.com/trustwallet/wallet-core) | ✅ | 163 | 📱🌐 | ✅ | ⚠️ Apache-2 | EOA | ✅ Multiple | ❌ | Multi-chain | 🟢 |
| **Rainbow** | [rainbow](https://github.com/rainbow-me/rainbow) | ✅ | 15+ | 📱🌐 | ✅ | ✅ GPL-3 | EOA | ✅ Ledger/Trezor | ❌ | NFT/Ethereum | 🟢 |
| **Safe** | [safe-wallet-monorepo](https://github.com/safe-global/safe-wallet-monorepo) | ✅ | 30+ | 📱🌐 | ✅ | ✅ GPL-3 | Safe+4337 | ✅ Ledger/Trezor/Keystone | ✅ | Enterprise | 🟢 |
| **Ambire** | [extension](https://github.com/AmbireTech/extension) | ⚠️ | EVM | 🌐 | ✅ | ✅ GPL-3 | 7702+4337 | ✅ Ledger/Trezor/GridPlus | ✅ | Smart wallet | 🟡 |
| **MEW** | [MyEtherWallet](https://github.com/MyEtherWallet/MyEtherWallet) | ✅ | ETH | 📱🔗 | ✅ | ✅ MIT | EOA | ✅ Multiple | ❌ | Ethereum | 🟢 |
| **Taho** | [extension](https://github.com/tahowallet/extension) | ⚠️ | EVM | 🌐 | ✅ | ✅ GPL-3 | EOA | ✅ Multiple | ❌ | Community | 🟡 |
| **Frame** | [frame](https://github.com/floating/frame) | ❌ | Any | 💻 | ✅ | ✅ GPL-3 | EOA | ✅ Ledger/Trezor/Keystone/GridPlus | ❌ | ~~Desktop~~ | 🔴 |
| **Brave** | [brave-browser](https://github.com/brave/brave-browser) | ✅ | 10+ | 📱🌐§ | ✅ | ✅ MPL-2 | EOA | ✅ Multiple | ❌ | Brave users | 🟢 |
| **Enkrypt** | [enKrypt](https://github.com/enkryptcom/enKrypt) | ✅ | 75+ | 🌐 | ✅ | ✅ MIT | EOA | ✅ Multiple | ❌ | Multi-chain | 🟢 |
| **imToken** | [token-core](https://github.com/consenlabs/token-core-monorepo) | ✅ | 50+ | 📱 | ✅ | ⚠️ Apache-2 | EOA | ✅ Keystone/imKey | ❌ | Multi-chain | 🟢 |
| **Daimo** | [daimo](https://github.com/daimo-eth/daimo) | ✅ | Base | 📱 | ❌ | ✅ GPL-3 | 4337 only | ❌ | ✅ | Payments | 🟢 |
| **Phantom** | Private | ? | 5 | 📱🌐 | ❌ | ❌ Proprietary | EOA | ✅ Ledger only | ❌ | Solana-first | 🟡 |
| **Zerion** | Private | ? | 20+ | 📱🌐 | ? | ❌ Proprietary | EOA | ✅ Ledger+WC | ❌ | Portfolio | ⚪ |
| **OKX** | Private | ? | 100+ | 📱🌐 | ✅ | ❌ Proprietary | EOA | ✅ Multiple | ⚠️ | EIP-7702 | 🟡 |
| **Argent** | [argent-x](https://github.com/argentlabs/argent-x) | ❌ | 2 | 📱🌐† | ✅ | ✅ GPL-3 | 4337 | ✅ Multiple | ✅ | ~~Starknet~~ | 🔴 |
| **Block** | [extension](https://github.com/block-wallet/extension) | ❌ | ~20 | 📱🌐 | ✅ | ✅ MIT | EOA | ✅ Multiple | ❌ | ~~Stability~~ | 🔴 |
| **Wigwam** | [wigwam](https://github.com/wigwamapp/wigwam) | ⚠️ | Any | 📱🌐 | ✅ | ✅ MIT | EOA | ✅ Multiple | ❌ | Stability | 🟡 |
| **1inch** | Private | ? | ? | 📱 | ? | ❌ Proprietary | EOA | ? | ❌ | DeFi | ⚪ |

**Legend:**
- 🟢 Recommended | 🟡 Situational | 🔴 Avoid | ⚪ Not for dev
- **Devices:** 📱 Mobile | 🌐 Browser Extension | 💻 Desktop | 🔗 Web App
- **License:** ✅ FOSS (MIT, GPL, MPL) | ⚠️ Source-Available/Partial | ❌ Proprietary
- **Account Type:** EOA = Standard | Safe = Multi-sig | 4337 = Smart Account | 7702 = Upgraded EOA
- † Argent desktop extension is Starknet-only
- § Brave Wallet is built into Brave browser
- ~~Strikethrough~~ = was recommended, now inactive

**Activity:** ✅ Active (last 30 days) | ⚠️ Slow (1-4 months) | ❌ Inactive (4+ months) | ? Unknown

**Data Sources:** GitHub REST API (verified Nov 2025), [WalletBeat](https://walletbeat.fyi) (Dec 2025)

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
| **MetaMask** | ✅ | ? | ? | ? | ? |
| **Rabby** | ⚠️ Import only | ? | ❌ | ❌ | ❌ |
| **Safe** | ? | ? | ? | ? | ? |
| **Rainbow** | ? | ? | ? | ? | ? |
| **Coinbase** | ✅ | ? | ? | ? | ✅ (cb.id) |
| **Ambire** | ✅ | ? | ❌ | ❌ | ? |
| **imToken** | ✅ | ? | ? | ? | ? |
| **Daimo** | ✅ | ? | ❌ | ❌ | ❌ |
| **Phantom** | ? | ? | ? | ? | ? |

**ENS Features:**
- **Mainnet ENS:** Send to user.eth addresses
- **Subdomains:** Send to hot.user.eth
- **Offchain:** ENS with offchain resolvers
- **L2 ENS:** ENS resolution on L2s (e.g., Optimism)
- **Custom Domains:** Custom ENS domains (e.g., user.cb.id)

---

## Browser Integration (from WalletBeat)

| Wallet | EIP-1193 | EIP-2700 | EIP-6963 | WalletConnect | In-App Browser |
|--------|----------|----------|----------|---------------|----------------|
| **MetaMask** | ✅ | ✅ | ✅ | ✅ | ✅ (mobile) |
| **Rabby** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Safe** | ? | ? | ? | ✅ | ❌ |
| **Rainbow** | ? | ? | ? | ✅ | ✅ |
| **Coinbase** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Ambire** | ✅ | ✅ | ✅ | ? | ❌ |
| **imToken** | N/A | N/A | N/A | ✅ | ✅ |
| **Daimo** | N/A | N/A | N/A | ✅ | ❌ |
| **Phantom** | ✅ | ? | ? | ✅ | ✅ |
| **Zerion** | ? | ? | ? | ✅ | ✅ |

**EIPs:**
- **EIP-1193:** Standard Ethereum Provider API (`window.ethereum`)
- **EIP-2700:** Provider event system (`.on()`, `.removeListener()`)
- **EIP-6963:** Multi-wallet discovery ([test at eip6963.org](https://eip6963.org))

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
