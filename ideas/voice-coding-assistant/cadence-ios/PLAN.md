# Cadence iOS App - Swift Implementation Plan

> **Native iOS app for voice-controlled coding with Claude**

## Tech Stack

| Component | Technology | Version |
|-----------|------------|---------|
| UI Framework | SwiftUI | iOS 17+ |
| Language | Swift | 5.9+ |
| Audio | AVFoundation | - |
| Speech | Speech.framework (fallback) | - |
| Networking | URLSession + async/await | - |
| State | SwiftUI @Observable | - |
| Storage | SwiftData | - |
| Push | APNs | - |

## Project Structure

```
Cadence/
├── CadenceApp.swift              # App entry point
├── Models/
│   ├── Task.swift                # Task model
│   ├── StreamEvent.swift         # WebSocket streaming events
│   ├── VoiceCommand.swift        # Parsed voice command
│   └── VPSConnection.swift       # VPS config
├── Views/
│   ├── MainView.swift            # Tab container
│   ├── InputView.swift           # Combined voice + text input
│   ├── VoiceView.swift           # Voice recording interface
│   ├── TextInputView.swift       # Keyboard text input
│   ├── TaskListView.swift        # List of tasks
│   ├── TaskDetailView.swift      # Single task detail + live output
│   ├── SettingsView.swift        # App settings
│   └── SetupView.swift           # VPS setup flow
├── ViewModels/
│   ├── InputViewModel.swift      # Voice + text input logic
│   ├── TaskViewModel.swift       # Task management + streaming
│   └── SettingsViewModel.swift   # Settings management
├── Services/
│   ├── AudioRecorder.swift       # AVAudioRecorder wrapper
│   ├── APIClient.swift           # Backend API calls
│   ├── WebSocketClient.swift     # Real-time streaming
│   ├── WhisperService.swift      # Voice transcription
│   └── KeychainService.swift     # Secure storage
└── Resources/
    └── Assets.xcassets
```

## Core Components

### 1. Audio Recording (AVFoundation)

```swift
// AudioRecorder.swift
import AVFoundation

@Observable
class AudioRecorder {
    private var audioRecorder: AVAudioRecorder?
    private var audioSession: AVAudioSession

    var isRecording = false
    var audioURL: URL?

    init() {
        audioSession = AVAudioSession.sharedInstance()
    }

    func startRecording() async throws {
        try audioSession.setCategory(.playAndRecord, mode: .default)
        try audioSession.setActive(true)

        let url = FileManager.default.temporaryDirectory
            .appendingPathComponent(UUID().uuidString)
            .appendingPathExtension("m4a")

        let settings: [String: Any] = [
            AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
            AVSampleRateKey: 44100,
            AVNumberOfChannelsKey: 1,
            AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue
        ]

        audioRecorder = try AVAudioRecorder(url: url, settings: settings)
        audioRecorder?.record()
        audioURL = url
        isRecording = true
    }

    func stopRecording() -> URL? {
        audioRecorder?.stop()
        isRecording = false
        return audioURL
    }
}
```

### 2. Voice View (SwiftUI)

```swift
// VoiceView.swift
import SwiftUI

struct VoiceView: View {
    @State private var viewModel = VoiceViewModel()

    var body: some View {
        VStack(spacing: 32) {
            Spacer()

            // Status indicator
            Text(viewModel.statusText)
                .font(.headline)
                .foregroundStyle(.secondary)

            // Waveform visualization
            WaveformView(amplitude: viewModel.audioLevel)
                .frame(height: 100)

            // Record button
            Button(action: viewModel.toggleRecording) {
                Circle()
                    .fill(viewModel.isRecording ? .red : .blue)
                    .frame(width: 80, height: 80)
                    .overlay {
                        Image(systemName: viewModel.isRecording ? "stop.fill" : "mic.fill")
                            .font(.title)
                            .foregroundStyle(.white)
                    }
            }
            .buttonStyle(.plain)

            // Transcription result
            if let text = viewModel.transcribedText {
                Text(text)
                    .font(.body)
                    .padding()
                    .background(.ultraThinMaterial)
                    .cornerRadius(12)
            }

            Spacer()
        }
        .padding()
    }
}
```

### 3. API Client

