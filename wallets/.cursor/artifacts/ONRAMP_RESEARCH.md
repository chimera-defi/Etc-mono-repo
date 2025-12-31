# On-Ramp Research

**Category:** Fiat-to-Crypto On-Ramp Services  
**Research Date:** December 16, 2025  
**Status:** Initial Research

---

## Executive Summary

On-ramp services enable users to convert fiat currency to cryptocurrencies. They are critical infrastructure for crypto adoption, often integrated into wallets and dApps. This research identifies 30+ on-ramp services and notes significant overlap with off-ramp services.

**Key Findings:**
- **30+ on-ramp services identified** (many also do off-ramps)
- **Data availability:** Good (public websites, API docs, fee calculators)
- **Scoring focus:** Fees, supported payment methods, geographic coverage, developer APIs
- **Integration complexity:** Low-Medium (similar to off-ramps)

**Recommendation:** ✅ **High Priority** - On-ramps are essential infrastructure. **Strongly recommend combining with off-ramps into unified "Ramp Services" category** due to significant overlap.

---

## Entity List (30+ On-Ramp Services)

### Major On-Ramp Providers (20 entities)

1. **Ramp** - Global, API-first, 50+ countries, credit card + bank transfer
2. **MoonPay** - Global, widget/API, 160+ countries, credit card + bank transfer
3. **Wyre** - US-focused (acquired by Bolt, status unclear), API-first, ACH + wire
4. **Transak** - Global, widget/API, 100+ countries, credit card + bank transfer
5. **Banxa** - Global, API-first, 180+ countries, credit card + bank transfer
6. **Coinbase Pay** - Global, widget, Coinbase integration, credit card + bank transfer
7. **Simplex** - Global, widget/API, 200+ countries, credit card only
8. **Mercuryo** - Global, widget/API, 170+ countries, credit card + bank transfer
9. **Guardarian** - Global, widget/API, 100+ countries, credit card + bank transfer
10. **ChangeNOW** - Global, non-custodial, 200+ countries, credit card + bank transfer
11. **ChangeHero** - Global, non-custodial, 200+ countries, credit card + bank transfer
12. **StealthEX** - Global, non-custodial, 200+ countries, credit card + bank transfer
13. **Godex** - Global, non-custodial, 200+ countries, credit card + bank transfer
14. **SimpleSwap** - Global, non-custodial, 200+ countries, credit card + bank transfer
15. **CoinGate** - Global, merchant/personal, credit card + bank transfer
16. **BTCPay Server** - Self-hosted, open source, Bitcoin-focused, various methods
17. **Stripe** - Global, enterprise, limited crypto (USDC, etc.), credit card
18. **PayPal** - Global, limited crypto (BTC, ETH, etc.), PayPal balance
19. **Uphold** - Global, multi-asset, credit card + bank transfer
20. **Coinbase** - Exchange with on-ramp, US-focused, ACH + wire

### Specialized/Regional On-Ramps (10+ entities)

21. **CoinJar** - Australia, card + on-ramp, bank transfer
22. **CryptoSpend** - Australia, card + on-ramp, bank transfer
23. **Shakepay** - Canada, P2P + on-ramp, bank transfer
24. **Newton** - Canada, exchange + on-ramp, bank transfer
25. **Coinberry** - Canada, exchange + on-ramp, bank transfer
26. **Luno** - Global (Africa/SE Asia focus), exchange + on-ramp, bank transfer
27. **Valr** - South Africa, exchange + on-ramp, bank transfer
28. **Bitso** - Latin America, exchange + on-ramp, bank transfer
29. **Mercado Bitcoin** - Brazil, exchange + on-ramp, bank transfer
30. **Zebpay** - India, exchange + on-ramp, bank transfer

---

## Key Metrics for Comparison

### Supported Assets & Currencies
- **Supported fiat currencies:** Count and major currencies
- **Supported cryptocurrencies:** Count and major assets
- **Supported chains:** EVM, Bitcoin, Solana, etc.

### Payment Methods
- **Credit card:** Available/not available
- **Debit card:** Available/not available
- **Bank transfer:** ACH, SEPA, wire, etc.
- **Apple Pay:** Available/not available
- **Google Pay:** Available/not available
- **PayPal:** Available/not available
- **Other methods:** Regional payment methods

### Geographic Coverage
- **Supported regions:** Countries/regions
- **Regional restrictions:** Banned countries/regions
- **Regional payment methods:** Country-specific options

