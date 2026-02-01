# Valdi Application Guide

> **Master rules:** `.cursorrules` | **MCP CLI:** `.cursor/MCP_CLI.md` | **Token efficiency:** `/token-reduce` skill

## Overview

Cross-platform UI framework (iOS, Android, macOS). TSX compiles to native views - no web views, no JS bridges.

## Project Structure

```
modules/         # Application modules with src/
BUILD.bazel      # Build rules per module
WORKSPACE        # Bazel workspace config
config.yaml      # Valdi project config
.bazelrc         # Bazel build flags
```

## Key Technologies

- **Valdi** - Compiles TSX to native code
- **TypeScript/TSX** - React-like syntax (but native, not React)
- **Bazel** - Build system (`bzl` = `bazel`)
- **Flexbox** - Layout with automatic RTL support

## CLI Commands

```bash
# Setup
valdi dev_setup                    # Initial setup
valdi projectsync                  # Sync after config changes

# Build & Run
valdi install ios|android|macos    # Build and install
valdi hotreload                    # Fast development iteration

# Bazel direct
bazel build //modules/path:target
bazel test //modules/path:tests
bazel clean                        # Clear cache if stuck
```

## Component Pattern

```typescript
import { Component } from 'valdi_core/src/Component';

class MyComponent extends Component {
  onRender() {
    <view backgroundColor="#FFFC00" padding={30}>
      <label value="Hello World" color="black" />
    </view>;
  }

  // Lifecycle: onMount(), onUnmount(), onUpdate(prevProps)
}
```

**Key concepts:**
- Lowercase tags: `<view>`, `<label>` (not `<View>`)
- Class-based with `onRender()` method
- Flexbox layout properties
- `setState()` triggers re-renders
- Provider pattern for dependency injection

## Standard Library

| Module | Purpose |
|--------|---------|
| valdi_core | Core component/runtime APIs |
| valdi_http | HTTP client |
| valdi_navigation | Navigation utilities |
| valdi_rxjs | Reactive programming |
| persistence | Key-value storage |
| foundation, coreutils | Utilities |
| worker | Background JS execution |

## Common Pitfalls

1. Run `valdi projectsync` after config changes
2. Use hot reload for development
3. Flexbox layout (not native iOS/Android layout)
4. Call `setState()` to trigger re-renders
5. Try `bazel clean` if builds stuck

## MCP CLI Patterns (Valdi-Specific)

**General patterns:** See `.cursor/MCP_CLI.md`

```bash
# Explore structure
mcp-cli filesystem/directory_tree '{"path": "mobile_experiments/Valdi"}'

# Find BUILD files
mcp-cli filesystem/search_files '{"path": "mobile_experiments/Valdi", "pattern": "**/BUILD.bazel"}'

# Batch read configs
mcp-cli filesystem/read_multiple_files '{"paths": ["mobile_experiments/Valdi/config.yaml", "mobile_experiments/Valdi/WORKSPACE"]}'

# Store Valdi knowledge
mcp-cli memory/create_entities '{"entities": [{"name": "Valdi Pattern", "entityType": "pattern", "observations": ["key insight"]}]}'
```

## Key Points

1. **NOT React/React Native** - TSX compiles to native
2. **Use `valdi` CLI** - Primary tool
3. **Hot reload is fast** - Use for rapid iteration
4. **Cross-platform by default** - iOS, Android, macOS

## Resources

- **Docs:** `/docs/` in Valdi repo
- **Discord:** [discord.gg/uJyNEeYX2U](https://discord.gg/uJyNEeYX2U)
- **Examples:** `/apps/` in Valdi repo
- **GitHub:** [github.com/Snapchat/Valdi](https://github.com/Snapchat/Valdi)

## Meta Learnings

- Always open a PR for changes; do not push directly to main.
- Always pull latest `main` and rebase your branch on `main` at the start of each new request.
