# AGENTS.md - Ideas & Research Projects Guidelines

> **Cross-references:**
> - **`.cursorrules`** - General AI assistant rules (all agents). See Rules #140-155 for MCP CLI integration.
> - **`CLAUDE.md`** - Claude Code-specific instructions and quick reference
> - **`wallets/AGENTS.md`** - Wallet comparison specific guidelines
> - **`mobile_experiments/Valdi/AGENTS.md`** - Valdi framework specific guidelines

This document provides guidance for AI coding assistants working on experimental ideas and research projects.

---

## 📁 Projects in This Directory

### Voice Coding Assistant (Cadence)

**Location:** `ideas/voice-coding-assistant/`

**Purpose:** Voice-controlled coding assistant with multiple platform components:
- **cadence-backend** - Backend API services
- **cadence-api** - API layer
- **cadence-app** - Main application
- **cadence-web** - Web interface
- **cadence-setup** - Setup and configuration
- **cadence-ios** - iOS client
- **cadence-prototype** - Initial prototype/proof of concept

**Status:** Research/prototype phase

### Birthday Bot

**Location:** `ideas/birthday-bot/`

**Purpose:** Unified birthday reminder application
- Cross-platform birthday tracking
- Privacy-first approach
- Automated reminders

**Status:** Idea/planning phase

---

## 🎯 Core Principles for Ideas Work

1. **Document exploration:** Ideas are exploratory - document findings extensively
2. **Store research:** Use knowledge graph to avoid re-researching
3. **Prototype fast:** Focus on rapid iteration and validation
4. **Track learnings:** Capture insights for future projects
5. **Link concepts:** Use knowledge relationships to connect ideas

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

### Why Use MCP CLI for Ideas Work

Ideas projects often involve:
- Exploring multiple related subdirectories (cadence-backend, cadence-app, etc.)
- Reading multiple documentation files
- Researching similar existing solutions
- Tracking evolving architectural decisions

**MCP CLI reduces tokens by 60-80%** for these exploration-heavy workflows.

### Ideas-Specific MCP CLI Patterns

#### Pattern 1: Explore Multi-Component Project Structure

```bash
# Get complete directory tree for voice coding assistant
mcp-cli filesystem/directory_tree '{
  "path": "/home/user/Etc-mono-repo/ideas/voice-coding-assistant"
}'

# Find all package.json files across components
mcp-cli filesystem/search_files '{
  "path": "/home/user/Etc-mono-repo/ideas/voice-coding-assistant",
  "pattern": "**/package.json"
}'

# Find all README files
mcp-cli filesystem/search_files '{
  "path": "/home/user/Etc-mono-repo/ideas",
  "pattern": "**/*.md"
}'
```

**Token Savings:** ~80% vs recursive directory exploration

#### Pattern 2: Bulk Read Project Documentation

```bash
# Read all ideas documentation at once
mcp-cli filesystem/read_multiple_files '{
  "paths": [
    "ideas/README.md",
    "ideas/birthday-bot/README.md",
    "ideas/voice-coding-assistant/README.md"
  ]
}'

# Read multiple cadence component configs
mcp-cli filesystem/read_multiple_files '{
  "paths": [
    "ideas/voice-coding-assistant/cadence-backend/package.json",
    "ideas/voice-coding-assistant/cadence-app/package.json",
    "ideas/voice-coding-assistant/cadence-web/package.json"
  ]
}'
```

**Token Savings:** ~66% (1 call vs N calls)

#### Pattern 3: Search Across All Ideas

```bash
# Find all TypeScript files in ideas
mcp-cli filesystem/search_files '{
  "path": "/home/user/Etc-mono-repo/ideas",
  "pattern": "**/*.ts"
}'

# Find all documentation
mcp-cli filesystem/search_files '{
  "path": "/home/user/Etc-mono-repo/ideas",
  "pattern": "**/*.md"
}'

# Find all configuration files
mcp-cli filesystem/search_files '{
  "path": "/home/user/Etc-mono-repo/ideas",
  "pattern": "**/*config*"
}'
```

**Token Savings:** ~70% vs manual exploration

#### Pattern 4: Store Ideas Research (CRITICAL)

**Store findings to build cumulative knowledge:**

