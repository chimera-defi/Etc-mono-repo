# Minimal Architecture Analysis

## The Real Question

> Do we really need Trigger.dev and Supabase, or can we just use SQLite?

Let's break down what we **actually need** vs. what's nice-to-have.

---

## What We Actually Need

| Need | Description | Is it core? |
|------|-------------|-------------|
| Spawn containers | Start/stop Docker containers on demand | ✅ Core |
| Run Claude API | Call Claude with tools | ✅ Core |
| Execute code | Run shell commands in sandbox | ✅ Core |
| Store task history | Remember past tasks | ✅ Core |
| Real-time updates | Show progress to mobile | ✅ Core |
| Authentication | Know who's making requests | ✅ Core |
| Clone repos | Get code from GitHub | ✅ Core |

## What Trigger.dev Provides (Do We Need It?)

| Feature | Do we need it? | DIY Difficulty |
|---------|----------------|----------------|
| Job queuing | ⚠️ Maybe (simple queue works) | Easy |
| Retries | ⚠️ Maybe | Easy |
| Long-running tasks | ✅ Yes | Medium |
| Dashboard | 🟢 Nice to have | Skip for MVP |
| Webhooks | 🟢 Nice to have | Easy |
| Scheduling | ❌ No (user-triggered) | N/A |

**Verdict**: We could build the job orchestration ourselves. It's not that complex.

## What Supabase Provides (Do We Need It?)

| Feature | Do we need it? | DIY Difficulty |
|---------|----------------|----------------|
| PostgreSQL | ⚠️ SQLite works fine | N/A |
| Realtime | ✅ Yes (WebSocket to mobile) | Medium |
| Auth | ✅ Yes | Medium |
| Storage | ⚠️ Filesystem works | N/A |
| Edge Functions | ❌ No | N/A |
| Dashboard | 🟢 Nice to have | Skip |

**Verdict**: We need auth and realtime. Everything else is overkill for MVP.

---

## Minimal Self-Hosted Architecture

### What If We Just Use:
- **1 VPS** ($5-20/mo) running our coordinator
- **SQLite** for all data storage
- **Docker** for spawning workers locally
- **WebSocket** (built-in to Node/Python) for real-time

