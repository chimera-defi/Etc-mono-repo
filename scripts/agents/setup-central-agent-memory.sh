#!/usr/bin/env bash
set -euo pipefail

# Set up a central, segregated memory folder for local AI agents and register
# safe memory folders with GBrain/QMD. Designed to be idempotent and reversible:
# existing live memory locations are copied into the central store, then replaced
# with symlinks only after a timestamped backup is kept beside the original path.

AGENT_MEMORY_ROOT="${AGENT_MEMORY_ROOT:-/home/agents/agent-memory}"
AGENT_MEMORY_AGENTS="${AGENT_MEMORY_AGENTS:-hermes codex claude openclaw opencode}"
AGENT_MEMORY_BACKUP_STAMP="${AGENT_MEMORY_BACKUP_STAMP:-$(date -u +%Y%m%dT%H%M%SZ)}"
DRY_RUN=0
LINK_LIVE_STATE=1
LINK_SQLITE=0
REGISTER_GBRAIN=1
REGISTER_QMD=1
SYNC_GBRAIN=0

usage() {
  cat <<'USAGE'
Usage: setup-central-agent-memory.sh [options]

Options:
  --root PATH              Central memory root (default: /home/agents/agent-memory)
  --agents "a b c"         Agents to initialize (default: hermes codex claude openclaw opencode)
  --no-link-live-state     Create central folders only; do not migrate/symlink existing agent memory paths
  --link-sqlite            Also symlink active SQLite memories (off by default; stop agents first)
  --no-gbrain              Skip GBrain source registration
  --no-qmd                 Skip QMD collection registration
  --sync-gbrain            After registering sources, run a no-embed/no-extract sync per source
  --dry-run                Print actions without changing files
  -h, --help               Show this help

Environment:
  AGENT_MEMORY_ROOT, AGENT_MEMORY_AGENTS, AGENT_MEMORY_BACKUP_STAMP
USAGE
}

log() { printf '[agent-memory] %s\n' "$*"; }
warn() { printf '[agent-memory] WARN: %s\n' "$*" >&2; }
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
    printf '[agent-memory] dry-run:' >&2
    printf ' %q' "$@" >&2
    printf '\n' >&2
  else
    "$@"
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --root) require_arg "$@"; AGENT_MEMORY_ROOT="$2"; shift 2 ;;
    --agents) require_arg "$@"; AGENT_MEMORY_AGENTS="$2"; shift 2 ;;
    --no-link-live-state) LINK_LIVE_STATE=0; shift ;;
    --link-sqlite) LINK_SQLITE=1; shift ;;
    --no-gbrain) REGISTER_GBRAIN=0; shift ;;
    --no-qmd) REGISTER_QMD=0; shift ;;
    --sync-gbrain) SYNC_GBRAIN=1; shift ;;
    --dry-run) DRY_RUN=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) warn "unknown argument: $1"; usage; exit 2 ;;
  esac
done

case "$AGENT_MEMORY_ROOT" in
  /|/home|/home/agents|/tmp|/var|/usr|/etc)
    warn "refusing unsafe root: $AGENT_MEMORY_ROOT"
    exit 3
    ;;
esac

mkdir_mode() {
  local mode="$1" path="$2"
  run mkdir -p "$path"
  run chmod "$mode" "$path"
}

write_if_missing() {
  local path="$1"
  local body="$2"
  if [[ -e "$path" ]]; then
    return 0
  fi
  if [[ "$DRY_RUN" == "1" ]]; then
    log "would write $path"
  else
    mkdir -p "$(dirname "$path")"
    printf '%s\n' "$body" > "$path"
  fi
}

chmod_if_exists() {
  local mode="$1" path="$2"
  if [[ -e "$path" || -L "$path" ]]; then
    run chmod "$mode" "$path"
  fi
}

append_once() {
  local path="$1" marker="$2" body="$3"
  if [[ -e "$path" ]] && grep -Fq "$marker" "$path" 2>/dev/null; then
    return 0
  fi
  if [[ "$DRY_RUN" == "1" ]]; then
    log "would append marker $marker to $path"
  else
    mkdir -p "$(dirname "$path")"
    {
      [[ -s "$path" ]] && printf '\n'
      printf '%s\n' "$body"
    } >> "$path"
  fi
}

