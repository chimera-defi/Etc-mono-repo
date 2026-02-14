# Front-End Development Agent Prompts (Copy-Paste Ready)

## 🚀 How to Use These Prompts

Copy the entire prompt section for your assigned agent and paste it into your AI coding assistant (Cursor, Claude, ChatGPT, etc.). The prompts are self-contained and include all necessary context.

---

## 🤖 Agent 1: Project Setup & Foundation

```
You are building a marketing website for an Ethereum node setup tool. Your task is Phase 1: Project Setup & Foundation.

PROJECT CONTEXT:
- Repository: https://github.com/chimera-defi/eth2-quickstart
- Reference design: https://agent-flywheel.com/ (study the dark theme, gradients, glassmorphism)
- Goal: Create a Next.js marketing site similar to agent-flywheel.com

YOUR TASKS (complete in order):

1. Initialize Next.js project:
   - Run: bunx create-next-app@latest frontend --typescript --tailwind --app --no-src-dir
   - Verify structure matches: frontend/app/, frontend/components/, frontend/lib/
   - Test: bun run dev should start successfully

2. Configure Tailwind CSS (tailwind.config.js):
   - Add custom colors:
     background: '#0a0a12'
     foreground: '#f9fafb'
     card: 'rgba(255, 255, 255, 0.03)'
     primary: '#8b5cf6'
     secondary: '#06b6d4'
     muted: '#9ca3af'
     border: 'rgba(255, 255, 255, 0.1)'
   - Add fonts: mono: ['JetBrains Mono'], sans: ['Inter']
   - Configure dark mode (class strategy)

3. Set up fonts (app/layout.tsx):
   - Import JetBrains Mono from Google Fonts
   - Import Inter from Google Fonts
   - Apply fonts: mono for headings/code, sans for body

4. Create base layout (app/layout.tsx):
   - Add metadata (title, description)
   - Add dark theme class to html
   - Add global CSS reset/styles
   - Structure: <html><body>{children}</body></html>

5. Create routing structure:
   - app/page.tsx (homepage placeholder)
   - app/quickstart/page.tsx (placeholder)
   - app/learn/page.tsx (placeholder)
   - Test navigation works

6. Configure build settings (next.config.js):
   - Enable image optimization
   - Test: bun run build succeeds
   - Test: bun start works

SUCCESS CRITERIA:
✅ bun run dev starts without errors
✅ bun run build succeeds
✅ All 3 pages load correctly
✅ Tailwind classes work (test with a test div)
✅ Fonts load correctly

DOCUMENTATION TO READ:
- docs/FRONTEND_COMPONENT_SPECS.md (component requirements)
- docs/FRONTEND_TASKS.md (detailed task list Phase 1)

AFTER COMPLETION:
- Update docs/FRONTEND_PROGRESS.md (mark Phase 1 complete)
- Commit with message: "feat: initialize Next.js project with Tailwind and TypeScript"

Begin with task 1. Work systematically through each task. Test after each step.
```

---

## 🤖 Agent 2: UI Components Library

