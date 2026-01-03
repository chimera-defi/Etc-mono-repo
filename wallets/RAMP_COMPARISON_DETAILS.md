# Crypto On/Off-Ramp Comparison - Full Documentation

> **TL;DR:** **MoonPay** and **Transak** are the market leaders for general coverage. **Sardine** is the best choice for high-value transactions (Instant ACH). **Ramp Network** offers excellent performance for European/L2 users. **Stripe** is the safest bet for mainstream brand trust.

**Data Sources:** Developer Documentation, Fee Schedules, Integration Guides (as of Dec 2025).

**Verification Status:** Original 7 providers (Transak, MoonPay, Ramp, Sardine, Stripe, Banxa, Mercuryo) verified from PR 128 research. Additional 13 providers added based on industry knowledge and user request (Modern Treasury, onesafe, Reap specifically requested). All values marked with "~" are approximate and should be verified on official provider websites before integration.

---

## 🌉 Top Providers Comparison

| Provider | Score | Best For | Global Coverage | Fee Model | Dev UX |
|----------|-------|----------|-----------------|-----------|--------|
| **Transak** | 92 | 🛠️ Developers | ~160+ Countries | Medium (Spread + Fee) | Excellent (React SDK) |
| **MoonPay** | 90 | 🌍 Coverage | ~160+ Countries | High (Spread + Fee) | Great (Widget) |
| **Coinbase Pay** | 89 | 🪙 Coinbase | ~100+ Countries | Medium | Excellent (SDK) |
| **Ramp** | 88 | 🇪🇺 EU / Speed | ~150+ Countries | Low/Medium | Good (SDK) |
| **Sardine** | 86 | 🇺🇸 US / Fraud | US + Select Global | Variable (Risk based) | Advanced (API/SDK) |
| **Stripe** | 85 | 🤝 Trust | Global | Usage Based | Excellent (Stripe style) |
| **Simplex** | 84 | 💳 High Limits | ~150+ Countries | Medium/High | Good (Widget) |
| **Modern Treasury** | 83 | 🏢 Enterprise | US + Select | Usage Based | Excellent (API) |
| **Banxa** | 80 | 🏦 Local Pay | Global | Variable | Good |
| **Mercuryo** | 78 | 💼 B2B | Global | Medium | Good |
| **Guardarian** | 77 | 🇪🇺 EU Focus | ~100+ Countries | Low/Medium | Good (Widget) |
| **CoinSwitch** | 76 | 🇮🇳 India/APAC | ~100+ Countries | Medium | Good (API) |
| **Utorg** | 75 | 🔗 Multi-chain | ~100+ Countries | Medium | Good (Widget) |
| **CoinGate** | 74 | 💰 Low Fees | Global | Low | Good (API) |
| **BitPay** | 73 | ₿ Bitcoin | Global | Medium | Good (API) |
| **Changelly** | 72 | 🔄 Exchange | Global | Medium | Good (API) |
| **Coinify** | 71 | 🇪🇺 EU | ~50+ Countries | Medium | Good (API) |
| **onesafe** | 70 | 🏢 Enterprise | Select Global | Variable | Good (API) |
| **Reap** | 68 | 💼 Business Off-Ramp | Global | Variable | Good (API) |
| **Coinmama** | 65 | 🚀 Simple On-Ramp | ~100+ Countries | High | Basic (Widget) |

---

## 💰 Fee Structure Analysis

Fees are the biggest friction point for users. They typically consist of three parts:
1.  **Processing Fee:** charged by the ramp (e.g., 1% - 3.5%).
2.  **Network Fee:** Gas costs (user pays).
3.  **Spread:** The difference between the quoted price and market spot price (often hidden, 1% - 3%).

| Provider | Est. Processing Fee | Est. Spread | Min. Fee | Notes |
|----------|---------------------|-------------|----------|-------|
| **Ramp** | ~0.99% - 2.9% | Low (~1%) | ~€2.49 | Competitive for bank transfers. Verify on ramp.network |
| **Transak** | ~3.5% (Cards) | Medium (~2%) | ~$5.00 | Fee varies heavily by payment method. Verify on transak.com |
| **MoonPay** | ~4.5% (Cards) | High (~2-3%) | ~$3.99 | Often the most expensive, but highest conversion. Verify on moonpay.com |
| **Stripe** | Custom | Custom | Custom | Usage-based pricing for businesses. Verify on stripe.com |

> **Agent Insight:** "Zero Fee" promotions often hide costs in the **Spread**. Always check the final "Amount Received" vs. Spot Price.

---

## 🛠️ Developer Experience (DX)

### 1. Integration Methods
*   **Widget (No-Code/Low-Code):** The easiest way. You embed an iframe or use a React component.
    *   *Supported by:* Transak, MoonPay, Ramp, Banxa.
*   **API (Custom UI):** You build the UI, they handle the logic. Requires more compliance work (PCI-DSS often handled by them, but UI is on you).
    *   *Supported by:* Sardine, Stripe, MoonPay (Enterprise), Transak (Enterprise).

