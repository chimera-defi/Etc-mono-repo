# WalletRadar Implementation Checklists

**Website:** walletradar.org  
**Purpose:** Step-by-step implementation guides for monetization strategies

---

## Strategy 1: Affiliate Links (Hardware Wallets)

### Why This Works
- **Natural fit:** Users researching hardware wallets are in purchase mode
- **High-value transactions:** $50-400 per device
- **Non-intrusive:** Only appears on purchase intent pages
- **Maintains objectivity:** Scores unaffected by affiliate status

### Implementation Checklist

#### Phase 1: Research & Setup (Week 1)
- [ ] Research affiliate programs:
  - [ ] Trezor (check for affiliate program)
  - [ ] Ledger (check for affiliate program)
  - [ ] Keystone (check for affiliate program)
  - [ ] ColdCard (check for affiliate program)
  - [ ] BitBox02 (check for affiliate program)
  - [ ] Amazon Associates (fallback for all)
- [ ] Sign up for affiliate programs
- [ ] Get affiliate IDs/tracking codes
- [ ] Test affiliate links (verify tracking works)

#### Phase 2: Integration (Week 2)
- [ ] Create "Buy Now" buttons on hardware wallet detail pages
- [ ] Add affiliate links to:
  - [ ] Hardware wallet comparison table (purchase column)
  - [ ] Individual hardware wallet pages
  - [ ] "Quick Picks" section
- [ ] Implement link tracking (UTM parameters):
  - [ ] Source: walletradar.org
  - [ ] Medium: affiliate
  - [ ] Campaign: hardware-wallet-[name]
- [ ] Add click tracking (Google Analytics events)

#### Phase 3: Disclosure & Legal (Week 2)
- [ ] Create `/affiliate-disclosure` page:
  - [ ] Explain affiliate relationships
  - [ ] State that scores are unaffected
  - [ ] Link to FTC disclosure guidelines
- [ ] Add disclosure text near affiliate links:
  - [ ] "We may earn a commission if you purchase through our links"
  - [ ] Link to full disclosure page
- [ ] Add disclosure to footer
- [ ] Review FTC requirements for affiliate disclosure

#### Phase 4: Testing & Launch (Week 3)
- [ ] Test all affiliate links (verify they work)
- [ ] Test tracking (verify conversions are tracked)
- [ ] Test on mobile devices
- [ ] Verify disclosure is visible
- [ ] Launch with monitoring
- [ ] Set up conversion tracking dashboard

#### Phase 5: Optimization (Ongoing)
- [ ] Monitor conversion rates weekly
- [ ] A/B test button placement
- [ ] A/B test button text ("Buy Now" vs "Get [Wallet]" vs "Purchase")
- [ ] Track which wallets convert best
- [ ] Optimize for top-converting wallets
- [ ] Add price comparison (if multiple retailers)

### Success Metrics
- **Conversion rate:** Target 1-2% (visitors → purchases)
- **Revenue per visitor:** Target $0.50-2.00
- **Monthly revenue:** Target $500-2,000/month

### Technical Requirements
- Affiliate link management system
- Click tracking (Google Analytics or custom)
- Conversion tracking (affiliate network dashboard)
- Mobile-responsive buttons

---

## Strategy 2: Sponsored Wallet Listings

### Why This Works
- **Wallets want visibility:** Especially newer/lesser-known wallets
- **Developers understand:** Sponsored content is normal
- **Maintains trust:** Clear disclosure + scores unaffected
- **Recurring revenue:** Monthly sponsorships

### Implementation Checklist

#### Phase 1: Define Offering (Week 1)
- [ ] Create sponsorship tiers:
  - [ ] **Featured Listing:** $500/month
    - Top placement in "Sponsored" section
    - Badge on main comparison table
    - Link to detailed sponsored page
  - [ ] **Standard Listing:** $200/month
    - Placement in "Sponsored" section
    - Badge on main comparison table
- [ ] Set minimum requirements:
  - [ ] Minimum score threshold (e.g., ≥60)
  - [ ] Must have GitHub repo (or be well-known)
  - [ ] Must be actively maintained
- [ ] Create sponsorship agreement template

#### Phase 2: Build Sponsored Section (Week 2)
- [ ] Design "Sponsored" section UI:
  - [ ] Clearly marked with "Sponsored" badge
  - [ ] Separate from main comparison table
  - [ ] Visual distinction (different background color?)