```bash
# Store voice coding assistant architecture
mcp-cli memory/create_entities '{
  "entities": [
    {
      "name": "Voice Coding Assistant Architecture",
      "entityType": "idea",
      "observations": [
        "Multi-component system: backend, API, app, web, iOS",
        "Prototype phase: testing feasibility",
        "Voice-controlled coding workflow",
        "Multiple platform targets",
        "Research: existing voice coding solutions"
      ]
    }
  ]
}'

# Store cadence component breakdown
mcp-cli memory/create_entities '{
  "entities": [
    {
      "name": "Cadence Components",
      "entityType": "architecture",
      "observations": [
        "cadence-backend: Backend API services",
        "cadence-api: API layer abstraction",
        "cadence-app: Main application logic",
        "cadence-web: Web-based interface",
        "cadence-setup: Configuration and setup",
        "cadence-ios: Native iOS client",
        "cadence-prototype: Initial proof of concept"
      ]
    }
  ]
}'

# Store birthday bot concept
mcp-cli memory/create_entities '{
  "entities": [
    {
      "name": "Birthday Bot Idea",
      "entityType": "idea",
      "observations": [
        "Unified birthday reminder app",
        "Cross-platform: mobile, web, notifications",
        "Privacy-first: local storage preferred",
        "Automated reminders with customization",
        "Integration with calendars"
      ]
    }
  ]
}'

# Store research findings
mcp-cli memory/create_entities '{
  "entities": [
    {
      "name": "Voice Coding Research Findings",
      "entityType": "research",
      "observations": [
        "Existing: GitHub Copilot Voice, Talon Voice",
        "Challenge: Accurate intent recognition",
        "Challenge: Natural language to code translation",
        "Opportunity: Hands-free development workflow",
        "Opportunity: Accessibility improvements"
      ]
    }
  ]
}'

# Create relationships between concepts
mcp-cli memory/create_relations '{
  "relations": [
    {"from": "Voice Coding Assistant Architecture", "to": "Cadence Components", "relationType": "composed_of"},
    {"from": "Cadence Components", "to": "cadence-backend", "relationType": "includes"},
    {"from": "Voice Coding Assistant Architecture", "to": "Voice Coding Research Findings", "relationType": "informed_by"}
  ]
}'
```

**Token Savings:** ~90% across sessions (store once, query many times)

#### Pattern 5: Query Ideas Knowledge Before Starting

**ALWAYS query first to leverage existing research:**

```bash
# Search for voice coding knowledge
mcp-cli memory/search_nodes '{"query": "voice coding"}'
mcp-cli memory/search_nodes '{"query": "cadence"}'

# Search for birthday bot knowledge
mcp-cli memory/search_nodes '{"query": "birthday"}'

# Get specific idea entities
mcp-cli memory/open_nodes '{
  "names": ["Voice Coding Assistant Architecture", "Birthday Bot Idea"]
}'

# Read entire knowledge graph to see all ideas
mcp-cli memory/read_graph '{}'
```

**Token Savings:** ~95% vs re-reading documentation

### Ideas Work Checklist with MCP CLI

When working on ideas/research tasks:

1. **🔥 Query knowledge first:** Check `memory/search_nodes` for existing research
2. **Explore structure:** Use `directory_tree` for multi-component projects
3. **Batch doc reads:** Use `read_multiple_files` for READMEs, configs
4. **Store discoveries:** Use `memory/create_entities` for all research findings
5. **Link concepts:** Use `memory/create_relations` to connect related ideas
6. **Search globally:** Use `search_files` to find patterns across all ideas

### Example: Researching Voice Coding Assistant

**Traditional approach (inefficient):**
```
Read ideas/README.md (full)
→ Read voice-coding-assistant/README.md (full)
→ ls cadence-backend/
→ ls cadence-app/
→ Read multiple package.json files individually
→ Research voice coding solutions manually
→ Repeat research in next session
```

**MCP CLI approach (efficient):**
```bash
# 1. Query existing knowledge
mcp-cli memory/search_nodes '{"query": "voice coding"}'
mcp-cli memory/search_nodes '{"query": "cadence"}'

# 2. Explore structure in one call
mcp-cli filesystem/directory_tree '{
  "path": "/home/user/Etc-mono-repo/ideas/voice-coding-assistant"
}'

# 3. Batch read key files
mcp-cli filesystem/read_multiple_files '{
  "paths": [
    "ideas/README.md",
    "ideas/voice-coding-assistant/README.md"
  ]
}'

# 4. Find all configs with pattern search
mcp-cli filesystem/search_files '{
  "path": "/home/user/Etc-mono-repo/ideas/voice-coding-assistant",
  "pattern": "**/package.json"
}'

# 5. Store findings for future sessions
mcp-cli memory/create_entities '{
  "entities": [
    {
      "name": "Cadence Architecture Decisions",
      "entityType": "decisions",
      "observations": [
        "Modular architecture: separate backend, API, apps",
        "Platform diversity: web, iOS, prototype",
        "API layer abstracts backend from clients"
      ]
    }
  ]
}'
```

**Token Savings:** ~80% vs traditional approach + persistent across sessions

### Ideas-Specific Knowledge to Store

Store these entity types to build cumulative knowledge:

1. **Ideas:** Core concept, target users, key features
2. **Research:** Existing solutions, gaps, opportunities
3. **Architecture:** Component breakdown, tech stack decisions
4. **Decisions:** Why certain approaches were chosen
5. **Challenges:** Known issues, blockers, open questions
6. **Learnings:** Insights from prototyping, user feedback

### Research Workflow Integration

When researching new ideas:

```bash
# Store competitive analysis
mcp-cli memory/create_entities '{
  "entities": [
    {
      "name": "Voice Coding Competitors",
      "entityType": "competitive_analysis",
      "observations": [
        "GitHub Copilot Voice: Microsoft, integrated with VS Code",
        "Talon Voice: Community-driven, highly customizable",
        "Serenade: Dedicated voice coding tool",
        "Gap: No open-source, self-hostable solution",
        "Gap: Limited natural language understanding"
      ]
    }
  ]
}'

# Store technical exploration results
mcp-cli memory/create_entities '{
  "entities": [
    {
      "name": "Cadence Prototype Learnings",
      "entityType": "learnings",
      "observations": [
        "Speech recognition: Web Speech API vs dedicated service",
        "Intent parsing: Need NLP layer for code generation",
        "Latency: <500ms response time critical for UX",
        "Accuracy: Context awareness improves intent recognition",
        "Offline: Local model needed for privacy"
      ]
    }
  ]
}'

# Store next steps
mcp-cli memory/create_entities '{
  "entities": [
    {
      "name": "Voice Coding Next Steps",
      "entityType": "roadmap",
      "observations": [
        "Validate prototype with 5 developers",
        "Test multiple speech recognition APIs",
        "Build intent classification model",
        "Benchmark against Copilot Voice",
        "Define MVP feature set"
      ]
    }
  ]
}'
```

This creates an evolving knowledge base that captures the full research journey.

### Example: Birthday Bot Research

```bash
# Store idea concept
mcp-cli memory/create_entities '{
  "entities": [
    {
      "name": "Birthday Bot Features",
      "entityType": "features",
      "observations": [
        "Cross-platform: mobile, web, desktop",
        "Privacy: local-first data storage",
        "Reminders: customizable timing (1 week, 1 day, morning-of)",
        "Calendar integration: import from Google, Apple, Outlook",
        "Contact sync: optional permission-based",
        "Gift suggestions: AI-powered recommendations"
      ]
    }
  ]
}'

# Store technical stack research
mcp-cli memory/create_entities '{
  "entities": [
    {
      "name": "Birthday Bot Tech Stack Options",
      "entityType": "technical_research",
      "observations": [
        "Frontend: React Native for mobile + web",
        "Backend: Optional serverless for calendar sync",
        "Storage: Local SQLite + optional cloud sync",
        "Notifications: Push notifications via FCM/APNs",
        "Calendar APIs: Google Calendar API, Apple EventKit"
      ]
    }
  ]
}'
```

### Cross-Project Pattern Recognition

Use MCP CLI memory to recognize patterns across ideas:

```bash
# Store cross-project patterns
mcp-cli memory/create_entities '{
  "entities": [
    {
      "name": "Common Ideas Patterns",
      "entityType": "meta_patterns",
      "observations": [
        "Multi-component architecture: backend + multiple frontends",
        "Privacy-first: local storage with optional sync",
        "Cross-platform: target mobile, web, desktop",
        "API abstraction: separate API layer from backend",
        "Prototype-first: validate before full build"
      ]
    }
  ]
}'

# Query for patterns when starting new ideas
mcp-cli memory/search_nodes '{"query": "patterns"}'
```

This enables learning from past ideas to inform new ones.

### See Also

- **Full MCP CLI Documentation:** `/home/user/Etc-mono-repo/mcp-cli-evaluation.md`
- **General MCP CLI Guidelines:** See CLAUDE.md "MCP CLI Integration" section
- **Rules:** See `.cursorrules` Rules #140-155

---

## 📝 Best Practices for Ideas Work

1. **Document everything:** Ideas evolve - capture decisions, rationale, alternatives
2. **Store research immediately:** Don't wait - add to knowledge graph as you learn
3. **Link related concepts:** Use relations to show how ideas connect
4. **Track dead ends:** Store what didn't work and why (prevents repeating mistakes)
5. **Iterate quickly:** Use MCP CLI for fast exploration, store learnings, iterate

---

## 🔄 Working with Multiple Components

For multi-component projects like Cadence:

```bash
# 1. Get overview
mcp-cli filesystem/directory_tree '{
  "path": "/home/user/Etc-mono-repo/ideas/voice-coding-assistant"
}'

# 2. Find common files across components
mcp-cli filesystem/search_files '{
  "path": "/home/user/Etc-mono-repo/ideas/voice-coding-assistant",
  "pattern": "**/package.json"
}'

# 3. Batch read all found files
# (Use paths from previous result)
mcp-cli filesystem/read_multiple_files '{
  "paths": [...]
}'

# 4. Store component relationships
mcp-cli memory/create_relations '{
  "relations": [
    {"from": "cadence-app", "to": "cadence-api", "relationType": "depends_on"},
    {"from": "cadence-api", "to": "cadence-backend", "relationType": "depends_on"},
    {"from": "cadence-web", "to": "cadence-api", "relationType": "depends_on"},
    {"from": "cadence-ios", "to": "cadence-api", "relationType": "depends_on"}
  ]
}'
```

---

*Last updated: January 10, 2026*
