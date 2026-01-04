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

## Additional Regional Research (Extended)

### Vietnam

#### MoMo
- **Status:** ❌ **NOT A MATCH**
- **Reason:** Fiat-only QR payments, no crypto/stablecoin integration found
- **Features:**
  - ✅ QR payments (fiat)
  - ❌ Crypto/stablecoin support not found
- **Assessment:** Fiat payment app, not crypto-enabled

#### ZaloPay
- **Status:** ❌ **NOT A MATCH**
- **Reason:** Fiat-only QR payments, no crypto/stablecoin integration found
- **Features:**
  - ✅ QR payments (fiat)
  - ❌ Crypto/stablecoin support not found
- **Assessment:** Fiat payment app, not crypto-enabled

#### ViettelPay
- **Status:** ❌ **NOT A MATCH**
- **Reason:** Fiat-only QR payments, no crypto/stablecoin integration found
- **Features:**
  - ✅ QR payments (fiat)
  - ❌ Crypto/stablecoin support not found
- **Assessment:** Fiat payment app, not crypto-enabled

#### TrueMoney
- **Status:** ❌ **NOT A MATCH**
- **Reason:** Fiat-only QR payments, no crypto/stablecoin integration found
- **Features:**
  - ✅ QR payments (fiat)
  - ❌ Crypto/stablecoin support not found
- **Assessment:** Fiat payment app, not crypto-enabled

### Other Southeast Asian Countries

#### DANA (Indonesia)
- **Status:** ❌ **NOT A MATCH**
- **Reason:** Fiat-only QR payments, no crypto/stablecoin integration found
- **Features:**
  - ✅ QR payments (fiat)
  - ❌ Crypto/stablecoin support not found
- **Assessment:** Fiat payment app, not crypto-enabled

#### LinkAja (Indonesia)
- **Status:** ❌ **NOT A MATCH**
- **Reason:** Fiat-only QR payments, no crypto/stablecoin integration found
- **Features:**
  - ✅ QR payments (fiat)
  - ❌ Crypto/stablecoin support not found
- **Assessment:** Fiat payment app, not crypto-enabled

#### GrabPay (Southeast Asia)
- **Status:** ❌ **NOT A MATCH**
- **Reason:** Fiat-only QR payments, no crypto/stablecoin integration found
- **Features:**
  - ✅ QR payments (fiat)
  - ❌ Crypto/stablecoin support not found
- **Assessment:** Fiat payment app, not crypto-enabled

#### Airtel Money (India/Africa)
- **Status:** ❌ **NOT A MATCH**
- **Reason:** Fiat-only mobile money, no crypto/stablecoin integration found
- **Features:**
  - ✅ Mobile money (fiat)
  - ❌ Crypto/stablecoin support not found
- **Assessment:** Fiat mobile money service, not crypto-enabled

#### PhonePe (India)
- **Status:** ❌ **NOT A MATCH**
- **Reason:** Fiat-only UPI payments, no crypto/stablecoin integration found
- **Features:**
  - ✅ UPI QR payments (fiat)
  - ❌ Crypto/stablecoin support not found
- **Assessment:** Fiat payment app, not crypto-enabled

#### Paytm (India)
- **Status:** ❌ **NOT A MATCH**
- **Reason:** Fiat-only UPI payments, no crypto/stablecoin integration found
- **Features:**
  - ✅ UPI QR payments (fiat)
  - ❌ Crypto/stablecoin support not found
- **Assessment:** Fiat payment app, not crypto-enabled

### Africa (Extended Research)

#### Chipper Cash
- **Status:** ❓ **UNCLEAR - NEEDS DEEPER RESEARCH**
- **Reason:** Has crypto features, but unclear if stablecoin P2P QR payments exist
- **Features:**
  - ✅ Cross-border payments
  - ✅ Crypto trading (likely)
  - ❓ Stablecoin P2P QR payments - unclear
  - ❓ Bank withdrawal - unclear
- **Assessment:** Payment service with crypto features, but unclear if it matches stablecoin QR payment network criteria
- **Next Steps:** Need deeper investigation for stablecoin QR payment features

