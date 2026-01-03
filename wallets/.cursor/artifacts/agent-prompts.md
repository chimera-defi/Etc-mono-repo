# Agent Prompts for Category Expansion Research

This document contains prompts for child agents to research specific categories for the wallet radar expansion.

---

## Agent 1: Crypto Exchanges Research

**Task:** Research crypto exchanges (both centralized and decentralized) to determine if this category should be added to the wallet radar project.

**Context:**
- Current project compares: Software wallets (24), Hardware wallets (23), Crypto credit cards (27)
- Project focuses on developer/user decision-making with scoring methodology (0-100)
- Data sources: GitHub, official websites, APIs, documentation

**Research Goals:**
1. Identify 30+ crypto exchanges (mix of CEX and DEX)
2. Define key metrics for comparison (fees, security, APIs, etc.)
3. Assess data availability (can we get reliable data?)
4. Propose scoring methodology
5. Identify top 10-15 entities with complete data

**Key Metrics to Research:**
- Trading fees (maker/taker, spot/futures)
- Supported chains/assets count
- Security features (2FA, cold storage %, insurance coverage)
- Regulatory compliance (licenses, jurisdictions)
- KYC requirements (none/optional/required)
- Trading volume (24h, 30d)
- Developer APIs (REST, WebSocket, SDKs)
- Open source status (full/partial/closed)
- Funding/backing (VC, exchange token, etc.)
- Geographic availability
- Mobile apps (iOS/Android)
- Customer support quality

**Entities to Research (Start with these, expand as needed):**
- CEX: Coinbase, Binance, Kraken, Gemini, Crypto.com, OKX, Bybit, KuCoin, Gate.io, Bitfinex, Bitstamp, BitMEX, Deribit, MEXC, HTX (Huobi)
- DEX: Uniswap, Curve, Balancer, PancakeSwap, SushiSwap, dYdX, GMX, Jupiter, Raydium, Orca, 1inch, Matcha, CowSwap

**Data Sources:**
- Official exchange websites
- CoinGecko API (for trading volume, fees)
- Exchange APIs (for technical features)
- GitHub repos (for open source status)
- Regulatory databases (for licenses)
- News articles (for funding, security incidents)

**Deliverables:**
1. Markdown document: `EXCHANGE_RESEARCH.md` with:
   - Entity list (30+ exchanges)
   - Key metrics table (sample data for 10-15 exchanges)
   - Scoring methodology proposal
   - Data availability assessment
   - Integration recommendations
2. Sample comparison table (similar to WALLET_COMPARISON_UNIFIED.md format)

**Constraints:**
- Focus on exchanges that are actively trading (not defunct)
- Prioritize exchanges with developer APIs
- Consider both retail and institutional use cases
- Be honest about data gaps (mark as "verify" or "unknown")

**Output Location:** `/workspace/wallets/.cursor/artifacts/EXCHANGE_RESEARCH.md`

---

## Agent 2: Neo-Banks Research

**Task:** Research crypto-friendly neo-banks to determine if this category should be added to the wallet radar project.

**Context:**
- Current project compares: Software wallets (24), Hardware wallets (23), Crypto credit cards (27)
- Project focuses on developer/user decision-making with scoring methodology (0-100)
- Neo-banks bridge traditional banking and crypto

**Research Goals:**
1. Identify 20+ crypto-friendly neo-banks
2. Define key metrics for comparison
3. Assess data availability
4. Propose scoring methodology
5. Identify top 10-15 entities with complete data

**Key Metrics to Research:**
- Account types (personal/business)
- Supported cryptocurrencies (count and types)
- Supported fiat currencies
- Geographic availability (countries/regions)
- Monthly fees
- Transaction fees (domestic/international)
- FX fees
- Interest rates (crypto/fiat)
- Debit card availability (physical/virtual)
- Card rewards/cashback
- ATM withdrawal limits/fees
- Integration with DeFi protocols
- Developer APIs
- Regulatory status (banking licenses)
- Funding/backing
- Mobile apps (iOS/Android)
- Customer support

**Entities to Research (Start with these, expand as needed):**
- Revolut, N26, Chime, Monzo, Starling, Varo, Current, Mercury, Brex, Ramp, MoonPay, Wyre, Transak, Banxa, Juno, Crypto.com (banking), Nexo (banking), Celsius (defunct), BlockFi (defunct), Gemini (banking), Coinbase (banking features)

