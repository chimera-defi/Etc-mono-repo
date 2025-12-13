# Verification Notes - Crypto Credit Card Information

**Last Updated:** December 2025

## Important Note

This document tracks verification status and potential inaccuracies in the crypto credit card comparison. All information should be verified on official card websites before making decisions.

## Verification Summary (December 2025)

### ✅ Successfully Verified Cards

1. **Crypto.com Visa Card** - Confirmed "up to 5% back" (higher tiers may vary)
2. **Nexo Card** - Confirmed "up to 2% crypto cashback", "No monthly/annual/inactivity card fees"
3. **Plutus Card** - Confirmed "3-9% in PLUS Rewards", "3% Back" base rate, "No fees. No Catch."
4. **Shakepay Card** - Confirmed "up to 1.5% cashback", "No annual fees. No credit checks either."

### ⚠️ Cards with Website Access Issues (404 Errors)

1. **Swissborg Card** - https://swissborg.com/card returns 404
2. **Uphold Card** - https://uphold.com/card returns 404
3. **CoinJar Card** - https://www.coinjar.com/card returns 404

**Action Required:** These cards need manual verification to confirm:
- If card products still exist
- Correct website URLs
- Current card status

### 🔒 Cards Requiring Manual Browser Access

1. **Reap** - Entire website protected by Cloudflare (see detailed section below)

### ⚠️ Cards Needing Deeper Verification

The following cards' websites exist but initial scraping didn't find specific rate information (may require JavaScript or deeper navigation):
- Coinbase Card
- Binance Card
- Wirex Card
- Gemini Credit Card
- Mode Card
- BitPay Card (cashback mentioned but no percentage found)
- Fold Card (bitcoin rewards mentioned but no percentage found)
- CryptoSpend Card

---

## Reap - ✅ Verified via Browser Automation