- [ ] Create sponsored wallet detail pages:
  - [ ] Extended description
  - [ ] Logo and branding
  - [ ] Links to website/docs
  - [ ] Call-to-action buttons
- [ ] Add "Sponsored" badge to main table (if applicable)
- [ ] Add disclosure: "Sponsored listings do not affect our scoring methodology"

#### Phase 3: Sales & Onboarding (Week 3-4)
- [ ] Create sponsorship sales page:
  - [ ] Pricing tiers
  - [ ] What's included
  - [ ] Requirements
  - [ ] Contact form
- [ ] Reach out to potential sponsors:
  - [ ] Newer wallets (need visibility)
  - [ ] Wallets with marketing budgets
  - [ ] Wallets launching new features
- [ ] Create onboarding process:
  - [ ] Collect wallet info
  - [ ] Verify eligibility
  - [ ] Set up payment (Stripe?)
  - [ ] Create sponsored listing

#### Phase 4: Analytics & Reporting (Week 4)
- [ ] Set up analytics for sponsors:
  - [ ] Impressions (page views)
  - [ ] Clicks (to wallet site)
  - [ ] Conversion tracking (if possible)
- [ ] Create monthly reports for sponsors:
  - [ ] Impressions
  - [ ] Clicks
  - [ ] Click-through rate
  - [ ] Top referring pages
- [ ] Set up automated reporting

#### Phase 5: Launch & Iterate (Week 5+)
- [ ] Launch with 1-2 pilot sponsors
- [ ] Monitor feedback
- [ ] Iterate on pricing/features
- [ ] Scale to more sponsors
- [ ] Rotate sponsors monthly (if oversubscribed)

### Success Metrics
- **Sponsors:** Target 2-5 active sponsors
- **Monthly revenue:** Target $1,000-5,000/month
- **Click-through rate:** Target 2-5% (sponsored → wallet site)
- **Sponsor retention:** Target 80%+ renewal rate

### Technical Requirements
- Sponsored content CMS
- Payment processing (Stripe)
- Analytics dashboard for sponsors
- Email automation for reports

---

## Strategy 3: API Access / Data Licensing

### Why This Works
- **Developers need programmatic access:** For their own tools/dashboards
- **Recurring revenue:** Monthly subscriptions
- **Low marginal cost:** Data already exists
- **High value:** Saves developers time

### Implementation Checklist

#### Phase 1: Define API Offering (Week 1)
- [ ] Create API tiers:
  - [ ] **Free:** 1,000 requests/month
    - Basic wallet data (name, score, status)
    - Rate limit: 10 requests/minute
    - Requires attribution
  - [ ] **Pro:** $99/month - 10,000 requests/month
    - Full wallet data (all fields)
    - Rate limit: 100 requests/minute
    - Webhook support (wallet updates)
    - No attribution required
  - [ ] **Enterprise:** $499/month - Unlimited
    - Everything in Pro
    - Custom fields/endpoints
    - Priority support
    - SLA (99.9% uptime)
- [ ] Design API endpoints:
  - [ ] `GET /api/v1/wallets` - List all wallets
  - [ ] `GET /api/v1/wallets/:id` - Get wallet details
  - [ ] `GET /api/v1/wallets/:id/history` - Historical scores
  - [ ] `GET /api/v1/hardware` - Hardware wallets
  - [ ] `POST /api/v1/webhooks` - Register webhook

#### Phase 2: Build API (Week 2-3)
- [ ] Set up API infrastructure:
  - [ ] Choose framework (Express.js, FastAPI, etc.)
  - [ ] Set up rate limiting
  - [ ] Set up authentication (API keys)
  - [ ] Set up request logging
- [ ] Implement endpoints:
  - [ ] Wallet listing (with filters)
  - [ ] Wallet details
  - [ ] Historical data (if available)
  - [ ] Webhook registration
- [ ] Add API documentation:
  - [ ] OpenAPI/Swagger spec
  - [ ] Code examples (curl, JavaScript, Python)
  - [ ] Authentication guide
  - [ ] Rate limit documentation

#### Phase 3: Authentication & Billing (Week 3)
- [ ] Set up API key system:
  - [ ] Generate API keys for users
  - [ ] Store keys securely (hashed)
  - [ ] Track usage per key
- [ ] Integrate billing:
  - [ ] Stripe for payments
  - [ ] Usage tracking
  - [ ] Automatic upgrades/downgrades
  - [ ] Invoice generation
