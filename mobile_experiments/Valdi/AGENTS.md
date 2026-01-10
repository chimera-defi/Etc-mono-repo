# AGENTS.md - Guide for AI Coding Assistants

> **Cross-references:**
> - **`.cursorrules`** - General AI assistant rules (all agents). See Rules #52-59 for Valdi framework notes.
> - **`CLAUDE.md`** - Claude Code-specific instructions and quick reference
> - **`wallets/AGENTS.md`** - Wallet comparison specific guidelines

This document provides context and guidelines for AI coding assistants working on this Valdi application.

## Overview

This is a Valdi application that runs natively on iOS, Android, and macOS. Valdi is a cross-platform UI framework that compiles declarative TypeScript components to native views - no web views, no JavaScript bridges.

## Project Structure

- **`modules/`** - Your application modules
  - Each module contains TypeScript/TSX source files
  - `BUILD.bazel` files define how modules are built
  - `src/` contains your component and business logic code
- **`WORKSPACE`** - Bazel workspace configuration
- **`config.yaml`** - Valdi project configuration
- **`.bazelrc`** - Bazel build settings

## Key Technologies

- **Valdi** - Cross-platform UI framework that compiles to native code
- **TypeScript/TSX** - React-like syntax for declarative UI (but compiles to native, not React)
- **Bazel** - Build system (note: `bzl` is an alias for `bazel`)
- **Flexbox** - Layout system with automatic RTL support

## Development Workflow

### Initial Setup

```bash
# Install Valdi CLI (if not already installed)
cd path/to/valdi/npm_modules/cli
npm run cli:install

# Setup development environment
valdi dev_setup

# Sync project (run after changing dependencies or config)
valdi projectsync
```

### Building and Running

```bash
# Install and run on iOS
valdi install ios

# Install and run on Android  
valdi install android

# Install and run on macOS
valdi install macos

# Start hot reload (for instant updates while developing)
valdi hotreload
```

### Common Commands

```bash
# Sync project configuration and generate IDE files
valdi projectsync

# Build specific targets with Bazel
bazel build //modules/snapchat_valdi:snapchat_valdi

# Run tests
bazel test //modules/snapchat_valdi:tests
```

## Valdi Component Basics

Components use a class-based pattern with lifecycle methods:

```typescript
import { Component } from 'valdi_core/src/Component';

class MyComponent extends Component {
  // Required: Render the component's UI
  onRender() {
    <view backgroundColor="#FFFC00" padding={30}>
      <label value="Hello World" color="black" />
    </view>;
  }
  
  // Optional lifecycle methods:
  // onMount() - Called when component is first mounted
  // onUnmount() - Called before component is removed
  // onUpdate(prevProps) - Called when component updates
}
```

### Key Concepts

- **TSX/JSX Syntax** - Similar to React but compiles to native views
- **State Management** - Use component properties and setState
- **Flexbox Layout** - Use flexbox properties for layout
- **Event Handlers** - Handle user interactions with callbacks
- **Provider Pattern** - Dependency injection for passing services down the component tree

## Common Patterns

### Styling Components

```typescript
<view 
  backgroundColor="#FFFFFF"
  padding={20}
  flexDirection="column"
  alignItems="center"
>
  <label value="Styled text" fontSize={16} color="#000000" />
</view>
```

### Handling Events

```typescript
class MyButton extends Component {
  private handlePress() {
    console.log('Button pressed!');
  }
  
  onRender() {
    <view onPress={() => this.handlePress()}>
      <label value="Click Me" />
    </view>;
  }
}
```

### Using Providers

```typescript
import { Provider } from 'valdi_core/src/Provider';

class App extends Component {
  onRender() {
    const myService = new MyService();
    
    <Provider value={myService}>
      <MyChildComponent />
    </Provider>;
  }
}
```

## Available Standard Library Modules

- `valdi_core` - Core component and runtime APIs
- `valdi_http` - Promise-based HTTP client for network requests
- `valdi_navigation` - Navigation utilities
- `valdi_rxjs` - RxJS integration for reactive programming
- `persistence` - Key-value storage with encryption and TTL support
- `foundation`, `coreutils` - Common utilities (arrays, Base64, LRU cache, UUID, etc.)
- `worker` - Worker service support for background JavaScript execution

## Debugging

- **VSCode Integration** - Set breakpoints and debug TypeScript code
- **Hermes Debugger** - Use Chrome DevTools for JavaScript debugging
- **Hot Reload** - See changes instantly without rebuilding
- **Native Debugging** - Use Xcode or Android Studio for platform-specific issues

See Valdi documentation at `/docs/docs/workflow-hermes-debugger.md` for detailed debugging instructions.

## Common Pitfalls

1. **Always run `valdi projectsync`** after changing dependencies or config files
2. **Use hot reload during development** - Much faster than rebuilding
3. **Flexbox layout** - Valdi uses flexbox, not native iOS/Android layout
4. **Component state** - Remember to call `setState()` to trigger re-renders
5. **Build cache** - If builds seem stuck, try `bazel clean`

## Important Files