```
You are building UI components for an Ethereum node setup marketing website. Your task is Phase 2: UI Components Library.

PREREQUISITES:
- Phase 1 must be complete (Next.js + Tailwind configured)
- Verify: frontend/ directory exists with app/ structure

REFERENCE DESIGN:
- Study: https://agent-flywheel.com/
- Note: Dark theme, glassmorphism effects, smooth animations

YOUR TASKS (create these 7 components):

1. Button Component (components/ui/Button.tsx):
   - Props: variant ('primary' | 'secondary'), size ('sm' | 'md' | 'lg'), disabled, children, href?, onClick?
   - Primary: gradient bg (from-primary to-purple-600), white text, hover:scale-105
   - Secondary: transparent bg, border-2 border-primary/30, hover:border-primary/60
   - Sizes: sm (h-9 px-4), md (h-11 px-5), lg (h-12 px-6)
   - Can render as <a> if href provided, else <button>
   - Add TypeScript interface, JSDoc comments

2. Card Component (components/ui/Card.tsx):
   - Props: children, className?, hover?, padding? ('sm' | 'md' | 'lg')
   - Styling: bg-card/30, border border-border/30, rounded-xl, p-6
   - Hover: scale-105, border-primary/60 (if hover prop true)
   - Simple wrapper component

3. Badge Component (components/ui/Badge.tsx):
   - Props: children, variant? ('primary' | 'secondary' | 'success' | 'muted'), size? ('sm' | 'md')
   - Styling: rounded-full, border, px-4 py-1.5
   - Variants: bg-primary/10 border-primary/30 text-primary (primary), etc.

4. Terminal Component (components/ui/Terminal.tsx):
   - Props: children?, code?, language?, className?
   - Header: macOS dots (red, yellow, green circles)
   - Content: bg-[#1e1e1e], monospace font, syntax highlighting if code prop
   - Use react-syntax-highlighter if code provided
   - Install: bun add react-syntax-highlighter @types/react-syntax-highlighter

5. CodeBlock Component (components/ui/CodeBlock.tsx):
   - Props: code (string), language?, showCopy? (default true), className?
   - Features: syntax highlighting, copy button (top-right), copy feedback
   - Use react-syntax-highlighter
   - Copy button: use navigator.clipboard.writeText

6. Navbar Component (components/layout/Navbar.tsx):
   - Left: Logo "Ethereum Node Setup"
   - Right: Links (GitHub external, Learn internal /learn) + Button "Get Started" → /quickstart
   - Responsive: mobile menu if needed
   - Use Button component for CTA

7. Footer Component (components/layout/Footer.tsx):
   - Copyright: "© 2024 Ethereum Node Quick Setup"
   - Links: GitHub, Documentation, Issues, Discussions
   - Simple, minimal design

REQUIREMENTS FOR ALL COMPONENTS:
- TypeScript types (export interface)
- JSDoc comments (@param, @returns)
- Responsive (test mobile/tablet/desktop)
- Accessible (ARIA labels, keyboard nav)
- No external dependencies except React, Tailwind, Lucide icons

INSTALL DEPENDENCIES:
bun add lucide-react react-syntax-highlighter @types/react-syntax-highlighter

SUCCESS CRITERIA:
✅ All 7 components created
✅ No TypeScript errors
✅ Components render correctly in isolation
✅ Responsive design works
✅ Components match design specs

DOCUMENTATION:
- Read: docs/FRONTEND_COMPONENT_SPECS.md (detailed specs)
- Read: docs/FRONTEND_TASKS.md Phase 2
- Read: docs/FRONTEND_MARKETING_COPY.md (for text content)

AFTER COMPLETION:
- Update docs/FRONTEND_PROGRESS.md
- Commit: "feat: create UI component library (Button, Card, Badge, Terminal, CodeBlock, Navbar, Footer)"

Test each component individually before moving to the next.
```

---

## 🤖 Agent 3: Hero Section

