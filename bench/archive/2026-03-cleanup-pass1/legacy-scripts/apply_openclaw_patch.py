#!/usr/bin/env python3
"""
Apply openclaw.json patch: Update LOCAL_TOOL_CALLING fallback to LFM2.5-1.2B

USAGE:
  python3 apply_openclaw_patch.py [--dry-run] [--config-path PATH]

FLAGS:
  --dry-run        Show changes without applying
  --config-path    Custom path to openclaw.json (default: /root/.openclaw/config/openclaw.json)
  --backup         Create backup before patching (default: true)
"""

import json
import sys
from pathlib import Path
from datetime import datetime

DEFAULT_CONFIG = Path("/root/.openclaw/config/openclaw.json")

PATCH = {
    "description": "Update LOCAL_TOOL_CALLING primary fallback from qwen2.5:3b to lfm2.5-thinking:1.2b",
    "reason": "LFM2.5-1.2B: 95.55% accuracy, perfect restraint (1.0), production-ready. Replaces qwen2.5:3b (62.2% accuracy, 0.33 restraint, unsafe).",
    "benchmark_date": "2026-02-19",
    "phase": "Post-Phase-2-validation",
    
    "changes": {
        "models.LOCAL_TOOL_CALLING.primary": {
            "from": "ollama/qwen2.5:3b",
            "to": "ollama/lfm2.5-thinking:1.2b"
        },
        "models.LOCAL_TOOL_CALLING.variant": {
            "from": None,
            "to": "bracket_notation_with_context_awareness"
        },
        "models.LOCAL_TOOL_CALLING.agent_score": {
            "from": None,
            "to": 0.9555
        },
        "models.LOCAL_TOOL_CALLING.fallbacks": {
            "from": ["openai-codex/gpt-5.3-codex", "ollama/qwen2.5:3b"],
            "to": ["openai-codex/gpt-5.3-codex"]
        }
    }
}

def load_config(path):
    """Load openclaw.json"""
    if not path.exists():
        print(f"❌ Config not found: {path}")
        return None
    
    try:
        return json.loads(path.read_text())
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON: {e}")
        return None

def apply_patch(config):
    """Apply patch to config"""
    
    # Ensure nested structure exists
    if "models" not in config:
        config["models"] = {}
    if "LOCAL_TOOL_CALLING" not in config["models"]:
        config["models"]["LOCAL_TOOL_CALLING"] = {}
    
    lc = config["models"]["LOCAL_TOOL_CALLING"]
    
    # Update primary
    old_primary = lc.get("primary", "UNDEFINED")
    lc["primary"] = "ollama/lfm2.5-thinking:1.2b"
    
    # Update variant
    lc["variant"] = "bracket_notation_with_context_awareness"
    
    # Update agent_score
    lc["agent_score"] = 0.9555
    
    # Update fallbacks (remove qwen, keep codex)
    old_fallbacks = lc.get("fallbacks", [])
    lc["fallbacks"] = [f for f in old_fallbacks if "qwen" not in f.lower()]
    if "openai-codex" not in str(lc["fallbacks"]):
        lc["fallbacks"] = ["openai-codex/gpt-5.3-codex"] + lc["fallbacks"]
    
    return config, {
        "primary": (old_primary, lc["primary"]),
        "fallbacks": (old_fallbacks, lc["fallbacks"])
    }

def show_diff(config, changes):
    """Pretty-print the changes"""
    print("\n📝 Changes to apply:\n")
    
    for key, (before, after) in changes.items():
        print(f"  {key}:")
        print(f"    ❌ FROM: {before}")
        print(f"    ✅ TO:   {after}")
        print()

def save_config(config, path, backup=True):
    """Save config, optionally with backup"""
    
    if backup and path.exists():
        backup_path = path.with_suffix(f".backup.{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
        path.rename(backup_path)
        print(f"💾 Backup created: {backup_path}")
    
    path.write_text(json.dumps(config, indent=2))
    print(f"✅ Patched config written: {path}")

def main():
    dry_run = "--dry-run" in sys.argv
    backup = "--no-backup" not in sys.argv
    
    # Custom config path?
    config_path = DEFAULT_CONFIG
    for i, arg in enumerate(sys.argv):
        if arg == "--config-path" and i + 1 < len(sys.argv):
            config_path = Path(sys.argv[i + 1])
    
    print(f"🔍 Loading config: {config_path}")
    config = load_config(config_path)
    if not config:
        return 1
    
    print("📋 Applying patch...")
    patched_config, changes = apply_patch(config)
    
    show_diff(config, changes)
    
    if dry_run:
        print("(--dry-run: No changes applied)")
        return 0
    
    # Confirm
    response = input("Apply patch? [y/N] ")
    if response.lower() != "y":
        print("Cancelled.")
        return 0
    
    save_config(patched_config, config_path, backup=backup)
    print("\n✅ Patch applied successfully!")
    print("\nNext steps:")
    print("  1. Restart OpenClaw: openclaw gateway restart")
    print("  2. Verify LFM2.5 is now fallback: ollama list")
    print("  3. Test: python3 run_benchmark.py lfm2.5-thinking:1.2b atomic")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
