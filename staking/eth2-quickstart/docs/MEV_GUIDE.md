# MEV Technologies Guide

## Overview

This guide covers MEV (Maximal Extractable Value) technologies for Ethereum validators. Three production-ready solutions are available and **fully implemented**:

- **MEV-Boost**: Industry-standard relay-based solution (RECOMMENDED for most users)
- **Commit-Boost**: Modular sidecar with MEV-Boost compatibility + additional protocols
- **ETHGas**: Preconfirmation protocol module for Commit-Boost

⚠️ **IMPORTANT**: MEV-Boost and Commit-Boost are **mutually exclusive** - choose ONE, not both.

---

## Technology Status

| Technology | Status | Production Ready | Implementation Status |
|------------|--------|-----------------|----------------------|
| **MEV-Boost** | ✅ Active | ✅ Yes | ✅ **Implemented** |
| **Commit-Boost** | ✅ Active | ✅ Yes | ✅ **Implemented** |
| **ETHGas** | ✅ Active | ✅ Yes | ✅ **Implemented** (requires Commit-Boost) |

---

## MEV Boost

### Overview

**MEV Boost** is the industry-standard middleware that connects Ethereum validators to block builders through relays. It's fully implemented and production-ready.

**Repository**: https://github.com/flashbots/mev-boost  
**Documentation**: https://docs.flashbots.net/

### Key Features

- ✅ Relay-based architecture with multiple relay support
- ✅ Builder API v1.5+ integration
- ✅ Validator registration and bid comparison
- ✅ Proven stability and reliability
- ✅ Comprehensive documentation

### Installation

```bash
cd install/mev
./install_mev_boost.sh
```

**Installation Script**: `install/mev/install_mev_boost.sh`  
**Service**: `mev.service`  
**Port**: `18550` (configurable via `MEV_PORT`)

**Configuration** (`exports.sh`):
```bash
MEV_HOST='127.0.0.1'
MEV_PORT=18550
MEV_RELAYS='https://...@boost-relay.flashbots.net,...'
MIN_BID=0.002
MEVGETHEADERT=950
MEVGETPAYLOADT=4000
MEVREGVALT=6000
```

**Client Integration**:
- **Prysm**: `http-mev-relay: http://127.0.0.1:18550`
- **Teku**: `builder-endpoint: "http://127.0.0.1:18550"`
- **Lighthouse**: `--builder http://127.0.0.1:18550`
- **Lodestar**: `builder.urls: ["http://127.0.0.1:18550"]`
- **Nimbus**: `payload-builder-url = "http://127.0.0.1:18550"`
- **Grandine**: `builder_endpoint = "http://127.0.0.1:18550"`

**Verification**:
```bash
sudo systemctl status mev
journalctl -u mev -f
curl http://127.0.0.1:18550/eth/v1/builder/status
```

---

## Commit-Boost

### Overview

**Commit-Boost** is a modular Ethereum validator sidecar that standardizes communication between validators and third-party protocols. It's production-ready, audited by Sigma Prime, and **replaces** MEV-Boost with additional capabilities.

**Repository**: https://github.com/Commit-Boost/commit-boost-client  
**Documentation**: https://commit-boost.github.io/commit-boost-client/  
**Twitter**: https://x.com/Commit_Boost

### Key Features

- ✅ Modular sidecar architecture (built in Rust)
- ✅ MEV-Boost compatible (supports MEV-Boost relays)
- ✅ Supports commitment protocols (preconfirmations, inclusion lists)
- ✅ Plugin system for custom modules
- ✅ Metrics reporting and dashboards
- ✅ Audited by Sigma Prime

### Architecture

Commit-Boost runs as two components:
1. **PBS Module**: MEV-Boost compatible relay communication
2. **Signer Module**: Secure BLS key signing for commitments

### Installation

```bash
cd install/mev
./install_commit_boost.sh
```

