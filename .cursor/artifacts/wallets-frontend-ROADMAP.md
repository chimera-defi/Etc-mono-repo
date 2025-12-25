# Wallet Radar Roadmap

This document outlines potential improvements, new features, and monetization opportunities for Wallet Radar.

## Recently Implemented (December 2025)

- [x] Interactive side-by-side comparison tool (up to 4 wallets)
- [x] Advanced filtering UI with multi-select filters
- [x] Grid and table view modes
- [x] DeFiLlama API integration for chain TVL data
- [x] `/explore` page combining filtering and comparison

---

## Priority 1: Quick Wins (Immediate Revenue Potential)

### Affiliate Links & Monetization
- [ ] Add hardware wallet affiliate links (Ledger, Trezor, Keystone)
  - Estimated commission: 5-15% per sale
  - Implementation: Add `affiliateUrl` field to HardwareWallet type
- [ ] Add crypto card referral codes
  - Estimated revenue: $25-100 per signup
  - Implementation: Add `referralCode` field to CryptoCard type
- [ ] Add "Buy Now" CTAs with price tracking
- [ ] Clear affiliate disclosure banner

### Sponsored Listings
- [ ] Create "Featured Wallet" component with highlighted styling
- [ ] Add `sponsored` flag to wallet types
- [ ] Premium placement in comparison tables
- [ ] Estimated revenue: $500-2,000/month per listing

---

## Priority 2: Data Enhancements

### Additional Data Sources
- [ ] **L2Beat Integration** - Layer 2 risk scores and TVL
  - API: `https://l2beat.com/api`
  - Add L2 risk warnings to chain support data
- [ ] **Security Audit Aggregation**
  - Pull from: Certik, Trail of Bits, OpenZeppelin
  - Add audit score field with links to reports
- [ ] **GitHub Live Stats**
  - Real-time stars, forks, last commit
  - Use GitHub Actions for automated updates
- [ ] **Hardware Wallet Price Tracking**
  - Track prices over time
  - Add price history charts

### Chain Coverage Metrics
- [ ] Use `calculateChainCoverage()` from defillama.ts
- [ ] Show TVL coverage percentage per wallet
- [ ] Highlight which high-TVL chains are missing

---

## Priority 3: User Experience

### Wallet Recommendation Quiz
- [ ] Interactive questionnaire
- [ ] Questions:
  - "Developer or regular user?"
  - "Need hardware wallet support?"
  - "How many chains do you use?"
  - "Security priority level?"
- [ ] Personalized recommendations based on answers
- [ ] Route: `/quiz`

### Enhanced Comparison Features
- [ ] Save comparison to URL (shareable links)
- [ ] Export comparison as PDF
- [ ] Print-friendly view
- [ ] Comparison history (localStorage)

### Search Improvements
- [ ] Fuzzy search across all wallet attributes
- [ ] Search suggestions/autocomplete
- [ ] Recent searches history

---

## Priority 4: Platform Expansion

### Public API Endpoint
- [ ] Route: `/api/v1/wallets`
- [ ] Endpoints:
  - `GET /api/v1/wallets/software`
  - `GET /api/v1/wallets/hardware`
  - `GET /api/v1/wallets/cards`
  - `GET /api/v1/wallets/compare?ids=rabby,metamask`
- [ ] Rate limiting for free tier
- [ ] API key authentication for premium
- [ ] Revenue: $49-299/month for API access

### Browser Extension
- [ ] Quick wallet lookup when visiting dApps
- [ ] "Is this wallet safe?" badge
- [ ] Alert when connected wallet has known issues

### Telegram/Discord Bot
- [ ] `/wallet rabby` - Returns wallet summary
- [ ] `/compare metamask rabby` - Quick comparison
- [ ] Daily wallet update alerts
- [ ] Security incident notifications

### Newsletter
- [ ] Weekly wallet ecosystem updates
- [ ] New wallet releases
- [ ] Security incident alerts
- [ ] Sponsorship opportunities: $500-2,000/issue

---

## Priority 5: Community Features

### User Reviews & Ratings
- [ ] Anonymous review submission
- [ ] Upvote/downvote system
- [ ] Review moderation queue
- [ ] Aggregate user rating display

### Issue Reporting
- [ ] "Report outdated data" button
- [ ] Community-submitted corrections
- [ ] Verification workflow

### Wallet Submission
- [ ] Request new wallet form
- [ ] Community voting on additions
- [ ] Automated initial data fetch

---

## Technical Debt & Code Quality

### Type Consolidation
- [ ] Move all wallet types to shared `types/wallets.ts`
- [ ] Remove duplicate type definitions from:
  - `wallet-data.ts`
  - `WalletTable.tsx`
  - `ComparisonTool.tsx`

### Filter Logic Consolidation
- [ ] ExploreContent.tsx reimplements filter logic
- [ ] Consider using wallet-data.ts filter functions
- [ ] Or document why client-side reimplementation is needed

### Unused Code Cleanup
The following exports in `wallet-data.ts` are prepared for future API use but currently unused:
- `getAllWalletData()` - For API endpoint
- `FilterOptions` - For API filtering
- `filterSoftwareWallets/filterHardwareWallets/filterCryptoCards` - For API filtering
- `sortWallets` - For API sorting

The following in `defillama.ts` are prepared for future features:
- `getTopEVMChains()` - For chain coverage analysis
- `getEVMTotalTVL()` - For dashboard statistics
- `getChainByName()` - For chain-specific analysis
- `calculateChainCoverage()` - For wallet comparison metrics

---

## Revenue Projections

| Strategy | Effort | Monthly Revenue Est. |
|----------|--------|---------------------|
| Hardware Wallet Affiliates | Low | $500-2,000 |
| Crypto Card Referrals | Low | $1,000-3,000 |
| Sponsored Listings | Medium | $2,000-8,000 |
| API Access Tiers | Medium | $1,000-5,000 |
| Newsletter Sponsorship | Medium | $2,000-8,000 |
| Enterprise Data Licensing | High | $5,000-25,000/year |

---

## Implementation Order Recommendation

1. **Week 1-2**: Affiliate links & sponsored listings (immediate revenue)
2. **Week 3-4**: L2Beat integration + security audit data
3. **Week 5-6**: Wallet recommendation quiz
4. **Week 7-8**: Public API endpoint
5. **Ongoing**: Newsletter + community features

---

## Notes

- All prices and revenue estimates are approximate
- Verify affiliate program terms before implementation
- Consider GDPR/privacy implications for user features
- Newsletter requires email service (Buttondown, Substack, etc.)

---

*Last Updated: December 2025*
