# Aztec Liquid Staking - Project Documentation

**Complete research, planning, and strategic materials for building a liquid staking protocol on Aztec Network.**

Last Updated: December 24, 2025

---

## 📚 Documentation Index

### Strategic Planning (Start Here)

1. **[EXECUTIVE-SUMMARY.md](./EXECUTIVE-SUMMARY.md)** ⭐
   - One-page overview for executives and investors
   - Market opportunity, business model, competitive landscape
   - Decision framework and next steps
   - **Read this first** (5 minutes)

2. **[ASSUMPTIONS.md](./ASSUMPTIONS.md)**
   - Critical assumptions registry
   - Verification status (✅ Verified, ⚠️ Estimated, ❌ Unverified)
   - Validation roadmap and decision triggers
   - Update monthly

3. **[IMPLEMENTATION-PLAN.md](./IMPLEMENTATION-PLAN.md)**
   - 6-month critical path: Design → Build → Test → Deploy
   - Week-by-week milestones
   - Team requirements, tooling, testnet validation
   - Read before starting development

4. **[FUNDRAISING.md](./FUNDRAISING.md)**
   - Investor deck outline (12 slides)
   - Pitch narrative and objection handling
   - Target investors and data room contents
   - Use for seed round ($500k-$750k)

### Technical Analysis

5. **[liquid-staking-analysis.md](./liquid-staking-analysis.md)**
   - Comprehensive technical deep-dive (2,400+ lines)
   - 100% Noir architecture, smart contract specs
   - Bot infrastructure, security considerations
   - Market sizing, revenue projections
   - **Most detailed document** - reference material

---

## 🎯 Quick Navigation

**If you want to:**

- **Understand the opportunity in 5 minutes** → Read EXECUTIVE-SUMMARY.md
- **Validate key assumptions** → Review ASSUMPTIONS.md
- **Plan development timeline** → Follow IMPLEMENTATION-PLAN.md
- **Prepare for fundraising** → Use FUNDRAISING.md
- **Deep-dive technical architecture** → Study liquid-staking-analysis.md

---

## ✅ Key Findings

### Competitive Intelligence (Verified)

