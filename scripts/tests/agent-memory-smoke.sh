#!/usr/bin/env bash
set -euo pipefail

ROOT="${AGENT_MEMORY_ROOT:-$(mktemp -d)}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cleanup() {
  if [[ "${AGENT_MEMORY_ROOT:-}" == "" && -n "${ROOT:-}" && "$ROOT" == /tmp/* ]]; then
    rm -rf "$ROOT"
  fi
}
trap cleanup EXIT

bash -n "$REPO_ROOT/scripts/agents/setup-central-agent-memory.sh"
bash -n "$REPO_ROOT/scripts/agents/audit-agent-memory.sh"
bash -n "$REPO_ROOT/scripts/agents/configure-agent-gbrain-mcp.sh"

AGENT_MEMORY_ROOT="$ROOT" \
  bash "$REPO_ROOT/scripts/agents/setup-central-agent-memory.sh" \
  --root "$ROOT" \
  --no-link-live-state \
  --no-gbrain \
  --no-qmd

AGENT_MEMORY_ROOT="$ROOT" \
  bash "$REPO_ROOT/scripts/agents/audit-agent-memory.sh" \
  --root "$ROOT" \
  --no-gbrain \
  --no-qmd

test -f "$ROOT/policy.yaml"
test -f "$ROOT/agents/hermes/private/curated/MEMORY.md"
test ! -f "$ROOT/agents/hermes/private/MEMORY.md"
test -f "$ROOT/agents/opencode/public/MEMORY.md"
test -f "$ROOT/agents/codex/secrets/.gitignore"

printf 'agent-memory smoke ok: %s\n' "$ROOT"
