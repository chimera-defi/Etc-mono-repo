# Napkin

## Corrections
| Date | Source | What Went Wrong | What To Do Instead |
|------|--------|----------------|-------------------|
| 2026-02-08 | system | Used apply_patch via shell instead of apply_patch tool | Always use apply_patch tool directly (per instructions) |
| 2026-02-11 | self | Tried `git pull --rebase` with unstaged changes and it failed | Stash local edits before sync/rebase operations, then restore them |
| 2026-02-11 | self | README still referenced `.git/hooks/commit-msg` while repo policy uses `.githooks` | Normalize docs to `.githooks/*` and include `git config core.hooksPath .githooks` |
| 2026-02-11 | self | Tried YAML validation with `ruby` but runtime is not installed | Use `python3` + `PyYAML` for local workflow YAML parse checks in this repo |
| 2026-02-11 | self | Used `git commit -m` with `\\n` escapes; trailers stayed on one line and hook rejected commit | Use a commit message file (`git commit -F`) when trailers/body formatting must be exact |

## Domain Notes
- 2026-02-11: This repo tracks reusable hooks in `.githooks/` (e.g., `.githooks/pre-push`), while some docs still reference `.git/hooks/*`; prefer `.githooks` for source-controlled hook changes.
- 2026-02-11: Commit attribution format in this repo is `type(scope): subject [Agent: ...]` plus `Co-authored-by:` trailer; PR attribution remains a separate CI check.
