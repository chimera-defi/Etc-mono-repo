#!/usr/bin/env python3
"""Generate a basic Google Merchant Center feed from wallet tables.

Notes:
- Pricing is set to 0 USD by default because wallet docs do not track prices.
- Update the pricing logic if/when structured price data is added.
"""
from __future__ import annotations

import argparse
import html
import os
import re
from pathlib import Path
from typing import List, Dict

BASE_URL = os.environ.get("WALLET_BASE_URL", "https://walletradar.org")

TABLE_FILES = {
    "software": "wallets/SOFTWARE_WALLETS.md",
    "hardware": "wallets/HARDWARE_WALLETS.md",
    "cards": "wallets/CRYPTO_CARDS.md",
}


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


def build_item(row: Dict[str, str], category: str) -> Dict[str, str]:
    name = row.get("Wallet", "Unknown")
    slug = slugify(name)
    if category == "software":
        url = f"{BASE_URL}/docs/software-wallets#{slug}"
        product_type = "Software Wallet"
    elif category == "hardware":
        url = f"{BASE_URL}/docs/hardware-wallets#{slug}"
        product_type = "Hardware Wallet"
    else:
        url = f"{BASE_URL}/docs/crypto-cards#{slug}"
        product_type = "Crypto Card"

    brand = name.split(" ")[0]
    return {
        "id": f"{category}-{slug}",
        "title": name,
        "description": f"{name} - {product_type} listed on Wallet Radar.",
        "link": url,
        "image_link": f"{BASE_URL}/og/wallets/{category}.png",
        "availability": "in stock",
        "condition": "new",
        "price": "0 USD",
        "brand": brand,
        "google_product_category": "Software > Computer Software" if category == "software" else "Electronics",
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
        f.write("    <description>Wallet Radar product feed for wallets and cards.</description>\n")
        for item in items:
            f.write("    <item>\n")
            for key, value in item.items():
                f.write(f"      <g:{key}>{html.escape(value)}</g:{key}>\n")
            f.write("    </item>\n")
        f.write("  </channel>\n")
        f.write("</rss>\n")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="wallets/artifacts/merchant-center.xml")
    args = parser.parse_args()

    items: List[Dict[str, str]] = []
    for category, path in TABLE_FILES.items():
        content = Path(path).read_text(encoding="utf-8").splitlines()
        rows = parse_table(content)
        for row in rows:
            if not row.get("Wallet"):
                continue
            items.append(build_item(row, category))

    write_feed(items, Path(args.output))


if __name__ == "__main__":
    main()