```
You are building the hero section for an Ethereum node setup marketing website. Your task is Phase 3: Hero Section.

PREREQUISITES:
- Phases 1 & 2 complete (Next.js setup, UI components ready)
- Verify: Button, Terminal components exist

REFERENCE DESIGN:
- Study: https://agent-flywheel.com/ hero section carefully
- Note: Two-column layout, gradient text, animated background, terminal mockup

YOUR TASKS:

1. Create Hero component (components/sections/Hero.tsx):
   - Two-column layout: lg:grid lg:grid-cols-2
   - Stack on mobile: flex-col
   - Container: max-w-7xl mx-auto px-6

2. Left column content:
   - Badge: "Zero to Ethereum node in 30 minutes" (use Badge component)
   - Headline: "Ethereum Node Setup" + "In Minutes, Not Days" (two lines)
     * Use gradient text: bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent
     * Font: font-mono (JetBrains Mono)
     * Size: text-4xl sm:text-5xl lg:text-6xl font-bold
   - Subheadline: "Transform a fresh cloud server into a fully-configured Ethereum node. Choose from 6 execution clients and 6 consensus clients. Set up MEV-Boost, secure RPC endpoints, and comprehensive security hardening—all automated. Save 2+ days compared to manual guides."
     * Style: text-muted-foreground text-lg leading-relaxed max-w-xl
   - CTA buttons:
     * Primary: "Get Started" → /quickstart (use Button component)
     * Secondary: "View on GitHub" → https://github.com/chimera-defi/eth2-quickstart
   - Stats section:
     * 4 stats: "12" (Clients Supported), "36" (Client Combinations), "~30m" (Setup Time), "1" (Command)
     * Layout: flex flex-wrap gap-4
     * Each stat: large number (gradient text) + label below

3. Right column:
   - Terminal mockup (use Terminal component)
   - Content: Installation command example (see FRONTEND_MARKETING_COPY.md)
   - Position: lg:justify-end
   - Responsive: hidden on mobile or smaller size

4. Background animations:
   - Gradient background: bg-gradient-hero (create custom gradient)
   - Grid pattern: bg-grid-pattern opacity-30 (use CSS or SVG)
   - Glow circles: 2-3 animated circles with blur and pulse
     * Use absolute positioning
     * Animation: animate-pulse-glow (create custom animation)

5. Entrance animations:
   - Install: bun add framer-motion
   - Headline: fade-in + slide-up
   - Description: fade-in + slide-up (delay)
   - Terminal: slide-in from right
   - Use Framer Motion: motion.div with initial, animate, transition

CONTENT SOURCE:
- Read: docs/FRONTEND_MARKETING_COPY.md (all hero content)

SUCCESS CRITERIA:
✅ Hero section matches reference design
✅ Responsive (mobile, tablet, desktop)
✅ Animations smooth and performant
✅ All text content accurate
✅ CTAs link correctly
✅ Terminal mockup realistic

DOCUMENTATION:
- Read: docs/FRONTEND_COMPONENT_SPECS.md (Hero specs)
- Read: docs/FRONTEND_TASKS.md Phase 3

AFTER COMPLETION:
- Update docs/FRONTEND_PROGRESS.md
- Commit: "feat: create hero section with animations and terminal mockup"

Test on multiple screen sizes. Optimize animations for performance.
```

---

## 🤖 Agent 4: Features Sections

