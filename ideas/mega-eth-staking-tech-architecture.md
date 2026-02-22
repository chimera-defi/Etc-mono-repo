# Mega ETH Liquid Staking: Technical Architecture

**Status:** Design Document | **Owner:** Claudy Won | **Date:** 2026-02-15

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      End User                                │
│           (Stake ETH → Receive ethSTAKE)                    │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│              Liquid Staking Protocol Layer                   │
│         (Smart Contracts + LST Tokenomics)                  │
│  - StakingPool.sol (accepts ETH, mints ethSTAKE)           │
│  - OperatorRegistry.sol (onboards + penalizes ops)         │
│  - RewardDistribution.sol (daily rebasing)                 │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│            Validator Operations Layer                        │
│       (Infrastructure + Monitoring)                         │
│  - eth2-quickstart (Docker orchestration)                  │
│  - Validator monitoring (Prometheus + Grafana)             │
│  - Beacon chain tracking                                    │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│          Execution + Consensus Nodes                         │
│  - Execution: Besu / Geth / Erigon                         │
│  - Consensus: Lighthouse / Prysm / Lodestar              │
│  - All validated via eth2-quickstart (515/515 tests)      │
└─────────────────────────────────────────────────────────────┘
```

---

## Layer 1: Smart Contracts (Staking Protocol)

### Core Contracts

#### StakingPool.sol
```solidity
contract StakingPool {
    // State
    ERC20 ethSTAKE;  // Liquid token
    uint256 totalStaked;  // Total ETH staked
    uint256 totalShares;  // Total ethSTAKE minted
    
    mapping(address operator => ValidatorInfo[]) validatorsByOperator;
    mapping(bytes pubkey => uint256 rewardIndex) validatorRewards;
    
    // Core functions
    function stake(uint256 amount) → uint256 sharesReceived;
    function withdraw(uint256 shares) → uint256 ethReceived;  // Queued (1-7 days)
    function distributeRewards(uint256 rewardAmount) → void;  // Daily
    function slashOperator(address operator, uint256 amount) → void;  // On breach
}
```

**Rebase mechanism:**
- Daily: Add new rewards to `totalStaked`
- `ethSTAKE` share price increases automatically (no token transfer needed)
- Formula: `ethPerShare = totalStaked / totalShares`

#### OperatorRegistry.sol
```solidity
contract OperatorRegistry {
    // State
    mapping(address → OperatorInfo) operators;
    struct OperatorInfo {
        string name;
        address paymentAddress;
        uint256 validatorCount;
        uint256 stakedAmount;  // ETH operator has bonded
        uint256 uptime99_7;    // Track 99.7% uptime requirement
        uint256 lastSlashTime;
        bool isActive;
    }
    
    // Core functions
    function registerOperator(uint256 bond) → void;
    function submitValidatorSigs(bytes[] pubkeys, bytes[] sigs) → void;
    function reportDowntime(address operator, uint256 slots) → void;
    function emergencySlash(address operator) → void;
}
```

**SLA enforcement:**
- Operators must maintain 99.7% uptime (or ~1 missed slot per day)
- Uptime tracked via attestation data on-chain
- Breach → automatic penalty (from operator bond)
- Repeated breaches → operator removal

#### RewardDistribution.sol
```solidity
contract RewardDistribution {
    // Distribute rewards daily (via oracle or batch settle)
    function settleRewards(
        uint256 executionRewards,  // MEV + tips
        uint256 consensusRewards   // Attestation rewards
    ) → void {
        // 1. Deduct operator fees (5%)
        // 2. Add to staking pool
        // 3. Trigger rebase in StakingPool
        // 4. Emit RewardSettled event (for off-chain indexing)
    }
}
```

### Reference: Lido Contracts
- Leverage OpenZeppelin's patterns (already battle-tested)
- Operator registry similar to Lido's NodeOperatorRegistry
- Reward distribution matches Lido's oracle design
- Simplification: Remove DAO governance (initially) → faster decision-making

---

## Layer 2: Validator Operations (Infrastructure)

### eth2-quickstart Integration

**Currently:** 515/515 test suite (locally + remotely validated)
- 7 execution clients: Besu, Geth, Erigon, Nethermind, Akula, + others
- 6 consensus clients: Lighthouse, Prysm, Lodestar, Teku, Nimbus, + others
- All multi-client combinations tested

**For production:**

1. **Node Deployment Template (Terraform)**
   ```hcl
   # Deploy 5 internal validators on ethbig
   resource "aws_instance" "validator_nodes" {
     count = 5
     ami = "ami-eth2-quickstart"  # Pre-baked Docker image
     instance_type = "m5.2xlarge"  # 8 CPU, 32 GB RAM (for 2-3 validators)
     
     # eth2-quickstart initialization
     user_data = base64encode(templatefile("${path.module}/init_eth2qs.sh", {
       EXECUTION_CLIENT = "besu"
       CONSENSUS_CLIENT = "lighthouse"
       NETWORK = "mainnet"
       FEE_RECIPIENT = aws_instance.fee_recipient.private_ip
     }))
   }
   ```

2. **Docker Compose (for partner operators)**
   ```yaml
   # Reuse eth2-quickstart docker-compose.yml with modifications
   version: '3.8'
   services:
     execution:
       image: besu:latest-internal  # Validated variant
       environment:
         SYNC_MODE: snap
         P2P_PORT: 30303
     consensus:
       image: lighthouse:v5.2  # Latest validated version
       environment:
         GRAFFITI: "ethSTAKE-operator"
         CHECKPOINT_SYNC: true
     validator:
       image: lighthouse-vc:v5.2
       volumes:
         - ./validators:/validators  # Keystore
         - ./secrets:/secrets  # Withdrawal credentials
   ```

3. **Monitoring Stack (Prometheus + Grafana)**
   ```yaml
   # eth2-quickstart validation metrics → our monitoring
   services:
     prometheus:
       scrape_configs:
         - job_name: 'validators'
           static_configs:
             - targets:
                 - 'lighthouse-vc:5054'  # VC metrics
                 - 'besu:9545'  # Execution metrics
                 - 'lighthouse:5054'  # Consensus metrics
     
     grafana:
       dashboards:
         - validator_uptime.json  (tracks 99.7% SLA)
         - block_proposals.json   (track participation)
         - slashing_risk.json     (detect risky configs)
   ```

### NaaS Platform Architecture

**One-click deployment for operators:**

```bash
# NaaS CLI (Go binary, statically compiled)
naas deploy \
  --network=mainnet \
  --execution=besu \
  --consensus=lighthouse \
  --operator-name="MyValidator" \
  --fee-recipient=0x... \
  --withdrawal-addr=0x...
