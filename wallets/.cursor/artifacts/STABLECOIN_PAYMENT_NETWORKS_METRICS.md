# Stablecoin Payment Networks - Metrics & Scoring

**Category:** Stablecoin Payment Networks  
**Date:** December 16, 2025  
**Status:** Metrics Defined - Ready for Implementation

---

## Category Definition

**Stablecoin Payment Networks:** Mobile-first P2P payment networks that enable instant QR code payments using stablecoins, with bank withdrawal capabilities. Similar to UPI (India) but crypto-based.

**Required Features:**
1. QR code payments
2. Stablecoin-based (USDC/USDT)
3. Instant P2P transfers
4. Bank withdrawal (off-ramp) - REQUIRED
5. Mobile apps

---

## Key Metrics

### Core Payment Features (Required)

| Metric | Description | Values |
|--------|-------------|--------|
| **QR Code Payments** | Support for QR code scanning | ✅ Yes / ❌ No |
| **Supported Stablecoins** | Which stablecoins supported | USDC, USDT, DAI, etc. |
| **P2P Transfer Speed** | Time for peer-to-peer transfers | Instant / Same-day / Next-day |
| **Bank Withdrawal** | Off-ramp to local fiat | ✅ Yes / ❌ No |
| **Withdrawal Currencies** | Supported fiat currencies | ARS, USD, BRL, etc. |
| **Withdrawal Time** | Processing time for bank withdrawals | Instant / Same-day / 1-3 days |
| **Mobile Apps** | iOS/Android availability | ✅ Both / ⚠️ One / ❌ None |

### Fees & Limits

| Metric | Description | Values |
|--------|-------------|--------|
| **Send Fees** | Fee for P2P transfers | % + fixed fee |
| **Withdrawal Fees** | Fee for bank withdrawals | % + fixed fee |
| **Daily Limits** | Maximum daily transaction limits | Amount in local currency |
| **Monthly Limits** | Maximum monthly transaction limits | Amount in local currency |

### Geographic Coverage

| Metric | Description | Values |
|--------|-------------|--------|
| **Primary Region** | Main country/region focus | Argentina, Brazil, Global, etc. |
| **Supported Countries** | Countries where service operates | List of countries |
| **Bank Withdrawal Countries** | Countries with bank withdrawal support | List of countries |

### Additional Features (Optional)

| Metric | Description | Values |
|--------|-------------|--------|
| **Debit Card** | Physical/virtual debit card | ✅ Yes / ❌ No |
| **Exchange Features** | Crypto trading capabilities | ✅ Yes / ❌ No |
| **DeFi Features** | Staking, yield farming | ✅ Yes / ❌ No |
| **Cross-Border Remittances** | International transfer support | ✅ Yes / ❌ No |
| **Bill Payments** | Utility bill payments | ✅ Yes / ❌ No |

### Developer Experience

| Metric | Description | Values |
|--------|-------------|--------|
| **API Availability** | REST API, Webhooks | ✅ Yes / ❌ No |
| **API Documentation** | Quality of developer docs | Good / Fair / Poor |
| **SDKs** | Available languages | JavaScript, Python, etc. |

### Security & Compliance

| Metric | Description | Values |
|--------|-------------|--------|
| **Regulatory Compliance** | Licenses, registrations | List of licenses |
| **Security Audits** | Recent audit reports | ✅ Yes / ❌ No |
| **KYC Requirements** | Know Your Customer requirements | None / Optional / Required |

---

## Scoring Methodology (0-100)

### Payment Features (30 points)
- **QR Code Payments:** ✅ Yes (10) / ❌ No (0)
- **P2P Transfer Speed:** Instant (10) / Same-day (5) / Next-day (0)
- **Supported Stablecoins:** 3+ (5) / 1-2 (3) / None (0)
- **Cross-Border Remittances:** ✅ Yes (5) / ❌ No (0)

### Bank Integration (25 points) - REQUIRED
- **Bank Withdrawal:** ✅ Yes (15) / ❌ No (0) - **MUST HAVE**
- **Withdrawal Speed:** Instant (5) / Same-day (3) / 1-3 days (0)
- **Withdrawal Currencies:** 3+ (5) / 1-2 (3) / None (0)

