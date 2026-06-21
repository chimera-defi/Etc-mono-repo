# Reverse Engineering Cursor Agents as a Mobile App

## What We Know From Analysis

### Discovered API Endpoints
```
POST /api/auth/login
POST /api/auth/startBackgroundComposerFromSnapshot
POST /api/auth/startParallelAgentWorkflow
POST /api/auth/addAsyncFollowupBackgroundComposer
POST /api/auth/notifyBackgroundComposerShown
POST /api/auth/registerPushNotificationToken
GET  /api/auth/list-jwt-public-keys
POST /api/background-composer/get-detailed-composer
POST /api/background-composer/pause
POST /api/dashboard/get-user-privacy-mode
POST /api/dashboard/set-user-privacy-mode
```

### Data Models (from protobuf analysis)
The code uses Protocol Buffers (protobuf) for message serialization. Key types found:
- `BackgroundComposer` - Agent instance
- `PrivacyMode` - User privacy settings
- `Source` enum: `WEBSITE`, `IOS_APP`
- `Status` enum: `UNSPECIFIED`, `CREATING`, `RUNNING`, `FINISHED`, `ERROR`, `EXPIRED`

### Authentication Flow
1. Login via WorkOS (enterprise SSO) or cursor.sh authenticator
2. JWT tokens with RS256 signing
3. Public keys fetched from `/api/auth/list-jwt-public-keys`
4. Request IDs tracked via `x-request-id` header

### Real-time Updates
- Pusher WebSockets for live agent status updates
- Push notifications supported (endpoint exists)

---

## What It Would Take to Build a Mobile App

### Option 1: React Native / Expo (Easiest)
**Time estimate: 2-4 weeks for MVP**

**Pros:**
- Can reuse much of the existing React code logic
- Same API patterns (fetch, React Query)
- Cross-platform (iOS + Android)

**Required work:**
1. **Authentication** - Implement OAuth flow with WorkOS
2. **API Client** - Port the fetch calls to React Native
3. **Real-time** - Integrate Pusher React Native SDK
4. **UI Components** - Rebuild UI with React Native components

```
npm install @react-navigation/native pusher-js @tanstack/react-query
```

### Option 2: Native Swift (iOS) / Kotlin (Android)
**Time estimate: 4-8 weeks per platform**

**Pros:**
- Best performance and native feel
- Full control over push notifications

**Cons:**
- Need to implement everything from scratch
- Two separate codebases

### Option 3: Flutter
**Time estimate: 3-5 weeks for MVP**

**Pros:**
- Single codebase
- Great performance
- Good HTTP/WebSocket support

---

## Key Technical Challenges

### 1. Authentication
**Challenge:** The web app uses Cloudflare Turnstile for bot protection. Mobile apps can't easily solve CAPTCHAs.

**Solutions:**
- Request API keys/tokens from Cursor for mobile access
- Use OAuth device flow instead of web-based auth
- Implement a WebView-based auth flow

### 2. API Access
**Challenge:** APIs may be locked to web origin, checking `Referer` and `Origin` headers.

**Solutions:**
- If building officially: Request API documentation from Cursor
- If unofficial: May need to reverse-engineer headers/auth tokens

### 3. WebSocket/Real-time
**Challenge:** Pusher requires app key and cluster configuration.

**Known from CSP:**
- Uses `*.pusher.com` and `wss://*.pusher.com`
- App key not directly visible in code (likely server-injected)

### 4. Protobuf Messages
**Challenge:** Need `.proto` files to properly encode/decode messages.

**Evidence found:**
```javascript
// From code analysis - protobuf patterns:
new o.KoG({inferredPrivacyMode:o.YTt.UNSPECIFIED}).toJson()
new o.eWf({privacyMode:t}).toJson()
new p.IU4({...request_params})
```

**Solution:**
- Reverse engineer protobuf definitions from the minified JS
- Use JSON mode (`.toJson()`) instead of binary protobuf

---

## Minimum Viable Mobile App Features

### Core Features (MVP)
1. **Login** - OAuth with Cursor account
2. **Repository List** - Show connected GitHub repos
3. **Agent Dashboard** - List running/completed agents
4. **Start Agent** - Create new agent from repo + branch + prompt
5. **Agent Status** - Real-time progress updates
6. **Pause/Cancel** - Control running agents

### Enhanced Features
7. **Push Notifications** - Agent completion alerts
8. **Agent Detail View** - See conversation history
9. **PR Integration** - Link to GitHub PRs
10. **Settings** - Privacy mode, model preferences

---

## Estimated API Request Flow

```
1. Login
   POST /api/auth/login
   ← JWT token

2. Get Privacy Settings
   POST /api/dashboard/get-user-privacy-mode
   ← Privacy mode, restrictions

3. List Repositories
   (GitHub API integration)

4. Start Agent
   POST /api/auth/startBackgroundComposerFromSnapshot
   Body: {
     bcId: uuid,
     repoUrl: "github.com/owner/repo",
     prompt: "Fix the bug in...",
     modelDetails: { modelName: "claude-3.5-sonnet", maxMode: true },
     baseBranch: "main",
     source: "IOS_APP"  // or custom identifier
   }
   ← Workflow ID, status

5. Monitor Status
   WebSocket: Pusher channel subscription
   or
   Polling: POST /api/background-composer/get-detailed-composer

6. Pause Agent
   POST /api/background-composer/pause
```

---

## Legal & Ethical Considerations

### ⚠️ Important
- **Terms of Service** - Check Cursor's ToS before building unofficial clients
- **API Stability** - Undocumented APIs can change without notice
- **Rate Limiting** - May be restricted for non-official clients
- **Auth Security** - Don't store credentials insecurely

### Best Approach
1. Contact Cursor about official mobile SDK/API access
2. If they provide it: Build with official documentation
3. If not: Consider contributing to feature request

---

## Alternative: PWA Approach (Simplest)

Since cursor.com/agents is already a PWA:

1. **iOS Safari** → Share → "Add to Home Screen"
2. **Android Chrome** → Menu → "Add to Home Screen"

This gives you:
- ✅ Full functionality
- ✅ Push notifications (with permission)
- ✅ Offline icon
- ❌ Limited offline capability
- ❌ No native performance

---

## Rough Implementation Skeleton (React Native)

```tsx
// App.tsx - Basic structure
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Pusher from 'pusher-js/react-native';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Agents" component={AgentsListScreen} />
            <Stack.Screen name="NewAgent" component={NewAgentScreen} />
            <Stack.Screen name="AgentDetail" component={AgentDetailScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// hooks/useAgents.ts
function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const response = await fetch('/api/background-composer/list', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.json();
    }
  });
}
```

---

## Summary

| Approach | Effort | Risk | Recommendation |
|----------|--------|------|----------------|
| PWA (Add to Home Screen) | None | None | ✅ Do this first |
| React Native unofficial | 2-4 weeks | High (ToS, API changes) | ⚠️ Contact Cursor first |
| Native unofficial | 4-8 weeks | High | ⚠️ Not recommended |
| Official SDK (if available) | 1-2 weeks | Low | ✅ Best option |

**My recommendation:** Contact Cursor to ask about mobile API access. They may have plans for an official app (the `IOS_APP` enum suggests this), or they may provide API documentation for authorized developers.
