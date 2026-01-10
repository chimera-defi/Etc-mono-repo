# AGENTS.md - Staking Projects Guidelines

> **Cross-references:**
> - **`.cursorrules`** - General AI assistant rules (all agents). See Rules #108-115 for Noir/Aztec contract learnings, Rules #140-155 for MCP CLI integration.
> - **`CLAUDE.md`** - Claude Code-specific instructions and quick reference
> - **`wallets/AGENTS.md`** - Wallet comparison specific guidelines
> - **`mobile_experiments/Valdi/AGENTS.md`** - Valdi framework specific guidelines
> - **`ideas/AGENTS.md`** - Ideas and research project guidelines

This document provides guidance for AI coding assistants working on staking-related projects and research.

---

## 📁 Projects in This Directory

### Aztec Staking

**Location:** `staking/aztec/`

**Purpose:** Privacy-focused staking implementation using Aztec Network
- Zero-knowledge proof-based staking
- Private transaction support
- Smart contracts in Noir language
- Research phase: exploring Aztec capabilities

### Staking Research

**Location:** `staking/research/`

**Purpose:** General staking research and analysis
- Staking mechanism comparisons
- Economic models
- Risk analysis
- Implementation strategies

**Status:** Active research

---

## 🎯 Core Principles for Staking Work

1. **Security first:** Staking involves real value - prioritize security
2. **Document thoroughly:** Complex smart contracts need extensive documentation
3. **Test rigorously:** Economic models must be verified mathematically
4. **Store knowledge:** Avoid re-researching protocols and security patterns
5. **Track decisions:** Document why certain approaches were chosen

---

## 🚀 MCP CLI for Token Efficiency (CRITICAL)

### Installation (REQUIRED BEFORE USE)

**CRITICAL:** MCP CLI must be installed before any `mcp-cli` commands are executed, or you'll get exit code 127 (command not found).

#### Check if MCP CLI is Already Installed

```bash
which mcp-cli
mcp-cli --version
```

If you see `v0.1.3` or higher, MCP CLI is installed. Otherwise, proceed with installation.

#### Install MCP CLI

```bash
curl -fsSL https://raw.githubusercontent.com/philschmid/mcp-cli/main/install.sh | bash
```

After installation, verify with `mcp-cli --version`.

**See also:** Full installation instructions in `CLAUDE.md` "MCP CLI Integration" section and `.cursorrules` Rules #140-141.

### Why Use MCP CLI for Staking Work

Staking projects involve:
- Reading multiple smart contract files
- Analyzing research documentation
- Comparing different staking protocols
- Tracking economic model assumptions
- Reviewing security audit findings

**MCP CLI reduces tokens by 60-80%** for these documentation-heavy workflows.

### Staking-Specific MCP CLI Patterns

#### Pattern 1: Explore Staking Project Structure

```bash
# Get complete directory tree for Aztec staking
mcp-cli filesystem/directory_tree '{
  "path": "/home/user/Etc-mono-repo/staking/aztec"
}'

# Get research directory structure
mcp-cli filesystem/directory_tree '{
  "path": "/home/user/Etc-mono-repo/staking/research"
}'

# Find all smart contract files
mcp-cli filesystem/search_files '{
  "path": "/home/user/Etc-mono-repo/staking",
  "pattern": "**/*.nr"
}'

# Find all documentation
mcp-cli filesystem/search_files '{
  "path": "/home/user/Etc-mono-repo/staking",
  "pattern": "**/*.md"
}'
```

**Token Savings:** ~80% vs recursive directory exploration

#### Pattern 2: Bulk Read Staking Documentation

```bash
# Read all staking docs at once
mcp-cli filesystem/read_multiple_files '{
  "paths": [
    "staking/README.md",
    "staking/aztec/README.md",
    "staking/research/README.md"
  ]
}'

# Read multiple smart contracts
mcp-cli filesystem/read_multiple_files '{
  "paths": [
    "staking/aztec/src/staking_pool.nr",
    "staking/aztec/src/rewards.nr",
    "staking/aztec/src/governance.nr"
  ]
}'
```

**Token Savings:** ~66% (1 call vs N calls)

#### Pattern 3: Search Across Staking Research

```bash
# Find all Noir contract files
mcp-cli filesystem/search_files '{
  "path": "/home/user/Etc-mono-repo/staking/aztec",
  "pattern": "**/*.nr"
}'

# Find all test files
mcp-cli filesystem/search_files '{
  "path": "/home/user/Etc-mono-repo/staking",
  "pattern": "**/*test*"
}'

# Find all configuration files
mcp-cli filesystem/search_files '{
  "path": "/home/user/Etc-mono-repo/staking",
  "pattern": "**/*config*"
}'
```

