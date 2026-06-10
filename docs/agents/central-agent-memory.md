# Central Agent Memory Runbook

This runbook backs up the Takopi-style local setup for Hermes, Codex, Claude Code, OpenClaw, and OpenCode into a reproducible script. The goal is a single local place to inspect agent memories without automatically mixing the memories of different agents or indexing secrets.

## Design goals

- **One place to look:** `/home/agents/agent-memory` by default.
- **Writer segregation:** each agent writes under `agents/<agent>/`.
- **Sensitivity segregation:** each writer has `public/`, `private/curated/`, `private/live/`, and `secrets/` folders.
- **Low active-context cost:** agents search GBrain/QMD first, cite a source, and read only the small hit they need.
- **No accidental secret fan-out:** `secrets/` is never registered as a GBrain source or QMD collection, and should contain pointers to a secret manager rather than plaintext secrets.
- **Reproducibility:** setup is scripted and idempotent; existing live memory paths are backed up before they are symlinked into the central root.

## Directory layout

```text
/home/agents/agent-memory/
  README.md
  policy.yaml
  shared/public/
  agents/
    hermes/{public,private/{curated,live},secrets,inbox,archive}/
    codex/{public,private/{curated,live},secrets,inbox,archive}/
    claude/{public,private/{curated,live},secrets,inbox,archive}/
    openclaw/{public,private/{curated,live},secrets,inbox,archive}/
    opencode/{public,private/{curated,live},secrets,inbox,archive}/
```

`private/curated/MEMORY.md` is the durable same-agent memory file. If an older install has `private/MEMORY.md`, the setup script migrates it into `private/curated/MEMORY.md` and removes the legacy file. `private/live/` is only for centralized raw tool-owned state such as agent logs, project memories, and global instruction files.

## GBrain/QMD source policy

The setup registers safe folders with separate source IDs:

- `agent-shared-public` -> `shared/public`
- `agent-<agent>-public` -> `agents/<agent>/public`
- `agent-<agent>-private` -> `agents/<agent>/private/curated`

No `private/live/` or `secrets/` folder is registered. Keep these sources non-federated/default unless a human explicitly changes the memory policy. Agents should cite hits as `brain:<source-id>:<slug-or-file>`.

## Live-state links created on Takopi-style servers

By default the setup script migrates these existing memories into `private/live/` and replaces the original paths with symlinks:

- Hermes: `~/.hermes/memories` -> `agents/hermes/private/live/hermes-memories`
- Codex markdown memory: `~/.codex/memories` -> `agents/codex/private/live/codex-memories`
- Codex SQLite memory: `~/.codex/memories_1.sqlite` is copied as a timestamped snapshot by default. Pass `--link-sqlite` after stopping active Codex processes if you want the SQLite file itself symlinked into the central root.
- Codex global instructions: `~/.codex/AGENTS.md` -> `agents/codex/private/live/AGENTS.md`
- Claude project memories: `~/.claude/projects` -> `agents/claude/private/live/claude-projects`
- Claude global memory: `~/.claude/CLAUDE.md` -> `agents/claude/private/live/CLAUDE.md`
- OpenClaw memory workspace: `~/.openclaw/workspace/memory` -> `agents/openclaw/private/live/openclaw-memory`
- OpenCode global instructions: `~/.config/opencode/AGENTS.md` -> `agents/opencode/private/live/AGENTS.md`

For future machines where you only want to create the structure, pass `--no-link-live-state`.

## Commands

Dry run:

```bash
scripts/agents/setup-central-agent-memory.sh --dry-run
```

Apply locally:

```bash
scripts/agents/setup-central-agent-memory.sh
```

Configure GBrain MCP for installed agents:

```bash
scripts/agents/configure-agent-gbrain-mcp.sh
```

The MCP helper configures Codex, Claude Code, OpenClaw, and OpenCode when their CLIs are present, and verifies Hermes when its MCP list command is available. OpenClaw and Hermes support low-token include-lists; OpenCode's current JSON schema registers the local MCP command but does not expose a documented per-server include-list, so the central `AGENTS.md` memory guide remains the policy layer for selective retrieval. The OpenCode updater accepts JSONC input, including comment-only files, but rewrites `opencode.jsonc` as normalized JSON, so hand-written comments are not preserved.

Audit:

```bash
scripts/agents/audit-agent-memory.sh
```

If the audit reports that it cannot query GBrain sources, or that an expected
source path is empty/wrong, do **not** treat the setup as complete yet. Recover
GBrain first, then rerun both the setup and audit commands so the expected
`agent-*` sources are registered against the active brain.

Smoke test in a temporary root without touching live agent configs:

```bash
scripts/tests/agent-memory-smoke.sh
```

## Recover local Postgres-backed GBrain

Some servers run GBrain on a local Docker Postgres/pgvector container instead of
the older embedded/PGLite store. If `~/.gbrain/config.json` drifts from the
running `gbrain-postgres` container, agent memory may look configured while all
retrieval paths fail.

Symptoms:

- `gbrain stats` fails.
- `gbrain sources list --timeout=60s --json` fails or times out.
- `hermes mcp test gbrain` fails.
- Claude/OpenCode/Codex MCP checks show `gbrain` disconnected or missing tools.

Secret-safe checks:

```bash
# Check for stale local GBrain MCP processes that can hold locks or old config.
pgrep -af 'gbrain serve' || true

# Confirm the local Postgres/pgvector container is present and mapped to a host port.
docker ps --filter name=gbrain-postgres --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'

# Print only the non-secret shape of ~/.gbrain/config.json.
python3 - <<'PY'
import json
import urllib.parse
from pathlib import Path

cfg_path = Path.home() / '.gbrain' / 'config.json'
cfg = json.loads(cfg_path.read_text(encoding='utf-8'))
url = cfg.get('database_url', '')
parts = urllib.parse.urlsplit(url)
print({
    'scheme': parts.scheme,
    'host': parts.hostname,
    'port': parts.port,
    'database': (parts.path or '').lstrip('/'),
    'has_user': bool(parts.username),
    'password_length': len(parts.password or ''),
})
PY
```

Repair pattern:

1. Stop stale `gbrain serve` processes if they are left over from old MCP
   clients; active MCP clients will relaunch them when needed.
2. Do **not** paste database URLs, passwords, or container env output into PRs,
   logs, or chat. Redact or print only shape metadata.
3. Do **not** blindly copy `GBRAIN_DATABASE_URL` from the container env. If the
   password contains reserved URL characters, an unescaped URL can parse
   incorrectly. Build the URL from `POSTGRES_USER`, `POSTGRES_PASSWORD`,
   `POSTGRES_DB`, and the Docker host-port mapping, with username/password
   URL-encoded.
4. Update only the local server file `~/.gbrain/config.json` and keep it
   owner-only (`chmod 600`). This file is not committed to the repo.

Example repair command, which reads the Docker env locally but does not print
the password or final URL:

```bash
python3 - <<'PY'
import json
import subprocess
import urllib.parse
from pathlib import Path

raw = subprocess.check_output(['docker', 'inspect', 'gbrain-postgres'], text=True)
container = json.loads(raw)[0]

env = {}
for item in container.get('Config', {}).get('Env') or []:
    if '=' in item:
        key, value = item.split('=', 1)
        env[key] = value

ports = container.get('NetworkSettings', {}).get('Ports', {})
host_port = (ports.get('5432/tcp') or [{}])[0].get('HostPort') or '5432'
host_ip = (ports.get('5432/tcp') or [{}])[0].get('HostIp') or '127.0.0.1'
if host_ip in ('0.0.0.0', '::'):
    host_ip = '127.0.0.1'

user = env.get('POSTGRES_USER', 'gbrain')
pg_pass = env['POSTGRES_PASSWORD']
database = env.get('POSTGRES_DB', user)
url = (
    'postgresql://' + urllib.parse.quote(user, safe='')
    + ':' + urllib.parse.quote(pg_pass, safe='')
    + '@' + host_ip
    + ':' + host_port
    + '/' + urllib.parse.quote(database, safe='')
)

cfg_path = Path.home() / '.gbrain' / 'config.json'
cfg = json.loads(cfg_path.read_text(encoding='utf-8'))
cfg['database_url'] = url
cfg_path.write_text(json.dumps(cfg, indent=2) + '\n', encoding='utf-8')
cfg_path.chmod(0o600)
print('updated ~/.gbrain/config.json database_url from gbrain-postgres env; secret URL not printed')
PY
```

Then re-register and verify:

```bash
scripts/agents/setup-central-agent-memory.sh
scripts/agents/audit-agent-memory.sh --root /home/agents/agent-memory
gbrain stats
gbrain sources list --timeout=60s --json >/tmp/gbrain-sources.json
hermes mcp test gbrain
```

If `gbrain sources list --json` succeeds but the audit reports `agent-*` source
paths as empty or wrong, the source metadata has drifted even though the source
IDs still exist. Do not delete/recreate those sources blindly on a live brain:
newer GBrain versions warn because removal deletes pages/chunks, and some source
rows may be referenced by OAuth/client metadata. Prefer repairing source
metadata under operator review, then rerun the audit. If you intentionally want
the setup script to delete/recreate mismatched sources after confirming the data
loss is acceptable, set:

```bash
AGENT_MEMORY_RECREATE_GBRAIN_SOURCES=1 scripts/agents/setup-central-agent-memory.sh
```

If the currently running Telegram/Hermes gateway had already opened a stale MCP
handle, start a new session or restart the gateway after the CLI checks pass.

## Agent instructions

The setup upserts a `central-agent-memory` block in each agent's global instruction/memory file where available, and in `private/curated/MEMORY.md`. Rerunning the script refreshes older blocks instead of leaving stale paths behind. The block tells each agent:

1. its own writer namespace;
2. where to write private vs deliberately public memory;
3. to query GBrain/QMD before reading raw folders;
4. to avoid other agents' private sources unless explicitly instructed;
5. to keep plaintext credentials out of memory.

## Security notes

This setup is a policy and locality boundary, not a hard security boundary when all agents run as the same Unix user. File permissions are tightened to owner-only where possible, but any tool-capable process running as the same user can technically read same-user files. For strong isolation, run lower-trust agents under separate Unix users or containers and mount only their own `agents/<agent>` directory plus `shared/public`.

The audit scans only curated/public docs for secret-looking patterns and intentionally skips `private/live/` because that folder can contain raw tool logs or copied live state. Excluding `private/live/` from GBrain/QMD prevents accidental retrieval fan-out; it does not make those files unreadable to processes running as the same Unix user.

Never commit `/home/agents/agent-memory` wholesale. If memory should be backed up to this repo, create a curated, redacted export under an explicit docs or backup path and run a secret scan first.
