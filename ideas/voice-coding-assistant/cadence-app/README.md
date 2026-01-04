# Cadence Mobile App

> **Voice-enabled AI coding assistant for iOS and Android**

Built with React Native + Expo, featuring voice input, real-time agent monitoring, and push notifications.

## Prerequisites

- Node.js 20+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Xcode) or Android Emulator
- Physical device for voice testing

## Setup

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on iOS Simulator
npx expo start --ios

# Run on Android Emulator
npx expo start --android

# Run on physical device
# Scan QR code with Expo Go app
```

## Environment Variables

Create `app.config.js` or use `.env` with expo-constants:

```javascript
// app.config.js
export default {
  extra: {
    apiUrl: process.env.API_URL || 'http://localhost:8080',
    githubClientId: process.env.GITHUB_CLIENT_ID,
  }
};
```

## Project Structure

```
cadence-app/
├── src/
│   ├── app/                  # Expo Router screens
│   │   ├── (tabs)/
│   │   │   ├── index.tsx     # Voice (Home)
│   │   │   ├── agents.tsx    # Agent list
│   │   │   └── settings.tsx  # Settings
│   │   ├── agent/[id].tsx    # Agent detail
│   │   ├── login.tsx         # Login screen
│   │   └── _layout.tsx       # Root layout
│   ├── components/
│   │   ├── common/           # Button, Card, etc.
│   │   ├── voice/            # VoiceButton, Waveform
│   │   └── agents/           # AgentCard, AgentList
│   ├── services/
│   │   ├── api.ts            # API client
│   │   ├── auth.ts           # Auth service
│   │   └── voice/
│   │       ├── AudioRecorder.ts
│   │       ├── WhisperSTT.ts
│   │       └── TTS.ts
│   ├── stores/
│   │   ├── authStore.ts      # Zustand auth
│   │   ├── agentStore.ts     # Zustand agents
│   │   └── voiceStore.ts     # Zustand voice
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useAgents.ts
│   │   └── useVoice.ts
│   ├── types/
│   │   └── index.ts
│   └── constants/
│       └── config.ts
├── assets/
│   ├── icon.png              # App icon
│   └── splash.png            # Splash screen
├── app.json
├── package.json
└── README.md
```

## Features

### Voice Interface
- **Recording:** Hold button to record voice command
- **Transcription:** OpenAI Whisper API (98% accuracy)
- **Context Injection:** Improves accuracy with codebase keywords
- **TTS Responses:** Spoken confirmations and status updates

### Agent Management
- **Create Agents:** Via voice or text
- **Monitor Progress:** Real-time status updates
- **Control:** Pause, resume, cancel agents
- **View Logs:** See what the agent is doing

### Authentication
- **GitHub OAuth:** PKCE flow for security
- **Secure Storage:** expo-secure-store for tokens
- **Auto-refresh:** Seamless token renewal

## Scripts

```bash
npx expo start       # Start dev server
npx expo start --ios # Run on iOS
npx expo start --android # Run on Android
npm run lint         # Run ESLint
npm run type-check   # TypeScript check
npm test             # Run Jest tests
```

## Testing Voice Features

**Important:** Voice features MUST be tested on real devices.

1. Install Expo Go on your phone
2. Scan QR code from `npx expo start`
3. Test voice recording in a quiet environment
4. Test with background noise
5. Test with different speaking speeds

## Building for Production

```bash
# Configure EAS
npx eas build:configure

# Build for iOS
npx eas build --platform ios --profile preview

# Build for Android
npx eas build --platform android --profile preview
```

## Tech Stack

- **Framework:** React Native + Expo SDK 52
- **Navigation:** React Navigation 7
- **State:** Zustand 4
- **Data Fetching:** TanStack Query v5
- **Voice:** expo-av, expo-speech
- **Storage:** expo-secure-store

---

**Status:** Not Started
**Sprint:** 2-3 (Weeks 2-4)
**Owner:** Mobile Shell Agent + Voice Agent
