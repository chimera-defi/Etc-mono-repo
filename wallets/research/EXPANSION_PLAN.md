# Expansion Research Plan

## Goal
Expand the wallet comparison project to include **Neo-Banks** and **On/Off-Ramps**. These are adjacent categories critical for crypto users and developers.

## 1. Neo-Banks / Crypto-Friendly Banks

**Objective:** Identify banks that natively support crypto or are known to be "crypto-friendly" (don't block transfers to exchanges). Distinguish between personal and business use.

**Target Entities:**
- **Revolut** (Global/EU): Crypto trading built-in.
- **Monzo** (UK/US): Generally friendly, some limits.
- **Mercury** (US, Business): Tech/startup focused, generally crypto-friendly for non-MSBs.
- **Juno** (US): Crypto-native checking account.
- **Xapo** (Global): Bitcoin-native bank (Gibraltar).
- **Series** (Business): Integrated banking + crypto.
- **FV Bank** (US, Business): Licensed bank with crypto custody.
- **Ally Bank** (US): Known for being relatively friendly compared to big banks.

**Key Data Points:**
- Jurisdiction (US, EU, Global)
- Business vs. Personal
- Crypto Features (Buy/Sell, Custody, Transfer to external wallet?)
- "Friendliness" Rating (Blocks exchanges? Limits?)
- Fees

## 2. On/Off-Ramps

**Objective:** Compare infrastructure providers that developers integrate into wallets/dApps for fiat-to-crypto conversion.

**Target Entities:**
- **MoonPay**
- **Transak**
- **Ramp Network**
- **Sardine**
- **Mercuryo**
- **Stripe** (Crypto onramp)
- **Banxa**
- **Simplex** (Nuvei)

**Key Data Points:**
- **Fees:** Processing fee + Network fee spread.
- **Coverage:** Number of countries, US states.
- **Payment Methods:** Card, Apple Pay, Google Pay, SEPA, ACH, Wire.
- **KYC:** Level of friction (No-KYC limits?).
- **Developer Experience:** SDK quality, integration ease.
- **Supported Assets/Chains.**

## Task List & Agent Prompts

### Task 1: Neo-Bank Research
**Prompt:**
"Research the following neo-banks and crypto-friendly banks: Revolut, Monzo, Mercury, Juno, Xapo, Series, FV Bank. For each, determine:
1.  Jurisdiction served.
2.  Personal vs. Business focus.
3.  Native crypto features (can you buy/hold/withdraw crypto directly?).
4.  Policy towards crypto exchanges (friendly, neutral, hostile).
5.  Notable fees or limits."

### Task 2: On/Off-Ramp Research
**Prompt:**
"Research the following on/off-ramp providers: MoonPay, Transak, Ramp Network, Sardine, Mercuryo, Stripe, Banxa. For each, find:
1.  Fee structure (percentage + min fees).
2.  Geographic support (number of countries, US state coverage).
3.  Key payment methods supported.
4.  KYC requirements (tiers, limits without KYC).
5.  Supported chains/tokens count."

## Output Format
Create two new summary files:
1.  `wallets/research/NEOBANK_COMPARISON_DRAFT.md`
2.  `wallets/research/RAMP_COMPARISON_DRAFT.md`
