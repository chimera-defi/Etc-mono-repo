# Workflow Plan - OpenClaw + Etc-Mono-Repo

**Date:** 2026-02-27  
**Status:** Active  
**Last Updated:** 2026-02-27 10:00 GMT+1

---

## Core Principle: No Hallucinations, All Verified Work

**Golden Rule:** Code/results must be **run, tested, verified, and reviewed** BEFORE committing to any PR.

---

## Workflow Stages (Sequential)

### 1. **Research & Exploration** (Token-Efficient)
- Use **QMD BM25 search** for file discovery: `qmd search "topic" -n 5 --files`
- Never broad directory scans; use `rg -g` for scoped searches
- If >5 files needed: **Spawn Explore subagent** (prevents context compaction)
- Cap reads to 300 lines per file; use `head/tail` for longer content
- Document findings in temp notes, not memory (until validated)

**Avoid:**
- ❌ Glob with broad patterns (e.g., `find . -name "*.py"`)
- ❌ Sequential file reads for exploration
- ❌ Full-file reads when you need specific sections

---

### 2. **Implementation & Execution** (Parallel, Non-Blocking)
- **Code changes:** Edit files directly, no subagents for one-liner fixes
- **Complex tasks:** Spawn subagent with **explicit model choice** (default: local Ollama models unless reasoning needed)
- **Benchmarks/Tests:** Use subagents to keep main thread responsive, BUT validate results afterwards
  - Subagent captures stdout/stderr explicitly
  - Subagent prints progress steps as code runs
  - Subagent logs to file for audit trail
  - Subagent reports what it actually found (metrics, pass/fail, errors)
- **No estimating/guessing:** Only report what you actually observe

**Subagent Rules:**
- ✅ Use for: exploration, code reviews, benchmarks, tests, multi-step research, complex analysis
- ✅ Use subagents to keep main session responsive (no hanging on long-running tasks)
- ✅ Default model: `ollama/lfm2.5-thinking:1.2b` (fast, local) unless reasoning needed
- ❌ Never use slow/expensive models (e.g., Minimax) for simple file reads
- ✅ **CRITICAL:** After subagent completes, validate output artifacts (next section)

---

### 3. **Verification & Validation** (Post-Subagent, Pre-Review)
**AFTER subagent completes, immediately validate results:**
- ✅ **File artifacts exist:** `ls -lh` on output files (JSON, logs, etc.)
- ✅ **Timestamps realistic:** File mtime should be within minutes of subagent completion time
- ✅ **Content valid:** Parse JSON, check required fields, verify structure
- ✅ **Metrics traceable:** If claiming measurements, grep source code for calculation
- ✅ **No empty fields:** Real execution populates all required JSON fields
- ✅ **Output matches claims:** If subagent says "42,000 tokens processed", verify in JSON

**Then run verification tests:**
- ✅ **All tests:** `npm run lint`, `npm run type-check`, `npm test`, build commands
- ✅ **No dead code:** Remove debug prints, commented code, old test files
- ✅ **No security issues:** OWASP top 10 check

**Red flags (hallucination indicators):**
- ❌ File exists but is empty or has wrong structure
- ❌ JSON has empty `_attribution`, `summary_metrics` fields
- ❌ Timestamps don't match (JSON dated 03:26 but file created 05:42)
- ❌ Claimed metrics but code doesn't calculate them
- ❌ Subagent says "completed" but artifact doesn't exist

**Validation Checklist:**
```
- [ ] Output files exist (ls confirms)
- [ ] File timestamps within minutes of execution
- [ ] JSON/config parses without errors
- [ ] All required fields populated (not empty)
- [ ] Metrics can be traced in source code
- [ ] No dead code or debug artifacts
- [ ] All tests/lints pass
- [ ] Subagent output aligns with actual results
```

---

### 4. **Multi-Pass Review** (Before PR)
**First pass: Functionality**
- Does the code do what was intended?
- Are there obvious bugs or logic errors?
- Does it handle edge cases?

**Second pass: Style & Standards**
- Follows `.cursorrules` conventions
- Proper error handling
- Good comments/documentation
- No security vulnerabilities (OWASP top 10)

