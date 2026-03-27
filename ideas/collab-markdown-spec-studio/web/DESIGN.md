# Design System — SpecForge

> This file is the authoritative source of truth for visual decisions in the SpecForge UI.
> When a design choice conflicts with a library default, this document wins.

---

## Aesthetic Direction

SpecForge is an **App UI** (task-focused workspace) with a **marketing shell** (landing, pricing).
Apply App UI rules to workspace views; Landing Page rules to the marketing pages.

**Voice in one phrase:** Warm authority. Professional but not corporate. Craft tools, not SaaS dashboards.

**Competitive positioning:** Every serious developer tool (Linear, Cursor, Windsurf) defaults to dark, cold surfaces. SpecForge users are product managers and tech leads writing specs in meetings, in offices, on laptops — not developers in a dark terminal. SpecForge is **warm-light-first** by design, and its dark mode preserves the warm identity (no cold blacks).

**Anti-patterns we reject:**
- Generic teal-on-white SaaS aesthetic
- 3-column feature card grids (the AI layout tell)
- Decorative blobs, wavy dividers, ornamental shadows
- Emoji as design elements
- Purple/indigo gradient backgrounds (see Purple Exception below)
- Centered-everything layouts
- Cold dark mode (VS Code-style near-black with blue tint)

---

## Color Tokens

All colors are defined in `src/app/globals.css` as `:root` custom properties.
**Never use hardcoded hex values.** Always use a `--sf-*` token.

### Ink & Surfaces

| Token | Value | Usage |
|-------|-------|-------|
| `--sf-ink` | `#1c1a17` | Primary text, icon strokes |
| `--sf-ink-dark` | `#18212b` | Dark section backgrounds, inverted surfaces |
| `--sf-ink-warm` | `#433a31` | Neutral badge/chip text, warm near-black |
| `--sf-ink-secondary` | `#3a332c` | Dark warm text, slightly lighter than ink |
| `--sf-ink-hover` | `#2d3a47` | Hover state for primary dark CTA buttons |
| `--sf-ink-press` | `#2c2a27` | Pressed/active state for ink surfaces |
| `--sf-surface` | `#efe4d5` | Page background (warm parchment) |
| `--sf-surface-light` | `#f7f4ec` | Lighter page background variant |
| `--sf-surface-warm` | `#fff9f3` | Warm white for text on dark surfaces |
| `--sf-surface-card` | `rgba(255,255,255,0.72)` | Card/panel backgrounds |
| `--sf-surface-panel` | `#faf8f4` | Sidebar and disclosure panel backgrounds |
| `--sf-surface-input` | `#fffdfa` | Form inputs, text areas, editor surface |

### Brand Accent (Teal)

| Token | Value | Usage |
|-------|-------|-------|
| `--sf-teal` | `#0f766e` | Primary CTAs, active states, step numbers |
| `--sf-teal-hover` | `#0d6460` | Hover state for teal elements |
| `--sf-teal-subtle` | `rgba(15,118,110,0.08)` | Metric card backgrounds, current-step tints |
| `--sf-teal-border` | `rgba(15,118,110,0.3)` | Featured card border, current-step border |

### Workspace Accent (Amber)

| Token | Value | Usage |
|-------|-------|-------|
| `--sf-amber` | `#925e2f` | Workspace eyebrow accent |

### Provenance / Info (Blue)

| Token | Value | Usage |
|-------|-------|-------|
| `--sf-blue` | `#174f67` | Inline provenance text, agent identity |
| `--sf-blue-subtle` | `rgba(17,106,138,0.1)` | Provenance chip background |
| `--sf-blue-border` | `rgba(17,106,138,0.18)` | Provenance chip border |

### Semantic States

| Token | Value | Usage |
|-------|-------|-------|
| `--sf-success` | `#1b6a3d` | Accepted patches, completed stages |
| `--sf-success-subtle` | `rgba(33,122,69,0.12)` | Success badge background |
| `--sf-success-faint` | `rgba(33,122,69,0.08)` | Very light success fill (readiness indicators) |
| `--sf-warning` | `#8a5310` | Stale state, recovery banner text |
| `--sf-warning-subtle` | `rgba(183,106,18,0.14)` | Warning badge background, recovery banner |
| `--sf-danger` | `#8c1f1f` | Rejected patches, error state |
| `--sf-danger-subtle` | `rgba(163,43,43,0.12)` | Danger badge background |
| `--sf-danger-faint` | `rgba(163,43,43,0.08)` | Very light danger fill |

### Purple Exception — Design Review Accent

