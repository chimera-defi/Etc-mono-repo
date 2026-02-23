# Stack Operations (stack-ops)

Unified command interface for managing all supported staking stacks.

## Quick Start

```bash
# Auto-detect stack and show status
./scripts/stack-ops/stack-cli.sh status

# Explicitly target a stack
./scripts/stack-ops/stack-cli.sh --stack=aztec bootstrap --with-firewall
./scripts/stack-ops/stack-cli.sh --stack=monad preflight --json
./scripts/stack-ops/stack-cli.sh --stack=ethereum status
```

## Usage

```
stack-cli.sh [--stack=NAME] COMMAND [ARGS...]
```

### Options

- `--stack=NAME` — Target stack (`aztec`, `monad`, `ethereum`, `megaeth`)
  - If omitted, attempts auto-detection from systemd units
- `--help` — Show help

### Commands

Each command is documented in the **Command Contract** (`staking/research/infra-kit/COMMAND_CONTRACT.md`).

| Command | Purpose | Example |
|---------|---------|---------|
| `bootstrap [FLAGS]` | Full initial setup (install, config, systemd) | `./stack-cli.sh --stack=aztec bootstrap --with-monitoring` |
| `preflight [FLAGS]` | Validate environment before startup | `./stack-cli.sh --stack=monad preflight --json` |
| `smoke [FLAGS]` | Quick health check (RPC, syncing, etc.) | `./stack-cli.sh smoke` |
| `status [FLAGS]` | Report service state and metrics | `./stack-cli.sh status --json --tail=20` |
| `start [FLAGS]` | Start service | `sudo ./stack-cli.sh start` |
| `stop [FLAGS]` | Stop service | `sudo ./stack-cli.sh stop --force` |
| `logs [FLAGS]` | Tail service logs | `./stack-cli.sh logs --follow --since="10 minutes ago"` |

## Stack-Specific Scripts

If you prefer to call stack-specific scripts directly:

### Aztec
```bash
sudo staking/aztec/infra/scripts/bootstrap_aztec.sh
staking/aztec/infra/scripts/check_aztec_node.sh
staking/aztec/infra/scripts/status_aztec.sh --json
sudo staking/aztec/infra/scripts/start_aztec.sh
sudo staking/aztec/infra/scripts/stop_aztec.sh
staking/aztec/infra/scripts/logs_aztec.sh --tail=100
```

### Monad
```bash
sudo staking/monad/infra/scripts/bootstrap_all.sh
staking/monad/infra/scripts/preflight_check.sh
staking/monad/infra/scripts/e2e_smoke_test.sh
staking/monad/infra/scripts/status.sh --json
sudo staking/monad/infra/scripts/start.sh
sudo staking/monad/infra/scripts/stop.sh
staking/monad/infra/scripts/logs.sh --follow
```

### Ethereum (eth2-quickstart)
```bash
cd ../eth2-quickstart
./run_1.sh   # phase 1 setup
./run_2.sh   # phase 2 setup
./test/run_tests.sh
```

## Environment Variables

All scripts respect the **Environment Contract** defined in `staking/research/infra-kit/ENV_CONTRACT.md`.

### Common Variables
- `STACK_NAME` — Stack identifier (overrides auto-detect)
- `STACK_USER` — OS user for service (e.g., `aztec`, `monad`)
- `STACK_DATA_DIR` — Primary data directory
- `STACK_RPC_URL` — Local RPC endpoint for health checks
- `STACK_SERVICE_NAME` — Systemd unit name

### Stack-Specific
- **Aztec**: `AZTEC_NODE_URL`, `AZTEC_DATA_DIR`, `ETHEREUM_HOSTS`
- **Monad**: `RPC_URL`, `STATUS_PORT`, `MONAD_BFT_BIN_SRC`
- **Ethereum**: `ETH2_QUICKSTART_PATH` (override default `../eth2-quickstart`), `GETH_DATADIR`, `NETHERMIND_*`, `ETHREX_P2P_PORT`

## Flags Reference

### Common Flags (supported where applicable)

#### `--json`
Output structured JSON for tooling/monitoring systems.

```bash
./stack-cli.sh status --json | jq .
```

#### `--with-firewall`, `--with-monitoring`, `--with-hardening`
Available on `bootstrap` command to add optional components.

```bash
./stack-cli.sh --stack=aztec bootstrap --with-firewall --with-monitoring
```

