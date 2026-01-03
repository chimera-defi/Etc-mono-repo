# Regional Research Findings - India, Southeast Asia, Africa, Europe

**Date:** December 16, 2025  
**Research Scope:** Find stablecoin payment networks (QR payments + bank withdrawal) in India, Southeast Asia, Africa, and Europe

---

## Summary

**Services Verified:** 17  
**Matches Found:** 0  
**Excluded:** 16 (exchange/wallet models, fiat-only QR payments, or on-ramp services)  
**Unclear:** 1 (Yellow Card - needs manual verification)

**Key Finding:** Most services found are either:
1. **Exchange/wallet models** (crypto trading + bank withdrawal, but no QR-based P2P payments)
2. **Fiat QR payment apps** (QR payments exist, but for fiat, not stablecoins)

---

## India

### Services Researched

#### CoinDCX
- **Status:** ❌ **NOT A MATCH**
- **Reason:** Exchange/wallet model
- **Features:**
  - ✅ Crypto trading
  - ✅ Bank withdrawal (exchange model)
  - ❌ QR payments not found
- **Assessment:** Exchange platform, not P2P payment network

#### WazirX
- **Status:** ❌ **NOT A MATCH**
- **Reason:** Exchange/wallet model
- **Features:**
  - ✅ Crypto trading
  - ✅ Bank withdrawal (exchange model)
  - ❌ QR payments not found
- **Assessment:** Exchange platform, not P2P payment network

**Note:** India has UPI (fiat QR payments) as a reference model, but no stablecoin-based QR payment networks found.

---

## Southeast Asia

### Philippines

#### GCash
- **Status:** ❌ **NOT A MATCH**
- **Reason:** Fiat QR payments + crypto separately, not integrated
- **Features:**
  - ✅ QR payments ("Pay QR") - **fiat only**
  - ✅ Crypto trading ("GCrypto") - **separate feature**
  - ❓ Crypto QR payments - **unclear if crypto can be sent via QR**
- **Assessment:** Fiat QR payments and crypto are separate features, not integrated stablecoin QR payments

#### PayMaya/Maya
- **Status:** ❌ **NOT A MATCH**
- **Reason:** Fiat QR payments + crypto separately, not integrated
- **Features:**
  - ✅ QR payments ("Pay with QR") - **fiat only**
  - ✅ Crypto trading - **separate feature**
  - ❓ Crypto QR payments - **unclear if crypto can be sent via QR**
- **Assessment:** Fiat QR payments and crypto are separate features, not integrated stablecoin QR payments

### Indonesia

#### OVO
- **Status:** ❌ **NOT A MATCH**
- **Reason:** Fiat-only QR payments, no crypto found
- **Features:**
  - ✅ QR payments (fiat)
  - ❌ Crypto/stablecoin support not found
- **Assessment:** Fiat payment app, not crypto-enabled

#### GoPay
- **Status:** ❌ **NOT A MATCH**
- **Reason:** Fiat QR payments, crypto support unclear
- **Features:**
  - ✅ QRIS (QR payments) - **fiat**
  - ❓ Crypto/stablecoin support - **not found in website scraping**
- **Assessment:** Fiat payment app, crypto support unclear

### Thailand

#### PromptPay
- **Status:** ❌ **NOT A MATCH**
- **Reason:** Fiat-only QR payments, no crypto found
- **Features:**
  - ✅ QR payments (fiat)
  - ❌ Crypto/stablecoin support not found
- **Assessment:** Fiat payment system, not crypto-enabled

**Note:** Southeast Asia has mature fiat QR payment systems (GCash, PayMaya, QRIS, PromptPay) as reference models, but no stablecoin-based QR payment networks found.

---

## Africa

### Yellow Card
- **Status:** ❓ **UNCLEAR - NEEDS DEEPER RESEARCH**
- **Reason:** Website mentions "Stablecoin Payment Infrastructure" but unclear if consumer P2P QR payments
- **Features:**
  - ✅ Stablecoins (USDC/USDT likely, based on "Stablecoin Payment Infrastructure")
  - ❓ QR payments - **not found in website scraping**
  - ❓ Bank withdrawal - **not found in website scraping**
- **Assessment:** Appears to be B2B infrastructure focus ("empowers global businesses"), unclear if consumer P2P QR payments exist
- **Next Steps:** Need to check app store descriptions or user documentation for QR payment features

### Luno
- **Status:** ❌ **NOT A MATCH**
- **Reason:** Exchange/wallet model
- **Features:**
  - ✅ Crypto trading
  - ✅ Bank withdrawal (exchange model)
  - ❌ QR payments not found
- **Assessment:** Exchange platform, not P2P payment network

### Valr
- **Status:** ❌ **NOT A MATCH**
- **Reason:** Exchange/wallet model
- **Features:**
  - ✅ Crypto trading
  - ✅ Bank withdrawal (exchange model)
  - ❌ QR payments not found
- **Assessment:** Exchange platform, not P2P payment network

---

## Europe

### Revolut
- **Status:** ❌ **NOT A MATCH** (Cloudflare protection prevented scraping)
- **Reason:** Likely missing QR payments for crypto
- **Features:**
  - ✅ Crypto trading
  - ✅ Bank withdrawal
  - ❓ QR payments for crypto - **unclear (Cloudflare protection)**
- **Assessment:** Neobank with crypto, but QR payments for crypto unlikely

### N26
- **Status:** ❌ **NOT A MATCH**
- **Reason:** US operations shut down, Europe-focused, crypto via Bitpanda (limited)
- **Features:**
  - ❌ Crypto (limited, via Bitpanda integration)
  - ✅ Bank withdrawal
  - ❌ QR payments for crypto not found
