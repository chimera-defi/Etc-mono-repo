# Scripts Reference

## Overview

Bash scripts to harden Ubuntu server and install Ethereum node stack: execution client, consensus client, validator, MEV-Boost, and optional Nginx reverse proxy with SSL.

- **OS**: Ubuntu 20.04+
- **Order**: `run_1.sh` → reboot → login as `LOGIN_UNAME` → update `exports.sh` → `run_2.sh`
- **Config**: `exports.sh` (email, domain, fee recipient, graffiti, peers, relay list, ports)

## Environment Configuration (exports.sh)

Key variables:
- `EMAIL`: Contact email for ACME/cert tooling
- `LOGIN_UNAME`: Non-root user to create (default `eth`)
- `YourSSHPortNumber`: SSH port for fail2ban (default `22`)
- `SERVER_NAME`: Domain for Nginx/SSL (e.g. `rpc.example.com`)
- `FEE_RECIPIENT`: 0x address for priority fees
- `GRAFITTI`: String added to blocks
- `MAX_PEERS`: Consensus client peer cap
- `GETH_CACHE`: Geth cache size in MB (default `8192`)
- `MEV_RELAYS`: Comma-separated MEV-Boost relay URLs

## Stage 1: Initial Hardening (run_1.sh)

**Run as root:**
```bash
sudo ./run_1.sh
sudo reboot
ssh LOGIN_UNAME@<server-ip>
```

**Actions:**
- System updates: `apt update/upgrade/full-upgrade/autoremove`
- SSH hardening: replaces `/etc/ssh/sshd_config`
- Fail2ban: configures jails for `nginx-proxy` and `sshd`
- User creation: creates non-root user `LOGIN_UNAME` (SSH key-only, no password)
- Migrates root's `~/.ssh/authorized_keys` to new user (prevents lockout)
- Security: runs consolidated security script
- NTP: installs `chrony` and enables NTP
- Security: mounts `/run/shm` as `tmpfs` with `ro,noexec,nosuid`

**Prerequisite:** Add your SSH key to root before running: `ssh-copy-id root@<server>`

## Stage 2: Client Installation (run_2.sh)

**Run as non-root user:**
```bash
./run_2.sh
```

**Non-interactive (for CI/automation):**
```bash
./run_2.sh --execution=geth --consensus=prysm --mev=mev-boost
./run_2.sh --execution=besu --consensus=lighthouse --mev=none --skip-deps
./run_2.sh --help
```

**Flags:** `--execution=NAME` `--consensus=NAME` `--mev=NAME` `--skip-deps`

**Actions:**
- Installs dependencies (unless `--skip-deps`)
- Runs installers for selected clients
- Echoes next steps for Nginx + SSL

**Start services:**
```bash
sudo systemctl start eth1 cl validator mev
```

## Client Installation Scripts

### Execution Clients

#### geth.sh
- **Language: Go**
- Adds `ppa:ethereum/ethereum` and installs Geth
- Builds `GETH_CMD` with flags:
  - `--syncmode snap`, `--cache $GETH_CACHE`
  - HTTP/WS: `--http`, `--http.corsdomain "*"`, `--http.vhosts=*`, `--http.api "admin, eth, net, web3, engine"`
  - WS: `--ws`, `--ws.origins "*"`, `--ws.api "web3, eth, net, engine"`
  - Auth RPC: `--authrpc.jwtsecret=$HOME/secrets/jwt.hex`
  - Miner: `--miner.etherbase=$FEE_RECIPIENT`, `--miner.extradata=$GRAFITTI`
- Creates systemd unit `eth1.service`

#### erigon.sh
- **Language: Go**
- Downloads and installs Erigon
- Configures with typical flags
- Creates systemd unit `eth1.service`

#### reth.sh
- **Language: Rust**
- Downloads and installs Reth
- Configures with typical flags
- Creates systemd unit `eth1.service`

#### nethermind.sh
- **Language: C# (.NET)**
- Downloads and installs Nethermind
- Configures with typical flags
- Creates systemd unit `eth1.service`

#### besu.sh
- **Language: Java**
- Downloads and installs Besu
- Configures with typical flags
- Creates systemd unit `eth1.service`

#### nimbus_eth1.sh
- **Language: Nim**
- Downloads and installs Nimbus-eth1 (nightly builds)
- Lightweight Nim-based execution client
- Configures with TOML configuration file
- Creates systemd unit `eth1.service`

### Consensus Clients

#### prysm.sh
- **Language: Go**
- Creates `~/prysm`, downloads `prysm.sh`, generates `jwt.hex`
- Generates config files:
  - `prysm_validator_conf.yaml`: sets `graffiti`, `suggested-fee-recipient`, `wallet-password-file`
  - `prysm_beacon_conf.yaml`: sets `graffiti`, `suggested-fee-recipient`, `p2p-host-ip`, `p2p-max-peers`, `checkpoint-sync-url`, `genesis-beacon-api-url`, `jwt-secret`
- **Updated Configuration Features (v6.1.2)**:
  - Performance: `max-goroutines`, `block-batch-limit`, `slots-per-archive-point`
  - Monitoring: Prometheus metrics on port 8080
  - MEV boost: Configured to use external MEV-Boost
  - Reliability: `dynamic-key-reload-debounce-interval`, `enable-doppelganger`
- Creates systemd units `cl.service` and `validator.service`

#### lighthouse.sh
- **Language: Rust**
- Downloads and installs Lighthouse
- Configures with typical flags
- Creates systemd units `cl.service` and `validator.service`

