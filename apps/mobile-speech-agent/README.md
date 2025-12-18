# Voice-Enabled AI Agent Mobile App 🎤🤖

> A cross-platform mobile app for managing AI coding agents using voice commands. Built on research from [PR #35](https://github.com/chimera-defi/Etc-mono-repo/pull/35).

---

## 📱 What Is This?

A React Native mobile application that allows developers to control AI coding agents (like Cursor Agents or Anthropic Claude Code) using natural voice commands.

**Example interaction:**
```
You:  🗣️ "Start an agent on wallet-frontend to add dark mode"
App:  🤖 "I've started an agent. Working on branch claude/dark-mode-x7f2a9"
        (5 minutes later)
App:  📱 "Your agent has finished! PR #245 is ready for review."
```

---

## 🎯 Project Status

**Phase:** 📝 Planning & Design (Complete)
**Next:** 🏗️ Implementation

### What's Done

- ✅ Complete architecture designed
- ✅ UI wireframes and mockups created
- ✅ Tech stack validated
- ✅ API strategy defined
- ✅ Database schema designed
- ✅ Deployment plan created
- ✅ PR #35 research integrated

### What's Next

- [ ] Set up React Native project
- [ ] Implement voice services
- [ ] Build backend API
- [ ] Create UI components
- [ ] Integrate with AI APIs
- [ ] Launch MVP

---

## 📚 Documentation

This project includes comprehensive planning documentation:

| Document | Purpose | Location |
|----------|---------|----------|
| **README** | Project overview (you are here) | `/apps/mobile-speech-agent/` |
| **Quickstart Guide** | Get running in 30 min | [`/docs/MOBILE_SPEECH_APP_QUICKSTART.md`](./docs/MOBILE_SPEECH_APP_QUICKSTART.md) |
| **Feature Plan** | Complete roadmap | [`/docs/MOBILE_SPEECH_AGENT_APP_PLAN.md`](./docs/MOBILE_SPEECH_AGENT_APP_PLAN.md) |
| **Architecture** | Technical details | [`/docs/MOBILE_SPEECH_APP_ARCHITECTURE.md`](./docs/MOBILE_SPEECH_APP_ARCHITECTURE.md) |
| **UI Wireframes** | Visual mockups | [`/mocks/UI_WIREFRAMES.md`](./mocks/UI_WIREFRAMES.md) |
| **Architecture Diagrams** | System diagrams | [`/architecture/ARCHITECTURE_DIAGRAMS.md`](./architecture/ARCHITECTURE_DIAGRAMS.md) |
| **Building on PR #35** | Research integration | [`/docs/BUILDING_ON_PR35.md`](./docs/BUILDING_ON_PR35.md) |
| **Cursor Analysis** | PR #35 findings | [`/docs/CURSOR_AGENTS_ANALYSIS.md`](./docs/CURSOR_AGENTS_ANALYSIS.md) |
| **Mobile Reverse Eng.** | Implementation notes | [`/docs/MOBILE_APP_REVERSE_ENGINEERING.md`](./docs/MOBILE_APP_REVERSE_ENGINEERING.md) |

---

## 🏗️ Project Structure

```
apps/mobile-speech-agent/
│
├── README.md                        # ← You are here
│
├── docs/                            # Planning & architecture docs
│   ├── MOBILE_SPEECH_APP_QUICKSTART.md
│   ├── MOBILE_SPEECH_AGENT_APP_PLAN.md
│   ├── MOBILE_SPEECH_APP_ARCHITECTURE.md
│   ├── BUILDING_ON_PR35.md
│   ├── CURSOR_AGENTS_ANALYSIS.md
│   └── MOBILE_APP_REVERSE_ENGINEERING.md
│
├── mocks/                           # UI wireframes & mockups
│   └── UI_WIREFRAMES.md             # ASCII art mockups of all screens
│
├── architecture/                    # System diagrams
│   └── ARCHITECTURE_DIAGRAMS.md     # Data flows, sequences, deployment
│
├── assets/                          # Images & screenshots
│   ├── cursor_agents_screenshot.png # (from PR #35)
│   ├── cursor_features_screenshot.png
│   └── cursor_main_screenshot.png
│
└── src/                            # Source code (coming soon)
    ├── components/
    ├── screens/
    ├── services/
    ├── hooks/
    └── ...
```

---

## 🎨 Visual Overview

### Screen Flows

```
┌─────────────┐
│   Login     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│          Main Tabs                      │
├──────────┬──────────┬──────────┬────────┤
│  Voice   │  Agents  │  Repos   │Settings│
│  (Home)  │          │          │        │
└──────────┴──────────┴──────────┴────────┘
```

See full wireframes in [`mocks/UI_WIREFRAMES.md`](./mocks/UI_WIREFRAMES.md)

### Architecture

```
┌──────────────┐
│ Mobile App   │  React Native + Expo
│ (iOS/Android)│  TypeScript, Zustand
└──────┬───────┘
       │ HTTPS / WebSocket
       ▼
┌──────────────┐
│   Backend    │  Node.js + Fastify
│   Proxy      │  PostgreSQL, Pusher
└──────┬───────┘
       │ API Calls
       ▼
┌──────────────┐
│  External    │  Anthropic Claude
│  Services    │  GitHub, Pusher
└──────────────┘
```

See full diagrams in [`architecture/ARCHITECTURE_DIAGRAMS.md`](./architecture/ARCHITECTURE_DIAGRAMS.md)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Expo Go app on your phone
- GitHub account

### Get Started (Future - After Implementation)

```bash
# Clone repo
git clone https://github.com/chimera-defi/Etc-mono-repo.git
cd Etc-mono-repo/apps/mobile-speech-agent

# Install dependencies
npm install

# Start development
npm start

# Scan QR code with Expo Go
```

**For detailed setup, see** [`docs/MOBILE_SPEECH_APP_QUICKSTART.md`](./docs/MOBILE_SPEECH_APP_QUICKSTART.md)

---

## 💡 Key Features

### MVP (Version 1.0)
- 🎤 **Voice Input** - Natural language commands
- 🔊 **Voice Output** - Spoken responses
- 🤖 **Agent Management** - Create, pause, stop agents
- 📋 **Agent Monitoring** - Real-time status updates
- 📱 **Cross-Platform** - iOS + Android
- 🔔 **Push Notifications** - Agent completion alerts

### Planned (Version 1.1+)
- 🎙️ **Wake Word** - "Hey Claude" activation
- 🌍 **Multi-language** - Support for other languages
- 📝 **Conversation History** - Review past commands
- 🔧 **Agent Templates** - Pre-configured tasks
- ⚙️ **Advanced Settings** - Fine-tune voice & agents

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Mobile** | React Native + Expo | Cross-platform, fast iteration |
| **Language** | TypeScript | Type safety, better DX |
| **UI** | React Native Paper | Material Design components |
| **State** | Zustand | Lightweight state management |
| **Data** | TanStack Query | Server state management |
| **Speech** | Expo Speech APIs | On-device STT/TTS |
| **Backend** | Fastify + PostgreSQL | Fast, scalable API |
| **Real-time** | Pusher | WebSocket updates |
| **Hosting** | Vercel + Neon | Serverless, auto-scale |
| **CI/CD** | GitHub Actions + EAS | Automated builds |

---

## 📊 Project Timeline

### Phase 0: Planning (2 weeks) ✅ DONE
- [x] Research Cursor Agents (PR #35)
- [x] Define architecture
- [x] Create mockups
- [x] Write documentation

### Phase 1: Foundation (2 weeks)
- [ ] Set up React Native + Expo
- [ ] Create navigation structure
- [ ] Build UI component library
- [ ] Set up state management

### Phase 2: Speech (1 week)
- [ ] Integrate speech-to-text
- [ ] Integrate text-to-speech
- [ ] Build command parser
- [ ] Create voice interface

### Phase 3: Backend (1 week)
- [ ] Set up Fastify server
- [ ] Create database schema
- [ ] Implement auth (OAuth)
- [ ] Build agent API endpoints

### Phase 4: Integration (1 week)
- [ ] Connect to Anthropic API
- [ ] Add real-time updates
- [ ] Implement push notifications
- [ ] Error handling

### Phase 5: Polish (1 week)
- [ ] Testing & bug fixes
- [ ] Performance optimization
- [ ] App Store preparation
- [ ] Beta testing

### Phase 6: Launch 🚀
- [ ] App Store submission
- [ ] Documentation
- [ ] Marketing
- [ ] Launch!

**Total:** 6-8 weeks to MVP

---

## 🧪 Testing Strategy

```bash
# Unit tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint

# E2E tests (coming soon)
npm run test:e2e
```

---

## 🔗 Related Work

### PR #35: Cursor Agents Investigation

This project builds on research from **PR #35**, which reverse-engineered Cursor's agent platform:

- **What PR #35 did:** Analyzed cursor.com/agents web app
- **What we're doing:** Building the mobile app Cursor hinted at

See [`docs/BUILDING_ON_PR35.md`](./docs/BUILDING_ON_PR35.md) for detailed comparison.

---

## 🤝 Contributing

This project is currently in planning phase. Implementation will begin soon.

**Want to contribute?**
1. Read the architecture docs
2. Check the roadmap
3. Open an issue to discuss
4. Submit a PR

---

## 📄 License

TBD - To be determined based on API access permissions

---

## 🙏 Acknowledgments

- **Cursor** - For pioneering cloud-based AI agents
- **Anthropic** - For Claude and the Agent SDK
- **Expo** - For making mobile development accessible
- **PR #35 Contributors** - For the research foundation

---

## 📞 Contact

Questions? Feedback? Open an issue or discussion in the main repo.

---

## 🎬 Next Steps

1. **Read the quickstart:** [`docs/MOBILE_SPEECH_APP_QUICKSTART.md`](./docs/MOBILE_SPEECH_APP_QUICKSTART.md)
2. **Review the plan:** [`docs/MOBILE_SPEECH_AGENT_APP_PLAN.md`](./docs/MOBILE_SPEECH_AGENT_APP_PLAN.md)
3. **Explore mockups:** [`mocks/UI_WIREFRAMES.md`](./mocks/UI_WIREFRAMES.md)
4. **Study architecture:** [`architecture/ARCHITECTURE_DIAGRAMS.md`](./architecture/ARCHITECTURE_DIAGRAMS.md)
5. **Understand PR #35:** [`docs/BUILDING_ON_PR35.md`](./docs/BUILDING_ON_PR35.md)

---

**Status:** Planning Complete ✅ | Ready for Implementation 🚀

*Built with ❤️ for developers who code on the go*
