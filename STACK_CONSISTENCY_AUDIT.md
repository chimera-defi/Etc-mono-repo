# STACK CONSISTENCY AUDIT

Date: 2026-02-21 (Europe/Berlin)
Scope audited under `/root/.openclaw/workspace/dev`:
- `Etc-mono-repo` (focus: `staking/research/infra-kit`, `staking/aztec`, `staking/monad`)
- `eth2-quickstart`
- InfraKit references to Ethereum/Aztec/Monad adapters
- Aztec setup (dev scripts + infra scripts)
- Mega ETH setup (discovery attempt + gap)

---

## 1) Inventory + run/test commands

### A. eth2-quickstart (`/root/.openclaw/workspace/dev/eth2-quickstart`)
**Primary run flow**
- `./run_1.sh` (root bootstrap/security baseline)
- `./run_2.sh` (non-root client install/config)

**Validation/test commands found**
- `cd test && ./run_tests.sh --lint-only`
- `cd test && docker-compose up --build test`
- `./test/run_e2e.sh --phase=1`
- `./test/run_e2e.sh --phase=2`

**Config/doc anchors**
- `exports.sh` (primary env/ports)
- `config/user_config.env` (override layer)
- `docs/SCRIPTS.md`, `docs/CONFIGURATION_GUIDE.md`

### B. InfraKit references (`/root/.openclaw/workspace/dev/Etc-mono-repo/staking/research/infra-kit`)
**Canonical reference docs**
- `SPEC.md`
- `DESIGN.md`
- `PLAN.md`
- `AZTEC_NODE_SPEC.md`
- `CONTEXT.md`

**Observed intent**
- Shared primitives and adapter model are documented.
- Ethereum, Monad, Aztec patterns are mapped, but a strict shared env contract + cross-stack port registry are not codified as standalone docs.

### C. Aztec setup (`/root/.openclaw/workspace/dev/Etc-mono-repo/staking/aztec`)
**Dev/testing scripts** (`staking/aztec/scripts`)
- `./scripts/setup-env.sh`
- `./scripts/smoke-test.sh --minimal`
- `./scripts/integration-test.sh`
- `./scripts/compile-contracts.sh`
- `./scripts/local-sandbox-e2e.sh`

**Infra scripts** (`staking/aztec/infra/scripts`)
- `sudo ./infra/scripts/setup_aztec_node.sh [--with-sequencer] [--with-prover] ...`
- `sudo ./infra/scripts/bootstrap_aztec.sh [flags]`
- `./infra/scripts/check_aztec_node.sh [url]`

### D. Monad setup (`/root/.openclaw/workspace/dev/Etc-mono-repo/staking/monad/infra`)
**Bootstrap commands**
- `sudo ./scripts/setup_server.sh`
- `sudo ./scripts/bootstrap_all.sh`

**Validation commands**
- `./scripts/preflight_check.sh`
- `./scripts/e2e_smoke_test.sh`
- `./scripts/check_rpc.sh <rpc-url>`

**Monitoring/compose**
- `monitoring/docker-compose.yml`
- `monitoring/README.md`

### E. Mega ETH setup (scope request)
- Searched for `mega-eth`, `mega eth`, `MegaETH`, `MEGA_ETH` across `Etc-mono-repo` and `eth2-quickstart`.
- **No local setup repo/path/scripts found** in the audited scope.
- Only references found in `Etc-mono-repo/agent-brains/META_LEARNINGS_INDEX.md` (meta docs, not runnable setup).

---

## 2) Consistency matrix (env vars / ports / scripts / compose / systemd / docs)

| Dimension | eth2-quickstart | Aztec setup | Monad setup | Consistency verdict |
|---|---|---|---|---|
| **Env vars** | Centralized in `exports.sh` + `config/user_config.env` | Split between dev env (`AZTEC_DEVNET_URL`, `NODE_URL`) and infra env (`AZTEC_*`, `ETHEREUM_HOSTS`) | `MONAD_*`, `RPC_URL`, `STATUS_PORT`, `SSH_PORT`, etc. | **Partial**: good per-stack conventions, no enforced cross-stack base schema |
| **Ports** | Many client-specific ports (8545/8546/8551, REST ports, MEV ports) | Infra defaults 8080/8880/40400; dev scripts also use 8080 | Status 8787, mock RPC 8792, monitoring 3000/9090/9093/3100/9100, examples on 8080/26657 | **Partial**: no single source-of-truth port registry; collision risk in shared hosts |
| **Scripts/entrypoints** | Two-phase top-level (`run_1.sh`, `run_2.sh`) + many installers | Clear split: dev scripts vs infra scripts | Clear infra script set with preflight/smoke | **Good directional alignment** but naming contracts differ |
| **Compose** | Primarily test compose (`test/docker-compose.yml`) | No main infra compose; relies on scripts and optional monitoring path in bootstrap | Dedicated monitoring compose in repo | **Inconsistent**: compose role differs by stack (tests vs monitoring) |
| **systemd** | Heavily abstracted via helpers (`create_systemd_service`) | Explicit unit generation in infra setup script | Explicit unit install scripts + status service | **Mostly consistent** in outcome, implementation style diverges |
| **Docs/runbooks** | Mature but broad/legacy terminology remains (`eth1/cl/validator`) | Dev docs + infra docs both present | Practical infra docs/checklists | **Partial**: no cross-stack “single operator playbook” |

