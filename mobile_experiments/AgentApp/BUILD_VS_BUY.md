# Build vs Buy Analysis

## The Core Question

Do we need Trigger.dev + Supabase, or can we build something simpler ourselves?

---

## What These Services Actually Provide

### Trigger.dev - What It Does

| Feature | Do We Need It? | DIY Difficulty |
|---------|----------------|----------------|
| Job queuing | ✅ Yes | Easy (Redis/BullMQ) |
| Retries with backoff | ✅ Yes | Easy |
| Long-running tasks | ✅ Yes | Medium |
| Real-time progress | ✅ Yes | Medium (WebSocket) |
| Dashboard/UI | ⚠️ Nice to have | Skip for MVP |
| Distributed workers | ❌ Overkill for v1 | — |
| Cron scheduling | ❌ Don't need | — |

**Verdict**: We can replace Trigger.dev with **BullMQ** (Redis-based queue) or even simpler.

### Supabase - What It Does

| Feature | Do We Need It? | DIY Difficulty |
|---------|----------------|----------------|
| PostgreSQL | ⚠️ Maybe | Easy (or use SQLite) |
| Auth (OAuth) | ✅ Yes | Medium |
| Realtime WebSocket | ✅ Yes | Medium |
| Row-level security | ❌ Overkill | — |
| Edge functions | ❌ Don't need | — |
| Storage | ⚠️ Maybe | Easy (local disk/S3) |

**Verdict**: We can replace Supabase with **SQLite + simple auth + WebSocket server**.

---

## Minimal Self-Hosted Architecture

### What We Actually Need

1. **A server** that runs 24/7 (coordinator)
2. **A way to spawn workers** (Docker or just child processes)
3. **A database** (SQLite is fine)
4. **WebSocket** for real-time updates
5. **GitHub OAuth** for auth
6. **Claude API** for the agent

### Simplest Possible Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SINGLE SERVER                             │
│                   (Fly.io $5/mo or VPS)                     │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Node.js / Python Server                 │    │
│  │                                                      │    │
│  │  • Express/FastAPI (HTTP + WebSocket)               │    │
│  │  • SQLite database (tasks, users, messages)         │    │
│  │  • GitHub OAuth (passport.js / authlib)             │    │
│  │  • Task queue (in-memory or simple Redis)           │    │
│  │  • Worker spawner (child_process / subprocess)      │    │
│  │                                                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                   │
│                          ▼                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Docker Container (Worker)               │    │
│  │                                                      │    │
│  │  • Clone repo from GitHub                           │    │
│  │  • Run Claude agent loop                            │    │
│  │  • Execute tools (file ops, shell, git)             │    │
│  │  • Push results back                                │    │
│  │                                                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              SQLite Database                         │    │
│  │                                                      │    │
│  │  • users (id, github_id, email, created_at)         │    │
│  │  • tasks (id, user_id, status, repo_url, prompt)    │    │
│  │  • messages (id, task_id, role, content, tool_calls)│    │
│  │                                                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack (Minimal)

| Component | Technology | Why |
|-----------|------------|-----|
| **Server** | Node.js + Express | Simple, good WebSocket support |
| **Database** | SQLite (better-sqlite3) | Zero config, fast, embedded |
| **Auth** | Passport.js + GitHub OAuth | Well-documented |
| **WebSocket** | ws or Socket.io | Built into Node ecosystem |
| **Task Queue** | Bull (Redis) or in-memory | Can start simple |
| **Workers** | Docker via dockerode | Spawn containers programmatically |
| **Claude API** | @anthropic-ai/sdk | Official SDK |

### Alternative: Python Stack

| Component | Technology |
|-----------|------------|
| **Server** | FastAPI |
| **Database** | SQLite (aiosqlite) |
| **Auth** | Authlib + GitHub OAuth |
| **WebSocket** | FastAPI WebSockets |
| **Task Queue** | Celery or in-memory |
| **Workers** | Docker via docker-py |
| **Claude API** | anthropic (Python SDK) |

---

## SQLite vs PostgreSQL

### Do We Need PostgreSQL?

| Factor | SQLite | PostgreSQL |
|--------|--------|------------|
| **Setup** | Zero config | Need server |
| **Concurrent writes** | Limited | Excellent |
| **Scale** | Single server | Multi-server |
| **Backups** | Copy file | pg_dump |
| **Cost** | $0 | $0-25/mo |