```

**Backend (NaaS API):**

```go
// naas-api/cmd/deploy.go
func DeployValidator(ctx context.Context, req DeployRequest) (*DeployResponse, error) {
    // 1. Register operator in OperatorRegistry smart contract
    // 2. Provision cloud infrastructure (Hetzner/DigitalOcean)
    // 3. Initialize with eth2-quickstart Docker images
    // 4. Configure withdrawal credentials (encrypted in vault)
    // 5. Return monitoring dashboard URL
    
    return &DeployResponse{
        ValidatorPubkey: pubkey,
        DashboardURL: "https://naas.ethstake.com/validators/" + pubkey,
        MonthlyFee: 49,  // USD
    }, nil
}
```

---

## Layer 3: Validator Client Setup (Client Diversity)

### Recommended Configuration (Production)

**Execution layer:** Besu (default)
- Mature, well-audited
- Good performance (tested in eth2-quickstart)
- Active development

**Consensus layer:** Lighthouse (default)
- Rust-based (memory-efficient)
- Strong test coverage
- Fastest block proposal timing

**Validator client:** Lighthouse-VC
- Native to Lighthouse
- Supports BLS batch verification
- Low resource overhead

### Client Fallback Strategy (Resilience)

If Besu crashes:
- Failover to Geth (network protocol compatible)
- Automatic switchover in Docker (health checks)

If Lighthouse crashes:
- Failover to Prysm (consensus protocol compatible)
- Node will re-sync, but no slashing risk (same pubkey)

**eth2-quickstart validates both paths** (tested in test suite).

---

## Layer 4: Operational Monitoring

### Key Metrics (Prometheus)

```yaml
# Validator uptime (for SLA tracking)
validator_uptime{operator="alice", pubkey="0xabc"} = 99.71%