| Token | Value | Usage |
|-------|-------|-------|
| `--sf-design` | `#6d28a8` | Design-review patch type marker ONLY |
| `--sf-design-subtle` | `rgba(109,40,168,0.12)` | Design-review badge background |

> **Why purple exists:** `--sf-design` is a semantic color for design-review patch badges — a narrow, explicit exception to the "no purple" rule. It is NOT used as a background, gradient, or decorative element. It communicates a specific patch type. Do not expand its usage.

### Muted Text Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--sf-muted` | `#4a5b68` | Secondary body text (landing/marketing) |
| `--sf-muted-warm` | `#5e554a` | Secondary body text (app UI, warm tone) |
| `--sf-muted-mid` | `#6f6559` | Tertiary text, document spans, actor cards |
| `--sf-muted-light` | `#7a6d5e` | Labels, meta text, step numbers, icons |
| `--sf-muted-lighter` | `#8a7d70` | Supplementary inline text |
| `--sf-muted-faint` | `#9a8c80` | Placeholder text, disabled labels |

### Borders

| Token | Value | Usage |
|-------|-------|-------|
| `--sf-border` | `rgba(28,26,23,0.1)` | Standard card/section border |
| `--sf-border-mid` | `rgba(28,26,23,0.16)` | Stronger borders (inputs, focus ring baseline) |
| `--sf-border-faint` | `rgba(28,26,23,0.08)` | Subtle card borders (actor cards, metric cards) |

---

## Typography

**Fonts:** Geist Sans (body/UI), Geist Mono (code, inputs, editor).
Both are loaded via `next/font/google` in `src/app/layout.tsx`.

**No default font stacks.** Never fall back to `system-ui`, `Arial`, or `Inter` intentionally.

### Scale

| Element | Size | Weight | Line-height |
|---------|------|--------|-------------|
| Hero h1 (marketing) | `clamp(2.5rem, 5vw, 4.8rem)` | 800 | 1.0 |
| Hero h1 (workspace) | `clamp(2.3rem, 4vw, 4.4rem)` | 800 | 1.0 |
| Section h2 (marketing) | `1.75rem` (28px) | 700 | 1.3 |
| Hero panel h2 (marketing sidebar card) | `1.35rem` (21.6px) | 700 | 1.3 |
| Panel h2 (workspace) | `1.15rem` (18.4px) | 700 | 1.3 |
| Body | `1rem` (16px) | 400 | 1.6–1.7 |
| Small / label | `0.85–0.92rem` | 400 | 1.5 |
| Caption / chip / eyebrow | `0.72–0.78rem` | 400–700 | 1.2 |

**Rules:**
- `text-wrap: balance` on all headings
- `text-wrap: pretty` on body text when supported
- Max line-length: 58–68ch for body paragraphs
- Minimum body size: 16px (1rem)
- No letter-spacing on lowercase body text
- Letter-spacing only on uppercase labels/eyebrows (0.08–0.2em)

---

## Spacing & Border Radius

**Base unit:** 4px. All spacing values should be multiples of 4px (or rem equivalents).

**Scale:** `2xs`(2px) `xs`(4px) `sm`(8px) `md`(16px) `lg`(24px) `xl`(32px) `2xl`(48px) `3xl`(64px)

### Radius Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--sf-radius-sm` | `0.75rem` (12px) | Small chips, tags |
| `--sf-radius` | `1rem` (16px) | Standard cards, inputs |
| `--sf-radius-lg` | `1.5rem` (24px) | Large panels, hero panel |
| `--sf-radius-pill` | `999px` | Buttons, badges, chips |

**Radius hierarchy rule:** Inner elements always use a smaller radius than their container.
A card at `--sf-radius-lg` should have interior chips at `--sf-radius-sm` or `--sf-radius-pill`.

---

## Component Patterns

### Buttons

Primary action: `--sf-ink` background, `--sf-surface-warm` text, pill border-radius.
Hover: `--sf-ink-hover`. Active: `transform: scale(0.98)`.
Focus: `outline: 2px solid var(--sf-teal); outline-offset: 3px`.
Min touch target: 44px height.

```css
/* Primary dark button */
background: var(--sf-ink);
color: var(--sf-surface-warm);
border-radius: var(--sf-radius-pill);
min-height: 2.75rem;
padding: 0.75rem 1.15rem;
```

```css
/* Primary teal CTA (marketing) */
background: var(--sf-teal);
color: #fff;
border-radius: var(--sf-radius-pill);
```

### Badges / Status Chips

