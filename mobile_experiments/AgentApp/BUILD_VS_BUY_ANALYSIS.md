# Build vs Buy Analysis: Do We Need Managed Services?

## The Question

Do we really need Trigger.dev, Supabase, etc., or can we build this with:
- A simple server (Node.js/Python)
- Docker for workers
- SQLite for persistence
- WebSockets for real-time

---

## What We Actually Need

Let's break down the core requirements:

| Requirement | What It Does | Complexity |
|-------------|--------------|------------|
| **API Server** | Receive requests from mobile | Low |
| **WebSocket** | Push real-time updates | Low-Medium |
| **Task Queue** | Queue tasks, track progress | Medium |
| **Worker Spawning** | Start Docker containers | Medium |
| **Database** | Store tasks, history, users | Low |
| **Auth** | Verify mobile users | Low-Medium |
| **File Storage** | Store logs, artifacts | Low |

---

## Option 1: Minimal Self-Hosted

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SINGLE VPS ($5-20/mo)                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Node.js/Python Server                                │   │
│  │  ─────────────────────────────────────────────────── │   │
│  │  • Express/FastAPI for REST API                       │   │
│  │  • WebSocket server (ws/socket.io)                    │   │
│  │  • Task queue (in-memory or SQLite-backed)            │   │
│  │  • Docker SDK to spawn workers                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                  │
│                           ▼                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  SQLite Database                                      │   │
│  │  ─────────────────────────────────────────────────── │   │
│  │  • users, tasks, messages, settings                   │   │
│  │  • Single file, no separate service                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                  │
│                           ▼                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Docker Containers (Workers)                          │   │
│  │  ─────────────────────────────────────────────────── │   │
│  │  • Spawned per task                                   │   │
│  │  • Run Claude API + tools                             │   │
│  │  • Communicate via stdout/files/HTTP                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Local Filesystem                                     │   │
│  │  ─────────────────────────────────────────────────── │   │
│  │  • /data/logs/                                        │   │
│  │  • /data/artifacts/                                   │   │
│  │  • /data/repos/ (cloned repos)                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Component | Technology | Why |
|-----------|------------|-----|
| Server | **Bun** or Node.js | Fast, built-in SQLite bindings |
| Web Framework | **Hono** or Express | Lightweight, fast |
| WebSocket | **ws** or Bun's native | Simple, no dependencies |
| Database | **SQLite** (via better-sqlite3 or Bun) | Zero config, fast, reliable |
| Task Queue | **BullMQ** or custom SQLite-backed | Can use SQLite as queue |
| Docker | **dockerode** (Node.js Docker SDK) | Spawn containers programmatically |
| Auth | **JWT** + simple password/OAuth | Keep it simple |

### Code Complexity Estimate

| Component | Lines of Code | Effort |
|-----------|---------------|--------|
| API routes | ~200 | 1 day |
| WebSocket handler | ~100 | 0.5 day |
| Task queue | ~150 | 1 day |
| Docker spawner | ~100 | 0.5 day |
| Worker image | ~200 | 1 day |
| Database schema | ~50 | 0.5 day |
| Auth | ~100 | 0.5 day |
| **Total** | **~900 lines** | **~5 days** |

### Pros & Cons

| Pros | Cons |
|------|------|
| ✅ Full control | ❌ Must build everything |
| ✅ No vendor lock-in | ❌ Must handle scaling |
| ✅ Cheap ($5-20/mo VPS) | ❌ Must handle reliability |
| ✅ Simple to understand | ❌ Single point of failure |
| ✅ Fast (no network hops) | ❌ Limited to one server |
| ✅ SQLite is surprisingly powerful | ❌ Manual backups needed |

---

## Option 2: Managed Services (Trigger.dev + Supabase)

### What You Get

| Service | What It Provides | Do We Need It? |
|---------|------------------|----------------|
| **Trigger.dev** | | |
| - Task queuing | Job queue with retries | ⚠️ Nice but buildable |
| - Long-running tasks | Handles timeouts | ⚠️ Nice but buildable |
| - Observability | Logs, traces, metrics | ⚠️ Nice to have |
| - Scaling | Auto-scales workers | ❌ Not needed for MVP |
| **Supabase** | | |
| - PostgreSQL | Managed database | ⚠️ SQLite works fine |
| - Realtime | WebSocket infrastructure | ⚠️ Can build with ws |
| - Auth | OAuth, magic links | ⚠️ Can use simple JWT |
| - Storage | S3-compatible | ❌ Local filesystem works |
| - Edge Functions | Serverless compute | ❌ Not needed |

