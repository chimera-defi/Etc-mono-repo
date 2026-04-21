# Wallet Data Scripts

Automation scripts for refreshing wallet comparison data.

## Scripts

### `sync_table_scores.js` (Comparison Tables)

Recomputes `Score` and recommendation cells from the visible markdown-table columns for:

- `wallets/SOFTWARE_WALLETS.md`
- `wallets/HARDWARE_WALLETS.md`
- `wallets/CRYPTO_CARDS.md`
- `wallets/RAMPS.md`

It also sorts rows by computed score so the published tables stay in rank order, and refreshes the generated snapshot blocks at the top of the matching `*_DETAILS.md` files.

#### Usage

```bash
# Check for drift only
node wallets/scripts/sync_table_scores.js

# Rewrite tables in place
node wallets/scripts/sync_table_scores.js --write
```

#### Notes

- Current methodology version: `2026-04-visible-columns-v3`
- Recommendation bands are auto-assigned from score percentiles per table run (bottom quartile = 🔴, middle quartile = 🟡, top half = 🟢), with hard overrides for inactive rows.
- `wallets/frontend/scripts/smoke-test-wallet-data.js` expects the tables to be in sync
- This script is now the source of truth for score/recommendation cells and the generated detail-doc snapshots

### `generate_merchant_feed.py` (Merchant Center)

Generates a Google Merchant Center feed from the hardware wallet comparison
table using verified pricing from `wallets/data/merchant_pricing.json`.
Free categories (software wallets, ramps, and most cards) are excluded to avoid
placeholder pricing. Items without verified pricing are skipped.

#### Usage

```bash
./generate_merchant_feed.py
```

#### Output

- `wallets/frontend/public/merchant-center.xml` (public feed URL)

**Note:** Keep `wallets/data/merchant_pricing.json` updated with official
provider pricing so the feed stays compliant. Files under `wallets/artifacts/`
are gitignored and intended for local inspection only.

### `validate_merchant_feed.py` (Merchant Center)

Validates that:
- pricing entries are USD-only with sources and valid `last_checked` dates
- pricing entries map to hardware wallet anchors
- feed items are hardware wallets with USD pricing

#### Usage

```bash
./validate_merchant_feed.py
```

Pricing sources and exclusions are documented in `wallets/MERCHANT_FEED.md`.

### `extract_wallets_subtree.sh` (Standalone Extraction Helper)

Creates a split branch containing only `wallets/` history, suitable for pushing
to a standalone repository.

#### Usage

```bash
./wallets/scripts/extract_wallets_subtree.sh https://github.com/chimera-defi/walletradar.git
```

It prints the push command and verification steps. Pair this with
`wallets/EXTRACT_STUB_PLAN.md` and `wallets/STUB_README_TEMPLATE.md` when
performing the monorepo-to-standalone migration.

### `recompute_scores.py` (Score Totals)

Recalculates totals in scoring breakdown tables for software and hardware
wallets. This only updates totals where the per-category columns already exist.

This is separate from `sync_table_scores.js`, which regenerates the public
comparison-table score cells from the visible columns.

#### Usage

```bash
./recompute_scores.py
```

### `run_naming_workflow.py` (Naming + Domain Validation)

Runs a strict naming workflow from `wallets/branding/CANDIDATES.txt`:

- applies hard filters (word count, blocked tokens, collision controls)
- scores surviving names with weighted criteria
- checks domain availability across `.com`, `.org`, `.net`, `.xyz`, `.finance`
- writes `wallets/branding/NAMING_VALIDATION.md`
- writes `wallets/branding/naming-workflow-output.json`

#### Usage

```bash
# Print report to stdout
python3 wallets/scripts/run_naming_workflow.py

# Write report files
python3 wallets/scripts/run_naming_workflow.py --write

# Write pretty-printed JSON (default output is compact JSON to keep diffs small)
python3 wallets/scripts/run_naming_workflow.py --write --pretty-json

# Validate only shortlist candidates
python3 wallets/scripts/run_naming_workflow.py \
  --candidates wallets/branding/SHORTLIST_CANDIDATES.txt \
  --markdown-output wallets/branding/NAMING_VALIDATION_SHORTLIST.md \
  --json-output wallets/branding/naming-workflow-shortlist.json \
  --write
```

Use `--workers`, `--timeout`, and `--retries` to tune RDAP reliability vs speed when domain checks return many `unknown` statuses.

### `verify-ramps.py` (Ramps)

Verifies ramp provider URLs from `wallets/RAMPS.md` using a direct fetch plus
`r.jina.ai` proxy as a fallback to detect bot challenges.

