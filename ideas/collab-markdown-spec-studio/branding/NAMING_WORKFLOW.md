# Strict Naming Workflow (Collaborative Spec Studio)

This directory applies the strict naming workflow for the external rename of the SpecForge product.

## Inputs

- `POSITIONING_BRIEF.md`
- `CANDIDATES.txt`
- `SHORTLIST_CANDIDATES.txt`

## Workflow

1. Broad pass scoring + domain checks:

```bash
python3 ideas/scripts/run_naming_workflow.py --write
```

2. Shortlist pass scoring + domain checks:

```bash
python3 ideas/scripts/run_naming_workflow.py \
  --candidates ideas/collab-markdown-spec-studio/branding/SHORTLIST_CANDIDATES.txt \
  --markdown-output ideas/collab-markdown-spec-studio/branding/NAMING_VALIDATION_SHORTLIST.md \
  --json-output ideas/collab-markdown-spec-studio/branding/naming-workflow-shortlist.json \
  --write
```

3. Manual GitHub collision/reuse scan for finalists:
- Write findings to `GITHUB_NAME_SCAN.md`.

4. Quick legal/social triage for finalists:
- Write findings to `TRADEMARK_HANDLE_TRIAGE.md`.

5. Final decision:
- Record in `NAMING_DECISION.md` with primary + backups.
