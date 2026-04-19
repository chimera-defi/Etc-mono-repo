# Hardware Wallet Comparison (Cold Storage Alternatives to Ledger) - Full Documentation

> 📊 **View the comparison table:** [See all wallets at a glance →](./HARDWARE_WALLETS.md)

> **Source of truth note:** Current `Score` and `Rec` values are generated from the visible columns in [HARDWARE_WALLETS.md](./HARDWARE_WALLETS.md) via `wallets/scripts/sync_table_scores.js` (`2026-04-visible-columns-v3`). If a long-form section below mentions older numeric scores, trust the main comparison table.

> **TL;DR:** The generated snapshot below mirrors the current main-table ordering and scores. Use it for the latest rankings; the long-form sections below explain security architecture, firmware transparency, and tradeoffs in more detail.

<!-- GENERATED_HARDWARE_SNAPSHOT_START -->
> **Current generated snapshot:** Keystone 3 Pro (92, ✅ Active, 🟢), ColdCard Mk4 (88, ✅ Active, 🟢), Keycard Shell (85, ✅ Active, 🟢), and Foundation Passport (84, ✅ Active, 🟢). Regenerated from [HARDWARE_WALLETS.md](./HARDWARE_WALLETS.md) by `wallets/scripts/sync_table_scores.js` using methodology `2026-04-visible-columns-v3`.

### Current Top Rows (generated)
| Rank | Wallet | Score | Activity | Rec |
| ---- | ------ | ----- | -------- | --- |
| 1 | **Keystone 3 Pro** | 92 | ✅ Active | 🟢 |
| 2 | **ColdCard Mk4** | 88 | ✅ Active | 🟢 |
| 3 | **Keycard Shell** | 85 | ✅ Active | 🟢 |
| 4 | **Foundation Passport** | 84 | ✅ Active | 🟢 |
| 5 | **Trezor Safe 7** | 80 | ✅ Active | 🟢 |
<!-- GENERATED_HARDWARE_SNAPSHOT_END -->