**Installation Script**: `install/mev/install_commit_boost.sh`  
**Services**: `commit-boost-pbs.service`, `commit-boost-signer.service`  
**Ports**: 
- PBS: `18551` (configurable via `COMMIT_BOOST_PORT`)
- Signer: `18552`
- Metrics: `18553`

**Configuration** (`exports.sh`):
```bash
COMMIT_BOOST_HOST='127.0.0.1'
COMMIT_BOOST_PORT=18551
```

**Service Management**:
```bash
sudo systemctl start commit-boost-pbs commit-boost-signer
sudo systemctl status commit-boost-pbs commit-boost-signer
journalctl -u commit-boost-pbs -f
journalctl -u commit-boost-signer -f
```

**Verification**:
```bash
# Check service status
sudo systemctl status commit-boost-pbs
sudo systemctl status commit-boost-signer

# Check API endpoint
curl http://127.0.0.1:18551/eth/v1/builder/status

# Check metrics
curl http://127.0.0.1:18553/metrics
```

**Client Integration** (use Commit-Boost port instead of MEV-Boost):
- **Prysm**: `http-mev-relay: http://127.0.0.1:18551`
- **Teku**: `builder-endpoint: "http://127.0.0.1:18551"`
- **Lighthouse**: `--builder http://127.0.0.1:18551`
- **Lodestar**: `builder.urls: ["http://127.0.0.1:18551"]`
- **Nimbus**: `payload-builder-url = "http://127.0.0.1:18551"`
- **Grandine**: `builder_endpoint = "http://127.0.0.1:18551"`

⚠️ **IMPORTANT**: If using Commit-Boost, stop MEV-Boost first:
```bash
sudo systemctl stop mev
sudo systemctl disable mev
```

---

## ETHGas

### Overview

**ETHGas** is a preconfirmation protocol that enables real-time Ethereum transactions. It integrates with Commit-Boost as a module, allowing validators to sell preconfirmations (precons) - commitments to include transactions in future blocks.

**Repository**: https://github.com/ethgas-developer/ethgas-preconf-commit-boost-module  
**Documentation**: https://docs.ethgas.com/  
**API Documentation**: https://developers.ethgas.com/  
**Twitter**: https://x.com/ETHGASofficial

### Key Features

- ✅ Preconfirmation (precon) protocol for real-time transactions
- ✅ ETHGas Exchange for buying/selling precons
- ✅ Support for standard, SSV, and Obol validators
- ✅ Collateral-based security model
- ✅ Audited by Sigma Prime

### Prerequisites

⚠️ **ETHGas requires Commit-Boost** - install Commit-Boost first:
```bash
cd install/mev
./install_commit_boost.sh
```

### Installation

```bash
cd install/mev
./install_ethgas.sh
```

**Installation Script**: `install/mev/install_ethgas.sh`  
**Service**: `ethgas.service`  
**Ports**:
- Main: `18552` (configurable via `ETHGAS_PORT`)
- Metrics: `18553` (configurable via `ETHGAS_METRICS_PORT`)

**Configuration** (`exports.sh`):
```bash
ETHGAS_HOST='127.0.0.1'
ETHGAS_PORT=18552
ETHGAS_METRICS_PORT=18553
ETHGAS_NETWORK='mainnet'                    # or 'holesky'
ETHGAS_API_ENDPOINT='https://api.ethgas.com'
ETHGAS_REGISTRATION_MODE='standard'         # or 'ssv', 'obol', 'skip'
ETHGAS_MIN_PRECONF_VALUE='1000000000000000' # 0.001 ETH in wei
```

**Collateral Contracts**:
- Mainnet: `0x3314Fb492a5d205A601f2A0521fAFbD039502Fc3`
- Holesky: `0x104Ef4192a97E0A93aBe8893c8A2d2484DFCBAF1`

**Service Management**:
```bash
sudo systemctl start ethgas
sudo systemctl status ethgas
journalctl -u ethgas -f
```

**Verification**:
```bash
# Check service status
sudo systemctl status ethgas

# Check dependencies
sudo systemctl status commit-boost-pbs
sudo systemctl status commit-boost-signer

# Check metrics
curl http://127.0.0.1:18553/metrics
```

