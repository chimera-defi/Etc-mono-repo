#!/usr/bin/env python3
"""Tests for routing enforcer module.

Tests:
1. Reading feedback recommendations
2. Generating correct routing config
3. Decisions are auditable
"""

import json
import tempfile
import os
from pathlib import Path
import sys

# Add bench to path
BENCH = Path('/root/.openclaw/workspace/bench')
sys.path.insert(0, str(BENCH))

from routing_enforcer import (
    generate_routing_rules,
    convert_recommendation_to_rule,
    enforce_recommendations,
)


def test_generate_routing_rules():
    """Test that routing rules are correctly generated from recommendations."""
    
    # Sample recommendations from harness_feedback.json
    recommendations = [
        {
            'type': 'routing',
            'target': 'lfm2.5-thinking:1.2b::extended',
            'action': 'disable_for_stateful',
            'reason': 'low extended accuracy 0.00%',
            'allow': False,
            'fallback': 'claude-haiku',
            'requirements': []
        },
        {
            'type': 'routing',
            'target': 'lfm2.5-thinking:1.2b::atomic',
            'action': 'allow_for_bounded_tasks',
            'reason': 'strong atomic accuracy 80.00%',
            'allow': True,
            'fallback': None,
            'requirements': ['warm-up']
        }
    ]
    
    rules = generate_routing_rules(recommendations)
    
    # Verify structure
    assert 'version' in rules
    assert 'generated_at' in rules
    assert 'rules' in rules
    assert len(rules['rules']) == 2
    
    # Verify first rule (extended - disabled)
    ext_rule = rules['rules'][0]
    assert ext_rule['model'] == 'lfm2.5-thinking:1.2b'
    assert ext_rule['phase'] == 'extended'
    assert ext_rule['allow'] == False
    assert ext_rule['fallback'] == 'claude-haiku'
    assert ext_rule['action'] == 'disable_for_stateful'
    assert ext_rule['enable_warmup'] == False
    
    # Verify second rule (atomic - allowed with warm-up)
    atom_rule = rules['rules'][1]
    assert atom_rule['model'] == 'lfm2.5-thinking:1.2b'
    assert atom_rule['phase'] == 'atomic'
    assert atom_rule['allow'] == True
    assert 'warm-up' in atom_rule['requirements']
    assert atom_rule['enable_warmup'] == True
    
    print("✅ test_generate_routing_rules PASSED")


def test_convert_recommendation_to_rule():
    """Test converting recommendations to RoutingRule objects."""
    
    # Test disable recommendation
    rec_disable = {
        'type': 'routing',
        'target': 'lfm2.5-thinking:1.2b::extended',
        'action': 'disable_for_stateful',
        'reason': 'low extended accuracy',
        'allow': False,
        'fallback': 'claude-haiku',
        'requirements': []
    }
    
    rule = convert_recommendation_to_rule(rec_disable)
    assert rule is not None
    assert rule.model == 'lfm2.5-thinking:1.2b'
    assert rule.phase == 'extended'
    assert rule.enable_warmup == False
    assert rule.fallback_model == 'claude-haiku'
    
    # Test allow with warm-up
    rec_allow = {
        'type': 'routing',
        'target': 'qwen2.5:3b::atomic',
        'action': 'allow_for_bounded_tasks',
        'reason': 'strong atomic accuracy',
        'allow': True,
        'fallback': None,
        'requirements': ['warm-up']
    }
    
    rule = convert_recommendation_to_rule(rec_allow)
    assert rule is not None
    assert rule.model == 'qwen2.5:3b'
    assert rule.phase == 'atomic'
    assert rule.enable_warmup == True
    assert rule.fallback_model is None
    
    # Test non-routing type returns None
    rec_other = {'type': 'other', 'target': 'test'}
    assert convert_recommendation_to_rule(rec_other) is None
    
    # Test invalid target format
    rec_invalid = {'type': 'routing', 'target': 'invalid'}
    assert convert_recommendation_to_rule(rec_invalid) is None
    
    print("✅ test_convert_recommendation_to_rule PASSED")


