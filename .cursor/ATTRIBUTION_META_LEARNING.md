## Meta-learning: GitHub Attribution (Commits vs PRs)

**Issue encountered (Feb 2026)**: commits were authored/committed as `Cursor Agent <cursoragent@cursor.com>`, which caused GitHub to display `cursoragent` as the commit author/committer. Additionally, using an email like `noreply@openai.com` in `Co-authored-by:` can map to an unexpected GitHub account, showing a “random” co-author in the UI.

### Required attribution format (per `.cursorrules` + `CLAUDE.md`)

- **Commit title**: include model attribution, e.g. `... [Agent: <MODEL NAME>]` (Rule #117).
- **Commit author**: **human repo owner**.
  - `Author: Chimera <chimera_defi@protonmail.com>`
- **Commit message body**: include AI as co-author (Rule #122 / #124).
  - `Co-authored-by: <MODEL NAME> <model@vendor.invalid>`
  - Use a **non-mapped email** (e.g. `.invalid`) to avoid GitHub associating the co-author with an unrelated account.

- **PR description** (CI-validated): must include:
  - `**Agent:** <MODEL NAME>`
  - `**Co-authored-by:** Chimera <chimera_defi@protonmail.com>`
  - `## Original Request` with the user prompt

**Guardrail:** do not copy example model names (e.g. “Claude Opus”) into PR descriptions. The `**Agent:**` line must match the actual model used in the run.

### Note: PR editing permissions

In some Cursor cloud environments, the GitHub token may not be allowed to edit PR bodies via API/CLI (“Resource not accessible by integration”).
If that happens, the human should edit the PR description manually to fix `**Agent:**` / `**Co-authored-by:**` / `## Original Request`.

### Guardrail (do at session start)

Set repo-local Git identity before committing:

```bash
git config user.name "Chimera"
git config user.email "chimera_defi@protonmail.com"
```

