# 03. Design

All design details: mobile app, server components, and AI agent.

---

## 3.1 Mobile App Screens

### Screen Flow

```
Splash → Login → Projects → Chat → (History, Settings)
```

### Login Screen
- GitHub OAuth button
- Redirects to GitHub, returns with token
- Store token in secure storage

### Projects Screen
- List of connected GitHub repos
- Tap [+] to add new repo
- Tap project → Chat screen
- Swipe to delete

### Chat Screen (Main)
```
┌────────────────────────┐
│ ← my-app      ● RUNNING│
├────────────────────────┤
│ 👤 Add dark mode       │
│                        │
│ 🤖 Working...          │
│ ✓ Read App.tsx         │
│ ✓ Read theme.ts        │
│ → Writing dark.ts      │
│   ████████░░ 80%       │
│                        │
├────────────────────────┤
│ [    Cancel Task     ] │
└────────────────────────┘
```

**States:**
- Idle: Show input, past messages
- Running: Show progress, cancel button
- Complete: Show PR link, diff summary

### History Screen
- List past tasks grouped by date
- Tap → view details

### Settings Screen
- Claude API key (masked)
- Sign out button

---

## 3.2 Mobile Performance

| Metric | Target |
|--------|--------|
| Cold start | < 2s |
| Frame rate | 60 fps |
| Scroll | 60 fps (FlashList) |
| WebSocket latency | < 200ms |

**Key techniques:**
- Use `react-native-reanimated` for animations
- Use `@shopify/flash-list` for long lists
- Memoize components with `React.memo`

---

## 3.3 Mobile State (Zustand)

```typescript
// Auth store
interface AuthStore {
  user: User | null;
  token: string | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

// Tasks store
interface TasksStore {
  currentTask: Task | null;
  history: Task[];
  createTask: (prompt: string) => Promise<void>;
  cancelTask: () => Promise<void>;
}

// WebSocket store
interface WebSocketStore {
  isConnected: boolean;
  connect: () => void;
  subscribe: (taskId: string) => void;
}
```

---

## 3.4 Offline Support

| Action | Online | Offline |
|--------|--------|---------|
| View projects | ✅ Live | ✅ Cached |
| View history | ✅ Live | ✅ Cached |
| Create task | ✅ Works | 📝 Queued |
| See progress | ✅ Real-time | ❌ N/A |

Queue tasks locally, sync when back online.

---

## 3.5 Server Components

### Coordinator Responsibilities

| Component | Purpose |
|-----------|---------|
| HTTP Server | REST API endpoints |
| WebSocket Server | Real-time connections |
| Auth Middleware | Validate JWT |
| Task Queue | SQLite-backed FIFO |
| Docker Spawner | Create/destroy containers |
| Progress Router | Broadcast to clients |

### Worker Responsibilities

| Component | Purpose |
|-----------|---------|
| Agent Loop | Orchestrate Claude + tools |
| Claude Client | API calls with retry |
| Tool Executor | Dispatch tool calls |
| Git Operations | Clone, commit, push, PR |
| Progress Reporter | HTTP callbacks |

---

## 3.6 Agent Loop

```typescript
async function runAgentLoop(prompt: string): Promise<Result> {
  const messages = [{ role: 'user', content: prompt }];
  
  while (true) {
    // Call Claude
    const response = await claude.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      tools: TOOLS,
      messages,
    });
    
    messages.push({ role: 'assistant', content: response.content });
    
    // Check for tool use
    const toolUses = response.content.filter(b => b.type === 'tool_use');
    
    if (toolUses.length === 0) {
      // Done - no more tools
      return extractResult(response);
    }
    
    // Execute tools
    const results = [];
    for (const tool of toolUses) {
      reportProgress(`Running ${tool.name}...`);
      const result = await executeTool(tool.name, tool.input);
      results.push({ tool_use_id: tool.id, content: result });
    }
    
    messages.push({ role: 'user', content: results });
  }
}
```

---

## 3.7 Tools

### read_file
```typescript
{
  name: 'read_file',
  description: 'Read file contents',
  input_schema: {
    type: 'object',
    properties: {
      path: { type: 'string', description: 'Path within /workspace' }
    },
    required: ['path']
  }
}
```

### write_file
```typescript
{
  name: 'write_file',
  description: 'Write content to file',
  input_schema: {
    type: 'object',
    properties: {
      path: { type: 'string' },
      content: { type: 'string' }
    },
    required: ['path', 'content']
  }
}
```

### list_directory
```typescript
{
  name: 'list_directory',
  description: 'List files in directory',
  input_schema: {
    type: 'object',
    properties: {
      path: { type: 'string' },
      recursive: { type: 'boolean' }
    },
    required: ['path']
  }
}
```

### run_command
```typescript
{
  name: 'run_command',
  description: 'Run shell command',
  input_schema: {
    type: 'object',
    properties: {
      command: { type: 'string' },
      timeout: { type: 'number' }
    },
    required: ['command']
  }
}
```

### search_files
```typescript
{
  name: 'search_files',
  description: 'Search for pattern in files (ripgrep)',
  input_schema: {
    type: 'object',
    properties: {
      pattern: { type: 'string' },
      path: { type: 'string' },
      file_pattern: { type: 'string' }
    },
    required: ['pattern']
  }
}
```

---

## 3.8 Security

### Path Validation
```typescript
function validatePath(path: string): string {
  const resolved = path.resolve('/workspace', path);
  if (!resolved.startsWith('/workspace/')) {
    throw new Error('Path traversal blocked');
  }
  return resolved;
}
```

### Command Sanitization
Block dangerous patterns: `rm -rf /`, `sudo`, shell injection

### API Key Handling
- Pass via env var to container
- Never log or write to disk
- Container is ephemeral (deleted after task)

---

## 3.9 Worker Dockerfile

```dockerfile
FROM node:20-alpine

RUN apk add --no-cache git ripgrep

RUN adduser -D agent
USER agent
WORKDIR /home/agent

COPY package*.json ./
RUN npm ci --production

COPY src/ ./src/

RUN mkdir /workspace
WORKDIR /workspace

CMD ["node", "/home/agent/src/index.js"]
```

---

## 3.10 Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Container resource exhaustion | Limits: 1 CPU, 2GB RAM, 30min timeout |
| WebSocket disconnects | Auto-reconnect, fetch state on reconnect |
| Worker crashes | Mark task as failed, cleanup container |
| API key exposure | Encrypt at rest, never log |
| Large repo clone time | Shallow clone (`--depth 1`) |
| Claude rate limits | Exponential backoff, show wait time |