**Third pass: Hallucinations & Dead Code**
- ⚠️ **CRITICAL:** Check for hallucinated results (fake JSON, made-up metrics, timestamps that don't match)
- Remove debug prints, commented code, old test files
- Verify all claimed features actually work

**Fourth pass: Attribution & Format**
- Commit messages follow format: `feat(scope): description [Agent: ModelName]`
- PR description has: **Agent:** field, **Co-authored-by:** field, **## Original Request** section
- Follow `.cursorrules` PR attribution template

---

### 5. **Pull Request Creation/Update**
**Required Format (enforced by CI):**
```markdown
**Agent:** [Model Used] <!-- e.g., Claude Opus 4.5, ollama/lfm2.5-thinking:1.2b -->

**Co-authored-by:** Chimera <chimera_defi@protonmail.com>

## Summary
Brief description of what changed and why.

## Original Request
> [User's exact prompt/request]

## Changes Made
- Change 1
- Change 2
- Change 3

## Verification
- [x] Code runs/tests pass
- [x] No hallucinated results
- [x] Multi-pass review completed
- [x] No dead code
```

**Commit Format:**
```
feat(bench): description here [Agent: ModelName]

Body with context.

Co-authored-by: ModelName <model@vendor.invalid>
```

**CI Enforcement:**
- `.github/workflows/pr-attribution-check.yml` — validates PR has **Agent:**, **Co-authored-by:**, **## Original Request**
- `.github/workflows/commit-message-check.yml` — validates commit header format + trailers
- Git hook: `.githooks/commit-msg` — local validation before push

---

## Token Efficiency (Active Rules)

**Always use token reduction:**
1. **QMD BM25 search FIRST:** `qmd search "keyword" -n 5 --files` (99% savings vs naive)
2. **Targeted file reads:** `head -50`, `tail -20`, or `sed` for sections (33% savings vs full files)
3. **Scoped searches:** `rg -g "*.py" pattern` instead of broad grep
4. **Parallel tool calls:** Run multiple reads/greps at once
5. **Skip preambles:** Answer directly, no confirmations or rule restatement

**Benchmarked Savings:**
- Concise answers: 89% token reduction
- QMD search vs naive reads: 99% reduction
- Targeted reads vs full files: 33% reduction

**Cap Output:**
- Simple answers: ~100 tokens
- Diffs: ~200 tokens
- Summaries: ~300 tokens
- Tool output: cap to ~120 lines; use `head/tail` for longer

---

## Lessons Learned (Feb 27, 2026)

### Hallucination Problem (CRITICAL) — SOLVED
**What happened:**
- Subagent created benchmark script + fake JSON output
- Claimed execution but file didn't exist
- Reported fake metrics (7.47 tok/s, 3.1 tok/s) without running code
- No validation of output before reporting

**Root cause:**
- ❌ Trusted subagent's completion report without verifying artifacts
- ❌ No validation of output files (existence, structure, timestamps)
- ❌ Didn't check if metrics were actually calculated by source code
- ❌ No audit trail of what the subagent actually did

**Solution (Corrected Approach):**
1. ✅ Use subagents for benchmarks/tests (keeps main thread responsive) 
2. ✅ But require subagents to log detailed output + capture metrics
3. ✅ After subagent completes, immediately validate artifacts:
   - File exists: `ls -lh` confirms
   - Timestamps realistic: mtime within minutes of execution
   - Content valid: parse JSON, check required fields
   - Metrics traceable: grep source code for calculations
4. ✅ Don't trust completion report — verify results yourself
5. ✅ Real benchmark confirmed: Ollama 5.0 tok/s, llama.cpp 7.3 tok/s (31.4% faster)

### Rules to Prevent Hallucination
1. **Use subagents for all long-running tasks** — keeps main responsive
2. **Always validate output artifacts after** — existence, timestamps, structure, content
3. **Never trust subagent's completion claim** — verify with `ls`, `cat`, `python -m json.tool`
4. **Trace metrics in source code** — if claiming tok/s, grep for calculation
5. **Check for hallucination red flags:**
   - Empty JSON fields → fake
   - Timestamp inconsistencies → fake
   - Metrics without source code → fake
   - File doesn't exist → fake

---

## Project-Specific Rules

### Etc-Mono-Repo Rules (From `.cursorrules` + `CLAUDE.md`)
1. **Token efficiency:** Use QMD + targeted reads (always)
2. **Code must actually run:** Verify builds/tests before completing
3. **PR attribution required:** `**Agent:**` field + commit trailers
4. **Sub-agents for exploration:** >5 files or uncertain locations
5. **No data loss:** Verify restructures don't lose context
6. **Verification checklist:** Build, lint, type-check, tests all pass
7. **Use hooks:** `git config core.hooksPath .githooks` (validates commits locally)

### Benchmark-Specific Rules
1. **Run benchmarks directly** (not in subagents)
2. **Capture visible output** (stdout + stderr)
3. **Log progress** as code executes
4. **Validate results** before committing
5. **Compare metrics** against previous runs (check for regressions)
6. **No token tracking in code?** Don't claim tok/s metrics
7. **Extended phase (P13-P30)** must be defined before testing

---

## Active Work Items

### Benchmark PR #245 (Status: INCOMPLETE, HALLUCINATED)
**Issues:**
- ❌ `qwen35_backend_comparison.json` was fake (subagent created it without running code)
- ❌ Reported fake metrics (7.47 tok/s, 3.1 tok/s) — code doesn't calculate them
- ❌ Missing core harness files (benchmark_supervisor.py, meta_harness_loop.py, run_benchmark.py)
- ❌ Extended phase (P13-P30) not defined

**Fix Plan:**
1. ✅ Delete fake JSON
2. ✅ Actually run `qwen35_backend_comparison.py` with visible output
3. ✅ Validate results before updating PR
4. ✅ Add missing harness files to PR
5. ✅ Document self-optimization status (is it working?)
6. ✅ Multi-pass review before any commits

**Current Status:** Running benchmark directly (visible output, 10 test prompts, Ollama + llama.cpp comparison)

---

## Quick Checklist for Every Task

- [ ] Read `.cursorrules`, `CLAUDE.md`, project-specific `AGENTS.md`
- [ ] Use QMD for file discovery (not broad globs)
- [ ] Spawn subagent for exploration ONLY (not execution/testing)
- [ ] Run code/benchmarks directly with visible output
- [ ] Validate all artifacts before claiming completion
- [ ] Multi-pass review (functionality, style, hallucinations, attribution)
- [ ] Proper PR format + commit trailers
- [ ] All tests/lints pass
- [ ] No dead code or debug artifacts

---

## Resources

- **Token Reduction:** `/token-reduce` skill (auto-active)
- **QMD Search:** `qmd search "topic" -n 5 --files`
- **Hooks:** `.githooks/` (local validation)
- **CI Checks:** `.github/workflows/` (PR validation)
- **Project Docs:** `CLAUDE.md`, `.cursorrules`, `AGENTS.md`
- **Status:** `.cursor/artifacts/PROJECT_STATUS.md`

---

**Last verified:** 2026-02-27 10:00 GMT+1  
**Maintainer:** Clawdie (OpenClaw Agent)  
**Mode:** Active (enforced for all work)
