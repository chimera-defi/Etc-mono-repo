#!/usr/bin/env bash
set -euo pipefail

# Configure local coding agents to reach the central GBrain MCP server.
# This script is intentionally conservative: it adds gbrain where missing and
# avoids rewriting unrelated model/provider/auth settings.

GBRAIN_BIN="${GBRAIN_BIN:-$HOME/.bun/bin/gbrain}"
GBRAIN_INCLUDE="${GBRAIN_INCLUDE:-get_brain_identity,search,query,get_page,put_page,list_pages,recall,get_stats,run_doctor}"
DRY_RUN=0

usage() {
  cat <<'USAGE'
Usage: configure-agent-gbrain-mcp.sh [options]

Options:
  --gbrain-bin PATH       gbrain executable (default: ~/.bun/bin/gbrain)
  --include CSV           OpenClaw MCP include-list
  --dry-run               Print actions without changing config
  -h, --help              Show this help
USAGE
}

log() { printf '[agent-gbrain-mcp] %s\n' "$*"; }
warn() { printf '[agent-gbrain-mcp] WARN: %s\n' "$*" >&2; }
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
    --gbrain-bin) GBRAIN_BIN="$2"; shift 2 ;;
    --include) GBRAIN_INCLUDE="$2"; shift 2 ;;
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

configure_opencode_note() {
  if command -v opencode >/dev/null 2>&1; then
    if opencode mcp --help >/dev/null 2>&1; then
      warn "OpenCode MCP CLI detected, but this script does not assume undocumented non-interactive add syntax. Run 'opencode mcp add' manually if your installed version supports local stdio command configuration."
    else
      log "OpenCode detected; no stable MCP config CLI is available. Use central AGENTS.md memory guide until OpenCode MCP config is finalized."
    fi
  fi
}

configure_codex
configure_claude
configure_openclaw
configure_hermes_note
configure_opencode_note
log "done"
