# Crypto On/Off-Ramp Comparison - Full Documentation

> **TL;DR:** **MoonPay** and **Transak** are the market leaders for general coverage. **Sardine** is the best choice for high-value transactions (Instant ACH). **Ramp Network** offers excellent performance for European/L2 users. **Stripe** is the safest bet for mainstream brand trust.

**Data Sources:** Developer Documentation, Fee Schedules, Integration Guides (as of Dec 2025).

---

## 🌉 Top Providers Comparison

| Provider | Score | Best For | Global Coverage | Fee Model | Dev UX |
|----------|-------|----------|-----------------|-----------|--------|
| **Transak** | 92 | 🛠️ Developers | 160+ Countries | Medium (Spread + Fee) | Excellent (React SDK) |
| **MoonPay** | 90 | 🌍 Coverage | 160+ Countries | High (Spread + Fee) | Great (Widget) |
| **Ramp** | 88 | 🇪🇺 EU / Speed | 150+ Countries | Low/Medium | Good (SDK) |
| **Sardine** | 86 | 🇺🇸 US / Fraud | US + Select Global | Variable (Risk based) | Advanced (API/SDK) |
| **Stripe** | 85 | 🤝 Trust | Global | Usage Based | Excellent (Stripe style) |
| **Banxa** | 80 | 🏦 Local Pay | Global | Variable | Good |
| **Mercuryo** | 78 | 💼 B2B | Global | Medium | Good |

---

## 💰 Fee Structure Analysis

Fees are the biggest friction point for users. They typically consist of three parts:
1.  **Processing Fee:** charged by the ramp (e.g., 1% - 3.5%).
2.  **Network Fee:** Gas costs (user pays).
3.  **Spread:** The difference between the quoted price and market spot price (often hidden, 1% - 3%).

| Provider | Est. Processing Fee | Est. Spread | Min. Fee | Notes |
|----------|---------------------|-------------|----------|-------|
| **Ramp** | ~0.99% - 2.9% | Low (~1%) | €2.49 | Competitive for bank transfers. |
| **Transak** | ~3.5% (Cards) | Medium (~2%) | $5.00 | Fee varies heavily by payment method. |
| **MoonPay** | ~4.5% (Cards) | High (~2-3%) | $3.99 | Often the most expensive, but highest conversion. |
| **Stripe** | Custom | Custom | Custom | Usage-based pricing for businesses. |

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
*   **Ramp:** Strong focus on Ethereum L2s (Arbitrum, Optimism, zkSync, Base).
*   **Stripe:** More conservative asset list (mostly majors: BTC, ETH, SOL, USDC).

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

---

## Related Resources

- [Software Wallet Comparison](./WALLET_COMPARISON_UNIFIED_TABLE.md)
- [Hardware Wallet Comparison](./HARDWARE_WALLET_COMPARISON_TABLE.md)
- [Crypto Credit Card Comparison](./CRYPTO_CREDIT_CARD_COMPARISON_TABLE.md)

---

**Last Updated:** December 2025
