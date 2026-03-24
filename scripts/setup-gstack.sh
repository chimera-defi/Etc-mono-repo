#!/usr/bin/env bash
# Install gstack skills for Claude Code
# Run once per machine after cloning the repo.
set -euo pipefail

GSTACK_DIR="$HOME/.claude/skills/gstack"

if [ -d "$GSTACK_DIR" ]; then
  echo "gstack already installed at $GSTACK_DIR — upgrading..."
  cd "$GSTACK_DIR" && git pull --ff-only
else
  git clone https://github.com/garrytan/gstack.git "$GSTACK_DIR"
fi

cd "$GSTACK_DIR" && ./setup
echo "gstack ready."
