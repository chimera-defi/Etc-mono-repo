# Wallet Research

Developer-focused comparison of crypto wallets to find stable MetaMask alternatives.

## 📊 Main Comparison Tables

**→ [WALLET_COMPARISON_UNIFIED.md](./WALLET_COMPARISON_UNIFIED.md)** — Software wallets (24 EVM wallets)

**→ [HARDWARE_WALLET_COMPARISON.md](./HARDWARE_WALLET_COMPARISON.md)** — Hardware cold storage wallets (23 devices)

| Column | Description | Source |
|--------|-------------|--------|
| **Score** | 0-100 weighted score | Calculated |
| GitHub | Repository link | GitHub |
| Active | ✅/⚠️/❌ activity status | GitHub |
| Chains | Built-in chain count | WalletBeat |
| **Devices** | 📱 Mobile / 🌐 Browser / 💻 Desktop | WalletBeat |
| **Testnets** | Custom chain / testnet support | WalletBeat |
| **License** | ✅ FOSS / ⚠️ Source-Avail / ❌ Proprietary | GitHub + WalletBeat |
| **Audits** | ✅ Recent (2023+) / ⚠️ Old/Issues / ❓ Unknown | WalletBeat + GitHub |
| **Funding** | 🟢 Sustainable / 🟡 VC / 🔴 Donations | Research |
| **Tx Sim** | ✅ Built-in / ⚠️ Plugin / ❌ None | WalletBeat |
| **Scam** | ✅ Alerts / ⚠️ Basic / ❌ None | WalletBeat |
| **Account Type** | EOA / Safe / 4337 / 7702 | WalletBeat |
| **HW Wallets** | Hardware wallet support | WalletBeat |
| EIP-4337 | Account abstraction support | WalletBeat |
| Best For | Use case | Analysis |
| Rec | 🟢/🟡/🔴 recommendation | Analysis |

### Sections in Document (Dec 2025)
- 📊 **Wallet Scores** — Weighted 0-100 scoring with methodology
- 🧭 **Decision Flowchart** — Visual guide to choose the right wallet
- 🔒 **Security Audits** — Audit history with links to reports
- ⚡ **Known Quirks & Gotchas** — Developer pain points per wallet
- 📋 **EIP Support Matrix** — EIP-712, EIP-2612, EIP-4337, EIP-5792, EIP-7702
- ⛽ **Gas Estimation** — Transaction preview quality by wallet
- 📱 **Mobile Deep-linking** — Universal links, custom schemes
- 🚀 **Developer Experience** — Docs, SDKs, error messages
- 🛡️ **Security Features** — Transaction simulation & scam protection
- 💰 **Monetization** — Business models & funding sources
- 🔐 **Privacy** — Data collection & RPC defaults
- 📝 **Changelog** — [CHANGELOG.md](./CHANGELOG.md) — Track changes to wallet statuses
- 🆕 **Contributing** — How to add new wallets

### Hardware Wallet Quick Picks (Cold Storage)

| Use Case | Wallet | Score | Why |
|----------|--------|-------|-----|
| Best Overall | **Trezor Safe 5** | 94 | Fully open source, Secure Element, active development |
| Air-Gapped | **Keystone 3 Pro** | 91 | QR-only, never connects to computer, triple SE |
| Bitcoin Only | **ColdCard Mk4** | 91 | Dual SE, duress PIN, 0.9% issue ratio |
| Best Value | **Trezor Safe 3** | 91 | $79, Secure Element, fully open source |
| Swiss Quality | **BitBox02** | 88 | Open source, reproducible builds, active dev |
| ⚠️ Caution | **Ledger** | 55-57 | Ledger Recover, closed firmware (use passphrase) |
| 🔴 Avoid | **KeepKey** | 39 | Abandoned (no commits 10 months) |

**Legend:** 🟢 Active development + open source | 🟡 Closed/private repo | 🔴 Inactive/abandoned

---

## ⚠️ Activity Status Alert (Nov 2025)

Several previously recommended wallets have **stopped active development**:
- ❌ **Block Wallet** — No commits since Nov 2024 (1 year!)
- ❌ **Frame** — No commits since Feb 2025
- ❌ **Argent-X** — No commits since Mar 2025
- ⚠️ **Coinbase SDK** — Slow (last commit Jul 2025)

---

## Quick Recommendations

