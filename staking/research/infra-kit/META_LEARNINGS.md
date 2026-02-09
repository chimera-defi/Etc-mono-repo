# InfraKit Meta Learnings

## Process
- Ground every architectural claim in a verified script or label it as future/optional.
- Keep diagrams ASCII‑only for GitHub compatibility.
- Separate shared ops primitives from chain adapters to avoid scope creep.

## Content
- Shared monitoring = status endpoint + RPC checks + systemd supervision + journal logs.
- Chain protocols do not share clients; only ops tooling is reused.
- Aztec scripts here are dev/test only until validator role scripts exist.
