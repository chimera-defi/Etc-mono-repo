# Off-Ramp Research

**Category:** Crypto-to-Fiat Off-Ramp Services  
**Research Date:** December 16, 2025  
**Status:** Initial Research

---

## Executive Summary

Off-ramp services enable users to convert cryptocurrencies to fiat currency and withdraw to bank accounts or payment methods. They are critical infrastructure for crypto adoption. This research identifies 30+ off-ramp services and proposes a comparison framework.

**Key Findings:**
- **30+ off-ramp services identified** (many also do on-ramps)
- **Data availability:** Good (public websites, API docs, fee calculators)
- **Scoring focus:** Fees, supported assets, geographic coverage, developer APIs
- **Integration complexity:** Low-Medium (similar to on-ramps, many services do both)

**Recommendation:** ✅ **High Priority** - Off-ramps are essential infrastructure. Consider combining with on-ramps into single "Ramp Services" category.

---

## Entity List (30+ Off-Ramp Services)

### Major Off-Ramp Providers (20 entities)

1. **Ramp** - Global, API-first, 50+ countries, 50+ assets
2. **MoonPay** - Global, widget/API, 160+ countries, 100+ assets
3. **Wyre** - US-focused (acquired by Bolt, status unclear), API-first
4. **Transak** - Global, widget/API, 100+ countries, 100+ assets
5. **Banxa** - Global, API-first, 180+ countries, 50+ assets
6. **Coinbase Pay** - Global, widget, Coinbase integration
7. **Simplex** - Global, widget/API, 200+ countries, 50+ assets
8. **Mercuryo** - Global, widget/API, 170+ countries, 50+ assets
9. **Guardarian** - Global, widget/API, 100+ countries, 50+ assets
10. **ChangeNOW** - Global, non-custodial, 200+ countries, 300+ assets
11. **ChangeHero** - Global, non-custodial, 200+ countries, 200+ assets
12. **StealthEX** - Global, non-custodial, 200+ countries, 700+ assets
13. **Godex** - Global, non-custodial, 200+ countries, 200+ assets
14. **SimpleSwap** - Global, non-custodial, 200+ countries, 500+ assets
15. **BitPay** - US-focused, merchant/personal, 50+ assets
16. **CoinGate** - Global, merchant/personal, 70+ assets
17. **BTCPay Server** - Self-hosted, open source, Bitcoin-focused
18. **Stripe** - Global, enterprise, limited crypto (USDC, etc.)
19. **PayPal** - Global, limited crypto (BTC, ETH, etc.), US-focused
20. **Uphold** - Global, multi-asset, 200+ assets

### Specialized/Regional Off-Ramps (10+ entities)

21. **CoinJar** - Australia, card + off-ramp
22. **CryptoSpend** - Australia, card + off-ramp
23. **Shakepay** - Canada, P2P + off-ramp
24. **Newton** - Canada, exchange + off-ramp
25. **Coinberry** - Canada, exchange + off-ramp
26. **Luno** - Global (Africa/SE Asia focus), exchange + off-ramp
27. **Valr** - South Africa, exchange + off-ramp
28. **Bitso** - Latin America, exchange + off-ramp
29. **Mercado Bitcoin** - Brazil, exchange + off-ramp
30. **Zebpay** - India, exchange + off-ramp

---

## Key Metrics for Comparison

### Supported Assets & Currencies
- **Supported cryptocurrencies:** Count and major assets
- **Supported fiat currencies:** Count and major currencies
- **Supported chains:** EVM, Bitcoin, Solana, etc.

### Geographic Coverage
- **Supported regions:** Countries/regions
- **Payment methods:** Bank transfer, ACH, SEPA, wire, etc.
- **Regional restrictions:** Banned countries/regions

### Fees & Limits
- **Fees:** Percentage fee + fixed fee
- **Fee structure:** Transparent/tiered/hidden
- **Minimum transaction:** Minimum amount
- **Maximum transaction:** Daily/monthly limits
- **FX fees:** Foreign exchange spreads (if applicable)

### Processing & Settlement
- **Processing time:** Instant/same-day/next-day/2-5 days
- **Settlement options:** Crypto vs fiat settlement
- **Settlement time:** Time to receive funds
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

## Sample Comparison Table (10 Off-Ramp Services)

