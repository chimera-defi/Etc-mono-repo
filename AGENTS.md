# Etc Mono Repo Agent Rules

> **Master rules:** `.cursorrules` | **Token efficiency:** `skills/token-reduce/SKILL.md` | **Benchmarks:** `skills/token-reduce/references/token-reduction-guide.md`

## First Move For Discovery

- If file location is unknown, start with `./skills/token-reduce/scripts/token-reduce-paths.sh topic words` for a low-token path kickoff.
- If you already know the path or a tight file glob, use scoped `rg -g` before reading.
- Do not begin repo exploration with `find .`, `ls -R`, `grep -R`, `rg --files .`, `tree`, or broad `Glob` patterns.

## Token Reduction Defaults

- Keep responses concise and avoid narrating tool usage.
- Prefer targeted reads over full-file reads.
- Escalate to a subagent or parallel exploration once the candidate set exceeds 5 files.
- Treat `rg --files .` as a broad inventory pass, not a compliant search.

## Repo Helper

- `./skills/token-reduce/scripts/token-reduce-paths.sh topic words` is the preferred deterministic kickoff helper for agents because it avoids quoted flags.
- If you need one ranked excerpt after the path kickoff, use `./skills/token-reduce/scripts/token-reduce-snippet.sh topic words`.
- It uses a repo-specific QMD collection for docs when available and falls back to scoped `rg`.
- If QMD is missing, do not fake it. Use scoped `rg -g` and keep the read set narrow.

## Measurement

- Repo-local adoption: `./skills/token-reduce/scripts/baseline-measurement.sh --scope repo`
- The measurement includes both Claude and Codex sessions for this repo.

<!-- kimi-delegate:begin -->
## Kimi Delegate Routing — MANDATORY

All Kimi subagent calls MUST route through the skill wrapper. Direct `pi --provider kimi-coding` calls are **prohibited** — they bypass telemetry, fallback, auth detection, and timeout scaling.

- **One-liner:** `kimi-delegate --task "..."`
- **Interactive:** `kimi-delegate --interactive`
- **Long path (fallback):** `./skills/kimi-delegate/scripts/delegate.py --task "..."`

**Why this matters:**
- Structured envelopes prevent vague handoffs
- Auto-scaling timeouts prevent hangs on large repos
- Auth error detection gives explicit resume steps instead of silent failures
- Codex fallback ensures tasks always complete
- Telemetry enables continuous improvement

**Bypassing the wrapper will be detected and reported.**

- Always produce an envelope first with `./skills/kimi-delegate/scripts/plan_prompt.py --task "..."`.
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