upsert_central_memory_block() {
  local path="$1" agent="$2" body tmp_body
  body="$(memory_guide_block "$agent")"
  if [[ -e "$path" ]] \
    && grep -Fq '<!-- central-agent-memory:begin -->' "$path" 2>/dev/null; then
    if [[ "$DRY_RUN" == "1" ]]; then
      log "would update central-agent-memory block in $path"
      return 0
    fi
    tmp_body="$(mktemp)"
    trap 'rm -f "$tmp_body"' EXIT
    printf '%s\n' "$body" > "$tmp_body"
    python3 - "$path" "$tmp_body" <<'PY'
from pathlib import Path
import re
import sys

path = Path(sys.argv[1])
body = Path(sys.argv[2]).read_text(encoding='utf-8').rstrip('\n')
text = path.read_text(encoding='utf-8', errors='ignore')
start = '<!-- central-agent-memory:begin -->'
end = '<!-- central-agent-memory:end -->'
pattern = re.compile(re.escape(start) + r'.*?' + re.escape(end), re.S)
if end in text[text.find(start):]:
    updated = pattern.sub(body, text, count=1)
else:
    updated = text[: text.find(start)].rstrip() + '\n\n' + body + '\n'
if updated != text:
    path.write_text(updated, encoding='utf-8')
PY
    rm -f "$tmp_body"
    trap - EXIT
  else
    append_once "$path" "central-agent-memory:begin" "$body"
  fi
}

migrate_private_memory() {
  local agent="$1"
  local old_path="$AGENT_MEMORY_ROOT/agents/$agent/private/MEMORY.md"
  local curated_path="$AGENT_MEMORY_ROOT/agents/$agent/private/curated/MEMORY.md"
  if [[ ! -f "$old_path" ]]; then
    return 0
  fi
  if [[ ! -f "$curated_path" ]]; then
    log "migrating $old_path -> $curated_path"
    run mv "$old_path" "$curated_path"
    return 0
  fi
  if cmp -s "$old_path" "$curated_path"; then
    log "removing duplicate migrated private memory: $old_path"
    run rm "$old_path"
    return 0
  fi
  local digest
  digest="$(sha256sum "$old_path" | awk '{print $1}')"
  local marker="<!-- migrated-private-memory:$digest -->"
  if grep -Fq "$marker" "$curated_path" 2>/dev/null; then
    log "removing already-merged private memory: $old_path"
    run rm "$old_path"
    return 0
  fi
  log "merging legacy $old_path into $curated_path"
  if [[ "$DRY_RUN" == "1" ]]; then
    log "would append migrated private memory marker $digest to $curated_path"
  else
    {
      printf '\n%s\n' "$marker"
      printf '\n## Migrated from private/MEMORY.md\n\n'
      cat "$old_path"
    } >> "$curated_path"
  fi
  run rm "$old_path"
}

copy_path_into_target() {
  local src="$1" target="$2"
  if [[ ! -e "$src" && ! -L "$src" ]]; then
    return 0
  fi
  run mkdir -p "$(dirname "$target")"
  if [[ -d "$src" && ! -L "$src" ]]; then
    run mkdir -p "$target"
    # Dot form preserves hidden files while merging non-destructively.
    run cp -a "$src/." "$target/"
  elif [[ -f "$src" || -L "$src" ]]; then
    run cp -a "$src" "$target"
  fi
}

link_dir_state() {
  local src="$1" target="$2" label="$3"
  run mkdir -p "$target"
  if [[ -L "$src" ]]; then
    local resolved="$(readlink -f "$src" || true)"
    local target_resolved="$(readlink -f "$target" || true)"
    if [[ "$resolved" == "$target_resolved" ]]; then
      log "$label already linked: $src -> $target"
      return 0
    fi
    local backup="${src}.backup-${AGENT_MEMORY_BACKUP_STAMP}"
    warn "$label symlink points elsewhere; moving symlink to $backup"
    run mv "$src" "$backup"
  elif [[ -e "$src" ]]; then
    copy_path_into_target "$src" "$target"
    local backup="${src}.backup-${AGENT_MEMORY_BACKUP_STAMP}"
    warn "$label existing path backed up at $backup"
    run mv "$src" "$backup"
  fi
  run mkdir -p "$(dirname "$src")"
  run ln -s "$target" "$src"
  log "$label linked: $src -> $target"
}

