# Payment Processor Research

**Category:** Crypto Payment Processors (Merchant Services)  
**Research Date:** December 16, 2025  
**Status:** Initial Research

---

## Executive Summary

Crypto payment processors enable merchants to accept cryptocurrency payments and settle in crypto or fiat. They differ from on/off-ramps by focusing on merchant acceptance rather than individual conversions. This research identifies 20+ payment processors and proposes a comparison framework.

**Key Findings:**
- **20+ payment processors identified** (mix of hosted and self-hosted solutions)
- **Data availability:** Good (public websites, API docs, plugin directories)
- **Scoring focus:** Fees, settlement options, e-commerce integrations, developer APIs
- **Integration complexity:** Medium (different from wallets but complementary)

**Recommendation:** ✅ **Medium Priority** - Payment processors serve merchants (different audience than wallets), but complement the ecosystem well.

---

## Entity List (20+ Payment Processors)

### Hosted Payment Processors (15 entities)

1. **BitPay** - US-focused, crypto settlement, 50+ assets, API + plugins
2. **CoinGate** - Global, crypto/fiat settlement, 70+ assets, API + plugins
3. **BTCPay Server** - Self-hosted, open source, Bitcoin-focused, API
4. **NOWPayments** - Global, crypto settlement, 300+ assets, API + plugins
5. **CoinPayments** - Global, crypto settlement, 2,000+ assets, API + plugins
6. **Flexa** - US-focused, instant settlement, limited assets, API
7. **Strike** - Global, Lightning Network, Bitcoin-focused, API
8. **Coinbase Commerce** - Global, crypto settlement, 10+ assets, API + plugins
9. **Crypto.com Pay** - Global, crypto settlement, 20+ assets, API + plugins
10. **Utrust** - Global, crypto/fiat settlement, 20+ assets, API + plugins
11. **PumaPay** - Global, recurring payments, 20+ assets, API
12. **Request Network** - Global, invoicing, 20+ assets, API
13. **Paytomat** - Global, crypto settlement, 50+ assets, API + plugins
14. **GoCrypto** - Global, crypto settlement, 20+ assets, API + plugins
15. **CoinPayments** - Global, crypto settlement, 2,000+ assets, API + plugins

### Self-Hosted Solutions (5+ entities)

16. **BTCPay Server** - Open source, Bitcoin-focused, self-hosted
17. **LNBits** - Lightning Network, self-hosted, open source
18. **BTCPay Server** - (duplicate, but important)
19. **OpenNode** - Lightning Network, API, hosted + self-hosted options
20. **Strike** - Lightning Network, API, hosted

---

## Key Metrics for Comparison

### Supported Assets
- **Supported cryptocurrencies:** Count and major assets
- **Supported chains:** EVM, Bitcoin, Lightning Network, etc.
- **Settlement currencies:** Crypto vs fiat options

### Settlement Options
- **Crypto settlement:** Available/not available
- **Fiat settlement:** Automatic conversion to fiat
- **Settlement time:** Instant/same-day/next-day
- **Settlement fees:** Fees for settlement
- **Multi-currency:** Support for multiple settlement currencies

### Fees & Costs
- **Transaction fees:** Percentage fee + fixed fee
- **Settlement fees:** Fees for crypto/fiat conversion
- **Monthly fees:** Free/tiered/premium
- **Setup fees:** One-time setup costs
- **Chargeback protection:** Available/not available

### E-Commerce Integrations
- **Shopify:** Plugin/API available
- **WooCommerce:** Plugin available
- **Magento:** Plugin/extension available
- **PrestaShop:** Module available
- **BigCommerce:** App available
- **Custom integrations:** API availability

### Developer Experience
- **API availability:** REST API, Webhooks
- **API documentation:** Quality and completeness
- **SDKs:** Available languages (JavaScript, Python, PHP, etc.)
- **Webhook support:** Available/not available
- **Sandbox/testnet:** Available for testing
- **Code examples:** Available/not available

### Platform Features
- **Invoicing:** Available/not available
- **Recurring payments:** Subscription support
- **Payment buttons:** Widget/button generators
- **Payment links:** Generate payment links
- **Refund support:** Available/not available
- **Partial payments:** Available/not available

### Security & Compliance
- **Security audits:** Recent audit reports
- **PCI compliance:** Available/not available
- **KYC/AML:** Merchant KYC requirements
- **Regulatory compliance:** Licenses and jurisdictions
- **Insurance:** Available/not available

### Geographic Coverage
- **Supported regions:** Countries/regions
- **Regional restrictions:** Banned countries/regions
- **Local payment methods:** Country-specific options

### Business Model
- **Target audience:** Small merchants/enterprise/both
- **Pricing model:** Transparent fees/tiered/hidden
- **Revenue model:** Fees, subscriptions, spreads

### Open Source & Self-Hosted
- **Open source:** Full/partial/closed
- **Self-hosted option:** Available/not available
- **GitHub repository:** Link if available

---

## Sample Comparison Table (10 Payment Processors)

