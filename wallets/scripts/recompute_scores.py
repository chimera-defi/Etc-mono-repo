#!/usr/bin/env python3
"""Recompute score totals in wallet scoring breakdown tables.

This updates totals in:
- wallets/SOFTWARE_WALLETS_DETAILS.md
- wallets/HARDWARE_WALLETS_DETAILS.md
"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

SOFTWARE_FILE = ROOT / "wallets" / "SOFTWARE_WALLETS_DETAILS.md"
HARDWARE_FILE = ROOT / "wallets" / "HARDWARE_WALLETS_DETAILS.md"

SOFTWARE_HEADER = "| Wallet | Score | Core | Stability | DevExp | Activity | FOSS | Security | Notes |"
HARDWARE_HEADER = "| Wallet | Security (25) | Transparency (20) | Privacy (15) | Activity (15) | Company (15) | UX (10) | Total |"

SCORE_NUMBER_RE = re.compile(r"(\d+)")


def parse_fraction(cell: str) -> int:
    """Extract the numerator from a fraction like 25/25, else 0."""
    match = SCORE_NUMBER_RE.search(cell)
    return int(match.group(1)) if match else 0


def update_software_scores(text: str) -> tuple[str, int]:
    if SOFTWARE_HEADER not in text:
        return text, 0
    lines = text.splitlines()
    updated = 0
    in_table = False
    for idx, line in enumerate(lines):
        if line.strip() == SOFTWARE_HEADER:
            in_table = True
            continue
        if in_table:
            if not line.startswith("|"):
                in_table = False
                continue
            cells = [c.strip() for c in line.strip().strip("|").split("|")]
            if len(cells) < 9:
                continue
            score_cell = cells[1]
            total = sum(parse_fraction(c) for c in cells[2:8])
            if total == 0:
                continue
            score_match = SCORE_NUMBER_RE.search(score_cell)
            if not score_match:
                continue
            current = int(score_match.group(1))
            if current != total:
                new_score_cell = SCORE_NUMBER_RE.sub(str(total), score_cell, count=1)
                cells[1] = new_score_cell
                lines[idx] = "| " + " | ".join(cells) + " |"
                updated += 1
    return "\n".join(lines), updated


def update_hardware_scores(text: str) -> tuple[str, int]:
    if HARDWARE_HEADER not in text:
        return text, 0
    lines = text.splitlines()
    updated = 0
    in_table = False
    for idx, line in enumerate(lines):
        if line.strip() == HARDWARE_HEADER:
            in_table = True
            continue
        if in_table:
            if not line.startswith("|"):
                in_table = False
                continue
            cells = [c.strip() for c in line.strip().strip("|").split("|")]
            if len(cells) < 8:
                continue
            total = sum(parse_fraction(c) for c in cells[1:7])
            if total == 0:
                continue
            total_cell = cells[7]
            match = SCORE_NUMBER_RE.search(total_cell)
            if not match:
                continue
            current = int(match.group(1))
            if current != total:
                new_total = SCORE_NUMBER_RE.sub(str(total), total_cell, count=1)
                cells[7] = new_total
                lines[idx] = "| " + " | ".join(cells) + " |"
                updated += 1
    return "\n".join(lines), updated


def main() -> int:
    software_text = SOFTWARE_FILE.read_text()
    hardware_text = HARDWARE_FILE.read_text()

    software_text, software_updates = update_software_scores(software_text)
    hardware_text, hardware_updates = update_hardware_scores(hardware_text)

    if software_updates:
        SOFTWARE_FILE.write_text(software_text)
    if hardware_updates:
        HARDWARE_FILE.write_text(hardware_text)

    print(f"Updated software scores: {software_updates}")
    print(f"Updated hardware scores: {hardware_updates}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
