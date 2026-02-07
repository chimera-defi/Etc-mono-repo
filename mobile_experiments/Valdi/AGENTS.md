# Valdi Application Guide

> **Master rules:** `.cursorrules` | **Token efficiency:** `/token-reduce` skill | **Benchmarks:** `docs/BENCHMARK_MCP_VS_QMD_2026-02-07.md`

## Git Discipline (Required)

- One task = one PR (keep all commits on a single PR branch)
- Never push directly to `main` or `master`
- Create a branch/worktree before changes
- Always use a feature branch + PR
- Enable hooks: `git config core.hooksPath .githooks`

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

## Search & Retrieval Patterns (Valdi-Specific)

**General patterns:** See `.cursor/TOKEN_REDUCTION.md`

```bash
# Scope first with rg
rg -g "*.md" "Valdi" mobile_experiments/Valdi/
rg -g "BUILD.bazel" "target" mobile_experiments/Valdi/

# Ranked snippets when you need discovery
qmd search "Valdi build" -n 5 --files
qmd search "Valdi build" -n 5

# Targeted reads
sed -n '1,160p' mobile_experiments/Valdi/README.md
```

## Token Reduction Bootstrap

```bash
command -v qmd >/dev/null 2>&1 || bun install -g https://github.com/tobi/qmd
```

**Workflow:** Use QMD first for docs/notes, then targeted reads.

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
- After rebasing, force-push with lease if the branch diverges from the PR head.
- Keep one task in one PR; do not create multiple PRs for the same request.
- Always commit changes with a descriptive message and model attribution.
- Record research inputs in `.cursor/artifacts/` or project artifacts to preserve source context.
- Token reduction: use QMD BM25 + `rg -g`; avoid MCP CLI filesystem reads.
- Use Bun by default (prefer `bun` over `node`/`npm`).
- Always do 2-3 quick passes for extra optimization ideas.
