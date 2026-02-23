#!/usr/bin/env python3
"""Test routing decision logic based on prompt complexity."""

import json
from pathlib import Path
from config_manager import ConfigManager, RoutingRule

CONFIG_FILE = Path('/root/.openclaw/workspace/bench/routing_config.json')

def classify_prompt(prompt_id: str) -> str:
    """Classify prompt by complexity level."""
    try:
        num = int(prompt_id.replace('P', ''))
        if 1 <= num <= 6:
            return "P1_P6"
        elif 7 <= num <= 12:
            return "P7_P12"
        elif 13 <= num <= 30:
            return "P13_P30"
        else:
            return "unknown"
    except (ValueError, AttributeError):
        return "unknown"

def get_routing_for_prompt(prompt_id: str, config: dict) -> dict:
    """Get routing decision for a given prompt."""
    complexity = classify_prompt(prompt_id)
    
    # Get complexity routing config
    complexity_config = config.get('prompt_complexity', {})
    
    if complexity not in complexity_config:
        return {
            "prompt_id": prompt_id,
            "complexity": complexity,
            "error": "No routing rule found"
        }
    
    routing = complexity_config[complexity]
    
    # Find matching rule in rules array
    rules = config.get('rules', [])
    matching_rule = None
    for rule in rules:
        if rule.get('complexity') == complexity:
            matching_rule = rule
            break
    
    return {
        "prompt_id": prompt_id,
        "complexity": complexity,
        "target_model": routing.get('target_model'),
        "phase": routing.get('phase'),
        "reason": routing.get('reason'),
        "rule_applied": matching_rule is not None,
        "rule_details": matching_rule
    }

def test_routing():
    """Test routing for all complexity levels."""
    print("=" * 60)
    print("Testing Prompt Complexity Routing")
    print("=" * 60)
    
    # Load config
    config = json.loads(CONFIG_FILE.read_text())
    print(f"\n📋 Config version: {config.get('version')}")
    print(f"📋 Prompt complexity routing: {config.get('strategy', {}).get('prompt_complexity_routing')}")
    
    # Test cases
    test_cases = [
        ("P1", "Simple factual question"),
        ("P3", "Short task"),
        ("P6", "End of simple prompts"),
        ("P7", "Start of complex prompts"),
        ("P10", "Multi-step reasoning"),
        ("P12", "Complex analysis"),
        ("P13", "Start of multi-turn"),
        ("P20", "Ongoing conversation"),
        ("P30", "End of multi-turn"),
    ]
    
    print("\n" + "-" * 60)
    print("Routing Decisions:")
    print("-" * 60)
    
    all_passed = True
    for prompt_id, description in test_cases:
        result = get_routing_for_prompt(prompt_id, config)
        
        status = "✅" if result.get("target_model") else "❌"
        print(f"\n{status} {prompt_id} ({description})")
        print(f"   Complexity: {result.get('complexity')}")
        print(f"   → Model: {result.get('target_model')}")
        print(f"   → Phase: {result.get('phase')}")
        print(f"   → Reason: {result.get('reason')}")
        
        if not result.get("target_model"):
            all_passed = False
    
    # Verify expected mappings
    print("\n" + "-" * 60)
    print("Verifying Expected Mappings:")
    print("-" * 60)
    
    expected = {
        "P1": "lfm2.5-thinking:1.2b",
        "P7": "anthropic/claude-sonnet-4", 
        "P13": "mistral:7b",
    }
    
    for prompt_id, expected_model in expected.items():
        result = get_routing_for_prompt(prompt_id, config)
        actual = result.get("target_model")
        match = "✅" if actual == expected_model else "❌"
        print(f"{match} {prompt_id}: expected={expected_model}, actual={actual}")
        if actual != expected_model:
            all_passed = False
    
    # Test ConfigManager integration
    print("\n" + "-" * 60)
    print("ConfigManager Integration Test:")
    print("-" * 60)
    
    cm = ConfigManager()
    
    # Test getting rules for complexity phases
    test_rules = [
        ("lfm2.5-thinking:1.2b", "simple"),
        ("anthropic/claude-sonnet-4", "complex"),
        ("mistral:7b", "multi_turn"),
    ]
    
    for model, phase in test_rules:
        rule = cm.get_rule(model, phase)
        print(f"✅ Rule for {model}::{phase}: warmup={rule.enable_warmup}, fallback={rule.fallback_model}")
    
    print("\n" + "=" * 60)
    if all_passed:
        print("✅ All routing tests PASSED")
    else:
        print("❌ Some routing tests FAILED")
    print("=" * 60)
    
    return all_passed

if __name__ == '__main__':
    test_routing()
