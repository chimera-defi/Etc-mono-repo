# InfraKit Decision Log

## 2026-02-07 -- Repo-based control plane (MVP)
**Decision:** Keep the control plane as scripts + runbooks in phase 1.
**Rationale:** Aligns with eth2-quickstart/Monad workflows and minimizes overhead.

## 2026-02-07 -- Shared primitives + thin adapters
**Decision:** Centralize common ops steps; keep chain-specific logic in adapters.
**Rationale:** Reduces duplication while preserving chain-specific flexibility.

## 2026-02-07 -- Aztec scope limited to dev/test tooling
**Decision:** Do not define production validator roles until scripts exist.
**Rationale:** Avoid unverified assumptions; keep spec grounded in code.
**Status:** Superseded by "2026-02-09 -- Aztec infra scripts" below. Aztec now has node/sequencer/prover infra scripts targeting devnet.

## 2026-02-09 -- Aztec scripts shared library
**Decision:** Create `scripts/lib/common.sh` for Aztec dev tooling with shared colors, env detection, binary finders, test tracking.
**Rationale:** Aztec scripts duplicated ~150 lines of identical code (colors, env detection, pass/fail helpers). A shared library eliminates drift and simplifies maintenance.

## 2026-02-09 -- Portable commands (grep not rg)
**Decision:** All infra scripts must use standard coreutils (grep, sed, awk) rather than non-standard tools like ripgrep.
**Rationale:** Target validator hosts may not have rg installed. grep is universally available on Linux.

## 2026-02-09 -- snake_case for shared primitive filenames
**Decision:** Use snake_case for all shared primitive scripts (matching Monad convention).
**Rationale:** Monad scripts (production-grade) already use snake_case. eth2-quickstart functions use snake_case. Aztec scripts use kebab-case but these are dev-only tooling.

## 2026-02-09 -- Aztec infra scripts (node/sequencer/prover)
**Decision:** Build Aztec node provisioning scripts mirroring Monad pattern (`setup_aztec_node.sh` + `bootstrap_aztec.sh`), initially targeting devnet.
**Rationale:** Aztec had no server provisioning scripts despite the IMPLEMENTATION-PLAN.md calling for 3 validators. The roles (node, sequencer, prover) are verified in the Aztec CLI source. Sequencer staking requires TGE + 200k AZTEC, but the infra can be built and tested on devnet now.

## 2026-02-11 -- Security primitives belong at the shared level
**Decision:** All security operations (SSH hardening, firewall, fail2ban, secrets file management, installer verification) are shared primitives in `shared/hardening/` and `shared/lib/common.sh`. Chain adapters call them with chain-specific arguments (ports, users, jail names).
**Rationale:** Security patterns are identical across chains. Duplicating them in each adapter leads to drift and increases the surface for mistakes. Specific patterns enforced:
- `secure_env_file()` for any env file containing secrets (pre-create with `install -m 0600`, prevents TOCTOU exposure)
- `safe_download_and_run()` for binary installers (download to temp, verify, execute -- never `curl | bash`)
- `require_root()` at script entry for scripts that use `sudo`
- `verify_ssh_key_auth()` before disabling password auth (prevents operator lockout)
- All logging to stderr (`>&2`) so stdout stays clean for data

## 2026-02-11 -- Portable grep only (no PCRE)
**Decision:** No `grep -oP` (Perl-compatible regex). Use `sed -n 's/.../\1/p'` or `awk` for extraction.
**Rationale:** `grep -P` requires GNU grep built with PCRE support. Fails silently on macOS and minimal Linux images (Alpine, BusyBox). `sed` is universally available.