**Data Sources:**
- Official neo-bank websites
- App store listings (for mobile apps)
- Regulatory databases (for banking licenses)
- News articles (for funding, regulatory status)
- User reviews (for customer support quality)

**Deliverables:**
1. Markdown document: `NEOBANK_RESEARCH.md` with:
   - Entity list (20+ neo-banks)
   - Key metrics table (sample data for 10-15 neo-banks)
   - Scoring methodology proposal
   - Data availability assessment
   - Integration recommendations
2. Sample comparison table

**Constraints:**
- Focus on actively operating neo-banks (not defunct)
- Distinguish between full banking licenses vs. e-money licenses
- Consider both personal and business use cases
- Be honest about data gaps

**Output Location:** `/workspace/wallets/.cursor/artifacts/NEOBANK_RESEARCH.md`

---

## Agent 3: Off-Ramps Research

**Task:** Research crypto-to-fiat off-ramp services to determine if this category should be added to the wallet radar project.

**Context:**
- Current project compares: Software wallets (24), Hardware wallets (23), Crypto credit cards (27)
- Off-ramps are critical for users to convert crypto to fiat
- Many wallets integrate off-ramp services

**Research Goals:**
1. Identify 25+ off-ramp services
2. Define key metrics for comparison
3. Assess data availability
4. Propose scoring methodology
5. Identify top 10-15 entities with complete data

**Key Metrics to Research:**
- Supported cryptocurrencies (count and types)
- Supported fiat currencies
- Supported regions/countries
- Fees (percentage + fixed fees)
- Limits (daily/monthly minimum/maximum)
- Processing time (instant/same-day/next-day)
- Payment methods (bank transfer, ACH, SEPA, wire, etc.)
- KYC requirements (none/optional/required)
- Integration methods (API, widget, SDK)
- Developer documentation quality
- Settlement options (crypto vs fiat)
- Mobile apps (iOS/Android)
- Customer support
- Regulatory compliance

**Entities to Research (Start with these, expand as needed):**
- Ramp, MoonPay, Wyre, Transak, Banxa, Coinbase Pay, PayPal, Stripe (crypto), BitPay, CoinGate, BTCPay Server, Simplex, Mercuryo, Guardarian, ChangeNOW, ChangeHero, StealthEX, Godex, SimpleSwap, etc.

**Data Sources:**
- Official service websites
- API documentation (for integration methods)
- Fee calculators (if available)
- User reviews (for processing time, support)
- Regulatory databases (for compliance)

**Deliverables:**
1. Markdown document: `OFFRAMP_RESEARCH.md` with:
   - Entity list (25+ off-ramps)
   - Key metrics table (sample data for 10-15 off-ramps)
   - Scoring methodology proposal
   - Data availability assessment
   - Integration recommendations
2. Sample comparison table

**Constraints:**
- Focus on services that are actively operating
- Prioritize services with developer APIs
- Consider both individual and business use cases
- Be honest about data gaps (fees often vary by region/amount)

**Output Location:** `/workspace/wallets/.cursor/artifacts/OFFRAMP_RESEARCH.md`

---

## Agent 4: On-Ramps Research

**Task:** Research fiat-to-crypto on-ramp services to determine if this category should be added to the wallet radar project.

**Context:**
- Current project compares: Software wallets (24), Hardware wallets (23), Crypto credit cards (27)
- On-ramps are critical for users to convert fiat to crypto
- Many wallets integrate on-ramp services
- Note: There's significant overlap with off-ramps (many services do both)

**Research Goals:**
1. Identify 25+ on-ramp services
2. Define key metrics for comparison
3. Assess data availability
4. Propose scoring methodology
5. Identify top 10-15 entities with complete data
6. Note overlap with off-ramps

**Key Metrics to Research:**
- Supported fiat currencies
- Supported cryptocurrencies (count and types)
- Supported regions/countries
- Fees (percentage + fixed fees)
- Limits (daily/monthly minimum/maximum)
- Processing time (instant/same-day/next-day)
- Payment methods (credit card, debit card, bank transfer, ACH, SEPA, wire, Apple Pay, Google Pay, etc.)
- KYC requirements (none/optional/required)
- Integration methods (API, widget, SDK)
- Developer documentation quality
- Mobile apps (iOS/Android)
- Customer support
- Regulatory compliance
- Also supports off-ramp? (yes/no)

