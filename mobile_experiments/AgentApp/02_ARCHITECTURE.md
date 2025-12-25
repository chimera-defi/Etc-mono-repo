# 02. Architecture

All architecture decisions and system design in one document.

---

## 2.1 Decisions Summary

| # | Decision | Choice |
|---|----------|--------|
| 1 | Server Model | **Hybrid** (coordinator + ephemeral workers) |
| 2 | Code Storage | **GitHub** (clone per task) |
| 3 | Agent Execution | **Worker** (Claude API in Docker container) |
| 4 | Tool Sandboxing | **Docker** containers |
| 5 | State Management | **SQLite** (simple, single-file) |
| 6 | Compute | **Single VPS** (~$6/mo Hetzner) |
| 7 | Container Orchestration | **Docker SDK** (dockerode) |
| 8 | Networking | **WebSocket** (same server) |
| 9 | Persistence | **SQLite + filesystem** |
| 10 | Auth | **JWT + GitHub OAuth** |
| 11 | Real-time | **WebSocket** |
| 12 | Offline | **Queue locally, sync on reconnect** |
| 13 | Sandboxing | **Docker** (isolated per task) |
| 14 | API Key | **BYOK** (user provides Claude key) |
| 15 | Cost Model | **~$6/mo VPS** + user's Claude costs |

---

## 2.2 System Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            MOBILE APP                                    │
│                        (React Native + Expo)                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐                     │
│  │  Login  │  │Projects │  │  Chat   │  │ History │                     │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘                     │
│                         │                                                │
│                   WebSocket Client                                       │
└─────────────────────────┬───────────────────────────────────────────────┘
                          │ WSS (TLS)
                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         VPS ($6/mo)                                      │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                   COORDINATOR (Bun + Hono)                         │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │  │
│  │  │ REST API │  │WebSocket │  │Task Queue│  │Docker    │          │  │
│  │  │ /api/*   │  │ Server   │  │ (SQLite) │  │Spawner   │          │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └────┬─────┘          │  │
│  └─────────────────────────────────────────────────┼─────────────────┘  │
│                                                     │                    │
│  ┌─────────────────────────┐                       │                    │
│  │       SQLite            │                       │                    │
│  │  users, tasks, messages │                       │                    │
│  └─────────────────────────┘                       │                    │
│                                                     │ Docker             │
│  ┌─────────────────────────────────────────────────▼─────────────────┐  │
│  │                    WORKER CONTAINER                                │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐                   │  │
│  │  │ Agent Loop │  │   Tools    │  │    Git     │                   │  │
│  │  │ (Claude)   │  │ read/write │  │ clone/push │                   │  │
│  │  └────────────┘  └────────────┘  └────────────┘                   │  │
│  │                                                                    │  │
│  │  /workspace (cloned repo)                                         │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                          │
                          ▼ HTTPS
              ┌───────────────────────┐
              │   Claude API          │
              │   GitHub API          │
              └───────────────────────┘
```

---

## 2.3 Data Flow

```
1. User sends prompt
   Mobile ──POST /tasks──> Coordinator ──INSERT──> SQLite
   
2. Coordinator spawns worker
   Coordinator ──docker.create()──> Worker Container
   
3. Worker clones repo, runs agent
   Worker ──git clone──> /workspace
   Worker ──Claude API──> Get tool calls
   Worker ──execute──> read_file, write_file, etc.
   
4. Progress reported in real-time
   Worker ──HTTP POST──> Coordinator ──WebSocket──> Mobile
   
5. Task completes
   Worker ──git push──> GitHub (new branch)
   Worker ──GitHub API──> Create PR
   Worker ──HTTP POST──> Coordinator (complete)
   Coordinator ──UPDATE──> SQLite
   Coordinator ──WebSocket──> Mobile (result)
   
6. Cleanup
   Coordinator ──docker.remove()──> Worker Container
```

---

## 2.4 Tech Stack

| Component | Technology |
|-----------|------------|
| **Mobile** | React Native + Expo 54 |
| **State** | Zustand |
| **Server** | Bun + Hono |
| **Database** | SQLite |
| **Containers** | Docker + dockerode |
| **AI** | Claude API (@anthropic-ai/sdk) |
| **Auth** | JWT + GitHub OAuth |
| **Git** | simple-git |

---

## 2.5 Database Schema

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  github_id INTEGER UNIQUE,
  github_username TEXT,
  github_token TEXT,      -- encrypted
  claude_api_key TEXT,    -- encrypted
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  github_repo TEXT,       -- "owner/repo"
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  project_id TEXT REFERENCES projects(id),
  prompt TEXT,
  status TEXT DEFAULT 'queued',  -- queued, running, completed, failed
  result TEXT,            -- JSON: {summary, files_changed, pr_url}
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME
);

CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  task_id TEXT REFERENCES tasks(id),
  role TEXT,              -- user, assistant, tool_result
  content TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 2.6 API Endpoints

### REST

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/github/callback` | GitHub OAuth callback |
| GET | `/projects` | List user's projects |
| POST | `/projects` | Add project |
| DELETE | `/projects/:id` | Remove project |
| GET | `/tasks` | List tasks |
| POST | `/tasks` | Create task |
| GET | `/tasks/:id` | Get task details |
| POST | `/tasks/:id/cancel` | Cancel task |
| PATCH | `/settings` | Update API key |

### WebSocket

| Direction | Message | Description |
|-----------|---------|-------------|
| Client→Server | `{type: 'subscribe', task_id}` | Subscribe to task updates |
| Server→Client | `{type: 'progress', status, message}` | Task progress |
| Server→Client | `{type: 'complete', result}` | Task finished |
| Server→Client | `{type: 'error', error}` | Task failed |

---

## 2.7 File Structure

```
agent-server/
├── package.json
├── src/
│   ├── index.ts              # Entry point
│   ├── server.ts             # Hono server
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── tasks.ts
│   │   └── projects.ts
│   ├── websocket/
│   │   └── handler.ts
│   ├── docker/
│   │   └── spawner.ts
│   ├── db/
│   │   ├── schema.ts
│   │   └── queries.ts
│   └── utils/
│       └── crypto.ts
├── docker/
│   └── worker/
│       ├── Dockerfile
│       └── src/
│           ├── index.ts      # Worker entry
│           ├── loop.ts       # Agent loop
│           ├── claude.ts     # Claude client
│           ├── tools/        # Tool implementations
│           └── git.ts        # Git operations
└── data/
    └── agent.db              # SQLite database
```

---

## 2.8 Cost

| Item | Cost |
|------|------|
| VPS (Hetzner CX22) | ~$6/mo |
| Domain (optional) | ~$1/mo |
| **Total server** | **~$6/mo** |
| Claude API | User pays directly |

---

## 2.9 Security

| Concern | Solution |
|---------|----------|
| API keys at rest | AES-256 encrypted in SQLite |
| API keys in transit | TLS (HTTPS/WSS) |
| Code execution | Docker isolation per task |
| Network | Workers can only reach GitHub, Claude |
| Auth | JWT with short expiry, refresh tokens |

---

## 2.10 Scaling Path

| Trigger | Solution |
|---------|----------|
| CPU maxed | Upgrade VPS or add worker nodes |
| Need multi-region | Migrate to Fly.io Machines |
| Need managed DB | Migrate SQLite → Turso/Neon |
| Need queuing | Add Redis/BullMQ |

**Start simple, scale when needed.**
