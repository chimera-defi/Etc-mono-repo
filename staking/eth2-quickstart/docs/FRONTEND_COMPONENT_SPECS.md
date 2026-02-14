# Front-End Component Specifications

## Overview
This document provides detailed specifications for each component that needs to be built. Only components listed here should be created—nothing more, nothing less.

---

## 🎯 Component Inventory

### Core UI Components (Phase 2)

#### 1. Button Component
**File:** `src/components/ui/Button.tsx`  
**Purpose:** Reusable button for CTAs and actions throughout the site

**Props Interface:**
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  children: React.ReactNode
  href?: string
  onClick?: () => void
  className?: string
}
```

**Variants:**
- **Primary**: Gradient background (`bg-gradient-to-r from-primary to-purple-600`), white text, hover: scale-105
- **Secondary**: Transparent background, border (`border-2 border-primary/30`), hover: border-primary/60

**Sizes:**
- **sm**: `h-9 px-4 text-sm`
- **md**: `h-11 px-5 text-base` (default)
- **lg**: `h-12 px-6 text-base`

**Requirements:**
- TypeScript types
- JSDoc comments
- Accessible (ARIA labels, keyboard navigation)
- Can render as `<a>` if `href` provided, otherwise `<button>`

---

#### 2. Card Component
**File:** `src/components/ui/Card.tsx`  
**Purpose:** Container for feature cards and content sections

**Props Interface:**
```typescript
interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg'
}
```

**Styling:**
- Background: `bg-card/30` (semi-transparent)
- Border: `border border-border/30`
- Padding: `p-6` (md), `p-4` (sm), `p-8` (lg)
- Rounded: `rounded-xl`
- Hover (if enabled): `hover:scale-105 hover:border-primary/60 transition-all`

**Requirements:**
- TypeScript types
- JSDoc comments
- Simple wrapper component

---

#### 3. Badge Component
**File:** `src/components/ui/Badge.tsx`  
**Purpose:** Display client names, stats, and labels

**Props Interface:**
```typescript
interface BadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'success' | 'muted'
  size?: 'sm' | 'md'
  className?: string
}
```

**Styling:**
- Base: `rounded-full border`
- Primary: `bg-primary/10 border-primary/30 text-primary`
- Secondary: `bg-secondary/10 border-secondary/30 text-secondary`
- Success: `bg-green-500/10 border-green-500/30 text-green-400`
- Muted: `bg-muted/50 border-border/50 text-muted-foreground`
- Padding: `px-4 py-1.5` (md), `px-3 py-1` (sm)

**Requirements:**
- TypeScript types
- JSDoc comments
- Simple display component

---

#### 4. Terminal Component
**File:** `src/components/ui/Terminal.tsx`  
**Purpose:** Display terminal mockup with code/output

**Props Interface:**
```typescript
interface TerminalProps {
  children?: React.ReactNode
  code?: string
  language?: string
  className?: string
}
```

**Structure:**
- Header: macOS-style dots (red `bg-red-500`, yellow `bg-yellow-500`, green `bg-green-500`)
- Content area: Dark background (`bg-[#1e1e1e]`), monospace font, syntax highlighting
- Border: `rounded-lg` or `rounded-xl`
- Shadow: `shadow-2xl`

**Requirements:**
- TypeScript types
- JSDoc comments
- Accept `children` OR `code` prop (if code, use syntax highlighter)
- Use `react-syntax-highlighter` or similar for syntax highlighting
- Dark theme syntax highlighting

---

#### 5. CodeBlock Component (for Quickstart page)
**File:** `src/components/ui/CodeBlock.tsx`  
**Purpose:** Display code with copy-to-clipboard functionality

**Props Interface:**
```typescript
interface CodeBlockProps {
  code: string
  language?: string
  showCopy?: boolean
  className?: string
}
```

**Features:**
- Syntax highlighting (dark theme)
- Copy button (top-right corner)
- Copy feedback (toast or visual indicator)
- Responsive (horizontal scroll on mobile)

**Requirements:**
- TypeScript types
- JSDoc comments
- Copy-to-clipboard functionality
- Use `react-syntax-highlighter` or similar

---

### Layout Components (Phase 2)

#### 6. Navbar Component
**File:** `src/components/layout/Navbar.tsx`  
**Purpose:** Site navigation header

**Structure:**
- Left: Logo/Brand name ("Ethereum Node Setup")
- Right: Links (GitHub, Learn) + CTA button ("Get Started")
- Mobile: Hamburger menu (if needed)

**Links:**
- GitHub: External link to repo
- Learn: Internal link to `/learn`
- Get Started: Internal link to `/quickstart`

**Requirements:**
- TypeScript types
- Responsive (mobile menu if needed)
- Sticky or static (design decision)

---

#### 7. Footer Component
**File:** `src/components/layout/Footer.tsx`  
**Purpose:** Site footer with links and copyright

**Content:**
- Copyright: "© 2024 Ethereum Node Quick Setup"
- Links: GitHub, Documentation, Issues, Discussions
- Simple, minimal design

**Requirements:**
- TypeScript types
- Responsive layout
- External links open in new tab

---

### Section Components (Phases 3-4)

#### 8. Hero Component
**File:** `src/components/sections/Hero.tsx`  
**Purpose:** Homepage hero section

**Structure:**
- Two-column layout (desktop), stacked (mobile)
- Left column:
  - Badge ("Zero to Ethereum node in 30 minutes")
  - Headline (gradient text)
  - Subheadline
  - CTA buttons
  - Stats section
- Right column:
  - Terminal mockup

**Background:**
- Gradient background
- Grid pattern overlay
- Animated glow circles (2-3)

**Animations:**
- Fade-in for headline
- Slide-up for description
- Slide-in for terminal

**Requirements:**
- Use Button and Terminal components
- Responsive layout
- Smooth animations (Framer Motion or CSS)

---

#### 9. Features Component
**File:** `src/components/sections/Features.tsx`  
**Purpose:** Display 5 feature cards

**Structure:**
- Container with section title
- Grid layout: 1 col (mobile), 2-3 cols (desktop)
- 5 feature cards using Card component

**Each Feature Card Contains:**
- Icon (Lucide icon)
- Title
- Description
- Visual element (badges, code snippet, etc.)

**Animations:**
- Scroll-triggered fade-in + slide-up
- Stagger animations

**Requirements:**
- Use Card component
- Use Lucide icons
- Scroll animations (Framer Motion useInView or Intersection Observer)

---

### Page Components (Phases 5-6)

#### 10. QuickstartPage Component
**File:** `src/app/quickstart/page.tsx`  
**Purpose:** Quickstart guide page

**Sections:**
- Prerequisites
- Installation Steps (5 steps)
- Troubleshooting
- Next Steps

**Components Used:**
- CodeBlock component for code examples
- Card component for sections (optional)

**Requirements:**
- Clear step-by-step structure
- Copy-to-clipboard for all code blocks
- Responsive layout

---

#### 11. LearnPage Component
**File:** `src/app/learn/page.tsx`  
**Purpose:** Documentation hub page

**Sections:**
- Documentation Links (cards or list)
- Client Comparison Tables (2 tables)
- Configuration Examples
- GitHub Integration

**Components Used:**
- Card component for doc links
- CodeBlock component for examples
- Table component (native HTML or custom)

**Requirements:**
- Responsive tables (scroll on mobile)
- Accessible tables (proper headers)
- All links work correctly

---

## 🚫 Components NOT Needed

**Do NOT create these components:**
- ❌ Separate Clients.tsx, Security.tsx, CTA.tsx (these are part of Features.tsx)
- ❌ Separate section components for each feature (use Features.tsx with data array)
- ❌ Complex animation components (use Framer Motion directly)
- ❌ Theme toggle (dark theme only)
- ❌ Search component (optional, Phase 6)
- ❌ Modal/Dialog components (not needed)
- ❌ Form components (not needed)
- ❌ Dropdown components (not needed)

---

## 📦 Dependencies

### Required Packages
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "lucide-react": "^0.300.0",
    "framer-motion": "^10.16.0",
    "react-syntax-highlighter": "^15.5.0"
  }
}
```

### Optional Packages
- `@types/react-syntax-highlighter` (TypeScript types)
- `clsx` or `classnames` (conditional classes)

---

## 🎨 Styling Guidelines

### Tailwind Configuration
**Colors (tailwind.config.js):**
```javascript
colors: {
  background: '#0a0a12',
  foreground: '#f9fafb',
  card: {
    DEFAULT: 'rgba(255, 255, 255, 0.03)',
    foreground: '#f9fafb',
  },
  primary: {
    DEFAULT: '#8b5cf6',
    foreground: '#ffffff',
  },
  secondary: {
    DEFAULT: '#06b6d4',
    foreground: '#ffffff',
  },
  muted: {
    DEFAULT: '#9ca3af',
    foreground: '#f9fafb',
  },
  border: 'rgba(255, 255, 255, 0.1)',
}
```

### Font Configuration
```javascript
fontFamily: {
  mono: ['JetBrains Mono', 'monospace'],
  sans: ['Inter', 'sans-serif'],
}
```

---

## ✅ Component Checklist

### Phase 2 Components
- [ ] Button.tsx
- [ ] Card.tsx
- [ ] Badge.tsx
- [ ] Terminal.tsx
- [ ] CodeBlock.tsx
- [ ] Navbar.tsx
- [ ] Footer.tsx

### Phase 3-4 Components
- [ ] Hero.tsx
- [ ] Features.tsx

### Phase 5-6 Components
- [ ] QuickstartPage (page.tsx)
- [ ] LearnPage (page.tsx)

---

## 📝 Component Testing Requirements

Each component should:
1. ✅ Have TypeScript types
2. ✅ Have JSDoc comments
3. ✅ Be responsive (mobile, tablet, desktop)
4. ✅ Be accessible (ARIA labels, keyboard navigation)
5. ✅ Match design specifications
6. ✅ Work in isolation (no external dependencies except props)

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Maintained By:** Front-End Development Team