### Fees & Value (20 points)
- **Send Fees:** <1% (10) / 1-2% (5) / >2% (0)
- **Withdrawal Fees:** <2% (5) / 2-5% (3) / >5% (0)
- **Limits:** Reasonable limits (5) / Low limits (2) / Very low (0)

### Platform Quality (15 points)
- **Mobile Apps:** Both iOS+Android (10) / One platform (5) / None (0)
- **User Experience:** Good (5) / Fair (2) / Poor (0)

### Additional Features (10 points)
- **Debit Card:** ✅ Yes (3) / ❌ No (0)
- **Exchange Features:** ✅ Yes (2) / ❌ No (0)
- **DeFi Features:** ✅ Yes (2) / ❌ No (0)
- **Bill Payments:** ✅ Yes (3) / ❌ No (0)

**Score Thresholds:**
- 🟢 **80+:** Highly Recommended
- 🟡 **60-79:** Good Option
- 🔴 **<60:** Consider Alternatives

**Note:** Services without bank withdrawal automatically score <60 (missing required feature).

---

## Sample Comparison Table

| Service | Score | QR | Stablecoins | P2P Speed | Bank Withdraw | Withdraw Time | Send Fee | Withdraw Fee | Mobile | Debit Card | Region |
|---------|-------|----|-------------|-----------|---------------|---------------|----------|--------------|--------|------------|--------|
| **Peanut** | 85 | ✅ | USDC/USDT | Instant | ✅ ARS | Same-day | <1% | ~2% | ✅ Both | ❌ | 🇦🇷 Argentina |
| **Lemon Cash** | 88 | ✅ | Multi | Instant | ✅ ARS | Same-day | <1% | ~2% | ✅ Both | ✅ VISA | 🇦🇷 Argentina |
| **Belo** | 82 | ✅ | Multi | Instant | ✅ ARS | Same-day | <1% | ~2% | ✅ Both | ❌ | 🇦🇷🇧🇷 Argentina/Brazil |
| **Ripio** | 85 | ✅ | Multi | Instant | ✅ ARS | Same-day | <1% | ~2% | ✅ Both | ✅ VISA | 🇦🇷🇧🇷 Latin America |
| **Buenbit** | 80 | ✅ | USDC | Instant | ✅ ARS | Same-day | <1% | ~2% | ✅ Both | ❌ | 🇦🇷 Argentina |

**Legend:**
- **QR:** QR code payments
- **Stablecoins:** Supported stablecoins
- **P2P Speed:** Peer-to-peer transfer speed
- **Bank Withdraw:** Bank withdrawal support
- **Withdraw Time:** Bank withdrawal processing time
- **Send Fee:** P2P transfer fee
- **Withdraw Fee:** Bank withdrawal fee
- **Mobile:** Mobile app availability
- **Debit Card:** Debit card availability
- **Region:** Primary geographic focus

---

## Data Collection Sources

1. **Official websites** - Features, fees, supported countries
2. **App stores** - Mobile app availability (iOS App Store, Google Play)
3. **User reviews** - Processing times, support quality
4. **Regulatory databases** - Licenses per jurisdiction
5. **API documentation** - Developer features (if available)

---

## Implementation Notes

### Required Fields
- `qrPayments: boolean`
- `supportedStablecoins: string[]`
- `p2pSpeed: 'instant' | 'same-day' | 'next-day'`
- `bankWithdrawal: boolean` - REQUIRED
- `withdrawalCurrencies: string[]`
- `withdrawalTime: 'instant' | 'same-day' | '1-3-days'`
- `mobileApps: { ios: boolean, android: boolean }`

### Optional Fields
- `sendFee: { percentage: number, fixed: number }`
- `withdrawalFee: { percentage: number, fixed: number }`
- `dailyLimit: number`
- `monthlyLimit: number`
- `debitCard: boolean`
- `exchangeFeatures: boolean`
- `defiFeatures: boolean`
- `crossBorderRemittances: boolean`
- `billPayments: boolean`
- `apiAvailable: boolean`
- `regulatoryCompliance: string[]`

---

## Next Steps

1. ✅ Metrics defined (this document)
2. ✅ Scoring methodology defined
3. ⏳ Collect detailed data for 5-10 services
4. ⏳ Verify data from official sources
5. ⏳ Create full comparison table
6. ⏳ Implement scoring for all services
7. ⏳ Add to frontend (new tab: "Stablecoin Payment Networks")

---

*Ready for data collection and implementation*
