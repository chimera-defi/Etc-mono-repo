# Build vs Buy Analysis: Do We Need Third-Party Services?

## The Core Question

Do we need Trigger.dev, Supabase, and multiple managed services, or can we build something simpler ourselves?

---

## What We Actually Need

Let's strip this down to essentials:

| Need | Description | Essential? |
|------|-------------|------------|
| Run Claude API | Call Claude with tools | ✅ Yes |
| Execute code | Run shell commands, read/write files | ✅ Yes |
| Store task history | Know what happened | ✅ Yes |
| Real-time updates | Mobile sees progress | ✅ Yes |
| Authentication | Know who's using it | ✅ Yes |
| Clone repos | Get code from GitHub | ✅ Yes |

That's it. Everything else is optimization.

---

## What Third-Party Services Provide

### Trigger.dev Provides:

| Feature | Do We Need It? | Alternative |
|---------|----------------|-------------|
| Job queuing | ⚠️ Maybe | Simple queue in SQLite |
| Retries | ⚠️ Maybe | Try/catch + retry loop |
| Scheduling | ❌ No | Not needed |
| Dashboard | ❌ No | Build simple one |
| Webhooks | ⚠️ Maybe | HTTP endpoint |
| Real-time updates | ✅ Yes | WebSocket ourselves |
| Managed workers | ✅ Yes | **This is the value** |

**Verdict**: The main value is managed ephemeral workers. But we could spawn Docker containers ourselves.

### Supabase Provides:

| Feature | Do We Need It? | Alternative |
|---------|----------------|-------------|
| PostgreSQL | ⚠️ Maybe | SQLite |
| Auth | ✅ Yes | GitHub OAuth ourselves |
| Realtime | ✅ Yes | WebSocket ourselves |
| Storage | ⚠️ Maybe | Local filesystem / S3 |
| Edge Functions | ❌ No | Regular server |
| Row Level Security | ❌ No | Simple auth check |
| Dashboard | ❌ No | Build if needed |

**Verdict**: Most features are nice-to-have. Core needs are auth + realtime, both doable ourselves.

---

## The Simplest Possible Architecture

What if we build it ourselves with minimal dependencies?

