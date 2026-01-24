#!/bin/bash
# Local sandbox deploy + E2E flow (no devnet spend)
#
# Steps:
# - Start local sandbox (if not already running)
# - Compile contracts (staking + local AZTEC token)
# - Create admin + user accounts
# - Deploy contracts and wire references
# - Stake, request withdrawal, fund queue, claim

set -euo pipefail

AZTEC_BIN="/root/.aztec/bin/aztec"
WALLET_BIN="/root/.aztec/bin/aztec-wallet"
NODE_URL="http://localhost:8080"
WALLET_NODE_URL="$NODE_URL"

SANDBOX_STARTED=false
PID_FILE="/tmp/aztec-local.pid"
LOG_FILE="/tmp/aztec-local.log"

UNBONDING_PERIOD=604800
DEPOSIT_AMOUNT=10000000000000000000
DEPOSIT_NONCE=1
FUND_NONCE=2
FEE_JUICE_AMOUNT=1000000000000000000000
ADMIN_ALIAS="test0"
USER_ALIAS="test1"
TOKEN_NAME="AztecToken"
TOKEN_SYMBOL="AZTEC"
DEPLOY_TIMEOUT=300

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONTRACTS_DIR="$ROOT_DIR/contracts"
AZTEC_LOCAL_DIR="$HOME/aztec-contracts-local"
TOKEN_WORKSPACE_ROOT="/root/nargo/github.com/AztecProtocol/aztec-packages/v3.0.3/noir-projects/noir-contracts"
TOKEN_CONTRACT_SRC="$TOKEN_WORKSPACE_ROOT/contracts/app/token_contract"
TOKEN_WORKSPACE_TARGET="/root/nargo/github.com/AztecProtocol/aztec-packages/v3.0.3/noir-projects/noir-contracts/target"

wallet() {
  "$WALLET_BIN" -n "$WALLET_NODE_URL" "$@"
}

check_bin() {
  local bin=$1
  if [ ! -x "$bin" ]; then
    echo "Missing required binary: $bin" >&2
    exit 1
  fi
}

wait_for_node() {
  for _ in $(seq 1 60); do
    if curl -s -X POST "$NODE_URL" \
      -H "Content-Type: application/json" \
      -d '{"jsonrpc":"2.0","method":"node_getVersion","params":[],"id":1}' \
      | grep -q '"result"'; then
      return 0
    fi
    sleep 2
  done
  return 1
}

require_node() {
  if ! wait_for_node; then
    echo "Local sandbox is not reachable on $NODE_URL. Check $LOG_FILE" >&2
    exit 1
  fi
}

artifact_has_bytecode() {
  local artifact=$1

  if command -v jq >/dev/null 2>&1; then
    jq -e 'any(.functions[]?; (.bytecode != null) and (.bytecode | length > 0))' "$artifact" >/dev/null 2>&1
    return $?
  fi

  grep -q '"bytecode"' "$artifact"
}

start_sandbox() {
  if wait_for_node; then
    return 0
  fi

  : > "$LOG_FILE"
  : > "$PID_FILE"
  PORTS_TO_EXPOSE="8080 8880" "$AZTEC_BIN" start --local-network > "$LOG_FILE" 2>&1 &
  echo $! > "$PID_FILE"
  SANDBOX_STARTED=true

  if ! wait_for_node; then
    echo "Local sandbox did not become ready. Check $LOG_FILE" >&2
    exit 1
  fi
}

stop_sandbox() {
  if [ "$SANDBOX_STARTED" = true ] && [ -s "$PID_FILE" ]; then
    kill "$(cat "$PID_FILE")" >/dev/null 2>&1 || true
  fi
}

