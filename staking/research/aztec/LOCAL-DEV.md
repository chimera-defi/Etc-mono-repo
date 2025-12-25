# Aztec Local Development (Sandbox) — Setup & Smoke Test

**Purpose:** Get a reproducible local environment for Aztec contract development and basic integration testing before touching public testnet.

**Status:** Draft (needs periodic refresh as Aztec tooling evolves)  
**Last updated:** Dec 25, 2025

---

## Key reality: “forking the chain”

Aztec is not an EVM chain where “fork mainnet locally” is a default workflow. The typical local approach is:
- run an **Aztec sandbox / local devnet** (usually Docker-backed), and
- deploy contracts + run client interactions against that local endpoint.

If Aztec introduces a true “fork public testnet state” mode later, treat it as optional and document it here with an official source link.

---

## Prerequisites

- **Node.js**: >= 20 (this environment has Node 22)
- **Docker daemon running** (not just `docker` CLI)
  - Many Aztec sandbox workflows require Docker images.
  - In environments without systemd/init, you may need to start the daemon manually.

---

## Option A (recommended): official Aztec installer + sandbox

### 1) Install Docker + ensure daemon is running

On a normal dev machine:
- Install Docker Desktop (macOS/Windows) or Docker Engine (Linux).
- Confirm `docker info` works (daemon reachable).

If you are in a minimal Linux environment (no systemd):
- You may need to start `dockerd` manually.
- Example (manual; you must manage its lifecycle): `sudo dockerd &`

### 2) Install Aztec tooling (official)

Aztec’s installer script:

```bash
bash -i <(curl -fsSL https://install.aztec.network)
```

After install, confirm the CLI exists:

```bash
aztec --version
```

### 3) Start local sandbox (time-bounded smoke test)

This is a long-running process. For a quick “does it start” check:

```bash
timeout 15s aztec start --sandbox || true
```

For real local development, run it normally in a dedicated terminal.

---

## Option B: npm packages (useful for libraries; not sufficient alone)

`@aztec/cli` published on npm is **not** a standalone `aztec` binary in this environment (it exports JS modules). Use it only if you are intentionally building a Node-based workflow and have confirmed the current recommended approach in official docs.

---

## Smoke test checklist (local)

**Goal:** compile + deploy a minimal Noir contract into the local sandbox.

Record evidence in:
- `ASSUMPTIONS.md` → “Validation Log” (dated entry: “Local sandbox smoke test”)

Checklist:
- [ ] `aztec --version` works
- [ ] `aztec start --sandbox` starts and exposes an endpoint
- [ ] Create a minimal Noir contract project (per official docs)
- [ ] Compile
- [ ] Deploy to sandbox
- [ ] Call a function and observe expected state change

---

## Troubleshooting

- **Docker installed but daemon unreachable**
  - `docker version` shows client only; `docker info` fails
  - Fix by starting Docker daemon (method depends on OS/init system)
- **CLI exists but sandbox fails**
  - Confirm Docker can pull images
  - Check for port conflicts
  - Re-run with debug flags if supported (document flags here once confirmed)

