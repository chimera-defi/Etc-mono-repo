#!/usr/bin/env bash
set -euo pipefail

MONAD_BFT_DIR=${1:-"$HOME/monad-bft"}

if [[ ! -d "$MONAD_BFT_DIR" ]]; then
  echo "monad-bft not found at $MONAD_BFT_DIR" >&2
  echo "Clone it first: git clone https://github.com/category-labs/monad-bft $MONAD_BFT_DIR" >&2
  exit 1
fi

cd "$MONAD_BFT_DIR/docker/single-node"

if [[ ! -x nets/run.sh ]]; then
  echo "nets/run.sh not found; check monad-bft checkout" >&2
  exit 1
fi

./nets/run.sh