```css
.neutral  { background: var(--sf-border); color: var(--sf-ink-warm); }
.success  { background: var(--sf-success-subtle); color: var(--sf-success); }
.warning  { background: var(--sf-warning-subtle); color: var(--sf-warning); }
.danger   { background: var(--sf-danger-subtle); color: var(--sf-danger); }
.design   { background: var(--sf-design-subtle); color: var(--sf-design); }
```

### Workflow Step Cards

Used in the sidebar Workflow panel. Status variants are applied as CSS module classes.

```css
/* .current — active stage, user is here now */
border-color: var(--sf-teal-border);
background: var(--sf-teal-subtle);
/* .current .stepNumber: color var(--sf-teal), font-weight 700 */

/* .completed — stage done */
opacity: 0.55;

/* .upcoming — not reached yet */
opacity: 0.72;
```

### Stage Step Indicator (`.stageStep`)

Eyebrow shown above the stage panel h2 in the main content area. Shows "Step X / 6".

```css
font-size: 0.72rem;
text-transform: uppercase;
letter-spacing: 0.12em;
color: var(--sf-teal);
font-weight: 600;
margin: 0 0 0.25rem;
```

### Cards

```css
/* Standard card */
background: var(--sf-surface-card);  /* semi-transparent white */
border: 1px solid var(--sf-border);
border-radius: var(--sf-radius-lg);  /* large panels */
/* Hover: transform: translateY(-2px) + deeper shadow */
```

### Inline Provenance

```css
background: var(--sf-blue-subtle);
border: 1px solid var(--sf-blue-border);
color: var(--sf-blue);
```

### Recovery Banner

```css
background: var(--sf-warning-subtle);
color: var(--sf-warning);
border: 1px solid rgba(183,106,18,0.3);
```

---

## Motion

**Principle:** Animate meaning, not decoration. Every animation communicates state change, spatial relationship, or attention.

### Entrance Animations (`fadeUp`)

Staggered entrance for marketing hero elements:
- eyebrow: 0.4s, no delay
- h1: 0.5s, 0.08s delay
- subhead: 0.5s, 0.16s delay
- CTAs / picker: 0.5s, 0.24s delay
- hero panel: 0.6s, 0.12s delay

### Interaction Transitions

```css
/* Standard interactive element */
transition: background 0.15s ease, opacity 0.15s ease, transform 0.1s ease;

/* Card hover lift */
transform: translateY(-2px);
box-shadow: 0 24px 72px rgba(24,33,43,0.13);
```

### State-Change Choreography

For meaningful state transitions (not just CSS property changes):

| Transition | Pattern |
|-----------|---------|
| Patch accepted → success | Badge color shift (0.2s ease) + brief `scale(1.04)` pulse |
| Form submit → loading | Button text fades (0.15s), spinner appears (0.15s delay) |
| Stage step completed | Step card fades to `opacity: 0.55` over 0.3s |
| Stage step becomes current | Border and background transition over 0.25s ease |
| Disclosure panel open/close | Height via `max-height` transition, 0.2s ease-in-out |

### Skeleton / Loading States

When content is loading, skeleton shapes should:
- Match the real content layout (no generic bars where a card will appear)
- Use `--sf-border` as the base fill with `--sf-surface` shimmer
- Animate with a left-to-right shimmer at `1.5s linear infinite`
- Never show for interactions under 200ms (avoid flash of skeleton)

### Micro-interactions

- **Active/pressed:** `transform: scale(0.98)` on all clickable cards and buttons
- **Focus ring:** `outline: 2px solid var(--sf-teal); outline-offset: 3px` — never `outline: none` without a visible replacement
- **Step card hover:** Slight background lightening (0.15s ease) to signal clickability
- **Picker card hover:** `box-shadow: 0 6px 20px rgba(24,33,43,0.18)` lift

### Required Accessibility

All animations and transitions must be wrapped in:
```css
@media (prefers-reduced-motion: reduce) {
  /* disable animations and transitions */
}
```

**Forbidden:** `transition: all`. Only animate `transform` and `opacity` for performance (not width, height, top, left).

---

## Dark Mode Strategy

**Philosophy:** SpecForge's dark mode is **warm-dark**, not code-editor dark. Where competitors (Linear, Cursor in dark) use near-black `#08090a` surfaces, SpecForge dark mode uses `#1a1512` — a dark version of the warm parchment. The warm identity persists across both modes.

**Not yet implemented** — this is the documented target strategy.

### Surface Mapping (Light → Dark)

