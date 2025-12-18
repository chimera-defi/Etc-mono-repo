# Voice-Enabled AI Agent Mobile App

> A cross-platform mobile application for interacting with AI coding agents (Cursor Agents or Anthropic Claude Code) using voice commands.

## 🎯 Vision

Enable developers to manage their AI coding agents hands-free using natural voice commands. Check agent status while commuting, start new agents while walking, and receive spoken updates about your code - all without touching a keyboard.

## ✨ Key Features

### MVP (Version 1.0)
- 🎤 **Voice Input** - Natural language commands via speech-to-text
- 🔊 **Voice Output** - Spoken responses via text-to-speech
- 🤖 **Agent Management** - List, create, pause, and stop AI agents
- 📱 **Cross-Platform** - iOS and Android from single codebase
- 🔐 **Secure Auth** - OAuth 2.0 with PKCE for mobile
- 🔔 **Push Notifications** - Get notified when agents complete tasks

### Example Voice Commands

```
"What's the status of my agents?"
"Start an agent on wallet-frontend to add dark mode"
"Pause the wallet agent"
"Show me completed agents"
```

## 🏗️ Architecture Overview

```
Mobile App (React Native + Expo)
         ↓
Backend Proxy (Optional - Node.js/Fastify)
         ↓
AI Agent APIs (Cursor/Anthropic/OpenAI)
```

**Tech Stack:**
- **Frontend:** React Native + Expo SDK 52
- **Language:** TypeScript (strict mode)
- **State:** Zustand
- **API Client:** TanStack Query v5
- **Speech:** expo-speech + expo-speech-recognition
- **Backend:** Fastify + PostgreSQL (optional proxy)

## 📚 Documentation

This project includes comprehensive planning and architecture documentation:

| Document | Purpose | Read Time |
|----------|---------|-----------|
| **[MOBILE_SPEECH_APP_QUICKSTART.md](./MOBILE_SPEECH_APP_QUICKSTART.md)** | Get started in 30 minutes | 10 min |
| **[MOBILE_SPEECH_AGENT_APP_PLAN.md](./MOBILE_SPEECH_AGENT_APP_PLAN.md)** | Complete feature roadmap & planning | 30 min |
| **[MOBILE_SPEECH_APP_ARCHITECTURE.md](./MOBILE_SPEECH_APP_ARCHITECTURE.md)** | Detailed technical architecture | 45 min |
| **[CURSOR_AGENTS_ANALYSIS.md](./CURSOR_AGENTS_ANALYSIS.md)** | Cursor agents platform analysis | 15 min |
| **[MOBILE_APP_REVERSE_ENGINEERING.md](./MOBILE_APP_REVERSE_ENGINEERING.md)** | Mobile app implementation notes | 20 min |

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn
- Expo Go app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Get Running in 5 Minutes

```bash
# Create project
npx create-expo-app@latest voice-agent-app --template expo-template-blank-typescript
cd voice-agent-app

# Install dependencies
npm install @react-navigation/native zustand @tanstack/react-query expo-speech

# Start dev server
npm start

# Scan QR code with Expo Go app
```

**For detailed setup instructions, see [MOBILE_SPEECH_APP_QUICKSTART.md](./MOBILE_SPEECH_APP_QUICKSTART.md)**

## 🎙️ Speech Integration

### Text-to-Speech (Built-in)

```typescript
import * as Speech from 'expo-speech';

Speech.speak('Your agent has finished!', {
  language: 'en-US',
  pitch: 1.0,
  rate: 0.9,
});
```

### Speech-to-Text (Coming Soon)

```typescript
import * as SpeechRecognition from 'expo-speech-recognition';

const { transcript } = await SpeechRecognition.start({
  language: 'en-US',
  continuous: true,
});
```

## 🔌 API Integration Options

### Option 1: Anthropic Claude API (Recommended)
- ✅ Official, documented API
- ✅ Stable and supported
- ✅ No ToS concerns

### Option 2: Cursor Agents API
- ⚠️ Reverse-engineered, undocumented
- ⚠️ Requires permission from Cursor
- ⚠️ May change without notice

### Option 3: OpenAI Assistants API
- ✅ Official API
- ✅ Similar agent capabilities
- ✅ Good alternative

**Current Recommendation:** Build with generic interface supporting all three, start with Anthropic.

## 📱 Platform Support