### Honest Assessment

Most of what these services provide is:
1. **Operational convenience** (managed infrastructure)
2. **Scale** (which we don't need for MVP)
3. **Features we won't use** (edge functions, branching, etc.)

---

## Option 3: Hybrid (Self-hosted + Minimal Services)

### Use Managed Only Where It Matters

| Component | Self-Hosted | Managed | Reasoning |
|-----------|-------------|---------|-----------|
| Server | ✅ Bun/Node | | Full control |
| WebSocket | ✅ ws | | Simple enough |
| Database | ✅ SQLite | | No overhead |
| Auth | | ✅ Clerk/Auth0 | OAuth is complex |
| Workers | ✅ Docker | | Full control |
| File Storage | ✅ Local | | Simple |
| Backups | | ✅ Litestream → S3 | SQLite backup to cloud |

**Why Litestream?** It streams SQLite changes to S3/R2, giving you:
- Continuous backups
- Point-in-time recovery
- No database server needed

---

## SQLite: Can It Handle This?

### SQLite Performance Facts

| Metric | SQLite | Notes |
|--------|--------|-------|
| Writes/sec | ~50,000 | WAL mode |
| Reads/sec | ~500,000 | Depends on queries |
| Concurrent readers | Unlimited | |
| Concurrent writers | 1 (serialized) | Usually fine |
| Max database size | 281 TB | Not a concern |
| Used by | Airbnb, Expensify, Fly.io | Production-ready |

### For Our Use Case

| Operation | Frequency | SQLite OK? |
|-----------|-----------|------------|
| Create task | 10-100/hour | ✅ Easy |
| Update task progress | 100-1000/hour | ✅ Easy |
| Read task history | On-demand | ✅ Easy |
| WebSocket connections | 10-100 concurrent | ✅ Easy |

**Verdict**: SQLite can easily handle 1000s of users for this use case.

---

## Revised Architecture: Minimal Self-Hosted

```
┌──────────────────────────────────────────────────────────────┐
│                        VPS (Hetzner/DigitalOcean)            │
│                        $6-20/month                            │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│   ┌─────────────────────────────────────────────────────┐    │
│   │                    Bun Server                        │    │
│   │  ┌────────────┐ ┌────────────┐ ┌────────────────┐   │    │
│   │  │ REST API   │ │ WebSocket  │ │ Task Scheduler │   │    │
│   │  │ (Hono)     │ │ (native)   │ │ (SQLite-based) │   │    │
│   │  └────────────┘ └────────────┘ └────────────────┘   │    │
│   └─────────────────────────────────────────────────────┘    │
│                              │                                │
│              ┌───────────────┼───────────────┐               │
│              ▼               ▼               ▼               │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│   │   SQLite     │  │   Docker     │  │  Filesystem  │      │
│   │   + Litestream│  │   Workers    │  │  /data/      │      │
│   │   → S3/R2    │  │              │  │              │      │
│   └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    Cloudflare (Free)                          │
│  • DNS                                                        │
│  • DDoS protection                                            │
│  • SSL termination                                            │
│  • R2 for Litestream backups ($0 egress)                     │
└──────────────────────────────────────────────────────────────┘
```

### Cost Breakdown

| Service | Monthly Cost |
|---------|--------------|
| Hetzner VPS (CX22) | €4.35 (~$5) |
| Cloudflare (Free) | $0 |
| R2 Storage (10GB) | $0 (free tier) |
| Domain | ~$1 |
| **Total** | **~$6/month** |

vs. Managed services:
- Supabase Pro: $25/mo
- Trigger.dev: $0-50/mo
- Total: $25-75/mo

---

## What We Give Up (Self-Hosted)

| Feature | Impact | Mitigation |
|---------|--------|------------|
| Auto-scaling | Can't handle viral growth | Scale up VPS, or add workers later |
| High availability | Single point of failure | Litestream backups, quick recovery |
| OAuth complexity | Need to implement | Use Clerk ($0-25/mo) if needed |
| Observability | Less visibility | Add Sentry (free tier) |
| Multi-region | Higher latency for distant users | Start single region |

---

## Recommendation

### For MVP: Minimal Self-Hosted

**Build it ourselves with:**
1. **Bun** - Fast runtime with built-in SQLite
2. **Hono** - Lightweight web framework
3. **SQLite + Litestream** - Database with cloud backup
4. **Docker** - Worker containers
5. **Cloudflare** - Free CDN/SSL/R2

**Why:**
- ~$6/month vs $50+/month
- Full control over agent behavior
- No vendor lock-in
- Simple to debug and modify
- Can always add services later if needed

### When to Upgrade

Add managed services when:
- You have >1000 active users
- You need multi-region
- You want to focus on features, not infrastructure
- You can afford $50+/month

---

## Implementation Plan

### Phase 1: Core Server (2-3 days)

```typescript
// server.ts - The entire coordinator
import { Hono } from 'hono';
import { Database } from 'bun:sqlite';
import { spawn } from 'child_process';

const app = new Hono();
const db = new Database('agent.db');

// Initialize schema
db.run(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    repo_url TEXT,
    prompt TEXT,
    status TEXT DEFAULT 'pending',
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
  )
`);

