# Contributing to Wallet Comparison

Thank you for helping keep this wallet comparison accurate and up-to-date!

## Quick Links

- **Main comparison:** [WALLET_COMPARISON_UNIFIED.md](./WALLET_COMPARISON_UNIFIED.md)
- **Interactive version:** [index.html](./index.html)
- **Refresh script:** [scripts/refresh-github-data.sh](./scripts/refresh-github-data.sh)

---

## Adding a New Wallet

### Prerequisites

Before adding a wallet, verify:

1. ✅ It's an EVM-compatible wallet (Ethereum, Polygon, Arbitrum, etc.)
2. ✅ It has been publicly released (not alpha/private beta)
3. ✅ It has a GitHub repo OR is a well-known proprietary wallet

### Step 1: Gather Required Data

| Column | How to Verify |
|--------|---------------|
| **Score** | Calculate using [scoring methodology](#scoring-calculation) |
| **GitHub** | Find the main wallet repo (not SDK/packages) |
| **Active** | Check last commit date on default branch |
| **Chains** | Count from official docs or registry files |
| **Devices** | Check app stores + Chrome Web Store |
| **Testnets** | Check if custom RPC/chains can be added |
| **License** | Read LICENSE file in repo root |
| **Audits** | Search repo for `/audits` folder or security page |
| **Funding** | Research company backing, funding rounds |
| **Tx Sim** | Test wallet or check WalletBeat |
| **Scam** | Test wallet or check WalletBeat |
| **Account Type** | EOA, Safe, EIP-4337, or EIP-7702 |
| **HW Wallets** | Check settings for Ledger/Trezor support |
| **EIP-4337** | Check if smart account creation is supported |
| **Best For** | Your assessment of ideal use case |
| **Rec** | 🟢 if score ≥80, 🟡 if 60-79, 🔴 if <60 or inactive |

### Step 2: Calculate Score

Use this formula (100 points total) — prioritizes core criteria and stability:

```
CORE CRITERIA (25 pts) — MOST IMPORTANT
  ✅ Both mobile + browser extension = 25
  ⚠️ Partial (e.g., Starknet-only desktop) = 12
  ❌ Missing mobile OR extension = 0

STABILITY (20 pts) — Lower release frequency = better
  <3 releases/month = 20 (ideal)
  3-5 releases/month = 15
  6-8 releases/month = 10
  >8 releases/month = 5 (MetaMask territory)
  Unknown (private) = 12
  Inactive = 20 (stable but no updates)

DEVELOPER EXPERIENCE (25 pts)
  Tx Simulation: ✅=10, ⚠️=5, ❌=0
  Testnet support: ✅=5, ❌=0
  Custom RPC: ✅=5, ⚠️=3, ❌=0
  Multi-chain: ✅=5, ❌=0

ACTIVITY (15 pts)
  ✅ Active (≤30 days) = 15
  ⚠️ Slow (1-4 months) = 8
  🔒 Private repo = 5
  ❌ Inactive (>4 months) = 0

OPEN SOURCE (10 pts)
  ✅ FOSS (MIT, GPL, MPL, Apache) = 10
  ⚠️ Source-available/partial = 5
  ❌ Proprietary = 0

SECURITY (5 pts)
  ✅ Recent audit (2023+) = 5
  🐛 Bug bounty = 3
  ⚠️ Old audit = 2
  ❓ None/Private = 0
```

### Step 3: Add to Main Table

Add your row to `WALLET_COMPARISON_UNIFIED.md` in score order (highest first):

```markdown
| **WalletName** | XX | [repo](https://github.com/org/repo) | ✅ | 50+ | 📱🌐 | ✅ | ✅ MIT | ✅ 2024 | 🟢 Company | ✅ | ✅ | EOA | ✅ Multiple | ❌ | Use Case | 🟢 |
```

### Step 4: Update Other Sections

If applicable, also update:

- [ ] **Scoring table** (if in top 10)
- [ ] **Security Audits table** (if audited)
- [ ] **Account Type Support table**
- [ ] **Hardware Wallet Support table**
- [ ] **ENS & Address Resolution table**
- [ ] **Browser Integration table**
- [ ] **Monetization table**
- [ ] **Privacy & Data Collection table**
- [ ] **index.html** (add to wallets array)

### Step 5: Add to Changelog

Add an entry to the Changelog section:

```markdown
| Dec 2025 | **WalletName** | Added | New wallet with score XX |
```

---

## Updating Existing Data

### Activity Status Updates

Run the refresh script to check current status:

```bash
cd scripts
./refresh-github-data.sh
```

If a wallet's status changes, update:
1. Main table `Active` column
2. Recalculate score (Activity is 20 pts)
3. Add changelog entry

### Audit Updates

When a wallet publishes a new audit:
1. Update `Audits` column in main table
2. Update Security Audits section
3. Recalculate score if applicable
4. Add changelog entry

---

## Verification Standards

### What Requires Verification

| Claim | Verification Method |
|-------|---------------------|
| License | Read LICENSE file in repo |
| Activity | Check last commit via GitHub API |
| Chain count | Official docs or registry file |
| Audit | Link to audit report |
| Funding | Press releases, Crunchbase, etc. |

### What Doesn't Require Verification

- Feature claims from official docs (trust but verify when possible)
- WalletBeat data (already verified)
- GitHub stars/issues (automated)

---

## Pull Request Template

Use this template for your PR:

```markdown
## New Wallet: [Wallet Name]

### Data Sources
- GitHub: [link]
- Official docs: [link]
- WalletBeat: [link if available]

### Verification
- [x] GitHub repo verified
- [x] Last commit date checked: YYYY-MM-DD
- [x] License verified: [LICENSE]
- [x] Chain count verified: [N] chains
- [x] Score calculated: XX/100

### Score Breakdown
- Activity: XX/20
- License: XX/15
- Audits: XX/15
- Funding: XX/15
- Security: XX/35
- **Total: XX/100**

### Changes
- Added row to main comparison table
- Added to [list other sections updated]
- Updated changelog
```

---

## Questions?

Open an issue if you're unsure about:
- How to classify a wallet's license
- What activity status to assign
- How to score a particular feature

We're happy to help!
