# AGENTS.md - Wallet Comparison Guidelines

This document provides guidance for AI coding assistants working on the wallet comparison documents.

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
- **WALLET_COMPARISON_UNIFIED.md** is the single unified table with ALL wallets and ALL data
- Do NOT create separate tables for different wallet categories
- Keep all data in one comprehensive table, use filtering/sorting in the HTML version

### Supporting Documents
- `walletconnect-wallet-research.md` — Original detailed research (reference only)
- `README.md` — Quick reference and links
- `CONTRIBUTING.md` — How to add new wallets
- `index.html` — Interactive web version
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
3. Update index.html wallet data array
4. Update relevant sections (Security Audits, Hardware Support, etc.)
5. Add changelog entry

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
3. **Cross-document consistency:** Main table, breakdown table, and index.html must all match
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
4. Update index.html data array
5. Add changelog entry

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

---

*Last updated: December 5, 2025*
