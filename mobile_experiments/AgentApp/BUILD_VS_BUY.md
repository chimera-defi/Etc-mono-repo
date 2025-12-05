# Build vs Buy Analysis

## The Question

Do we need Trigger.dev + Supabase, or can we build something simpler ourselves?

---

## What Do These Services Actually Provide?

### Trigger.dev Provides:

| Feature | Do We Need It? | Can We Build It? |
|---------|----------------|------------------|
| Job queue | ✅ Yes | ✅ Easy (BullMQ, or just Postgres) |
| Retries on failure | ✅ Yes | ✅ Easy |
| Long-running tasks | ✅ Yes | ✅ Medium |
| Real-time progress | ✅ Yes | ✅ Medium (WebSocket) |
| Dashboard/monitoring | ⚠️ Nice to have | ⚠️ Takes time |
| Managed infrastructure | ⚠️ Convenience | ✅ We can run our own |

### Supabase Provides:

| Feature | Do We Need It? | Can We Build It? |
|---------|----------------|------------------|
| PostgreSQL | ✅ Yes | ✅ SQLite is simpler |
| Auth (OAuth) | ✅ Yes | ✅ Medium (passport.js, lucia) |
| Realtime (WebSocket) | ✅ Yes | ✅ Easy (ws, socket.io) |
| Row-level security | ❌ Overkill for MVP | — |
| Storage | ⚠️ Maybe | ✅ Local filesystem or S3 |
| Edge functions | ❌ Don't need | — |

---

## Minimal Architecture: What Do We Actually Need?

### Core Requirements

1. **Mobile app** sends task to server
2. **Server** spawns worker (or runs inline)
3. **Worker** calls Claude API, executes tools
4. **Progress** streams back to mobile
5. **Results** are persisted somewhere

### What's the Simplest Thing That Works?

```
┌─────────────────┐
│   Mobile App    │
└────────┬────────┘
         │ WebSocket
         ▼
┌─────────────────────────────────────────────┐
│            Single Server                     │
│                                              │
│  ┌─────────────┐  ┌─────────────────────┐   │
│  │  WebSocket  │  │  Agent Worker       │   │
│  │  Handler    │  │  (runs in process   │   │
│  │             │  │   or spawns Docker) │   │
│  └─────────────┘  └─────────────────────┘   │
│                                              │
│  ┌─────────────────────────────────────┐    │
│  │  SQLite Database                     │    │
│  │  - tasks, messages, users            │    │
│  └─────────────────────────────────────┘    │
│                                              │
└─────────────────────────────────────────────┘
```

**That's it.** One server, one database file.

---

## SQLite: Is It Enough?

### SQLite Capabilities

| Capability | SQLite | Notes |
|------------|--------|-------|
| Concurrent reads | ✅ Unlimited | |
| Concurrent writes | ⚠️ One at a time | WAL mode helps |
| Max database size | 281 TB | Not a concern |
| Transactions | ✅ ACID | |
| JSON support | ✅ Yes | `json_extract()` |
| Full-text search | ✅ Yes | FTS5 |
| Replication | ❌ No | Need Litestream for backups |

### SQLite Limits

| Scenario | SQLite Handles It? |
|----------|-------------------|
| 10 concurrent users | ✅ Easily |
| 100 concurrent users | ✅ Fine with WAL |
| 1000 concurrent users | ⚠️ May need Postgres |
| 10,000 concurrent users | ❌ Need distributed DB |

**For MVP**: SQLite is more than enough.

### SQLite + Litestream = Production Ready

