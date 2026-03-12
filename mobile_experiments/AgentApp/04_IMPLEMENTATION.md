# 04. Implementation

Tasks, timeline, and open questions.

---

## 4.1 Open Questions

**19 decisions needed.** Say **"Use all recommendations"** to proceed with defaults.

### Task Behavior

| # | Question | Recommendation |
|---|----------|----------------|
| Q1 | Task timeout? | **30 minutes** |
| Q2 | Concurrent tasks per user? | **1** |
| Q3 | Max repo size? | **500MB** (shallow clone) |
| Q4 | Branch strategy? | **Always new** `agent/task-{id}` |
| Q5 | Always create PR? | **Yes** |
| Q6 | Remember past conversations? | **Fresh** each task |
| Q7 | On error, keep changes? | **Keep partial** |

### Mobile App

| # | Question | Recommendation |
|---|----------|----------------|
| M1 | Support tablets? | **No** (phone-only MVP) |
| M2 | Dark mode? | **Follow system** |
| M3 | Min OS versions? | **iOS 15+, Android 10+** |
| M4 | Push notifications? | **No** (Phase 2) |
| M5 | Biometric unlock? | **No** (nice-to-have) |

### Security

| # | Question | Recommendation |
|---|----------|----------------|
| S1 | API key storage? | **Server** (encrypted) |
| S2 | GitHub scope? | **`repo`** (private repos) |
| S3 | Rate limiting? | **Per-user** (10/hr) |

### Operations

| # | Question | Recommendation |
|---|----------|----------------|
| O1 | Deployment? | **Hetzner CX22** (~$4/mo) |
| O2 | Domain/SSL? | **Custom + Let's Encrypt** |
| O3 | Backups? | **Daily to R2** |
| O4 | Monitoring? | **UptimeRobot** (free) |

---

## 4.2 Task Summary

| Epic | Tasks | Days |
|------|-------|------|
| Server Setup | 12 | 2 |
| Authentication | 14 | 2.5 |
| Task Management | 16 | 3 |
| Docker/Workers | 18 | 4 |
| Agent Core | 22 | 5 |
| Real-time | 10 | 2 |
| Mobile App | 28 | 6 |
| Testing | 12 | 2.5 |
| **Total** | **132** | **~27 days** |

**Critical path MVP: ~14-18 days** (parallel work)

---

## 4.3 Phase 1: Server Setup (Day 1-2)

| Task | Hours |
|------|-------|
| Initialize Bun + Hono project | 1 |
| TypeScript config | 0.5 |
| Folder structure | 0.5 |
| SQLite setup + migrations | 2 |
| Database schema | 2 |
| Health endpoint | 0.5 |
| Logging setup | 1 |

---

## 4.4 Phase 2: Authentication (Day 2-3)

| Task | Hours |
|------|-------|
| GitHub OAuth redirect | 1 |
| GitHub OAuth callback | 2 |
| Create/update user in DB | 1 |
| JWT generation | 1 |
| JWT validation middleware | 1 |
| API key encryption | 2 |
| Settings endpoints | 1 |

---

## 4.5 Phase 3: Task Management (Day 3-4)

| Task | Hours |
|------|-------|
| POST /tasks endpoint | 2 |
| GET /tasks endpoint | 1.5 |
| GET /tasks/:id endpoint | 1 |
| POST /tasks/:id/cancel | 1.5 |
| SQLite queue table | 1 |
| Enqueue/dequeue functions | 2 |
| Queue processor loop | 2 |

---

## 4.6 Phase 4: Docker (Day 4-6)

| Task | Hours |
|------|-------|
| Worker Dockerfile | 2 |
| Install Node, git, ripgrep | 1 |
| Configure non-root user | 0.5 |
| Docker spawner (dockerode) | 3 |
| Pass env vars securely | 1 |
| Resource limits | 1 |
| Container lifecycle | 2 |
| Cleanup routine | 2 |
| Task timeout | 2 |

---

## 4.7 Phase 5: Agent Core (Day 6-9)

| Task | Hours |
|------|-------|
| Claude API client | 2 |
| Streaming support | 3 |
| Retry with backoff | 2 |
| Tool schemas | 3 |
| read_file implementation | 1.5 |
| write_file implementation | 1.5 |
| list_directory implementation | 1 |
| run_command implementation | 2 |
| search_files implementation | 1.5 |
| Agent loop | 4 |
| Progress reporting | 2 |
| Git clone | 1 |
| Git commit/push | 2 |
| Create PR | 2 |
| Error handling | 2 |

---

## 4.8 Phase 6: Real-time (Day 9-10)

| Task | Hours |
|------|-------|
| WebSocket server | 2 |
| Connection auth | 1.5 |
| Track connections by user | 1 |
| Subscribe/unsubscribe | 1.5 |
| Broadcast progress | 2 |
| Heartbeat | 1 |

---

## 4.9 Phase 7: Mobile App (Day 10-14)

| Task | Hours |
|------|-------|
| Expo project setup | 1 |
| Navigation structure | 2 |
| Zustand stores | 2 |
| Theme (colors, fonts) | 1 |
| Login screen | 2 |
| GitHub OAuth flow | 3 |
| Secure token storage | 1 |
| Projects screen | 3 |
| Add project modal | 2 |
| Chat screen (idle) | 2 |
| Chat screen (running) | 4 |
| Chat screen (complete) | 2 |
| WebSocket client | 2 |
| Auto-reconnect | 1.5 |
| Progress display | 3 |
| History screen | 3 |
| Settings screen | 2 |
| Offline queue | 3 |
| Animations | 3 |
| iOS/Android testing | 4 |

---

## 4.10 Phase 8: Testing (Day 14-15)

| Task | Hours |
|------|-------|
| Unit tests (crypto, JWT) | 2 |
| Unit tests (queue, tools) | 3 |
| Integration tests (API) | 4 |
| Integration tests (WebSocket) | 2 |
| E2E test (full flow) | 4 |
| Error handling tests | 2 |
| Concurrent task tests | 2 |

---

## 4.11 Critical Path

```
Week 1:
├── Day 1-2: Server Setup
├── Day 3: Auth
├── Day 4-5: Docker
└── Day 5: Task Queue

Week 2:
├── Day 6-8: Agent Core
├── Day 9: WebSocket
└── Day 10: Integration

Week 3:
├── Day 11-14: Mobile App
└── Day 15: Testing + Bug fixes
```

**Parallel track:** Mobile screens (7.1-7.4) can start Day 1.

---

## 4.12 Definition of Done

Each task is complete when:
- [ ] Code compiles
- [ ] Tests pass (if applicable)
- [ ] Acceptance criteria met
- [ ] No linting errors

---

## 4.13 Next Steps

1. **Answer open questions** (or "Use all recommendations")
2. **Scaffold server project** (`bun init`, Hono, SQLite)
3. **Scaffold mobile project** (`npx create-expo-app`)
4. **Implement Phase 1-2** (server + auth)
5. **Deploy to VPS** for testing

---

**Ready to start?**