- [ ] Set up user dashboard:
  - [ ] API key management
  - [ ] Usage statistics
  - [ ] Billing history
  - [ ] Upgrade/downgrade options

#### Phase 4: Testing & Documentation (Week 4)
- [ ] Write comprehensive API docs:
  - [ ] Getting started guide
  - [ ] Authentication
  - [ ] Endpoint reference
  - [ ] Code examples
  - [ ] Error handling
  - [ ] Rate limits
- [ ] Test API thoroughly:
  - [ ] All endpoints
  - [ ] Rate limiting
  - [ ] Error cases
  - [ ] Authentication
- [ ] Create API playground (optional):
  - [ ] Interactive API tester
  - [ ] Try endpoints without code

#### Phase 5: Launch & Marketing (Week 5)
- [ ] Create API landing page:
  - [ ] Features
  - [ ] Pricing
  - [ ] Documentation link
  - [ ] Sign up CTA
- [ ] Add API link to main site footer
- [ ] Announce on:
  - [ ] Twitter/X
  - [ ] Reddit (r/ethereum, r/ethdev)
  - [ ] Dev communities
- [ ] Offer early adopter discount (first 10 users get 50% off)
- [ ] Monitor usage and feedback

### Success Metrics
- **API users:** Target 10-50 users (Year 1)
- **Monthly revenue:** Target $500-3,000/month
- **API uptime:** Target 99.9%
- **Average requests/user:** Track to optimize pricing

### Technical Requirements
- API server (Node.js, Python, etc.)
- Database (for API keys, usage tracking)
- Rate limiting middleware
- Authentication system
- Billing integration (Stripe)
- API documentation (Swagger/OpenAPI)

---

## Strategy 4: Pro Subscription (Revised)

### Why This Works (Revised Value Prop)
- **Historical tracking:** See how wallet scores changed over time (unique value)
- **Export capabilities:** CSV/JSON for reports/presentations
- **Email alerts:** Get notified when wallets change status
- **Advanced filtering:** Custom score ranges, multiple criteria
- **API access included:** 1,000 requests/month (entry-level API tier)

### Implementation Checklist

#### Phase 1: Define Value Proposition (Week 1)
- [ ] Research what developers actually need:
  - [ ] Survey current users (if possible)
  - [ ] Analyze common use cases
  - [ ] Identify pain points
- [ ] Define Pro features:
  - [ ] ✅ Historical score tracking (6+ months of data)
  - [ ] ✅ Export to CSV/JSON
  - [ ] ✅ Email alerts (wallet status changes, new wallets)
  - [ ] ✅ Advanced filtering (custom score ranges, multiple criteria)
  - [ ] ✅ API access (1,000 requests/month)
  - [ ] ✅ Ad-free experience
  - [ ] ✅ Priority support
- [ ] Set pricing: $9/month or $90/year (2 months free)

#### Phase 2: Build Historical Tracking (Week 2-3)
- [ ] Set up data versioning system:
  - [ ] Store wallet snapshots monthly
  - [ ] Track score changes over time
  - [ ] Store status changes (active → inactive)
- [ ] Create historical data visualization:
  - [ ] Score trends over time (line chart)
  - [ ] Status change timeline
  - [ ] Comparison view (compare 2+ wallets over time)
- [ ] Add "History" tab to wallet detail pages (Pro only)

#### Phase 3: Build Export & Alerts (Week 3-4)
- [ ] Implement CSV/JSON export:
  - [ ] Export current filtered view
  - [ ] Export all wallets
  - [ ] Include all fields
  - [ ] Format dates consistently
- [ ] Build email alert system:
  - [ ] Track wallet changes (score, status, new wallets)
  - [ ] Send weekly digest (or real-time)
  - [ ] Allow users to customize alerts
  - [ ] Use email service (SendGrid, Mailgun, etc.)

#### Phase 4: Advanced Filtering (Week 4)
- [ ] Add advanced filter UI:
  - [ ] Custom score range slider
  - [ ] Multiple criteria (AND/OR logic)
  - [ ] Save filter presets
  - [ ] Share filter URLs
- [ ] Implement filter logic:
  - [ ] Score range filtering
  - [ ] Multiple criteria combination
  - [ ] Performance optimization

#### Phase 5: Payment & User Management (Week 5)
- [ ] Set up Stripe:
  - [ ] Create products (monthly/annual)
  - [ ] Set up webhooks (payment events)
  - [ ] Handle subscription lifecycle