**Token Savings:** ~70% vs manual exploration

#### Pattern 4: Store Staking Knowledge (CRITICAL)

**Store findings to build cumulative knowledge:**

```bash
# Store Aztec staking architecture
mcp-cli memory/create_entities '{
  "entities": [
    {
      "name": "Aztec Staking Architecture",
      "entityType": "architecture",
      "observations": [
        "Privacy-focused using zero-knowledge proofs",
        "Smart contracts written in Noir language",
        "Private transaction support",
        "Staking pool with reward distribution",
        "Governance module for parameter updates",
        "AuthWit pattern for token approvals"
      ]
    }
  ]
}'

# Store Noir/Aztec learnings
mcp-cli memory/create_entities '{
  "entities": [
    {
      "name": "Noir Smart Contract Patterns",
      "entityType": "patterns",
      "observations": [
        "Use | for boolean OR, & for AND (not || and &&)",
        "Cross-contract calls require FunctionSelector computation",
        "AztecAddress as (Field) in signatures",
        "AuthWit required for token transfers",
        "Extract pure math into separate testable modules",
        "aztec-nargo needed for compilation"
      ]
    }
  ]
}'

# Store staking economics
mcp-cli memory/create_entities '{
  "entities": [
    {
      "name": "Staking Economics Model",
      "entityType": "economics",
      "observations": [
        "APY calculation: (rewards / staked) * (365 / period_days) * 100",
        "Slashing conditions: downtime, malicious behavior",
        "Minimum stake: prevents spam attacks",
        "Lock-up period: balances liquidity vs security",
        "Reward distribution: proportional to stake and time"
      ]
    }
  ]
}'

# Store security considerations
mcp-cli memory/create_entities '{
  "entities": [
    {
      "name": "Staking Security Patterns",
      "entityType": "security",
      "observations": [
        "Reentrancy guards on withdraw functions",
        "Integer overflow checks for reward calculations",
        "Access control for admin functions",
        "Emergency pause mechanism",
        "Time-locked parameter updates",
        "Audit requirements before mainnet"
      ]
    }
  ]
}'

# Store research findings
mcp-cli memory/create_entities '{
  "entities": [
    {
      "name": "Staking Protocol Comparison",
      "entityType": "research",
      "observations": [
        "Ethereum: Delegated proof-of-stake, 32 ETH minimum",
        "Cosmos: Tendermint consensus, liquid staking",
        "Polkadot: Nominated proof-of-stake, NPoS",
        "Aztec: Privacy-preserving, ZK proofs",
        "Tradeoffs: Security vs decentralization vs scalability"
      ]
    }
  ]
}'

# Create relationships
mcp-cli memory/create_relations '{
  "relations": [
    {"from": "Aztec Staking Architecture", "to": "Noir Smart Contract Patterns", "relationType": "uses"},
    {"from": "Aztec Staking Architecture", "to": "Staking Economics Model", "relationType": "implements"},
    {"from": "Aztec Staking Architecture", "to": "Staking Security Patterns", "relationType": "follows"},
    {"from": "Aztec Staking Architecture", "to": "Staking Protocol Comparison", "relationType": "informed_by"}
  ]
}'
```

**Token Savings:** ~90% across sessions (store once, query many times)

#### Pattern 5: Query Staking Knowledge Before Starting

**ALWAYS query first to leverage existing research:**

```bash
# Search for Aztec knowledge
mcp-cli memory/search_nodes '{"query": "Aztec"}'
mcp-cli memory/search_nodes '{"query": "Noir"}'
mcp-cli memory/search_nodes '{"query": "staking"}'

# Search for security patterns
mcp-cli memory/search_nodes '{"query": "security"}'

# Get specific entities
mcp-cli memory/open_nodes '{
  "names": ["Aztec Staking Architecture", "Staking Economics Model", "Staking Security Patterns"]
}'

# Read entire knowledge graph
mcp-cli memory/read_graph '{}'
```

**Token Savings:** ~95% vs re-reading documentation

### Staking Work Checklist with MCP CLI

When working on staking tasks:

1. **🔥 Query knowledge first:** Check `memory/search_nodes` for existing research
2. **Explore structure:** Use `directory_tree` for project layout
3. **Batch contract reads:** Use `read_multiple_files` for smart contracts
4. **Store discoveries:** Use `memory/create_entities` for all research findings
5. **Link concepts:** Use `memory/create_relations` to connect security, economics, architecture
6. **Search efficiently:** Use `search_files` for contracts, tests, configs

