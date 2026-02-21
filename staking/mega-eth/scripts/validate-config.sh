#!/bin/bash
# MegaETH Configuration Validator

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Counters
ERRORS=0
WARNINGS=0
PASSED=0

echo "✓ MegaETH Configuration Validator"
echo "======================================"
echo ""

# Load environment
set +u
source "$PROJECT_ROOT/.env" 2>/dev/null || {
    echo -e "${RED}Error: .env file not found${NC}"
    exit 1
}
set -u

# Helper functions
pass() {
    echo -e "${GREEN}✅${NC} $1"
    ((PASSED++))
}

error() {
    echo -e "${RED}❌${NC} $1"
    ((ERRORS++))
}

warn() {
    echo -e "${YELLOW}⚠️ ${NC} $1"
    ((WARNINGS++))
}

info() {
    echo -e "${BLUE}ℹ️ ${NC} $1"
}

# Validation rules

echo "1️⃣  Network Configuration"
echo "------------------------------------"

# Check RPC_URL
if [ -z "${RPC_URL:-}" ]; then
    warn "RPC_URL not set (will use default)"
else
    if [[ "$RPC_URL" =~ ^https?:// ]]; then
        pass "RPC_URL format valid"
    else
        error "RPC_URL invalid format: $RPC_URL"
    fi
fi

# Check CHAIN_ID
if [ -z "${CHAIN_ID:-}" ]; then
    error "CHAIN_ID must be set"
else
    case $CHAIN_ID in
        1337) pass "CHAIN_ID valid (Local: 1337)" ;;
        5) pass "CHAIN_ID valid (Goerli: 5)" ;;
        11155111) pass "CHAIN_ID valid (Sepolia: 11155111)" ;;
        1) warn "CHAIN_ID is mainnet (1) - use with caution" ;;
        *) warn "CHAIN_ID unknown: $CHAIN_ID (may be custom)" ;;
    esac
fi

echo ""
echo "2️⃣  Staking Parameters"
echo "------------------------------------"

# Check MIN_STAKE_AMOUNT
if [ -z "${MIN_STAKE_AMOUNT:-}" ]; then
    error "MIN_STAKE_AMOUNT must be set"
elif ! [[ "$MIN_STAKE_AMOUNT" =~ ^[0-9]+$ ]]; then
    error "MIN_STAKE_AMOUNT must be numeric: $MIN_STAKE_AMOUNT"
elif [ "$MIN_STAKE_AMOUNT" -lt 1 ] || [ "$MIN_STAKE_AMOUNT" -gt 1000 ]; then
    warn "MIN_STAKE_AMOUNT outside typical range (1-1000): $MIN_STAKE_AMOUNT ETH"
else
    pass "MIN_STAKE_AMOUNT valid: $MIN_STAKE_AMOUNT ETH"
fi

# Check MAX_STAKE_AMOUNT
if [ -z "${MAX_STAKE_AMOUNT:-}" ]; then
    error "MAX_STAKE_AMOUNT must be set"
elif ! [[ "$MAX_STAKE_AMOUNT" =~ ^[0-9]+$ ]]; then
    error "MAX_STAKE_AMOUNT must be numeric: $MAX_STAKE_AMOUNT"
elif [ "$MAX_STAKE_AMOUNT" -lt "$MIN_STAKE_AMOUNT" ]; then
    error "MAX_STAKE_AMOUNT ($MAX_STAKE_AMOUNT) < MIN_STAKE_AMOUNT ($MIN_STAKE_AMOUNT)"
else
    pass "MAX_STAKE_AMOUNT valid: $MAX_STAKE_AMOUNT ETH"
fi

# Check QUEUE_TIMEOUT_SECONDS
if [ -z "${QUEUE_TIMEOUT_SECONDS:-}" ]; then
    warn "QUEUE_TIMEOUT_SECONDS not set (using default)"
elif ! [[ "$QUEUE_TIMEOUT_SECONDS" =~ ^[0-9]+$ ]]; then
    error "QUEUE_TIMEOUT_SECONDS must be numeric"
elif [ "$QUEUE_TIMEOUT_SECONDS" -lt 3600 ]; then
    warn "QUEUE_TIMEOUT_SECONDS < 1 hour: $QUEUE_TIMEOUT_SECONDS seconds"
else
    pass "QUEUE_TIMEOUT_SECONDS valid: $((QUEUE_TIMEOUT_SECONDS / 86400)) days"
fi

echo ""
echo "3️⃣  Fee Structure (Basis Points)"
echo "------------------------------------"

# Check PROTOCOL_FEE_BPS
if [ -z "${PROTOCOL_FEE_BPS:-}" ]; then
    error "PROTOCOL_FEE_BPS must be set"
elif ! [[ "$PROTOCOL_FEE_BPS" =~ ^[0-9]+$ ]]; then
    error "PROTOCOL_FEE_BPS must be numeric"
elif [ "$PROTOCOL_FEE_BPS" -gt 5000 ]; then
    error "PROTOCOL_FEE_BPS unreasonable (>50%): $PROTOCOL_FEE_BPS"
