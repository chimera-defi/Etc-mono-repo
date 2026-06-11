#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  orbit-preflight-check.sh --pack-dir <dir> [--platforms-file <file>] [--strict]

Examples:
  ./scripts/orbit-preflight-check.sh --pack-dir ideas/orbit-pilot/wave1/walletradar
  ./scripts/orbit-preflight-check.sh --pack-dir ideas/orbit-pilot/wave2/idea-validation-bot --strict
EOF
}

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PACK_DIR=""
PLATFORMS_FILE=""
STRICT=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --pack-dir)
      PACK_DIR="$2"
      shift 2
      ;;
    --platforms-file)
      PLATFORMS_FILE="$2"
      shift 2
      ;;
    --strict)
      STRICT=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "error: unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$PACK_DIR" ]]; then
  echo "error: --pack-dir is required" >&2
  usage
  exit 1
fi

if [[ "$PACK_DIR" = /* ]]; then
  PACK_DIR_ABS="$PACK_DIR"
else
  PACK_DIR_ABS="$ROOT_DIR/$PACK_DIR"
fi
PACK_DIR_ABS="$(cd "$PACK_DIR_ABS" && pwd)"

LAUNCH_FILE="$PACK_DIR_ABS/launch.yaml"
if [[ ! -f "$LAUNCH_FILE" ]]; then
  echo "error: launch file not found: $LAUNCH_FILE" >&2
  exit 1
fi

if [[ -z "$PLATFORMS_FILE" ]]; then
  PLATFORMS_FILE="$(ls "$PACK_DIR_ABS"/platforms*.yaml 2>/dev/null | head -n 1 || true)"
  if [[ -z "$PLATFORMS_FILE" ]]; then
    echo "error: no platforms*.yaml found in $PACK_DIR_ABS (or pass --platforms-file)" >&2
    exit 1
  fi
elif [[ "$PLATFORMS_FILE" != /* ]]; then
  PLATFORMS_FILE="$ROOT_DIR/$PLATFORMS_FILE"
fi

if ! command -v orbit >/dev/null 2>&1; then
  echo "error: 'orbit' CLI not found in PATH. Install in apps/orbit-pilot first." >&2
  echo "hint: cd apps/orbit-pilot && pip install -e \".[dev]\"" >&2
  exit 1
fi

echo "Preflight check"
echo "pack: $PACK_DIR_ABS"
echo "launch: $LAUNCH_FILE"
echo "platforms: $PLATFORMS_FILE"
echo

python3 - "$LAUNCH_FILE" "$PLATFORMS_FILE" "$STRICT" <<'PY'
import os
import sys
from pathlib import Path
import yaml

launch_path = Path(sys.argv[1])
platforms_path = Path(sys.argv[2])
strict = sys.argv[3].lower() == "true"

launch = yaml.safe_load(launch_path.read_text(encoding="utf-8")) or {}
platforms_doc = yaml.safe_load(platforms_path.read_text(encoding="utf-8")) or {}
rows = platforms_doc.get("platforms") or []

publish = launch.get("publish") or {}

token_map = {
    "github": ("GITHUB_TOKEN", ("github", "repo")),
    "dev": ("DEVTO_API_KEY", None),
    "medium": ("MEDIUM_TOKEN", ("medium", "author_id")),
    "linkedin": ("LINKEDIN_ACCESS_TOKEN", ("linkedin", "author")),
    "x": ("X_ACCESS_TOKEN", None),
}


def looks_placeholder(value: object) -> bool:
    if value is None:
        return True
    if not isinstance(value, str):
        return False
    normalized = value.strip().lower()
    if not normalized:
        return True
    markers = ("replace-", "<", "tbd", "todo", "your-", "example")
    return any(marker in normalized for marker in markers)

errors: list[str] = []
warnings: list[str] = []
info: list[str] = []

for key in ("product_name", "website_url", "tagline", "summary"):
    value = launch.get(key)
    if not isinstance(value, str) or not value.strip():
        errors.append(f"launch.yaml missing required value: {key}")

for row in rows:
    slug = row.get("slug", "<unknown>")
    mode = str(row.get("mode", ""))
    token_req = token_map.get(slug)
    if not token_req:
        continue

    env_var, publish_path = token_req
    has_token = bool(os.environ.get(env_var))
    has_publish_field = True
    publish_is_placeholder = False
    if publish_path:
        parent = publish.get(publish_path[0]) or {}
        field_value = parent.get(publish_path[1])
        publish_is_placeholder = looks_placeholder(field_value)
        has_publish_field = bool(field_value) and not publish_is_placeholder

    if mode == "official_api":
        if not has_token:
            errors.append(f"{slug}: missing required env var {env_var} for mode={mode}")
        if not has_publish_field:
            if publish_is_placeholder:
                errors.append(
                    f"{slug}: launch.yaml publish.{publish_path[0]}.{publish_path[1]} is placeholder"
                )
            else:
                errors.append(
                    f"{slug}: launch.yaml missing publish.{publish_path[0]}.{publish_path[1]}"
                )
    elif "official_api_if" in mode:
        if not has_token:
            warnings.append(f"{slug}: missing optional env var {env_var} ({mode}, will fallback/manual)")
        if publish_path and not has_publish_field:
            if publish_is_placeholder:
                warnings.append(
                    f"{slug}: optional launch field publish.{publish_path[0]}.{publish_path[1]} is placeholder"
                )
            else:
                warnings.append(
                    f"{slug}: missing optional launch field publish.{publish_path[0]}.{publish_path[1]}"
                )
    else:
        info.append(f"{slug}: mode={mode} (no API credential precheck)")

print("checked rows:", len(rows))
if info:
    print("\ninfo:")
    for msg in info:
        print("-", msg)
if warnings:
    print("\nwarnings:")
    for msg in warnings:
        print("-", msg)
if errors:
    print("\nerrors:")
    for msg in errors:
        print("-", msg)

if errors:
    raise SystemExit(2)
if strict and warnings:
    raise SystemExit(3)
print("\npreflight: OK")
PY
