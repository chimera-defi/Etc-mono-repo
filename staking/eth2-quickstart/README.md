# Ethereum Node Quick Setup

[![CI Build and Test](https://github.com/chimera-defi/eth2-quickstart/actions/workflows/ci.yml/badge.svg)](https://github.com/chimera-defi/eth2-quickstart/actions/workflows/ci.yml)
[![Shell Script Linting](https://github.com/chimera-defi/eth2-quickstart/actions/workflows/shellcheck.yml/badge.svg)](https://github.com/chimera-defi/eth2-quickstart/actions/workflows/shellcheck.yml)
[![Security Validation](https://github.com/chimera-defi/eth2-quickstart/actions/workflows/security.yml/badge.svg)](https://github.com/chimera-defi/eth2-quickstart/actions/workflows/security.yml)

Get an ETH2 compatible RPC node setup in seconds!   
Save at least 2 days compared to CoinCashew and Somersats guides using the automated scripts and included Prysm checkpoint state here!!   
With your own uncensored & unmetered RPC node!   
And get ready for the ETH2 merge!

Setup an Ethereum node quickly with simple shell scripts containing community best practices. 
Supports multiple client combinations for servers, home solo stakers, and pool node operators.
Choose from various execution and consensus clients for optimal client diversity.

**⚠️ Security Notice:** Don't blindly run scripts near sensitive data. Review scripts before execution.

## Mission

We try to setup guidelines to quickly, safely and securely setup ETH2 capable nodes on a cloud VPS or bare metal server.   

The goal is to allow sovereign individuals to set up independent validators, and validating services easily.    
On their own hardware, in their own location, safe from government overreach and censorship.    

Additionally, by using a VPS, they can more easily offer a censorship resistant RPC node for their fellow etherians.   
(Do you really want to open up an RPC node on your home wifi for the world to use?)

## Prerequisites

1. **Server Setup**: Cloud VPS with SSH key or local server
   - **Recommended specs**: 2-4+ TB SSD/NVMe, 16-64+ GB RAM, 4-8+ cores, Ubuntu 20+
   - **Bare metal VPS preferred** (cloud instances may not finish syncing)
   - **SSH setup**: Configure SSH keys and server access
   - **Referral link**: $20 free in cloud credits https://hetzner.cloud/?ref=d4Hoyi2u3pwn

2. **System Configuration**:
   - Set swraid 1 & swraidlevel 0 for full disk access
   - Note: SSH fingerprint changes after setup - remove from known_hosts

## Quickstart

### Installation

1. **Download and prepare**:
   ```bash
   git clone https://github.com/chimera-defi/eth2-quickstart
   cd eth2-quickstart
   chmod +x run_1.sh
   ```

2. **Run server setup** (as root):
   ```bash
   # Add your SSH key first (required - prevents lockout):
   ssh-copy-id root@<your-server-ip>
   ./run_1.sh
   ```
   **Read through scripts first** to make sure you understand what is happening and it's correct. It can bork your server.
   
   - Upgrades Ubuntu and programs
   - Sets up firewalls and security hardening
   - Creates non-root user (SSH key-only, migrates root's keys)
   - Installs required programs

3. **Reboot and configure**:
   ```bash
   sudo reboot
   # Login as new user (default: eth@ip)
   ```

4. **Configure and install clients**:
   - Edit `exports.sh` with your settings
   - Run `./select_clients.sh` for recommendations
   - Run `./run_2.sh` or install clients manually

5. **Start services**:
   ```bash
   sudo systemctl start eth1 cl validator mev
   sudo systemctl status eth1 cl validator mev
   ```

## Sync and Configure

**Note: You may be able to skip this step now with checkpoint URLs added**

1. **Sync Prysm instantly** using provided checkpoint files:
   ```bash
   sudo systemctl stop cl
   sudo systemctl stop validator
   $(echo $HOME)/prysm/prysm.sh cl --checkpoint-block=$PWD/prysm/block_mainnet_altair_4620512-0xef9957e6a709223202ab00f4ee2435e1d42042ad35e160563015340df677feb0.ssz --checkpoint-state=$PWD/prysm/state_mainnet_altair_4620512-0xc1397f57149c99b3a2166d422a2ee50602e2a2c7da2e31d7ea740216b8fd99ab.ssz --genesis-state=$PWD/prysm/genesis.ssz --config-file=$PWD/prysm/prysm_beacon_conf.yaml --p2p-host-ip=$(curl -s v4.ident.me)
   ```
   
   **Restart services after sync:**
   ```bash
   sudo systemctl restart cl
   sudo systemctl restart validator
   ```

2. **Set up validator** using Prysm documentation:
   - Create a `pass.txt` file in `~/prysm` with your wallet password
   - Follow: https://docs.prylabs.network/docs/install/install-with-script#step-5-run-a-validator-using-prysm

3. **Geth sync timing**: Benchmark is 1-3 days running in the background

4. **MEV Setup**: Configure MEV solution for validator rewards (see [MEV Solutions](#mev-solutions) below)

## MEV Solutions

This project supports three MEV (Maximal Extractable Value) solutions. **Choose ONE base solution** (MEV-Boost OR Commit-Boost):

| Solution | Type | Best For | Install Script |
|----------|------|----------|----------------|
| **MEV-Boost** | Standard | Most users (stable, proven) | `install_mev_boost.sh` |
| **Commit-Boost** | Advanced | Preconfirmations, modular features | `install_commit_boost.sh` |
| **ETHGas** | Add-on | Preconfirmation revenue (requires Commit-Boost) | `install_ethgas.sh` |

⚠️ **IMPORTANT**: MEV-Boost and Commit-Boost are **mutually exclusive** - choose ONE, not both!

### Quick MEV Setup

**Option A - Standard (RECOMMENDED):**
```bash
cd install/mev
./install_mev_boost.sh
sudo systemctl start mev
```

**Option B - Advanced (with preconfirmations):**
```bash
cd install/mev
./install_commit_boost.sh
./install_ethgas.sh  # Optional
sudo systemctl start commit-boost-pbs commit-boost-signer
sudo systemctl start ethgas  # If installed
```

### MEV Port Reference
| Service | Port |
|---------|------|
| MEV-Boost | 18550 |
| Commit-Boost PBS | 18551 |
| Commit-Boost Signer | 18552 |
| ETHGas | 18552 |

For detailed MEV setup, see [docs/MEV_GUIDE.md](docs/MEV_GUIDE.md).

## Available Ethereum Clients

### Execution Clients (ETH1)
| Client | Language | Description | Best For | Install Script |
|--------|----------|-------------|----------|----------------|
| **Geth** | Go | Original Go implementation, most stable | Beginners, stability | `geth.sh` |
| **Erigon** | Go | Re-architected for efficiency | Performance, fast sync | `erigon.sh` |
| **Reth** | Rust | Modern Rust implementation | Performance, modularity | `reth.sh` |
| **Nethermind** | C# | Enterprise-focused .NET client | Enterprise, advanced features | `nethermind.sh` |
| **Besu** | Java | Apache 2.0 licensed, enterprise-ready | Private networks, compliance | `besu.sh` |
| **Nimbus-eth1** | Nim | Lightweight, resource efficient | Raspberry Pi, low resources | `nimbus_eth1.sh` |

### Consensus Clients (ETH2)
| Client | Language | Description | Best For | Install Script |
|--------|----------|-------------|----------|----------------|
| **Prysm** | Go | Well-documented, reliable | Beginners, documentation | `prysm.sh` |
| **Lighthouse** | Rust | Security-focused, high performance | Performance, security | `lighthouse.sh` |
| **Teku** | Java | ConsenSys-developed, enterprise features | Institutional, monitoring | `teku.sh` |
| **Nimbus** | Nim | Lightweight, resource efficient | Raspberry Pi, low resources | `nimbus.sh` |
| **Lodestar** | TypeScript | Developer-friendly, modern | Development, TypeScript devs | `lodestar.sh` |
| **Grandine** | Rust | High-performance, cutting-edge | Advanced users, performance | `grandine.sh` |

## Configuration Architecture

### Configuration Conventions
1. **Centralized Variables**: All client-specific settings are defined in `exports.sh`
2. **Template + Custom Pattern**: Each client has base template configs and custom variable overlays
3. **Directory Structure**: Each client has its own config directory (e.g., `teku/`, `nimbus/`)
4. **Merge Strategy**: Install scripts combine base templates with user-specific variables

### Configuration Flow
```
exports.sh → Base Template + Custom Variables → Final Client Config
```

### Example Structure
```
├── exports.sh                    # All configuration variables
├── configs/
│   └── teku/
│       ├── teku_beacon_base.yaml     # Base beacon config template
│       └── teku_validator_base.yaml  # Base validator config template
└── install/consensus/teku.sh     # Merges base + custom configs
```

### Key Variables in exports.sh
- **User settings**: Email, domain, fee recipient, graffiti
- **Network settings**: Peers, ports, relay URLs
- **Client settings**: Cache sizes, sync modes, features
- **Client-specific**: `NETHERMIND_CACHE`, `BESU_CACHE`, `TEKU_CACHE`, etc.

## Client Selection Guide

### For Beginners
- **Execution**: Geth (stable, well-documented)
- **Consensus**: Prysm (user-friendly, good documentation)

### For Performance
- **Execution**: Reth or Erigon (fast sync, low resource usage)
- **Consensus**: Lighthouse (fast, efficient)

### For Enterprise
- **Execution**: Besu, Nethermind, or Nimbus-eth1 (enterprise features or lightweight)
- **Consensus**: Teku (monitoring, enterprise support)

### For Resource-Constrained
- **Execution**: Erigon (low memory usage)
- **Consensus**: Nimbus (lightweight)

## System Requirements

### System Requirements by Client

| Resource | Minimum | Recommended | Notes |
|----------|---------|-------------|-------|
| **CPU** | 4 cores | 8+ cores | More cores help with sync |
| **RAM** | 16GB | 32GB+ | Nimbus can run on 8GB |
| **Storage** | 2TB SSD | 4TB NVMe | Fast storage crucial |
| **Network** | Stable broadband | Unlimited data | Avoid metered connections |

### Client-Specific Requirements
- **Geth**: 16 GB RAM, 2 TB SSD
- **Erigon**: 8 GB RAM, 1 TB SSD  
- **Reth**: 16 GB RAM, 2 TB SSD
- **Nimbus-eth1**: 4 GB RAM, 500 GB SSD (lightweight)
- **Prysm**: 8 GB RAM, 1 TB SSD
- **Lighthouse**: 4 GB RAM, 1 TB SSD

## Nginx RPC Setup

Setup a secure uncensored outward facing Ethereum RPC for you and your friends! It's been faster than Infura/Alchemy etc for me.

### Basic Setup
```bash
./install_nginx.sh
./install_ssl.sh
```

### Verify RPC Endpoint
```bash
# Test locally
curl -X POST http://$(curl -s v4.ident.me)/rpc --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":32}' -H 'Content-Type: application/json'

# Test with domain (replace with your domain)
curl -X POST https://yourdomain.com/rpc --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":32}' -H 'Content-Type: application/json'
```

### Domain Setup (Optional)
1. **Get a domain**: e.g., via Namecheap
2. **Setup DNS**: Point A record to your server's public IP
3. **Configure Nginx**: Handle requests and provide RPC

### SSL Options
- **ACME.sh**: `./install_acme_ssl.sh` (recommended)
- **Certbot**: `./install_ssl_certbot.sh`

## Caddy Web Server (Alternative to Nginx)

Caddy is a modern web server with automatic HTTPS, built-in security features, and easier configuration than Nginx.

### Basic Setup
```bash
# Install Caddy with automatic HTTPS
cd install/web
sudo ./install_caddy.sh

# Or install with manual SSL certificates
sudo ./install_caddy_ssl.sh
```

### Caddy Features
- **Automatic HTTPS**: Built-in Let's Encrypt integration
- **HTTP/2 and HTTP/3**: Modern protocol support
- **Security Headers**: Comprehensive security by default
- **Rate Limiting**: Built-in rate limiting capabilities
- **Easy Configuration**: Simple Caddyfile syntax
- **Security Hardening**: `./caddy_harden.sh` for enhanced security

### Test Caddy Installation
Testing helpers were removed. Use:
```bash
sudo caddy validate --config /etc/caddy/Caddyfile
```

### Caddy vs Nginx
| Feature | Caddy | Nginx |
|---------|-------|-------|
| Configuration | Simple Caddyfile | Complex nginx.conf |
| HTTPS | Automatic | Manual setup |
| Security | Built-in headers | Manual configuration |
| Rate Limiting | Built-in | Requires modules |
| HTTP/3 | Native support | Requires modules |

For detailed Caddy setup instructions, see [Caddy Installation Guide](docs/CADDY_INSTALLATION.md).

### Features
- **RPC/WS endpoints**: Secure access to Ethereum node
- **SSL/TLS**: Automatic certificate management
- **Rate limiting**: Protection against abuse
- **Authentication**: JWT-based access control

## Security Features

### Network Security
- **Firewall**: UFW with comprehensive rules
- **Fail2ban**: Protection against brute force attacks
- **Localhost binding**: Services only accessible locally

### File Security
- **Secure permissions**: Configuration files (600), directories (700)
- **Input validation**: Comprehensive validation functions
- **Error handling**: Sanitized error messages

### Monitoring
- **Security monitoring**: Real-time threat detection
- **Process monitoring**: Suspicious activity detection
- **Log management**: Automated log rotation and analysis

## Troubleshooting

### Common Issues
1. **Services not starting**: Check logs with `journalctl -u service_name`
2. **Sync issues**: Verify network connectivity and client status
3. **Permission errors**: Ensure proper file ownership and permissions
4. **Port conflicts**: Check for conflicting services

### Client-Specific Issues

#### Execution Clients
- **Geth**: Most stable, check for port conflicts on 8545, 8546, 30303
- **Erigon**: Requires more RAM during sync, check `config.yaml` settings
- **Reth**: Compilation issues? Ensure Rust toolchain is updated
- **Nethermind**: .NET runtime issues? Check .NET installation
- **Besu**: Java heap size issues? Adjust memory settings in config
- **Nimbus-eth1**: Uses nightly builds, check for latest release updates

#### Consensus Clients
- **Prysm**: Checkpoint sync failing? Update `PRYSM_CPURL` in `exports.sh`
- **Lighthouse**: Rust compilation issues? Update Rust toolchain
- **Teku**: Java out of memory? Increase heap size in service file
- **Nimbus**: Resource constraints? It's designed for low-resource systems
- **Lodestar**: Node.js issues? Ensure Node.js 16+ is installed
- **Grandine**: Very new client, check official docs for latest updates

### Getting Help
1. Check service logs: `journalctl -u service_name -f`
2. Verify configuration: `./docs/verify_security.sh`
3. Review documentation: `docs/` directory
4. Check system requirements

## Network-Specific Setup

### Testnet Usage (Goerli/Holesky)
Before running client install scripts, modify configurations:
- Update checkpoint URLs in `exports.sh`
- Add network flags (e.g., `--goerli`, `--holesky`) to client commands
- Ensure testnet-specific genesis and checkpoint files

### Mainnet Optimization
- Enable checkpoint sync for faster initial sync
- Configure MEV-Boost with multiple relays
- Set appropriate cache sizes based on available RAM
- Use fast NVMe storage for better performance

## Benefits

- **Client Diversity**: Support for multiple client implementations
- **Interactive Selection**: Guided client selection with recommendations
- **Security**: Comprehensive security hardening
- **Flexibility**: Choose optimal client combinations
- **Automation**: Streamlined installation and configuration
- **Monitoring**: Built-in security and performance monitoring
- **MEV-Boost Integration**: Maximize validator rewards
- **Uncensored RPC**: Run your own censorship-resistant endpoint (faster than Infura/Alchemy!)
- **Enterprise Features**: Advanced monitoring and management
- **Infrastructure Friendly**: Firewall rules and settings to prevent alerts from your infra provider

## Credits

This was made possible by the great guides written by Somersat and coincashew.    

Additionally, the beacon checkpoint states have been made available by Sharedstake.org and the servers run for its community.   

**Someresat**: https://someresat.medium.com/guide-to-staking-on-ethereum-ubuntu-prysm-581fb1969460?utm_source=substack&utm_medium=email

**Coincashew**: https://www.coincashew.com/coins/overview-eth/guide-or-how-to-setup-a-validator-on-eth2-mainnet/part-i-installation/installing-execution-client

**Sharedstake.org**: https://Sharedstake.org  
**Sharedtools.org**: https://sharedtools.org

## Contact for questions / collaboration

**Chimera_defi@protonmail.com**

**Twitter**: https://twitter.com/chimeradefi

**Issues**: [GitHub Issues](https://github.com/chimera-defi/eth2-quickstart/issues)  
**Discussions**: [GitHub Discussions](https://github.com/chimera-defi/eth2-quickstart/discussions)

## Additional Documentation

### Core Documentation
- Scripts reference: [docs/SCRIPTS.md](docs/SCRIPTS.md)
- Setup workflow: [docs/WORKFLOW.md](docs/WORKFLOW.md)
- Terminology: [docs/GLOSSARY.md](docs/GLOSSARY.md)
- Security guide: [docs/SECURITY_GUIDE.md](docs/SECURITY_GUIDE.md)

### MEV Documentation
- **MEV Guide**: [docs/MEV_GUIDE.md](docs/MEV_GUIDE.md) - Complete MEV setup and configuration
- **MEV Quick Reference**: [docs/MEV_QUICK_REFERENCE.md](docs/MEV_QUICK_REFERENCE.md) - Quick commands and ports

### Configuration & Development
- Configuration guide: [docs/CONFIGURATION_GUIDE.md](docs/CONFIGURATION_GUIDE.md)
- Shell scripting best practices: [docs/SHELL_SCRIPTING_BEST_PRACTICES_AND_LINTING_GUIDE.md](docs/SHELL_SCRIPTING_BEST_PRACTICES_AND_LINTING_GUIDE.md)

### Testing & Validation
- Shell script test results: [docs/SHELL_SCRIPT_TEST_RESULTS.md](docs/SHELL_SCRIPT_TEST_RESULTS.md)

### Project Management
- Commit message conventions: [docs/COMMIT_MESSAGES.md](docs/COMMIT_MESSAGES.md)
- Development progress: [docs/progress.md](docs/progress.md)
## 📚 **Common Functions Library**

The project includes a comprehensive common functions library (`lib/common_functions.sh`) with 35 centralized functions for:
- **Logging**: Consistent message formatting across all scripts
- **Installation**: Standardized installation start/complete messages
- **Configuration**: JSON, YAML, and TOML configuration merging
- **Security**: User setup, SSH configuration, fail2ban setup
- **System Services**: Systemd service creation and management
- **File Operations**: Secure file downloading with retry logic
- **System Checks**: Requirements and compatibility validation

**📖 Full Reference:** See `docs/COMMON_FUNCTIONS_REFERENCE.md` for complete function documentation and usage examples.

**✅ Status:** All functions implemented, tested, and ready for production use.
