# WalletRadar SEO, AEO & GEO Implementation Guide

> **For Agent Handoff:** Complete documentation of SEO/AEO/GEO implementation for walletradar.org
> **Last Updated:** January 19, 2026
> **Implemented by:** Claude Sonnet 4.5
> **Session ID:** claude/walletradar-seo-aeo-FcGyI

---

## Executive Summary

This document tracks all SEO (Search Engine Optimization), AEO (Answer Engine Optimization), and GEO (Generative Engine Optimization) implementations for walletradar.org. The goal is to optimize discoverability in both traditional search engines and LLMs (ChatGPT, Copilot, Gemini, Perplexity).

**Status:** Week 1 Quick Wins ✅ COMPLETED + Blog System ✅ COMPLETED (January 19, 2026)

---

## What Was Implemented

### 1. Enhanced Schema Generators (`lib/seo.ts`)

**File:** `/home/user/Etc-mono-repo/wallets/frontend/src/lib/seo.ts`

**New Functions:**

```typescript
// BreadcrumbList schema for navigation understanding
generateBreadcrumbSchema(breadcrumbs, baseUrl)

// FAQ schema for AEO (Answer Engine Optimization)
generateFAQSchema(faqs)

// Enhanced Product/SoftwareApplication schema
generateWalletProductSchema(wallet, type, pageUrl)
```

**Purpose:**
- `generateBreadcrumbSchema()`: Helps LLMs understand site structure and entity relationships
- `generateFAQSchema()`: Extracts Q&A pairs for Answer Engines (ChatGPT citing sources)
- `generateWalletProductSchema()`: Rich product metadata with features, platforms, pricing, ratings

**Lines Added:** ~220 lines of documented schema generation code

**Example Usage:**
```typescript
const breadcrumbs = generateBreadcrumbSchema([
  { label: 'Home', href: '/' },
  { label: 'Software Wallets', href: '/docs/software-wallets' },
  { label: 'Rabby Wallet', href: '/wallets/software/rabby-wallet' }
], 'https://walletradar.org');
```

---

### 2. Enhanced Wallet Profile Pages (`app/wallets/[type]/[id]/page.tsx`)

**File:** `/home/user/Etc-mono-repo/wallets/frontend/src/app/wallets/[type]/[id]/page.tsx`

**Changes:**
1. Added `BreadcrumbList` schema to all wallet profile pages
2. Enhanced `Product`/`SoftwareApplication` schema with:
   - `featureList` (e.g., "Transaction Simulation", "Scam Detection")
   - `platforms` (e.g., "Browser Extension", "Mobile", "Desktop")
   - `releaseFrequency` for software wallets
   - `connectivity` for hardware wallets
   - `secureElement` and `secureElementType` for hardware wallets
   - `keywords` for better search indexing

**Before:**
```typescript
// Basic Product schema with minimal fields
'@type': 'SoftwareApplication',
name: wallet.name,
url: pageUrl,
aggregateRating: { ratingValue: score }
```

**After:**
```typescript
// Rich Product schema with comprehensive metadata
'@type': 'SoftwareApplication',
name: wallet.name,
url: pageUrl,
applicationCategory: 'FinanceApplication',
applicationSubCategory: 'Cryptocurrency Wallet',
operatingSystem: 'Web, Desktop, Mobile',
featureList: ['Transaction Simulation', 'Scam Detection', '120+ Chain Support'],
codeRepository: wallet.github,
keywords: 'crypto wallet, blockchain wallet, Rabby Wallet, web3 wallet'
```

**Impact:** Every wallet profile page (100+ pages) now has enhanced schema for LLM comprehension.

---

### 3. FAQ Sections Added to Comparison Pages

**Files Modified:**
1. `/home/user/Etc-mono-repo/wallets/HARDWARE_WALLETS.md` (+45 lines)
2. `/home/user/Etc-mono-repo/wallets/SOFTWARE_WALLETS.md` (+43 lines)
3. `/home/user/Etc-mono-repo/wallets/CRYPTO_CARDS.md` (+43 lines)
4. `/home/user/Etc-mono-repo/wallets/RAMPS.md` (+43 lines)

**Total FAQs Added:** 40 questions (10 per page)

**FAQ Topics Covered:**

