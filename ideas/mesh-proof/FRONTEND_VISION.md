# Frontend Vision

## Design Principles

1. **Terminal-native aesthetic:** The product is infrastructure. The UI should feel like a modern developer tool (dark mode, monospace accents, crisp borders) — not a consumer app.
2. **Transparency first:** Every onchain action is visible. Buyers see exact USDC flow. Providers see exact job breakdown. No hidden fees.
3. **Speed signals:** Discovery latency and provider ranking are shown in real time. Fast providers get visual priority.
4. **Progressive disclosure:** Default view is simple (search → pay → result). Power users can expand channel details, attestation proofs, and mesh topology.

## Key Screens

### Discovery (Home)
- Search bar (model name or hash)
- Live provider grid: latency sparkline, quality score badge, price per 1K tokens, stake amount
- Filter: model family, max latency, min quality score, max price
- "Run Local Provider" CTA for users with GPU

### Job Console
- Prompt textarea with token counter
- Selected provider card (model hash, attestation link, stake, quality)
- Channel status: pending → open → inference → claim → settled (stepper)
- Cost estimate before job start
- Output viewer with markdown rendering
- Job history sidebar

### Provider Dashboard
- Earnings chart (USDC + $VIEM)
- Jobs served counter + success rate
- Quality score history (weekly updates)
- Active attestations table (model, stake, expiry)
- Batch settlement queue status
- "Attest New Model" flow

### Governance (veVIEM)
- Lock UI: amount slider + duration slider → veVIEM preview
- Gauge allocation: drag veVIEM across provider categories or specific providers
- Fee share claim button + claimable amount
- Reward epoch countdown

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **Onchain:** wagmi + viem + RainbowKit
- **Charts:** Recharts or Tremor
- **Icons:** Lucide React

## Responsive Strategy

- **Desktop (primary):** Full dashboard experience for providers and governance
- **Tablet:** Discovery + job console; governance read-only
- **Mobile:** Discovery + simple job console only; no provider setup, no governance voting