**High-signal consistency findings**
1. Shared operational pattern exists: shell-first automation, systemd-managed services, optional compose for supporting components.
2. Biggest drift is not tooling type, but **contract shape** (naming/env/ports/docs structure).
3. InfraKit already documents architecture, but still needs operational contract docs that adapters can directly implement.
4. Mega ETH cannot be scored for consistency due to missing setup target in local scope.

---

## 3) Prioritized refactor plan

### P0 (do now; docs/spec-only, minimal risk)
1. Define a **cross-stack base env contract** (required keys + per-stack mapping):
   - `STACK_NAME`, `STACK_USER`, `STACK_DATA_DIR`, `STACK_RPC_URL`, `STACK_P2P_PORT`, `STACK_METRICS_PORT`, `STACK_SERVICE_NAME`.
2. Define a **cross-stack port registry** for default + reserved ports and collision guidance.
3. Define a **standard command contract** per stack in docs:
   - `setup`, `bootstrap`, `preflight`, `smoke`, `status`.

### P1 (low-medium risk; script-alias and wrapper changes)
4. Add compatibility wrappers/aliases so all stacks expose the same logical command names.
5. Standardize env-file loading order (`/etc/<stack>/*.env` + local override conventions).
6. Normalize healthcheck exit-code semantics across aztec/monad/eth2 scripts.

### P2 (medium risk; code extraction)
7. Extract shared systemd + firewall + hardening primitives into InfraKit shared libs and call from adapters.
8. Introduce shared smoke-test harness template consumed by each stack.

### P3 (blocked-dependent)
9. Onboard Mega ETH adapter once repository/path + setup scripts are provided.
10. Re-run matrix with Mega ETH included and enforce parity gates in CI.

---

## 4) Immediate low-risk fixes (applied)

1. **Created infra-kit shared env contract doc**:
   - `Etc-mono-repo/staking/research/infra-kit/ENV_CONTRACT.md`
   - Documents base contract + mapping for Ethereum (eth2-quickstart), Aztec, Monad.

2. **Created infra-kit cross-stack port registry doc**:
   - `Etc-mono-repo/staking/research/infra-kit/PORT_REGISTRY.md`
   - Captures commonly used ports, ownership, and collision notes.

3. **Linked both docs from infra-kit README** for discoverability:
   - Updated `Etc-mono-repo/staking/research/infra-kit/README.md`.

4. **Produced this consolidated audit report** at:
   - `/root/.openclaw/workspace/dev/STACK_CONSISTENCY_AUDIT.md`

---

## 5) Blockers / unknowns

1. **Mega ETH setup missing in local scope**
   - No runnable setup repository/path found to audit commands, env, ports, or systemd/compose behavior.

2. **No enforced contract test yet**
   - Env/port consistency is documented but not machine-enforced in CI.

3. **Legacy terminology in eth2-quickstart docs/scripts**
   - Terms like `eth1/cl/validator` remain widespread; migration requires compatibility care.

4. **Aztec split model (dev tooling vs infra)**
   - Correct but easy to confuse; docs need strict operator pathing to prevent misuse.

---

## Evidence snapshot (selected files inspected)
- `eth2-quickstart/run_1.sh`, `run_2.sh`, `exports.sh`, `test/run_tests.sh`, `docs/SCRIPTS.md`
- `Etc-mono-repo/staking/research/infra-kit/{README.md,SPEC.md,DESIGN.md,PLAN.md,AZTEC_NODE_SPEC.md}`
- `Etc-mono-repo/staking/aztec/scripts/*`
- `Etc-mono-repo/staking/aztec/infra/scripts/{setup_aztec_node.sh,bootstrap_aztec.sh,check_aztec_node.sh}`
- `Etc-mono-repo/staking/monad/infra/scripts/*`
- `Etc-mono-repo/staking/monad/infra/monitoring/docker-compose.yml`