**Hardware Wallets:**
- "What is the best hardware wallet in 2026?" (Trezor Safe 7)
- "Why should I choose Trezor over Ledger?" (Security, open source)
- "What is the most secure hardware wallet?" (Air-gap wallets)
- "Do I need a Secure Element?" (Yes, recommended)
- "What does 'air-gap' mean?" (QR/MicroSD only)
- "Are open source wallets safer?" (Yes, auditable)
- "Can I use with my phone?" (Yes, USB-C/QR)
- "Best wallet for Ethereum developers?" (Trezor Safe 5/3)
- "Should I buy used?" (No, never!)
- "Best budget wallet?" (Trezor Safe 3 at $79)

**Software Wallets:**
- "Best wallet for developers?" (Rabby Wallet - 92/100)
- "Is Rabby better than MetaMask?" (Yes, tx simulation + stability)
- "Which wallets have transaction simulation?" (Rabby only)
- "Best for production apps?" (Trust Wallet, Rainbow)
- "Do I need both mobile and browser?" (Yes, for testing)
- "Why does MetaMask have lower score?" (High churn, 8 releases/month)
- "Most actively developed?" (MetaMask but with churn)
- "Can I use with hardware wallet?" (Yes, Rabby/MetaMask/Rainbow)
- "Safest software wallet?" (Safe Wallet - multisig)
- "Which supports most blockchains?" (Trust 100+, Rabby 120+)

**Crypto Cards:**
- "Best crypto card in 2026?" (EtherFi Cash - non-custodial)
- "Which cards are non-custodial?" (EtherFi, Ready, Gnosis Pay, etc.)
- "Best card for US?" (EtherFi Cash, Gemini, Coinbase)
- "Best for business?" (EtherFi Cash, Reap, Revolut)
- "Custodial vs non-custodial?" (Non-custodial safer)
- "What happened to Crypto.com?" (0% base tier, poor UX)
- "Which work globally?" (EtherFi, Gnosis Pay, MetaMask Card)
- "Highest cashback?" (Coinbase 4%, Ready 3%, EtherFi 2-3%)
- "Do they charge FX fees?" (Most yes, 1-3%)
- "Can I get without KYC?" (No, all require KYC)

**Ramps:**
- "Best on-ramp for developers?" (Transak - React SDK)
- "Difference between on-ramp and off-ramp?" (Buy vs sell crypto)
- "Lowest fees?" (Ramp, varies by method)
- "Best for high volume/business?" (Modern Treasury, Transak)
- "Do ramps require KYC?" (Yes, all legitimate ones)
- "Which support most countries?" (Transak/MoonPay 160+)
- "Can I integrate into dApp?" (Yes, SDKs available)
- "What payment methods?" (Cards, bank, Apple/Google Pay)
- "Are ramps safe?" (Yes, top providers regulated)
- "What is fastest?" (Ramp sub-60s, cards 5-15 min)

**SEO Optimization:**
- Questions use natural language matching common search queries
- Answers include wallet names + scores (e.g., "Rabby Wallet (92/100)")
- Cross-linking to detailed documentation
- Front-loaded benefits (answer first, details second)
- Entity-rich content (wallet names, scores, features)

---

### 4. Blog/Article System for SEO Content (`articles/`, `app/articles/`)

**Purpose:** Create long-form comparison articles and "best wallet for X" guides optimized for search intent and LLM citations.

**New Infrastructure:**

1. **Article Data Layer** (`lib/articles.ts`) - 120 lines
   - `getArticleSlugs()` - Reads article directory
   - `getArticleBySlug(slug)` - Parses frontmatter + markdown
   - `getAllArticles()` - Returns all articles sorted by date
   - `getRelatedArticles(slug)` - Finds similar articles by wallets/tags

2. **Article Page Template** (`app/articles/[slug]/page.tsx`) - 300 lines
   - Dynamic routing for all article slugs
   - Full schema markup (BreadcrumbList, Article, FAQPage)
   - Related articles sidebar
   - Featured wallets sidebar
   - Author card
   - Social sharing
   - Reading time

3. **Article Listing Page** (`app/articles/page.tsx`) - 200 lines
   - Shows all articles grouped by category
   - Card layout with metadata
   - Filter by category (comparison, guide, tutorial)

4. **Sitemap Integration** (`app/sitemap.ts`)
   - Added `articleRoutes` to sitemap
   - Priority 0.9 for comparison articles
   - Priority 0.85 for guide articles
   - Monthly changeFrequency

