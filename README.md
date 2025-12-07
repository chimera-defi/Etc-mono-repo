# Experiments

Research and prototyping workspace for technology evaluation.

## Projects

| Area | Description | Status |
|------|-------------|--------|
| [**mobile_experiments/**](./mobile_experiments/) | Cross-platform mobile frameworks (Capacitor, React Native, Flutter, Valdi) | ✅ Complete |
| [**ai_experiments/**](./ai_experiments/) | AI constraint toolkits (Spec Kit, Guardrails AI, Guidance, Outlines, B-MAD) | 📋 Research |
| [**wallets/**](./wallets/) | Crypto wallet comparison (24 software + 15 hardware wallets) | ✅ Active |
| [**markdown-to-web/**](./markdown-to-web/) | Reusable Markdown-to-Website Vue library | ✅ Complete |
| [**apps/**](./apps/) | Applications using markdown-web | ✅ Complete |

## Quick Links

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
# Mobile experiments
cd mobile_experiments/Capacitor/app && npm run dev

# Wallet site
cd apps/wallet-site && npm install && npm run dev

# Refresh wallet data
cd wallets/scripts && ./refresh-github-data.sh
```

## Structure

```
.
├── mobile_experiments/   # Mobile framework comparison
├── ai_experiments/       # AI constraint toolkit research
├── wallets/              # Crypto wallet comparison
├── markdown-to-web/      # Vue markdown library
├── apps/                 # Applications
├── .github/              # CI workflows
└── .cursorrules          # AI assistant guidelines
```

Each directory contains detailed README with setup instructions.
