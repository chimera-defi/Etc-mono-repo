# Open Questions

All decisions that require human input before proceeding with implementation.

## Status Summary

| Category | Questions | Answered | Pending |
|----------|-----------|----------|---------|
| Task Behavior | 7 | 0 | 7 |
| Mobile App | 5 | 0 | 5 |
| Security | 3 | 0 | 3 |
| Operations | 4 | 0 | 4 |
| **Total** | **19** | **0** | **19** |

---

## Category 1: Task Behavior

### Q1: Task Timeout Duration ⏱️
**How long should a task be allowed to run before being killed?**

| Option | Pros | Cons |
|--------|------|------|
| **10 minutes** | Safe, cheap | May be too short for complex tasks |
| **30 minutes** | Good balance | Costs more if task hangs |
| **1 hour** | Complex tasks complete | High cost if something goes wrong |
| **User-configurable** | Flexible | More complex UI |

**Recommendation**: 30 minutes default, configurable per-task later

**Your choice**: _________________

---

### Q2: Concurrent Tasks Per User 🔢
**How many tasks can one user run simultaneously?**

| Option | Pros | Cons |
|--------|------|------|
| **1** | Simple, prevents abuse | Users wait for sequential tasks |
| **3** | Parallelism | Higher server load |
| **Unlimited** | Maximum flexibility | Risk of resource exhaustion |

**Recommendation**: 1 for MVP (prevents complexity)

**Your choice**: _________________

---

### Q3: Maximum Repository Size 📦
**What's the largest repo we support cloning?**

| Option | Pros | Cons |
|--------|------|------|
| **100 MB** | Fast clones | Excludes many real projects |
| **500 MB** | Covers most projects | ~30s clone time |
| **1 GB** | Large monorepos | ~60s+ clone, storage concerns |

**Recommendation**: 500 MB with shallow clone (`--depth 1`)

**Your choice**: _________________

---

### Q4: Git Branch Strategy 🌿
**How should the agent manage branches?**

| Option | Pros | Cons |
|--------|------|------|
| **Always create new branch** | Safe, traceable | Many branches |
| **Commit to default branch** | Simple | Dangerous, no review |
| **User specifies branch** | Flexible | Complex UI |

**Recommendation**: Always create `agent/task-{id}` branch

**Your choice**: _________________

---

### Q5: PR Creation Policy 📝
**Should we always create a PR?**

| Option | Pros | Cons |
|--------|------|------|
| **Always create PR** | Consistent, reviewable | PR noise if task fails |
| **Only on success** | Cleaner | Loses partial work on failure |
| **User chooses** | Flexible | Complex UI |
| **Create draft PR on partial** | Balance | More complex |

**Recommendation**: Always create PR (mark as draft if partial)

**Your choice**: _________________

---

### Q6: Conversation History Between Tasks 💬
**Should subsequent tasks remember previous conversations?**

| Option | Pros | Cons |
|--------|------|------|
| **Fresh context each task** | Simple, cheap | No continuity |
| **Include last N messages** | Some continuity | Token cost |
| **Full project memory** | Best UX | Very expensive |

**Recommendation**: Fresh context each task (show history in UI for manual copy)

**Your choice**: _________________

---

### Q7: Error Recovery Behavior 🔄
**If a task fails mid-way, what happens to partial changes?**

| Option | Pros | Cons |
|--------|------|------|
| **Discard all changes** | Clean state | Loses work |
| **Keep partial in branch** | Preserves work | May have broken code |
| **Ask user** | Flexible | Interrupts flow |

**Recommendation**: Keep partial changes, mark PR as draft with "[WIP]"

**Your choice**: _________________

---

## Category 2: Mobile App

### M1: Tablet Support 📱
**Should we support iPad/Android tablets?**

| Option | Pros | Cons |
|--------|------|------|
| **Phone only** | Simpler, focused | Miss tablet users |
| **Responsive (works on tablet)** | More users | More testing |
| **Tablet-optimized** | Best UX on tablet | Much more work |

**Recommendation**: Phone only for MVP

**Your choice**: _________________

---

### M2: Dark Mode 🌙
**How should we handle dark mode?**

| Option | Pros | Cons |
|--------|------|------|
| **Light only** | Simpler | Poor night UX |
| **Dark only** | Developer preference | Unusual |
| **Follow system** | Best UX | More work |
| **User toggle** | Maximum control | Even more work |

**Recommendation**: Follow system preference

**Your choice**: _________________

---

### M3: Minimum OS Versions 📲
**What OS versions should we support?**

| iOS | Android | Coverage |
|-----|---------|----------|
| iOS 13+ | Android 8+ | ~99% |
| iOS 14+ | Android 9+ | ~97% |
| iOS 15+ | Android 10+ | ~93% |
| iOS 16+ | Android 11+ | ~85% |

**Recommendation**: iOS 15+, Android 10+ (good balance)

**Your choice**: _________________

---

### M4: Push Notifications 🔔
**Should MVP include push notifications for task completion?**

