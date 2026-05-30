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

<!-- kimi-delegate:begin -->
## Kimi Delegate Routing

- **For bounded side tasks (search/summarize/draft/review), use the skill wrapper.**
  - `./skills/kimi-delegate/scripts/delegate.py --task "..."`
  - Or, if `setup.sh` has been run: `kimi-delegate --task "..."`
- **Always produce an envelope first** with `./skills/kimi-delegate/scripts/plan_prompt.py --task "..."`.
- **Direct `pi --provider kimi-coding` calls bypass telemetry and fallback.** Route through the skill so savings, quality, and fallback behavior are tracked.
- Keep delegation scoped and include acceptance criteria.
- If Kimi fails, keep fallback enabled and inspect telemetry (`./skills/kimi-delegate/scripts/kimi_delegate_telemetry.py summary --days 14`).
<!-- kimi-delegate:end -->

<!-- devin-delegate:begin -->
## Devin Delegate Routing — MANDATORY

All Devin calls MUST route through the skill wrapper. Direct `devin --print` and `devin --task` calls are **prohibited** — they bypass envelope checks, fallback routing, clarification handling, and telemetry.

- **One-liner:** `devin-delegate --task "..."`
- **Interactive:** `devin-delegate --interactive`
- **Long path (fallback):** `./skills/devin-delegate/scripts/delegate.py --task "..."`

**Why this matters:**
- Structured envelopes prevent vague handoffs
- Codex then Claude guidance resolves many clarification loops before human escalation
- Provider fallback keeps execution moving when Devin fails
- Telemetry enables continuous improvement

**Bypassing the wrapper will be detected and reported.**

- Always produce an envelope first with `./skills/devin-delegate/scripts/plan_prompt.py --task "..."`.
- Keep delegation scoped and include acceptance criteria.
- If Devin asks for clarification, use Codex guidance first and Claude second before asking a human.
- Inspect telemetry regularly (`./skills/devin-delegate/scripts/devin_delegate_telemetry.py summary --days 14`).
<!-- devin-delegate:end -->
