# InfraKit Meta Learnings

## Process
- Ground every architectural claim in a verified script or label it as future/optional.
- Keep diagrams ASCII-only for GitHub compatibility.
- Separate shared ops primitives from chain adapters to avoid scope creep.
- Only report completed passes; don't claim ongoing iteration.
- Always clone and read external repos (e.g., eth2-quickstart) rather than relying on summaries. The actual repo revealed 7 EL clients, 6 CL clients, and Commit-Boost/ETHGas support that weren't in the original summary.
- Run shellcheck on all scripts and fix warnings before declaring completion.
- Check for non-standard tool usage (e.g., rg) across ALL scripts, not just the ones obviously using it.

## Content
- Shared monitoring = status endpoint + RPC checks + systemd supervision + journal logs.
- Chain protocols do not share clients; only ops tooling is reused.
- Aztec scripts here are dev/test only until validator role scripts exist.
- eth2-quickstart `lib/common_functions.sh` (~1000 lines) is a strong reference for InfraKit shared primitives. Key patterns: logging, create_systemd_service(), download/extract, firewall rules, SSH config, AIDE setup, hardware profile detection.
- Shared libraries reduce drift. Aztec scripts had identical 20-line blocks duplicated 4 times. Extracting to lib/common.sh eliminated this.
- Parameterize via env vars with `${VAR:-default}` pattern. This is already the Monad convention and should be standard for all InfraKit scripts.