```swift
// APIClient.swift
import Foundation

actor APIClient {
    private let baseURL: URL
    private let session: URLSession

    init(baseURL: URL = URL(string: "http://localhost:3001")!) {
        self.baseURL = baseURL
        self.session = URLSession.shared
    }

    // MARK: - Tasks

    func createTask(_ request: CreateTaskRequest) async throws -> Task {
        var urlRequest = URLRequest(url: baseURL.appendingPathComponent("/api/tasks"))
        urlRequest.httpMethod = "POST"
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        urlRequest.httpBody = try JSONEncoder().encode(request)

        let (data, _) = try await session.data(for: urlRequest)
        return try JSONDecoder().decode(Task.self, from: data)
    }

    func getTasks() async throws -> [Task] {
        let url = baseURL.appendingPathComponent("/api/tasks")
        let (data, _) = try await session.data(from: url)
        let response = try JSONDecoder().decode(TaskListResponse.self, from: data)
        return response.tasks
    }

    // MARK: - Voice

    func transcribe(audioData: Data) async throws -> TranscriptionResponse {
        var urlRequest = URLRequest(url: baseURL.appendingPathComponent("/api/voice/transcribe"))
        urlRequest.httpMethod = "POST"
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let request = TranscribeRequest(audio: audioData.base64EncodedString(), format: "m4a")
        urlRequest.httpBody = try JSONEncoder().encode(request)

        let (data, _) = try await session.data(for: urlRequest)
        return try JSONDecoder().decode(TranscriptionResponse.self, from: data)
    }
}
```

### 4. WebSocket Client for Streaming

```swift
// WebSocketClient.swift
import Foundation

@Observable
class WebSocketClient {
    private var webSocket: URLSessionWebSocketTask?
    private let session = URLSession.shared

    var isConnected = false
    var events: [StreamEvent] = []

    func connect(to url: URL) {
        webSocket = session.webSocketTask(with: url)
        webSocket?.resume()
        isConnected = true
        receiveMessages()
    }

    func subscribe(to taskId: String) {
        let message = ["type": "subscribe", "taskId": taskId]
        send(message)
    }

    private func receiveMessages() {
        webSocket?.receive { [weak self] result in
            switch result {
            case .success(let message):
                self?.handleMessage(message)
                self?.receiveMessages() // Continue listening
            case .failure(let error):
                print("WebSocket error: \(error)")
                self?.isConnected = false
            }
        }
    }

    private func handleMessage(_ message: URLSessionWebSocketTask.Message) {
        if case .string(let text) = message,
           let data = text.data(using: .utf8),
           let event = try? JSONDecoder().decode(StreamEvent.self, from: data) {
            DispatchQueue.main.async {
                self.events.append(event)
            }
        }
    }

    private func send(_ dict: [String: String]) {
        guard let data = try? JSONEncoder().encode(dict),
              let string = String(data: data, encoding: .utf8) else { return }
        webSocket?.send(.string(string)) { _ in }
    }

    func disconnect() {
        webSocket?.cancel(with: .goingAway, reason: nil)
        isConnected = false
    }
}
```

### 5. Combined Input View (Voice + Text)

```swift
// InputView.swift
import SwiftUI

struct InputView: View {
    @State private var viewModel = InputViewModel()
    @State private var showTextInput = false

    var body: some View {
        VStack(spacing: 24) {
            // Mode toggle
            Picker("Input Mode", selection: $showTextInput) {
                Label("Voice", systemImage: "mic.fill").tag(false)
                Label("Text", systemImage: "keyboard").tag(true)
            }
            .pickerStyle(.segmented)
            .padding(.horizontal)

            if showTextInput {
                // Text input
                TextInputView(viewModel: viewModel)
            } else {
                // Voice input
                VoiceInputView(viewModel: viewModel)
            }

            // Recent transcriptions/commands
            if let lastCommand = viewModel.lastCommand {
                HStack {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundStyle(.green)
                    Text(lastCommand)
                        .font(.subheadline)
                }
                .padding()
                .background(.ultraThinMaterial)
                .cornerRadius(8)
            }
        }
    }
}

struct TextInputView: View {
    @Bindable var viewModel: InputViewModel
    @FocusState private var isFocused: Bool

    var body: some View {
        VStack(spacing: 16) {
            TextField("Type your command...", text: $viewModel.textInput, axis: .vertical)
                .textFieldStyle(.plain)
                .padding()
                .background(.ultraThinMaterial)
                .cornerRadius(12)
                .focused($isFocused)
                .lineLimit(1...5)

            Button(action: viewModel.submitText) {
                Label("Send", systemImage: "paperplane.fill")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .disabled(viewModel.textInput.isEmpty || viewModel.isProcessing)
        }
        .padding()
    }
}
```

### 6. Task Detail with Live Streaming