### 2. KYC & Compliance
*   **Merchant of Record (MoR):** All listed providers act as the MoR. They handle chargebacks, fraud, and KYC.
*   **Tiered KYC:**
    *   **Low Tier (<$150):** Often just Name + Address + DOB (Simplified).
    *   **High Tier (>$150):** ID Scan + Selfie required.
*   **Friction:** **Sardine** and **Stripe** are noted for better fraud detection that reduces false declines, a major issue with crypto purchases.

### 3. Supported Chains
*   **Transak & MoonPay:** Support the widest range of long-tail assets and chains (L1s, L2s, some L3s).
*   **Coinbase Pay:** Strong Coinbase ecosystem integration (Base, Ethereum, Solana, Bitcoin, and Coinbase-supported chains).
*   **Ramp:** Strong focus on Ethereum L2s (Arbitrum, Optimism, zkSync, Base).
*   **Stripe:** More conservative asset list (mostly majors: BTC, ETH, SOL, USDC).
*   **Modern Treasury:** Enterprise payment infrastructure with crypto capabilities, primarily US-focused.
*   **BitPay:** Bitcoin-focused with some altcoin support (BCH, ETH, LTC, XRP, DOGE).
*   **Guardarian, Utorg, CoinGate:** Multi-chain support with varying coverage of major chains.

---

## 🟢 Recommendation Guide

### "I need..."

*   **...to support the most countries & tokens:**
    *   👉 **Transak** or **MoonPay**. They cover 160+ countries and thousands of tokens.

*   **...the lowest fees for my users:**
    *   👉 **Ramp Network** (especially for bank transfers/SEPA).

*   **...higher limits & instant settlement in the US:**
    *   👉 **Sardine**. Their "Instant ACH" is a game changer for high-value NFT mints or DeFi deposits.

*   **...my users to feel safe:**
    *   👉 **Stripe**. Users recognize the brand and UI.

*   **...to support local payment methods (e.g., POLi in Australia, iDEAL in Netherlands):**
    *   👉 **Banxa**. They specialize in local payment rails.

---

## ⚠️ Implementation Checklist
1.  **Webhooks:** Set up webhooks to listen for `ORDER_COMPLETED` or `ORDER_FAILED` events to update your UI.
2.  **Environment:** Always test in `STAGING` / `SANDBOX` mode first. Real money testing is painful.
3.  **Geo-Blocking:** Ensure your UI handles unsupported regions (e.g., New York, Texas, Crimea, etc.) gracefully if the widget doesn't auto-detect.

---

## Scoring Methodology

The scoring system evaluates ramps across multiple dimensions:

1. **Coverage (25 points):** Number of countries and payment methods supported
2. **Fee Structure (20 points):** Processing fees, spreads, and minimum fees
3. **Developer Experience (20 points):** SDK quality, documentation, integration ease
4. **Supported Chains/Assets (15 points):** Number of chains and tokens supported
5. **KYC/Compliance (10 points):** Fraud detection, false decline rates, KYC friction
6. **Reliability (10 points):** Uptime, transaction success rates, settlement speed

**Scoring Adjustments:**
- **+5 pts** Excellent developer documentation and SDKs
- **+3 pts** Instant settlement options (e.g., Sardine Instant ACH)
- **-5 pts** High fees relative to competitors
- **-3 pts** Limited geographic coverage

**Scoring Notes:**
- Scores are estimates based on available documentation and industry knowledge
- Original 7 providers (Transak, MoonPay, Ramp, Sardine, Stripe, Banxa, Mercuryo) scored based on verified PR 128 research
- Additional providers scored using same methodology but may need verification
- Scores should be considered approximate until verified with official provider documentation

---

## Integration Guides

### Transak Integration
- **Widget:** React SDK available, easy integration
- **API:** Enterprise API for custom UI
- **Documentation:** Comprehensive docs with examples
- **Support:** Active developer community

### MoonPay Integration
- **Widget:** Simple iframe or React component
- **API:** Enterprise tier available
- **Documentation:** Good documentation
- **Support:** Email support, developer resources

### Ramp Integration
- **Widget:** SDK available
- **API:** Custom integration possible
- **Documentation:** Good documentation
- **Support:** Developer support available

### Sardine Integration
- **Widget:** Limited widget support
- **API:** Primary integration method (API/SDK)
- **Documentation:** Advanced documentation
- **Support:** Enterprise support available

### Stripe Integration
- **Widget:** Stripe-style integration
- **API:** Full API access
- **Documentation:** Excellent documentation (Stripe standard)
- **Support:** Premium support available

### Coinbase Pay Integration
- **Widget:** React SDK available
- **API:** Full API access
- **Documentation:** Excellent Coinbase documentation
- **Support:** Coinbase developer support

### Simplex Integration
- **Widget:** Simple widget integration
- **API:** API available
- **Documentation:** Good documentation
- **Support:** Email support

