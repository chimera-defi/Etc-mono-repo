# DIY vs Managed Services Analysis

## The Core Question

Do we need Trigger.dev + Supabase, or can we build this with:
- A simple server
- SQLite
- Basic Docker orchestration

---

## What Do We Actually Need?

| Requirement | Trigger.dev | Supabase | DIY Equivalent |
|-------------|-------------|----------|----------------|
| Accept task from mobile | ✅ | — | HTTP endpoint |
| Queue tasks | ✅ | — | SQLite table / BullMQ |
| Run ephemeral workers | ✅ | — | Docker + shell script |
| Stream progress to mobile | — | ✅ Realtime | WebSocket (ws library) |
| Store task history | — | ✅ PostgreSQL | SQLite |
| Auth | — | ✅ | JWT + bcrypt |
| File storage | — | ✅ | Local disk / S3 |

### Honest Assessment

**What Trigger.dev gives us:**
- Managed queue infrastructure
- Retry with backoff
- Dashboard/monitoring
- Distributed workers

**What we actually need for MVP:**
- A queue (SQLite table works)
- Retry logic (10 lines of code)
- One worker at a time (for now)

**What Supabase gives us:**
- Managed PostgreSQL
- Realtime subscriptions
- OAuth providers
- Edge functions

**What we actually need for MVP:**
- Store tasks (SQLite works)
- Push updates (WebSocket is ~50 lines)
- Auth (JWT is simple)

---

## DIY Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SINGLE SERVER                             │
│                   (Fly.io / Railway / VPS)                   │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    Node.js Server                        ││
│  │                                                          ││
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ││
│  │  │  HTTP API    │  │  WebSocket   │  │  Worker      │  ││
│  │  │  /tasks      │  │  /ws         │  │  Manager     │  ││
│  │  └──────────────┘  └──────────────┘  └──────────────┘  ││
│  │                          │                    │         ││
│  │                          ▼                    ▼         ││
│  │  ┌──────────────────────────────────────────────────┐  ││
│  │  │                    SQLite                         │  ││
│  │  │  • tasks (queue)                                  │  ││
│  │  │  • messages (conversation history)                │  ││
│  │  │  • users (auth)                                   │  ││
│  │  └──────────────────────────────────────────────────┘  ││
│  └─────────────────────────────────────────────────────────┘│
│                              │                               │
│                              ▼                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              Docker Containers (Workers)                 ││
│  │                                                          ││
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        ││
│  │  │  Task 1    │  │  Task 2    │  │  Task 3    │        ││
│  │  │  (agent)   │  │  (agent)   │  │  (agent)   │        ││
│  │  └────────────┘  └────────────┘  └────────────┘        ││
│  │                                                          ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## Minimal Tech Stack

| Component | Technology | Lines of Code | Complexity |
|-----------|------------|---------------|------------|
| HTTP Server | Fastify or Express | ~100 | Low |
| WebSocket | ws library | ~50 | Low |
| Database | better-sqlite3 | ~50 | Low |
| Auth | JWT + bcrypt | ~100 | Low |
| Docker orchestration | dockerode | ~100 | Medium |
| Claude API | @anthropic-ai/sdk | ~150 | Low |
| **Total** | — | **~550 lines** | **Low-Medium** |

---

## SQLite Schema

```sql
-- Users
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Projects (GitHub repos)
CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    repo_url TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tasks (the queue)
CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    prompt TEXT NOT NULL,
    status TEXT DEFAULT 'pending',  -- pending, running, completed, failed
    worker_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    started_at DATETIME,
    completed_at DATETIME,
    error TEXT,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Messages (conversation history)
CREATE TABLE messages (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    role TEXT NOT NULL,  -- user, assistant, tool_use, tool_result
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id)
);

-- Tool calls (for debugging/replay)
CREATE TABLE tool_calls (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    tool_name TEXT NOT NULL,
    input TEXT NOT NULL,  -- JSON
    output TEXT,          -- JSON
    duration_ms INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id)
);
```

---

## DIY Server Code (Simplified)

```typescript
// server.ts - ~200 lines total
import Fastify from 'fastify';
import { WebSocketServer } from 'ws';
import Database from 'better-sqlite3';
import Docker from 'dockerode';
import { randomUUID } from 'crypto';

const app = Fastify();
const db = new Database('agent.db');
const docker = new Docker();
const clients = new Map<string, WebSocket>(); // userId -> WebSocket

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    prompt TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create task
app.post('/api/tasks', async (req, reply) => {
  const { userId, prompt, repoUrl } = req.body as any;
  const taskId = randomUUID();
  
  db.prepare('INSERT INTO tasks (id, user_id, prompt, status) VALUES (?, ?, ?, ?)')
    .run(taskId, userId, prompt, 'pending');
  
  // Spawn worker
  spawnWorker(taskId, userId, prompt, repoUrl);
  
  return { taskId };
});

// Get task status
app.get('/api/tasks/:id', async (req, reply) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  return task;
});

// Spawn Docker worker
async function spawnWorker(taskId: string, userId: string, prompt: string, repoUrl: string) {
  const container = await docker.createContainer({
    Image: 'agent-worker:latest',
    Env: [
      `TASK_ID=${taskId}`,
      `REPO_URL=${repoUrl}`,
      `PROMPT=${prompt}`,
      `CLAUDE_API_KEY=${process.env.CLAUDE_API_KEY}`,
      `CALLBACK_URL=http://host.docker.internal:3000/api/worker-callback`,
    ],
    HostConfig: {
      AutoRemove: true, // Clean up when done
    },
  });
  
  await container.start();
  
  db.prepare('UPDATE tasks SET status = ? WHERE id = ?').run('running', taskId);
  notifyClient(userId, { type: 'task_started', taskId });
}

