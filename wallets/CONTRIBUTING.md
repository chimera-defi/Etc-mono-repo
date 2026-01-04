# Contributing to Wallet Comparison

Thank you for helping keep this wallet comparison accurate and up-to-date!

## Quick Links

### Software Wallets (EVM)
- **Main comparison:** [SOFTWARE_WALLETS.md](./SOFTWARE_WALLETS.md) | [Details](./SOFTWARE_WALLETS_DETAILS.md)
- **Refresh script:** [scripts/refresh-github-data.sh](./scripts/refresh-github-data.sh)

### Hardware Wallets (Cold Storage)
- **Hardware comparison:** [HARDWARE_WALLETS.md](./HARDWARE_WALLETS.md) | [Details](./HARDWARE_WALLETS_DETAILS.md)
- **Refresh script:** [scripts/refresh-hardware-wallet-data.sh](./scripts/refresh-hardware-wallet-data.sh)

### Crypto Cards
- **Card comparison:** [CRYPTO_CARDS.md](./CRYPTO_CARDS.md) | [Details](./CRYPTO_CARDS_DETAILS.md)

### Ramps (On/Off-Ramp Providers)
- **Ramp comparison:** [RAMPS.md](./RAMPS.md) | [Details](./RAMPS_DETAILS.md)

---

## Adding a New Software Wallet

### Prerequisites

Before adding a wallet, verify:

1. ✅ It's an EVM-compatible wallet (Ethereum, Polygon, Arbitrum, etc.)
2. ✅ It has been publicly released (not alpha/private beta)
3. ✅ It has a GitHub repo OR is a well-known proprietary wallet

### Step 1: Gather Required Data

