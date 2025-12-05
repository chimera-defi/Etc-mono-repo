# DIY vs Third-Party Services Analysis

## The Core Question

Do we need Trigger.dev, Supabase, etc., or can we build something simpler ourselves?

---

## What Do We Actually Need?

Let's strip this down to the essentials:

| Need | Minimum Solution | Fancy Solution |
|------|------------------|----------------|
| Accept task from mobile | HTTP endpoint | — |
| Spawn worker | Docker run command | Kubernetes, Trigger.dev |
| Run Claude API | HTTP calls | — |
| Execute tools (file, shell) | Python/Node code | — |
| Send updates to mobile | WebSocket | Supabase Realtime |
| Store task history | SQLite file | PostgreSQL cluster |
| Auth | JWT tokens | OAuth + Supabase Auth |

---

## DIY Architecture (Minimal)

```
┌─────────────────────────────────────────────────────────────┐
│                      SINGLE SERVER                           │
│                   (e.g., $5/mo VPS)                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Coordinator (Python/Node)               │    │
│  │                                                      │    │
│  │  • HTTP API for task submission                      │    │
│  │  • WebSocket for real-time updates                   │    │
│  │  • Spawns Docker containers for workers              │    │
│  │  • SQLite for all persistence                        │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│                           │ docker run                       │
│                           ▼                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Worker Container                        │    │
│  │                                                      │    │
│  │  • Claude API calls                                  │    │
│  │  • File operations (in mounted volume)               │    │
│  │  • Shell commands                                    │    │
│  │  • Git operations                                    │    │
│  │  • Writes status to shared SQLite                    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              SQLite Database                         │    │
│  │                                                      │    │
│  │  • users, tasks, messages, projects                  │    │
│  │  • Single file, no server needed                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### What This Gets Us

| Feature | DIY Solution |
|---------|--------------|
| Task queue | Simple table in SQLite: `tasks(id, status, created_at)` |
| Retries | On error, update status, coordinator retries |
| Real-time updates | WebSocket + polling SQLite |
| Persistence | SQLite file (backup to S3 if needed) |
| Auth | JWT tokens, bcrypt passwords |
| Scaling | One task at a time (or N concurrent Docker containers) |

### What We Give Up

| Feature | Impact |
|---------|--------|
| Horizontal scaling | Can't run multiple coordinators |
| Managed auth | Build login/signup ourselves |
| Automatic failover | Server dies = everything dies |
| Fancy dashboards | Build our own admin UI |

---

## Cost Comparison

### DIY (Single VPS)

| Item | Cost |
|------|------|
| VPS (4GB RAM, 2 CPU) | $20/mo |
| Domain + SSL | Free (Let's Encrypt) |
| Backups | $2/mo (S3) |
| **Total** | **~$22/mo** |

### Third-Party Stack (Trigger.dev + Supabase)

| Item | Cost |
|------|------|
| Trigger.dev | Free tier → $25/mo |
| Supabase | Free tier → $25/mo |
| Compute (Fly/Modal) | $10-50/mo |
| **Total** | **$35-100/mo** |

### Hybrid (VPS + Supabase for Auth only)

| Item | Cost |
|------|------|
| VPS | $20/mo |
| Supabase (auth only) | Free tier |
| **Total** | **~$20/mo** |

---

## DIY Implementation Complexity

### What We Need to Build

| Component | Effort | Complexity |
|-----------|--------|------------|
| HTTP API (FastAPI/Express) | 2-3 hours | Low |
| WebSocket handler | 2-3 hours | Low |
| Docker spawner | 2-3 hours | Low |
| SQLite schema + queries | 2-3 hours | Low |
| Worker agent loop | 4-6 hours | Medium |
| JWT auth | 2-3 hours | Low |
| GitHub OAuth | 3-4 hours | Medium |
| **Total** | **~20-25 hours** | — |

### Code Sketch: Coordinator (Python)

```python
# coordinator.py - ~200 lines total
import asyncio
import sqlite3
import subprocess
from fastapi import FastAPI, WebSocket
from contextlib import asynccontextmanager

app = FastAPI()
db = sqlite3.connect("agent.db", check_same_thread=False)

# Initialize DB
db.execute("""
    CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        repo_url TEXT,
        prompt TEXT,
        status TEXT DEFAULT 'pending',
        result TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
""")

# WebSocket connections per user
connections: dict[str, WebSocket] = {}

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await websocket.accept()
    connections[user_id] = websocket
    try:
        while True:
            # Keep connection alive, send updates
            await asyncio.sleep(1)
            tasks = db.execute(
                "SELECT id, status, result FROM tasks WHERE user_id = ? AND status != 'sent'",
                (user_id,)
            ).fetchall()
            for task in tasks:
                await websocket.send_json({"task_id": task[0], "status": task[1], "result": task[2]})
                db.execute("UPDATE tasks SET status = 'sent' WHERE id = ?", (task[0],))
                db.commit()
    except:
        del connections[user_id]

@app.post("/task")
async def create_task(user_id: str, repo_url: str, prompt: str):
    task_id = str(uuid.uuid4())
    db.execute(
        "INSERT INTO tasks (id, user_id, repo_url, prompt) VALUES (?, ?, ?, ?)",
        (task_id, user_id, repo_url, prompt)
    )
    db.commit()
    
    # Spawn worker container
    subprocess.Popen([
        "docker", "run", "--rm",
        "-e", f"TASK_ID={task_id}",
        "-e", f"REPO_URL={repo_url}",
        "-e", f"PROMPT={prompt}",
        "-e", f"CLAUDE_API_KEY={os.environ['CLAUDE_API_KEY']}",
        "-v", "/data/workspaces:/workspaces",
        "-v", "/data/agent.db:/app/agent.db",
        "agent-worker:latest"
    ])
    
    return {"task_id": task_id}
