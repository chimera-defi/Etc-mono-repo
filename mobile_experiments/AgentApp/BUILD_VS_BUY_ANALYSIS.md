# Build vs Buy Analysis

The question: Do we really need Trigger.dev, Supabase, and other managed services, or can we build something simpler ourselves?

---

## What We Actually Need

Let's strip this down to core requirements:

| Requirement | What It Means | Complexity |
|-------------|---------------|------------|
| Task Queue | Accept task from mobile, put in queue | Low |
| Worker Spawning | Start a container when task arrives | Medium |
| Agent Execution | Run Claude API + tools in container | Low (we build this) |
| State Persistence | Store task history, user data | Low |
| Real-time Updates | Push progress to mobile | Medium |
| Auth | Know who the user is | Low-Medium |

---

## What Trigger.dev Gives Us (vs Building)

| Feature | Trigger.dev | Build Ourselves |
|---------|-------------|-----------------|
| Task queuing | ✅ Built-in | Simple: Redis LPUSH/BRPOP or PostgreSQL |
| Retries | ✅ Automatic | Easy: retry counter in DB |
| Timeouts | ✅ Built-in | Easy: setTimeout + cleanup |
| Real-time updates | ✅ Built-in | Medium: WebSocket server |
| Ephemeral workers | ✅ Managed | Medium: Docker API or Fly Machines |
| Dashboard | ✅ Nice UI | Skip for MVP |
| Logging | ✅ Built-in | Easy: write to file/stdout |

**Verdict**: Trigger.dev is nice but not essential. The core features can be built in a few days.

---

## What Supabase Gives Us (vs Building)

| Feature | Supabase | Build Ourselves |
|---------|----------|-----------------|
| PostgreSQL | ✅ Managed | **SQLite works fine** for single-node |
| Auth | ✅ OAuth built-in | Medium: passport.js or similar |
| Realtime | ✅ WebSocket channels | Medium: ws library + pub/sub |
| Storage | ✅ S3-compatible | Easy: local filesystem or S3 |
| Edge Functions | ✅ Serverless | Not needed |
| Row-level security | ✅ Built-in | Not needed for MVP |

**Verdict**: Supabase is overkill. SQLite + simple WebSocket server is sufficient.

---

## The Minimal Self-Hosted Stack

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SINGLE SERVER                             │
│                    (Fly.io / Railway / VPS)                  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Node.js / Python Server                              │   │
│  │                                                       │   │
│  │  • HTTP API (accept tasks)                            │   │
│  │  • WebSocket server (real-time updates)               │   │
│  │  • Task queue (in-memory or SQLite)                   │   │
│  │  • Docker spawner (docker run)                        │   │
│  │                                                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                          │                                   │
│                          ▼                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  SQLite Database                                      │   │
│  │                                                       │   │
│  │  • users (id, github_id, api_key_hash)               │   │
│  │  • tasks (id, user_id, status, created_at)           │   │
│  │  • messages (id, task_id, role, content)             │   │
│  │                                                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                          │                                   │
│                          ▼                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Docker (on same server)                              │   │
│  │                                                       │   │
│  │  • Agent container (ephemeral)                        │   │
│  │  • Clones repo, runs Claude, executes tools           │   │
│  │  • Communicates via stdout/files                      │   │
│  │                                                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Components

| Component | Technology | Lines of Code |
|-----------|------------|---------------|
| HTTP Server | Express.js or FastAPI | ~200 |
| WebSocket | ws (Node) or websockets (Python) | ~100 |
| Task Queue | SQLite table + polling | ~50 |
| Docker Spawner | dockerode (Node) or docker-py | ~100 |
| Auth | GitHub OAuth (simple) | ~100 |
| **Total** | — | **~550 lines** |

---

## SQLite vs PostgreSQL

| Factor | SQLite | PostgreSQL |
|--------|--------|------------|
| **Setup** | Zero (file) | Needs server |
| **Performance** | 100k+ writes/sec | Similar |
| **Concurrent writes** | ⚠️ Single writer | ✅ Multiple |
| **Backup** | Copy file | pg_dump |
| **Scaling** | Single server | Horizontal |
| **Our scale** | ✅ Plenty | Overkill |

