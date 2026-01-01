# Bug Tracking & Review Tools Reference 🛠️

> Quick reference guide to all analyzed tools with direct links for hands-on exploration.

---

## 🎯 Visual Feedback & Bug Tracking

### BugHerd
**Website:** https://bugherd.com
**Chrome Extension:** [Add to Chrome](https://chrome.google.com/webstore/detail/bugherd)
**Pricing:** $33/month (Standard)

**Best For:** Website QA/UAT for agencies
**Key Feature:** Kanban board for visual feedback
**Try It:** 14-day free trial available

---

### Marker.io
**Website:** https://marker.io
**Chrome Extension:** [Add to Chrome](https://chrome.google.com/webstore/detail/markerio)
**Pricing:** $39/month (Starter, 3 users)

**Best For:** Agencies needing deep Jira integration
**Key Feature:** 2-way sync with project management tools
**Try It:** Free trial available

---

### Userback
**Website:** https://userback.io
**Chrome Extension:** Available
**Pricing:** $7/user/month

**Best For:** User feedback with sentiment analysis
**Key Feature:** Real-time collaborative feedback
**Try It:** Free tier available

---

### Jam.dev ⭐ (AI-Powered)
**Website:** https://jam.dev
**Chrome Extension:** [Add to Chrome](https://chrome.google.com/webstore/detail/jam/iohjgamcilhbgmhbnllfolmkmmekfmci)
**iOS App:** [App Store](https://apps.apple.com/us/app/screen-recording-logs-jam/id6469037234)
**Pricing:** $12/month (Individual), $14/user/month (Team)

**Best For:** Developer-first bug reporting with AI
**Key Features:**
- JamGPT for auto-generated bug titles & reproduction steps
- Instant replay (capture what happened before the bug)
- Console + network log capture
- Sentry integration

**Try It:** Free tier available (5 reports/week)

---

## 🤖 AI Code Review & Bug Detection

### CodeRabbit
**Website:** https://coderabbit.ai
**GitHub App:** [Install](https://github.com/apps/coderabbit-ai)
**Pricing:** Free tier (unlimited public repos)

**Best For:** Automated PR reviews
**Key Feature:** 46% runtime bug detection accuracy
**Try It:** Free for open source

---

### Qodo (formerly Codium)
**Website:** https://www.qodo.ai
**VS Code Extension:** [Install](https://marketplace.visualstudio.com/items?itemName=Codium.codium)
**Pricing:** Free tier, custom enterprise

**Best For:** Enterprise-scale code review
**Key Features:**
- Test generation
- Code consistency checks
- Compliance enforcement

**Try It:** Free tier available

---

### React Scan ⭐ (Open Source)
**Website:** https://react-scan.com
**GitHub:** https://github.com/aidenybai/react-scan
**npm:** `npx react-scan@latest http://localhost:3000`
**Pricing:** Free (MIT License)

**Best For:** React performance debugging
**Key Features:**
- Visual overlay showing slow renders
- Unnecessary render detection
- CLI for remote scanning

**Try It:**
```bash
# Scan any React app
npx react-scan@latest https://react.dev
```

---

## 📊 Error Monitoring & Session Replay

### Sentry
**Website:** https://sentry.io
**GitHub:** https://github.com/getsentry/sentry
**npm:** `npm install @sentry/react`
**Pricing:** Free tier (5K errors/month)

**Best For:** Application error tracking
**Key Features:**
- Real-time error alerts
- Performance monitoring
- Breadcrumb trails

**Try It:** Free tier available

---

### LogRocket
**Website:** https://logrocket.com
**npm:** `npm install logrocket`
**Pricing:** $99/month (Team)

**Best For:** Session replay + debugging
**Key Feature:** DOM-based session recording (low bandwidth)
**Try It:** Free trial available

---

### Raygun
**Website:** https://raygun.com
**npm:** `npm install raygun4js`
**Pricing:** $19/month (Startup)

**Best For:** Ecommerce/media performance
**Key Feature:** AI error resolution
**Try It:** 14-day trial

---

### Better Stack ⭐ (AI + MCP)
**Website:** https://betterstack.com
**MCP Server:** Available for Claude Code
**Pricing:** Free tier

**Best For:** AI-native debugging workflow
**Key Features:**
- Pre-made prompts for Claude/Cursor
- MCP server for AI agent integration
- Error resolution suggestions

**Try It:** Free tier available

---

## 🎬 Video & Demo Tools

### Loom
**Website:** https://loom.com
**Chrome Extension:** [Add to Chrome](https://chrome.google.com/webstore/detail/loom)
**Pricing:** $15/user/month (Business)

**Best For:** Async video communication
**Key Features:**
- Jira ticket creation from videos
- AI video summaries
- Timestamped comments

**Try It:** Free tier (25 videos, 5 min each)

---

### Arcade
**Website:** https://arcade.software
**Pricing:** Custom

**Best For:** Interactive product demos
**Key Features:**
- Auto-updating demos when product changes
- AI demo creation (Arcade Avery)
- Figma integration

**Try It:** Free trial available

---

## 🔗 Quick Install Commands

### For React Projects
```bash
# Performance monitoring (React Scan)
npx react-scan@latest http://localhost:3000

# Error tracking (Sentry)
npm install @sentry/react
npx @sentry/wizard@latest -i react

# Session replay (LogRocket)
npm install logrocket
```

### Browser Extensions
```
# Jam.dev (Recommended for developers)
https://chrome.google.com/webstore/detail/jam/iohjgamcilhbgmhbnllfolmkmmekfmci

# Loom (Video feedback)
https://chrome.google.com/webstore/detail/loom

# Marker.io (Agency feedback)
https://chrome.google.com/webstore/detail/markerio
```

### AI Code Review (GitHub)
```
# CodeRabbit
https://github.com/apps/coderabbit-ai

# Add to any repo and it auto-reviews PRs
```

---

## 📋 Recommended Stack by Use Case

### Solo Developer
1. **React Scan** - Performance issues (free)
2. **Sentry** - Error tracking (free tier)
3. **Jam.dev** - Bug capture (free tier)

### Small Team (5-10 devs)
1. **Jam.dev** - Bug reporting ($14/user/mo)
2. **Sentry** - Error tracking (free tier)
3. **CodeRabbit** - PR reviews (free for open source)
4. **Loom** - Async communication (free tier)

### Agency
1. **Marker.io** - Client feedback ($39/mo)
2. **Sentry** - Error tracking ($26/mo)
3. **LogRocket** - Session replay ($99/mo)
4. **Loom** - Client videos ($15/user/mo)

### Enterprise
1. **Qodo** - AI code review (custom)
2. **Sentry** - Error tracking (enterprise)
3. **LogRocket** - Session replay (enterprise)
4. **Better Stack** - AI debugging + MCP (custom)

---

## 🧪 Try This Week

### Day 1: Bug Capture
1. Install Jam.dev extension
2. Report 3 bugs with voice (if available) or annotations
3. See AI-generated titles and repro steps

### Day 2: Performance
1. Run `npx react-scan@latest` on your app
2. Identify slowest components
3. Fix one unnecessary re-render

### Day 3: Error Tracking
1. Set up Sentry (10 min)
2. Trigger a test error
3. Review the stack trace + breadcrumbs

### Day 4: Code Review
1. Install CodeRabbit on a repo
2. Open a PR
3. Review AI suggestions

### Day 5: Integration
1. Connect Jam.dev → GitHub Issues
2. Connect Sentry → Slack
3. Automate bug-to-ticket workflow

---

*Last updated: December 2025*
