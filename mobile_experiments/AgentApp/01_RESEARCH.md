# 01. Research Summary

All research consolidated into one document.

---

## 1.1 Cursor API Research

**Finding: Cursor has NO public API.**

| Aspect | Status |
|--------|--------|
| Public REST API | ❌ None |
| WebSocket API | ❌ None |
| SDK | ❌ None |
| Plugin hooks for agents | ❌ None |

**Why?** Cursor's agent orchestration is their competitive advantage. They have no incentive to expose it.

**Implication:** We must build our own agent using the underlying LLM APIs.

---

## 1.2 Best Alternative: Claude API

**Recommendation: Build custom agent with Anthropic's Claude API.**

This is what Cursor uses internally. We get the same model quality.

### Claude API Capabilities

| Feature | Available |
|---------|-----------|
| Text generation | ✅ |
| Tool use (function calling) | ✅ |
| Streaming responses | ✅ |
| Vision (image understanding) | ✅ |
| Extended thinking | ✅ |
| Computer use (beta) | ✅ |

### Models & Pricing

| Model | Input | Output | Best For |
|-------|-------|--------|----------|
| Claude 3.5 Sonnet | $3/M | $15/M | Daily use (fast, good) |
| Claude 3 Opus | $15/M | $75/M | Complex tasks |
| Claude 3.5 Haiku | $0.25/M | $1.25/M | Cheap/simple tasks |

### Tool Use Example

```typescript
const response = await claude.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 4096,
  tools: [
    { name: 'read_file', description: 'Read file contents', input_schema: {...} },
    { name: 'write_file', description: 'Write to file', input_schema: {...} },
    { name: 'run_command', description: 'Run shell command', input_schema: {...} }
  ],
  messages: [{ role: 'user', content: 'Fix the bug in main.py' }]
});
```

---

## 1.3 Other Alternatives Considered

| Option | Stars | Verdict |
|--------|-------|---------|
| **Kilo Code** | 12.8k | Good reference, but VS Code only |
| **LibreChat** | 32k | Has API, but general chat not code-focused |
| **AgenticSeek** | 24k | Local only, not mobile-ready |
| **gpt_mobile** | 926 | Good mobile reference, but chat-only |

**Conclusion:** None are suitable. Build custom with Claude API.

---

## 1.4 Framework: React Native + Expo

**Decision: React Native + Expo** (not Flutter)

### Why React Native?

| Factor | React Native | Flutter |
|--------|--------------|---------|
| StackOverflow Q&A | 139k | 182k |
| npm downloads/mo | 18.8M | — |
| Language | TypeScript (same as backend) | Dart |
| AI training data | Massive | Smaller |

**Key advantage:** TypeScript on both mobile and backend = one language.

### Key Packages (Verified)

```json
{
  "expo": "~54.0.0",
  "react-native": "^0.82.0",
  "zustand": "^5.0.0",
  "@tanstack/react-query": "^5.0.0",
  "react-native-reanimated": "~3.16.0",
  "react-native-syntax-highlighter": "^2.1.0"
}
```

---

## 1.5 Market Gap

**No app combines all three:**
1. ✅ Code editing
2. ✅ AI chat with tool use
3. ✅ Git integration

| Existing App | Code Editor | AI Agent | Git |
|--------------|-------------|----------|-----|
| Buffer Editor | ✅ | ❌ | ✅ |
| ChatGPT Mobile | ❌ | ❌ | ❌ |
| Claude Mobile | ❌ | ❌ | ❌ |
| GitHub Mobile | ⚠️ Basic | ❌ | ✅ |
| **Our App** | ✅ | ✅ | ✅ |

---

## 1.6 Infrastructure Options (Verified Data)

We chose **self-hosted** over managed services.

| Platform | Stars | Notes |
|----------|-------|-------|
| Fly.io | 1,588 | Good for ephemeral containers |
| Modal | 1,049 | Purpose-built compute |
| Railway | 425 | Simple PaaS |
| **Hetzner VPS** | — | Cheapest ($4-6/mo), chose this |

**Decision rationale:** For MVP, a single $6/mo VPS with Docker is simpler and cheaper than managed services. Can scale to Fly.io later if needed.

---

**Research Status:** ✅ Complete  
**Decision:** Build custom agent with Claude API + React Native + Self-hosted
