# Etc Mono Repo Agent Rules

> **Master rules:** `.cursorrules` | **Token efficiency:** `.claude/skills/token-reduce/SKILL.md` | **Benchmarks:** `docs/BENCHMARK_MCP_VS_QMD_2026-02-07.md`

## First Move For Discovery

- If file location is unknown, start with `./.claude/token-reduce-search.sh "topic"`.
- If you already know the path or a tight file glob, use scoped `rg -g` before reading.
- Do not begin repo exploration with `find .`, `ls -R`, `grep -R`, `rg --files .`, `tree`, or broad `Glob` patterns.

## Token Reduction Defaults

- Keep responses concise and avoid narrating tool usage.
- Prefer targeted reads over full-file reads.
- Escalate to a subagent or parallel exploration once the candidate set exceeds 5 files.
- Treat `rg --files .` as a broad inventory pass, not a compliant search.

## Repo Helper

- `./.claude/token-reduce-search.sh "topic"` is the preferred deterministic kickoff helper.
- It uses a repo-specific QMD collection for docs when available and falls back to scoped `rg`.
- If QMD is missing, do not fake it. Use scoped `rg -g` and keep the read set narrow.

## Measurement

- Repo-local adoption and token totals: `./.claude/baseline-measurement.sh --scope repo`
- The measurement includes both Claude and Codex sessions for this repo.