#### Usage

```bash
./verify-ramps.py
```

#### Output

- `wallets/artifacts/ramps-url-checks.json`
- `wallets/artifacts/ramps-url-checks.txt`

### `refresh-github-data.sh` (Software Wallets)

Queries GitHub for **EVM software wallet** activity.

Queries the GitHub API to get the latest commit dates and activity status for all tracked wallet repositories. The tracked repos are discovered from the public `wallets/SOFTWARE_WALLETS.md` table, so adding or removing rows there automatically changes the refresh set.
If no token is available, it falls back to GitHub Atom feeds for the last commit date and attempts a best-effort HTML scrape for stars/issues.

#### Usage

```bash
# Basic usage - outputs to stdout
./refresh-github-data.sh

# JSON output for programmatic use
./refresh-github-data.sh --json

# Markdown table for documentation
./refresh-github-data.sh --markdown
```

#### Output Formats

**Text (default):**
```
=== Wallet GitHub Activity Check ===
Generated: 2025-12-01

MetaMask        MetaMask/metamask-extension           2025-11-27    4 days  ✅ Active
Rabby           RabbyHub/Rabby                        2025-11-21   10 days  ✅ Active
...
```

**JSON (`--json`):**
```json
{
  "generated": "2025-12-01",
  "wallets": [
    {"wallet": "MetaMask", "repo": "MetaMask/metamask-extension", "lastCommit": "2025-11-27", "daysAgo": 4, "status": "✅"},
    ...
  ]
}
```

**Markdown (`--markdown`):**
```markdown
| Wallet | Repository | Last Commit | Days Ago | Stars | Issues | Status |
|--------|------------|-------------|----------|-------|--------|--------|
| **MetaMask** | [MetaMask/metamask-extension](https://github.com/MetaMask/metamask-extension) | 2025-11-27 | 4 | 12345 | 321 | ✅ Active |
...
```

#### GitHub API Rate Limits

- **Without token:** 60 requests/hour (enough for ~17 repos)
- **With token:** 5,000 requests/hour

Set the `GITHUB_TOKEN` environment variable for higher rate limits:

```bash
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
./refresh-github-data.sh
```

If no token is set, the script uses Atom feeds for commit dates and skips API calls.
It may attempt a best-effort HTML scrape for stars/issues where applicable.

#### Activity Status Definitions

| Status | Days Since Last Commit | Meaning |
|--------|------------------------|---------|
| ✅ Active | ≤30 days | Actively maintained |
| ⚠️ Slow | 31-120 days | Reduced activity |
| ❌ Inactive | >120 days | Likely abandoned |

## GitHub Actions

The repository includes a GitHub Actions workflow (`.github/workflows/refresh-wallet-data.yml`) that:

1. Runs automatically every Monday at 9:00 AM UTC
2. Can be triggered manually via workflow_dispatch
3. Creates a PR with updated activity data

### Manual Trigger

1. Go to Actions → Refresh Wallet Data
2. Click "Run workflow"
3. Optionally enable "Dry run" to skip PR creation

## Data Directory

The `data/` directory contains:

- `activity.json` - Machine-readable activity data (generated by workflow)

---

### `refresh-hardware-wallet-data.sh` (Hardware Wallets)

Queries GitHub for **hardware wallet firmware** activity. Includes stars, issues, and issue/star ratio when the API is available.
If no token is set, the script falls back to Atom feeds for last-commit dates and attempts a best-effort HTML scrape for stars/issues.

#### Usage

```bash
# Basic usage - outputs to stdout
./refresh-hardware-wallet-data.sh

# JSON output for programmatic use
./refresh-hardware-wallet-data.sh --json

# Markdown table for documentation
./refresh-hardware-wallet-data.sh --markdown
```

The tracked repos are discovered from `wallets/HARDWARE_WALLETS.md`. The script only follows rows with a public GitHub firmware repo and dedupes shared repos such as the Trezor and BitBox product lines.

**Closed Source / not firmware-tracked:** Ledger, NGRAVE, Ellipal, SafePal, SecuX, Tangem, BC Vault, GridPlus

---

## Adding New Wallets

### For Software Wallets

Add or update the row in `wallets/SOFTWARE_WALLETS.md`. If the GitHub column links to a public repo, the refresh script will pick it up automatically.

### For Hardware Wallets

Add or update the row in `wallets/HARDWARE_WALLETS.md`. Public firmware repos with `✅ Full` open source are discovered automatically; SDK-only and non-firmware links are skipped.

## Requirements

- `bash` (4.0+)
- `curl`
- `jq`
- `date` (GNU or BSD)
