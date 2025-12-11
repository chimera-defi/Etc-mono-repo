# Hardware Wallet Comparison (Cold Storage Alternatives to Ledger)

> **TL;DR:** Use **Trezor Safe 5** (94) for best security + UX, **ColdCard Mk4** (91) for Bitcoin maximalists, **Keystone 3 Pro** (91) for air-gapped security, or **Trezor Safe 3** (91) for best value at $79. **Blockstream Jade** (81) is a great budget option. For DIY enthusiasts: **Specter DIY** (72) or **SeedSigner** (65). **Ledger** (55-57) is penalized for Ledger Recover. See [Why Look Beyond Ledger?](./HARDWARE_WALLET_COMPARISON_DETAILS.md#-why-look-beyond-ledger) for details.

**Last Updated:** December 2025 | [Scoring Methodology](./HARDWARE_WALLET_COMPARISON_DETAILS.md#-scoring-methodology) | [GitHub Activity Data](#github-metrics-firmware-repositories)

**Related:** See [Software Wallet Comparison](./WALLET_COMPARISON_UNIFIED_TABLE.md) for EVM wallet recommendations and integration details.

---

> 📖 **Want more details?** See the [full documentation with recommendations, methodology, security deep dive, and more](./HARDWARE_WALLET_COMPARISON_DETAILS.md).

## Complete Hardware Wallet Comparison (23 Wallets)

| Wallet | Score | GitHub | Air-Gap | Open Source | Secure Elem | Display | Price | Conn | Activity | Rec |
|--------|-------|--------|---------|-------------|-------------|---------|-------|------|----------|-----|
| [**Trezor Safe 5**](https://trezor.io/) | 94 | [trezor-firmware](https://github.com/trezor/trezor-firmware) | ❌ | ✅ Full | ✅ Optiga | Touch Color | ~$169 | USB-C | ✅ Active | 🟢 |
| [**Keystone 3 Pro**](https://keyst.one/) | 91 | [keystone3-firmware](https://github.com/KeystoneHQ/keystone3-firmware) | ✅ Full | ✅ Full | ✅ 3× SE | Touch Color | ~$149 | QR | ✅ Active | 🟢 |
| [**ColdCard Mk4**](https://coldcard.com/) | 91 | [firmware](https://github.com/Coldcard/firmware) | ✅ Full | ✅ Full | ✅ Dual SE | Mono LCD | ~$150 | MicroSD | ✅ Active | 🟢 |
| [**Trezor Safe 3**](https://trezor.io/) | 91 | [trezor-firmware](https://github.com/trezor/trezor-firmware) | ❌ | ✅ Full | ✅ Optiga | Mono OLED | ~$79 | USB-C | ✅ Active | 🟢 |
| [**BitBox02**](https://bitbox.swiss/) | 88 | [bitbox02-firmware](https://github.com/BitBoxSwiss/bitbox02-firmware) | ❌ | ✅ Full | ✅ ATECC | Touch Edge | ~$150 | USB-C | ✅ Active | 🟢 |
| [**Blockstream Jade**](https://blockstream.com/jade/) | 81 | [Jade](https://github.com/Blockstream/Jade) | ❌ | ✅ Full | ✅ SE | Color LCD | ~$65 | USB/BT | ✅ Active | 🟢 |
| [**Foundation Passport**](https://foundationdevices.com/) | 81 | [passport2](https://github.com/Foundation-Devices/passport2) | ✅ Full | ✅ Full | ✅ ATECC | Color LCD | ~$259 | MicroSD/QR | ⚠️ Slow | 🟢 |
| [**OneKey Pro**](https://onekey.so/) | 77 | [firmware-pro](https://github.com/OneKeyHQ/firmware-pro) | ❌ | ✅ Full | ✅ SE | Touch Color | ~$199 | USB/BT | ✅ Active | 🟢 |
| [**NGRAVE ZERO**](https://www.ngrave.io/) | 72 | Private | ✅ Full | ⚠️ Partial | ✅ SE | Touch Color | ~$400 | QR | 🔒 Private | 🟡 |
| [**Specter DIY**](https://specter.solutions/hardware/) | 72 | [specter-diy](https://github.com/cryptoadvance/specter-diy) | ✅ Full | ✅ Full | ❌ None | LCD | ~$50-150* | QR | ✅ Active | 🟡 |
| [**Krux**](https://selfcustody.github.io/krux/) | 67 | [krux](https://github.com/selfcustody/krux) | ✅ Full | ✅ Full | ❌ None | LCD | ~$30-100* | QR | ✅ Active | 🟡 |
| [**SeedSigner**](https://seedsigner.com/) | 65 | [seedsigner](https://github.com/SeedSigner/seedsigner) | ✅ Full | ✅ Full | ❌ None | LCD | ~$50-100* | QR | ⚠️ Slow | 🟡 |
| [**SafePal S1**](https://www.safepal.com/) | 62 | Private | ✅ Full | ⚠️ Partial | ✅ SE | LCD | ~$50 | QR | 🔒 Private | 🟡 |
| [**GridPlus Lattice1**](https://gridplus.io/) | 59 | [SDK only](https://github.com/GridPlus/gridplus-sdk) | ❌ | ⚠️ SDK only | ✅ SE | 5" Touch | ~$400 | WiFi/USB | 🔒 Private | 🟡 |
| [**Ledger Stax**](https://www.ledger.com/) | 57 | [ledger-live](https://github.com/LedgerHQ/ledger-live) | ❌ | ⚠️ Partial | ✅ SE | E-Ink Touch | ~$280 | USB/BT | 🔒 Private | 🟡 |
| [**Ledger Nano X**](https://www.ledger.com/) | 56 | [ledger-live](https://github.com/LedgerHQ/ledger-live) | ❌ | ⚠️ Partial | ✅ SE | Mono OLED | ~$150 | USB/BT | 🔒 Private | 🟡 |
| [**Ledger Nano S+**](https://www.ledger.com/) | 55 | [ledger-live](https://github.com/LedgerHQ/ledger-live) | ❌ | ⚠️ Partial | ✅ SE | Mono OLED | ~$80 | USB | 🔒 Private | 🟡 |
| [**Tangem Wallet**](https://tangem.com/) | 53 | Private | ❌ | ⚠️ Partial | ✅ SE | None | ~$55 | NFC | 🔒 Private | 🟡 |
| [**Ellipal Titan 2.0**](https://www.ellipal.com/) | 48 | Private | ✅ Full | ❌ Closed | ❌ None | Touch Color | ~$170 | QR | 🔒 Private | 🔴 |
| [**SecuX V20**](https://secuxtech.com/) | 47 | Private | ❌ | ❌ Closed | ✅ SE | Touch Color | ~$140 | USB/BT | 🔒 Private | 🔴 |
| [**Arculus**](https://www.getarculus.com/) | 42 | Private | ❌ | ❌ Closed | ✅ SE | None | ~$100 | NFC | 🔒 Private | 🔴 |
| ~~[**KeepKey**](https://shapeshift.com/keepkey)~~ | 39 | [keepkey-firmware](https://github.com/keepkey/keepkey-firmware) | ❌ | ✅ Full | ❌ None | OLED | ~$50 | USB | ❌ Inactive | 🔴 |
| [**BC Vault**](https://bc-vault.com/) | 33 | Private | ❌ Closed | ❌ None | OLED | ~$140 | USB | 🔒 Private | 🔴 |

*\* DIY wallets — price varies based on components purchased; requires self-assembly*

**Quick Reference:**
- **Score:** 0-100 (see [Scoring Methodology](./HARDWARE_WALLET_COMPARISON_DETAILS.md#-scoring-methodology)) | **Air-Gap:** ✅ QR/MicroSD only | **Open Source:** ✅ Full / ⚠️ Partial / ❌ Closed
- **Secure Elem:** ✅ Has SE | ❌ MCU only | **Activity:** ✅ Active / ⚠️ Slow / ❌ Inactive / 🔒 Private
- **Rec:** 🟢 Recommended (75+) | 🟡 Situational (50-74) | 🔴 Avoid (<50)

**Detailed Legend:** See [Column Definitions](./HARDWARE_WALLET_COMPARISON_DETAILS.md#column-definitions) in the full documentation.

> ⚠️ **Data Accuracy Note:** Prices, supported networks, and features change. Always verify on official manufacturer websites before purchasing. This table provides general guidance, not exact specifications.

### GitHub Metrics (Firmware Repositories)

**Generated:** December 8, 2025 via `scripts/refresh-hardware-wallet-data.sh`

| Wallet | Repository | Last Commit | Stars | Issues | Ratio | Status |
|--------|------------|-------------|-------|--------|-------|--------|
| **Trezor** | [trezor/trezor-firmware](https://github.com/trezor/trezor-firmware) | Dec 5, 2025 | 1,626 | 545 | 33.5% | ✅ Active |
| **Blockstream Jade** | [Blockstream/Jade](https://github.com/Blockstream/Jade) | Dec 8, 2025 | 438 | 88 | 20.1% | ✅ Active |
| **SeedSigner** | [SeedSigner/seedsigner](https://github.com/SeedSigner/seedsigner) | Oct 23, 2025 | 965 | 217 | 22.5% | ⚠️ Slow |
| **Specter DIY** | [cryptoadvance/specter-diy](https://github.com/cryptoadvance/specter-diy) | Dec 4, 2025 | 531 | 79 | 14.9% | ✅ Active |
| **Krux** | [selfcustody/krux](https://github.com/selfcustody/krux) | Dec 4, 2025 | 291 | 48 | 16.5% | ✅ Active |
| **Keystone** | [KeystoneHQ/keystone3-firmware](https://github.com/KeystoneHQ/keystone3-firmware) | Dec 2, 2025 | 188 | 77 | 41.0% | ✅ Active |
| **BitBox02** | [BitBoxSwiss/bitbox02-firmware](https://github.com/BitBoxSwiss/bitbox02-firmware) | Dec 4, 2025 | 330 | 49 | 14.8% | ✅ Active |
| **ColdCard** | [Coldcard/firmware](https://github.com/Coldcard/firmware) | Nov 27, 2025 | 689 | 6 | 0.9% | ✅ Active |
| **Foundation Passport** | [Foundation-Devices/passport2](https://github.com/Foundation-Devices/passport2) | Oct 22, 2025 | 76 | 8 | 10.5% | ⚠️ Slow |
| **OneKey** | [OneKeyHQ/firmware-pro](https://github.com/OneKeyHQ/firmware-pro) | Dec 3, 2025 | 17 | 14 | 82.4% | ✅ Active |
| **KeepKey** | [keepkey/keepkey-firmware](https://github.com/keepkey/keepkey-firmware) | Feb 11, 2025 | 162 | 15 | 9.3% | ❌ Inactive |

**Code Quality Notes:**
- ✅ **ColdCard (0.9%):** Excellent code quality — minimal issues relative to community size
- ✅ **BitBox02 (14.8%):** Good code quality
- ✅ **Specter DIY (14.9%):** Good code quality for DIY project
- ✅ **Krux (16.5%):** Good code quality
- ✅ **Blockstream Jade (20.1%):** Good code quality, active development
- ⚠️ **SeedSigner (22.5%):** Moderate — large community, many feature requests
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

> 📖 **View full documentation:** [Recommendations, Methodology, Security Deep Dive, and more →](./HARDWARE_WALLET_COMPARISON_DETAILS.md)
