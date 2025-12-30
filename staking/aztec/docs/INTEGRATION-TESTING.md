# Aztec Staking Integration Testing Guide

This guide covers how to set up a complete integration testing environment for the Aztec liquid staking protocol.

## Quick Start

### Minimal Environment (No Docker)

For unit testing and development without Docker:

```bash
# 1. Install Noir compiler
curl -L https://raw.githubusercontent.com/noir-lang/noirup/refs/heads/main/install | bash
~/.nargo/bin/noirup

# 2. Run smoke test (minimal mode)
./staking/aztec/scripts/smoke-test.sh --minimal

# 3. Run unit tests
cd staking/aztec/contracts/staking-math-tests
~/.nargo/bin/nargo test
```

**What works without Docker:**
- Unit tests (34 tests in staking-math-tests)
- Devnet connectivity checks
- Contract project structure validation

### Full Environment (Docker Required)

For contract compilation and local sandbox:

```bash
# 1. Install prerequisites
# Docker: https://docs.docker.com/engine/install/
# Node.js v20+: https://nodejs.org/ or use nvm

# 2. Install Aztec toolchain
bash -i <(curl -s https://install.aztec.network)
aztec-up 3.0.0-devnet.20251212

# 3. Extract aztec-nargo (if needed separately)
docker pull aztecprotocol/aztec:latest
mkdir -p ~/aztec-bin
docker create --name tmp-aztec aztecprotocol/aztec:latest
docker cp tmp-aztec:/usr/src/noir/noir-repo/target/release/nargo ~/aztec-bin/
docker rm tmp-aztec
chmod +x ~/aztec-bin/nargo

# 4. Run full smoke test
./staking/aztec/scripts/smoke-test.sh

# 5. Start local sandbox
aztec start --local-network
```

## Environment Types

The smoke test auto-detects your environment:

| Environment | Description | Available Features |
|-------------|-------------|-------------------|
| `sandboxed` | gVisor/container runtime (e.g., cloud IDEs) | Unit tests, devnet only |
| `docker-available` | Docker installed and running | Full features |
| `docker-installed` | Docker present but daemon stopped | Need to start daemon |
| `no-docker` | Docker not installed | Unit tests, devnet only |

## Testing Levels

### Level 1: Unit Tests (No Docker)

Tests pure Noir math functions without Aztec dependencies.

```bash
cd staking/aztec/contracts/staking-math-tests
~/.nargo/bin/nargo test
```

**Tests include:**
- Deposit/share minting calculations
- Withdrawal amount calculations
- Fee calculations (0%, 1%, 10%, 30%)
- Share value calculations
- Multi-user scenarios
- Edge cases (empty pools, large numbers)

### Level 2: Contract Compilation (Requires Docker)

Compile contracts with Aztec macros and dependencies.

```bash
# Copy to home directory (aztec-nargo requirement)
cp -r staking/aztec/contracts/aztec-staking-pool ~/aztec-contracts
cd ~/aztec-contracts

# Compile
~/aztec-bin/nargo compile

# Verify artifact
ls -lh target/staking_pool-StakingPool.json
```

**Expected output:** ~760KB JSON artifact with 19+ functions.

### Level 3: Local Sandbox (Requires Docker)

Full local network for integration testing.

```bash
# Terminal 1: Start sandbox
aztec start --local-network
# Wait for: "Aztec Server listening on port 8080"

# Terminal 2: Import test accounts
aztec-wallet import-test-accounts

# Terminal 3: Deploy and test contracts
aztec-wallet create-account -a test-wallet -f test0
```

### Level 4: Devnet Testing (Network Access Only)

Test against the public Aztec devnet.

```bash
# Check devnet connectivity
curl -s -X POST "https://next.devnet.aztec-labs.com" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"node_getVersion","params":[],"id":1}'
```

**Devnet info:**
- RPC URL: `https://next.devnet.aztec-labs.com`
- L1 Chain: Sepolia (Chain ID: 11155111)
- Current version: 3.0.0-devnet.20251212

## Docker Setup (Detailed)

### Linux (Ubuntu/Debian)

```bash
# Install Docker
sudo apt-get update
sudo apt-get install -y docker.io docker-compose

# Add user to docker group (avoid sudo)
sudo usermod -aG docker $USER
newgrp docker

# Start daemon
sudo systemctl start docker
sudo systemctl enable docker

# Verify
docker info
```

