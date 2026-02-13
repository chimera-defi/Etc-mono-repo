# Agent Import Runbook (Repo Bootstrap)

Use this first on a new server before applying memory/persona seeds.

## Input

- Manifest: `ai_memory/bootstrap/repo_bootstrap/export.manifest.json`

## Execution Rules

For each repo entry:

1. If `path/.git` exists:
- Execute `sync` in that repo path.

2. If `path/.git` does not exist:
- Clone `clone` into `path`.
- Checkout `branch`.

3. Run each `setup` command in order in that repo path.

4. If a repo entry includes `notes`, enforce those prerequisites first.

## Required Tooling

- `git`
- `bun` (for JS/TS repos)
- `uv` (for Takopi)
