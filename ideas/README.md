# Ideas

High-level ideas and concepts for future exploration and implementation.

## LOT: Linked OAuth Tooling (Priority Concept)

> **Status**: Research & Design Phase  
> **Details**: [lot-oauth-setup/RESEARCH.md](./lot-oauth-setup/RESEARCH.md) | [Implementation Plan](./lot-oauth-setup/IMPLEMENTATION_PLAN.md)

### The Problem

Manual setup of third-party services (Google Analytics, Stripe, Supabase, etc.) requires:
1. Navigating to provider dashboard → Creating project
2. Generating credentials → Copying API keys
3. Configuring environment → Creating `.env` files
4. Installing dependencies → Updating `package.json`
5. Writing boilerplate → Initializing SDK
6. Verifying setup → Testing connection

**Time cost**: 10-30 minutes per integration  
**Error rate**: High (wrong env var names, missing scopes, version mismatches)

### The Solution: LOT

**LOT (Linked OAuth Tooling)** is an MCP server + IDE extension that automates the entire integration process:

```
Developer: "Set up Stripe for my Next.js project"
→ LOT handles OAuth popup
→ User authorizes
→ LOT fetches API keys (publishable, secret, webhook)
→ LOT creates .env.local with correct variable names
→ LOT installs stripe package
→ LOT generates lib/stripe.ts, webhook handler, StripeProvider
→ LOT provides verification checklist
```

**From OAuth consent to committed code in 30 seconds.**

### Key Differentiator

Unlike existing MCP servers (Composio, MCP Gateway) that focus on **runtime API access**, LOT focuses on **setup-time automation**:

| Feature | Composio/Rube | MCP Gateway | LOT |
|---------|--------------|-------------|-----|
| OAuth handling | ✅ | ✅ | ✅ |
| Runtime API calling | ✅ | ✅ | ❌ |
| Config extraction | ❌ | ❌ | ✅ |
| Code generation | ❌ | ❌ | ✅ |
| Project detection | ❌ | ❌ | ✅ |
| Env var setup | ❌ | ❌ | ✅ |
| Dependency install | ❌ | ❌ | ✅ |

### Research Findings

**Existing MCP Landscape** (as of Dec 2024):
- **MCP Gateway Registry** (343★) - Enterprise OAuth gateway, overlaps on auth flow
- **Composio Rube** (297★) - 500+ app integrations, runtime focus
- **golf-mcp** (803★) - Production MCP framework with auth
- **jetski** (190★) - Zero-config auth for MCP

None of these solve the **setup automation** problem that LOT targets.

### Priority Providers

| Provider | Complexity | Setup Time Saved |
|----------|------------|------------------|
| Google Analytics | Medium | 15 min |
| Stripe | High | 30 min |
| Supabase | Medium | 20 min |
| Auth0/Clerk | High | 25 min |
| Sentry | Low | 10 min |
| SendGrid/Resend | Low | 10 min |

### Implementation Approach

**Recommended**: MCP Server + IDE Extension (Cursor/VS Code)
- MCP Server handles OAuth flows and provider APIs
- IDE Extension handles UI (OAuth popup, file confirmations)
- Secure token storage via OS keychain

See [detailed implementation plan](./lot-oauth-setup/IMPLEMENTATION_PLAN.md) for 16-week roadmap.

---

## Self-Hosted Infrastructure Tooling

**Exploration**: Evaluate **Coolify** for self-hosted VPS management and explore self-hosted reseller alternatives.

**Coolify**: Self-hosted PaaS alternative to Heroku/Vercel that runs on your own VPS. Provides:
- One-click deployments
- SSL certificate management
- Database management
- Docker container orchestration
- Git-based deployments

**Use Cases**:
- Cost-effective hosting for side projects
- Full control over infrastructure
- Privacy-focused deployments
- Learning DevOps practices

**Research Areas**:
- Coolify setup and configuration
- Self-hosted reseller platforms (WHMCS alternatives)
- Cost comparison vs. managed services
- Security and maintenance considerations

---

## Mobile-Native AI Agent App

**Concept**: Build a mobile-first AI agent application that leverages native mobile capabilities (camera, location, notifications, offline support) for enhanced AI interactions.

**Key Features**:
- Native mobile UI/UX (not web wrapper)
- Camera integration for visual AI (document scanning, object recognition)
- Location-aware context
- Push notifications for AI responses
- Offline mode with on-device models where possible
- Voice input/output
- Background processing

**Technical Considerations**:
- Framework choice: React Native, Flutter, or native (Swift/Kotlin)
- On-device AI models vs. cloud API calls
- Privacy and data handling
- Cross-platform vs. platform-specific features

**Differentiators**: Native mobile experience with AI capabilities that web apps can't match (camera, offline, notifications).

---

## Birthday Bot

**Problem**: People frequently forget their friends' and family members' birthdays. Birthday data is scattered across Facebook, Instagram, Google Contacts, phone contacts, and calendar apps, with no unified way to manage, prioritize, and remember them.

**Solution**: A unified birthday management app that aggregates birthdays from multiple sources (phone contacts, Google Contacts, Google Calendar, Facebook), deduplicates conflicting entries, lets users prioritize contacts, and sends reliable notifications.

**Key Features**:
- Multi-source aggregation (phone, Google, Facebook, manual entry)
- Intelligent deduplication with conflict resolution
- Customizable notifications (1 week, 3 days, 1 day before)
- Birthday groups/prioritization
- iOS + Android native apps + web dashboard
- Cloud sync across devices

**Status**: Research phase completed. MVP is feasible in 8-10 weeks.

**Market**: 100-150M potential users globally. Direct competitors exist (Birday, Birthday Sweet, Hip) but are fragmented. Opportunity to differentiate via superior UX and multi-source aggregation.

**Key Challenges**:
- Instagram has no official API for birthday data (requires browser extension workaround)
- Saturated market requires strong differentiation
- Requires monetization strategy to sustain development

**Documentation**:
- [Birthday Bot Main Overview](./birthday-bot/README.md)
- [API Feasibility Analysis](./birthday-bot/01-research/API_FEASIBILITY.md)
- [Market Analysis](./birthday-bot/01-research/MARKET_ANALYSIS.md)
- [Technical Specification](./birthday-bot/02-spec/TECHNICAL_SPEC.md)

---

## Tooling to Explore

- **Coolify**: Self-hosted PaaS for VPS management
- Self-hosted reseller platforms (alternatives to WHMCS)
