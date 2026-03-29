#!/usr/bin/env bash
# SpecForge SaaS deployment via projects.dev (Stripe Projects)
#
# Prerequisites:
#   - Stripe CLI installed: https://stripe.com/docs/stripe-cli
#   - Access to projects.dev (public preview): https://projects.dev
#   - Run from the repo root
#
# What this provisions:
#   - Railway service  → collab-server (WebSocket + Hocuspocus, persistent volume)
#   - Vercel project   → web app (Next.js, serverless)
#   All billed under your Stripe account.
#
# Usage:
#   chmod +x deploy/setup-projects-dev.sh
#   ./deploy/setup-projects-dev.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "🚀 SpecForge SaaS setup via projects.dev"
echo ""

# ── 1. Init projects.dev (creates .stripe/projects.json) ──────────────────────
echo "→ Initializing Stripe Projects..."
stripe projects init

# ── 2. Provision Railway (collab server) ──────────────────────────────────────
echo ""
echo "→ Provisioning Railway (collab WebSocket server)..."
stripe projects add railway

# ── 3. Provision Vercel (web app) ─────────────────────────────────────────────
echo ""
echo "→ Provisioning Vercel (Next.js web app)..."
stripe projects add vercel

# ── 4. Pull env credentials into .env.local ───────────────────────────────────
echo ""
echo "→ Syncing credentials to web/.env.local..."
cd web
stripe projects env --pull --env-file .env.local
cd "$REPO_ROOT"

echo ""
echo "✅ Infrastructure provisioned. Next steps:"
echo ""
echo "  1. Configure the Railway service:"
echo "     - In Railway dashboard, open the new service"
echo "     - Settings > Source: set Dockerfile Path to:"
echo "         ideas/collab-markdown-spec-studio/collab-server/Dockerfile"
echo "     - Leave Root Directory EMPTY (needs repo root as build context)"
echo "     - Add a Volume → mount path: /var/lib/specforge"
echo "     - Add variables:"
echo "         PORT=4321"
echo "         RAILWAY_ENVIRONMENT=production"
echo "         SPECFORGE_COLLAB_SECRET=<run: openssl rand -hex 32>"
echo ""
echo "  2. Deploy collab server:"
echo "     railway link   # link this repo to the Railway project"
echo "     railway up --service specforge-collab"
echo ""
echo "  3. Copy the Railway public domain (e.g. specforge-collab.up.railway.app)"
echo "     and update web/vercel.json → NEXT_PUBLIC_COLLAB_URL:"
echo "         wss://specforge-collab.up.railway.app"
echo ""
echo "  4. Add secrets to Vercel:"
echo "     vercel env add ANTHROPIC_API_KEY  (paste your key)"
echo ""
echo "  5. Deploy web app:"
echo "     cd web && vercel --prod"
echo ""
echo "  6. Verify:"
echo "     curl https://specforge-collab.up.railway.app/health"
echo "     # Expected: { \"status\": \"ok\", ... }"
