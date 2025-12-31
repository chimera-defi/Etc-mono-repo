# PR Attribution Quick Reference

**⚠️ REQUIRED FOR ALL AI-GENERATED PRs**

## Quick Checklist

- [ ] PR title describes **what was done**, not the prompt (e.g., "Add agent attribution" not "User asked to add X")
- [ ] PR description starts with `**Agent:** [Your Agent Name]`
- [ ] Commit messages include `[Agent: YourAgent]` or `(Agent: YourAgent)`
- [ ] Original prompt included in PR description under `## Original Request`
- [ ] For complex requests, create `.cursor/artifacts/[pr-number]-original-prompt.md`

## PR Description Template

```markdown
**Agent:** [Agent Name]

## Summary
Brief description of changes made.

## Original Request
> [User's original prompt/request]

## Changes Made
- Change 1
- Change 2

## Testing
- Verification steps taken
```

## Commit Message Format

```
[Agent: YourAgent] Descriptive commit message

or

Descriptive commit message (Agent: YourAgent)
```

## Agent Names

Use consistent names:
- `Composer` (Cursor Composer)
- `Claude Code` (Claude Code)
- `Claude Opus` (Claude Opus)
- `GPT-4` (OpenAI GPT-4)
- `Gemini` (Google Gemini)
- `Cursor AI` (Cursor AI)

## Why This Matters

- Enables tracking which agents are used most
- Helps analyze agent performance patterns
- Provides context for reviewers
- Preserves prompt-to-change mapping for future analysis

See `.cursorrules` Rules #116-121 for full details.