```
┌─────────────────────────────────────────────────────────────┐
│                    SINGLE VPS ($10-20/mo)                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              COORDINATOR (Node.js/Python)            │   │
│  │                                                      │   │
│  │  • WebSocket server (real-time to mobile)           │   │
│  │  • REST API (task submission)                       │   │
│  │  • Auth (JWT + GitHub OAuth)                        │   │
│  │  • Task queue (in-memory + SQLite)                  │   │
│  │  • Docker spawner (docker run)                      │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                           ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              SQLITE DATABASE                         │   │
│  │                                                      │   │
│  │  • users (id, github_id, token)                     │   │
│  │  • tasks (id, user_id, status, repo, created_at)    │   │
│  │  • messages (id, task_id, role, content)            │   │
│  │  • tool_calls (id, task_id, name, input, output)    │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                           ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              DOCKER WORKERS (ephemeral)              │   │
│  │                                                      │   │
│  │  docker run --rm agent-worker:latest \              │   │
│  │    -e TASK_ID=xxx \                                 │   │
│  │    -e REPO_URL=github.com/user/repo \               │   │
│  │    -e CLAUDE_API_KEY=xxx                            │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Pros of Minimal Approach

| Benefit | Description |
|---------|-------------|
| **Simplicity** | One server, one database, one codebase |
| **Cost** | $10-20/mo total (vs $50+ with services) |
| **Control** | Full control over everything |
| **No vendor lock-in** | Can move anywhere |
| **Debugging** | Everything in one place |
| **Learning** | Understand the full stack |

### Cons of Minimal Approach

| Drawback | Mitigation |
|----------|------------|
| **Single point of failure** | Add redundancy later if needed |
| **Scaling limits** | One VPS handles ~10-50 concurrent tasks |
| **No managed backups** | Easy SQLite backup to S3 |
| **Build auth ourselves** | Use passport.js / authlib (not hard) |
| **Build WebSocket ourselves** | socket.io / websockets (standard) |

---

## SQLite: Is It Really Enough?

### SQLite Can Handle:

| Metric | SQLite Capability |
|--------|-------------------|
| Concurrent readers | Unlimited |
| Concurrent writers | 1 (with WAL mode) |
| Database size | Up to 281 TB |
| Requests/second | 50,000+ reads |
| Writes/second | ~1,000 (WAL mode) |

### For Our Use Case:

| Operation | Frequency | SQLite OK? |
|-----------|-----------|------------|
| Create task | 1-10/min per user | ✅ Yes |
| Update task status | 10-100/task | ✅ Yes |
| Store messages | 10-50/task | ✅ Yes |
| Read task history | On demand | ✅ Yes |
| Real-time updates | Via WebSocket (not DB) | ✅ N/A |

**Verdict**: SQLite is more than enough for this workload.

### Famous Apps Using SQLite

- WhatsApp (local storage)
- Signal (local storage)
- Expensify (server-side)
- Tailscale (coordination)
- Pieter Levels' apps (nomadlist, remoteok - $2M+/year on SQLite)

---

## Revised Architecture Options

### Option 1: Single VPS (Minimal) ⭐ SIMPLEST

| Component | Technology | Cost |
|-----------|------------|------|
| Server | Hetzner/DigitalOcean VPS | $10-20/mo |
| Database | SQLite | $0 |
| Queue | In-memory + SQLite | $0 |
| WebSocket | socket.io / ws | $0 |
| Auth | passport.js + JWT | $0 |
| Workers | Local Docker | $0 |
| **Total** | | **$10-20/mo** |

**Best for**: MVP, proving the concept, low scale.

### Option 2: VPS + Managed DB (Balanced)

| Component | Technology | Cost |
|-----------|------------|------|
| Server | Hetzner/DigitalOcean VPS | $10-20/mo |
| Database | Turso (SQLite edge) | $0-29/mo |
| WebSocket | Built-in | $0 |
| Auth | Built-in | $0 |
| Workers | Local Docker | $0 |
| **Total** | | **$10-50/mo** |

**Best for**: Want managed backups without full Postgres complexity.

### Option 3: VPS + External Workers (Scale-Ready)

| Component | Technology | Cost |
|-----------|------------|------|
| Coordinator | Fly.io/Hetzner | $10-20/mo |
| Database | SQLite/Turso | $0-29/mo |
| Workers | Fly Machines (on-demand) | Pay per use |
| **Total** | | **$10-50/mo + usage** |

**Best for**: Need to scale workers beyond single VPS.

### Option 4: Third-Party Stack (Original)

| Component | Technology | Cost |
|-----------|------------|------|
| Orchestration | Trigger.dev | $0-99/mo |
| Database | Supabase | $0-25/mo |
| Workers | Managed by Trigger | Included |
| **Total** | | **$0-124/mo** |

**Best for**: Want managed everything, willing to pay.

---

## What Do We Actually Build?

### For Single VPS (Option 1), we build:

```
src/
├── server.ts              # Express + WebSocket server
├── auth/
│   ├── github.ts          # GitHub OAuth
│   └── jwt.ts             # Token management
├── db/
│   ├── schema.sql         # SQLite schema
│   └── queries.ts         # Database operations
├── queue/
│   └── taskQueue.ts       # Simple in-memory queue
├── docker/
│   └── spawner.ts         # Docker container management
├── agent/
│   ├── claude.ts          # Claude API client
│   └── tools.ts           # Tool implementations
└── websocket/
    └── hub.ts             # WebSocket connections
```

### Estimated Build Time

| Component | Complexity | Time |
|-----------|------------|------|
| WebSocket server | Low | 2-4 hours |
| SQLite schema + queries | Low | 2-4 hours |
| GitHub OAuth | Medium | 4-8 hours |
| Docker spawner | Medium | 4-8 hours |
| Claude integration | Medium | 4-8 hours |
| Task queue | Low | 2-4 hours |
| **Total Backend** | | **~20-40 hours** |

---

## My Recommendation

### Start with Option 1 (Single VPS + SQLite)

1. **Cheapest**: $10-20/mo vs $50-100/mo
2. **Simplest**: One server, one database
3. **Fastest to build**: No learning third-party APIs
4. **Easy to upgrade**: Can add Fly Machines later for scale

### Upgrade Path

```
MVP (Single VPS)
    │
    ▼ (If need more concurrent tasks)
VPS + Fly Machines for workers
    │
    ▼ (If need managed services)
Trigger.dev + Supabase
```

---

## Decision

**Do you want to proceed with the minimal single-VPS architecture?**

If yes, I'll create:
1. Detailed component specifications
2. SQLite schema design
3. API design
4. Implementation roadmap