[Litestream](https://litestream.io/) continuously backs up SQLite to S3:

```bash
# Replicate SQLite to S3 every second
litestream replicate /data/agent.db s3://my-bucket/agent.db
```

Now you have:
- ✅ Simple SQLite locally
- ✅ Continuous backups to S3
- ✅ Point-in-time recovery
- ✅ No managed database costs

---

## Revised Minimal Architecture

### Option D: Self-Hosted Minimal

```
┌─────────────────┐
│   Mobile App    │
└────────┬────────┘
         │ HTTPS + WebSocket
         ▼
┌─────────────────────────────────────────────────┐
│  Single VPS ($5-20/mo)                          │
│  (Hetzner, DigitalOcean, or Fly.io)             │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │  Node.js / Python Server                   │ │
│  │                                            │ │
│  │  • Express/Fastify/FastAPI                 │ │
│  │  • WebSocket (ws/socket.io)                │ │
│  │  • Simple auth (JWT + GitHub OAuth)        │ │
│  │  • Agent loop (calls Claude API)           │ │
│  │  • Docker for sandboxed execution          │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  ┌────────────────┐  ┌────────────────────────┐ │
│  │  SQLite + WAL  │  │  Litestream → S3       │ │
│  │  (tasks, users)│  │  (continuous backup)   │ │
│  └────────────────┘  └────────────────────────┘ │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │  Docker (sandboxed code execution)         │ │
│  │  • Clone repo                              │ │
│  │  • Run agent tools                         │ │
│  │  • Push changes                            │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
└─────────────────────────────────────────────────┘
```

### What We Build Ourselves

| Component | Implementation | Effort |
|-----------|----------------|--------|
| HTTP API | Express/Fastify/FastAPI | 1 day |
| WebSocket | ws or socket.io | 1 day |
| Auth | GitHub OAuth + JWT | 1-2 days |
| Task queue | In-memory or SQLite table | 1 day |
| Agent loop | Claude API + tool handlers | 3-5 days |
| Sandboxing | Docker containers | 2-3 days |
| Database | SQLite + better-sqlite3 | 1 day |
| Backups | Litestream | 1 hour |

**Total: ~2-3 weeks for a working MVP**

---

## Cost Comparison

| Approach | Monthly Cost (MVP) | Monthly Cost (1000 users) |
|----------|-------------------|---------------------------|
| **Trigger.dev + Supabase** | $0-50 (free tiers) | $100-300 |
| **Fly.io + Upstash + Neon** | $20-50 | $100-200 |
| **Self-hosted (single VPS)** | $5-20 | $20-50 |
| **Self-hosted (with scaling)** | $20-50 | $50-150 |

---

## Trade-offs

### Self-Hosted Pros

| Pro | Details |
|-----|---------|
| **Full control** | No vendor lock-in |
| **Simple** | One server, one database file |
| **Cheap** | $5-20/mo for everything |
| **Fast iteration** | No learning external APIs |
| **Privacy** | Data never leaves your server |

### Self-Hosted Cons

| Con | Details | Mitigation |
|-----|---------|------------|
| **Scaling** | Single server limits | Scale later when needed |
| **Ops burden** | You manage uptime | Use managed VPS (Fly, Render) |
| **No dashboard** | Build your own | CLI + logs for MVP |
| **Backups** | Your responsibility | Litestream to S3 |

### When to Use Third-Party Services

| Scenario | Use Services |
|----------|--------------|
| Team of 1, time-constrained | ✅ Yes |
| Need enterprise features (SSO, audit) | ✅ Yes |
| Scaling to 10k+ users immediately | ✅ Yes |
| Building MVP, learning | ❌ Build it |
| Cost-sensitive | ❌ Build it |
| Want full control | ❌ Build it |

---

## My Revised Recommendation

### For MVP: Self-Hosted Minimal (Option D)

```
Single VPS ($5-20/mo)
├── Node.js/Python server
├── WebSocket for real-time
├── SQLite + Litestream
├── Docker for sandboxing
└── GitHub OAuth for auth
```

**Why:**
1. **Simplest possible architecture** - one server, one DB file
2. **Cheapest** - $5-20/mo vs $50-100+/mo
3. **No vendor dependencies** - move anywhere
4. **Learn the domain** - understand what you actually need before adding complexity
5. **Fast to build** - 2-3 weeks to working MVP

### Scale Later When Needed

When you hit limits:
- SQLite → PostgreSQL (easy migration)
- Single server → Multiple workers (add job queue)
- In-process → Kubernetes (if you really need it)

---

## Updated Architecture Summary

| Component | MVP Choice | Scale Choice |
|-----------|------------|--------------|
| Server | Single VPS (Fly/Hetzner) | Multiple + load balancer |
| Database | SQLite + Litestream | PostgreSQL (Neon/Supabase) |
| Job Queue | In-process or SQLite | Redis + BullMQ |
| Real-time | WebSocket (ws) | WebSocket + Redis pub/sub |
| Auth | GitHub OAuth + JWT | Same, or add more providers |
| Sandboxing | Docker on same host | Separate worker VMs |
| Backups | Litestream → S3 | Managed DB backups |

---

## Next Steps

If you agree with the self-hosted minimal approach:

1. **Phase 3**: Finalize UX decisions (auth flow, real-time updates)
2. **Phase 4**: Security decisions (sandboxing details)
3. **Create**: Detailed architecture diagram
4. **Create**: Implementation roadmap with specific tech choices

**Your call**: 
- Self-hosted minimal (SQLite, single server)?
- Or still prefer managed services?