// Worker callback (progress updates)
app.post('/api/worker-callback', async (req, reply) => {
  const { taskId, type, data } = req.body as any;
  const task = db.prepare('SELECT user_id FROM tasks WHERE id = ?').get(taskId);
  
  if (task) {
    notifyClient(task.user_id, { taskId, type, data });
    
    if (type === 'completed' || type === 'failed') {
      db.prepare('UPDATE tasks SET status = ? WHERE id = ?').run(type, taskId);
    }
  }
  
  return { ok: true };
});

// WebSocket for real-time updates
const wss = new WebSocketServer({ server: app.server });
wss.on('connection', (ws, req) => {
  const userId = authenticateWs(req); // Extract from token
  clients.set(userId, ws);
  ws.on('close', () => clients.delete(userId));
});

function notifyClient(userId: string, message: object) {
  const ws = clients.get(userId);
  if (ws) ws.send(JSON.stringify(message));
}

app.listen({ port: 3000 });
```

---

## Worker Code (Simplified)

```typescript
// worker.ts - runs inside Docker container
import Anthropic from '@anthropic-ai/sdk';
import { execSync } from 'child_process';
import * as fs from 'fs';

const { TASK_ID, REPO_URL, PROMPT, CLAUDE_API_KEY, CALLBACK_URL } = process.env;
const claude = new Anthropic({ apiKey: CLAUDE_API_KEY });

// Clone repo
execSync(`git clone ${REPO_URL} /workspace`);
process.chdir('/workspace');

// Define tools
const tools = [
  {
    name: 'read_file',
    description: 'Read file contents',
    input_schema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] },
  },
  {
    name: 'write_file', 
    description: 'Write to file',
    input_schema: { type: 'object', properties: { path: { type: 'string' }, content: { type: 'string' } }, required: ['path', 'content'] },
  },
  {
    name: 'run_command',
    description: 'Run shell command',
    input_schema: { type: 'object', properties: { command: { type: 'string' } }, required: ['command'] },
  },
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

// Report progress
async function report(type: string, data: any) {
  await fetch(CALLBACK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskId: TASK_ID, type, data }),
  });
}

// Main agent loop
async function runAgent() {
  const messages: any[] = [{ role: 'user', content: PROMPT }];
  
  while (true) {
    const response = await claude.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      tools,
      messages,
    });
    
    // Report assistant response
    await report('message', { role: 'assistant', content: response.content });
    
    // Check if done
    if (response.stop_reason === 'end_turn') {
      await report('completed', { finalMessage: response.content });
      break;
    }
    
    // Execute tool calls
    if (response.stop_reason === 'tool_use') {
      const toolResults = [];
      
      for (const block of response.content) {
        if (block.type === 'tool_use') {
          await report('tool_call', { tool: block.name, input: block.input });
          
          try {
            const result = executeTool(block.name, block.input);
            toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: result });
            await report('tool_result', { tool: block.name, result });
          } catch (error) {
            toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: `Error: ${error.message}`, is_error: true });
          }
        }
      }
      
      messages.push({ role: 'assistant', content: response.content });
      messages.push({ role: 'user', content: toolResults });
    }
  }
}

runAgent().catch(async (error) => {
  await report('failed', { error: error.message });
  process.exit(1);
});
```

---

## Cost Comparison

| Approach | Monthly Cost (MVP) | Monthly Cost (1000 users) |
|----------|-------------------|---------------------------|
| **DIY on Fly.io** | $5-10 | $50-200 |
| **Trigger.dev + Supabase** | $0 (free tier) | $50-100 + usage |
| **Fly.io + Upstash + Neon** | $15-30 | $100-300 |

---

## Trade-offs Summary

| Factor | DIY (SQLite + Docker) | Managed (Trigger.dev + Supabase) |
|--------|----------------------|----------------------------------|
| **Complexity** | Lower initially | Lower long-term |
| **Control** | ✅ Full | ⚠️ Limited |
| **Scaling** | ⚠️ Manual | ✅ Automatic |
| **Vendor lock-in** | ✅ None | ❌ Yes |
| **Time to MVP** | 1-2 weeks | 3-5 days |
| **Maintenance** | ⚠️ On you | ✅ Managed |
| **Cost at scale** | ✅ Predictable | ⚠️ Can spike |
| **Debugging** | ✅ Full visibility | ⚠️ Black box |

---

## Recommendation

### For MVP / Learning: DIY

```
Single Fly.io server ($5/mo)
├── Node.js server
├── SQLite database
├── WebSocket for realtime
└── Docker for workers
```

**Why:**
- ~550 lines of code
- Full understanding of the system
- No vendor lock-in
- Can always add managed services later

### For Scale / Speed: Managed

If you want to move fast and have budget, Trigger.dev + Supabase gets you there faster.

---

## My Final Recommendation

**Start DIY, add complexity only when needed.**

```
Phase 1 (MVP): Single server + SQLite + Docker
Phase 2 (if needed): Add Redis for pub/sub
Phase 3 (if scaling): Move to managed workers
```

This approach:
1. Minimizes dependencies
2. Keeps you in control
3. Teaches you the problem space
4. Can evolve based on real needs

---

**Your call:**
- A) DIY (single server + SQLite + Docker)
- B) Managed (Trigger.dev + Supabase)
- C) Hybrid (DIY coordinator, managed workers)