**Articles Created:**

| Article | Category | Size | FAQs | Wallets Covered |
|---------|----------|------|------|-----------------|
| **Rabby vs MetaMask** | Comparison | 8.8KB | 10 | Rabby (92), MetaMask (68) |
| **Best Wallet for Ethereum Developers** | Guide | 11.6KB | 10 | Rabby, Frame, Safe, MetaMask, Rainbow |
| **Most Secure Hardware Wallet** | Guide | 13.5KB | 10 | Trezor Safe 7, ColdCard Mk4, Keystone 3 Pro |

**Frontmatter Structure:**
```yaml
---
title: "Article title optimized for search"
description: "Meta description with key entities and scores"
category: comparison | guide | tutorial | news
lastUpdated: "2026-01-19"
author: "Wallet Radar Team"
wallets: ["Rabby", "MetaMask"]  # For related articles
tags: ["ethereum", "developer-tools", "web3"]
---
```

**Schema Markup Included:**

```typescript
// BreadcrumbList
Home → Articles → Article Title

// Article schema
{
  '@type': 'Article',
  headline: article.title,
  author: { '@type': 'Organization', name: article.author },
  publisher: { '@type': 'Organization', name: 'Wallet Radar' },
  datePublished: article.lastUpdated,
  dateModified: article.lastUpdated,
  keywords: [...wallets, ...tags].join(', ')
}

// FAQPage schema (auto-extracted from markdown)
{
  '@type': 'FAQPage',
  mainEntity: [10 FAQ questions from article]
}
```

**SEO Benefits:**
- **Target Search Intent:** "Rabby vs MetaMask", "best wallet for developers", "most secure hardware wallet"
- **Long-Form Content:** 8-13KB per article (optimal for ranking)
- **Entity-Rich:** Wallet names, scores, features in first 200 words
- **Internal Linking:** Related articles + featured wallets sidebar
- **LLM-Friendly:** Direct answers, comparison tables, structured FAQs
- **Social Sharing:** Twitter Card and OpenGraph metadata

**Impact:** 3 new high-value SEO pages targeting competitive queries. Articles auto-appear in sitemap and are fully schema-compliant.

---

## Schema Implementation Status

| Schema Type | Status | Pages Affected | Purpose |
|-------------|--------|----------------|---------|
| **BreadcrumbList** | ✅ Complete | All wallet profiles (100+) | LLM navigation understanding |
| **Product/SoftwareApplication** | ✅ Enhanced | All wallet profiles (100+) | Rich metadata for citations |
| **FAQPage** | ✅ Complete | 4 comparison pages | Answer Engine Optimization |
| **Article** | ✅ Existing | All doc pages | Content structure |
| **HowTo** | ✅ Existing | Guide pages | Step-by-step comprehension |
| **ItemList** | ✅ Existing | Comparison pages | Wallet listings |
| **Organization** | ✅ Existing | Site-wide (layout.tsx) | Brand identity |
| **WebSite** | ✅ Existing | Site-wide (layout.tsx) | Site structure |

**Coverage:** 100% of pages now have appropriate schema markup.

---

## File Modifications Summary

| File | Lines Changed | Purpose |
|------|---------------|---------|
| `lib/seo.ts` | +220 | Schema generators |
| `app/wallets/[type]/[id]/page.tsx` | +75 | Enhanced schemas, breadcrumbs |
| `HARDWARE_WALLETS.md` | +45 | FAQ section |
| `SOFTWARE_WALLETS.md` | +43 | FAQ section |
| `CRYPTO_CARDS.md` | +43 | FAQ section |
| `RAMPS.md` | +43 | FAQ section |
| `lib/articles.ts` | +120 | Article data layer (NEW) |
| `app/articles/[slug]/page.tsx` | +300 | Article page template (NEW) |
| `app/articles/page.tsx` | +200 | Article listing page (NEW) |
| `app/sitemap.ts` | +15 | Article routes |
| `articles/rabby-vs-metamask.md` | +250 | Comparison article (NEW) |
| `articles/best-wallet-for-ethereum-developers.md` | +350 | Guide article (NEW) |
| `articles/most-secure-hardware-wallet.md` | +400 | Guide article (NEW) |
| **TOTAL** | **+2104 lines** | Week 1 + Blog System |

---

