# Framework Recommendation for Agent App

## Context

Based on our [existing framework research](../README.md) and the specific requirements of an AI coding agent app, this document provides a framework recommendation.

---

## Requirements Analysis

### Critical Requirements

| Requirement | Weight | Notes |
|-------------|--------|-------|
| Native Performance | 🔴 High | Smooth 60fps for code scrolling, real-time updates |
| Cross-Platform | 🔴 High | iOS and Android from single codebase |
| Streaming Support | 🔴 High | Real-time token streaming from Claude API |
| Complex UI | 🔴 High | Code editor, file browser, git diff views |
| Developer Experience | 🟡 Medium | Fast iteration, good debugging |
| Ecosystem | 🟡 Medium | Libraries for syntax highlighting, markdown, etc. |

### Nice-to-Have

| Requirement | Weight | Notes |
|-------------|--------|-------|
| Web Support | 🟢 Low | Could be nice for desktop browser |
| Hot Reload | 🟡 Medium | Faster development |
| Testing | 🟡 Medium | Unit and widget tests |

---

## Framework Comparison for Agent App

### Scoring Matrix

| Framework | Native Perf | Cross-Platform | Streaming | Complex UI | DX | Ecosystem | **Total** |
|-----------|-------------|----------------|-----------|------------|-----|-----------|-----------|
| **Flutter** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | **27/30** |
| **React Native** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **28/30** |
| **Capacitor** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **26/30** |
| **Native (Swift/Kotlin)** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | **23/30** |

---

## Detailed Analysis

### Flutter ⭐ RECOMMENDED

**Pros for Agent App:**
- ✅ **Excellent rendering performance** - Custom Skia engine, perfect for code views
- ✅ **Rich widget library** - Built-in components for complex UIs
- ✅ **Strong typing** - Dart catches errors at compile time
- ✅ **Hot reload** - Sub-second iteration
- ✅ **Syntax highlighting** - `flutter_highlight` package available
- ✅ **WebSocket support** - Built-in, works great for streaming
- ✅ **Single codebase** - iOS, Android, and Web

**Cons:**
- ❌ Dart language (learning curve if coming from JS)
- ❌ Larger app size (~15-20MB)
- ❌ Slightly smaller ecosystem than React Native

**Key Packages for Agent App:**

```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # HTTP & Networking
  dio: ^5.0.0
  web_socket_channel: ^2.4.0
  
  # State Management
  flutter_riverpod: ^2.4.0
  
  # UI Components
  flutter_highlight: ^0.7.0      # Syntax highlighting
  flutter_markdown: ^0.6.0       # Markdown rendering
  file_picker: ^6.0.0            # File selection
  
  # Storage
  hive: ^2.2.0
  path_provider: ^2.1.0
  
  # Auth
  flutter_appauth: ^6.0.0
  
  # Utilities
  intl: ^0.18.0
  uuid: ^4.0.0
```

### React Native

**Pros for Agent App:**
- ✅ **JavaScript/TypeScript** - Familiar for web developers
- ✅ **Huge ecosystem** - npm packages for everything
- ✅ **Strong community** - Lots of examples and support
- ✅ **Expo** - Simplified development workflow

**Cons:**
- ❌ Bridge overhead for heavy computations
- ❌ Large dependency graph
- ❌ Syntax highlighting options less mature

**Key Packages for Agent App:**

```json
{
  "dependencies": {
    "react-native": "^0.73.0",
    "@react-native-community/netinfo": "^11.0.0",
    "react-native-syntax-highlighter": "^15.0.0",
    "react-native-markdown-display": "^7.0.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.4.0"
  }
}
```

### Capacitor

**Pros for Agent App:**
- ✅ **Web-first** - Same code runs in browser
- ✅ **Familiar stack** - React/Vue/Svelte
- ✅ **Easy plugin system**

**Cons:**
- ❌ **WebView-based** - Not truly native performance
- ❌ **Scrolling large code files** - May feel less smooth
- ❌ **Complex native integrations** - Harder to implement

**Not recommended** for Agent App due to performance requirements for code viewing/editing.

---

## Recommendation: Flutter

### Why Flutter for Agent App?

1. **Performance for Code Views**
   - Scrolling through thousands of lines needs native perf
   - Flutter's Skia rendering handles this excellently
   
2. **Custom Rendering Control**
   - Need precise control over syntax highlighting
   - Flutter's widget system is very flexible
   
3. **Streaming Support**
   - WebSocket + StreamBuilder = perfect for Claude API streaming
   
