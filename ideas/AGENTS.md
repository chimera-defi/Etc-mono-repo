# Ideas & Research Guide

> **Master rules:** `.cursorrules` | **MCP CLI:** `.cursor/MCP_CLI.md` | **Token efficiency:** `/token-reduce` skill

## Projects

### Voice Coding Assistant (Cadence)
**Location:** `ideas/voice-coding-assistant/`

Multi-platform voice-controlled coding assistant:
- cadence-backend - Backend services
- cadence-api - API layer
- cadence-app - Main application
- cadence-web - Web interface
- cadence-ios - iOS client
- cadence-prototype - POC

**Status:** Research/prototype phase

### Birthday Bot
**Location:** `ideas/birthday-bot/`

Unified birthday reminder application:
- Cross-platform tracking
- Privacy-first approach
- Automated reminders

**Status:** Idea/planning phase

## Core Principles

1. **Document exploration** - Capture findings extensively
2. **Store research** - Use knowledge graph
3. **Prototype fast** - Rapid iteration
4. **Track learnings** - Capture insights
5. **Link concepts** - Connect related ideas

## MCP CLI Patterns (Ideas-Specific)

**General patterns:** See `.cursor/MCP_CLI.md`

```bash
# Explore multi-component projects
mcp-cli filesystem/directory_tree '{"path": "ideas/voice-coding-assistant"}'

# Find all package.json across components
mcp-cli filesystem/search_files '{"path": "ideas/voice-coding-assistant", "pattern": "**/package.json"}'

# Batch read docs
mcp-cli filesystem/read_multiple_files '{"paths": ["ideas/README.md", "ideas/voice-coding-assistant/README.md"]}'

# Store idea concepts
mcp-cli memory/create_entities '{"entities": [{"name": "Idea Name", "entityType": "idea", "observations": ["concept", "target users", "key features"]}]}'

# Store competitive analysis
mcp-cli memory/create_entities '{"entities": [{"name": "Competitors", "entityType": "research", "observations": ["Competitor1: description", "Gap: opportunity"]}]}'

# Link related concepts
mcp-cli memory/create_relations '{"relations": [{"from": "Idea", "to": "Component", "relationType": "composed_of"}]}'
```

## Research Workflow

1. **Query existing knowledge** - Check memory first
2. **Explore structure** - Use directory_tree
3. **Batch read** - Use read_multiple_files
4. **Store findings** - create_entities immediately
5. **Link concepts** - create_relations to connect ideas
6. **Track dead ends** - Store what didn't work

## Knowledge to Store

| Type | Content |
|------|---------|
| Ideas | Core concept, target users, features |
| Research | Existing solutions, gaps, opportunities |
| Architecture | Components, tech stack decisions |
| Decisions | Rationale, alternatives considered |
| Challenges | Blockers, open questions |
| Learnings | Prototype insights, feedback |

## Multi-Component Projects

For projects like Cadence:

```bash
# 1. Get overview
mcp-cli filesystem/directory_tree '{"path": "ideas/voice-coding-assistant"}'

# 2. Find common files
mcp-cli filesystem/search_files '{"path": "ideas/voice-coding-assistant", "pattern": "**/package.json"}'

# 3. Store component relationships
mcp-cli memory/create_relations '{"relations": [
  {"from": "cadence-app", "to": "cadence-api", "relationType": "depends_on"},
  {"from": "cadence-api", "to": "cadence-backend", "relationType": "depends_on"}
]}'
```

## Best Practices

1. Document everything - ideas evolve
2. Store research immediately
3. Link related concepts
4. Track dead ends (prevent repeating mistakes)
5. Iterate quickly with MCP CLI

## Meta Learnings

- Always commit changes with a self-chosen message; do not ask for one.
