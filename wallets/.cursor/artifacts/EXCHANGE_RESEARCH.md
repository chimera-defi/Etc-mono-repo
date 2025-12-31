# Crypto Exchange Research

**Category:** Crypto Exchanges (Centralized & Decentralized)  
**Research Date:** December 16, 2025  
**Status:** Initial Research

---

## Executive Summary

Crypto exchanges represent a natural extension to the wallet radar project. They serve as critical infrastructure for users to acquire, trade, and manage cryptocurrencies. This research identifies 35+ exchanges (mix of CEX and DEX) and proposes a comparison framework.

**Key Findings:**
- **35+ exchanges identified** (20 CEX, 15+ DEX)
- **Data availability:** Good for CEX (public APIs, websites), variable for DEX (some open source, some proprietary)
- **Scoring focus:** Developer APIs, security, fees, regulatory compliance
- **Integration complexity:** Medium (different data sources than wallets)

**Recommendation:** ✅ **High Priority** - Exchanges are core infrastructure and complement wallets well.

---

## Entity List (35+ Exchanges)

### Centralized Exchanges (CEX) - 20 entities

1. **Coinbase** - US-based, publicly traded, strong regulatory compliance
2. **Binance** - Largest by volume, global reach, regulatory challenges
3. **Kraken** - US-based, strong security focus, good for institutions
4. **Gemini** - US-based, regulatory compliance, institutional focus
5. **Crypto.com** - Global, strong marketing, Visa card integration
6. **OKX** - Formerly OKEx, global, strong derivatives
7. **Bybit** - Derivatives-focused, strong API, global
8. **KuCoin** - Global, wide asset selection, lower fees
9. **Gate.io** - Global, wide asset selection, altcoin focus
10. **Bitfinex** - Advanced trading, margin/leverage, global
11. **Bitstamp** - European, long-established, regulatory compliance
12. **BitMEX** - Derivatives-focused, institutional, regulatory issues
13. **Deribit** - Options/futures, institutional, Netherlands-based
14. **MEXC** - Global, wide asset selection, competitive fees
15. **HTX (Huobi)** - Global, wide asset selection, regulatory challenges
16. **Coinbase Advanced Trade** - Coinbase's pro platform
17. **eToro** - Social trading, copy trading, global
18. **Bitget** - Derivatives-focused, copy trading, global
19. **Upbit** - South Korea, largest Korean exchange
20. **Bithumb** - South Korea, regulatory compliance

### Decentralized Exchanges (DEX) - 15+ entities

1. **Uniswap** - Largest DEX, Ethereum, open source, V2/V3/V4
2. **Curve** - Stablecoin-focused, low slippage, open source
3. **Balancer** - AMM with customizable pools, open source
4. **PancakeSwap** - BNB Chain, largest non-Ethereum DEX, open source
5. **SushiSwap** - Multi-chain, open source, community-driven
6. **dYdX** - Perpetuals DEX, orderbook model, open source
7. **GMX** - Perpetuals DEX, GLP model, open source
8. **Jupiter** - Solana DEX aggregator, open source
9. **Raydium** - Solana AMM, open source
10. **Orca** - Solana DEX, user-friendly, open source
11. **1inch** - DEX aggregator, multi-chain, open source
12. **Matcha** - DEX aggregator, 0x protocol, open source
13. **CowSwap** - MEV protection, batch auctions, open source
14. **Velodrome** - Optimism DEX, ve(3,3) model, open source
15. **Trader Joe** - Avalanche DEX, multi-chain expansion, open source

---

## Key Metrics for Comparison

### Trading & Fees
- **Spot trading fees:** Maker/taker percentages
- **Futures/derivatives fees:** Maker/taker percentages
- **Withdrawal fees:** Fixed fees per asset
- **Deposit fees:** Usually free, but note exceptions
- **Trading volume (24h):** USD volume
- **Trading volume (30d):** USD volume
- **Number of trading pairs:** Total pairs available

