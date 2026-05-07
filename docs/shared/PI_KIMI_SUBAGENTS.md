# Pi Kimi Subagent How-To

This repo recommends `pi-kimi-subagent` for side-task delegation while keeping Codex as the orchestrator.

## Recommendation

- Keep critical-path work local in Codex: end-to-end plan, integration across files/projects, and final validation.
- Delegate independent side tasks to `pi-kimi-subagent`: exploration, non-blocking checks, and scoped drafting.
- Keep Takopi defaults unless intentionally testing alternatives: `pi.provider="kimi-coding"` and `pi.model="k2p6"`.
- If `pi-kimi-subagent` fails (auth/provider/runtime), fall back to built-in Codex `explorer`/`worker` and continue.

## Basic Usage

```bash
pi-kimi-subagent "Summarize wallets/frontend/src and list risks in state handling."
```

Optional overrides:

```bash
PI_KIMI_PROVIDER=kimi-coding PI_KIMI_MODEL=k2p6 PI_KIMI_TIMEOUT=180s \
  pi-kimi-subagent "Inspect staking/ for deployment risks."
```

If authentication fails:

```bash
kimi login
```

## End-to-End Coding Smoke Test

Run:

```bash
./scripts/tests/pi-kimi-subagent-smoke.sh
```

The script confirms a coding-style workflow by asking `pi-kimi-subagent` to read an input file, write an output file, and return a deterministic completion token.
