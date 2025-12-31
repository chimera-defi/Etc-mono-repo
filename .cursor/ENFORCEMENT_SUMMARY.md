# PR Attribution Enforcement Summary

This document explains all mechanisms in place to ensure AI agents include proper attribution in PRs and commits.

## Enforcement Mechanisms

### 1. GitHub PR Template (`.github/pull_request_template.md`)
- **What:** Auto-filled template when creating PRs via GitHub UI
- **Enforcement:** Visual reminder, not blocking
- **Works for:** All agents using GitHub UI
- **Bypass:** Can delete template content (but shouldn't)

### 2. Git Commit Hook (`.git/hooks/commit-msg`)
- **What:** Checks commit messages for agent attribution
- **Enforcement:** Warns if missing, doesn't block
- **Works for:** All agents making commits locally
- **Bypass:** `git commit --no-verify` or `SKIP_AGENT_CHECK=1`
- **Note:** Only active if hook is executable (already set)

### 3. CI Workflow Check (`.github/workflows/pr-attribution-check.yml`)
- **What:** Validates PR descriptions on open/edit/sync
- **Enforcement:** Posts PR comment with feedback, fails CI if required fields missing
- **Works for:** All PRs regardless of how created
- **Bypass:** None (but doesn't block merge, just warns)
- **Checks:**
  - Agent attribution present
  - Original request section present (warning only)
  - PR title quality (warning only)

### 4. Quick Reference Files
- **`.cursor/PR_ATTRIBUTION.md`** - Full quick reference (~60 lines)
- **`.cursor/PR_ATTRIBUTION_MINIMAL.md`** - Ultra-concise version (~20 lines)
- **`.cursor/AGENT_ONBOARDING.md`** - Onboarding guide for new agents

### 5. Rule Documentation
- **`.cursorrules` Rules #116-121** - Full detailed rules
- **`CLAUDE.md`** - Claude-specific notes with PR checklist
- **Top of `.cursorrules`** - Quick reference section

## Agent Coverage

| Agent Type | PR Template | Commit Hook | CI Check | Quick Ref |
|------------|-------------|-------------|----------|-----------|
| GitHub UI | ✅ Auto-fills | ❌ N/A | ✅ Validates | ✅ Can read |
| Local Git | ❌ Manual | ✅ Warns | ✅ Validates | ✅ Can read |
| CI/CD | ❌ N/A | ⚠️ Skips | ✅ Validates | ✅ Can read |
| Manual | ✅ Can use | ⚠️ Can bypass | ✅ Validates | ✅ Can read |

## Why Non-Blocking?

We use warnings rather than hard blocks because:
1. **Flexibility:** Manual commits shouldn't require agent attribution
2. **CI/CD:** Automated commits (merges, reverts) shouldn't be blocked
3. **Gradual adoption:** Agents can learn without breaking workflows
4. **Human override:** Sometimes attribution isn't needed (e.g., docs-only)

However, **all AI-generated PRs should follow these rules** for tracking purposes.

## Making It More Enforceable

If you want stricter enforcement:

1. **Make CI check block merges:**
   ```yaml
   # In pr-attribution-check.yml, change:
   core.setFailed('PR attribution check failed...')
   # This will fail the workflow and block merge
   ```

2. **Make commit hook block commits:**
   ```bash
   # In commit-msg hook, change:
   exit 0  # to exit 1
   # This will block commits without attribution
   ```

3. **Add branch protection:**
   - Require PR attribution check to pass before merge
   - Set in GitHub repo settings → Branches → Branch protection rules

## Current Status

✅ **Active:**
- PR template (auto-fills)
- Commit hook (warns)
- CI check (validates + comments)
- Quick reference files

⚠️ **Non-blocking:**
- All checks warn but don't block
- Can be bypassed if needed

📊 **Tracking:**
- PR descriptions can be analyzed for agent usage
- Commit messages can be parsed for attribution
- CI check results logged in workflow runs