### Example: Analyzing Aztec Staking Contracts

**Traditional approach (inefficient):**
```
Read staking/README.md (full)
→ Read staking/aztec/README.md (full)
→ ls staking/aztec/src/
→ Read staking_pool.nr (full)
→ Read rewards.nr (full)
→ Research Noir syntax
→ Research AuthWit pattern
→ Repeat research in next session
```

**MCP CLI approach (efficient):**
```bash
# 1. Query existing knowledge
mcp-cli memory/search_nodes '{"query": "Aztec staking"}'
mcp-cli memory/search_nodes '{"query": "Noir patterns"}'

# 2. Explore structure in one call
mcp-cli filesystem/directory_tree '{
  "path": "/home/user/Etc-mono-repo/staking/aztec"
}'

# 3. Find all smart contracts
mcp-cli filesystem/search_files '{
  "path": "/home/user/Etc-mono-repo/staking/aztec",
  "pattern": "**/*.nr"
}'

# 4. Batch read key files
mcp-cli filesystem/read_multiple_files '{
  "paths": [
    "staking/README.md",
    "staking/aztec/README.md"
  ]
}'

# 5. Read first 100 lines of contracts (quick overview)
mcp-cli filesystem/read_text_file '{
  "path": "/home/user/Etc-mono-repo/staking/aztec/src/staking_pool.nr",
  "head": 100
}'

# 6. Store findings for future sessions
mcp-cli memory/create_entities '{
  "entities": [
    {
      "name": "Aztec Staking Pool Contract",
      "entityType": "contract",
      "observations": [
        "Main staking pool implementation",
        "Handles deposits, withdrawals, rewards",
        "Uses AuthWit for token approvals",
        "Implements emergency pause",
        "Slashing mechanism for misbehavior"
      ]
    }
  ]
}'
```

**Token Savings:** ~80% vs traditional approach + persistent across sessions

### Staking-Specific Knowledge to Store

Store these entity types to build cumulative knowledge:

1. **Architecture:** System design, component interactions, data flow
2. **Economics:** APY models, reward distribution, tokenomics
3. **Security:** Attack vectors, mitigation strategies, audit findings
4. **Patterns:** Smart contract patterns, Noir-specific idioms
5. **Research:** Protocol comparisons, academic papers, best practices
6. **Decisions:** Why certain approaches were chosen, tradeoffs
7. **Contracts:** Individual contract purposes, functions, dependencies

### Smart Contract Analysis Workflow

When analyzing smart contracts:

```bash
# Store contract structure
mcp-cli memory/create_entities '{
  "entities": [
    {
      "name": "Staking Pool Contract Structure",
      "entityType": "contract_structure",
      "observations": [
        "Functions: deposit, withdraw, claim_rewards, slash",
        "State: total_staked, user_stakes, reward_pool",
        "Events: Staked, Withdrawn, RewardClaimed, Slashed",
        "Modifiers: onlyOwner, whenNotPaused, validAmount",
        "Dependencies: Token contract, Governance contract"
      ]
    }
  ]
}'

# Store security analysis
mcp-cli memory/create_entities '{
  "entities": [
    {
      "name": "Staking Pool Security Analysis",
      "entityType": "security_analysis",
      "observations": [
        "✅ Reentrancy protection on withdraw",
        "✅ Integer overflow checks with SafeMath",
        "✅ Access control on admin functions",
        "⚠️ Centralization risk: owner can pause",
        "⚠️ Time-delay needed for parameter changes",
        "❌ Missing: slashing cooldown period"
      ]
    }
  ]
}'

# Store testing strategy
mcp-cli memory/create_entities '{
  "entities": [
    {
      "name": "Staking Contract Testing Strategy",
      "entityType": "testing",
      "observations": [
        "Unit tests: Individual function correctness",
        "Integration tests: Multi-contract interactions",
        "Fuzz tests: Random input boundary testing",
        "Invariant tests: System invariants maintained",
        "Economic tests: APY calculations, reward distribution",
        "Security tests: Reentrancy, overflow, access control"
      ]
    }
  ]
}'
```

### Economic Model Analysis

