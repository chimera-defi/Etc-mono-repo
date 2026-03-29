# SpecForge SaaS Deployment Guide

Two services to deploy:

| Service | Platform | Config |
|---------|----------|--------|
| Collab server (WebSocket + Hocuspocus) | Railway | `collab-server/railway.toml` |
| Web app (Next.js) | Vercel | `web/vercel.json` |

Both are provisioned via [projects.dev](https://projects.dev) (Stripe Projects) for unified billing.

---

## Quick Start (projects.dev)

```bash
# From repo root
chmod +x deploy/setup-projects-dev.sh
./deploy/setup-projects-dev.sh
```

This runs `stripe projects init` → `stripe projects add railway` → `stripe projects add vercel` and pulls credentials into `web/.env.local`.

---

## Manual Setup

### Step 1 — Railway (collab server)

**One-time configuration in Railway dashboard:**

1. Create a new service → connect this GitHub repo
2. **Root Directory**: leave EMPTY (the Dockerfile copies `lib/` from repo root)
3. **Dockerfile Path**: `ideas/collab-markdown-spec-studio/collab-server/Dockerfile`
4. **Variables** (Settings > Variables):
   ```
   PORT=4321
   RAILWAY_ENVIRONMENT=production
   SPECFORGE_COLLAB_SECRET=<openssl rand -hex 32>
   ```
5. **Volume** (Settings > Volumes): attach a volume, mount path `/var/lib/specforge`
   - Railway auto-injects `RAILWAY_VOLUME_MOUNT_PATH` — the collab server reads this automatically

**Deploy:**
```bash
railway login
railway link   # link this repo to your Railway project
railway up --service specforge-collab
```

**Verify:**
```bash
curl https://<your-service>.up.railway.app/health
# { "status": "ok", "room_snapshot_count": 0, ... }
```

### Step 2 — Update NEXT_PUBLIC_COLLAB_URL

Once Railway gives you a public domain, update `web/vercel.json`:
```json
{
  "env": {
    "NEXT_PUBLIC_COLLAB_URL": "wss://<your-service>.up.railway.app"
  }
}
```

Or set it as a Vercel environment variable instead (takes precedence over `vercel.json`).

### Step 3 — Vercel (web app)

```bash
cd ideas/collab-markdown-spec-studio/web

# First time
vercel link

# Add secrets (not stored in vercel.json)
vercel env add ANTHROPIC_API_KEY        # your Anthropic key for Claude API assist
# Optional — auto-derived from NEXT_PUBLIC_COLLAB_URL if not set:
# vercel env add COLLAB_HEALTH_URL      # https://<your-service>.up.railway.app/health

# Deploy
vercel --prod
```

---

## Architecture

```
Browser
  │
  ├─ HTTPS/WSS ──► Vercel (Next.js)          wss://app.specforge.com
  │                  │
  │                  └─ /api/collab/health ──► Railway (proxy, server-side)
  │
  └─ WSS ──────────► Railway (Hocuspocus)    wss://specforge-collab.up.railway.app
                       │
                       └─ /var/lib/specforge  (persistent volume, room snapshots)
```

**Key env vars:**

| Var | Where set | Purpose |
|-----|-----------|---------|
| `NEXT_PUBLIC_COLLAB_URL` | `vercel.json` or Vercel dashboard | WebSocket URL clients connect to |
| `ANTHROPIC_API_KEY` | Vercel dashboard (secret) | Claude API for AI assist |
| `COLLAB_HEALTH_URL` | Vercel dashboard (optional) | Server-side health proxy override |
| `SPECFORGE_COLLAB_SECRET` | Railway dashboard (secret) | JWT signing key for collab tokens |
| `RAILWAY_VOLUME_MOUNT_PATH` | Railway auto-injected | Room snapshot storage path |
| `PORT` | Railway service variable | Port for WebSocket + health (Railway single-port mode) |

---

## Single-Port Mode (Railway)

Railway exposes one port per service publicly. The collab server detects `RAILWAY_ENVIRONMENT`
and serves both WebSocket upgrades and `/health` HTTP on the same `PORT`:

- WebSocket connections → `ws://` upgrade event (handled by Hocuspocus)
- `GET /health` → regular HTTP request event (handled by our health handler)

On Fly.io and locally, the original dual-port setup is preserved:
- `PORT` (default 4321) — WebSocket
- `HEALTH_PORT` (default `PORT+1`) — health HTTP

---

## Collab URL Reference

| Environment | `NEXT_PUBLIC_COLLAB_URL` |
|-------------|--------------------------|
| Local dev | `ws://127.0.0.1:4321` |
| Railway (auto domain) | `wss://<service>.up.railway.app` |
| Railway (custom domain) | `wss://collab.specforge.com` |
| Fly.io (fallback) | `wss://specforge-collab.fly.dev` |
