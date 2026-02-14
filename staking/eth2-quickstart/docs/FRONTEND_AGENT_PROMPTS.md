# Front-End Development Agent Prompts

## Overview
This document contains detailed, ready-to-use prompts for each agent. Copy the relevant prompt section and use it as your starting context when beginning work on your assigned phase.

---

## 🤖 Agent 1: Project Setup & Foundation

### Prompt

```
You are Agent 1, responsible for Phase 1: Project Setup & Foundation.

**Your Mission:**
Set up a Next.js project with TypeScript, Tailwind CSS, and all foundational 
configuration needed for the Ethereum Node Quick Setup marketing website.

**Reference Design:**
Study https://agent-flywheel.com/ for design inspiration. We want a similar 
aesthetic: dark theme, gradient backgrounds, glassmorphism effects, modern 
typography, smooth animations.

**Project Context:**
This is a marketing website for an Ethereum node setup tool. The project 
repository is at: https://github.com/chimera-defi/eth2-quickstart
Review the README.md to understand what the product does.

**Key Requirements:**
1. Initialize Next.js 14+ with App Router and TypeScript
2. Configure Tailwind CSS with custom color palette matching the dark theme
3. Set up fonts: JetBrains Mono (for headings/code) and Inter (for body text)
4. Create base layout structure with navigation placeholders
5. Set up routing: homepage (/), quickstart (/quickstart), learn (/learn)
6. Configure production build settings

**Color Palette:**
- Background: Very dark (#0a0a12 or similar)
- Primary: Purple/Blue gradient
- Secondary: Cyan
- Text: Near white (#f9fafb) for foreground, gray (#9ca3af) for muted

**Deliverables:**
- Working Next.js app running locally
- Tailwind configured with custom colors
- Fonts loading correctly
- Base layout structure
- All routes created (even if placeholder content)
- Production build succeeds

**Documentation:**
- Read docs/FRONTEND_AGENT_HANDOFF.md for full context
- Read docs/FRONTEND_TASKS.md for detailed task list
- Update docs/FRONTEND_PROGRESS.md as you complete tasks

**Success Criteria:**
- ✅ `bun run dev` starts successfully
- ✅ `bun run build` succeeds
- ✅ All pages load without errors
- ✅ Tailwind classes work correctly
- ✅ Fonts render properly

**Next Steps After Completion:**
- Mark Phase 1 as complete in progress.md
- Notify Agent 2 that foundation is ready
- Commit all changes with clear commit messages

Begin by reading the handoff document and task list, then start with Task 1.1.
```

---

## 🤖 Agent 2: UI Components Library

### Prompt

```
You are Agent 2, responsible for Phase 2: UI Components Library.

**Your Mission:**
Create a reusable component library with Button, Card, Badge, Terminal, 
Navbar, and Footer components. These will be used throughout the site.

**Prerequisites:**
Phase 1 must be complete. Verify that Next.js is set up and Tailwind is 
configured before starting.

**Reference Design:**
Study https://agent-flywheel.com/ for component styling inspiration. Note:
- Glassmorphism effects (semi-transparent backgrounds, subtle borders)
- Smooth hover animations (scale, color transitions)
- Consistent spacing and typography
- Dark theme with accent colors

**Component Requirements:**

**Button Component:**
- Primary variant: Gradient background, white text, hover effects
- Secondary variant: Transparent with border, hover: border color change
- Size variants: sm, md, lg
- Disabled state
- TypeScript types

**Card Component:**
- Glassmorphism effect (bg-card/30, border-border/30)
- Padding variants
- Hover effects (scale, border color)
- TypeScript types

**Badge Component:**
- Rounded-full style
- Color variants (primary, secondary, success, etc.)
- Size variants
- Border and background styling
- TypeScript types

**Terminal Component:**
- macOS-style header (red, yellow, green dots)
- Dark terminal content area
- Syntax highlighting support
- Accept children or code string prop
- Monospace font (JetBrains Mono)
- TypeScript types

**Navbar Component:**
- Logo/brand name (left)
- Navigation links (GitHub, Learn)
- CTA button (Get Started)
- Responsive (mobile menu if needed)
- TypeScript types

**Footer Component:**
- Copyright notice
- Links (GitHub, Documentation)
- Responsive layout
- TypeScript types

**Documentation:**
- Read docs/FRONTEND_AGENT_HANDOFF.md for design specs
- Read docs/FRONTEND_TASKS.md Phase 2 for detailed tasks
- Read docs/FRONTEND_MARKETING_COPY.md for text content
- Update docs/FRONTEND_PROGRESS.md as you complete tasks

**Success Criteria:**
- ✅ All components created and typed
- ✅ Components are reusable and documented (JSDoc)
- ✅ Components match design specifications
- ✅ Responsive design implemented
- ✅ Components tested in isolation
- ✅ No TypeScript errors

**Best Practices:**
- Use TypeScript for all components
- Add JSDoc comments for props
- Follow consistent naming conventions
- Make components accessible (ARIA labels, keyboard navigation)
- Test on multiple screen sizes

**Next Steps After Completion:**
- Mark Phase 2 as complete in progress.md
- Notify Agents 3-6 that components are ready
- Commit all changes with clear commit messages

Begin by reviewing Phase 1 output, then start with Task 2.1 (Button component).
```

