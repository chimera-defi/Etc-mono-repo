# Infrastructure Options: Detailed Comparison

Verified data from GitHub API (December 2025).

---

## Compute Platforms Comparison

### GitHub Stars & Community

| Platform | GitHub Stars | Primary Repo | Notes |
|----------|--------------|--------------|-------|
| **Vercel** | 14,459 ⭐ | vercel/vercel | Web-focused, not for long-running |
| **Fly.io** | 1,588 ⭐ | superfly/flyctl | Machines API for ephemeral |
| **Modal** | 1,049 ⭐ | modal-labs/modal-examples | Purpose-built for compute |
| **Railway** | 425 ⭐ | railwayapp/cli | Simple PaaS |
| **Replicate** | 9,123 ⭐ | replicate/cog | ML-focused containers |

### Feature Comparison

| Feature | Fly.io | Modal | Railway | Vercel | AWS Lambda |
|---------|--------|-------|---------|--------|------------|
| **Ephemeral containers** | ✅ Machines API | ✅ Native | ❌ No | ❌ No | ✅ Native |
| **Auto-stop on idle** | ✅ Yes | ✅ Yes | ❌ No | N/A | ✅ Yes |
| **Cold start** | 2-5s | 1-3s | N/A | <1s | 1-5s |
| **Max runtime** | Unlimited | 24h | Unlimited | 5min/30s | 15min |
| **Docker support** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes |
| **GPU support** | ✅ Yes | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Persistent volumes** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| **WebSocket support** | ✅ Yes | ✅ Yes | ✅ Yes | ⚠️ Limited | ⚠️ Via API GW |
| **Always-on option** | ✅ Yes | ❌ No | ✅ Yes | ✅ Yes | ❌ No |

### Pricing Comparison (Estimated)

| Platform | Idle Cost | Per-second Cost | Min Billing | Free Tier |
|----------|-----------|-----------------|-------------|-----------|
| **Fly.io** | $0 (stopped) | ~$0.00004/s | 1s | 3 shared VMs |
| **Modal** | $0 | ~$0.000016/s | 1s | $30/mo credits |
| **Railway** | $5/mo min | $0.000463/min | 1min | $5 trial |
| **AWS Lambda** | $0 | $0.0000167/s | 1ms | 1M req/mo |
| **AWS Fargate** | $0 (stopped) | ~$0.04/hr | 1min | None |

### Recommendation Analysis

**For our use case (ephemeral coding agents):**

| Requirement | Best Options |
|-------------|--------------|
| Ephemeral workers | Modal, Fly.io, Lambda |
| Long-running tasks (>15min) | Fly.io, Modal |
| Always-on coordinator | Fly.io, Railway |
| Lowest cold start | Modal (1-3s) |
| Simplest DX | Modal, Railway |
| Most flexible | Fly.io |

---

## NEW OPTION: Background Job Platforms

These platforms are specifically designed for background tasks and could simplify our architecture significantly:

| Platform | GitHub Stars | Description |
|----------|--------------|-------------|
| **Trigger.dev** | 12,902 ⭐ | "Build and deploy fully-managed AI agents and workflows" |
| **Hatchet** | 6,261 ⭐ | "Run background tasks at scale" |
| **Inngest** | 4,250 ⭐ | "Workflow orchestration platform" |

### Why These Matter

These platforms handle:
- ✅ Job queuing and scheduling
- ✅ Retries and error handling
- ✅ Long-running task management
- ✅ Real-time progress updates
- ✅ Ephemeral execution environments

**Trigger.dev** is particularly interesting because:
- Explicitly mentions "AI agents" in description
- 12.9k stars = strong community
- Handles the coordinator + worker pattern natively
- Built-in WebSocket for real-time updates

---

## Database Options Comparison

### GitHub Stars & Community

| Database | GitHub Stars | Type | Notes |
|----------|--------------|------|-------|
| **Supabase** | 94,006 ⭐ | PostgreSQL + Auth + Realtime | Massive community |
| **Dragonfly** | 29,436 ⭐ | Redis replacement | Much faster than Redis |
| **Valkey** | 23,813 ⭐ | Redis fork (Linux Foundation) | Redis license concerns |
| **Neon** | 20,337 ⭐ | Serverless Postgres | Scale to zero |
| **PlanetScale** | 631 ⭐ (CLI) | MySQL (Vitess) | Being sunset |

### Feature Comparison

| Feature | Supabase | Neon | PlanetScale | Upstash |
|---------|----------|------|-------------|---------|
| **Database** | PostgreSQL | PostgreSQL | MySQL | Redis |
| **Scale to zero** | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes |
| **Branching** | ❌ No | ✅ Yes | ✅ Yes | ❌ No |
| **Realtime** | ✅ Built-in | ❌ No | ❌ No | ✅ Pub/Sub |
| **Auth** | ✅ Built-in | ❌ No | ❌ No | ❌ No |
| **Edge functions** | ✅ Yes | ❌ No | ❌ No | ✅ Yes |
| **Free tier** | ✅ Generous | ✅ Generous | ⚠️ Limited | ✅ Generous |