link_file_state() {
  local src="$1" target="$2" label="$3"
  run mkdir -p "$(dirname "$target")"
  if [[ -L "$src" ]]; then
    local resolved="$(readlink -f "$src" || true)"
    local target_resolved="$(readlink -f "$target" || true)"
    if [[ "$resolved" == "$target_resolved" ]]; then
      log "$label already linked: $src -> $target"
      return 0
    fi
    local backup="${src}.backup-${AGENT_MEMORY_BACKUP_STAMP}"
    warn "$label symlink points elsewhere; moving symlink to $backup"
    run mv "$src" "$backup"
  elif [[ -e "$src" ]]; then
    copy_path_into_target "$src" "$target"
    local backup="${src}.backup-${AGENT_MEMORY_BACKUP_STAMP}"
    warn "$label existing file backed up at $backup"
    run mv "$src" "$backup"
  else
    write_if_missing "$target" "# $label"
  fi
  run mkdir -p "$(dirname "$src")"
  run ln -s "$target" "$src"
  log "$label linked: $src -> $target"
}

root_readme() {
  cat <<EOF
# Central Agent Memory

Local root: \`$AGENT_MEMORY_ROOT\`

This directory is the local coordination point for AI-agent memory on this host.
It keeps memory easy to inspect while separating writers and sensitivity levels.

## Layout

- \`shared/public/\` - explicitly cross-agent, non-secret facts.
- \`agents/<agent>/public/\` - facts written by one agent that can be deliberately queried by others.
- \`agents/<agent>/private/curated/\` - default indexed same-agent memory.
- \`agents/<agent>/private/live/\` - raw tool-owned state centralized for inspection but not indexed.
- \`agents/<agent>/secrets/\` - never indexed, never committed; prefer references to an external secret manager, not plaintext.

## Retrieval rule

Agents should search GBrain/QMD first and cite source IDs, e.g.
\`brain:agent-hermes-private:profile-preferences\`. They should not dump whole
memory folders into active context.
EOF
}

policy_yaml() {
  cat <<EOF
schema_version: 1
root: "$AGENT_MEMORY_ROOT"
principles:
  - own_private_memory_is_default
  - cross_agent_memory_requires_explicit_source_selection
  - secrets_are_never_indexed_or_committed
  - search_first_do_not_dump_raw_folders
sensitivity:
  shared_public:
    path: shared/public
    readers: [hermes, codex, claude, openclaw, opencode]
    gbrain_source: agent-shared-public
  agent_public:
    path: agents/<agent>/public
    readers: explicit_cross_agent_only
    gbrain_source_pattern: agent-<agent>-public
  agent_private:
    path: agents/<agent>/private/curated
    readers: same_agent_only
    gbrain_source_pattern: agent-<agent>-private
  secrets:
    path: agents/<agent>/secrets
    readers: same_agent_human_approved_only
    gbrain_source: null
    qmd_collection: null
    notes: "Do not store plaintext API keys, wallet keys, bearer tokens, cookies, or passwords."
agents:
EOF
  for agent in $AGENT_MEMORY_AGENTS; do
    cat <<EOF
  $agent:
    public_path: agents/$agent/public
    private_path: agents/$agent/private/curated
    secrets_path: agents/$agent/secrets
    public_source: agent-$agent-public
    private_source: agent-$agent-private
EOF
  done
}

agent_index() {
  local agent="$1"
  cat <<EOF
# $agent Memory Index

Writer namespace: \`$agent\`

- \`public/\`: durable facts this agent wrote that are safe for explicit cross-agent use.
- \`private/curated/\`: default indexed same-agent memory.
- \`private/live/\`: raw tool-owned state symlinks/copies; centralized but intentionally not registered with GBrain/QMD.
- \`secrets/\`: not indexed, not committed. Prefer pointers to secret managers over raw secrets.
- \`inbox/\`: staging area before distillation.
- \`archive/\`: old raw notes after distillation.

Retrieval convention: search \`agent-$agent-private\` only when running as $agent or when a human explicitly asks for that source. Search \`agent-$agent-public\` only when cross-agent provenance is needed.
EOF
}

public_memory_seed() {
  local agent="$1"
  cat <<EOF
# Public Memory - $agent

This file is for non-secret, durable facts written by $agent that other agents may deliberately retrieve.
Keep entries short, dated when relevant, and cite the source artifact when possible.
EOF
}

private_memory_seed() {
  local agent="$1"
  cat <<EOF
# Private Memory - $agent

Default same-agent memory for $agent. This can contain preferences and operational facts that should not be automatically loaded by other agents.
Do not put plaintext secrets here; use \`../../secrets/\` only for human-approved pointers, and prefer external secret managers.
EOF
}

memory_guide_block() {
  local agent="$1"
  cat <<EOF
<!-- central-agent-memory:begin -->
## Central Agent Memory

- Central root: \`$AGENT_MEMORY_ROOT\`.
- Your writer namespace: \`agents/$agent/\`.
- Write normal durable memory to \`agents/$agent/private/curated/\`; write deliberately shareable facts to \`agents/$agent/public/\`.
- Read other agents' private sources only with explicit human/task instruction. Prefer \`shared/public\` and cited GBrain/QMD hits.
- Never index or commit \`secrets/\`; do not store plaintext API keys, wallet keys, bearer tokens, cookies, or passwords.
- Retrieval convention: search first, then cite source IDs like \`brain:agent-$agent-private:<slug>\`; do not dump raw memory folders into context.
<!-- central-agent-memory:end -->
EOF
}

setup_layout() {
  mkdir_mode 700 "$AGENT_MEMORY_ROOT"
  mkdir_mode 700 "$AGENT_MEMORY_ROOT/shared"
  mkdir_mode 755 "$AGENT_MEMORY_ROOT/shared/public"
  mkdir_mode 700 "$AGENT_MEMORY_ROOT/agents"
  write_if_missing "$AGENT_MEMORY_ROOT/README.md" "$(root_readme)"
  write_if_missing "$AGENT_MEMORY_ROOT/policy.yaml" "$(policy_yaml)"
  write_if_missing "$AGENT_MEMORY_ROOT/.gitignore" "$(cat <<'EOF'
# Do not git-track local live memories unless a human intentionally curates a sanitized export.
*
!.gitignore
!README.md
!policy.yaml
EOF
)"
  write_if_missing "$AGENT_MEMORY_ROOT/shared/public/README.md" "$(cat <<'EOF'
# Shared Public Agent Memory

Only non-secret, deliberately cross-agent facts belong here.
EOF
)"

  for agent in $AGENT_MEMORY_AGENTS; do
    mkdir_mode 700 "$AGENT_MEMORY_ROOT/agents/$agent"
    mkdir_mode 755 "$AGENT_MEMORY_ROOT/agents/$agent/public"
    mkdir_mode 700 "$AGENT_MEMORY_ROOT/agents/$agent/private"
    mkdir_mode 700 "$AGENT_MEMORY_ROOT/agents/$agent/private/curated"
    mkdir_mode 700 "$AGENT_MEMORY_ROOT/agents/$agent/private/live"
    mkdir_mode 700 "$AGENT_MEMORY_ROOT/agents/$agent/secrets"
    mkdir_mode 700 "$AGENT_MEMORY_ROOT/agents/$agent/inbox"
    mkdir_mode 700 "$AGENT_MEMORY_ROOT/agents/$agent/archive"
    write_if_missing "$AGENT_MEMORY_ROOT/agents/$agent/INDEX.md" "$(agent_index "$agent")"
    write_if_missing "$AGENT_MEMORY_ROOT/agents/$agent/public/MEMORY.md" "$(public_memory_seed "$agent")"
    write_if_missing "$AGENT_MEMORY_ROOT/agents/$agent/private/README.md" "$(cat <<EOF
# $agent Private Memory

Use curated/ for indexed same-agent durable memory. Use live/ for raw tool-owned state symlinked from agent home directories; live/ is intentionally not registered with GBrain or QMD.
EOF
)"
    migrate_private_memory "$agent"
    write_if_missing "$AGENT_MEMORY_ROOT/agents/$agent/private/curated/MEMORY.md" "$(private_memory_seed "$agent")"
    write_if_missing "$AGENT_MEMORY_ROOT/agents/$agent/secrets/README.md" "$(cat <<EOF
# $agent Secret Pointers

Do not store plaintext secrets. Store only pointers such as 'credential is in 1Password item X' when human-approved. This folder is not registered with GBrain or QMD.
EOF
)"
    write_if_missing "$AGENT_MEMORY_ROOT/agents/$agent/secrets/.gitignore" "*"
    chmod_if_exists 644 "$AGENT_MEMORY_ROOT/agents/$agent/INDEX.md"
    chmod_if_exists 644 "$AGENT_MEMORY_ROOT/agents/$agent/public/MEMORY.md"
    chmod_if_exists 600 "$AGENT_MEMORY_ROOT/agents/$agent/private/README.md"
    chmod_if_exists 600 "$AGENT_MEMORY_ROOT/agents/$agent/private/curated/MEMORY.md"
    chmod_if_exists 600 "$AGENT_MEMORY_ROOT/agents/$agent/secrets/README.md"
    chmod_if_exists 600 "$AGENT_MEMORY_ROOT/agents/$agent/secrets/.gitignore"
  done
}

setup_live_links() {
  [[ "$LINK_LIVE_STATE" == "1" ]] || { log "live-state linking disabled"; return 0; }
  local home="${HOME:-/home/agents}"

  link_dir_state "$home/.hermes/memories" "$AGENT_MEMORY_ROOT/agents/hermes/private/live/hermes-memories" "Hermes memories"
  upsert_central_memory_block "$AGENT_MEMORY_ROOT/agents/hermes/private/live/hermes-memories/MEMORY.md" hermes
  upsert_central_memory_block "$AGENT_MEMORY_ROOT/agents/hermes/private/curated/MEMORY.md" hermes

  link_dir_state "$home/.codex/memories" "$AGENT_MEMORY_ROOT/agents/codex/private/live/codex-memories" "Codex markdown memories"
  if [[ "$LINK_SQLITE" == "1" && ( -e "$home/.codex/memories_1.sqlite" || -L "$home/.codex/memories_1.sqlite" ) ]]; then
    link_file_state "$home/.codex/memories_1.sqlite" "$AGENT_MEMORY_ROOT/agents/codex/private/live/memories_1.sqlite" "Codex SQLite memories"
  elif [[ -e "$home/.codex/memories_1.sqlite" || -L "$home/.codex/memories_1.sqlite" ]]; then
    copy_path_into_target "$home/.codex/memories_1.sqlite" "$AGENT_MEMORY_ROOT/agents/codex/private/live/memories_1.sqlite.snapshot-${AGENT_MEMORY_BACKUP_STAMP}"
    warn "Codex SQLite memories copied as a snapshot only; pass --link-sqlite after stopping Codex to make it live"
  fi
  link_file_state "$home/.codex/AGENTS.md" "$AGENT_MEMORY_ROOT/agents/codex/private/live/AGENTS.md" "Codex global AGENTS.md"
  upsert_central_memory_block "$AGENT_MEMORY_ROOT/agents/codex/private/live/AGENTS.md" codex
  upsert_central_memory_block "$AGENT_MEMORY_ROOT/agents/codex/private/curated/MEMORY.md" codex

  link_dir_state "$home/.claude/projects" "$AGENT_MEMORY_ROOT/agents/claude/private/live/claude-projects" "Claude project memories"
  link_file_state "$home/.claude/CLAUDE.md" "$AGENT_MEMORY_ROOT/agents/claude/private/live/CLAUDE.md" "Claude global CLAUDE.md"
  upsert_central_memory_block "$AGENT_MEMORY_ROOT/agents/claude/private/live/CLAUDE.md" claude
  upsert_central_memory_block "$AGENT_MEMORY_ROOT/agents/claude/private/curated/MEMORY.md" claude

  link_dir_state "$home/.openclaw/workspace/memory" "$AGENT_MEMORY_ROOT/agents/openclaw/private/live/openclaw-memory" "OpenClaw memory workspace"
  upsert_central_memory_block "$AGENT_MEMORY_ROOT/agents/openclaw/private/live/openclaw-memory/MEMORY.md" openclaw
  upsert_central_memory_block "$AGENT_MEMORY_ROOT/agents/openclaw/private/curated/MEMORY.md" openclaw

  mkdir_mode 700 "$home/.config/opencode"
  link_file_state "$home/.config/opencode/AGENTS.md" "$AGENT_MEMORY_ROOT/agents/opencode/private/live/AGENTS.md" "OpenCode global AGENTS.md"
  upsert_central_memory_block "$AGENT_MEMORY_ROOT/agents/opencode/private/live/AGENTS.md" opencode
  upsert_central_memory_block "$AGENT_MEMORY_ROOT/agents/opencode/private/curated/MEMORY.md" opencode
}

gbrain_source_path() {
  local id="$1" list_json="$2"
  python3 - "$id" "$list_json" <<'PY'
import json, sys
needle = sys.argv[1]
path = sys.argv[2]
try:
    data = json.load(open(path))
except Exception:
    sys.exit(1)
if isinstance(data, dict):
    sources = data.get('sources', [])
elif isinstance(data, list):
    sources = data
else:
    sources = []
for src in sources:
    if src.get('id') == needle:
        print(src.get('local_path') or src.get('path') or '')
        sys.exit(0)
sys.exit(1)
PY
}

register_gbrain_source() {
  local id="$1" path="$2" list_json="$3"
  local existing_path=""
  if existing_path="$(gbrain_source_path "$id" "$list_json")"; then
    if [[ "$existing_path" == "$path" ]]; then
      log "GBrain source already exists: $id"
      return 0
    fi
    warn "GBrain source $id points to $existing_path; recreating at $path"
    run gbrain sources remove "$id"
  fi
  log "registering GBrain source $id -> $path"
  run gbrain sources add "$id" --path "$path"
}

register_gbrain() {
  [[ "$REGISTER_GBRAIN" == "1" ]] || { log "GBrain registration disabled"; return 0; }
  if ! command -v gbrain >/dev/null 2>&1; then
    warn "gbrain not found; skipping source registration"
    return 0
  fi
  local tmp_json
  tmp_json="$(mktemp)"
  if ! gbrain sources list --timeout=60s --json >"$tmp_json"; then
    warn "could not list GBrain sources; skipping registration"
    rm -f "$tmp_json"
    return 0
  fi
  if ! python3 -m json.tool "$tmp_json" >/dev/null 2>&1; then
    warn "GBrain did not return valid source JSON; skipping registration"
    rm -f "$tmp_json"
    return 0
  fi
  register_gbrain_source "agent-shared-public" "$AGENT_MEMORY_ROOT/shared/public" "$tmp_json"
  for agent in $AGENT_MEMORY_AGENTS; do
    register_gbrain_source "agent-$agent-public" "$AGENT_MEMORY_ROOT/agents/$agent/public" "$tmp_json"
    register_gbrain_source "agent-$agent-private" "$AGENT_MEMORY_ROOT/agents/$agent/private/curated" "$tmp_json"
  done
  rm -f "$tmp_json"

  if [[ "$SYNC_GBRAIN" == "1" ]]; then
    log "syncing GBrain agent memory sources without embedding/extraction"
    run gbrain sync --source agent-shared-public --no-embed --no-extract --yes
    for agent in $AGENT_MEMORY_AGENTS; do
      run gbrain sync --source "agent-$agent-public" --no-embed --no-extract --yes
      run gbrain sync --source "agent-$agent-private" --no-embed --no-extract --yes
    done
  fi
}

qmd_collection_exists() {
  local name="$1"
  qmd collection list 2>/dev/null | grep -Fq "${name} (qmd://"
}

qmd_collection_path() {
  local name="$1"
  qmd collection show "$name" 2>/dev/null | awk -F: '
    /^[[:space:]]*Path:/ {
      sub(/^[[:space:]]+/, "", $2)
      print $2
      exit
    }
  '
}

register_qmd_collection() {
  local name="$1" path="$2"
  if qmd_collection_exists "$name"; then
    local existing_path=""
    existing_path="$(qmd_collection_path "$name" || true)"
    if [[ "$existing_path" == "$path" ]]; then
      log "QMD collection already exists: $name"
      return 0
    fi
    warn "QMD collection $name points to ${existing_path:-unknown path}; recreating at $path"
    run qmd collection remove "$name"
  fi
  log "registering QMD collection $name -> $path"
  run qmd collection add "$path" --name "$name"
}

register_qmd() {
  [[ "$REGISTER_QMD" == "1" ]] || { log "QMD registration disabled"; return 0; }
  if ! command -v qmd >/dev/null 2>&1; then
    warn "qmd not found; skipping collection registration"
    return 0
  fi
  register_qmd_collection "agent-shared-public" "$AGENT_MEMORY_ROOT/shared/public"
  for agent in $AGENT_MEMORY_AGENTS; do
    register_qmd_collection "agent-$agent-public" "$AGENT_MEMORY_ROOT/agents/$agent/public"
    register_qmd_collection "agent-$agent-private" "$AGENT_MEMORY_ROOT/agents/$agent/private/curated"
  done
}

setup_layout
setup_live_links
register_gbrain
register_qmd

log "done"
log "root: $AGENT_MEMORY_ROOT"
log "next: run scripts/agents/audit-agent-memory.sh --root '$AGENT_MEMORY_ROOT'"
