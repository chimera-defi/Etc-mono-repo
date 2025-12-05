# Build vs Buy Analysis: Do We Really Need Third-Party Services?

## The Core Question

What's the **minimum viable infrastructure** for a mobile-triggered AI coding agent?

---

## What We Actually Need

Let's strip it down to essentials:

| Need | Description | Really Required? |
|------|-------------|------------------|
| Run Claude API | Call Anthropic's API | ✅ Yes |
| Execute code | Run shell commands, read/write files | ✅ Yes |
| Clone repos | Git clone from GitHub | ✅ Yes |
| Store task history | Remember past tasks | ✅ Yes |
| Real-time updates | Show progress to mobile | ✅ Yes |
| Authentication | Know who the user is | ✅ Yes |

That's it. Everything else is optimization.

---

## Option D: Minimal Self-Hosted (Single VPS)

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SINGLE VPS ($5-20/mo)                     │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Node.js / Python Server                             │    │
│  │                                                      │    │
│  │  • WebSocket endpoint (mobile connects here)         │    │
│  │  • REST API (task submission)                        │    │
│  │  • Agent orchestration loop                          │    │
│  │  • Claude API calls                                  │    │
│  │  • Git operations                                    │    │
│  │  • Shell execution (sandboxed)                       │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                   │
│                          ▼                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  SQLite Database                                     │    │
│  │                                                      │    │
│  │  • users (id, github_token, settings)                │    │
│  │  • tasks (id, user_id, status, created_at)           │    │
│  │  • messages (id, task_id, role, content)             │    │
│  │  • tool_calls (id, task_id, tool, input, output)     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Local Filesystem                                    │    │
│  │                                                      │    │
│  │  /workspace/{user_id}/{repo_name}/  ← cloned repos   │    │
│  │  /logs/{task_id}.log                ← task logs      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### What This Gives Us

| Feature | How It Works |
|---------|--------------|
| **Real-time updates** | WebSocket from server to mobile |
| **Task persistence** | SQLite database |
| **Code execution** | Direct shell access (sandboxed with Docker) |
| **Git operations** | `git` CLI on the server |
| **Authentication** | GitHub OAuth → store token in SQLite |

### What We DON'T Need Third Parties For

| Trigger.dev Feature | Our Alternative |
|---------------------|-----------------|
| Job queuing | Simple in-memory queue or SQLite table |
| Retries | Try/catch + retry loop |
| Long-running tasks | Just... run them (no 15min limit) |
| Real-time updates | WebSocket (built-in to Node/Python) |

| Supabase Feature | Our Alternative |
|------------------|-----------------|
| PostgreSQL | SQLite (simpler, no network) |
| Realtime | WebSocket (we control it) |
| Auth | GitHub OAuth (one provider is enough) |
| Storage | Local filesystem |

### Cost Comparison

| Approach | Monthly Cost | Notes |
|----------|--------------|-------|
| **Single VPS** | $5-20/mo | DigitalOcean, Hetzner, Fly.io |
| Trigger.dev + Supabase | $0-50/mo | Free tiers, then jumps |
| Fly.io stack | $10-30/mo | Multiple services |

---

## Trade-offs Analysis

### Single VPS Advantages

| Advantage | Why It Matters |
|-----------|----------------|
| **Simplicity** | One thing to deploy, monitor, debug |
| **Cost** | Flat $5-20/mo regardless of usage |
| **Control** | We own everything, no vendor lock-in |
| **Latency** | No network hops between services |
| **Privacy** | All data stays on our server |

### Single VPS Disadvantages

| Disadvantage | Mitigation |
|--------------|------------|
| **Scaling** | Start with one VPS, scale later if needed |
| **Reliability** | Daily backups of SQLite, health checks |
| **Security** | Docker sandboxing for code execution |
| **Concurrent users** | One agent per user at a time (acceptable for MVP) |

---

## Minimal Tech Stack

### Server (Python - fewer dependencies)

