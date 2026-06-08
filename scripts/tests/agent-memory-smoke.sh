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

expect_missing_value() {
  local script="$1" flag="$2" output status
  set +e
  output="$(bash "$script" "$flag" 2>&1)"
  status=$?
  set -e
  [[ "$status" -eq 2 ]] || {
    printf 'expected %s %s to exit 2, got %s\n%s\n' "$script" "$flag" "$status" "$output" >&2
    exit 1
  }
  [[ "$output" == *"missing value for $flag"* ]] || {
    printf 'expected missing-value message for %s in output:\n%s\n' "$flag" "$output" >&2
    exit 1
  }
  [[ "$output" != *"unbound variable"* ]] || {
    printf 'unexpected set -u crash for %s:\n%s\n' "$flag" "$output" >&2
    exit 1
  }
}

expect_missing_value "$REPO_ROOT/scripts/agents/setup-central-agent-memory.sh" --root
expect_missing_value "$REPO_ROOT/scripts/agents/setup-central-agent-memory.sh" --agents
expect_missing_value "$REPO_ROOT/scripts/agents/audit-agent-memory.sh" --root
expect_missing_value "$REPO_ROOT/scripts/agents/audit-agent-memory.sh" --agents
expect_missing_value "$REPO_ROOT/scripts/agents/configure-agent-gbrain-mcp.sh" --gbrain-bin
expect_missing_value "$REPO_ROOT/scripts/agents/configure-agent-gbrain-mcp.sh" --include

AGENT_MEMORY_ROOT="$ROOT" \
  bash "$REPO_ROOT/scripts/agents/setup-central-agent-memory.sh" \
  --root "$ROOT" \
  --no-link-live-state \
  --no-gbrain \
  --no-qmd

STUB_BIN="$ROOT/stub-bin"
mkdir -p "$STUB_BIN"
cat > "$STUB_BIN/gbrain" <<'PY'
#!/usr/bin/env python3
import json
import os
import sys
from pathlib import Path
state = Path(os.environ['AGENT_MEMORY_ROOT']) / '.stub-gbrain-sources.json'

def load():
    if state.exists():
        return json.loads(state.read_text())
    return []

def save(items):
    state.write_text(json.dumps(items, sort_keys=True))

args = [arg for arg in sys.argv[1:] if not arg.startswith('--timeout=')]
if args[:3] == ['sources', 'list', '--json']:
    print(json.dumps({'sources': load()}))
elif args[:2] == ['sources', 'add']:
    source_id = args[2]
    source_path = args[args.index('--path') + 1]
    items = [item for item in load() if item.get('id') != source_id]
    items.append({'id': source_id, 'local_path': source_path, 'federated': False})
    save(items)
elif args[:2] == ['sources', 'remove']:
    save([item for item in load() if item.get('id') != args[2]])
elif args[:1] == ['sync']:
    marker = Path(os.environ['AGENT_MEMORY_ROOT']) / '.stub-gbrain-sync.log'
    marker.write_text(marker.read_text() + ' '.join(args) + '\n' if marker.exists() else ' '.join(args) + '\n')
else:
    print('unexpected gbrain args: ' + repr(args), file=sys.stderr)
    sys.exit(2)
PY
cat > "$STUB_BIN/qmd" <<'PY'
#!/usr/bin/env python3
import json
import os
import sys
from pathlib import Path
state = Path(os.environ['AGENT_MEMORY_ROOT']) / '.stub-qmd-collections.json'

def load():
    if state.exists():
        return json.loads(state.read_text())
    return {}

def save(items):
    state.write_text(json.dumps(items, sort_keys=True))

args = sys.argv[1:]
items = load()
if args[:2] == ['collection', 'list']:
    print(f'Collections ({len(items)}):')
    for name, path in sorted(items.items()):
        print(f'{name} (qmd://{name}/)')
        print(f'  Path:     {path}')