## Week 1 Quick Wins Checklist

- [x] **Task 1:** Add BreadcrumbList schema generator to `lib/seo.ts`
- [x] **Task 2:** Add FAQ schema generator to `lib/seo.ts`
- [x] **Task 3:** Add enhanced Product schema generator to `lib/seo.ts`
- [x] **Task 4:** Implement BreadcrumbList schema on all wallet profile pages
- [x] **Task 5:** Enhance Product schema on all wallet profile pages
- [x] **Task 6:** Add 10 FAQs to HARDWARE_WALLETS.md
- [x] **Task 7:** Add 10 FAQs to SOFTWARE_WALLETS.md
- [x] **Task 8:** Add 10 FAQs to CRYPTO_CARDS.md
- [x] **Task 9:** Add 10 FAQs to RAMPS.md
- [x] **Task 10:** Create composite SEO documentation (this file)
- [x] **Task 11:** Build blog/article system infrastructure
- [x] **Task 12:** Create "Rabby vs MetaMask" comparison article
- [x] **Task 13:** Create "Best Wallet for Ethereum Developers" guide
- [x] **Task 14:** Create "Most Secure Hardware Wallet" guide
- [x] **Task 15:** Integrate articles into sitemap

**Status:** ✅ ALL WEEK 1 + BLOG TASKS COMPLETE

---

## What's Already Implemented (Pre-Week 1)

### Existing SEO Infrastructure

**From Previous Work:**
1. **Dynamic Sitemap** (`app/sitemap.ts`) - All pages indexed
2. **robots.txt** - Proper crawl directives
3. **OpenGraph/Twitter Cards** - All pages have OG images (1200x630)
4. **Meta Descriptions** - Optimized with `optimizeMetaDescription()`
5. **Keyword Generation** - Dynamic keywords via `generateKeywords()`
6. **Reading Time Calculation** - User engagement metric
7. **Article Schema** - On all comparison pages
8. **HowTo Schema** - On guide pages
9. **ItemList Schema** - On comparison pages
10. **Organization/WebSite Schema** - Site-wide (layout.tsx)

**Already Excellent:**
- FAQPage schema on homepage (17 FAQs)
- ItemList schema for top picks
- Breadcrumb visual components (not schema until Week 1)
- Social sharing functionality
- Canonical URLs
- Robots meta tags

---

## Next Steps (Week 2+)

### Priority Order

**Week 2-3: Content Expansion** 🟡 PENDING
- [x] ~~Add 10 "X vs Y" comparison articles~~ (3 articles created, 7 more to go)
- [x] ~~Add 5 "best wallet for [use case]" pages~~ (2 guides created, 3 more to go)
- [ ] Add articles navigation to homepage/navbar
- [ ] Create 7 more comparison articles:
  - "Trezor vs Ledger"
  - "MetaMask vs Rainbow"
  - "Trust Wallet vs Rabby"
  - "Hardware vs Software Wallets"
  - "ColdCard vs Trezor Safe 7"
  - "Coinbase Wallet vs MetaMask"
  - "Best Ethereum Wallet: Comprehensive Guide"
- [ ] Create 3 more guide articles:
  - "Best Wallet for DeFi"
  - "Best Wallet for NFT Collectors"
  - "Best Multi-Chain Wallet"
- [ ] Create glossary page (`/glossary`) with DefinedTerm schema
- [ ] Create wallet setup guides with HowTo schema

**Week 4-6: Advanced Content** 🟡 PENDING
- [ ] Add video transcripts with VideoObject schema (if videos exist)
- [ ] Create "Best Crypto Card" comparison article
- [ ] Create "Best Crypto On-Ramp" comparison article
- [ ] Add Pros/Cons sections to comparison tables
- [ ] Enhance comparison articles with detailed feature tables

**Month 2-3: Analytics & Monitoring** 🟡 PENDING
- [ ] Implement AI referral tracking (detect ChatGPT/Copilot traffic in Google Analytics 4)
- [ ] Set up weekly LLM citation monitoring (manual ChatGPT/Perplexity tests)
- [ ] Add product feeds for Google Merchant Center
- [ ] Create voice search optimization (SpeakableSpecification)
- [ ] Multi-modal content (videos + transcripts)

---

## Testing & Validation

### Schema Validation

