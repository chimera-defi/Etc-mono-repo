#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  ./ideas/scripts/export-naming-pack.sh --source <naming-dir> --slug <project-slug> [--out-dir <dir>]

Example:
  ./ideas/scripts/export-naming-pack.sh \
    --source wallets/branding \
    --slug wallet-radar
USAGE
}

SOURCE_DIR=""
SLUG=""
OUT_DIR="ideas/_exports"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --source)
      SOURCE_DIR="$2"
      shift 2
      ;;
    --slug)
      SLUG="$2"
      shift 2
      ;;
    --out-dir)
      OUT_DIR="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$SOURCE_DIR" || -z "$SLUG" ]]; then
  usage
  exit 1
fi

if [[ ! -d "$SOURCE_DIR" ]]; then
  echo "Source directory not found: $SOURCE_DIR" >&2
  exit 1
fi

required_files=(
  "POSITIONING_BRIEF.md"
  "CANDIDATES.txt"
  "NAMING_VALIDATION.md"
  "NAMING_DECISION.md"
)

optional_files=(
  "README.md"
  "NAMING_WORKFLOW.md"
  "SHORTLIST_CANDIDATES.txt"
  "NAMING_VALIDATION_SHORTLIST.md"
  "GITHUB_NAME_SCAN.md"
  "naming-workflow-output.json"
  "naming-workflow-shortlist.json"
)

date_stamp="$(date +%F)"
bundle_name="${SLUG}-naming-pack-${date_stamp}"

temp_dir="$(mktemp -d)"
stage_dir="${temp_dir}/${bundle_name}"
mkdir -p "$stage_dir"

missing_required=0
for file in "${required_files[@]}"; do
  src="${SOURCE_DIR}/${file}"
  if [[ -f "$src" ]]; then
    cp "$src" "$stage_dir/"
  else
    echo "Missing required file: ${src}" >&2
    missing_required=1
  fi
done

if [[ $missing_required -ne 0 ]]; then
  rm -rf "$temp_dir"
  exit 1
fi

for file in "${optional_files[@]}"; do
  src="${SOURCE_DIR}/${file}"
  if [[ -f "$src" ]]; then
    cp "$src" "$stage_dir/"
  fi
done

template_workflow="ideas/_templates/NAMING_WORKFLOW.md"
if [[ -f "$template_workflow" ]]; then
  cp "$template_workflow" "${stage_dir}/_TEMPLATE_NAMING_WORKFLOW.md"
fi

manifest_file="${stage_dir}/MANIFEST.txt"
{
  echo "bundle: ${bundle_name}"
  echo "generated_utc: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "source_dir: ${SOURCE_DIR}"
  echo "included_files:"
  for path in "${stage_dir}"/*; do
    echo "  - $(basename "$path")"
  done
} > "$manifest_file"

checksums_file="${stage_dir}/CHECKSUMS.sha256"
if command -v sha256sum >/dev/null 2>&1; then
  (
    cd "$stage_dir"
    sha256sum -- * > "$checksums_file"
  )
elif command -v shasum >/dev/null 2>&1; then
  (
    cd "$stage_dir"
    shasum -a 256 -- * > "$checksums_file"
  )
fi

mkdir -p "$OUT_DIR"
archive_path="${OUT_DIR}/${bundle_name}.tar.gz"
tar -czf "$archive_path" -C "$temp_dir" "$bundle_name"
rm -rf "$temp_dir"

echo "$archive_path"
