#!/bin/bash

# Shell safety settings - applied to all scripts that source this file
set -Eeuo pipefail
IFS=$'\n\t'

# Add all shared env conf for shell scripts here 
# You only need to change the values here for all the scripts

set -o allexport

# Feel free to reach out
export EMAIL="chimera_defi@protonmail.com"

export LOGIN_UNAME='eth'
export YourSSHPortNumber='22'
export maxretry='3'
export REPO_NAME="eth2-quickstart"

# Server name used for nginx, caddy & ssl setup
export SERVER_NAME="rpc.sharedtools.org"

# Validator and beacon-chain settings
export FEE_RECIPIENT=0xa1feaF41d843d53d0F6bEd86a8cF592cE21C409e
export GRAFITTI="SharedStake.org!"
export MAX_PEERS=100 # You may want to reduce this if you have banwidth restrictions
export PRYSM_CPURL="https://beaconstate.ethstaker.cc"
# Goerli link if needed for checkpoint sync https://goerli.checkpoint-sync.ethpandaops.io/
export USE_PRYSM_MODERN=true
export PRYSM_ALLOW_UNVERIFIED_BINARIES=1

# Host configuration
export LH='127.0.0.1'  # Local host for execution clients
export CONSENSUS_HOST='127.0.0.1'  # Host for consensus clients
export MEV_HOST='127.0.0.1'  # Host for MEV-Boost

# GETH opts
export GETH_CACHE=8192

# Client-specific configuration
# Execution clients
export NETHERMIND_CACHE=8192
export BESU_CACHE=8192
export ERIGON_CACHE=8192
export RETH_CACHE=8192
export NIMBUS_ETH1_CACHE=4096  # Lighter client
export ETHREX_CACHE=4096  # Minimalist client by Lambda Class

# Consensus clients  
export TEKU_CACHE=8192
export NIMBUS_CACHE=4096  # Lighter client
export LODESTAR_CACHE=8192
export GRANDINE_CACHE=8192

# Client-specific ports (to avoid conflicts when switching)
export NETHERMIND_HTTP_PORT=8545
export NETHERMIND_WS_PORT=8546
export NETHERMIND_ENGINE_PORT=8551
export BESU_HTTP_PORT=8545
export BESU_WS_PORT=8546
export BESU_ENGINE_PORT=8551
export NIMBUS_ETH1_HTTP_PORT=8545
export NIMBUS_ETH1_WS_PORT=8546
export NIMBUS_ETH1_ENGINE_PORT=8551
export ETHREX_HTTP_PORT=8545
export ETHREX_WS_PORT=8546
export ETHREX_ENGINE_PORT=8551
export ETHREX_P2P_PORT=30303
export ETHREX_METRICS_PORT=9090

# Common ports
export ENGINE_PORT=8551  # JWT-secured Engine API port
export METRICS_PORT=6060  # Prometheus metrics port
export MEV_PORT=18550  # MEV-Boost port

export TEKU_REST_PORT=5051
export NIMBUS_REST_PORT=5052
export LODESTAR_REST_PORT=9596
export GRANDINE_REST_PORT=5052

# Client-specific checkpoint URLs (fallbacks if main fails)
export TEKU_CHECKPOINT_URL="https://beaconstate.ethstaker.cc"
export NIMBUS_CHECKPOINT_URL="https://beaconstate.ethstaker.cc"
export LODESTAR_CHECKPOINT_URL="https://beaconstate.ethstaker.cc"
export LIGHTHOUSE_CHECKPOINT_URL="https://mainnet.checkpoint.sigp.io"
export GRANDINE_CHECKPOINT_URL="https://beaconstate.ethstaker.cc"

# ============================================================================
# MEV Configuration
# ============================================================================
# Multiple MEV solutions are supported:
# 1. MEV-Boost (default, stable, widely adopted)
# 2. Commit-Boost (modular, supports MEV-Boost relays + additional protocols)
# 3. ETHGas (preconfirmation protocol, requires Commit-Boost)

# MEV relays based on flashbots data on perf
export MEV_RELAYS='https://0xac6e77dfe25ecd6110b8e780608cce0dab71fdd5ebea22a16c0205200f2f8e2e3ad3b71d3499c54ad14d6c21b41a37ae@boost-relay.flashbots.net'
# uncensored 
MEV_RELAYS=$MEV_RELAYS',https://0xa1559ace749633b997cb3fdacffb890aeebdb0f5a3b6aaa7eeeaf1a38af0a8fe88b9e4b1f61f236d2e64d95733327a62@relay.ultrasound.money'
MEV_RELAYS=$MEV_RELAYS',https://0x84e78cb2ad883861c9eeeb7d1b22a8e02332637448f84144e245d20dff1eb97d7abdde96d4e7f80934e5554e11915c56@relayooor.wtf'
MEV_RELAYS=$MEV_RELAYS',https://0xa7ab7a996c8584251c8f925da3170bdfd6ebc75d50f5ddc4050a6fdc77f2a3b5fce2cc750d0865e05d7228af97d69561@agnostic-relay.net'

