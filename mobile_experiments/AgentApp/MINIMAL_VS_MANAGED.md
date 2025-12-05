# Minimal vs Managed: Do We Need Third-Party Services?

## What Do We Actually Need?

Let's strip this down to core requirements:

| Requirement | What It Means |
|-------------|---------------|
| **Queue tasks** | Mobile sends "do X", server picks it up |
| **Run agent** | Claude API calls + file operations |
| **Store state** | Task history, user info |
| **Real-time updates** | Mobile sees progress as it happens |
| **Auth** | Know who the user is |
| **Code access** | Clone/push to GitHub |

---

## What Trigger.dev Gives Us (vs Build Ourselves)

| Feature | Trigger.dev | DIY Equivalent | Complexity |
|---------|-------------|----------------|------------|
| Job queue | ✅ Built-in | BullMQ + Redis | Low |
| Retries | ✅ Built-in | 20 lines of code | Trivial |
| Long-running tasks | ✅ Built-in | Just... run the task | Trivial |
| Real-time updates | ✅ Built-in | WebSocket | Low |
| Dashboard | ✅ Built-in | Build or skip | Medium |
| Scaling | ✅ Managed | K8s or just vertical | Medium |

**Verdict**: Trigger.dev is convenient but not essential. We can build this with a simple queue.

---

## What Supabase Gives Us (vs SQLite)

| Feature | Supabase | SQLite Equivalent | Complexity |
|---------|----------|-------------------|------------|
| PostgreSQL | ✅ Managed | SQLite file | **Simpler** |
| Realtime subscriptions | ✅ Built-in | WebSocket server | Low |
| Auth (OAuth, magic link) | ✅ Built-in | Passport.js / Auth.js | Medium |
| Storage | ✅ Built-in | Local filesystem / S3 | Low |
| Edge functions | ✅ Built-in | Not needed | N/A |
| Row-level security | ✅ Built-in | Application logic | Low |
| Scaling | ✅ Managed | Single server is fine | N/A |

**Verdict**: For a single-server setup, SQLite is *simpler* than Supabase.

---

## The Minimal Architecture

What if we just run everything on **one server**?

```
┌─────────────────────────────────────────────────────────────┐
│                    SINGLE SERVER ($5-20/mo)                  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    Node.js / Python                   │   │
│  │                                                       │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  │   │
│  │  │  WebSocket  │  │  Task Queue │  │  Agent Loop  │  │   │
│  │  │   Server    │  │  (in-memory │  │  (Claude +   │  │   │
│  │  │             │  │   or Redis) │  │   tools)     │  │   │
│  │  └─────────────┘  └─────────────┘  └──────────────┘  │   │
│  │                                                       │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  │   │
│  │  │   SQLite    │  │  GitHub     │  │  Docker      │  │   │
│  │  │  (tasks,    │  │  OAuth +    │  │  (sandbox)   │  │   │
│  │  │   users)    │  │  API        │  │              │  │   │
│  │  └─────────────┘  └─────────────┘  └──────────────┘  │   │
│  │                                                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   Mobile App    │
                    └─────────────────┘
```

### Components

| Component | Implementation | Lines of Code |
|-----------|----------------|---------------|
| **WebSocket server** | `ws` or `socket.io` | ~50 lines |
| **Task queue** | In-memory array or `better-queue` | ~30 lines |
| **SQLite database** | `better-sqlite3` | ~100 lines |
| **GitHub OAuth** | `passport-github2` | ~50 lines |
| **Agent loop** | Claude API + tool handlers | ~300 lines |
| **Docker sandbox** | `dockerode` | ~100 lines |

**Total**: ~600-800 lines of code for the entire backend.

---

## Cost Comparison

| Approach | Monthly Cost | Notes |
|----------|--------------|-------|
| **Minimal (single VPS)** | $5-20 | DigitalOcean/Hetzner/Fly |
| **Trigger.dev + Supabase** | $0-50 | Free tiers, then scales |
| **Fly.io + Upstash + Neon** | $10-50 | Multiple services |

---

## Trade-offs

### Minimal (Single Server + SQLite)

**Pros:**
- ✅ Simple - everything in one place
- ✅ Cheap - one $5 VPS
- ✅ Fast - no network hops between services
- ✅ Full control - no vendor lock-in
- ✅ Easy to debug - all logs in one place
- ✅ SQLite is incredibly reliable

**Cons:**
- ❌ Single point of failure
- ❌ Manual scaling (but do we need to scale?)
- ❌ Manual backups (but SQLite backup is trivial)
- ❌ One server = one region (latency for distant users)