def test_read_feedback_recommendations():
    """Test reading feedback recommendations from harness_feedback.json."""
    
    feedback_file = Path('/root/.openclaw/workspace/bench/harness_feedback.json')
    
    if not feedback_file.exists():
        print("⚠️  harness_feedback.json not found, skipping test")
        return
    
    feedback = json.loads(feedback_file.read_text())
    
    # Verify structure
    assert 'recommendations' in feedback
    assert 'model_phase_accuracy' in feedback
    
    # Verify routing recommendations have required fields
    for rec in feedback.get('recommendations', []):
        if rec.get('type') == 'routing':
            assert 'target' in rec
            assert 'action' in rec
            assert 'allow' in rec
            assert 'fallback' in rec
            assert 'requirements' in rec
    
    print("✅ test_read_feedback_recommendations PASSED")


def test_routing_config_auditable():
    """Test that routing decisions are auditable."""
    
    # Create temp files for testing
    with tempfile.TemporaryDirectory() as tmpdir:
        feedback_file = Path(tmpdir) / 'harness_feedback.json'
        output_file = Path(tmpdir) / 'routing_config.json'
        audit_file = Path(tmpdir) / 'routing_decisions.log'
        
        # Write test feedback
        feedback = {
            'recommendations': [
                {
                    'type': 'routing',
                    'target': 'test-model::atomic',
                    'action': 'allow_for_bounded_tasks',
                    'reason': 'test reason',
                    'allow': True,
                    'fallback': None,
                    'requirements': ['warm-up']
                }
            ]
        }
        feedback_file.write_text(json.dumps(feedback))
        
        # Import with overridden paths
        import routing_enforcer
        original_feedback = routing_enforcer.FEEDBACK
        original_output = routing_enforcer.OUTPUT_CONFIG
        original_audit = routing_enforcer.AUDIT_LOG
        
        routing_enforcer.FEEDBACK = feedback_file
        routing_enforcer.OUTPUT_CONFIG = output_file
        routing_enforcer.AUDIT_LOG = audit_file
        
        try:
            # Run enforcement
            result = enforce_recommendations()
            
            # Verify output config exists and is valid JSON
            assert output_file.exists(), "routing_config.json should exist"
            config = json.loads(output_file.read_text())
            assert 'rules' in config
            assert len(config['rules']) > 0
            
            # Verify audit log exists
            assert audit_file.exists(), "routing_decisions.log should exist"
            audit_content = audit_file.read_text()
            assert 'Routing Decision' in audit_content
            assert 'test-model' in audit_content
            assert 'test reason' in audit_content
            
        finally:
            # Restore original paths
            routing_enforcer.FEEDBACK = original_feedback
            routing_enforcer.OUTPUT_CONFIG = original_output
            routing_enforcer.AUDIT_LOG = original_audit
    
    print("✅ test_routing_config_auditable PASSED")


def test_generate_routing_rules_with_empty_input():
    """Test that generate_routing_rules handles empty input."""
    
    rules = generate_routing_rules([])
    assert 'rules' in rules
    assert len(rules['rules']) == 0
    
    rules = generate_routing_rules(None)
    assert 'rules' in rules
    assert len(rules['rules']) == 0
    
    print("✅ test_generate_routing_rules_with_empty_input PASSED")


def test_generate_routing_rules_filters_non_routing():
    """Test that non-routing recommendations are filtered out."""
    
    recommendations = [
        {'type': 'routing', 'target': 'model::phase', 'action': 'allow', 'allow': True, 'fallback': None, 'requirements': []},
        {'type': 'other', 'target': 'model::phase'},  # Should be filtered
        {'type': 'routing', 'target': 'model2::phase', 'action': 'disable', 'allow': False, 'fallback': 'haiku', 'requirements': []},
    ]
    
    rules = generate_routing_rules(recommendations)
    assert len(rules['rules']) == 2
    
    print("✅ test_generate_routing_rules_filters_non_routing PASSED")


if __name__ == '__main__':
    print("Running routing_enforcer tests...\n")
    
    test_generate_routing_rules()
    test_convert_recommendation_to_rule()
    test_read_feedback_recommendations()
    test_routing_config_auditable()
    test_generate_routing_rules_with_empty_input()
    test_generate_routing_rules_filters_non_routing()
    
    print("\n✅ All tests PASSED!")