---

## 🤖 Agent 3: Hero Section

### Prompt

```
You are Agent 3, responsible for Phase 3: Hero Section.

**Your Mission:**
Build the homepage hero section with headline, description, CTAs, stats, 
terminal mockup, and background animations. This is the first thing users 
see and must be compelling.

**Prerequisites:**
Phases 1 and 2 must be complete. You'll use the components from Phase 2 
(Button, Terminal, etc.) and the layout from Phase 1.

**Reference Design:**
Study https://agent-flywheel.com/ carefully. Note:
- Two-column layout (content left, terminal right)
- Gradient text for headline
- Animated background (gradient, grid pattern, glow circles)
- Smooth entrance animations
- Stats section with large numbers
- Terminal mockup with realistic content

**Content Requirements:**
Read docs/FRONTEND_MARKETING_COPY.md for all text content:
- Headline: "Ethereum Node Setup" + "In Minutes, Not Days"
- Subheadline: [See marketing copy doc]
- CTA buttons: "Get Started" and "View on GitHub"
- Stats: 12 Clients, 36 Combinations, ~30m Setup, 1 Command

**Component Requirements:**

**Hero Layout:**
- Two-column on desktop (lg breakpoint)
- Stacked on mobile
- Container with max-width
- Proper spacing/padding

**Headline:**
- Gradient text effect
- JetBrains Mono font
- Responsive sizes (text-4xl sm:text-5xl lg:text-6xl)
- Multi-line with line breaks

**Subheadline:**
- Muted text color
- Responsive sizing
- Max-width constraint
- Proper line height

**CTA Buttons:**
- Use Button component from Phase 2
- Primary: "Get Started" → /quickstart
- Secondary: "View on GitHub" → GitHub repo URL
- Responsive (stack on mobile)

**Stats Section:**
- Large numbers with gradient text
- Labels below numbers
- Responsive (wrap on mobile)
- Consistent spacing

**Terminal Mockup:**
- Use Terminal component from Phase 2
- Realistic content (installation command or output)
- Positioned on right side
- Responsive (hide or resize on mobile)
- Shadow/effects for depth

**Background Animations:**
- Gradient background (bg-gradient-hero)
- Grid pattern overlay
- Animated glow circles (2-3 circles, pulse animation)
- Noise texture (optional)

**Entrance Animations:**
- Fade-in for headline
- Slide-up for description
- Slide-in for terminal
- Stagger animations for visual appeal
- Use Framer Motion or CSS animations

**Documentation:**
- Read docs/FRONTEND_AGENT_HANDOFF.md for design specs
- Read docs/FRONTEND_TASKS.md Phase 3 for detailed tasks
- Read docs/FRONTEND_MARKETING_COPY.md for all text
- Update docs/FRONTEND_PROGRESS.md as you complete tasks

**Success Criteria:**
- ✅ Hero section matches design reference
- ✅ Responsive on all screen sizes
- ✅ Animations are smooth and performant
- ✅ All text content is accurate
- ✅ CTAs link to correct destinations
- ✅ Terminal mockup looks realistic
- ✅ Background animations enhance without distracting

**Performance Considerations:**
- Optimize animations (use transform/opacity)
- Lazy load terminal component if needed
- Test on slower devices

**Next Steps After Completion:**
- Mark Phase 3 as complete in progress.md
- Coordinate with Agent 4 if needed
- Commit all changes with clear commit messages

Begin by reviewing Phase 2 components, then start with Task 3.1 (Hero layout).
```

---

## 🤖 Agent 4: Features Sections

### Prompt