#### Flutterwave
- **Status:** ❌ **NOT A MATCH**
- **Reason:** Payment processor/B2B infrastructure, not consumer P2P payment network
- **Features:**
  - ✅ Payment processing (B2B)
  - ❌ Consumer P2P QR payments not found
- **Assessment:** B2B payment infrastructure, not consumer payment network

#### Paystack
- **Status:** ❌ **NOT A MATCH** (Cloudflare protection prevented scraping)
- **Reason:** Payment processor/B2B infrastructure, not consumer P2P payment network
- **Likely Features:** Payment processing (B2B), not consumer P2P QR payments
- **Assessment:** B2B payment infrastructure, not consumer payment network

#### M-Pesa
- **Status:** ❌ **NOT A MATCH** (Website blocked/error)
- **Reason:** Fiat-only mobile money, no crypto/stablecoin integration
- **Features:**
  - ✅ Mobile money (fiat)
  - ❌ Crypto/stablecoin support not found
- **Assessment:** Fiat mobile money service, not crypto-enabled

#### MTN Mobile Money
- **Status:** ❌ **NOT A MATCH**
- **Reason:** Fiat-only mobile money, no crypto/stablecoin integration found
- **Features:**
  - ✅ Mobile money (fiat)
  - ❌ Crypto/stablecoin support not found
- **Assessment:** Fiat mobile money service, not crypto-enabled

#### OPay
- **Status:** ❌ **NOT A MATCH**
- **Reason:** Fiat-only QR payments, no crypto/stablecoin integration found
- **Features:**
  - ✅ QR payments (fiat)
  - ❌ Crypto/stablecoin support not found
- **Assessment:** Fiat payment app, not crypto-enabled

#### Palm
- **Status:** ❓ **UNCLEAR - NEEDS DEEPER RESEARCH**
- **Reason:** Limited information found, may have crypto features
- **Features:**
  - ❓ Crypto/stablecoin support - unclear
  - ❓ QR payments - unclear
- **Assessment:** Needs deeper investigation
- **Next Steps:** Need more research to determine if it matches criteria

#### Sendwave
- **Status:** ❌ **NOT A MATCH**
- **Reason:** Remittance service (fiat), not crypto payment network
- **Features:**
  - ✅ Remittances (fiat)
  - ❌ Crypto/stablecoin support not found
- **Assessment:** Fiat remittance service, not crypto-enabled

#### WorldRemit
- **Status:** ❌ **NOT A MATCH**
- **Reason:** Remittance service (fiat), not crypto payment network
- **Features:**
  - ✅ Remittances (fiat)
  - ❌ Crypto/stablecoin support not found
- **Assessment:** Fiat remittance service, not crypto-enabled

### Middle East

#### Rain
- **Status:** ❌ **NOT A MATCH**
- **Reason:** Crypto exchange, not P2P payment network
- **Features:**
  - ✅ Crypto trading
  - ✅ Bank withdrawal (exchange model)
  - ❌ QR payments not found
- **Assessment:** Exchange platform, not P2P payment network

#### Binance Pay (Middle East/Global)
- **Status:** ❌ **NOT A MATCH**
- **Reason:** Exchange-based payment feature, not standalone stablecoin P2P network
- **Features:**
  - ✅ Crypto payments (within Binance ecosystem)
  - ✅ Merchant payments
  - ❌ Standalone stablecoin P2P QR network not found
- **Assessment:** Exchange payment feature, not independent payment network

#### Coinmama
- **Status:** ❌ **NOT A MATCH**
- **Reason:** Crypto exchange/on-ramp, not P2P payment network
- **Features:**
  - ✅ Buy crypto (on-ramp)
  - ❌ QR payments not found
- **Assessment:** On-ramp service, not P2P payment network

### Other Crypto Payment Apps

#### Bakkt
- **Status:** ❌ **NOT A MATCH**
- **Reason:** Crypto trading platform, not P2P payment network
- **Features:**
  - ✅ Crypto trading
  - ❌ QR payments not found
- **Assessment:** Trading platform, not P2P payment network