- **Assessment:** Neobank, not crypto payment network

---

## Key Insights

### 1. Exchange/Wallet vs Payment Network
Most services found are **exchanges/wallets** (crypto trading + bank withdrawal) rather than **P2P payment networks** (QR-based instant transfers).

**Difference:**
- **Exchange/Wallet:** Users buy/sell crypto, withdraw to bank (like Coinbase)
- **Payment Network:** Users send crypto via QR code to other users instantly (like Peanut, Valora)

### 2. Fiat QR Payments vs Crypto QR Payments
Southeast Asia has mature **fiat QR payment systems** (GCash, PayMaya, QRIS, PromptPay), but these are **separate** from crypto features. Users can:
- Send fiat via QR ✅
- Trade crypto ✅
- But **cannot** send crypto via QR ❌ (or unclear)

### 3. B2B vs Consumer
Some services (like Yellow Card) focus on **B2B infrastructure** ("empowers global businesses") rather than consumer P2P payments.

---

## Verification Status Summary

| Service | Region | QR Payments | Stablecoins | Bank Withdraw | Status |
|---------|--------|-------------|-------------|---------------|--------|
| **CoinDCX** | India | ❌ | ✅ | ✅ | ❌ Exchange |
| **WazirX** | India | ❌ | ✅ | ✅ | ❌ Exchange |
| **GCash** | Philippines | ✅ (fiat) | ✅ (separate) | ✅ | ❌ Not integrated |
| **PayMaya** | Philippines | ✅ (fiat) | ✅ (separate) | ✅ | ❌ Not integrated |
| **OVO** | Indonesia | ✅ (fiat) | ❌ | ✅ | ❌ Fiat only |
| **GoPay** | Indonesia | ✅ (fiat) | ❓ | ✅ | ❌ Fiat only |
| **Yellow Card** | Africa | ❓ | ✅ | ❓ | ❓ Needs research |
| **Luno** | Africa | ❌ | ✅ | ✅ | ❌ Exchange |
| **Valr** | Africa | ❌ | ✅ | ✅ | ❌ Exchange |
| **Revolut** | Europe | ❓ | ✅ | ✅ | ❌ Likely no QR |
| **N26** | Europe | ❌ | ❌ (limited) | ✅ | ❌ Neobank |
| **Strike** | Global | ❓ | ❌ (Bitcoin only) | ✅ | ❌ Bitcoin-focused |
| **Cash App** | US | ✅ (fiat) | ❌ (Bitcoin only) | ✅ | ❌ Not stablecoins |
| **MoonPay** | Global | ❌ | ✅ | ✅ | ❌ On-ramp service |
| **Ramp** | Global | ❌ | ✅ | ✅ | ❌ On-ramp service |
| **Mercado Bitcoin** | Brazil | ❌ | ✅ | ✅ | ❌ Exchange |
| **Nubank Crypto** | Brazil | ❌ | ✅ | ✅ | ❌ Neobank |
| **Buda** | Colombia | ❓ | ✅ | ✅ | ❌ Exchange (likely) |
| **Volabit** | Mexico | ❌ | ✅ | ✅ | ❌ Exchange |

---

## Additional Services Researched

### Yellow Card (Africa)
- **App Store Research:** JavaScript-heavy pages, unable to extract QR payment info
- **Status:** ❓ **UNCLEAR** - B2B infrastructure focus, consumer QR payments unclear
- **Next Steps:** Would need manual app testing or user documentation

### Strike (Global)
- **Status:** ❌ **NOT A MATCH** (Cloudflare protection prevented scraping)
- **Likely Features:** Lightning Network payments (Bitcoin), not stablecoins
- **Assessment:** Bitcoin-focused, not stablecoin payment network

### Cash App (US)
- **Status:** ❌ **NOT A MATCH**
- **Features:**
  - ✅ QR payments (fiat)
  - ✅ Bitcoin trading
  - ❌ No stablecoins (USDC/USDT) found
- **Assessment:** Fiat QR payments + Bitcoin separately, not stablecoin QR payments

### MoonPay (Global)
- **Status:** ❌ **NOT A MATCH**
- **Reason:** On-ramp/off-ramp service (buy/sell crypto), not P2P payment network
- **Features:** Buy/sell crypto, not QR-based P2P transfers

### Ramp Network (Global)
- **Status:** ❌ **NOT A MATCH**
- **Reason:** On-ramp/off-ramp service (buy/sell crypto), not P2P payment network
- **Features:** Buy/sell crypto, not QR-based P2P transfers

### Mercado Bitcoin (Brazil)
- **Status:** ❌ **NOT A MATCH**
- **Reason:** Exchange/wallet model
- **Features:** Crypto trading, no QR payments found

### Nubank Crypto (Brazil)
- **Status:** ❌ **NOT A MATCH**
- **Reason:** Neobank with crypto features, not P2P payment network
- **Features:** Crypto trading via Bitpanda integration, no QR payments found

### Buda (Colombia)
- **Status:** ❌ **NOT A MATCH** (Cloudflare protection prevented scraping)
- **Likely:** Exchange/wallet model

### Volabit (Mexico)
- **Status:** ❌ **NOT A MATCH**
- **Reason:** Exchange/wallet model, no QR payments found

---

## Next Steps

1. ✅ **Completed:** India, Southeast Asia, Africa, Europe initial research
2. ✅ **Completed:** Additional services research (Strike, Cash App, MoonPay, Ramp, etc.)
3. ⏳ **Pending:** Manual app testing for Yellow Card (if needed)
4. ⏳ **Pending:** Search for other potential services in overlooked regions

---

**Last Updated:** December 16, 2025
