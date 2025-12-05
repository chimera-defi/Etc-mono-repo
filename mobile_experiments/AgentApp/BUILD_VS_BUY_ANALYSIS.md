# Build vs Buy Analysis: Minimal Architecture

## The Core Question

Do we need Trigger.dev + Supabase, or can we build something simpler ourselves?

---

## What Do These Services Actually Provide?

### Trigger.dev Breakdown

| Feature | Do We Need It? | DIY Difficulty |
|---------|----------------|----------------|
| Job queuing | ✅ Yes | Easy (SQLite + polling) |
| Retries | ✅ Yes | Easy (retry count in DB) |
| Long-running tasks | ✅ Yes | Medium (process management) |
| Real-time updates | ✅ Yes | Medium (WebSocket) |
| Dashboard/UI | ⚠️ Nice to have | Skip for MVP |
| Ephemeral execution | ✅ Yes | Medium (Docker API) |
| Cron scheduling | ❌ Not needed | — |
| Multi-step workflows | ⚠️ Maybe later | — |

**Verdict**: Most of what Trigger.dev does is straightforward to build.

### Supabase Breakdown

| Feature | Do We Need It? | DIY Difficulty |
|---------|----------------|----------------|
| PostgreSQL | ⚠️ Overkill for MVP | SQLite is simpler |
| Realtime WebSocket | ✅ Yes | Medium (ws library) |
| Auth (OAuth) | ✅ Yes | Medium (passport.js) |
| Row-level security | ❌ Not needed | — |
| Edge functions | ❌ Not needed | — |
| Storage | ⚠️ Maybe | Local disk or S3 |
| Auto-scaling | ❌ Not for MVP | — |

**Verdict**: We don't need most of Supabase's features. SQLite + simple WebSocket is enough.

---

## Minimal Self-Hosted Architecture

### What We Actually Need

```
┌─────────────────────────────────────────────────────────────┐
│                    SINGLE SERVER                             │
│                    (e.g., $5-20/mo VPS)                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Node.js / Python Server                  │   │
│  │                                                       │   │
│  │  • HTTP API (task submission)                         │   │
│  │  • WebSocket server (real-time updates)               │   │
│  │  • OAuth handler (GitHub login)                       │   │
│  │  • Task queue (in-process or SQLite-backed)           │   │
│  │  • Worker spawner (Docker API)                        │   │
│  │                                                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                  │
│                           ▼                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    SQLite                             │   │
│  │                                                       │   │
│  │  • users (id, github_id, token)                       │   │
│  │  • tasks (id, user_id, status, repo, created_at)      │   │
│  │  • messages (id, task_id, role, content, tool_calls)  │   │
│  │  • tool_results (id, message_id, tool_name, result)   │   │
│  │                                                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                  │
│                           ▼                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Docker Containers (Workers)              │   │
│  │                                                       │   │
│  │  • Spawned per task                                   │   │
│  │  • Contains: git, node, python, etc.                  │   │
│  │  • Runs Claude API agent loop                         │   │
│  │  • Auto-destroyed after task                          │   │
│  │                                                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Components We Build

| Component | Technology | Lines of Code (Est.) |
|-----------|------------|---------------------|
| HTTP API | Express/Fastify | ~200 |
| WebSocket server | ws library | ~100 |
| OAuth flow | passport-github | ~50 |
| Task queue | SQLite + polling | ~150 |
| Worker spawner | dockerode | ~200 |
| Claude agent loop | anthropic SDK | ~300 |
| **Total** | | **~1000 lines** |

---

## Comparison: DIY vs Third-Party

### Cost Comparison

| Approach | Monthly Cost (MVP) | Monthly Cost (1000 users) |
|----------|-------------------|---------------------------|
| **DIY (VPS)** | $5-20 | $50-200 |
| **Trigger.dev + Supabase** | $0 (free tier) | $50-200+ |
| **Fly.io Stack** | $5-30 | $100-500 |

**Verdict**: Similar cost, but DIY gives you predictable pricing.

### Complexity Comparison

| Aspect | DIY | Third-Party |
|--------|-----|-------------|
| Initial setup | More work | Less work |
| Maintenance | You own it | They update it |
| Debugging | Full visibility | Black box sometimes |
| Scaling | Manual | Automatic |
| Vendor lock-in | None | Yes |
| Learning curve | Your stack | Their APIs |

### Control Comparison

| Aspect | DIY | Third-Party |
|--------|-----|-------------|
| Docker image customization | ✅ Full | ⚠️ Limited |
| Tool installation | ✅ Any | ⚠️ Depends |
| Network configuration | ✅ Full | ⚠️ Limited |
| Resource limits | ✅ Custom | ⚠️ Fixed tiers |
| Data location | ✅ You choose | ⚠️ Their regions |

---

## The Minimal DIY Stack

### Option D: Single-Server DIY

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Server | Single VPS (Hetzner/DigitalOcean) | $5-20/mo, simple |
| Language | Node.js or Python | Good Claude SDK |
| Database | SQLite | Zero config, fast enough |
| Queue | In-process + SQLite | No extra service |
| WebSocket | ws (Node) or websockets (Python) | Simple library |
| Auth | passport-github or authlib | Well-documented |
| Workers | Docker containers on same server | dockerode library |
| Code storage | Git clone into container | Standard workflow |

### What We Give Up

| Feature | Impact | Mitigation |
|---------|--------|------------|
| Auto-scaling | Can't handle 1000 concurrent | Scale VPS or add workers later |
| High availability | Single point of failure | Good enough for MVP |
| Managed updates | We maintain everything | Use Docker for easy updates |
| Global distribution | Higher latency for far users | Start in one region |

### What We Gain

| Benefit | Value |
|---------|-------|
| Full control | Customize anything |
| No vendor lock-in | Switch hosting anytime |
| Predictable costs | No surprise bills |
| Simpler debugging | All code is ours |
| Fewer moving parts | Less to break |
| Learning | Understand the full system |

---

## SQLite: Is It Enough?

### SQLite Capabilities

| Metric | SQLite Limit | Our Needs |
|--------|--------------|-----------|
| Database size | 281 TB | <1 GB |
| Concurrent readers | Unlimited | ✅ |
| Write throughput | ~50k writes/sec | ~10-100/sec |
| Concurrent writes | 1 (but fast) | ✅ OK with WAL mode |

### SQLite Schema (Simple)

```sql
-- Users
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    github_id TEXT UNIQUE NOT NULL,
    github_token TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tasks