- **`config.yaml`** - Project configuration (dependencies, settings)
- **`WORKSPACE`** - Bazel workspace and external dependencies
- **`BUILD.bazel`** - Build rules for each module
- **`.bazelrc`** - Bazel build flags and configuration

## Getting Help

- **Documentation** - Valdi docs in the framework repository at `/docs/`
- **Discord** - Join the [Valdi Discord community](https://discord.gg/uJyNEeYX2U)
- **Examples** - Check `/apps/` directory in Valdi repository for examples
- **API Reference** - See `/docs/api/` for comprehensive API documentation
- **Codelabs** - Step-by-step tutorials at `/docs/codelabs/`

## Key Points for AI Assistants

1. **This is a Valdi application** - Not React, React Native, or web-based
2. **TSX compiles to native** - No JavaScript runtime on device, components are compiled
3. **Use `valdi` CLI commands** - Primary tool for building and running
4. **Hot reload is fast** - Encourage using it for rapid iteration
5. **Bazel is the build system** - Direct bazel commands available but CLI preferred
6. **Cross-platform by default** - Code runs on iOS, Android, and macOS
7. **🔥 USE MCP CLI for token efficiency** - See section below for Valdi-specific patterns

---

## 🚀 MCP CLI for Token Efficiency (CRITICAL)

### Installation (REQUIRED BEFORE USE)

**CRITICAL:** MCP CLI must be installed before any `mcp-cli` commands are executed, or you'll get exit code 127 (command not found).

#### Check if MCP CLI is Already Installed

```bash
which mcp-cli
mcp-cli --version
```

If you see `v0.1.3` or higher, MCP CLI is installed. Otherwise, proceed with installation.

#### Install MCP CLI

```bash
curl -fsSL https://raw.githubusercontent.com/philschmid/mcp-cli/main/install.sh | bash
```

After installation, verify with `mcp-cli --version`.

**See also:** Full installation instructions in `CLAUDE.md` "MCP CLI Integration" section and `.cursorrules` Rules #140-141.

### Why Use MCP CLI for Valdi Development

Valdi projects have specific structure requirements (BUILD.bazel files, modules/, WORKSPACE, config.yaml, etc.). **MCP CLI reduces tokens by 60-80%** when exploring and working with this structure.

### Valdi-Specific MCP CLI Patterns

#### Pattern 1: Explore Valdi Project Structure

```bash
# Get complete directory tree
mcp-cli filesystem/directory_tree '{
  "path": "/home/user/Etc-mono-repo/mobile_experiments/Valdi"
}'

# Find all BUILD.bazel files
mcp-cli filesystem/search_files '{
  "path": "/home/user/Etc-mono-repo/mobile_experiments/Valdi",
  "pattern": "**/BUILD.bazel"
}'

# Find all TypeScript component files
mcp-cli filesystem/search_files '{
  "path": "/home/user/Etc-mono-repo/mobile_experiments/Valdi/modules",
  "pattern": "**/*.ts"
}'
```

**Token Savings:** ~80% vs recursive directory exploration

#### Pattern 2: Bulk Read Valdi Configuration

```bash
# Read all config files at once
mcp-cli filesystem/read_multiple_files '{
  "paths": [
    "mobile_experiments/Valdi/config.yaml",
    "mobile_experiments/Valdi/WORKSPACE",
    "mobile_experiments/Valdi/.bazelrc",
    "mobile_experiments/Valdi/package.json"
  ]
}'
```

**Token Savings:** ~66% (1 call vs 4 calls)

#### Pattern 3: Search Valdi Documentation

```bash
# Find all Valdi docs
mcp-cli filesystem/search_files '{
  "path": "/home/user/Etc-mono-repo/mobile_experiments/Valdi",
  "pattern": "**/*.md"
}'

# Read specific sections of large docs
mcp-cli filesystem/read_text_file '{
  "path": "/home/user/Etc-mono-repo/mobile_experiments/Valdi/AGENTS.md",
  "head": 100
}'
```

**Token Savings:** ~70% for discovery + selective reading

#### Pattern 4: Store Valdi Knowledge

**CRITICAL:** Store Valdi-specific knowledge to avoid re-researching framework details.

```bash
# Store Valdi architecture knowledge
mcp-cli memory/create_entities '{
  "entities": [
    {
      "name": "Valdi Framework Architecture",
      "entityType": "architecture",
      "observations": [
        "Cross-platform: iOS, Android, macOS",
        "TSX compiles to native (not web views)",
        "Bazel build system",
        "Class-based components with onRender() method",
        "Lowercase tags: <view>, <label>, not <View>, <Label>",
        "Hot reload for fast iteration"
      ]
    }
  ]
}'

# Store Valdi project structure requirements
mcp-cli memory/create_entities '{
  "entities": [
    {
      "name": "Valdi Project Structure",
      "entityType": "structure",
      "observations": [
        "modules/ - application modules with src/",
        "BUILD.bazel - build rules for each module",
        "WORKSPACE - Bazel workspace config",
        "config.yaml - Valdi project config",
        ".bazelrc - Bazel build flags",
        "Must run valdi projectsync after config changes"
      ]
    }
  ]
}'

# Store Valdi CLI commands
mcp-cli memory/create_entities '{
  "entities": [
    {
      "name": "Valdi CLI Commands",
      "entityType": "commands",
      "observations": [
        "valdi dev_setup - initial setup",
        "valdi projectsync - sync after config changes",
        "valdi install ios/android/macos - build and install",
        "valdi hotreload - fast development iteration",
        "bazel build //modules/path:target - direct build",
        "bazel clean - clear build cache"
      ]
    }
  ]
}'

# Store common Valdi patterns
mcp-cli memory/create_entities '{
  "entities": [
    {
      "name": "Valdi Component Patterns",
      "entityType": "patterns",
      "observations": [
        "Class extends Component",
        "onRender() method returns TSX",
        "Lifecycle: onMount(), onUnmount(), onUpdate()",
        "Provider pattern for dependency injection",
        "Flexbox layout with RTL support",
        "setState() for re-renders"
      ]
    }
  ]
}'
```

**Token Savings:** ~90% across sessions (store once, query many times)

#### Pattern 5: Query Valdi Knowledge Before Working

**ALWAYS query first:**

```bash
# Check for existing Valdi knowledge
mcp-cli memory/search_nodes '{"query": "Valdi"}'
mcp-cli memory/search_nodes '{"query": "Bazel"}'
mcp-cli memory/search_nodes '{"query": "components"}'

# Get specific Valdi entities
mcp-cli memory/open_nodes '{
  "names": ["Valdi Framework Architecture", "Valdi Project Structure"]
}'
```

**Token Savings:** ~95% vs re-reading documentation

### Valdi Work Checklist with MCP CLI

When working on Valdi tasks:

1. **🔥 Query knowledge first:** Check `memory/search_nodes` for Valdi knowledge
2. **Explore structure:** Use `directory_tree` to understand project layout
3. **Batch config reads:** Use `read_multiple_files` for BUILD.bazel, config.yaml, etc.
4. **Store discoveries:** Use `memory/create_entities` when learning new Valdi patterns
5. **Search efficiently:** Use `search_files` for BUILD.bazel files, TypeScript components
6. **Read selectively:** For large docs, use `head`/`tail` parameters

### Example: Adding a New Valdi Component

**Traditional approach (inefficient):**
```
Read AGENTS.md (full file)
→ Read config.yaml
→ Read BUILD.bazel
→ Read example component
→ Research Valdi component lifecycle
→ Write component
```

**MCP CLI approach (efficient):**
```bash
# 1. Query existing Valdi knowledge
mcp-cli memory/search_nodes '{"query": "Valdi component"}'

# 2. If needed, batch read related files
mcp-cli filesystem/read_multiple_files '{
  "paths": [
    "mobile_experiments/Valdi/modules/snapchat_valdi/BUILD.bazel",
    "mobile_experiments/Valdi/config.yaml"
  ]
}'

# 3. Store new pattern if discovered
mcp-cli memory/create_entities '{
  "entities": [{"name": "NewValdiPattern", "entityType": "pattern", "observations": [...]}]
}'
```

**Token Savings:** ~75% vs traditional approach

### Valdi-Specific Knowledge to Store

Store these entity types to build cumulative knowledge:

1. **Architecture:** Framework design, compilation process, platform support
2. **Structure:** Project layout, required files, module organization
3. **Commands:** CLI commands, Bazel commands, workflow steps
4. **Patterns:** Component patterns, lifecycle methods, Provider pattern
5. **Pitfalls:** Common mistakes, build issues, debugging tips
6. **Libraries:** Available standard library modules (valdi_core, valdi_http, etc.)

### Integration with Valdi Workflow

When developing Valdi components:

```bash
# Store build discoveries
mcp-cli memory/create_entities '{
  "entities": [
    {
      "name": "Valdi Build Process",
      "entityType": "workflow",
      "observations": [
        "valdi projectsync regenerates BUILD files",
        "Hot reload fastest for development",
        "bazel clean fixes stuck builds",
        "VSCode integration for debugging",
        "Hermes debugger with Chrome DevTools"
      ]
    }
  ]
}'

# Store component learnings
mcp-cli memory/add_observations '{
  "observations": [
    {
      "entityName": "Valdi Component Patterns",
      "contents": [
        "Event handlers use arrow functions: onPress={() => this.handlePress()}",
        "Styling properties passed directly to elements",
        "Flexbox layout: flexDirection, alignItems, justifyContent"
      ]
    }
  ]
}'
```

This creates a knowledge base that improves with every Valdi task.

### See Also

- **Full MCP CLI Documentation:** `/home/user/Etc-mono-repo/mcp-cli-evaluation.md`
- **General MCP CLI Guidelines:** See CLAUDE.md "MCP CLI Integration" section
- **Rules:** See `.cursorrules` Rules #140-155

---

*This document is intended for AI coding assistants to quickly understand this Valdi application. For comprehensive Valdi framework documentation, refer to the main Valdi repository at https://github.com/Snapchat/Valdi*

