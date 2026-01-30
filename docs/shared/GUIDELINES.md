# Shared guidelines

These are project-agnostic conventions that keep work consistent across repos.

## 1) Docs and specs
- Maintain a single plan/spec per project.
- Every spec must include: scope, non-goals, assumptions, dependencies, and acceptance criteria.
- Update the spec when behavior changes; avoid drift.

## 2) Structure
- Keep operational scripts in `scripts/` and documents in `docs/`.
- Use `README.md` for quickstart only; keep long detail in `docs/`.

## 3) Naming conventions
- Scripts: `verb-noun` (e.g., `setup-host`, `run-smoke`).
- Config: `*.example` for non-secret samples.
- Logs: `logs/` and rotate or ignore in `.gitignore`.

## 4) Change hygiene
- Every change should map to a line in the plan or task list.
- Remove duplicate implementations; prefer consolidation over parallel paths.

## 5) Release discipline
- Keep a `CHANGELOG.md` when user-facing behavior changes.
- Tag releases only after docs and tests are updated.

## 6) Handoff minimums
- A “how to run” section.
- A “what’s left” section with links to tasks.
- Known risks and required manual steps.
