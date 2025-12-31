# Category Expansion Research Summary

**Date:** December 16, 2025  
**Status:** Research Complete - Ready for Decision

---

## Executive Summary

This document consolidates research on 5 potential new categories to extend the wallet radar project beyond software wallets, hardware wallets, and crypto credit cards. Each category has been researched with 20-35+ entities identified, key metrics defined, and scoring methodologies proposed.

**Current Categories:**
1. Software Wallets (24 EVM wallets)
2. Hardware Wallets (23 cold storage devices)
3. Crypto Credit Cards (27 cards)

**Research Categories:**
1. ✅ Crypto Exchanges (35+ entities) - **HIGH PRIORITY**
2. ✅ Neo-Banks (25+ entities) - **MEDIUM PRIORITY**
3. ✅ Off-Ramps (30+ entities) - **HIGH PRIORITY** (combine with on-ramps)
4. ✅ On-Ramps (30+ entities) - **HIGH PRIORITY** (combine with off-ramps)
5. ✅ Payment Processors (20+ entities) - **MEDIUM PRIORITY**

---

## Quick Comparison Table

| Category | Entities | Priority | Data Availability | Integration Complexity | Recommendation |
|----------|----------|----------|-------------------|------------------------|----------------|
| **Exchanges** | 35+ | 🟢 High | ✅ Good | Medium | ✅ **Add** - Core infrastructure |
| **Ramp Services** (On+Off) | 30+ | 🟢 High | ✅ Good | Low-Medium | ✅ **Add** - Essential infrastructure |
| **Neo-Banks** | 25+ | 🟡 Medium | ✅ Good | Medium | ⚠️ **Consider** - Different use case |
| **Payment Processors** | 20+ | 🟡 Medium | ✅ Good | Medium | ⚠️ **Consider** - Merchant-focused |

---

## Detailed Recommendations

### 1. Crypto Exchanges ⭐ HIGH PRIORITY

**Recommendation:** ✅ **ADD THIS CATEGORY**

**Rationale:**
- **Core infrastructure:** Exchanges are fundamental to crypto ecosystem
- **Complementary:** Users need exchanges to acquire crypto for wallets
- **Developer focus:** Many exchanges have robust APIs (aligns with project focus)
- **Data availability:** Good (CoinGecko API, exchange APIs, public websites)
- **Market size:** Large, active market with clear differentiators

**Key Metrics:**
- Trading fees, volume, supported assets/chains
- Security (cold storage %, insurance, audits)
- Developer APIs (REST, WebSocket, SDKs)
- Regulatory compliance
- Open source status

**Scoring Focus:** Developer APIs (25%), Security (20%), Trading Features (15%), Asset Support (15%)

**Sample Entities:** Coinbase, Binance, Kraken, Uniswap, Curve, dYdX, GMX, Jupiter

**Integration Notes:**
- Add new tab: "Exchanges" alongside Software/Hardware/Cards
- Use CoinGecko API for trading volume data
- Exchange APIs for real-time data
- Similar filtering/sorting as existing categories

**Estimated Effort:** Medium (different data sources, but well-documented APIs)

---

### 2. Ramp Services (On-Ramp + Off-Ramp) ⭐ HIGH PRIORITY

**Recommendation:** ✅ **ADD AS UNIFIED CATEGORY**

**Rationale:**
- **Essential infrastructure:** Critical for crypto adoption (fiat ↔ crypto)
- **Significant overlap:** Most services do both on-ramp and off-ramp
- **Developer focus:** Many have excellent APIs (aligns with project focus)
- **Data availability:** Good (public websites, API docs, fee calculators)
- **User need:** Users need both capabilities, better to compare together

**Key Metrics:**
- Supported cryptocurrencies/fiat currencies
- Fees (percentage + fixed)
- Geographic coverage
- Payment methods (credit card, bank transfer, etc.)
- Processing time
- Developer APIs

**Scoring Focus:** Developer Experience (25%), Fees (20%), Payment Methods (15%), Supported Assets (15%)

