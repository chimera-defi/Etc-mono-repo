# Cursor BugBot Setup Guide 🤖

> **AI-powered code review agent by Cursor**
>
> Status: ✅ Already integrated if you're using Cursor

---

## Overview

BugBot is Cursor's code review agent that automatically analyzes code changes to find logic bugs, edge cases, and security issues. It reviewed over 1 million PRs during beta with 50%+ of flagged bugs being fixed.

**Key Stats:**
- 58% bug catch rate (per Greptile benchmark)
- Very low false positive rate
- $40/user/month

---

## Setup (If Not Already Done)

### GitHub.com

1. Go to [cursor.com/dashboard](https://cursor.com/dashboard?tab=integrations)
2. Click **Integrations** tab
3. Click **Connect GitHub** (or "Manage Connections" if already linked)
4. Complete the GitHub installation workflow
5. Return to dashboard and activate BugBot on your repositories

### GitLab.com

1. Go to [cursor.com/dashboard](https://cursor.com/dashboard?tab=integrations)
2. Click **Connect GitLab**
3. Follow GitLab's installation flow
4. Enable BugBot on specific repositories

### GitHub Enterprise Server

Whitelist these IPs:
```
184.73.225.134
3.209.66.12
52.44.113.131
```

Then register the Cursor Enterprise App through Advanced settings.

---

## Configuration

### Per-Repository Settings

Go to [cursor.com/dashboard](https://cursor.com/dashboard) and configure:
- ✅ Enable/disable per repository
- ⏸️ Run only when mentioned
- 1️⃣ Process only once per PR

### Team Settings

- Repository-level activation with reviewer allow/deny lists
- Skip subsequent commits option
- Disable inline review comments
- Personal overrides for draft PR reviews

---

## Custom Rules (IMPORTANT!)

Create `.cursor/BUGBOT.md` in your repo root:

```markdown
# BugBot Rules for [Your Project]

## General Rules
- Always check for null/undefined before accessing properties
- Ensure all API calls have error handling
- Verify TypeScript strict mode compliance

## Security Rules
- Flag any hardcoded secrets or API keys
- Check for SQL injection in database queries
- Validate all user input

## Project-Specific Rules
- All React components must have PropTypes or TypeScript types
- Use `useCallback` for functions passed to child components
- Never use `any` type without explicit comment explaining why
```

### Rule Priority Order
1. Team Rules (admin dashboard)
2. Project BUGBOT.md (repo root)
3. Nested BUGBOT.md (subdirectories)
4. User Rules (personal settings)

---

## Usage

### Automatic Review
BugBot runs automatically on every PR update.

### Manual Trigger
Comment on any PR:
```
cursor review
```
or
```
bugbot run
```

### One-Click Fixes
When BugBot flags an issue, click:
- **"Fix in Cursor"** - Opens in Cursor editor
- **"Fix in Web"** - Opens web-based agent

---

## Example BugBot Comment

```
🐛 BugBot found a potential issue

**File:** src/api/users.ts:47

**Issue:** Unhandled promise rejection in async function

**Suggestion:**
The `fetchUser` function doesn't handle the case where the API returns
a 404. This could cause an unhandled promise rejection.

**Fix:**
\`\`\`typescript
try {
  const user = await api.getUser(id);
  return user;
} catch (error) {
  if (error.status === 404) {
    return null;
  }
  throw error;
}
\`\`\`

[Fix in Cursor] [Fix in Web] [Dismiss]
```

---

## Admin API

For teams managing multiple repos:

1. Generate API key: Dashboard → Settings → Advanced
2. Use endpoint:
```bash
curl -X POST https://cursor.com/api/bugbot/repo/update \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"repoUrl": "github.com/org/repo", "enabled": true}'
```

---

## Comparison with Other Tools

| Feature | BugBot | Greptile | CodeRabbit |
|---------|--------|----------|------------|
| Catch Rate | 58% | 82% | 44% |
| False Positives | Very Low | Low | Medium |
| One-Click Fix | ✅ | ❌ | ❌ |
| Codebase Context | ✅ | ✅✅ | ✅ |
| Cursor Integration | ✅✅ | ❌ | ❌ |

---

## Next Steps

- [ ] Check if BugBot is enabled on your repos
- [ ] Create `.cursor/BUGBOT.md` with custom rules
- [ ] Try triggering a manual review on a PR
- [ ] Compare output with Greptile (see [greptile.md](./greptile.md))

---

## Resources

- [Official Docs](https://cursor.com/docs/bugbot)
- [BugBot Dashboard](https://cursor.com/dashboard)
- [Pricing](https://cursor.com/bugbot) - $40/user/month
