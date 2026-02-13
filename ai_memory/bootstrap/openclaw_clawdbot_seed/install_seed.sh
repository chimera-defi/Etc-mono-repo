#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 /path/to/new/workspace"
  exit 1
fi

TARGET="$1"
SEED_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

mkdir -p "$TARGET"
mkdir -p "$TARGET/memory"

cp "$SEED_DIR/AGENTS.md" "$TARGET/AGENTS.md"
cp "$SEED_DIR/SOUL.md" "$TARGET/SOUL.md"
cp "$SEED_DIR/IDENTITY.md" "$TARGET/IDENTITY.md"
cp "$SEED_DIR/USER.md" "$TARGET/USER.md"
cp "$SEED_DIR/TOOLS.md" "$TARGET/TOOLS.md"
cp "$SEED_DIR/HEARTBEAT.md" "$TARGET/HEARTBEAT.md"
cp "$SEED_DIR/MEMORY.md" "$TARGET/MEMORY.md"
cp "$SEED_DIR"/memory/*.md "$TARGET/memory/"

echo "Seed installed to: $TARGET"
echo "Next: set runtime secrets/tokens manually per ai_memory runtime backup docs."