```
You are Agent 4, responsible for Phase 4: Features Sections.

**Your Mission:**
Create 5 feature sections showcasing key value propositions: Client Diversity, 
One-Liner Installation, Security First, MEV Integration, and Uncensored RPC.

**Prerequisites:**
Phases 1 and 2 must be complete. You'll use Card and Badge components from 
Phase 2.

**Reference Design:**
Study https://agent-flywheel.com/ for feature section styling. Note:
- Grid layout for feature cards
- Consistent card styling
- Icons for each feature
- Hover effects
- Scroll-triggered animations

**Content Requirements:**
Read docs/FRONTEND_MARKETING_COPY.md for all feature content:
- Feature 1: Client Diversity
- Feature 2: One-Liner Installation
- Feature 3: Security First
- Feature 4: MEV Integration
- Feature 5: Uncensored RPC

**Component Requirements:**

**Features Container:**
- Section container with proper spacing
- Section title/heading
- Grid layout for 5 feature cards
- Responsive (1 col mobile, 2-3 cols desktop)

**Each Feature Card:**
- Use Card component from Phase 2
- Title (from marketing copy)
- Description (from marketing copy)
- Icon (Lucide icon, see marketing copy for suggestions)
- Visual element (badges, code snippet, diagram, etc.)
- Hover effects (scale, border color change)

**Icons:**
- Use Lucide React icons
- Consistent size and style
- Appropriate for each feature
- See marketing copy doc for suggestions

**Scroll Animations:**
- Fade-in + slide-up on scroll
- Stagger animations for each card
- Use Framer Motion useInView or Intersection Observer
- Smooth and performant

**Visual Elements:**

**Client Diversity:**
- Grid of client badges or logos
- Show execution + consensus clients

**One-Liner Installation:**
- Code snippet with curl command
- Syntax highlighting
- Copy-to-clipboard button

**Security First:**
- Security checklist or shield icon
- List of security features

**MEV Integration:**
- MEV flow diagram or chart mockup
- Relay badges or icons

**Uncensored RPC:**
- RPC endpoint example
- Speed comparison or globe icon

**Documentation:**
- Read docs/FRONTEND_AGENT_HANDOFF.md for design specs
- Read docs/FRONTEND_TASKS.md Phase 4 for detailed tasks
- Read docs/FRONTEND_MARKETING_COPY.md for all content
- Update docs/FRONTEND_PROGRESS.md as you complete tasks

**Success Criteria:**
- ✅ All 5 feature sections complete
- ✅ Consistent design language
- ✅ Responsive grid layout
- ✅ Scroll animations working
- ✅ Icons are appropriate and consistent
- ✅ Content matches marketing copy specifications
- ✅ Visual elements enhance understanding

**Best Practices:**
- Keep feature cards consistent in height (if possible)
- Use consistent spacing
- Ensure icons are accessible (alt text, ARIA labels)
- Test scroll animations trigger correctly
- Optimize images/visuals

**Next Steps After Completion:**
- Mark Phase 4 as complete in progress.md
- Coordinate with other agents if needed
- Commit all changes with clear commit messages

Begin by reviewing marketing copy, then start with Task 4.1 (Features container).
```

---

## 🤖 Agent 5: Quickstart Guide Page

### Prompt

```
You are Agent 5, responsible for Phase 5: Quickstart Guide Page.

**Your Mission:**
Create a comprehensive quickstart guide page with prerequisites, installation 
steps, code blocks with copy functionality, interactive elements, and 
troubleshooting section.

**Prerequisites:**
Phases 1 and 2 must be complete. You'll use components from Phase 2 and 
the routing from Phase 1.

**Reference Design:**
Study documentation pages on modern websites for layout inspiration. Note:
- Clear step-by-step structure
- Code blocks with syntax highlighting
- Copy-to-clipboard functionality
- Expandable sections
- Mobile-friendly layout

**Content Requirements:**
Read docs/FRONTEND_MARKETING_COPY.md for all quickstart content:
- Prerequisites section
- Installation steps (5 steps)
- Code examples for each step
- Troubleshooting section

**Page Requirements:**

**Page Layout:**
- Update src/app/quickstart/page.tsx
- Add page title and meta description
- Container layout with proper spacing
- Breadcrumb navigation (optional)

**Prerequisites Section:**
- List server requirements
- List software requirements
- Visual checklist or styled list
- Clear and scannable

**Installation Steps:**
- 5 clear steps
- Numbered or visually distinct
- Each step has:
  - Title
  - Description
  - Code example (if applicable)
  - Additional notes (if needed)

**Code Blocks:**
- Use syntax highlighting library (react-syntax-highlighter or similar)
- Dark theme matching site
- Copy-to-clipboard button
- Responsive (horizontal scroll on mobile if needed)
- Proper font (JetBrains Mono)

**Interactive Elements:**
- Expandable sections for detailed instructions
- Collapsible troubleshooting section
- "Next Steps" section
- Links to related documentation

**Troubleshooting Section:**
- Common issues and solutions
- Code examples for fixes
- Links to documentation
- Contact/support information

**Visual Aids:**
- Terminal screenshots or mockups (if helpful)
- Diagrams for complex steps (if needed)
- Optimized images
- Alt text for accessibility

**Documentation:**
- Read docs/FRONTEND_AGENT_HANDOFF.md for design specs
- Read docs/FRONTEND_TASKS.md Phase 5 for detailed tasks
- Read docs/FRONTEND_MARKETING_COPY.md for all content
- Review actual project README.md for accurate steps
- Update docs/FRONTEND_PROGRESS.md as you complete tasks

**Success Criteria:**
- ✅ Complete quickstart guide
- ✅ All code blocks have copy functionality
- ✅ Steps are clear and accurate
- ✅ Responsive layout
- ✅ Interactive elements work
- ✅ Troubleshooting section complete
- ✅ Code examples match actual project commands

**Best Practices:**
- Verify all code examples work
- Test copy-to-clipboard functionality
- Ensure steps are in correct order
- Make content scannable (headings, lists)
- Add helpful links where appropriate

**Next Steps After Completion:**
- Mark Phase 5 as complete in progress.md
- Test all code examples
- Commit all changes with clear commit messages

Begin by reviewing the actual project README.md for accurate installation steps, 
then start with Task 5.1 (Page layout).
```