```
You are building feature sections for an Ethereum node setup marketing website. Your task is Phase 4: Features Sections.

PREREQUISITES:
- Phases 1 & 2 complete (components ready)
- Verify: Card, Badge components exist

REFERENCE DESIGN:
- Study: https://agent-flywheel.com/ features section
- Note: Grid layout, consistent cards, icons, scroll animations

YOUR TASKS:

1. Create Features component (components/sections/Features.tsx):
   - Container: max-w-7xl mx-auto px-6 py-20
   - Section title: "Features" or similar (optional)
   - Grid: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6

2. Create 5 feature cards (use Card component):

   Feature 1: Client Diversity
   - Icon: Grid3x3 (from lucide-react)
   - Title: "Choose Your Perfect Client Stack"
   - Description: "Support for all major Ethereum clients—mix and match execution and consensus clients for optimal performance and network diversity. From lightweight Nimbus to enterprise-grade Teku, find the perfect combination for your hardware and needs."
   - Visual: Grid of client badges (use Badge component)
     * Execution: Geth, Erigon, Reth, Nethermind, Besu, Nimbus-eth1
     * Consensus: Prysm, Lighthouse, Teku, Nimbus, Lodestar, Grandine

   Feature 2: One-Liner Installation
   - Icon: Terminal or Zap
   - Title: "From Zero to Node in One Command"
   - Description: "No manual configuration files. No hours of reading documentation. Just one command and you're running. Our automated scripts handle everything—security hardening, client installation, MEV setup, and RPC configuration."
   - Visual: Code snippet (use CodeBlock component)
     * Code: "curl -fsSL https://raw.githubusercontent.com/chimera-defi/eth2-quickstart/main/run_1.sh | bash"

   Feature 3: Security First
   - Icon: Shield or Lock
   - Title: "Enterprise-Grade Security Out of the Box"
   - Description: "Firewall rules, fail2ban, SSH hardening, secure file permissions—all configured automatically. Your node is protected from day one with industry best practices and comprehensive security monitoring."
   - Visual: Security checklist (ul list) or shield icon

   Feature 4: MEV Integration
   - Icon: TrendingUp or Coins
   - Title: "Maximize Validator Rewards"
   - Description: "Built-in MEV-Boost and Commit-Boost support. Configure once, earn more. Connect to multiple relays, set minimum bids, and optimize your validator rewards automatically."
   - Visual: MEV flow diagram (simple visual) or relay badges

   Feature 5: Uncensored RPC
   - Icon: Globe or Server
   - Title: "Your Own Censorship-Resistant RPC"
   - Description: "Run your own RPC endpoint. Faster than Infura/Alchemy, completely uncensored. Share with friends, use for your dApps, or offer as a service. Includes SSL certificates, rate limiting, and security hardening."
   - Visual: RPC endpoint example or speed comparison

3. Scroll animations:
   - Install: bun add framer-motion (if not already)
   - Use: motion.div with useInView hook
   - Animation: fade-in + slide-up
   - Stagger: delay each card by 0.1s

4. Hover effects:
   - Cards: hover:scale-105 hover:border-primary/60 (use Card hover prop)

CONTENT SOURCE:
- Read: docs/FRONTEND_MARKETING_COPY.md (all feature content)

SUCCESS CRITERIA:
✅ All 5 features complete
✅ Consistent design language
✅ Responsive grid layout
✅ Scroll animations working
✅ Icons appropriate and consistent

DOCUMENTATION:
- Read: docs/FRONTEND_COMPONENT_SPECS.md
- Read: docs/FRONTEND_TASKS.md Phase 4

AFTER COMPLETION:
- Update docs/FRONTEND_PROGRESS.md
- Commit: "feat: create features section with 5 feature cards and scroll animations"

Test scroll animations trigger correctly. Ensure cards are consistent in styling.
```

---

## 🤖 Agent 5: Quickstart Guide Page

```
You are building the quickstart guide page for an Ethereum node setup marketing website. Your task is Phase 5: Quickstart Guide Page.

PREREQUISITES:
- Phases 1 & 2 complete
- Verify: CodeBlock component exists

REFERENCE:
- Study documentation pages on modern websites
- Note: Clear steps, code blocks, copy functionality

YOUR TASKS:

1. Create Quickstart page (app/quickstart/page.tsx):
   - Page title: "Quick Start Guide - Ethereum Node Setup"
   - Meta description: "Get your Ethereum node running in 30 minutes. Step-by-step guide with automated scripts, client selection, and security configuration."
   - Container: max-w-4xl mx-auto px-6 py-12

2. Prerequisites section:
   - Title: "Prerequisites"
   - List:
     * Server: Cloud VPS with SSH access (Ubuntu 20.04+)
     * Hardware: 2-4TB SSD/NVMe, 16-64GB RAM, 4-8 cores
     * Network: Stable broadband connection (unmetered preferred)
     * Access: SSH key configured or root access
   - Style: ul list with checkmarks or styled list

3. Installation steps (5 steps):
   - Step 1: Download and Prepare
     * Code: git clone https://github.com/chimera-defi/eth2-quickstart
     * Code: cd eth2-quickstart
     * Code: chmod +x run_1.sh
   - Step 2: Run Server Setup (as root)
     * Code: sudo ./run_1.sh
     * Description: What the script does
   - Step 3: Reboot and Configure
     * Code: sudo reboot
     * Description: Login as new user
   - Step 4: Configure and Install Clients
     * Code: nano exports.sh (or ./select_clients.sh)
     * Code: ./run_2.sh
   - Step 5: Start Services
     * Code: sudo systemctl start eth1 cl validator mev
     * Code: sudo systemctl status eth1 cl validator mev

4. Code blocks:
   - Use CodeBlock component for all code
   - Each code block should have copy functionality
   - Language: "bash" for shell commands

5. Troubleshooting section:
   - Title: "Troubleshooting"
   - Common issues:
     * Services not starting (with solution code)
     * Sync issues (with solutions)
     * Permission errors (with solutions)
   - Links to documentation

6. Next Steps section:
   - Links to related docs
   - "Learn More" button

CONTENT SOURCE:
- Read: docs/FRONTEND_MARKETING_COPY.md (quickstart content)
- Verify: Actual project README.md for accurate commands

SUCCESS CRITERIA:
✅ Complete quickstart guide
✅ All code blocks have copy functionality
✅ Steps clear and accurate
✅ Responsive layout
✅ Code examples match actual project

DOCUMENTATION:
- Read: docs/FRONTEND_TASKS.md Phase 5
- Verify: Project README.md for accurate steps

AFTER COMPLETION:
- Update docs/FRONTEND_PROGRESS.md
- Commit: "feat: create quickstart guide page with installation steps"

Verify all code examples are accurate. Test copy functionality works.
```

