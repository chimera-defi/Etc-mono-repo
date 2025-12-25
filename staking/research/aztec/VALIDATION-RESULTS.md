# Aztec Testnet Validation Results (Living Log)

**Purpose:** single place to record measured testnet facts that update `ASSUMPTIONS.md`, `ECONOMICS.md`, and pitch materials.

**Status legend:** ✅ verified • ⚠️ partial • ❌ not yet measured  
**Last updated:** Dec 24, 2025

---

## Log format (copy/paste)

### YYYY-MM-DD — Short title

- **Who ran it**:
- **Environment**: local sandbox / public testnet
- **Configs**: (instance type, regions, versions, flags)
- **Method**: steps + what was measured
- **Results**:
  - **Validator requirements**: CPU/RAM/disk/bandwidth = …
  - **Validator cost**: $/month = …
  - **Tx costs**: deploy = … ; deposit-like = … ; transfer = … ; keeper tx = …
  - **Unbonding**: …
  - **Slashing**: …
- **Artifacts/links**: logs, screenshots, dashboards, spreadsheets
- **Follow-ups**:

---

## Open validation checklist (roll-up)

- **Validator requirements**: ❌
- **Validator monthly cost**: ❌
- **Tx costs (deploy + common calls)**: ❌
- **Unbonding period (exact)**: ❌
- **Slashing (conditions + penalty + delegator impact)**: ❌
- **RPC reliability/latency**: ❌

---

## 2025-12-25 — Tooling discovery in this workspace (Cursor cloud agent)

- **Who ran it**: agent
- **Environment**: Cursor cloud workspace (no systemd/init)
- **Method**:
  - Attempted to install Aztec via `install.aztec.network`
  - Installed Docker Engine packages via apt
  - Tested whether Docker daemon is reachable
  - Installed `@aztec/cli` from npm to inspect what it provides
- **Results**:
  - **Docker**: CLI installed, but **daemon is not running** in this environment (`docker info` fails). Starting services via `service` is not available here.
  - **Aztec installer**: fails early because it requires a working Docker daemon.
  - **npm `@aztec/cli`**: installs as a JS module (no `aztec` binary provided here).
- **Artifacts/links**:
  - See `LOCAL-DEV.md` for recommended local workflow (Docker-backed sandbox).
- **Follow-ups**:
  - Run local sandbox on a machine where Docker daemon can run.
  - Once `aztec` CLI is installed, complete the “hello world” compile/deploy smoke test and record it here.

