# MegaETH - Liquid Staking Infrastructure

MegaETH is a practical liquid staking protocol implementation focused on **SLA-enforced validator operations** and **horizontal scaling via Validator-as-a-Service (NaaS)**.

This folder contains the reference implementation, operational runbooks, and local development setup aligned with the learnings from the [mega-eth-learnings.md](../../agent-brains/mega-eth-learnings.md) research.

## 🎯 Quick Start

1. **First time setup:**
   ```bash
   cd staking/mega-eth
   ./scripts/setup-env.sh
   ```

2. **Run smoke tests (no external dependencies):**
   ```bash
   ./scripts/smoke-test.sh
   ```

3. **Explore the runbook:**
   ```bash
   cat RUNBOOK.md
   ```

4. **Check operational procedures:**
   ```bash
   cat SETUP.md
   ```

## 📚 Project Structure

```
mega-eth/
├── README.md                          # This file (START HERE)
├── DESIGN.md                          # Technical architecture overview
├── SETUP.md                           # Local development setup guide
├── RUNBOOK.md                         # Operational procedures
├── SMOKE_TEST.md                      # Smoke test documentation
├── scripts/                           # Executable scripts
│   ├── setup-env.sh                   # Environment initialization
│   ├── smoke-test.sh                  # Local validation tests (no deps)
│   ├── validate-config.sh             # Configuration validator
│   └── check-endpoints.sh             # Endpoint connectivity checker
├── config/                            # Configuration templates
│   ├── .env.example                   # Environment variables
│   ├── validator.toml.example         # Validator configuration
│   ├── naas-config.toml.example       # NaaS operator config
│   └── monitoring.env.example         # Prometheus/Grafana setup
├── monitoring/                        # Observability stack
│   ├── docker-compose.yml             # Prometheus, Grafana, Loki
│   ├── prometheus.yml                 # Prometheus config
│   └── grafana-dashboards/            # Dashboard definitions
└── docs/                              # Reference documentation
    ├── ARCHITECTURE.md                # Smart contract & system design
    ├── VALIDATOR_SPEC.md              # Validator node requirements
    ├── NAAS_SPEC.md                   # Validator-as-a-Service protocol
    ├── SLA_ENFORCEMENT.md             # SLA penalty mechanisms
    └── ECONOMICS.md                   # Fee structure & revenue model
```

## 🚀 Project Goals

**Phase 1: Foundation (Weeks 1-4)**
- ✅ Reference architecture
- ✅ Smart contract specifications
- ✅ Local runnable setup
- ✅ Smoke tests
- Target: Testnet-ready design

**Phase 2: Testnet (Weeks 5-12)**
- Deploy to Sepolia/Goerli
- Run 50+ validator nodes for 2 weeks
- Onboard 5 pilot operators
- Security audit

**Phase 3: Mainnet (Week 13+)**
- Launch with $100M TVL cap (conservative)
- Gradual scale to $1B TVL over 12 months

## 📋 Key Features

### 1. **SLA Enforcement**
- On-chain penalties for validator downtime
- Slashing conditions: >1h downtime = fee reduction
- Transparent penalty distribution to stakers
- See: [SLA_ENFORCEMENT.md](docs/SLA_ENFORCEMENT.md)

### 2. **Validator-as-a-Service (NaaS)**
- Horizontal scaling via operator onboarding
- Low-friction validator setup
- Integrated key management
- See: [NAAS_SPEC.md](docs/NAAS_SPEC.md)

### 3. **Full-Stack Staking**
- Native validator infrastructure
- Smart contract custody
- Liquid staking token (LSD)
- Monitoring & alerts

