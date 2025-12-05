# Build vs Buy: Do We Really Need These Services?

Critical analysis of what we actually need vs what third parties provide.

---

## What Does Each Service Actually Give Us?

### Trigger.dev - What It Provides

| Feature | Do We Need It? | Can We Build It? |
|---------|----------------|------------------|
| Job queuing | ✅ Yes | ✅ Easy (Redis/BullMQ or just Postgres) |
| Retries on failure | ✅ Yes | ✅ Easy (simple retry loop) |
| Long-running tasks | ✅ Yes | ✅ Easy (our own process) |
| Real-time updates | ✅ Yes | ✅ Easy (WebSocket) |
| Dashboard UI | ⚠️ Nice to have | ⚠️ Takes time |
| Distributed workers | ⚠️ Maybe later | ⚠️ More complex |

**Verdict**: Trigger.dev is convenient but **not essential**. A simple queue + worker is sufficient.

### Supabase - What It Provides

| Feature | Do We Need It? | Can We Build It? |
|---------|----------------|------------------|
| PostgreSQL | ✅ Yes | ✅ SQLite is simpler |
| Auth (OAuth) | ✅ Yes | ⚠️ OAuth libraries exist |
| Realtime WebSocket | ✅ Yes | ✅ Easy (ws library) |
| Storage | ⚠️ Maybe | ✅ Local filesystem / S3 |
| Edge Functions | ❌ No | N/A |
| Row-level security | ❌ No | N/A |

**Verdict**: Supabase bundles things nicely but **we don't need most of it**.

---

## What Do We ACTUALLY Need?

### Minimal Requirements

| Requirement | Simplest Solution |
|-------------|-------------------|
| Store task history | SQLite file |
| Store user sessions | SQLite or JWT |
| Queue tasks | In-memory queue or SQLite table |
| Real-time updates | WebSocket server |
| Run agent code | Docker container |
| Clone repos | `git clone` |
| Call Claude API | HTTP requests |

### The Minimal Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SINGLE SERVER                             │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Node.js / Python Server                                │ │
│  │                                                         │ │
│  │  • WebSocket endpoint (mobile connects here)            │ │
│  │  • REST API (auth, task management)                     │ │
│  │  • Task queue (in-memory or SQLite-backed)              │ │
│  │  • Agent orchestrator (spawns Docker containers)        │ │
│  │                                                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│                           ▼                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  SQLite Database                                        │ │
│  │                                                         │ │
│  │  • users (id, github_token, created_at)                 │ │
│  │  • tasks (id, user_id, status, repo_url, created_at)    │ │
│  │  • messages (id, task_id, role, content, created_at)    │ │
│  │                                                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│                           ▼                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Docker (for sandboxed agent execution)                 │ │
│  │                                                         │ │
│  │  Container per task:                                    │ │
│  │  • Clone repo                                           │ │
│  │  • Run agent loop (Claude API + tools)                  │ │
│  │  • Push changes                                         │ │
│  │  • Exit when done                                       │ │
│  │                                                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**That's it.** One server, SQLite, Docker.

---

## Self-Hosted Stack Comparison

| Component | Managed Services | Self-Hosted |
|-----------|------------------|-------------|
| **Compute** | Fly.io ($20/mo) | Single VPS ($5-20/mo) |
| **Database** | Supabase/Neon ($25/mo) | SQLite ($0) |
| **Queue** | Trigger.dev ($30/mo) | BullMQ or SQLite ($0) |
| **Cache** | Upstash ($10/mo) | In-memory or SQLite ($0) |
| **Auth** | Supabase Auth | Simple JWT + GitHub OAuth |
| **WebSocket** | Supabase Realtime | ws library ($0) |
| **Total** | ~$85/mo minimum | **$5-20/mo** (just the VPS) |

---

## What We Lose By Self-Hosting

| Feature | Impact | Mitigation |
|---------|--------|------------|
| Auto-scaling | ⚠️ Medium | Vertical scaling, or add workers later |
| Managed backups | ⚠️ Medium | Simple cron + S3 backup |
| Dashboard UI | 🟢 Low | Build simple admin page later |
| Multi-region | 🟢 Low | Not needed for MVP |
| 99.9% SLA | 🟢 Low | VPS providers are reliable enough |

---

## Proposed Self-Hosted Architecture

### Single VPS Setup

```
VPS (e.g., Hetzner €4/mo, DigitalOcean $6/mo)
│
├── /app
│   ├── server.ts          # Main server (Express/Fastify)
│   ├── websocket.ts       # WebSocket handler
│   ├── queue.ts           # Simple task queue
│   ├── agent.ts           # Agent orchestrator
│   └── db.ts              # SQLite wrapper
│
├── /data
│   └── agent.db           # SQLite database
│
└── Docker
    └── agent-worker        # Container image for agent execution
```

### Server Components

```typescript
// server.ts - Main server (~200 lines)
import Fastify from 'fastify';
import { WebSocketServer } from 'ws';
import Database from 'better-sqlite3';

const app = Fastify();
const wss = new WebSocketServer({ server: app.server });
const db = new Database('./data/agent.db');

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    github_token TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    repo_url TEXT,
    prompt TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
  
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    task_id TEXT,
    role TEXT,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id)
  );
`);

// WebSocket connections
const connections = new Map<string, WebSocket>();

wss.on('connection', (ws, req) => {
  const userId = authenticateWebSocket(req);
  connections.set(userId, ws);
  
  ws.on('message', async (data) => {
    const { type, payload } = JSON.parse(data.toString());
    
    if (type === 'start_task') {
      const taskId = await startTask(userId, payload);
      ws.send(JSON.stringify({ type: 'task_started', taskId }));
    }
  });
});