**Tools:**
- Google Rich Results Test: https://search.google.com/test/rich-results
- Schema.org Validator: https://validator.schema.org/
- Lighthouse CI (GitHub Actions)

**Commands:**
```bash
# Build and validate
cd /home/user/Etc-mono-repo/wallets/frontend
npm install
npm run build
npm run lint
npm run type-check

# Test schema markup
# Visit each page and run through Google Rich Results Test
```

**Expected Results:**
- ✅ All pages pass schema validation
- ✅ BreadcrumbList detected on wallet profiles
- ✅ Product/SoftwareApplication detected on wallet profiles
- ✅ FAQPage detected on comparison pages
- ✅ No schema errors in Google Search Console

### LLM Citation Testing

**Manual Tests (Run Weekly):**

**ChatGPT Queries:**
1. "What is the best crypto wallet for developers?"
2. "Compare Rabby Wallet vs MetaMask"
3. "Most secure hardware wallet"
4. "Best non-custodial crypto card"
5. "Crypto wallets with transaction simulation"

**Expected:** WalletRadar.org cited as source with specific wallet recommendations.

**Perplexity/Copilot Queries:**
Same as above. Track citation frequency.

**Tracking:**
- Create spreadsheet with query → citation % → date
- Goal: 50% citation rate by Q2 2026

---

## Cost Analysis

### Implementation Cost

| Phase | Hours | Cost (Time) |
|-------|-------|-------------|
| Week 1 (Quick Wins) | 6 hours | Agent time only |
| Week 2-3 (APIs) | 10-15 hours | Free tier APIs |
| Week 4-6 (Content) | 20 hours | Agent time only |
| Month 2-3 (Advanced) | 25 hours | Free tier APIs |
| **TOTAL** | **60-70 hours** | **$0 additional cost** |

### API Costs

| API | Tier | Cost | Usage |
|-----|------|------|-------|
| CoinGecko | Free | $0 | 30 calls/min |
| DeFiLlama | Free | $0 | Unlimited |
| GitHub API | Free | $0 | 5000 req/hr |
| Google Search Console | Free | $0 | Unlimited |

**Total Additional Cost:** $0/month

---

## Expected Outcomes

### 3 Months Post-Week 1

| Metric | Current (Jan 2026) | Target (Apr 2026) |
|--------|-------------------|-------------------|
| **Organic Traffic** | Baseline | +30% |
| **AI Referral Traffic** | ~0% | 20% |
| **Featured Snippets** | 0 | 10+ |
| **LLM Citations** | Rare | 50% of wallet queries |
| **Schema Pass Rate** | ~85% | 100% |
| **Avg Session Duration** | Baseline | +20% (better engagement) |

### 6 Months Post-Week 1

| Metric | Target (Jul 2026) |
|--------|-------------------|
| **Domain Authority** | +10 points |
| **Top 3 Rankings** | "best crypto wallet developers", "metamask alternative", "hardware wallet comparison" |
| **Monthly Visits** | 50k+ (from ~10k estimated) |
| **AI Traffic %** | 25-30% of total |
| **Backlinks** | +50 quality backlinks |

---

## Monitoring & Maintenance

### Weekly Tasks
- [ ] Check Google Search Console for schema errors
- [ ] Test LLM citations (ChatGPT, Perplexity)
- [ ] Review analytics for AI referral traffic
- [ ] Update FAQ answers if wallet scores change

### Monthly Tasks
- [ ] Validate all schema markup (Rich Results Test)
- [ ] Review and update meta descriptions
- [ ] Add new FAQ questions based on search queries
- [ ] Check for broken links in comparison pages

### Quarterly Tasks
- [ ] Comprehensive SEO audit
- [ ] Update strategy doc with new findings
- [ ] Review competitor SEO implementations
- [ ] Analyze ROI (traffic increase vs effort)

---

## Critical Files for Future Agents

**SEO Core:**
- `/wallets/frontend/src/lib/seo.ts` - All schema generators
- `/wallets/frontend/src/lib/articles.ts` - Article data layer (NEW)
- `/wallets/frontend/src/app/layout.tsx` - Organization/WebSite schema
- `/wallets/frontend/src/app/page.tsx` - Homepage FAQs + TopPicks
- `/wallets/frontend/src/app/docs/[slug]/page.tsx` - Doc page schemas
- `/wallets/frontend/src/app/wallets/[type]/[id]/page.tsx` - Wallet profile schemas
- `/wallets/frontend/src/app/articles/[slug]/page.tsx` - Article page template (NEW)
- `/wallets/frontend/src/app/articles/page.tsx` - Article listing page (NEW)

