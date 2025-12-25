# CodeRabbit Setup Guide 🐰

> **AI Code Review - Free for Open Source**
>
> Status: ❌ Not yet integrated

---

## Overview

CodeRabbit is an AI-powered code review tool that provides detailed feedback on every PR. Best known for being **free for open source** and very **verbose/educational** in its feedback.

**Key Stats:**
- 44% bug catch rate
- Free for public repos
- Most detailed feedback (highest comment count)
- Good for learning/onboarding

---

## Quick Start (5 minutes)

### 1. Install GitHub App

1. Go to [github.com/apps/coderabbitai](https://github.com/apps/coderabbitai)
2. Click **Install**
3. Select repositories:
   - All repositories, or
   - Select specific repos
4. Grant permissions:
   - Read: Contents, Pull requests, Issues
   - Write: Pull requests

### 2. Configure (Optional)

Create `.coderabbit.yaml` in repo root (or use dashboard):

```yaml
language: en
reviews:
  auto_review:
    enabled: true
    drafts: false
  path_instructions:
    - path: "src/**/*.ts"
      instructions: "Check for TypeScript best practices"
    - path: "tests/**"
      instructions: "Verify test coverage and assertions"
```

That's it! CodeRabbit will now review all PRs automatically.

---

## How It Works

### On Every PR

1. CodeRabbit analyzes the diff
2. Posts a **summary comment** with:
   - Changelist overview
   - Potential issues
   - Suggestions

3. Posts **inline comments** on specific lines

### Example Summary

```markdown
## 📝 Summary

This PR adds user authentication to the API.

### Changes
- Added `POST /auth/login` endpoint
- Created `AuthService` class
- Added JWT token generation

### Potential Issues
1. **Security**: JWT secret is hardcoded in `auth.config.ts:12`
2. **Type Safety**: `user` object is typed as `any` in `validateUser()`
3. **Error Handling**: No catch block in async `login()` function

### Suggestions
- Move JWT secret to environment variable
- Create a `User` interface for type safety
- Add try/catch with proper error responses
```

---

## Configuration

### `.coderabbit.yaml` Full Options

```yaml
# Language for feedback
language: en  # or: es, fr, de, ja, zh, etc.

# Review settings
reviews:
  # Auto-review all PRs
  auto_review:
    enabled: true
    drafts: false  # Skip draft PRs

  # Ignore specific paths
  ignore:
    - "*.md"
    - "docs/**"
    - "*.lock"

  # Path-specific instructions
  path_instructions:
    - path: "src/api/**"
      instructions: |
        - Check for proper error handling
        - Verify API documentation
        - Ensure input validation

    - path: "src/components/**"
      instructions: |
        - Check for React best practices
        - Verify accessibility (a11y)
        - Look for performance issues

# Chat settings
chat:
  enabled: true
  auto_reply: true

# Summary settings
summary:
  enabled: true
  detailed: true
```

### Dashboard Configuration

Go to [coderabbit.ai/dashboard](https://coderabbit.ai/dashboard) for:
- Team settings
- Usage analytics
- Billing (for private repos)

---

## Chat Commands

Interact with CodeRabbit in PR comments:

| Command | Action |
|---------|--------|
| `@coderabbitai review` | Trigger a new review |
| `@coderabbitai explain` | Explain specific code |
| `@coderabbitai suggest` | Get improvement suggestions |
| `@coderabbitai generate tests` | Generate test cases |
| `@coderabbitai resolve` | Mark comment as resolved |

### Example

```
@coderabbitai explain this function in detail

@coderabbitai suggest improvements for error handling

@coderabbitai generate unit tests for this component
```

---

## Comparison with Other Tools

| Feature | CodeRabbit | BugBot | Greptile |
|---------|------------|--------|----------|
| Catch Rate | 44% | 58% | 82% |
| False Positives | Medium-High | Very Low | Low |
| Comment Volume | Very High | Low | Medium |
| Free Tier | ✅ (OSS) | ❌ | ❌ |
| Learning Value | ✅✅ | ✅ | ✅ |
| One-Click Fix | ❌ | ✅ | ❌ |
| Test Generation | ✅ | ❌ | ❌ |

---

## When to Use CodeRabbit

### Best For:
- **Open source projects** (free!)
- **Learning/teaching** (verbose explanations)
- **New developers** (educational feedback)
- **Test generation** (unique feature)

### Not Ideal For:
- **High-velocity teams** (too noisy)
- **Large PRs** (too many comments)
- **Production critical** (lower catch rate)

---

## Integration with Other Tools

### Jira
```yaml
# .coderabbit.yaml
integrations:
  jira:
    enabled: true
    project_key: PROJ
```

### Slack
Configure in dashboard → Integrations → Slack

### Linear
Configure in dashboard → Integrations → Linear

---

## Pricing

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | Unlimited public repos |
| **Pro** | $15/user/mo | Private repos, advanced features |
| **Enterprise** | Custom | SSO, audit, priority support |

---

## Tips

### Reduce Noise

If CodeRabbit is too verbose, add to `.coderabbit.yaml`:

```yaml
reviews:
  # Only comment on high-severity issues
  min_severity: high

  # Limit comments per PR
  max_comments: 10

  # Skip style/formatting comments
  skip_style: true
```

### Focus on Specific Areas

```yaml
reviews:
  path_instructions:
    - path: "src/api/**"
      instructions: "CRITICAL: Check for SQL injection"
    - path: "**"
      instructions: "Low priority: style suggestions only"
```

---

## Next Steps

- [ ] Install: [github.com/apps/coderabbitai](https://github.com/apps/coderabbitai)
- [ ] Open a PR on an OSS repo (free!)
- [ ] Compare feedback with BugBot
- [ ] Try `@coderabbitai generate tests`

---

## Resources

- [Official Docs](https://docs.coderabbit.ai)
- [GitHub App](https://github.com/apps/coderabbitai)
- [Dashboard](https://coderabbit.ai/dashboard)
- [Configuration Reference](https://docs.coderabbit.ai/configuration)
