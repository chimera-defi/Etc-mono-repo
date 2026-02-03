#!/usr/bin/env python3
"""Validate Merchant Center feed and pricing inputs."""
from __future__ import annotations

import json
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
PRICING_FILE = BASE_DIR / "data" / "merchant_pricing.json"
HARDWARE_TABLE = BASE_DIR / "HARDWARE_WALLETS.md"
FEED_FILE = BASE_DIR / "frontend" / "public" / "merchant-center.xml"

DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def slugify(value: str) -> str:
    value = re.sub(r"\*\*|__", "", value)
    value = re.sub(r"\[[^\]]+\]\([^\)]+\)", lambda m: re.sub(r"\[(.*?)\]\(.*\)", r"\1", m.group(0)), value)
    value = re.sub(r"<[^>]+>", "", value)
    value = re.sub(r"[^a-zA-Z0-9]+", "-", value).strip("-")
    return value.lower()


def parse_hardware_wallet_names() -> set[str]:
    content = HARDWARE_TABLE.read_text(encoding="utf-8").splitlines()
    names: set[str] = set()
    for line in content:
        if not line.strip().startswith("|"):
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if not cells or cells[0].lower() == "wallet":
            continue
        name = re.sub(r"\[?\*\*([^*\]]+)\*\*\]?\(?[^)]*\)?", r"\1", cells[0]).strip()
        name = name.replace("~~", "").strip()
        if name:
            names.add(name)
    return names


def validate_pricing(pricing: dict[str, dict[str, str]], names: set[str]) -> list[str]:
    errors: list[str] = []
    for name, entry in pricing.items():
        price = entry.get("price", "")
        source = entry.get("source", "")
        checked = entry.get("last_checked", "")
        if not price.endswith("USD"):
            errors.append(f"pricing: {name} price not USD: {price}")
        if not source:
            errors.append(f"pricing: {name} missing source")
        if not checked or not DATE_RE.match(checked):
            errors.append(f"pricing: {name} invalid last_checked: {checked}")
        if name not in names:
            errors.append(f"pricing: {name} not found in hardware table")
    return errors


def validate_feed(pricing: dict[str, dict[str, str]]) -> list[str]:
    errors: list[str] = []
    tree = ET.parse(FEED_FILE)
    root = tree.getroot()
    ns = {"g": "http://base.google.com/ns/1.0"}
    for item in root.findall("./channel/item"):
        price = item.findtext("g:price", default="", namespaces=ns)
        product_type = item.findtext("g:product_type", default="", namespaces=ns)
        title = item.findtext("g:title", default="", namespaces=ns)
        if not price.endswith("USD"):
            errors.append(f"feed: {title} price not USD: {price}")
        if product_type != "Hardware Wallet":
            errors.append(f"feed: {title} unexpected product_type: {product_type}")
        if title not in pricing:
            errors.append(f"feed: {title} missing pricing entry")
    return errors


def main() -> None:
    if not PRICING_FILE.exists():
        print("Missing merchant_pricing.json", file=sys.stderr)
        sys.exit(1)
    pricing = json.loads(PRICING_FILE.read_text(encoding="utf-8"))
    names = parse_hardware_wallet_names()
    errors = []
    errors.extend(validate_pricing(pricing, names))
    if FEED_FILE.exists():
        errors.extend(validate_feed(pricing))
    else:
        errors.append("feed: merchant-center.xml not found")

    if errors:
        print("Merchant feed validation failed:")
        for error in errors:
            print(f"- {error}")
        sys.exit(1)
    print("Merchant feed validation passed")


if __name__ == "__main__":
    main()
