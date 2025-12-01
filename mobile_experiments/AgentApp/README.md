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
| [CURSOR_API_RESEARCH.md](./CURSOR_API_RESEARCH.md) | Analysis of Cursor's API availability |
| [ALTERNATIVES_ANALYSIS.md](./ALTERNATIVES_ANALYSIS.md) | Survey of alternative AI coding agents with APIs |
| [MOBILE_ARCHITECTURE.md](./MOBILE_ARCHITECTURE.md) | Proposed mobile app architecture |
| [FRAMEWORK_RECOMMENDATION.md](./FRAMEWORK_RECOMMENDATION.md) | Framework selection for the agent app |

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

## Recommended Path

Build a custom AI coding agent mobile app using:
1. **Claude API** (Anthropic) for the AI backbone
2. **MCP Protocol** for tool integrations
3. **Flutter or React Native** for native mobile performance
4. **Open source tooling** from Kilo Code / LibreChat ecosystems

---

**Status**: Research Phase  
**Last Updated**: December 2024
