# Agent App Research

Research project for building a native, high-performance mobile app for AI Coding Agents.

## Goal

Create a mobile app with feature parity to Cursor Agents / Background Agents that offers:
- Native performance (60fps, smooth interactions)
- Real-time agent task monitoring
- Code viewing and editing
- Git operations and PR management
- Cross-platform (iOS & Android)

## Research Documents

| Document | Description |
|----------|-------------|
| [FINAL_ARCHITECTURE.md](./FINAL_ARCHITECTURE.md) | ⭐ **Final architecture and implementation plan** |
| [ARCHITECTURE_DECISIONS.md](./ARCHITECTURE_DECISIONS.md) | All 15 architecture decisions |
| [INFRASTRUCTURE_COMPARISON.md](./INFRASTRUCTURE_COMPARISON.md) | Compute & database options compared |
| [BUILD_VS_BUY_ANALYSIS.md](./BUILD_VS_BUY_ANALYSIS.md) | Self-hosted vs managed services |
| [CURSOR_API_RESEARCH.md](./CURSOR_API_RESEARCH.md) | Analysis of Cursor's API availability |
| [ALTERNATIVES_ANALYSIS.md](./ALTERNATIVES_ANALYSIS.md) | Survey of alternative AI coding agents with APIs |
| [CLAUDE_API_CAPABILITIES.md](./CLAUDE_API_CAPABILITIES.md) | Deep dive into Claude API for agent development |
| [FRAMEWORK_RECOMMENDATION.md](./FRAMEWORK_RECOMMENDATION.md) | Mobile framework selection (React Native) |

## Quick Summary

| Option | Feasibility | API Access | Notes |
|--------|-------------|------------|-------|
| **Cursor Direct** | ❌ Low | No public API | Proprietary, no documented API |
| **Claude API Direct** | ✅ High | Full API | Build custom agent using Anthropic API |
| **Open Source Agents** | ✅ High | Open source | Kilo Code, LibreChat, etc. |
| **Hybrid Approach** | ✅ Recommended | Mix | Claude API + Open source tooling |

## Key Findings

1. **Cursor does NOT have a public API** - No documented way to integrate
2. **Claude API is fully available** - Can build equivalent agent functionality
3. **MCP (Model Context Protocol)** - New standard for AI tool integrations
4. **Several open-source agents** with APIs exist as alternatives

## Recommended Stack (Updated Dec 2025)

Based on verified ecosystem data:

| Component | Recommendation | Rationale |
|-----------|----------------|-----------|
| **Mobile Framework** | React Native + Expo ⭐ | 58x more SO Q&A, 18.8M npm downloads/mo |
| **AI Backend** | Claude API (Anthropic) | Same model as Cursor, full tool use support |
| **Tool Protocol** | MCP (Model Context Protocol) | Industry standard, future-proof |
| **State Management** | Zustand + React Query | Battle-tested, TypeScript-first |

### Why React Native over Flutter?

| Factor | React Native | Flutter |
|--------|--------------|---------|
| **StackOverflow Q&A** | 139,433 | 181,988 |
| **npm Downloads/mo** | 18.8M | — |
| **Language** | TypeScript (same as backend) | Dart (different) |
| **AI Training Data** | Massive (TypeScript/React) | Smaller (Dart) |
| **Expo Ecosystem** | 10.5M downloads/mo | — |

> **Note**: Flutter remains excellent for peak graphics performance. See [FRAMEWORK_RECOMMENDATION.md](./FRAMEWORK_RECOMMENDATION.md) for full analysis.

## Quick Start

```bash
# Create new Expo project
npx create-expo-app@latest AgentApp --template tabs
cd AgentApp

# Install key dependencies
npx expo install react-native-reanimated react-native-gesture-handler
npm install @tanstack/react-query zustand axios
npm install react-native-syntax-highlighter react-native-markdown-display

# Start development
npx expo start
```

---

**Status**: Research Phase  
**Last Updated**: December 2025  
**Recommendation Changed**: Flutter → React Native (based on ecosystem data)