| Service | Score | Crypto | Fiat | Regions | Fees | Processing | KYC | API | Integration | Best For |
|---------|-------|--------|------|---------|------|-------------|-----|-----|-------------|----------|
| **Ramp** | 88 | ✅ 50+ | ✅ 20+ | 50+ countries | 0.63-2.9% | Instant-2 days | Required | ✅ REST | API/Widget | Developers, global |
| **MoonPay** | 86 | ✅ 100+ | ✅ 50+ | 160+ countries | 1-4.5% | Instant-3 days | Required | ✅ REST | API/Widget | Global coverage |
| **Transak** | 85 | ✅ 100+ | ✅ 15+ | 100+ countries | 0.99-3.99% | Instant-3 days | Required | ✅ REST | API/Widget | Developers, global |
| **Banxa** | 84 | ✅ 50+ | ✅ 20+ | 180+ countries | 1-3% | Instant-2 days | Required | ✅ REST | API | Global, API-first |
| **Simplex** | 83 | ✅ 50+ | ✅ 50+ | 200+ countries | 2-5% | Instant-1 day | Required | ✅ REST | Widget | High volume |
| **Coinbase Pay** | 82 | ✅ 50+ | ✅ 20+ | Global | 1-4% | Instant-1 day | Required | ✅ REST | Widget | Coinbase users |
| **ChangeNOW** | 80 | ✅ 300+ | ✅ 50+ | 200+ countries | 0.5-2% | 5-30 min | Optional | ✅ REST | API/Widget | Non-custodial, many assets |
| **BitPay** | 78 | ✅ 50+ | ✅ USD | US-focused | 1% | 1-2 days | Required | ✅ REST | API | US merchants |
| **CoinGate** | 77 | ✅ 70+ | ✅ 50+ | Global | 1% | 1-3 days | Required | ✅ REST | API/Plugin | Merchants, e-commerce |
| **BTCPay Server** | 75 | ✅ BTC | ✅ 50+ | Self-hosted | 0% (self-hosted) | Varies | Optional | ✅ REST | Self-hosted | Self-hosted, Bitcoin |

**Legend:**
- **Crypto:** ✅ Supported (count) | ⚠️ Limited | ❌ Not supported
- **Fiat:** ✅ Supported (count) | ⚠️ Limited | ❌ Not supported
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

### Supported Assets (15 points)
- **Cryptocurrencies:** Number of assets (8)
- **Fiat currencies:** Number of currencies (4)
- **Chains:** Multi-chain support (3)

### Geographic Coverage (15 points)
- **Regions:** Number of countries/regions (10)
- **Payment methods:** Variety of methods (5)

### Processing & Settlement (10 points)
- **Processing time:** Fast processing (5)
- **Settlement options:** Crypto vs fiat (3)
- **Reliability:** Uptime, success rate (2)

### Security & Compliance (10 points)
- **KYC/AML:** Compliance (5)
- **Security:** Audits, insurance (3)
- **Reputation:** Years in business (2)

### Platform Quality (5 points)
- **Mobile apps:** iOS/Android (3)
- **User experience:** Interface quality (2)

**Score Thresholds:**
- 🟢 **80+:** Highly Recommended
- 🟡 **60-79:** Good Option
- 🔴 **<60:** Consider Alternatives

---

## Data Availability Assessment

### High Availability ✅
- Supported cryptocurrencies (public websites, APIs)
- Supported fiat currencies (public websites)
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
1. **Official websites** - Supported assets, fees, regions
2. **API documentation** - Integration methods, developer features
3. **Fee calculators** - If available on websites
4. **User reviews** - Processing times, support quality (subjective)
5. **Regulatory databases** - Compliance per jurisdiction

### Frontend Integration
- **Option 1:** Add new tab: "Off-Ramps" alongside other categories
- **Option 2:** Combine with on-ramps into "Ramp Services" category (recommended)
- Use similar filtering/sorting as existing categories
- Add ramp-specific filters (supported assets, regions, payment methods)
- Comparison tool should work with ramp data

### Data Structure
- Create `RampService` type (or separate `OnRamp`/`OffRamp` types)
- Add ramp-specific fields (supported assets, regions, fees, processing time)
- Extend `WalletData` union type to include ramp services
- Consider `supportsOnRamp` and `supportsOffRamp` boolean fields if combining

---

## Overlap with On-Ramps

**Key Finding:** Many services provide both on-ramp and off-ramp functionality.

**Recommendation:** Consider creating a unified "Ramp Services" category with:
- `supportsOnRamp: boolean`
- `supportsOffRamp: boolean`
- Combined scoring that considers both capabilities
- Filters to show "on-ramp only", "off-ramp only", or "both"

**Services that do both:** Ramp, MoonPay, Transak, Banxa, Simplex, Mercuryo, Guardarian, ChangeNOW, CoinGate, BitPay, Uphold, etc.

---

## Next Steps

1. ✅ Complete initial research (this document)
2. ⏳ Collect detailed data for top 20 off-ramp services
3. ⏳ Verify data from official sources
4. ⏳ Create full comparison table
5. ⏳ Coordinate with on-ramp research (consider combining)
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
