#!/usr/bin/env bash
set -euo pipefail

AGENT_MEMORY_ROOT="${AGENT_MEMORY_ROOT:-/home/agents/agent-memory}"
AGENT_MEMORY_AGENTS="${AGENT_MEMORY_AGENTS:-hermes codex claude openclaw opencode}"
CHECK_GBRAIN=1
CHECK_QMD=1

# GBrain is often installed by Bun under ~/.bun/bin. Add that directory so both
# `gbrain` and its `#!/usr/bin/env bun` shebang work in non-interactive shells.
if [[ -n "${HOME:-}" && -d "$HOME/.bun/bin" ]]; then
  export PATH="$PATH:$HOME/.bun/bin"
fi

usage() {
  cat <<'USAGE'
Usage: audit-agent-memory.sh [options]

Options:
  --root PATH          Central memory root (default: /home/agents/agent-memory)
  --agents "a b c"     Agents to audit
  --no-gbrain          Skip GBrain source checks
  --no-qmd             Skip QMD collection checks
  -h, --help           Show this help
USAGE
}

require_arg() {
  local flag="$1"
  if [[ $# -lt 2 || -z "${2:-}" ]]; then
    echo "missing value for $flag" >&2
    usage
    exit 2
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --root) require_arg "$@"; AGENT_MEMORY_ROOT="$2"; shift 2 ;;
    --agents) require_arg "$@"; AGENT_MEMORY_AGENTS="$2"; shift 2 ;;
    --no-gbrain) CHECK_GBRAIN=0; shift ;;
    --no-qmd) CHECK_QMD=0; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "unknown argument: $1" >&2; usage; exit 2 ;;
  esac
done

fail=0
ok() { printf 'ok: %s\n' "$*"; }
err() { printf 'FAIL: %s\n' "$*" >&2; fail=1; }

require_dir() {
  local path="$1"
  [[ -d "$path" ]] && ok "dir $path" || err "missing dir $path"
}

require_file() {
  local path="$1"
  [[ -f "$path" ]] && ok "file $path" || err "missing file $path"
}

require_absent_file() {
  local path="$1"
  [[ ! -f "$path" ]] && ok "absent legacy file $path" || err "legacy file should be migrated away: $path"
}

check_mode_dir_private() {
  local path="$1"
  [[ -e "$path" ]] || return 0
  local mode
  mode="$(stat -c '%a' "$path")"
  case "$mode" in
    700) ok "mode $mode $path" ;;
    *) err "unexpected broad mode $mode on $path" ;;
  esac
}

check_mode_file_private() {
  local path="$1"
  [[ -e "$path" ]] || return 0
  local mode
  mode="$(stat -c '%a' "$path")"
  case "$mode" in
    600) ok "mode $mode $path" ;;
    *) err "unexpected broad mode $mode on $path" ;;
  esac
}

require_dir "$AGENT_MEMORY_ROOT"
require_file "$AGENT_MEMORY_ROOT/README.md"
require_file "$AGENT_MEMORY_ROOT/policy.yaml"
require_dir "$AGENT_MEMORY_ROOT/shared/public"

for agent in $AGENT_MEMORY_AGENTS; do
  require_dir "$AGENT_MEMORY_ROOT/agents/$agent/public"
  require_dir "$AGENT_MEMORY_ROOT/agents/$agent/private"
  require_dir "$AGENT_MEMORY_ROOT/agents/$agent/private/curated"
  require_dir "$AGENT_MEMORY_ROOT/agents/$agent/private/live"
  require_dir "$AGENT_MEMORY_ROOT/agents/$agent/secrets"
  require_dir "$AGENT_MEMORY_ROOT/agents/$agent/inbox"
  require_dir "$AGENT_MEMORY_ROOT/agents/$agent/archive"
  require_file "$AGENT_MEMORY_ROOT/agents/$agent/INDEX.md"
  require_file "$AGENT_MEMORY_ROOT/agents/$agent/public/MEMORY.md"
  require_file "$AGENT_MEMORY_ROOT/agents/$agent/private/README.md"
  require_file "$AGENT_MEMORY_ROOT/agents/$agent/private/curated/MEMORY.md"
  require_absent_file "$AGENT_MEMORY_ROOT/agents/$agent/private/MEMORY.md"
  require_file "$AGENT_MEMORY_ROOT/agents/$agent/secrets/.gitignore"
  check_mode_dir_private "$AGENT_MEMORY_ROOT/agents/$agent/private"
  check_mode_dir_private "$AGENT_MEMORY_ROOT/agents/$agent/private/curated"
  check_mode_dir_private "$AGENT_MEMORY_ROOT/agents/$agent/private/live"
  check_mode_dir_private "$AGENT_MEMORY_ROOT/agents/$agent/secrets"
  check_mode_file_private "$AGENT_MEMORY_ROOT/agents/$agent/private/README.md"
  check_mode_file_private "$AGENT_MEMORY_ROOT/agents/$agent/private/curated/MEMORY.md"
  check_mode_file_private "$AGENT_MEMORY_ROOT/agents/$agent/secrets/.gitignore"