#### `--tail=N`
Include last N log lines (for `logs` and `status` commands).

```bash
./stack-cli.sh logs --tail=100
./stack-cli.sh status --tail=20 --json
```

#### `--follow` / `-f`
Stream logs in real-time (for `logs` command).

```bash
./stack-cli.sh logs --follow
```

#### `--since=TIME`
Show logs since TIME. Accepts relative times and ISO 8601.

```bash
./stack-cli.sh logs --since="10 minutes ago"
./stack-cli.sh logs --since="2026-02-21 10:00:00"
```

#### `--force`
For `stop`, kill immediately without graceful shutdown.

```bash
sudo ./stack-cli.sh stop --force
```

#### `--no-wait`
For `start`, do not wait for service to reach active state.

```bash
sudo ./stack-cli.sh start --no-wait
```

## Exit Codes

All scripts follow these conventions:

- `0` — Success (command completed as expected)
- `1` — Failure (service error, check fails, timeout, etc.)
- `2` — Invalid arguments (bad flags, missing params, unknown stack)

## Integration with Monitoring/Orchestration

### JSON Output for Scripting
```bash
# Get status as JSON and filter with jq
./stack-cli.sh --stack=aztec status --json | jq '.rpc_healthy'

# Check preflight and count failures
./stack-cli.sh --stack=monad preflight --json | \
  jq '[.[] | select(.status == "fail")] | length'
```

### Systemd User Units
Create a wrapper service for automated health checks:

```ini
[Unit]
Description=Stack Health Check
After=network.target

[Service]
Type=oneshot
ExecStart=/path/to/stack-ops/stack-cli.sh smoke --json
StandardOutput=journal
StandardError=journal
```

### Cron/Watchdog
Monitor stack health periodically:

```bash
# Monitor every 5 minutes, log to syslog
*/5 * * * * /path/to/stack-ops/stack-cli.sh --stack=aztec status --json 2>&1 | logger -t stack-health
```

## Documentation

- **Command Contract**: `staking/research/infra-kit/COMMAND_CONTRACT.md`
- **Environment Contract**: `staking/research/infra-kit/ENV_CONTRACT.md`
- **Port Registry**: `staking/research/infra-kit/PORT_REGISTRY.md`
- **Stack Audit**: `staking/research/infra-kit/STACK_AUDIT_2026-02-21.md`
- **InfraKit Overview**: `staking/research/infra-kit/README.md`

## Troubleshooting

### "Could not auto-detect stack"
Explicitly specify the stack:
```bash
./stack-cli.sh --stack=aztec status
```

### "Command not found for stack"
Not all stacks support all commands yet. Check `COMMAND_CONTRACT.md` for implementation status.

### "Ethereum (eth2-quickstart) repository not found"
Clone eth2-quickstart as a sibling of the repo root, or set `ETH2_QUICKSTART_PATH`:
```bash
git clone https://github.com/chimera-defi/eth2-quickstart
# Or: export ETH2_QUICKSTART_PATH=/path/to/eth2-quickstart
```

### Permission denied
Some commands require root (e.g., `bootstrap`, `start`, `stop`). Use `sudo`:
```bash
sudo ./stack-cli.sh --stack=monad bootstrap --with-firewall
```

### Port collision detected
Check `staking/research/infra-kit/PORT_REGISTRY.md` and `preflight` output to identify conflicts.

## Contributing

To add support for a new stack (e.g., MegaETH):

1. Ensure the stack repository exists at `staking/megaeth/infra/`
2. Create these scripts:
   - `staking/megaeth/infra/scripts/bootstrap_megaeth.sh` (or `bootstrap.sh`)
   - `staking/megaeth/infra/scripts/preflight_check.sh`
   - `staking/megaeth/infra/scripts/smoke.sh` (or `e2e_smoke_test.sh`)
   - `staking/megaeth/infra/scripts/status.sh` (or `status_megaeth.sh`)
   - `staking/megaeth/infra/scripts/start.sh`
   - `staking/megaeth/infra/scripts/stop.sh`
   - `staking/megaeth/infra/scripts/logs.sh`
3. Update `ENV_CONTRACT.md` and `PORT_REGISTRY.md` with stack-specific mappings
4. Test with `stack-cli.sh --stack=megaeth <command>`

---

See `staking/research/infra-kit/COMMAND_CONTRACT.md` for detailed command semantics and JSON schema.
