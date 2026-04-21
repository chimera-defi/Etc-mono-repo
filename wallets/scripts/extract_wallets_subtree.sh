#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<USAGE
Usage:
  $(basename "$0") <target_repo_url> [target_branch]

Example:
  $(basename "$0") https://github.com/chimera-defi/walletradar.git main

Optional env:
  PREFIX        Subdirectory prefix to split (default: wallets)
  SPLIT_BRANCH  Name for generated split branch (default: split/wallets-<timestamp>)
USAGE
}

if [[ $# -lt 1 ]]; then
  usage
  exit 1
fi

TARGET_REPO_URL="$1"
TARGET_BRANCH="${2:-main}"
PREFIX="${PREFIX:-wallets}"
SPLIT_BRANCH="${SPLIT_BRANCH:-split/wallets-$(date +%Y%m%d%H%M%S)}"

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "Error: run this inside a git repository." >&2
  exit 1
fi

if [[ ! -d "$PREFIX" ]]; then
  echo "Error: prefix '$PREFIX' not found." >&2
  exit 1
fi

# Remove prior split branch if it exists
if git show-ref --verify --quiet "refs/heads/$SPLIT_BRANCH"; then
  git branch -D "$SPLIT_BRANCH" >/dev/null
fi

echo "Creating split branch '$SPLIT_BRANCH' from prefix '$PREFIX'..."
git subtree split --prefix="$PREFIX" -b "$SPLIT_BRANCH" >/dev/null

SPLIT_SHA="$(git rev-parse "$SPLIT_BRANCH")"

echo
 echo "Split complete"
 echo "  branch: $SPLIT_BRANCH"
 echo "  commit: $SPLIT_SHA"
 echo
 echo "Push command:"
 echo "  git push $TARGET_REPO_URL $SPLIT_BRANCH:$TARGET_BRANCH"
 echo
 echo "After push, verify by cloning:"
 echo "  git clone $TARGET_REPO_URL /tmp/wallets-standalone-check"
 echo "  cd /tmp/wallets-standalone-check && git log --oneline -n 20"
 echo
 echo "Then apply monorepo stub using wallets/STUB_README_TEMPLATE.md"
