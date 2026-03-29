"""python -m orbit_pilot → same as `orbit` CLI."""

from __future__ import annotations

from orbit_pilot.cli_commands import main

if __name__ == "__main__":
    raise SystemExit(main())
