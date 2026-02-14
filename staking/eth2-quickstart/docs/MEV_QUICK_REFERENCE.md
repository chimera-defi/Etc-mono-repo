# MEV Technologies: Quick Reference

## Technology Status

| Technology | Status | Production Ready | Implementation |
|------------|--------|-----------------|----------------|
| **MEV-Boost** | ✅ Active | ✅ Yes | ✅ **Implemented** |
| **Commit-Boost** | ✅ Active | ✅ Yes | ✅ **Implemented** |
| **ETHGas** | ✅ Active | ✅ Yes | ✅ **Implemented** |

⚠️ **IMPORTANT**: MEV-Boost and Commit-Boost are **mutually exclusive** - choose ONE!

---

## Quick Decision Guide

**Most Users (Stable, Production-Proven)** → **MEV-Boost** ✅

**Want Preconfirmations/Advanced Features** → **Commit-Boost** + optional **ETHGas**

---

## Installation

### Option A: MEV-Boost (RECOMMENDED)
```bash
cd install/mev
./install_mev_boost.sh
```

### Option B: Commit-Boost + ETHGas
```bash
cd install/mev
./install_commit_boost.sh
./install_ethgas.sh  # Optional: requires Commit-Boost
```

---

## Port Reference

| Service | Port | Status |
|---------|------|--------|
| MEV-Boost | 18550 | ✅ Active |
| Commit-Boost PBS | 18551 | ✅ Active |
| Commit-Boost Signer | 18552 | ✅ Active |
| Commit-Boost Metrics | 18553 | ✅ Active |
| ETHGas | 18552 | ✅ Active |
| ETHGas Metrics | 18553 | ✅ Active |

---

## Service Management

### MEV-Boost
```bash
sudo systemctl start mev
sudo systemctl status mev
journalctl -u mev -f
```

### Commit-Boost
```bash
sudo systemctl start commit-boost-pbs commit-boost-signer
sudo systemctl status commit-boost-pbs commit-boost-signer
journalctl -u commit-boost-pbs -f
```

### ETHGas
```bash
sudo systemctl start ethgas
sudo systemctl status ethgas
journalctl -u ethgas -f
```

---

## Verification Commands

### MEV-Boost
```bash
curl http://127.0.0.1:18550/eth/v1/builder/status
```

### Commit-Boost
```bash
curl http://127.0.0.1:18551/eth/v1/builder/status
curl http://127.0.0.1:18553/metrics
```

### ETHGas
```bash
curl http://127.0.0.1:18553/metrics
```

---

## Client Integration

### MEV-Boost (Port 18550)
- **Prysm**: `http-mev-relay: http://127.0.0.1:18550`
- **Teku**: `builder-endpoint: "http://127.0.0.1:18550"`
- **Lighthouse**: `--builder http://127.0.0.1:18550`
- **Lodestar**: `builder.urls: ["http://127.0.0.1:18550"]`
- **Nimbus**: `payload-builder-url = "http://127.0.0.1:18550"`
- **Grandine**: `builder_endpoint = "http://127.0.0.1:18550"`

### Commit-Boost (Port 18551)
- **Prysm**: `http-mev-relay: http://127.0.0.1:18551`
- **Teku**: `builder-endpoint: "http://127.0.0.1:18551"`
- **Lighthouse**: `--builder http://127.0.0.1:18551`
- **Lodestar**: `builder.urls: ["http://127.0.0.1:18551"]`
- **Nimbus**: `payload-builder-url = "http://127.0.0.1:18551"`
- **Grandine**: `builder_endpoint = "http://127.0.0.1:18551"`

---

## Configuration Variables (exports.sh)

### MEV-Boost
```bash
MEV_HOST='127.0.0.1'
MEV_PORT=18550
MEV_RELAYS='...'
MIN_BID=0.002
MEVGETHEADERT=950
MEVGETPAYLOADT=4000
MEVREGVALT=6000
```

### Commit-Boost
```bash
COMMIT_BOOST_HOST='127.0.0.1'
COMMIT_BOOST_PORT=18551
```

### ETHGas
```bash
ETHGAS_HOST='127.0.0.1'
ETHGAS_PORT=18552
ETHGAS_METRICS_PORT=18553
ETHGAS_NETWORK='mainnet'
ETHGAS_REGISTRATION_MODE='standard'
```

---

## Testing

```bash
cd install/mev
./test_mev_implementations.sh
```

---

## Troubleshooting

### Service Not Starting
```bash
journalctl -u <service_name> -n 100
```

### Check Ports
```bash
ss -tuln | grep -E "18550|18551|18552|18553"
```

### Both Running (Should Not Happen)
```bash
# Stop MEV-Boost if using Commit-Boost
sudo systemctl stop mev && sudo systemctl disable mev

# OR stop Commit-Boost if using MEV-Boost
sudo systemctl stop commit-boost-pbs commit-boost-signer
```

---

## Useful Links

### MEV-Boost
- Repository: https://github.com/flashbots/mev-boost
- Documentation: https://docs.flashbots.net/
- Validator Check: https://boost.flashbots.net/mev-boost-status-updates/query-validator-registration-status-now

### Commit-Boost
- Repository: https://github.com/Commit-Boost/commit-boost-client
- Documentation: https://commit-boost.github.io/commit-boost-client/

### ETHGas
- Repository: https://github.com/ethgas-developer/ethgas-preconf-commit-boost-module
- Documentation: https://docs.ethgas.com/

---

## Feature Comparison

| Feature | MEV-Boost | Commit-Boost | ETHGas |
|---------|-----------|--------------|--------|
| Block Proposals | ✅ | ✅ | ✅ |
| MEV-Boost Compatible | N/A | ✅ | ✅ |
| Preconfirmations | ❌ | ✅ | ✅ |
| Multiple Relays | ✅ | ✅ | ✅ |
| Production Ready | ✅ | ✅ | ✅ |
| **Implemented** | ✅ | ✅ | ✅ |

---

*Last Updated: November 2025*  
*Version: 3.0*
