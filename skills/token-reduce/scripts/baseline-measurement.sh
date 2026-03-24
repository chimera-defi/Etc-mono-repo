#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel 2>/dev/null || { cd "$SCRIPT_DIR/../../.." && pwd; })"
OUT_DIR="$ROOT/.cursor/artifacts/token-reduction"
DATE_STAMP="$(date +%Y-%m-%d)"
SCOPE="repo"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --scope)
      SCOPE="${2:-repo}"
      shift 2
      ;;
    --output)
      OUTPUT="${2:?missing output path}"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 2
      ;;
  esac
done

mkdir -p "$OUT_DIR"
OUTPUT="${OUTPUT:-$OUT_DIR/adoption-${SCOPE}-${DATE_STAMP}.json}"
SUMMARY_MD="${OUTPUT%.json}.md"

python3 "$SCRIPT_DIR/measure_token_reduction.py" \
  --scope "$SCOPE" \
  --repo-root "$ROOT" \
  --output "$OUTPUT"

python3 - "$OUTPUT" "$SUMMARY_MD" <<'PY'
import json
import sys
from pathlib import Path

src = Path(sys.argv[1])
dst = Path(sys.argv[2])
data = json.loads(src.read_text())
ad = data["adoption"]
comp = data["compliance"]
summary = f"""# Token Reduction Adoption Summary

- Scope: `{data['scope']}`
- Measured at: `{data['measured_at']}`
- Repo: `{data['repo_root']}`
- Session count: `{data['session_count']}`
- Claude sessions: `{data['sources']['claude_sessions']}`
- Codex sessions: `{data['sources']['codex_sessions']}`

## Adoption

- `qmd_search_sessions`: {ad['qmd_search_sessions']}
- `token_reduce_search_sessions`: {ad['token_reduce_search_sessions']}
- `scoped_rg_sessions`: {ad['scoped_rg_sessions']}
- `targeted_read_sessions`: {ad['targeted_read_sessions']}
- `subagent_sessions`: {ad['subagent_sessions']}
- `token_reduce_mentions`: {ad['token_reduce_mentions']}
- `qmd_search_pct`: {ad['qmd_search_pct']}
- `token_reduce_search_pct`: {ad['token_reduce_search_pct']}
- `scoped_rg_pct`: {ad['scoped_rg_pct']}

## Compliance

- `discovery_compliance_pct`: {comp['discovery_compliance_pct']}
- `broad_scan_violations`: {comp['broad_scan_violations']}
- `sessions_with_broad_scan_violation`: {comp['sessions_with_broad_scan_violation']}
- `sessions_with_compliant_first_discovery`: {comp['sessions_with_compliant_first_discovery']}
"""
dst.write_text(summary)
print(summary)
PY

echo
echo "Wrote:"
echo "  $OUTPUT"
echo "  $SUMMARY_MD"