### Supported Assets
- **Supported cryptocurrencies:** Count and major assets
- **Supported chains:** EVM, Bitcoin, Solana, Cosmos, etc.
- **Fiat currencies supported:** Count and major currencies
- **Staking support:** Which assets can be staked
- **Lending/borrowing:** Available products

### Security & Compliance
- **2FA support:** Required/optional/none
- **Cold storage %:** Percentage of assets in cold storage
- **Insurance coverage:** Amount and coverage type
- **Regulatory licenses:** List of jurisdictions/licenses
- **KYC requirements:** None/optional/required
- **Security audits:** Recent audit reports
- **Hack history:** Past security incidents

### Developer Experience
- **REST API:** Available/not available
- **WebSocket API:** Available/not available
- **SDKs:** Languages supported (Python, JavaScript, etc.)
- **API rate limits:** Requests per second/minute
- **API documentation quality:** Good/fair/poor
- **Sandbox/testnet:** Available for testing
- **Webhook support:** Available/not available

### Platform Features
- **Mobile apps:** iOS/Android availability
- **Desktop apps:** Windows/Mac/Linux availability
- **Trading interfaces:** Web/mobile/desktop
- **Advanced order types:** Limit, stop-loss, OCO, etc.
- **Margin trading:** Available/not available
- **Futures trading:** Available/not available
- **Options trading:** Available/not available
- **Copy trading:** Available/not available

### Open Source & Transparency
- **Open source status:** Full/partial/closed
- **GitHub repository:** Link if available
- **Code quality:** Stars, issues, activity
- **Transparency reports:** Published/not published

### Business Model
- **Funding:** VC-backed, exchange token, public company, etc.
- **Exchange token:** Native token (BNB, CRO, etc.)
- **Token utility:** Trading fee discounts, staking rewards, etc.

---

## Sample Comparison Table (10 Exchanges)

| Exchange | Type | Score | Trading Fees | Volume 24h | Chains | Fiat | KYC | API | Open Source | Mobile | Best For |
|----------|------|-------|--------------|------------|--------|------|-----|-----|-------------|--------|----------|
| **Coinbase** | CEX | 88 | 0.4-0.6% | $2.5B | ⟠₿◎ | ✅ 50+ | Required | ✅ REST+WS | ❌ Closed | ✅ iOS+Android | US users, compliance |
| **Binance** | CEX | 85 | 0.1% | $15B | ⟠₿◎△⚛●+ | ✅ 50+ | Required | ✅ REST+WS | ❌ Closed | ✅ iOS+Android | Global, volume |
| **Kraken** | CEX | 87 | 0.16-0.26% | $800M | ⟠₿◎ | ✅ 10+ | Required | ✅ REST+WS | ❌ Closed | ✅ iOS+Android | Security, institutions |
| **Uniswap** | DEX | 82 | 0.05-1% | $1.2B | ⟠ | ❌ None | ❌ None | ✅ GraphQL | ✅ Full (MIT) | ❌ Web only | DeFi, Ethereum |
| **Curve** | DEX | 80 | 0.04% | $200M | ⟠ | ❌ None | ❌ None | ✅ Subgraph | ✅ Full (MIT) | ❌ Web only | Stablecoins, low slippage |
| **dYdX** | DEX | 78 | 0.02-0.5% | $500M | ⟠ | ❌ None | ❌ None | ✅ REST+WS | ✅ Full (Apache) | ❌ Web only | Perpetuals, derivatives |
| **OKX** | CEX | 83 | 0.08% | $1.5B | ⟠₿◎△⚛●+ | ✅ 20+ | Required | ✅ REST+WS | ❌ Closed | ✅ iOS+Android | Derivatives, global |
| **Bybit** | CEX | 81 | 0.1% | $2B | ⟠₿◎ | ✅ 10+ | Required | ✅ REST+WS | ❌ Closed | ✅ iOS+Android | Derivatives, API |
| **Kraken** | CEX | 87 | 0.16-0.26% | $800M | ⟠₿◎ | ✅ 10+ | Required | ✅ REST+WS | ❌ Closed | ✅ iOS+Android | Security, institutions |
| **Jupiter** | DEX | 75 | 0.3% | $150M | ◎ | ❌ None | ❌ None | ✅ REST | ✅ Full (MIT) | ❌ Web only | Solana, aggregation |

