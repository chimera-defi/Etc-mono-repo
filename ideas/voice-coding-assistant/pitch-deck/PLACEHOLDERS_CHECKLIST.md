# Pitch Deck Placeholders Checklist

This document lists all placeholder fields in the pitch deck that must be filled before presenting to investors.

---

## ✅ Completed Fixes

- [x] **CRITICAL:** Fixed math error on Slide 31 (1,000 paying users → 4,500 total users)
- [x] **CRITICAL:** Marked "Codebase-aware" as "Planned (P0)" instead of existing feature
- [x] **CRITICAL:** Updated competitive landscape to show "Codebase Context: Planned"

---

## 🔴 P0: Critical for Any Pitch

These MUST be filled before any presentation:

### Slide 1: Cover
- [ ] `[Your Name]` → Replace with actual founder name
- [ ] `[Date]` → Replace with presentation date
- [ ] **Optional:** Add company logo
- [ ] **Optional:** Add founder photo

### Slide 20: Team
- [ ] `[Your Name]` → Replace with actual founder name
- [ ] `[Prior experience]` → Add your background (e.g., "Ex-Google SWE, 5 years mobile dev")
- [ ] `[Personal connection to problem]` → Add your story (e.g., "Frustrated coding on phone during commute")
- [ ] `[Technical/business strengths]` → Add skills (e.g., "Full-stack dev, React Native expert, 2 YC apps")
- [ ] `[Name], [Expertise]` (Advisors) × 3 → Either add real advisors OR remove section entirely

**Critical:** Investors invest in founders. This slide makes or breaks the pitch.

### Slide 35: Thank You
- [ ] `[Your Email]` → Add actual email (e.g., "founder@example.com")
- [ ] `[Your Website]` → Add website OR remove if not available
- [ ] `[Calendly Link]` → Add scheduling link OR remove if not available
- [ ] **Optional:** Add QR code for easy contact

---

## 🟡 P1: Nice to Have

These improve the pitch but aren't critical:

### Slide 4: Product Demo
- [ ] Add screenshot mockup of voice interface
- [ ] Add video demo link (when MVP ready)
- [ ] Add specific example: "What takes 30 min with Cursor takes 3 min with voice"

### Slide 7: Market Opportunity
- [ ] Add visual: Line chart showing three markets converging
- [ ] Highlight that ALL three markets growing 20%+ annually

### Slide 12: Competitive Landscape
- [ ] Add visual: 2×2 positioning matrix (Mobile vs Desktop, Voice vs Text)
- [ ] Consider adding "GitHub Copilot" row ($10/mo, IDE-only)

### Slide 14: Go-to-Market
- [ ] Add Gantt chart showing 4 phases visually
- [ ] Add specific distribution tactics: "ProductHunt Golden Kitty submission"

---

## 🟢 P2: Optional Details

These are refinements that can wait:

### General
- [ ] Update all data verification dates to most recent
- [ ] Add specific user quotes (when available from alpha)
- [ ] Add customer testimonials (when available)
- [ ] Create backup slides for common Q&A

### Slide 21: Financial Ask
- [ ] Add timeframe for each ROI scenario (e.g., "Conservative: 4 years")
- [ ] Add note: "Actively raising, closing by [date]"

### Slide 20: Team
- [ ] Add LinkedIn/GitHub links for credibility
- [ ] Add founder's GitHub stars or previous projects
- [ ] If no advisors yet, say "Actively recruiting advisors"

---

## 📊 Data Verification Status

All data points verified against source documents:

| Data Point | Status | Source |
|------------|--------|--------|
| Market sizes ($18B-$988B) | ✅ Verified | RISK_ANALYSIS.md lines 185-200 |
| Competitor valuations ($29.3B Cursor) | ✅ Verified | RISK_ANALYSIS.md line 214 |
| Pricing ($15/mo Pro tier) | ✅ Verified | EXECUTIVE_SUMMARY.md line 57 |
| Revenue projections (Year 1-3) | ✅ Verified | EXECUTIVE_SUMMARY.md lines 79-81 |
| Unit economics (LTV:CAC 6:1) | ✅ Verified | RISK_ANALYSIS.md lines 173-175 |
| Voice accuracy (95-98%) | ✅ Verified | STT_WISPR_FLOW_QUALITY.md |
| Decision gates (Week 4/8/16) | ✅ Verified | EXECUTIVE_SUMMARY.md lines 137-142 |

**Last updated:** December 24, 2025

---

## 🎯 Pre-Presentation Checklist

Before presenting, verify:

- [ ] All P0 placeholders filled
- [ ] Practiced pitch (10-12 min + 3-5 min Q&A)
- [ ] Tech tested (projector/screen compatibility)
- [ ] Prepared Q&A talking points (see below)
- [ ] PDF/HTML versions both updated
- [ ] Data is current (< 6 months old)

---

## 💬 Common Investor Questions (Prepare Answers)

1. **"What if Cursor adds mobile tomorrow?"**
   - "We have 12-18 month window + first-mover brand advantage"
   - "Mobile UX requires rethinking, not just porting desktop"
   - "Voice-first is fundamentally different from text-with-voice"

2. **"Why voice instead of just text?"**
   - "3.75x productivity gain (150 WPM voice vs 40 WPM typing)"
   - "Accessibility: 40M developers with disabilities globally"
   - "Natural language reduces learning curve"

3. **"Small TAM (1.44M)?"**
   - "Niche but profitable - lifestyle business or acquisition exit"
   - "Can bootstrap to $50K MRR without VC"
   - "Shows discipline - we know the risks"

4. **"What's your unfair advantage?"**
   - "Mobile-first developer background [add your experience]"
   - "Deep understanding of voice UX from [add your story]"
   - "First to market with mobile + voice + AI"

5. **"Why $15/mo vs competitors' $20?"**
   - "Lower CAC ($30 vs $200) enables lower price"
   - "Product-led growth, not sales-led"
   - "Cursor pricing backlash = opportunity"

---

## 📝 Customization Notes

### For Different Audiences

**Angel Investors:**
- Emphasize bootstrap option (de-risks for them)
- Highlight decision gates (disciplined execution)
- Show clear exit path (acquisition by Cursor/GitHub)

**VCs:**
- Emphasize market growth (22-26% CAGR)
- Highlight TAM expansion (desktop version in Year 2)
- Show platform play (voice coding API in Year 4)

**Co-founders:**
- Remove financial ask slide
- Add "What we need from you" (skills, equity split)
- Emphasize vision and impact

**Employees:**
- Remove valuation details
- Emphasize mission and team culture
- Add compensation and equity details

---

## 🔗 Related Documents

- **Comprehensive Review:** `.cursor/artifacts/pitch-deck-review.md` (7.8/10 score, detailed findings)
- **Pitch Deck Guide:** `PITCH_DECK_GUIDE.md` (slide-by-slide breakdown)
- **Executive Summary:** `EXECUTIVE_SUMMARY.md` (1-page overview)
- **Risk Analysis:** `RISK_ANALYSIS_AND_VIABILITY.md` (comprehensive assessment)

---

**Status:** Ready for personalization
**Next step:** Fill P0 placeholders, then practice pitch