compile_contract() {
  local name=$1
  local src=$2
  local artifact=$3

  if [ -f "$AZTEC_LOCAL_DIR/$name/target/$artifact" ] && artifact_has_bytecode "$AZTEC_LOCAL_DIR/$name/target/$artifact"; then
    return 0
  fi

  rm -rf "$AZTEC_LOCAL_DIR/$name" 2>/dev/null || true
  mkdir -p "$AZTEC_LOCAL_DIR"
  cp -r "$src" "$AZTEC_LOCAL_DIR/$name"

  pushd "$AZTEC_LOCAL_DIR/$name" >/dev/null
  "$AZTEC_BIN" compile >/dev/null
  popd >/dev/null
}

compile_token_contract() {
  local token_artifact="$TOKEN_WORKSPACE_TARGET/token_contract-Token.json"

  if [ -f "$token_artifact" ] && artifact_has_bytecode "$token_artifact"; then
    return 0
  fi

  pushd "$TOKEN_WORKSPACE_ROOT" >/dev/null
  "$AZTEC_BIN" compile --package token_contract >/dev/null
  popd >/dev/null
}

get_address_from_output() {
  grep -oE '0x[0-9a-f]{64}' | head -n 1 | tr -d '\r'
}

get_test_account_address() {
  local alias=$1

  if command -v jq >/dev/null 2>&1; then
    jq -r --arg alias "$alias" '.[$alias].address // empty'
    return 0
  fi

  grep -oE '0x[0-9a-f]{64}' | head -n 1 | tr -d '\r'
}

trap stop_sandbox EXIT

check_bin "$AZTEC_BIN"
check_bin "$WALLET_BIN"

# Compile staking contracts
echo "Compiling staking contracts..."
compile_contract "staked-aztec-token" "$CONTRACTS_DIR/staked-aztec-token" "staked_aztec_token-StakedAztecToken.json"
compile_contract "liquid-staking-core" "$CONTRACTS_DIR/liquid-staking-core" "liquid_staking_core-LiquidStakingCore.json"
compile_contract "withdrawal-queue" "$CONTRACTS_DIR/withdrawal-queue" "withdrawal_queue-WithdrawalQueue.json"

# Compile local token contract for AZTEC
echo "Compiling token contract..."
compile_token_contract

start_sandbox
require_node

echo "Importing test accounts..."
TEST_ACCOUNTS_JSON=$(wallet import-test-accounts --json | sed -n '/^{/,$p')

echo "Resolving admin + user accounts..."
ADMIN_ADDR=$(printf '%s' "$TEST_ACCOUNTS_JSON" | get_test_account_address "$ADMIN_ALIAS")
USER_ADDR=$(printf '%s' "$TEST_ACCOUNTS_JSON" | get_test_account_address "$USER_ALIAS")

if [ -z "$ADMIN_ADDR" ] || [ -z "$USER_ADDR" ]; then
  ADMIN_ALIAS="local-admin"
  USER_ALIAS="local-user"
  ADMIN_ADDR=$(wallet create-account -a "$ADMIN_ALIAS" -f test0 | get_address_from_output)
  USER_ADDR=$(wallet create-account -a "$USER_ALIAS" -f test1 | get_address_from_output)
fi

echo "Bridging fee juice..."
wallet bridge-fee-juice "$FEE_JUICE_AMOUNT" "$ADMIN_ADDR" --mint --no-wait >/dev/null
wallet bridge-fee-juice "$FEE_JUICE_AMOUNT" "$USER_ADDR" --mint --no-wait >/dev/null

TOKEN_ARTIFACT="$TOKEN_WORKSPACE_TARGET/token_contract-Token.json"
STAKED_ARTIFACT="$AZTEC_LOCAL_DIR/staked-aztec-token/target/staked_aztec_token-StakedAztecToken.json"
QUEUE_ARTIFACT="$AZTEC_LOCAL_DIR/withdrawal-queue/target/withdrawal_queue-WithdrawalQueue.json"
CORE_ARTIFACT="$AZTEC_LOCAL_DIR/liquid-staking-core/target/liquid_staking_core-LiquidStakingCore.json"

echo "Deploying AZTEC token..."
require_node
TOKEN_ADDR=$(wallet deploy "$TOKEN_ARTIFACT" --args "$ADMIN_ADDR" "$TOKEN_NAME" "$TOKEN_SYMBOL" 18 -f "$ADMIN_ALIAS" --timeout "$DEPLOY_TIMEOUT" --json | get_address_from_output)