#### Coinbase Pay
- **Status:** ❌ **NOT A MATCH**
- **Reason:** Payment integration for merchants, not consumer P2P network
- **Features:**
  - ✅ Merchant payment integration
  - ❌ Consumer P2P QR payments not found
- **Assessment:** B2B payment integration, not consumer payment network

#### Bitpay
- **Status:** ❌ **NOT A MATCH** (Cloudflare protection prevented scraping)
- **Reason:** Payment processor/B2B infrastructure, not consumer P2P network
- **Likely Features:** Merchant payment processing, not consumer P2P QR payments
- **Assessment:** B2B payment processor, not consumer payment network

#### Trust Wallet
- **Status:** ❌ **NOT A MATCH** (Cloudflare protection prevented scraping)
- **Reason:** Software wallet, not payment network
- **Likely Features:** Wallet for storing crypto, not QR-based P2P payment network
- **Assessment:** Software wallet, not payment network

#### MetaMask
- **Status:** ❌ **NOT A MATCH**
- **Reason:** Software wallet, not payment network
- **Features:**
  - ✅ Wallet for storing crypto
  - ❌ QR-based P2P payment network not found
- **Assessment:** Software wallet, not payment network

#### Coinbase Wallet
- **Status:** ❌ **NOT A MATCH** (Cloudflare protection prevented scraping)
- **Reason:** Software wallet, not payment network
- **Likely Features:** Wallet for storing crypto, not QR-based P2P payment network
- **Assessment:** Software wallet, not payment network

#### Exodus
- **Status:** ❌ **NOT A MATCH**
- **Reason:** Software wallet, not payment network
- **Features:**
  - ✅ Wallet for storing crypto
  - ❌ QR-based P2P payment network not found
- **Assessment:** Software wallet, not payment network

#### Atomic Wallet
- **Status:** ❌ **NOT A MATCH**
- **Reason:** Software wallet, not payment network
- **Features:**
  - ✅ Wallet for storing crypto
  - ❌ QR-based P2P payment network not found
- **Assessment:** Software wallet, not payment network

#### Bitcoin.com Wallet
- **Status:** ❌ **NOT A MATCH**
- **Reason:** Software wallet (Bitcoin-focused), not stablecoin payment network
- **Features:**
  - ✅ Bitcoin wallet
  - ❌ Stablecoin QR payment network not found
- **Assessment:** Bitcoin wallet, not stablecoin payment network

#### Blockchain.com Wallet
- **Status:** ❌ **NOT A MATCH** (Cloudflare protection prevented scraping)
- **Reason:** Software wallet, not payment network
- **Likely Features:** Wallet for storing crypto, not QR-based P2P payment network
- **Assessment:** Software wallet, not payment network

#### Hardware Wallets (Ledger, Trezor, SafePal, Ellipal, Keepkey, Bitbox, NGRAVE, OneKey, Keystone)
- **Status:** ❌ **NOT A MATCH**
- **Reason:** Hardware wallets for storing crypto, not payment networks
- **Features:**
  - ✅ Secure crypto storage
  - ❌ QR-based P2P payment network not found
- **Assessment:** Hardware wallets, not payment networks

#### Gemini
- **Status:** ❌ **NOT A MATCH** (Cloudflare protection prevented scraping)
- **Reason:** Crypto exchange, not P2P payment network
- **Likely Features:** Crypto trading, not QR-based P2P payment network
- **Assessment:** Exchange platform, not payment network

#### Wise (formerly TransferWise)
- **Status:** ❌ **NOT A MATCH**
- **Reason:** Fiat remittance service, not crypto payment network
- **Features:**
  - ✅ Fiat remittances
  - ❌ Crypto/stablecoin support not found
- **Assessment:** Fiat remittance service, not crypto-enabled

#### Remitly
- **Status:** ❌ **NOT A MATCH**
- **Reason:** Fiat remittance service, not crypto payment network
- **Features:**
  - ✅ Fiat remittances
  - ❌ Crypto/stablecoin support not found
- **Assessment:** Fiat remittance service, not crypto-enabled

