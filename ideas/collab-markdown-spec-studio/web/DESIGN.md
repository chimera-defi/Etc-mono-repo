# SpecForge Design System

> This file is the authoritative source of truth for visual decisions in the SpecForge UI.
> When a design choice conflicts with a library default, this document wins.

---

## Aesthetic Principles

SpecForge is an **App UI** (task-focused workspace) with a **marketing shell** (landing, pricing).
Apply App UI rules to workspace views; Landing Page rules to the marketing pages.

**Voice in one phrase:** Warm authority. Professional but not corporate. Craft tools, not SaaS dashboards.

**Anti-patterns we reject:**
- Generic teal-on-white SaaS aesthetic
- 3-column feature card grids (the AI layout tell)
- Decorative blobs, wavy dividers, ornamental shadows
- Emoji as design elements
- Purple/indigo gradient backgrounds
- Centered-everything layouts

---

## Color Tokens

All colors are defined in `src/app/globals.css` as `:root` custom properties.
**Never use hardcoded hex values.** Always use a `--sf-*` token.

### Ink & Surfaces

| Token | Value | Usage |
|-------|-------|-------|
| `--sf-ink` | `#1c1a17` | Primary text, icon strokes |
| `--sf-ink-dark` | `#18212b` | Dark section backgrounds, inverted surfaces |
| `--sf-surface` | `#efe4d5` | Page background (warm parchment) |
| `--sf-surface-light` | `#f7f4ec` | Lighter page background variant |
| `--sf-surface-warm` | `#fff9f3` | Warm white for inverted text on dark |
| `--sf-surface-card` | `rgba(255,255,255,0.72)` | Card/panel backgrounds |
| `--sf-surface-input` | `#fffdfa` | Form inputs, text areas, editor surface |

### Brand Accent (Teal)

| Token | Value | Usage |
|-------|-------|-------|
| `--sf-teal` | `#0f766e` | Primary CTAs, active states, step numbers |
| `--sf-teal-hover` | `#0d6460` | Hover state for teal elements |
| `--sf-teal-subtle` | `rgba(15,118,110,0.08)` | Metric card backgrounds, teal tints |
| `--sf-teal-border` | `rgba(15,118,110,0.3)` | Featured card border |

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
| `--sf-success-subtle` | `rgba(33,122,69,0.12)` | Success badge / chip background |
| `--sf-warning` | `#8a5310` | Stale state, recovery banner text |
| `--sf-warning-subtle` | `rgba(183,106,18,0.14)` | Warning badge background, recovery banner fill |
| `--sf-danger` | `#8c1f1f` | Rejected patches, error state |
| `--sf-danger-subtle` | `rgba(163,43,43,0.12)` | Danger badge background |

### Muted Text Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--sf-muted` | `#4a5b68` | Secondary body text (landing/marketing) |
| `--sf-muted-warm` | `#5e554a` | Secondary body text (app UI, warm tone) |
| `--sf-muted-mid` | `#6f6559` | Tertiary text, document spans, actor cards |
| `--sf-muted-light` | `#7a6d5e` | Labels, meta text, step numbers, icons |

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
| Section h2 | `1.25rem` | 700 | 1.3 |
| Panel h2 | `1.15rem` | 700 | 1.3 |
| Body | `1rem` | 400 | 1.6–1.7 |
| Small / label | `0.85–0.92rem` | 400 | 1.5 |
| Caption / chip | `0.72–0.78rem` | 400–700 | 1.2 |

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
Hover: slightly lighter (`#2d3a47` for dark, `--sf-teal-hover` for teal variant).
Active: `transform: scale(0.98)`.
Focus: `outline: 2px solid --sf-teal; outline-offset: 3px`.
Min touch target: 44px height.

```css
/* Primary dark button (all forms, workspace) */
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
/* Base badge */
background: var(--sf-border);         /* neutral */
color: #433a31;

/* Success */
background: var(--sf-success-subtle);
color: var(--sf-success);

/* Warning */
background: var(--sf-warning-subtle);
color: var(--sf-warning);

/* Danger */
background: var(--sf-danger-subtle);
color: var(--sf-danger);
```

Status chip text should always reflect the **human-readable state** (e.g., "connecting", "live", "error"),
not an internal CSS class name.

### Cards

Standard card:
- `background: var(--sf-surface-card)` (semi-transparent white)
- `border: 1px solid var(--sf-border)`
- `border-radius: var(--sf-radius-lg)` (large panels) or `var(--sf-radius)` (compact cards)
- Hover: `transform: translateY(-2px)` + deeper shadow

Input/form surface inside cards: `background: var(--sf-surface-input)`.

### Inline Provenance

Used to show block authorship in the editor. Blue-tinted to signal "agent-authored".

```css
background: var(--sf-blue-subtle);
border: 1px solid var(--sf-blue-border);
color: var(--sf-blue);
```

### Recovery Banner

Warning-toned, shown when WebSocket sync is disrupted. Includes diagnostic detail
block (`<details open>`) with connection JSON for AI/developer debugging.

```css
background: var(--sf-warning-subtle);
color: var(--sf-warning);
border: 1px solid rgba(183,106,18,0.3);
```

---

## Motion

**Principle:** Animate meaning, not decoration. Every animation should communicate
state change, spatial relationship, or attention.

**Entrance:** `ease-out`, 0.3–0.6s. Hero elements use staggered `fadeUp`:
- eyebrow: 0.4s, no delay
- h1: 0.5s, 0.08s delay
- subhead: 0.5s, 0.16s delay
- CTAs: 0.5s, 0.24s delay
- panel: 0.6s, 0.12s delay

**Interactions:** `transition: background 0.15s ease, opacity 0.15s ease, transform 0.1s ease`

**Hover lift (cards):** `transform: translateY(-2px); box-shadow: 0 24px 72px rgba(24,33,43,0.13)`

**Required:** All animations and transitions must be wrapped in:
```css
@media (prefers-reduced-motion: reduce) {
  /* disable animations and transitions */
}
```

**Forbidden:** `transition: all`, animating layout properties (width, height, top, left).
Only animate `transform` and `opacity` for performance.

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
Nav links use `display: inline-flex; align-items: center; min-height: 2.75rem` to meet this.

---

## AI Slop — What We Avoid

These patterns are banned in SpecForge:

1. Purple/violet/indigo gradient backgrounds
2. **3-column feature grid** (icon-in-circle + bold title + 2-line copy × 3) — replaced with role table, dark section, step list
3. Icons in colored circles as section decoration
4. `text-align: center` on all sections globally
5. Same large border-radius on every element
6. Decorative blobs, floating circles, wavy SVG dividers
7. Emoji in headings or as bullet points
8. Colored left-border accent cards (`border-left: 3px solid accent`)
9. Generic hero copy ("Unlock the power of…")
10. Cookie-cutter section rhythm (hero → features → pricing → CTA, all same height)
