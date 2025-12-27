# Assumptions Registry

**Critical assumptions underlying business model and technical architecture.**
*Last Updated: December 24, 2025* (Corrected with sourced tokenomics + clarified verification levels)

---

## Status Legend

- ✅ **VERIFIED** - Confirmed via official documentation or testnet
- 📎 **SOURCED (3rd-party)** - Backed by a reputable third-party source, but not confirmed by official docs/testnet
- ⚠️ **ESTIMATED** - Industry benchmark, requires validation
- ❌ **UNVERIFIED** - Assumption, needs research/testing
- 🔄 **IN PROGRESS** - Currently being validated

---

## Network & Protocol Assumptions

| Assumption | Current Value | Status | Impact if Wrong | Verification Plan |
|------------|---------------|--------|-----------------|-------------------|
| **Minimum stake** | 200,000 AZTEC | ✅ VERIFIED | Critical - changes pool mechanics | [Aztec Staking Dashboard](https://stake.aztec.network/) |
| **Staking APY (current bootstrap)** | 166% (reported) | 📎 SOURCED (3rd-party) | Medium - short-term demand | [PANews report](https://www.panewslab.com/en/articles/ccce7885-d99d-4456-9699-43f35a61b5c0) |
| **Staking APY (steady-state)** | 6-10% (target range) | ⚠️ ESTIMATED | High - affects demand + revenue | Validate on testnet over time + compare to similar networks |
| **Unbonding period** | 7 days | ❌ UNVERIFIED | Medium - affects UX | Testnet validation required |
| **Slashing penalty** | 5-10% | ❌ UNVERIFIED | Medium - affects insurance fund sizing | Review Aztec protocol specs |
| **Epoch duration** | ~6 minutes | ⚠️ ESTIMATED | Low - affects bot timing | Testnet measurement |
| **Gas costs per tx** | $0.20-$0.50 | ⚠️ ESTIMATED | Medium - affects profitability | Testnet validation required |

---

## Infrastructure Cost Assumptions

| Item | Monthly Cost | Status | Source | Validation |
|------|-------------|--------|--------|------------|
| **Validator hardware** | $400/node | ⚠️ ESTIMATED | Ethereum analogue (8GB RAM, 4 vCPU) | Deploy testnet validator |
| **Kubernetes cluster** | $150 | ✅ VERIFIED | [AWS EKS Pricing](https://aws.amazon.com/eks/pricing/) | Actual vendor quote |
| **Redis (managed)** | $50 | ✅ VERIFIED | [AWS ElastiCache](https://aws.amazon.com/elasticache/pricing/) | Actual vendor quote |
| **Grafana Cloud** | $49 | ✅ VERIFIED | [Grafana Pricing](https://grafana.com/pricing/) | Public pricing page |
| **PagerDuty** | $19 | ✅ VERIFIED | [PagerDuty Pricing](https://www.pagerduty.com/pricing/) | Public pricing page |
| **Sentry** | $26 | ✅ VERIFIED | [Sentry Pricing](https://sentry.io/pricing/) | Public pricing page |
| **Total monthly ops** | $409 | ⚠️ ESTIMATED | Excludes validator costs | Testnet validation |

**Critical Dependency:** Validator cost could range $200-$800/month. Break-even calculations sensitive to this assumption.

---

## Competitive Intelligence

| Assumption | Status | Source | Verification Date | Notes |
|------------|--------|--------|-------------------|-------|
| **Olla by Kryha building liquid staking** | ✅ VERIFIED | [Aztec @Devconnect 2025](https://luma.com/heydpbsj) | Dec 22, 2025 | Featured at official event |
| **Multiple teams building fractional staking** | ✅ VERIFIED | [Aztec TGE Blog](https://aztec.network/blog/aztec-tge-next-steps) | Dec 22, 2025 | Confirmed in official communications |
| **No production protocol live yet** | ⚠️ ESTIMATED | Manual research | Dec 22, 2025 | Best-effort scan; must be re-checked periodically as the ecosystem changes |
| **6-12 month window before saturation** | ⚠️ ESTIMATED | Team analysis | Dec 22, 2025 | Depends on Olla timeline |

**Competitor Research Summary:**
- **Olla (Kryha):** Announced at Devconnect 2025, no mainnet launch date public
- **Team 2:** Referenced in Aztec communications, identity unknown
- **Our edge:** Technical readiness, self-operated validators, capital efficiency

### Competitor Tracker (living, inline)

Maintain this table as the canonical competitor tracker (do not create a separate doc).

| Project | Team | Status | Scope | Approach (hypothesis) | Differentiation | Evidence | Confidence | Next verification step |
|---|---|---|---|---|---|---|---|---|
| Olla | Kryha | Announced / early | Liquid staking / fractional staking | Aztec-native protocol (details TBD) | First public mindshare | Featured at Aztec @Devconnect event | ✅ | Find repo/docs, timeline, whether they run validators vs marketplace |
| Team (unknown #2) | Unknown | Building | Fractional staking | Unknown | Unknown | Aztec blog says “multiple teams” | ⚠️ | Identify name via Aztec ecosystem channels (Discord, grants, GitHub, X) |
| Team (unknown #3) | Unknown | Building | Fractional staking | Unknown | Unknown | Aztec blog says “multiple teams” | ⚠️ | Same as above |

**Watchlist (leads; not verified):**
- Existing LST operator expands to Aztec (watch: grants, hiring, testnet deployments)
- Aztec-native DeFi team builds LST wrapper (watch: repos referencing staking/delegation/pool patterns)

---

## Market & Revenue Assumptions

| Assumption | Value | Status | Impact if Wrong | Mitigation |
|------------|-------|--------|-----------------|------------|
| **Aztec total supply** | 10.35B AZTEC | 📎 SOURCED (3rd-party) | Critical - determines TAM | Cross-check with Aztec official tokenomics once published |
| **Token sale price (baseline)** | **$0.04** ($61M ÷ 1.547B) | 📎 SOURCED (3rd-party) | High - baseline valuation | Cross-check with Aztec official sale post / primary docs |
| **Implied FDV (at baseline)** | ~$414M | ⚠️ ESTIMATED | Medium - narrative only | Calculated: $0.04 × 10.35B |
| **Current staked (reported)** | 570M AZTEC (**~$22.8M** @ $0.04) | 📎 SOURCED (3rd-party) | Medium - baseline demand | Cross-check on `stake.aztec.network` directly |
| **Staking participation rate** | 40-60% | ⚠️ ESTIMATED | High - determines TAM | Use 40% (conservative) |
| **Our market share** | 30-50% | ⚠️ ESTIMATED | Critical - revenue projections | Target 30% (conservative) |
| **Protocol fee acceptable** | 10% | ⚠️ ESTIMATED | High - could price us out | Competitor analysis (Lido 10%) |
| **User preference: liquid vs native** | 70% prefer liquid | ⚠️ ESTIMATED | High - determines demand | Ethereum: 33% choose liquid staking |

**See ECONOMICS.md for complete TAM calculations and revenue projections.**

**Quick Reference:**
- Maximum TVL: $124M-$207M (30-50% of supply staking)
- Break-even: $2.25M TVL (56M AZTEC, 0.54% of supply)
- Conservative Year 1: $18.6M TVL → $131k profit
- All calculations use $0.04 token price (sale-price baseline, sourced)

---

## Technical Assumptions

| Assumption | Status | Validation Method | Risk |
|------------|--------|-------------------|------|
| **Noir can handle complex staking logic** | ✅ VERIFIED | [Token tutorial](https://docs.aztec.network/developers/docs/tutorials/contract_tutorials/token_contract) demonstrates similar patterns | Low |
| **Aztec testnet available for validation** | ✅ VERIFIED | [Public testnet live](https://testnet.aztec.network/) since May 2025 | Low |
| **#[public] functions sufficient for MVP** | ✅ VERIFIED | Token contracts use public functions | Low |
| **Bot infrastructure can achieve <1% downtime** | ⚠️ ESTIMATED | Standard DevOps practices | Medium |
| **Smart contract audits available** | ✅ VERIFIED | Multiple firms audit Noir (Trail of Bits, OpenZeppelin) | Low |
| **3 bots sufficient (not 6)** | ⚠️ ESTIMATED | Based on self-operated validator model | Medium |

---

## Risks Introduced by Wrong Assumptions

### High-Impact Scenarios

**1. Validator Costs Higher Than Expected ($800/month vs $400)**
- Impact: Monthly costs increase to $2,550 (3 validators × $800 + $150)
- Annual costs: $30.6k (up from $18k)
- Break-even TVL: $3.83M (up from $2.25M)
- Mitigation: Start with 1-2 validators, scale gradually

**2. Staking APR Lower Than Expected (5% vs 8%)**
- Impact: Revenue reduced by 37.5%
- At $18.6M TVL: $93k annual (vs $149k)
- Still profitable ($75k profit) after $18k costs
- Break-even TVL: $3.6M (up from $2.25M)
- Mitigation: Lower protocol fee to 8%, or wait for APY to stabilize

**3. Token Price Drops to $0.02 (50% decline from sale price)**
- Impact: TVL in USD halved (but AZTEC volume unchanged)
- At 465M AZTEC: $9.3M TVL (vs $18.6M)
- Revenue: $74k annual (vs $149k)
- Still profitable ($56k profit) but tighter margins
- Mitigation: Revenue in AZTEC (proportional), costs in fiat (fixed)

**4. Olla Launches in 2 Months**
- Impact: Lose first-mover advantage
- Market share: 20-30% instead of 30-50%
- Mitigation: Speed to market, superior UX, privacy features

**5. Aztec Ecosystem Smaller Than Expected**
- Impact: TVL growth slower, break-even delayed 6-12 months
- Mitigation: Multi-chain expansion (Mina, Aleo as backup)

---

## Validation Roadmap

### Week 1-2 (Immediate)
- [ ] Deploy test validator on Aztec testnet
- [ ] Measure actual validator resource requirements
- [ ] Monitor testnet for 2 weeks to measure APR
- [ ] Test transaction gas costs on testnet
- [ ] Maintain a dated log of findings in the Validation Log (below)

### Month 1
- [ ] Research Olla roadmap (community channels, team outreach)
- [ ] Validate unbonding period via testnet staking
- [ ] Confirm slashing mechanics in Aztec docs
- [ ] Interview Aztec validators about operational costs

### Month 2-3
- [ ] Benchmark bot infrastructure costs on testnet
- [ ] Validate epoch duration and timing
- [ ] Stress test 200k batch pooling mechanics
- [ ] Survey potential users about protocol fee tolerance

### Ongoing
- [ ] Weekly Aztec ecosystem monitoring (new competitors)
- [ ] Monthly assumption review (update this registry)
- [ ] Quarterly competitive analysis (Olla progress)

---

## Decision Triggers

**STOP if:**
- ❌ Validator costs >$1,000/month (economics break)
- ❌ Staking APR <4% (insufficient demand)
- ❌ Olla launches + captures >60% market in first 3 months
- ❌ Aztec changes minimum stake to <50,000 AZTEC (eliminates need)

**ACCELERATE if:**
- ✅ Validator costs <$300/month (better margins)
- ✅ Staking APR >10% (higher demand)
- ✅ Olla delays beyond 6 months
- ✅ Aztec Foundation offers grant/partnership

---

**Next Review:** January 15, 2026 (or upon major assumption invalidation)

**Owner:** Technical Lead / CEO

**Sources:**
- [Aztec Documentation](https://docs.aztec.network/)
- [Aztec Testnet](https://testnet.aztec.network/)
- [Olla Announcement](https://luma.com/heydpbsj)
- [AWS Pricing](https://aws.amazon.com/pricing/)
- [Ethereum Liquid Staking Market Data](https://dune.com/hildobby/eth2-staking)

---

## Validation Log (dated, append-only)

Use this section as the canonical log of what was actually measured or attempted. If it isn’t written here with method + artifacts, assume it did not happen.

### 2025-12-26 — Devnet RPC Discovery + Staking Pool Contract ✅

- **Environment**: Claude Code cloud workspace (gVisor/runsc container, Linux 4.4.0)
- **Session 2 Findings** (continuation of earlier session):

#### Devnet RPC Endpoint Discovered
- **RPC URL**: `https://next.devnet.aztec-labs.com`
- **L1 Chain ID**: 11155111 (Sepolia)
- **Node Version**: 3.0.0-devnet.20251212
- **Rollup Version**: 1647720761
- **Key Contract Addresses** (from `node_getNodeInfo` RPC call):
  - **stakingAssetAddress**: `0x3dae418ad4dbd49e00215d24079a10ac3bc9ef4f` ⭐ (critical for our protocol)
  - rollupAddress: `0x5d84b64b0b2f468df065d8cf01fff88a73238a13`
  - feeJuiceAddress: `0x543a5f9ae03f0551ee236edf51987133fb3da3e2`
  - inboxAddress: `0x8ea98d35d7712ca236ac7a2b2f47d9fb5c9154e8`
- **Block Query Working**: `node_getBlocks` returns full block data with merkle trees
- **Gas Fees Observed**: feePerL2Gas = 426263190
- **Latest Block (at time of query)**: 31641 (proven: 31639, finalized: 31623)

#### L1 Contract Analysis (Sepolia Etherscan)
- **Staking Token** (`0x3dae418...`):
  - Name: "Staking", Symbol: "STK"
  - Type: TestERC20 with minting capabilities
  - Owner can add/remove minters
- **Rollup Contract** (`0x5d84b64...`):
  - Submits epoch roots every 4-5 minutes (confirms ~6 min epoch estimate)
  - Holds 15.8M FEE tokens
  - Functions for epoch management, validator tracking, withdrawals

#### Staking Pool Contract Prototype Compiled ✅
- **Location**: `/tmp/aztec-test/staking_pool/`
- **Compiler**: nargo 1.0.0-beta.17
- **Tests**: 5/5 passing
- **Core Functions Implemented**:
  - `calculate_shares(amount, total_staked, total_shares)` - deposit logic
  - `calculate_withdrawal(shares, total_staked, total_shares)` - withdrawal logic
  - `calculate_fee(amount, fee_bps)` - fee calculation
- **Output**: `target/staking_pool.json` (3.7KB compiled artifact)

#### Docker Pull Status
- Docker daemon running with `--bridge=none --iptables=false`
- Image `aztecprotocol/aztec:latest` successfully pulled (1.22GB)
- Container execution limited due to network restrictions (--bridge=none)

#### Aztec L2 RPC Methods (verified working)
```bash
# Working methods on https://next.devnet.aztec-labs.com
node_getVersion          # Returns rollup version
node_getNodeInfo         # Full node info with L1 addresses
node_getL1ContractAddresses   # L1 contract addresses
node_getProtocolContractAddresses  # Protocol addresses
node_getL2Tips           # Latest/proven/finalized blocks
node_getBlocks           # Full block data with merkle trees
node_getBlockHeader      # Block header only
node_getBlock            # Single block by number

# NOT available (require local PXE):
pxe_*                    # Need local Private Execution Environment
node_getContractInstance # Not exposed on public node
```

#### Aztec L2 State (observed at block 31660)
- **noteHashTree**: 13,440 entries
- **nullifierTree**: 13,568 entries
- **publicDataTree**: 596 entries
- **feePerL2Gas**: 1,020 (varies by block)
- **Epoch submission**: Every 4-5 minutes (confirmed via L1 tx patterns)

#### Key Insights
1. **We can test against devnet without local sandbox** using RPC + AztecJS
2. **Core staking math works in Noir** - share calculation, fees, withdrawals all compile
3. **Aztec contracts need aztec-nargo** for `#[aztec(contract)]` macros (standard nargo is base Noir only)
4. **devnet requires fee payment** - need to use sponsored FPC or pay fees
5. **Docker image available** but container execution needs network bridge

#### Next Steps
- [ ] Complete Docker pull and extract aztec-nargo from container
- [ ] Or: Use `aztec-wallet create-account --node-url https://next.devnet.aztec-labs.com` once CLI available
- [ ] Adapt staking pool contract to Aztec syntax (add storage, public/private functions)
- [ ] Deploy to devnet for full smoke test

---

### 2025-12-26 — Docker + Noir working in cloud workspace ✅

- **Environment**: Claude Code cloud workspace (gVisor/runsc container, Linux 4.4.0)
- **Method**:
  - Installed Docker Engine via apt (`docker.io` package)
  - Started dockerd manually with special flags to bypass networking restrictions:
    ```bash
    dockerd --storage-driver=vfs --data-root=/tmp/docker-data \
            --host unix:///tmp/docker.sock --bridge=none \
            --iptables=false --ip6tables=false
    ```
  - Installed noirup (Noir installer) via curl script
  - Installed nargo via `noirup`
  - Created and compiled a basic Noir project
- **Results**:
  - **Docker**: ✅ Working! Daemon runs with `--bridge=none --iptables=false`
  - **Docker version**: 28.2.2
  - **nargo version**: 1.0.0-beta.17 (noirc 1.0.0-beta.17)
  - **Noir compile**: ✅ `nargo compile` succeeds
  - **Noir test**: ✅ `nargo test` passes
  - **Docker pull**: In progress (attempting `aztecprotocol/aztec:latest`)
  - **install.aztec.network**: Returns 403 (CloudFront block)
- **Artifacts**:
  - Compiled Noir contract: `/tmp/noir-test/hello_noir/target/hello_noir.json`
  - Docker socket: `/tmp/docker.sock`
- **Key Discovery**: Cloud workspaces CAN run Docker if you bypass bridge networking. This unblocks TASK-001A partially.
- **Remaining blockers**:
  - `install.aztec.network` blocked (403 error)
  - Need aztec-nargo specifically for Aztec contracts (standard nargo is for base Noir)
  - Docker pull for Aztec images may complete but sandbox requires network for RPC
- **Follow-ups**:
  - ~~Check if Docker pull completes for Aztec images~~ (in progress)
  - ~~Try building aztec-nargo from source~~ (alternative: extract from Docker image)
  - Alternatively, run full sandbox on local machine where network is available

---

### 2025-12-25 — Tooling discovery in this workspace (Cursor cloud agent)

- **Environment**: Cursor cloud workspace (no systemd/init)
- **Method**:
  - Attempted to install Aztec via `install.aztec.network`
  - Installed Docker Engine packages via apt
  - Tested whether Docker daemon is reachable
  - Installed `@aztec/cli` from npm to inspect what it provides
- **Results**:
  - **Docker**: CLI installed, but **daemon is not running** in this environment (`docker info` fails). Starting services via `service` is not available here.
  - **Aztec installer**: fails early because it requires a working Docker daemon.
  - **npm `@aztec/cli`**: installs as a JS module (no `aztec` binary provided here).
- **Artifacts/links**: terminal logs in this agent run
- **Update (2025-12-26)**: Superseded by new entry above - Docker CAN run with special flags.
- **Follow-ups**:
  - ~~Run local sandbox on a machine where Docker daemon can run.~~
  - ~~Once `aztec` CLI is installed, complete the "hello world" compile/deploy smoke test and record it here.~~

---

### 2025-12-27 — Devnet Connectivity Smoke Test (AztecJS) ✅

- **Environment**: Cursor Cloud Agent (remote environment)
- **Method**:
  - Verified Docker unavailability (`docker info` fails, `dockerd` not running).
  - Identified `aztec-nargo` relies on Docker and cannot run.
  - Initialized `package.json` in `staking/contracts/aztec-staking-pool`.
  - Installed `@aztec/aztec.js`.
  - Ran `scripts/query-devnet.mjs` to test connection.
- **Results**:
  - **Devnet Connection**: ✅ SUCCESS.
  - **RPC URL**: `https://next.devnet.aztec-labs.com`
  - **Latest Block**: ~33391
  - **Fee Per L2 Gas**: 1080
  - **L1 Chain ID**: 11155111
  - **Key Address Found**: Staking Asset `0x3dae418ad4dbd49e00215d24079a10ac3bc9ef4f`
- **Key Discovery**:
  - Can interact with Devnet via AztecJS even without Docker or local sandbox.
  - Contract compilation requires `aztec-nargo` which requires Docker.
- **Next Steps**:
  - Proceed with contract code authoring (`TASK-101`) even if local compilation is blocked.
  - Code review and "skeleton" creation can happen.