### Architecture

**Architecture**:
```
Validator
    ↓
Commit-Boost (sidecar)
    ├── PBS Module (relays)
    ├── Signer Module (BLS signing)
    └── ETHGas Module (precons)
```

### Registration Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| `standard` | Standard validator registration | Most validators |
| `ssv` | SSV Network validators | DVT with SSV |
| `obol` | Obol Network validators | DVT with Obol |
| `skip` | Skip registration | Testing/debugging |

---

## Technology Comparison

| Feature | MEV-Boost | Commit-Boost | ETHGas |
|---------|-----------|--------------|--------|
| **Production Ready** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Implementation Status** | ✅ Implemented | ✅ Implemented | ✅ Implemented |
| **Architecture** | Relay-based | Modular sidecar | Commit-Boost module |
| **MEV-Boost Compatible** | N/A | ✅ Yes | ✅ Yes (via Commit-Boost) |
| **Preconfirmations** | ❌ No | ✅ Yes | ✅ Yes |
| **Inclusion Lists** | ❌ No | ✅ Yes | ❌ No |
| **Dependencies** | None | None | Commit-Boost |
| **Deployment** | Binary (build) | Binary (pre-built) | Binary (build) |
| **Language** | Go | Rust | Rust |
| **Audited** | ✅ Yes | ✅ Yes (Sigma Prime) | ✅ Yes (Sigma Prime) |

---

## Decision Guide

### Use MEV-Boost if:
- ✅ You want the most stable, proven solution (RECOMMENDED)
- ✅ You need comprehensive documentation and community support
- ✅ You want multiple relay options
- ✅ You don't need preconfirmation features

### Use Commit-Boost if:
- ✅ You want MEV-Boost compatibility plus additional protocols
- ✅ You need preconfirmation or inclusion list support
- ✅ You want a modular, extensible architecture
- ✅ You're planning to use ETHGas (REQUIRED for ETHGas)

### Use ETHGas if:
- ✅ You want to sell preconfirmations for additional revenue
- ✅ You need real-time transaction guarantees
- ✅ You're already using Commit-Boost (REQUIRED)
- ✅ You want collateral-based security

### Recommended Setup:

**Option A - Simple (Most Users):**
```bash
./install_mev_boost.sh
```

**Option B - Advanced (Preconfirmations):**
```bash
./install_commit_boost.sh
./install_ethgas.sh  # Optional: for precon revenue
```

⚠️ **Remember**: Choose MEV-Boost OR Commit-Boost, never both!

---

## Testing

A comprehensive test script is available to verify all MEV implementations:

```bash
cd install/mev
./test_mev_implementations.sh
```

The test suite checks:
- ✅ Installation directories and binaries
- ✅ Configuration files (TOML syntax validation)
- ✅ Systemd services (status, enabled, running)
- ✅ API endpoints
- ✅ Port bindings
- ✅ Firewall rules
- ✅ Mutual exclusivity (MEV-Boost vs Commit-Boost)
- ✅ ETHGas dependency on Commit-Boost

---

## Quick Reference

### Port Summary

| Service | Port | Description |
|---------|------|-------------|
| MEV-Boost | 18550 | Builder API endpoint |
| Commit-Boost PBS | 18551 | Builder API endpoint |
| Commit-Boost Signer | 18552 | Signing service |
| Commit-Boost Metrics | 18553 | Prometheus metrics |
| ETHGas | 18552 | Preconfirmation service |
| ETHGas Metrics | 18553 | Prometheus metrics |

### Service Commands

**MEV-Boost**:
```bash
sudo systemctl {start|stop|status|restart} mev
journalctl -u mev -f
curl http://127.0.0.1:18550/eth/v1/builder/status
```

**Commit-Boost**:
```bash
sudo systemctl {start|stop|status|restart} commit-boost-pbs commit-boost-signer
journalctl -u commit-boost-pbs -f
journalctl -u commit-boost-signer -f
curl http://127.0.0.1:18551/eth/v1/builder/status
```