MEV_RELAYS=$MEV_RELAYS',https://0xb3ee7afcf27f1f1259ac1787876318c6584ee353097a50ed84f51a1f21a323b3736f271a895c7ce918c038e4265918be@relay.edennetwork.io'
# started failing register a lot - feb 19 23
# Bloxroute fails on registerValidator w/ timeout so only flashbots for now
# sketchy, proven lies about returns 
# MEV_RELAYS=$MEV_RELAYS',https://0x98650451ba02064f7b000f5768cf0cf4d4e492317d82871bdc87ef841a0743f69f0f1eea11168503240ac35d101c9135@mainnet-relay.securerpc.com'
# MEV_RELAYS=$MEV_RELAYS',https://0x8b5d2e73e2a3a55c6c87b8b6eb92e0149a125c852751db1422fa951e42a09b82c142c3ea98d0d9930b056a3bc9896b8f@bloxroute.max-profit.blxrbdn.com'
# low vol
# MEV_RELAYS=$MEV_RELAYS',https://0xa15b52576bcbf1072f4a011c0f99f9fb6c66f3e1ff321f11f461d15e31b1cb359caa092c71bbded0bae5b5ea401aab7e@aestus.live'
# MEV_RELAYS=$MEV_RELAYS',https://0x8c4ed5e24fe5c6ae21018437bde147693f68cda427cd1122cf20819c30eda7ed74f72dece09bb313f2a1855595ab677d@global.titanrelay.xyz'
# MEV_RELAYS=$MEV_RELAYS',https://0xa44f64faca0209764461b2abfe3533f9f6ed1d51844974e22d79d4cfd06eff858bb434d063e512ce55a1841e66977bfd@proof-relay.ponrelay.com'

# Shared MEV settings (used by all MEV solutions)
export MIN_BID=0.002                # ~1% chance of local block production for minimal opp cost
export MEVGETHEADERT=950            # Timeout for getHeader (milliseconds)
export MEVGETPAYLOADT=4000          # Timeout for getPayload (milliseconds)
export MEVREGVALT=6000              # Timeout for registerValidator (milliseconds)

# ----------------------------------------------------------------------------
# Commit-Boost Configuration (Alternative to MEV-Boost)
# ----------------------------------------------------------------------------
# Commit-Boost is a modular sidecar that REPLACES MEV-Boost (drop-in)
# Same BuilderAPI on the same port — consensus client configs work unchanged
# Choose ONE: Either MEV-Boost OR Commit-Boost, not both
# Docs: https://commit-boost.github.io/commit-boost-client/
export COMMIT_BOOST_PORT=$MEV_PORT           # Same port as MEV-Boost (drop-in replacement)
export COMMIT_BOOST_HOST=$MEV_HOST           # Same host as MEV-Boost
export COMMIT_BOOST_SIGNER_PORT=20000        # Signer module port (upstream default)
export COMMIT_BOOST_METRICS_PORT=10000       # Metrics start port (upstream default)

# ----------------------------------------------------------------------------
# ETHGas Configuration (Requires Commit-Boost)
# ----------------------------------------------------------------------------
# ETHGas is a preconfirmation protocol module that runs on top of Commit-Boost
# Enables validators to sell preconfirmations for additional revenue
export ETHGAS_PORT=18552
export ETHGAS_HOST='127.0.0.1'
export ETHGAS_METRICS_PORT=18553
export ETHGAS_NETWORK='mainnet'                          # or 'holesky' for testnet
export ETHGAS_API_ENDPOINT='https://api.ethgas.com'      # ETHGas Exchange API
export ETHGAS_REGISTRATION_MODE='standard'               # Options: 'standard', 'ssv', 'obol', 'skip'
export ETHGAS_MIN_PRECONF_VALUE='1000000000000000'       # 0.001 ETH in wei

# ETHGas collateral contract addresses
export ETHGAS_COLLATERAL_CONTRACT_MAINNET='0x3314Fb492a5d205A601f2A0521fAFbD039502Fc3'
export ETHGAS_COLLATERAL_CONTRACT_HOLESKY='0x104Ef4192a97E0A93aBe8893c8A2d2484DFCBAF1'

# Set active collateral contract based on network
if [[ "$ETHGAS_NETWORK" == "holesky" ]]; then
    export ETHGAS_COLLATERAL_CONTRACT="$ETHGAS_COLLATERAL_CONTRACT_HOLESKY"
else
    export ETHGAS_COLLATERAL_CONTRACT="$ETHGAS_COLLATERAL_CONTRACT_MAINNET"
fi

# ----------------------------------------------------------------------------
# User Configuration Override
# ----------------------------------------------------------------------------
# If the user configuration file exists, source it to override defaults
# This allows configure.sh wizard to customize settings without editing exports.sh
SCRIPT_SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ -f "$SCRIPT_SOURCE_DIR/config/user_config.env" ]]; then
    # shellcheck source=/dev/null
    source "$SCRIPT_SOURCE_DIR/config/user_config.env"
fi
unset SCRIPT_SOURCE_DIR

set +o allexport