### macOS

```bash
# Install Docker Desktop
brew install --cask docker

# Or download from: https://docs.docker.com/docker-for-mac/install/

# Start Docker Desktop app, then verify
docker info
```

### Windows (WSL2)

```bash
# Install Docker Desktop with WSL2 backend
# Download from: https://docs.docker.com/docker-for-windows/install/

# In WSL2 Ubuntu:
docker info
```

## Troubleshooting

### "Docker daemon not running"

```bash
# Linux
sudo systemctl start docker

# macOS/Windows
# Start Docker Desktop application
```

### "aztec-nargo not found"

```bash
# Extract from Docker image
docker pull aztecprotocol/aztec:latest
docker create --name tmp-aztec aztecprotocol/aztec:latest
docker cp tmp-aztec:/usr/src/noir/noir-repo/target/release/nargo ~/aztec-bin/
docker rm tmp-aztec
chmod +x ~/aztec-bin/nargo

# Add to PATH
export PATH="$HOME/aztec-bin:$PATH"
```

### Contract compilation errors (type mismatches)

Standard nargo cannot compile Aztec contracts. You must use aztec-nargo:

```bash
# Wrong - uses standard nargo
~/.nargo/bin/nargo compile  # Will fail on Aztec contracts

# Correct - uses aztec-nargo
~/aztec-bin/nargo compile
```

### "Working directory must be under $HOME"

aztec-nargo requires the project to be under your home directory:

```bash
# Won't work
cd /workspace/staking/aztec/contracts/aztec-staking-pool
~/aztec-bin/nargo compile

# Will work
cp -r /workspace/staking/aztec/contracts/aztec-staking-pool ~/aztec-contracts
cd ~/aztec-contracts
~/aztec-bin/nargo compile
```

### Sandboxed environment limitations

Some cloud environments (e.g., GitHub Codespaces with gVisor, Google Cloud Shell) don't support Docker. In these cases:

1. Use `--minimal` mode for smoke tests
2. Unit tests will work fine
3. For contract compilation, use a local machine or VM with Docker

## CI/CD Integration

### GitHub Actions (Current)

The current CI runs unit tests only (no Docker):

```yaml
# .github/workflows/staking-contracts-ci.yml
- name: Run staking math tests
  run: |
    export PATH="$HOME/.nargo/bin:$PATH"
    nargo test
```

### Full CI with Docker (Future)

For contract compilation in CI:

```yaml
jobs:
  compile-contracts:
    runs-on: ubuntu-latest
    services:
      docker:
        image: docker:dind
    steps:
      - uses: actions/checkout@v4
      - name: Install Aztec toolchain
        run: |
          bash -i <(curl -s https://install.aztec.network)
          aztec-up 3.0.0-devnet.20251212
      - name: Compile contracts
        run: |
          cp -r staking/aztec/contracts/aztec-staking-pool ~/aztec-contracts
          cd ~/aztec-contracts
          ~/.aztec/bin/aztec-nargo compile
```

## Test Matrix

| Test Type | Requires Docker | Runs in CI | Time |
|-----------|-----------------|------------|------|
| Unit tests | No | Yes | ~10s |
| Linting | No | Yes | ~5s |
| Contract compilation | Yes | No* | ~30s |
| Local sandbox | Yes | No | ~2min |
| Devnet deployment | No** | Possible | ~1min |

*Can be enabled with Docker-in-Docker
**Requires network access and test tokens

## Next Steps

After setting up your environment:

1. **Run smoke test**: `./staking/aztec/scripts/smoke-test.sh --minimal`
2. **Review contracts**: Start with `contracts/aztec-staking-pool/src/main.nr`
3. **Understand patterns**: Read `contracts/NOIR_GUIDE.md`
4. **Check tasks**: See `docs/TASKS.md` for implementation status

## Resources

- [Aztec Documentation](https://docs.aztec.network)
- [Noir Language Docs](https://noir-lang.org/docs)
- [Aztec Sandbox Guide](https://docs.aztec.network/developers/docs/guides/local_env/sandbox)
- [Devnet Setup](https://docs.aztec.network/developers/getting_started_on_devnet)
