# Project Status

> Last updated: January 2026

## Summary

| Category | Count |
|----------|-------|
| Active/Production | 2 |
| In Development | 2 |
| Research/Evaluation | 3 |
| Ideas Backlog | 6 |
| **Total** | **13** |

---

## Active / Production

### Wallet Radar
| | |
|---|---|
| **Location** | `wallets/` |
| **Status** | ✅ Production |
| **Website** | walletradar.org |
| **Description** | Developer-focused crypto wallet comparison platform |
| **Metrics** | 24 software wallets, 23 hardware wallets, 27 crypto cards, 20+ ramps |
| **Tech Stack** | Next.js 14, React, TypeScript, Tailwind CSS |
| **Commands** | `cd wallets/frontend && npm run dev` |

### Monad Validator Infrastructure
| | |
|---|---|
| **Location** | `staking/impl/monad/` |
| **Status** | ✅ Operational |
| **Description** | Validator setup, monitoring, and operations for Monad network |
| **Components** | infra/, runbook/, scripts/, watchers/ |
| **Commands** | `cd staking/impl/monad/infra && ./scripts/healthcheck.sh` |

---

## In Development

### Aztec Liquid Staking
| | |
|---|---|
| **Location** | `staking/aztec/` |
| **Status** | 🔧 Development |
| **Description** | Privacy-focused liquid staking using Aztec Network |
| **Deliverables** | 4 Noir contracts, 34 unit tests passing, CI/CD pipeline |
| **Contracts** | staking-pool, staked-token, withdrawal-queue, validator-registry |
| **Key Docs** | EXECUTIVE-SUMMARY.md, ECONOMICS.md, IMPLEMENTATION-PLAN.md |
| **Timeline** | 6-month build plan documented |

### Staking Research
| | |
|---|---|
| **Location** | `staking/research/` |
| **Status** | 📚 Active |
| **Description** | Market research and opportunity analysis |
| **Key Finding** | $66B+ locked in liquid staking; Aztec is first-mover opportunity |
| **Docs** | Liquid Staking Landscape 2025, OPPORTUNITIES.md |

---

## Research / Evaluation

### AI Constraint Toolkits
| | |
|---|---|
| **Location** | `ai_experiments/` |
| **Status** | 📋 Research |
| **Evaluating** | Spec Kit, Guardrails AI, Microsoft Guidance, Outlines, B-MAD |
| **Structure** | Each toolkit has README, UNDERSTANDING.md, TASKS.md, NEXT_STEPS.md |

### Mobile Framework Comparison
| | |
|---|---|
| **Location** | `mobile_experiments/` |
| **Status** | ✅ Complete (Phase 1) |
| **Results** | Capacitor 4.80/5, React Native 4.43/5, Flutter 4.05/5, Valdi 2.95/5 |
| **Finding** | React Native has 58x more StackOverflow questions than Capacitor |

### Smart Contract Framework Comparison
| | |
|---|---|
| **Location** | `Dapps/` |
| **Status** | ✅ Complete |
| **Compared** | Foundry vs Hardhat + Hybrid template |
| **Finding** | Foundry 2.4x faster compile, 11.5x faster tests |
| **Commands** | `cd Dapps/Foundry/app && forge test` |

---

## Ideas Backlog

### Cadence (Voice Coding Assistant)
| | |
|---|---|
| **Location** | `ideas/voice-coding-assistant/` |
| **Status** | 🧪 Prototype |
| **Description** | Multi-platform voice-controlled coding assistant |
| **Components** | backend, api, app, web-frontend, prototype, setup |

### Automated Trading System
| | |
|---|---|
| **Location** | `ideas/automated-trading-system/` |
| **Status** | 📊 Research |
| **Description** | Automated trading system |
| **Structure** | docs/, src/, tests/, SPEC.md |

### Birthday Bot
| | |
|---|---|
| **Location** | `ideas/birthday-bot/` |
| **Status** | 📅 Planning |
| **Description** | Unified birthday management across platforms |
| **Market** | 100-150M potential users |
| **MVP Timeline** | 8-10 weeks estimated |

### Conceptual Ideas

| Idea | Description | Status |
|------|-------------|--------|
| OAuth Auto-Setup | AI-driven third-party service provisioning | 💭 Concept |
| Self-Hosted Infra | Coolify evaluation, PaaS alternatives | 💭 Exploration |
| Mobile AI Agent | Native app with camera, location, offline support | 💭 Concept |

---

## Status Legend

| Icon | Meaning |
|------|---------|
| ✅ | Production / Complete |
| 🔧 | In Development |
| 📚 | Active Research |
| 📋 | Research / Evaluation |
| 🧪 | Prototype |
| 📊 | Research Phase |
| 📅 | Planning |
| 💭 | Concept |