elif [ "$PROTOCOL_FEE_BPS" -gt 1000 ]; then
    warn "PROTOCOL_FEE_BPS high (>10%): $PROTOCOL_FEE_BPS"
else
    pass "PROTOCOL_FEE_BPS valid: $((PROTOCOL_FEE_BPS / 100)).$(printf "%02d" $((PROTOCOL_FEE_BPS % 100)))%"
fi

# Check OPERATOR_FEE_BPS
if [ -z "${OPERATOR_FEE_BPS:-}" ]; then
    warn "OPERATOR_FEE_BPS not set"
elif ! [[ "$OPERATOR_FEE_BPS" =~ ^[0-9]+$ ]]; then
    error "OPERATOR_FEE_BPS must be numeric"
else
    pass "OPERATOR_FEE_BPS valid: $((OPERATOR_FEE_BPS / 100)).$(printf "%02d" $((OPERATOR_FEE_BPS % 100)))%"
fi

# Check TREASURY_FEE_BPS
if [ -z "${TREASURY_FEE_BPS:-}" ]; then
    warn "TREASURY_FEE_BPS not set"
elif ! [[ "$TREASURY_FEE_BPS" =~ ^[0-9]+$ ]]; then
    error "TREASURY_FEE_BPS must be numeric"
else
    pass "TREASURY_FEE_BPS valid: $((TREASURY_FEE_BPS / 100)).$(printf "%02d" $((TREASURY_FEE_BPS % 100)))%"
fi

# Check total fees
TOTAL_FEES=$((${PROTOCOL_FEE_BPS:-0} + ${OPERATOR_FEE_BPS:-0} + ${TREASURY_FEE_BPS:-0}))
if [ "$TOTAL_FEES" -gt 0 ]; then
    if [ "$TOTAL_FEES" -gt 2000 ]; then
        warn "Total fees high (>20%): $((TOTAL_FEES / 100)).$(printf "%02d" $((TOTAL_FEES % 100)))%"
    else
        pass "Total fees reasonable: $((TOTAL_FEES / 100)).$(printf "%02d" $((TOTAL_FEES % 100)))%"
    fi
fi

echo ""
echo "4️⃣  SLA Enforcement"
echo "------------------------------------"

# Check SLA_PENALTY_DOWNTIME_MINUTES
if [ -z "${SLA_PENALTY_DOWNTIME_MINUTES:-}" ]; then
    warn "SLA_PENALTY_DOWNTIME_MINUTES not set"
elif ! [[ "$SLA_PENALTY_DOWNTIME_MINUTES" =~ ^[0-9]+$ ]]; then
    error "SLA_PENALTY_DOWNTIME_MINUTES must be numeric"
else
    pass "SLA_PENALTY_DOWNTIME_MINUTES valid: $SLA_PENALTY_DOWNTIME_MINUTES min"
fi

# Check SLA_PENALTY_BPS
if [ -z "${SLA_PENALTY_BPS:-}" ]; then
    warn "SLA_PENALTY_BPS not set"
elif ! [[ "$SLA_PENALTY_BPS" =~ ^[0-9]+$ ]]; then
    error "SLA_PENALTY_BPS must be numeric"
else
    pass "SLA_PENALTY_BPS valid: $((SLA_PENALTY_BPS / 100)).$(printf "%02d" $((SLA_PENALTY_BPS % 100)))%"
fi

echo ""
echo "5️⃣  Validator Configuration"
echo "------------------------------------"

# Check VALIDATOR_PUBKEY
if [ -z "${VALIDATOR_PUBKEY:-}" ]; then
    error "VALIDATOR_PUBKEY must be set"
elif [[ "$VALIDATOR_PUBKEY" =~ ^0x[0-9a-fA-F]{64}$ ]]; then
    pass "VALIDATOR_PUBKEY format valid"
else
    error "VALIDATOR_PUBKEY format invalid: ${VALIDATOR_PUBKEY:0:20}..."
fi

# Check VALIDATOR_WITHDRAWAL_CREDS
if [ -z "${VALIDATOR_WITHDRAWAL_CREDS:-}" ]; then
    warn "VALIDATOR_WITHDRAWAL_CREDS not set"
elif [[ "$VALIDATOR_WITHDRAWAL_CREDS" =~ ^0x[0-9a-fA-F]{64}$ ]]; then
    pass "VALIDATOR_WITHDRAWAL_CREDS format valid"
else
    warn "VALIDATOR_WITHDRAWAL_CREDS format unexpected: ${VALIDATOR_WITHDRAWAL_CREDS:0:20}..."
fi

echo ""
echo "6️⃣  Summary"
echo "======================================"
echo -e "Passed:  ${GREEN}$PASSED${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"
echo -e "Errors:   ${RED}$ERRORS${NC}"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}❌ Configuration validation FAILED${NC}"
    echo ""
    echo "Please fix the errors above and retry:"
    echo "  nano .env"
    echo "  ./scripts/validate-config.sh"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️ Configuration validation PASSED with warnings${NC}"
    echo ""
    echo "Review warnings above. Configuration should work but may need tuning."
    exit 0
else
    echo -e "${GREEN}✅ Configuration validation PASSED${NC}"
    echo ""
    echo "All checks passed! Configuration is valid."
    exit 0
fi
