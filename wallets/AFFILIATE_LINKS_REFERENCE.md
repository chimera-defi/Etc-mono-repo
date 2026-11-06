# Affiliate Links Quick Reference

**Purpose:** Quick reference for purchase links and Amazon search terms  
**Use:** When implementing affiliate links on WalletRadar

---

## 🟢 Recommended Wallets (Score 75+)

### Trezor Safe 5 ($169)
- **Direct Purchase:** https://trezor.io/trezor-safe-5
- **Amazon Search:** "Trezor Safe 5"
- **Amazon ASIN:** [Find via Amazon Associates link generator]
- **Affiliate Status:** ❓ Contact Trezor for program
- **Notes:** Sold primarily direct, also on Amazon

### Trezor Safe 3 ($79)
- **Direct Purchase:** https://trezor.io/trezor-safe-3
- **Amazon Search:** "Trezor Safe 3"
- **Amazon ASIN:** [Find via Amazon Associates link generator]
- **Affiliate Status:** ❓ Contact Trezor for program
- **Notes:** Best value option, sold direct and Amazon

### Keystone 3 Pro ($149)
- **Direct Purchase:** https://keyst.one (check for shop link)
- **Amazon Search:** "Keystone 3 Pro" (verify availability)
- **Affiliate Status:** ❓ Contact Keystone for program
- **Notes:** Air-gapped, QR-only, sold primarily direct

### ColdCard Mk4 ($150)
- **Direct Purchase:** https://store.coinkite.com/store/category/mk4
- **Amazon:** ❌ Not available on Amazon
- **Affiliate Status:** ❓ Contact Coinkite for program
- **Notes:** Bitcoin-focused, sold only through Coinkite store

### BitBox02 ($150)
- **Direct Purchase:** https://shop.bitbox.swiss/en/
- **Amazon Search:** "BitBox02" (verify availability)
- **Affiliate Status:** ❓ Contact BitBox for program
- **Notes:** Swiss-made, open source, sold primarily direct

### Blockstream Jade (~$65)
- **Direct Purchase:** https://blockstream.com/jade/
- **Amazon Search:** "Blockstream Jade" (verify availability)
- **Affiliate Status:** ❓ Contact Blockstream for program
- **Notes:** Great value, sold primarily direct

### Foundation Passport (~$259)
- **Direct Purchase:** https://foundationdevices.com/
- **Amazon Search:** "Foundation Passport" (verify availability)
- **Affiliate Status:** ❓ Contact Foundation Devices for program
- **Notes:** Air-gapped, sold primarily direct

### OneKey Pro (~$199)
- **Direct Purchase:** https://onekey.so/
- **Amazon Search:** "OneKey Pro" (verify availability)
- **Affiliate Status:** ❓ Contact OneKey for program
- **Notes:** Multi-chain support, sold primarily direct

---

## 🟡 Situational Wallets (Score 50-74)

### Ledger Stax ($280)
- **Direct Purchase:** https://shop.ledger.com/products/ledger-stax
- **Amazon Search:** "Ledger Stax"
- **Amazon ASIN:** [Find via Amazon Associates link generator]
- **Affiliate Status:** ❓ Contact Ledger for program
- **Notes:** High brand recognition, despite lower score

### Ledger Nano X ($150)
- **Direct Purchase:** https://shop.ledger.com/products/ledger-nano-x
- **Amazon Search:** "Ledger Nano X"
- **Amazon ASIN:** [Find via Amazon Associates link generator]
- **Affiliate Status:** ❓ Contact Ledger for program
- **Notes:** Most popular Ledger model

### Ledger Nano S+ ($80)
- **Direct Purchase:** https://shop.ledger.com/products/ledger-nano-s-plus
- **Amazon Search:** "Ledger Nano S Plus" or "Ledger Nano S+"
- **Amazon ASIN:** [Find via Amazon Associates link generator]
- **Affiliate Status:** ❓ Contact Ledger for program
- **Notes:** Budget Ledger option

### SafePal S1 (~$50)
- **Direct Purchase:** https://www.safepal.com/
- **Amazon Search:** "SafePal S1"
- **Amazon ASIN:** [Find via Amazon Associates link generator]
- **Affiliate Status:** ❓ Contact SafePal for program
- **Notes:** Budget option, available on Amazon

### Tangem Wallet (~$55)
- **Direct Purchase:** https://tangem.com/
- **Amazon Search:** "Tangem Wallet"
- **Amazon ASIN:** [Find via Amazon Associates link generator]
- **Affiliate Status:** ❓ Contact Tangem for program
- **Notes:** Card-based wallet, available on Amazon

---

## Amazon Associates Link Creation

### Step-by-Step:
1. Go to Amazon Associates Central
2. Click "Product Links" → "Link to Any Page"
3. Enter product URL or search term
4. Select product
5. Choose link type (Text, Image, Text + Image)
6. Copy affiliate link
7. Add UTM parameters:
   ```
   ?tag=YOUR_TAG&utm_source=walletradar&utm_medium=affiliate&utm_campaign=hardware-wallet-[name]
   ```

### Example Amazon Link Structure:
```
https://www.amazon.com/dp/B08XXXXXXX?tag=walletradar-20&utm_source=walletradar&utm_medium=affiliate&utm_campaign=hardware-wallet-trezor-safe-5
```

---

## Direct Manufacturer Contact Emails

### Priority Contacts (Top 8):
1. **Trezor:** partnerships@trezor.io (or check contact page)
2. **Keystone:** [Find on keyst.one contact page]
3. **ColdCard/Coinkite:** [Find on store.coinkite.com contact page]
4. **BitBox:** [Find on bitbox.swiss contact page]
5. **Blockstream:** [Find on blockstream.com contact page]
6. **Foundation Devices:** [Find on foundationdevices.com contact page]
7. **OneKey:** [Find on onekey.so contact page]
8. **Ledger:** partnerships@ledger.com (or check contact page)

---

## Implementation Notes

### Link Priority:
1. **Direct affiliate link** (if manufacturer program exists) - Highest commission
2. **Amazon affiliate link** (if available on Amazon) - Reliable, easy
3. **Direct purchase link** (no commission) - Fallback, better UX than nothing

### Link Placement:
- Hardware wallet comparison table: "Buy Now" button in price column
- Individual wallet pages: Prominent "Purchase" section
- Quick Picks section: Direct purchase links
- Hardware wallet detail pages: Multiple purchase options

### Disclosure Requirements:
- Add disclosure text: "We may earn a commission if you purchase through our links"
- Link to full disclosure page: `/affiliate-disclosure`
- Include disclosure in footer
- Review FTC guidelines

---

## Quick Stats

### Amazon Availability:
- ✅ **4 wallets confirmed:** Trezor (2 models), Ledger (3 models), SafePal, Tangem
- ❓ **6 wallets to verify:** Keystone, BitBox02, Blockstream Jade, Foundation Passport, OneKey, NGRAVE
- ❌ **1 wallet not on Amazon:** ColdCard

### Direct Programs:
- ❓ **Status unknown** for all wallets (need to contact)
- ✅ **Action:** Email all top 8 manufacturers
- ⏱️ **Timeline:** 1-2 weeks for responses

---

*Update this document as you discover affiliate programs and get approved.*