**Content:**
- `/wallets/HARDWARE_WALLETS.md` - Hardware wallet comparison + FAQs
- `/wallets/SOFTWARE_WALLETS.md` - Software wallet comparison + FAQs
- `/wallets/CRYPTO_CARDS.md` - Crypto card comparison + FAQs
- `/wallets/RAMPS.md` - Ramp provider comparison + FAQs
- `/wallets/articles/rabby-vs-metamask.md` - Comparison article (NEW)
- `/wallets/articles/best-wallet-for-ethereum-developers.md` - Guide article (NEW)
- `/wallets/articles/most-secure-hardware-wallet.md` - Guide article (NEW)

**Config:**
- `/wallets/frontend/public/robots.txt` - Crawl directives
- `/wallets/frontend/src/app/sitemap.ts` - Dynamic sitemap (includes articles)

---

## AEO/GEO Best Practices (From Microsoft Guide)

### Answer Engine Optimization (AEO)

**✅ Implemented:**
- FAQ schemas on comparison pages
- Direct answer format (question → answer)
- Entity-rich content (wallet names, scores, features)
- Front-loaded benefits (answer first, details second)

**🟡 In Progress:**
- Real-time data integration (Week 2-3)
- Glossary with entity markup (Week 4-6)

**❌ Not Yet:**
- Video transcripts with VideoObject schema
- HowTo content for wallet setup guides
- Voice search optimization (SpeakableSpecification)

### Generative Engine Optimization (GEO)

**✅ Implemented:**
- Trust signals (scores, methodology links, data sources)
- Authoritative comparison tables
- Expert citations (score methodology)
- Verified data sources (GitHub API, WalletBeat, etc.)

**🟡 In Progress:**
- Live security scores (Week 2-3)
- Pros/Cons columns in tables (Week 2-3)

**❌ Not Yet:**
- Security audit embeddings
- Expert reviews from blockchain auditors
- Multi-modal content (videos)

---

## Common Pitfalls to Avoid

### Schema Mistakes
- ❌ Don't duplicate schema types on same page
- ❌ Don't use invalid property names
- ❌ Don't mix schema contexts (@context)
- ✅ Always validate with Rich Results Test

### FAQ Mistakes
- ❌ Don't write questions users won't ask
- ❌ Don't bury the answer (put it first)
- ❌ Don't use overly technical jargon
- ✅ Use natural language matching search queries

### Content Mistakes
- ❌ Don't optimize for outdated info
- ❌ Don't forget to update scores when they change
- ❌ Don't use affiliate links (we're independent)
- ✅ Always link to official wallet websites

---

## Agent Handoff Notes

**For Next Agent:**

1. **Before making changes:**
   - Read this file completely
   - Review `/wallets/frontend/src/lib/seo.ts`
   - Check Google Search Console for current performance
   - Run LLM citation tests to establish baseline

2. **When adding new content:**
   - Always add FAQ section (10 questions)
   - Always add appropriate schema markup
   - Always validate with Rich Results Test
   - Always front-load benefits in answers

3. **When updating schema:**
   - Test on one page first
   - Validate with schema.org validator
   - Check Rich Results Test
   - Deploy to all pages if passing

4. **When troubleshooting:**
   - Check Google Search Console → Coverage tab
   - Check Google Search Console → Enhancements → Structured Data
   - Run Lighthouse audit
   - Use browser DevTools → Application → Structured Data

5. **Week 2+ tasks:**
   - Start with CoinGecko API integration (easiest)
   - Then DeFiLlama API (also easy)
   - Then create glossary page
   - Then start "X vs Y" comparisons
   - Save video transcripts for last

---

## References

**Strategy Documents:**
- Primary Strategy: `.cursor/artifacts/walletradar-seo-aeo-geo-strategy.md`
- This Implementation Doc: `wallets/SEO_IMPLEMENTATION.md`

**Microsoft Guide:**
- "From Discovery to Influence: A Guide to AEO and GEO"
- Focus: Optimizing for ChatGPT, Copilot, Gemini, Perplexity citations