### 4. **Conservative Execution**
- 5-7% fees (undercut Lido's 10%)
- Testnet validation before mainnet
- Phased GTM (validation → scale)
- See: [ECONOMICS.md](docs/ECONOMICS.md)

## 🛠️ Development Workflow

### Local Setup
```bash
# Clone and enter workspace
cd /root/.openclaw/workspace/dev/Etc-mono-repo/staking/mega-eth

# Initialize environment
./scripts/setup-env.sh

# Validate configuration
./scripts/validate-config.sh

# Run smoke tests
./scripts/smoke-test.sh
```

### Configuration
Edit `.env` file (created by setup script):
```bash
# Network
RPC_URL=http://localhost:8545
CHAIN_ID=11155111  # Sepolia

# Validator
VALIDATOR_PUBKEY=0x...
VALIDATOR_WITHDRAWAL_CREDS=0x...

# Staking
MIN_STAKE_AMOUNT=32  # ETH
MAX_STAKE_AMOUNT=1000  # ETH

# Fees
PROTOCOL_FEE_BPS=500  # 5%
OPERATOR_FEE_BPS=200  # 2%
```

## 🧪 Smoke Tests

The `smoke-test.sh` validates local setup without external dependencies:

- ✅ Environment variables loaded
- ✅ Configuration files valid
- ✅ Endpoints reachable (when provided)
- ✅ Contract addresses checksum valid
- ✅ Required files present

**Run:** `./scripts/smoke-test.sh`  
**View:** [SMOKE_TEST.md](SMOKE_TEST.md)

## 📖 Reference Docs

| Document | Purpose | Audience |
|----------|---------|----------|
| [DESIGN.md](DESIGN.md) | System architecture, smart contracts, data flow | Architects, Smart Contract Devs |
| [SETUP.md](SETUP.md) | Local development + testnet setup | Developers |
| [RUNBOOK.md](RUNBOOK.md) | Operations procedures, monitoring, troubleshooting | Operators |
| [SMOKE_TEST.md](SMOKE_TEST.md) | Test suite documentation | QA, Developers |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Smart contract design patterns | Contract Auditors |
| [VALIDATOR_SPEC.md](docs/VALIDATOR_SPEC.md) | Hardware/software requirements | Operators, Validators |
| [NAAS_SPEC.md](docs/NAAS_SPEC.md) | Operator onboarding protocol | Validator Operators |
| [SLA_ENFORCEMENT.md](docs/SLA_ENFORCEMENT.md) | Penalty mechanisms | Smart Contract Devs |
| [ECONOMICS.md](docs/ECONOMICS.md) | Fee structure, TAM, scaling | Business Development |

## 🔗 Related Projects

- **[mega-eth-learnings.md](../../agent-brains/mega-eth-learnings.md)** - Strategic planning & execution patterns
- **[Monad Validator Setup](../monad/infra/)** - Operational reference
- **[Aztec Liquid Staking](../aztec/)** - Smart contract patterns
- **[eth2-quickstart](https://github.com/eth-educators/eth2-quickstart)** - Validator baseline

## 🎓 Learning Resources

### Startup Execution
- **Vertical Integration Audit** - Identify reusable infrastructure (mega-eth-learnings #1)
- **Competitive Positioning** - Find structural 10x advantage (mega-eth-learnings #2)
- **Market Sizing** - TAM × Capture % modeling (mega-eth-learnings #3)
- **Go-to-Market Phasing** - Design Phase 3, launch Phase 1 (mega-eth-learnings #4)

### Engineering Patterns
- **Infrastructure Reuse Decision Matrix** - Reuse vs extend vs rebuild (mega-eth-learnings #5)
- **Testing Strategy for Scaled Operations** - Test-at-scale pattern (mega-eth-learnings #6)
- **Hiring for Vertical Integration** - Team structure (mega-eth-learnings #7)

## 📝 Configuration Examples

### Testnet Operator (Goerli)
```bash
source .env.goerli
./scripts/setup-env.sh
./scripts/smoke-test.sh
```

### Local Development
```bash
source .env.local
./scripts/setup-env.sh
./scripts/validate-config.sh
```

## 🚨 Critical Files

- **[SETUP.md](SETUP.md)** - Read first, covers full local setup
- **[RUNBOOK.md](RUNBOOK.md)** - Operational emergency procedures
- **[.env.example](config/.env.example)** - Configuration reference
- **[smoke-test.sh](scripts/smoke-test.sh)** - Validation entry point

## 📊 Current Status

- ✅ Phase 1 Foundation: Complete (architecture + local setup)
- 🚀 Phase 2 Testnet: Ready to start
- ⏳ Phase 3 Mainnet: Planned

**Last Updated:** February 21, 2026  
**Maintained by:** Infrastructure Team  
**Status:** Active Development
