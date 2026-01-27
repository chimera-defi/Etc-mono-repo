# Wallet Radar Landing Page — Layout Spec (Ready-to-Code)

## Goals
- Fast path to comparison (primary CTA above the fold).
- Trust-first messaging without dominating the page.
- Evidence-led content blocks that read well on mobile.
- Consistent spacing, color, and card treatments.

---

## Layout Order (Top → Bottom)
1) **Hero + Evidence Card**
2) **Trust / Proof Band**
3) **Top Picks (3 cards)**
4) **Explore Preview (mini table + CTA)**
5) **Latest Articles**
6) **Resources & Guides**
7) **Sources / Transparency**

---

## Section Specs

### 1) Hero + Evidence Card
**Desktop layout**: 2-column (text left, evidence card right)  
**Mobile layout**: stacked, evidence card below CTA

**Hero left**
- Eyebrow pill: “Evidence-led UI”
- H1: “Audit-grade wallet comparisons for developers”
- Subtext: 1–2 lines; avoid dense copy
- Primary CTA: “Start Comparison”
- Secondary CTA: “Methodology”

**Hero right**
- Glass card: “Score Breakdown”
- 3 bars (Security / Dev UX / Activity / Coverage)
- Source chips (GitHub, WalletBeat, Chain Data)

**Spacing**
- Section padding: `pt-20 pb-16` (desktop), `pt-16 pb-12` (mobile)
- Gap between columns: `gap-10`

---

### 2) Trust / Proof Band
**Format**: single horizontal strip, 3–4 short proofs  
Example: “No login” / “No tracking” / “No affiliates” / “Verified sources”

**Rules**
- Keep to one line on desktop; wrap to 2 lines on mobile.
- Link to “Why we’re not phishing” and “Data verification”.

---

### 3) Top Picks (3 cards)
**Format**: three cards with short evidence bullets  
Each card includes:
- Category pill (Software / Hardware / Ramps)
- Wallet name
- 2–3 proof bullets (Tx Sim, Open Source, Release cadence)
- CTA: “Compare this”

**Desktop**: 3-column  
**Mobile**: 1-column stack

---

### 4) Explore Preview (Mini Table)
**Goal**: show the “tool” quickly  
**Components**:
- Mini table with 3 rows (Wallet, Score, Platform)
- Sticky header styling
- Primary CTA: “Open Explorer”

**Mobile**: compact list rows with inline badges.

---

### 5) Latest Articles
**Format**: 3 cards  
**Mobile**: carousel or vertical stack

**Card contents**:
- Category label
- Title
- Short description (2 lines)
- “Updated” date

---

### 6) Resources & Guides
**Format**: 2–3 cards or a list  
**Goal**: show methodology + data sources

---

### 7) Sources / Transparency
**Format**: 4 tiles  
**Each tile**: icon + source name + one-line description

---

## Responsive Rules
- **Max width**: 1200–1280px desktop, 100% on mobile
- **Container padding**: 24px desktop, 16px mobile
- **Grid**: 12 columns desktop, 4 columns mobile
- **Card radius**: 12–14px

---

## Design Tokens (Dark Glass)
**Background**: #0b1020 → #111827  
**Glass card**: #0f172a @ 70–85% opacity  
**Borders**: #334155 / #475569  
**Primary**: #38bdf8  
**Secondary**: #6366f1  
**Success**: #22c55e  
**Warning**: #f59e0b  
**Text**: #f8fafc  
**Muted text**: #94a3b8

---

## Typography Scale
- H1: 40/48 desktop, 28/34 mobile
- H2: 24/32 desktop, 18/24 mobile
- Body: 16/24 desktop, 14/22 mobile
- Label: 12/16

---

## Interaction Guidelines
- **Sticky compare tray** appears after first selection
- **Compare CTA** always visible after selection (desktop and mobile)
- **Hover states**: subtle glow on glass cards, border brighten on focus

---

## Ready-to-code Checklist
- [ ] Hero CTAs aligned, one primary + one secondary
- [ ] Trust band single-line on desktop, wraps on mobile
- [ ] Top picks cards have category pills and compare CTAs
- [ ] Explore preview visible without scrolling on desktop
- [ ] Articles shown before long docs sections
