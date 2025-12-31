# On/Off-Ramp Infrastructure Comparison

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