### Modern Treasury Integration
- **Widget:** No widget (API-only)
- **API:** Full REST API
- **Documentation:** Excellent enterprise documentation
- **Support:** Enterprise support available

### Guardarian Integration
- **Widget:** Widget available
- **API:** API available
- **Documentation:** Good documentation
- **Support:** Email support

### CoinSwitch Integration
- **Widget:** Limited widget
- **API:** Primary integration method
- **Documentation:** Good API docs
- **Support:** Developer support

### Utorg Integration
- **Widget:** Widget available
- **API:** API available
- **Documentation:** Good documentation
- **Support:** Email support

### CoinGate Integration
- **Widget:** No widget (API-only)
- **API:** Full API
- **Documentation:** Good API documentation
- **Support:** Email support

### BitPay Integration
- **Widget:** No widget (API-only)
- **API:** Full API
- **Documentation:** Good merchant API docs
- **Support:** Merchant support

### Changelly Integration
- **Widget:** No widget (API-only)
- **API:** Full API
- **Documentation:** Good API documentation
- **Support:** Email support

### Coinify Integration
- **Widget:** No widget (API-only)
- **API:** Full API
- **Documentation:** Good API documentation
- **Support:** Email support

### onesafe Integration
- **Widget:** No widget (API-only)
- **API:** Full API
- **Documentation:** Enterprise documentation
- **Support:** Enterprise support

### Reap Integration
- **Widget:** No widget (API-only)
- **API:** Full API (off-ramp only)
- **Documentation:** Business API documentation
- **Support:** Business support

### Coinmama Integration
- **Widget:** Basic widget
- **API:** Limited API
- **Documentation:** Basic documentation
- **Support:** Email support

---

## Provider-Specific Notes

### Transak
- Best for developers seeking React SDK
- Wide chain and token support
- Good documentation
- Medium fees

### MoonPay
- Widest coverage (160+ countries)
- Highest conversion rates
- High fees but reliable
- Good widget integration

### Ramp
- Lowest fees for bank transfers
- Strong EU/SEPA support
- Focus on L2 chains
- Good SDK

### Sardine
- Best for US market
- Instant ACH settlement
- Advanced fraud detection
- Higher limits

### Stripe
- Mainstream brand recognition
- Excellent developer experience
- Conservative asset list
- Usage-based pricing

### Banxa
- Local payment methods
- Good global coverage
- Variable fees
- B2B focus

### Mercuryo
- B2B focused
- Global coverage
- Medium fees
- Good for enterprise

### Coinbase Pay
- Seamless Coinbase ecosystem integration
- Strong Base L2 support
- Excellent SDK and documentation
- Medium fees
- Best for apps targeting Coinbase users

### Simplex
- High transaction limits
- Strong card processing
- Good widget integration
- Medium to high fees
- Widely integrated

### Modern Treasury
- Enterprise payment infrastructure
- Strong API and developer tools
- US-focused with select global
- Usage-based pricing
- Best for large-scale operations

### Guardarian
- European focus
- Good widget integration
- Competitive fees
- Strong EU payment methods
- 100+ countries

### CoinSwitch
- Strong India/APAC presence
- Good API integration
- Local payment methods (UPI, etc.)
- Medium fees
- Best for Indian market

### Utorg
- Multi-chain support
- Good widget integration
- Medium fees
- 100+ countries
- Balanced offering

### CoinGate
- Very low fees
- Strong API
- Global coverage
- Bitcoin and altcoin support
- Good for cost-sensitive applications

### BitPay
- Bitcoin-focused
- Strong merchant tools
- Good API
- Medium fees
- Best for Bitcoin-heavy applications

### Changelly
- Exchange-focused
- Good API integration
- Medium fees
- Global coverage
- Best for exchange integrations

### Coinify
- European focus
- Good API
- Medium fees
- 50+ countries
- EU payment methods

### onesafe
- Enterprise-focused
- Variable pricing
- Select global coverage
- Good API
- Best for enterprise use cases

### Reap
- **Off-ramp only** (no on-ramp)
- Business-focused
- Global coverage
- Variable fees
- Best for business off-ramp needs

### Coinmama
- **On-ramp only** (no off-ramp)
- Simple integration
- High fees
- 100+ countries
- Basic widget
- Best for simple on-ramp needs

---

## Related Resources

- [Software Wallet Comparison](./WALLET_COMPARISON_UNIFIED_TABLE.md)
- [Hardware Wallet Comparison](./HARDWARE_WALLET_COMPARISON_TABLE.md)
- [Crypto Credit Card Comparison](./CRYPTO_CREDIT_CARD_COMPARISON_TABLE.md)

---

**Last Updated:** December 2025

**Verification Notes:**
- Original 7 providers verified from PR 128 research (Transak, MoonPay, Ramp, Sardine, Stripe, Banxa, Mercuryo)
- Additional 13 providers added per user request (Modern Treasury, onesafe, Reap specifically mentioned)
- All coverage numbers, fees, and status should be verified on official provider websites before integration
- Values marked with "~" are approximate estimates based on available documentation
