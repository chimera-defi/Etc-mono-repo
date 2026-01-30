# Experiments

Research and prototyping workspace for technology evaluation.

## Projects

| Area | Description | Status |
|------|-------------|--------|
| [**wallets/**](./wallets/) | Crypto wallet comparison (24 software + 23 hardware wallets + 12 credit cards) | ✅ Active |
| [**Dapps/**](./Dapps/) | Smart contract framework comparison (Foundry vs Hardhat + Hybrid template) | ✅ Complete |
| [**mobile_experiments/**](./mobile_experiments/) | Cross-platform mobile frameworks (Capacitor, React Native, Flutter, Valdi) | ✅ Complete |
| [**ai_experiments/**](./ai_experiments/) | AI constraint toolkits (Spec Kit, Guardrails AI, Guidance, Outlines, B-MAD) | 📋 Research |
| [**ideas/**](./ideas/) | Future exploration concepts (OAuth automation, self-hosted infra, mobile AI agents) | 💡 Backlog |

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
├── wallets/              # Crypto wallet comparison (software + hardware + credit cards)
├── Dapps/                # Smart contract framework comparison (Foundry vs Hardhat)
├── mobile_experiments/   # Mobile framework comparison (Capacitor, React Native, Flutter)
├── ai_experiments/       # AI constraint toolkit research (Spec Kit, Guardrails, etc.)
├── ideas/                # Future exploration concepts
├── .github/              # CI workflows + PR templates
├── .cursor/              # Agent onboarding & PR attribution guides
└── .cursorrules          # AI assistant guidelines (all agents)
```

Each directory contains a detailed README with setup instructions and findings.

## For AI Agents

**PR Attribution:** Required for all AI-generated PRs. See `.cursorrules` "PR Attribution Requirements" section at the top for the complete guide.

**Enforcement:** PR template (`.github/pull_request_template.md`), git hook (`.git/hooks/commit-msg`), and CI check (`.github/workflows/pr-attribution-check.yml`) provide reminders and validation.

## Shared Guidance

- `docs/shared/AI_RAILS.md`
- `docs/shared/GUIDELINES.md`
- `docs/shared/BUILD_TOOLS.md`
- `docs/shared/ENHANCEMENTS.md`