#### teku.sh
- **Language: Java**
- Downloads and installs Teku
- Configures with typical flags
- Creates systemd units `cl.service` and `validator.service`

#### nimbus.sh
- **Language: Nim**
- Downloads and installs Nimbus
- Configures with typical flags
- Creates systemd units `cl.service` and `validator.service`

#### lodestar.sh
- **Language: TypeScript**
- Downloads and installs Lodestar
- Configures with typical flags
- Creates systemd units `cl.service` and `validator.service`

#### grandine.sh
- **Language: Rust**
- Downloads and installs Grandine
- Configures with typical flags
- Creates systemd units `cl.service` and `validator.service`

### MEV Solutions

⚠️ **IMPORTANT**: MEV-Boost and Commit-Boost are mutually exclusive - choose ONE!

#### install_mev_boost.sh (RECOMMENDED)
- Clones and builds MEV-Boost from Flashbots repository
- Configures with relay URLs from `MEV_RELAYS`
- Creates systemd unit `mev.service`
- Port: 18550

#### install_commit_boost.sh
- Downloads pre-built Commit-Boost binaries (PBS + Signer)
- Modular sidecar with MEV-Boost relay compatibility
- Supports preconfirmations and inclusion lists
- Creates systemd units: `commit-boost-pbs.service`, `commit-boost-signer.service`
- Ports: PBS (18551), Signer (18552), Metrics (18553)

#### install_ethgas.sh
- Clones and builds ETHGas preconfirmation module
- **Requires Commit-Boost** to be installed first
- Enables validators to sell preconfirmations
- Creates systemd unit `ethgas.service`
- Ports: Main (18552), Metrics (18553)

#### test_mev_implementations.sh
- Comprehensive test suite for all MEV implementations
- Tests installation, configuration, services, ports, and dependencies
- Verifies mutual exclusivity between MEV-Boost and Commit-Boost

#### fb_builder_geth.sh (Advanced)
- Builds Geth from Flashbots builder repository
- For advanced users running block builders

#### fb_mev_prysm.sh (Advanced)
- Builds Prysm from Flashbots repository with MEV support
- For advanced users with custom MEV setups

## Nginx and SSL Scripts

### install_nginx.sh
- Installs Nginx
- Configures reverse proxy for RPC/WS endpoints
- Sets up rate limiting and security headers

### install_ssl.sh
- Installs SSL certificates using ACME
- Configures HTTPS redirect
- Sets up certificate renewal

## Extra Utilities

### select_clients.sh
- Interactive client selection
- Provides recommendations based on use case
- Updates `exports.sh` with selected clients

### purge_ethereum_data.sh
- Safely removes Ethereum data directories
- Useful for fresh starts or troubleshooting

## Security Utilities

### test_security_fixes.sh
- Tests all implemented security fixes
- Validates network exposure, input validation, file permissions
- Provides security score and recommendations

### docs/verify_security.sh
- Comprehensive security verification
- Checks all security implementations
- Provides detailed security report

### docs/validate_security_safe.sh
- Safe validation without root privileges
- Validates security implementations
- Provides security score

## Systemd Units

### eth1.service
- Execution client service
- Depends on network.target
- Restart on failure

### cl.service
- Consensus client service
- Depends on eth1.service
- Restart on failure

### validator.service
- Validator service
- Depends on cl.service
- Restart on failure

### mev.service
- MEV-Boost service (standard)
- Port 18550
- Restart on failure

### commit-boost-pbs.service
- Commit-Boost PBS module
- MEV-Boost compatible relay interface
- Port 18551
- Restart on failure

### commit-boost-signer.service
- Commit-Boost Signer module
- BLS key signing for commitments
- Port 18552
- Restart on failure

### ethgas.service
- ETHGas preconfirmation service
- Requires Commit-Boost services
- Port 18552 (metrics 18553)
- Restart on failure

## Networking and Ports

### Required Ports
- **30303**: Execution client P2P
- **13000/tcp**: Consensus client P2P
- **12000/udp**: Consensus client P2P
- **22/tcp**: SSH
- **443/tcp**: HTTPS (if using Nginx)

### Protected Ports
- **4000/tcp**: Engine API
- **3500/tcp**: Beacon API
- **8551/tcp**: Engine API
- **8545/tcp**: JSON-RPC

## Data Management

### purge_ethereum_data.sh
- Removes Ethereum data directories
- Preserves configuration files
- Useful for fresh starts

### Data Directories
- **Geth**: `~/.ethereum`
- **Erigon**: `~/.local/share/erigon`
- **Reth**: `~/.local/share/reth`
- **Prysm**: `~/prysm`
- **Lighthouse**: `~/.lighthouse`
- **Teku**: `~/.local/share/teku`
- **Nimbus**: `~/.cache/nimbus`
- **Lodestar**: `~/.local/share/lodestar`
- **Grandine**: `~/.local/share/grandine`

## Troubleshooting

### Common Issues
1. **Services not starting**: Check logs with `journalctl -u service_name`
2. **Permission errors**: Ensure proper file ownership
3. **Port conflicts**: Check for conflicting services
4. **Sync issues**: Verify network connectivity

### Logs
- **System logs**: `journalctl -u service_name -f`
- **Security logs**: `/var/log/security_monitor.log`
- **Fail2ban logs**: `/var/log/fail2ban.log`

### Getting Help
1. Check service logs
2. Run security validation scripts
3. Review configuration files
4. Check system requirements