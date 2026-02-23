#!/usr/bin/env bash
set -euo pipefail

# stack-cli.sh — unified command dispatcher for all stacks
#
# Purpose: provide a single entry point for stack operations (bootstrap, status, etc.)
# Dispatches to stack-specific implementations based on STACK_NAME env var or --stack arg.
#
# Usage:
#   stack-cli.sh [--stack=NAME] COMMAND [ARGS...]
#   stack-cli.sh --help
#
# Examples:
#   stack-cli.sh --stack=aztec bootstrap --with-firewall
#   stack-cli.sh --stack=monad status --json
#   stack-cli.sh status  (auto-detect stack or prompt)

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SCRIPTS_DIR="$REPO_ROOT/scripts/stack-ops"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log_info()  { echo -e "${GREEN}[INFO]${NC} $*" >&2; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $*" >&2; }
log_error() { echo -e "${RED}[ERROR]${NC} $*" >&2; }

# Detect stack name
detect_stack() {
  # Check env var first
  if [[ -n "${STACK_NAME:-}" ]]; then
    echo "$STACK_NAME"
    return 0
  fi

  # Check systemd units
  for stack in aztec monad ethereum; do
    case "$stack" in
      aztec)
        if systemctl list-unit-files 2>/dev/null | grep -q "aztec-node.service"; then
          echo "aztec"
          return 0
        fi
        ;;
      monad)
        if systemctl list-unit-files 2>/dev/null | grep -q "monad-validator.service"; then
          echo "monad"
          return 0
        fi
        ;;
      ethereum)
        if systemctl list-unit-files 2>/dev/null | grep -qE "(eth1|execution|consensus).service"; then
          echo "ethereum"
          return 0
        fi
        ;;
    esac
  done

  return 1
}

usage() {
  cat <<EOF
Usage: $(basename "$0") [--stack=NAME] COMMAND [ARGS...]

Unified command dispatcher for all stacks (Ethereum, Aztec, Monad, MegaETH).

Options:
  --stack=NAME       Target stack (aztec, monad, ethereum, megaeth)
  --help             Show this help

Commands (common across all stacks):
  bootstrap [FLAGS]     Full initial setup
  preflight [FLAGS]     Validate environment
  smoke [FLAGS]         Quick health check
  status [FLAGS]        Report service state
  start [FLAGS]         Start service
  stop [FLAGS]          Stop service
  logs [FLAGS]          Tail service logs

If --stack is not specified, will attempt to auto-detect from systemd units.
If auto-detection fails, prompts user to specify.

Examples:
  $(basename "$0") --stack=aztec bootstrap --with-firewall
  $(basename "$0") --stack=monad status --json
  $(basename "$0") status  (auto-detect)

EOF
}

# Parse arguments
STACK_NAME="${STACK_NAME:-}"
COMMAND=""
declare -a CMD_ARGS=()

for arg in "$@"; do
  if [[ "$arg" == "--stack="* ]]; then
    STACK_NAME="${arg#--stack=}"
  elif [[ "$arg" == "--help" ]] || [[ "$arg" == "-h" ]]; then
    usage
    exit 0
  elif [[ -z "$COMMAND" ]]; then
    COMMAND="$arg"
  else
    CMD_ARGS+=("$arg")
  fi
done

if [[ -z "$COMMAND" ]]; then
  log_error "No command specified"
  usage
  exit 2
fi

# Auto-detect if needed
if [[ -z "$STACK_NAME" ]]; then
  log_warn "Stack not specified via --stack, attempting auto-detect..."
  if STACK_NAME=$(detect_stack); then
    log_info "Auto-detected stack: $STACK_NAME"
  else
    log_error "Could not auto-detect stack. Please specify --stack=NAME"
    echo ""
    echo "Available stacks:"
    echo "  --stack=ethereum"
    echo "  --stack=aztec"
    echo "  --stack=monad"
    echo "  --stack=megaeth"
    exit 1
  fi
fi

# Validate stack name
case "$STACK_NAME" in
  aztec|monad|ethereum|megaeth) ;;
  *)
    log_error "Unknown stack: $STACK_NAME"
    exit 2
    ;;
esac

