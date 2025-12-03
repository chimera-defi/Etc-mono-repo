# Architecture Decisions: Mobile-Triggered Agent System

## Overview

Building a system where:
1. **Mobile app** triggers agent tasks
2. **Backend server** (potentially ephemeral) does the actual coding work
3. **Agent** uses Claude API with tools to read/write/execute code
4. **Results** are synced back and server potentially shuts down

---

## Decisions to Make (Task List)

Before designing the architecture, we need to reason through these key decisions:

### Phase 1: Core Architecture Decisions ✅ COMPLETE

| # | Decision | Choice | Status |
|---|----------|--------|--------|
| 1 | **Server Model** | **Hybrid** (coordinator + ephemeral workers) | ✅ Confirmed |
| 2 | **Code Storage** | **GitHub/GitLab** (clone per task) | ✅ Confirmed |
| 3 | **Agent Execution** | **Worker** (Claude API in ephemeral worker) | ✅ Confirmed |
| 4 | **Tool Execution** | **Docker** (container sandbox) | ✅ Confirmed |
| 5 | **State Management** | **Redis + PostgreSQL** | ✅ Confirmed |

### Phase 2: Infrastructure Decisions ⏳ IN PROGRESS

| # | Decision | Options | Status |
|---|----------|---------|--------|
| 6 | **Compute Provider** | AWS/GCP/Fly.io/Railway/Modal | ⏳ Pending |
| 7 | **Container Orchestration** | How to manage ephemeral workers | ⏳ Pending |
| 8 | **Networking** | How does mobile connect to ephemeral server? | ⏳ Pending |
| 9 | **Persistence Layer** | What survives server shutdown? | ⏳ Pending |

### Phase 3: User Experience Decisions

| # | Decision | Options | Status |
|---|----------|---------|--------|
| 10 | **Authentication** | OAuth/API keys/Magic links | ⏳ Pending |
| 11 | **Real-time Updates** | WebSocket/SSE/Polling | ⏳ Pending |
| 12 | **Offline Handling** | What happens when mobile disconnects? | ⏳ Pending |

### Phase 4: Security & Cost Decisions

| # | Decision | Options | Status |
|---|----------|---------|--------|
| 13 | **Sandboxing** | How isolated is code execution? | ⏳ Pending |
| 14 | **API Key Management** | User's key vs Platform key | ⏳ Pending |
| 15 | **Cost Model** | Per-task/Subscription/BYOK | ⏳ Pending |

---

## Decision 1: Server Model

### The Core Question

Should the compute server be:
- **A) Always-on (Persistent)** - Server runs 24/7, handles all requests
- **B) Ephemeral** - Server spins up per task, shuts down after
- **C) Hybrid** - Lightweight coordinator + ephemeral workers

### Trade-offs

| Factor | Persistent | Ephemeral | Hybrid |
|--------|------------|-----------|--------|
| **Cost (idle)** | ❌ Pays for idle time | ✅ Zero when unused | ✅ Minimal coordinator |
| **Latency** | ✅ Instant response | ❌ Cold start (10-60s) | ⚠️ Depends on cache |
| **Complexity** | ✅ Simple | ⚠️ Need orchestration | ❌ Most complex |
| **Scaling** | ⚠️ Manual scaling | ✅ Auto-scales | ✅ Auto-scales |
| **State** | ✅ Easy persistence | ❌ Must externalize | ⚠️ Split state |
| **Security** | ⚠️ Shared environment | ✅ Fresh per task | ✅ Isolated workers |

### Recommendation

**Hybrid approach** seems best:
```
Mobile App
    │
    ▼
┌─────────────────────────────┐
│  Lightweight Coordinator    │  ← Always-on, cheap ($5-20/mo)
│  - Auth                     │
│  - Task queue               │
│  - WebSocket hub            │
└─────────────────────────────┘
    │
    ▼ (Spawns on demand)
┌─────────────────────────────┐
│  Ephemeral Worker           │  ← Spins up per task
│  - Claude API calls         │
│  - Code execution           │
│  - File operations          │
└─────────────────────────────┘
```

**Your call**: Which model do you prefer? Persistent/Ephemeral/Hybrid?

---

## Decision 2: Code Storage

### The Core Question

Where does the user's codebase live?

### Options

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **A) GitHub/GitLab** | Clone on each task | ✅ Familiar, version control | ❌ Clone time, auth complexity |
| **B) Cloud Storage** | S3/GCS bucket per project | ✅ Fast sync, no git needed | ❌ No version control |
| **C) Persistent Volume** | Attached to worker | ✅ Fast, stateful | ❌ Single-region, cost |
| **D) User's Machine** | Agent connects via tunnel | ✅ No sync needed | ❌ Requires desktop app |

### Recommendation

**A) GitHub/GitLab** is most natural:
- Users already store code there
- Agent can create branches, PRs
- OAuth flow for access
- Clone time mitigated by shallow clones

**Your call**: Where should the code live?

---

## Decision 3: Agent Execution Location

### The Core Question

