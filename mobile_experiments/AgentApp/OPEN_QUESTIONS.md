# Open Questions

**19 decisions needed before implementation.**

---

## Quick Answer

To use all recommended defaults, reply: **"Use all recommendations"**

---

## Task Behavior (Q1-Q7)

| # | Question | Options | Recommendation |
|---|----------|---------|----------------|
| Q1 | Task timeout? | 10min / **30min** / 1hr | **30 minutes** |
| Q2 | Concurrent tasks per user? | **1** / 3 / unlimited | **1** |
| Q3 | Max repo size? | 100MB / **500MB** / 1GB | **500MB** (shallow clone) |
| Q4 | Branch strategy? | **Always new** / Default / User choice | **Always new** `agent/task-{id}` |
| Q5 | Always create PR? | **Yes** / On success / Optional | **Yes** (draft if partial) |
| Q6 | Remember past conversations? | **Fresh** / Last N / Full | **Fresh** each task |
| Q7 | On error, keep changes? | Discard / **Keep partial** / Ask | **Keep partial** |

---

## Mobile App (M1-M5)

| # | Question | Options | Recommendation |
|---|----------|---------|----------------|
| M1 | Support tablets? | **No** / Responsive / Optimized | **No** (phone-only MVP) |
| M2 | Dark mode? | Light / Dark / **System** / Toggle | **System** preference |
| M3 | Min OS versions? | **iOS 15+, Android 10+** | ~93% coverage |
| M4 | Push notifications in MVP? | Yes / **No** | **No** (add in Phase 2) |
| M5 | Biometric for API key? | Yes / **No** | **No** (nice-to-have) |

---

## Security (S1-S3)

| # | Question | Options | Recommendation |
|---|----------|---------|----------------|
| S1 | API key storage? | Device only / **Server** / Both | **Server** (encrypted) |
| S2 | GitHub scope? | `public_repo` / **`repo`** | **`repo`** (private repos) |
| S3 | Rate limiting? | None / **Per-user** / Global | **Per-user** (10/hr, 50/day) |

---

## Operations (O1-O4)

| # | Question | Options | Recommendation |
|---|----------|---------|----------------|
| O1 | Deployment? | **Hetzner** / DigitalOcean / Fly.io | **Hetzner CX22** (~$4/mo) |
| O2 | Domain/SSL? | **Custom + Let's Encrypt** / IP only | **Custom domain** |
| O3 | Backups? | **Daily to R2** / Hourly / None | **Daily** (~$0.01/mo) |
| O4 | Monitoring? | None / **Uptime + Grafana** | **UptimeRobot** (free) |

---

## Decision Template

```
Q1: 30min
Q2: 1
Q3: 500MB
Q4: Always new
Q5: Yes
Q6: Fresh
Q7: Keep partial
M1: No
M2: System
M3: iOS 15+, Android 10+
M4: No
M5: No
S1: Server
S2: repo
S3: Per-user
O1: Hetzner
O2: Custom domain
O3: Daily to R2
O4: Uptime + Grafana
```

Or simply: **"Use all recommendations"**

---

**Last Updated**: December 2025
