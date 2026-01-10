# AGENTS.md - Wallet Comparison Guidelines

This document provides guidance for AI coding assistants working on the wallet comparison documents.

> **Cross-references:**
> - **`.cursorrules`** - General AI assistant rules (all agents). See Rules #123-128 for comparison table UX, navigation consistency, and OG images.
> - **`CLAUDE.md`** - Claude Code-specific instructions and quick reference
> - **`mobile_experiments/Valdi/AGENTS.md`** - Valdi framework specific guidelines

---

## 🎯 Core Purpose

**Original Goal:** Find stable MetaMask alternatives with **both desktop browser extensions AND mobile apps**, specifically for **developer use**.

**Core Criteria (MUST HAVE):**
1. ✅ Mobile app available
2. ✅ Browser extension available
3. ✅ Developer-friendly (stable, good for testing dApps)
4. ✅ Better stability than MetaMask (~8 releases/month is too much churn)

**A wallet that doesn't have BOTH mobile + browser extension does NOT meet the core criteria**, regardless of how good its other features are.

---

## 📊 Document Structure

### Single Source of Truth
- **SOFTWARE_WALLETS.md** is the main software wallet comparison table
- **HARDWARE_WALLETS.md** is the main hardware wallet comparison table
- **CRYPTO_CARDS.md** is the main crypto card comparison table
- Each category has both a table view (main file) and details view (`*_DETAILS.md`)
- Do NOT create separate tables for different wallet categories within the same type
- Keep all data in one comprehensive table per category, use filtering/sorting in the HTML version

### Supporting Documents
- `README.md` — Quick reference and links
- `CONTRIBUTING.md` — How to add new wallets
- `scripts/` — Automation for data refresh

---

## 🏷️ Wallet Categorization

### Wallets That Meet Core Criteria (Mobile + Browser Extension)
These should be prioritized in recommendations:
- Rabby, Trust, Rainbow, Brave, Coinbase, MetaMask, Phantom, OKX, Wigwam, Zerion, Block*

(*Block meets criteria but is abandoned)

### Wallets That DON'T Meet Core Criteria
These are useful for specific purposes but should be clearly marked:
- **Browser-only:** Enkrypt, Ambire, Taho
- **Mobile-only:** Daimo, imToken, 1inch
- **Web app only:** Safe, Sequence
- **Desktop only:** Frame
- **No browser ext:** Ledger Live, MEW, Uniswap

### Inactive/Abandoned Wallets
Mark with strikethrough and ❌:
- Block Wallet (abandoned Nov 2024)
- Frame (inactive Feb 2025)
- Argent-X (inactive Mar 2025)

---

## 📏 Scoring Methodology

### Developer-Focused Weighting
The scoring system should prioritize what matters for developers:

