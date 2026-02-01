# Wallet Comparison Guidelines

> **Master rules:** `.cursorrules` | **MCP CLI:** `.cursor/MCP_CLI.md` | **Token efficiency:** `/token-reduce` skill

## Core Purpose

**Goal:** Find stable MetaMask alternatives with **both desktop browser extension AND mobile apps** for **developer use**.

**Core Criteria (MUST HAVE):**
1. Mobile app available
2. Browser extension available
3. Developer-friendly (stable, good for testing dApps)
4. Better stability than MetaMask (~8 releases/month is too much churn)

**A wallet without BOTH mobile + browser extension does NOT meet core criteria.**

---

## Document Structure

**Single source of truth:**
- `SOFTWARE_WALLETS.md` - Software wallets
- `HARDWARE_WALLETS.md` - Hardware wallets
- `CRYPTO_CARDS.md` - Crypto cards

**Each category:** Main table + `*_DETAILS.md` for details view.

---

## Wallet Categorization

**Meet Core Criteria (Mobile + Browser):**
Rabby, Trust, Rainbow, Brave, Coinbase, MetaMask, Phantom, OKX, Wigwam, Zerion, Block*

**Don't Meet Criteria:**
- Browser-only: Enkrypt, Ambire, Taho
- Mobile-only: Daimo, imToken, 1inch
- Web app only: Safe, Sequence
- No browser ext: Ledger Live, MEW, Uniswap

**Inactive/Abandoned:** Mark with ❌

---

## Scoring Methodology

**Developer-Focused Priorities:**
1. **Platform Coverage (CRITICAL):** No mobile+extension = significant penalty
2. **Developer Experience:** Tx simulation, testnet support, custom RPC
3. **Stability:** Low release frequency = GOOD
4. **Activity:** Active dev matters, but stable > frequent releases
5. **Open Source:** Important but not critical
6. **API Openness:** Backend/API transparency for developers

**Stability Metrics (Anti-MetaMask):**
- Release frequency: Lower is better
- Issue/star ratio: Lower is better
- Breaking changes: Fewer is better

---

## API Openness

| Category | Symbol | Description |
|----------|--------|-------------|
| Full | ✅ | Backend open source + self-hostable |
| Partial | ⚠️ | Some APIs open, core proprietary |
| Public | 🌐 | APIs accessible, code proprietary |
| Closed | ❌ | Proprietary, no public access |

**Leaders:** Safe (8+ open services, self-hostable), Rabby (DeBank API public, no auth)

---

## Data Verification

**Required for each wallet:**
1. GitHub repo exists (correct main repo)
2. Last commit date (use `scripts/refresh-github-data.sh`)
3. License from repo
4. Verify BOTH mobile app AND browser extension exist

**Sources (priority):** GitHub → Official docs → WalletBeat → App stores

**Common mistakes:**
- Trusting mobile+extension without verifying
- Using wrong GitHub repo (SDK vs main app)
- Not checking if extension is main chain only

---

## MCP CLI Patterns (Wallet-Specific)

**General patterns:** See `.cursor/MCP_CLI.md`
**Token optimization:** See `.cursor/TOKEN_REDUCTION.md` or use `/token-reduce` skill

```bash
# Bulk read wallet tables (reduces tool call overhead, provides structured data)
mcp-cli filesystem/read_multiple_files '{"paths": ["wallets/SOFTWARE_WALLETS.md", "wallets/HARDWARE_WALLETS.md", "wallets/CRYPTO_CARDS.md"]}'

# Store wallet research (saves 84% tokens across multiple sessions)
mcp-cli memory/create_entities '{"entities": [{"name": "WalletName", "entityType": "wallet", "observations": ["feature1", "feature2"]}]}'

# ALWAYS query before research (avoids duplicate work)
mcp-cli memory/search_nodes '{"query": "wallet name"}'
```

**Token reduction for wallet work:**
- Query knowledge graph for previously researched wallets
- Use MCP CLI bulk reads for comparing multiple wallet tables
- Store scoring methodology in memory server
- Use targeted file reads (head/tail) for large wallet lists

---

## Hardware Wallet Guidelines

**Core Principle:** Private keys should NEVER leave the device.

**Scoring (100 pts):**
1. Security Architecture (25) - Secure Element, air-gap, tamper resistance
2. Transparency (20) - Open firmware, reproducible builds
3. Privacy & Trust (15) - No seed extraction capability
4. Development Activity (15) - GitHub activity
5. Company & Track Record (15) - Funding, longevity, incidents
6. UX & Ecosystem (10) - Display, chains, integrations

**Thresholds:** 🟢 75+ | 🟡 50-74 | 🔴 <50

**Red Flags:**
- Ledger Recover-style features
- Closed source firmware
- No Secure Element
- Abandoned development

---

## Crypto Card Guidelines

**Custody types:**
- Self-custody: +3 pts
- Exchange custody: -3 pts
- CeFi custody: 0 pts

**Verify custody from official sources** - look for "self-custody", "non-custodial", "your keys"

---

## Meta Learnings

**From Third Review (Dec 2025):**
1. Core criteria matter most - 12/24 wallets don't meet basic requirements
2. Scoring should enforce criteria
3. Stability is undervalued
4. Data exists but is scattered

**Document Maintenance:**
1. Single table principle
2. Changelog discipline
3. Verify before trust

**Workflow:**
1. Always open a PR for changes; do not push directly to main.
4. Activity status decays

**Multi-Pass Review:**
1. Math verification - breakdowns must sum to totals
2. Values within bounds - no column exceeds maximum
3. Cross-document consistency
4. No data loss on restructure

**Data Columns (preserve):**
- Chains, Rel/Mo, RPC, GitHub, Testnets, Audits
- Last Commit, Stars, Issues, Ratio, Stability

---

## URL/File Rename Checklist

When renaming files:
1. Update markdown config
2. Update parsing functions
3. Update cross-references
4. Update related document mappings
5. Update sitemap logic
6. Update scripts (wallet-data.ts, generate-og-images.js)
7. Grep for old references
8. Run build/type check

---

## Red Flags

**Watch:** Coinbase SDK (slowed Jul 2025), Taho (slow, grant-dependent), Wigwam (slow, unknown funding)

**Abandonment signs:**
- No commits 4+ months
- Issues piling up
- No releases 6+ months
- Team members leaving

---

*Last updated: January 2026*
