#!/usr/bin/env python3
"""Generate a Google Merchant Center feed from wallet tables.

Notes:
- Pricing is sourced from `wallets/data/merchant_pricing.json`.
- Items without verified pricing are skipped to avoid placeholder values.
"""
from __future__ import annotations

import argparse
import json
import html
import os
import re
import sys
from pathlib import Path
from typing import List, Dict, Any

BASE_URL = os.environ.get("WALLET_BASE_URL", "https://walletradar.org")

TABLE_FILES = {
    "hardware": "wallets/HARDWARE_WALLETS.md",
}
PRICING_FILE = Path("wallets/data/merchant_pricing.json")


def slugify(value: str) -> str:
    value = re.sub(r"\*\*|__", "", value)
    value = re.sub(r"\[[^\]]+\]\([^\)]+\)", lambda m: re.sub(r"\[(.*?)\]\(.*\)", r"\1", m.group(0)), value)
    value = re.sub(r"<[^>]+>", "", value)
    value = re.sub(r"[^a-zA-Z0-9]+", "-", value).strip("-")
    return value.lower()


def clean_cell(value: str) -> str:
    value = re.sub(r"\*\*", "", value)
    value = re.sub(r"\[[^\]]+\]\([^\)]+\)", lambda m: re.sub(r"\[(.*?)\]\(.*\)", r"\1", m.group(0)), value)
    value = re.sub(r"<[^>]+>", "", value)
    value = re.sub(r"\s+", " ", value).strip()
    return value


def parse_table(lines: List[str]) -> List[Dict[str, str]]:
    header_idx = None
    for i, line in enumerate(lines):
        if line.strip().startswith("|") and "|" in line:
            header_idx = i
            break
    if header_idx is None:
        return []

    header = [h.strip() for h in lines[header_idx].strip().strip("|").split("|")]
    rows = []
    for line in lines[header_idx + 2 :]:
        if not line.strip().startswith("|"):
            break
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) != len(header):
            continue
        rows.append({header[i]: clean_cell(cells[i]) for i in range(len(header))})
    return rows


def load_pricing() -> Dict[str, Dict[str, Any]]:
    if not PRICING_FILE.exists():
        return {}
    return json.loads(PRICING_FILE.read_text(encoding="utf-8"))


def build_item(row: Dict[str, str], pricing: Dict[str, Dict[str, Any]]) -> Dict[str, str] | None:
    raw_name = row.get("Wallet") or "Unknown"
    if "~~" in raw_name:
        return None
    name = raw_name.replace("~~", "").strip()
    price_entry = pricing.get(name)
    if not price_entry:
        return None
    price_value = price_entry.get("price", "")
    if not price_value.endswith("USD"):
        return None
    slug = slugify(name)
    url = f"{BASE_URL}/docs/hardware-wallets#{slug}"
    product_type = "Hardware Wallet"

    brand = name.split(" ")[0]
    return {
        "id": f"hardware-{slug}",
        "title": name,
        "description": f"{name} - {product_type} listed on Wallet Radar.",
        "link": url,
        "image_link": f"{BASE_URL}/og/wallets/hardware.png",
        "availability": "in stock",
        "condition": "new",
        "price": price_value,
        "brand": brand,
        "google_product_category": "Electronics",
        "product_type": product_type,
    }


def write_feed(items: List[Dict[str, str]], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as f:
        f.write("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n")
        f.write("<rss version=\"2.0\" xmlns:g=\"http://base.google.com/ns/1.0\">\n")
        f.write("  <channel>\n")
        f.write("    <title>Wallet Radar Merchant Feed</title>\n")
        f.write(f"    <link>{html.escape(BASE_URL)}</link>\n")
        f.write("    <description>Wallet Radar product feed for hardware wallets.</description>\n")
        for item in items:
            f.write("    <item>\n")
            for key, value in item.items():
                f.write(f"      <g:{key}>{html.escape(value)}</g:{key}>\n")
            f.write("    </item>\n")
        f.write("  </channel>\n")
        f.write("</rss>\n")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="wallets/frontend/public/merchant-center.xml")
    args = parser.parse_args()

    items: List[Dict[str, str]] = []
    pricing = load_pricing()
    for _, path in TABLE_FILES.items():
        content = Path(path).read_text(encoding="utf-8").splitlines()
        rows = parse_table(content)
        for row in rows:
            if not row.get("Wallet"):
                continue
            item = build_item(row, pricing)
            if item:
                items.append(item)
            else:
                print(f"Skipping {row.get('Wallet')} (no verified price)", file=sys.stderr)

    output_path = Path(args.output)
    write_feed(items, output_path)



if __name__ == "__main__":
    main()
