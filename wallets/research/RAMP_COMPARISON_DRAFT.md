# On/Off-Ramp Infrastructure Comparison

> **TL;DR:** **MoonPay** and **Transak** are the leaders in coverage and simple integration. **Sardine** is best for high limits/fraud protection. **Stripe** is the safest bet for brand trust. **Ramp Network** often wins on speed/fees for EU users.

## 🌉 Top Providers

| Provider | Best For | Fees (Est.) | Coverage | Key Features |
|----------|----------|-------------|----------|--------------|
| **MoonPay** | 🟢 UX / Coverage | High (~4.5% + min) | 160+ Countries | widely integrated, high trust, easy flow |
| **Transak** | 🟢 Dev Integration | Medium (~3.5%+) | 150+ Countries | NFT Checkout, strong KYC compliance |
| **Ramp** | 🟢 Speed/EU | Low/Med (~2.9%+) | 150+ Countries | Fast settlement, strong L2 support |
| **Sardine** | 🟢 High Limits | Variable | US + Global | **Instant ACH** settlement (fraud focus) |
| **Stripe** | 🟢 Brand Trust | Usage based | Global | Trusted UI, familiar to web2 users |
| **Banxa** | 🟡 Local Methods | Variable | Global | High support for local bank transfers (POLi, iDEAL) |
| **Mercuryo** | 🟡 B2B | Medium | Global | Strong B2B/embedded focus |

## 🛠️ Developer Considerations

### 1. Integration Difficulty
*   **SDK/Widget:** MoonPay, Transak, and Ramp all offer drop-in React widgets. This is the "easy mode" (lines of code: <20).
*   **API:** Sardine and Stripe offer robust APIs for custom flows but require more work.

### 2. KYC Friction
*   **Tiered KYC:** Most providers allow small amounts (e.g., <$150) with simplified KYC (name/DOB/address), but require ID scan for higher amounts.
*   **User Retention:** High friction at KYC is the #1 drop-off point.
    *   *Winner:* **Ramp** and **MoonPay** are heavily optimized here. **Sardine** reduces friction by allowing instant ACH (no card declines).

### 3. Payment Methods
*   **Cards (Visa/MC):** Supported by all. High decline rates for crypto transactions globally.
*   **Apple/Google Pay:** Critical for mobile conversion. Supported by MoonPay, Transak, Ramp, Stripe.
*   **Local Bank Transfers:**
    *   **Banxa** excels here (huge list of local methods).
    *   **Sardine** excels at US ACH.
    *   **Ramp/MoonPay** support SEPA (EU) and UK Faster Payments.

## 💰 Fee Structures (Rough Guide)
*Fees are complex and consist of: Gateway Fee + Processing Fee + Network Gas Fee + Spread.*

*   **Credit Cards:** Most expensive (~3% - 5%).
*   **Bank Transfers:** Cheaper (<1% - 2%), but slower (unless using Sardine/Instant rails).
*   **Network Fees:** The user pays the gas. L2s (Arbitrum/Optimism/Base) are significantly cheaper to on-ramp to than Ethereum Mainnet.

## ⚠️ Risk & Compliance
*   **Merchant of Record (MoR):** These providers act as the MoR. They handle the chargebacks and fraud. You (the dev) generally don't take the financial risk.
*   **Geo-blocking:** You must handle the UI for unsupported regions (e.g., New York often restricted), or the widget will show an error.
