# Monad Validator MVP Scripts

Small, safe helpers to validate RPC, uptime endpoints, and local devnet runs. These are intentionally minimal; no irreversible actions.

## Scripts

- `scripts/check_rpc.sh <rpc-url> [method]`
  - Calls JSON-RPC (default `eth_blockNumber`).
- `scripts/uptime_probe.sh <status-url>`
  - Checks a `/status` endpoint or uptime URL.
- `scripts/status_server.py`
  - Minimal `/status` JSON endpoint for local use.
- `scripts/collect_node_info.sh`
  - Prints a small JSON snapshot of CPU, memory, and disk.
- `scripts/run_local_devnet.sh [monad-bft-path]`
  - Runs the monad-bft local devnet docker flow.
- `scripts/install_sysctl.sh [path]`
  - Writes the monad sysctl tuning file and applies it.
- `scripts/install_systemd_unit.sh [src] [dest]`
  - Installs the validator systemd unit skeleton.

## Example

```bash
./scripts/check_rpc.sh http://localhost:8080 eth_chainId
./scripts/uptime_probe.sh https://status.example.com/status
./scripts/status_server.py
./scripts/collect_node_info.sh
./scripts/run_local_devnet.sh ~/monad-bft
sudo ./scripts/install_sysctl.sh
sudo ./scripts/install_systemd_unit.sh
```

## Notes

- `rg` is required by the scripts (`ripgrep`).
- Local devnet uses `monad-bft` Docker flow and expects x86 hardware per repo docs.