**Legend:**
- **Chains:** ⟠ EVM | ₿ Bitcoin | ◎ Solana | △ Move (Sui/Aptos) | ⚛ Cosmos | ● Polkadot
- **Fiat:** ✅ Supported | ❌ Not supported
- **KYC:** Required/Optional/None
- **API:** ✅ Available | ❌ Not available
- **Open Source:** ✅ Full | ⚠️ Partial | ❌ Closed

---

## Proposed Scoring Methodology (0-100)

### Developer Experience (25 points)
- **API availability:** REST API (5), WebSocket (5), SDKs (5)
- **API quality:** Documentation (5), Rate limits (3), Sandbox (2)

### Security & Compliance (20 points)
- **Security:** Cold storage % (5), Insurance (5), Audits (5)
- **Compliance:** Regulatory licenses (5)

### Trading Features (15 points)
- **Fees:** Spot trading fees (5), Withdrawal fees (3)
- **Volume:** 24h trading volume (4), Number of pairs (3)

### Asset Support (15 points)
- **Cryptocurrencies:** Number of supported assets (8)
- **Chains:** Multi-chain support (4)
- **Fiat:** Fiat support (3)

### Platform Quality (10 points)
- **Mobile apps:** iOS/Android (5)
- **Trading features:** Advanced orders, margin, futures (5)

### Open Source & Transparency (10 points)
- **Open source:** Full/partial/closed (7)
- **Transparency:** Public reports, GitHub activity (3)

### Business Model (5 points)
- **Sustainability:** Funding, exchange token, public company (5)

**Score Thresholds:**
- 🟢 **80+:** Highly Recommended
- 🟡 **60-79:** Good Option
- 🔴 **<60:** Consider Alternatives

---

## Data Availability Assessment

### High Availability ✅
- Trading fees (public websites)
- Trading volume (CoinGecko API, exchange APIs)
- Supported assets (exchange APIs, websites)
- Mobile apps (app stores)
- API documentation (official docs)

### Medium Availability ⚠️
- Security details (some exchanges publish, some don't)
- Regulatory licenses (need to research per jurisdiction)
- Cold storage % (some publish, some don't)
- Insurance coverage (some publish, some don't)

### Low Availability ❌
- Internal security practices
- Exact API rate limits (often in docs but not standardized)
- Customer support quality (subjective, need reviews)

---

## Integration Recommendations

### Data Collection
1. **CoinGecko API** - Trading volume, fees, market data
2. **Exchange APIs** - Real-time data, supported assets
3. **Official websites** - Fees, features, regulatory info
4. **GitHub** - Open source status, code quality
5. **App stores** - Mobile app availability

### Frontend Integration
- Add new tab: "Exchanges" alongside Software/Hardware/Cards
- Use similar filtering/sorting as existing categories
- Comparison tool should work with exchange data
- Add exchange-specific filters (CEX vs DEX, derivatives, etc.)

### Data Structure
- Create `Exchange` type similar to `SoftwareWallet`, `HardwareWallet`, `CryptoCard`
- Add exchange-specific fields (trading fees, volume, API endpoints)
- Extend `WalletData` union type to include `Exchange`

---

## Next Steps

1. ✅ Complete initial research (this document)
2. ⏳ Collect detailed data for top 20 exchanges
3. ⏳ Verify data from official sources
4. ⏳ Create full comparison table
5. ⏳ Implement scoring for all exchanges
6. ⏳ Integrate into frontend

---

## Data Sources

- CoinGecko API: https://www.coingecko.com/en/api
- Exchange official websites
- Exchange API documentation
- GitHub repositories
- App stores (iOS App Store, Google Play)
- Regulatory databases (per jurisdiction)

---

*Last updated: December 16, 2025*