| Use Case | Wallet | Devices | Tx Sim | Scam | Funding | License | Status |
|----------|--------|---------|--------|------|---------|---------|--------|
| Development | **Rabby** | 📱🌐💻 | ✅ | ✅ | 🟢 DeBank | ✅ MIT | ✅ Active |
| Production | **Trust Wallet** | 📱🌐 | ❌ | ⚠️ | 🟢 Binance | ⚠️ Apache-2 | ✅ Active |
| Production | **Rainbow** | 📱🌐 | ❌ | ⚠️ | 🟡 VC | ✅ GPL-3 | ✅ Active |
| Enterprise | **Safe** | 📱🌐 | ✅ | ✅ | 🟢 Grants | ✅ GPL-3 | ✅ Active |
| Multi-chain | **Enkrypt** | 🌐 | ❌ | ⚠️ | 🟢 MEW | ✅ MIT | ✅ Active |
| Ethereum | **MEW** | 📱🔗 | ❌ | ⚠️ | 🟢 Self | ✅ MIT | ✅ Active |
| Smart Wallet | **Ambire** | 🌐 | ✅ | ✅ | 🟡 VC | ✅ GPL-3 | ⚠️ Slow |
| Payments | **Daimo** | 📱 | ❌ | ⚠️ | 🟡 VC | ✅ GPL-3 | ✅ Active |
| Community | **Taho** | 🌐 | ❌ | ⚠️ | 🔴 Grants | ✅ GPL-3 | ⚠️ Slow |
| Avoid | ~~Block Wallet~~ | - | - | - | 🔴 Unknown | - | ❌ Inactive |
| Avoid | ~~Frame~~ | - | - | - | 🔴 Donate | - | ❌ Inactive |

**Devices:** 📱 Mobile | 🌐 Browser Extension | 💻 Desktop | 🔗 Web App
**Funding:** 🟢 Sustainable | 🟡 VC-dependent | 🔴 Donation-based
**Security:** Tx Sim = Transaction simulation | Scam = Scam/phishing alerts

---

## Documents

- **[WALLET_COMPARISON_UNIFIED.md](./WALLET_COMPARISON_UNIFIED.md)** — Software wallet comparison (24 EVM wallets)
- **[HARDWARE_WALLET_COMPARISON.md](./HARDWARE_WALLET_COMPARISON.md)** — Hardware wallet comparison (23 cold storage devices)
- **[CHANGELOG.md](./CHANGELOG.md)** — Complete history of changes to wallet statuses and documentation
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** — How to add new wallets to the comparison
- **[tests/](./tests/)** — Integration testing suite for wallet compatibility

## External Resources

| Resource | URL | Focus |
|----------|-----|-------|
| **WalletBeat** | [walletbeat.fyi](https://walletbeat.fyi) | Technical features, RPC config, ENS, security |
| Ethereum.org | [ethereum.org/wallets](https://ethereum.org/en/wallets/find-wallet/) | Consumer features |
| WalletConnect | [explorer.walletconnect.com](https://explorer.walletconnect.com/) | Wallet registry |
| ChainList | [chainlist.org](https://chainlist.org) | RPC endpoints |

## Data Sources

- Original data: GitHub REST API (November 2024)
- Activity status: GitHub REST API (November 29, 2025)
- Chain counts: [Rabby API](https://api.rabby.io/v1/chain/list), [Trust registry](https://github.com/trustwallet/wallet-core/blob/master/registry.json)
- **License, devices, testnets:** [WalletBeat](https://walletbeat.fyi) (December 2025)
- **Security audits:** WalletBeat + wallet GitHub repos (December 2025)
- Additional wallets discovered: WalletBeat registry, GitHub search

See [PR #62](https://github.com/chimera-defi/ethglobal-argentina-25/pull/62) for original methodology.

## Automation

### Refresh Script

```bash
cd wallets/scripts
./refresh-github-data.sh          # Text output
./refresh-github-data.sh --json   # JSON output  
./refresh-github-data.sh --markdown  # Markdown table
```

See [scripts/README.md](./scripts/README.md) for full documentation.

### GitHub Actions

A workflow runs every Monday to refresh activity data:
- `.github/workflows/refresh-wallet-data.yml`
- Creates a PR with updated status
- Can be triggered manually

---
*Last updated: December 3, 2025*
