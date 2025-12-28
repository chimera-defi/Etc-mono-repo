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
│   ├── VoiceCommand.swift        # Parsed voice command
│   └── VPSConnection.swift       # VPS config
├── Views/
│   ├── MainView.swift            # Tab container
│   ├── VoiceView.swift           # Voice recording interface
│   ├── TaskListView.swift        # List of tasks
│   ├── TaskDetailView.swift      # Single task detail
│   ├── SettingsView.swift        # App settings
│   └── SetupView.swift           # VPS setup flow
├── ViewModels/
│   ├── VoiceViewModel.swift      # Voice recording logic
│   ├── TaskViewModel.swift       # Task management
│   └── SettingsViewModel.swift   # Settings management
├── Services/
│   ├── AudioRecorder.swift       # AVAudioRecorder wrapper
│   ├── APIClient.swift           # Backend API calls
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

## Implementation Phases

### Phase 1: Core Voice Recording (Week 1)
- [ ] Xcode project setup with SwiftUI
- [ ] Audio recording with AVAudioRecorder
- [ ] Basic UI with record button
- [ ] Audio level visualization
- [ ] Microphone permission handling

### Phase 2: API Integration (Week 1-2)
- [ ] APIClient with async/await
- [ ] Voice transcription endpoint
- [ ] Command parsing endpoint
- [ ] Task CRUD endpoints
- [ ] Error handling

### Phase 3: Task Management (Week 2)
- [ ] Task list view
- [ ] Task detail view
- [ ] Real-time status updates (polling initially)
- [ ] Task history with SwiftData

### Phase 4: Settings & VPS Setup (Week 2-3)
- [ ] Settings view
- [ ] VPS endpoint configuration
- [ ] Keychain storage for API keys
- [ ] Connection health check

### Phase 5: Polish (Week 3)
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
