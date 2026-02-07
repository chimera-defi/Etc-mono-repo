# Wallet Comparison Guidelines

> **Master rules:** `.cursorrules` | **Token efficiency:** `/token-reduce` skill | **Benchmarks:** `docs/BENCHMARK_MCP_VS_QMD_2026-02-07.md`

## Git Discipline (Required)

- One task = one PR (keep all commits on a single PR branch)
- Never push directly to `main` or `master`
- Create a branch/worktree before changes
- Always use a feature branch + PR
- Enable hooks: `git config core.hooksPath .githooks`

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

## Search & Retrieval Patterns (Wallet-Specific)

**General patterns:** See `.cursor/TOKEN_REDUCTION.md`

```bash
# Scope first with rg
rg -g "*.md" "wallet name" wallets/

# Ranked snippets when you need discovery
qmd search "wallet name" -n 5 --files
qmd search "wallet name" -n 5

# Targeted reads
sed -n '120,200p' wallets/SOFTWARE_WALLETS.md
```

## Token Reduction Bootstrap

```bash
command -v qmd >/dev/null 2>&1 || bun install -g https://github.com/tobi/qmd
```

**Workflow:** Use QMD first for docs/notes, then targeted reads.

**Token reduction for wallet work:**
- Use `rg -g` scoped search first
- Use QMD BM25 for ranked snippets/paths
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
4. Sync GitHub metrics across detail + summary docs after data refresh

**Workflow:**
1. Always open a PR for changes; do not push directly to main.
2. Always pull latest `main` and rebase your branch on `main` at the start of each new request.
3. After rebasing, force-push with lease if the branch diverges from the PR head.
4. Keep one task in one PR; do not create multiple PRs for the same request.
5. Always commit changes with a descriptive message and model attribution.
6. Record research inputs in `wallets/artifacts/` (gitignored) and summarize durable notes in `wallets/MERCHANT_FEED.md` or other docs.
7. Merchant feeds must use provider-site pricing; skip free categories (software wallets/ramps) and items without verified prices.
8. Activity status decays
9. Use headless Chromium for bot-protected URL verification and store results in `wallets/artifacts/manual-browser-checks.json`.
10. If `GITHUB_TOKEN` is unavailable, use unauth GitHub API/Atom fallbacks and record that stars/issues are best-effort.
11. Token reduction: use QMD BM25 + `rg -g`; avoid MCP CLI filesystem reads.
12. Use Bun by default (prefer `bun` over `node`/`npm`).
13. Always do 2-3 quick passes for extra optimization ideas.

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

*Last updated: February 2026*
