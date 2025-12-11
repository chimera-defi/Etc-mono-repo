# Changelog

Track significant changes to wallet statuses, recommendations, and documentation structure.

## How to Read This Changelog

- **Status changes:** When a wallet's activity status changes (Active → Slow → Inactive)
- **Recommendation changes:** When we change our recommendation (🟢 → 🟡 → 🔴)
- **Data updates:** When significant data corrections are made
- **Documentation changes:** Structure improvements, new sections, removed artifacts

---

## Software Wallets (EVM)

| Date | Wallet | Change | Details |
|------|--------|--------|---------|
| Dec 2025 | **Documentation** | Structure cleanup | Removed artifact files (walletconnect-wallet-research.md, HARDWARE_WALLET_RESEARCH_TASKS.md, PR_INFO.md); consolidated into unified docs |
| Dec 2025 | **Documentation** | Developer guidance added | Added EIP-7730 (Clear Signing) documentation, Integration Best Practices (12 practices), Stability Maintenance section |
| Dec 2025 | **Documentation** | Developer guidance added | Added Desktop-Mobile Sync note, Clear Signing & Safety Features section |
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
| Dec 2025 | **Trust** | EIP-7702 support added | Account: EOA → EOA+7702 ([source](https://beincrypto.com/trust-wallet-ethereum-eip7702-support/)) |
| Dec 2025 | **OKX** | EIP-7702 verified | Account: EOA → EOA+7702, added to EIP matrix ([source](https://web3.okx.com/help/okx-wallet-to-support-eip-7702)) |
| Dec 2025 | **All** | EIP-7702 section added | Dedicated section with Pectra upgrade info and dev resources |
| Nov 2025 | **Taho** | Status → ⚠️ Slow | No commits since Oct 2025 |
| Nov 2025 | **Block Wallet** | Status → ❌ Inactive | No commits since Nov 2024 (1 year) |
| Nov 2025 | **Frame** | Status → ❌ Inactive | No commits since Feb 2025 |
| Nov 2025 | **Argent-X** | Status → ❌ Inactive | No commits since Mar 2025 |
| Nov 2024 | **Initial** | Document created | Original 18-wallet comparison |

---

## Hardware Wallets (Cold Storage)

| Date | Wallet | Change | Details |
|------|--------|--------|---------|
| Dec 2025 | **Documentation** | Structure cleanup | Consolidated hardware wallet comparison into single unified document |
| Dec 2025 | **Blockstream Jade** | Added | Open source Bitcoin hardware wallet (score 81) |
| Dec 2025 | **SeedSigner** | Added | DIY Raspberry Pi-based signing device (score 65) |
| Dec 2025 | **Specter DIY** | Added | DIY ESP32-based air-gapped signing device (score 72) |
| Dec 2025 | **Krux** | Added | DIY M5StickV-based signing device (score 67) |
| Dec 2025 | **Foundation Passport** | Status → ⚠️ Slow | Reduced activity (last commit Oct 2025) |
| Dec 2025 | **KeepKey** | Status → ❌ Inactive | No commits for 10 months (effectively abandoned) |
| Dec 2025 | **All** | Added Activity column | GitHub development status tracking |
| Dec 2025 | **All** | Added DIY wallet category | Self-build signing devices (SeedSigner, Specter DIY, Krux) |
| Dec 2025 | **All** | Scoring methodology | Security (25), Transparency (20), Privacy (15), Activity (15), Company (15), UX (10) |
| Dec 2025 | **Ledger** | Penalized | Ledger Recover capability violates cold storage principles (scores 55-57) |
| Dec 2025 | **Trezor Safe 5** | Added | New flagship model with touch color screen (score 94) |
| Dec 2025 | **Trezor Safe 3** | Added | Budget-friendly model with Secure Element (score 91) |
| Dec 2025 | **Keystone 3 Pro** | Added | Air-gapped wallet with triple Secure Element (score 91) |
| Dec 2025 | **Initial** | Document created | Hardware wallet comparison for Ledger alternatives |

---

## Documentation Structure

| Date | Change | Details |
|------|--------|---------|
| Dec 2025 | **Centralized changelog** | Moved changelog from individual files to central CHANGELOG.md |
| Dec 2025 | **Structure cleanup** | Removed artifact files, consolidated into two main pages + ancillaries |
| Dec 2025 | **Developer guidance** | Added comprehensive Integration Best Practices and Stability Maintenance sections |

---

*For the latest wallet status updates, see [WALLET_COMPARISON_UNIFIED.md](./WALLET_COMPARISON_UNIFIED.md) (Software) and [HARDWARE_WALLET_COMPARISON.md](./HARDWARE_WALLET_COMPARISON.md) (Hardware).*
