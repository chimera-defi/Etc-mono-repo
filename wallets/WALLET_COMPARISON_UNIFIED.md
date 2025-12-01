# Crypto Wallet Comparison for Developers

> **TL;DR:** Use **Rabby** for development (transaction simulation), **Safe** or **Trust Wallet** for production (active development + stable), and **MetaMask** only for compatibility testing.

**Data Sources:** GitHub REST API (Nov 2024, activity Nov 2025), [WalletBeat](https://walletbeat.fyi) (Dec 2025)

---

## Complete Wallet Comparison (All 19 EVM Wallets)

| Wallet | GitHub | Active | Chains | Devices | Testnets | License | Audits | Funding | Tx Sim | Scam | Account Type | HW Wallets | EIP-4337 | Best For | Rec |
|--------|--------|--------|--------|---------|----------|---------|--------|---------|--------|------|--------------|------------|----------|----------|-----|
| **MetaMask** | [metamask-extension](https://github.com/MetaMask/metamask-extension) | ✅ | Any | 📱🌐 | ✅ | ⚠️ Src-Avail | ✅ 2025 | 🟢 Consensys | ⚠️ | ⚠️ | EOA+7702 | ✅ Ledger/Trezor/Keystone/GridPlus | ⚠️ | Compatibility | 🔴 |
| **Rabby** | [Rabby](https://github.com/RabbyHub/Rabby) | ✅ | 94 | 📱🌐💻 | ✅ | ✅ MIT | ⚠️ Mobile | 🟢 DeBank | ✅ | ✅ | EOA+Safe | ✅ Ledger/Trezor/Keystone/GridPlus | ❌ | Development | 🟢 |
| **Coinbase** | [coinbase-wallet-sdk](https://github.com/coinbase/coinbase-wallet-sdk) | ⚠️ | 20+ | 📱🌐 | ✅ | ⚠️ Partial | ❓ Private | 🟢 Coinbase | ✅ | ✅ | EOA+4337 | ✅ Ledger/Trezor | ✅ | Production | 🟡 |
| **Trust** | [wallet-core](https://github.com/trustwallet/wallet-core) | ✅ | 163 | 📱🌐 | ✅ | ⚠️ Apache-2 | ✅ 2023 | 🟢 Binance | ❌ | ⚠️ | EOA | ✅ Multiple | ❌ | Multi-chain | 🟢 |
| **Rainbow** | [rainbow](https://github.com/rainbow-me/rainbow) | ✅ | 15+ | 📱🌐 | ✅ | ✅ GPL-3 | ❓ None | 🟡 VC | ❌ | ⚠️ | EOA | ✅ Ledger/Trezor | ❌ | NFT/Ethereum | 🟢 |
| **Safe** | [safe-wallet-monorepo](https://github.com/safe-global/safe-wallet-monorepo) | ✅ | 30+ | 📱🌐 | ✅ | ✅ GPL-3 | ✅ Certora | 🟢 Grants | ✅ | ✅ | Safe+4337 | ✅ Ledger/Trezor/Keystone | ✅ | Enterprise | 🟢 |
| **Ambire** | [extension](https://github.com/AmbireTech/extension) | ⚠️ | EVM | 🌐 | ✅ | ✅ GPL-3 | ✅ 2025 | 🟡 VC | ✅ | ✅ | 7702+4337 | ✅ Ledger/Trezor/GridPlus | ✅ | Smart wallet | 🟡 |
| **MEW** | [MyEtherWallet](https://github.com/MyEtherWallet/MyEtherWallet) | ✅ | ETH | 📱🔗 | ✅ | ✅ MIT | ❓ None | 🟢 Self | ❌ | ⚠️ | EOA | ✅ Multiple | ❌ | Ethereum | 🟢 |
| **Taho** | [extension](https://github.com/tahowallet/extension) | ⚠️ | EVM | 🌐 | ✅ | ✅ GPL-3 | ❓ None | 🔴 Grants | ❌ | ⚠️ | EOA | ✅ Multiple | ❌ | Community | 🟡 |
| **Frame** | [frame](https://github.com/floating/frame) | ❌ | Any | 💻 | ✅ | ✅ GPL-3 | ❓ None | 🔴 Donate | ✅ | ⚠️ | EOA | ✅ Ledger/Trezor/Keystone/GridPlus | ❌ | ~~Desktop~~ | 🔴 |
| **Brave** | [brave-browser](https://github.com/brave/brave-browser) | ✅ | 10+ | 📱🌐§ | ✅ | ✅ MPL-2 | 🐛 H1 | 🟢 Brave | ❌ | ⚠️ | EOA | ✅ Multiple | ❌ | Brave users | 🟢 |
| **Enkrypt** | [enKrypt](https://github.com/enkryptcom/enKrypt) | ✅ | 75+ | 🌐 | ✅ | ✅ MIT | ❓ None | 🟢 MEW | ❌ | ⚠️ | EOA | ✅ Multiple | ❌ | Multi-chain | 🟢 |
| **imToken** | [token-core](https://github.com/consenlabs/token-core-monorepo) | ✅ | 50+ | 📱 | ✅ | ⚠️ Apache-2 | ⚠️ 2018 | 🟡 VC | ❌ | ⚠️ | EOA | ✅ Keystone/imKey | ❌ | Multi-chain | 🟢 |
| **Daimo** | [daimo](https://github.com/daimo-eth/daimo) | ✅ | Base | 📱 | ❌ | ✅ GPL-3 | ✅ 2023 | 🟡 VC | ❌ | ⚠️ | 4337 only | ❌ | ✅ | Payments | 🟢 |
| **Phantom** | Private | 🔒 | 5 | 📱🌐 | ❌ | ❌ Proprietary | ❓ Private | 🟢 VC $109M | ✅ | ✅ | EOA | ✅ Ledger only | ❌ | Solana-first | 🟡 |
| **Zerion** | Private | 🔒 | 20+ | 📱🌐 | ✅ | ❌ Proprietary | ❓ Private | 🟡 VC | ❌ | ⚠️ | EOA | ✅ Ledger+WC | ❌ | Portfolio | ⚪ |
| **OKX** | Private | 🔒 | 100+ | 📱🌐 | ✅ | ❌ Proprietary | ❓ Private | 🟢 OKX | ⚠️ | ⚠️ | EOA | ✅ Multiple | ⚠️ | EIP-7702 | 🟡 |
| **Argent** | [argent-x](https://github.com/argentlabs/argent-x) | ❌ | 2 | 📱🌐† | ✅ | ✅ GPL-3 | ❓ None | 🔴 VC | ❌ | ⚠️ | 4337 | ✅ Multiple | ✅ | ~~Starknet~~ | 🔴 |
| **Block** | [extension](https://github.com/block-wallet/extension) | ❌ | ~20 | 📱🌐 | ✅ | ✅ MIT | ❓ None | 🔴 Unknown | ❌ | ⚠️ | EOA | ✅ Multiple | ❌ | ~~Stability~~ | 🔴 |
| **Wigwam** | [wigwam](https://github.com/wigwamapp/wigwam) | ⚠️ | Any | 📱🌐 | ✅ | ✅ MIT | ❓ None | 🔴 Unknown | ❌ | ⚠️ | EOA | ✅ Multiple | ❌ | Stability | 🟡 |
| **1inch** | Private | 🔒 | 12 | 📱 | ✅ | ❌ Proprietary | ❓ Private | 🟢 Token | ❌ | ⚠️ | EOA | ❌ | ❌ | DeFi | ⚪ |

**Legend:**
- 🟢 Recommended | 🟡 Situational | 🔴 Avoid | ⚪ Not for dev
- **Devices:** 📱 Mobile | 🌐 Browser Extension | 💻 Desktop | 🔗 Web App
- **License:** ✅ FOSS (MIT, GPL, MPL) | ⚠️ Source-Available/Partial | ❌ Proprietary
- **Audits:** ✅ Recent (2023+) | ⚠️ Old/Issues | ❓ None = No public audit | ❓ Private = Closed source | 🐛 H1 = HackerOne bug bounty
- **Funding:** 🟢 Sustainable (exchange/company backing) | 🟡 VC-dependent | 🔴 Donation/grant-dependent or unknown
- **Tx Sim:** ✅ Built-in transaction simulation | ⚠️ Via plugin/limited | ❌ None
- **Scam:** ✅ Built-in scam/phishing alerts | ⚠️ Basic warnings | ❌ None
- **Account Type:** EOA = Standard | Safe = Multi-sig | 4337 = Smart Account | 7702 = Upgraded EOA
- **Activity:** ✅ Active (last 30 days) | ⚠️ Slow (1-4 months) | ❌ Inactive (4+ months) | 🔒 Private repo
- † Argent desktop extension is Starknet-only
- § Brave Wallet is built into Brave browser
- ~~Strikethrough~~ = was recommended, now inactive

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

| Wallet | EIP-1193 | EIP-2700 | EIP-6963 | WalletConnect | In-App Browser |
|--------|----------|----------|----------|---------------|----------------|
| **MetaMask** | ✅ | ✅ | ✅ | ✅ | ✅ (mobile) |
| **Rabby** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Safe** | N/A | N/A | N/A | ✅ | ❌ |
| **Rainbow** | ✅ | ✅ | ✅ | ✅ | ✅ (mobile) |
| **Coinbase** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Trust** | ✅ | ✅ | ✅ | ✅ | ✅ (mobile) |
| **Ambire** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Brave** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Enkrypt** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **MEW** | N/A | N/A | N/A | ✅ | ✅ (mobile) |
| **imToken** | N/A | N/A | N/A | ✅ | ✅ |
| **Daimo** | N/A | N/A | N/A | ✅ | ❌ |
| **Phantom** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Zerion** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Frame** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Taho** | ✅ | ✅ | ✅ | ❌ | ❌ |

**EIPs:**
- **EIP-1193:** Standard Ethereum Provider API (`window.ethereum`)
- **EIP-2700:** Provider event system (`.on()`, `.removeListener()`)
- **EIP-6963:** Multi-wallet discovery ([test at eip6963.org](https://eip6963.org))
- **N/A:** Mobile-only or web-app wallets don't inject into browser

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

*Last updated: December 1, 2025. Added: Funding, Tx Sim, Scam columns; Security Features, Privacy, Monetization sections; decision flowchart; automated refresh script; interactive web version. Data from [WalletBeat](https://walletbeat.fyi) and GitHub. Verify current capabilities before implementation.*
