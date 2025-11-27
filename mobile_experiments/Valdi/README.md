# Valdi Experiment

Snapchat's cross-platform UI framework - TypeScript compiled to native views.

## Status: ⚠️ Code Complete (CLI Required)

| Check | Status |
|-------|--------|
| Code | ✅ Complete |
| Tests | ⚠️ Requires Valdi CLI |
| Linting | ⚠️ Requires Valdi CLI |
| Build | ⚠️ Requires Valdi CLI |

## Quick Start

```bash
# Install Valdi CLI
npm install -g @snap/valdi

# Setup dependencies
valdi dev_setup

# Build and run
valdi build android  # or ios/macos
valdi hotreload      # Development mode
```

## Features

- Native performance (no JS bridge)
- Cross-platform (iOS, Android, macOS)
- TypeScript with class-based components
- Hot reload on all platforms
- 8 years production use at Snap

## Project Structure

```
Valdi/
├── modules/snapchat_valdi/src/
│   └── App.tsx           # Main application
├── BUILD.bazel           # Build rules
├── WORKSPACE             # Bazel workspace
└── package.json          # Dependencies
```

## Valdi Syntax

```typescript
import { Component } from 'valdi_core/src/Component';

class HelloWorld extends Component {
  onRender() {
    <view backgroundColor='#FFFC00' padding={30}>
      <label color='black' value='Hello, Valdi!' />
    </view>;
  }
}
```

### Key Differences from React
- **Class-based**: Extends `Component`
- **`onRender()` method**: Not `render()` or function
- **Lowercase tags**: `<view>`, `<label>`, `<image>`
- **No JSX return**: Write JSX directly in `onRender()`
- **`value` prop**: For text (not children)

## Setup Requirements

- **macOS** (required for iOS)
- **Xcode** (for iOS/macOS)
- **Android Studio** (for Android)
- **Node.js** (for CLI)

## Common Elements

| Element | Purpose |
|---------|---------|
| `<view>` | Container |
| `<label>` | Text (use `value` prop) |
| `<image>` | Image |
| `<scroll>` | Scrollable |

## Comparison Notes

| vs React Native | Valdi |
|-----------------|-------|
| Bridge | None (native) |
| Components | Class-based |
| Platform | iOS/Android/macOS |

| vs Flutter | Valdi |
|------------|-------|
| Language | TypeScript (vs Dart) |
| Ecosystem | Smaller |
| Performance | Both native |

## Resources

- https://github.com/Snapchat/Valdi
- https://github.com/Snapchat/Valdi/blob/main/docs/README.md
- https://discord.gg/uJyNEeYX2U (Community)

## AGENTS.md

See `AGENTS.md` for AI assistant guidance specific to Valdi development.