**Last Updated:** February 2026 | [Scoring Methodology](#-scoring-methodology) | [GitHub Activity Data](#github-metrics-firmware-repositories) | [View Company Aggregates](./HARDWARE_WALLET_COMPANIES.md)

**Related:** See [Software Wallet Comparison](./SOFTWARE_WALLETS.md) for EVM wallet recommendations and integration details.
**Companies:** See [Hardware Wallet Companies](./HARDWARE_WALLET_COMPANIES.md) for aggregated scores and wallet counts by manufacturer.

---

## Table of Contents

- [Complete Hardware Wallet Comparison](./HARDWARE_WALLETS.md#complete-hardware-wallet-comparison) (Table View)
- [Quick Recommendations](#-quick-recommendations)
- [GitHub Metrics](#github-metrics-firmware-repositories)
- [Security Deep Dive](#-security-deep-dive)
- [Scoring Methodology](#-scoring-methodology)
- [Wallets to Avoid or Use with Caution](#-wallets-to-avoid-or-use-with-caution)
- [Why Look Beyond Ledger?](#-why-look-beyond-ledger)
- [Ledger Migration](#-ledger-migration)
- [Resources](#resources)
- [Changelog](#-changelog)

---

## Column Definitions

Complete explanations for all table columns:

| Column | Values | Meaning |
|--------|--------|---------|
| **Score** | 0-100 | Weighted score prioritizing security, transparency, privacy, activity, company track record, and UX. See [Scoring Methodology](#-scoring-methodology) |
| **GitHub** | Link or "Private" | Firmware repository link | "Private" = closed source firmware |
| **Air-Gap** | ✅ Full / ❌ | ✅ Full = QR/MicroSD only (never connects to computer during signing) | ❌ = USB/BT connection required |
| **Open Source** | ✅ Full / ⚠️ Partial / ❌ Closed | ✅ Full = Firmware + bootloader open source | ⚠️ Partial = App open, firmware closed | ❌ Closed = No open source code |
| **Secure Elem** | ✅ Type / ❌ None | ✅ = Has Secure Element chip (Optiga, ATECC, STM32, etc.) | ❌ = MCU only (no hardware security chip) |
| **Display** | Type | Screen type: Touch Color, Mono OLED, Color LCD, LCD, E-Ink Touch, None (NFC card) |
| **Price** | ~$XXX | Approximate USD price (verify on official site). *DIY wallets = component cost varies |
| **Conn** | USB, BT, QR, NFC, MicroSD, WiFi | Connection methods: USB-C, USB, Bluetooth (BT), QR codes, NFC, MicroSD card, WiFi |
| **Activity** | ✅ / ⚠️ / ❌ / 🔒 | ✅ = Active (≤30 days since last commit) | ⚠️ = Slow (1-4 months) | ❌ = Inactive (4+ months) | 🔒 = Private repo |
| **Rec** | 🟢 / 🟡 / 🔴 | 🟢 = Top half of active rows | 🟡 = Middle quartile | 🔴 = Bottom quartile or inactive |

**Special Notes:**
- ~~Strikethrough~~ = Abandoned/inactive wallet
- *DIY wallets = Requires self-assembly, price varies based on components

---

### GitHub Metrics (Firmware Repositories)

**Generated:** February 5, 2026 via `scripts/refresh-hardware-wallet-data.sh`

| Wallet | Repository | Last Commit | Stars | Issues | Ratio | Status |
|--------|------------|-------------|-------|--------|-------|--------|
| **Trezor** | [trezor/trezor-firmware](https://github.com/trezor/trezor-firmware) | Feb 5, 2026 | 1,663 | 556 | 33.4% | ✅ Active |
| **Blockstream Jade** | [Blockstream/Jade](https://github.com/Blockstream/Jade) | Feb 2, 2026 | 442 | 93 | 21.0% | ✅ Active |
| **SeedSigner** | [SeedSigner/seedsigner](https://github.com/SeedSigner/seedsigner) | Jan 27, 2026 | 1,024 | 227 | 22.2% | ✅ Active |
| **Specter DIY** | [cryptoadvance/specter-diy](https://github.com/cryptoadvance/specter-diy) | Jan 29, 2026 | 542 | 77 | 14.2% | ✅ Active |
| **Krux** | [selfcustody/krux](https://github.com/selfcustody/krux) | Jan 13, 2026 | 308 | 59 | 19.2% | ✅ Active |
| **Keystone** | [KeystoneHQ/keystone3-firmware](https://github.com/KeystoneHQ/keystone3-firmware) | Feb 5, 2026 | 197 | 92 | 46.7% | ✅ Active |
| **BitBox02** | [BitBoxSwiss/bitbox02-firmware](https://github.com/BitBoxSwiss/bitbox02-firmware) | Feb 5, 2026 | 341 | 50 | 14.7% | ✅ Active |
| **ColdCard** | [Coldcard/firmware](https://github.com/Coldcard/firmware) | Feb 2, 2026 | 692 | 8 | 1.2% | ✅ Active |
| **Foundation Passport** | [Foundation-Devices/passport2](https://github.com/Foundation-Devices/passport2) | Dec 9, 2025 | 77 | 7 | 9.1% | ⚠️ Slow |
| **OneKey** | [OneKeyHQ/firmware-pro](https://github.com/OneKeyHQ/firmware-pro) | Feb 3, 2026 | 19 | 15 | 78.9% | ✅ Active |
| **KeepKey** | [keepkey/keepkey-firmware](https://github.com/keepkey/keepkey-firmware) | Feb 11, 2025 | 163 | 17 | 10.4% | ❌ Inactive |

**Code Quality Notes:**
- ✅ **ColdCard (1.2%):** Excellent code quality — minimal issues relative to community size
- ✅ **BitBox02 (14.7%):** Good code quality
- ✅ **Specter DIY (14.2%):** Good code quality for DIY project
- ✅ **Krux (19.2%):** Good code quality
- ✅ **Blockstream Jade (21.0%):** Good code quality, active development
- ⚠️ **SeedSigner (22.2%):** Moderate — large community, many feature requests
- ⚠️ **Trezor (33.4%):** Higher ratio reflects large feature set and user base
- ⚠️ **Keystone (46.7%):** Moderate — newer project with active development
- 🔴 **OneKey (78.9%):** High ratio — many open issues relative to stars
- 🔴 **KeepKey:** No commits for 358 days — effectively abandoned

**Closed Source (no public firmware repos):** Ledger, NGRAVE, Ellipal, SafePal, SecuX, Tangem, BC Vault, GridPlus

**Firmware Release Patterns:**
Unlike software wallets where frequent updates can indicate instability, hardware wallet firmware updates are intentionally infrequent for security. Most manufacturers release 2-4 firmware updates per year. This is by design — each update requires extensive security review and user action to install.

| Wallet | Recent Releases (2025) | Pattern |
|--------|------------------------|---------|
| Keystone | 5 releases | ~1/month (active development) |
| Krux | 4 releases | ~1/quarter (active) |
| BitBox02 | 3-4 releases | ~1/quarter (stable) |
| Foundation Passport | 2 releases | ~1/quarter (stable) |
| SeedSigner | 2 releases | ~2/year (stable) |
| Specter DIY | 1 release | ~1/year (stable mature project) |
| OneKey | 3 releases | ~1/quarter (stable) |
| Blockstream Jade | Via tags | Continuous development |
| Trezor | Via Trezor Suite | App-managed updates |
| ColdCard | Via tags | Manual firmware downloads |

---

## 🏆 Quick Recommendations

**Quick Answers:** Best overall? **Trezor Safe 7** (96) - quantum-ready security. Air-gapped? **Keystone 3 Pro** (91). Bitcoin-only? **ColdCard Mk4** (91). Best value? **Trezor Safe 3** (91) at $79. Budget option? **Blockstream Jade** (81) at ~$65. See [full comparison table](#complete-hardware-wallet-comparison) for all hardware wallets.

**Jump to:** [Comparison Table](#complete-hardware-wallet-comparison) | [Scoring Methodology](#-scoring-methodology) | [Security Deep Dive](#-security-deep-dive) | [Why Look Beyond Ledger?](#-why-look-beyond-ledger)

### Top Picks by Use Case

| Use Case | Top Pick | Score | Runner-Up | Budget Option |
|----------|----------|-------|-----------|---------------|
| **Best Overall** | Trezor Safe 5 | 92 | Keystone 3 Pro (91) | Trezor Safe 3 (~$79) |
| **Bitcoin Only** | ColdCard Mk4 | 91 | Foundation Passport (81) | Blockstream Jade (~$65) |
| **Air-Gapped** | Keystone 3 Pro | 91 | Keycard Shell (91) | SafePal S1 (~$50) |
| **Best Value** | Trezor Safe 3 | 91 | Blockstream Jade (81) | Tangem (~$55) |
| **Beginners** | Trezor Safe 5 | 92 | BitBox02 (88) | Blockstream Jade (~$65) |
| **DIY/Self-Build** | Specter DIY | 72 | SeedSigner (65) | Krux (~$30-100) |

### DIY Signing Devices

For technically-inclined users who want maximum transparency and control:

| Device | What You Need | Difficulty | Best For |
|--------|---------------|------------|----------|
| **Specter DIY** | ESP32 board + camera + display | Medium | Multi-chain, experienced users |
| **SeedSigner** | Raspberry Pi Zero + camera + display | Easy-Medium | Bitcoin maximalists, popular community |
| **Krux** | M5StickV or similar | Easy | Beginners to DIY, cheapest option |

**DIY Trade-offs:**
- ✅ **Pros:** Fully open source, air-gapped, no supply chain trust, educational, cheap
- ❌ **Cons:** No Secure Element (lower physical security), requires assembly, no manufacturer warranty

### ⚠️ Wallets to Avoid or Use with Caution

| Wallet | Score | Issue |
|--------|-------|-------|
| **Ledger** (all models) | 55-57 | ⚠️ Ledger Recover capability — use with passphrase only |
| **Ellipal Titan** | 48 | Closed source, no Secure Element |
| **SecuX V20** | 47 | Closed source, unknown funding |
| **Arculus** | 42 | Closed source, NFC-only, no passphrase |
| **KeepKey** | 39 | ❌ ABANDONED (10 months no updates) |
| **BC Vault** | 33 | Closed source, no SE, unconventional backup |

**See also:** [Why Look Beyond Ledger?](#-why-look-beyond-ledger) for details on Ledger Recover concerns.

---

## 🔒 Security Deep Dive

### Security Features Comparison

| Wallet | Secure Element | Air-Gap | Open Firmware | Reproducible | Passphrase | Multisig | Duress PIN | Anti-Tamper |
|--------|---------------|---------|---------------|--------------|------------|----------|------------|-------------|
| **Trezor Safe 5** | ✅ Optiga Trust M (EAL6+) | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Keystone 3 Pro** | ✅ 3× SE (EAL5+) | ✅ QR | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **BitBox02** | ✅ ATECC608 | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **ColdCard Mk4** | ✅ Dual SE | ✅ MicroSD | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Blockstream Jade** | ✅ SE | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Foundation Passport** | ✅ SE | ✅ MicroSD/QR | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Trezor Safe 3** | ✅ Optiga Trust M (EAL6+) | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **NGRAVE ZERO** | ✅ STM32 + SE (EAL7) | ✅ QR | ⚠️ | ❌ | ✅ | ❌ | ❌ | ✅ |
| **Specter DIY** | ❌ MCU only | ✅ QR | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ DIY |
| **Krux** | ❌ MCU only | ✅ QR | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ DIY |
| **SeedSigner** | ❌ MCU only | ✅ QR | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ DIY |
| **GridPlus Lattice1** | ✅ SE | ❌ WiFi | ⚠️ SDK | ❌ | ✅ | ✅ | ❌ | ✅ |
| **OneKey Pro** | ✅ SE | ❌ | ✅ | ⚠️ | ✅ | ❌ | ❌ | ✅ |
| **Ellipal Titan** | ❌ MCU only | ✅ QR | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| **SafePal S1** | ✅ SE | ✅ QR | ⚠️ | ❌ | ✅ | ❌ | ❌ | ✅ |
| **SecuX V20** | ✅ SE (Infineon) | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ⚠️ |
| **Tangem** | ✅ EAL6+ NFC | ❌ NFC | ⚠️ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Ledger Nano X** | ✅ CC EAL5+ | ❌ | ⚠️ | ❌ | ✅ | ⚠️ | ❌ | ✅ |
| **Ledger Nano S+** | ✅ CC EAL5+ | ❌ | ⚠️ | ❌ | ✅ | ⚠️ | ❌ | ✅ |
| ~~**Ledger Nano S**~~ | ✅ CC EAL5+ | ❌ | ⚠️ | ❌ | ✅ | ⚠️ | ❌ | ✅ |
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

**Quick Reference:** Score = Security Architecture (34) + Transparency & Maintenance (28) + Usability & Value (32) + Company Track Record (6) = 100 total

Hardware wallet scoring now uses generated values from visible columns in [HARDWARE_WALLETS.md](./HARDWARE_WALLETS.md), consistent with the same "visible columns only" model used across software, cards, and ramps:

| Category | Weight | Description | Data Sources |
|----------|--------|-------------|--------------|
| **Security Architecture** | 34 pts | Secure element profile + air-gap posture | Table columns |
| **Transparency & Maintenance** | 28 pts | Public firmware depth + open source + activity signal | Table columns |
| **Usability & Value** | 32 pts | Display ergonomics + price + connectivity tradeoffs | Table columns |
| **Company Track Record** | 6 pts | Founded year + funding durability signal | `Founded` + `Funding` columns |

### Scoring Criteria Detail

> ⚠️ This section is a legacy narrative reference. The current source of truth is the generated scoring model in `wallets/frontend/src/lib/scoring.js`, driven strictly by visible table columns.

```
SECURITY ARCHITECTURE (25 pts)
  Secure Element present: +8
  SE certification EAL6+: +4 (EAL5+: +2, EAL7: +6)
  Air-gap capable (QR/MicroSD only): +8
  Dual/Triple SE or Custom Silicon (Tropic01): +3
  Physical tamper protection: +2
  Advanced Features (Shamir Backup, Multisig, Passphrase): +5
  Security Audit / Bug Bounty Program: +3
  No SE, MCU only: -5 penalty
  (Max score capped at 25)
  
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
| **Trezor Safe 7** | 22/25 | 20/20 | 15/15 | 15/15 | 14/15 | 10/10 | **96** |
| **Trezor Safe 5** | 20/25 | 20/20 | 15/15 | 15/15 | 14/15 | 8/10 | **92** |
| **Keystone 3 Pro** | 25/25 | 20/20 | 15/15 | 15/15 | 8/15 | 8/10 | **91** |
| **Keycard Shell** | 25/25 | 20/20 | 15/15 | 15/15 | 10/15 | 6/10 | **91** |
| **Trezor Safe 3** | 22/25 | 20/20 | 15/15 | 15/15 | 14/15 | 5/10 | **91** |
| **ColdCard Mk4** | 25/25 | 20/20 | 15/15 | 15/15 | 12/15 | 4/10 | **91** |
| **BitBox02** | 20/25 | 20/20 | 15/15 | 15/15 | 12/15 | 6/10 | **88** |
| **Blockstream Jade** | 16/25 | 18/20 | 15/15 | 15/15 | 12/15 | 5/10 | **81** |
| **Foundation Passport** | 23/25 | 20/20 | 15/15 | 8/15 | 10/15 | 5/10 | **81** |
| **OneKey Pro** | 18/25 | 18/20 | 13/15 | 15/15 | 6/15 | 7/10 | **77** |
| **NGRAVE ZERO** | 24/25 | 10/20 | 15/15 | 5/15 | 10/15 | 8/10 | **72** |
| **Specter DIY** ⚙️ | 13/25 | 20/20 | 15/15 | 15/15 | 6/15 | 3/10 | **72** |
| **Krux** ⚙️ | 13/25 | 18/20 | 15/15 | 15/15 | 4/15 | 2/10 | **67** |
| **SeedSigner** ⚙️ | 13/25 | 18/20 | 15/15 | 8/15 | 7/15 | 4/10 | **65** |
| **SafePal S1** | 20/25 | 10/20 | 14/15 | 5/15 | 8/15 | 5/10 | **62** |
| **GridPlus Lattice1** | 18/25 | 8/20 | 12/15 | 5/15 | 8/15 | 8/10 | **59** |
| **Ledger Stax** | 20/25 | 10/20 | 5/15 | 5/15 | 10/15 | 7/10 | **57** |
| **Ledger Nano X** | 20/25 | 10/20 | 5/15 | 5/15 | 10/15 | 6/10 | **56** |
| **Ledger Nano S+** | 20/25 | 10/20 | 5/15 | 5/15 | 10/15 | 5/10 | **55** |
| ~~**Ledger Nano S**~~ | 20/25 | 10/20 | 5/15 | 0/15 | 10/15 | 4/10 | **49** |
| **Tangem Wallet** | 18/25 | 8/20 | 10/15 | 5/15 | 8/15 | 4/10 | **53** |
| **Ellipal Titan 2.0** | 16/25 | 0/20 | 15/15 | 5/15 | 5/15 | 7/10 | **48** |
| **SecuX V20** | 18/25 | 0/20 | 13/15 | 5/15 | 5/15 | 6/10 | **47** |
| **Arculus** | 18/25 | 0/20 | 8/15 | 5/15 | 8/15 | 3/10 | **42** |
| ~~**KeepKey**~~ | 8/25 | 18/20 | 10/15 | 0/15 | 0/15 | 3/10 | **39** |
| **BC Vault** | 8/25 | 0/20 | 10/15 | 5/15 | 5/15 | 5/10 | **33** |

*⚙️ = DIY/Self-build wallet — requires assembly, no Secure Element but fully air-gapped via QR codes*

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

## Resources

### Manufactured Wallets
- [Trezor](https://trezor.io/) — [GitHub](https://github.com/trezor)
- [Keystone](https://keyst.one/) — [GitHub](https://github.com/KeystoneHQ)
- [BitBox02](https://bitbox.swiss/) — [GitHub](https://github.com/BitBoxSwiss)
- [Blockstream Jade](https://blockstream.com/jade/) — [GitHub](https://github.com/Blockstream/Jade)
- [ColdCard](https://coldcard.com/) — [GitHub](https://github.com/Coldcard)
- [Foundation Passport](https://foundationdevices.com/) — [GitHub](https://github.com/Foundation-Devices)

### DIY Signing Devices
- [SeedSigner](https://seedsigner.com/) — [GitHub](https://github.com/SeedSigner/seedsigner) — Raspberry Pi-based
- [Specter DIY](https://specter.solutions/hardware/) — [GitHub](https://github.com/cryptoadvance/specter-diy) — ESP32-based
- [Krux](https://selfcustody.github.io/krux/) — [GitHub](https://github.com/selfcustody/krux) — M5StickV/similar

### Verification & Research
- [WalletScrutiny](https://walletscrutiny.com/) — Open source verification
- [Bitcoin Wiki - Hardware Wallets](https://en.bitcoin.it/wiki/Hardware_wallet)

---

## 📝 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a complete history of changes to hardware wallet statuses, recommendations, and documentation structure.

---

*Last updated: December 8, 2025. Always verify current specifications on official sites before purchase.*
