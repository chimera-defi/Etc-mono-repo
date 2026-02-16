# Meta-Learnings Index - Agent Brain Backups

**Purpose:** Archive generalized insights from major projects (harness engineering, mega ETH) for reuse across agents + projects.

**Coverage:** Patterns, frameworks, decision-making approaches — NOT project-specific secrets.

---

## 🏗️ Harness Engineering Learnings
**File:** harness-engineering-learnings.md  
**Source:** OpenAI harness engineering principles + eth2-quickstart integration + token reduction work

**Key sections:**
1. **Repository as Single Source of Truth** — git > external docs/Slack
2. **Agent Legibility > Human Preference** — code beats comments
3. **Mechanical Enforcement** — linters + CI prevent human error
4. **Structured Memory + Curation** — daily logs → weekly distill → long-term memory
5. **Infrastructure Reuse Patterns** — 80-90% reuse framework
6. **Token Reduction Learnings** — hierarchical context loading
7. **Secrets Handling** — what to exclude from backups

**Applicable to:** All agent systems, multi-project repos, CI/CD tooling

**Introduced:** 2026-02-16  
**Validation:** 515 eth2-quickstart tests, 45-file harness engineering implementation

---

## 🚀 Mega ETH Startup Development Learnings
**File:** mega-eth-learnings.md  
**Source:** Mega ETH startup RFC work + competitive analysis + architecture planning

**Key sections:**
1. **Vertical Integration Audit** — map existing infrastructure, identify reuse/extend/build
2. **Competitive Positioning Framework** — find structural gaps, not marginal advantages
3. **Market Sizing via TAM × Capture** — conservative modeling for investor confidence
4. **Go-to-Market Phasing** — Phase 1 (design) → Phase 2 (testnet) → Phase 3 (launch)
5. **Infrastructure Reuse Decision Matrix** — when to reuse, extend, or rebuild
6. **Testing Strategy for Scale** — test early at scale; don't validate in production
7. **Hiring for Critical Path** — deep expertise on bottlenecks, external for leverage
8. **Decision Documentation** — record context + rationale for all major bets
9. **Secrets Exclusions** — what to document vs. protect

**Applicable to:** Startup planning, product strategy, engineering execution, team building

**Introduced:** 2026-02-16  
**Validation:** 3 RFCs (1,296 lines), competitive analysis of 5+ protocols

---

## How to Use These Learnings

### For New Agents
1. Clone harness-engineering-learnings.md to your project
2. Implement: docs/, linters/, scripts/ structure
3. Load MEMORY.md-curation workflow at session start
4. Use memory/YYYY-MM-DD.md for daily logs, prune weekly

### For Startup Planning
1. Start with mega-eth-learnings.md section 1 (vertical integration audit)
2. Build competitive matrix (section 2 framework)
3. Model TAM × capture (section 3)
4. Design phased GTM (section 4)
5. Document all major decisions (section 8)

### For Engineering Decisions
1. Use infrastructure reuse matrix (mega-eth-learnings section 5)
2. Apply testing strategy at scale (section 6)
3. Record decision rationale in git (section 8)
4. Refer to harness engineering for agent-system patterns

### For Token Optimization
1. Review harness-engineering-learnings section 6
2. Implement hierarchical context loading
3. Curate MEMORY.md ruthlessly (remove outdated)
4. Use file offsets for large reads (not streaming full files)

---

## Secrets Handling Policy

**These documents are safe to share/publish because:**
- ✅ No private keys, IP addresses, or infrastructure details
- ✅ No specific financial figures, funding amounts, or cost data
- ✅ No internal team info, personal details, or confidential conversations
- ✅ No proprietary exploits or undisclosed vulnerabilities
- ✅ Only generalizable patterns + public market analysis

**Before adding to agent-brains:**
1. Scrub: Names, dates, specific URLs (replace with placeholders)
2. Anonymize: Private financial models → general frameworks
3. Validate: Would this be useful in a public GitHub repo?
4. Document: Explain what was excluded + why

**Examples of what was excluded:**
- 🔴 Specific eth2-quickstart SSH keys (security)
- 🔴 Validator IP addresses (operational security)
- 🔴 Specific funding amount targets (confidential)
- 🔴 Internal team conversations (privacy)

**Examples of what was kept:**
- ✅ Architectural patterns (contracts, monitoring, SLA)
- ✅ Public competitive analysis (Lido, Rocket Pool, etc)
- ✅ General financial frameworks (TAM, capture %, scaling)
- ✅ Decision-making processes (RFC format, reversibility)

---

## Integration with Claudy v1 Backup

These learnings are **complementary to** the Claudy v1 agent backup:

- **Claudy v1 (agent-brains/claudy-v1/)** = operational snapshot of an agent's state at a point in time
  - MEMORY.md, AGENTS.md, SOUL.md (who the agent was)
  - TOOLS.md, configs, specific setup
  - Useful for: agent reincarnation, understanding prior decisions

- **Meta-learnings** = generalizable patterns extracted from projects
  - harness-engineering-learnings.md (system design)
  - mega-eth-learnings.md (startup execution)
  - Useful for: any new agent, any new project

**Relationship:** Claudy v1 implements harness engineering patterns; new agents inherit those patterns via meta-learnings.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| v1 | 2026-02-16 | Initial backup: harness engineering + mega ETH learnings |

---

## Contributing New Meta-Learnings

**When to add a new meta-learning:**
- After completing a significant project (2+ weeks of work)
- When patterns are generalizable to 3+ other use cases
- When documented in the original project (git history preserved)
- When secrets have been carefully scrubbed

**Format:**
1. Create new .md file in agent-brains/
2. Follow sections: Principles → Patterns → Generalization → Applications → Secrets handling
3. Add entry to META_LEARNINGS_INDEX.md
4. Commit with message: `docs(meta-learnings): Add [topic] from [project]`

**Example:**
```
docs(meta-learnings): Add DeFi competitive analysis patterns from mega-ETH project

- Competitive positioning framework (structural gaps vs price wars)
- Market sizing via TAM × capture modeling
- Go-to-market phasing (design → testnet → mainnet)
- Smart contract testing at scale

No secrets exposed; all patterns generalizable.
```

---

**Meta-learnings curator:** Claudy (agent brain backup)  
**Backup location:** https://github.com/chimera-defi/Etc-mono-repo/agent-brains/  
**Last updated:** 2026-02-16 09:18 UTC  
**Access level:** Public (safe for distribution)