# Block proposals (participation)
validator_block_proposals_total{operator="alice"} = 500
validator_block_proposals_missed{operator="alice"} = 1

# Attestations (consensus participation)
validator_attestations_total{operator="alice"} = 14400
validator_attestations_missed{operator="alice"} = 2

# Slashing risk (detection)
validator_slashing_risk_detected{operator="alice", reason="duplicate_attestation"} = 1

# Earnings (rewards)
validator_daily_earnings_eth{operator="alice", pubkey="0xabc"} = 0.0125

# Infrastructure health
execution_node_peers{instance="besu-1"} = 120
consensus_node_peers{instance="lighthouse-1"} = 60
execution_sync_lag_blocks{instance="besu-1"} = 0
```

### Alerting Rules

```yaml
# Alert if uptime drops below 99.7%
alert OperatorUptimeBreach
  expr: validator_uptime < 0.997
  for: 1h
  actions:
    - Notify operator (email + webhook)
    - Auto-slash from operator bond (smart contract)
    - Trigger investigation

# Alert if proposed block was missed (shouldn't happen)
alert MissedBlockProposal
  expr: increase(validator_block_proposals_missed[10m]) > 0
  actions:
    - Page on-call operator
    - Check for network partitions
    - Manual override if needed
```

---

## Layer 5: Security & Operational Procedures

### eth2-quickstart Security Hardening (Reuse)

From our recent work:

```bash
# Caddy reverse proxy configuration
{
  header X-Frame-Options DENY
  header X-Content-Type-Options nosniff
  header X-XSS-Protection "1; mode=block"
  header Referrer-Policy "strict-origin-when-cross-origin"
  header Strict-Transport-Security "max-age=31536000; includeSubDomains"
}
```

### Key Management

**Withdrawal credentials (most sensitive):**
- Store in encrypted vault (HashiCorp Vault)
- Per-operator key access (no central admin)
- Rotate monthly (Vault lease management)
- Never exposed in logs

**Fee recipient address:**
- Operator-controlled (not platform)
- Settable in validator_configs.json
- Changed via smart contract governance

**Operator signing keys:**
- BLS key rotation every 30 days
- Threshold signing (2-of-3 multisig for emergency slashing)

### Disaster Recovery

**If validator keys are leaked:**
1. Immediate voluntary exit (stake goes to exit queue)
2. Operator reimburses stakers (insurance or direct payment)
3. Investigation + remediation (key rotation)

**If smart contract is hacked:**
1. Pause all withdrawals (upgradeable proxy)
2. Notify token holders
3. Deploy patch (DAO vote or emergency admin)
4. Insurance payout (Nexus Mutual covers up to $50M)

---

## Deployment Pipeline

### Dev → Testnet → Mainnet

```
1. DEVELOPMENT (Local)
   ├─ Smart contract compilation (hardhat)
   ├─ Unit tests (foundry)
   ├─ eth2-quickstart E2E tests (515/515)
   └─ Deployment to testnet fork

2. TESTNET (Goerli → Sepolia)
   ├─ Deploy smart contracts
   ├─ Deploy validator infrastructure
   ├─ Run synthetic load tests
   ├─ Monitor for 2 weeks
   └─ Collect audit feedback

3. AUDIT (External)
   ├─ Smart contract audit (OpenZeppelin or Trail of Bits)
   ├─ Infrastructure audit (security team)
   ├─ Formal verification (optional, if high-risk)
   └─ Insurance (Nexus Mutual) pre-approved

