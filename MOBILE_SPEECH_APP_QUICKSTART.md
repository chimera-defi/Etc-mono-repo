# Voice Agent Mobile App - Quick Start Guide

## 🚀 From Zero to Running App in 30 Minutes

This guide will help you set up and run the voice-enabled AI agent mobile app.

---

## Prerequisites

### Required Tools
- **Node.js 20+** - [Download](https://nodejs.org/)
- **npm or yarn** - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)
- **Expo Go App** - Install on your phone:
  - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
  - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Optional (for production builds)
- **Xcode** (macOS only) - For iOS builds
- **Android Studio** - For Android builds
- **Expo Account** - [Sign up free](https://expo.dev/)

---

## Step 1: Create the Project (5 minutes)

```bash
# Create new Expo app with TypeScript
npx create-expo-app@latest voice-agent-app --template expo-template-blank-typescript

# Navigate to project
cd voice-agent-app

# Install dependencies
npm install
```

### Install Required Packages

```bash
# Navigation
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context

# State Management
npm install zustand

# API Client
npm install @tanstack/react-query

# Speech (core feature)
npm install expo-speech
# Note: expo-speech-recognition is in preview, we'll add it separately

# Storage
npm install @react-native-async-storage/async-storage
npm install expo-secure-store

# Auth
npm install expo-auth-session expo-web-browser

# UI Components (choose one)
npm install react-native-paper  # Material Design
# OR
npm install @tamagui/core @tamagui/config  # Modern, performant

# Utils
npm install date-fns
npm install react-native-uuid
```

### Install Dev Dependencies

```bash
npm install --save-dev @types/react @types/react-native
npm install --save-dev eslint prettier
npm install --save-dev @testing-library/react-native jest
```

---

## Step 2: Project Structure Setup (5 minutes)

Create the folder structure:

```bash
mkdir -p src/{components,screens,services,hooks,store,types,utils,config,navigation}
mkdir -p src/components/{common,voice,agents,layout}
mkdir -p src/screens/{auth,voice,agents,repositories,settings}
mkdir -p src/services/{speech,api,storage,realtime}
mkdir -p src/store/slices
```

---

## Step 3: Configuration Files (5 minutes)

### app.json

Update your `app.json`:

```json
{
  "expo": {
    "name": "Voice Agent",
    "slug": "voice-agent-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#000000"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.voiceagent",
      "infoPlist": {
        "NSMicrophoneUsageDescription": "We need microphone access for voice commands to control your AI agents.",
        "NSSpeechRecognitionUsageDescription": "We need speech recognition to convert your voice to text commands."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#000000"
      },
      "package": "com.yourcompany.voiceagent",
      "permissions": ["RECORD_AUDIO", "INTERNET"]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      [
        "expo-build-properties",
        {
          "ios": {
            "deploymentTarget": "14.0"
          },
          "android": {
            "minSdkVersion": 23
          }
        }
      ]
    ]
  }
}
```

### tsconfig.json

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### .eslintrc.js

```javascript
module.exports = {
  extends: ['expo', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
  },
};
```

---

## Step 4: Create Core Services (10 minutes)

### Speech Recognition Service (Simple Version)

Since expo-speech-recognition is in preview, we'll create a simple wrapper:

```typescript
// src/services/speech/SpeechRecognitionService.ts

export class SpeechRecognitionService {
  private isListening = false;

  async startListening(onTranscript: (text: string) => void) {
    // For MVP, we'll use a text input as fallback
    // In production, integrate with platform-specific APIs
    console.log('Speech recognition started');
    this.isListening = true;

    // TODO: Integrate actual speech recognition
    // For now, this is a placeholder
  }

  stopListening() {
    console.log('Speech recognition stopped');
    this.isListening = false;
  }

  getIsListening() {
    return this.isListening;
  }
}

export const speechRecognition = new SpeechRecognitionService();
```

### Text-to-Speech Service

```typescript
// src/services/speech/TextToSpeechService.ts

import * as Speech from 'expo-speech';

export class TextToSpeechService {
  async speak(text: string) {
    await Speech.speak(text, {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.9,
    });
  }

  async stop() {
    await Speech.stop();
  }
}

export const textToSpeech = new TextToSpeechService();
```

### Command Parser

```typescript
// src/services/speech/CommandParser.ts

export interface VoiceCommand {
  intent: string;
  action?: string;
  parameters: Record<string, any>;
}

export class CommandParser {
  parse(text: string): VoiceCommand {
    const lower = text.toLowerCase();

    if (lower.includes('list') || lower.includes('show')) {
      return {
        intent: 'list_agents',
        action: 'list',
        parameters: {},
      };
    }

    if (lower.includes('start') || lower.includes('create')) {
      return {
        intent: 'create_agent',
        action: 'start',
        parameters: {
          task: text,
        },
      };
    }

    return {
      intent: 'unknown',
      parameters: {},
    };
  }
}

export const commandParser = new CommandParser();
```

---

## Step 5: Create State Store (5 minutes)

```typescript
// src/store/index.ts

import { create } from 'zustand';

interface AppState {
  // Speech
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;

  // Actions
  setListening: (value: boolean) => void;
  setSpeaking: (value: boolean) => void;
  setTranscript: (text: string) => void;
  speak: (text: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  isListening: false,
  isSpeaking: false,
  transcript: '',

  setListening: (value) => set({ isListening: value }),
  setSpeaking: (value) => set({ isSpeaking: value }),
  setTranscript: (text) => set({ transcript: text }),

  speak: async (text) => {
    set({ isSpeaking: true });
    const { textToSpeech } = require('@/services/speech/TextToSpeechService');
    await textToSpeech.speak(text);
    set({ isSpeaking: false });
  },
}));
```

---

## Step 6: Create Voice Interface Screen (10 minutes)

```typescript
// src/screens/voice/VoiceInterfaceScreen.tsx

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppStore } from '@/store';
import { commandParser } from '@/services/speech/CommandParser';

export function VoiceInterfaceScreen() {
  const [input, setInput] = useState('');
  const { speak, isSpeaking } = useAppStore();

  const handleSubmit = async () => {
    if (!input.trim()) return;

    // Parse command
    const command = commandParser.parse(input);

    // Mock response
    let response = '';
    if (command.intent === 'list_agents') {
      response = 'You have 2 agents running. One on wallet-frontend and one on api-service.';
    } else if (command.intent === 'create_agent') {
      response = 'I\'ve started a new agent. It\'s working on your task now.';
    } else {
      response = 'I didn\'t understand that command. Try saying "list my agents" or "start an agent".';
    }

    // Speak response
    await speak(response);

    setInput('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Assistant</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type or speak a command..."
          placeholderTextColor="#666"
          multiline
        />
      </View>

      <TouchableOpacity
        style={[styles.button, isSpeaking && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={isSpeaking}
      >
        <Text style={styles.buttonText}>
          {isSpeaking ? 'Speaking...' : 'Send Command'}
        </Text>
      </TouchableOpacity>

      <View style={styles.suggestions}>
        <Text style={styles.suggestionsTitle}>Try saying:</Text>
        <Text style={styles.suggestionText}>• "List my agents"</Text>
        <Text style={styles.suggestionText}>• "Start an agent to add dark mode"</Text>
        <Text style={styles.suggestionText}>• "Show running agents"</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 60,
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  input: {
    color: '#fff',
    fontSize: 16,
    minHeight: 100,
  },
  button: {
    backgroundColor: '#0066ff',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#333',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  suggestions: {
    marginTop: 40,
  },
  suggestionsTitle: {
    color: '#888',
    fontSize: 14,
    marginBottom: 12,
  },
  suggestionText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 8,
  },
});
```

---

## Step 7: Update App.tsx (5 minutes)

```typescript
// App.tsx

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { VoiceInterfaceScreen } from './src/screens/voice/VoiceInterfaceScreen';

const queryClient = new QueryClient();

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <VoiceInterfaceScreen />
        <StatusBar style="light" />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
```

---

## Step 8: Run the App! 🎉

### Development Mode (Fastest)

```bash
# Start Expo dev server
npm start

# Or use specific platform
npm run ios      # Opens iOS simulator (macOS only)
npm run android  # Opens Android emulator
npm run web      # Opens in browser
```

### Test on Your Phone

1. **Start the dev server:**
   ```bash
   npm start
   ```

2. **Scan the QR code:**
   - iOS: Open Camera app, scan QR code
   - Android: Open Expo Go app, scan QR code

3. **Try voice commands:**
   - Type: "List my agents"
   - Your phone will speak the response!

---

## Step 9: Test Speech Features

### Enable Text-to-Speech

The app already has TTS working! Try these:

1. Type "list my agents" → Submit
2. Your phone will speak: "You have 2 agents running..."

### Add Speech-to-Text (Optional)

For real speech recognition, you'll need to integrate platform-specific APIs:

**iOS:**
- Use `expo-speech-recognition` (preview)
- Or integrate `react-native-voice`

**Android:**
- Use `expo-speech-recognition` (preview)
- Or integrate `@react-native-voice/voice`

**Quick test without speech recognition:**
For now, the text input serves as a voice command input simulator.

---

## Next Steps

### Phase 1: Enhanced UI (1-2 hours)
- [ ] Add navigation (tabs)
- [ ] Create agents list screen
- [ ] Add loading states
- [ ] Improve styling

### Phase 2: API Integration (2-3 hours)
- [ ] Set up backend proxy (optional)
- [ ] Integrate Anthropic API
- [ ] Add agent CRUD operations
- [ ] Handle errors properly

### Phase 3: Real Speech (2-3 hours)
- [ ] Integrate expo-speech-recognition
- [ ] Add voice button with waveform
- [ ] Implement continuous listening
- [ ] Add voice feedback sounds

### Phase 4: Advanced Features (ongoing)
- [ ] Push notifications
- [ ] Real-time agent updates
- [ ] Agent logs viewer
- [ ] Settings screen

---

## Troubleshooting

### Issue: "Module not found"

```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npx expo start --clear
```

### Issue: Speech not working on iOS simulator

Speech-to-text doesn't work on simulators. Test on a real device.

### Issue: "Network request failed"

Check your API endpoint configuration in `src/config/api.config.ts`

---

## Project Structure Reference

```
voice-agent-app/
├── App.tsx                    # Root component
├── app.json                   # Expo config
├── package.json
├── tsconfig.json
│
├── src/
│   ├── components/           # Reusable components
│   │   ├── common/
│   │   ├── voice/
│   │   └── agents/
│   │
│   ├── screens/              # Screen components
│   │   ├── voice/
│   │   │   └── VoiceInterfaceScreen.tsx  ← START HERE
│   │   ├── agents/
│   │   └── settings/
│   │
│   ├── services/             # Business logic
│   │   ├── speech/
│   │   │   ├── TextToSpeechService.ts    ← WORKING
│   │   │   ├── SpeechRecognitionService.ts
│   │   │   └── CommandParser.ts          ← WORKING
│   │   └── api/
│   │
│   ├── store/                # State management
│   │   └── index.ts          ← WORKING
│   │
│   └── types/                # TypeScript types
│
└── assets/                   # Images, icons, etc.
```

---

## Development Workflow

### Daily Development

```bash
# 1. Start dev server
npm start

# 2. Open on device/simulator
# Scan QR or press 'i' for iOS, 'a' for Android

# 3. Make changes → Auto-reload

# 4. Test → Iterate
```

### Before Committing

```bash
# Type check
npx tsc --noEmit

# Lint
npm run lint

# Format
npm run format

# Test
npm test
```

---

## Build for Production

### Using Expo EAS

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

---

## Resources

### Documentation
- **Expo Docs:** https://docs.expo.dev/
- **React Navigation:** https://reactnavigation.org/
- **Expo Speech:** https://docs.expo.dev/versions/latest/sdk/speech/
- **Zustand:** https://docs.pmnd.rs/zustand

### Community
- **Expo Discord:** https://chat.expo.dev/
- **React Native Discord:** https://discord.gg/reactnative

### Learning
- **Expo Tutorial:** https://docs.expo.dev/tutorial/introduction/
- **React Native Express:** https://www.reactnative.express/

---

## What You've Built

After following this guide, you have:

✅ A working React Native app with Expo
✅ Text-to-Speech working (your phone talks!)
✅ Command parser (understands basic commands)
✅ State management with Zustand
✅ TypeScript for type safety
✅ Clean project structure
✅ Ready to add real features

**Time spent:** ~30 minutes
**What works:** TTS, command parsing, basic UI
**Next:** Add real speech recognition and API integration

---

## Quick Commands Reference

```bash
# Start dev server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Clear cache
npx expo start --clear

# Install package
npm install <package>

# Build for production
eas build --platform all

# Check types
npx tsc --noEmit
```

---

**Happy coding! 🚀**

Need help? Check the full documentation:
- `MOBILE_SPEECH_AGENT_APP_PLAN.md` - Full feature roadmap
- `MOBILE_SPEECH_APP_ARCHITECTURE.md` - Technical architecture
