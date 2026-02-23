#!/usr/bin/env python3
"""Audit trail for routing decisions."""

import json
from pathlib import Path
from datetime import datetime

LOG_FILE = Path('/root/.openclaw/workspace/bench/routing_decisions.jsonl')

def log_routing_decision(original_model: str, fallback_model: str, phase: str, reason: str):
    """Log a routing fallback decision."""
    entry = {
        'timestamp': datetime.now().isoformat(),
        'original_model': original_model,
        'fallback_model': fallback_model,
        'phase': phase,
        'reason': reason,
        'decision': 'FALLBACK'
    }
    with open(LOG_FILE, 'a') as f:
        f.write(json.dumps(entry) + '\n')
    print(f"📝 Logged: {original_model} → {fallback_model} ({phase})")

if __name__ == '__main__':
    log_routing_decision('lfm', 'haiku', 'extended', 'test')
    print("✅ routing_log.py working")
