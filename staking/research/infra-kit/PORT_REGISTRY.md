# InfraKit Cross-Stack Port Registry (v0)

Purpose: reduce accidental collisions when multiple stacks share one host/VPC.

## Registry

| Port | Protocol | Stack/Usage | Source |
|---|---|---|---|
| 22 | TCP | SSH management | Aztec/Monad firewall scripts |
| 8545 | TCP | Ethereum JSON-RPC (common EL default) | `eth2-quickstart/exports.sh` |
| 8546 | TCP | Ethereum WS-RPC (common EL default) | `eth2-quickstart/exports.sh` |
| 8551 | TCP | Ethereum Engine API (JWT) | `eth2-quickstart/exports.sh` |
| 30303 | TCP/UDP | Ethereum P2P (common) | `eth2-quickstart/exports.sh` |
| 5051 | TCP | Teku REST | `eth2-quickstart/exports.sh` |
| 5052 | TCP | Nimbus/Grandine REST | `eth2-quickstart/exports.sh` |
| 9596 | TCP | Lodestar REST | `eth2-quickstart/exports.sh` |
| 18550 | TCP | MEV-Boost | `eth2-quickstart/exports.sh` |
| 18551 | TCP | Commit-Boost | `eth2-quickstart/exports.sh` |
| 18552 | TCP | ETHGas | `eth2-quickstart/exports.sh` |
| 18553 | TCP | ETHGas metrics | `eth2-quickstart/exports.sh` |
| 8080 | TCP | Aztec node RPC / Monad default RPC examples | Aztec infra + Monad docs |
| 8880 | TCP | Aztec admin API | `setup_aztec_node.sh` |
| 40400 | TCP/UDP | Aztec P2P | `setup_aztec_node.sh` |
| 8787 | TCP | Monad status endpoint | `status.env.example` / `e2e_smoke_test.sh` |
| 8792 | TCP | Monad mock RPC (test only) | `e2e_smoke_test.sh` |
| 3000 | TCP | Grafana | Monad monitoring compose |
| 9090 | TCP | Prometheus | Monad monitoring compose |
| 9093 | TCP | Alertmanager | Monad monitoring compose |
| 3100 | TCP | Loki | Monad monitoring compose |
| 9100 | TCP | Node exporter | Monad monitoring compose |

## Guardrails

1. Reserve `8080` per host for one primary RPC producer; avoid dual-binding Aztec/Monad locally.
2. Treat `8880` as local/admin-only unless explicitly protected.
3. Monitoring ports (`3000/9090/9093/3100/9100`) should default to private network exposure.
4. For multi-stack deployments, publish a host-level `PORT_ALLOCATIONS.md` derived from this registry.

## Follow-up
- Add a script-level preflight check that fails fast on occupied required ports.
