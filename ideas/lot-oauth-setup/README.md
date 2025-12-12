# LOT: Linked OAuth Tooling

> **"From OAuth consent to committed code in 30 seconds"**

## Overview

LOT is an MCP server + IDE extension concept that automates third-party service integration for developers. Instead of manually copying API keys, creating env files, and writing boilerplate, LOT handles the entire setup through an OAuth flow.

## Documents

| Document | Description |
|----------|-------------|
| [RESEARCH.md](./RESEARCH.md) | Comprehensive research including problem analysis, MCP landscape review, architecture options, and differentiation |
| [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) | 16-week implementation roadmap with technical decisions and code examples |

## Quick Summary

### Problem
Setting up integrations (Stripe, GA, Supabase) takes 10-30 minutes of tedious, error-prone work:
- Copy/paste API keys
- Create env files with correct variable names
- Install correct packages
- Write initialization boilerplate
- Verify connection works

### Solution
```
"Set up Stripe for my Next.js project"
→ OAuth popup → Authorize → Done
→ .env.local created with keys
→ stripe package installed
→ lib/stripe.ts, webhook handler generated
→ Verification checklist provided
```

### Key Insight

Existing MCP solutions (Composio, MCP Gateway) enable AI to **call** authenticated APIs at runtime. LOT enables AI to **set up** integrations at development time. Different problem, different solution.

## Research Findings

### Overlap Analysis

| Project | What It Does | Overlap |
|---------|-------------|---------|
| MCP Gateway Registry (343★) | Enterprise OAuth gateway | OAuth flow only |
| Composio Rube (297★) | 500+ app runtime integrations | None (runtime focus) |
| golf-mcp (803★) | MCP framework with auth | Infrastructure only |

**Conclusion**: No existing solution targets setup-time automation.

### Proposed Architecture

```
┌─────────────────────┐     ┌─────────────────────┐
│   IDE Extension     │     │    MCP Server       │
│   (Cursor/VSCode)   │◄───►│    (lot-mcp)        │
│                     │     │                     │
│  - OAuth popup UI   │     │  - Provider configs │
│  - File operations  │     │  - OAuth handlers   │
│  - Confirmations    │     │  - Code templates   │
└─────────────────────┘     └─────────────────────┘
```

## Priority Providers

1. **Google Analytics** - High demand, straightforward
2. **Stripe** - High value, complex setup
3. **Supabase** - Popular full-stack choice
4. **Auth0/Clerk** - Authentication complexity
5. **Sentry** - Quick win, simple setup
6. **SendGrid/Resend** - Email service demand

## Next Steps

1. **Validate demand** - Survey developers on setup pain points
2. **Prototype** - Build Stripe + Next.js as proof of concept
3. **Open source** - Ship early, gather feedback
4. **Expand** - Add providers based on community demand

## Related Links

- [MCP Specification](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Composio Rube](https://github.com/ComposioHQ/Rube) (related, different focus)
- [MCP Gateway Registry](https://github.com/agentic-community/mcp-gateway-registry) (related, different focus)
