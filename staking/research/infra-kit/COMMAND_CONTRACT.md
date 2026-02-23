# InfraKit Cross-Stack Command Contract (v0)

Purpose: normalize operational commands across all stack adapters (Ethereum, Aztec, Monad, MegaETH).

## Required Commands

Each stack adapter **must** expose these commands (via script, systemd wrapper, or native CLI):

### 1. `bootstrap [FLAGS]`
**Purpose**: full initial setup (install, config, systemd units, optional hardening/monitoring).

**Semantics**:
- Idempotent where feasible (safe to re-run).
- Requires root or sudo for service installation, firewall, hardening.
- Outputs to stderr for logging, exits with clear error codes.
- Precondition checks (ports free, dependencies present).

**Standard flags** (optional, but preferred):
- `--with-monitoring` — enable Prometheus/Grafana stack
- `--with-firewall` — enable and configure firewall rules
- `--with-hardening` — apply SSH + fail2ban + unattended upgrades
- `--help` — show usage

**Environment**: reads from `/etc/<STACK_NAME>/<env_file>` or via env vars.

**Exit codes**:
- `0` = success
- `1` = generic error (missing prereq, port bound, etc.)
- `2` = bad arguments

**Examples**:
```bash
# Aztec
sudo staking/aztec/infra/scripts/bootstrap_aztec.sh --with-firewall --with-monitoring

# Monad
sudo staking/monad/infra/scripts/bootstrap_all.sh --with-hardening

# Ethereum (eth2-quickstart, pattern):
# (no direct bootstrap yet; uses run_1.sh + run_2.sh)
```

---

### 2. `preflight [--json]`
**Purpose**: validate environment before startup (ports, files, perms, deps).

**Semantics**:
- Non-destructive, no side effects.
- Can run unprivileged unless checking system configs.
- Outputs human-readable checks to stderr; `--json` on stdout for tooling.

**Standard flags**:
- `--json` — output results as JSON array of check objects
- `--verbose` — list all checks, even passing ones

**JSON format**:
```json
[
  {"check": "port_8080_free", "status": "pass", "message": ""},
  {"check": "config_file_readable", "status": "fail", "message": "config.toml not found at /etc/aztec/config.toml"}
]
```

**Exit codes**:
- `0` = all critical checks pass
- `1` = at least one critical check fails

**Examples**:
```bash
staking/aztec/infra/scripts/preflight_check.sh --json
staking/monad/infra/scripts/preflight_check.sh
```

---

### 3. `smoke [--json]`
**Purpose**: verify running service is responsive (quick e2e test).

**Semantics**:
- Assumes service is already running.
- Makes RPC calls, health checks, basic assertions.
- Non-destructive.
- Can be called from systemd `ExecStartPost` or monitoring systems.

**Standard flags**:
- `--json` — output results as JSON object

**JSON format**:
```json
{
  "status": "ok" | "degraded" | "down",
  "timestamp": "2026-02-21T21:00:00Z",
  "checks": [
    {"name": "rpc_responsive", "status": "pass"},
    {"name": "syncing", "status": "pass", "detail": "block=12345"}
  ]
}
```

**Exit codes**:
- `0` = service healthy
- `1` = service down or degraded

**Examples**:
```bash
staking/aztec/infra/scripts/e2e_smoke_test.sh --json
staking/monad/infra/scripts/e2e_smoke_test.sh
```

---

### 4. `status [--json]`
**Purpose**: report current service state (running, stopped, error, metrics).

**Semantics**:
- Read-only; does not change state.
- Can include recent logs, systemd unit status, metrics snapshots.
- Can run unprivileged in most cases.

**Standard flags**:
- `--json` — output results as JSON
- `--tail=N` — last N log lines (default 10)

**JSON format**:
```json
{
  "service_name": "aztec-node",
  "status": "active" | "inactive" | "failed",
  "uptime_seconds": 3600,
  "recent_logs": ["...", "..."],
  "rpc_healthy": true,
  "rpc_url": "http://localhost:8080"
}
```

**Exit codes**:
- `0` = running healthy
- `1` = stopped or failed

**Examples**:
```bash
staking/aztec/infra/scripts/status.sh --json
staking/monad/infra/scripts/status.sh
```