done

printf '\nsecret-pattern scan (curated/public markdown/json/yaml/txt only):\n'
if command -v python3 >/dev/null 2>&1; then
  if ! python3 - "$AGENT_MEMORY_ROOT" $AGENT_MEMORY_AGENTS <<'PY'
import os
import re
import sys

root = sys.argv[1]
agents = sys.argv[2:]
patterns = [
    re.compile(r'AKIA[0-9A-Z]{16}'),
    re.compile(r'gh[pousr]_[A-Za-z0-9_]{20,}'),
    re.compile(r'sk-[A-Za-z0-9_-]{20,}'),
    re.compile(r'(?i)(api[_-]?key|secret|token|password)\s*[:=]\s*[^\s`]{8,}'),
    re.compile(r'(?i)bearer\s+[A-Za-z0-9._~+/-]{20,}'),
]
allowed_ext = {'.md', '.txt', '.json', '.yaml', '.yml', '.toml'}
scan_paths = [
    os.path.join(root, 'README.md'),
    os.path.join(root, 'policy.yaml'),
    os.path.join(root, 'shared', 'public'),
]
for agent in agents:
    scan_paths.extend([
        os.path.join(root, 'agents', agent, 'INDEX.md'),
        os.path.join(root, 'agents', agent, 'public'),
        os.path.join(root, 'agents', agent, 'private', 'curated'),
    ])

findings = []
for start in scan_paths:
    if os.path.isfile(start):
        candidates = [(os.path.dirname(start), [os.path.basename(start)])]
    elif os.path.isdir(start):
        candidates = ((dirpath, filenames) for dirpath, _, filenames in os.walk(start, followlinks=False))
    else:
        continue
    for dirpath, filenames in candidates:
        rel_parts = set(os.path.relpath(dirpath, root).split(os.sep))
        if 'live' in rel_parts or 'secrets' in rel_parts:
            continue
        for name in filenames:
            ext = os.path.splitext(name)[1].lower()
            if ext not in allowed_ext:
                continue
            path = os.path.join(dirpath, name)
            try:
                with open(path, 'r', encoding='utf-8', errors='ignore') as fh:
                    for lineno, line in enumerate(fh, 1):
                        if any(p.search(line) for p in patterns):
                            findings.append(f'{path}:{lineno}')
            except OSError:
                pass
if findings:
    print('FAIL: possible secrets in curated/public memory docs:')
    for item in findings[:50]:
        print(item)
    sys.exit(1)
print('ok: no obvious token/key/password patterns found in curated/public memory docs')
PY
  then
    fail=1
  fi
else
  echo 'WARN: python3 missing; skipped secret scan'
fi

if [[ "$CHECK_GBRAIN" == "1" ]] && command -v gbrain >/dev/null 2>&1; then
  printf '\nGBrain sources:\n'
  tmp="$(mktemp)"
  if gbrain sources list --timeout=60s --json >"$tmp"; then
    if ! python3 - "$tmp" "$AGENT_MEMORY_ROOT" $AGENT_MEMORY_AGENTS <<'PY'
import json
import os
import sys

