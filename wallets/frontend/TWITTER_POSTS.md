# Twitter/X Post Templates for Wallet Radar

Ready-to-use tweet templates with links that will display rich Twitter Card previews.

## How Twitter Cards Work

When you share a Wallet Radar URL on Twitter/X, it automatically shows:
- **Large image preview** (1200x630 pixels)
- **Page title** from meta tags
- **Description** from meta tags
- **Site name** (Wallet Radar)

Each page category has a custom OG image:
| Page Type | OG Image | Shows |
|-----------|----------|-------|
| Software Wallets | `og-software-wallets.png` | Top 5 software wallets table |
| Hardware Wallets | `og-hardware-wallets.png` | Top 5 hardware wallets table |
| Crypto Cards | `og-crypto-cards.png` | Top 5 crypto cards table |
| Homepage/Other | `og-image.png` | Wallet Radar branding |

---

## Tweet Templates

### Software Wallets

**Thread Starter:**
```
Stop gambling on wallet updates breaking your dApp tests.

We've tracked GitHub activity, release frequency, and security audits for 24+ wallets to find the most STABLE MetaMask alternatives.

Rabby scored highest (92/100).

Full comparison:
https://walletradar.org/docs/wallet-comparison-unified-table/

#DeFi #Web3 #crypto
```

**Short Version:**
```
Looking for a MetaMask alternative?

We compared 24+ EVM wallets on security, activity, and developer experience.

Top 3:
1. Rabby (92) - Tx simulation + scam alerts
2. Trust (85) - 163 chains
3. Rainbow (82) - Great UX

https://walletradar.org/docs/wallet-comparison-unified-table/
```

**Developer Focus:**
```
If your dApp tests keep breaking because of wallet updates, you need this.

We track release frequency and GitHub activity for 24+ wallets so you can pick the most stable option.

Rabby: ~6 releases/month
Trust: actively maintained
Rainbow: regular updates

https://walletradar.org/docs/wallet-comparison-unified-table/
```

---

### Hardware Wallets

**Main Post:**
```
Looking for a Ledger alternative after the Recover controversy?

We've scored 23+ hardware wallets on:
- Security architecture
- Open source firmware
- Development activity
- Value for money

Top pick: Trezor Safe 5 (94/100)

https://walletradar.org/docs/hardware-wallet-comparison-table/
```

**Value Focus:**
```
Best value hardware wallet in 2025?

Trezor Safe 3 at $79:
- Secure Element (Optiga)
- Fully open source firmware
- Active development
- Score: 91/100

Full comparison of 23+ devices:
https://walletradar.org/docs/hardware-wallet-comparison-table/
```

**Security Focus:**
```
Open source hardware wallets ranked:

1. Trezor Safe 5 (94) - $169, Optiga SE
2. Keystone 3 Pro (91) - $149, 3x SE, air-gapped
3. ColdCard Mk4 (91) - $150, dual SE, BTC only
4. Trezor Safe 3 (91) - $79, best value
5. BitBox02 (88) - $150, reproducible builds

https://walletradar.org/docs/hardware-wallet-comparison-table/

#Bitcoin #crypto #security
```

---

### Crypto Cards

**Main Post:**
```
Tired of searching for the best crypto card?

We compared 27+ crypto debit & credit cards:
- Cashback rates (up to 10%)
- Availability (US/EU/Global)
- Fees & requirements

https://walletradar.org/docs/crypto-credit-card-comparison-table/
```

**EU Focus:**
```
Best crypto cards for EU residents:

1. Ready Card - 10% cashback
2. Bybit Card - up to 10% + multi-crypto
3. Plutus Card - 3-9% + perks

Full comparison with fees, requirements, and availability:
https://walletradar.org/docs/crypto-credit-card-comparison-table/

#crypto #DeFi
```

**US Focus:**
```
Crypto cards available in the US:

1. Coinbase Card - 1-4% in crypto
2. Fold Card - Bitcoin rewards
3. BitPay Card - crypto spending

See the full comparison with all 27+ cards:
https://walletradar.org/docs/crypto-credit-card-comparison-table/
```

---

### General/Homepage

**Site Launch:**
```
Wallet Radar

Developer-focused crypto wallet research:
- 24+ software wallets compared
- 23+ hardware wallets reviewed
- 27+ crypto cards analyzed

Free. Open source. No affiliate links.

https://walletradar.org/
```

**Feature Highlight:**
```
What makes Wallet Radar different?

We track what developers care about:
- GitHub activity & release frequency
- Security audits with links
- Transaction simulation support
- Scam/phishing protection
- Open source status

All free, all open source.

https://walletradar.org/
```

---

## Best Posting Times

| Day | Best Times (EST) |
|-----|-----------------|
| Monday-Thursday | 9am, 12pm, 5pm |
| Friday | 9am, 12pm |
| Weekend | 11am, 4pm |

## Recommended Hashtags

**Primary:** `#DeFi` `#Web3` `#crypto` `#Ethereum`

**Secondary:** `#MetaMask` `#CryptoWallet` `#blockchain` `#Bitcoin`

**Hardware specific:** `#Trezor` `#Ledger` `#ColdStorage`

---

## Validation Before Posting

Test your URLs with these validators before posting:

| Platform | Validator URL |
|----------|---------------|
| Twitter/X | https://cards-dev.twitter.com/validator |
| Facebook | https://developers.facebook.com/tools/debug/ |
| LinkedIn | https://www.linkedin.com/post-inspector/ |

### Local Validation

```bash
cd wallets/frontend
npm run build && npm run validate-cards
```

---

## UTM Parameters for Tracking

Add UTM parameters to track campaign performance:

```
https://walletradar.org/docs/wallet-comparison-unified-table/?utm_source=twitter&utm_medium=social&utm_campaign=software_dec2025
```

| Parameter | Value | Purpose |
|-----------|-------|---------|
| utm_source | twitter | Traffic source |
| utm_medium | social | Marketing medium |
| utm_campaign | software_dec2025 | Campaign name |
| utm_content | (optional) | A/B test variant |

---

*Last updated: December 2025*