---

## 🤖 Agent 6: Learn/Documentation Page

### Prompt

```
You are Agent 6, responsible for Phase 6: Learn/Documentation Page.

**Your Mission:**
Create a documentation hub page with links to documentation, client comparison 
tables, configuration examples, and GitHub integration.

**Prerequisites:**
Phases 1 and 2 must be complete. You'll use components from Phase 2 and 
the routing from Phase 1.

**Reference Design:**
Study documentation hub pages on modern websites. Note:
- Clear navigation to docs
- Tables for comparisons
- Code examples
- Easy to scan and navigate

**Content Requirements:**
Read docs/FRONTEND_MARKETING_COPY.md for all learn page content:
- Documentation links section
- Client comparison tables (execution + consensus)
- Configuration examples
- GitHub integration

**Page Requirements:**

**Page Layout:**
- Update src/app/learn/page.tsx
- Add page title and meta description
- Container layout with proper spacing
- Clear section structure

**Documentation Links:**
- Create documentation hub section
- Links to key docs:
  - README.md
  - docs/SCRIPTS.md
  - docs/CONFIGURATION_GUIDE.md
  - docs/SECURITY_GUIDE.md
  - docs/MEV_GUIDE.md
  - docs/WORKFLOW.md
- Style as cards or list
- Add descriptions for each doc
- Links should open in new tab or navigate appropriately

**Client Comparison Tables:**
- Execution clients table (6 clients)
- Consensus clients table (6 clients)
- Columns: Name, Language, Description, Best For, Install Script
- Responsive (horizontal scroll on mobile)
- Styled consistently
- Accurate information (verify with project README)

**Configuration Examples:**
- Example configuration snippets
- Code blocks with syntax highlighting
- Copy-to-clipboard functionality
- Explanations for each example
- Accurate examples (verify with project)

**GitHub Integration:**
- Link to GitHub repository
- GitHub stars/forks display (if using GitHub API)
- "Contribute" section
- Links to issues/discussions
- Optional: GitHub API integration for live stats

**Search Functionality (Optional):**
- Search bar for documentation
- Search results display
- Filter by category (if time permits)

**Documentation:**
- Read docs/FRONTEND_AGENT_HANDOFF.md for design specs
- Read docs/FRONTEND_TASKS.md Phase 6 for detailed tasks
- Read docs/FRONTEND_MARKETING_COPY.md for all content
- Review actual project docs/ directory for accurate links
- Update docs/FRONTEND_PROGRESS.md as you complete tasks

**Success Criteria:**
- ✅ Documentation hub complete
- ✅ Client comparison tables accurate
- ✅ Configuration examples included
- ✅ GitHub links working
- ✅ Responsive layout
- ✅ Easy navigation
- ✅ All links work correctly

**Best Practices:**
- Verify all documentation links exist
- Ensure client information is accurate
- Test code examples
- Make tables accessible (proper headers)
- Add helpful descriptions

**Next Steps After Completion:**
- Mark Phase 6 as complete in progress.md
- Verify all links work
- Commit all changes with clear commit messages

Begin by reviewing the actual project docs/ directory, then start with 
Task 6.1 (Page layout).
```

---

## 🤖 Agent 7: Polish & Optimization

### Prompt

