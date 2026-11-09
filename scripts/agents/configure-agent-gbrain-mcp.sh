#!/usr/bin/env bash
set -euo pipefail

# Configure local coding agents to reach the central GBrain MCP server.
# This script is intentionally conservative: it adds gbrain where missing and
# avoids rewriting unrelated model/provider/auth settings.

GBRAIN_BIN="${GBRAIN_BIN:-$HOME/.bun/bin/gbrain}"
GBRAIN_INCLUDE="${GBRAIN_INCLUDE:-get_brain_identity,search,query,get_page,put_page,list_pages,recall,get_stats,run_doctor}"
DRY_RUN=0

# GBrain is often installed by Bun under ~/.bun/bin. Add that directory so both
# `gbrain` and its `#!/usr/bin/env bun` shebang work in non-interactive shells.
if [[ -n "${HOME:-}" && -d "$HOME/.bun/bin" ]]; then
  export PATH="$PATH:$HOME/.bun/bin"
fi

usage() {
  cat <<'USAGE'
Usage: configure-agent-gbrain-mcp.sh [options]

Options:
  --gbrain-bin PATH       gbrain executable (default: ~/.bun/bin/gbrain)
  --include CSV           OpenClaw/Hermes MCP include-list where supported
  --dry-run               Print actions without changing config
  -h, --help              Show this help
USAGE
}

log() { printf '[agent-gbrain-mcp] %s\n' "$*"; }
warn() { printf '[agent-gbrain-mcp] WARN: %s\n' "$*" >&2; }
require_arg() {
  local flag="$1"
  if [[ $# -lt 2 || -z "${2:-}" ]]; then
    warn "missing value for $flag"
    usage
    exit 2
  fi
}
run() {
  if [[ "$DRY_RUN" == "1" ]]; then
    printf '[agent-gbrain-mcp] dry-run:' >&2
    printf ' %q' "$@" >&2
    printf '\n' >&2
  else
    "$@"
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --gbrain-bin) require_arg "$@"; GBRAIN_BIN="$2"; shift 2 ;;
    --include) require_arg "$@"; GBRAIN_INCLUDE="$2"; shift 2 ;;
    --dry-run) DRY_RUN=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) warn "unknown argument: $1"; usage; exit 2 ;;
  esac
done

if [[ ! -x "$GBRAIN_BIN" ]]; then
  if command -v gbrain >/dev/null 2>&1; then
    GBRAIN_BIN="$(command -v gbrain)"
  else
    warn "gbrain executable is not executable: $GBRAIN_BIN"
    exit 4
  fi
fi

configure_codex() {
  if ! command -v codex >/dev/null 2>&1; then
    warn "codex not found; skipping"
    return 0
  fi
  if codex mcp list 2>/dev/null | awk 'NR>1 {print $1}' | grep -Fxq gbrain; then
    log "Codex already has gbrain MCP"
    return 0
  fi
  log "adding Codex gbrain MCP"
  run codex mcp add gbrain -- "$GBRAIN_BIN" serve
}

configure_claude() {
  if ! command -v claude >/dev/null 2>&1; then
    warn "claude not found; skipping"
    return 0
  fi
  if claude mcp list 2>/dev/null | grep -Eiq '^gbrain\b|gbrain:'; then
    log "Claude already has gbrain MCP"
    return 0
  fi
  log "adding Claude user-scope gbrain MCP"
  run claude mcp add -s user gbrain -- "$GBRAIN_BIN" serve
}

configure_openclaw() {
  if ! command -v openclaw >/dev/null 2>&1; then
    warn "openclaw not found; skipping"
    return 0
  fi
  if openclaw mcp show gbrain >/dev/null 2>&1; then
    log "OpenClaw already has gbrain MCP"
    return 0
  fi
  log "adding OpenClaw gbrain MCP with low-token include-list"
  run openclaw mcp add gbrain \
    --command "$GBRAIN_BIN" \
    --arg serve \
    --include "$GBRAIN_INCLUDE" \
    --timeout 120 \
    --connect-timeout 60 \
    --no-probe
}

configure_hermes_note() {
  if ! command -v hermes >/dev/null 2>&1; then
    warn "hermes not found; skipping Hermes check"
    return 0
  fi
  if hermes mcp list 2>/dev/null | grep -Eiq '^gbrain\b|gbrain'; then
    log "Hermes already reports gbrain MCP"
  else
    warn "Hermes did not report gbrain MCP; add it in ~/.hermes/config.yaml using the hermes-agent runbook"
  fi
}

configure_opencode() {
  if ! command -v opencode >/dev/null 2>&1; then
    warn "opencode not found; skipping"
    return 0
  fi

  local config_dir="${OPENCODE_CONFIG_DIR:-$HOME/.config/opencode}"
  local config_path="$config_dir/opencode.jsonc"
  log "ensuring OpenCode global gbrain MCP in $config_path"
  if [[ "$DRY_RUN" == "1" ]]; then
    log "would update OpenCode global gbrain MCP config"
    return 0
  fi

  mkdir -p "$config_dir"
  python3 - "$config_path" "$GBRAIN_BIN" <<'PY'
from pathlib import Path
import json
import re
import sys

path = Path(sys.argv[1]).expanduser()
gbrain_bin = sys.argv[2]

# OpenCode's config schema allows JSONC comments/trailing commas, but Python's
# json module does not. Strip comments outside strings and trailing commas; fail
# closed on anything that still cannot parse.
def strip_jsonc(text: str) -> str:
    out = []
    i = 0
    in_string = False
    quote = ''
    escape = False
    while i < len(text):
        ch = text[i]
        nxt = text[i + 1] if i + 1 < len(text) else ''
        if in_string:
            out.append(ch)
            if escape:
                escape = False
            elif ch == '\\':
                escape = True
            elif ch == quote:
                in_string = False
            i += 1
            continue
        if ch in ('"', "'"):
            in_string = True
            quote = ch
            out.append(ch)
            i += 1
            continue
        if ch == '/' and nxt == '/':
            i += 2
            while i < len(text) and text[i] not in '\r\n':
                i += 1
            continue
        if ch == '/' and nxt == '*':
            i += 2
            while i + 1 < len(text) and not (text[i] == '*' and text[i + 1] == '/'):
                i += 1
            i += 2
            continue
        out.append(ch)
        i += 1
    return re.sub(r",(\s*[}\]])", r"\1", ''.join(out))

raw = path.read_text(encoding="utf-8") if path.exists() else ""
stripped = strip_jsonc(raw).strip()
if stripped:
    data = json.loads(stripped)
else:
    data = {"$schema": "https://opencode.ai/config.json"}

if not isinstance(data, dict):
    raise SystemExit(f"{path} must contain a JSON object")
data.setdefault("$schema", "https://opencode.ai/config.json")
mcp = data.setdefault("mcp", {})
if not isinstance(mcp, dict):
    raise SystemExit(f"{path}: top-level mcp must be an object")

mcp["gbrain"] = {
    "type": "local",
    "command": [gbrain_bin, "serve"],
}
path.write_text(json.dumps(data, indent=2, sort_keys=False) + "\n", encoding="utf-8")
PY
}

configure_codex
configure_claude
configure_openclaw
configure_hermes_note
configure_opencode
log "done"