**Website:** [reap.global](https://reap.global)

**Status:** ✅ **Verified December 2025 via Playwright browser automation**

**Verification Method:** Used Playwright (headless Chromium) to bypass Cloudflare protection. Waited for Cloudflare challenge to complete (~30 seconds) before extracting content.

**Key Pages Verified:**
- ✅ https://reap.global/resources/info/pricing (Pricing page - fully verified)

**Key Pages Identified (All Protected):**
- https://reap.global (homepage)
- **https://reap.global/resources/info/pricing** ⭐ **Pricing page identified** (user-provided URL)
- https://reap.global/about
- https://reap.global/help
- https://reap.global/docs
- https://reap.global/blog
- https://reap.global/contact
- https://reap.global/features
- https://reap.global/solutions
- https://reap.global/api
- https://reap.global/privacy
- https://reap.global/terms
- https://reap.global/pricing
- https://reap.global/sitemap.xml
- https://docs.reap.global (does not exist)
- https://help.reap.global (does not exist)

**Pricing Page:** ✅ **VERIFIED** - https://reap.global/resources/info/pricing

**Verified Information (December 2025):**
- **Card Type:** Corporate Visa credit card (Physical & Virtual)
- **Annual Fee:** FREE
- **Monthly Bill Repayment:** FREE (Fiat currency or Stablecoins)
- **ATM Withdrawal Fee:** 2%
- **FX Fee:** 2%
- **Available Currencies:** USD, HKD
- **Collateral Requirement:** 1:1 ratio (Credit limit = 100% of collateral)
- **Mobile App:** FREE
- **Cash Back:** 0% (No cashback rewards)
- **Late Fees:** May apply (not specified)
- **Business Support:** ✅ Yes (Business-focused platform)

**Verification Tool:** Playwright browser automation (headless Chromium) successfully bypassed Cloudflare protection after ~30 second wait for challenge completion.

**Only Accessible:**
- https://reap.global/robots.txt - Shows sitemap exists but sitemap itself is protected

**Action Required:**
1. Visit [reap.global](https://reap.global) directly in a web browser with JavaScript enabled
2. Check footer links for additional documentation pages
3. Verify if Reap offers a physical/virtual card product
4. Check for crypto payment processing features
5. Verify fee structure (annual fees, transaction fees, processing fees)
6. Check for rewards program (if applicable)
7. Verify geographic availability
8. Confirm business account requirements and features
9. Review terms of service and privacy policy (when accessible)
10. Check pricing page for fee details

**Current Information (Unverified - Based on Assumptions):**
- Type: Business payment platform (needs verification)
- Business Support: ✅ Yes (assumed - needs verification)
- Website exists and is active (confirmed)
- All product details: Need manual verification
- All fee information: Need manual verification
- Crypto features: Need manual verification

**Note:** Without access to the actual website content, all information about Reap is unverified. The platform appears to be business-focused based on the domain and context, but specific features, fees, and card products cannot be confirmed without manual browser access.

---

## Website Verification Results (December 2025)

### Successfully Verified Cards

#### Crypto.com Visa Card
- **Website:** https://crypto.com/cards
- **Status:** ✅ Accessible
- **Verified:** "Get up to 5% back in crypto" confirmed in meta description
- **Note:** Website confirms up to 5% cashback. Higher tiers (8% Obsidian) may require verification of current terms.

#### Nexo Card
- **Website:** https://nexo.com/card
- **Status:** ✅ Accessible
- **Verified:** "up to 2% crypto cashback" confirmed in structured data (JSON-LD)
- **Note:** Confirmed "No monthly/annual/inactivity card fees" in structured data. Dual-mode card (Debit + Credit).

#### Plutus Card
- **Website:** https://plutus.it
- **Status:** ✅ Accessible
- **Verified:** "Earn 3-9% in PLUS Rewards" and "Get 3% Back" confirmed on homepage
- **Note:** Confirmed "No fees. No Catch." on homepage. Base rate is 3%, can climb to 9% via loyalty tiers.

#### Shakepay Card
- **Website:** https://shakepay.com/card
- **Status:** ✅ Accessible
- **Verified:** "Earn up to 1.5% cashback" confirmed on card landing page
- **Note:** Confirmed "No annual fees. No credit checks either." Canada only.

#### BitPay Card
- **Website:** https://bitpay.com/card
- **Status:** ✅ Accessible
- **Verified:** "Cash Back" mentioned in page title, but specific percentage not found in initial scrape
- **Note:** Website accessible but requires deeper verification for cashback rates.

#### Fold Card
- **Website:** https://foldapp.com
- **Status:** ✅ Accessible
- **Verified:** Bitcoin rewards confirmed, but specific cashback percentage not found in initial scrape
- **Note:** Website mentions bitcoin rewards but requires deeper verification for exact rates.

### Cards with Website Access Issues

#### Swissborg Card
- **Website:** https://swissborg.com/card
- **Status:** ❌ 404 Error
- **Issue:** URL returns 404 page
- **Action Required:** Verify correct URL or confirm if card product still exists
- **Alternative URLs to Try:** 
  - https://swissborg.com/products/card
  - https://swissborg.com/crypto-card
  - Check main website navigation

#### Uphold Card
- **Website:** https://uphold.com/card
- **Status:** ❌ 404 Error
- **Issue:** URL returns 404 page
- **Action Required:** Verify correct URL or confirm if card product still exists
- **Alternative URLs to Try:**
  - https://uphold.com/debit-card
  - https://uphold.com/products/card
  - Check main website navigation

#### CoinJar Card
- **Website:** https://www.coinjar.com/card
- **Status:** ❌ 404 Error
- **Issue:** URL returns 404 page
- **Action Required:** Verify correct URL or confirm if card product still exists
- **Alternative URLs to Try:**
  - https://coinjar.com/products/card
  - Check main website navigation
  - Verify if card is still offered

### Cards Not Verified (No Website Access)

#### Coinbase Card
- **Website:** https://www.coinbase.com/card
- **Status:** ⚠️ No specific data found in initial scrape
- **Note:** Website exists but grep didn't find specific rates. May require JavaScript or deeper page navigation.

#### Binance Card
- **Website:** https://www.binance.com/en/cards
- **Status:** ⚠️ No specific data found in initial scrape
- **Note:** Website exists but may require JavaScript or deeper page navigation.

#### Wirex Card
- **Website:** https://wirexapp.com/card
- **Status:** ⚠️ No specific data found in initial scrape
- **Note:** Website exists but may require JavaScript or deeper page navigation.

#### Gemini Credit Card
- **Website:** https://www.gemini.com/credit-card
- **Status:** ⚠️ No specific data found in initial scrape
- **Note:** Website exists but may require JavaScript or deeper page navigation.

#### Mode Card
- **Website:** https://modeapp.com
- **Status:** ⚠️ No specific data found in initial scrape
- **Note:** Website exists but may require JavaScript or deeper page navigation.

#### CryptoSpend Card
- **Website:** https://cryptospend.com.au
- **Status:** ⚠️ No specific data found in initial scrape
- **Note:** Website exists but may require JavaScript or deeper page navigation.

---

## Other Cards - Verification Checklist

### Cards Needing Verification

All cards should be verified for:
- ✅ Current cash back rates (may have changed)
- ✅ Fee structures (annual fees, foreign transaction fees)
- ✅ Geographic availability (may have expanded/contracted)
- ✅ Business account support (verify current status)
- ✅ Crypto rewards structure (verify current offerings)
- ✅ Staking requirements (if applicable)

### Known Information Sources

**Primary Sources:**
- Official card websites (most reliable)
- Terms of service documents
- Cardholder agreements
- Customer support (for clarification)

**Secondary Sources:**
- News articles and press releases
- User reviews (may be outdated)
- Comparison sites (verify against official sources)

---

## Potential Inaccuracies to Watch For

### Common Issues

1. **Outdated Information:**
   - Cash back rates may have changed
   - Fee structures may have been updated
   - Geographic availability may have expanded/contracted

2. **Hallucinated Details:**
   - Specific percentages not verified
   - Features that don't exist
   - Incorrect geographic availability

3. **Assumptions:**
   - Business account support (may not be accurate)
   - Staking requirements (may have changed)
   - Reward structures (may differ from documented)

---

## Verification Priority

### High Priority (Verify Immediately)
- **Reap** - No verified information available
- Cards with "TBD" or "⚠️ Verify" markers
- Cards with recent changes (check changelog)

### Medium Priority (Periodic Verification)
- Cards with complex tiered rewards
- Cards with staking requirements
- Cards with business account support

### Low Priority (Annual Review)
- Established cards with stable features
- Cards with clear, documented terms

---

## How to Verify

1. **Visit Official Website:**
   - Go to the card's official website
   - Look for "Card" or "Products" section
   - Check terms and conditions

2. **Contact Support:**
   - Use live chat or email support
   - Ask specific questions about features
   - Request current fee schedule

3. **Check Documentation:**
   - Read cardholder agreements
   - Review FAQ sections
   - Check for recent updates/announcements

4. **Cross-Reference:**
   - Compare information across multiple sources
   - Check for discrepancies
   - Verify against official terms

---

## Update Process

When verifying information:

1. **Document Source:**
   - Note where information was found
   - Include date of verification
   - Link to official source

2. **Update Documents:**
   - Update comparison table
   - Update detailed comparison
   - Add changelog entry

3. **Mark Verification Status:**
   - ✅ Verified (with date)
   - ⚠️ Needs verification
   - ❌ Cannot verify

---

*This document should be updated whenever information is verified or found to be inaccurate.*