// Start a task - spawn Docker container
async function startTask(userId: string, { repoUrl, prompt }) {
  const taskId = crypto.randomUUID();
  
  db.prepare(`
    INSERT INTO tasks (id, user_id, repo_url, prompt, status)
    VALUES (?, ?, ?, ?, 'running')
  `).run(taskId, userId, repoUrl, prompt);
  
  // Spawn Docker container
  spawnAgent(taskId, repoUrl, prompt, (update) => {
    // Send updates to connected client
    const ws = connections.get(userId);
    if (ws) ws.send(JSON.stringify(update));
  });
  
  return taskId;
}
```

### Agent Worker (Docker Container)

```typescript
// agent-worker/main.ts - Runs inside container (~300 lines)
import Anthropic from '@anthropic-ai/sdk';
import { execSync } from 'child_process';
import * as fs from 'fs';

const client = new Anthropic();
const { TASK_ID, REPO_URL, PROMPT, CALLBACK_URL } = process.env;

// Clone repo
execSync(`git clone ${REPO_URL} /workspace`);
process.chdir('/workspace');

// Define tools
const tools = [
  {
    name: 'read_file',
    description: 'Read file contents',
    input_schema: {
      type: 'object',
      properties: { path: { type: 'string' } },
      required: ['path']
    }
  },
  {
    name: 'write_file',
    description: 'Write to file',
    input_schema: {
      type: 'object',
      properties: { 
        path: { type: 'string' },
        content: { type: 'string' }
      },
      required: ['path', 'content']
    }
  },
  {
    name: 'run_command',
    description: 'Run shell command',
    input_schema: {
      type: 'object',
      properties: { command: { type: 'string' } },
      required: ['command']
    }
  }
];

// Execute tool
function executeTool(name: string, input: any): string {
  switch (name) {
    case 'read_file':
      return fs.readFileSync(input.path, 'utf-8');
    case 'write_file':
      fs.writeFileSync(input.path, input.content);
      return 'File written successfully';
    case 'run_command':
      return execSync(input.command, { encoding: 'utf-8', timeout: 30000 });
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// Agent loop
async function runAgent() {
  const messages = [{ role: 'user', content: PROMPT }];
  
  while (true) {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      tools,
      messages
    });
    
    // Send update to server
    await fetch(CALLBACK_URL, {
      method: 'POST',
      body: JSON.stringify({ taskId: TASK_ID, response })
    });
    
    // Check if done
    if (response.stop_reason === 'end_turn') {
      break;
    }
    
    // Execute tool calls
    if (response.stop_reason === 'tool_use') {
      const toolResults = [];
      
      for (const block of response.content) {
        if (block.type === 'tool_use') {
          const result = executeTool(block.name, block.input);
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: result
          });
        }
      }
      
      messages.push({ role: 'assistant', content: response.content });
      messages.push({ role: 'user', content: toolResults });
    }
  }
  
  // Push changes if any
  execSync('git add -A && git commit -m "Agent changes" && git push || true');
}

runAgent().catch(console.error);
```

---

## Cost Comparison

| Scenario | Managed Stack | Self-Hosted |
|----------|---------------|-------------|
| **MVP (10 users)** | $85/mo | $5/mo |
| **Growth (100 users)** | $200/mo | $20/mo |
| **Scale (1000 users)** | $500+/mo | $50-100/mo |

---

## Recommendation

### For MVP: Self-Hosted

```
Single VPS ($5-20/mo)
├── Fastify/Express server
├── WebSocket for real-time
├── SQLite for persistence
├── Docker for agent sandboxing
└── Simple GitHub OAuth
```

**Total services to manage: 1 (your VPS)**

### Scale Later If Needed

When/if you need to scale:
1. Move SQLite → Postgres (same queries work)
2. Add Redis for pub/sub (if multiple servers)
3. Add worker nodes (if CPU-bound)
4. Consider managed services only when pain is real

---

## What Changes in Phase 2 Decisions?

| # | Decision | Original | Revised |
|---|----------|----------|---------|
| 6 | Compute Provider | Fly.io | **Single VPS** (Hetzner/DO) |
| 7 | Container Orchestration | Fly Machines API | **Docker on same VPS** |
| 8 | Networking | WebSocket Hub | **WebSocket on same server** |
| 9 | Persistence | Upstash + Neon + R2 | **SQLite + local filesystem** |

---

## Final Architecture (Self-Hosted)

```
┌─────────────────────────────────────────────────────────────┐
│                         VPS ($5-20/mo)                       │
│                                                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                  Main Server                         │   │
│   │                                                      │   │
│   │  [Mobile App] ◄──WebSocket──► [Server Process]      │   │
│   │                                     │                │   │
│   │                                     ▼                │   │
│   │                              [Task Queue]            │   │
│   │                              (in-memory)             │   │
│   │                                     │                │   │
│   │                                     ▼                │   │
│   │                           [Docker Daemon]            │   │
│   │                                     │                │   │
│   │              ┌──────────────────────┼────────┐       │   │
│   │              ▼                      ▼        ▼       │   │
│   │         [Worker 1]            [Worker 2]   [...]     │   │
│   │         (Task A)              (Task B)               │   │
│   │                                                      │   │
│   └─────────────────────────────────────────────────────┘   │
│                              │                               │
│                              ▼                               │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                    SQLite                            │   │
│   │  users | tasks | messages                            │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Your call**: Does this simpler self-hosted approach make more sense?
