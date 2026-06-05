# Nightly Maintenance Agent

Run `date +%u && date +%j` first, then work top-to-bottom.

Attribution, commit format, PR templates, token efficiency, and subagent routing are governed by
`Etc-mono-repo/.cursorrules` and each repo's `CLAUDE.md`. Read those; do not re-derive them here.

---

## PHASE 0 — Fix your previous work first (mandatory)

Before any new work, own every open maintenance PR you created:

1. For each in-scope repo: `mcp__github__list_pull_requests` (state=open, head=chore/maintenance-*).
2. For each open PR: `get_check_runs` → if any failure → `get_job_logs` (return_content=true, tail_lines=80) → diagnose → fix → push → re-verify until green.
3. `get_comments` on each open PR → address any owner review comments.
4. Do not start Phase 1 until all previous PRs are green or have a documented blocker comment.

---

## REPOS

**Tier 1** (every run): ethglobal-cannes-2026-intelligence-exchange · devin-delegate · kimi-delegate-skill · token-reduce-skill

**Tier 2** (2 per run, `date +%j` mod 3):
- 0 → specforge + walletradar
- 1 → walletradar + openclaw-autoresearch
- 2 → openclaw-autoresearch + SharedDeposit

**Tier 3** (only if trivially fixable): chimericlabs-llc · Etc-mono-repo · eth2-quickstart · SharedStake-ui

---

## FOCUS AREAS (`date +%u`)

Go deep: fix **all** instances per repo, not just one.

| Day | Focus | Done when… |
|-----|-------|-----------|
| 1 Mon | **Deps** — non-major semver bumps (skip Solidity/Foundry). Verify changelog. Install + build + test after each batch. | All safe bumps applied, build passes |
| 2 Tue | **TS/Go cleanup** — run `tsc --noEmit` + linter across all packages. Fix every error/warning in touched files: unused imports, `any`→real type, dead `console.log`, missing exported return types. | `tsc` exits 0, linter clean |
| 3 Wed | **Security** — full checklist per repo (see below). Fix all safe findings; open GitHub Issues for complex ones. | Checklist complete, issues filed for deferred items |
| 4 Thu | **Test coverage** — baseline first; if baseline fails, fix only that and stop. Otherwise add tests for top 3-5 zero-coverage exported paths per package. | Baseline green + new tests pass |
| 5 Fri | **Dead code** — `ts-prune`/`vulture`/rg. Remove unused exports, commented blocks >5 lines, orphaned files, stale resolved TODOs. | Build + tests still pass |
| 6 Sat | **Observability** — audit async error paths (unhandled rejections, bare `except:`). Add structured logging to API handlers with none. No logging of secrets/PII. | All async paths have `.catch()`/`except Exception as e` |
| 7 Sun | **Docs** — compare README examples vs actual CLI flags/env vars (`--help` or argparse). Fix stale spec references. Add missing JSDoc on exported public APIs. | No flag/env drift; examples runnable |

### Wednesday security checklist
- `rg -l 'sk-[a-zA-Z0-9]{20}|ghp_|=\s*["'"'"'][A-Za-z0-9]{20,}'` — hardcoded secrets
- `rg '!== .*[Tt]oken\|!== .*[Kk]ey\|!== .*[Ss]ecret'` — timing-unsafe comparisons → use `timingSafeEqual`
- `shell=True` in subprocess with user input → must use array args
- Every public API route: is there a validator (zod/pydantic/manual bounds)?
- Every outbound fetch/axios/requests call: is there a timeout (`AbortSignal.timeout` / `timeout=`)?
- `path.join` / `open()` with user-controlled strings → path traversal risk
- Admin/write endpoints: is auth checked before the handler body runs?

---

## SKILLS TELEMETRY (every session, ~15 min, after main focus)

Open one PR per skill repo (devin-delegate, kimi-delegate-skill, token-reduce-skill) when there are real improvements.

Checks:
- README matches all argparse/CLI flags (diff `--help` output vs README table)
- No env-specific path assertions in tests (e.g. `.openclaw`, `/home/runner/work`)
- Pre-existing CI failures? Fix in same PR
- Error messages actionable: timeout → exit code + what to retry; auth failure → resume steps

---

## SUBAGENT & DELEGATE ROUTING

Use these instead of reading files directly — keeps main context lean.

| Situation | Use |
|-----------|-----|
| Scan >1 repo or >5 files for patterns | `Agent(subagent_type="Explore", ...)` |
| Unknown file location, open-ended research | `Agent(subagent_type="Explore", ...)` |
| Complex multi-file implementation | `devin-delegate --task "..." --workspace /path` |
| Bulk analysis / summarisation across repos | `kimi-delegate --task "..."` |
| Self-contained multi-step task with web access | `Agent(subagent_type="general-purpose", ...)` |

Never call `pi --provider kimi-coding` or `devin` directly — always use the delegate wrappers.

---

## COMMIT FORMAT (CI enforces — do not deviate)

**All repos with `commit-message-check.yml` requiring `[Agent:]`** (token-reduce-skill, ethglobal-cannes, specforge, most others):
```
type(scope): subject [Agent: Claude Sonnet 4.6]

Body.

Co-authored-by: Chimera <chimera_defi@protonmail.com>
```

**walletradar** (scope optional, no `[Agent:]` in header):
```
type(scope)?: subject

Body.

Co-authored-by: Chimera <chimera_defi@protonmail.com>
```

Rules: `(scope)` is required when CI demands `[Agent:]` · No em dashes `—` in headers (use `-`) · `[Agent:]` at line end · `Co-authored-by` trailer on every commit.

To detect which group: `grep -l 'Agent' /path/.github/workflows/commit-message-check.yml`

---

## PR BODY (CI enforces — walletradar requires all four sections)

```markdown
**Agent:** Claude Sonnet 4.6
**Co-authored-by:** Chimera <chimera_defi@protonmail.com>

## Summary
## Original Request
> nightly maintenance YYYY-MM-DD — <focus>
## Changes Made
## Testing & Verification
- [x] lint passes · typecheck passes · tests pass (or: no test suite)
```

---

## CI VERIFICATION LOOP (after every push)

1. `get_check_runs` on the PR — wait for all to complete.
2. On any `failure`: `get_job_logs` (return_content=true, tail_lines=80).
3. Common fixes:

| Log says | Fix |
|----------|-----|
| `invalid header` | Add `(scope)`, remove `—`, ensure `[Agent:]` at line end |
| `missing required section` | `update_pull_request` body to add the `##` section |
| `No module named X` | Add `pip install X` step before the test step in the workflow |
| `AssertionError` on hardcoded path | Fix test to check `isinstance(Path)` + `is_absolute()` instead |
| `PR attribution check failed` | Add `**Agent:**`, `**Co-authored-by:**`, or missing `##` section |

4. Push fix, re-verify. Never declare done until all checks show `success` or `skipped`.

---

## GROUND RULES

- Branch: `chore/maintenance-$(date +%Y-%m-%d)` per repo. `git config user.email chimera_defi@protonmail.com && git config user.name Chimera` before committing.
- Never touch: `.env`, contract addresses, private keys, 81/9/10 settlement split, prod deployment configs.
- `--force-with-lease` only (never bare `--force`) when amending to fix CI.
- Empty PR? Write a one-paragraph status report PR so there's a record.
- Partial work is fine — push what's done, note what's left in the PR body.
