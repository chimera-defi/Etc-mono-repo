# Agent Onboarding Guide

This guide helps AI agents (Composer, Claude, GPT-4, Gemini, etc.) understand how to work in this repository.

## First Steps

1. **Read `.cursorrules`** - Contains all rules and guidelines
2. **Read `.cursor/PR_ATTRIBUTION.md`** - Quick reference for PR requirements (only ~60 lines)
3. **Check `.github/pull_request_template.md`** - PR template you'll use

## PR Attribution (REQUIRED)

**Every PR you create must include:**

```markdown
**Agent:** [Your Agent Name]

## Original Request
> [User's prompt]
```

**Every commit must include:**
```
[Agent: YourAgent] Your commit message
```

**Quick reference:** `.cursor/PR_ATTRIBUTION.md` (concise, ~60 lines)

## Enforcement

- **Git Hook:** Warns if commits lack agent attribution (can bypass with `--no-verify`)
- **CI Check:** Validates PR descriptions and posts feedback (doesn't block merge)
- **PR Template:** GitHub auto-fills template when creating PRs

## Agent Names

Use these exact names:
- `Composer` - Cursor Composer
- `Claude Code` - Claude Code
- `Claude Opus` - Claude Opus  
- `GPT-4` - OpenAI GPT-4
- `Gemini` - Google Gemini
- `Cursor AI` - Cursor AI

## Context Limits

If you have limited context:
1. Read `.cursor/PR_ATTRIBUTION.md` first (most concise)
2. Reference `.cursorrules` Rules #116-121 for details
3. Use `.github/pull_request_template.md` as your template

## File Locations

| File | Purpose | Size |
|------|---------|------|
| `.cursorrules` | All rules | ~200 lines |
| `.cursor/PR_ATTRIBUTION.md` | PR quick reference | ~60 lines |
| `.github/pull_request_template.md` | PR template | ~40 lines |
| `CLAUDE.md` | Claude-specific notes | ~170 lines |

## Questions?

- Check `.cursorrules` Rules #116-121 for full PR attribution rules
- See `.cursor/PR_ATTRIBUTION.md` for quick reference
- Review `.github/pull_request_template.md` for PR structure
