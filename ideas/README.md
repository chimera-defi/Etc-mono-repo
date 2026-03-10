# Ideas

High-level ideas and concepts for future exploration and implementation.

Related persistent memory snapshots: [`../ai_memory/`](../ai_memory/README.md)

## Default Ideation Standard

For new idea packs, default to a decision-ready spec stage instead of lightweight notes.

Required baseline:
1. Core pack: `EXECUTIVE_SUMMARY`, `PRD`, `SPEC`, `ARCHITECTURE_DIAGRAMS`, `VALIDATION_PLAN`, `RISK_REGISTER`, `FINANCIAL_MODEL`, `GO_NO_GO_SCORECARD`, `AGENT_HANDOFF`.
2. UX pack: `UX_PRINCIPLES`, `USER_FLOWS`, `FRONTEND_VISION`, `WIREFRAMES` (lo-fi is acceptable).
3. Competition pack: `COMPETITOR_ANALYSIS`, `COMPETITOR_MATRIX` (named + scored).
4. Review ergonomics: include `README_REVIEW_GUIDE.md` with 10-minute and 25-minute read paths.
5. Iteration quality: keep `META_LEARNINGS` and `MULTIPASS_REVIEW` updated to capture what changed and why.

Process expectations:
1. If detail is missing, ask targeted continuation questions instead of ending early.
2. End major iterations with a recap: current thesis, what changed, open decisions, go/no-go posture.
3. Use a guided clarification loop for ambiguous sections (ask, answer, commit to decisions).
4. Keep docs concise and grouped for fast human review.

## Build-Ready Addendum (For Parallel Agent Execution)

To make an idea one-shot buildable by Codex/AgentCon, each idea pack should also include:
1. A dependency-ordered `TASKS.md` with named parallel workstreams and explicit done criteria.
2. An `AGENT_HANDOFF.md` with bounded sub-agent prompts (clear file scope + objective).
3. Versioned interface contracts in `SPEC.md` (schema, events, errors, and example payloads).
4. A local-run bootstrap checklist (first 60 minutes) with fixtures and validation checks.
5. A merge contract requiring recap + unresolved-question surfacing before each pass closes.

Use `ideas/_templates/` to avoid duplicating boilerplate across idea packs.

## OAuth-Based Automated Provider Setup

**Problem**: Manual setup of third-party services (Google Analytics, authentication providers, etc.) requires copying API keys, configuring environment variables, and updating multiple files—a tedious, error-prone process.

**Solution**: Integrate OAuth flow directly into AI coding assistants (Claude, Cursor, etc.) to enable one-click provider setup. When a developer requests integration with a service, the AI presents an OAuth popup/modal. After authentication, the AI automatically:
- Fetches API keys and credentials via OAuth
- Configures environment variables
- Updates configuration files
- Sets up necessary SDKs and dependencies
- Provides verification steps

**Implementation Notes**:
- Extend AI assistant plugins/extensions to support OAuth flows
- Store credentials securely (encrypted, environment-specific)
- Support multiple providers (Google, GitHub, AWS, etc.)

## AgentRadar (ERC-8004 Trust-as-a-Service)
DeFi protocol concept for ERC-8004 agent credit with Ethos vouching + reverse-Kelly interest pricing.

- Spec: `agentradar/SPEC.md`
- Plan: `agentradar/PLAN.md`
- Generate boilerplate code with credentials pre-configured
- Fallback to manual setup if OAuth unavailable

**Benefits**: Reduces setup time from minutes to seconds, eliminates copy-paste errors, improves developer experience.

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

## Idea Validation Bot (Voice → Interview → Adversarial Validation → PRD)

**Concept**: A mobile “idea bot” that transcribes voice and runs a structured interview to refine and validate product ideas, including feasibility analysis and adversarial tests of business model and GTM, then outputs an **agent-ready PRD/spec** for coding agents.

**Documentation**:
- [Idea Validation Bot Overview](./idea-validation-bot/README.md)
- [PRD](./idea-validation-bot/PRD.md)
- [Technical Spec](./idea-validation-bot/SPEC.md)
- [Question Flow](./idea-validation-bot/QUESTION_FLOW.md)
- [Adversarial Tests](./idea-validation-bot/ADVERSARIAL_TESTS.md)

---

## Intelligence Exchange (Compliant AI Capacity Marketplace)

**Concept**: Marketplace for buying/selling **compliant inference execution capacity** (not transferable model credits/subscriptions), with policy-aware routing, metering, and settlement.

**Why now**:
- AI teams face volatile spend and reliability fragmentation.
- Direct credit resale is commonly restricted by provider terms, creating a compliance gap that can be productized.

**Documentation**:
- [Overview](./intelligence-exchange/README.md)
- [PRD](./intelligence-exchange/PRD.md)
- [Technical Spec](./intelligence-exchange/SPEC.md)

## SpecForge (Working Name): Collaborative Spec Workspace

**Concept**: Multiplayer Markdown workspace for humans + AI agents with section-level patch proposals, merge controls, provenance, and a path from approved spec bundle to starter GitHub repo.

**Why now**:
- Collaborative docs are mature, but AI-native spec workflows are still fragmented.
- Teams need auditable, merge-safe agent edits rather than raw chat copy/paste.

**Documentation**:
- [Overview](./collab-markdown-spec-studio/README.md)
- [PRD](./collab-markdown-spec-studio/PRD.md)
- [Technical Spec](./collab-markdown-spec-studio/SPEC.md)
- [Name Options](./collab-markdown-spec-studio/NAME_OPTIONS.md)

---

## Clawdbot Launchpad

**Concept**: A paid launchpad that provisions a persistent VPS or container with Clawdbot or Moltbot pre-installed. Users pay a small monthly fee and manage their bot via a simple dashboard.

**Key Features**:
- One-click deploy (Clawdbot/Moltbot images)
- Shared container tier + dedicated VPS tier
- Basic dashboard (status, logs, restart, update)
- Backups and support as paid add-ons

**Status**: Research phase

**Documentation**:
- [Clawdbot Launchpad Overview](./clawdbot-launchpad/README.md)

---

## Server Management Agent (Open Claw / Clawd Bot)

**Concept**: An AI ops agent that provisions, manages, and maintains servers and fleets. Users control it via web console, CLI, or API, with strict guardrails and audit logs.

**Key ideas**:
- Safe automation (approve/deny sensitive actions)
- Fleet‑level monitoring + incident playbooks
- Reproducible changes + immutable audit trails

**Documentation**:
- [Server Management Agent Overview](./server-management-agent/README.md)

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
