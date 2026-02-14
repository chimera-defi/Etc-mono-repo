### Glossary

- Execution client (EL): Software that implements the Ethereum execution layer (transactions, EVM). Examples: Geth, Erigon, Reth.
- Consensus client (CL): Software that implements the Ethereum consensus layer (beacon chain). Examples: Prysm, Lighthouse.
- Validator: Client that holds validator keys and proposes/attests blocks on the consensus layer.
- Engine API: Authenticated JSON-RPC API between EL and CL post-Merge, secured by a shared JWT secret.
- JWT secret (`jwt.hex`): 32-byte token file used by EL and CL to authenticate Engine API calls.
- Checkpoint sync: Starting a CL from a recent finalized state to accelerate syncing.
- MEV-Boost: Middleware connecting validators to block builders/relays for proposer-boosted blocks.
- Relay: Service that aggregates blocks from builders and serves them to MEV-Boost.
- Fee recipient: 0x address receiving execution priority fees and MEV tips.
- Graffiti: Arbitrary text attached to blocks proposed by a validator.
- Systemd unit: Service definition file (e.g., `eth1.service`, `cl.service`, `validator.service`, `mev.service`).
- UFW: Uncomplicated Firewall (iptables frontend) for host firewall rules.
- Fail2ban: Service banning hosts exhibiting abusive behavior based on log patterns.
- Nginx: Web server/reverse proxy used here to expose JSON-RPC and WebSocket endpoints.
- JSON-RPC: HTTP interface for Ethereum node methods (`eth_`, `net_`, `web3_`, `engine_`).
- WebSocket (WS): Persistent socket for pub/sub and subscriptions (e.g., `eth_subscribe`).
- Snap sync: Geth fast sync mode that downloads snapshots for quick state recovery.
- P2P ports: Network ports used by Ethereum p2p protocols (EL and CL peers).

