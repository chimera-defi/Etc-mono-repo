# Stable Memory (Curated)

## User Preferences
- Address user as chimera.
- Keep replies concise and practical.
- Intelligently route tasks to appropriate model tiers (light tasks on cheaper/faster tiers, complex work on xhigh/subagents).
- Save durable meta-learnings to local memory.
- Periodically review/clean memory for clarity and concision.
- Do not open PRs against takopi unless explicitly requested.
- Dependency/cleanup scope should include `SharedStake-ui` alongside owned repos.
- Before context reset/compaction: write a handoff file and resume from it in a fresh thread.

## Operational Baseline
- OpenClaw default model: `openai-codex/gpt-5.3-codex`.
- Heartbeat is disabled (`HEARTBEAT.md`).
- Preferred token-efficiency workflow: QMD BM25 first, then targeted reads.

## Recent Durable Decisions
- Legacy `clawdbot-gateway` conflict was removed; `openclaw-gateway` is the active gateway.
- Aggressive disk cleanup completed successfully (large reclaim from Docker/images/logs/caches).