### Pricing Comparison

| Service | Free Tier | Paid Starting |
|---------|-----------|---------------|
| **Supabase** | 500MB, 2 projects | $25/mo |
| **Neon** | 0.5GB, scale to zero | $19/mo |
| **Upstash** | 10k commands/day | Pay per request |
| **PlanetScale** | Being sunset | — |

### Recommendation Analysis

**For our use case:**

| Need | Recommendation |
|------|----------------|
| Real-time updates to mobile | **Supabase** (built-in realtime) |
| Task state / pub-sub | **Upstash Redis** or Supabase Realtime |
| Persistent storage | **Supabase** or **Neon** |
| Auth | **Supabase** (built-in) |

---

## Object Storage Comparison

| Service | Egress Cost | Free Tier | Notes |
|---------|-------------|-----------|-------|
| **Cloudflare R2** | $0 (!) | 10GB storage | No egress fees |
| **AWS S3** | $0.09/GB | 5GB | Standard choice |
| **Supabase Storage** | Included | 1GB | Integrated with Supabase |
| **Tigris (Fly.io)** | $0.01/GB | 5GB | Fly-native |

---

## Revised Recommendations

Based on verified data, here are updated recommendations:

### Option A: Simplest (Trigger.dev + Supabase)

```
Mobile App
    │
    ▼
┌─────────────────────────────┐
│  Trigger.dev                │  ← Handles all orchestration
│  - Task queuing             │
│  - Long-running agents      │
│  - Retries                  │
│  - Real-time updates        │
└─────────────────────────────┘
    │
    ▼
┌─────────────────────────────┐
│  Supabase                   │  ← All-in-one backend
│  - PostgreSQL (tasks)       │
│  - Realtime (WebSocket)     │
│  - Auth (OAuth)             │
│  - Storage (logs)           │
└─────────────────────────────┘
```

**Pros**: 
- Trigger.dev handles worker orchestration
- Supabase handles everything else
- Fewest moving parts
- 94k + 12.9k = massive community support

**Cons**:
- Less control over execution environment
- Trigger.dev pricing at scale

### Option B: Most Control (Fly.io + Upstash + Neon)

```
Mobile App
    │
    ▼
┌─────────────────────────────┐
│  Fly.io Coordinator         │  ← Always-on, cheap
│  - WebSocket hub            │
│  - Auth                     │
└─────────────────────────────┘
    │
    ▼
┌─────────────────────────────┐
│  Fly.io Workers             │  ← Ephemeral via Machines API
│  - Docker containers        │
│  - Full control             │
└─────────────────────────────┘
    │
    ▼
┌─────────────────────────────┐
│  Upstash (Redis)            │  ← Pub/sub, state
│  Neon (Postgres)            │  ← Persistent data
│  R2 (Storage)               │  ← Logs, artifacts
└─────────────────────────────┘
```

**Pros**:
- Full control over workers
- Can customize Docker images
- Predictable pricing

**Cons**:
- More to build and maintain
- Multiple services to manage

### Option C: Balanced (Modal + Supabase)

```
Mobile App
    │
    ▼
┌─────────────────────────────┐
│  Supabase                   │  ← Coordinator + storage + auth
│  - Edge Functions           │
│  - Realtime                 │
│  - PostgreSQL               │
└─────────────────────────────┘
    │
    ▼
┌─────────────────────────────┐
│  Modal                      │  ← Ephemeral compute
│  - Purpose-built            │
│  - Fast cold start          │
│  - GPU if needed            │
└─────────────────────────────┘
```

**Pros**:
- Modal is purpose-built for ephemeral compute
- Supabase handles coordinator duties
- Good DX for both

**Cons**:
- Modal has no always-on option
- Need Edge Functions for coordinator logic

---

## Summary Scoring

| Option | Simplicity | Control | Community | Cost | Score |
|--------|------------|---------|-----------|------|-------|
| **A: Trigger.dev + Supabase** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | **17/20** |
| **B: Fly.io + Upstash + Neon** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | **15/20** |
| **C: Modal + Supabase** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | **16/20** |

---

## My Updated Recommendation

**Option A: Trigger.dev + Supabase** 

Reasons:
1. **Trigger.dev** (12.9k ⭐) is literally built for "AI agents and workflows"
2. **Supabase** (94k ⭐) has massive community and handles auth, realtime, storage
3. Fewest services to manage
4. Both have generous free tiers for MVP

**However**, if you need more control over the execution environment (custom Docker images, specific tooling), **Option B (Fly.io)** is better.

---

**Your call**: 
- A) Trigger.dev + Supabase (simplest)
- B) Fly.io + Upstash + Neon (most control)  
- C) Modal + Supabase (balanced)
- D) Something else?