**Entities to Research (Start with these, expand as needed):**
- Ramp, MoonPay, Wyre, Transak, Banxa, Coinbase Pay, Simplex, Mercuryo, CoinGate, BTCPay Server, Guardarian, ChangeNOW, ChangeHero, StealthEX, Godex, SimpleSwap, etc.

**Data Sources:**
- Official service websites
- API documentation (for integration methods)
- Fee calculators (if available)
- User reviews (for processing time, support)
- Regulatory databases (for compliance)

**Deliverables:**
1. Markdown document: `ONRAMP_RESEARCH.md` with:
   - Entity list (25+ on-ramps)
   - Key metrics table (sample data for 10-15 on-ramps)
   - Scoring methodology proposal
   - Data availability assessment
   - Integration recommendations
   - Note on overlap with off-ramps
2. Sample comparison table

**Constraints:**
- Focus on services that are actively operating
- Prioritize services with developer APIs
- Consider both individual and business use cases
- Be honest about data gaps (fees often vary by region/amount)
- Note which services also do off-ramps (could be combined category)

**Output Location:** `/workspace/wallets/.cursor/artifacts/ONRAMP_RESEARCH.md`

---

## Agent 5: Payment Processors Research

**Task:** Research crypto payment processors (merchant services) to determine if this category should be added to the wallet radar project.

**Context:**
- Current project compares: Software wallets (24), Hardware wallets (23), Crypto credit cards (27)
- Payment processors enable merchants to accept crypto payments
- Different from on/off-ramps (focus on merchant acceptance)

**Research Goals:**
1. Identify 20+ crypto payment processors
2. Define key metrics for comparison
3. Assess data availability
4. Propose scoring methodology
5. Identify top 10-15 entities with complete data

**Key Metrics to Research:**
- Supported cryptocurrencies (count and types)
- Supported fiat currencies
- Settlement options (crypto vs fiat, automatic conversion)
- Fees (percentage + fixed fees)
- Integration methods (API, plugins, widgets)
- Supported e-commerce platforms (Shopify, WooCommerce, Magento, etc.)
- Developer documentation quality
- Settlement time
- Chargeback protection
- Geographic availability
- Minimum transaction amounts
- Mobile apps (iOS/Android)
- Customer support
- Regulatory compliance

**Entities to Research (Start with these, expand as needed):**
- BitPay, CoinGate, BTCPay Server, NOWPayments, CoinPayments, Flexa, Strike, Coinbase Commerce, Crypto.com Pay, Utrust, PumaPay, Request Network, etc.

**Data Sources:**
- Official service websites
- API documentation (for integration methods)
- Plugin directories (for e-commerce platform support)
- User reviews (for settlement time, support)
- Regulatory databases (for compliance)

**Deliverables:**
1. Markdown document: `PAYMENT_PROCESSOR_RESEARCH.md` with:
   - Entity list (20+ payment processors)
   - Key metrics table (sample data for 10-15 processors)
   - Scoring methodology proposal
   - Data availability assessment
   - Integration recommendations
2. Sample comparison table

**Constraints:**
- Focus on services that are actively operating
- Prioritize services with developer APIs/plugins
- Consider both small merchants and enterprise use cases
- Be honest about data gaps
- Distinguish from on/off-ramps (merchant-focused)

**Output Location:** `/workspace/wallets/.cursor/artifacts/PAYMENT_PROCESSOR_RESEARCH.md`

---

## General Instructions for All Agents

1. **Follow existing patterns:** Look at `WALLET_COMPARISON_UNIFIED.md`, `HARDWARE_WALLET_COMPARISON.md`, and `CRYPTO_CREDIT_CARD_COMPARISON.md` for structure and format
2. **Be thorough but honest:** If data isn't available, mark as "verify" or "unknown" rather than guessing
3. **Cite sources:** Include data sources and verification dates
4. **Think about scoring:** Propose a 0-100 scoring methodology similar to existing categories
5. **Consider integration:** Think about how this category would fit into the existing frontend structure
6. **Developer focus:** Remember the project has a developer/user decision-making focus

---

*Created: December 16, 2025*
