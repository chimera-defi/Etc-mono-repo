# Workflow Compliance

This document prevents "local-only" work from bypassing repo PR workflow.

## Scope Rule

- `repo-scoped`: changes under this repository root. Must be committed and opened as a PR.
- `machine-scoped`: changes outside this repository (for example `$HOME/.agents`, `$HOME/.claude`, sibling repos). Require explicit user confirmation and should be codified in tracked scripts/docs where possible.

## Preflight

Before editing paths, classify scope:

```bash
bash scripts/workflow/preflight-classify.sh <path1> <path2> ...
```

If output is mixed scope, split the work into:

- a repo PR for tracked changes
- separate user-confirmed machine operations

## PR Readiness Gate

Before claiming completion, run:

```bash
bash scripts/workflow/check-pr-readiness.sh
```

This verifies:

- current branch is not `main`/`master`
- there are staged/unstaged changes to commit

## Shared Skill Operations

Install gstack in a way that works for both Claude and Codex:

```bash
bash scripts/skills/install-gstack-shared.sh
```

Sync shared skills to Claude/Codex homes:

```bash
bash scripts/skills/sync-shared-skills.sh
```

Sync `gstack*` repo-local links across sibling repos:

```bash
bash scripts/skills/sync-gstack-to-sibling-repos.sh
```
