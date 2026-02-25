#!/usr/bin/env python3
"""Routing enforcer: Convert feedback recommendations to config."""

import json
from pathlib import Path
from datetime import datetime
from utils.config_manager import ConfigManager, RoutingRule

FEEDBACK = Path('/root/.openclaw/workspace/bench/harness_feedback.json')
OUTPUT_CONFIG = Path('/root/.openclaw/workspace/bench/routing_config.json')
AUDIT_LOG = Path('/root/.openclaw/workspace/bench/routing_decisions.log')


def generate_routing_rules(recommendations: list) -> dict:
    """Convert feedback recommendations into routing rules.
    
    Input: List of recommendation dicts from harness_feedback.json
    Output: routing_config dict with allow/disable, fallback, requirements
    
    This function is the core of the routing enforcement system.
    It transforms human-readable recommendations into enforceable rules.
    """
    if recommendations is None:
        recommendations = []
        
    rules = {
        'version': '1.0',
        'generated_at': datetime.now().isoformat(),
        'rules': []
    }
    
    for rec in recommendations:
        if rec.get('type') != 'routing':
            continue
        
        target = rec.get('target', '')  # "model::phase"
        parts = target.split('::')
        if len(parts) != 2:
            continue
        
        model, phase = parts
        
        # Extract structured fields from recommendation
        allow = rec.get('allow', True)
        fallback = rec.get('fallback')
        requirements = rec.get('requirements', [])
        reason = rec.get('reason', '')
        
        # Determine warmup requirement
        enable_warmup = 'warm-up' in requirements or 'warmup' in str(rec.get('action', '')).lower()
        
        # Determine fallback if not explicitly set
        if fallback is None and not allow:
            fallback = 'mistral:7b'
        
        rule = {
            'model': model,
            'phase': phase,
            'action': rec.get('action', 'unknown'),
            'allow': allow,
            'fallback': fallback,
            'requirements': requirements,
            'enable_warmup': enable_warmup,
            'reason': reason,
            'timestamp': datetime.now().isoformat()
        }
        
        rules['rules'].append(rule)
    
    return rules

def convert_recommendation_to_rule(rec: dict) -> RoutingRule:
    """Convert feedback recommendation to routing rule.
    
    Uses structured fields: allow, fallback, requirements
    """
    if rec.get('type') != 'routing':
        return None
    
    target = rec.get('target', '')
    parts = target.split('::')
    if len(parts) != 2:
        return None
    
    model, phase = parts
    
    # Use structured fields from recommendation
    allow = rec.get('allow', True)
    requirements = rec.get('requirements', [])
    
    # Determine if warmup needed (from requirements or action)
    enable_warmup = 'warm-up' in requirements or 'warmup' in str(rec.get('action', '')).lower()
    
    # Determine fallback model - use explicit fallback or default for disabled routes
    fallback_model = rec.get('fallback')
    if fallback_model is None and not allow:
        fallback_model = 'mistral:7b'
    
    return RoutingRule(
        model=model,
        phase=phase,
        enable_warmup=enable_warmup,
        fallback_model=fallback_model,
        reason=rec.get('reason', '')
    )

def enforce_recommendations(feedback_file=None, output_config=None):
    """Apply recommendations from feedback to config.
    
    Reads: harness_feedback.json (recommendations)
    Writes: routing_config.json (enforced rules)
            routing_decisions.log (audit trail)
    
    Returns: True if rules were applied successfully
    """
    if feedback_file is None:
        feedback_file = FEEDBACK
    if output_config is None:
        output_config = OUTPUT_CONFIG
    
    if not Path(feedback_file).exists():
        print(f"⚠️  Feedback file not found: {feedback_file}")
        return False
    
    try:
        feedback = json.loads(Path(feedback_file).read_text())
    except json.JSONDecodeError:
        print(f"❌ Invalid JSON in {feedback_file}")
        return False
    
    # Generate routing rules from recommendations
    recommendations = feedback.get('recommendations', [])
    routing_config = generate_routing_rules(recommendations)
    
    # Write structured routing config (for auditability)
    output_config.write_text(json.dumps(routing_config, indent=2))
    print(f"✅ Routing config written to {output_config}")
    
    # Also update ConfigManager for runtime use
    config = ConfigManager()
    applied = 0
    skipped = 0
    errors = 0
    
    for rec in recommendations:
        if rec.get('type') != 'routing':
            skipped += 1
            continue
        
        try:
            rule = convert_recommendation_to_rule(rec)
            if not rule:
                skipped += 1
                continue
            
            config.save_rule(rule, source='harness_feedback')
            
            # Log decision to audit trail
            with open(AUDIT_LOG, 'a') as f:
                f.write(f"\n{'='*60}\n")
                f.write(f"Routing Decision: {datetime.now().isoformat()}\n")
                f.write(f"{'='*60}\n")
                f.write(f"Target: {rule.model}::{rule.phase}\n")
                f.write(f"Action: {rec.get('action', 'unknown')}\n")
                f.write(f"Allow: {rec.get('allow', True)}\n")
                f.write(f"Requirements: {rec.get('requirements', [])}\n")
                f.write(f"Reason: {rule.reason}\n")
                if rule.fallback_model:
                    f.write(f"Fallback: {rule.fallback_model}\n")
                if rule.enable_warmup:
                    f.write(f"Warm-up: enabled\n")
                f.write("\n")
            
            applied += 1
        except Exception as e:
            print(f"⚠️  Error processing {rec.get('target', '?')}: {e}")
            errors += 1
    
    print(f"✅ Enforced: {applied} applied, {skipped} skipped, {errors} errors")
    print(f"✅ Audit trail logged to {AUDIT_LOG}")
    return applied > 0

if __name__ == '__main__':
    enforce_recommendations()
