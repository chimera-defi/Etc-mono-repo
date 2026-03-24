from __future__ import annotations

import json
import shutil
from pathlib import Path
from typing import Any

try:
    from PIL import Image
except ImportError:  # pragma: no cover
    Image = None

from orbit_pilot.models import LaunchProfile, PlatformRecord

PRESETS = {
    "github": {"width": 1280, "height": 720},
    "dev": {"width": 1280, "height": 720},
    "medium": {"width": 1400, "height": 788},
    "linkedin": {"width": 1200, "height": 627},
    "x": {"width": 1600, "height": 900},
}


def _alt_text(launch: LaunchProfile, src: Path) -> str:
    """Stable alt text for accessibility (spec: alt text retention on assets)."""
    stem = src.stem.replace("-", " ").replace("_", " ")
    return f"{launch.product_name} — {stem}"


def prepare_assets(launch: LaunchProfile, record: PlatformRecord, platform_dir: Path) -> list[str]:
    assets_dir = platform_dir / "assets"
    assets_dir.mkdir(parents=True, exist_ok=True)
    outputs: list[str] = []
    manifest: list[dict[str, Any]] = []
    preset = None
    if record.image_max_width and record.image_max_height:
        preset = {"width": record.image_max_width, "height": record.image_max_height}
    elif PRESETS.get(record.slug):
        preset = dict(PRESETS[record.slug])
    files = []
    logo = launch.assets.get("logo")
    if logo:
        files.append(logo)
    files.extend(launch.assets.get("screenshots", []))

    for raw_path in files:
        src = Path(raw_path)
        if not src.exists():
            continue
        if preset and Image is not None:
            dest = assets_dir / f"{src.stem}.jpg"
            with Image.open(src) as image:
                image = image.convert("RGB")
                image.thumbnail((preset["width"], preset["height"]))
                image.save(dest, format="JPEG", quality=85, optimize=True)
        else:
            dest = assets_dir / src.name
            shutil.copy2(src, dest)
        outputs.append(str(dest))
        manifest.append({"path": str(dest.relative_to(platform_dir)), "alt": _alt_text(launch, src)})

    (platform_dir / "assets.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    return outputs