| Column | How to Verify |
|--------|---------------|
| **Score** | Calculate using [scoring methodology](#scoring-calculation) |
| **GitHub** | Find the main wallet repo (not SDK/packages) |
| **Active** | Check last commit date on default branch |
| **Chains** | Count from official docs or registry files |
| **Devices** | Check app stores + Chrome Web Store |
| **Testnets** | Check if custom RPC/chains can be added |
| **License** | Read LICENSE file in repo root |
| **Audits** | Search repo for `/audits` folder or security page |
| **Funding** | Research company backing, funding rounds |
| **Tx Sim** | Test wallet or check WalletBeat |
| **Scam** | Test wallet or check WalletBeat |
| **Account Type** | EOA, Safe, EIP-4337, or EIP-7702 |
| **HW Wallets** | Check settings for Ledger/Trezor support |
| **EIP-4337** | Check if smart account creation is supported |
| **Best For** | Your assessment of ideal use case |
| **Rec** | 🟢 if score ≥80, 🟡 if 60-79, 🔴 if <60 or inactive |

### Step 2: Calculate Score

Use this formula (100 points total) — prioritizes core criteria and stability:

```
CORE CRITERIA (25 pts) — MOST IMPORTANT
  ✅ Both mobile + browser extension = 25
  ⚠️ Partial (e.g., Starknet-only desktop) = 12
  ❌ Missing mobile OR extension = 0

STABILITY (20 pts) — Lower release frequency = better
  <3 releases/month = 20 (ideal)
  3-5 releases/month = 15
  6-8 releases/month = 10
  >8 releases/month = 5 (MetaMask territory)
  Unknown (private) = 12
  Inactive = 20 (stable but no updates)

DEVELOPER EXPERIENCE (25 pts)
  Tx Simulation: ✅=10, ⚠️=5, ❌=0
  Testnet support: ✅=5, ❌=0
  Custom RPC: ✅=5, ⚠️=3, ❌=0
  Multi-chain: ✅=5, ❌=0

ACTIVITY (15 pts)
  ✅ Active (≤30 days) = 15
  ⚠️ Slow (1-4 months) = 8
  🔒 Private repo = 5
  ❌ Inactive (>4 months) = 0

OPEN SOURCE (10 pts)
  ✅ FOSS (MIT, GPL, MPL, Apache) = 10
  ⚠️ Source-available/partial = 5
  ❌ Proprietary = 0

SECURITY (5 pts)
  ✅ Recent audit (2023+) = 5
  🐛 Bug bounty = 3
  ⚠️ Old audit = 2
  ❓ None/Private = 0
```

### Step 3: Add to Main Table

Add your row to `SOFTWARE_WALLETS.md` in score order (highest first):

```markdown
| **WalletName** | XX | [repo](https://github.com/org/repo) | ✅ | 50+ | 📱🌐 | ✅ | ✅ MIT | ✅ 2024 | 🟢 Company | ✅ | ✅ | EOA | ✅ Multiple | ❌ | Use Case | 🟢 |
```

### Step 4: Update Other Sections

If applicable, also update:

- [ ] **Scoring table** (if in top 10)
- [ ] **Security Audits table** (if audited)
- [ ] **Account Type Support table**
- [ ] **Hardware Wallet Support table**
- [ ] **ENS & Address Resolution table**
- [ ] **Browser Integration table**
- [ ] **Monetization table**
- [ ] **Privacy & Data Collection table**

### Step 5: Add to Changelog

Add an entry to [CHANGELOG.md](./CHANGELOG.md) in the appropriate section (Software Wallets or Hardware Wallets):

```markdown
| Dec 2025 | **WalletName** | Added | New wallet with score XX |
```

---

## Adding a New Hardware Wallet

### Prerequisites

Before adding a hardware wallet, verify:

1. ✅ It's an actual hardware device (not software/mobile wallet)
2. ✅ It's commercially available (not crowdfunding/prototype)
3. ✅ It stores private keys on device (true cold storage)

### Step 1: Gather Required Data

| Column | How to Verify |
|--------|---------------|
| **Score** | Calculate using [hardware scoring methodology](#hardware-wallet-scoring) |
| **Air-Gap** | Check if device requires USB/BT connection during signing |
| **Open Source** | Find firmware repo on GitHub; verify it's actual firmware, not just SDK |
| **Secure Element** | Check official specs for SE chip (e.g., ATECC608, Optiga) |
| **Display** | Screen type, size, touch capability |
| **Chains** | Count from official supported assets list |
| **Price** | Check official store (not Amazon/resellers) |
| **Connectivity** | USB, Bluetooth, QR, NFC, MicroSD, WiFi |
| **Company** | Research company background, funding, location |

### Hardware Wallet Scoring

Use this formula (100 points total) — prioritizes security, transparency, and activity:

```
SECURITY ARCHITECTURE (25 pts)
  Secure Element present: +8
  SE certification (EAL6+: +4, EAL5+: +2, EAL7: +6)
  Air-gap capable (QR/MicroSD only): +8
  Dual/Triple SE: +3
  Physical tamper protection: +2
  No SE, MCU only: -5 penalty
  
TRANSPARENCY (20 pts)
  ✅ Full open source (firmware + bootloader): 20
  ⚠️ Partial (app open, firmware closed): 10-12
  ⚠️ SDK only (no firmware): 5-8
  ❌ Closed source: 0-5
  Reproducible builds: +3 bonus
  Code quality (low issue ratio <15%): +2 bonus
  High issue ratio (>50%): -2 penalty

PRIVACY & TRUST (15 pts)
  No seed extraction capability: 15
  Optional cloud recovery (Ledger Recover): 5 (major penalty)
  Mandatory cloud features: 0
  KYC required for purchase: -3 penalty

DEVELOPMENT ACTIVITY (15 pts) — GitHub status
  ✅ Active (commits ≤30 days): 15
  ⚠️ Slow (1-4 months): 8
  🔒 Private/closed repo: 5
  ❌ Inactive (>4 months): 0
  
COMPANY & TRACK RECORD (15 pts)
  🟢 Self-funded & profitable: 12-15
  🟡 VC-funded, stable: 8-10
  🔴 Unknown funding: 3-5
  🔴 Abandoned/pivoted: 0
  5+ years operation: +3
  3-5 years: +2
  Major security breach: -5 penalty

UX & ECOSYSTEM (10 pts)
  Touch color screen: +4
  Color LCD with buttons: +3
  Mono OLED/LCD: +2
  No screen (NFC card): +0
  Multi-chain (1000+): +3
  Multi-chain (100+): +2
  BTC-only: +1
  Major software wallet integrations: +2
```

**Score Interpretation:**
- 🟢 **75+:** Recommended — meets all criteria, active development
- 🟡 **50-74:** Situational — has limitations (closed source, inactive, etc.)
- 🔴 **<50:** Avoid — significant issues (abandoned, no SE, closed source)

### Step 2: Add to Main Table

Add your row to `HARDWARE_WALLETS.md` in score order:

```markdown
| **WalletName** | XX | ✅/❌ | ✅/⚠️/❌ | ✅/❌ SE Type | Display | Chains | $XXX | Conn | ❌ | ✅/⚠️/❌ | 🟢/🟡/🔴 |
```

Note: The new Activity column tracks GitHub/development status.

### Step 3: Update Other Sections

If applicable, also update:

- [ ] **Scoring breakdown table**
- [ ] **GitHub Metrics table** (if open source)
- [ ] **Security Features table**
- [ ] **Funding section**
- [ ] **Known Quirks section**
- [ ] **Software integration tables**
- [ ] **Changelog** — Add entry to [CHANGELOG.md](./CHANGELOG.md)

### Step 4: Run Verification

```bash
cd scripts
./refresh-hardware-wallet-data.sh --markdown
```

---

## Adding a New Ramp Provider

### Prerequisites

Before adding a ramp provider, verify:

1. ✅ It's a legitimate on-ramp and/or off-ramp service (not just a wallet feature)
2. ✅ It's publicly available (not private/enterprise-only without public docs)
3. ✅ It has developer documentation or API/SDK available

### Step 1: Gather Required Data

| Column | How to Verify |
|--------|---------------|
| **Score** | Calculate using [ramp scoring methodology](#ramp-scoring) |
| **Type** | Both, On-Ramp only, or Off-Ramp only |
| **On-Ramp** | ✅ if supports fiat → crypto, ❌ otherwise |
| **Off-Ramp** | ✅ if supports crypto → fiat, ❌ otherwise |
| **Coverage** | Check official docs for supported countries/regions |
| **Fee Model** | Check pricing page or API docs |
| **Min Fee** | Check pricing page (use ~ prefix if approximate) |
| **Dev UX** | Check developer docs (SDK, Widget, API) |
| **Status** | ✅ Active, ⚠️ Verify (needs verification), 🚧 Launching |
| **Best For** | Your assessment of ideal use case |
| **Rec** | 🟢 if score ≥75, 🟡 if 50-74, 🔴 if <50 |
| **URL** | Official website URL |

### Ramp Scoring

Use this formula (100 points total) — prioritizes coverage, developer experience, and fees:

```
COVERAGE (25 pts)
  160+ countries = 25
  100-159 countries = 20
  50-99 countries = 15
  10-49 countries = 10
  <10 countries = 5
  US-only = 8
  EU-only = 10

FEE STRUCTURE (20 pts)
  Low fees (<1%) = 20
  Medium fees (1-3%) = 15
  High fees (>3%) = 10
  Variable/custom = 12
  Unknown = 5

DEVELOPER EXPERIENCE (20 pts)
  Excellent (React SDK, great docs) = 20
  Great (Widget, good docs) = 15
  Good (API/SDK, basic docs) = 10
  Basic (Widget only, minimal docs) = 5

SUPPORTED CHAINS/ASSETS (15 pts)
  Multi-chain (10+ chains) = 15
  Multi-chain (5-9 chains) = 12
  Multi-chain (2-4 chains) = 8
  Single chain = 5

KYC/COMPLIANCE (10 pts)
  Clear KYC requirements = 10
  Variable (risk-based) = 8
  Unknown = 5

RELIABILITY (10 pts)
  Established provider (2+ years) = 10
  New but active = 7
  Unknown/verify = 5
```

**Score Interpretation:**
- 🟢 **75+:** Recommended — excellent coverage, good dev UX, reasonable fees
- 🟡 **50-74:** Situational — has limitations (limited coverage, higher fees, etc.)
- 🔴 **<50:** Avoid — significant issues (very limited coverage, poor dev UX, etc.)

### Step 2: Add to Main Table

Add your row to `RAMPS.md` in score order (highest first):

```markdown
| [**ProviderName**](https://provider.com/) | XX 🟢 | Both | ✅ | ✅ | ~160+ Countries | Medium | ~$5.00 | Excellent (React SDK) | ✅ | Developers |
```

**Important:** Use markdown link format `[**Name**](url)` for provider name to enable clickable links.

### Step 3: Update Other Sections

If applicable, also update:

- [ ] **Top Providers Comparison** table in RAMPS_DETAILS.md
- [ ] **Provider-Specific Notes** section
- [ ] **Fee Analysis** section
- [ ] **Developer Experience** section
- [ ] **Changelog** — Add entry to [CHANGELOG.md](./CHANGELOG.md)

### Step 4: Frontend Integration

When adding a new comparison type (like ramps), you must update:

#### 4a. Type Definitions (`frontend/src/types/wallets.ts`)
- [ ] Add interface (e.g., `Ramp`) with all required fields including `url: string | null`
- [ ] Add to `WalletData` union type

#### 4b. Data Parsing (`frontend/src/lib/wallet-data.ts`)
- [ ] Add parsing function (e.g., `parseRamps()`)
- [ ] Extract name and URL from markdown links: `[**Name**](url)`
- [ ] Add to `getAllWalletData()` return object
- [ ] Export parsing function

#### 4c. Filtering (`frontend/src/lib/wallet-filtering.ts`)
- [ ] Add filtering function (e.g., `filterRamps()`)
- [ ] Map status types correctly if different from filter types
- [ ] Export filtering function
- [ ] Add to `wallet-data.ts` exports

#### 4d. Components
- [ ] **WalletTable.tsx:** Add item component (e.g., `RampItem`) for table/grid views
- [ ] **ComparisonTool.tsx:** Add comparison component (e.g., `RampComparison`)
- [ ] **WalletFilters.tsx:** Add filter options if needed
- [ ] **ExploreContent.tsx:** Add tab, state management, filtering

#### 4e. Pages
- [ ] **explore/page.tsx:** Call parsing function, pass to ExploreContent
- [ ] **docs/[slug]/page.tsx:** Add to `isTablePage` check
- [ ] **sitemap.ts:** Add to `isComparisonTable` check

#### 4f. Navigation (See Rule #127)
- [ ] **Navigation.tsx:** Add to burger menu
- [ ] **Footer.tsx:** Add to Comparisons section
- [ ] **InternalLinks.tsx:** Add card to FeaturedCategoryLinks
- [ ] **page.tsx:** Add to hero section, stats section, Top Developer Picks

#### 4g. SEO (`frontend/src/lib/seo.ts`)
- [ ] Add OG image mappings for table and details pages
- [ ] Add keyword detection for new type (e.g., ramp-specific keywords)
- [ ] Update ItemList schema to handle new type correctly

#### 4h. OG Images (`frontend/scripts/generate-og-images.js`)
- [ ] Add data to `WALLET_DATA` object
- [ ] Create generator function for table image
- [ ] Create generator function for details image
- [ ] Add to `main()` function
- [ ] Run `npm run generate-og` and commit PNGs
- [ ] Update CI workflow to check for new images

#### 4i. Markdown Config (`frontend/src/lib/markdown.ts`)
- [ ] Add file to `DOCUMENT_CONFIG`
- [ ] Add to `relatedMap` for table/details navigation

### Step 5: Verification

```bash
cd wallets/frontend
npm run type-check  # Verify TypeScript
npm run lint        # Verify linting
npm run build       # Verify build
npm run generate-og # Regenerate OG images
```

---

## Adding a New Crypto Card

See existing `CRYPTO_CARDS.md` for card-specific guidelines. Follow similar pattern to software/hardware wallets.

---

## Updating Existing Data

### Activity Status Updates

**For Software Wallets:**
```bash
cd scripts
./refresh-github-data.sh --markdown
```

**For Hardware Wallets:**
```bash
cd scripts
./refresh-hardware-wallet-data.sh --markdown
```

If a wallet's status changes, update:
1. Main table `Active` column (or strikethrough if abandoned)
2. GitHub Metrics table
3. Recalculate score if needed
4. Add changelog entry to [CHANGELOG.md](./CHANGELOG.md)

### Audit Updates

When a wallet publishes a new audit:
1. Update `Audits` column in main table
2. Update Security Audits section
3. Recalculate score if applicable
4. Add changelog entry to [CHANGELOG.md](./CHANGELOG.md)

---

## Verification Standards

### What Requires Verification

| Claim | Verification Method |
|-------|---------------------|
| License | Read LICENSE file in repo |
| Activity | Check last commit via GitHub API |
| Chain count | Official docs or registry file |
| Audit | Link to audit report |
| Funding | Press releases, Crunchbase, etc. |
| Ramp coverage | Official docs or API documentation |
| Ramp fees | Pricing page or API docs |

### What Doesn't Require Verification

- Feature claims from official docs (trust but verify when possible)
- WalletBeat data (already verified)
- GitHub stars/issues (automated)

---

## Pull Request Template

Use this template for your PR:

```markdown
## New [Wallet/Card/Ramp]: [Name]

### Data Sources
- GitHub: [link] (if applicable)
- Official docs: [link]
- WalletBeat: [link if available]

### Verification
- [x] GitHub repo verified (if applicable)
- [x] Last commit date checked: YYYY-MM-DD (if applicable)
- [x] License verified: [LICENSE] (if applicable)
- [x] Chain count verified: [N] chains (if applicable)
- [x] Score calculated: XX/100

### Score Breakdown
- [Component 1]: XX/pts
- [Component 2]: XX/pts
- **Total: XX/100**

### Changes
- Added row to main comparison table
- Added to [list other sections updated]
- Updated [CHANGELOG.md](./CHANGELOG.md)
- Updated frontend (if new comparison type)
```

---

## Renaming Files or Changing URLs

**⚠️ IMPORTANT:** Changing file names or URL slugs requires comprehensive updates across the entire codebase. Follow this checklist to avoid breaking links and SEO.

### When to Rename

Only rename files/URLs if:
- URLs are too long or unclear (e.g., `wallet-comparison-unified-table` → `software-wallets`)
- File names don't match the URL pattern
- You're consolidating multiple files into a clearer structure

### File Naming Convention

**Comparison pages follow this pattern:**
- **Table view:** `CATEGORY.md` → `/docs/category` (e.g., `SOFTWARE_WALLETS.md` → `/docs/software-wallets`)
- **Details view:** `CATEGORY_DETAILS.md` → `/docs/category-details` (e.g., `SOFTWARE_WALLETS_DETAILS.md` → `/docs/software-wallets-details`)

**Slug generation formula:** `filename.replace('.md', '').toLowerCase().replace(/_/g, '-')`

### Rename Checklist

When renaming files or changing URL patterns, you MUST update:

#### 1. File System
- [ ] Rename markdown files
- [ ] Verify files exist in correct location

#### 2. Frontend Configuration (`frontend/src/lib/markdown.ts`)
- [ ] Update `DOCUMENT_CONFIG` with new file names
- [ ] Verify slug generation matches expected URLs
- [ ] Update `relatedMap` in `getRelatedDocument()` function
- [ ] Update `getWalletStats()` function if it references specific slugs

#### 3. SEO & Metadata (`frontend/src/lib/seo.ts`)
- [ ] Update `getOgImagePath()` mapping for new slugs
- [ ] Verify OG image paths are correct
- [ ] Check that image files exist in `public/` directory
- [ ] Add keyword detection if needed

#### 4. Frontend Components
- [ ] Update `Navigation.tsx` nav items
- [ ] Update `Footer.tsx` links
- [ ] Update `InternalLinks.tsx` (FeaturedCategoryLinks)
- [ ] Update `page.tsx` (homepage links and structured data)
- [ ] Update any page-specific links (e.g., `companies/page.tsx`)

#### 5. Page Logic (`frontend/src/app/docs/[slug]/page.tsx`)
- [ ] Update table/details detection logic
- [ ] Verify `isTablePage` and `isDetailsPage` detection
- [ ] Update `RelatedDocuments` component logic if needed
- [ ] Update ItemList schema to handle new type correctly

#### 6. Sitemap (`frontend/src/app/sitemap.ts`)
- [ ] Update `isComparisonTable` detection logic
- [ ] Verify priority logic still works correctly

#### 7. Data Parsers (`frontend/src/lib/wallet-data.ts`)
- [ ] Update file paths in parsing functions
- [ ] Update any comments referencing old file names

#### 8. Scripts
- [ ] Update `scripts/generate-og-images.js` file references and comments
- [ ] Update `scripts/smoke-test-wallet-data.js` file paths
- [ ] Verify any other scripts that reference file names

#### 9. Documentation
- [ ] Update `frontend/README.md` file mapping table
- [ ] Update `README.md` (root) file references
- [ ] Update internal markdown links in comparison files
- [ ] Update `CONTRIBUTING.md` if it references specific files

#### 10. Verification
- [ ] Run verification script to check file existence
- [ ] Verify slug generation produces expected URLs
- [ ] Test related document mapping (table ↔ details)
- [ ] Check for any remaining old references: `grep -r "old-name" frontend/`
- [ ] Verify no broken internal links in markdown files
- [ ] Run `npm run type-check`, `npm run lint`, `npm run build`

### SEO Considerations

**When changing URLs, be aware:**

1. **Broken External Links:** Old URLs will 404 unless you add redirects
   - Consider adding Next.js redirects in `next.config.js` if URLs are public-facing
   - Update any social media posts or external documentation

2. **OG Images:** Social media caches OG images
   - Increment `ogImageVersion` in `layout.tsx` when regenerating images
   - Verify OG image paths match new slugs

3. **Sitemap:** Search engines need updated sitemap
   - Sitemap auto-generates from `getAllDocuments()`, so it updates automatically
   - Verify sitemap priorities are correct for new naming pattern

4. **Structured Data:** Schema.org markup includes URLs
   - Verify structured data URLs in `page.tsx` match new slugs
   - Check breadcrumb and article schema URLs

### Example: Complete Rename Workflow

```bash
# 1. Rename files
mv WALLET_COMPARISON_UNIFIED_TABLE.md SOFTWARE_WALLETS.md
mv WALLET_COMPARISON_UNIFIED_DETAILS.md SOFTWARE_WALLETS_DETAILS.md

# 2. Update frontend config
# Edit frontend/src/lib/markdown.ts: DOCUMENT_CONFIG

# 3. Update all references
# Edit: seo.ts, Navigation.tsx, Footer.tsx, etc.

# 4. Verify
cd frontend
npm run type-check
npm run lint
npm run build
```

### Testing After Rename

1. **Build check:** `cd frontend && npm run build` (may fail on missing deps, but should compile)
2. **Type check:** `cd frontend && npm run type-check`
3. **Lint check:** `cd frontend && npm run lint`
4. **Smoke test:** `cd frontend && npm test` (if available)
5. **Manual verification:** Check that all URLs load correctly

---

## Adding a New Comparison Type

When adding a completely new comparison category (e.g., ramps, exchanges, etc.), follow this comprehensive checklist:

### 1. Markdown Files
- [ ] Create `CATEGORY.md` (table view)
- [ ] Create `CATEGORY_DETAILS.md` (details view)
- [ ] Follow existing table structure patterns
- [ ] Include clickable website links: `[**Name**](url)` format
- [ ] Mark uncertain values with `~` prefix
- [ ] Add data accuracy disclaimer

### 2. Type Definitions (`frontend/src/types/wallets.ts`)
- [ ] Create interface with all required fields
- [ ] Include `url: string | null` field for website links
- [ ] Add `type: 'category'` field
- [ ] Add to `WalletData` union type

### 3. Data Parsing (`frontend/src/lib/wallet-data.ts`)
- [ ] Create parsing function
- [ ] Extract name and URL from markdown links
- [ ] Handle all table columns
- [ ] Add to `getAllWalletData()`
- [ ] Export parsing function

### 4. Filtering (`frontend/src/lib/wallet-filtering.ts`)
- [ ] Create filtering function (don't use placeholder)
- [ ] Map status types correctly if different
- [ ] Implement search, score, recommendation filters
- [ ] Export filtering function
- [ ] Add to `wallet-data.ts` exports

### 5. Components
- [ ] **WalletTable.tsx:** Add item component for table/grid views
- [ ] **ComparisonTool.tsx:** Add comparison component
- [ ] **WalletFilters.tsx:** Add filter options if needed
- [ ] **ExploreContent.tsx:** Add tab, state, filtering

### 6. Pages
- [ ] **explore/page.tsx:** Parse and pass data
- [ ] **docs/[slug]/page.tsx:** Add to `isTablePage` check
- [ ] **sitemap.ts:** Add to `isComparisonTable` check

### 7. Navigation (Rule #127)
- [ ] **Navigation.tsx:** Add to burger menu
- [ ] **Footer.tsx:** Add to Comparisons section
- [ ] **InternalLinks.tsx:** Add card to FeaturedCategoryLinks
- [ ] **page.tsx:** Add to hero section, stats section, Top Developer Picks

### 8. SEO (Rule #128)
- [ ] **seo.ts:** Add OG image mappings
- [ ] **seo.ts:** Add keyword detection
- [ ] **docs/[slug]/page.tsx:** Update ItemList schema for new type
- [ ] **generate-og-images.js:** Add generator functions
- [ ] **CI workflow:** Add image check
- [ ] Run `npm run generate-og` and commit PNGs

### 9. Markdown Config (`frontend/src/lib/markdown.ts`)
- [ ] Add files to `DOCUMENT_CONFIG`
- [ ] Add to `relatedMap` for table/details navigation

### 10. Documentation
- [ ] Update `README.md` to include new category
- [ ] Update `CONTRIBUTING.md` with category-specific guidelines
- [ ] Add to changelog

### 11. Verification
- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] OG images generated and committed
- [ ] All navigation locations updated
- [ ] Social sharing works
- [ ] Structured data includes new type

---

## Questions?

Open an issue if you're unsure about:
- How to classify a wallet's license
- What activity status to assign
- How to score a particular feature
- How to rename files without breaking links
- How to add a new comparison type

We're happy to help!