path = sys.argv[1]
root = sys.argv[2]
agents = sys.argv[3:]
data = json.load(open(path))
sources = data.get('sources', data if isinstance(data, list) else [])
by_id = {s.get('id'): s for s in sources}
expected = {'agent-shared-public': os.path.join(root, 'shared', 'public')}
for agent in agents:
    expected[f'agent-{agent}-public'] = os.path.join(root, 'agents', agent, 'public')
    expected[f'agent-{agent}-private'] = os.path.join(root, 'agents', agent, 'private', 'curated')

def is_sensitive_path(value):
    if not value:
        return False
    candidates = [value]
    try:
        candidates.append(os.path.realpath(value))
    except OSError:
        pass
    for candidate in candidates:
        parts = os.path.normpath(candidate).split(os.sep)
        if 'secrets' in parts:
            return True
        for idx, part in enumerate(parts[:-1]):
            if part == 'private' and parts[idx + 1] == 'live':
                return True
    return False

errors = []
for source in sources:
    source_id = source.get('id') or '<unknown>'
    actual = source.get('local_path') or source.get('path') or ''
    if is_sensitive_path(actual):
        errors.append(f'GBrain source {source_id} points at non-indexable path {actual!r}')
for source_id, expected_path in expected.items():
    source = by_id.get(source_id)
    if not source:
        errors.append(f'missing GBrain source {source_id}')
        continue
    actual = source.get('local_path') or source.get('path') or ''
    if actual != expected_path:
        errors.append(f'GBrain source {source_id} path is {actual!r}, expected {expected_path!r}')
if errors:
    for error in errors:
        print('FAIL: ' + error)
    sys.exit(1)
print('ok: all expected GBrain sources point to public or private/curated paths, and no source points to live/secrets')
PY
    then
      fail=1
    fi
  else
    err "could not query GBrain sources; see docs/agents/central-agent-memory.md#recover-local-postgres-backed-gbrain"
  fi
  rm -f "$tmp"
fi

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

path_is_non_indexable() {
  local path="$1"
  python3 - "$path" <<'PY'
import os
import sys
value = sys.argv[1]
candidates = [value]
try:
    candidates.append(os.path.realpath(value))
except OSError:
    pass
for candidate in candidates:
    parts = os.path.normpath(candidate).split(os.sep)
    if 'secrets' in parts:
        sys.exit(0)
    for idx, part in enumerate(parts[:-1]):
        if part == 'private' and parts[idx + 1] == 'live':
            sys.exit(0)
sys.exit(1)
PY
}

qmd_collection_names() {
  qmd collection list 2>/dev/null | python3 -c 'import re, sys
for line in sys.stdin:
    match = re.match(r"^(\S+)\s+\(qmd://", line)
    if match:
        print(match.group(1))'
}

if [[ "$CHECK_QMD" == "1" ]] && command -v qmd >/dev/null 2>&1; then
  printf '\nQMD collections:\n'
  declare -A expected_qmd
  expected_qmd[agent-shared-public]="$AGENT_MEMORY_ROOT/shared/public"
  for agent in $AGENT_MEMORY_AGENTS; do
    expected_qmd["agent-$agent-public"]="$AGENT_MEMORY_ROOT/agents/$agent/public"
    expected_qmd["agent-$agent-private"]="$AGENT_MEMORY_ROOT/agents/$agent/private/curated"
  done
  for name in "${!expected_qmd[@]}"; do
    actual="$(qmd_collection_path "$name" || true)"
    if [[ -z "$actual" ]]; then
      err "missing QMD collection $name"
    elif [[ "$actual" != "${expected_qmd[$name]}" ]]; then
      err "QMD collection $name path is $actual, expected ${expected_qmd[$name]}"
    elif path_is_non_indexable "$actual"; then
      err "QMD collection $name points at non-indexable path $actual"
    else
      ok "QMD collection $name -> $actual"
    fi
  done
  while IFS= read -r name; do
    [[ -n "$name" ]] || continue
    actual="$(qmd_collection_path "$name" || true)"
    if [[ -n "$actual" ]] && path_is_non_indexable "$actual"; then
      err "QMD collection $name points at non-indexable path $actual"
    fi
  done < <(qmd_collection_names)
fi

exit "$fail"