---

## 🤖 Agent 6: Learn/Documentation Page

```
You are building the learn/documentation page for an Ethereum node setup marketing website. Your task is Phase 6: Learn/Documentation Page.

PREREQUISITES:
- Phases 1 & 2 complete
- Verify: Card, CodeBlock components exist

YOUR TASKS:

1. Create Learn page (app/learn/page.tsx):
   - Page title: "Learn - Ethereum Node Setup Documentation"
   - Meta description: "Comprehensive documentation for Ethereum node setup, client configuration, security, MEV integration, and RPC endpoints."
   - Container: max-w-6xl mx-auto px-6 py-12

2. Documentation Links section:
   - Title: "Documentation Hub"
   - Links (use Card component or styled list):
     * README.md - Project overview and quickstart guide
     * docs/SCRIPTS.md - Detailed script reference and usage
     * docs/CONFIGURATION_GUIDE.md - Configuration architecture and conventions
     * docs/SECURITY_GUIDE.md - Comprehensive security documentation
     * docs/MEV_GUIDE.md - MEV setup and configuration
     * docs/WORKFLOW.md - Setup workflow and process
   - Each link: title + description
   - Links should point to GitHub (raw or blob URLs)

3. Client Comparison Tables:
   - Execution Clients table (6 clients):
     Columns: Name, Language, Description, Best For, Install Script
     Rows: Geth, Erigon, Reth, Nethermind, Besu, Nimbus-eth1
   - Consensus Clients table (6 clients):
     Columns: Name, Language, Description, Best For, Install Script
     Rows: Prysm, Lighthouse, Teku, Nimbus, Lodestar, Grandine
   - Style: Responsive table (overflow-x-auto on mobile)
   - Use: HTML table or custom table component

4. Configuration Examples:
   - Title: "Configuration Examples"
   - Example 1: Basic Configuration (exports.sh)
   - Example 2: Client Selection
   - Example 3: MEV Configuration
   - Use CodeBlock component
   - Add explanations above each example

5. GitHub Integration:
   - Link to GitHub repository
   - Optional: GitHub stars/forks (if using GitHub API)
   - "Contribute" section with links to Issues/Discussions

CONTENT SOURCE:
- Read: docs/FRONTEND_MARKETING_COPY.md (learn page content)
- Verify: Actual project docs/ directory for accurate links

SUCCESS CRITERIA:
✅ Documentation hub complete
✅ Client comparison tables accurate
✅ Configuration examples included
✅ GitHub links working
✅ Responsive layout
✅ All links work correctly

DOCUMENTATION:
- Read: docs/FRONTEND_TASKS.md Phase 6
- Verify: Project docs/ directory exists

AFTER COMPLETION:
- Update docs/FRONTEND_PROGRESS.md
- Commit: "feat: create learn page with documentation links and client comparison tables"

Verify all documentation links exist. Ensure tables are accessible.
```

