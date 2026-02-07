# MCP CLI vs QMD: Real Benchmark Results

**Date:** 2026-02-07
**Repo:** Etc-mono-repo (642 files, 234 .md, 143 source)
**Tokenizer:** tiktoken cl100k_base
**Environment:** Linux 4.4.0, Node 22, Bun 1.3.8

---

## Setup Costs (One-Time)

| Tool | Install Time | Disk Usage | Index Time |
|------|-------------|------------|------------|
| MCP CLI | ~5s (curl) | ~2 MB | N/A |
| QMD (BM25 only) | ~42s (bun) | ~10 MB | 2s (212 md files) |
| QMD (+ embeddings) | same | ~340 MB model | 11 min (1248 chunks) |
| QMD (+ query expansion) | same | +1.28 GB model | downloaded on first `query` |

**Total QMD with all features: 1.6 GB disk, 11+ minutes setup.**

---

## Speed Benchmarks

### File Reading

| Operation | Native (cat/head) | MCP CLI | QMD get |
|-----------|-------------------|---------|---------|
| Single file read | **28ms** | 7,185ms (256x) | 748ms (27x) |
| 5 file sequential read | **213ms** | 16,458ms (77x) | N/A |
| Multi-get 3 files 30 lines | 30ms x3 = ~90ms | N/A | 710ms (8x) |

### Search

| Operation | Native (grep) | MCP CLI search_files | QMD BM25 | QMD vector | QMD combined |
|-----------|---------------|---------------------|----------|------------|--------------|
| Keyword search | **76-158ms** | 3,921ms (50x) | 700-2700ms (10-35x) | 15,000-111,000ms | 105,000-175,000ms |

**QMD vector search takes 15-111 seconds per query. Combined query takes 105-175 seconds.**

---

## Token Counts (The Real Metric)

**Scenario:** Find and understand all token-reduction-related content in the repo.

| Approach | Tokens | Bytes | vs Naive |
|----------|--------|-------|----------|
| A) Naive: grep -rl + cat 10 files | 52,604 | 206,272 | baseline |
| B) QMD search (5 snippets) | **512** | 1,740 | **99.0% less** |
| C) QMD --files (paths + scores) | **178** | 436 | **99.7% less** |
| D) MCP CLI read_file (1 file, JSON) | 4,830 | 18,330 | N/A |
| E) Native cat (same 1 file) | 2,221 | 8,834 | N/A |
| F) QMD multi-get (3 files, 30 lines) | **373** | 1,562 | **99.3% less** |

**MCP CLI adds 117% token overhead per file** due to JSON wrapping (4,830 vs 2,221 tokens for CLAUDE.md).

**QMD search returns compact snippets** — genuinely useful for narrowing what to read.

---

## Search Quality (Relevance)

Tested 3 natural-language queries against QMD search modes:

### Query 1: "how does the token reduction system work"

| Mode | Top Result | Relevant? |
|------|-----------|-----------|
| BM25 | wallets/seo-implementation.md | **NO** — confuses "token" (crypto) with "token" (LLM) |
| Vector | voice-coding-assistant/ui-wireframes.md | **NO** — wrong domain entirely |
| Combined | wallets/seo-implementation.md | **NO** — still confused |
| grep | (no matches) | N/A — exact phrase not present |

### Query 2: "staking smart contract architecture"

| Mode | Top Result | Relevant? |
|------|-----------|-----------|
| BM25 | staking/aztec/docs/executive-summary.md | **YES** |
| Vector | staking/research/liquid-staking-landscape-2025.md | **YES** |
| Combined | staking/aztec/docs/liquid-staking-analysis.md | **YES** |

### Query 3: "wallet SEO metadata configuration"

| Mode | Top Result | Relevant? |
|------|-----------|-----------|
| BM25 | wallets/frontend/readme.md | **YES** |
| Vector | wallets/frontend/readme.md | **YES** |
| Combined | wallets/frontend/readme.md | **YES** |

**Relevance verdict:** QMD works well for straightforward domain queries but fails when terminology is ambiguous (e.g., "token" means both crypto tokens and LLM tokens in this repo). BM25 alone is sufficient — vector search adds massive latency for marginal relevance improvement.

---

## MCP CLI Memory Server

| Operation | Time | Result |
|-----------|------|--------|
| create_entities | ~4s | Entity stored to JSON file |
| search_nodes | ~4s | Found entity from previous call |

**Problem:** Each `mcp-cli` invocation spawns a new `npx` server process (3-5s overhead). The memory server writes to a JSON file on disk, so data persists between calls, but the per-call latency makes interactive use painful.

**For Claude Code specifically:** The built-in `~/.claude/projects/*/memory/` directory serves the same purpose with zero overhead — just Read/Write files.

---

## Verdict

### What Actually Works

| Strategy | Real Savings | Speed | Recommendation |
|----------|-------------|-------|----------------|
| QMD BM25 search (`qmd search`) | 99% fewer tokens than naive | 700ms-2.7s | **USE** — for finding which files to read |
| QMD multi-get (line-limited) | 99% fewer tokens than naive | 710ms | **USE** — for reading snippets of multiple files |
| Native grep + targeted read | Same as always | <100ms | **USE** — when you know what keyword to search |
| Sub-agents (Explore) | 15-30% | varies | **USE** — for broad exploration |

### What Doesn't Work

| Strategy | Claimed | Actual | Problem |
|----------|---------|--------|---------|
| MCP CLI file reads | "66-80% savings" | **-117% (worse)** | JSON overhead doubles token count |
| MCP CLI search_files | "70% savings" | **50x slower, less results** | grep is better in every way |
| QMD vector search | "30-60% savings" | 99% savings but **15-111s per query** | Impractically slow |
| QMD combined query | "best relevance" | **105-175s per query** | Downloads 1.28 GB model, loads it per query |
| MCP CLI memory | "95% savings" | **4s per call** | Claude Code has built-in memory (0ms) |

### Bottom Line

1. **QMD BM25 is the only new tool that adds real value** — fast-ish keyword search returning ranked snippets with minimal tokens. Skip `embed` and `query` modes entirely.
2. **MCP CLI filesystem is strictly worse than native tools** for Claude Code. Remove from recommendations.
3. **MCP CLI memory is redundant** with Claude Code's built-in project memory.
4. **Previous benchmark numbers were fabricated.** MCP CLI doesn't save 60-80% — it costs 117% more tokens per file read.

---

## Recommended `qmd` Workflow

```bash
# One-time setup (fast, no embeddings needed)
qmd collection add /path/to/repo --name my-repo

# Find relevant files before reading
qmd search "topic" -n 5 --files

# Read just the relevant snippets
qmd search "topic" -n 3

# Read specific sections of found files
qmd get filename.md -l 50 --from 100
```

**Skip:** `qmd embed`, `qmd vsearch`, `qmd query` — too slow for interactive AI agent use.