**For MVP with 1-100 users**: SQLite is perfect.
**For 1000+ concurrent users**: Consider PostgreSQL later.

### SQLite with WAL Mode

```sql
-- Enable WAL for better concurrent reads
PRAGMA journal_mode=WAL;
PRAGMA busy_timeout=5000;

-- Schema
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    github_id TEXT UNIQUE,
    github_token_encrypted TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    repo_url TEXT,
    prompt TEXT,
    status TEXT DEFAULT 'pending',  -- pending, running, completed, failed
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME
);

CREATE TABLE messages (
    id TEXT PRIMARY KEY,
    task_id TEXT REFERENCES tasks(id),
    role TEXT,  -- user, assistant, tool_call, tool_result
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_user ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_messages_task ON messages(task_id);
```

---

## Real-time Updates Without Supabase

### Simple WebSocket Server

```typescript
// server/websocket.ts
import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({ port: 8080 });
const clients = new Map<string, WebSocket>(); // taskId -> WebSocket

export function registerClient(taskId: string, ws: WebSocket) {
  clients.set(taskId, ws);
  ws.on('close', () => clients.delete(taskId));
}

export function sendUpdate(taskId: string, update: any) {
  const ws = clients.get(taskId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(update));
  }
}
```

### Worker Sends Updates

```typescript
// In the Docker container, write to a file that the server watches
// Or use a simple HTTP callback

import fs from 'fs';

function sendProgress(taskId: string, message: string) {
  // Option 1: Write to mounted volume
  fs.appendFileSync(`/output/${taskId}.log`, JSON.stringify({
    type: 'progress',
    message,
    timestamp: Date.now()
  }) + '\n');
  
  // Option 2: HTTP callback to coordinator
  fetch(`http://coordinator:3000/tasks/${taskId}/progress`, {
    method: 'POST',
    body: JSON.stringify({ message })
  });
}
```

---

## Task Queue Without Trigger.dev

### Simple SQLite-based Queue

```typescript
// server/queue.ts
import Database from 'better-sqlite3';

const db = new Database('agent.db');

export function enqueueTask(userId: string, repoUrl: string, prompt: string): string {
  const taskId = crypto.randomUUID();
  db.prepare(`
    INSERT INTO tasks (id, user_id, repo_url, prompt, status)
    VALUES (?, ?, ?, ?, 'pending')
  `).run(taskId, userId, repoUrl, prompt);
  return taskId;
}

export function claimNextTask(): Task | null {
  const task = db.prepare(`
    UPDATE tasks 
    SET status = 'running'
    WHERE id = (
      SELECT id FROM tasks 
      WHERE status = 'pending' 
      ORDER BY created_at 
      LIMIT 1
    )
    RETURNING *
  `).get();
  return task;
}