| Processor | Score | Crypto | Settlement | Fees | E-Commerce | API | Open Source | Best For |
|-----------|-------|--------|------------|------|------------|-----|-------------|----------|
| **BitPay** | 85 | ✅ 50+ | Crypto | 1% | ✅ Shopify, WooCommerce, Magento | ✅ REST | ❌ Closed | US merchants, crypto settlement |
| **CoinGate** | 84 | ✅ 70+ | Crypto/Fiat | 1% | ✅ Shopify, WooCommerce, PrestaShop | ✅ REST | ❌ Closed | Global merchants, e-commerce |
| **BTCPay Server** | 88 | ✅ BTC | Crypto | 0% (self-hosted) | ✅ WooCommerce, PrestaShop | ✅ REST | ✅ Full (MIT) | Self-hosted, Bitcoin, open source |
| **NOWPayments** | 82 | ✅ 300+ | Crypto | 0.5% | ✅ Shopify, WooCommerce, PrestaShop | ✅ REST | ❌ Closed | Many assets, low fees |
| **CoinPayments** | 80 | ✅ 2,000+ | Crypto | 0.5% | ✅ Shopify, WooCommerce, Magento | ✅ REST | ❌ Closed | Most assets, global |
| **Flexa** | 78 | ⚠️ 5+ | Instant Fiat | 1% | ✅ Shopify, WooCommerce | ✅ REST | ❌ Closed | Instant settlement, US |
| **Strike** | 77 | ✅ BTC (Lightning) | Crypto/Fiat | 1% | ✅ API only | ✅ REST | ❌ Closed | Lightning Network, instant |
| **Coinbase Commerce** | 76 | ✅ 10+ | Crypto | 1% | ✅ Shopify, WooCommerce | ✅ REST | ❌ Closed | Coinbase users, simple |
| **Crypto.com Pay** | 75 | ✅ 20+ | Crypto | 0% (CRO holders) | ✅ Shopify, WooCommerce | ✅ REST | ❌ Closed | Crypto.com users |
| **Utrust** | 74 | ✅ 20+ | Crypto/Fiat | 1% | ✅ Shopify, WooCommerce | ✅ REST | ❌ Closed | Global, fiat settlement |

**Legend:**
- **Crypto:** ✅ Supported (count) | ⚠️ Limited | ❌ Not supported
- **Settlement:** Crypto / Fiat / Both
- **Fees:** Percentage (may vary by volume)
- **E-Commerce:** ✅ Plugins available | ⚠️ API only | ❌ None
- **API:** ✅ Available | ❌ Not available
- **Open Source:** ✅ Full | ⚠️ Partial | ❌ Closed

---

## Proposed Scoring Methodology (0-100)

### Developer Experience (25 points)
- **API availability:** REST API (10), Webhooks (5)
- **API documentation:** Quality (5)
- **SDKs:** Available languages (3)
- **Sandbox/testnet:** Available (2)

### E-Commerce Integration (20 points)
- **Platform support:** Shopify, WooCommerce, Magento, etc. (12)
- **Custom integrations:** API flexibility (5)
- **Payment widgets:** Button/link generators (3)

### Fees & Value (15 points)
- **Transaction fees:** Low fees (10)
- **Settlement fees:** Low/no fees (3)
- **Monthly fees:** Free/low cost (2)

### Supported Assets (15 points)
- **Cryptocurrencies:** Number of assets (10)
- **Chains:** Multi-chain support (5)

### Settlement Options (10 points)
- **Settlement types:** Crypto/fiat/both (5)
- **Settlement time:** Fast settlement (3)
- **Multi-currency:** Support (2)

### Platform Features (10 points)
- **Invoicing:** Available (3)
- **Recurring payments:** Available (3)
- **Refund support:** Available (2)
- **Payment links:** Available (2)

### Security & Compliance (5 points)
- **Security audits:** Available (2)
- **PCI compliance:** Available (2)
- **Regulatory compliance:** Licenses (1)

**Score Thresholds:**
- 🟢 **80+:** Highly Recommended
- 🟡 **60-79:** Good Option
- 🔴 **<60:** Consider Alternatives

---

## Data Availability Assessment

### High Availability ✅
- Supported cryptocurrencies (public websites, APIs)
- E-commerce platform support (plugin directories, websites)
- API availability (API documentation)
- Fee structures (public websites)

### Medium Availability ⚠️
- Exact fees (often vary by volume/tier)
- Settlement times (often vary by method)
- Geographic coverage (need to verify per region)
- Regulatory compliance (need to research per jurisdiction)

### Low Availability ❌
- Exact transaction volumes (proprietary data)
- Customer support quality (subjective, need reviews)
- Internal security practices

---

## Integration Recommendations

### Data Collection
1. **Official websites** - Supported assets, fees, integrations
2. **Plugin directories** - E-commerce platform support
3. **API documentation** - Developer features
4. **GitHub** - Open source status, code quality
5. **User reviews** - Merchant experiences (subjective)

### Frontend Integration
- Add new tab: "Payment Processors" alongside other categories
- Use similar filtering/sorting as existing categories
- Add processor-specific filters (e-commerce platforms, settlement options)
- Comparison tool should work with processor data

### Data Structure
- Create `PaymentProcessor` type similar to other wallet types
- Add processor-specific fields (e-commerce integrations, settlement options)
- Extend `WalletData` union type to include `PaymentProcessor`

---

## Key Differentiators

### Payment Processors vs. On/Off-Ramps
- **Payment Processors:** Merchant-focused, e-commerce integrations, settlement options
- **On/Off-Ramps:** Individual-focused, wallet integrations, conversion services

### Payment Processors vs. Wallets
- **Payment Processors:** Accept payments, merchant tools, settlement
- **Wallets:** Store crypto, DeFi access, personal use

### Payment Processors vs. Exchanges
- **Payment Processors:** Payment acceptance, merchant services
- **Exchanges:** Trading, order books, derivatives

---

## Next Steps

1. ✅ Complete initial research (this document)
2. ⏳ Collect detailed data for top 15 payment processors
3. ⏳ Verify data from official sources
4. ⏳ Create full comparison table
5. ⏳ Implement scoring for all processors
6. ⏳ Integrate into frontend

---

## Data Sources

- Official processor websites
- Plugin directories (Shopify App Store, WooCommerce extensions, etc.)
- API documentation
- GitHub repositories (for open source status)
- User reviews (for merchant experiences)

---

*Last updated: December 16, 2025*
