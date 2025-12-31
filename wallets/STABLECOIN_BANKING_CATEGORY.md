# Stablecoin Banking Services Category

**Category:** Stablecoin Banking Services  
**Status:** Proposed - Research Complete  
**Date:** December 16, 2025

---

## Category Definition

**Stablecoin Banking Services** are mobile-first platforms that enable P2P payments, remittances, and bank withdrawals using stablecoins/crypto, bridging crypto and traditional banking systems.

### Key Characteristics (All Required)

1. ✅ **Stablecoin/crypto support** - Uses USDC, USDT, or similar stablecoins
2. ✅ **Bank withdrawal** - Off-ramp to local fiat currency (REQUIRED - key differentiator)
3. ✅ **P2P payments** - Send/receive money peer-to-peer
4. ✅ **Mobile apps** - iOS and/or Android apps
5. ✅ **Regional focus** - Often country-specific (e.g., Argentina)

### Optional Features (Differentiators)

- Debit cards (physical/virtual)
- Exchange features (trading)
- DeFi features (staking, yield)
- Cross-border remittances
- QR code payments

---

## Why This Category?

### Distinct from Other Categories

| Category | Key Difference |
|----------|---------------|
| **Software Wallets** | Wallets don't have bank withdrawal integration |
| **Hardware Wallets** | Hardware storage, no bank integration |
| **Crypto Credit Cards** | Cards for spending, not bank withdrawals |
| **Exchanges** | Trading focus, not payment/remittance focus |
| **On-Ramps** | Pure fiat→crypto conversion, no wallet/payment features |
| **Off-Ramps** | Pure crypto→fiat conversion, no wallet/payment features |
| **Neo-Banks** | Full banking licenses, fiat-first (not crypto-first) |
| **Payment Processors** | Merchant-focused, not consumer P2P |

### Key Differentiator: Bank Withdrawal

The **bank withdrawal (off-ramp)** capability is what makes these "banking services" rather than just wallets or payment apps. This bridges crypto and traditional banking.

---

## Sample Entities (Argentina Focus)

| Service | Stablecoins | Bank Withdrawal | P2P | Debit Card | Exchange | Mobile | Region |
|---------|-------------|-----------------|-----|------------|----------|--------|--------|
| **Peanut** | ✅ USDC/USDT | ✅ ARS | ✅ Yes | ❌ No | ❌ No | ✅ Yes | 🇦🇷 Argentina |
| **Lemon Cash** | ✅ Yes | ✅ ARS | ✅ Yes | ✅ VISA | ⚠️ Limited | ✅ Yes | 🇦🇷 Argentina |
| **Belo** | ✅ Yes | ✅ ARS | ✅ Yes | ❌ No | ⚠️ Limited | ✅ Yes | 🇦🇷🇧🇷 Argentina/Brazil |
| **Ripio** | ✅ Yes | ✅ ARS | ✅ Yes | ✅ VISA | ✅ Yes | ✅ Yes | 🇦🇷🇧🇷 Latin America |
| **Buenbit** | ✅ USDC | ✅ ARS | ✅ Yes | ⚠️ Verify | ✅ Yes | ✅ Yes | 🇦🇷 Argentina |

---

## Key Metrics for Comparison

### Core Features (Required)
- **Supported stablecoins:** USDC, USDT, DAI, etc.
- **Bank withdrawal:** Supported countries, currencies, processing time
- **P2P payments:** Send/receive capabilities, QR codes
- **Mobile apps:** iOS, Android availability

### Optional Features (Differentiators)
- **Debit cards:** Physical/virtual, card type (VISA/Mastercard)
- **Exchange features:** Trading, supported assets
- **DeFi features:** Staking, yield farming
- **Remittances:** Cross-border capabilities

### Fees & Limits
- **Send fees:** P2P transfer fees
- **Withdrawal fees:** Bank withdrawal fees
- **Limits:** Daily/monthly limits
- **Processing time:** Withdrawal processing time

### Geographic Coverage
- **Primary regions:** Countries of focus
- **Bank withdrawal:** Supported countries/currencies
- **Regulatory status:** Licenses, compliance

---

## Proposed Scoring Methodology (0-100)

### Bank Integration (25 points)
- **Bank withdrawal:** Available, countries supported (15)
- **Processing time:** Fast withdrawals (5)
- **Withdrawal fees:** Low fees (5)

### Stablecoin Features (20 points)
- **Supported stablecoins:** Number and types (10)
- **P2P payments:** Send/receive features (5)
- **Remittances:** Cross-border capabilities (5)

### Platform Quality (15 points)
- **Mobile apps:** iOS/Android (10)
- **User experience:** Interface quality (5)

### Fees & Value (15 points)
- **Send fees:** Low fees (5)
- **Withdrawal fees:** Low fees (5)
- **Limits:** Reasonable limits (5)

### Additional Features (15 points)
- **Debit cards:** Available (5)
- **Exchange features:** Trading available (5)
- **DeFi features:** Staking/yield (5)

### Security & Compliance (10 points)
- **Regulatory compliance:** Licenses (5)
- **Security:** Audits, insurance (5)

**Score Thresholds:**
- 🟢 **80+:** Highly Recommended
- 🟡 **60-79:** Good Option
- 🔴 **<60:** Consider Alternatives

---

## Integration Recommendations

### Data Collection
1. **Official websites** - Features, fees, supported countries
2. **App stores** - Mobile app availability
3. **Regulatory databases** - Licenses per jurisdiction
4. **User reviews** - Processing times, support quality

### Frontend Integration
- Add new tab: "Stablecoin Banking" alongside Software/Hardware/Cards
- Use similar filtering/sorting as existing categories
- Add category-specific filters (bank withdrawal countries, debit cards)
- Comparison tool should work with banking service data

### Data Structure
- Create `StablecoinBankingService` type
- Add banking-specific fields (bank withdrawal, debit cards, regional focus)
- Extend `WalletData` union type to include `StablecoinBankingService`

---

## Research Status

✅ **Competitor research complete** - 5+ Argentina-focused services identified  
✅ **Category definition complete** - Clear definition and requirements  
✅ **Peanut fit confirmed** - Peanut fits category perfectly  
⏳ **Full comparison table** - Pending detailed data collection  
⏳ **Scoring implementation** - Pending full data

---

## Next Steps

1. ✅ Complete category definition (this document)
2. ⏳ Collect detailed data for top 10 services
3. ⏳ Verify data from official sources
4. ⏳ Create full comparison table
5. ⏳ Implement scoring for all services
6. ⏳ Integrate into frontend

---

*Last updated: December 16, 2025*