Where does the Claude API get called?

### Options

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **A) Mobile App** | Call Claude from phone | ✅ Simplest | ❌ Can't execute code |
| **B) Coordinator** | Call Claude from coordinator | ✅ Centralized | ❌ Coordinator does heavy lifting |
| **C) Worker** | Call Claude from ephemeral worker | ✅ Near code execution | ⚠️ Worker must stay alive |
| **D) Split** | Orchestration on coordinator, tools on worker | ✅ Optimized | ❌ Complex coordination |

### Recommendation

**C) Worker** - Claude API calls happen in the ephemeral worker:
- Agent runs alongside code (low latency for file ops)
- Worker lifecycle = task lifecycle
- Coordinator just routes and tracks

**Your call**: Where should Claude API calls happen?

---

## Decision 4: Tool Execution Sandboxing

### The Core Question

How do we safely execute shell commands and file operations?

### Options

| Option | Security | Performance | Complexity |
|--------|----------|-------------|------------|
| **A) Docker container** | Good | Good | Low |
| **B) Firecracker microVM** | Excellent | Good | Medium |
| **C) gVisor** | Excellent | Medium | Medium |
| **D) Nsjail** | Good | Excellent | Low |
| **E) No sandbox (trust user)** | Poor | Best | Lowest |

### Recommendation

**A) Docker container** for v1:
- Well-understood
- Good enough isolation for single-tenant
- Can upgrade to Firecracker later

**Your call**: What level of sandboxing?

---

## Decision 5: State Management

### The Core Question

How do we track:
- Task progress
- Conversation history
- Tool call results
- Errors and retries

### Options

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **A) In-memory (worker)** | State dies with worker | ✅ Simple | ❌ Lost on crash |
| **B) Redis** | External state store | ✅ Fast, shared | ⚠️ Extra service |
| **C) PostgreSQL** | Persistent database | ✅ Durable, queryable | ⚠️ Slower |
| **D) SQLite + S3** | Local + backup | ✅ Simple, durable | ⚠️ Sync complexity |

### Recommendation

**B) Redis** for real-time + **C) PostgreSQL** for persistence:
- Redis: Current task state, pub/sub for updates
- Postgres: Task history, user data, billing

**Your call**: What state management approach?

---

# Phase 2: Infrastructure Decisions

## Decision 6: Compute Provider

### The Core Question

Which cloud provider/platform for the coordinator and ephemeral workers?

### Options Comparison

| Provider | Coordinator | Ephemeral Workers | Cold Start | Pricing |
|----------|-------------|-------------------|------------|---------|
| **Fly.io** | ✅ Machines API | ✅ Machines (auto-stop) | ~2-5s | $0.0000008/s |
| **Modal** | ❌ No always-on | ✅ Purpose-built for this | ~1-3s | $0.000016/s |
| **Railway** | ✅ Easy deploy | ⚠️ No auto-stop | N/A | $5/mo + usage |
| **AWS Lambda** | ⚠️ Awkward fit | ✅ Native serverless | ~1-5s | $0.0000167/s |
| **AWS ECS/Fargate** | ✅ Full control | ✅ Task-based | ~30-60s | $0.04/hr |
| **GCP Cloud Run** | ✅ Easy | ✅ Scale to zero | ~2-5s | $0.000024/s |
| **Render** | ✅ Simple | ⚠️ No auto-stop | N/A | $7/mo + usage |

### Key Considerations

1. **Cold start time** - User waits for worker to spin up
2. **Auto-stop capability** - Workers should die when idle
3. **Docker support** - We chose Docker for sandboxing
4. **Cost at scale** - What happens with 1000 concurrent tasks?
5. **Simplicity** - Time to implement

### Recommendation

**Fly.io** for both coordinator and workers:
- Machines API allows programmatic start/stop
- Auto-stop after idle timeout
- 2-5s cold start (acceptable)
- Good Docker support
- Simple pricing, no surprise bills
- Can run coordinator 24/7 cheaply (~$5/mo)

**Alternative**: **Modal** is purpose-built for ephemeral compute but:
- No always-on option for coordinator (need separate service)
- Higher learning curve
- Better for pure compute workloads

**Your call**: Fly.io / Modal / AWS / GCP / Other?

---

## Decision 7: Container Orchestration

### The Core Question

How do we manage the lifecycle of ephemeral worker containers?

### Options

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **A) Fly Machines API** | Direct API calls to start/stop | ✅ Simple, fast | ⚠️ Fly-specific |
| **B) Kubernetes** | K8s Jobs for workers | ✅ Portable, mature | ❌ Complex, overkill |
| **C) Docker Swarm** | Swarm services | ⚠️ Simpler than K8s | ❌ Limited auto-scaling |
| **D) Custom (SSH + Docker)** | SSH to VMs, run docker | ✅ Full control | ❌ Build everything |
| **E) Modal SDK** | Modal's Python SDK | ✅ Very simple | ⚠️ Modal lock-in |

### Recommendation

**A) Fly Machines API** - matches our compute choice:

```python
# Coordinator spawns a worker
import requests

def spawn_worker(task_id: str, repo_url: str):
    response = requests.post(
        "https://api.machines.dev/v1/apps/agent-workers/machines",
        headers={"Authorization": f"Bearer {FLY_API_TOKEN}"},
        json={
            "config": {
                "image": "agent-worker:latest",
                "env": {
                    "TASK_ID": task_id,
                    "REPO_URL": repo_url,
                    "CLAUDE_API_KEY": "...",
                },
                "auto_destroy": True,  # Clean up when done
                "restart": {"policy": "no"},
            }
        }
    )
    return response.json()["id"]
```

**Your call**: Fly Machines / Kubernetes / Modal / Custom?

---

## Decision 8: Networking Architecture

### The Core Question

How does the mobile app communicate with ephemeral workers?

### Challenge

Mobile can't connect directly to ephemeral workers because:
- Workers don't exist until task starts
- Workers have dynamic IPs
- Mobile might be on cellular with NAT

### Options

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **A) Coordinator Proxy** | All traffic through coordinator | ✅ Simple, reliable | ⚠️ Coordinator bottleneck |
| **B) Direct + Signaling** | Coordinator gives worker URL | ✅ Lower latency | ❌ Complex, CORS issues |
| **C) Message Queue** | Pub/sub via Redis/NATS | ✅ Decoupled | ⚠️ Not great for streaming |
| **D) WebSocket Hub** | Coordinator maintains WS to mobile | ✅ Real-time, simple | ✅ Best for our use case |

### Recommendation

**D) WebSocket Hub** on coordinator:

```
┌─────────────┐     WebSocket      ┌─────────────────┐
│  Mobile App │◄──────────────────►│   Coordinator   │
└─────────────┘                    └────────┬────────┘
                                            │
                                   Redis Pub/Sub
                                            │
                                   ┌────────▼────────┐
                                   │  Worker (task)  │
                                   └─────────────────┘
```

Flow:
1. Mobile connects to coordinator via WebSocket
2. Mobile sends task request
3. Coordinator spawns worker, subscribes to Redis channel
4. Worker publishes progress to Redis
5. Coordinator forwards to mobile via WebSocket

**Your call**: WebSocket Hub / Coordinator Proxy / Direct / Message Queue?

---

## Decision 9: Persistence Layer

### The Core Question

What data survives worker shutdown, and where does it live?

### Data Types

| Data Type | Lifetime | Storage Location |
|-----------|----------|------------------|
| Task state (in progress) | During task | Redis |
| Task history | Forever | PostgreSQL |
| Conversation messages | Forever | PostgreSQL |
| Code changes | Until pushed | Worker filesystem → GitHub |
| Logs | 30 days | S3/CloudWatch |
| User settings | Forever | PostgreSQL |

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PERSISTENCE LAYER                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │    Redis     │  │  PostgreSQL  │  │   S3/R2      │       │
│  │              │  │              │  │              │       │
│  │ • Task state │  │ • Users      │  │ • Logs       │       │
│  │ • Pub/sub    │  │ • Tasks      │  │ • Artifacts  │       │
│  │ • Sessions   │  │ • Messages   │  │ • Snapshots  │       │
│  │              │  │ • Projects   │  │              │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Managed Services Recommendation

| Service | Provider Options | Recommendation |
|---------|------------------|----------------|
| Redis | Upstash / Redis Cloud / Fly Redis | **Upstash** (serverless, cheap) |
| PostgreSQL | Neon / Supabase / PlanetScale | **Neon** (serverless, branching) |
| Object Storage | S3 / R2 / Tigris | **Cloudflare R2** (no egress fees) |

**Your call**: Confirm persistence architecture?

---

## Phase 2 Summary

Please confirm these infrastructure decisions:

| # | Decision | Recommendation |
|---|----------|----------------|
| 6 | Compute Provider | **Fly.io** (coordinator + workers) |
| 7 | Container Orchestration | **Fly Machines API** |
| 8 | Networking | **WebSocket Hub** on coordinator |
| 9 | Persistence | **Upstash Redis + Neon Postgres + R2** |

Once confirmed, I'll proceed to Phase 3 (UX decisions).

---

## Next Steps

Once you verify these 5 core decisions, I'll proceed to:

1. **Phase 2**: Infrastructure decisions (compute provider, containers, networking)
2. **Phase 3**: UX decisions (auth, real-time updates, offline)
3. **Phase 4**: Security & cost decisions

Then I'll create:
- Detailed architecture diagram
- Component specifications
- Implementation roadmap
- Cost estimates

---

**Please review and respond to each decision:**

1. Server Model: Persistent / Ephemeral / Hybrid?
2. Code Storage: GitHub / Cloud Storage / Persistent Volume / User's Machine?
3. Agent Execution: Mobile / Coordinator / Worker / Split?
4. Sandboxing: Docker / Firecracker / gVisor / Nsjail / None?
5. State Management: In-memory / Redis / PostgreSQL / SQLite+S3?