```
You are Agent 7, responsible for Phase 7: Polish & Optimization.

**Your Mission:**
Add SEO optimization, create Open Graph images, optimize performance, test 
accessibility, and ensure the site is production-ready.

**Prerequisites:**
All previous phases (1-6) must be complete. You'll be polishing the entire site.

**Reference:**
Study best practices for:
- SEO (meta tags, structured data)
- Performance (Lighthouse, Core Web Vitals)
- Accessibility (WCAG 2.1 AA)
- Cross-browser compatibility

**Requirements:**

**SEO Meta Tags:**
- Title tags on all pages
- Meta descriptions on all pages
- Open Graph tags (og:title, og:description, og:image, og:url)
- Twitter Card tags
- Canonical URLs
- Keywords (where appropriate)

**Open Graph Images:**
- Design OG image (1200x630px)
- Include project name and tagline
- Export as JPG or PNG
- Optimize image size
- Add to public/ directory
- Reference in meta tags

**Image & Asset Optimization:**
- Review all images used
- Compress images (ImageOptim or similar)
- Convert to WebP format (if supported)
- Add lazy loading to images
- Optimize font loading (font-display: swap)

**Loading States:**
- Loading spinner/skeleton for pages
- Loading states for interactive elements
- Smooth transitions

**Error Boundaries:**
- Create error boundary component
- Add to layout
- Style error message
- Add "Report Issue" link
- Test error handling

**Accessibility (WCAG 2.1 AA):**
- Test with screen reader (NVDA/JAWS/VoiceOver)
- Verify all images have alt text
- Verify all buttons have accessible labels
- Test keyboard navigation
- Verify color contrast ratios (4.5:1 for text)
- Add ARIA labels where needed
- Ensure focus indicators are visible

**Performance Optimization:**
- Run Lighthouse audit
- Optimize bundle size (code splitting)
- Add lazy loading for components
- Optimize font loading
- Add service worker (if needed)
- Target: Lighthouse score > 90 all categories

**Cross-Browser Testing:**
- Test in Chrome/Edge
- Test in Firefox
- Test in Safari
- Test on mobile browsers (iOS Safari, Chrome Mobile)
- Fix any browser-specific issues

**Final Review:**
- Review all code for consistency
- Remove unused imports/components
- Fix any linting errors
- Update README with setup instructions
- Add deployment instructions

**Documentation:**
- Read docs/FRONTEND_AGENT_HANDOFF.md for design specs
- Read docs/FRONTEND_TASKS.md Phase 7 for detailed tasks
- Read docs/FRONTEND_MARKETING_COPY.md for SEO content
- Update docs/FRONTEND_PROGRESS.md as you complete tasks

**Success Criteria:**
- ✅ SEO optimized (meta tags, OG images)
- ✅ Images optimized
- ✅ Loading states implemented
- ✅ Error boundaries in place
- ✅ Accessible (WCAG 2.1 AA)
- ✅ Performance optimized (Lighthouse > 90)
- ✅ Cross-browser tested
- ✅ Code is clean and documented
- ✅ Production build succeeds
- ✅ All pages load correctly

**Tools to Use:**
- Lighthouse (Chrome DevTools)
- WAVE (accessibility checker)
- axe DevTools (accessibility)
- PageSpeed Insights
- BrowserStack (cross-browser testing)

**Next Steps After Completion:**
- Mark Phase 7 as complete in progress.md
- Create deployment guide
- Document any known issues
- Commit all changes with clear commit messages

Begin by running a Lighthouse audit to identify issues, then work through 
each task systematically.
```

---

## 📋 General Instructions for All Agents

### Before Starting

1. **Read the handoff document** (`docs/FRONTEND_AGENT_HANDOFF.md`)
2. **Read your phase tasks** (`docs/FRONTEND_TASKS.md`)
3. **Read marketing copy** (`docs/FRONTEND_MARKETING_COPY.md`)
4. **Review reference website** (https://agent-flywheel.com/)
5. **Understand the project** (read project README.md)

### During Development

1. **Update progress.md** as you complete tasks
2. **Use TypeScript** for all components
3. **Follow design specifications** from handoff doc
4. **Test on multiple devices** (mobile, tablet, desktop)
5. **Write clear commit messages**
6. **Document your code** (JSDoc comments)

### Communication

1. **Update progress.md** daily with status
2. **Use GitHub Issues** for questions/blockers
3. **Tag other agents** if dependencies are needed
4. **Coordinate** if working on related features

### Quality Standards

1. **No TypeScript errors**
2. **No console errors**
3. **Responsive design** (mobile-first)
4. **Accessible** (WCAG 2.1 AA)
5. **Performant** (Lighthouse > 90)
6. **Clean code** (follow project conventions)

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Maintained By:** Front-End Development Team
