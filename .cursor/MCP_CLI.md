# MCP CLI Reference

> **Token Efficiency Tool** - Reduces context by 60-80% for file operations.

## Installation

```bash
# Check if installed
which mcp-cli && mcp-cli --version

# Install if needed (v0.1.3+)
curl -fsSL https://raw.githubusercontent.com/philschmid/mcp-cli/main/install.sh | bash
```

## Core Patterns

### Bulk File Reading
```bash
# Instead of multiple Read calls
mcp-cli filesystem/read_multiple_files '{"paths": ["file1.md", "file2.md", "file3.md"]}'
```

### Directory Analysis
```bash
mcp-cli filesystem/directory_tree '{"path": "/path/to/dir"}'
```

### File Search
```bash
mcp-cli filesystem/search_files '{"path": ".", "pattern": "**/*.ts"}'
```

### Large File Sections
```bash
mcp-cli filesystem/read_text_file '{"path": "large-file.md", "head": 100}'
mcp-cli filesystem/read_text_file '{"path": "large-file.md", "tail": 50}'
```

## Knowledge Graph (Cross-Session Memory)

### Store Knowledge
```bash
mcp-cli memory/create_entities '{"entities": [
  {"name": "EntityName", "entityType": "type", "observations": ["fact1", "fact2"]}
]}'
```

### Query Before Research
```bash
mcp-cli memory/search_nodes '{"query": "keyword"}'
mcp-cli memory/open_nodes '{"names": ["EntityName"]}'
mcp-cli memory/read_graph '{}'
```

### Create Relationships
```bash
mcp-cli memory/create_relations '{"relations": [
  {"from": "Entity1", "to": "Entity2", "relationType": "uses"}
]}'
```

## Tool Discovery
```bash
mcp-cli                          # List all servers
mcp-cli grep "*file*"            # Find tools by keyword
mcp-cli filesystem/tool_name     # Load specific tool schema
mcp-cli --json ...               # JSON output for parsing
```

## When to Use MCP CLI

| Use MCP CLI | Use Native Tools |
|-------------|------------------|
| Reading 2+ files | Single small file read |
| Directory exploration | File writes/edits |
| Pattern-based search | Git operations |
| Knowledge storage | Simple grep |
| Large file sections | - |

## Token Savings

| Operation | Savings |
|-----------|---------|
| Bulk reads (N files) | ~66% |
| Directory tree | ~80% |
| Pattern search | ~70% |
| Large file head/tail | ~90% |
| Knowledge retrieval | ~95% |

## Troubleshooting

- **Exit code 127**: Install MCP CLI first
- **Server not found**: Check `mcp_servers.json` exists
- **JSON parse error**: Validate JSON syntax
- **Fallback**: Use native tools if MCP fails
