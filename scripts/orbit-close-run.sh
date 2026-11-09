#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  orbit-close-run.sh --project <slug> --campaign <campaign-id> --run-dir <dir> [--evidence-dir <dir>] [--log-file <file>] [--note <text>] [--append-only]

Examples:
  ./scripts/orbit-close-run.sh \
    --project walletradar-wave1 \
    --campaign walletradar-wave1 \
    --run-dir ~/launches/walletradar-wave1/out/walletradar-wave1/run-2026-04-27 \
    --note "Wave 1 closeout"
EOF
}

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT=""
CAMPAIGN=""
RUN_DIR=""
EVIDENCE_DIR=""
LOG_FILE="$ROOT_DIR/ideas/orbit-pilot/LAUNCH_OPS_LOG.md"
NOTE=""
APPEND_ONLY=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project)
      PROJECT="$2"
      shift 2
      ;;
    --campaign)
      CAMPAIGN="$2"
      shift 2
      ;;
    --run-dir)
      RUN_DIR="$2"
      shift 2
      ;;
    --evidence-dir)
      EVIDENCE_DIR="$2"
      shift 2
      ;;
    --log-file)
      LOG_FILE="$2"
      shift 2
      ;;
    --note)
      NOTE="$2"
      shift 2
      ;;
    --append-only)
      APPEND_ONLY=true
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

if [[ -z "$PROJECT" || -z "$CAMPAIGN" || -z "$RUN_DIR" ]]; then
  echo "error: --project, --campaign, and --run-dir are required" >&2
  usage
  exit 1
fi

if ! command -v orbit >/dev/null 2>&1; then
  echo "error: 'orbit' CLI not found in PATH. Install in apps/orbit-pilot first." >&2
  exit 1
fi

if [[ "$RUN_DIR" != /* ]]; then
  RUN_DIR="$ROOT_DIR/$RUN_DIR"
fi
RUN_DIR="$(cd "$RUN_DIR" && pwd)"

if [[ -z "$EVIDENCE_DIR" ]]; then
  EVIDENCE_DIR="$HOME/launches/$PROJECT/evidence"
fi
mkdir -p "$EVIDENCE_DIR"

if [[ "$LOG_FILE" != /* ]]; then
  LOG_FILE="$ROOT_DIR/$LOG_FILE"
fi

echo "Closing run"
echo "project: $PROJECT"
echo "campaign: $CAMPAIGN"
echo "run_dir: $RUN_DIR"
echo "evidence: $EVIDENCE_DIR"
echo "log_file: $LOG_FILE"
echo

cd "$ROOT_DIR/apps/orbit-pilot"
orbit check-run --run "$RUN_DIR" --json | tee "$EVIDENCE_DIR/check-run.json"
orbit guide --run "$RUN_DIR" --json | tee "$EVIDENCE_DIR/guide.json"
orbit report --run "$RUN_DIR" --json | tee "$EVIDENCE_DIR/report.json"
orbit audit --run "$RUN_DIR" --json | tee "$EVIDENCE_DIR/audit.json"

python3 - "$EVIDENCE_DIR/report.json" "$LOG_FILE" "$PROJECT" "$CAMPAIGN" "$RUN_DIR" "$NOTE" "$APPEND_ONLY" <<'PY'
import json
import sys
from datetime import date
from pathlib import Path

report_path = Path(sys.argv[1])
log_path = Path(sys.argv[2])
project = sys.argv[3]
campaign = sys.argv[4]
run_dir = sys.argv[5]
note = sys.argv[6]
append_only = sys.argv[7].lower() == "true"

report = json.loads(report_path.read_text(encoding="utf-8"))
results = report.get("results") or []
pending = report.get("pending_manual") or []
skipped = report.get("skipped") or []

total = len(results)
pending_count = len(pending)
skipped_count = len(skipped)
completed_count = max(total - pending_count - skipped_count, 0)
status = "completed" if pending_count == 0 else "in_progress"
completed_cell = f"{completed_count}/{total}"
blocked_cell = f"{pending_count + skipped_count} (pending={pending_count}, skipped={skipped_count})"

notes = note.strip()
if notes:
    notes = f"{notes}; evidence={report_path.parent}"
else:
    notes = f"evidence={report_path.parent}"
notes = notes.replace("|", "\\|")

row = (
    f"| {date.today().isoformat()} | {project} | {campaign} | `{run_dir}` | "
    f"{status} | {completed_cell} | {blocked_cell} | {notes} |"
)

if not log_path.exists():
    raise SystemExit(f"log file not found: {log_path}")

def is_campaign_row(line: str, expected_campaign: str) -> bool:
    if not line.strip().startswith("|"):
        return False
    parts = [part.strip() for part in line.strip().split("|")[1:-1]]
    if len(parts) < 8:
        return False
    return parts[2] == expected_campaign

content = log_path.read_text(encoding="utf-8")
lines = content.splitlines()
updated = False
if not append_only:
    for i, line in enumerate(lines):
        if is_campaign_row(line, campaign):
            lines[i] = row
            updated = True
            break

if updated:
    log_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
else:
    with log_path.open("a", encoding="utf-8") as f:
        f.write("\n" + row + "\n")

print("Updated log row:" if updated else "Appended log row:")
print(row)
PY
