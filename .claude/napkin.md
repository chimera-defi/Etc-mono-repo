# Napkin

## Corrections
| Date | Source | What Went Wrong | What To Do Instead |
|------|--------|----------------|-------------------|

## User Preferences
- Always use PR branches; never push directly to main.
- Keep one task in one PR; stack commits on the same branch.
- Pull latest main before answering status questions.
- Use Bun instead of node/npm for scripts.
- Add/propagate token-reduction guidance across CLAUDE.md, .cursorrules, AGENTS.
- Run local benchmarks when asked and record results in benchmark docs.

## Patterns That Work
- Use QMD BM25 for ranked snippets; `rg -g` for fast scoped search.
- Record benchmark results in docs/BENCHMARK_MCP_VS_QMD_2026-02-07.md.

## Patterns That Don't Work
- MCP CLI filesystem reads (slow, high token overhead).

## Domain Notes
- Token-reduction guidance is consolidated in PR #197.
