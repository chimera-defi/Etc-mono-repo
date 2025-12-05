# Build vs Buy Analysis

## What Do These Services Actually Provide?

### Trigger.dev Breakdown

| Feature | Do We Need It? | DIY Difficulty |
|---------|----------------|----------------|
| Job queuing | ✅ Yes | Easy (Redis/BullMQ or even in-memory) |
| Retries with backoff | ✅ Yes | Easy (simple loop) |
| Long-running tasks | ✅ Yes | Easy (just run the process) |
| Real-time updates | ✅ Yes | Medium (WebSocket) |
| Dashboard UI | ⚠️ Nice to have | Medium |
| Multi-tenant isolation | ❌ Not for MVP | N/A |
| Distributed workers | ❌ Overkill for MVP | N/A |

**Verdict**: We're paying for features we don't need. The core is just "run a task, report progress."

### Supabase Breakdown

| Feature | Do We Need It? | DIY Difficulty |
|---------|----------------|----------------|
| PostgreSQL | ⚠️ Maybe | SQLite works fine |
| Auth (OAuth) | ✅ Yes | Medium (passport.js, lucia) |
| Realtime (WebSocket) | ✅ Yes | Easy (ws, socket.io) |
| Row-level security | ❌ Overkill | N/A |
| Edge functions | ❌ Don't need | N/A |
| Storage | ⚠️ Maybe | Filesystem or S3 |

**Verdict**: We're paying for a lot of PostgreSQL features we don't need.

---

## The Minimal Architecture

### What We Actually Need

1. **Task execution** - Run Claude API calls + tools
2. **State persistence** - Remember tasks, messages
3. **Real-time updates** - Push progress to mobile
4. **Auth** - Know who's who
5. **Code access** - Clone repos, push changes

### Can SQLite Handle This?

| Requirement | SQLite Capability |
|-------------|-------------------|
| Task storage | ✅ Perfect |
| Message history | ✅ Perfect |
| User accounts | ✅ Perfect |
| Concurrent writes | ⚠️ Limited (WAL mode helps) |
| Distributed access | ❌ No (single file) |

**SQLite works if**: Single server handles all tasks (no distributed workers).

---

## Minimal DIY Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     SINGLE SERVER                            │
│                  (Fly.io or any VPS)                         │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                 Node.js/Bun Server                   │    │
│  │                                                      │    │
│  │  ┌──────────────┐  ┌──────────────┐                 │    │
│  │  │  HTTP API    │  │  WebSocket   │                 │    │
│  │  │  /api/tasks  │  │  /ws         │                 │    │
│  │  └──────────────┘  └──────────────┘                 │    │
│  │                                                      │    │
│  │  ┌──────────────┐  ┌──────────────┐                 │    │
│  │  │ Task Runner  │  │  Claude API  │                 │    │
│  │  │ (in-process) │  │  Client      │                 │    │
│  │  └──────────────┘  └──────────────┘                 │    │
│  │                                                      │    │
│  │  ┌──────────────────────────────────────────────┐   │    │
│  │  │              SQLite Database                  │   │    │
│  │  │  • users     • tasks    • messages            │   │    │
│  │  └──────────────────────────────────────────────┘   │    │
│  │                                                      │    │
│  │  ┌──────────────────────────────────────────────┐   │    │
│  │  │              Filesystem                       │   │    │
│  │  │  • /workspaces/{task_id}/  (cloned repos)    │   │    │
│  │  └──────────────────────────────────────────────┘   │    │
│  │                                                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Component | Technology | Why |
|-----------|------------|-----|
| Runtime | **Bun** or Node.js | Fast, simple |
| HTTP Framework | **Hono** or Express | Lightweight |
| WebSocket | **ws** (native) | No dependencies |
| Database | **SQLite** (better-sqlite3) | Zero config |
| ORM | **Drizzle** | Type-safe, lightweight |
| Auth | **Lucia** or DIY JWT | Simple |
| Git | **simple-git** | npm package |

### What This Eliminates

| Third Party | Replaced By |
|-------------|-------------|
| Trigger.dev | In-process task runner |
| Supabase Postgres | SQLite file |
| Supabase Realtime | Native WebSocket |
| Supabase Auth | Lucia or JWT |
| Upstash Redis | In-memory Map + SQLite |
| Cloudflare R2 | Local filesystem |

---

## Cost Comparison

### Third-Party Stack (Trigger.dev + Supabase)

| Service | Free Tier | Paid |
|---------|-----------|------|
| Trigger.dev | 10k runs/mo | $50/mo |
| Supabase | 500MB, 50k MAU | $25/mo |
| Fly.io (still need compute) | 3 VMs | ~$10/mo |
| **Total** | Free for MVP | **~$85/mo** |

### DIY Stack (Single Server)

| Service | Free Tier | Paid |
|---------|-----------|------|
| Fly.io (1 VM) | Included | $5-15/mo |
| Domain | — | $12/yr |
| **Total** | Free for MVP | **~$15/mo** |

---

## Trade-offs

### DIY Advantages

