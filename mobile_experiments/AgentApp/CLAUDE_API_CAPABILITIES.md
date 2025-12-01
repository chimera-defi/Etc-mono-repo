# Claude API Capabilities for Agent App

Deep dive into Anthropic's Claude API capabilities relevant to building a mobile AI coding agent.

---

## API Overview

Claude API provides everything needed to build a Cursor-equivalent agent:

| Capability | Availability | API Endpoint | Notes |
|------------|--------------|--------------|-------|
| Chat/Completion | ✅ Yes | `/v1/messages` | Core functionality |
| Streaming | ✅ Yes | SSE in `/v1/messages` | Real-time responses |
| Tool Use | ✅ Yes | `tools` parameter | Function calling |
| Extended Thinking | ✅ Yes | `thinking` blocks | Reasoning transparency |
| Vision | ✅ Yes | Image in messages | Screenshot analysis |
| Computer Use | ✅ Beta | Specialized tools | Screen interaction |
| Batch API | ✅ Yes | `/v1/messages/batches` | Bulk processing |
| Token Counting | ✅ Yes | `/v1/messages/count_tokens` | Usage estimation |

---

## Models Available

| Model | Best For | Context | Speed | Cost (Input/Output) |
|-------|----------|---------|-------|---------------------|
| **Claude 3.5 Sonnet** | Coding, balance | 200K | Fast | $3/$15 per M |
| **Claude 3 Opus** | Complex reasoning | 200K | Slow | $15/$75 per M |
| **Claude 3.5 Haiku** | Fast responses | 200K | Fastest | $0.25/$1.25 per M |

**Recommendation for Agent App**: 
- Use **Claude 3.5 Sonnet** for coding tasks (best code quality)
- Use **Claude 3.5 Haiku** for simple queries (cost optimization)

---

## Tool Use (Function Calling)

The key capability for building agents. Claude can:
1. Receive a list of available tools
2. Decide which tools to use
3. Generate proper tool calls with arguments
4. Process tool results and continue

### Tool Definition Schema

```json
{
  "name": "read_file",
  "description": "Read the contents of a file at the given path",
  "input_schema": {
    "type": "object",
    "properties": {
      "path": {
        "type": "string",
        "description": "Absolute or relative path to the file"
      }
    },
    "required": ["path"]
  }
}
```

### Agent App Tools (Recommended Set)

| Tool | Description | Priority |
|------|-------------|----------|
| `read_file` | Read file contents | P0 |
| `write_file` | Write/create files | P0 |
| `list_directory` | List directory contents | P0 |
| `search_files` | Grep/ripgrep search | P0 |
| `run_command` | Execute shell commands | P0 |
| `git_status` | Get git status | P1 |
| `git_diff` | Show file changes | P1 |
| `git_commit` | Create commit | P1 |
| `create_pr` | Create pull request | P1 |
| `web_search` | Search the web | P2 |
| `fetch_url` | Fetch URL contents | P2 |

### Tool Call Flow

```
User: "Fix the bug in src/auth.ts"
          │
          ▼
┌─────────────────────────────────────────────┐
│ Claude receives message + available tools   │
└─────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────┐
│ Claude response includes tool_use block:    │
│ {                                           │
│   "type": "tool_use",                       │
│   "name": "read_file",                      │
│   "input": {"path": "src/auth.ts"}          │
│ }                                           │
└─────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────┐
│ Backend executes tool, returns result       │
└─────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────┐
│ Claude receives tool_result, continues      │
│ May call more tools or provide final answer │
└─────────────────────────────────────────────┘
```

---

## Streaming API

Critical for real-time UX in the mobile app.

### Event Types

| Event | Description | Use in App |
|-------|-------------|------------|
| `message_start` | Message begins | Show typing indicator |
| `content_block_start` | New content block | Prepare display area |
| `content_block_delta` | Text chunk | Append to message |
| `content_block_stop` | Block complete | Finalize formatting |
| `message_delta` | Message metadata | Update token count |
| `message_stop` | Message complete | Hide typing indicator |

### React Native Implementation

```typescript
// hooks/useClaudeStream.ts
import { useState, useCallback } from 'react';

interface StreamState {
  text: string;
  thinking: string;
  toolCalls: ToolCall[];
  isStreaming: boolean;
  error: Error | null;
}

export function useClaudeStream(apiKey: string) {
  const [state, setState] = useState<StreamState>({
    text: '',
    thinking: '',
    toolCalls: [],
    isStreaming: false,
    error: null,
  });

  const stream = useCallback(async (
    messages: Message[],
    tools: Tool[],
    onToolCall: (tool: ToolCall) => Promise<ToolResult>
  ) => {
    setState(s => ({ ...s, isStreaming: true, text: '', error: null }));

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 8192,
          stream: true,
          tools,
          messages,
        }),
      });

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          if (line === 'data: [DONE]') continue;

          const data = JSON.parse(line.slice(6));
          
          switch (data.type) {
            case 'content_block_delta':
              if (data.delta.type === 'text_delta') {
                setState(s => ({ ...s, text: s.text + data.delta.text }));
              } else if (data.delta.type === 'thinking_delta') {
                setState(s => ({ ...s, thinking: s.thinking + data.delta.thinking }));
              }
              break;
              
            case 'content_block_start':
              if (data.content_block.type === 'tool_use') {
                const toolCall: ToolCall = {
                  id: data.content_block.id,
                  name: data.content_block.name,
                  input: {},
                };
                setState(s => ({ ...s, toolCalls: [...s.toolCalls, toolCall] }));
              }
              break;
          }
        }
      }
    } catch (error) {
      setState(s => ({ ...s, error: error as Error }));
    } finally {
      setState(s => ({ ...s, isStreaming: false }));
    }
  }, [apiKey]);

  return { ...state, stream };
}
```