```

### Code Sketch: Worker (Python)

```python
# worker.py - runs in Docker container
import os
import sqlite3
import anthropic

db = sqlite3.connect("/app/agent.db")
client = anthropic.Anthropic(api_key=os.environ["CLAUDE_API_KEY"])

task_id = os.environ["TASK_ID"]
repo_url = os.environ["REPO_URL"]
prompt = os.environ["PROMPT"]

# Clone repo
os.system(f"git clone {repo_url} /workspaces/{task_id}")
os.chdir(f"/workspaces/{task_id}")

# Update status
def update_status(status, result=None):
    db.execute(
        "UPDATE tasks SET status = ?, result = ? WHERE id = ?",
        (status, result, task_id)
    )
    db.commit()

update_status("running")

# Run agent loop
tools = [
    {"name": "read_file", "description": "Read a file", ...},
    {"name": "write_file", "description": "Write a file", ...},
    {"name": "run_command", "description": "Run shell command", ...},
]

messages = [{"role": "user", "content": prompt}]

while True:
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=8192,
        tools=tools,
        messages=messages,
    )
    
    # Handle tool calls
    if response.stop_reason == "tool_use":
        for block in response.content:
            if block.type == "tool_use":
                result = execute_tool(block.name, block.input)
                messages.append({"role": "assistant", "content": response.content})
                messages.append({"role": "user", "content": [{"type": "tool_result", "tool_use_id": block.id, "content": result}]})
    else:
        # Done
        final_response = "".join(b.text for b in response.content if b.type == "text")
        update_status("complete", final_response)
        break
```

---

## Comparison Matrix

| Aspect | DIY (SQLite + VPS) | Trigger.dev + Supabase |
|--------|-------------------|------------------------|
| **Setup time** | ~20 hours | ~5 hours |
| **Monthly cost** | ~$22 | ~$50-100 |
| **Complexity** | Low (we control it) | Low (managed) |
| **Scaling** | Manual (add VPS) | Automatic |
| **Reliability** | Single point of failure | Managed HA |
| **Vendor lock-in** | None | Moderate |
| **Learning curve** | Low | Low |
| **Maintenance** | We do it | They do it |
| **Customization** | 100% | Limited |

---

## Recommendation

### For MVP / Prototype: **DIY**

Build it ourselves because:
1. **Full control** - no surprises, no vendor changes
2. **Lower cost** - $22/mo vs $50+/mo
3. **Simpler** - fewer moving parts
4. **Portable** - can move anywhere
5. **Learning** - understand the system completely

### DIY Stack

| Component | Choice |
|-----------|--------|
| **Server** | Single VPS (Hetzner $5-20/mo, DigitalOcean $6-24/mo) |
| **Coordinator** | Python (FastAPI) or Node (Express) |
| **Database** | SQLite (single file) |
| **Workers** | Docker containers |
| **Real-time** | WebSocket (built into FastAPI/Express) |
| **Auth** | JWT tokens (or GitHub OAuth) |
| **Code Storage** | Git clone per task |

### When to Upgrade to Services

Move to Trigger.dev/Supabase when:
- Need horizontal scaling (100+ concurrent tasks)
- Need managed auth (SSO, enterprise)
- Team grows (need dashboards, monitoring)
- Revenue justifies the cost

---

## Revised Architecture (DIY)

```
┌─────────────┐
│  Mobile App │
└──────┬──────┘
       │ WebSocket + HTTP
       ▼
┌──────────────────────────────────────────────────────────┐
│                    VPS ($20/mo)                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Coordinator (FastAPI)                              │  │
│  │  - POST /task                                       │  │
│  │  - WS /ws/{user_id}                                 │  │
│  │  - GET /tasks                                       │  │
│  └────────────────────────────────────────────────────┘  │
│                          │                                │
│                          │ docker run                     │
│                          ▼                                │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Worker Container (ephemeral)                       │  │
│  │  - Clone repo                                       │  │
│  │  - Claude API                                       │  │
│  │  - Execute tools                                    │  │
│  │  - Push changes                                     │  │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
│  ┌──────────────┐  ┌───────────────────────────────┐     │
│  │ agent.db     │  │ /workspaces/{task_id}/        │     │
│  │ (SQLite)     │  │ (cloned repos)                │     │
│  └──────────────┘  └───────────────────────────────┘     │
│                                                           │
└──────────────────────────────────────────────────────────┘
       │
       │ git push
       ▼
┌─────────────┐
│   GitHub    │
└─────────────┘
```

---

## Your Call

**Option A: DIY** - Build it ourselves with SQLite + VPS + Docker
- Pros: Full control, cheaper, no vendor lock-in
- Cons: More upfront work (~20 hours)

**Option B: Minimal Services** - Use Supabase for auth/realtime only, rest DIY
- Pros: Free OAuth, managed WebSocket
- Cons: Some dependency

**Option C: Full Services** - Trigger.dev + Supabase
- Pros: Fastest to build, managed everything
- Cons: Cost, vendor lock-in

Which do you prefer?