**ETHGas**:
```bash
sudo systemctl {start|stop|status|restart} ethgas
journalctl -u ethgas -f
curl http://127.0.0.1:18553/metrics
```

### Installation Scripts

| Script | Description |
|--------|-------------|
| `install_mev_boost.sh` | Standard MEV-Boost (RECOMMENDED) |
| `install_commit_boost.sh` | Modular sidecar with preconfirmation support |
| `install_ethgas.sh` | Preconfirmation protocol (requires Commit-Boost) |
| `test_mev_implementations.sh` | Test all MEV implementations |
| `fb_builder_geth.sh` | Flashbots Builder Geth (advanced) |
| `fb_mev_prysm.sh` | Flashbots MEV Prysm (advanced) |

**Validator Registration Check**:
- https://boost.flashbots.net/mev-boost-status-updates/query-validator-registration-status-now

---

## Troubleshooting

### MEV-Boost Issues

**Service not starting**:
```bash
journalctl -u mev -n 100
grep MEV exports.sh
curl https://boost-relay.flashbots.net
```

**No MEV blocks**:
```bash
grep MIN_BID exports.sh  # Check if min-bid is too high
journalctl -u mev -f | grep -i bid
curl https://boost-relay.flashbots.net/eth/v1/builder/status
```

**Validator not registered**:
- Restart validator service
- Check registration at Flashbots validator check page

### Commit-Boost Issues

**Service not starting**:
```bash
journalctl -u commit-boost-pbs -n 100
journalctl -u commit-boost-signer -n 100
```

**Check configuration**:
```bash
cat ~/commit-boost/config/cb-config.toml
```

**API not responding**:
```bash
curl -v http://127.0.0.1:18551/eth/v1/builder/status
ss -tuln | grep 18551
```

### ETHGas Issues

**Service not starting**:
```bash
journalctl -u ethgas -n 100
```

**Check Commit-Boost dependency**:
```bash
sudo systemctl status commit-boost-pbs
sudo systemctl status commit-boost-signer
```

**Check configuration**:
```bash
cat ~/ethgas/config/ethgas.toml
```

**Rust build failures**:
```bash
# Ensure Rust is installed
source ~/.cargo/env
rustc --version
cargo --version

# Try rebuilding
cd ~/ethgas
cargo build --release --bin ethgas_commit
```

### Common Issues

**Both MEV-Boost and Commit-Boost running**:
```bash
# Stop one of them (choose based on your needs)
sudo systemctl stop mev
sudo systemctl disable mev
# OR
sudo systemctl stop commit-boost-pbs commit-boost-signer
sudo systemctl disable commit-boost-pbs commit-boost-signer
```

**Port conflicts**:
```bash
ss -tuln | grep -E "18550|18551|18552|18553"
```

---

## Resources

### MEV-Boost
- Repository: https://github.com/flashbots/mev-boost
- Documentation: https://docs.flashbots.net/
- Wiki: https://github.com/flashbots/mev-boost/wiki
- Validator Check: https://boost.flashbots.net/mev-boost-status-updates/query-validator-registration-status-now

### Commit-Boost
- Repository: https://github.com/Commit-Boost/commit-boost-client
- Documentation: https://commit-boost.github.io/commit-boost-client/
- Twitter: https://x.com/Commit_Boost

### ETHGas
- Repository: https://github.com/ethgas-developer/ethgas-preconf-commit-boost-module
- Documentation: https://docs.ethgas.com/
- API Documentation: https://developers.ethgas.com/
- Exchange: https://app.ethgas.com/
- Twitter: https://x.com/ETHGASofficial

### Related
- Builder API: Ethereum Builder API specifications
- PBS: Proposer-Builder Separation
- EIP-4844: Proto-Danksharding

---

*Last Updated: November 2025*  
*Document Version: 3.0*  
*Status: All MEV solutions implemented and production-ready*
