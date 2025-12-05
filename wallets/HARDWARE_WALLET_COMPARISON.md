# Hardware Wallet Comparison (Cold Storage Alternatives to Ledger)

> **TL;DR:** Use **Trezor Safe 5** (94) for best security + UX, **ColdCard Mk4** (91) for Bitcoin maximalists, **Keystone 3 Pro** (91) for air-gapped security, or **Trezor Safe 3** (91) for best value at $79. **Ledger** (55-57) is penalized for Ledger Recover. See [Why Look Beyond Ledger?](#-why-look-beyond-ledger) for details.

**Last Updated:** December 2025 | [Scoring Methodology](#-scoring-methodology) | [GitHub Activity Data](#github-metrics-firmware-repositories)

---

## Complete Hardware Wallet Comparison (19 Wallets)

| Wallet | Score | Air-Gap | Open Source | Secure Elem | Display | Networks | Price | Conn | BTC-Only | Activity | Rec |
|--------|-------|---------|-------------|-------------|---------|----------|-------|------|----------|----------|-----|
| **Trezor Safe 5** | 94 | ❌ | ✅ Full | ✅ Optiga | Touch Color | Multi | ~$169 | USB-C | ❌ | ✅ Active | 🟢 |
| **Keystone 3 Pro** | 91 | ✅ Full | ✅ Full | ✅ 3× SE | Touch Color | Multi | ~$149 | QR | ❌ | ✅ Active | 🟢 |
| **ColdCard Mk4** | 91 | ✅ Full | ✅ Full | ✅ Dual SE | Mono LCD | BTC | ~$150 | MicroSD | ✅ | ✅ Active | 🟢 |
| **Trezor Safe 3** | 91 | ❌ | ✅ Full | ✅ Optiga | Mono OLED | Multi | ~$79 | USB-C | ❌ | ✅ Active | 🟢 |
| **BitBox02** | 88 | ❌ | ✅ Full | ✅ ATECC | Touch Edge | Multi | ~$150 | USB-C | ⚠️ Ed | ✅ Active | 🟢 |
| **Foundation Passport** | 81 | ✅ Full | ✅ Full | ✅ ATECC | Color LCD | BTC | ~$259 | MicroSD/QR | ✅ | ⚠️ Slow | 🟢 |
| **OneKey Pro** | 77 | ❌ | ✅ Full | ✅ SE | Touch Color | Multi | ~$199 | USB/BT | ❌ | ✅ Active | 🟢 |
| **NGRAVE ZERO** | 72 | ✅ Full | ⚠️ Partial | ✅ SE | Touch Color | Multi | ~$400 | QR | ❌ | 🔒 Private | 🟡 |
| **SafePal S1** | 62 | ✅ Full | ⚠️ Partial | ✅ SE | LCD | Multi | ~$50 | QR | ❌ | 🔒 Private | 🟡 |
| **GridPlus Lattice1** | 59 | ❌ | ⚠️ SDK only | ✅ SE | 5" Touch | Multi | ~$400 | WiFi/USB | ❌ | 🔒 Private | 🟡 |
| **Ledger Stax** | 57 | ❌ | ⚠️ Partial | ✅ SE | E-Ink Touch | Multi | ~$280 | USB/BT | ❌ | 🔒 Private | 🟡 |
| **Ledger Nano X** | 56 | ❌ | ⚠️ Partial | ✅ SE | Mono OLED | Multi | ~$150 | USB/BT | ❌ | 🔒 Private | 🟡 |
| **Ledger Nano S+** | 55 | ❌ | ⚠️ Partial | ✅ SE | Mono OLED | Multi | ~$80 | USB | ❌ | 🔒 Private | 🟡 |
| **Tangem Wallet** | 53 | ❌ | ⚠️ Partial | ✅ SE | None | Multi | ~$55 | NFC | ❌ | 🔒 Private | 🟡 |
| **Ellipal Titan 2.0** | 48 | ✅ Full | ❌ Closed | ❌ None | Touch Color | Multi | ~$170 | QR | ❌ | 🔒 Private | 🔴 |
| **SecuX V20** | 47 | ❌ | ❌ Closed | ✅ SE | Touch Color | Multi | ~$140 | USB/BT | ❌ | 🔒 Private | 🔴 |
| **Arculus** | 42 | ❌ | ❌ Closed | ✅ SE | None | Multi | ~$100 | NFC | ❌ | 🔒 Private | 🔴 |
| ~~**KeepKey**~~ | 39 | ❌ | ✅ Full | ❌ None | OLED | Multi | ~$50 | USB | ❌ | ❌ Inactive | 🔴 |
| **BC Vault** | 33 | ❌ | ❌ Closed | ❌ None | OLED | Multi | ~$140 | USB | ❌ | 🔒 Private | 🔴 |

**Legend:**
- **Score:** 0-100 weighted score (see [Scoring Methodology](#-scoring-methodology))
- **Air-Gap:** ✅ Fully air-gapped (no USB/BT during signing) | ❌ Requires physical connection
- **Open Source:** ✅ Full (firmware + bootloader) | ⚠️ Partial (some components) | ❌ Closed source
- **Secure Elem:** ✅ Has SE chip with type (Optiga, ATECC, etc.) | ❌ MCU only
- **Display:** Screen type and capabilities
- **Networks:** BTC = Bitcoin only | Multi = Multiple blockchain networks (verify specific chains on official sites)
- **Activity:** ✅ Active (≤30 days) | ⚠️ Slow (1-4 mo) | 🔒 Private | ❌ Inactive (>4 mo)
- **Price:** Approximate USD, verify on official site before purchase
- **Conn:** USB, Bluetooth (BT), QR codes, NFC, MicroSD, WiFi
- **BTC-Only:** ✅ Bitcoin-only device | ⚠️ Ed = Has BTC-only edition | ❌ Multi-chain
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

### Score Changes Explained

**Scores adjusted based on new factors:**

| Wallet | Old | New | Change | Reason |
|--------|-----|-----|--------|--------|
| Trezor Safe 5 | 92 | 94 | +2 | Active GitHub, excellent company track record |
| ColdCard Mk4 | 87 | 91 | +4 | Excellent GitHub metrics (0.9% issue ratio), air-gap bonus |
| Trezor Safe 3 | 90 | 91 | +1 | Active development, strong company |
| Keystone 3 Pro | 90 | 91 | +1 | Very active development |
| Foundation Passport | 86 | 81 | -5 | ⚠️ Slow GitHub activity (44 days) penalized |
| NGRAVE ZERO | 84 | 72 | -12 | Closed source firmware, no public repo |
| OneKey Pro | 80 | 77 | -3 | High issue ratio (82.4%), young company |
| GridPlus Lattice1 | 72 | 59 | -13 | SDK-only (no firmware), no public activity |
| Ellipal Titan | 65 | 48 | -17 | Closed source, unknown funding, no SE |
| SecuX V20 | 60 | 47 | -13 | Closed source, unknown funding |
| Ledger (all) | 63-65 | 55-57 | -8 | Ledger Recover privacy penalty, closed SE firmware |
| KeepKey | 47 | 39 | -8 | ❌ Inactive (296 days), abandoned company |
| BC Vault | 45 | 33 | -12 | No SE, closed source, unconventional backup |

**Key insight:** Wallets with closed-source firmware and/or inactive GitHub repos now score significantly lower, matching how we penalize inactive software wallets.

**Why Ledger Scores Low:**
- **Privacy (5/15):** Ledger Recover capability exists in firmware — even if "optional," the attack surface exists
- **Transparency (10/20):** Secure Element firmware is proprietary; only companion app is open source
- **Activity (5/15):** Firmware repo is private, can't verify development activity
- **Trust Model:** Requires trusting Ledger to not activate recovery without consent

---

## 🏆 Recommendations by Use Case

### For Maximum Security (Bitcoin-Only)

| Rank | Wallet | Score | Why |
|------|--------|-------|-----|
| 🥇 | **ColdCard Mk4** | 91 | Dual Secure Element, fully air-gapped, duress PIN, BTC maximalist standard, excellent GitHub metrics |
| 🥈 | **BitBox02 BTC-Only** | 88 | Swiss quality, fully open source, active development, simplified attack surface |
| 🥉 | **Foundation Passport** | 81 | Open source, beautiful design, air-gapped, excellent UX (⚠️ slower updates) |

### For Multi-Chain Security

| Rank | Wallet | Score | Why |
|------|--------|-------|-----|
| 🥇 | **Trezor Safe 5** | 94 | Fully open source, Secure Element, touch screen, multi-chain, very active development |
| 🥈 | **Keystone 3 Pro** | 91 | Air-gapped, QR codes, triple SE, active development |
| 🥉 | **Trezor Safe 3** | 91 | Best value, full open source, active development |

### For Air-Gapped Security

| Rank | Wallet | Score | Why |
|------|--------|-------|-----|
| 🥇 | **Keystone 3 Pro** | 91 | QR-only, never connects to computer, excellent screen, active development |
| 🥈 | **ColdCard Mk4** | 91 | MicroSD air-gap, no wireless, BTC-only, 0.9% issue ratio |
| 🥉 | **Foundation Passport** | 81 | MicroSD + QR, camera for signing, open source |
| 4 | **NGRAVE ZERO** | 72 | QR-only, EAL7 certification (⚠️ not fully open source) |

### For Best Value (Under $100)

| Rank | Wallet | Score | Price | Why |
|------|--------|-------|-------|-----|
| 🥇 | **Trezor Safe 3** | 91 | $79 | Secure Element + full open source + active development |
| 🥈 | **SafePal S1** | 62 | $49 | Air-gapped via QR (⚠️ partial open source, private repo) |
| 🥉 | **Tangem** | 53 | $55 | NFC cards, ultra-portable (⚠️ no screen, private repo) |

### For Beginners

| Rank | Wallet | Score | Why |
|------|--------|-------|-----|
| 🥇 | **Trezor Safe 5** | 94 | Intuitive touch screen, excellent companion app, good docs, active community |
| 🥈 | **BitBox02** | 88 | Simple setup, touch gestures, minimalist design, active development |
| 🥉 | **OneKey Pro** | 77 | MetaMask-like UX, color touch screen (⚠️ high issue ratio, young company) |

### For Integration with Software Wallets

| Wallet | MetaMask | Rabby | Rainbow | Safe | Sparrow | Electrum | Specter |
|--------|----------|-------|---------|------|---------|----------|---------|
| **Trezor** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Keystone** | ✅ QR | ✅ QR | ❌ | ✅ WC | ✅ | ❌ | ✅ |
| **BitBox02** | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| **ColdCard** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Passport** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Ledger** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **GridPlus** | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **OneKey** | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |

**Legend:** ✅ Native support | ⚠️ Via WalletConnect | ❌ Not supported | QR = Air-gapped via QR

---

## 📋 Detailed Wallet Profiles

### 🥇 Trezor Safe 5 (Score: 94)

**The most trusted name in hardware wallets, now with Secure Element**

| Attribute | Value |
|-----------|-------|
| **Price** | $169 USD |
| **Secure Element** | ✅ Optiga Trust M (EAL6+) |
| **Air-Gap** | ❌ USB-C connection required |
| **Open Source** | ✅ Fully open (firmware + bootloader) |
| **Display** | 1.54" color touch screen (240×240) |
| **Connectivity** | USB-C |
| **Chains** | Multi-chain (BTC, ETH, and many others — verify on trezor.io) |
| **Multisig** | ✅ Native support |
| **Passphrase** | ✅ On-device entry |
| **Shamir Backup** | ✅ SLIP-0039 support |
| **Coinjoin** | ✅ Built-in |
| **Company** | SatoshiLabs (Czech Republic, est. 2013) |

**Pros:**
- ✅ Fully open source — community-auditable
- ✅ Secure Element in new Safe series
- ✅ Excellent companion software (Trezor Suite)
- ✅ 10+ year track record
- ✅ No Ledger Recover-style features
- ✅ Touch screen with haptic feedback
- ✅ Reproducible builds

**Cons:**
- ⚠️ Not air-gapped (requires USB connection)
- ⚠️ Smaller display than some competitors
- ⚠️ No wireless connectivity

**Best For:** Users who want maximum transparency + good UX

**GitHub:** [trezor/trezor-firmware](https://github.com/trezor/trezor-firmware) — ⭐ 1,500+ | Active

---

### 🥈 Keystone 3 Pro (Score: 91)

**Air-gapped security with premium UX**

| Attribute | Value |
|-----------|-------|
| **Price** | $149 USD |
| **Secure Element** | ✅ 3× Secure Elements (EAL5+) |
| **Air-Gap** | ✅ Full (QR code only) |
| **Open Source** | ✅ Fully open |
| **Display** | 4" color touch screen (480×800) |
| **Connectivity** | QR codes only (camera) |
| **Chains** | 5,500+ cryptocurrencies |
| **Multisig** | ✅ Native support |
| **Passphrase** | ✅ On-device entry |
| **Fingerprint** | ✅ Biometric unlock |
| **PCI Anti-Tamper** | ✅ Bank-grade protection |
| **Company** | Keystone (Hong Kong, est. 2018) |

**Pros:**
- ✅ Fully air-gapped — never connects to computer
- ✅ Triple Secure Element architecture
- ✅ Excellent large touch display
- ✅ Fingerprint sensor for quick unlock
- ✅ Fully open source firmware
- ✅ Native MetaMask/Rabby integration via QR

**Cons:**
- ⚠️ Newer company (less track record than Trezor)
- ⚠️ QR signing can be slower than USB
- ⚠️ Larger form factor

**Best For:** Users who prioritize air-gapped security with great UX

**GitHub:** [KeystoneHQ/keystone3-firmware](https://github.com/KeystoneHQ/keystone3-firmware) — ⭐ 150+ | Active

---

### 🥉 BitBox02 (Score: 88)

**Swiss precision meets open source security**

| Attribute | Value |
|-----------|-------|
| **Price** | $149 USD (Multi / BTC-Only editions) |
| **Secure Element** | ✅ ATECC608 |
| **Air-Gap** | ❌ USB-C required |
| **Open Source** | ✅ Fully open |
| **Display** | OLED with touch slider controls |
| **Connectivity** | USB-C |
| **Chains** | 1,500+ (Multi) or BTC-only |
| **Multisig** | ✅ Native support |
| **Passphrase** | ✅ Optional |
| **microSD Backup** | ✅ Encrypted backup |
| **Company** | Shift Crypto (Switzerland, est. 2015) |

**Pros:**
- ✅ Fully open source — firmware, bootloader, hardware schematics
- ✅ Reproducible builds — verify what you're running
- ✅ BTC-only edition for minimized attack surface
- ✅ Swiss company with strong privacy values
- ✅ Elegant minimalist design
- ✅ microSD encrypted backup option

**Cons:**
- ⚠️ Smaller OLED display
- ⚠️ Touch slider interface has learning curve
- ⚠️ Not air-gapped

**Best For:** Users who want simplicity + full transparency

**GitHub:** [BitBoxSwiss/bitbox02-firmware](https://github.com/BitBoxSwiss/bitbox02-firmware) — ⭐ 330 | Active

---

### ColdCard Mk4 (Score: 91)

**The Bitcoin maximalist gold standard**

| Attribute | Value |
|-----------|-------|
| **Price** | $157 USD |
| **Secure Element** | ✅ Dual SE (Microchip ATECC608) |
| **Air-Gap** | ✅ Full (MicroSD + NFC) |
| **Open Source** | ✅ Fully open |
| **Display** | Monochrome LCD with numeric keypad |
| **Connectivity** | MicroSD, NFC (optional), USB (optional) |
| **Chains** | Bitcoin only |
| **Multisig** | ✅ Native, excellent support |
| **Passphrase** | ✅ Multiple passphrases |
| **Duress PIN** | ✅ Decoy wallet + brick features |
| **Company** | Coinkite (Canada, est. 2012) |

**Pros:**
- ✅ Dual Secure Element for key isolation
- ✅ Fully air-gapped operation possible
- ✅ Advanced features: duress PIN, brick PIN, login countdown
- ✅ Best-in-class multisig support
- ✅ Battle-tested by Bitcoin developers
- ✅ No altcoin attack surface

**Cons:**
- ⚠️ Bitcoin only (by design)
- ⚠️ Steeper learning curve
- ⚠️ Basic monochrome display
- ⚠️ Not beginner-friendly

**Best For:** Bitcoin maximalists, advanced users, multisig setups

**GitHub:** [Coldcard/firmware](https://github.com/Coldcard/firmware) — ⭐ 700+ | Active

---

### Foundation Passport (Score: 81)

**Open source, beautiful, Bitcoin-focused**

| Attribute | Value |
|-----------|-------|
| **Price** | $259 USD |
| **Secure Element** | ✅ Microchip ATECC608 |
| **Air-Gap** | ✅ Full (MicroSD + Camera/QR) |
| **Open Source** | ✅ Fully open (firmware + hardware) |
| **Display** | Color IPS LCD |
| **Connectivity** | MicroSD, Camera for QR |
| **Chains** | Bitcoin only |
| **Multisig** | ✅ Native support |
| **Passphrase** | ✅ On-device entry |
| **Duress** | ✅ Duress PIN support |
| **Company** | Foundation Devices (USA, est. 2020) |

**Pros:**
- ✅ Fully open source — hardware schematics included
- ✅ Beautiful industrial design (looks like a calculator)
- ✅ Air-gapped via camera or MicroSD
- ✅ USA-based company
- ✅ Excellent companion app (Envoy)
- ✅ Replaceable AAA batteries

**Cons:**
- ⚠️ Bitcoin only
- ⚠️ Higher price point
- ⚠️ Newer company (less track record)
- ⚠️ Larger form factor

**Best For:** Bitcoin holders who want premium open source hardware

**GitHub:** [Foundation-Devices/passport2](https://github.com/Foundation-Devices/passport2) — ⭐ 76 | ⚠️ Slow (44 days)

---

### NGRAVE ZERO (Score: 72)

**EAL7 certified, fully air-gapped**

| Attribute | Value |
|-----------|-------|
| **Price** | $398 USD |
| **Secure Element** | ✅ STM32 + SE (EAL7 certified) |
| **Air-Gap** | ✅ Full (QR code only) |
| **Open Source** | ⚠️ Partial (some components) |
| **Display** | 4" color touch screen |
| **Connectivity** | QR codes only (camera) |
| **Chains** | Multi-chain (verify on official site) |
| **Biometric** | ✅ Fingerprint sensor |
| **Light Key Gen** | ✅ Uses ambient light for entropy |
| **Company** | NGRAVE (Belgium, est. 2018) |

**Pros:**
- ✅ Highest security certification (EAL7)
- ✅ Fully air-gapped — no ports
- ✅ Innovative key generation using ambient light
- ✅ Premium metal build quality
- ✅ European company (GDPR jurisdiction)

**Cons:**
- ⚠️ Very expensive
- ⚠️ Not fully open source
- ⚠️ Smaller ecosystem than Trezor/Ledger
- ⚠️ No multisig support

**Best For:** Users who want maximum certification + air-gap

**Website:** [ngrave.io](https://www.ngrave.io/)

---

### GridPlus Lattice1 (Score: 59)

**Enterprise-grade with unique SafeCards**

| Attribute | Value |
|-----------|-------|
| **Price** | $397 USD |
| **Secure Element** | ✅ SE in SafeCards |
| **Air-Gap** | ❌ WiFi/USB connection |
| **Open Source** | ⚠️ SDK only (firmware is proprietary) |
| **Display** | 5" color touch screen |
| **Connectivity** | WiFi, USB, SafeCards |
| **Chains** | Multi-chain (verify on official site) |
| **SafeCards** | ✅ Removable secure elements |
| **Multisig** | ✅ Native support |
| **Company** | GridPlus (USA, est. 2017) |

**Pros:**
- ✅ Largest display of any hardware wallet
- ✅ Removable SafeCards (like smart cards)
- ✅ Fully open source
- ✅ WiFi connectivity for convenience
- ✅ Automatic signing rules

**Cons:**
- ⚠️ Very large form factor (not portable)
- ⚠️ Expensive
- ⚠️ WiFi may concern security purists
- ⚠️ Not air-gapped

**Best For:** Power users, home office setup, multiple wallets via SafeCards

**GitHub:** Firmware is proprietary; SDK at [GridPlus/gridplus-sdk](https://github.com/GridPlus/gridplus-sdk) — ⭐ 48 | Active

---

### OneKey Pro (Score: 77)

**Trezor-compatible with MetaMask UX**

| Attribute | Value |
|-----------|-------|
| **Price** | $199 USD |
| **Secure Element** | ✅ SE |
| **Air-Gap** | ❌ USB/Bluetooth |
| **Open Source** | ✅ Fully open |
| **Display** | 3.5" color touch screen |
| **Connectivity** | USB-C, Bluetooth |
| **Chains** | Multi-chain (verify on onekey.so) |
| **Fingerprint** | ✅ Biometric unlock |
| **Company** | OneKey (est. 2020) |

**Pros:**
- ✅ Fully open source (forked from Trezor)
- ✅ Familiar MetaMask-like companion app
- ✅ Color touch screen
- ✅ Fingerprint sensor
- ✅ More affordable than competitors

**Cons:**
- ⚠️ Newer company (less track record)
- ⚠️ Based in China (regulatory concerns)
- ⚠️ Bluetooth may concern security purists
- ⚠️ Fewer supported chains than Trezor

**Best For:** Users who want Trezor security with modern UX

**GitHub:** [OneKeyHQ/firmware-pro](https://github.com/OneKeyHQ/firmware-pro) — ⭐ 17 | Active

---

### 🔴 Ledger (Nano X/S+/Stax) — NOT RECOMMENDED

**Score: 63-65**

| Attribute | Value |
|-----------|-------|
| **Price** | $79-$279 USD |
| **Secure Element** | ✅ CC EAL5+ |
| **Air-Gap** | ❌ |
| **Open Source** | ⚠️ Companion app only; SE firmware proprietary |
| **Recovery** | 🔴 Ledger Recover can extract seed |

**Why Ledger is Not Recommended:**

1. **Ledger Recover (Critical):**
   - Firmware CAN extract seed phrase and transmit it
   - Even if "optional," the capability exists
   - Requires KYC — links identity to wallet
   - Creates trust dependencies on third parties

2. **Proprietary Secure Element Firmware:**
   - Cannot verify what code runs on SE
   - "Trust us" security model
   - No reproducible builds possible

3. **Past Security Incidents:**
   - July 2020: Customer database breach (272,000 emails, names, addresses leaked)
   - Led to targeted phishing campaigns
   - Physical threat to high-value users

4. **Business Model Concerns:**
   - Pivoting toward custodial services
   - Subscription-based recovery service
   - Pressure to monetize user base

**If You Must Use Ledger:**
- Never enable Ledger Recover
- Use passphrase (25th word) — Recover cannot extract this
- Consider firmware version pinning
- Use with multisig to reduce single-device risk

---

## ⚠️ Wallets to Avoid (Score <50)

| Wallet | Score | Reason |
|--------|-------|--------|
| **Ellipal Titan 2.0** | 48 | ❌ Closed source, no Secure Element, unknown funding |
| **SecuX V20** | 47 | ❌ Closed source, unknown funding, no public development |
| **Arculus** | 42 | ❌ Closed source, NFC-only (limited compatibility), no passphrase |
| **KeepKey** | 39 | ❌ INACTIVE (no commits 10 months), no Secure Element, company abandoned |
| **BC Vault** | 33 | ❌ Closed source, unconventional backup, no SE, limited ecosystem |

### Situational Use Only (Score 50-74)

These wallets have significant limitations but may work for specific use cases:

| Wallet | Score | Limitation | When to Consider |
|--------|-------|------------|------------------|
| **NGRAVE ZERO** | 72 | Not fully open source, private repo | If you trust NGRAVE's audits and want EAL7 |
| **SafePal S1** | 62 | Partial open source, Binance Labs funding | Budget air-gapped option |
| **GridPlus Lattice1** | 59 | SDK-only (no firmware), WiFi connectivity | Home desk device with large screen |
| **Ledger** | 55-57 | Ledger Recover capability, closed SE firmware | Only with passphrase (25th word) enabled |
| **Tangem** | 53 | No screen, NFC-only, partial open source | Ultra-portable backup cards |

---

## ❓ Why Look Beyond Ledger?

In May 2023, Ledger announced "Ledger Recover" — an optional firmware update that enables sharding your seed phrase and storing encrypted fragments with third-party custodians (Ledger, Coincover, EscrowTech). This fundamentally violates the core principle of hardware wallets:

> **🔴 Core Violation:** Private keys should NEVER leave the device under ANY circumstances.

**The Ledger Recover Controversy:**
- 🔴 Firmware can extract and transmit seed phrase fragments
- 🔴 Requires ID verification (KYC) — links identity to wallet
- 🔴 Creates attack vectors (social engineering, government subpoenas, data breaches)
- 🔴 Even if "optional," the capability exists in firmware
- 🔴 Trust model shifts from "trustless" to "trust Ledger + partners"

**This comparison helps you find hardware wallets that maintain the original promise:** Your keys never leave the device.

---

## 🔄 Migration Guide: Ledger → Alternative

If you're migrating from Ledger to another hardware wallet:

### Option 1: Fresh Start (Recommended for Security)
1. **Generate new seed** on new hardware wallet
2. **Transfer assets** from Ledger addresses to new addresses
3. **Verify** all transfers completed
4. **Wipe** Ledger device
5. **Store** old seed backup securely (in case of forgotten assets)

### Option 2: Import Existing Seed (Faster, Less Secure)
1. **Verify** new wallet supports BIP-39 (most do)
2. **Import** 24-word seed into new device
3. **Immediately** generate new addresses and transfer funds
4. **Generate** new seed after transfer (old seed was exposed to Ledger firmware)

**⚠️ Warning:** If you've ever used Ledger Recover or had firmware updates after May 2023, your seed may have been extracted. Fresh start is strongly recommended.

### Recommended Migration Paths

| From Ledger | To | Why |
|-------------|-----|-----|
| Nano S/S+ | Trezor Safe 3 | Same price point, fully open source |
| Nano X | Trezor Safe 5 | Similar UX, better transparency |
| Nano X | Keystone 3 Pro | Air-gapped upgrade |
| BTC holdings | ColdCard Mk4 | Maximum BTC security |
| Multi-chain | BitBox02 | Swiss quality, open source |

---

## 💰 Funding & Company Background

Understanding who makes hardware wallets helps assess long-term viability:

| Wallet | Company | Location | Founded | Funding | Risk |
|--------|---------|----------|---------|---------|------|
| **Trezor** | SatoshiLabs | Czech Republic | 2013 | 🟢 Self-funded (profitable) | Low |
| **Ledger** | Ledger SAS | France | 2014 | 🟢 VC ($380M+) | Low* |
| **Keystone** | Keystone (formerly Cobo) | Hong Kong | 2018 | 🟡 VC | Medium |
| **BitBox02** | Shift Crypto | Switzerland | 2015 | 🟢 Self-funded | Low |
| **ColdCard** | Coinkite | Canada | 2012 | 🟢 Self-funded | Low |
| **Foundation** | Foundation Devices | USA | 2020 | 🟡 VC (Seed) | Medium |
| **NGRAVE** | NGRAVE | Belgium | 2018 | 🟡 VC | Medium |
| **GridPlus** | GridPlus | USA | 2017 | 🟡 VC | Medium |
| **OneKey** | OneKey | Hong Kong/China | 2020 | 🟡 VC | Medium |
| **Ellipal** | Ellipal Ltd | Hong Kong | 2018 | 🔴 Unknown | Higher |
| **SafePal** | SafePal | Singapore | 2018 | 🟡 Binance Labs | Medium |
| **SecuX** | SecuX Technology | Taiwan | 2018 | 🔴 Unknown | Higher |
| **Tangem** | Tangem AG | Switzerland | 2017 | 🟡 VC | Medium |
| **KeepKey** | ~~ShapeShift~~ | USA | 2015 | 🔴 Abandoned | ❌ High |
| **Arculus** | CompoSecure | USA | 2021 | 🟢 Public company | Low |
| **BC Vault** | Real Security | Slovenia | 2018 | 🔴 Unknown | Higher |

**Legend:**
- 🟢 **Low risk:** Self-funded/profitable, or large VC backing with proven track record
- 🟡 **Medium risk:** VC-funded but smaller, or uncertain long-term model
- 🔴 **Higher risk:** Unknown funding, abandoned, or concerning patterns

*Ledger has low financial risk but high trust risk due to Ledger Recover

---

## ⚡ Known Quirks & Gotchas

Every hardware wallet has quirks. Know them before you buy:

| Wallet | Quirk | Impact | Workaround |
|--------|-------|--------|------------|
| **Trezor** | No Secure Element in older models (One/T) | Lower physical security | Buy Safe 3/5 with SE |
| **Trezor** | PIN entry on computer (older models) | Keylogger risk | Use Safe 5 with on-device entry |
| **Ledger** | Ledger Recover can extract seed | Trust violation | Use passphrase (25th word) |
| **Ledger** | 2020 data breach | Phishing/physical threats | Use PO box for shipping |
| **Keystone** | Larger form factor | Less portable | Use for home/office only |
| **Keystone** | QR signing slower than USB | UX friction | Accept trade-off for air-gap |
| **BitBox02** | Touch slider learning curve | Initial confusion | Watch tutorial videos |
| **ColdCard** | Steep learning curve | Intimidating for beginners | Read full manual |
| **ColdCard** | No altcoin support | Can't use for ETH/etc | Separate wallet for altcoins |
| **Passport** | Higher price point | Budget concern | Consider for BTC-only use |
| **Passport** | Larger form factor | Less portable | AAA batteries are replaceable |
| **NGRAVE** | Very expensive ($398) | Cost barrier | Consider alternatives |
| **NGRAVE** | Not fully open source | Can't verify firmware | Trust NGRAVE's audits |
| **GridPlus** | WiFi connectivity | Security concern for some | Can use USB-only mode |
| **GridPlus** | Very large, not portable | Home use only | Designed as desk device |
| **OneKey** | Based in China/HK | Regulatory concerns | Consider jurisdiction risks |
| **Ellipal** | No Secure Element | Relies on air-gap alone | May be less secure |
| **SafePal** | Binance-backed | Centralization concern | Personal preference |
| **Tangem** | No screen | Can't verify on device | Trust phone app display |
| **Tangem** | NFC-only | Requires NFC phone | Check phone compatibility |
| **KeepKey** | ABANDONED - no updates 10mo | Security risk | DO NOT BUY - migrate away |

### Common Hardware Wallet Pitfalls

1. **Don't trust the box** — Verify device integrity before first use
2. **Write down seed on paper** — Never digitally (no photos, no cloud)
3. **Test recovery before loading funds** — Verify backup works
4. **Buy direct from manufacturer** — Avoid Amazon/eBay tampering risk
5. **Update firmware carefully** — Read release notes, wait for community feedback
6. **Use passphrase for high-value** — Creates hidden wallet even if seed is compromised
7. **Don't reuse seeds** — Each wallet should have unique seed

---

## 🔗 Software Wallet Integration

### Browser Extension Integration

| Hardware Wallet | MetaMask | Rabby | Frame | Brave | Trust |
|----------------|----------|-------|-------|-------|-------|
| Trezor | ✅ WebUSB | ✅ WebUSB | ✅ | ✅ | ❌ |
| Ledger | ✅ WebUSB | ✅ WebUSB | ✅ | ✅ | ✅ |
| Keystone | ✅ QR | ✅ QR | ❌ | ❌ | ❌ |
| BitBox02 | ✅ WebUSB | ✅ WebUSB | ❌ | ✅ | ❌ |
| GridPlus | ✅ WebUSB | ✅ WebUSB | ✅ | ❌ | ❌ |
| OneKey | ✅ | ✅ | ❌ | ❌ | ❌ |

### Bitcoin Desktop Wallets

| Hardware Wallet | Sparrow | Electrum | Specter | BlueWallet |
|----------------|---------|----------|---------|------------|
| Trezor | ✅ | ✅ | ✅ | ✅ |
| ColdCard | ✅ | ✅ | ✅ | ✅ |
| Foundation Passport | ✅ | ✅ | ✅ | ✅ |
| BitBox02 | ✅ | ✅ | ✅ | ❌ |
| Keystone | ✅ | ❌ | ✅ | ✅ |
| Ledger | ✅ | ✅ | ❌ | ✅ |

---

## 📊 Technical Specifications

### Physical Specifications

| Wallet | Dimensions (mm) | Weight | Battery | IP Rating |
|--------|-----------------|--------|---------|-----------|
| Trezor Safe 5 | 59×32×11 | 22g | None (USB) | None |
| Trezor Safe 3 | 59×32×11 | 22g | None (USB) | None |
| Keystone 3 Pro | 112×65×15 | 115g | Li-ion 1000mAh | None |
| BitBox02 | 54.5×25.4×9.6 | 12g | None (USB) | None |
| ColdCard Mk4 | 88×51×9 | 30g | None (USB) | None |
| Passport | 107×39×20 | 54g | 2× AAA | None |
| NGRAVE ZERO | 116×72×10 | 77g | Li-ion | IP65 |
| GridPlus Lattice1 | 186×119×43 | 425g | None (USB/WiFi) | None |
| Ledger Nano X | 72×18.6×11.75 | 34g | Li-ion 100mAh | None |

### Display Specifications

| Wallet | Display Size | Resolution | Type | Touch |
|--------|-------------|------------|------|-------|
| Trezor Safe 5 | 1.54" | 240×240 | Color IPS | ✅ |
| Trezor Safe 3 | 0.96" | 128×64 | Mono OLED | ❌ |
| Keystone 3 Pro | 4.0" | 480×800 | Color IPS | ✅ |
| BitBox02 | 1.0" | 128×64 | Mono OLED | Touch slider |
| ColdCard Mk4 | 2.0" | 128×64 | Mono LCD | ❌ (Keypad) |
| Passport | 2.0" | 320×240 | Color IPS | ❌ (Buttons) |
| NGRAVE ZERO | 4.0" | 480×800 | Color IPS | ✅ |
| GridPlus Lattice1 | 5.0" | 720×1280 | Color IPS | ✅ |
| Ledger Nano X | 0.94" | 128×64 | Mono OLED | ❌ (Buttons) |

---

## 🛡️ Security Certifications

| Wallet | Secure Element Cert | Additional Certs | Audits |
|--------|--------------------| -----------------|--------|
| Trezor Safe 5 | EAL6+ (Optiga) | — | Cure53 (2019), multiple |
| Keystone 3 Pro | EAL5+ (3× SE) | PCI DSS | SlowMist (2023) |
| BitBox02 | ATECC608 | — | Consulcate, multiple |
| ColdCard Mk4 | ATECC608 (2×) | — | Community audited |
| Passport | ATECC608 | — | Community audited |
| NGRAVE ZERO | EAL7 (STM32+SE) | — | Kudelski (2021) |
| Ledger | CC EAL5+ | CSPN | Ledger Donjon (internal) |

**Certification Levels:**
- **EAL5-7:** Common Criteria security certification (higher = more rigorous)
- **CC:** Common Criteria
- **CSPN:** French security certification
- **PCI DSS:** Payment Card Industry Data Security Standard

---

## ✅ Data Verification Status

This document underwent multi-pass review on December 2025. Here's the verification status:

### Verified via GitHub API (Dec 2025)
| Wallet | Repo | Stars | Last Updated | Status |
|--------|------|-------|--------------|--------|
| Trezor | trezor/trezor-firmware | 1,626 | Dec 5, 2025 | ✅ Active |
| Keystone | KeystoneHQ/keystone3-firmware | 188 | Dec 3, 2025 | ✅ Active |
| BitBox02 | BitBoxSwiss/bitbox02-firmware | 330 | Dec 4, 2025 | ✅ Active |
| ColdCard | Coldcard/firmware | 689 | Nov 27, 2025 | ✅ Active |
| Foundation | Foundation-Devices/passport2 | 76 | Oct 22, 2025 | ⚠️ Slow |
| OneKey | OneKeyHQ/firmware-pro | 17 | Dec 3, 2025 | ✅ Active |
| KeepKey | keepkey/keepkey-firmware | 162 | Feb 11, 2025 | ❌ Inactive |

### Verified: All Items Are Hardware Wallets
All 18 wallets listed are confirmed physical hardware devices for cryptocurrency cold storage. None are software wallets.

### Corrections Made During Review
1. **GridPlus Lattice1**: Corrected from "Open Source ✅ Full" to "⚠️ SDK only" — firmware is proprietary
2. **BitBox02**: Fixed GitHub org from `digitalbitbox` to `BitBoxSwiss`
3. **Star counts**: Updated to actual verified counts (several were over-estimated)
4. **Trezor Safe 3**: Fixed scoring inconsistency (chains column)

### Not Independently Verified
- Exact current retail prices (change frequently)
- Some technical specs (taken from official marketing)
- Security audit reports (links provided but not validated)
- NGRAVE, Ellipal, SafePal, SecuX, Tangem, Arculus, BC Vault — no public GitHub repos to verify

### Data Confidence Levels
- **High confidence:** Trezor, Ledger, ColdCard, BitBox02 (established, well-documented)
- **Medium confidence:** Keystone, Foundation, OneKey, GridPlus (verified repos, newer companies)
- **Lower confidence:** Ellipal, SafePal, SecuX, Tangem, Arculus, BC Vault (closed source, marketing-based data)

---

## 📝 Changelog

| Date | Change | Details |
|------|--------|---------|
| Dec 2025 | Document created | Initial hardware wallet comparison |
| Dec 2025 | Scoring methodology | Security-first weighting with Ledger penalty |
| Dec 2025 | 15+ wallets added | Comprehensive market coverage |
| Dec 2025 | Multi-pass review | Corrected GridPlus open source status, fixed GitHub links/stars |
| Dec 2025 | Added GitHub Metrics | Live data from refresh script, stars/issues/ratio |
| Dec 2025 | KeepKey marked INACTIVE | No commits for 296 days — effectively abandoned |
| Dec 2025 | Score math fixed | Corrected Ellipal (65), SecuX (60), Tangem (63), BC Vault (45) |
| Dec 2025 | Added Funding section | Company background with 🟢/🟡/🔴 risk ratings |
| Dec 2025 | Added Quirks section | Known issues and workarounds for each wallet |

---

## 🆕 Contributing

To add a new hardware wallet or update existing data:

1. **Verify** all specifications from official sources
2. **Check** for security audits and certifications
3. **Test** software wallet integrations
4. **Submit** PR with sources

### Required Data for New Wallets

```markdown
| Wallet | Score | Air-Gap | Open Source | Secure Elem | Display | Chains | Price | Conn | BTC-Only | Rec |
```

### Verification Checklist

- [ ] Official website specifications verified
- [ ] GitHub repository checked (if claimed open source)
- [ ] Security audit reports linked
- [ ] Price verified from official store
- [ ] Companion software tested
- [ ] Integration with major software wallets verified

---

## Resources

### Official Sources
- [Trezor](https://trezor.io/) — [GitHub](https://github.com/trezor)
- [Keystone](https://keyst.one/) — [GitHub](https://github.com/KeystoneHQ)
- [BitBox02](https://bitbox.swiss/bitbox02/) — [GitHub](https://github.com/BitBoxSwiss)
- [ColdCard](https://coldcard.com/) — [GitHub](https://github.com/Coldcard)
- [Foundation Passport](https://foundationdevices.com/) — [GitHub](https://github.com/Foundation-Devices)
- [NGRAVE](https://www.ngrave.io/)
- [GridPlus](https://gridplus.io/) — [GitHub](https://github.com/GridPlus)
- [OneKey](https://onekey.so/) — [GitHub](https://github.com/OneKeyHQ)

### Security Resources
- [WalletScrutiny](https://walletscrutiny.com/) — Open source verification
- [Bitcoin Hardware Wallet Comparison](https://bitcoin-hardware-wallet.github.io/)
- [Jameson Lopp's Hardware Wallet Tests](https://blog.lopp.net/metal-bitcoin-seed-storage-stress-tests/)

### Community
- [r/Bitcoin](https://reddit.com/r/Bitcoin) — Hardware wallet discussions
- [r/CryptoCurrency](https://reddit.com/r/CryptoCurrency) — General crypto hardware
- [BitcoinTalk](https://bitcointalk.org/) — Original hardware wallet forum

---

*Last updated: December 2025. Data from official sources, GitHub, security audits, and community research. Always verify current specifications before purchase.*