| Option | Pros | Cons |
|--------|------|------|
| **Yes, in MVP** | Better UX | More complexity, setup |
| **No, add later** | Faster MVP | Users may miss results |

**Recommendation**: No for MVP (add in Phase 2)

**Your choice**: _________________

---

### M5: Biometric Authentication 🔐
**Should we support Face ID / Fingerprint to unlock API key?**

| Option | Pros | Cons |
|--------|------|------|
| **Yes** | More secure | Complexity |
| **No** | Simpler | Less secure feeling |

**Recommendation**: Nice-to-have, not MVP

**Your choice**: _________________

---

## Category 3: Security

### S1: API Key Storage Location 🔑
**Where should user's Claude API key be stored?**

| Option | Pros | Cons |
|--------|------|------|
| **Device only** | Maximum privacy | Lost on device wipe, manual re-entry |
| **Server only** | Persistent | Higher risk if server compromised |
| **Both (synced)** | Best UX | Most complex |

**Recommendation**: Server (encrypted), with option to clear

**Your choice**: _________________

---

### S2: GitHub Token Scope 🔒
**What permissions should we request from GitHub?**

| Scope | Access |
|-------|--------|
| `repo` | Full access to private repos |
| `public_repo` | Only public repos |
| `read:user` | Read user profile |

| Option | Pros | Cons |
|--------|------|------|
| **`repo` + `read:user`** | Works with private repos | Broad permissions |
| **`public_repo` + `read:user`** | Minimal permissions | No private repos |

**Recommendation**: `repo` + `read:user` (needed for private repos)

**Your choice**: _________________

---

### S3: Rate Limiting 🚦
**Should we implement rate limiting on our server?**

| Option | Pros | Cons |
|--------|------|------|
| **No limits** | Simple | Risk of abuse |
| **Per-user limits** | Fair usage | Implementation work |
| **Global limits** | Protects server | May block legitimate use |

**Recommendation**: Per-user: 10 tasks/hour, 50 tasks/day

**Your choice**: _________________

---

## Category 4: Operations

### O1: Deployment Target 🖥️
**Where should we deploy the server?**

| Option | Cost | Pros | Cons |
|--------|------|------|------|
| **Hetzner CX22** | ~$4/mo | Cheapest, EU | Manual setup |
| **DigitalOcean Basic** | ~$6/mo | Easy | US-centric |
| **Fly.io** | ~$5/mo | Easy scaling | More complex |
| **Self-hosted** | Varies | Full control | All maintenance |

**Recommendation**: Hetzner CX22 (cheapest, sufficient)

**Your choice**: _________________

---

### O2: Domain & SSL 🔐
**How should we handle HTTPS?**

| Option | Cost | Pros | Cons |
|--------|------|------|------|
| **Custom domain + Let's Encrypt** | ~$10/yr | Professional | Setup work |
| **Subdomain of existing domain** | Free | Easy | Dependent |
| **IP + self-signed (dev only)** | Free | Quick start | Not production-ready |

**Recommendation**: Custom domain with Let's Encrypt via Caddy

**Your choice**: _________________

---

### O3: Backup Strategy 💾
**How should we backup data?**

| Option | Frequency | Storage |
|--------|-----------|---------|
| **Daily SQLite to S3/R2** | Daily | ~$0.01/mo |
| **Hourly snapshots** | Hourly | ~$0.10/mo |
| **No backups** | Never | Free |

**Recommendation**: Daily SQLite backup to Cloudflare R2 (free tier)

**Your choice**: _________________

---

### O4: Monitoring & Alerts 📊
**What monitoring should we set up?**

| Option | Cost | Coverage |
|--------|------|----------|
| **None** | Free | Blind |
| **Uptime only (UptimeRobot)** | Free | Basic |
| **Full observability (Grafana Cloud)** | Free tier | Comprehensive |

**Recommendation**: UptimeRobot (free) + basic Grafana Cloud

**Your choice**: _________________

---

## Decision Template

Copy this to respond:

```
## My Decisions

### Task Behavior
- Q1 (Timeout): 
- Q2 (Concurrent): 
- Q3 (Repo Size): 
- Q4 (Branch Strategy): 
- Q5 (PR Policy): 
- Q6 (History): 
- Q7 (Error Recovery): 

### Mobile App
- M1 (Tablets): 
- M2 (Dark Mode): 
- M3 (Min OS): 
- M4 (Push Notifications): 
- M5 (Biometrics): 

### Security
- S1 (API Key Storage): 
- S2 (GitHub Scope): 
- S3 (Rate Limiting): 

### Operations
- O1 (Deployment): 
- O2 (Domain/SSL): 
- O3 (Backups): 
- O4 (Monitoring): 
```

---

## Quick Decision Mode

If you want to go with all recommendations:

**"Use all recommendations"** - I'll proceed with the recommended option for all 19 questions.

---

**Document Status**: Awaiting Decisions  
**Last Updated**: December 2025