4. MAINNET (Gradual Rollout)
   ├─ Deploy with $100M cap (week 1)
   ├─ Monitor for issues (weekly reviews)
   ├─ Raise cap to $500M (week 4)
   ├─ Scale to $1B+ (month 6)
   └─ Monitor continuously
```

---

## Cost Model (Year 1)

| Component | Cost | Notes |
|-----------|------|-------|
| **Smart contract audit** | $50K | OpenZeppelin standard |
| **Insurance (Nexus Mutual)** | $25K | 0.05% of TVL, capped |
| **Node infrastructure** | $200K | 5 nodes on AWS, $3.3K/month |
| **NaaS platform (dev)** | $150K | 2 engineers × 6 months |
| **Monitoring & ops** | $50K | Prometheus/Grafana/PagerDuty |
| **Legal & compliance** | $75K | Foundation setup, regulatory |
| **Marketing & partnerships** | $100K | Community building, partnerships |
| **Contingency (10%)** | $100K | Unforeseen costs |
| **TOTAL YEAR 1** | **$750K** | |

**Funding:** Seed round ($2-5M) covers Year 1-2 + runway.

---

## Tech Stack Summary

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Smart Contracts** | Solidity 0.8.x | Standard for EVM protocols |
| **Contract Framework** | Foundry + Hardhat | Testing + deployment automation |
| **Execution Node** | Besu (default) | eth2-quickstart validated |
| **Consensus Node** | Lighthouse (default) | eth2-quickstart validated |
| **Orchestration** | Docker + Compose | eth2-quickstart pattern |
| **Infrastructure** | Terraform | Cloud-agnostic, reproducible |
| **Monitoring** | Prometheus + Grafana | Standard for validator ops |
| **NaaS API** | Go + gRPC | Fast, statically compiled |
| **Dashboard** | React + TypeScript | Modern, accessible UX |
| **Database** | PostgreSQL | Structured operator/validator data |
| **Cache** | Redis | Real-time operator metrics |
| **Vault** | HashiCorp Vault | Encrypted key management |

---

## Risk Checklist

- [ ] Smart contract formally verified (Certora)?
- [ ] eth2-quickstart validators running 24/7 on testnet?
- [ ] Monitoring alerts tested (pagerduty simulation)?
- [ ] Operator onboarding UX validated (5 early testers)?
- [ ] Withdrawal process tested end-to-end?
- [ ] Insurance policy drafted (Nexus Mutual)?
- [ ] Fee mechanism tested (100+ ETH transactions)?
- [ ] Slashing scenarios tested (validator client crash simulated)?
- [ ] Client update procedure tested (testnet upgrade)?
- [ ] Network partition recovery tested?

---

## Success Criteria (MVP)

**Technical:**
- All smart contracts pass audit
- eth2-quickstart validators run 24/7 with zero slashing
- NaaS onboarding < 5 minutes

**Business:**
- 100 ETH staked in first week
- 1,000 ETH by end of month 1
- 10,000 ETH by end of month 3

**Operational:**
- 99.5%+ validator uptime
- <4 hour incident response time
- <1 slashing event per 1M validators/year (better than Lido's baseline)

---

## Next Steps

1. **Smart contract skeleton** (Week 1-2)
   - Use Lido contracts as template
   - Simplify governance initially
   - Foundry test suite

2. **Validator infrastructure validation** (Week 3-4)
   - Deploy eth2-quickstart on ethbig
   - Run 24/7 for 2 weeks
   - Collect uptime metrics

3. **NaaS API MVP** (Week 5-8)
   - Basic operator onboarding
   - Dashboard (Grafana embed)
   - Deployment CLI

4. **Testnet deployment** (Week 9-10)
   - Deploy to Sepolia/Goerli
   - Run synthetic load test
   - Collect feedback

5. **Audit & insurance** (Week 11-12)
   - External smart contract audit
   - Insurance quotation + policy
   - Mainnet readiness checklist

---

**Author:** Claudy Won | **Date:** 2026-02-15 | **Status:** Design Review Ready

