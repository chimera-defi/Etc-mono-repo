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
| Dec 2025 | **Ambire** | Status ⚠️→✅, Score 55→62 | Activity verified Dec 10, 2025 (v5.32.2 release); GitHub metrics: 60 stars, 1 issue, 1.7% ratio. Still browser-only (Core: ❌) - mobile apps planned but not released |
| Dec 2025 | **Kohaku** | NOT A WALLET | ethereum/kohaku is Ethereum Foundation's privacy tooling (privacy-pools, railgun); ethereum/kohaku-extension is a fork of Ambire, not a separate wallet |
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

## Crypto Credit Cards

| Date | Wallet/Card | Change | Details |
|------|-------------|--------|---------|
| Dec 2025 | **Major Expansion** | 17 → 27 cards | Added 10 new cards: Ready (Argent), Bybit, OKX, KuCard, Kraken, Gnosis Pay, Redotpay, Hi Card, 1inch Card, Revolut |
| Dec 2025 | **Ready Card** | Added (90 🟢) | Formerly Argent Card - onchain bank with zero-fee debit card (EU/UK) |
| Dec 2025 | **Provider Groupings** | New categorization | Cards grouped by exchange/provider with consistent scoring handicaps |
| Dec 2025 | **Exchange Cards** | -3 pts handicap | Coinbase, Binance, Gemini, KuCoin, OKX, CoinJar, Kraken, Crypto.com, Bybit (custody risk) |
| Dec 2025 | **Baanx Infrastructure** | Added section | Documented Baanx as white-label provider powering 1inch Card and others |
| Dec 2025 | **Bybit Card** | Added (88 🟢) | Up to 10% cashback, EEA/Switzerland, business support |
| Dec 2025 | **Hi Card** | Added (86 🟢) | hi.com Web3 neobank, up to 10% cashback |
| Dec 2025 | **Gnosis Pay** | Added (78 🟢) | DeFi-native non-custodial card, EU/UK |
| Dec 2025 | **1inch Card** | Added (75 🟢) | Baanx + Mastercard partnership, DeFi users |
| Dec 2025 | **KuCard** | Added (72 🟡) | KuCoin exchange card, up to 4% cashback |
| Dec 2025 | **Revolut Crypto** | Added (72 🟡) | Established fintech with crypto card |
| Dec 2025 | **Redotpay** | Added (70 🟡) | Hong Kong-based, global multi-region card |
| Dec 2025 | **OKX Card** | Added (68 🟡) | New Mastercard stablecoin partnership, launching |
| Dec 2025 | **Kraken Card** | Added (60 🟡) | Limited availability, expanding |
| Dec 2025 | **Monolith Card** | Marked discontinued | Ethereum card, no longer active |
| Dec 2025 | **Argent Card** | User query resolved | Argent is wallet-only, no dedicated card product |
| Dec 2025 | **Documentation** | Structure consolidation | Deleted SCORING.md, RESEARCH_NOTES.md, BUSINESS_CARDS_SUMMARY.md; merged content into main files to match software/hardware wallet structure (3 files each) |
| Dec 2025 | **Documentation** | Score verification complete | Verified all 17 card score calculations match methodology |
| Dec 2025 | **Mode Card** | Status → ⚠️ Verify | UK-based company, "up to 10%" rate needs verification; changed from "US only" |
| Dec 2025 | **Shakepay Card** | Data fix | Fixed cashback rate from "1-2%" to verified "Up to 1.5%" |
| Dec 2025 | **BitPay Card** | Scoring fix | Fixed Human Suggestions reasoning (removed invalid "unverified business support" bonus) |
| Dec 2025 | **Table ordering** | Fix | Reordered cards by score descending (CryptoSpend 62 > CoinJar 60 > Crypto.com 59) |
| Dec 2025 | **Business column** | Consistency fix | Standardized ⚠️ Verify markers for Binance, Wirex, BitPay, Uphold |
| Dec 2025 | **Reap** | ✅ Verified | Corporate Visa card, stablecoin repayment, 2% FX/ATM fees via browser automation |
| Dec 2025 | **EtherFi Cash** | ✅ Verified | DeFi-native credit card, corporate cards available; rates TBD |
| Dec 2025 | **Nexo Card** | ✅ Verified | Up to 2% cashback, no fees, dual-mode (Debit + Credit) |
| Dec 2025 | **Plutus Card** | ✅ Verified | 3% base, up to 9% via tiers, no fees |
| Dec 2025 | **Shakepay Card** | ✅ Verified | Up to 1.5% cashback, Canada only |
| Dec 2025 | **404 Errors** | ⚠️ Need verification | Swissborg, Uphold, CoinJar cards - website URLs return 404 |
| Dec 2025 | **Scoring** | Added Human Suggestions | -20 to +5 adjustments for UX, verification status, business support |
| Dec 2025 | **Crypto.com Visa** | -20 pts penalty | Poor UX, customer service issues, staking lock-ups |
| Dec 2025 | **Initial** | Document created | 17-card comparison with scoring methodology |

---

## Documentation Structure

| Date | Change | Details |
|------|--------|---------|
| Dec 2025 | **Centralized changelog** | Moved changelog from individual files to central CHANGELOG.md |
| Dec 2025 | **Structure cleanup** | Removed artifact files, consolidated into two main pages + ancillaries |
| Dec 2025 | **Developer guidance** | Added comprehensive Integration Best Practices and Stability Maintenance sections |

---

*For the latest wallet status updates, see [WALLET_COMPARISON_UNIFIED.md](./WALLET_COMPARISON_UNIFIED.md) (Software), [HARDWARE_WALLET_COMPARISON.md](./HARDWARE_WALLET_COMPARISON.md) (Hardware), and [CRYPTO_CREDIT_CARD_COMPARISON.md](./CRYPTO_CREDIT_CARD_COMPARISON.md) (Credit Cards).*