**Sample Entities:** Ramp, MoonPay, Transak, Banxa, Simplex, Coinbase Pay, ChangeNOW

**Integration Notes:**
- **Combine on-ramps and off-ramps** into single "Ramp Services" category
- Add `supportsOnRamp: boolean` and `supportsOffRamp: boolean` fields
- Filters: "On-ramp only", "Off-ramp only", "Both"
- Single comparison table with both capabilities visible

**Estimated Effort:** Low-Medium (similar structure to existing categories)

---

### 3. Neo-Banks 🟡 MEDIUM PRIORITY

**Recommendation:** ⚠️ **CONSIDER - Different Use Case**

**Rationale:**
- **Different audience:** Banking services vs. wallet management
- **Complementary but distinct:** Serves different needs than wallets
- **Data availability:** Good (public websites, app stores, regulatory databases)
- **Market size:** Smaller than exchanges/ramps, but growing

**Key Metrics:**
- Crypto features (trading, storage, staking)
- Banking features (fiat accounts, debit cards)
- Fees (monthly, transaction, FX)
- Geographic availability
- Regulatory status (banking licenses)

**Scoring Focus:** Crypto Features (25%), Banking Features (20%), Fees (15%), Card Features (15%)

**Sample Entities:** Revolut, Crypto.com, Nexo, Juno, Current, Uphold

**Integration Notes:**
- Add new tab: "Neo-Banks" if added
- Different from wallets (banking vs. crypto storage)
- May appeal to different user segment

**Estimated Effort:** Medium (similar to existing categories, but different metrics)

**Decision Factors:**
- Does this align with project goals? (Developer-focused vs. consumer banking)
- Is there sufficient demand?
- Should this be separate category or integrated into existing?

---

### 4. Payment Processors 🟡 MEDIUM PRIORITY

**Recommendation:** ⚠️ **CONSIDER - Merchant-Focused**

**Rationale:**
- **Different audience:** Merchants vs. individual users
- **Complementary:** Enables crypto payments ecosystem
- **Data availability:** Good (public websites, plugin directories, API docs)
- **Market size:** Smaller but important for ecosystem

**Key Metrics:**
- Supported cryptocurrencies
- Settlement options (crypto vs fiat)
- E-commerce integrations (Shopify, WooCommerce, etc.)
- Fees
- Developer APIs

**Scoring Focus:** Developer Experience (25%), E-Commerce Integration (20%), Fees (15%), Supported Assets (15%)

**Sample Entities:** BitPay, CoinGate, BTCPay Server, NOWPayments, CoinPayments, Flexa

**Integration Notes:**
- Add new tab: "Payment Processors" if added
- Different from wallets (merchant tools vs. personal use)
- May appeal to developer/merchant segment

**Estimated Effort:** Medium (similar to existing categories)

**Decision Factors:**
- Does this align with project goals? (Developer-focused - yes, but merchant-focused)
- Is there sufficient demand?
- Should this be separate category or integrated?

---

## Prioritization Matrix

### Immediate Additions (High Priority)

1. **Crypto Exchanges** ⭐⭐⭐
   - Core infrastructure
   - Strong developer focus
   - Good data availability
   - Large market

2. **Ramp Services** (On+Off) ⭐⭐⭐
   - Essential infrastructure
   - Strong developer focus
   - Good data availability
   - High user demand

### Consider for Future (Medium Priority)

3. **Neo-Banks** ⭐⭐
   - Different use case (banking vs. wallets)
   - Good data availability
   - Growing market
   - May appeal to different segment

4. **Payment Processors** ⭐⭐
   - Different audience (merchants vs. users)
   - Good data availability
   - Important for ecosystem
   - May appeal to developer segment

---

## Implementation Roadmap

### Phase 1: High Priority Categories (Recommended)

**Week 1-2: Exchanges**
- Collect detailed data for top 20 exchanges
- Verify data from official sources
- Create full comparison table
- Implement scoring
- Integrate into frontend

