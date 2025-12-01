# Cursor API Research

## Executive Summary

**Cursor does NOT have a documented public API.** Cursor is a proprietary fork of VS Code with integrated AI capabilities. There is no official way to programmatically interact with Cursor or its "Background Agents" feature from external applications.

---

## What is Cursor?

Cursor is an AI-first code editor built as a fork of Visual Studio Code. It integrates:
- Multiple LLM providers (Claude, GPT-4, etc.)
- "Cursor Agents" - AI that can make multi-step code changes
- "Background Agents" - Agents that run autonomously in the cloud
- Tab completion, chat, and inline editing

### Key Features of Cursor Agents

| Feature | Description |
|---------|-------------|
| Multi-file editing | Can edit multiple files in a single operation |
| Tool calling | Uses tools like file read/write, shell, grep, etc. |
| Context awareness | Understands project structure |
| Background execution | Runs without blocking the UI |
| Git integration | Can commit, create branches, PRs |

---

## API Availability Analysis

### Official API Status

| Aspect | Status | Notes |
|--------|--------|-------|
| Public REST API | ❌ None | No documented API endpoints |
| WebSocket API | ❌ None | No real-time API |
| Plugin/Extension API | ⚠️ Limited | VS Code extension API, but no agent-specific hooks |
| SDK | ❌ None | No official SDK for mobile/external apps |
| OAuth/Auth | ❌ None | No public authentication system |

### Why No Public API?

1. **Business Model**: Cursor's value is in the integrated editor experience
2. **Proprietary Tech**: The agent orchestration is their competitive advantage  
3. **Security**: Agents have deep system access that's hard to expose safely
4. **Early Stage**: Product is still rapidly evolving

---

## What We CAN Access

### 1. The Underlying LLM APIs

Cursor uses LLMs that DO have public APIs:

| Provider | API Available | Docs |
|----------|---------------|------|
| **Anthropic (Claude)** | ✅ Yes | https://docs.anthropic.com |
| **OpenAI (GPT-4)** | ✅ Yes | https://platform.openai.com |
| **Google (Gemini)** | ✅ Yes | https://ai.google.dev |

### 2. VS Code Extension API

Since Cursor is a VS Code fork, you can build extensions that:
- Access the filesystem
- Run shell commands
- Integrate with Git
- Display custom UI

**Limitation**: Extensions run inside Cursor, not as separate mobile apps.

### 3. MCP (Model Context Protocol)

Anthropic's new MCP standard allows:
- Connecting AI to external tools
- Exposing local resources to AI
- Building "MCP Servers" that agents can use

Cursor supports MCP, meaning you could:
- Build an MCP server that exposes project data
- Have Cursor's agents use your server
- But NOT control Cursor from external apps

---

## Reverse Engineering Considerations

### Could We Reverse Engineer Cursor's Protocol?

| Approach | Feasibility | Risk |
|----------|-------------|------|
| Network traffic analysis | Low | Likely encrypted, may violate ToS |
| Local IPC inspection | Low | Platform-specific, unstable |
| Extension bridge | Medium | Would require Cursor to be running |

**Recommendation**: Don't pursue reverse engineering. It's fragile, legally risky, and Cursor could break it at any time.

---

## Conclusion

**For building a mobile AI coding agent app:**

1. ❌ **Cannot** use Cursor's API directly (doesn't exist)
2. ✅ **CAN** use the same underlying LLM APIs (Claude, GPT-4)
3. ✅ **CAN** implement similar agent functionality from scratch
4. ✅ **CAN** use MCP protocol for tool integrations

### The Path Forward

Build our own agent system using:
- Claude API for AI capabilities (same model Cursor uses)
- MCP protocol for tool integrations
- Custom implementation of agent orchestration
- Native mobile frameworks for the app

---

## Related Documents

- [ALTERNATIVES_ANALYSIS.md](./ALTERNATIVES_ANALYSIS.md) - Open source alternatives with APIs
- [MOBILE_ARCHITECTURE.md](./MOBILE_ARCHITECTURE.md) - Proposed architecture for our app

---

**Research Status**: Complete  
**Conclusion**: Build custom agent using Claude API, not Cursor integration