| Advantage | Impact |
|-----------|--------|
| **Simpler** | One server, one codebase |
| **Cheaper** | $15/mo vs $85/mo |
| **No vendor lock-in** | Move anywhere |
| **Full control** | Debug everything |
| **Faster iteration** | No waiting for third-party features |

### DIY Disadvantages

| Disadvantage | Mitigation |
|--------------|------------|
| **Single point of failure** | Fly.io has auto-restart |
| **No auto-scaling** | Upgrade VM or add workers later |
| **Build auth yourself** | Lucia is simple |
| **No fancy dashboard** | Build simple admin page |
| **Concurrent task limit** | One task at a time, or simple queue |

---

## Scalability Path

Start simple, scale when needed:

### Phase 1: Single Server MVP
```
1 Fly.io VM → SQLite → handles ~10-50 concurrent users
```

### Phase 2: Add Workers (if needed)
```
1 Coordinator → N Workers (Fly Machines)
SQLite → PostgreSQL (when concurrent writes matter)
```

### Phase 3: Full Scale (if needed)
```
Multiple regions, load balancing, Redis, etc.
(Only if you have thousands of users)
```

---

## Recommended DIY Stack

### Server

```typescript
// server.ts (Bun + Hono + WebSocket)
import { Hono } from 'hono';
import { serve } from 'bun';
import { Database } from 'bun:sqlite';

const app = new Hono();
const db = new Database('agent.db');

// Simple task queue (in-memory)
const taskQueue: Map<string, Task> = new Map();
const wsClients: Map<string, WebSocket> = new Map();

// REST API
app.post('/api/tasks', async (c) => {
  const { repoUrl, prompt } = await c.req.json();
  const taskId = crypto.randomUUID();
  
  // Save to SQLite
  db.run('INSERT INTO tasks (id, repo_url, prompt, status) VALUES (?, ?, ?, ?)', 
    [taskId, repoUrl, prompt, 'pending']);
  
  // Start task in background
  runTask(taskId, repoUrl, prompt);
  
  return c.json({ taskId });
});

// WebSocket for real-time updates
Bun.serve({
  port: 3000,
  fetch: app.fetch,
  websocket: {
    open(ws) {
      const userId = ws.data.userId;
      wsClients.set(userId, ws);
    },
    close(ws) {
      wsClients.delete(ws.data.userId);
    },
  },
});
```

### Database Schema

```sql
-- schema.sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  github_id TEXT UNIQUE,
  github_token TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  repo_url TEXT,
  prompt TEXT,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME
);

CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  task_id TEXT REFERENCES tasks(id),
  role TEXT, -- 'user', 'assistant', 'tool'
  content TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tool_calls (
  id TEXT PRIMARY KEY,
  task_id TEXT REFERENCES tasks(id),
  tool_name TEXT,
  input TEXT,
  output TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Task Runner

```typescript
// taskRunner.ts
async function runTask(taskId: string, repoUrl: string, prompt: string) {
  const workDir = `/tmp/workspaces/${taskId}`;
  
  // Clone repo
  await $`git clone --depth 1 ${repoUrl} ${workDir}`;
  broadcast(taskId, { type: 'status', status: 'cloned' });
  
  // Run agent loop
  const messages = [{ role: 'user', content: prompt }];
  
  while (true) {
    const response = await claude.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      tools: TOOLS,
      messages,
    });
    
    // Stream to client
    broadcast(taskId, { type: 'message', content: response });
    
    // Check for tool calls
    const toolUse = response.content.find(c => c.type === 'tool_use');
    if (!toolUse) break; // Done
    
    // Execute tool
    const result = await executeTool(toolUse, workDir);
    messages.push({ role: 'tool', content: result });
    
    broadcast(taskId, { type: 'tool_result', result });
  }
  
  // Push changes
  await $`cd ${workDir} && git push`;
  broadcast(taskId, { type: 'complete' });
  
  // Cleanup
  await $`rm -rf ${workDir}`;
}
```

---

## Final Recommendation

### For MVP: DIY Single Server

| Component | Choice |
|-----------|--------|
| **Hosting** | Fly.io (1 VM, $5-15/mo) |
| **Runtime** | Bun |
| **Framework** | Hono |
| **Database** | SQLite |
| **WebSocket** | Native Bun WebSocket |
| **Auth** | GitHub OAuth (manual) |
| **Git** | simple-git or shell |

### What You Get

- ✅ Full control
- ✅ ~$15/mo hosting
- ✅ No vendor lock-in
- ✅ Simple codebase (~500-1000 lines)
- ✅ Easy to debug
- ✅ Can scale later if needed

### What You Give Up

- ❌ No auto-scaling (upgrade VM manually)
- ❌ No fancy dashboards (build your own)
- ❌ Build auth yourself (but Lucia is simple)
- ❌ Single point of failure (Fly auto-restarts)

---

## Conclusion

**Yes, SQLite + single server is enough for MVP.**

Third-party services like Trigger.dev and Supabase are great, but they solve problems we don't have yet:
- Distributed workers (we have one server)
- Multi-tenant isolation (we trust our users for now)
- Complex auth rules (we just need GitHub OAuth)

Start simple. Add complexity when you actually need it.
