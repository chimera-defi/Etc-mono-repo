# Mobile Speech Agent - Pitch Deck

This folder contains multiple presentation formats for the Mobile Speech Agent pitch deck. Each format has different strengths and use cases.

---

## 📊 Available Formats

| Format | File | Use Case | Output |
|--------|------|----------|--------|
| **LaTeX Beamer** | `pitch-deck.tex` | Academic/professional presentations, print | PDF |
| **Markdown/Marp** | `pitch-deck-marp.md` | Modern web presentations, easy editing | HTML/PDF |

---

## 🚀 Quick Start

### Option 1: LaTeX Beamer (Professional PDF)

**Best for:** Investor meetings, formal presentations, print handouts

**📱 View Online (No Installation):**
1. Go to [Overleaf](https://www.overleaf.com/project)
2. Create new project → Upload Project
3. Upload `pitch-deck.tex`
4. Click "Recompile" to generate PDF
5. Download PDF

**💻 Compile Locally:**
```bash
cd pitch-deck
pdflatex pitch-deck.tex
pdflatex pitch-deck.tex  # Run twice for proper references
```

**Requirements for local compilation:**
- TeX distribution (TeX Live, MiKTeX, or MacTeX)
- Packages: beamer, graphicx, booktabs, multirow, tikz

**Output:** `pitch-deck.pdf` (16:9 widescreen, professional theme)

**Pros:**
- ✅ Professional, polished output
- ✅ Perfect for PDF export
- ✅ Consistent typography and spacing
- ✅ Works offline

**Cons:**
- ❌ Requires LaTeX installation
- ❌ Steeper learning curve
- ❌ Longer compile time

---

### Option 2: Markdown/Marp (Modern Web)

**Best for:** Remote presentations, browser-based sharing, quick edits

**📱 View Now (Pre-compiled):**
- **HTML:** Open `pitch-deck-marp.html` in any browser
- **GitHub:** View `pitch-deck-marp.html` directly on GitHub

**✏️ Edit & Preview (VS Code):**
1. Install [Marp for VS Code](https://marketplace.visualstudio.com/items?itemName=marp-team.marp-vscode) extension
2. Open `pitch-deck-marp.md`
3. Click "Open Preview to the Side"

**💻 Compile Yourself:**

Install Marp CLI:
```bash
npm install -g @marp-team/marp-cli
```

Generate HTML:
```bash
cd pitch-deck
marp pitch-deck-marp.md --html -o pitch-deck-marp.html
```

Generate PDF (requires Chrome/Edge/Firefox):
```bash
marp pitch-deck-marp.md --pdf -o pitch-deck-marp.pdf
```

**Output:** HTML or PDF (16:9 widescreen, modern design)

**Pros:**
- ✅ Easy to edit (plain Markdown)
- ✅ Fast compilation
- ✅ Web-native (HTML output)
- ✅ Live preview in VS Code

**Cons:**
- ❌ Requires Node.js/npm
- ❌ Less control over typography

---

## 📝 Slide Content

Both versions contain the same 15 slides:

1. **Cover** - Title, tagline, presenter info
2. **The Problem** - Desktop lock-in, slow typing, no mobile solution
3. **The Solution** - Voice-first, mobile-native, AI agents
4. **Product Demo** - Screenshot flow or video demo
5. **Market Opportunity** - Three converging growth markets (Voice, AI Tools, Mobile)
6. **Business Model** - Pricing tiers, revenue projections, unit economics
7. **Competitive Landscape** - 2×2 matrix, competitive advantages
8. **Go-to-Market Strategy** - 4-phase launch, distribution channels
9. **Traction & Milestones** - Current status, 6-month roadmap, decision gates
10. **Team** - Founder, advisors, hiring plan
11. **Financial Ask** - $150K seed round, use of funds, investor ROI
12. **Why Now?** - AI boom, voice maturity, remote work, competitor weakness
13. **Risks & Mitigation** - Transparent risk assessment, de-risk strategy
14. **Vision** - 5-year roadmap, mission, impact
15. **The Ask & Close** - Specific ask, what we need, call to action

**Appendix Slides (available but not presented):**
- A1: Technical Architecture
- A2: Detailed Financial Model
- A3: Competitive Feature Matrix
- A4: User Research
- A5: Team Bios

---

## 🎨 Customization

### LaTeX Beamer (`pitch-deck.tex`)

**Change theme:**
```latex
\usetheme{Madrid}  % Options: Madrid, Copenhagen, Berlin, etc.
\usecolortheme{seahorse}  % Options: seahorse, dolphin, crane, etc.
```

**Update brand colors:**
```latex
\definecolor{brandblue}{RGB}{41, 128, 185}     % Your brand blue
\definecolor{brandpurple}{RGB}{142, 68, 173}  % Your brand purple
```

**Add logo:**
```latex
\logo{\includegraphics[height=0.8cm]{path/to/logo.png}}
```

**Update presenter info:**
```latex
\title{Mobile Speech Agent}
\author{Your Name}
\institute{Your Company}
\date{Date}
```

### Markdown/Marp (`pitch-deck-marp.md`)

**Change theme:**
```yaml
theme: default  # Options: default, gaia, uncover
```

**Custom CSS:**
```yaml
style: |
  section {
    background-color: #fff;
    color: #333;
  }
  h1 {
    color: #2980b9;
  }
```

**Add images:**
```markdown
![width:600px](path/to/image.png)
```

---

## 📂 File Structure

```
pitch-deck/
├── README.md              # This file
├── pitch-deck.tex         # LaTeX Beamer source
├── pitch-deck.pdf         # Compiled PDF (LaTeX)
├── pitch-deck-marp.md     # Markdown/Marp source
├── pitch-deck-marp.html   # Compiled HTML (Marp)
└── pitch-deck-marp.pdf    # Compiled PDF (Marp)
```

---

## 🎯 Presentation Tips

### Before You Present

1. **Practice timing** - Aim for 10-12 minutes, leave 3-5 for Q&A
2. **Customize for audience** - Investors vs co-founders vs employees
3. **Update data** - Verify market data, competitor info is current
4. **Add your story** - Replace placeholder text with your background
5. **Test tech** - Ensure projector/screen compatibility

### During Presentation

- **Tell a story** - Problem → Solution → Why Us → Why Now
- **Use visuals** - Point to charts, highlight key metrics
- **Show passion** - This is your vision, believe in it
- **Be honest** - Acknowledge risks, don't overpromise
- **End with clear ask** - $150K for 10% equity

### After Presentation

- **Send deck within 24 hours** - Email PDF version
- **Answer questions** - Follow up on outstanding items
- **Provide data room link** - If investor shows interest
- **Schedule follow-up** - Next steps, timeline

---

## 📊 Presenting Options

### In-Person Meeting
- **Use:** LaTeX PDF on laptop or printed handouts
- **Backup:** Have Marp HTML version on cloud (no software needed)

### Remote Meeting (Zoom, Google Meet)
- **Use:** Marp HTML in browser (share screen, no download)
- **Backup:** LaTeX PDF (cleaner, no browser UI)

### Email/Async Sharing
- **Use:** LaTeX PDF (professional, works everywhere)
- **Include:** Link to Marp HTML for interactive version

### Demo Day/Competition
- **Use:** LaTeX PDF (reliable, professional)
- **Print:** Handouts for judges

---

## 🔗 Resources

### LaTeX
- [Beamer User Guide](https://ctan.org/pkg/beamer)
- [Overleaf Beamer Tutorial](https://www.overleaf.com/learn/latex/Beamer)
- [LaTeX Themes Gallery](https://deic.uab.cat/~iblanes/beamer_gallery/)

### Marp
- [Marp Official Site](https://marp.app/)
- [Marp CLI Documentation](https://github.com/marp-team/marp-cli)
- [Marp Themes](https://github.com/marp-team/marp-core/tree/main/themes)

### Pitch Deck Examples
- [Y Combinator Pitch Deck Template](https://www.ycombinator.com/library/2u-how-to-build-your-seed-round-pitch-deck)
- [Sequoia Capital Pitch Deck Guide](https://www.sequoiacap.com/article/writing-a-business-plan/)
- [Guy Kawasaki 10/20/30 Rule](https://guykawasaki.com/the_102030_rule/)

---

## 📞 Questions?

For questions about the pitch deck content, see:
- [Pitch Deck Guidelines](../PITCH_DECK_GUIDE.md) - Detailed slide-by-slide breakdown
- [Executive Summary](../EXECUTIVE_SUMMARY.md) - One-page overview
- [Risk Analysis](../RISK_ANALYSIS_AND_VIABILITY.md) - Comprehensive risk assessment

---

**Good luck with your pitch! 🚀**
