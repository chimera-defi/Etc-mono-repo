# Cadence Agent Prompts for Parallel Development

> **Self-contained prompts for agents to work on Cadence in parallel**
>
> Each prompt includes all context needed - no external reading required.

---

## How to Use These Prompts

1. Copy the entire prompt for the component you're working on
2. Paste it to a new agent session
3. The agent has everything it needs to implement that component
4. Review output, then run verification commands

---

## Agent 1: Backend API - WebSocket Streaming

### Context
You are implementing real-time WebSocket streaming for the Cadence voice coding assistant backend API. The API is built with Fastify + TypeScript.

### Current State
- Basic API exists at `cadence-api/`
- WebSocket plugin registered in `src/index.ts`
- `src/services/stream-manager.ts` exists with subscription management
- `src/routes/websocket.ts` exists with basic connection handling

### Your Task
Complete the WebSocket streaming implementation:

1. **Verify stream-manager.ts works correctly**
   - Connection management
   - Task subscriptions
   - Event emission to subscribers

2. **Update tasks.ts to emit streaming events**
   - When task starts: emit `task_started`
   - On each tool use: emit `tool_use`
   - On file edits: emit `file_edit`
   - On command runs: emit `command_run`
   - On completion: emit `task_completed`

3. **Add tests for streaming**
   - Mock WebSocket connections
   - Test subscription/unsubscription
   - Test event emission

### Files to Modify
- `cadence-api/src/routes/tasks.ts`
- `cadence-api/src/services/stream-manager.ts`
- `cadence-api/src/tests/stream-manager.test.ts`

### Verification Commands
```bash
cd ideas/voice-coding-assistant/cadence-api
npm install
npm test
npm run typecheck
```

### Success Criteria
- [ ] All tests pass
- [ ] TypeScript compiles without errors
- [ ] WebSocket connections can subscribe to tasks
- [ ] Events are emitted in real-time during task execution

---

## Agent 2: Backend API - GitHub Webhooks

### Context
You are implementing GitHub webhook handlers for the Cadence backend. Webhooks allow auto-archiving of tasks when PRs are merged/closed.

### Current State
- `src/routes/webhooks.ts` exists with basic handlers
- `src/types.ts` has `GitHubWebhookPayload` type
- Tests exist in `src/tests/webhooks.test.ts`

### Your Task
Complete the webhook implementation:

1. **Enhance PR event handling**
   - On `pull_request.merged`: Mark task completed, archive
   - On `pull_request.closed` (not merged): Mark task cancelled
   - On `pull_request.review_submitted`: Notify user

2. **Implement @cadence-ai mention handling**
   - Parse commands from PR/issue comments
   - Commands: "fix", "update", "address comments"
   - Create new sub-tasks from mentions

3. **Add webhook signature verification**
   - Use `GITHUB_WEBHOOK_SECRET` env var
   - HMAC SHA-256 signature validation
   - Timing-safe comparison

### Files to Modify
- `cadence-api/src/routes/webhooks.ts`
- `cadence-api/src/tests/webhooks.test.ts`

### Verification Commands
```bash
cd ideas/voice-coding-assistant/cadence-api
npm test -- --grep webhook
npm run typecheck
```

### Success Criteria
- [ ] Signature verification works
- [ ] PR merge/close events update task status
- [ ] @cadence-ai mentions are parsed
- [ ] All webhook tests pass

---

## Agent 3: iOS App - Voice Recording

### Context
You are implementing the voice recording functionality for the Cadence iOS app using Swift and AVFoundation.

### Current State
- Project plan exists at `cadence-ios/PLAN.md`
- No Xcode project created yet

### Your Task
Create the voice recording service:

1. **Create AudioRecorder service**
   - Use AVAudioRecorder for M4A recording
   - Handle microphone permissions
   - Provide audio level metering for waveform
   - Target: 30 second max recording

2. **Create VoiceView SwiftUI component**
   - Large record button (tap to start/stop)
   - Waveform visualization during recording
   - Status text (Ready/Recording/Processing)
   - Display transcription result

3. **Handle audio session**
   - Configure for playAndRecord
   - Handle interruptions (calls, etc.)
   - Proper cleanup on stop

### Key Code Structure
```swift
// AudioRecorder.swift
@Observable class AudioRecorder {
    var isRecording: Bool
    var audioLevel: Float // 0.0 - 1.0 for waveform
    var audioURL: URL?

    func startRecording() async throws
    func stopRecording() -> URL?
}
```

### Files to Create
- `Cadence/Services/AudioRecorder.swift`
- `Cadence/Views/VoiceView.swift`
- `Cadence/ViewModels/VoiceViewModel.swift`

### Verification
- Build in Xcode (iOS 17+ target)
- Test on device (simulator has no mic)
- Verify M4A file is created after recording

### Success Criteria
- [ ] Recording starts/stops correctly
- [ ] Audio level updates for waveform
- [ ] M4A file saved to temp directory
- [ ] Microphone permission handled gracefully

---

## Agent 4: iOS App - WebSocket Client

### Context
You are implementing the WebSocket client for real-time streaming in the Cadence iOS app.

### Current State
- Project plan at `cadence-ios/PLAN.md` includes WebSocket design
- Backend WebSocket endpoint: `ws://[host]/api/ws/stream`

### Your Task
Create the WebSocket streaming client:

1. **Create WebSocketClient service**
   - Connect to backend WebSocket
   - Subscribe to task events
   - Parse incoming StreamEvent JSON
   - Handle reconnection on disconnect