| Platform | Status | Notes |
|----------|--------|-------|
| **iOS** | ✅ Supported | Requires iOS 14+ |
| **Android** | ✅ Supported | Requires Android 6.0+ (API 23) |
| **Web** | 🟡 Limited | Voice features limited in browsers |

## 🔐 Security & Privacy

- **On-Device Speech** - Voice data processed locally by default
- **Secure Storage** - API keys stored in Expo SecureStore
- **OAuth 2.0 + PKCE** - Industry-standard mobile auth
- **No Voice Logging** - Audio not recorded or transmitted (unless user opts into cloud STT)

## 📊 Project Status

**Current Phase:** 📝 Planning & Architecture (Complete)
**Next Phase:** 🏗️ Implementation (Ready to start)

### Roadmap

- [x] **Phase 0:** Research & Planning (2 weeks) ✅
  - [x] Analyze Cursor Agents architecture
  - [x] Design mobile app architecture
  - [x] Define voice interaction patterns
  - [x] Document technical specifications

- [ ] **Phase 1:** Foundation (Week 1-2)
  - [ ] Set up React Native + Expo project
  - [ ] Implement navigation
  - [ ] Create UI component library
  - [ ] Set up state management

- [ ] **Phase 2:** Speech Integration (Week 2-3)
  - [ ] Text-to-speech implementation
  - [ ] Speech-to-text integration
  - [ ] Voice command parser
  - [ ] Voice UI/UX

- [ ] **Phase 3:** API Integration (Week 3-4)
  - [ ] Backend proxy setup (if needed)
  - [ ] API client implementation
  - [ ] Agent CRUD operations
  - [ ] Real-time updates

- [ ] **Phase 4:** Core Features (Week 4-5)
  - [ ] Agents list & detail screens
  - [ ] Create agent flow
  - [ ] Agent controls (pause/stop/resume)
  - [ ] Push notifications

- [ ] **Phase 5:** Polish & Launch (Week 5-6)
  - [ ] Testing & bug fixes
  - [ ] Performance optimization
  - [ ] App Store submission
  - [ ] Launch! 🚀

## 💰 Cost Estimate

### Development
- **Time:** 6-8 weeks full-time
- **Team:** 1 developer + 1 designer

### Infrastructure (Monthly)
- **Free Tier:** $0 (using on-device speech, direct API)
- **With Backend:** $20-50 (Vercel + database)
- **Enhanced Voice:** $36+ (cloud STT/TTS)

**Recommendation:** Start free, upgrade based on user feedback.

## 🧪 Testing Strategy

```bash
# Unit tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint

# E2E tests (Detox)
npm run test:e2e
```

## 🚢 Deployment

### Development Builds
```bash
npx expo start
```

### Production Builds (Expo EAS)
```bash
# iOS
eas build --platform ios

# Android
eas build --platform android

# Submit to stores
eas submit --platform all
```

## 📈 Success Metrics

- **Engagement:** 70%+ weekly active usage
- **Voice Accuracy:** 80%+ successful command recognition
- **Performance:** <2s latency for voice → action
- **Retention:** 50%+ Day 7 retention
- **Rating:** 4+ stars on app stores

## 🤝 Contributing

This is currently a planning/design document. Implementation will begin soon.

**Interested in contributing?** Check out the architecture docs and reach out!

## 🔗 Related Projects

- **Cursor Agents** - cursor.com/agents - Cloud-based AI coding agents
- **Anthropic Claude** - claude.ai - Advanced AI assistant
- **Claude Code** - CLI tool for Claude (what we're building mobile access for)

## 📄 License

TBD - To be determined based on API access permissions

## 🙏 Acknowledgments

- **Cursor** - For building amazing agent infrastructure (analyzed in PR #35)
- **Anthropic** - For Claude and the Agent SDK
- **Expo** - For making mobile development accessible

## 📞 Contact

Questions or feedback? Open an issue or discussion in this repository.

---

## 🎬 What's Next?

1. **Review the documentation** - Start with [QUICKSTART guide](./MOBILE_SPEECH_APP_QUICKSTART.md)
2. **Validate the approach** - Review [ARCHITECTURE docs](./MOBILE_SPEECH_APP_ARCHITECTURE.md)
3. **Decision point:** API access strategy (Cursor vs Anthropic vs Generic)
4. **Begin implementation** - Follow the roadmap in [PLAN doc](./MOBILE_SPEECH_AGENT_APP_PLAN.md)

---

**Built with ❤️ for developers who code on the go**

*Current Status: Planning Complete ✅ | Ready for Implementation 🚀*