**For our use case:**
- Single coordinator server = SQLite is fine
- Expected load: 10s-100s of concurrent users = SQLite handles this
- Can migrate to PostgreSQL later if needed

### SQLite Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| Single writer | Low (most ops are reads) | WAL mode |
| No realtime triggers | None (we use WebSocket) | — |
| No stored procedures | None (logic in app) | — |
| Single server | Low (coordinator is one server) | Migrate later |

**Verdict**: Start with SQLite. It's production-ready for our scale.

---

## Revised Minimal Architecture

### Single Server (Coordinator + Workers)

For MVP, everything runs on one server:

```python
# Simplified architecture in Python/FastAPI

from fastapi import FastAPI, WebSocket
import sqlite3
import docker
import anthropic

app = FastAPI()
docker_client = docker.from_env()
claude = anthropic.Anthropic()

# SQLite database
db = sqlite3.connect("agent.db", check_same_thread=False)

# Active WebSocket connections
connections: dict[str, WebSocket] = {}

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await websocket.accept()
    connections[user_id] = websocket
    try:
        while True:
            data = await websocket.receive_json()
            if data["type"] == "start_task":
                task_id = create_task(user_id, data["repo_url"], data["prompt"])
                spawn_worker(task_id)
    finally:
        del connections[user_id]

def spawn_worker(task_id: str):
    """Spawn a Docker container to run the agent."""
    container = docker_client.containers.run(
        "agent-worker:latest",
        environment={
            "TASK_ID": task_id,
            "DATABASE_URL": "/data/agent.db",  # Mounted volume
            "ANTHROPIC_API_KEY": os.environ["ANTHROPIC_API_KEY"],
        },
        volumes={
            "/app/data": {"bind": "/data", "mode": "rw"},
        },
        detach=True,
        auto_remove=True,
    )
    return container.id

def notify_user(user_id: str, message: dict):
    """Send real-time update to user."""
    if user_id in connections:
        asyncio.create_task(connections[user_id].send_json(message))
```

### Cost Analysis

| Component | Self-Hosted | Trigger.dev + Supabase |
|-----------|-------------|------------------------|
| Compute | $5-20/mo (Fly.io/VPS) | $0-50/mo |
| Database | $0 (SQLite) | $0-25/mo |
| Redis | $0 (in-memory) or $0 (Upstash free) | Included |
| Auth | $0 (DIY) | Included |
| **Total** | **$5-20/mo** | **$0-75/mo** |

---

## Trade-offs Summary

### Self-Hosted (SQLite + Single Server)

| Pros | Cons |
|------|------|
| ✅ Full control | ❌ More code to write |
| ✅ Cheaper at scale | ❌ No fancy dashboard |
| ✅ No vendor lock-in | ❌ You handle scaling |
| ✅ Simpler to understand | ❌ You handle backups |
| ✅ Fewer moving parts | ❌ Single point of failure |

### Managed Services (Trigger.dev + Supabase)

| Pros | Cons |
|------|------|
| ✅ Faster to build | ❌ Vendor lock-in |
| ✅ Managed scaling | ❌ Cost at scale |
| ✅ Built-in dashboards | ❌ Less control |
| ✅ They handle ops | ❌ More moving parts |

---

## My Revised Recommendation

**Start with self-hosted minimal architecture:**

1. **Single Fly.io server** (~$5-10/mo)
   - Node.js or Python
   - SQLite database
   - WebSocket server
   - Docker for worker containers

2. **Upgrade path if needed:**
   - SQLite → PostgreSQL (if concurrent writes become issue)
   - Single server → Multiple (if load requires)
   - DIY queue → Redis/BullMQ (if reliability needed)

### Why This Is Better

1. **Fewer dependencies** = fewer things to break
2. **Cheaper** = $5/mo vs $50+/mo
3. **Faster to understand** = all code is ours
4. **Portable** = can run anywhere (AWS, GCP, VPS, home server)
5. **No vendor lock-in** = not dependent on Trigger.dev staying in business

---

## Decision Point

| Approach | Best For |
|----------|----------|
| **Self-hosted (SQLite)** | MVP, learning, control, cost-sensitive |
| **Managed (Trigger.dev + Supabase)** | Fast launch, team scaling, ops-averse |

**Your call**: Self-hosted minimal or managed services?
