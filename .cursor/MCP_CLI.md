# MCP CLI Reference

> **Status:** Benchmarked 2026-02-07. Filesystem operations are **slower and larger** than native tools.
> Knowledge graph is redundant with Claude Code built-in memory. See full results:
> `docs/BENCHMARK_MCP_VS_QMD_2026-02-07.md`

## Installation

```bash
curl -fsSL https://raw.githubusercontent.com/philschmid/mcp-cli/main/install.sh | bash
```

## Benchmark Results (Real, Measured)

| Operation | Native Tool | MCP CLI | Verdict |
|-----------|------------|---------|---------|
| Single file read | 28ms, 2,221 tokens | 7,185ms (256x), 4,830 tokens (+117%) | **Native wins** |
| 5 files sequential | 213ms | 16,458ms (77x) | **Native wins** |
| File search | 76ms | 3,921ms (50x) | **Native wins** |
| Memory store+retrieve | 0ms (file write) | ~4s per call | **Built-in memory wins** |

## When MCP CLI Is Still Useful

MCP CLI is designed for **Cursor** (IDE), where native filesystem tools aren't built in.
For **Claude Code**, which has built-in Read, Grep, Glob, Write, and Edit tools, MCP CLI
adds overhead without benefit.

**Use MCP CLI if:**
- You're in Cursor (not Claude Code) and need bulk file operations
- You need a specific MCP server not available as a native tool

**Don't use MCP CLI if:**
- You're in Claude Code (use native tools instead)
- You want to read files (117% more tokens due to JSON wrapping)
- You want to search files (50x slower than grep)

## Available Servers (from `mcp_servers.json`)

```json
{
  "filesystem": "npx -y @modelcontextprotocol/server-filesystem",
  "memory": "npx -y @modelcontextprotocol/server-memory",
  "brave-search": "npx -y @modelcontextprotocol/server-brave-search"
}
```

## Command Reference (for Cursor users)

```bash
mcp-cli                                    # List servers
mcp-cli filesystem/read_file '{"path":"f"}'
mcp-cli filesystem/search_files '{"path":".", "pattern":"*.ts"}'
mcp-cli memory/create_entities '{"entities":[...]}'
mcp-cli memory/search_nodes '{"query":"keyword"}'
```

## Troubleshooting

- **Exit code 127**: Install MCP CLI first
- **Server not found**: Check `mcp_servers.json` exists
- **JSON parse error**: Validate JSON syntax
- **Slow**: Each call spawns npx → downloads package → starts server → runs tool → exits (3-7s overhead)
