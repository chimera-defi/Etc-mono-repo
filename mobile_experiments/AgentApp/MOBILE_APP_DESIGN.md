# Mobile App Design: React Native + Expo

This document details the mobile app architecture, ensuring native performance and great UX.

## Table of Contents
1. [Core Principle](#core-principle)
2. [Screen Flow](#screen-flow)
3. [Screen Designs](#screen-designs)
4. [Performance Requirements](#performance-requirements)
5. [State Architecture](#state-architecture)
6. [Offline-First Design](#offline-first-design)
7. [Native Integrations](#native-integrations)
8. [Implementation Tasks](#implementation-tasks)
9. [Risks & Mitigations](#risks--mitigations)

---

## Core Principle

**This is a mobile-first product.** The backend exists to serve the mobile app, not the other way around.

The user experience on phone is:
1. Open app → see my projects
2. Tap project → start typing prompt
3. Watch agent work in real-time
4. See result, tap to view PR
5. Close app, get push notification when done

Everything else is secondary.

---

## Screen Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│    ┌─────────┐     ┌─────────────┐     ┌─────────────┐                 │
│    │  Splash │────►│    Login    │────►│   Projects  │                 │
│    │         │     │  (GitHub)   │     │    List     │                 │
│    └─────────┘     └─────────────┘     └──────┬──────┘                 │
│                                               │                         │
│                                               ▼                         │
│    ┌─────────┐     ┌─────────────┐     ┌─────────────┐                 │
│    │Settings │◄───►│    Chat     │◄───►│  Task       │                 │
│    │         │     │   Screen    │     │  History    │                 │
│    └─────────┘     └──────┬──────┘     └─────────────┘                 │
│                           │                                             │
│                           ▼                                             │
│                    ┌─────────────┐                                      │
│                    │   Result    │                                      │
│                    │  (PR/Diff)  │                                      │
│                    └─────────────┘                                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Screen Designs

### 1. Login Screen

**Purpose**: Sign in with GitHub

**Layout**:
```
┌────────────────────────┐
│                        │
│         LOGO           │
│                        │
│    ┌──────────────┐    │
│    │  Continue    │    │
│    │  with GitHub │    │
│    └──────────────┘    │
│                        │
│    Privacy Policy      │
│    Terms of Service    │
│                        │
└────────────────────────┘
```

**Interactions**:
- Tap "Continue with GitHub" → Opens in-app browser for OAuth
- OAuth completes → Navigate to Projects

**Performance**:
- Cold start to login button visible: < 1 second
- OAuth redirect must feel instant

---

### 2. Projects Screen

**Purpose**: List connected GitHub repos, quick access

**Layout**:
```
┌────────────────────────┐
│ Projects          [+]  │
├────────────────────────┤
│ ┌────────────────────┐ │
│ │ 🔵 my-app          │ │
│ │ Last: 2 hours ago  │ │
│ └────────────────────┘ │
│ ┌────────────────────┐ │
│ │ 🟢 api-server      │ │
│ │ Last: 1 day ago    │ │
│ └────────────────────┘ │
│ ┌────────────────────┐ │
│ │ ⚪ docs            │ │
│ │ Last: 3 days ago   │ │
│ └────────────────────┘ │
│                        │
│                        │
├────────────────────────┤
│  Projects  History ⚙️  │
└────────────────────────┘
```

**Interactions**:
- Tap project → Navigate to Chat
- Tap [+] → Add new repo (search GitHub)
- Swipe left → Delete project
- Pull down → Refresh list

**Performance**:
- List renders in < 100ms
- Scroll at 60fps even with 100+ projects (use FlashList)
- Swipe gesture at 60fps (react-native-gesture-handler)

---

### 3. Chat Screen (Primary Screen)

**Purpose**: Send prompts, view real-time agent progress

**Layout - Idle**:
```
┌────────────────────────┐
│ ← my-app         [···] │
├────────────────────────┤
│                        │
│                        │
│    Start by typing     │
│    what you want to    │
│    build or fix        │
│                        │
│                        │
│                        │
│                        │
├────────────────────────┤
│ ┌──────────────────┬─┐ │
│ │ Message...       │↑│ │
│ └──────────────────┴─┘ │
└────────────────────────┘
```

**Layout - Running Task**:
```
┌────────────────────────┐
│ ← my-app      ● RUNNING│
├────────────────────────┤
│ ┌────────────────────┐ │
│ │ 👤 Add dark mode   │ │
│ │    to settings     │ │
│ └────────────────────┘ │
│                        │
│ ┌────────────────────┐ │
│ │ 🤖 Understanding   │ │
│ │    the codebase... │ │
│ │                    │ │
│ │ ✓ Read App.tsx     │ │
│ │ ✓ Read theme.ts    │ │
│ │ → Writing dark.ts  │ │
│ │   ████████░░ 80%   │ │
│ └────────────────────┘ │
│                        │
├────────────────────────┤
│ [    Cancel Task     ] │
└────────────────────────┘
```

**Layout - Complete**:
```
┌────────────────────────┐
│ ← my-app      ✓ DONE   │
├────────────────────────┤
│ ┌────────────────────┐ │
│ │ 👤 Add dark mode   │ │
│ └────────────────────┘ │
│                        │
│ ┌────────────────────┐ │
│ │ 🤖 Done! Created   │ │
│ │    PR #42          │ │
│ │                    │ │
│ │ Files changed: 5   │ │
│ │ +127 / -23 lines   │ │
│ │                    │ │
│ │ [View PR on GitHub]│ │
│ │ [View Diff]        │ │
│ └────────────────────┘ │
│                        │
├────────────────────────┤
│ ┌──────────────────┬─┐ │
│ │ Message...       │↑│ │
│ └──────────────────┴─┘ │
└────────────────────────┘
```

**Interactions**:
- Type prompt + tap send → Start task
- Tap "Cancel Task" → Confirm dialog → Cancel
- Tap "View PR" → Open GitHub in browser
- Tap "View Diff" → Navigate to Diff screen
- Scroll through progress log (60fps)

**Real-time Updates**:
- WebSocket receives progress events
- UI updates immediately (< 50ms latency to screen)
- Smooth animated transitions between states
- Progress bar animates using `react-native-reanimated`

**Performance**:
- Messages render as they arrive (streaming)
- No jank during rapid updates
- Large message history uses virtualized list

---

### 4. Task History Screen

**Purpose**: View past tasks and results

**Layout**:
```
┌────────────────────────┐
│ History               │
├────────────────────────┤
│ Today                  │
│ ┌────────────────────┐ │
│ │ ✓ my-app          │ │
│ │   Add dark mode    │ │
│ │   2 hours ago      │ │
│ └────────────────────┘ │
│                        │
│ Yesterday              │
│ ┌────────────────────┐ │
│ │ ✗ api-server      │ │
│ │   Fix auth bug     │ │
│ │   Failed           │ │
│ └────────────────────┘ │
│ ┌────────────────────┐ │
│ │ ✓ api-server      │ │
│ │   Add rate limit   │ │
│ │   PR #38           │ │
│ └────────────────────┘ │
├────────────────────────┤
│  Projects  History ⚙️  │
└────────────────────────┘
```

**Interactions**:
- Tap task → View details (same as Chat result view)
- Swipe left → Delete from history

---

### 5. Settings Screen

**Purpose**: API key, preferences, account

**Layout**:
```
┌────────────────────────┐
│ Settings               │
├────────────────────────┤
│ ACCOUNT                │
│ ┌────────────────────┐ │
│ │ @username          │ │
│ │ Sign Out           │ │
│ └────────────────────┘ │
│                        │
│ API KEYS               │
│ ┌────────────────────┐ │
│ │ Claude API Key     │ │
│ │ sk-ant-••••••••    │ │
│ │ [Change]           │ │
│ └────────────────────┘ │
│                        │
│ PREFERENCES            │
│ ┌────────────────────┐ │
│ │ Default branch     │ │
│ │ > main             │ │
│ └────────────────────┘ │
│ ┌────────────────────┐ │
│ │ Task timeout       │ │
│ │ > 30 minutes       │ │
│ └────────────────────┘ │
├────────────────────────┤
│  Projects  History ⚙️  │
└────────────────────────┘
```

**Security**:
- API key shown masked (last 4 chars)
- Stored in secure storage (Keychain/Keystore)
- Never logged or sent to crash reporting

---

## Performance Requirements

### Target Metrics

| Metric | Target | How to Achieve |
|--------|--------|----------------|
| **Cold start** | < 2 seconds | Minimize bundle, lazy load screens |
| **Time to interactive** | < 1 second | Splash screen hides after auth check |
| **Frame rate** | 60 fps | Use native driver for animations |
| **Scroll performance** | 60 fps | FlashList, not FlatList |
| **Input latency** | < 100ms | Debounce, optimistic updates |
| **WebSocket latency** | < 200ms | Reconnect quickly, show stale indicator |

### Performance Techniques

1. **List Rendering**
   ```typescript
   // Use FlashList for large lists (task history)
   import { FlashList } from "@shopify/flash-list";
   
   <FlashList
     data={tasks}
     renderItem={renderTask}
     estimatedItemSize={80}
   />
   ```

2. **Animations**
   ```typescript
   // Use native driver (runs on UI thread)
   import Animated, { 
     useAnimatedStyle, 
     withTiming 
   } from 'react-native-reanimated';
   
   const animatedStyle = useAnimatedStyle(() => ({
     opacity: withTiming(isVisible ? 1 : 0, { duration: 200 }),
   }));
   ```

3. **Memoization**
   ```typescript
   // Memoize expensive components
   const TaskItem = React.memo(({ task }) => (
     <View>...</View>
   ));
   ```

4. **Lazy Loading**
   ```typescript
   // Lazy load non-critical screens
   const Settings = React.lazy(() => import('./screens/Settings'));
   ```

---

## State Architecture

### Zustand Stores

```typescript
// stores/auth.ts
interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

// stores/projects.ts
interface ProjectsStore {
  projects: Project[];
  selectedProject: Project | null;
  isLoading: boolean;
  fetchProjects: () => Promise<void>;
  selectProject: (id: string) => void;
  addProject: (repo: string) => Promise<void>;
  removeProject: (id: string) => Promise<void>;
}

// stores/tasks.ts
interface TasksStore {
  currentTask: Task | null;
  taskHistory: Task[];
  isRunning: boolean;
  progress: TaskProgress[];
  createTask: (prompt: string) => Promise<void>;
  cancelTask: () => Promise<void>;
  addProgress: (progress: TaskProgress) => void;
  setComplete: (result: TaskResult) => void;
}

// stores/websocket.ts
interface WebSocketStore {
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  subscribe: (taskId: string) => void;
  unsubscribe: (taskId: string) => void;
}
```

### Data Flow

```
User Action
    │
    ▼
┌─────────────┐
│   Screen    │ ◄──────────────────────────┐
│  Component  │                             │
└──────┬──────┘                             │
       │ calls                              │
       ▼                                    │
┌─────────────┐     ┌─────────────┐        │
│   Zustand   │────►│   React     │────────┘
│    Store    │     │   Re-render │
└──────┬──────┘     └─────────────┘
       │ 
       │ HTTP or WebSocket
       ▼
┌─────────────┐
│   Server    │
└─────────────┘
```

---

## Offline-First Design

### Principle
The app should work (with limited functionality) even when offline.

### Offline Capabilities

| Feature | Online | Offline |
|---------|--------|---------|
| View projects | ✅ Live | ✅ Cached |
| View task history | ✅ Live | ✅ Cached |
| Start new task | ✅ Works | 📝 Queued |
| View progress | ✅ Real-time | ❌ N/A |
| Cancel task | ✅ Works | ❌ N/A |

### Implementation

```typescript
// hooks/useOfflineQueue.ts
interface QueuedAction {
  id: string;
  type: 'CREATE_TASK';
  payload: { projectId: string; prompt: string };
  createdAt: Date;
}

const useOfflineQueue = () => {
  const [queue, setQueue] = useState<QueuedAction[]>([]);
  const isOnline = useNetworkStatus();

  useEffect(() => {
    if (isOnline && queue.length > 0) {
      processQueue();
    }
  }, [isOnline]);

  const addToQueue = (action: QueuedAction) => {
    setQueue(prev => [...prev, action]);
    persistQueue([...queue, action]); // AsyncStorage
  };

  const processQueue = async () => {
    for (const action of queue) {
      await executeAction(action);
      removeFromQueue(action.id);
    }
  };

  return { addToQueue, queue, isOnline };
};
```

### UI Feedback

- Show banner when offline: "You're offline. Tasks will be queued."
- Show queue count: "2 tasks waiting to sync"
- Animate when coming back online and syncing

---

## Native Integrations

### Required Expo Modules

| Module | Purpose |
|--------|---------|
| `expo-secure-store` | Store API keys securely |
| `expo-auth-session` | GitHub OAuth |
| `expo-linking` | Deep links to PRs |
| `expo-notifications` | Push notifications (future) |
| `expo-haptics` | Haptic feedback on actions |
| `expo-clipboard` | Copy PR links |

### Haptic Feedback

```typescript
import * as Haptics from 'expo-haptics';

// Task completed
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

// Task failed
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

// Button press
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
```

### Deep Linking

```typescript
// app.config.js
{
  "expo": {
    "scheme": "agentapp",
    // Allows: agentapp://task/123
  }
}

// Handle incoming link
Linking.addEventListener('url', ({ url }) => {
  const { path, queryParams } = Linking.parse(url);
  if (path === 'task') {
    navigateToTask(queryParams.id);
  }
});
```

---

## Implementation Tasks

### Phase 8: Mobile App (Day 11-14)

| ID | Task | Hours | Dependencies | Priority |
|----|------|-------|--------------|----------|
| 8.1 | Initialize Expo project | 1 | None | P0 |
| 8.2 | Configure navigation (React Navigation) | 2 | 8.1 | P0 |
| 8.3 | Set up Zustand stores (auth, projects, tasks) | 2 | 8.1 | P0 |
| 8.4 | Implement Login screen + GitHub OAuth | 4 | 8.2, 8.3 | P0 |
| 8.5 | Implement Projects screen | 3 | 8.4 | P0 |
| 8.6 | Implement Chat screen (basic) | 4 | 8.5 | P0 |
| 8.7 | Implement WebSocket client | 3 | 8.6 | P0 |
| 8.8 | Implement real-time progress updates | 4 | 8.7 | P0 |
| 8.9 | Implement Task History screen | 3 | 8.5 | P1 |
| 8.10 | Implement Settings screen | 2 | 8.4 | P1 |
| 8.11 | Implement offline queue | 3 | 8.7 | P1 |
| 8.12 | Add animations (progress, transitions) | 4 | 8.8 | P1 |
| 8.13 | Add haptic feedback | 1 | 8.6 | P2 |
| 8.14 | Performance optimization | 3 | All above | P1 |
| 8.15 | Testing on iOS and Android | 4 | All above | P0 |

**Total: ~43 hours (5-6 days)**

---

## Risks & Mitigations

### Risk 1: WebSocket Reliability on Mobile

**Risk**: Mobile networks are unreliable; WebSocket disconnects frequently

**Likelihood**: High
**Impact**: High (user misses updates)

**Mitigations**:
1. Aggressive reconnection (exponential backoff, max 30s)
2. "Reconnecting..." UI indicator
3. Fetch missed updates via REST on reconnect
4. Server tracks last-seen event per client

---

### Risk 2: App Killed While Task Running

**Risk**: User switches apps, iOS/Android kills app, misses result

**Likelihood**: High
**Impact**: Medium

**Mitigations**:
1. Push notifications for task completion (Phase 2)
2. Fetch task status on app resume
3. Background fetch to update cache (iOS)

---

### Risk 3: Large Diff Rendering

**Risk**: Task produces 10,000+ line diff, app freezes

**Likelihood**: Low
**Impact**: High

**Mitigations**:
1. Limit displayed diff to first 500 lines
2. "Show full diff" button opens in browser
3. Virtualized diff viewer if needed

---

### Risk 4: API Key Leakage

**Risk**: Key exposed via logging, crash reports, screenshots

**Likelihood**: Low
**Impact**: Critical

**Mitigations**:
1. Never log keys (strip from error reports)
2. Mask in UI (show last 4 chars only)
3. Use `expo-secure-store` (Keychain/Keystore)
4. Clear key from memory when not needed

---

### Risk 5: OAuth Token Expiration

**Risk**: GitHub token expires, API calls fail

**Likelihood**: Medium
**Impact**: Medium

**Mitigations**:
1. Check token expiry on app resume
2. Refresh token silently if valid refresh token
3. If refresh fails, prompt re-login gracefully
4. Clear error message: "Please sign in again"

---

## File Structure

```
agent-app/
├── app.json
├── babel.config.js
├── tsconfig.json
├── package.json
├── App.tsx                      # Entry point
├── src/
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── ProjectsScreen.tsx
│   │   ├── ChatScreen.tsx
│   │   ├── HistoryScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── DiffScreen.tsx
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── TaskItem.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── ProgressIndicator.tsx
│   │   ├── OfflineBanner.tsx
│   │   └── LoadingSpinner.tsx
│   ├── stores/
│   │   ├── auth.ts
│   │   ├── projects.ts
│   │   ├── tasks.ts
│   │   └── websocket.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useWebSocket.ts
│   │   ├── useOfflineQueue.ts
│   │   └── useNetworkStatus.ts
│   ├── services/
│   │   ├── api.ts               # REST client
│   │   ├── websocket.ts         # WebSocket client
│   │   └── secureStorage.ts     # Keychain wrapper
│   ├── navigation/
│   │   └── Navigator.tsx
│   ├── theme/
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   └── spacing.ts
│   └── utils/
│       ├── formatting.ts
│       └── validation.ts
├── assets/
│   ├── icon.png
│   ├── splash.png
│   └── adaptive-icon.png
└── __tests__/
    ├── screens/
    └── components/
```

---

## Dependencies

```json
{
  "dependencies": {
    "expo": "~54.0.0",
    "expo-auth-session": "~6.0.0",
    "expo-clipboard": "~7.0.0",
    "expo-haptics": "~14.0.0",
    "expo-linking": "~7.0.0",
    "expo-secure-store": "~14.0.0",
    "react": "18.3.1",
    "react-native": "0.76.x",
    "@react-navigation/native": "^7.0.0",
    "@react-navigation/native-stack": "^7.0.0",
    "@react-navigation/bottom-tabs": "^7.0.0",
    "react-native-reanimated": "~3.16.0",
    "react-native-gesture-handler": "~2.20.0",
    "react-native-safe-area-context": "4.12.0",
    "react-native-screens": "~4.0.0",
    "@shopify/flash-list": "1.7.1",
    "zustand": "^5.0.0",
    "@tanstack/react-query": "^5.0.0"
  }
}
```

---

## Open Questions for Mobile

| # | Question | Recommendation |
|---|----------|----------------|
| M1 | Support tablets? | No for MVP (phone-only) |
| M2 | Dark mode? | Yes, follow system preference |
| M3 | Minimum iOS/Android version? | iOS 15+, Android 10+ |
| M4 | Push notifications in MVP? | No, add in Phase 2 |
| M5 | Biometric unlock for API key? | Nice-to-have, not MVP |

---

**Document Status**: Draft for Review
**Last Updated**: December 2025
