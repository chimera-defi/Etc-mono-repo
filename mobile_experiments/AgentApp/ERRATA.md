# Errata & Corrections

This document tracks corrections made during the multi-pass review process.

---

## Review Summary

| Category | Status | Issues Found |
|----------|--------|--------------|
| API Existence | ✅ Verified | All APIs exist |
| Package Names | ⚠️ Corrected | Some version numbers updated |
| Code Examples | ⚠️ Corrected | RN-specific syntax highlighter |
| Ecosystem Data | ⚠️ Caveat Added | npm data may be cached/older |
| Model Names | ✅ Verified | Claude model names correct |

---

## Verified APIs & Packages

### ✅ Confirmed to Exist

| Package/API | Version | Verified |
|-------------|---------|----------|
| `@anthropic-ai/sdk` | 0.71.0 | ✅ npm registry |
| `@modelcontextprotocol/sdk` | 1.24.0 | ✅ npm registry |
| `react-native` | 0.82.1 | ✅ npm registry |
| `expo` | 54.0.25 | ✅ npm registry |
| `zustand` | 5.0.9 | ✅ npm registry |
| `react-native-syntax-highlighter` | 2.1.0 | ✅ npm registry |
| Claude API `/v1/messages` | — | ✅ Anthropic docs |

### ✅ GitHub Repos Verified

| Project | Stars | Verified |
|---------|-------|----------|
| facebook/react-native | 124,657 | ✅ GitHub API |
| expo/expo | 45,283 | ✅ GitHub API |
| modelcontextprotocol/servers | 73,708 | ✅ GitHub API |
| Kilo-Org/kilocode | 12,825 | ✅ GitHub API |
| danny-avila/LibreChat | 32,114 | ✅ GitHub API |

---

## Corrections Made

### 1. Package Versions (FRAMEWORK_RECOMMENDATION.md)

**Before:**
```json
{
  "react-native": "^0.76.0",
  "expo": "~52.0.0"
}
```

**After (Correct):**
```json
{
  "react-native": "^0.82.0",
  "expo": "~54.0.0"
}
```

### 2. Syntax Highlighter Package

**Before (Wrong - web package):**
```json
"react-syntax-highlighter": "^15.6.0"
```

**After (Correct - React Native package):**
```json
"react-native-syntax-highlighter": "^2.1.0"
```

### 3. Code Example Import

**Before (Wrong):**
```typescript
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
```

**After (Correct for React Native):**
```typescript
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import { atomOneDark } from 'react-native-syntax-highlighter/styles/hljs';
```

---

## Data Caveats

### npm Download Numbers

The npm download statistics referenced in the documents may be from cached API responses. The relative comparisons (e.g., "React Native has 5x more downloads than Capacitor") are directionally correct, but exact numbers should be verified before publication.

### StackOverflow Question Counts

The StackOverflow question counts (139k for React Native, 2.3k for Capacitor) were sourced from the main branch research and are assumed to be verified there. The 58x ratio claim is consistent with this data.

---

## Unverified Claims (Marked for Future Verification)

| Claim | Status | Notes |
|-------|--------|-------|
| "Discord uses React Native" | ⚠️ Unverified | Common claim, should verify |
| Claude API rate limits | ⚠️ May change | Check Anthropic docs before implementation |
| Pricing ($3/$15 for Sonnet) | ⚠️ May change | Verify current pricing before implementation |

---

## No Corrections Needed

The following claims were verified as accurate:

1. ✅ Cursor does not have a public API
2. ✅ Claude API supports tool use (function calling)
3. ✅ Claude API supports streaming via SSE
4. ✅ MCP (Model Context Protocol) is a real Anthropic standard
5. ✅ React Native has significantly larger ecosystem than Capacitor
6. ✅ Expo provides cloud builds and OTA updates

---

**Review Completed**: December 2025  
**Reviewer**: Multi-pass verification with API calls
