from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from orbit_pilot.cli import load_launch
from orbit_pilot.models import Campaign
from orbit_pilot.registry import load_platforms
from orbit_pilot.services.campaigns import load_run_manifest, write_run_manifest
from orbit_pilot.services.generation import generate_run, select_platforms


class RegenerateFlowTest(unittest.TestCase):
    def test_regenerate_subset_via_manifest(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            launch_path = root / "launch.yaml"
            plat_path = root / "plat.yaml"
            launch_path.write_text(
                "\n".join(
                    [
                        "product_name: P",
                        "website_url: https://p.example",
                        "tagline: t",
                        "summary: s",
                        "publish:",
                        "  github:",
                        "    repo: acme/r",
                    ]
                ),
                encoding="utf-8",
            )
            plat_path.write_text(
                "\n".join(
                    [
                        "platforms:",
                        "  - name: GitHub",
                        "    slug: github",
                        "    mode: official_api",
                        "    risk: low",
                        "  - name: DEV",
                        "    slug: dev",
                        "    mode: official_api",
                        "    risk: low",
                    ]
                ),
                encoding="utf-8",
            )
            run_dir = root / "camp" / "run-test"
            run_dir.mkdir(parents=True)
            campaign = Campaign(id="camp", name="Camp", created_at="2026-01-01T00:00:00Z")
            write_run_manifest(run_dir, campaign, str(launch_path), str(plat_path))
            manifest = load_run_manifest(run_dir)
            launch = load_launch(manifest["launch_path"])
            platforms = load_platforms(manifest["platform_registry_path"])
            selected = select_platforms(platforms, ["dev"])
            self.assertEqual([p.slug for p in selected], ["dev"])
            results = generate_run(launch, selected, run_dir)
            self.assertEqual(len(results), 1)
            self.assertTrue((run_dir / "dev" / "payload.json").exists())


if __name__ == "__main__":
    unittest.main()