**Confirmed Competitor:**
- **Olla (by Kryha)** - Featured at Aztec @Devconnect 2025
  - Status: Announced, no mainnet launch date
  - Source: [Aztec @Devconnect Event](https://luma.com/heydpbsj)

**Multiple Teams Building:**
- Aztec TGE blog confirms "multiple teams working on fractional staking"
- Source: [Aztec TGE Next Steps](https://aztec.network/blog/aztec-tge-next-steps)

**Our Window:** 6-12 months to launch before market saturation

**Tracker:** Maintain an up-to-date competitor view in `COMPETITORS.md`.

### Testnet Availability (Verified)

**Aztec Public Testnet:**
- Status: ✅ Live since May 2025
- Access: https://testnet.aztec.network/
- Developer Portal: https://aztec.network/developers
- 100+ sequencers operational on testnet

**Validation Plan:**
- Deploy test validator (Week 1)
- Measure costs, gas prices, staking mechanics (Weeks 1-3)
- See IMPLEMENTATION-PLAN.md for full checklist

**Where results go:** Add dated findings to `VALIDATION-RESULTS.md` and then update `ASSUMPTIONS.md` / `ECONOMICS.md` accordingly.

### Economics (Verified)

**Revenue Model (definitions matter):**
- 10% protocol fee on staking rewards (industry standard baseline)
- **Two break-evens** depending on what you include (see `ECONOMICS.md`):
  - **Protocol-only break-even** (validators + infra): **$2.25M TVL** @ 8% APY, 10% fee
  - **Fully-loaded break-even** (team + overhead planning): **~$84M TVL** @ 8% APY, 10% fee
- “Break-even” figures cited elsewhere in this folder are being standardized to these definitions.

**Capital Requirements (standardized):**
- **AZTEC capital:** **$0** (users provide 100% of staking capital)
- **Seed budget planning:** **$500k–$750k** to reach production launch (engineering + audits + runway)
- **Protocol-only infra (post-launch):** ~**$1.5k/month** (3 validators + baseline infra), excluding salaries
  - All detailed cost tables live in `ECONOMICS.md` (source of truth)

---

## 🚀 Immediate Next Steps

**This Week:**

1. **Hire Noir Engineers** (CRITICAL PATH)
   - Post to Aztec Discord: https://discord.gg/aztec
   - Requirements: Noir OR Rust + ZK experience
   - Compensation: $120k-$150k + equity

2. **Deploy Testnet Validator**
   - Follow: https://docs.aztec.network/the_aztec_network/setup/sequencer_management
   - Measure actual costs (vs $400/month estimate)
   - Run for 2 weeks minimum

3. **Start Fundraising Outreach**
   - Warm intros to Pantera, Framework, Dragonfly
   - Use FUNDRAISING.md pitch deck outline
   - Target close: $500k-$750k by April 2026

4. **Aztec Foundation Contact**
   - Ecosystem support request
   - Potential grant application
   - Developer relations partnership

---

## 📊 Documentation Status

| Document | Completeness | Last Review | Next Review |
|----------|--------------|-------------|-------------|
| EXECUTIVE-SUMMARY.md | ✅ Complete | Dec 22, 2025 | Jan 15, 2026 |
| ASSUMPTIONS.md | ✅ Complete | Dec 22, 2025 | Monthly |
| IMPLEMENTATION-PLAN.md | ✅ Complete | Dec 22, 2025 | Week 12 checkpoint |
| FUNDRAISING.md | ✅ Complete | Dec 22, 2025 | Before investor meetings |
| liquid-staking-analysis.md | ✅ Complete | Dec 22, 2025 | Quarterly |

---

## 🔗 External Resources

**Aztec Network:**
- Official Site: https://aztec.network/
- Documentation: https://docs.aztec.network/
- Testnet: https://testnet.aztec.network/
- Staking Dashboard: https://stake.aztec.network/
- Discord: https://discord.gg/aztec

**Development:**
- Noir Documentation: https://noir-lang.org/docs/
- Aztec.nr Framework: https://docs.aztec.network/developers/docs/guides/smart_contracts
- Token Tutorial: https://docs.aztec.network/developers/docs/tutorials/contract_tutorials/token_contract

**Market Research:**
- Ethereum Liquid Staking Data: https://dune.com/hildobby/eth2-staking
- Aztec Ecosystem Analysis: https://www.artemisanalytics.com/resources/protocol-highlight-aztec

---

## 🤝 Contributing

**Team Access:**
- Technical Lead: Maintain liquid-staking-analysis.md
- CEO/Founder: Own EXECUTIVE-SUMMARY.md, FUNDRAISING.md
- Project Manager: Update IMPLEMENTATION-PLAN.md weekly
- All: Review and update ASSUMPTIONS.md monthly

**Review Cadence:**
- Weekly: IMPLEMENTATION-PLAN.md milestones
- Monthly: ASSUMPTIONS.md validation
- Quarterly: Full documentation review

---

## 📝 Document History

**December 22, 2025:**
- Initial creation of all strategic planning documents
- Verified competitive intelligence (Olla confirmed)
- Validated Aztec testnet availability
- Added source citations for all factual claims

**December 24, 2025:**
- Standardized economics definitions and reconciled cross-doc inconsistencies (protocol-only vs fully-loaded break-even)

**Next Update:** January 15, 2026 (or upon major assumption change)

---

## ⚠️ Important Disclaimers

**Competitive Intelligence:**
Claims about "two teams building" are based on informal ecosystem communications and Aztec official blog posts. Olla (by Kryha) is the only confirmed competitor with public announcement.

**Cost Estimates:**
Infrastructure costs ($299/month) verified via vendor pricing pages. Validator costs ($400/month) are estimates based on Ethereum benchmarks - **must validate on Aztec testnet**.

**Revenue Projections:**
Based on 8% staking APR (estimated), 10% protocol fee (industry standard), and TVL assumptions. Actual results may vary significantly.

---

**Questions?** Contact project lead or review detailed analysis in liquid-staking-analysis.md

**Ready to start?** Follow IMPLEMENTATION-PLAN.md Week 1-2 checklist