**Week 3-4: Ramp Services**
- Combine on-ramp and off-ramp research
- Collect detailed data for top 20 services
- Verify data from official sources
- Create unified comparison table
- Implement scoring
- Integrate into frontend

### Phase 2: Medium Priority Categories (Optional)

**Week 5-6: Neo-Banks** (if approved)
- Collect detailed data for top 15 neo-banks
- Verify data from official sources
- Create comparison table
- Implement scoring
- Integrate into frontend

**Week 7-8: Payment Processors** (if approved)
- Collect detailed data for top 15 processors
- Verify data from official sources
- Create comparison table
- Implement scoring
- Integrate into frontend

---

## Data Sources Summary

### Exchanges
- CoinGecko API (trading volume, fees)
- Exchange APIs (real-time data, supported assets)
- Official websites (fees, features)
- GitHub (open source status)
- App stores (mobile apps)

### Ramp Services
- Official websites (fees, supported assets, regions)
- API documentation (integration methods)
- Fee calculators (if available)
- User reviews (processing times)
- Regulatory databases (compliance)

### Neo-Banks
- Official websites (account types, fees, features)
- App stores (mobile apps)
- Regulatory databases (banking licenses)
- API documentation (developer features)
- News articles (regulatory status)

### Payment Processors
- Official websites (fees, integrations)
- Plugin directories (e-commerce platform support)
- API documentation (developer features)
- GitHub (open source status)
- User reviews (merchant experiences)

---

## Scoring Methodology Summary

All categories use 0-100 scoring with similar structure:

- **Developer Experience:** 20-25 points (APIs, documentation, SDKs)
- **Core Features:** 15-25 points (varies by category)
- **Fees/Value:** 15-20 points (low fees, good value)
- **Supported Assets:** 10-15 points (cryptocurrencies, fiat, chains)
- **Platform Quality:** 10-15 points (mobile apps, features)
- **Security/Compliance:** 5-10 points (audits, licenses)

**Score Thresholds:**
- 🟢 **80+:** Highly Recommended
- 🟡 **60-79:** Good Option
- 🔴 **<60:** Consider Alternatives

---

## Key Insights

### 1. Exchanges and Ramp Services are Natural Extensions
- Both are core infrastructure
- Both have strong developer focus
- Both complement wallets well
- Both have good data availability

### 2. On-Ramps and Off-Ramps Should Be Combined
- Significant overlap (most services do both)
- Better user experience (users need both)
- Simpler implementation (one category vs. two)
- Easier to compare services

### 3. Neo-Banks and Payment Processors Serve Different Audiences
- Neo-banks: Consumer banking (different from wallets)
- Payment processors: Merchants (different from individual users)
- May appeal to different segments
- Consider if project should expand beyond developer/individual focus

### 4. Data Availability is Good Across All Categories
- Public websites provide most data
- APIs available for exchanges and ramps
- Regulatory databases for compliance info
- Some gaps (exact fees vary, processing times vary)

---

## Next Steps

1. ✅ **Research complete** (this document)
2. ⏳ **Review recommendations** with stakeholders
3. ⏳ **Prioritize categories** based on project goals
4. ⏳ **Begin implementation** for high-priority categories
5. ⏳ **Collect detailed data** for selected categories
6. ⏳ **Integrate into frontend** following existing patterns

---

## Research Documents

Detailed research for each category:
- [Exchange Research](./.cursor/artifacts/EXCHANGE_RESEARCH.md)
- [Neo-Bank Research](./.cursor/artifacts/NEOBANK_RESEARCH.md)
- [Off-Ramp Research](./.cursor/artifacts/OFFRAMP_RESEARCH.md)
- [On-Ramp Research](./.cursor/artifacts/ONRAMP_RESEARCH.md)
- [Payment Processor Research](./.cursor/artifacts/PAYMENT_PROCESSOR_RESEARCH.md)

Agent prompts and research plan:
- [Research Plan](./CATEGORY_EXPANSION_RESEARCH.md)
- [Agent Prompts](./.cursor/artifacts/agent-prompts.md)

---

*Last updated: December 16, 2025*
