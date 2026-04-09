# Wallet Radar Naming Pack

This folder contains the strict naming workflow artifacts for evaluating a potential product rename.

## Scope

The product scope is broader than wallet custody. It now covers software wallets, hardware wallets, on/off-ramps, crypto cards, and future crypto-linked banking rails.

## Files

- `POSITIONING_BRIEF.md` - Frozen positioning statement before naming
- `CANDIDATES.txt` - Raw candidate set (one name per line)
- `NAMING_VALIDATION.md` - Generated scored report
- `naming-workflow-output.json` - Generated machine-readable output
- `GITHUB_NAME_SCAN.md` - GitHub repository-name collision scan for finalists
- `NAMING_DECISION.md` - Decision log (primary + backups)

## Run Workflow

```bash
python3 wallets/scripts/run_naming_workflow.py --write
# add --pretty-json for indented JSON output
```

Focused shortlist validation:

```bash
python3 wallets/scripts/run_naming_workflow.py \
  --candidates wallets/branding/SHORTLIST_CANDIDATES.txt \
  --markdown-output wallets/branding/NAMING_VALIDATION_SHORTLIST.md \
  --json-output wallets/branding/naming-workflow-shortlist.json \
  --write
```

If the broad pass has many `unknown` domain statuses, rerun with lower concurrency (for example `--workers 3 --retries 3`) and use the shortlist report as decision-grade output.

## Export for Ideas Creation Pack

```bash
./ideas/scripts/export-naming-pack.sh \
  --source wallets/branding \
  --slug wallet-radar
```