---

### 5. `stop [--force]`
**Purpose**: gracefully stop the service (allow drain time, then force kill).

**Semantics**:
- Stops primary systemd unit(s).
- Allows configurable drain time (e.g., 30s by default).
- `--force` skips graceful shutdown, kills immediately.
- Requires root (systemctl).

**Standard flags**:
- `--force` — do not wait, kill immediately
- `--timeout=N` — max wait time in seconds (default 30)

**Exit codes**:
- `0` = service stopped
- `1` = service stop timeout or error

**Examples**:
```bash
sudo staking/aztec/infra/scripts/stop.sh
sudo staking/monad/infra/scripts/stop.sh --force --timeout=10
```

---

### 6. `start [--no-wait]`
**Purpose**: start the primary service (reverse of stop).

**Semantics**:
- Starts primary systemd unit.
- Waits for it to reach `active` state (default) or fails fast.
- `--no-wait` starts and returns immediately.

**Standard flags**:
- `--no-wait` — start asynchronously, don't wait for active state
- `--timeout=N` — max wait for active state (default 60)

**Exit codes**:
- `0` = service active
- `1` = service failed to start or timeout

**Examples**:
```bash
sudo staking/aztec/infra/scripts/start.sh --timeout=30
sudo staking/monad/infra/scripts/start.sh
```

---

### 7. `logs [--tail=N] [--follow]`
**Purpose**: access service logs for debugging.

**Semantics**:
- Tail systemd journal by default; can fall back to file logs.
- `--follow` streams new lines (like `tail -f`).
- Can be called unprivileged if user is in `systemd-journal` group.

**Standard flags**:
- `--tail=N` — show last N lines (default 50)
- `--follow` — stream new lines until interrupted
- `--since=TIME` — show logs since TIME (ISO 8601 or relative like "10 minutes ago")

**Exit codes**:
- `0` = success (may be empty if no logs found)
- `1` = permission denied or service not found

**Examples**:
```bash
staking/aztec/infra/scripts/logs.sh --tail=100
staking/monad/infra/scripts/logs.sh --follow
```

---

## Rationale

### Why these commands?
- **bootstrap** + **preflight** + **smoke** are the core deployment cycle: setup → validate → verify.
- **status** + **logs** + **stop** + **start** cover daily operations and debugging.
- Each command has a JSON output option for integration with monitoring/orchestration tools.

### Why exit codes?
Exit codes allow scripts to be composed in shell pipelines and CI/CD workflows without string parsing.

### Why flags are optional?
Some stacks may not support all flags. Adapters should:
1. Document which flags they support.
2. Gracefully error if unsupported flag is used: `echo "unsupported flag: --xyz" >&2; exit 2`.

### Why idempotency?
Infrastructure as Code requires re-running bootstrap on the same host without side effects (e.g., creating duplicate systemd units).

---

## Implementation Status

| Command | Ethereum (eth2-quickstart) | Aztec | Monad | MegaETH |
|---|---|---|---|---|
| `bootstrap` | Partial (run_1.sh + run_2.sh) | ✅ bootstrap_aztec.sh | ✅ bootstrap_all.sh | — |
| `preflight` | — | — | ✅ preflight_check.sh | — |
| `smoke` | — | — | ✅ e2e_smoke_test.sh | — |
| `status` | — | — | ⚠️ status.py (Python) | — |
| `stop` | — | — | — | — |
| `start` | — | — | — | — |
| `logs` | — | — | — | — |

**Note**: Cells marked `—` require creation. Cells marked `⚠️` exist but may need wrapper for consistency.

---

## Follow-up Tasks (P1+P2)

1. **Create unified wrappers** in `/scripts/stack-ops/` that dispatch to stack-specific implementations.
2. **Add missing commands** (stop, start, logs) to Aztec and Monad adapters.
3. **Harmonize naming**: Aztec uses `bootstrap_aztec.sh`, Monad uses `bootstrap_all.sh`, Ethereum uses run_1.sh/run_2.sh. Decide on canonical names or create aliases.
4. **Add to CI**: assert that each adapter implements all 7 commands (or has documented exemptions).
5. **Create operator playbook** that uses these commands in realistic workflows (e.g., "update validator keys → preflight → smoke → status").