---

## 🤖 Agent 7: Polish & Optimization

```
You are polishing and optimizing the Ethereum node setup marketing website. Your task is Phase 7: Polish & Optimization.

PREREQUISITES:
- All previous phases (1-6) complete
- Verify: All pages and components exist

YOUR TASKS:

1. SEO Meta Tags (all pages):
   - Add title tags (unique per page)
   - Add meta descriptions (unique per page)
   - Add Open Graph tags (og:title, og:description, og:image, og:url)
   - Add Twitter Card tags
   - Add canonical URLs
   - Use Next.js Metadata API

2. Open Graph Image:
   - Create OG image (1200x630px)
   - Include: Project name "Ethereum Node Quick Setup" + tagline
   - Export as JPG or PNG
   - Optimize: < 200KB
   - Save to: public/og-image.jpg
   - Reference in metadata

3. Image Optimization:
   - Review all images
   - Compress images (use ImageOptim or similar)
   - Convert to WebP if possible
   - Add lazy loading: loading="lazy"
   - Add alt text for accessibility

4. Loading States:
   - Add loading.tsx files for pages (Next.js App Router)
   - Add loading spinners/skeletons
   - Smooth transitions

5. Error Boundaries:
   - Create error.tsx files (Next.js App Router)
   - Style error messages
   - Add "Report Issue" link

6. Accessibility (WCAG 2.1 AA):
   - Test with screen reader
   - Verify all images have alt text
   - Verify all buttons have accessible labels
   - Test keyboard navigation
   - Verify color contrast (4.5:1 for text)
   - Add ARIA labels where needed
   - Ensure focus indicators visible

7. Performance Optimization:
   - Run Lighthouse audit
   - Optimize bundle size (code splitting)
   - Add lazy loading for components (dynamic imports)
   - Optimize font loading (font-display: swap)
   - Target: Lighthouse score > 90 all categories

8. Cross-Browser Testing:
   - Test Chrome/Edge
   - Test Firefox
   - Test Safari
   - Test mobile browsers (iOS Safari, Chrome Mobile)
   - Fix any browser-specific issues

9. Final Review:
   - Remove unused imports/components
   - Fix linting errors
   - Update README.md with setup instructions
   - Add deployment instructions

TOOLS TO USE:
- Lighthouse (Chrome DevTools)
- WAVE (accessibility checker)
- axe DevTools
- PageSpeed Insights

SUCCESS CRITERIA:
✅ SEO optimized (meta tags, OG images)
✅ Images optimized
✅ Loading states implemented
✅ Error boundaries in place
✅ Accessible (WCAG 2.1 AA)
✅ Performance optimized (Lighthouse > 90)
✅ Cross-browser tested
✅ Code clean and documented

DOCUMENTATION:
- Read: docs/FRONTEND_TASKS.md Phase 7
- Read: docs/FRONTEND_MARKETING_COPY.md (SEO content)

AFTER COMPLETION:
- Update docs/FRONTEND_PROGRESS.md
- Commit: "feat: add SEO, accessibility, and performance optimizations"

Run Lighthouse audit first to identify issues, then work systematically.
```

---

## 📋 Quick Reference

**All agents should:**
1. Read `docs/FRONTEND_COMPONENT_SPECS.md` first
2. Read `docs/FRONTEND_TASKS.md` for their phase
3. Read `docs/FRONTEND_MARKETING_COPY.md` for content
4. Update `docs/FRONTEND_PROGRESS.md` as they work
5. Test thoroughly before marking complete
6. Commit with clear messages

**Component count:** 11 total components (7 UI + 2 sections + 2 pages)

**Dependencies:** Next.js, React, TypeScript, Tailwind, Lucide Icons, Framer Motion, react-syntax-highlighter

---

**Document Version:** 2.0  
**Last Updated:** 2024
