# TOOLS.md - User Tool Notes (editable)

This file is for *your* notes about external tools and conventions.
It does not define which tools exist; Clawdbot provides built-in tools internally.

## Examples

### imsg
- Send an iMessage/SMS: describe who/what, confirm before sending.
- Prefer short messages; avoid sending secrets.

### sag
- Text-to-speech: specify voice, target speaker/room, and whether to stream.

Add whatever else you want the assistant to know about your local toolchain.

### qmd
- Local doc search engine for markdown and notes (https://github.com/tobi/qmd).
- Default workflow for token reduction:
  1) `qmd search "topic" -n 10 --files` (find paths)
  2) `qmd search "topic" -n 5` (get snippets)
  3) `qmd get <file> -l 80 --from <line>` (targeted read)
- Use BM25 search for interactive speed.
- Avoid `qmd embed`, `qmd vsearch`, `qmd query` unless explicitly needed for deep offline research.
