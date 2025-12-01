# Alternatives Analysis: AI Coding Agents with APIs

## Executive Summary

Since Cursor doesn't have a public API, we surveyed alternative AI coding agents and assistants that DO have APIs or are open source. The best options for building a mobile agent app are:

1. **Claude API Direct** - Build custom agent with Anthropic's API
2. **Kilo Code** - Open source Cursor alternative (12.8k ⭐)
3. **LibreChat** - ChatGPT clone with agent support (32k ⭐)

---

## Option 1: Claude API (Anthropic) ⭐ RECOMMENDED

### Overview

Build a custom AI coding agent using Anthropic's Claude API directly. This is what Cursor does internally.

### API Capabilities

| Feature | Available | Notes |
|---------|-----------|-------|
| Text Generation | ✅ Yes | Core chat/completion API |
| Tool Use | ✅ Yes | Function calling for tools |
| Computer Use | ✅ Yes | Screen interaction (beta) |
| Vision | ✅ Yes | Image understanding |
| Streaming | ✅ Yes | Real-time responses |
| Extended Thinking | ✅ Yes | Reasoning transparency |

### Pricing (as of Dec 2024)

| Model | Input | Output |
|-------|-------|--------|
| Claude 3.5 Sonnet | $3/M tokens | $15/M tokens |
| Claude 3 Opus | $15/M tokens | $75/M tokens |
| Claude 3.5 Haiku | $0.25/M tokens | $1.25/M tokens |

### API Example

```python
import anthropic

client = anthropic.Anthropic()

# Define tools the agent can use
tools = [
    {
        "name": "read_file",
        "description": "Read a file from the codebase",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "File path"}
            },
            "required": ["path"]
        }
    },
    {
        "name": "write_file",
        "description": "Write content to a file",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string"},
                "content": {"type": "string"}
            },
            "required": ["path", "content"]
        }
    },
    {
        "name": "run_command",
        "description": "Run a shell command",
        "input_schema": {
            "type": "object",
            "properties": {
                "command": {"type": "string"}
            },
            "required": ["command"]
        }
    }
]

# Send message with tool use
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=4096,
    tools=tools,
    messages=[
        {"role": "user", "content": "Fix the bug in src/main.py"}
    ]
)
```

### Pros & Cons

| Pros | Cons |
|------|------|
| ✅ Same model Cursor uses | ❌ Must build agent orchestration |
| ✅ Full API access | ❌ No pre-built editor integration |
| ✅ Extensive documentation | ❌ Pay per token |
| ✅ Tool use support | ❌ Need backend infrastructure |
| ✅ Mobile SDK available | |

---

## Option 2: Kilo Code (Open Source)

### Overview

Kilo Code is an open-source AI coding assistant for VS Code. It's a community fork focusing on openness and extensibility.

**GitHub**: https://github.com/Kilo-Org/kilocode (12.8k ⭐)

### Features

| Feature | Available |
|---------|-----------|
| Multi-file editing | ✅ Yes |
| Multiple LLM support | ✅ Yes (OpenAI, Anthropic, etc.) |
| Task planning | ✅ Yes |
| Code search | ✅ Yes |
| Open source | ✅ Yes (Apache 2.0) |

### Architecture

```
┌─────────────────┐
│   VS Code UI    │
├─────────────────┤
│  Kilo Extension │
├─────────────────┤
│  Agent Core     │  ← Could extract this
├─────────────────┤
│  LLM Providers  │
└─────────────────┘
```

### Mobile Feasibility

- **Extractable**: The agent core logic could be extracted
- **API**: No REST API, but code is readable
- **Effort**: Medium-High to port to mobile

---

## Option 3: LibreChat

### Overview

LibreChat is a ChatGPT clone that supports agents, plugins, and multiple AI providers.

**GitHub**: https://github.com/danny-avila/LibreChat (32k ⭐)

### Features

| Feature | Available |
|---------|-----------|
| Agent mode | ✅ Yes |
| Multi-provider | ✅ Yes |
| Code interpreter | ✅ Yes |
| Plugins | ✅ Yes |
| REST API | ✅ Yes |
| Self-hosted | ✅ Yes |

### API Availability

LibreChat has a documented API:

```bash
# Example: Create a conversation
POST /api/ask/openAI
{
  "model": "gpt-4",
  "messages": [{"role": "user", "content": "Hello"}]
}
```

### Mobile Feasibility

- **API Ready**: Has REST API we can call from mobile
- **Self-Hosted**: Need to run server infrastructure
- **Not Cursor-specific**: General chat, not code editing focused

