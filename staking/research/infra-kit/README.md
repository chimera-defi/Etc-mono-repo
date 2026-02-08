# InfraKit: Shared Infra Control Plane

This folder defines the shared infra control plane for staking and validator
operations across chains (Ethereum, Monad, Aztec, etc.). It starts by reusing
selected eth2-quickstart scripts, but is chain-agnostic and extensible.

Source site: https://eth2quickstart.com/
Source repo (default branch `master`): https://github.com/chimera-defi/eth2-quickstart

Key reference docs:
- Ethereum nodes & clients: https://ethereum.org/developers/docs/nodes-and-clients/
- Monad docs: https://docs.monad.xyz/
- Aztec docs: https://docs.aztec.network/

Note: The source repo currently advertises no license via the GitHub API. Before
any code reuse, confirm licensing or obtain explicit permission.

## Goals

- Create a shared infra layer for server provisioning, hardening, monitoring, and
  validator node setup.
- Reuse core scripts from eth2-quickstart where applicable.
- Provide project-specific adapters for staking/monad and future chains.

## Docs

- PLAN.md: phased migration + integration plan.
- SPEC.md: target architecture + script interfaces + roles-by-chain summary.
- DESIGN.md: concise top-level architecture for human review.
- TASKS.md: execution checklist for next agent.
- PROMPTS.md: handoff prompts for sequential work.

## Diagram (High-Level)

```
              +---------------------+
              |    InfraKit Core    |
              |  (shared modules)   |
              +----------+----------+
                         |
        +----------------+----------------+
        |                                 |
+-------v--------+               +--------v--------+
| Staking/Monad  |               | Staking/Aztec   |
| adapters       |               | adapters        |
+----------------+               +-----------------+
        |                                 |
        +----------------+----------------+
                         |
              +----------v----------+
              |  Future validators  |
              |  (ETH, others)      |
              +---------------------+
```
