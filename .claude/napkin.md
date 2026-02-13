
| 2026-02-08 | system | Used apply_patch via shell instead of apply_patch tool | Always use apply_patch tool directly (per instructions) |
| 2026-02-08 | self | Needed reusable memory artifacts across sessions for ideas | Store durable context under `ai_memory/` with one file per domain/topic |
| 2026-02-08 | self | Commit rejected by hook due missing scope in header | Use `type(scope): subject [Agent: Model]` format for all commits |
| 2026-02-08 | self | Commit hook requires Co-authored-by footer | Add second -m with `Co-authored-by: GPT-5 <model@vendor.invalid>` |
| 2026-02-08 | self | New memory folders can be hard to discover without index links | Add backlinks in top-level README and relevant project README when introducing persistent artifacts |
| 2026-02-13 | user | Asked to back up OpenClaw/Clawdbot/Takopi memory from root installs | Track canonical runtime paths (`/root/.openclaw`, `/root/.takopi`, `/root/clawd`) in `ai_memory/` with sanitized snapshots |
| 2026-02-13 | self | Root runtime configs contained live tokens | Never copy raw secrets into repo; summarize/redact sensitive fields in backups |