---

## Extended Thinking (Claude 3.5 Sonnet)

Claude can show its reasoning process, useful for:
- Debugging agent decisions
- Transparency for users
- Understanding complex code analysis

### Enabling Extended Thinking

```json
{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 16000,
  "thinking": {
    "type": "enabled",
    "budget_tokens": 10000
  },
  "messages": [...]
}
```

### Response Format

```json
{
  "content": [
    {
      "type": "thinking",
      "thinking": "Let me analyze this code...\n\nThe bug appears to be..."
    },
    {
      "type": "text",
      "text": "I found the issue. The bug is on line 42..."
    }
  ]
}
```

### UX Considerations

| Option | User Experience |
|--------|-----------------|
| Hide thinking | Cleaner, but less transparent |
| Collapsible section | Balance of clean + transparent |
| Show by default | Maximum transparency, more verbose |

**Recommendation**: Collapsible "See reasoning" section.

---

## Vision Capabilities

Claude can analyze images, useful for:
- Screenshot debugging
- UI review
- Error screenshot analysis

### Sending Images

```json
{
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "image",
          "source": {
            "type": "base64",
            "media_type": "image/png",
            "data": "<base64-encoded-image>"
          }
        },
        {
          "type": "text",
          "text": "What's wrong with this UI?"
        }
      ]
    }
  ]
}
```

### Mobile App Use Cases

| Use Case | Implementation |
|----------|----------------|
| Error screenshot | User takes screenshot, Claude analyzes |
| UI debugging | Analyze simulator screenshots |
| Code from image | Extract code from screenshot |

---

## Computer Use (Beta)

Claude can interact with computer interfaces. Relevant for:
- Automated testing
- Complex multi-step workflows
- Browser automation

**Note**: Computer Use is still in beta and may not be suitable for v1 of Agent App.

---

## Rate Limits & Pricing

### Rate Limits (Tier 1)

| Model | Requests/min | Tokens/min | Tokens/day |
|-------|--------------|------------|------------|
| Claude 3.5 Sonnet | 50 | 40,000 | 1,000,000 |
| Claude 3 Opus | 50 | 20,000 | 400,000 |
| Claude 3.5 Haiku | 50 | 50,000 | 5,000,000 |

### Cost Optimization Strategies

| Strategy | Implementation |
|----------|----------------|
| Use Haiku for simple queries | Route based on task complexity |
| Cache common responses | Store frequent code patterns |
| Batch non-urgent requests | Use Batch API for background tasks |
| Limit context window | Only send relevant code |

### Estimated Monthly Costs

| Usage Level | Sonnet Cost | Notes |
|-------------|-------------|-------|
| Light (100 tasks/day) | ~$50/mo | Hobby/personal |
| Medium (500 tasks/day) | ~$250/mo | Small team |
| Heavy (2000 tasks/day) | ~$1000/mo | Enterprise |

---

## MCP (Model Context Protocol) Integration

MCP is Anthropic's standard for connecting AI to tools.

### Benefits for Agent App

| Benefit | Description |
|---------|-------------|
| Standardized tools | Common interface for all tools |
| Server architecture | Tools run as separate services |
| Extensibility | Easy to add new tools |
| Security | Sandboxed execution |

### MCP Server Example

```typescript
// mcp-server/src/index.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server({
  name: 'agent-app-mcp',
  version: '1.0.0',
}, {
  capabilities: {
    tools: {},
  },
});

// Register file read tool
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'read_file',
      description: 'Read file contents',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string' },
        },
        required: ['path'],
      },
    },
  ],
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'read_file') {
    const { path } = request.params.arguments;
    const content = await fs.readFile(path, 'utf-8');
    return { content: [{ type: 'text', text: content }] };
  }
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
```

---

## Security Considerations

### API Key Management

| Platform | Storage Method |
|----------|----------------|
| iOS | Keychain |
| Android | EncryptedSharedPreferences |
| React Native | expo-secure-store |

### Never Do

- ❌ Hardcode API keys
- ❌ Store in AsyncStorage
- ❌ Include in bundle
- ❌ Log API keys

### Recommended Architecture

```
Mobile App
    │
    ▼ (Auth token only)
Backend Server
    │
    ▼ (API key stored here)
Claude API
```

---

## Implementation Priority

### Phase 1: Core Chat

- [ ] Basic messages API integration
- [ ] Streaming text display
- [ ] Error handling

### Phase 2: Tool Use

- [ ] Define core tools (read/write/search)
- [ ] Tool execution loop
- [ ] Result display

### Phase 3: Advanced

- [ ] Extended thinking display
- [ ] Vision capabilities
- [ ] MCP integration

---

**Document Status**: Complete  
**Last Updated**: December 2025
