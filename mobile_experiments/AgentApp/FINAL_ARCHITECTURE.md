# Final Architecture: Self-Hosted Agent System

## All Decisions Summary

| # | Decision | Choice |
|---|----------|--------|
| 1 | Server Model | **Hybrid** (coordinator + ephemeral workers) |
| 2 | Code Storage | **GitHub/GitLab** (clone per task) |
| 3 | Agent Execution | **Worker** (Claude API in Docker container) |
| 4 | Tool Execution | **Docker** (container sandbox) |
| 5 | State Management | **SQLite** (simple, reliable) |
| 6 | Compute Provider | **Single VPS** (~$6/mo) |
| 7 | Container Orchestration | **Docker SDK** (dockerode) |
| 8 | Networking | **WebSocket** (same server) |
| 9 | Persistence | **SQLite + filesystem** |
| 10 | Authentication | **JWT + GitHub OAuth** |
| 11 | Real-time Updates | **WebSocket** |
| 12 | Offline Handling | **Queue locally, sync on reconnect** |
| 13 | Sandboxing | **Docker containers** |
| 14 | API Key Management | **BYOK** (user's Claude key) |
| 15 | Cost Model | **~$6/mo VPS** + user's Claude costs |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              MOBILE APP                                      │
│                         (React Native + Expo)                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Chat UI   │  │ Code Viewer │  │ File Browser│  │  Settings   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                              │                                               │
│                    ┌─────────▼─────────┐                                    │
│                    │  WebSocket Client │                                    │
│                    │  + Offline Queue  │                                    │
│                    └─────────┬─────────┘                                    │
└──────────────────────────────┼──────────────────────────────────────────────┘
                               │
                               │ WSS (TLS)
                               │
┌──────────────────────────────┼──────────────────────────────────────────────┐
│                              │         VPS ($6/mo - Hetzner/DO)              │
├──────────────────────────────┼──────────────────────────────────────────────┤
│                              ▼                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                     COORDINATOR SERVER (Bun/Hono)                      │  │
│  ├───────────────────────────────────────────────────────────────────────┤  │
│  │                                                                        │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │  │
│  │  │  REST API   │  │  WebSocket  │  │ Task Queue  │  │Docker Spawn │   │  │
│  │  │  /api/*     │  │   Server    │  │ (SQLite)    │  │ (dockerode) │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └──────┬──────┘   │  │
│  │                                                             │          │  │
│  └─────────────────────────────────────────────────────────────┼──────────┘  │
│                                                                 │             │
│  ┌──────────────────────────────────────────────────────────────┼──────────┐ │
│  │                         SQLite Database                      │          │ │
│  ├──────────────────────────────────────────────────────────────┼──────────┤ │
│  │  • users (id, github_id, api_key_encrypted, created_at)      │          │ │
│  │  • tasks (id, user_id, status, repo_url, prompt, created_at) │          │ │
│  │  • messages (id, task_id, role, content, tool_calls)         │          │ │
│  │  • settings (user_id, key, value)                            │          │ │
│  └──────────────────────────────────────────────────────────────┼──────────┘ │
│                                                                 │             │
│                               ┌─────────────────────────────────┘             │
│                               │ Spawns                                        │
│                               ▼                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    WORKER CONTAINER (Docker)                           │  │
│  ├───────────────────────────────────────────────────────────────────────┤  │
│  │                                                                        │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │  Agent Process (Node.js)                                        │  │  │
│  │  │  ──────────────────────────────────────────────────────────────│  │  │
│  │  │  • Calls Claude API with tools                                  │  │  │
│  │  │  • Executes file read/write                                     │  │  │
│  │  │  • Runs shell commands                                          │  │  │
│  │  │  • Git operations                                               │  │  │
│  │  │  • Reports progress via HTTP callback                           │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                        │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │  /workspace (mounted volume)                                    │  │  │
│  │  │  └── cloned repo files                                          │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                        │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         Local Filesystem                               │  │
│  ├───────────────────────────────────────────────────────────────────────┤  │
│  │  /data/                                                                │  │
│  │  ├── agent.db          (SQLite database)                              │  │
│  │  ├── repos/            (cloned repositories)                          │  │
│  │  ├── logs/             (task logs)                                    │  │
│  │  └── artifacts/        (generated files)                              │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
                               │
                               │ HTTPS
                               ▼
                    ┌─────────────────────┐
                    │   Claude API        │
                    │   (Anthropic)       │
                    └─────────────────────┘
                               │
                               │ HTTPS
                               ▼
                    ┌─────────────────────┐
                    │   GitHub API        │
                    │   (Clone/Push/PR)   │
                    └─────────────────────┘
```

---

## Data Flow

### 1. User Starts Task

```
Mobile                  Coordinator              Worker              Claude
  │                         │                      │                   │
  │──── Create Task ───────►│                      │                   │
  │     {repo, prompt}      │                      │                   │
  │                         │                      │                   │
  │◄─── Task ID ───────────│                      │                   │
  │                         │                      │                   │
  │                         │──── Spawn ──────────►│                   │
  │                         │     Container        │                   │
  │                         │                      │                   │
  │                         │                      │── Clone Repo ────►│
  │                         │                      │                   │
  │                         │                      │── Call Claude ───►│
  │                         │                      │   {prompt, tools} │
  │                         │                      │                   │
  │                         │                      │◄── Tool Call ─────│
  │                         │                      │   {read_file}     │
  │                         │                      │                   │
  │                         │◄── Progress ────────│                   │
  │◄─── WS: Progress ──────│     {reading file}   │                   │
  │                         │                      │                   │
  │                         │                      │── Tool Result ───►│
  │                         │                      │                   │
  │                         │                      │◄── Tool Call ─────│
  │                         │                      │   {write_file}    │
  │                         │                      │                   │
  │                         │◄── Progress ────────│                   │
  │◄─── WS: Progress ──────│     {writing file}   │                   │
  │                         │                      │                   │
  │                         │                      │── Git Push ──────►│
  │                         │                      │                   │
  │                         │◄── Complete ────────│                   │
  │◄─── WS: Complete ──────│                      │                   │
  │     {diff, PR url}      │                      │                   │
  │                         │── Kill Container ───►│                   │
```

---

## File Structure

```
agent-server/
├── package.json
├── tsconfig.json
├── Dockerfile                    # For the coordinator
├── docker/
│   └── worker/
│       ├── Dockerfile           # Worker image
│       └── agent.ts             # Agent code that runs in worker
├── src/
│   ├── index.ts                 # Entry point
│   ├── server.ts                # Hono server setup
│   ├── routes/
│   │   ├── auth.ts              # GitHub OAuth + JWT
│   │   ├── tasks.ts             # Task CRUD
│   │   └── health.ts            # Health check
│   ├── websocket/
│   │   └── handler.ts           # WebSocket connections
│   ├── queue/
│   │   └── taskQueue.ts         # SQLite-backed queue
│   ├── docker/
│   │   └── spawner.ts           # Docker container management
│   ├── db/
│   │   ├── schema.ts            # SQLite schema
│   │   └── queries.ts           # Database queries
│   └── utils/
│       ├── crypto.ts            # Encrypt API keys
│       └── logger.ts            # Logging
├── data/                        # Persisted data (gitignored)
│   ├── agent.db
│   ├── repos/
│   ├── logs/
│   └── artifacts/
└── README.md
```

---

## Tech Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Runtime | **Bun** | 1.1+ |
| Web Framework | **Hono** | 4.x |
| Database | **SQLite** (better-sqlite3) | — |
| WebSocket | **Bun native** or ws | — |
| Docker SDK | **dockerode** | 4.x |
| Auth | **JWT** + GitHub OAuth | — |
| Mobile | **React Native + Expo** | 54.x |

---

## Implementation Phases

### Phase 1: Core Server (2-3 days)
- [ ] Set up Bun + Hono project
- [ ] SQLite schema and migrations
- [ ] REST API routes (tasks, health)
- [ ] Basic JWT auth

### Phase 2: Docker Integration (1-2 days)
- [ ] Worker Dockerfile
- [ ] Docker spawner (dockerode)
- [ ] Container lifecycle management
- [ ] Progress reporting via HTTP callback

### Phase 3: Agent Worker (2-3 days)
- [ ] Claude API integration
- [ ] Tool implementations (read/write/shell/git)
- [ ] Agent loop with tool execution
- [ ] Error handling and retries

### Phase 4: Real-time (1 day)
- [ ] WebSocket server
- [ ] Progress streaming to mobile
- [ ] Reconnection handling

### Phase 5: GitHub Integration (1 day)
- [ ] OAuth flow
- [ ] Clone repositories
- [ ] Create branches and PRs

### Phase 6: Mobile App (3-4 days)
- [ ] React Native + Expo setup
- [ ] Auth screens
- [ ] Chat UI with streaming
- [ ] Task history

**Total: ~10-14 days for MVP**

---

## Cost Breakdown

| Item | Monthly Cost |
|------|-------------|
| VPS (Hetzner CX22) | $4-6 |
| Domain (optional) | $1 |
| **Server Total** | **~$6/mo** |
| Claude API (user pays) | Varies |

---

## Security Considerations

1. **API Keys**: Encrypted at rest in SQLite using AES-256
2. **Docker Isolation**: Each task runs in isolated container
3. **Network**: Workers have no inbound connections, only outbound
4. **Auth**: JWT tokens with short expiry, refresh tokens
5. **HTTPS**: TLS via Caddy or nginx reverse proxy

---

## Scaling Path

When you outgrow single VPS:

| Trigger | Solution |
|---------|----------|
| CPU maxed | Upgrade VPS or add worker nodes |
| Need multi-region | Switch to Fly.io Machines |
| Need managed DB | Migrate SQLite → Turso/Neon |
| Need auth features | Add Clerk/Auth0 |
| Need queuing | Add Redis/BullMQ |

---

## Next Step

Create the initial project scaffold. Ready to proceed?
