# Ideas

High-level ideas and concepts for future exploration and implementation.

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

## Cloudbot Launchpad

**Concept**: A paid launchpad that provisions a persistent VPS or container with Cloudbot or Moldbot pre-installed. Users pay a small monthly fee and manage their bot via a simple dashboard.

**Key Features**:
- One-click deploy (Cloudbot/Moldbot images)
- Shared container tier + dedicated VPS tier
- Basic dashboard (status, logs, restart, update)
- Backups and support as paid add-ons

**Status**: Research phase

**Documentation**:
- [Cloudbot Launchpad Overview](./cloudbot-launchpad/README.md)

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
