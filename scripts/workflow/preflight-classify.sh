#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/common.sh"

if [[ "$#" -eq 0 ]]; then
  echo "usage: $0 <path> [path ...]" >&2
  echo "classifies each path as repo-scoped or machine-scoped"
  exit 1
fi

REPO_ROOT="$(repo_root_or_pwd)"

repo_scoped=0
machine_scoped=0

for input_path in "$@"; do
  abs_path="$(realpath -m "$input_path")"
  if [[ "$abs_path" == "$REPO_ROOT"* ]]; then
    ((repo_scoped+=1))
    echo "repo:    $input_path -> $abs_path"
  else
    ((machine_scoped+=1))
    echo "machine: $input_path -> $abs_path"
  fi
done

echo
echo "summary: repo_scoped=$repo_scoped machine_scoped=$machine_scoped"

if [[ "$repo_scoped" -gt 0 && "$machine_scoped" -gt 0 ]]; then
  echo "mixed scope detected: split work or get explicit user confirmation"
fi
