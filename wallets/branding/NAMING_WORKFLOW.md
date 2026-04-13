# Strict Naming Workflow (Wallet Radar)

This workflow is the Wallet Radar implementation of `ideas/_templates/NAMING_WORKFLOW.md`.

## 1. Positioning Lock

Naming is constrained by `POSITIONING_BRIEF.md`:

- category: crypto access intelligence
- users: developers, technical operators, power users
- promise: transparent, source-linked product scoring and verification
- scope: wallets + ramps + cards + future bank rails

## 2. Candidate Generation

- `CANDIDATES.txt` contains the broad candidate set
- hard constraint: max two semantic words (including fused compounds)

## 3. Hard Filters

Reject names with:

- blocked generic tokens (`crypto`, `blockchain`, `defi`)
- known collisions (`WalletBeat`, current `WalletRadar` as control)
- invalid word-count or weak pronounceability

## 4. Scoring + Validation

`wallets/scripts/run_naming_workflow.py` computes weighted scores and runs domain checks on:

- `.com`
- `.org`
- `.net`
- `.xyz`
- `.finance`

Two-pass execution:

1. Broad pass over `CANDIDATES.txt` -> `NAMING_VALIDATION.md`
2. Focused pass over `SHORTLIST_CANDIDATES.txt` -> `NAMING_VALIDATION_SHORTLIST.md`

Then run a manual GitHub collision/reuse scan for shortlist names and store notes in a `GITHUB_NAME_SCAN.md` artifact before locking the final name.

If RDAP rate limits produce `unknown` statuses in the broad pass, treat shortlist output as the decision-grade source and rerun broad pass later for archival completeness.

## 5. Decision

Final selection is documented in `NAMING_DECISION.md` with primary + backups and migration notes.