export function completeTask(taskId: string, result: string) {
  db.prepare(`
    UPDATE tasks 
    SET status = 'completed', completed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(taskId);
}
```

### Worker Loop

```typescript
// server/worker.ts
import { spawn } from 'child_process';

async function workerLoop() {
  while (true) {
    const task = claimNextTask();
    
    if (task) {
      console.log(`Processing task ${task.id}`);
      await runAgentContainer(task);
    } else {
      // No tasks, wait a bit
      await sleep(1000);
    }
  }
}

async function runAgentContainer(task: Task) {
  return new Promise((resolve, reject) => {
    const container = spawn('docker', [
      'run', '--rm',
      '-e', `TASK_ID=${task.id}`,
      '-e', `REPO_URL=${task.repo_url}`,
      '-e', `PROMPT=${task.prompt}`,
      '-e', `CLAUDE_API_KEY=${process.env.CLAUDE_API_KEY}`,
      '-v', `${process.cwd()}/output:/output`,
      'agent-worker:latest'
    ]);
    
    container.stdout.on('data', (data) => {
      sendUpdate(task.id, { type: 'log', data: data.toString() });
    });
    
    container.on('close', (code) => {
      if (code === 0) {
        completeTask(task.id, 'success');
        resolve(true);
      } else {
        failTask(task.id, `Exit code ${code}`);
        reject(new Error(`Container exited with ${code}`));
      }
    });
  });
}
```

---

## Docker Worker Spawning Without Managed Services

### Using Docker Directly

```typescript
// server/docker.ts
import Docker from 'dockerode';

const docker = new Docker();

export async function spawnWorker(task: Task): Promise<void> {
  const container = await docker.createContainer({
    Image: 'agent-worker:latest',
    Env: [
      `TASK_ID=${task.id}`,
      `REPO_URL=${task.repo_url}`,
      `PROMPT=${task.prompt}`,
      `CLAUDE_API_KEY=${process.env.CLAUDE_API_KEY}`,
    ],
    HostConfig: {
      AutoRemove: true,  // Clean up after exit
      Memory: 2 * 1024 * 1024 * 1024,  // 2GB limit
      CpuPeriod: 100000,
      CpuQuota: 100000,  // 1 CPU
      NetworkMode: 'bridge',
    },
    Binds: [
      `${process.cwd()}/output/${task.id}:/output`,
    ],
  });
  
  await container.start();
  
  // Stream logs to WebSocket
  const stream = await container.logs({
    follow: true,
    stdout: true,
    stderr: true,
  });
  
  stream.on('data', (chunk) => {
    sendUpdate(task.id, { type: 'log', data: chunk.toString() });
  });
}
```

---

## Cost Comparison

### Managed Services (Trigger.dev + Supabase)

| Service | Cost |
|---------|------|
| Trigger.dev | $0 free tier → $29/mo |
| Supabase | $0 free tier → $25/mo |
| **Total** | **$0-54/mo** |

### Self-Hosted on Single VPS

| Service | Cost |
|---------|------|
| Fly.io (shared-cpu-1x, 256MB) | ~$2/mo |
| Or: Hetzner VPS (CX22) | €4.50/mo |
| Or: DigitalOcean Droplet | $6/mo |
| **Total** | **$2-6/mo** |

### Self-Hosted with Scaling

| Service | Cost |
|---------|------|
| Fly.io (coordinator) | ~$5/mo |
| Fly.io (workers, on-demand) | ~$0.00004/s when running |
| SQLite (on disk) | $0 |
| **Total** | **$5/mo + usage** |

---

## Recommendation: Start Simple

### Phase 1: Single Server MVP

```
┌─────────────────────────────────────────┐
│  Single Fly.io / Railway / VPS          │
│                                          │
│  • Node.js server                        │
│  • SQLite database                       │
│  • Docker for agent containers           │
│  • WebSocket for real-time               │
│                                          │
│  Cost: $5-10/mo                          │
└─────────────────────────────────────────┘
```

**When to upgrade**:
- Need concurrent task execution → Add worker processes
- Need horizontal scaling → Move to Fly Machines
- Need more durability → Add PostgreSQL

### Phase 2: Scaled Architecture (Only If Needed)

```
┌─────────────────────────────────────────┐
│  Fly.io Coordinator                      │
│  • API + WebSocket                       │
│  • Task queue in PostgreSQL              │
└─────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│  Fly Machines (ephemeral)               │
│  • Spawned per task                      │
│  • Auto-destroyed                        │
└─────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│  Managed PostgreSQL (Neon/Supabase)     │
│  • Only if SQLite becomes bottleneck    │
└─────────────────────────────────────────┘
```

---

## Final Verdict

| Approach | Complexity | Cost | Control | Recommendation |
|----------|------------|------|---------|----------------|
| **Trigger.dev + Supabase** | Low | $0-54/mo | Low | Good for rapid prototyping |
| **Self-hosted single server** | Medium | $5-10/mo | High | **Best for MVP** |
| **Self-hosted + Fly Machines** | Medium-High | $5+usage | High | Good for scaling |

### My Updated Recommendation

**Start with a single self-hosted server**:

1. **Server**: Fly.io or Railway ($5-10/mo)
2. **Database**: SQLite (free, simple)
3. **Queue**: SQLite table with polling
4. **Real-time**: Simple WebSocket server
5. **Workers**: Docker on same server (1-2 concurrent)
6. **Auth**: GitHub OAuth (simple)

**Total: ~550 lines of code, $5-10/mo, full control**

Upgrade to managed services later **only if needed**.

---

**Your call**: 
- A) Self-hosted single server (simplest, cheapest, full control)
- B) Self-hosted + Fly Machines (scales better)
- C) Managed services (fastest to build, less control)