| Light token | Dark value | Rationale |
|------------|------------|-----------|
| `--sf-surface` `#efe4d5` | `#1a1512` | Warm near-black — dark parchment |
| `--sf-surface-light` `#f7f4ec` | `#201c16` | Slightly lighter dark surface |
| `--sf-surface-card` `rgba(255,255,255,0.72)` | `rgba(255,249,240,0.07)` | Warm frosted glass |
| `--sf-surface-panel` `#faf8f4` | `#221e19` | Panel/sidebar dark |
| `--sf-surface-input` `#fffdfa` | `#2a2520` | Input surface dark |
| `--sf-ink` `#1c1a17` | `#ede8e0` | Warm off-white — NOT pure white |
| `--sf-muted-warm` `#5e554a` | `#9a8c80` | Inverted muted scale |
| `--sf-border` `rgba(28,26,23,0.1)` | `rgba(240,234,220,0.1)` | Warm light border on dark |

### Accent Adjustments in Dark Mode

| Token | Light | Dark | Why |
|-------|-------|------|-----|
| `--sf-teal` | `#0f766e` | `#14897f` | Slightly lighter for WCAG contrast on dark bg |
| `--sf-amber` | `#925e2f` | `#c27535` | More saturated — warm accents pop on dark |
| `--sf-teal-subtle` | `rgba(15,118,110,0.08)` | `rgba(20,137,127,0.15)` | Higher opacity for visibility |

### Implementation Pattern

```css
/* Use data-theme attribute (allows manual toggle) */
[data-theme="dark"],
@media (prefers-color-scheme: dark) {
  :root {
    --sf-surface: #1a1512;
    --sf-surface-light: #201c16;
    /* ... */
  }
}
```

**Rule:** Never use `filter: invert()` or flip all colors. Preserve warm tone in dark mode.

---

## Layout

**Marketing pages:** `width: min(1100px, calc(100% - 2rem)); margin: 0 auto`
**Workspace page:** Full-width grid: `300px sidebar | minmax(0, 1fr) main`

### Section Rhythm (Marketing)

Each section must have **one job**. Break the grid rhythm intentionally — do not repeat
the same visual treatment across consecutive sections:

1. **Role table** (`roleList`) — alternating label/description rows, no cards
2. **Dark section** (`sectionDark`) — `--sf-ink-dark` background, inverts the palette
3. **Step list** (`stepList`) — horizontal 3-column grid with large `01/02/03` numerals

### Responsive Breakpoints

| Breakpoint | Change |
|-----------|--------|
| 900px | Hero stacks, step list goes single-column |
| 640px | Nav stacks, CTAs go full-width, role rows stack |
| 920px (workspace) | Focus layout stacks, sidebar un-sticks |

---

## Touch Targets

All interactive elements must have a minimum touch target of **44px × 44px**.

---

## AI Slop — What We Avoid

These patterns are banned in SpecForge:

1. Purple/violet/indigo gradient backgrounds (the `--sf-design` purple is a semantic exception — see above)
2. **3-column feature grid** (icon-in-circle + bold title + 2-line copy × 3) — replaced with role table, dark section, step list
3. Icons in colored circles as section decoration
4. `text-align: center` on all sections globally
5. Same large border-radius on every element
6. Decorative blobs, floating circles, wavy SVG dividers
7. Emoji in headings or as bullet points
8. Colored left-border accent cards (`border-left: 3px solid accent`)
9. Generic hero copy ("Unlock the power of…")
10. Cookie-cutter section rhythm (hero → features → pricing → CTA, all same height)
11. **Cold dark mode** — dark backgrounds with cool/blue cast. SpecForge dark is always warm.

---

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-27 | Initial design system created | /design-consultation — warm-authority positioning, parchment surfaces, teal accent |
| 2026-03-27 | Step card status variants added | `.current` (teal), `.completed` (55% opacity), `.upcoming` (72% opacity) |
| 2026-03-27 | Stage step eyebrow indicator added | "Step X / 6" in teal above stage panel h2 |
| 2026-03-27 | `heroPanel h2` corrected to 1.35rem | Was 1.25rem in DESIGN.md, CSS had 1.75rem — corrected to 1.35rem |
| 2026-03-27 | Dark mode strategy documented | Warm-dark (#1a1512), not cold-dark. Deliberate contrast with Linear/Cursor aesthetic. |
| 2026-03-27 | Purple exception documented | `--sf-design: #6d28a8` is semantic-only for design-review patch badges |
| 2026-03-27 | Undocumented tokens added | `--sf-surface-panel`, `--sf-muted-faint`, `--sf-ink-secondary`, `--sf-ink-press`, `--sf-success-faint`, `--sf-danger-faint` |