CREATE TABLE tasks (
    id TEXT PRIMARY KEY,  -- UUID
    user_id INTEGER REFERENCES users(id),
    repo_url TEXT NOT NULL,
    branch TEXT DEFAULT 'main',
    prompt TEXT NOT NULL,
    status TEXT DEFAULT 'pending',  -- pending, running, completed, failed
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME
);

-- Messages (conversation history)
CREATE TABLE messages (
    id INTEGER PRIMARY KEY,
    task_id TEXT REFERENCES tasks(id),
    role TEXT NOT NULL,  -- user, assistant, tool_result
    content TEXT,
    tool_calls TEXT,  -- JSON
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Enable WAL mode for better concurrency
PRAGMA journal_mode=WAL;
```

**Verdict**: SQLite is absolutely sufficient for this use case.

---

## Revised Architecture: DIY Minimal

```
┌─────────────────┐
│   Mobile App    │
│  (React Native) │
└────────┬────────┘
         │ WebSocket + HTTPS
         ▼
┌─────────────────────────────────────────┐
│         Single VPS ($10-20/mo)          │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │        Coordinator Process         │ │
│  │                                    │ │
│  │  • Express/Fastify HTTP server     │ │
│  │  • WebSocket server (ws)           │ │
│  │  • GitHub OAuth                    │ │
│  │  • Task queue (in-memory + SQLite) │ │
│  │  • Docker worker spawner           │ │
│  │                                    │ │
│  └─────────────┬──────────────────────┘ │
│                │                         │
│       ┌────────┴────────┐               │
│       ▼                 ▼               │
│  ┌─────────┐    ┌──────────────────┐    │
│  │ SQLite  │    │ Docker Workers   │    │
│  │         │    │                  │    │
│  │ users   │    │ • Clone repo     │    │
│  │ tasks   │    │ • Run agent loop │    │
│  │ messages│    │ • Claude API     │    │
│  │         │    │ • Push changes   │    │
│  └─────────┘    └──────────────────┘    │
│                                          │
└─────────────────────────────────────────┘
         │
         ▼ (Claude API)
┌─────────────────┐
│  Anthropic API  │
└─────────────────┘
         │
         ▼ (Git operations)
┌─────────────────┐
│  GitHub/GitLab  │
└─────────────────┘
```

---

## Implementation Estimate

### MVP Timeline

| Phase | Work | Time |
|-------|------|------|
| 1. Server setup | VPS + Docker + Node.js | 1 day |
| 2. SQLite schema | Tables + queries | 0.5 day |
| 3. HTTP API | Task CRUD, auth endpoints | 1 day |
| 4. WebSocket | Connection handling, broadcasts | 1 day |
| 5. GitHub OAuth | Login flow | 0.5 day |
| 6. Docker worker | Spawn, communicate, cleanup | 2 days |
| 7. Claude agent | Tool loop, streaming | 2 days |
| 8. Mobile app | Basic UI | 3-5 days |
| **Total** | | **~12-14 days** |

### Code Size Estimate

| Component | Files | Lines |
|-----------|-------|-------|
| Server (coordinator) | 5-8 | ~800 |
| Worker (agent) | 3-5 | ~500 |
| Shared types | 2 | ~100 |
| Docker config | 2 | ~50 |
| **Total backend** | | **~1500** |

---

## Final Recommendation

### For MVP: **Option D - DIY Minimal**

| Component | Choice |
|-----------|--------|
| Hosting | Single VPS (Hetzner CAX11 ~$5/mo or DigitalOcean $12/mo) |
| Server | Node.js + Fastify |
| Database | SQLite (with WAL mode) |
| WebSocket | ws library |
| Auth | passport-github2 |
| Workers | Docker containers (dockerode) |
| Queue | In-process with SQLite persistence |

### Why DIY for MVP?

1. **Simpler** - One server, one database, no external services
2. **Cheaper** - $5-20/mo vs potential surprise bills
3. **Full control** - Customize Docker images freely
4. **No lock-in** - Can migrate anywhere
5. **Learning** - Understand the system completely
6. **Good enough** - Scales to ~50-100 concurrent users easily

### When to Add Services Later

| Trigger | Add |
|---------|-----|
| >100 concurrent users | Horizontal scaling or Fly.io |
| Need HA/uptime SLA | Managed database (Neon/Supabase) |
| Team grows | Better monitoring (Sentry, etc.) |
| Complex workflows | Consider Trigger.dev |

---

## Your Call

**Option D: DIY Minimal** - Single VPS, SQLite, Docker workers, ~1500 lines of code

Agree to proceed with this approach?