```swift
// TaskDetailView.swift
import SwiftUI

struct TaskDetailView: View {
    let task: CodingTask
    @State private var webSocket = WebSocketClient()

    var body: some View {
        ScrollViewReader { proxy in
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    // Task info
                    TaskHeaderView(task: task)

                    Divider()

                    // Live output stream
                    Text("Live Output")
                        .font(.headline)

                    LazyVStack(alignment: .leading, spacing: 8) {
                        ForEach(webSocket.events) { event in
                            StreamEventRow(event: event)
                                .id(event.id)
                        }
                    }
                    .onChange(of: webSocket.events.count) { _, _ in
                        if let last = webSocket.events.last {
                            withAnimation {
                                proxy.scrollTo(last.id, anchor: .bottom)
                            }
                        }
                    }
                }
                .padding()
            }
        }
        .navigationTitle(task.shortDescription)
        .onAppear {
            webSocket.connect(to: URL(string: "ws://localhost:3001/api/ws/stream")!)
            webSocket.subscribe(to: task.id)
        }
        .onDisappear {
            webSocket.disconnect()
        }
    }
}

struct StreamEventRow: View {
    let event: StreamEvent

    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            Image(systemName: iconForEvent(event))
                .foregroundStyle(colorForEvent(event))
                .frame(width: 20)

            VStack(alignment: .leading, spacing: 2) {
                Text(titleForEvent(event))
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text(event.message)
                    .font(.system(.body, design: .monospaced))
            }
        }
        .padding(.vertical, 4)
    }

    func iconForEvent(_ event: StreamEvent) -> String {
        switch event.type {
        case "file_edit": return "doc.text"
        case "command_run": return "terminal"
        case "tool_use": return "wrench"
        case "error": return "exclamationmark.triangle"
        default: return "text.bubble"
        }
    }

    func colorForEvent(_ event: StreamEvent) -> Color {
        switch event.type {
        case "error": return .red
        case "task_completed": return .green
        default: return .blue
        }
    }
}
```

## Implementation Phases

### Phase 1: Core Voice Recording (Week 1)
- [ ] Xcode project setup with SwiftUI
- [ ] Audio recording with AVAudioRecorder
- [ ] Basic UI with record button
- [ ] Audio level visualization
- [ ] Microphone permission handling

### Phase 2: API & Input Integration (Week 1-2)
- [ ] APIClient with async/await
- [ ] Voice transcription endpoint
- [ ] **Text input endpoint** (keyboard fallback)
- [ ] Command parsing endpoint
- [ ] Task CRUD endpoints
- [ ] Error handling

### Phase 3: Real-time Streaming (Week 2)
- [ ] **WebSocket client implementation**
- [ ] **Live output streaming to TaskDetailView**
- [ ] **Stream event parsing and display**
- [ ] Connection status handling
- [ ] Reconnection logic

### Phase 4: Task Management (Week 2-3)
- [ ] Task list view with status indicators
- [ ] Task detail view with **live output**
- [ ] Task history with SwiftData
- [ ] Pull-to-refresh

### Phase 5: Settings & VPS Setup (Week 3)
- [ ] Settings view
- [ ] VPS endpoint configuration
- [ ] Keychain storage for API keys
- [ ] Connection health check

### Phase 6: Polish (Week 3-4)
- [ ] Push notifications for task completion
- [ ] Haptic feedback
- [ ] Dark mode support
- [ ] App icon and launch screen
- [ ] TestFlight beta

## iOS-Specific Features

### Siri Shortcuts Integration
```swift
// Allow users to trigger tasks via Siri
import AppIntents

struct StartCodingTaskIntent: AppIntent {
    static var title: LocalizedStringResource = "Start Coding Task"

    @Parameter(title: "Task Description")
    var taskDescription: String

    func perform() async throws -> some IntentResult {
        let client = APIClient()
        let task = try await client.createTask(
            CreateTaskRequest(task: taskDescription)
        )
        return .result(dialog: "Started task: \(task.task)")
    }
}
```

### Widget Support
```swift
// Show active task status on home screen
import WidgetKit

struct CadenceWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(
            kind: "ActiveTask",
            provider: TaskTimelineProvider()
        ) { entry in
            TaskWidgetView(entry: entry)
        }
        .configurationDisplayName("Active Task")
        .description("Shows your current coding task status")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
```

### Background App Refresh
```swift
// Keep task status updated in background
import BackgroundTasks

func scheduleAppRefresh() {
    let request = BGAppRefreshTaskRequest(identifier: "com.cadence.refresh")
    request.earliestBeginDate = Date(timeIntervalSinceNow: 15 * 60)
    try? BGTaskScheduler.shared.submit(request)
}
```

## Testing Strategy

| Test Type | Framework | Coverage Target |
|-----------|-----------|-----------------|
| Unit | XCTest | 80% |
| UI | XCUITest | Key flows |
| Snapshot | swift-snapshot-testing | All views |

## Dependencies

Keep dependencies minimal for a native app:

```swift
// Package.swift or via SPM in Xcode
dependencies: [
    // Only if needed for advanced features
]
```

**Goal:** Zero external dependencies for core functionality. SwiftUI + AVFoundation + URLSession provide everything needed.

## Next Steps

1. Create Xcode project
2. Implement AudioRecorder service
3. Build VoiceView with basic recording
4. Integrate with cadence-api for transcription
5. Add task management
