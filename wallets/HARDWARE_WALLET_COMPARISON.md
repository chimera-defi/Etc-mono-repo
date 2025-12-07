# Hardware Wallet Comparison (Cold Storage Alternatives to Ledger)

> **TL;DR:** Use **Trezor Safe 5** (94) for best security + UX, **ColdCard Mk4** (91) for Bitcoin maximalists, **Keystone 3 Pro** (91) for air-gapped security, or **Trezor Safe 3** (91) for best value at $79. **Ledger** (55-57) is penalized for Ledger Recover. See [Why Look Beyond Ledger?](#-why-look-beyond-ledger) for details.

**Last Updated:** December 6, 2025 | [Scoring Methodology](#-scoring-methodology) | [GitHub Activity Data](#github-metrics-firmware-repositories)

### 🆕 What's New (December 2025)
- Added **Chains** column (BTC vs Multi-chain) and **App** column (companion software)
- Added [Network Support](#-network-support) table with BTC/ETH/SOL breakdown
- Added [Security Audits](#-security-audits) section with links to audit reports
- Added [Companion Apps](#-companion-apps) quality ratings
- Added [Where to Buy](#-where-to-buy) with official purchase links
- Expanded [Software Wallet Integration](#software-wallet-integration) table

---

## 📑 Table of Contents

- [Complete Comparison Table](#complete-hardware-wallet-comparison-19-wallets) — All 19 wallets at a glance
- [GitHub Metrics](#github-metrics-firmware-repositories) — Activity status and code quality
- [Network Support](#-network-support) — BTC, ETH, SOL compatibility
- [Security Deep Dive](#-security-deep-dive) — Secure Element, air-gap, features
- [Security Audits](#-security-audits) — Audit history and reports
- [Scoring Methodology](#-scoring-methodology) — How we calculate scores
- [Quick Recommendations](#-quick-recommendations) — Best picks by use case
- [Companion Apps](#-companion-apps) — Software quality comparison
- [Wallets to Avoid](#%EF%B8%8F-wallets-to-avoid-or-use-with-caution) — Red flags and issues
- [Why Look Beyond Ledger?](#-why-look-beyond-ledger) — Ledger Recover controversy
- [Where to Buy](#-where-to-buy) — Official purchase links

---

## Complete Hardware Wallet Comparison (19 Wallets)

| Wallet | Score | GitHub | Chains | Air-Gap | Open Source | Secure Elem | Display | Price | Conn | App | Activity | Rec |
|--------|-------|--------|--------|---------|-------------|-------------|---------|-------|------|-----|----------|-----|
| [**Trezor Safe 5**](https://trezor.io/) | 94 | [trezor-firmware](https://github.com/trezor/trezor-firmware) | Multi | ❌ | ✅ Full | ✅ Optiga | Touch Color | ~$169 | USB-C | Suite | ✅ Active | 🟢 |
| [**Keystone 3 Pro**](https://keyst.one/) | 91 | [keystone3-firmware](https://github.com/KeystoneHQ/keystone3-firmware) | Multi | ✅ Full | ✅ Full | ✅ 3× SE | Touch Color | ~$149 | QR | Vault | ✅ Active | 🟢 |
| [**ColdCard Mk4**](https://coldcard.com/) | 91 | [firmware](https://github.com/Coldcard/firmware) | BTC | ✅ Full | ✅ Full | ✅ Dual SE | Mono LCD | ~$150 | MicroSD | Sparrow | ✅ Active | 🟢 |
| [**Trezor Safe 3**](https://trezor.io/) | 91 | [trezor-firmware](https://github.com/trezor/trezor-firmware) | Multi | ❌ | ✅ Full | ✅ Optiga | Mono OLED | ~$79 | USB-C | Suite | ✅ Active | 🟢 |
| [**BitBox02**](https://bitbox.swiss/) | 88 | [bitbox02-firmware](https://github.com/BitBoxSwiss/bitbox02-firmware) | Multi | ❌ | ✅ Full | ✅ ATECC | Touch Edge | ~$150 | USB-C | BitBox | ✅ Active | 🟢 |
| [**Foundation Passport**](https://foundationdevices.com/) | 81 | [passport2](https://github.com/Foundation-Devices/passport2) | BTC | ✅ Full | ✅ Full | ✅ ATECC | Color LCD | ~$259 | MicroSD/QR | Envoy | ⚠️ Slow | 🟢 |
| [**OneKey Pro**](https://onekey.so/) | 77 | [firmware-pro](https://github.com/OneKeyHQ/firmware-pro) | Multi | ❌ | ✅ Full | ✅ SE | Touch Color | ~$199 | USB/BT | OneKey | ✅ Active | 🟢 |
| [**NGRAVE ZERO**](https://www.ngrave.io/) | 72 | Private | Multi | ✅ Full | ⚠️ Partial | ✅ SE | Touch Color | ~$400 | QR | LIQUID | 🔒 Private | 🟡 |
| [**SafePal S1**](https://www.safepal.com/) | 62 | Private | Multi | ✅ Full | ⚠️ Partial | ✅ SE | LCD | ~$50 | QR | SafePal | 🔒 Private | 🟡 |
| [**GridPlus Lattice1**](https://gridplus.io/) | 59 | [SDK only](https://github.com/GridPlus/gridplus-sdk) | Multi | ❌ | ⚠️ SDK only | ✅ SE | 5" Touch | ~$400 | WiFi/USB | Frame | 🔒 Private | 🟡 |
| [**Ledger Stax**](https://www.ledger.com/) | 57 | [ledger-live](https://github.com/LedgerHQ/ledger-live) | Multi | ❌ | ⚠️ Partial | ✅ SE | E-Ink Touch | ~$280 | USB/BT | Live | 🔒 Private | 🟡 |
| [**Ledger Nano X**](https://www.ledger.com/) | 56 | [ledger-live](https://github.com/LedgerHQ/ledger-live) | Multi | ❌ | ⚠️ Partial | ✅ SE | Mono OLED | ~$150 | USB/BT | Live | 🔒 Private | 🟡 |
| [**Ledger Nano S+**](https://www.ledger.com/) | 55 | [ledger-live](https://github.com/LedgerHQ/ledger-live) | Multi | ❌ | ⚠️ Partial | ✅ SE | Mono OLED | ~$80 | USB | Live | 🔒 Private | 🟡 |
| [**Tangem Wallet**](https://tangem.com/) | 53 | Private | Multi | ❌ | ⚠️ Partial | ✅ SE | None | ~$55 | NFC | Tangem | 🔒 Private | 🟡 |
| [**Ellipal Titan 2.0**](https://www.ellipal.com/) | 48 | Private | Multi | ✅ Full | ❌ Closed | ❌ None | Touch Color | ~$170 | QR | Ellipal | 🔒 Private | 🔴 |
| [**SecuX V20**](https://secuxtech.com/) | 47 | Private | Multi | ❌ | ❌ Closed | ✅ SE | Touch Color | ~$140 | USB/BT | SecuX | 🔒 Private | 🔴 |
| [**Arculus**](https://www.getarculus.com/) | 42 | Private | Multi | ❌ | ❌ Closed | ✅ SE | None | ~$100 | NFC | Arculus | 🔒 Private | 🔴 |
| ~~[**KeepKey**](https://shapeshift.com/keepkey)~~ | 39 | [keepkey-firmware](https://github.com/keepkey/keepkey-firmware) | Multi | ❌ | ✅ Full | ❌ None | OLED | ~$50 | USB | ShapeShift | ❌ Inactive | 🔴 |
| [**BC Vault**](https://bc-vault.com/) | 33 | Private | Multi | ❌ | ❌ Closed | ❌ None | OLED | ~$140 | USB | BCVault | 🔒 Private | 🔴 |

**Legend:**
- **Wallet:** Links to official site | ~~Strikethrough~~ = abandoned
- **Score:** 0-100 weighted score (see [Scoring Methodology](#-scoring-methodology))
- **GitHub:** Firmware repo link | "Private" = closed source
- **Chains:** BTC = Bitcoin only | Multi = Multiple networks (ETH, SOL, etc.)
- **Air-Gap:** ✅ Full = QR/MicroSD only | ❌ = USB/BT connection required
- **Open Source:** ✅ Full (firmware + bootloader) | ⚠️ Partial | ❌ Closed
- **Secure Elem:** ✅ Has SE with type (Optiga, ATECC, etc.) | ❌ MCU only
- **Display:** Screen type | **Price:** ~USD (verify on official site)
- **Conn:** USB, Bluetooth (BT), QR, NFC, MicroSD, WiFi
- **App:** Companion software (Suite, Live, Sparrow, etc.)
- **Activity:** ✅ Active (≤30 days) | ⚠️ Slow (1-4 mo) | 🔒 Private | ❌ Inactive
- **Rec:** 🟢 Recommended (75+) | 🟡 Situational (50-74) | 🔴 Avoid (<50)

> ⚠️ **Data Accuracy Note:** Prices, supported networks, and features change. Always verify on official manufacturer websites before purchasing. This table provides general guidance, not exact specifications.

### GitHub Metrics (Firmware Repositories)

**Generated:** December 5, 2025 via `scripts/refresh-hardware-wallet-data.sh`

| Wallet | Repository | Last Commit | Stars | Issues | Ratio | Status |
|--------|------------|-------------|-------|--------|-------|--------|
| **Trezor** | [trezor/trezor-firmware](https://github.com/trezor/trezor-firmware) | Dec 5, 2025 | 1,626 | 545 | 33.5% | ✅ Active |
| **Keystone** | [KeystoneHQ/keystone3-firmware](https://github.com/KeystoneHQ/keystone3-firmware) | Dec 2, 2025 | 188 | 77 | 41.0% | ✅ Active |
| **BitBox02** | [BitBoxSwiss/bitbox02-firmware](https://github.com/BitBoxSwiss/bitbox02-firmware) | Dec 4, 2025 | 330 | 49 | 14.8% | ✅ Active |
| **ColdCard** | [Coldcard/firmware](https://github.com/Coldcard/firmware) | Nov 27, 2025 | 689 | 6 | 0.9% | ✅ Active |
| **Foundation Passport** | [Foundation-Devices/passport2](https://github.com/Foundation-Devices/passport2) | Oct 22, 2025 | 76 | 8 | 10.5% | ⚠️ Slow |
| **OneKey** | [OneKeyHQ/firmware-pro](https://github.com/OneKeyHQ/firmware-pro) | Dec 3, 2025 | 17 | 14 | 82.4% | ✅ Active |
| **KeepKey** | [keepkey/keepkey-firmware](https://github.com/keepkey/keepkey-firmware) | Feb 11, 2025 | 162 | 15 | 9.3% | ❌ Inactive |

**Code Quality Notes:**
- ✅ **ColdCard (0.9%):** Excellent code quality — minimal issues relative to community size
- ✅ **BitBox02 (14.8%):** Good code quality
- ⚠️ **Trezor (33.5%):** Higher ratio reflects large feature set and user base
- ⚠️ **Keystone (41.0%):** Moderate — newer project with active development
- 🔴 **OneKey (82.4%):** High ratio — many open issues relative to stars
- 🔴 **KeepKey:** No commits for 296 days — effectively abandoned

**Closed Source (no public firmware repos):** Ledger, NGRAVE, Ellipal, SafePal, SecuX, Tangem, BC Vault, GridPlus

**Firmware Release Patterns:**
Unlike software wallets where frequent updates can indicate instability, hardware wallet firmware updates are intentionally infrequent for security. Most manufacturers release 2-4 firmware updates per year. This is by design — each update requires extensive security review and user action to install.

| Wallet | Recent Releases (2025) | Pattern |
|--------|------------------------|---------|
| Keystone | 5 releases | ~1/month (active development) |
| BitBox02 | 3-4 releases | ~1/quarter (stable) |
| Foundation Passport | 2 releases | ~1/quarter (stable) |
| OneKey | 3 releases | ~1/quarter (stable) |
| Trezor | Via Trezor Suite | App-managed updates |
| ColdCard | Via tags | Manual firmware downloads |

---

## 🔗 Network Support

| Wallet | BTC | ETH | SOL | Multi-chain | Native Staking | Notes |
|--------|-----|-----|-----|-------------|----------------|-------|
| **Trezor Safe 5** | ✅ | ✅ | ❌ | ✅ 1000+ tokens | ❌ | Wide EVM support |
| **Trezor Safe 3** | ✅ | ✅ | ❌ | ✅ 1000+ tokens | ❌ | Same as Safe 5 |
| **Keystone 3 Pro** | ✅ | ✅ | ✅ | ✅ Multi-chain | ❌ | BTC, ETH, SOL, Cosmos |
| **ColdCard Mk4** | ✅ | ❌ | ❌ | ❌ BTC only | ❌ | Bitcoin maximalist |
| **BitBox02 Multi** | ✅ | ✅ | ❌ | ✅ EVM chains | ❌ | Also BTC-only edition |
| **Foundation Passport** | ✅ | ❌ | ❌ | ❌ BTC only | ❌ | Bitcoin maximalist |
| **OneKey Pro** | ✅ | ✅ | ✅ | ✅ Multi-chain | ❌ | Wide support |
| **Ledger Nano X** | ✅ | ✅ | ✅ | ✅ 5500+ tokens | ✅ ETH, SOL | Most chains |
| **Ledger Stax** | ✅ | ✅ | ✅ | ✅ 5500+ tokens | ✅ ETH, SOL | Same as Nano X |
| **NGRAVE ZERO** | ✅ | ✅ | ❌ | ✅ Multi-chain | ❌ | Via LIQUID app |
| **SafePal S1** | ✅ | ✅ | ✅ | ✅ Multi-chain | ❌ | DeFi-focused |
| **GridPlus Lattice1** | ✅ | ✅ | ❌ | ✅ EVM chains | ❌ | ETH ecosystem |

**Network Support Notes:**
- **BTC only (ColdCard, Foundation):** Best for Bitcoin maximalists, simpler attack surface
- **Multi-chain:** Support varies; "5500+ tokens" counts all tokens, not distinct chains
- **Staking:** Native staking in companion app (not all chains)
- **EVM chains:** Ethereum + L2s (Arbitrum, Optimism, Base, Polygon, etc.)

---

## 🔒 Security Deep Dive

### Security Features Comparison

| Wallet | Secure Element | Air-Gap | Open Firmware | Reproducible | Passphrase | Multisig | Duress PIN | Anti-Tamper |
|--------|---------------|---------|---------------|--------------|------------|----------|------------|-------------|
| **Trezor Safe 5** | ✅ Optiga Trust M (EAL6+) | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Keystone 3 Pro** | ✅ 3× SE (EAL5+) | ✅ QR | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **BitBox02** | ✅ ATECC608 | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **ColdCard Mk4** | ✅ Dual SE | ✅ MicroSD | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Foundation Passport** | ✅ SE | ✅ MicroSD/QR | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Trezor Safe 3** | ✅ Optiga Trust M (EAL6+) | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **NGRAVE ZERO** | ✅ STM32 + SE (EAL7) | ✅ QR | ⚠️ | ❌ | ✅ | ❌ | ❌ | ✅ |
| **GridPlus Lattice1** | ✅ SE | ❌ WiFi | ⚠️ SDK | ❌ | ✅ | ✅ | ❌ | ✅ |
| **OneKey Pro** | ✅ SE | ❌ | ✅ | ⚠️ | ✅ | ❌ | ❌ | ✅ |
| **Ellipal Titan** | ❌ MCU only | ✅ QR | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| **SafePal S1** | ✅ SE | ✅ QR | ⚠️ | ❌ | ✅ | ❌ | ❌ | ✅ |
| **SecuX V20** | ✅ SE (Infineon) | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ⚠️ |
| **Tangem** | ✅ EAL6+ NFC | ❌ NFC | ⚠️ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Ledger Nano X** | ✅ CC EAL5+ | ❌ | ⚠️ | ❌ | ✅ | ⚠️ | ❌ | ✅ |
| **Ledger Nano S+** | ✅ CC EAL5+ | ❌ | ⚠️ | ❌ | ✅ | ⚠️ | ❌ | ✅ |
| **Ledger Stax** | ✅ CC EAL5+ | ❌ | ⚠️ | ❌ | ✅ | ⚠️ | ❌ | ✅ |
| **KeepKey** | ❌ MCU only | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Arculus** | ✅ CC EAL6+ | ❌ NFC | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **BC Vault** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ |

**Security Feature Definitions:**
- **Secure Element:** Dedicated security chip to protect private keys (vs general-purpose MCU)
- **Air-Gap:** Device never connects physically to computer during transaction signing
- **Open Firmware:** Publicly auditable source code for device firmware
- **Reproducible:** Firmware can be compiled from source and verified against shipped binary
- **Passphrase:** Optional 25th word for hidden wallet functionality
- **Multisig:** Native support for multi-signature setups
- **Duress PIN:** Decoy wallet that appears when entered under duress
- **Anti-Tamper:** Physical tamper-evident features (seals, mesh, self-destruct)

---

## 🛡️ Security Audits

Hardware wallet security audits are less common than software wallet audits, but several manufacturers have undergone third-party review:

| Wallet | Last Audit | Auditor(s) | Scope | Report |
|--------|------------|------------|-------|--------|
| **Trezor** | Ongoing | Community | Firmware, bootloader | [GitHub](https://github.com/trezor/trezor-firmware/tree/main/docs/misc) |
| **Ledger** | 2019 | ANSSI (France) | Secure Element | [Certification](https://www.ledger.com/ledger-nano-s-eal5-certified) |
| **BitBox02** | 2020 | Consulcesi, Census | Firmware | [Report](https://shiftcrypto.ch/bitbox02/security/) |
| **ColdCard** | Community | Community review | Firmware | [Docs](https://coldcard.com/docs/security) |
| **Keystone** | 2023 | SlowMist | Firmware, QR | [Report](https://github.com/KeystoneHQ/keystone3-firmware/tree/main/docs/audit) |
| **Foundation** | 2023 | Foundation Devices | Firmware | [Docs](https://docs.foundation.devices/security) |
| **GridPlus** | Unknown | Unknown | Unknown | Not public |
| **NGRAVE** | Unknown | Unknown | Claims EAL7 | Not public |
| **SafePal** | Unknown | Unknown | Unknown | Not public |
| **Ellipal** | Unknown | Unknown | Unknown | Not public |

**Audit Notes:**
- ✅ **Trezor, ColdCard, BitBox02:** Open source = community-auditable (the best kind of audit)
- ✅ **Keystone:** SlowMist audit available on GitHub
- ⚠️ **Ledger:** ANSSI certified the SE chip, but firmware is closed source and cannot be audited
- ❌ **Closed source wallets:** Cannot be independently verified; must trust manufacturer claims

**Key Insight:** Open source firmware is more valuable than a one-time audit. Trezor, ColdCard, BitBox02, and Keystone can be continuously reviewed by the community, while closed-source wallets require trust.

---

## 📊 Scoring Methodology

Hardware wallet scoring uses a comprehensive methodology consistent with our [Software Wallet Comparison](./WALLET_COMPARISON_UNIFIED.md), adapted for cold storage priorities:

| Category | Weight | Description | Data Sources |
|----------|--------|-------------|--------------|
| **Security Architecture** | 25 pts | Secure Element certification, air-gap, physical tamper | Specs, certs |
| **Transparency** | 20 pts | Open source firmware, reproducible builds, code quality | GitHub repos |
| **Privacy & Trust** | 15 pts | No cloud recovery, no seed extraction, no KYC | Firmware analysis |
| **Development Activity** | 15 pts | GitHub activity, issue resolution, community support | GitHub API |
| **Company & Track Record** | 15 pts | Funding stability, longevity, security incidents | Research |
| **UX & Ecosystem** | 10 pts | Display, chains supported, software integrations | Testing |

### Scoring Criteria Detail

```
SECURITY ARCHITECTURE (25 pts)
  Secure Element present: +8
  SE certification EAL6+: +4 (EAL5+: +2, EAL7: +6)
  Air-gap capable (QR/MicroSD only): +8
  Dual/Triple SE: +3
  Physical tamper protection: +2
  No SE, MCU only: -5 penalty
  
TRANSPARENCY (20 pts)
  ✅ Full open source (firmware + bootloader): 20
  ⚠️ Partial (app open, firmware closed): 10-12
  ⚠️ SDK only (no firmware): 5-8
  ❌ Closed source: 0-5
  Reproducible builds: +3 bonus
  Code quality (low issue ratio <15%): +2 bonus
  High issue ratio (>50%): -2 penalty

PRIVACY & TRUST (15 pts)
  No seed extraction capability: 15
  Optional cloud recovery (Ledger Recover): 5 (major penalty)
  Mandatory cloud features: 0
  No KYC required: +0 (baseline expectation)
  KYC for purchase: -3 penalty

DEVELOPMENT ACTIVITY (15 pts) — GitHub Status
  ✅ Active (commits ≤30 days): 15
  ⚠️ Slow (1-4 months): 8
  🔒 Private/closed repo: 5
  ❌ Inactive (>4 months): 0
  Note: Low update frequency is GOOD for HW (unlike software)
  
COMPANY & TRACK RECORD (15 pts)
  🟢 Self-funded & profitable: 12-15
  🟡 VC-funded, stable: 8-10
  🔴 Unknown funding: 3-5
  🔴 Abandoned/pivoted: 0
  5+ years operation: +3
  3-5 years: +2
  <2 years: +0
  Major security breach: -5 penalty
  
UX & ECOSYSTEM (10 pts)
  Touch color screen: +4
  Color LCD with buttons: +3
  Mono OLED/LCD: +2
  No screen (NFC card): +0
  Multi-chain (many networks): +3
  Multi-chain (100+): +2
  BTC-only: +1 (appropriate for use case)
  Major software wallet integrations: +2
  Limited ecosystem: +0
```

### Detailed Scoring Breakdown

| Wallet | Security (25) | Transparency (20) | Privacy (15) | Activity (15) | Company (15) | UX (10) | Total |
|--------|---------------|-------------------|--------------|---------------|--------------|---------|-------|
| **Trezor Safe 5** | 22/25 | 20/20 | 15/15 | 15/15 | 14/15 | 8/10 | **94** |
| **Keystone 3 Pro** | 25/25 | 20/20 | 15/15 | 15/15 | 8/15 | 8/10 | **91** |
| **Trezor Safe 3** | 22/25 | 20/20 | 15/15 | 15/15 | 14/15 | 5/10 | **91** |
| **BitBox02** | 20/25 | 20/20 | 15/15 | 15/15 | 12/15 | 6/10 | **88** |
| **ColdCard Mk4** | 25/25 | 20/20 | 15/15 | 15/15 | 12/15 | 4/10 | **91** |
| **Foundation Passport** | 23/25 | 20/20 | 15/15 | 8/15 | 10/15 | 5/10 | **81** |
| **NGRAVE ZERO** | 24/25 | 10/20 | 15/15 | 5/15 | 10/15 | 8/10 | **72** |
| **OneKey Pro** | 18/25 | 18/20 | 13/15 | 15/15 | 6/15 | 7/10 | **77** |
| **GridPlus Lattice1** | 18/25 | 8/20 | 12/15 | 5/15 | 8/15 | 8/10 | **59** |
| **SafePal S1** | 20/25 | 10/20 | 14/15 | 5/15 | 8/15 | 5/10 | **62** |
| **Ellipal Titan 2.0** | 16/25 | 0/20 | 15/15 | 5/15 | 5/15 | 7/10 | **48** |
| **SecuX V20** | 18/25 | 0/20 | 13/15 | 5/15 | 5/15 | 6/10 | **47** |
| **Tangem Wallet** | 18/25 | 8/20 | 10/15 | 5/15 | 8/15 | 4/10 | **53** |
| **Ledger Nano X** | 20/25 | 10/20 | 5/15 | 5/15 | 10/15 | 6/10 | **56** |
| **Ledger Nano S+** | 20/25 | 10/20 | 5/15 | 5/15 | 10/15 | 5/10 | **55** |
| **Ledger Stax** | 20/25 | 10/20 | 5/15 | 5/15 | 10/15 | 7/10 | **57** |
| ~~**KeepKey**~~ | 8/25 | 18/20 | 10/15 | 0/15 | 0/15 | 3/10 | **39** |
| **Arculus** | 18/25 | 0/20 | 8/15 | 5/15 | 8/15 | 3/10 | **42** |
| **BC Vault** | 8/25 | 0/20 | 10/15 | 5/15 | 5/15 | 5/10 | **33** |

---

## 🏆 Quick Recommendations

| Use Case | Top Pick | Score | Runner-Up | Budget Option |
|----------|----------|-------|-----------|---------------|
| **Best Overall** | Trezor Safe 5 | 94 | Keystone 3 Pro (91) | Trezor Safe 3 (~$79) |
| **Bitcoin Only** | ColdCard Mk4 | 91 | Foundation Passport (81) | — |
| **Air-Gapped** | Keystone 3 Pro | 91 | ColdCard Mk4 (91) | SafePal S1 (~$50) |
| **Best Value** | Trezor Safe 3 | 91 | SafePal S1 (62) | Tangem (~$55) |
| **Beginners** | Trezor Safe 5 | 94 | BitBox02 (88) | Trezor Safe 3 (~$79) |

### Software Wallet Integration

| Wallet | MetaMask | Rabby | Sparrow | Electrum | Rainbow | Safe |
|--------|----------|-------|---------|----------|---------|------|
| Trezor | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Keystone | ✅ QR | ✅ QR | ✅ | ❌ | ❌ | ✅ QR |
| BitBox02 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| ColdCard | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Ledger | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Foundation | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| OneKey | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

**Integration Notes:**
- **QR-based (Keystone, Foundation):** Work with any wallet supporting animated QR codes
- **USB-based (Trezor, Ledger, BitBox02):** Require WebUSB support in browser
- **BTC-only (ColdCard, Foundation):** Sparrow/Electrum recommended for advanced features

---

## 📱 Companion Apps

Each hardware wallet has a companion app for managing assets. Quality varies significantly:

| Wallet | App Name | Platforms | Quality | Open Source | Notes |
|--------|----------|-----------|---------|-------------|-------|
| **Trezor** | Trezor Suite | Desktop, Web | ✅ Excellent | ✅ Yes | Best-in-class UX, full-featured |
| **Ledger** | Ledger Live | Desktop, Mobile | ✅ Good | ✅ Yes | Feature-rich, occasional bugs |
| **BitBox02** | BitBox App | Desktop | ✅ Excellent | ✅ Yes | Clean, focused, Swiss quality |
| **Keystone** | Keystone Vault | Mobile | ✅ Good | ⚠️ Partial | QR-based, works with MM/Rabby |
| **ColdCard** | None (Sparrow) | Desktop | ✅ Excellent | ✅ Yes | Use Sparrow or Electrum |
| **Foundation** | Envoy | Mobile | ✅ Good | ✅ Yes | Bitcoin-focused, clean UI |
| **OneKey** | OneKey App | Desktop, Mobile | ⚠️ Okay | ✅ Yes | Multi-chain, newer |
| **NGRAVE** | LIQUID | Mobile | ⚠️ Okay | ❌ No | Proprietary |
| **SafePal** | SafePal App | Mobile | ⚠️ Okay | ❌ No | DeFi integration |

**Companion App Quality Factors:**
- ✅ **Excellent:** Stable, full-featured, good UX, actively maintained
- ⚠️ **Okay:** Functional but has quirks, less polish
- ❌ **Poor:** Buggy, missing features, or abandoned

**BTC-Only Recommendation:** Skip proprietary apps. Use [Sparrow Wallet](https://sparrowwallet.com/) — open source, supports ColdCard/Passport/Trezor/Ledger.

---

## ⚠️ Wallets to Avoid or Use with Caution

| Wallet | Score | Issue |
|--------|-------|-------|
| **Ellipal Titan** | 48 | Closed source, no Secure Element |
| **SecuX V20** | 47 | Closed source, unknown funding |
| **Arculus** | 42 | Closed source, NFC-only, no passphrase |
| **KeepKey** | 39 | ❌ ABANDONED (10 months no updates) |
| **BC Vault** | 33 | Closed source, no SE, unconventional backup |
| **Ledger** | 55-57 | ⚠️ Ledger Recover capability — use with passphrase only |
| **NGRAVE ZERO** | 72 | ⚠️ Expensive, not fully open source |
| **SafePal S1** | 62 | ⚠️ Binance-backed, partial open source |
| **GridPlus** | 59 | ⚠️ SDK-only, WiFi connectivity |
| **Tangem** | 53 | ⚠️ No screen, NFC-only |

---

## ❓ Why Look Beyond Ledger?

**Ledger Recover (May 2023):** Firmware can extract and transmit seed phrase fragments to third-party custodians. Even if "optional," this capability violates the core principle that **private keys should NEVER leave the device**.

- 🔴 Firmware CAN extract seed — attack surface exists
- 🔴 Requires KYC — links identity to wallet  
- 🔴 2020 data breach exposed 272K users to phishing/physical threats

**If you must use Ledger:** Always enable passphrase (25th word) — Recover cannot extract this.

---

## 🔄 Ledger Migration

| From | To | Why |
|------|-----|-----|
| Nano S/S+ | Trezor Safe 3 | Same price, fully open source |
| Nano X | Trezor Safe 5 or Keystone 3 Pro | Better transparency or air-gapped |
| BTC holdings | ColdCard Mk4 | Maximum BTC security |

**Best practice:** Generate fresh seed on new device, then transfer assets (don't import Ledger seed).

---

## 🛒 Where to Buy

> ⚠️ **CRITICAL:** Only buy from official manufacturer websites or authorized resellers. Never buy used hardware wallets or from Amazon/eBay — tampered devices can steal your funds.

| Wallet | Official Store | Price | Ships From | Notes |
|--------|----------------|-------|------------|-------|
| [**Trezor Safe 5**](https://trezor.io/trezor-safe-5) | trezor.io | ~$169 | Czech Republic | Free shipping >$150 |
| [**Trezor Safe 3**](https://trezor.io/trezor-safe-3) | trezor.io | ~$79 | Czech Republic | Best value |
| [**Keystone 3 Pro**](https://shop.keyst.one/) | shop.keyst.one | ~$149 | Hong Kong | QR air-gapped |
| [**ColdCard Mk4**](https://store.coinkite.com/store/coldcard) | store.coinkite.com | ~$150 | Canada | BTC only |
| [**BitBox02**](https://shiftcrypto.shop/) | shiftcrypto.shop | ~$150 | Switzerland | Multi or BTC-only edition |
| [**Foundation Passport**](https://foundationdevices.com/passport/) | foundationdevices.com | ~$259 | USA | Premium BTC device |
| [**OneKey Pro**](https://onekey.so/products/onekey-pro) | onekey.so | ~$199 | China | Multi-chain |
| [**Ledger Nano X**](https://shop.ledger.com/pages/ledger-nano-x) | shop.ledger.com | ~$150 | France | ⚠️ Ledger Recover |
| [**Ledger Nano S+**](https://shop.ledger.com/pages/ledger-nano-s-plus) | shop.ledger.com | ~$80 | France | ⚠️ Ledger Recover |
| [**NGRAVE ZERO**](https://www.ngrave.io/) | ngrave.io | ~$400 | Belgium | Premium air-gapped |
| [**SafePal S1**](https://store.safepal.com/safepal-s1-hardware-wallet.html) | store.safepal.com | ~$50 | China | Budget option |
| [**Tangem**](https://tangem.com/en/pricing/) | tangem.com | ~$55 | Switzerland | NFC card wallet |

**Authorized Resellers (Verified):**
- [BTC Sessions Store](https://store.btcsessions.ca/) — Canada, ships Trezor/ColdCard
- [Coinkite](https://coinkite.com/) — Official ColdCard manufacturer
- [Blockstream Store](https://store.blockstream.com/) — Jade hardware wallet

**Avoid:**
- ❌ Amazon, eBay, AliExpress — risk of tampered devices
- ❌ "Discount" or "refurbished" hardware wallets
- ❌ Any wallet that arrives with seed phrase pre-generated

---

## Resources

- [Trezor](https://trezor.io/) — [GitHub](https://github.com/trezor) — [Wiki](https://trezor.io/learn)
- [Keystone](https://keyst.one/) — [GitHub](https://github.com/KeystoneHQ) — [Docs](https://keyst.one/resources)
- [BitBox02](https://bitbox.swiss/) — [GitHub](https://github.com/BitBoxSwiss) — [Guides](https://bitbox.swiss/guides/)
- [ColdCard](https://coldcard.com/) — [GitHub](https://github.com/Coldcard) — [Docs](https://coldcard.com/docs/)
- [Foundation Passport](https://foundationdevices.com/) — [GitHub](https://github.com/Foundation-Devices) — [Docs](https://docs.foundation.devices/)
- [Sparrow Wallet](https://sparrowwallet.com/) — Best BTC software wallet for hardware wallet users
- [WalletScrutiny](https://walletscrutiny.com/) — Open source verification

---

*Last updated: December 6, 2025. Always verify current specifications and prices on official manufacturer sites before purchase.*
