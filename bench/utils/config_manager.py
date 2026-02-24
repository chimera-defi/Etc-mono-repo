#!/usr/bin/env python3
"""Configuration management for self-optimizing harness."""

import json
from pathlib import Path
from dataclasses import dataclass
from typing import Optional
import time

CONFIG_FILE = Path('/root/.openclaw/workspace/bench/config/routing_config.json')

@dataclass
class RoutingRule:
    model: str
    phase: str
    enable_warmup: bool = False
    fallback_model: Optional[str] = None
    reason: str = ""
    
    def apply_to_args(self, args):
        """Modify argparse args based on this rule."""
        if self.fallback_model:
            args.model = self.fallback_model
        if self.enable_warmup:
            args.enable_warmup = True
        return args

class ConfigManager:
    def __init__(self):
        self.config = self._load_config()
    
    def _load_config(self):
        """Load routing_config.json or return empty config."""
        if CONFIG_FILE.exists():
            try:
                return json.loads(CONFIG_FILE.read_text())
            except (json.JSONDecodeError, OSError):
                return {"version": "1.0", "rules": []}
        return {"version": "1.0", "rules": []}
    
    def get_rule(self, model: str, phase: str) -> RoutingRule:
        """Get routing rule for model+phase combination."""
        for rule_data in self.config.get('rules', []):
            if rule_data.get('model') == model and rule_data.get('phase') == phase:
                return RoutingRule(
                    model=rule_data.get('model'),
                    phase=rule_data.get('phase'),
                    enable_warmup=rule_data.get('enable_warmup', False),
                    fallback_model=rule_data.get('fallback_model'),
                    reason=rule_data.get('reason', '')
                )
        return RoutingRule(model=model, phase=phase)
    
    def apply_routing(self, args):
        """Apply routing rules to command-line args."""
        model = getattr(args, 'model', 'unknown')
        phase = getattr(args, 'phase', 'unknown')
        rule = self.get_rule(model, phase)
        return rule.apply_to_args(args)
    
    def save_rule(self, rule: RoutingRule, source: str):
        """Add/update routing rule."""
        # Remove old rule if exists
        self.config['rules'] = [
            r for r in self.config.get('rules', [])
            if not (r.get('model') == rule.model and r.get('phase') == rule.phase)
        ]
        
        # Add new rule
        self.config['rules'].append({
            'model': rule.model,
            'phase': rule.phase,
            'enable_warmup': rule.enable_warmup,
            'fallback_model': rule.fallback_model,
            'reason': rule.reason,
            'source': source,
            'timestamp': time.time()
        })
        
        # Write to file
        CONFIG_FILE.write_text(json.dumps(self.config, indent=2))

if __name__ == '__main__':
    config = ConfigManager()
    rule = RoutingRule(model="test", phase="atomic", enable_warmup=True)
    config.save_rule(rule, source="manual_test")
    print("✅ config_manager.py working")
