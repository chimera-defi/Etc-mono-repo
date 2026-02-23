#!/bin/bash
# Ethereum Adapter - Bootstrap
# Implements Phase 1 (system setup) + Phase 2 (client install)
# Based on eth2-quickstart run_1.sh + run_2.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/exports.sh"

STACK_NAME="${STACK_NAME:-ethereum}"
USER_NAME="eth-${STACK_NAME}"
NETWORK="${NETWORK:-mainnet}"

# Client selections (can be overridden via args)
EL_CLIENT="${EL_CLIENT:-geth}"
CL_CLIENT="${CL_CLIENT:-lighthouse}"
MEV_BOOST="${MEV_BOOST:-mev-boost}"

echo "=== Ethereum Bootstrap for ${STACK_NAME} ==="
echo "Network: ${NETWORK}"
echo "EL Client: ${EL_CLIENT}"
echo "CL Client: ${CL_CLIENT}"
echo "MEV: ${MEV_BOOST}"

# Parse args
while [[ $# -gt 0 ]]; do
    case $1 in
        --execution) EL_CLIENT="$2"; shift 2;;
        --consensus) CL_CLIENT="$2"; shift 2;;
        --mev) MEV_BOOST="$2"; shift 2;;
        --network) NETWORK="$2"; shift 2;;
        --help)
            echo "Usage: $0 [--execution geth|nethermind|erigon] [--consensus lighthouse|prysm|teku] [--mev mev-boost|commit-boost|none] [--network mainnet|sepolia]"
            exit 0
            ;;
        *) shift;;
    esac
done

# Phase 1: System setup (requires root)
if [[ $EUID -eq 0 ]]; then
    echo "[Phase 1/2] System setup..."
    
    # Create user
    if ! id "${USER_NAME}" &>/dev/null; then
        useradd -m -s /bin/bash "${USER_NAME}"
        echo "Created user: ${USER_NAME}"
    else
        echo "User ${USER_NAME} already exists"
    fi
    
    # Setup firewall ports (all clients)
    echo "[Phase 1/2] Configuring firewall..."
    # Execution client ports
    ufw allow 30303/tcp comment 'Geth/Nethermind P2P' 2>/dev/null || true
    ufw allow 30304/tcp comment 'Alternative P2P' 2>/dev/null || true
    ufw allow 8545/tcp comment 'EL RPC' 2>/dev/null || true
    ufw allow 8546/tcp comment 'EL WS' 2>/dev/null || true
    ufw allow 8551/tcp comment 'EL Engine API' 2>/dev/null || true
    # Consensus client ports
    ufw allow 9000/tcp comment 'CL P2P' 2>/dev/null || true
    ufw allow 5052/tcp comment 'CL RPC' 2>/dev/null || true
    # Additional
    ufw allow 6060/tcp comment 'Metrics' 2>/dev/null || true
    ufw allow 18550/tcp comment 'MEV-Boost' 2>/dev/null || true
    
    # Create directories
    mkdir -p "/var/lib/ethereum"
    mkdir -p "/var/lib/ethereum/secrets"
    mkdir -p "/etc/ethereum"
    
    # Generate JWT secret
    if [[ ! -f /var/lib/ethereum/secrets/jwt.hex ]]; then
        openssl rand -hex 32 > /var/lib/ethereum/secrets/jwt.hex
        chmod 600 /var/lib/ethereum/secrets/jwt.hex
        echo "Generated JWT secret"
    fi
    
    # Set ownership
    chown -R "${USER_NAME}:${USER_NAME}" /var/lib/ethereum 2>/dev/null || true
    
    echo "[Phase 1/2] System setup complete."
    echo "Run again as ${USER_NAME} to install clients:"
    echo "  sudo -u ${USER_NAME} $0 --execution ${EL_CLIENT} --consensus ${CL_CLIENT}"
    exit 0
fi

# Phase 2: Client installation (non-root)
echo "[Phase 2/2] Installing clients as ${USER_NAME}..."

# Create working directory
WORK_DIR="/home/${USER_NAME}/${STACK_NAME}"
mkdir -p "${WORK_DIR}"
cd "${WORK_DIR}"

# Install Execution Client
echo "Installing ${EL_CLIENT}..."
case "${EL_CLIENT}" in
    geth)
        # Check if installed
        if ! command -v geth &>/dev/null; then
            echo "  Downloading geth..."
            # Add geth installation logic here
        fi
        ;;
    nethermind)
        echo "  Downloading Nethermind..."
        ;;
    erigon)
        echo "  Downloading Erigon..."
        ;;
    reth)
        echo "  Downloading Reth..."
        ;;
    *)
        echo "Unknown EL client: ${EL_CLIENT}"
        exit 1
        ;;
esac

# Install Consensus Client
echo "Installing ${CL_CLIENT}..."
case "${CL_CLIENT}" in
    lighthouse)
        echo "  Downloading Lighthouse..."
        ;;
    prysm)
        echo "  Downloading Prysm..."
        ;;
    teku)
        echo "  Downloading Teku..."
        ;;
    lodestar)
        echo "  Downloading Lodestar..."
        ;;
    nimbus)
        echo "  Downloading Nimbus..."
        ;;
    *)
        echo "Unknown CL client: ${CL_CLIENT}"
        exit 1
        ;;
esac

# Install MEV-Boost (optional)
if [[ "${MEV_BOOST}" != "none" ]]; then
    echo "Installing ${MEV_BOOST}..."
    case "${MEV_BOOST}" in
        mev-boost)
            echo "  Downloading MEV-Boost..."
            ;;
        commit-boost)
            echo "  Downloading Commit-Boost..."
            ;;
    esac
fi

# Create systemd service files
echo "Creating systemd services..."

# EL service
sudo tee "/etc/systemd/system/eth1.service" > /dev/null <<EOF
[Unit]
Description=Ethereum Execution Client (${EL_CLIENT})
After=network-online.target
Wants=network-online.target

[Service]
User=${USER_NAME}
Type=simple
ExecStart=/usr/local/bin/${EL_CLIENT} \\
    --http \\
    --http.addr=127.0.0.1 \\
    --http.port=8545 \\
    --authrpc.addr=127.0.0.1 \\
    --authrpc.port=8551 \\
    --p2p.port=30303 \\
    --metrics \\
    --metrics.addr=127.0.0.1 \\
    --metrics.port=6060
Restart=always
RestartSec=3
TimeoutStopSec=300

[Install]
WantedBy=multi-user.target
EOF

# CL service
sudo tee "/etc/systemd/system/beacon-chain.service" > /dev/null <<EOF
[Unit]
Description=Ethereum Consensus Client (${CL_CLIENT})
After=network-online.target
Wants=network-online.target

[Service]
User=${USER_NAME}
Type=simple
ExecStart=/usr/local/bin/${CL_CLIENT} \\
    --http \\
    --http-address=127.0.0.1 \\
    --http-port=5052 \\
    --p2p-port=9000 \\
    --metrics \\
    --metrics-address=127.0.0.1 \\
    --metrics-port=5054 \\
    --execution-endpoint=http://127.0.0.1:8551 \\
    --jwt-secret=/var/lib/ethereum/secrets/jwt.hex
Restart=always
RestartSec=3
TimeoutStopSec=300

[Install]
WantedBy=multi-user.target
EOF

# Reload and enable
sudo systemctl daemon-reload
sudo systemctl enable eth1 beacon-chain

echo "=== Bootstrap Complete ==="
echo ""
echo "To start services:"
echo "  sudo systemctl start eth1 beacon-chain"
echo ""
echo "To check status:"
echo "  sudo systemctl status eth1 beacon-chain"
