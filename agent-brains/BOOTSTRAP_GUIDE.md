# Agent Brains Bootstrap Guide

Learn from previous backup patterns in `ai_memory/bootstrap/` — this guide shows how to restructure agent backups following the proven approach.

## Previous Approach (ai_memory/bootstrap/)

The repo already uses a manifest-based backup pattern for takopi and openclaw_clawdbot:

**Key Components:**
- `export.manifest.json` — JSON schema with copy/write_template operations
- `*.template` files — Config templates with placeholder variables
- `AGENT_IMPORT.md` — Human-readable runbook for imports
- `install_seed.sh` — Automated installation script
- Never commits real secrets (placeholders only)

**Reference:**
- Location: `ai_memory/bootstrap/openclaw_clawdbot_seed/`
- PR: #210 (commit e0312d8)

## What to Adopt for Claudy

### 1. Use Manifest-Based Imports
Instead of flat copy, define structured operations:
```json
{
  "schema": "ai-memory-export/v1",
  "export_id": "claudy-v1",
  "steps": [
    { "op": "copy", "source": "SOUL.md", "target": "SOUL.md" },
    { "op": "copy", "source": "docs/", "target": "docs/" },
    { "op": "write_template", "source": "config.template", "target": "/root/.openclaw/config.json" }
  ]
}
```

### 2. Separate Templates from Secrets
- Store `*.template` files with placeholders
- Never commit real API keys, tokens, credentials
- Let import automation handle secret substitution

### 3. Provide Agent-Consumable Runbooks
- `AGENT_IMPORT.md` — Clear rules agents can execute
- `install_seed.sh` — Bash automation
- `export.manifest.json` — Machine-readable contract

### 4. Keep Exports in Dedicated Directory
- `agent-brains/claudy-v1/` follows pattern
- But should nest under `ai_memory/bootstrap/claudy_seed/`
- Alongside takopi and openclaw_clawdbot

## Proposed Reorganization

```
ai_memory/
├── bootstrap/
│   ├── AGENT_EXPORTS.md          (updated)
│   ├── openclaw_clawdbot_seed/   (existing)
│   ├── takopi_seed/              (existing)
│   └── claudy_seed/              (NEW - restructured)
│       ├── SOUL.md
│       ├── AGENTS.md
│       ├── docs/
│       ├── scripts/
│       ├── export.manifest.json
│       ├── install_seed.sh
│       └── AGENT_IMPORT.md
├── openclaw_clawdbot_runtime_backup.md
├── takopi_runtime_backup.md
└── claudy_runtime_backup.md      (NEW)
```

## Benefits of This Approach

✅ **Agent-Consumable** — Agents read JSON manifest + execute rules  
✅ **No Secret Leaks** — Placeholders only, secrets via runtime  
✅ **Standardized** — Same pattern as takopi/openclaw_clawdbot  
✅ **Portable** — Works across different workspace paths  
✅ **Versioned** — Schema versioning for migrations  
✅ **Automatable** — Scripts can execute manifests  

## Implementation Path

1. Create `ai_memory/bootstrap/claudy_seed/` directory
2. Move Claudy backup files there
3. Create structured `export.manifest.json`
4. Add `install_seed.sh` (bash automation)
5. Write `AGENT_IMPORT.md` (agent runbook)
6. Update `ai_memory/bootstrap/AGENT_EXPORTS.md` to include Claudy
7. Create `ai_memory/claudy_runtime_backup.md` (operational notes)
8. Move this pattern back to `agent-brains/claudy-v1/` PR after bootstrapping

## Key Learnings from ai_memory Pattern

1. **Separation of Concerns** — Backup structure != deployment structure
2. **Manifest-Driven** — JSON makes it agent-executable
3. **Template Placeholders** — Security + flexibility
4. **Multiple Layers** — Seeds (bootstrap) + runtime (operational) + documentation (context)
5. **Standardization** — Same pattern scales to multiple agents

---

**Next Step:** If restructuring needed, create follow-up PR that moves `agent-brains/claudy-v1/` to `ai_memory/bootstrap/claudy_seed/` following the proven pattern.
