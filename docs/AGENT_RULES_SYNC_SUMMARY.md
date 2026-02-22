# Agent Rules Sync Summary (Benchmark Workstream)

Sources reviewed: `.cursorrules`, `CLAUDE.md`, `.cursor/TOKEN_REDUCTION.md`, workspace skill `.claude/skills/token-reduce/SKILL.md`.

## 1) Required Commit/PR Attribution Rules (Must Pass CI)

### PR description must include
- `**Agent:** <ACTUAL MODEL NAME USED>` (model, not platform/tool)
- `**Co-authored-by:** Chimera <chimera_defi@protonmail.com>`
- `## Original Request` with the user prompt quoted
- Standard structure: `Agent → Co-authored-by → Summary → Original Request → Changes Made`

### Commit message must include
- Header format with model tag, e.g.:
  - `feat(scope): short description [Agent: <MODEL NAME>]`
- Commit trailer in body:
  - `Co-authored-by: <MODEL NAME> <model@vendor.invalid>`

### Attribution mapping (non-optional)
- **Commit author:** Human (Chimera)
- **Commit Co-authored-by:** AI model
- **PR Agent field:** AI model
- **PR Co-authored-by field:** Human (Chimera)

### Hard failures to avoid
- Missing PR `Agent`, PR `Co-authored-by`, or `## Original Request`
- Missing commit `[Agent: ...]` tag
- Missing commit `Co-authored-by:` trailer
- Using platform names instead of model names
- Including Claude session links in commit/PR text

---

## 2) Non-Negotiable Workflow Constraints

- Never push directly to `main`/`master`; always use feature branch + PR.
- One task/request = one PR branch; stack related commits there.
- Create branch/worktree **before** edits.
- At start of each new request: sync/rebase onto latest `origin/main`.
- Install/keep hooks enabled:
  - `git config core.hooksPath .githooks`
- Keep generated/research artifacts in `.cursor/artifacts/` (do not clutter repo root).
- Prefer editing existing files over creating new ones unless justified.
- Before claiming done, run required verification for touched project (lint/type/build/tests).
- Maintain data integrity rules where relevant (no loss during restructuring, verify math, consistency across docs).

---

## 3) Token-Reduction + Skill Usage (Benchmark-Relevant)

## Default operating mode (always-on)
- Concise responses by default (target small outputs).
- No long preambles/reasoning narration.
- Use diffs/summaries instead of full-file dumps.
- Keep list outputs short unless expansion requested.

## Retrieval strategy (fastest/lowest token first)
1. If file/keyword is known: use scoped `rg -g`/grep first.
2. If discovery needed: use **QMD BM25**:
   - `qmd search "topic" -n 5 --files`
3. Read only targeted sections (offset/limit), especially for large files.
4. If >5 files or broad exploration/unknown location: use sub-agent exploration and return summary only.
5. Parallelize independent tool calls when possible.

## Explicit guardrails
- Avoid full reads for files >300 lines; use targeted reads.
- Cap raw tool output (~120 lines).
- Avoid re-reading unchanged files in same session.
- Avoid broad globs/scans when scoped search suffices.

## What not to use (per benchmark guidance)
- Do **not** use MCP CLI for routine file reads in this workflow (JSON overhead; worse token profile).
- Do **not** use QMD embed/vector/query modes for this benchmark path (too slow/heavy).
- Use BM25 mode only.

## Token-reduce skill/doc locations
- Repo doc: `.cursor/TOKEN_REDUCTION.md`
- Workspace skill: `.claude/skills/token-reduce/SKILL.md`
- Optional validation script: `.cursor/validate-token-reduction.sh`

---

## 4) Actionable TODO Checklist (for each benchmark task)

- [ ] Sync branch with latest `origin/main`, then create/confirm feature branch.
- [ ] Confirm hooks path: `git config core.hooksPath .githooks`.
- [ ] Start with scoped search (`rg -g`) or QMD BM25 (`qmd search ... --files`).
- [ ] Read only necessary sections (offset/limit); avoid full-file scans.
- [ ] Use sub-agent when >5 files or discovery is broad.
- [ ] Keep artifacts/context files in `.cursor/artifacts/`.
- [ ] Run required project verification (lint/type/build/tests).
- [ ] Commit with `[Agent: <MODEL>]` in header + AI `Co-authored-by` trailer.
- [ ] Open/update PR with required `Agent`, human `Co-authored-by`, and `## Original Request`.
- [ ] Final pass: check attribution fields, no direct-main push, no session-link leakage.
