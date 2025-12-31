# Peanut Category Research - Consolidated

**Date:** December 16, 2025  
**Question:** What category does Peanut (peanut.me) and similar services belong to?

---

## Service Overview

**Peanut:** Argentina-focused P2P payment app
- QR code payments (like UPI in India)
- Stablecoin-based (USDC/USDT)
- Bank withdrawal (off-ramp to ARS)
- Mobile app

**Key Insight:** QR code payments + stablecoins + bank payout = Payment network (like UPI but crypto-based)

---

## Category Analysis

### Option 1: "Payment Processors" ❌
**Why not:** Payment processors are merchant-focused (BitPay, CoinGate accept payments for merchants). Peanut is consumer P2P payment network.

### Option 2: "Stablecoin Banking Services" ❌
**Why not:** "Banking" implies accounts, cards, full banking features. These are payment networks, not banks.

### Option 3: "Stablecoin Payment Networks" ✅ **RECOMMENDED**
**Why yes:** 
- QR code payments (like UPI)
- P2P instant transfers
- Network effect (users pay each other)
- Stablecoin-based (vs UPI's fiat)
- Bank integration for payouts

**Comparison to UPI:**
- **UPI (India):** Fiat → QR scan → Instant payment
- **Peanut:** Stablecoin → QR scan → Instant payment → Bank payout

**Key Difference:** Starts with stablecoins, ends with bank payout (bridges crypto ↔ fiat)

---

## Competitors (Argentina)

1. **Peanut** - QR payments, stablecoins, bank withdrawal
2. **Lemon Cash** - QR payments, crypto, VISA card, bank withdrawal
3. **Belo** - QR payments, crypto, bank withdrawal
4. **Ripio** - QR payments, crypto, VISA card, bank withdrawal
5. **Buenbit** - QR payments, USDC, bank withdrawal

**Common features:**
- QR code payments (like UPI)
- Stablecoin/crypto support
- Bank withdrawal (off-ramp)
- Mobile apps
- Argentina focus

---

## Category Definition: "Stablecoin Payment Networks"

**Definition:** Mobile-first P2P payment networks that enable instant QR code payments using stablecoins, with bank withdrawal capabilities for converting to local fiat. Similar to UPI (India) but crypto-based.

**Key Characteristics:**
1. ✅ QR code payments (like UPI)
2. ✅ Stablecoin-based (USDC/USDT)
3. ✅ Instant P2P transfers
4. ✅ Bank withdrawal (off-ramp) - REQUIRED
5. ✅ Mobile apps
6. ✅ Regional focus

**Distinct from:**
- ❌ Payment Processors (merchant-focused, not P2P networks)
- ❌ Wallets (no bank integration)
- ❌ Exchanges (trading-focused)
- ❌ Neo-Banks (full banking licenses, fiat-first)
- ❌ On-Ramps (pure fiat→crypto, no payment network)

---

## Key Metrics

- **QR code payments:** Support, instant transfers
- **Supported stablecoins:** USDC, USDT, etc.
- **Bank withdrawal:** Countries, currencies, processing time
- **P2P transfer speed:** Instant/same-day
- **Fees:** Send fees, withdrawal fees
- **Mobile apps:** iOS, Android
- **Geographic coverage:** Primary regions

---

## Final Recommendation

**Category:** **"Stablecoin Payment Networks"**

**Rationale:**
- ✅ Captures QR code payment nature (like UPI)
- ✅ Emphasizes network effect (P2P)
- ✅ Stablecoin focus
- ✅ Bank integration for payouts
- ✅ Clear distinction from payment processors (merchant-focused)

**Why not "Payment Processors"?**
- Payment processors = merchant acceptance (BitPay, CoinGate)
- These = consumer P2P networks (like UPI, Venmo, but crypto-based)

**Why not "Stablecoin Banking Services"?**
- "Banking" implies full banking features (accounts, cards, loans)
- These are payment networks with bank payout capability

---

## Next Steps

1. ✅ Category defined: "Stablecoin Payment Networks"
2. ✅ Metrics and scoring methodology defined (see STABLECOIN_PAYMENT_NETWORKS_METRICS.md)
3. ✅ TypeScript types created (see STABLECOIN_PAYMENT_NETWORKS_TYPE.ts)
4. ⏳ Collect detailed data for 5-10 services
5. ⏳ Create comparison table
6. ⏳ Integrate into frontend

---

## Related Documents

- **Metrics & Scoring:** STABLECOIN_PAYMENT_NETWORKS_METRICS.md
- **TypeScript Types:** STABLECOIN_PAYMENT_NETWORKS_TYPE.ts
- **Summary:** STABLECOIN_PAYMENT_NETWORKS_SUMMARY.md

---

*Consolidated research - category decision: "Stablecoin Payment Networks" - Metrics defined*
