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

### What Doesn't Require Verification

- Feature claims from official docs (trust but verify when possible)
- WalletBeat data (already verified)
- GitHub stars/issues (automated)

---

## Pull Request Template

Use this template for your PR:

```markdown
## New Wallet: [Wallet Name]

### Data Sources
- GitHub: [link]
- Official docs: [link]
- WalletBeat: [link if available]

### Verification
- [x] GitHub repo verified
- [x] Last commit date checked: YYYY-MM-DD
- [x] License verified: [LICENSE]
- [x] Chain count verified: [N] chains
- [x] Score calculated: XX/100

### Score Breakdown
- Core (mobile + ext): XX/25
- Stability (rel/mo): XX/20
- DevExp (tx sim, testnets, RPC): XX/25
- Activity: XX/15
- FOSS: XX/10
- Security: XX/5
- **Total: XX/100**

### Changes
- Added row to main comparison table
- Added to [list other sections updated]
- Updated [CHANGELOG.md](./CHANGELOG.md)
```

---

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

#### 6. Sitemap (`frontend/src/app/sitemap.ts`)
- [ ] Update `isComparisonTable` detection logic
- [ ] Verify priority logic still works correctly

#### 7. Data Parsers (`frontend/src/lib/wallet-data.ts`)
- [ ] Update file paths in `parseSoftwareWallets()`
- [ ] Update file paths in `parseHardwareWallets()`
- [ ] Update file paths in `parseCryptoCards()`
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
node -e "const { getAllDocuments } = require('./src/lib/markdown.ts'); console.log(getAllDocuments().map(d => d.slug));"
```

### Testing After Rename

1. **Build check:** `cd frontend && npm run build` (may fail on missing deps, but should compile)
2. **Type check:** `cd frontend && npm run type-check`
3. **Lint check:** `cd frontend && npm run lint`
4. **Smoke test:** `cd frontend && npm test` (if available)
5. **Manual verification:** Check that all URLs load correctly

---

## Questions?

Open an issue if you're unsure about:
- How to classify a wallet's license
- What activity status to assign
- How to score a particular feature
- How to rename files without breaking links

We're happy to help!