```bash
# Store economic parameters
mcp-cli memory/create_entities '{
  "entities": [
    {
      "name": "Staking Economic Parameters",
      "entityType": "parameters",
      "observations": [
        "Minimum stake: 100 tokens (prevents spam)",
        "Lock-up period: 14 days (balances liquidity)",
        "APY range: 5-15% (competitive, sustainable)",
        "Slashing penalty: 10% (meaningful deterrent)",
        "Reward frequency: Daily (good UX)",
        "Governance threshold: 1% of total stake (decentralized)"
      ]
    }
  ]
}'

# Store economic analysis
mcp-cli memory/create_entities '{
  "entities": [
    {
      "name": "Staking Economic Analysis",
      "entityType": "economic_analysis",
      "observations": [
        "Revenue source: Transaction fees from network",
        "Reward sustainability: Fee revenue must exceed rewards",
        "Attack cost: 51% attack requires >50% stake",
        "Liquidity impact: 14-day lockup affects market liquidity",
        "Inflation rate: New token emissions for rewards",
        "Equilibrium: Staking ratio stabilizes at ~60-70%"
      ]
    }
  ]
}'
```

### Research Document Integration

When adding research findings:

```bash
# Store academic research
mcp-cli memory/create_entities '{
  "entities": [
    {
      "name": "Staking Research Papers",
      "entityType": "research_papers",
      "observations": [
        "Buterin 2017: Design philosophy for Casper FFG",
        "Kwon 2014: Tendermint consensus algorithm",
        "Garay 2015: Proof-of-stake protocol security",
        "Stewart 2018: Compounding rewards analysis",
        "Key insight: Security depends on stake value"
      ]
    }
  ]
}'

# Store comparison analysis
mcp-cli memory/create_entities '{
  "entities": [
    {
      "name": "Privacy Staking Comparison",
      "entityType": "competitive_analysis",
      "observations": [
        "Aztec: Full privacy via ZK proofs, new network",
        "Zcash: Shielded staking proposed, established network",
        "Monero: No staking (PoW), privacy-focused",
        "Secret Network: Privacy smart contracts, Cosmos-based",
        "Gap: Limited privacy-preserving staking options",
        "Opportunity: Privacy + DeFi integration"
      ]
    }
  ]
}'
```

### Noir/Aztec Specific Patterns

```bash
# Store Noir language patterns
mcp-cli memory/create_entities '{
  "entities": [
    {
      "name": "Noir Language Gotchas",
      "entityType": "language_patterns",
      "observations": [
        "Use | for OR, & for AND (not || and &&)",
        "Early return is anti-pattern, use if-else",
        "FunctionSelector needs exact signature match",
        "AztecAddress represented as (Field) in signatures",
        "No dynamic arrays, use constrained arrays",
        "Loops must have compile-time bounds"
      ]
    }
  ]
}'

# Store Aztec patterns
mcp-cli memory/create_entities '{
  "entities": [
    {
      "name": "Aztec Smart Contract Patterns",
      "entityType": "framework_patterns",
      "observations": [
        "AuthWit for token approvals (user pre-authorizes)",
        "Private vs public state separation",
        "Contract library methods with #[contract_library_method]",
        "Oracles for off-chain data",
        "Note encryption for private data",
        "aztec-nargo for compilation (Docker-based)"
      ]
    }
  ]
}'
```

### See Also

- **Full MCP CLI Documentation:** `/home/user/Etc-mono-repo/mcp-cli-evaluation.md`
- **General MCP CLI Guidelines:** See CLAUDE.md "MCP CLI Integration" section
- **Noir/Aztec Rules:** See `.cursorrules` Rules #108-115
- **MCP CLI Rules:** See `.cursorrules` Rules #140-155

---

## 📝 Best Practices for Staking Work

1. **Security first:** Always consider attack vectors and mitigation
2. **Document math:** Economic formulas must be documented and verified
3. **Store security patterns:** Reuse vetted security patterns across contracts
4. **Link research to implementation:** Connect academic findings to code decisions
5. **Track audit findings:** Store security audit results and remediations
6. **Test economics:** Verify APY calculations, reward distribution math
7. **Preserve history:** Store why certain approaches were rejected

---

## 🔐 Security Workflow with MCP CLI

```bash
# Before starting security review
mcp-cli memory/search_nodes '{"query": "security patterns"}'
mcp-cli memory/search_nodes '{"query": "Aztec security"}'

# During review, store findings
mcp-cli memory/create_entities '{
  "entities": [
    {
      "name": "Staking Pool Security Review Jan 2026",
      "entityType": "security_review",
      "observations": [
        "✅ Reentrancy: Protected with nonReentrant modifier",
        "✅ Access control: OnlyOwner for admin functions",
        "✅ Integer math: Using SafeMath library",
        "⚠️ Centralization: Owner has pause power",
        "⚠️ Front-running: deposit/withdraw order matters",
        "❌ Missing: Time-delay for parameter changes",
        "Recommendation: Add timelock for governance"
      ]
    }
  ]
}'
```

---

*Last updated: January 10, 2026*