### Managed Services (Trigger.dev + Supabase)

**Pros:**
- ✅ Managed scaling
- ✅ Built-in dashboard/monitoring
- ✅ Multi-region possible
- ✅ Less code to write

**Cons:**
- ❌ More complex architecture
- ❌ Vendor dependencies
- ❌ Cost grows with usage
- ❌ Debugging across services is harder

---

## When Do We Need Managed Services?

| Scenario | Minimal Works? | Need Managed? |
|----------|----------------|---------------|
| MVP / Testing | ✅ Yes | No |
| 1-10 concurrent users | ✅ Yes | No |
| 10-100 concurrent users | ✅ Probably | Maybe |
| 100+ concurrent users | ⚠️ Maybe | Probably |
| Multi-region requirement | ❌ No | Yes |
| Team of developers | ⚠️ Harder | Easier |

---

## My Revised Recommendation

### Start Minimal, Scale Later

**Phase 1 (MVP)**: Single server + SQLite
```
Single VPS ($5-20/mo)
├── Node.js/Python server
├── SQLite database
├── WebSocket for real-time
├── Docker for sandboxing
└── GitHub OAuth for auth
```

**Phase 2 (If needed)**: Extract services
```
If we need scaling:
├── Move queue to Redis
├── Move DB to Postgres (or keep SQLite with Litestream)
├── Add more worker servers
└── Consider managed services
```

### Why This Makes Sense

1. **SQLite is production-ready** - Used by Pieter Levels (nomadlist, remoteok) for apps with millions of users
2. **Single server is fast** - No network latency between components
3. **We can always scale later** - Don't optimize for problems we don't have
4. **Less vendor lock-in** - Easy to move to any cloud

---

## Minimal Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| **Runtime** | Node.js or Python | Both have good Claude SDKs |
| **Web framework** | Fastify or FastAPI | Fast, simple |
| **WebSocket** | `ws` (Node) or `websockets` (Python) | Lightweight |
| **Database** | SQLite via `better-sqlite3` or `sqlite3` | Zero config, fast |
| **Queue** | In-memory or `bullmq` | Start simple |
| **Sandbox** | Docker via `dockerode` | Industry standard |
| **Auth** | GitHub OAuth | Users already have accounts |
| **Hosting** | Single VPS | $5-20/mo |

---

## Proposed Minimal Implementation

```python
# Entire backend in ~200 lines (pseudocode)

from fastapi import FastAPI, WebSocket
from anthropic import Anthropic
import sqlite3
import docker

app = FastAPI()
db = sqlite3.connect("agent.db")
claude = Anthropic()
docker_client = docker.from_env()

# Store active WebSocket connections
connections: dict[str, WebSocket] = {}

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await websocket.accept()
    connections[user_id] = websocket
    try:
        while True:
            data = await websocket.receive_json()
            if data["type"] == "start_task":
                # Start task in background
                asyncio.create_task(run_agent(user_id, data["task"]))
    finally:
        del connections[user_id]

async def run_agent(user_id: str, task: str):
    """Run the agent loop"""
    ws = connections.get(user_id)
    
    # Create Docker container for sandboxing
    container = docker_client.containers.run(
        "agent-sandbox:latest",
        detach=True,
        # ... mount volumes, etc.
    )
    
    messages = [{"role": "user", "content": task}]
    
    while True:
        # Call Claude
        response = claude.messages.create(
            model="claude-sonnet-4-20250514",
            messages=messages,
            tools=TOOLS,
            stream=True,
        )
        
        # Stream to mobile
        for chunk in response:
            if ws:
                await ws.send_json({"type": "delta", "content": chunk})
        
        # Handle tool calls
        if response.stop_reason == "tool_use":
            for tool_call in response.tool_calls:
                result = execute_tool(container, tool_call)
                messages.append({"role": "tool", "content": result})
        else:
            break
    
    # Cleanup
    container.stop()
    container.remove()
    
    # Save to SQLite
    db.execute("INSERT INTO tasks (...) VALUES (...)")
```

---

## Conclusion

**Do we need Trigger.dev + Supabase?** No.

**Should we start with them?** Maybe for convenience, but not required.

**My recommendation**: 

Start with **minimal single-server architecture**:
- One VPS ($5-20/mo)
- SQLite for data
- WebSocket for real-time
- Docker for sandboxing
- ~800 lines of code

Scale to managed services only if/when we hit real scaling problems.

---

**Your call**: 
- A) Minimal (single server + SQLite) - my new recommendation
- B) Managed (Trigger.dev + Supabase) - convenient but more complex
- C) Hybrid - start minimal, but design for easy extraction
