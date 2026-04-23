#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/common.sh"

require_git_repo || exit 2

branch="$(git rev-parse --abbrev-ref HEAD)"
changes="$(git status --porcelain)"

echo "branch: $branch"

if [[ "$branch" == "main" || "$branch" == "master" ]]; then
  echo "fail: branch is $branch; create a feature branch before opening a PR" >&2
  exit 3
fi

if [[ -z "$changes" ]]; then
  echo "fail: no local changes to commit" >&2
  exit 4
fi

echo "changed files:"
git status --short

echo
echo "ready checklist:"
echo "- branch is not main/master"
echo "- local changes exist"
echo "- next: git add -A && git commit && git push && open PR"
