# Takopi Memory Backup

## Operating Defaults

- Always use a feature branch and PR. Never push directly to `main`.
- Pull latest `main` before status answers or new work.
- One task = one PR branch; stack commits there.
- Use `bun` over `node`/`npm` by default.
- Prefer `rg -g` for scoped search, QMD BM25 for ranked snippet discovery.
- Avoid MCP CLI filesystem reads for this repo (benchmark-confirmed slower and noisier).

## Process Preferences

- Keep guidance propagated across `.cursorrules`, `CLAUDE.md`, AGENTS, and token-reduce skill docs.
- Run local benchmarks when a benchmark claim changes; append results to benchmark docs.
- Do multi-pass cleanup for docs/rules and remove contradictory guidance.

## Mistakes To Avoid

- Do not create many PRs for one request; keep related work in one PR branch.
- Do not use `apply_patch` via shell command; use the `apply_patch` tool directly.
- Do not leave stale benchmark numbers after newer authoritative measurements are merged.

## High-Signal References

- `docs/BENCHMARK_MCP_VS_QMD_2026-02-07.md`
- `.cursor/TOKEN_REDUCTION.md`
- `.claude/skills/token-reduce/SKILL.md`
- `.cursorrules`
- `CLAUDE.md`

## Global AI Tools & Skills

- **Primary tools:** `rg`/`rg --files`, `qmd` BM25 search, targeted reads (`head`/`tail`/`sed`), `apply_patch`.
- **Global skills in use:** `napkin`, `token-reduce`.
- **Operational policy:** QMD + `rg` for retrieval, avoid MCP CLI filesystem reads in this repo unless re-benchmarked.