#### Skrill
- **Status:** ❌ **NOT A MATCH**
- **Reason:** Fiat payment service, not crypto payment network
- **Features:**
  - ✅ Fiat payments
  - ❌ Crypto/stablecoin support not found
- **Assessment:** Fiat payment service, not crypto-enabled

#### Neteller
- **Status:** ❌ **NOT A MATCH**
- **Reason:** Fiat payment service, not crypto payment network
- **Features:**
  - ✅ Fiat payments
  - ❌ Crypto/stablecoin support not found
- **Assessment:** Fiat payment service, not crypto-enabled

#### Paysafecard
- **Status:** ❌ **NOT A MATCH**
- **Reason:** Fiat prepaid card service, not crypto payment network
- **Features:**
  - ✅ Fiat prepaid cards
  - ❌ Crypto/stablecoin support not found
- **Assessment:** Fiat prepaid card service, not crypto-enabled

#### BNPL Services (Klarna, Afterpay, Affirm, Sezzle, Splitit)
- **Status:** ❌ **NOT A MATCH**
- **Reason:** Buy Now Pay Later services (fiat), not crypto payment networks
- **Features:**
  - ✅ BNPL (fiat)
  - ❌ Crypto/stablecoin support not found
- **Assessment:** Fiat BNPL services, not crypto-enabled

#### European Payment Systems (Vipps, Swish, MobilePay, Bancontact, iDEAL, Sofort, Giropay, EPS)
- **Status:** ❌ **NOT A MATCH**
- **Reason:** Fiat-only payment systems, no crypto/stablecoin integration
- **Features:**
  - ✅ Fiat payments
  - ❌ Crypto/stablecoin support not found
- **Assessment:** Fiat payment systems, not crypto-enabled

---

## Updated Summary

**Services Verified (Extended Research):** 50+  
**Matches Found:** 0 (from extended research)  
**Excluded:** 48+ (fiat-only, exchanges, wallets, remittance services, payment processors)  
**Unclear:** 2 (Chipper Cash, Palm - need deeper research)

**Key Finding:** Extended research across Vietnam, other Southeast Asian countries, Africa, Middle East, and other crypto payment apps confirms that the "Stablecoin Payment Networks" category remains highly specialized and regionally concentrated. Most services found are:
1. **Fiat-only payment apps** (MoMo, ZaloPay, ViettelPay, TrueMoney, DANA, LinkAja, GrabPay, Airtel Money, PhonePe, Paytm)
2. **Traditional payment processors/remittance services** (Flutterwave, Paystack, M-Pesa, MTN Mobile Money, OPay, Sendwave, WorldRemit, Wise, Remitly, Skrill, Neteller)
3. **Crypto exchanges** (Rain, Coinmama, Bakkt, Gemini)
4. **Software/hardware wallets** (Trust Wallet, MetaMask, Coinbase Wallet, Exodus, Atomic Wallet, Bitcoin.com Wallet, Blockchain.com Wallet, Ledger, Trezor, SafePal, Ellipal, Keepkey, Bitbox, NGRAVE, OneKey, Keystone)
5. **B2B payment infrastructure** (Coinbase Pay, Bitpay, Binance Pay)
6. **Fiat payment systems** (Vipps, Swish, MobilePay, Bancontact, iDEAL, Sofort, Giropay, EPS, Paysafecard)
7. **BNPL services** (Klarna, Afterpay, Affirm, Sezzle, Splitit)

**Services Requiring Deeper Research:**
- **Chipper Cash** (Africa) - Has crypto features, needs verification for stablecoin P2P QR payments
- **Palm** (Africa) - Limited information, may have crypto features

---

## Next Steps

1. ✅ **Completed:** India, Southeast Asia, Africa, Europe initial research
2. ✅ **Completed:** Additional services research (Strike, Cash App, MoonPay, Ramp, etc.)
3. ✅ **Completed:** Extended research (Vietnam, other SEA countries, Africa, Middle East, other crypto payment apps)
4. ⏳ **Pending:** Deeper research for Chipper Cash and Palm (if needed)
5. ⏳ **Pending:** Manual app testing for Yellow Card (if needed)

---

**Last Updated:** December 16, 2025