4. **Production Examples**
   - Existing Flutter code editors (e.g., Acode, Replit mobile)
   - Proven for this use case

5. **Development Speed**
   - Hot reload for fast iteration
   - Strong type system catches bugs early

### Flutter Architecture for Agent App

```dart
// lib/
// ├── main.dart
// ├── app/
// │   ├── router.dart
// │   └── theme.dart
// ├── features/
// │   ├── chat/
// │   │   ├── chat_screen.dart
// │   │   ├── chat_provider.dart
// │   │   └── widgets/
// │   ├── code_viewer/
// │   │   ├── code_viewer_screen.dart
// │   │   └── syntax_highlighter.dart
// │   ├── file_browser/
// │   │   └── file_browser_screen.dart
// │   └── git/
// │       └── git_screen.dart
// ├── services/
// │   ├── claude_service.dart
// │   ├── agent_service.dart
// │   ├── file_service.dart
// │   └── git_service.dart
// └── models/
//     ├── message.dart
//     ├── tool_call.dart
//     └── project.dart
```

### Sample Code: Claude API Streaming

```dart
import 'dart:convert';
import 'package:web_socket_channel/web_socket_channel.dart';

class ClaudeService {
  final String apiKey;
  
  ClaudeService(this.apiKey);
  
  Stream<String> streamMessage(String prompt, List<Tool> tools) async* {
    final response = await http.post(
      Uri.parse('https://api.anthropic.com/v1/messages'),
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: jsonEncode({
        'model': 'claude-sonnet-4-20250514',
        'max_tokens': 4096,
        'stream': true,
        'tools': tools.map((t) => t.toJson()).toList(),
        'messages': [
          {'role': 'user', 'content': prompt}
        ],
      }),
    );
    
    await for (final chunk in response.stream) {
      final data = jsonDecode(utf8.decode(chunk));
      if (data['type'] == 'content_block_delta') {
        yield data['delta']['text'];
      }
    }
  }
}
```

### Sample Code: Code Viewer Widget

```dart
import 'package:flutter/material.dart';
import 'package:flutter_highlight/flutter_highlight.dart';
import 'package:flutter_highlight/themes/github.dart';

class CodeViewer extends StatelessWidget {
  final String code;
  final String language;
  final int? highlightLine;
  
  const CodeViewer({
    required this.code,
    required this.language,
    this.highlightLine,
    super.key,
  });
  
  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: HighlightView(
        code,
        language: language,
        theme: githubTheme,
        padding: const EdgeInsets.all(16),
        textStyle: const TextStyle(
          fontFamily: 'JetBrains Mono',
          fontSize: 14,
        ),
      ),
    );
  }
}
```

---

## Alternative: React Native (If Team Prefers JS)

If the development team has stronger JavaScript/TypeScript expertise, React Native is a close second choice:

### React Native Setup

```bash
npx react-native init AgentApp --template react-native-template-typescript
cd AgentApp
npm install @tanstack/react-query zustand react-native-markdown-display
```

### Key Considerations for React Native

1. Use **New Architecture** (Fabric + TurboModules) for better performance
2. Consider **Expo** for easier development, but may need to eject for native modules
3. Use **react-native-reanimated** for smooth animations
4. Consider **react-native-fast-image** for optimized image loading

---

## Decision Matrix

| Factor | Flutter | React Native | Decision Weight |
|--------|---------|--------------|-----------------|
| Performance for code scrolling | ✅ Better | 🟡 Good | High |
| Streaming API support | ✅ Excellent | ✅ Excellent | High |
| Team expertise | Depends | Depends | Medium |
| Time to MVP | ✅ Fast | ✅ Fast | Medium |
| Long-term maintenance | ✅ Good | ✅ Good | Medium |
| Package ecosystem | 🟡 Good | ✅ Excellent | Low |

---

## Final Recommendation

### Primary: Flutter

**Choose Flutter if:**
- Performance is the top priority
- Team is open to learning Dart
- You want tight control over rendering

### Secondary: React Native

**Choose React Native if:**
- Team has strong JS/TS expertise
- Faster time to first prototype is critical
- You need specific npm packages

---

## Next Steps

1. Set up Flutter development environment
2. Create project structure per [MOBILE_ARCHITECTURE.md](./MOBILE_ARCHITECTURE.md)
3. Implement Claude API client
4. Build basic chat UI with streaming
5. Add code viewer component
6. Iterate!

---

**Recommendation**: Flutter  
**Confidence**: High  
**Alternative**: React Native (close second)