---

## Option 4: AgenticSeek

### Overview

"Fully local Manus AI" - An autonomous agent that runs completely locally.

**GitHub**: https://github.com/Fosowl/agenticSeek (24k ⭐)

### Features

| Feature | Available |
|---------|-----------|
| Local execution | ✅ Yes |
| Web browsing | ✅ Yes |
| Code generation | ✅ Yes |
| No API costs | ✅ Yes |
| Autonomous | ✅ Yes |

### Mobile Feasibility

- **Local Only**: Requires powerful local hardware
- **Not Mobile Ready**: Designed for desktop/server
- **Good Reference**: Architecture ideas for agent design

---

## Option 5: Wingman AI

### Overview

Open-source VS Code extension supporting multiple LLM providers.

**GitHub**: https://github.com/RussellCanfield/wingman-ai (266 ⭐)

### Features

| Feature | Available |
|---------|-----------|
| Multiple providers | ✅ Ollama, OpenAI, Anthropic, HuggingFace |
| Code completion | ✅ Yes |
| Chat | ✅ Yes |
| Open source | ✅ Yes |

### Mobile Feasibility

- **Extension Only**: Tied to VS Code
- **Simple Architecture**: Could be a good starting point
- **Smaller codebase**: Easier to understand and port

---

## Option 6: gpt_mobile (Existing Mobile App)

### Overview

An existing Android app that supports multiple LLMs including Claude.

**GitHub**: https://github.com/Taewan-P/gpt_mobile (926 ⭐)

### Features

| Feature | Available |
|---------|-----------|
| Multi-LLM support | ✅ OpenAI, Anthropic, Google, Ollama |
| BYOK (Bring Your Own Key) | ✅ Yes |
| Material Design | ✅ Yes |
| Jetpack Compose | ✅ Yes |
| Native Android | ✅ Yes |

### Relevance

- **Good Reference**: Shows how to build mobile LLM client
- **Android Only**: No iOS version
- **Chat Only**: No agent/coding features

---

## Comparison Matrix

| Option | API/Open Source | Mobile Ready | Agent Features | Code Editing | Effort to Implement |
|--------|-----------------|--------------|----------------|--------------|---------------------|
| **Claude API** | ✅ Full API | ✅ SDKs available | ⚠️ Build yourself | ⚠️ Build yourself | Medium |
| **Kilo Code** | ✅ Open source | ❌ VS Code only | ✅ Built-in | ✅ Built-in | High (port needed) |
| **LibreChat** | ✅ REST API | ⚠️ Needs backend | ✅ Built-in | ⚠️ Limited | Medium |
| **AgenticSeek** | ✅ Open source | ❌ Desktop only | ✅ Built-in | ✅ Built-in | Very High |
| **Wingman AI** | ✅ Open source | ❌ VS Code only | ⚠️ Basic | ✅ Built-in | High |
| **gpt_mobile** | ✅ Open source | ✅ Android | ❌ None | ❌ None | Low (extend it) |

---

## Recommendation

### Primary Approach: Claude API + Custom Agent

Build a custom mobile app using:

1. **Claude API** for AI backbone
   - Full control over agent behavior
   - Same model quality as Cursor
   - Well-documented, stable API

2. **MCP Protocol** for tool integrations
   - Standard way to connect AI to tools
   - Future-proof architecture

3. **Reference Implementations**
   - Study Kilo Code for agent patterns
   - Study gpt_mobile for mobile UX patterns

### Architecture Decision

```
┌──────────────────────────────────────┐
│         Mobile App (Flutter)          │
├──────────────────────────────────────┤
│  Agent Orchestration Layer            │
│  - Task planning                      │
│  - Tool execution                     │
│  - State management                   │
├──────────────────────────────────────┤
│  Claude API Client                    │
│  - Messages API                       │
│  - Tool Use                           │
│  - Streaming                          │
├──────────────────────────────────────┤
│  Backend Service (Optional)           │
│  - Git operations                     │
│  - File sync                          │
│  - Heavy compute                      │
└──────────────────────────────────────┘
```

---

## Next Steps

1. Design mobile app architecture → [MOBILE_ARCHITECTURE.md](./MOBILE_ARCHITECTURE.md)
2. Select framework → [FRAMEWORK_RECOMMENDATION.md](./FRAMEWORK_RECOMMENDATION.md)
3. Build prototype with Claude API + basic tools
4. Iterate based on user feedback

---

**Research Status**: Complete  
**Recommendation**: Claude API + Custom Implementation