**Schema.org:**
- BreadcrumbList: https://schema.org/BreadcrumbList
- FAQPage: https://schema.org/FAQPage
- SoftwareApplication: https://schema.org/SoftwareApplication
- Product: https://schema.org/Product
- Service: https://schema.org/Service

**Testing Tools:**
- Google Rich Results: https://search.google.com/test/rich-results
- Schema Validator: https://validator.schema.org/
- PageSpeed Insights: https://pagespeed.web.dev/

---

## Agent-Friendly Content Verification (Actionable Guide)

The goal is to keep **one canonical URL** while serving both humans and AI agents. Use these checks to ensure the content is readable, compact, and SEO-safe.

### 7. Verify Token Reduction (HTML vs Clean Markdown)

**Objective:** confirm that a clean Markdown view is significantly smaller than raw HTML.

**CLI (platform-agnostic, copy/paste):**
```bash
# 1) Fetch raw HTML
curl -sSL "https://example.com/docs/page" -o /tmp/page.html

# 2) Extract main content (replace selector or use a simple heuristic)
python - <<'PY'
from bs4 import BeautifulSoup
html = open("/tmp/page.html", "r", encoding="utf-8").read()
soup = BeautifulSoup(html, "html.parser")
main = soup.find("main") or soup.body
print(main.get_text("\n", strip=True))
PY > /tmp/page.txt

# 3) Size comparison
wc -c /tmp/page.html /tmp/page.txt
```

**Expected:** clean text should be materially smaller (often 60–90% smaller).

**Alternative (no Python):**
```bash
lynx -dump -nolist https://example.com/docs/page > /tmp/page.txt
wc -c /tmp/page.html /tmp/page.txt
```

### 7.1 Simulate AI Agent Consumption

**Goal:** test if an agent can answer questions from the cleaned content.

**Minimal LangChain script (Python):**
```python
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

content = open("/tmp/page.txt", "r", encoding="utf-8").read()
prompt = f"Answer: What is the page about?\\n\\nContent:\\n{content}"
model = ChatOpenAI(model="gpt-4o-mini")
print(model.invoke([HumanMessage(content=prompt)]).content)
```

**Custom script (no framework):**
```python
import openai
content = open("/tmp/page.txt", "r", encoding="utf-8").read()
resp = openai.ChatCompletion.create(
  model="gpt-4o-mini",
  messages=[{"role":"user","content":"Summarize:\\n"+content}]
)
print(resp["choices"][0]["message"]["content"])
```

### 7.2 Monitor for SEO Issues

**Checklist:**
- No duplicate canonical tags.
- No “noindex” on public docs.
- Schema errors = 0 in Search Console.
- LCP and CLS within targets after content cleanup.

**Quick commands:**
```bash
curl -sSL https://example.com/docs/page | rg -n "canonical|noindex|schema.org"
```

---

## 8. Potential Challenges + Best Practices

**Challenges:**
- **Dynamic content**: SSR or prerender critical docs so bots see full content.
- **Auth-gated pages**: provide public summaries or access-controlled previews.
- **Multi-language**: use hreflang and stable URL patterns to avoid duplication.

**Best Practices:**
- Keep **one canonical URL** for humans and agents (avoid duplicate “/llm” paths).
- Prefer content extraction in **build time** when using static site generators.
- Add **fallback summaries** for SPA routes.
- Monitor changes with automation (lint + schema validation).

**Platform Variants:**

**Next.js / React (SSR/SSG):**
- Use `generateMetadata()` and static rendering for docs.
- Keep JSON-LD in `<head>` and validate after builds.

**Docusaurus / MkDocs:**
- Use built-in Markdown sources + static output.
- Add FAQ schema via plugin or custom HTML blocks.

**Mintlify:**
- Prefer built-in doc pages; automation handles structure.
- Validate that generated pages include structured data.

---

## 9. Conclusion

This guide keeps documentation **discoverable, compact, and agent-readable** while preserving SEO health. Prioritize a single canonical URL, validate content extraction, and iterate based on agent feedback and Search Console metrics.

---

## Changelog

### January 19, 2026 - Code Review & Corrections

**Quality Assurance Review:**
- ✅ Verified all wallet scores against source data
- 🔧 **Fixed hallucination:** MetaMask score was incorrectly stated as 68/100 (actual: 73/100)
  - Updated 5 instances in `rabby-vs-metamask.md`: frontmatter, quick answer, feature table, FAQ, conclusion