2. **Create StreamEvent model**
   ```swift
   struct StreamEvent: Codable, Identifiable {
       let id: UUID
       let type: String // task_started, file_edit, command_run, etc.
       let taskId: String
       let timestamp: Date
       let data: StreamEventData
   }
   ```

3. **Update TaskDetailView**
   - Connect WebSocket on appear
   - Subscribe to current task
   - Display events in scrollable list
   - Auto-scroll to latest event

### WebSocket Protocol
```json
// Subscribe to task
{"type": "subscribe", "taskId": "uuid-here"}

// Incoming events
{
  "type": "file_edit",
  "taskId": "uuid",
  "timestamp": "2025-12-28T...",
  "data": {"path": "src/app.ts", "action": "edit", "linesChanged": 15}
}
```

### Files to Create
- `Cadence/Services/WebSocketClient.swift`
- `Cadence/Models/StreamEvent.swift`
- `Cadence/Views/TaskDetailView.swift`

### Verification
- Connect to running backend
- Subscribe to task, see events appear
- Disconnect/reconnect works

### Success Criteria
- [ ] WebSocket connects to backend
- [ ] Subscribe/unsubscribe works
- [ ] Events parsed and displayed
- [ ] Reconnection on disconnect

---

## Agent 5: iOS App - Text Input

### Context
You are implementing text input as an alternative to voice for the Cadence iOS app.

### Current State
- Voice input exists (see Agent 3)
- Need keyboard fallback for users who prefer typing

### Your Task
Create text input functionality:

1. **Create TextInputView**
   - Multi-line text field
   - Send button (disabled when empty)
   - Loading state during processing
   - Keyboard dismissal on send

2. **Create InputView (combined)**
   - Segmented control: Voice / Text
   - Switch between VoiceView and TextInputView
   - Share same InputViewModel

3. **Update APIClient**
   - Add `sendTextInput(text:)` method
   - POST to `/api/input/text`
   - Same response handling as voice

### API Endpoint
```
POST /api/input/text
Content-Type: application/json

{
  "text": "add dark mode to settings",
  "repoUrl": "https://github.com/user/repo" // optional
}

Response:
{
  "task": { ... },
  "command": { "intent": "create_task", ... },
  "source": "text"
}
```

### Files to Create/Modify
- `Cadence/Views/TextInputView.swift` (new)
- `Cadence/Views/InputView.swift` (new)
- `Cadence/ViewModels/InputViewModel.swift` (new)
- `Cadence/Services/APIClient.swift` (modify)

### Success Criteria
- [ ] Text input sends to backend
- [ ] Task created from text command
- [ ] Toggle between voice/text works
- [ ] Keyboard handling is smooth

---

## Agent 6: VPS Bridge - Streaming Support

### Context
You are implementing streaming support for the VPS bridge that communicates with Claude Code on the user's VPS.

### Current State
- `cadence-api/src/services/vps-bridge.ts` exists
- Has `executeTask()` (blocking) and `executeTaskStreaming()` (with callbacks)
- Mock mode works without VPS configured

### Your Task
Enhance the VPS bridge for production:

1. **Update VPS protocol**
   - VPS should send SSE (Server-Sent Events)
   - Parse SSE stream in real-time
   - Forward events to StreamManager

2. **Add Git configuration**
   ```typescript
   interface GitConfig {
     branch?: string;
     autoCommit: boolean;
     autoPR: boolean;
     prTitle?: string;
   }
   ```

3. **Handle VPS errors gracefully**
   - Connection timeouts
   - Invalid responses
   - VPS offline detection

4. **Update cadence-setup bootstrap.sh**
   - VPS server must support `/task/stream` endpoint
   - Must send SSE format events

### Files to Modify
- `cadence-api/src/services/vps-bridge.ts`
- `cadence-setup/bootstrap.sh`

### Success Criteria
- [ ] SSE parsing works correctly
- [ ] Events forwarded to StreamManager
- [ ] Git config passed to VPS
- [ ] Error handling covers edge cases

---

## Parallelization Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PARALLEL DEVELOPMENT MAP                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  BACKEND (Node.js)                    iOS (Swift)                   │
│  ═══════════════════                  ════════════                   │
│                                                                      │
│  Agent 1: WebSocket ──────┐     ┌──── Agent 3: Voice Recording      │
│           Streaming       │     │                                    │
│                           │     │                                    │
│  Agent 2: GitHub  ────────┼─────┼──── Agent 4: WebSocket Client     │
│           Webhooks        │     │                                    │
│                           │     │                                    │
│  Agent 6: VPS Bridge ─────┘     └──── Agent 5: Text Input           │
│           Streaming                                                  │
│                                                                      │
│  DEPENDENCIES:                                                       │
│  • Agents 1, 2, 6 can run in parallel (backend)                     │
│  • Agents 3, 4, 5 can run in parallel (iOS)                         │
│  • iOS agents need backend running for integration testing          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Review Protocol

After each agent completes:

### Backend Agents (1, 2, 6)
```bash
cd ideas/voice-coding-assistant/cadence-api
npm install
npm run typecheck
npm test
npm run lint
```

### iOS Agents (3, 4, 5)
```bash
# In Xcode:
# 1. Build (Cmd+B)
# 2. Run tests (Cmd+U)
# 3. Test on device for audio/network
```

### Integration Test
```bash
# Terminal 1: Start backend
cd cadence-api && npm run dev

# Terminal 2: Run iOS app
# Connect to backend, test voice → task → streaming flow
```

---

**Document Version:** 1.0
**Created:** December 28, 2025