// WebSocket connections
const connections = new Map<string, WebSocket>();

// Create task
app.post('/tasks', async (c) => {
  const { repo_url, prompt } = await c.req.json();
  const id = crypto.randomUUID();
  
  db.run(
    'INSERT INTO tasks (id, repo_url, prompt) VALUES (?, ?, ?)',
    [id, repo_url, prompt]
  );
  
  // Spawn worker
  spawnWorker(id, repo_url, prompt);
  
  return c.json({ id });
});

// WebSocket for real-time updates
app.get('/ws', (c) => {
  // Handle upgrade to WebSocket
  // Store connection, send updates
});

function spawnWorker(taskId: string, repoUrl: string, prompt: string) {
  // Spawn Docker container
  const worker = spawn('docker', [
    'run', '--rm',
    '-e', `TASK_ID=${taskId}`,
    '-e', `REPO_URL=${repoUrl}`,
    '-e', `PROMPT=${prompt}`,
    '-e', `CALLBACK_URL=http://host.docker.internal:3000/worker-callback`,
    'agent-worker:latest'
  ]);
  
  worker.stdout.on('data', (data) => {
    // Forward to WebSocket
    broadcastToTask(taskId, data.toString());
  });
}

export default app;
```

### Phase 2: Worker Image (1-2 days)

```dockerfile
# Dockerfile.worker
FROM node:20-slim

# Install git, common tools
RUN apt-get update && apt-get install -y git curl

WORKDIR /workspace

COPY worker/ /app/
RUN cd /app && npm install

CMD ["node", "/app/index.js"]
```

```typescript
// worker/index.ts
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();
const taskId = process.env.TASK_ID;
const repoUrl = process.env.REPO_URL;
const prompt = process.env.PROMPT;
const callbackUrl = process.env.CALLBACK_URL;

// Clone repo
await $`git clone --depth 1 ${repoUrl} /workspace/repo`;

// Run agent loop
const tools = [
  { name: 'read_file', /* ... */ },
  { name: 'write_file', /* ... */ },
  { name: 'run_command', /* ... */ },
];

async function runAgent() {
  const messages = [{ role: 'user', content: prompt }];
  
  while (true) {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      tools,
      messages,
    });
    
    // Send progress update
    await fetch(callbackUrl, {
      method: 'POST',
      body: JSON.stringify({ taskId, update: response }),
    });
    
    // Handle tool calls or finish
    if (response.stop_reason === 'end_turn') break;
    
    // Execute tools, add results to messages
    // ...
  }
}

runAgent();
```

### Phase 3: Mobile Integration (1-2 days)

- Connect React Native app to WebSocket
- Display streaming updates
- Show task history

---

## Summary

| Approach | Cost | Complexity | Control | Recommended For |
|----------|------|------------|---------|-----------------|
| **Self-hosted (SQLite)** | $6/mo | Medium | Full | MVP, learning |
| **Managed (Trigger+Supa)** | $50+/mo | Low | Limited | Scale, teams |
| **Hybrid** | $10-30/mo | Medium | Good | Growing product |

**My recommendation: Start with self-hosted.** 

It's cheap, educational, and you can always migrate to managed services when you have revenue or need scale.

---

**Your call:**
- A) Minimal self-hosted (SQLite + Bun + Docker)
- B) Managed services (Trigger.dev + Supabase)
- C) Hybrid (self-hosted + Clerk for auth)
