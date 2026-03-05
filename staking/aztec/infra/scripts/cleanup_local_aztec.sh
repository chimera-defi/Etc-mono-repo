#!/usr/bin/env bash
set -euo pipefail
# Local Aztec/Blockchain Cleanup Script
#
# Cleans local Aztec test data and optionally broader blockchain-related Docker
# containers/images from local test runs.
#
# Usage:
#   cleanup_local_aztec.sh [--yes] [--dry-run] [--include-blockchain] [--help]

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log_info()  { echo -e "${GREEN}[INFO]${NC} $*" >&2; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $*" >&2; }
log_error() { echo -e "${RED}[ERROR]${NC} $*" >&2; }

CONFIRM=false
DRY_RUN=false
INCLUDE_BLOCKCHAIN=false

usage() {
  cat <<EOF
Usage: $(basename "$0") [--yes] [--dry-run] [--include-blockchain] [--help]

Cleanup local Aztec runtime artifacts.

Options:
  --yes                 Apply cleanup without interactive confirmation
  --dry-run             Show what would be removed/stopped without changing anything
  --include-blockchain  Also clean non-Aztec blockchain test containers/images
  --help                Show this help

Default behavior:
  1) Remove /root/.aztec/mainnet and /root/.aztec/testnet if present
  2) Stop/remove Aztec-related Docker containers
  3) Remove Aztec-related Docker images

Examples:
  $(basename "$0") --dry-run
  $(basename "$0") --yes
  $(basename "$0") --yes --include-blockchain
EOF
}

for arg in "$@"; do
  case "$arg" in
    --help|-h) usage; exit 0 ;;
    --yes) CONFIRM=true ;;
    --dry-run) DRY_RUN=true ;;
    --include-blockchain) INCLUDE_BLOCKCHAIN=true ;;
    *) log_error "Unknown argument: $arg"; usage; exit 2 ;;
  esac
done

if ! command -v docker >/dev/null 2>&1; then
  log_error "docker is required but not found in PATH"
  exit 1
fi

DATA_DIRS=(/root/.aztec/mainnet /root/.aztec/testnet)

if [[ "$INCLUDE_BLOCKCHAIN" == "true" ]]; then
  CONTAINER_PATTERN='aztec|anvil|geth|reth|erigon|nethermind|besu|ganache|hardhat|foundry|monad|op-node|op-geth|beacon|lighthouse|prysm|teku|e2e-phase|debug-nimbus'
  IMAGE_PATTERN='aztec|anvil|geth|reth|erigon|nethermind|besu|ganache|hardhat|foundry|monad|op-node|op-geth|beacon|lighthouse|prysm|teku'
else
  CONTAINER_PATTERN='aztec'
  IMAGE_PATTERN='aztec'
fi

mapfile -t CONTAINERS < <(docker ps -a --format '{{.ID}}\t{{.Names}}\t{{.Image}}\t{{.Status}}' | rg -i "$CONTAINER_PATTERN" || true)
mapfile -t IMAGES < <(docker image ls --format '{{.Repository}}:{{.Tag}}\t{{.ID}}\t{{.Size}}' | rg -i "$IMAGE_PATTERN" || true)

log_info "Planned cleanup summary:"
for d in "${DATA_DIRS[@]}"; do
  if [[ -d "$d" ]]; then
    size=$(du -sh "$d" 2>/dev/null | awk '{print $1}')
    echo "  data dir: $d ($size)"
  fi
done

if [[ ${#CONTAINERS[@]} -gt 0 ]]; then
  echo "  containers (${#CONTAINERS[@]}):"
  printf '    %s\n' "${CONTAINERS[@]}"
else
  echo "  containers: none matched"
fi

if [[ ${#IMAGES[@]} -gt 0 ]]; then
  echo "  images (${#IMAGES[@]}):"
  printf '    %s\n' "${IMAGES[@]}"
else
  echo "  images: none matched"
fi

if [[ "$DRY_RUN" == "true" ]]; then
  log_info "Dry-run only. No changes applied."
  exit 0
fi

if [[ "$CONFIRM" != "true" ]]; then
  echo -n "Proceed with cleanup? [y/N]: "
  read -r answer
  case "$answer" in
    y|Y|yes|YES) ;;
    *) log_warn "Cancelled."; exit 0 ;;
  esac
fi

# Remove data directories
for d in "${DATA_DIRS[@]}"; do
  if [[ -d "$d" ]]; then
    log_info "Removing $d"
    rm -r "$d"
  fi
done

# Stop + remove containers
if [[ ${#CONTAINERS[@]} -gt 0 ]]; then
  mapfile -t CONTAINER_IDS < <(printf '%s\n' "${CONTAINERS[@]}" | awk -F'\t' '{print $1}')
  log_info "Stopping matched containers..."
  docker stop "${CONTAINER_IDS[@]}" >/dev/null 2>&1 || true
  log_info "Removing matched containers..."
  docker rm "${CONTAINER_IDS[@]}" >/dev/null 2>&1 || true
fi

# Remove images
if [[ ${#IMAGES[@]} -gt 0 ]]; then
  mapfile -t IMAGE_IDS < <(printf '%s\n' "${IMAGES[@]}" | awk -F'\t' '{print $2}')
  log_info "Removing matched images..."
  docker image rm "${IMAGE_IDS[@]}" >/dev/null 2>&1 || true
fi

# Cleanup unreferenced Docker artifacts
log_info "Pruning unreferenced Docker artifacts..."
docker system prune -f >/dev/null 2>&1 || true

remaining=$(du -sh /root/.aztec 2>/dev/null | awk '{print $1}')
remaining=${remaining:-0}
log_info "Cleanup complete. /root/.aztec usage: ${remaining}"