# Helper function to find script with fallback patterns
find_script() {
  local stack="$1"
  local cmd="$2"
  local base_dir="$3"
  local FOUND_SCRIPT=""

  # Try exact command
  [[ -f "$base_dir/${cmd}.sh" ]] && FOUND_SCRIPT="$base_dir/${cmd}.sh" && echo "$FOUND_SCRIPT" && return 0

  # Try command with stack suffix
  [[ -f "$base_dir/${cmd}_${stack}.sh" ]] && FOUND_SCRIPT="$base_dir/${cmd}_${stack}.sh" && echo "$FOUND_SCRIPT" && return 0

  # Try with underscore prefix (e.g., smoke -> e2e_smoke_test.sh)
  case "$cmd" in
    smoke)
      [[ -f "$base_dir/e2e_smoke_test.sh" ]] && FOUND_SCRIPT="$base_dir/e2e_smoke_test.sh" && echo "$FOUND_SCRIPT" && return 0
      [[ -f "$base_dir/smoke_test.sh" ]] && FOUND_SCRIPT="$base_dir/smoke_test.sh" && echo "$FOUND_SCRIPT" && return 0
      ;;
    preflight)
      [[ -f "$base_dir/preflight_check.sh" ]] && FOUND_SCRIPT="$base_dir/preflight_check.sh" && echo "$FOUND_SCRIPT" && return 0
      ;;
    status)
      [[ -f "$base_dir/status.sh" ]] && FOUND_SCRIPT="$base_dir/status.sh" && echo "$FOUND_SCRIPT" && return 0
      [[ -f "$base_dir/status_${stack}.sh" ]] && FOUND_SCRIPT="$base_dir/status_${stack}.sh" && echo "$FOUND_SCRIPT" && return 0
      ;;
    check)
      [[ -f "$base_dir/check_${stack}_node.sh" ]] && FOUND_SCRIPT="$base_dir/check_${stack}_node.sh" && echo "$FOUND_SCRIPT" && return 0
      [[ -f "$base_dir/check_rpc.sh" ]] && FOUND_SCRIPT="$base_dir/check_rpc.sh" && echo "$FOUND_SCRIPT" && return 0
      ;;
  esac

  return 1
}

# Route to stack-specific implementation
case "$STACK_NAME" in
  aztec)
    IMPL_DIR="$REPO_ROOT/staking/aztec/infra/scripts"
    IMPL_SCRIPT=$(find_script "aztec" "$COMMAND" "$IMPL_DIR" || echo "")
    ;;
  monad)
    IMPL_DIR="$REPO_ROOT/staking/monad/infra/scripts"
    IMPL_SCRIPT=$(find_script "monad" "$COMMAND" "$IMPL_DIR" || echo "")
    ;;
  ethereum)
    # eth2-quickstart expected as sibling of repo root
    ETH_ROOT="${ETH2_QUICKSTART_PATH:-$REPO_ROOT/../eth2-quickstart}"
    IMPL_DIR="$ETH_ROOT/scripts"
    if [[ ! -d "$ETH_ROOT" ]]; then
      log_error "Ethereum (eth2-quickstart) repository not found."
      log_error "Expected path: $ETH_ROOT"
      log_error "To fix: clone into a sibling directory of the repo root:"
      log_error "  git clone https://github.com/chimera-defi/eth2-quickstart"
      log_error "Or set ETH2_QUICKSTART_PATH to the clone path."
      log_error "Note: Ethereum integration is partial (P1 task for full unification)."
      exit 1
    fi
    if [[ ! -d "$IMPL_DIR" ]]; then
      IMPL_DIR="$ETH_ROOT"
    fi
    IMPL_SCRIPT=$(find_script "ethereum" "$COMMAND" "$IMPL_DIR" || echo "")
    ;;
  megaeth)
    IMPL_DIR="$REPO_ROOT/staking/megaeth/infra/scripts"
    if [[ ! -d "$IMPL_DIR" ]]; then
      log_error "MegaETH setup not yet integrated (directory not found: $IMPL_DIR)"
      exit 1
    fi
    IMPL_SCRIPT=$(find_script "megaeth" "$COMMAND" "$IMPL_DIR" || echo "")
    ;;
esac

if [[ -z "$IMPL_SCRIPT" ]] || [[ ! -f "$IMPL_SCRIPT" ]]; then
  log_error "Command '${COMMAND}' not found for stack '${STACK_NAME}'."
  log_error "Tried patterns: ${COMMAND}.sh, ${COMMAND}_${STACK_NAME}.sh, and stack-specific variants"
  log_error "Check COMMAND_CONTRACT.md for implementation status."
  exit 2
fi

if [[ ! -x "$IMPL_SCRIPT" ]]; then
  chmod +x "$IMPL_SCRIPT"
fi

# Execute
log_info "Running: ${COMMAND} (stack=${STACK_NAME})"
exec "$IMPL_SCRIPT" "${CMD_ARGS[@]+"${CMD_ARGS[@]}"}"
