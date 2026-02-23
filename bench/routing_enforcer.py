#!/usr/bin/env python3
"""Routing enforcer: Convert feedback recommendations to config."""

import json
from pathlib import Path
from config_manager import ConfigManager, RoutingRule

FEEDBACK = Path('/root/.openclaw/workspace/bench/harness_feedback.json')
AUDIT_LOG = Path('/root/.openclaw/workspace/bench/routing_decisions.log')

def convert_recommendation_to_rule(rec: dict) -> RoutingRule:
    """Convert feedback recommendation to routing rule."""
    if rec.get('type') != 'routing':
        return None
    
    target = rec.get('target', '')
    parts = target.split('::')
    if len(parts) != 2:
        return None
    
    model, phase = parts
    
    # Determine if warmup needed
    enable_warmup = 'warm-up' in rec.get('reason', '').lower() or \
                   'warm' in rec.get('action', '').lower()
    
    # Determine fallback model
    fallback_model = None
    if 'Route' in rec.get('action', '') or 'disable' in rec.get('action', '').lower():
        fallback_model = 'claude-haiku'
    
    return RoutingRule(
        model=model,
        phase=phase,
        enable_warmup=enable_warmup,
        fallback_model=fallback_model,
        reason=rec.get('reason', '')
    )

def enforce_recommendations(feedback_file=None):
    """Apply recommendations from feedback to config."""
    if feedback_file is None:
        feedback_file = FEEDBACK
    
    if not Path(feedback_file).exists():
        print(f"⚠️  Feedback file not found: {feedback_file}")
        return False
    
    try:
        feedback = json.loads(Path(feedback_file).read_text())
    except json.JSONDecodeError:
        print(f"❌ Invalid JSON in {feedback_file}")
        return False
    
    config = ConfigManager()
    applied = 0
    skipped = 0
    errors = 0
    
    for rec in feedback.get('recommendations', []):
        if rec.get('type') != 'routing':
            skipped += 1
            continue
        
        try:
            rule = convert_recommendation_to_rule(rec)
            if not rule:
                skipped += 1
                continue
            
            config.save_rule(rule, source='harness_feedback')
            
            # Log decision
            with open(AUDIT_LOG, 'a') as f:
                log_entry = f"{rule.model}::{rule.phase} → "
                if rule.enable_warmup:
                    log_entry += "enable_warmup=true"
                if rule.fallback_model:
                    log_entry += f" fallback={rule.fallback_model}"
                log_entry += f" (reason: {rule.reason})\n"
                f.write(log_entry)
            
            applied += 1
        except Exception as e:
            print(f"⚠️  Error processing {rec.get('target', '?')}: {e}")
            errors += 1
    
    print(f"✅ Enforced: {applied} applied, {skipped} skipped, {errors} errors")
    return applied > 0

if __name__ == '__main__':
    enforce_recommendations()
