# Aztec Infrastructure Guide

**Hardware specifications, setup instructions, and operational requirements for running Aztec nodes.**

*Last Updated: December 28, 2025*

---

## Overview

This document outlines the infrastructure requirements for the Aztec Liquid Staking Protocol. Unlike standard dApps, **we must operate our own validator nodes** to:
1.  Directly capture block rewards (both sequencer and prover rewards).
2.  Control the staking delegation flow (stake to OUR nodes).
3.  Minimize fees paid to third-party operators.

## 1. Development Environment (Aztec Sandbox)

The Aztec Sandbox is a local developer network that runs an Aztec node, PXE (Private Execution Environment), and Ethereum L1 fork (Anvil) in a Docker container.

### Hardware Requirements

| Component | Minimum | Recommended | Notes |
|-----------|---------|-------------|-------|
| **RAM** | 8 GB | **16 GB** | ZK proof generation and PXE are memory intensive. |
| **CPU** | 4 vCPU | **8 vCPU** | Multi-threading helps with local proving speed. |
| **Disk** | 20 GB free | **50 GB SSD** | Docker images + chain state data. |
| **OS** | Linux / macOS | Linux (Ubuntu 22.04) | Windows requires WSL2. |

### Software Prerequisites
- **Docker**: Version 24.0+ (Daemon must be running)
- **Node.js**: v18+
- **Aztec CLI**: `aztec-cli` (installed via `aztec-up` or npm)

### Setup Command
```bash
# Start the sandbox
aztec start --sandbox
```

---

## 2. Production Validator Node (Sequencer)

Running a validator on Aztec (Mainnet/Testnet) requires robust infrastructure to ensure 99.9% uptime and avoid slashing penalties.

> **⚠️ NOTE:** These specifications are estimates based on Aztec's ZK-rollup architecture. Aztec nodes perform heavy computation for state updates and proof verification.

### Hardware Specifications

| Component | Minimum | **Production** | Rationale |
|-----------|---------|----------------|-----------|
| **RAM** | 16 GB | **32 GB** | Heavy caching of Merkle trees (Note Hash Tree, Nullifier Tree) required for performance. |
| **CPU** | 4 cores | **8-16 cores** | High clock speed preferred for transaction processing. |
| **Storage** | 500 GB SSD | **1-2 TB NVMe** | **Critical:** Must be NVMe SSD. High IOPS required for database reads/writes. |
| **Network** | 100 Mbps | **1 Gbps** | Low latency peering is crucial for block proposal. |
| **Region** | Any | **Multi-region** | Distribute 3 nodes across US/EU/Asia for redundancy. |

### Operational Stack
- **OS**: Ubuntu 22.04 LTS or Amazon Linux 2023.
- **Orchestration**: Systemd (single node) or Kubernetes (HA cluster).
- **Monitoring**: Prometheus (metrics exporter) + Grafana.
- **Key Management**:
    - **Hot Wallet**: Local keystore (Testnet only).
    - **Production**: AWS KMS / HashiCorp Vault / Hardware Security Module (HSM).

### Validator Responsibilities
1.  **Sequencing**: Ordering transactions and building blocks.
2.  **Proving**: (Optional but recommended) Generating proofs for blocks to earn prover rewards. *Note: If running a Prover, RAM requirements increase to 64GB+.*
3.  **Archival**: Storing historical chain data for indexers.

---

## 3. Setup Strategy

We will use a **Hybrid Cloud** approach:
1.  **Bootstrapping**: Run 1 validator on AWS EC2 (`c6i.2xlarge` - 8 vCPU, 16GB RAM).
2.  **Scaling**: Migrate to bare metal (Latitude.sh / Hetzner) for cost efficiency once stable.

### Required Setup Scripts
We need to create and maintain the following automation scripts:

- `scripts/setup-validator.sh`: Installs dependencies, Docker, and Aztec node software.
- `scripts/manage-keys.sh`: Securely generates and registers validator keys.
- `k8s/validator-statefulset.yaml`: Kubernetes configuration for HA deployment.

## 4. Cost Estimates (Per Node)

| Item | Monthly Cost |
|------|--------------|
| **Hardware (AWS c6i.2xlarge)** | ~$245 |
| **Storage (1TB gp3 SSD)** | ~$80 |
| **Data Transfer** | ~$50 |
| **Total** | **~$375 / month** |

*Compare to `ECONOMICS.md` estimate of $400/month.*

---

## Next Steps
1.  Provision a test server (or local VM) matching these specs.
2.  Run `scripts/setup-validator.sh` (to be created) to verify installation process.
3.  Sync with Testnet and measure actual resource usage (CPU/RAM/Disk).