```
┌─────────────────────────────────────────────────────────────┐
│                    SINGLE SERVER                             │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Node.js / Python Server                            │    │
│  │                                                      │    │
│  │  • HTTP API for mobile                              │    │
│  │  • WebSocket for real-time                          │    │
│  │  • SQLite for all data                              │    │
│  │  • Spawns Docker containers for tasks               │    │
│  │  • GitHub OAuth for auth                            │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                   │
│                          ▼                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Docker Container (per task)                        │    │
│  │                                                      │    │
│  │  • Clones repo                                      │    │
│  │  • Runs Claude agent loop                           │    │
│  │  • Executes tools                                   │    │
│  │  • Pushes changes                                   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  SQLite Database                                    │    │
│  │                                                      │    │
│  │  • users (id, github_id, token)                     │    │
│  │  • tasks (id, user_id, status, repo, created_at)    │    │
│  │  • messages (id, task_id, role, content)            │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Components

| Component | Technology | Lines of Code (Est.) |
|-----------|------------|---------------------|
| HTTP API | Express/FastAPI | ~200 |
| WebSocket | ws/socket.io | ~100 |
| SQLite | better-sqlite3/sqlite3 | ~100 |
| Docker spawning | dockerode/docker-py | ~150 |
| GitHub OAuth | passport-github/authlib | ~100 |
| Agent loop | Custom | ~300 |
| **Total** | | **~950 lines** |

This is a weekend project, not a massive undertaking.

---

## Trade-off Analysis

### Option A: Self-Hosted (SQLite + Docker)

```
Single VPS ($20-50/mo)
├── Node.js server
├── SQLite database
├── Docker for workers
└── Nginx for SSL
```

| Pros | Cons |
|------|------|
| ✅ Full control | ❌ Single point of failure |
| ✅ Simple to understand | ❌ Must handle scaling yourself |
| ✅ No vendor lock-in | ❌ No managed backups |
| ✅ Cheap ($20-50/mo) | ❌ Must handle security |
| ✅ Fast (no network hops) | ❌ Regional (one datacenter) |
| ✅ ~1000 lines of code | |

### Option B: Managed Services (Trigger.dev + Supabase)

| Pros | Cons |
|------|------|
| ✅ Managed infrastructure | ❌ Vendor lock-in |
| ✅ Built-in scaling | ❌ More expensive at scale |
| ✅ Less code to write | ❌ Learning curve for each service |
| ✅ Backups included | ❌ Debugging across services |
| ✅ Multi-region | ❌ Data in third-party |

### Option C: Hybrid (Self-hosted + Fly.io workers)

```
Self-hosted coordinator ($20/mo)
├── Node.js server
├── SQLite database
└── Spawns workers on Fly.io
```

| Pros | Cons |
|------|------|
| ✅ Control where it matters | ❌ Two systems to understand |
| ✅ Ephemeral workers scale | ❌ More complex deployment |
| ✅ SQLite simplicity | ❌ Network latency to workers |

---

## Scaling Considerations

### When does SQLite break?

| Metric | SQLite Limit | When You Hit It |
|--------|--------------|-----------------|
| Concurrent writes | ~100/sec | 100+ simultaneous tasks |
| Database size | ~1TB practical | Years of history |
| Connections | 1 writer | Single server anyway |

**For a single-tenant or small-team app, SQLite is fine for years.**

### When do you need managed workers?

| Scenario | Self-hosted Docker | Managed (Fly/Modal) |
|----------|-------------------|---------------------|
| 1-10 concurrent tasks | ✅ Fine | Overkill |
| 10-50 concurrent tasks | ⚠️ Beefy server | ✅ Better |
| 50+ concurrent tasks | ❌ Need cluster | ✅ Required |

---

## My Revised Recommendation

### For MVP / Personal Use: Self-Hosted

```
Single VPS (Hetzner $20/mo, DigitalOcean $24/mo)
├── Ubuntu 22.04
├── Node.js + Express
├── SQLite (single file)
├── Docker for task isolation
├── Caddy for SSL
└── GitHub OAuth
```

**Why:**
- You own everything
- Debuggable (one server, one database)
- Cheap and fast
- Can migrate to managed services later if needed

### For Scale / Team Use: Add Managed Workers

When you hit limits:
1. Keep coordinator self-hosted (SQLite + API)
2. Move workers to Fly.io Machines
3. Add Redis only if you need pub/sub

---

## Proposed Self-Hosted Stack

### Server Requirements

| Spec | Minimum | Recommended |
|------|---------|-------------|
| CPU | 2 cores | 4 cores |
| RAM | 4GB | 8GB |
| Storage | 40GB SSD | 80GB SSD |
| Network | 1Gbps | 1Gbps |

### VPS Options

| Provider | Spec | Price | Notes |
|----------|------|-------|-------|
| **Hetzner** | 4 vCPU, 8GB | €15/mo (~$16) | Best value, EU |
| **DigitalOcean** | 4 vCPU, 8GB | $48/mo | US/EU, simple |
| **Vultr** | 4 vCPU, 8GB | $48/mo | Global |
| **Linode** | 4 vCPU, 8GB | $36/mo | Good support |
| **OVH** | 4 vCPU, 8GB | €26/mo | EU, cheap |

### Software Stack

| Layer | Technology | Why |
|-------|------------|-----|
| Language | **Node.js + TypeScript** | Same as mobile app |
| Framework | **Fastify** | Faster than Express |
| Database | **SQLite + better-sqlite3** | Simple, fast, no server |
| WebSocket | **ws** | Lightweight |
| Auth | **GitHub OAuth** | Users have GitHub anyway |
| Containers | **Docker** | Isolation |
| Reverse Proxy | **Caddy** | Auto SSL |
| Process Manager | **PM2** | Restarts, logs |

---

## Database Schema (SQLite)

```sql
-- Users
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    github_id TEXT UNIQUE NOT NULL,
    github_username TEXT NOT NULL,
    github_token TEXT NOT NULL,  -- Encrypted
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Projects (GitHub repos)
CREATE TABLE projects (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    repo_url TEXT NOT NULL,
    default_branch TEXT DEFAULT 'main',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tasks (agent runs)
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    project_id INTEGER REFERENCES projects(id),
    status TEXT DEFAULT 'pending',  -- pending, running, completed, failed
    prompt TEXT NOT NULL,
    container_id TEXT,
    started_at DATETIME,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Messages (conversation history)
CREATE TABLE messages (
    id INTEGER PRIMARY KEY,
    task_id INTEGER REFERENCES tasks(id),
    role TEXT NOT NULL,  -- user, assistant, tool_use, tool_result
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tool calls (for debugging)
CREATE TABLE tool_calls (
    id INTEGER PRIMARY KEY,
    task_id INTEGER REFERENCES tasks(id),
    tool_name TEXT NOT NULL,
    input TEXT NOT NULL,  -- JSON
    output TEXT,          -- JSON
    duration_ms INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Summary

| Approach | Cost | Complexity | Control | Best For |
|----------|------|------------|---------|----------|
| **Self-hosted (SQLite)** | $16-48/mo | Low | High | MVP, personal, small team |
| Managed (Trigger.dev + Supabase) | $50-200/mo | Medium | Low | Scaling, team |
| Hybrid | $30-100/mo | Medium | Medium | Growth phase |

**My recommendation: Start with self-hosted SQLite stack.**

Reasons:
1. You control everything
2. ~1000 lines of code total
3. Easy to debug (one server, one file database)
4. Can always migrate later
5. Cheapest option

---

## Next Steps (If Self-Hosted)

1. ✅ Decide on VPS provider
2. ✅ Design API endpoints
3. ✅ Implement auth flow
4. ✅ Implement agent worker
5. ✅ Build mobile app
6. ✅ Deploy and test

Would you like me to proceed with the self-hosted architecture?
