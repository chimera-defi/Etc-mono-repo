# Agent Instructions

Primary repo-wide policies live in `.cursorrules` and `CLAUDE.md`.

## Pi Kimi Subagent Recommendation

- Keep Codex as orchestrator for critical-path work (planning, integration, final validation).
- Delegate independent side tasks to `pi-kimi-subagent` (exploration, checks, scoped drafting).
- Default Takopi config should stay: `pi.provider="kimi-coding"` and `pi.model="k2p6"`.
- If `pi-kimi-subagent` fails (auth/provider/runtime), fall back to built-in Codex `explorer`/`worker`.
- Run `./scripts/tests/pi-kimi-subagent-smoke.sh` after toolchain upgrades.

How-to: `docs/shared/PI_KIMI_SUBAGENTS.md`

<!-- token-reduce:begin -->
## Token-Reduce Routing

- If file location is unknown, your first discovery command MUST be `./skills/token-reduce/scripts/token-reduce-paths.sh topic words`.
- Use the user’s literal nouns from the prompt in that first query (feature name, file stem, hook name, symbol).
- Use `./skills/token-reduce/scripts/token-reduce-snippet.sh topic words` only if one ranked excerpt is needed after the path list.
- Do not start repo discovery with `find .`, `ls -R`, `grep -R`, `rg --files .`, or broad `Glob` patterns.
- Use scoped `rg -g` and targeted reads only after helper output.
<!-- token-reduce:end -->