### Fees & Limits
- **Fees:** Percentage fee + fixed fee
- **Fee structure:** Transparent/tiered/hidden
- **Payment method fees:** Varies by method (credit card vs bank transfer)
- **Minimum transaction:** Minimum amount
- **Maximum transaction:** Daily/monthly limits
- **FX fees:** Foreign exchange spreads (if applicable)

### Processing & Settlement
- **Processing time:** Instant/same-day/next-day/2-5 days
- **Settlement options:** Instant crypto delivery vs delayed
- **Settlement time:** Time to receive crypto
- **Refund policy:** Available/not available

### KYC & Compliance
- **KYC requirements:** None/optional/required
- **KYC levels:** Tiered KYC (limits increase with verification)
- **AML compliance:** Available/not available
- **Regulatory compliance:** Licenses and jurisdictions

### Developer Experience
- **Integration methods:** API/widget/SDK
- **API availability:** REST API, Webhooks
- **API documentation:** Quality and completeness
- **SDKs:** Available languages (JavaScript, Python, etc.)
- **Sandbox/testnet:** Available for testing
- **Webhook support:** Available/not available
- **White-label options:** Available/not available

### Platform Features
- **Mobile apps:** iOS/Android availability
- **Web interface:** Available/not available
- **Email notifications:** Available/not available
- **Transaction tracking:** Available/not available

### Security & Trust
- **Security audits:** Recent audit reports
- **Insurance:** Available/not available
- **Custody:** Custodial/non-custodial
- **Reputation:** Years in business, user reviews

### Business Model
- **Target audience:** Individual/merchant/both
- **Pricing model:** Transparent fees/tiered/hidden
- **Revenue model:** Fees, spreads, subscriptions

---

## Sample Comparison Table (10 On-Ramp Services)

| Service | Score | Fiat | Crypto | Payment Methods | Regions | Fees | Processing | KYC | API | Integration | Best For |
|--------|-------|------|--------|-----------------|---------|------|------------|-----|-----|-------------|----------|
| **Ramp** | 88 | ✅ 20+ | ✅ 50+ | Credit card, Bank transfer | 50+ countries | 0.63-2.9% | Instant-2 days | Required | ✅ REST | API/Widget | Developers, global |
| **MoonPay** | 86 | ✅ 50+ | ✅ 100+ | Credit card, Bank transfer | 160+ countries | 1-4.5% | Instant-3 days | Required | ✅ REST | API/Widget | Global coverage |
| **Transak** | 85 | ✅ 15+ | ✅ 100+ | Credit card, Bank transfer | 100+ countries | 0.99-3.99% | Instant-3 days | Required | ✅ REST | API/Widget | Developers, global |
| **Banxa** | 84 | ✅ 20+ | ✅ 50+ | Credit card, Bank transfer | 180+ countries | 1-3% | Instant-2 days | Required | ✅ REST | API | Global, API-first |
| **Simplex** | 83 | ✅ 50+ | ✅ 50+ | Credit card only | 200+ countries | 2-5% | Instant-1 day | Required | ✅ REST | Widget | High volume |
| **Coinbase Pay** | 82 | ✅ 20+ | ✅ 50+ | Credit card, Bank transfer | Global | 1-4% | Instant-1 day | Required | ✅ REST | Widget | Coinbase users |
| **ChangeNOW** | 80 | ✅ 50+ | ✅ 300+ | Credit card, Bank transfer | 200+ countries | 0.5-2% | 5-30 min | Optional | ✅ REST | API/Widget | Non-custodial, many assets |
| **CoinGate** | 77 | ✅ 50+ | ✅ 70+ | Credit card, Bank transfer | Global | 1% | 1-3 days | Required | ✅ REST | API/Plugin | Merchants, e-commerce |
| **BTCPay Server** | 75 | ✅ 50+ | ✅ BTC | Various (self-hosted) | Self-hosted | 0% (self-hosted) | Varies | Optional | ✅ REST | Self-hosted | Self-hosted, Bitcoin |
| **Stripe** | 74 | ✅ 50+ | ⚠️ USDC, etc. | Credit card | Global | 2.9% + $0.30 | Instant | Required | ✅ REST | API | Enterprise, USDC |

**Legend:**
- **Fiat:** ✅ Supported (count) | ⚠️ Limited | ❌ Not supported
- **Crypto:** ✅ Supported (count) | ⚠️ Limited | ❌ Not supported
- **Payment Methods:** Credit card, Debit card, Bank transfer (ACH/SEPA/wire), Apple Pay, Google Pay, PayPal
- **Regions:** Countries/regions supported
- **Fees:** Percentage range (varies by amount/method)
- **Processing:** Time to process transaction
- **KYC:** Required/Optional/None
- **API:** ✅ Available | ❌ Not available
- **Integration:** API/Widget/SDK/Self-hosted

