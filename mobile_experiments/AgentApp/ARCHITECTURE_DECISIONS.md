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

### Phase 1: Core Architecture Decisions

| # | Decision | Options | Status |
|---|----------|---------|--------|
| 1 | **Server Model** | Persistent vs Ephemeral vs Hybrid | ⏳ Pending |
| 2 | **Code Storage** | Where does the codebase live? | ⏳ Pending |
| 3 | **Agent Execution** | Where does Claude API get called? | ⏳ Pending |
| 4 | **Tool Execution** | How are file/shell operations sandboxed? | ⏳ Pending |
| 5 | **State Management** | How do we track task progress? | ⏳ Pending |

### Phase 2: Infrastructure Decisions

| # | Decision | Options | Status |
|---|----------|---------|--------|
| 6 | **Compute Provider** | AWS/GCP/Fly.io/Railway/Modal | ⏳ Pending |
| 7 | **Container Strategy** | Docker/Firecracker/gVisor | ⏳ Pending |
| 8 | **Networking** | How does mobile connect to ephemeral server? | ⏳ Pending |
| 9 | **Persistence** | What survives server shutdown? | ⏳ Pending |

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