elif args[:2] == ['collection', 'show']:
    path = items.get(args[2])
    if path is None:
        sys.exit(1)
    print(f'Name: {args[2]}')
    print(f'Path:     {path}')
elif args[:2] == ['collection', 'add']:
    collection_path = args[2]
    name = args[args.index('--name') + 1]
    items[name] = collection_path
    save(items)
elif args[:2] == ['collection', 'remove']:
    items.pop(args[2], None)
    save(items)
else:
    print('unexpected qmd args: ' + repr(args), file=sys.stderr)
    sys.exit(2)
PY
chmod +x "$STUB_BIN/gbrain" "$STUB_BIN/qmd"
cat > "$STUB_BIN/codex" <<'SH'
#!/usr/bin/env bash
set -euo pipefail
state="$AGENT_MEMORY_ROOT/.stub-codex-mcp"
if [[ "${1:-}" == "mcp" && "${2:-}" == "list" ]]; then
  if [[ -f "$state" ]]; then
    printf 'Name Command\n'
    printf 'gbrain %s\n' "$(cat "$state")"
  fi
elif [[ "${1:-}" == "mcp" && "${2:-}" == "add" ]]; then
  printf '%s\n' "$*" > "$state"
else
  exit 2
fi
SH
cat > "$STUB_BIN/claude" <<'SH'
#!/usr/bin/env bash
set -euo pipefail
state="$AGENT_MEMORY_ROOT/.stub-claude-mcp"
if [[ "${1:-}" == "mcp" && "${2:-}" == "list" ]]; then
  [[ -f "$state" ]] && printf 'gbrain: %s\n' "$(cat "$state")"
elif [[ "${1:-}" == "mcp" && "${2:-}" == "add" ]]; then
  printf '%s\n' "$*" > "$state"
else
  exit 2
fi
SH
cat > "$STUB_BIN/openclaw" <<'SH'
#!/usr/bin/env bash
set -euo pipefail
state="$AGENT_MEMORY_ROOT/.stub-openclaw-mcp"
if [[ "${1:-}" == "mcp" && "${2:-}" == "show" ]]; then
  [[ -f "$state" ]] && exit 0 || exit 1
elif [[ "${1:-}" == "mcp" && "${2:-}" == "add" ]]; then
  printf '%s\n' "$*" > "$state"
else
  exit 2
fi
SH
cat > "$STUB_BIN/hermes" <<'SH'
#!/usr/bin/env bash
if [[ "${1:-}" == "mcp" && "${2:-}" == "list" ]]; then
  printf 'gbrain stdio enabled\n'
else
  exit 2
fi
SH
cat > "$STUB_BIN/opencode" <<'SH'
#!/usr/bin/env bash
if [[ "${1:-}" == "mcp" && "${2:-}" == "list" ]]; then
  printf 'No MCP servers configured\n'
else
  exit 0
fi
SH
chmod +x "$STUB_BIN/codex" "$STUB_BIN/claude" "$STUB_BIN/openclaw" "$STUB_BIN/hermes" "$STUB_BIN/opencode"

PATH="$STUB_BIN:$PATH" \
AGENT_MEMORY_ROOT="$ROOT" \
  bash "$REPO_ROOT/scripts/agents/setup-central-agent-memory.sh" \
  --root "$ROOT" \
  --no-link-live-state \
  --sync-gbrain

PATH="$STUB_BIN:$PATH" \
AGENT_MEMORY_ROOT="$ROOT" \
  bash "$REPO_ROOT/scripts/agents/audit-agent-memory.sh" \
  --root "$ROOT"

python3 - "$ROOT" <<'PY'
import json
import sys
from pathlib import Path
root = Path(sys.argv[1])
gbrain = {item['id']: item['local_path'] for item in json.loads((root / '.stub-gbrain-sources.json').read_text())}
qmd = json.loads((root / '.stub-qmd-collections.json').read_text())
for source_map in (gbrain, qmd):
    assert source_map['agent-hermes-private'] == str(root / 'agents/hermes/private/curated')
    assert source_map['agent-openclaw-private'] == str(root / 'agents/openclaw/private/curated')
    assert all('/private/live' not in path and '/secrets' not in path for path in source_map.values())