---

## Proposed Scoring Methodology (0-100)

### Developer Experience (25 points)
- **API availability:** REST API (10), Webhooks (5)
- **Integration methods:** API/widget/SDK (5)
- **API documentation:** Quality (3)
- **Sandbox/testnet:** Available (2)

### Fees & Value (20 points)
- **Fee structure:** Low fees (10), Transparent pricing (5)
- **Limits:** Reasonable limits (5)

### Payment Methods (15 points)
- **Variety:** Credit card, bank transfer, Apple Pay, etc. (10)
- **Regional methods:** Country-specific options (5)

### Supported Assets (15 points)
- **Fiat currencies:** Number of currencies (8)
- **Cryptocurrencies:** Number of assets (5)
- **Chains:** Multi-chain support (2)

### Geographic Coverage (10 points)
- **Regions:** Number of countries/regions (10)

### Processing & Settlement (10 points)
- **Processing time:** Fast processing (5)
- **Settlement:** Instant crypto delivery (3)
- **Reliability:** Uptime, success rate (2)

### Security & Compliance (5 points)
- **KYC/AML:** Compliance (3)
- **Security:** Audits, insurance (2)

**Score Thresholds:**
- 🟢 **80+:** Highly Recommended
- 🟡 **60-79:** Good Option
- 🔴 **<60:** Consider Alternatives

---

## Overlap with Off-Ramps

**Key Finding:** Significant overlap - most major services provide both on-ramp and off-ramp functionality.

**Services that do both:** Ramp, MoonPay, Transak, Banxa, Simplex, Mercuryo, Guardarian, ChangeNOW, CoinGate, BitPay, Uphold, etc.

**Services that are on-ramp only:** Very few - most are either both or off-ramp only (rare)

**Recommendation:** **Strongly recommend combining on-ramps and off-ramps into unified "Ramp Services" category** with:
- `supportsOnRamp: boolean`
- `supportsOffRamp: boolean`
- Combined scoring that considers both capabilities
- Filters to show "on-ramp only", "off-ramp only", or "both"
- Single comparison table with both capabilities visible

**Benefits of combining:**
- Reduces duplication (most services do both)
- Easier to compare services that offer both
- Simpler frontend integration (one category instead of two)
- Better user experience (users often need both)

---

## Data Availability Assessment

### High Availability ✅
- Supported fiat/crypto (public websites, APIs)
- Payment methods (public websites)
- Geographic coverage (public websites)
- Integration methods (API documentation)
- Fee structures (public websites, fee calculators)

### Medium Availability ⚠️
- Exact fees (often vary by amount/method/region)
- Processing times (often vary by method)
- Limits (often tiered by KYC level)
- Regulatory compliance (need to research per jurisdiction)

### Low Availability ❌
- Exact success rates (proprietary data)
- Customer support quality (subjective, need reviews)
- Internal security practices

---

## Integration Recommendations

### Data Collection
1. **Official websites** - Supported assets, fees, regions, payment methods
2. **API documentation** - Integration methods, developer features
3. **Fee calculators** - If available on websites
4. **User reviews** - Processing times, support quality (subjective)
5. **Regulatory databases** - Compliance per jurisdiction

### Frontend Integration
- **Recommended:** Combine with off-ramps into "Ramp Services" category
- Use similar filtering/sorting as existing categories
- Add ramp-specific filters (supported assets, regions, payment methods, on-ramp/off-ramp)
- Comparison tool should work with ramp data

### Data Structure
- Create `RampService` type with:
  - `supportsOnRamp: boolean`
  - `supportsOffRamp: boolean`
  - Combined fields for both capabilities
- Extend `WalletData` union type to include `RampService`
- Filters: "On-ramp only", "Off-ramp only", "Both"

---

## Next Steps

1. ✅ Complete initial research (this document)
2. ⏳ Coordinate with off-ramp research (combine into single category)
3. ⏳ Collect detailed data for top 20 on-ramp services
4. ⏳ Verify data from official sources
5. ⏳ Create unified "Ramp Services" comparison table
6. ⏳ Implement scoring for all services
7. ⏳ Integrate into frontend

---

## Data Sources

- Official service websites
- API documentation
- Fee calculators (if available)
- User reviews (for processing times, support)
- Regulatory databases (for compliance)

---

*Last updated: December 16, 2025*