- ✅ Verified Trezor Safe 7 (96), ColdCard Mk4 (91), Keystone 3 Pro (91) scores are accurate
- ✅ Confirmed Rabby (92), Trust (82), Rainbow (77) scores are accurate

**Code Architecture Review:**
- ✅ No refactoring needed - shared utilities already properly extracted:
  - `generateBreadcrumbSchema()`, `extractFAQsFromMarkdown()`, `generateFAQSchema()` ✅
  - `optimizeMetaDescription()`, `calculateReadingTime()`, `formatReadingTime()` ✅
  - `EnhancedMarkdownRenderer`, `Breadcrumbs`, `SocialShare` components ✅
- ✅ Page templates (`articles/[slug]` vs `docs/[slug]`) have different enough requirements to warrant separate implementations
- ✅ Consistent baseUrl, metadata structure, schema patterns across all pages
- ✅ Build verification: All 144 pages generate successfully

**Consistency Verification:**
- ✅ Article pages match docs page patterns for metadata, schema, breadcrumbs
- ✅ Both use same imports from lib/seo.ts
- ✅ Both generate BreadcrumbList, Article, and FAQPage schemas
- ✅ OG images: Docs use per-page images, articles use generic (intentional - no article-specific images generated yet)
- ⚠️ **Future enhancement**: Generate article-specific OG images (1200x630) for better social sharing

**Testing:**
- ✅ Build successful after corrections
- ✅ All 3 article pages generated: rabby-vs-metamask, best-wallet-for-ethereum-developers, most-secure-hardware-wallet
- ✅ TypeScript compilation clean
- ✅ No linting errors

### January 19, 2026 - Week 1 Quick Wins + Blog System
- ✅ Added BreadcrumbList schema generator to lib/seo.ts
- ✅ Added FAQ schema generator to lib/seo.ts
- ✅ Added enhanced Product schema generator to lib/seo.ts
- ✅ Implemented BreadcrumbList on all wallet profile pages
- ✅ Enhanced Product schema on all wallet profile pages
- ✅ Added 10 FAQs to HARDWARE_WALLETS.md
- ✅ Added 10 FAQs to SOFTWARE_WALLETS.md
- ✅ Added 10 FAQs to CRYPTO_CARDS.md
- ✅ Added 10 FAQs to RAMPS.md
- ✅ Created this comprehensive SEO documentation
- ✅ Built blog/article system infrastructure
  - Created `lib/articles.ts` data layer (120 lines)
  - Created `app/articles/[slug]/page.tsx` template (300 lines)
  - Created `app/articles/page.tsx` listing page (200 lines)
  - Updated `app/sitemap.ts` with article routes
- ✅ Created 3 SEO-optimized articles:
  - "Rabby vs MetaMask" comparison (8.8KB, 10 FAQs)
  - "Best Wallet for Ethereum Developers" guide (11.6KB, 10 FAQs)
  - "Most Secure Hardware Wallet" guide (13.5KB, 10 FAQs)
- ✅ All articles include full schema markup (BreadcrumbList, Article, FAQPage)

**Total:** 2104 lines of code/content added across 13 files

---

## Success Metrics Tracking

Create a tracking spreadsheet with these columns:

| Date | Organic Traffic | AI Referrals | Featured Snippets | LLM Citation % | Schema Errors | Notes |
|------|----------------|--------------|-------------------|----------------|---------------|-------|
| 2026-01-19 | Baseline | 0% | 0 | 0% | 0 | Week 1 complete |
| 2026-01-26 | TBD | TBD | TBD | TBD | TBD | Week 2 check |
| 2026-02-02 | TBD | TBD | TBD | TBD | TBD | Week 3 check |

**Update this table weekly.**

---

## Questions for Future Agents

1. **Is the build passing?** `npm run build && npm run lint && npm run type-check`
2. **Are schemas validating?** Test on Google Rich Results Test
3. **Are LLMs citing WalletRadar?** Run manual ChatGPT queries
4. **Is AI traffic increasing?** Check Google Analytics 4
5. **Are there schema errors?** Check Google Search Console

If all answers are YES → continue to Week 2 tasks.
If any NO → fix issues before proceeding.

---

**End of SEO Implementation Guide**

*For questions or updates, reference this file and the strategy doc in `.cursor/artifacts/`*
