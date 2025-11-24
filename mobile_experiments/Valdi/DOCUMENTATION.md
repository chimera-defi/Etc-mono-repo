# Valdi Framework Documentation

## ✅ OFFICIAL DOCUMENTATION FOUND!

**Status**: Valdi is a real, active, open-source framework with extensive documentation!

## Official Documentation Sources

### GitHub Repository ⭐
- **URL**: https://github.com/Snapchat/Valdi
- **Status**: ✅ **ACTIVE AND PUBLIC**
- **Stars**: 13,009+ (as of Nov 2024)
- **Forks**: 436+
- **Language**: C++ (core), TypeScript (user code)
- **Created**: November 6, 2025
- **Last Updated**: November 24, 2025
- **Description**: "Valdi is a cross-platform UI framework that delivers native performance without sacrificing developer velocity."
- **Homepage**: Discord community at https://discord.gg/uJyNEeYX2U

### Documentation
- **Main Docs**: https://github.com/Snapchat/Valdi/blob/main/docs/README.md
- **Installation Guide**: https://github.com/Snapchat/Valdi/blob/main/docs/INSTALL.md
- **API Reference**: https://github.com/Snapchat/Valdi/blob/main/docs/api/api-reference-elements.md
- **Quick Reference**: https://github.com/Snapchat/Valdi/blob/main/docs/api/api-quick-reference.md
- **Code Labs**: https://github.com/Snapchat/Valdi/blob/main/docs/docs/start-code-lab.md

### Package Installation
- **npm CLI**: `npm install -g @snap/valdi`
- **Package Name**: `@snap/valdi` (not `@snapchat/valdi`)

### Demo App
- **Repository**: https://github.com/iamnabink/snapchat-valdi-demo-app
- **Description**: Minimal Snapchat-style demo app built with Valdi

## Framework Details

### Basic Information
- **Name**: Valdi
- **Developer**: Snapchat
- **Platform Support**: ✅ **iOS, Android, macOS** (cross-platform!)
- **Language**: TypeScript/TSX (user code), C++ (core engine)
- **Type**: Cross-platform UI framework
- **Status**: Beta (but used in production at Snap for 8 years!)
- **License**: Other (see LICENSE.md in repo)

### Key Features
- **True Native Performance**: Compiles TypeScript directly to native views (no web views, no JS bridges)
- **Cross-Platform**: Write once, run on iOS, Android, and macOS
- **Hot Reload**: Instant hot reload on all platforms
- **TypeScript**: Full TypeScript support with type safety
- **VSCode Debugging**: Full debugging support in VSCode/Cursor
- **View Recycling**: Automatic view pooling for performance
- **Flexible Integration**: Can embed in existing native apps or use standalone

## Actual Valdi Syntax

### Component Structure
```typescript
import { Component } from 'valdi_core/src/Component';

class HelloWorld extends Component {
  onRender() {
    const message = 'Hello World! 👻';
    <view backgroundColor='#FFFC00' padding={30}>
      <label color='black' value={message} />
    </view>;
  }
}
```

### Key Differences from React
- Uses **class-based components** extending `Component`
- Uses **`onRender()` method** instead of `render()` or function return
- Uses **lowercase tags**: `<view>`, `<label>`, `<image>` (not `<View>`, `<Text>`)
- **No JSX return statement** - just write JSX directly in `onRender()`
- Uses **`value` prop** for text content (not children)

### Common Elements
- `<view>` - Container/view element
- `<label>` - Text element (use `value` prop for text)
- `<image>` - Image element
- `<scroll>` - Scrollable container
- `<layout>` - Layout container
- `<slot>` - For component composition

## Installation Instructions

### Prerequisites
- **macOS** (required for iOS development)
- **Xcode** (for iOS/macOS development)
- **Node.js** (for CLI)
- Everything else installs automatically!

### Quick Install
```bash
# Install Valdi CLI globally
npm install -g @snap/valdi

# One-command setup (installs all dependencies)
valdi dev_setup

# Create your first project
mkdir my_project && cd my_project
valdi bootstrap
valdi install ios  # or android or macos
```

### For This Project
```bash
cd mobile_experiments/Valdi
npm install -g @snap/valdi
valdi dev_setup
valdi bootstrap  # if starting fresh
valdi install ios
valdi hotreload  # for development
```

## Project Structure

Valdi projects use a specific structure:
```
my_project/
├── modules/
│   └── my_app/
│       └── src/
│           └── App.tsx
├── platforms/
│   ├── ios/
│   ├── android/
│   └── macos/
└── WORKSPACE
```

## Code Examples

### Basic Hello World (ACTUAL VALDI SYNTAX)
```typescript
import { Component } from 'valdi_core/src/Component';

class App extends Component {
  onRender() {
    <view backgroundColor='white' padding={30}>
      <label 
        color='black' 
        fontSize={32}
        value='Hello, Valdi!' 
      />
      <label 
        color='gray' 
        fontSize={18}
        value='Welcome to your first Valdi app' 
      />
    </view>;
  }
}
```

### With State
```typescript
import { Component } from 'valdi_core/src/Component';

class Counter extends Component {
  private count = 0;

  onRender() {
    <view padding={20}>
      <label value={`Count: ${this.count}`} />
      <view 
        backgroundColor='blue' 
        padding={10}
        onTouchEnd={() => {
          this.count++;
          this.invalidate();
        }}
      >
        <label color='white' value='Increment' />
      </view>
    </view>;
  }
}
```

## API Reference

### Core Concepts
- **Component**: Base class for all UI components
- **onRender()**: Method that returns JSX-like syntax
- **invalidate()**: Method to trigger re-render
- **State**: Use class properties for component state

### Style Attributes
- Use camelCase: `backgroundColor`, `fontSize`, `padding`
- Can use numbers or strings: `padding={30}` or `padding='30px'`
- Colors: hex strings like `'#FFFC00'` or named colors

### Common Props
- `<label>`: `value` (text content), `color`, `fontSize`
- `<view>`: `backgroundColor`, `padding`, `margin`, `onTouchEnd`
- `<image>`: `src`, `width`, `height`

## Resources

### Official Links
- **GitHub**: https://github.com/Snapchat/Valdi
- **Documentation**: https://github.com/Snapchat/Valdi/blob/main/docs/README.md
- **Installation**: https://github.com/Snapchat/Valdi/blob/main/docs/INSTALL.md
- **API Reference**: https://github.com/Snapchat/Valdi/blob/main/docs/api/api-reference-elements.md
- **Quick Reference**: https://github.com/Snapchat/Valdi/blob/main/docs/api/api-quick-reference.md
- **Discord**: https://discord.gg/uJyNEeYX2U

### Community Resources
- **Demo App**: https://github.com/iamnabink/snapchat-valdi-demo-app
- **Component Library**: https://github.com/Snapchat/Valdi_Widgets

### Related Projects
- Valdi_Widgets: Component library for Valdi

## Changelog

### 2024-11-24 (Corrected)
- ✅ Found official GitHub repository
- ✅ Confirmed cross-platform support (iOS, Android, macOS)
- ✅ Confirmed TypeScript/TSX syntax
- ✅ Documented actual Valdi API and syntax
- ✅ Added installation instructions
- ✅ Added code examples with real syntax

### Previous (Incorrect)
- ❌ Incorrectly reported GitHub repo as 404
- ❌ Assumed iOS-only
- ❌ Used placeholder React-like syntax

---

**Note**: Valdi is a real, production-ready framework that's been used at Snap for 8 years. The documentation is comprehensive and the community is active on Discord.
