from __future__ import annotations

import json
import shutil
from pathlib import Path

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


def prepare_assets(launch: LaunchProfile, record: PlatformRecord, platform_dir: Path) -> list[str]:
    assets_dir = platform_dir / "assets"
    assets_dir.mkdir(parents=True, exist_ok=True)
    outputs: list[str] = []
    preset = PRESETS.get(record.slug)
    files = []
    logo = launch.assets.get("logo")
    if logo:
        files.append(logo)
    files.extend(launch.assets.get("screenshots", []))

    for raw_path in files:
        src = Path(raw_path)
        if not src.exists():
            continue
        dest = assets_dir / src.name
        if preset and Image is not None:
            with Image.open(src) as image:
                image = image.convert("RGB")
                image.thumbnail((preset["width"], preset["height"]))
                image.save(dest, format="JPEG", quality=85, optimize=True)
        else:
            shutil.copy2(src, dest)
        outputs.append(str(dest))

    (platform_dir / "assets.json").write_text(json.dumps(outputs, indent=2), encoding="utf-8")
    return outputs