```python
# main.py - The entire backend
from fastapi import FastAPI, WebSocket
from anthropic import Anthropic
import sqlite3
import subprocess
import os

app = FastAPI()
client = Anthropic()

# SQLite setup
def get_db():
    conn = sqlite3.connect('agent.db')
    conn.row_factory = sqlite3.Row
    return conn

# WebSocket for real-time updates
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await websocket.accept()
    # Handle messages...

# Start a task
@app.post("/tasks")
async def create_task(repo_url: str, prompt: str, user_id: str):
    # Clone repo, run agent, return task_id
    pass

# Agent loop
async def run_agent(task_id: str, repo_path: str, prompt: str, ws: WebSocket):
    messages = [{"role": "user", "content": prompt}]
    
    while True:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=8192,
            tools=TOOLS,
            messages=messages
        )
        
        # Stream to WebSocket
        await ws.send_json({"type": "message", "content": response.content})
        
        # Handle tool calls
        if response.stop_reason == "tool_use":
            for block in response.content:
                if block.type == "tool_use":
                    result = execute_tool(block.name, block.input, repo_path)
                    messages.append({"role": "assistant", "content": response.content})
                    messages.append({"role": "user", "content": [{"type": "tool_result", ...}]})
        else:
            break  # Done

# Tool execution (sandboxed)
def execute_tool(name: str, input: dict, repo_path: str) -> str:
    if name == "read_file":
        with open(os.path.join(repo_path, input["path"])) as f:
            return f.read()
    elif name == "write_file":
        with open(os.path.join(repo_path, input["path"]), "w") as f:
            f.write(input["content"])
        return "OK"
    elif name == "run_command":
        result = subprocess.run(
            input["command"],
            shell=True,
            cwd=repo_path,
            capture_output=True,
            timeout=60
        )
        return result.stdout.decode()
```

### Database Schema (SQLite)

```sql
-- schema.sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    github_token TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    repo_url TEXT,
    prompt TEXT,
    status TEXT DEFAULT 'pending',  -- pending, running, completed, failed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id TEXT REFERENCES tasks(id),
    role TEXT,  -- user, assistant
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tool_calls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id TEXT REFERENCES tasks(id),
    tool_name TEXT,
    input TEXT,
    output TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## When Would We Need More?

| Scenario | Solution |
|----------|----------|
| >10 concurrent users | Add more VPS or move to Fly.io Machines |
| Need GPU | Use Modal or Replicate for those specific tasks |
| Team collaboration | Add PostgreSQL for multi-server state |
| 99.9% uptime SLA | Add redundancy, managed database |

**But for MVP?** Single VPS is plenty.

---

## Revised Recommendation

### Start Here: Minimal VPS

| Component | Choice | Cost |
|-----------|--------|------|
| Server | **Hetzner VPS** (or DigitalOcean, Fly.io) | $5-20/mo |
| Database | **SQLite** | $0 |
| Storage | **Local filesystem** | $0 |
| Queue | **In-memory** (upgrade to Redis later if needed) | $0 |

### The 100-Line Backend

The entire backend can be:
- ~100 lines of Python (FastAPI + Anthropic SDK)
- SQLite for persistence
- WebSocket for real-time
- Docker for sandboxing shell commands

### Migration Path

```
MVP (Now)                    Scale (Later)
─────────────────────────────────────────────
Single VPS                →  Multiple VPS / Fly Machines
SQLite                    →  PostgreSQL / Supabase
In-memory queue           →  Redis / Trigger.dev
Local filesystem          →  S3 / R2
Docker sandbox            →  Firecracker / gVisor
```

---

## Final Comparison

| Approach | Complexity | Cost | Time to MVP | Scalability |
|----------|------------|------|-------------|-------------|
| **Single VPS + SQLite** | ⭐ Lowest | $5-20/mo | 1-2 weeks | 10-50 users |
| Fly.io + Upstash + Neon | ⭐⭐⭐ Medium | $10-30/mo | 2-3 weeks | 100+ users |
| Trigger.dev + Supabase | ⭐⭐ Low-Medium | $0-50/mo | 1-2 weeks | 100+ users |

---

## My Updated Recommendation

**Start with Single VPS + SQLite**:

1. **Simplest possible architecture**
2. **Cheapest** ($5/mo)
3. **No vendor lock-in**
4. **Full control**
5. **Can migrate later** if needed

The third-party services (Trigger.dev, Supabase) are great, but they solve problems we don't have yet. We can always add them later when we hit their value proposition.

---

**Your call**: 
- Minimal (Single VPS + SQLite)
- Or still prefer managed services?
