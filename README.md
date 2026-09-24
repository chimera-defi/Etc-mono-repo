# Experiments

Research and prototyping workspace for technology evaluation.

## Projects

### Active / Production

| Area | Description | Status |
|------|-------------|--------|
| [**wallets/**](./wallets/) | Wallet Radar - crypto wallet comparison platform (100+ wallets) | ✅ Production |
| [**staking/monad/**](./staking/monad/) | Monad validator infrastructure (runbook, monitoring, deployment) | ✅ Operational |

### In Development

| Area | Description | Status |
|------|-------------|--------|
| [**staking/aztec/**](./staking/aztec/) | Aztec liquid staking (4 Noir contracts, 34 tests passing) | 🔧 Development |
| [**staking/research/**](./staking/research/) | Staking market research ($66B+ landscape analysis) | 📚 Active |

### Research / Evaluation

| Area | Description | Status |
|------|-------------|--------|
| [**ai_experiments/**](./ai_experiments/) | AI constraint toolkits (Spec Kit, Guardrails AI, Guidance, Outlines, B-MAD) | 📋 Research |
| [**mobile_experiments/**](./mobile_experiments/) | Cross-platform mobile frameworks (Capacitor, React Native, Flutter, Valdi) | ✅ Complete |
| [**Dapps/**](./Dapps/) | Smart contract framework comparison (Foundry vs Hardhat + Hybrid template) | ✅ Complete |

### Ideas Backlog

| Area | Description | Status |
|------|-------------|--------|
| [**ideas/voice-coding-assistant/**](./ideas/voice-coding-assistant/) | Cadence - voice-controlled coding assistant | 🧪 Prototype |
| [**ideas/birthday-bot/**](./ideas/birthday-bot/) | Unified birthday management across platforms | 📅 Planning |
| [**ideas/automated-trading-system/**](./ideas/automated-trading-system/) | Automated trading system | 📊 Research |
| [**ideas/skills-launchpad/**](./ideas/skills-launchpad/) | Launchpad for coding-agent skills, prompts, MCP tools, and install flows | 🧭 Research |
| [**ai_memory/**](./ai_memory/) | Persistent AI memory backups (Takopi + OpenClaw/Clawdbot) | 🧠 Active |

## Quick Links

### Smart Contract Frameworks
| Framework | Compile Time | Test Time | Best For |
|-----------|--------------|-----------|----------|
| **Foundry** | 0.65s | 0.13s | Speed + fuzzing (Rust) |
| **Hardhat** | 1.58s | 1.50s | JS/TS ecosystem + plugins |
| **Hybrid** | — | — | Template combining both |

👉 **[Full Comparison](./Dapps/COMPARISON.md)** | **[Hybrid Template](./Dapps/Hybrid/)**

### Mobile Frameworks (Dec 2025)
| Framework | Score | Best For |
|-----------|-------|----------|
| **Capacitor** | 4.80/5 | Web devs, browser + mobile |
| **React Native** | 4.43/5 | Native perf + large ecosystem |
| **Flutter** | 4.05/5 | Best raw performance |

### Wallet Recommendations
| Use Case | Wallet | Devices |
|----------|--------|---------|
| Development | **Rabby** | 📱🌐💻 |
| Production | **Trust Wallet** | 📱🌐 |
| Enterprise | **Safe** | 📱🌐 |
| Hardware | **Trezor Safe 5** | Cold storage |

### AI Toolkits
| Toolkit | Use Case |
|---------|----------|
| **Spec Kit** | Deterministic, auditable responses |
| **Guardrails AI** | Compliance & safety rails |
| **Microsoft Guidance** | Token-level control |
| **Outlines** | Structured data via grammars |
| **B-MAD** | AI development lifecycle |

## Development

```bash
# Wallets - Wallet Radar
cd wallets/frontend && npm run dev

# Staking - Aztec contracts
cd staking/aztec && aztec-nargo compile

# Staking - Monad validator
cd staking/monad/infra && ./scripts/healthcheck.sh

# Smart contracts - Foundry
cd Dapps/Foundry/app && forge test

# Smart contracts - Hardhat
cd Dapps/Hardhat/app && npx hardhat test

# Mobile experiments
cd mobile_experiments/Capacitor/app && npm run dev

# Refresh wallet data
cd wallets/scripts && ./refresh-github-data.sh
```

## Structure

```
.
├── wallets/              # Wallet Radar - crypto wallet comparison platform
├── staking/              # Staking projects
│   ├── aztec/            # Aztec liquid staking (Noir contracts)
│   ├── monad/            # Monad validator infrastructure
│   └── research/         # Staking market research
├── Dapps/                # Smart contract framework comparison (Foundry vs Hardhat)
├── mobile_experiments/   # Mobile framework comparison (Capacitor, React Native, Flutter)
├── ai_experiments/       # AI constraint toolkit research (Spec Kit, Guardrails, etc.)
├── ideas/                # Future exploration concepts
│   ├── voice-coding-assistant/  # Cadence - voice coding
│   ├── birthday-bot/            # Birthday management
│   ├── automated-trading-system/ # Trading system
│   └── skills-launchpad/        # Skills catalog + install/distribution idea
├── ai_memory/            # Persistent AI memory backups for ongoing work
├── .github/              # CI workflows + PR templates
├── .cursor/              # Agent onboarding & PR attribution guides
└── .cursorrules          # AI assistant guidelines (all agents)
```

Each directory contains a detailed README with setup instructions and findings.

## For AI Agents

**PR Attribution:** Required for all AI-generated PRs. See `.cursorrules` "PR Attribution Requirements" section at the top for the complete guide.

**Commit format (new commits only):**
`type(scope): subject [Agent: <MODEL NAME>]`

Required commit trailer:
`Co-authored-by: Chimera <chimera_defi@protonmail.com>`

**Enforcement:**
- Local hook: `.githooks/commit-msg`
- PR commit CI: `.github/workflows/commit-message-check.yml`
- PR description CI: `.github/workflows/pr-attribution-check.yml`

Set hooks path once per clone:
`git config core.hooksPath .githooks`

## Shared Guidance

- `docs/shared/AI_RAILS.md`
- `docs/shared/GUIDELINES.md`
- `docs/shared/BUILD_TOOLS.md`
- `docs/shared/ENHANCEMENTS.md`