- [ ] Build user accounts:
  - [ ] Sign up / login
  - [ ] Subscription management
  - [ ] Billing history
  - [ ] Cancel subscription
- [ ] Implement Pro feature gating:
  - [ ] Check subscription status
  - [ ] Show upgrade prompts
  - [ ] Limit free tier features

#### Phase 6: Launch & Marketing (Week 6)
- [ ] Create Pro landing page:
  - [ ] Feature comparison (Free vs Pro)
  - [ ] Pricing
  - [ ] Testimonials (if available)
  - [ ] Sign up CTA
- [ ] Add upgrade prompts:
  - [ ] On export button (free users)
  - [ ] On historical data (free users)
  - [ ] On advanced filters (free users)
- [ ] Launch with early adopter discount:
  - [ ] First 50 users get 50% off first year
  - [ ] Limited time offer
- [ ] Announce on:
  - [ ] Twitter/X
  - [ ] Reddit
  - [ ] Dev communities

### Success Metrics
- **Conversion rate:** Target 2-5% (free → Pro)
- **Monthly revenue:** Target $500-2,000/month
- **Churn rate:** Target <5% monthly
- **Feature usage:** Track which features are most used

### Technical Requirements
- User authentication system
- Subscription management (Stripe)
- Historical data storage
- Email service (SendGrid/Mailgun)
- Export functionality (CSV/JSON)
- Feature gating system

---

## Strategy 5: Job Board (Revised - Lower Priority)

### Why This Might Work
- **Natural fit:** Developers researching wallets might be job seekers
- **Wallet companies need talent:** They're hiring
- **High-value for employers:** $100-500 per listing

### Why This Might NOT Work
- **Chicken-and-egg problem:** Need traffic first
- **Developers don't come for jobs:** They come for wallet research
- **Competitive market:** Many job boards exist
- **Low priority:** Focus on core monetization first

### Implementation Checklist (If Proceeding)

#### Phase 1: Validate Demand (Week 1)
- [ ] Survey users: "Would you use a job board here?"
- [ ] Reach out to wallet companies: "Would you post jobs?"
- [ ] Research competitor job boards
- [ ] Decide: Proceed or defer?

#### Phase 2: Build MVP (Week 2-3)
- [ ] Create job posting form
- [ ] Create job listing page
- [ ] Add filters (wallet company, location, remote, role type)
- [ ] Set up payment (Stripe)
- [ ] Moderate listings (ensure quality)

#### Phase 3: Launch (Week 4)
- [ ] Get 3-5 pilot job postings
- [ ] Launch with limited promotion
- [ ] Monitor engagement
- [ ] Iterate based on feedback

### Recommendation
**Defer to Phase 2 (Month 6+)** - Focus on core monetization first (affiliates, sponsors, API, Pro). Revisit when traffic is higher.

---

## Strategy 6: Enterprise Certification (REVISED - NOT RECOMMENDED)

### Why This Does NOT Make Sense
- **WalletRadar isn't a security firm:** Wallets already get audits from real audit firms
- **Overreaching:** Damages credibility
- **Competitive disadvantage:** Can't compete with real audit firms
- **Trust risk:** Might be seen as "pay for certification"

### Alternative: Wallet Research Reports
Instead of certification, offer:
- **Custom research reports:** $2,000-5,000 per report
- **Private wallet evaluations:** For enterprises choosing wallets
- **Integration consulting:** Help companies integrate wallets
- **Security analysis:** Partner with real audit firms

### Recommendation
**Skip certification.** Focus on what WalletRadar does well: comparison and analysis. Offer consulting/research instead.

---

## Implementation Priority

### Phase 1: Quick Wins (Months 1-2)
1. ✅ **Affiliate Links** - Easiest, natural fit
2. ✅ **Sponsored Listings** - Good revenue, maintains trust

### Phase 2: Core Monetization (Months 3-6)
3. ✅ **API Access** - Recurring revenue, developer-focused
4. ✅ **Pro Subscription** - Recurring revenue, unique value (historical tracking)

### Phase 3: Scale (Months 6-12)
5. ⚠️ **Job Board** - Revisit when traffic is higher
6. ✅ **Consulting/Research** - High-value B2B

### Skip
- ❌ **Enterprise Certification** - Overreaching, not core competency

---

*Last updated: December 2025*