echo "Minting AZTEC to user..."
wallet send mint_to_public -ca "$TOKEN_ADDR" --args "$USER_ADDR" "$DEPOSIT_AMOUNT" -f "$ADMIN_ALIAS" >/dev/null

echo "Deploying staking contracts..."
STAKED_ADDR=$(wallet deploy "$STAKED_ARTIFACT" --args "$ADMIN_ADDR" -f "$ADMIN_ALIAS" --timeout "$DEPLOY_TIMEOUT" --json | get_address_from_output)
QUEUE_ADDR=$(wallet deploy "$QUEUE_ARTIFACT" --args "$ADMIN_ADDR" "$UNBONDING_PERIOD" -f "$ADMIN_ALIAS" --timeout "$DEPLOY_TIMEOUT" --json | get_address_from_output)
CORE_ADDR=$(wallet deploy "$CORE_ARTIFACT" --args "$ADMIN_ADDR" "$ADMIN_ADDR" 1000 -f "$ADMIN_ALIAS" --timeout "$DEPLOY_TIMEOUT" --json | get_address_from_output)

echo "Wiring contract references..."
wallet send set_liquid_staking_core -ca "$STAKED_ADDR" --args "$CORE_ADDR" -f "$ADMIN_ALIAS" >/dev/null
wallet send set_liquid_staking_core -ca "$QUEUE_ADDR" --args "$CORE_ADDR" -f "$ADMIN_ALIAS" >/dev/null
wallet send set_aztec_token -ca "$QUEUE_ADDR" --args "$TOKEN_ADDR" -f "$ADMIN_ALIAS" >/dev/null
wallet send set_staked_aztec_token -ca "$CORE_ADDR" --args "$STAKED_ADDR" -f "$ADMIN_ALIAS" >/dev/null
wallet send set_withdrawal_queue -ca "$CORE_ADDR" --args "$QUEUE_ADDR" -f "$ADMIN_ALIAS" >/dev/null
wallet send set_aztec_token -ca "$CORE_ADDR" --args "$TOKEN_ADDR" -f "$ADMIN_ALIAS" >/dev/null

echo "Authorizing transfer_in_public for deposit..."
wallet authorize-action transfer_in_public "$CORE_ADDR" -ca "$TOKEN_ADDR" \
  --args "$USER_ADDR" "$CORE_ADDR" "$DEPOSIT_AMOUNT" "$DEPOSIT_NONCE" -f "$USER_ALIAS" >/dev/null

echo "Depositing..."
wallet send deposit -ca "$CORE_ADDR" --args "$DEPOSIT_AMOUNT" "$DEPOSIT_NONCE" -f "$USER_ALIAS" >/dev/null

NOW_TS=$(date +%s)
echo "Requesting withdrawal..."
wallet send request_withdrawal -ca "$CORE_ADDR" --args "$DEPOSIT_AMOUNT" "$NOW_TS" -f "$USER_ALIAS" >/dev/null

echo "Funding withdrawal queue..."
wallet authorize-action transfer_in_public "$QUEUE_ADDR" -ca "$TOKEN_ADDR" \
  --args "$ADMIN_ADDR" "$QUEUE_ADDR" "$DEPOSIT_AMOUNT" "$FUND_NONCE" -f "$ADMIN_ALIAS" >/dev/null

wallet send fund_withdrawals -ca "$QUEUE_ADDR" --args "$DEPOSIT_AMOUNT" "$FUND_NONCE" -f "$ADMIN_ALIAS" >/dev/null

CLAIM_TS=$((NOW_TS + UNBONDING_PERIOD + 1))
echo "Claiming withdrawal..."
wallet send claim_withdrawal -ca "$QUEUE_ADDR" --args 0 "$CLAIM_TS" -f "$USER_ALIAS" >/dev/null

echo "Local E2E completed."