assert (root / '.stub-gbrain-sync.log').exists()
PY

CONFIG_HOME="$ROOT/config-home"
mkdir -p "$CONFIG_HOME/.config/opencode"
cat > "$CONFIG_HOME/.config/opencode/opencode.jsonc" <<'EOF'
{
  "$schema": "https://opencode.ai/config.json", // JSONC comment kept valid for parser smoke
  "notes": "escaped quote: \" and slash: https://example.com/a/*not-a-comment*/"
}
EOF
PATH="$STUB_BIN:$PATH" \
HOME="$CONFIG_HOME" \
AGENT_MEMORY_ROOT="$ROOT" \
GBRAIN_BIN="$STUB_BIN/gbrain" \
  bash "$REPO_ROOT/scripts/agents/configure-agent-gbrain-mcp.sh"

python3 - "$ROOT" "$CONFIG_HOME/.config/opencode/opencode.jsonc" "$STUB_BIN/gbrain" <<'PY'
import json
import sys
from pathlib import Path
root = Path(sys.argv[1])
config = json.loads(Path(sys.argv[2]).read_text())
gbrain_bin = sys.argv[3]
for marker in ['.stub-codex-mcp', '.stub-claude-mcp', '.stub-openclaw-mcp']:
    assert (root / marker).exists(), marker
assert config['mcp']['gbrain'] == {'type': 'local', 'command': [gbrain_bin, 'serve']}
assert config['notes'] == 'escaped quote: " and slash: https://example.com/a/*not-a-comment*/'
PY

COMMENT_HOME="$ROOT/comment-only-home"
mkdir -p "$COMMENT_HOME/.config/opencode"
cat > "$COMMENT_HOME/.config/opencode/opencode.jsonc" <<'EOF'
// Existing OpenCode config with comments only.
/* The updater should treat this as an empty config object. */
EOF
PATH="$STUB_BIN:$PATH" \
HOME="$COMMENT_HOME" \
AGENT_MEMORY_ROOT="$ROOT" \
GBRAIN_BIN="$STUB_BIN/gbrain" \
  bash "$REPO_ROOT/scripts/agents/configure-agent-gbrain-mcp.sh"
python3 - "$COMMENT_HOME/.config/opencode/opencode.jsonc" "$STUB_BIN/gbrain" <<'PY'
import json
import sys
from pathlib import Path
config = json.loads(Path(sys.argv[1]).read_text())
gbrain_bin = sys.argv[2]
assert config['mcp']['gbrain'] == {'type': 'local', 'command': [gbrain_bin, 'serve']}
PY

LIVE_HOME="$ROOT/home"
mkdir -p "$LIVE_HOME/.hermes/memories"
cat > "$LIVE_HOME/.hermes/memories/MEMORY.md" <<'EOF'
# Existing Hermes Memory

<!-- central-agent-memory:begin -->
## Central Agent Memory

- Central root: `/home/agents/agent-memory`.
- Your writer namespace: `agents/hermes/`.
- Write normal durable memory to `agents/hermes/private/`; write deliberately shareable facts to `agents/hermes/public/`.
EOF

HOME="$LIVE_HOME" \
AGENT_MEMORY_ROOT="$ROOT" \
  bash "$REPO_ROOT/scripts/agents/setup-central-agent-memory.sh" \
  --root "$ROOT" \
  --no-gbrain \
  --no-qmd

python3 - "$ROOT/agents/hermes/private/live/hermes-memories/MEMORY.md" <<'PY'
from pathlib import Path
import sys
text = Path(sys.argv[1]).read_text(encoding='utf-8')
assert 'agents/hermes/private/curated/' in text
assert 'Write normal durable memory to `agents/hermes/private/`;' not in text
assert text.count('central-agent-memory:begin') == 1
PY

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