1. **Platform Coverage (CRITICAL):** Wallets without both mobile + browser extension should be penalized significantly
2. **Developer Experience:** Tx simulation, testnet support, custom RPC support
3. **Stability:** Low release frequency is GOOD (inverse of MetaMask's problem)
4. **Activity:** Active development matters, but stable > frequent releases
5. **Open Source:** Important for debugging and trust, but not critical for usage
6. **API Openness:** Backend/API transparency matters for developers who need to understand data sources, self-host services, or build integrations

### API Openness Criteria

API openness is now tracked as a separate dimension from client-side open source. This matters for developers who:
- Want to understand where their data comes from
- Need to self-host services for privacy/compliance
- Want to build integrations with wallet APIs
- Need to verify API behavior matches documentation

**API Openness Categories:**

| Category | Symbol | Description |
|----------|--------|-------------|
| **Full** | ✅ | Backend services are open source AND self-hostable |
| **Partial** | ⚠️ | Some APIs open/public, but core services proprietary |
| **Public** | 🌐 | APIs accessible without auth, but code is proprietary |
| **Closed** | ❌ | Proprietary APIs, no public access without auth |

**API Openness by Wallet (Research Findings):**

| Wallet | Client Code | Backend/API | Public API | Self-Hostable |
|--------|-------------|-------------|------------|---------------|
| **Safe** | ✅ GPL-3 | ✅ 8+ services | ✅ Yes | ✅ Yes |
| **MEW/Enkrypt** | ✅ MIT | ⚠️ Partial | ⚠️ Limited | ⚠️ Partial |
| **Rabby** | ✅ MIT | ❌ DeBank proprietary | ✅ No auth | ❌ No |
| **Rainbow** | ✅ GPL-3 | ❌ Proprietary | ❌ No | ❌ No |
| **Trust** | ⚠️ Apache | ❌ Binance proprietary | ❌ No | ❌ No |
| **MetaMask** | ⚠️ Src-Avail | ❌ Infura proprietary | ⚠️ Via Infura | ❌ No |
| **Coinbase** | ⚠️ Partial | ❌ Coinbase proprietary | ⚠️ Limited | ❌ No |
| **Phantom** | ❌ Prop | ❌ Proprietary | ❌ No | ❌ No |
| **OKX** | ❌ Prop | ❌ Proprietary | ❌ No | ❌ No |
| **Zerion** | ❌ Prop | ❌ Proprietary | ❌ No | ❌ No |

**Key Insight:** Safe is the clear leader with 8+ open source backend services (transaction-service, config-service, events-service, etc.) that can all be self-hosted. Rabby's DeBank API is publicly accessible without authentication but the code is proprietary.

### Stability Metrics (Anti-MetaMask Criteria)
The original goal was to find STABLE alternatives. Key stability indicators:
- **Release frequency:** Lower is better (MetaMask ~8/month is BAD)
- **Issue/star ratio:** Lower is better (MetaMask 19% is concerning)
- **Breaking changes:** Fewer is better

### What NOT to Over-Weight
- Funding sustainability (nice to know, doesn't affect dev workflow)
- Chain count (developers usually need specific chains, not all chains)
- Hardware wallet support (nice but not core for dev testing)

---

## ✅ Data Verification Standards

### Required for Each Wallet
1. **GitHub repo** — Verify it exists and is the correct main repo
2. **Last commit date** — Use `scripts/refresh-github-data.sh`
3. **License** — Read LICENSE file in repo
4. **Devices** — Verify both mobile app AND browser extension exist

### Data Sources (in order of preference)
1. GitHub (primary source for activity, license, issues)
2. Official wallet documentation
3. WalletBeat (walletbeat.fyi) for technical features
4. App stores for mobile verification

### Common Verification Mistakes
- Trusting a wallet has mobile+extension without verifying (check app stores + Chrome Web Store)
- Using wrong GitHub repo (e.g., SDK repo vs main app repo)
- Not checking if "browser extension" is actually the main chain (Argent desktop = Starknet only)

---

## 🔄 Keeping Data Consistent

### When Updating the Main Table
1. Update the main table row
2. Update the scoring breakdown table (if score changes)
3. Update relevant sections (Security Audits, Hardware Support, etc.)
4. Add changelog entry to [CHANGELOG.md](./CHANGELOG.md)

### Avoid Data Fragmentation
- Don't create separate "top wallets" or "recommended wallets" tables
- Keep all comparison data in the unified table
- Use the "Rec" column (🟢/🟡/🔴/⚪) for recommendations
- Use the "Best For" column for use-case categorization

---

## 📝 Meta Learnings

### From Third Review (Dec 2025)
1. **Core criteria matter most:** Half the wallets (12/24) don't meet the basic requirement of mobile + browser extension
2. **Scoring should enforce criteria:** Wallets without both platforms shouldn't outscore those that have both
3. **Stability is undervalued:** Release frequency and breaking changes matter more than chain count for developers
4. **Data exists but is scattered:** Release frequency, custom RPC support existed in docs but not in main table columns

### Document Maintenance
1. **Single table principle:** Resist urge to create multiple comparison tables
2. **Changelog discipline:** Every status change should be logged
3. **Verify before trust:** Don't assume a wallet has features without checking
4. **Activity status decays:** What was active 6 months ago may be abandoned now

### Scoring Pitfalls
1. **Don't over-reward features that don't matter for dev use** (e.g., NFT galleries)
2. **Don't under-penalize missing core criteria** (mobile + extension is REQUIRED)
3. **Stability != Stagnation:** Low release frequency with active commits is ideal
4. **Open source != Better for devs:** Proprietary wallets can still be good dev tools

### Multi-Pass Review Checklist
1. **Math verification:** Breakdown values MUST sum to stated total score
2. **Values within bounds:** No column can exceed its maximum (e.g., Security can't be 7/5)
3. **Cross-document consistency:** Main table and breakdown table must match
4. **No artifacts:** Check root folder for stray generated files
5. **No data loss on restructure:** When adding/moving columns, verify ALL original columns are preserved (check git diff)

### Data Columns That Must Be Preserved
The main table must include at minimum:
- **Chains** — Built-in chain count (94, 163, 20+, Any, EVM, etc.)
- **Rel/Mo** — Releases per month (stability indicator)
- **RPC** — Custom RPC support
- **GitHub** — Repository link
- **Testnets** — Custom chain support
- **Audits** — Audit status and year

The GitHub Metrics table must include:
- **Last Commit** — Specific date (e.g., "Nov 27, 2025")
- **Stars** — GitHub star count
- **Issues** — GitHub issue count
- **Ratio** — Issue/star percentage (lower = better)
- **Stability** — Star rating (⭐⭐ to ⭐⭐⭐⭐)

### Data Format Consistency
- **Chains:** Use consistent notation:
  - Exact numbers: 94, 163, 5, 4, 2, 12
  - Minimums: 10+, 15+, 20+, 30+, 50+, 75+, 100+
  - Custom RPC: Any (unrestricted)
  - EVM only: EVM
  - Ethereum focused: ETH+
  - Never mix formats like "~20" and "20+" — pick one

---

## 🛠️ Common Tasks

### Refreshing Activity Data
```bash
cd scripts
./refresh-github-data.sh --markdown
```

### Adding a New Wallet
See CONTRIBUTING.md for the full checklist. Key verification:
1. Does it have BOTH mobile app AND browser extension?
2. Is the GitHub repo actively maintained?
3. What's the release frequency (lower = more stable)?

### Updating Scores
When recalculating scores:
1. Check if wallet still meets core criteria (mobile + extension)
2. Verify activity status (run refresh script)
3. Update both main table AND scoring breakdown table
4. Add changelog entry to [CHANGELOG.md](./CHANGELOG.md)

---

## 🚀 MCP CLI for Token Efficiency (CRITICAL)

### Why Use MCP CLI in Wallet Work

The wallet comparison project involves reading multiple data files, documentation, and configuration files. **MCP CLI reduces tokens by 60-80% for these operations** through bulk operations and on-demand schema loading.

### Wallet-Specific MCP CLI Patterns

#### Pattern 1: Bulk Read Wallet Data Files

**Instead of:**
```bash
Read SOFTWARE_WALLETS.md
Read HARDWARE_WALLETS.md
Read CRYPTO_CARDS.md
```

**Use:**
```bash
mcp-cli filesystem/read_multiple_files '{
  "paths": [
    "wallets/SOFTWARE_WALLETS.md",
    "wallets/HARDWARE_WALLETS.md",
    "wallets/CRYPTO_CARDS.md"
  ]
}'
```

**Token Savings:** ~66% (1 call vs 3 calls)

#### Pattern 2: Search All Wallet Markdown Files

```bash
# Find all wallet documentation
mcp-cli filesystem/search_files '{
  "path": "/home/user/Etc-mono-repo/wallets",
  "pattern": "**/*.md"
}'

# Find all wallet data files
mcp-cli filesystem/search_files '{
  "path": "/home/user/Etc-mono-repo/wallets",
  "pattern": "**/*WALLETS*.md"
}'
```

**Token Savings:** ~70% vs Glob + multiple Read operations

#### Pattern 3: Analyze Wallet Frontend Structure

```bash
# Get complete directory tree
mcp-cli filesystem/directory_tree '{
  "path": "/home/user/Etc-mono-repo/wallets/frontend/src"
}'

# Search for config files
mcp-cli filesystem/search_files '{
  "path": "/home/user/Etc-mono-repo/wallets/frontend",
  "pattern": "**/*config*"
}'
```

**Token Savings:** ~80% vs recursive directory exploration

#### Pattern 4: Read Large Documentation Files (Head/Tail)

```bash
# Read first 100 lines of wallet table
mcp-cli filesystem/read_text_file '{
  "path": "/home/user/Etc-mono-repo/wallets/SOFTWARE_WALLETS.md",
  "head": 100
}'

# Read last 50 lines of changelog
mcp-cli filesystem/read_text_file '{
  "path": "/home/user/Etc-mono-repo/wallets/CHANGELOG.md",
  "tail": 50
}'
```

**Token Savings:** ~90% for large files

#### Pattern 5: Store Wallet Research Knowledge

**CRITICAL:** When researching wallets, store findings in memory server to avoid re-researching.

```bash
# Store wallet features
mcp-cli memory/create_entities '{
  "entities": [
    {
      "name": "MetaMask",
      "entityType": "wallet",
      "observations": [
        "Browser extension for EVM chains",
        "Mobile app available",
        "~8 releases per month (high churn)",
        "19% issue/star ratio (concerning)",
        "Most popular Web3 wallet"
      ]
    },
    {
      "name": "Rabby",
      "entityType": "wallet",
      "observations": [
        "Browser extension + mobile app",
        "EVM chains with multi-chain transaction preview",
        "Lower release frequency (more stable)",
        "DeBank API backend (proprietary but public)",
        "Good MetaMask alternative for developers"
      ]
    }
  ]
}'

# Store architectural knowledge
mcp-cli memory/create_entities '{
  "entities": [
    {
      "name": "Wallets Frontend Architecture",
      "entityType": "architecture",
      "observations": [
        "Next.js 14 with App Router",
        "TypeScript strict mode",
        "Data parsed from markdown tables",
        "OG images generated via scripts/generate-og-images.js",
        "Twitter Card validation required before deployment",
        "Smoke tests check for parser drift"
      ]
    }
  ]
}'

# Store scoring methodology
mcp-cli memory/create_entities '{
  "entities": [
    {
      "name": "Wallet Scoring Methodology",
      "entityType": "methodology",
      "observations": [
        "Developer-focused: prioritize mobile + browser extension",
        "Stability over features: low release frequency is GOOD",
        "Platform coverage is CRITICAL for core criteria",
        "Open source important but not required for dev use",
        "API openness: separate from client-side open source"
      ]
    }
  ]
}'
```

**Token Savings:** ~90% across sessions (store once, query many times)

#### Pattern 6: Query Wallet Knowledge Before Research

**ALWAYS query knowledge graph first before researching:**

```bash
# Search for wallet information
mcp-cli memory/search_nodes '{"query": "MetaMask"}'
mcp-cli memory/search_nodes '{"query": "Rabby"}'
mcp-cli memory/search_nodes '{"query": "hardware wallet"}'

# Get specific entities
mcp-cli memory/open_nodes '{
  "names": ["Wallets Frontend Architecture", "Wallet Scoring Methodology"]
}'

# Read entire knowledge graph
mcp-cli memory/read_graph '{}'
```

**Token Savings:** ~95% vs re-reading documentation

### Wallet Work Checklist with MCP CLI

When working on wallet tasks:

1. **🔥 Query knowledge first:** Check `memory/search_nodes` for existing research
2. **Batch file reads:** Use `read_multiple_files` for 2+ files
3. **Store new findings:** Use `memory/create_entities` after research
4. **Use directory_tree:** Get full project structure in one call
5. **Search efficiently:** Use `search_files` with patterns, not manual Glob
6. **Read sections:** For large tables, use `head`/`tail` parameters

### Example: Adding a New Wallet

**Traditional approach (inefficient):**
```
Read SOFTWARE_WALLETS.md (full file)
→ Read CONTRIBUTING.md (full file)
→ Read wallets/AGENTS.md (full file)
→ Research wallet features manually
→ Update table
```

**MCP CLI approach (efficient):**
```bash
# 1. Query existing knowledge
mcp-cli memory/search_nodes '{"query": "wallet scoring"}'

# 2. If needed, read only relevant sections
mcp-cli filesystem/read_text_file '{
  "path": "/home/user/Etc-mono-repo/wallets/SOFTWARE_WALLETS.md",
  "head": 50
}'

# 3. Research and store findings
mcp-cli memory/create_entities '{
  "entities": [{"name": "NewWallet", "entityType": "wallet", "observations": [...]}]
}'

# 4. Batch read related files if needed
mcp-cli filesystem/read_multiple_files '{
  "paths": ["wallets/CONTRIBUTING.md", "wallets/CHANGELOG.md"]
}'
```

**Token Savings:** ~75% vs traditional approach

### Wallet-Specific Knowledge to Store

Store these entity types to build cumulative knowledge:

1. **Wallets:** Name, features, platform availability, stability metrics
2. **Architecture:** Frontend structure, build process, validation requirements
3. **Methodologies:** Scoring criteria, verification standards, data sources
4. **Issues:** Common pitfalls, red flags, verification mistakes
5. **Best For:** Use case mappings (developer use, cold storage, etc.)

### Integration with Verification

When refreshing wallet data:

```bash
# Store verification findings
mcp-cli memory/create_entities '{
  "entities": [
    {
      "name": "Trust Wallet Verification Jan 2026",
      "entityType": "verification",
      "observations": [
        "Mobile app: iOS + Android verified in app stores",
        "Browser extension: Chrome Web Store verified",
        "Last commit: Jan 5, 2026",
        "Release frequency: 4.2/month (moderate)",
        "Meets core criteria: YES (mobile + browser)"
      ]
    }
  ]
}'
```

This creates an auditable history of verifications.

### See Also

- **Full MCP CLI Documentation:** `/home/user/Etc-mono-repo/mcp-cli-evaluation.md`
- **General MCP CLI Guidelines:** See CLAUDE.md "MCP CLI Integration" section
- **Rules:** See `.cursorrules` Rules #140-155

---

## ⚠️ Red Flags

### Wallets to Watch
- **Coinbase SDK:** Development slowed (Jul 2025)
- **Taho:** Slow development, grant-dependent funding
- **Wigwam:** Slow development, unknown funding

### Signs of Abandonment
- No commits for 4+ months
- Issues piling up without responses
- No releases in 6+ months
- Team members leaving (check GitHub contributors)

---

## 🔐 Hardware Wallet Guidelines

### Purpose

**HARDWARE_WALLET_COMPARISON.md** compares cold storage hardware wallets, with a focus on finding Ledger alternatives after the Ledger Recover controversy.

### Core Principle

> **Private keys should NEVER leave the device under ANY circumstances.**

This is the fundamental principle that Ledger violated with Ledger Recover. All scoring and recommendations should prioritize wallets that maintain this principle.

### Hardware Wallet Scoring Priorities

Hardware wallet scoring mirrors software wallet approach, adapted for cold storage:

1. **Security Architecture (25 pts):** Secure Element certification, air-gap, physical tamper
2. **Transparency (20 pts):** Open source firmware, reproducible builds, code quality (issue ratio)
3. **Privacy & Trust (15 pts):** No seed extraction capability, no cloud features
4. **Development Activity (15 pts):** GitHub activity status — matches software wallet "Activity" category
5. **Company & Track Record (15 pts):** Funding stability, longevity, security incidents
6. **UX & Ecosystem (10 pts):** Display, chains, software integrations

**Key difference from software wallets:** Low update frequency is GOOD for hardware wallets (security-focused), unlike software wallets where frequent updates may indicate instability.

**Score thresholds:**
- 🟢 **75+:** Recommended — meets all criteria, active development
- 🟡 **50-74:** Situational — has limitations (closed source, private repo, etc.)
- 🔴 **<50:** Avoid — significant issues (abandoned, no SE, fully closed)

### Hardware-Specific Verification

1. **Open Source Claims:** Verify firmware repo exists AND is the actual firmware (not just SDK)
   - ✅ Correct: `trezor/trezor-firmware` (actual firmware)
   - ❌ Wrong: `GridPlus/gridplus-sdk` (SDK only, not firmware)

2. **Secure Element:** Verify from official specs, not marketing
   - Look for specific chip names: ATECC608, Optiga Trust M, STM32
   - Check for EAL certification levels (EAL5+, EAL6+, EAL7)

3. **Air-Gap:** Device must NEVER connect during transaction signing
   - ✅ True air-gap: QR codes, MicroSD only
   - ❌ Not air-gapped: USB required for signing, Bluetooth during tx

### Hardware Wallet Red Flags

1. **Ledger Recover-style features:** Any firmware that CAN extract seeds is a trust violation
2. **Closed source firmware:** Can't verify security claims
3. **No Secure Element:** MCU-only devices have lower physical security
4. **Abandoned development:** Check firmware repo for recent commits
5. **Unknown company:** Research funding, location, team

### Refresh Hardware Data

```bash
cd scripts
./refresh-hardware-wallet-data.sh --markdown
```

### Hardware Wallet Meta-Learnings (Dec 2025)

1. **"Open source" claims need verification:** GridPlus claimed open source but firmware is proprietary
2. **Star counts can be misleading:** Small projects (OneKey 17 stars) may still be active
3. **Inactive = high risk:** KeepKey with 296 days no commits is effectively abandoned
4. **Scoring math matters:** Always verify component scores sum to stated total
5. **Firmware repos differ from app repos:** Ledger Live is open source, but Ledger firmware is not
6. **Release frequency means different things:** HW wallets intentionally release less often (2-4/year is normal)

### Data Accuracy Anti-Hallucination Rules (Dec 2025)

7. **Chains ≠ tokens:** "9000+ chains" is WRONG — that's tokens/assets. Actual blockchain networks supported is typically 10-50. Use "Multi" or "BTC" not fake specific numbers
8. **When uncertain, be vague:** "Multi-chain" is honest; "5500+ chains" is a hallucination
9. **Approximate prices with ~:** Prices change; use "~$150" and add "verify on official site" 
10. **Don't invent certifications:** EAL5+/6+/7 are specific certifications. Use chip names (ATECC, Optiga) when unsure of cert level
11. **Line-by-line verification:** Before finalizing, check EVERY cell: "do I actually know this?"
12. **Marketing claims ≠ facts:** Manufacturers inflate numbers. Be skeptical and conservative
13. **Add disclaimers:** Every data table should note that users must verify on official sites

### URL/File Rename Meta-Learnings (Jan 2025)

**When renaming files or changing URL patterns, comprehensive updates are required:**

1. **URL changes cascade everywhere:** File names → slugs → frontend references → SEO mappings → scripts → documentation. One rename requires 10+ file updates.

2. **Slug generation must be consistent:** The formula `filename.replace('.md', '').toLowerCase().replace(/_/g, '-')` must match expected URLs everywhere. Test with verification scripts.

3. **Table/Details detection pattern:** Comparison pages use a pattern:
   - Base slug = table view (e.g., `software-wallets`)
   - Base slug + `-details` = details view (e.g., `software-wallets-details`)
   - Detection logic must be consistent across: page component, sitemap, related document mapping

4. **Related document mapping is bidirectional:** When updating `relatedMap`, verify both directions:
   - Table → Details: `software-wallets` → `software-wallets-details`
   - Details → Table: `software-wallets-details` → `software-wallets`

5. **SEO mappings need updates:** OG image paths, sitemap priorities, structured data URLs all reference slugs. Update all simultaneously.

6. **Verification checklist prevents errors:** Before completing a rename:
   - ✓ File existence check
   - ✓ Slug generation verification
   - ✓ Related document mapping test
   - ✓ Grep for old references
   - ✓ Build/type check (if available)

7. **Old URLs break external links:** When changing public URLs, consider:
   - Adding Next.js redirects for old → new URLs
   - Updating social media posts
   - Noting breaking changes in changelog

8. **Sitemap logic needs pattern updates:** If detection logic changes (e.g., removing `-table` suffix), update sitemap priority logic to match new pattern.

9. **Scripts reference file paths:** `wallet-data.ts`, `generate-og-images.js`, `smoke-test-wallet-data.js` all have hardcoded file paths. Update all simultaneously.

10. **Internal markdown links break:** Cross-references in markdown files use relative paths. Update all internal links when renaming.

**Key insight:** URL/file renames are not simple operations. They require systematic updates across frontend code, configuration, scripts, and documentation. Always use a checklist and verify with grep/search.

### CI and Build Meta-Learnings (Jan 2026)

1. **CI checks must not skip** - PR attribution check should run on ALL PRs (no paths filter). Frontend CI checks should fail builds on errors, not skip with `|| true`. See `.cursorrules` Rule #129.

2. **Type filtering requires mapping** - when adding new comparison types with different status enums (e.g., ramps: 'active'|'verify'|'launching' vs filters: 'active'|'slow'|'inactive'|'private'), create status mapping in filter function. Don't force incompatible types. See `.cursorrules` Rule #131.

3. **Navigation consistency checklist** - when adding new comparison sections, verify presence in: Navigation.tsx (burger menu), Footer.tsx, InternalLinks.tsx (homepage), landing page hero, stats section, Top Developer Picks. Missing any location creates inconsistent UX. See `.cursorrules` Rule #127.

4. **OG images for new types** - when adding new comparison types, generate OG images (table + details), add to `seo.ts` mappings, update CI workflow to check for images, regenerate via `npm run generate-og`. CI will fail if images are missing. See `.cursorrules` Rule #128.

5. **Complete integration checklist** - when adding new comparison types, follow comprehensive checklist covering: markdown files, types, parsing, filtering, components, pages, navigation (all 6 locations), SEO (OG images, keywords, schema), markdown config, and documentation. See `CONTRIBUTING.md` "Adding a New Comparison Type" section for full checklist. See `.cursorrules` Rule #130.

6. **Structured data for new types** - update ItemList schema regex to handle markdown link format `[**Name**](url)`, use appropriate `@type` (Product vs SoftwareApplication), and update schema name to match category. See `.cursorrules` Rule #132.

7. **Keyword detection for new types** - add content-based keyword detection in `generateKeywords()` for new comparison types to improve SEO discoverability. See `.cursorrules` Rule #133.

### Crypto Card Meta-Learnings (Jan 2026)

1. **Every column should be filterable** - when adding new columns (e.g., Custody), ensure frontend supports filtering: update FilterOptions interface, FilterState interface, filter function logic, and filter UI component. The chain is: `types/wallets.ts` → `wallet-filtering.ts` → `WalletFilters.tsx` → `ExploreContent.tsx`. See `.cursorrules` Rule #135.

2. **Verify custody from official sources** - custody classifications must be verified from official website text. Look for keywords:
   - Self-custody: "self-custody", "non-custodial", "your keys", "your control"
   - Exchange: "exchange" references, funds held on exchange
   - CeFi: Prepaid cards issued by banks, "issued by [Bank Name]"
   Document verification in VERIFICATION_NOTES.md. See `.cursorrules` Rule #136.

3. **Score changes cascade to multiple files** - when recalculating scores, create a checklist:
   - [ ] Main table (CRYPTO_CARDS.md)
   - [ ] Comparison file (CRYPTO_CREDIT_CARD_COMPARISON.md)
   - [ ] Details file score summary (CRYPTO_CARDS_DETAILS.md)
   - [ ] Homepage recommendations (page.tsx)
   - [ ] Structured data/schema.org
   - [ ] FAQ answers
   - [ ] Smoke tests (if spot-check values changed)
   See `.cursorrules` Rule #137.

4. **TBD data requires research attempts** - before marking data as TBD:
   - Attempt browser automation (Playwright) to scrape official websites
   - Try multiple URLs (main site, help pages, FAQ)
   - Document research attempts and results
   - If website unreachable after multiple attempts, mark with ⚠️ status
   See `.cursorrules` Rule #138.

5. **High cashback claims require verification** - "Up to X%" claims often require staking or tier progression. Verify actual base rates and document requirements. Marketing claims frequently differ from typical user experience.

6. **Custody affects scoring** - custody type impacts scores via adjustments:
   - Self-custody: +3 pts (lower risk)
   - Exchange custody: -3 pts (platform risk)
   - CeFi custody: 0 pts (neutral)
   Ensure custody classification is accurate before applying adjustments.

---

*Last updated: January 6, 2026*
