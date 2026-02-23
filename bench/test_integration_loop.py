#!/usr/bin/env python3
"""Integration test for the self-optimizing loop closure.

This test simulates the complete feedback loop:
1. Generate recommendations (like harness_feedback_loop.py does)
2. Enforce recommendations (like routing_enforcer.py does)
3. Config updated (routing_config.json)
4. Next cycle reads config and applies routing

Verifies:
- Warmup recommendation is applied to config
- Fallback recommendation is applied to config
"""

import json
import tempfile
import os
import sys
from pathlib import Path
from unittest.mock import patch

import pytest

# Add bench to path
BENCH_DIR = Path('/root/.openclaw/workspace/bench')
sys.path.insert(0, str(BENCH_DIR))

from config_manager import ConfigManager, RoutingRule


class TestLoopClosure:
    """Integration tests for the self-optimizing feedback loop."""

    @pytest.fixture(autouse=True)
    def setup_temp_config(self, tmp_path):
        """Use temporary config file for isolation."""
        self.config_file = tmp_path / "routing_config.json"
        self.original_config_file = Path('/root/.openclaw/workspace/bench/routing_config.json')
        
        # Backup original config
        if self.original_config_file.exists():
            self.backup_content = self.original_config_file.read_text()
        else:
            self.backup_content = None
        
        # Create empty initial config
        self.config_file.write_text(json.dumps({"version": "1.0", "rules": []}))
        
        yield
        
        # Restore original config
        if self.backup_content:
            self.original_config_file.write_text(self.backup_content)
        elif self.original_config_file.exists():
            self.original_config_file.unlink()

    def _create_feedback_file(self, tmp_path, recommendations):
        """Helper to create a feedback file with recommendations."""
        feedback_file = tmp_path / "harness_feedback.json"
        feedback_data = {
            "generated_at": 1234567890.0,
            "recent_runs": 1,
            "model_phase_accuracy": {},
            "hot_failures": [],
            "recommendations": recommendations
        }
        feedback_file.write_text(json.dumps(feedback_data))
        return feedback_file

    def _simulate_enforcer(self, feedback_file, config_file):
        """Simulate routing_enforcer.py logic."""
        with open(feedback_file) as f:
            feedback = json.load(f)
        
        config = ConfigManager()
        
        for rec in feedback.get('recommendations', []):
            if rec.get('type') != 'routing':
                continue
            
            target = rec.get('target', '')
            parts = target.split('::')
            if len(parts) != 2:
                continue
            
            model, phase = parts
            
            # Determine if warmup needed
            enable_warmup = 'warm-up' in rec.get('reason', '').lower() or \
                           'warm' in rec.get('action', '').lower()
            
            # Determine fallback model
            fallback_model = None
            if 'Route' in rec.get('action', '') or 'disable' in rec.get('action', '').lower():
                fallback_model = 'claude-haiku'
            
            rule = RoutingRule(
                model=model,
                phase=phase,
                enable_warmup=enable_warmup,
                fallback_model=fallback_model,
                reason=rec.get('reason', '')
            )
            config.save_rule(rule, source='integration_test')
        
        return config

    def test_warmup_recommendation_applied_to_config(self, tmp_path):
        """Verify warmup recommendation is applied to config."""
        # Step 1: Create feedback with warmup recommendation
        feedback_file = self._create_feedback_file(tmp_path, [
            {
                "type": "routing",
                "target": "lfm2.5-thinking:1.2b::atomic",
                "action": "enable_warmup",
                "reason": "warm-up recommended for atomic phase"
            }
        ])
        
        # Step 2: Enforce recommendations (like routing_enforcer.py)
        config = self._simulate_enforcer(feedback_file, self.config_file)
        
        # Step 3: Verify warmup was applied in config
        rule = config.get_rule("lfm2.5-thinking:1.2b", "atomic")
        
        assert rule.enable_warmup is True, \
            f"Expected warmup=True, got warmup={rule.enable_warmup}"
        assert rule.model == "lfm2.5-thinking:1.2b"
        assert rule.phase == "atomic"

    def test_fallback_recommendation_applied_to_config(self, tmp_path):
        """Verify fallback recommendation is applied to config."""
        # Step 1: Create feedback with fallback recommendation
        feedback_file = self._create_feedback_file(tmp_path, [
            {
                "type": "routing",
                "target": "lfm2.5-thinking:1.2b::extended",
                "action": "disable_for_stateful",
                "reason": "low extended accuracy 0.00%"
            }
        ])
        
        # Step 2: Enforce recommendations
        config = self._simulate_enforcer(feedback_file, self.config_file)
        
        # Step 3: Verify fallback was applied in config
        rule = config.get_rule("lfm2.5-thinking:1.2b", "extended")
        
        assert rule.fallback_model == "claude-haiku", \
            f"Expected fallback_model=claude-haiku, got {rule.fallback_model}"
        assert rule.enable_warmup is False

    def test_full_loop_cycle(self, tmp_path):
        """Test complete cycle: generate → enforce → config updated → next cycle reads."""
        # === CYCLE 1 ===
        
        # Step 1: Generate recommendations (like harness_feedback_loop.py)
        feedback_file = self._create_feedback_file(tmp_path, [
            {
                "type": "routing",
                "target": "test-model::atomic",
                "action": "enable_warmup",
                "reason": "initial warmup setup"
            },
            {
                "type": "routing",
                "target": "test-model::extended",
                "action": "disable_for_stateful",
                "reason": "poor accuracy"
            }
        ])
        
        # Step 2: Enforce recommendations (like routing_enforcer.py)
        config = self._simulate_enforcer(feedback_file, self.config_file)
        
        # === CYCLE 2 (Next cycle reads config) ===
        
        # Step 3: Simulate next cycle reading config
        new_config = ConfigManager()
        
        # Verify both rules are applied
        atomic_rule = new_config.get_rule("test-model", "atomic")
        extended_rule = new_config.get_rule("test-model", "extended")
        
        # Assertions
        assert atomic_rule.enable_warmup is True, \
            "Atomic phase should have warmup enabled"
        assert extended_rule.fallback_model == "claude-haiku", \
            "Extended phase should have fallback model"
        assert extended_rule.enable_warmup is False

    def test_multiple_recommendations_in_sequence(self, tmp_path):
        """Test that multiple recommendations are applied sequentially."""
        # First recommendation
        feedback1 = self._create_feedback_file(tmp_path, [
            {
                "type": "routing",
                "target": "model-a::atomic",
                "action": "enable_warmup",
                "reason": "first recommendation"
            }
        ])
        self._simulate_enforcer(feedback1, self.config_file)
        
        # Second recommendation (simulates next cycle)
        feedback2 = self._create_feedback_file(tmp_path, [
            {
                "type": "routing",
                "target": "model-b::atomic", 
                "action": "enable_warmup",
                "reason": "second recommendation"
            }
        ])
        self._simulate_enforcer(feedback2, self.config_file)
        
        # Verify both are persisted
        config = ConfigManager()
        rule_a = config.get_rule("model-a", "atomic")
        rule_b = config.get_rule("model-b", "atomic")
        
        assert rule_a.enable_warmup is True
        assert rule_b.enable_warmup is True

    def test_rule_update_overwrites_previous(self, tmp_path):
        """Test that updating a rule overwrites the previous one."""
        # Initial rule
        feedback1 = self._create_feedback_file(tmp_path, [
            {
                "type": "routing",
                "target": "test-model::atomic",
                "action": "enable_warmup",
                "reason": "initial rule"
            }
        ])
        self._simulate_enforcer(feedback1, self.config_file)
        
        # Updated rule (same model/phase but different settings)
        feedback2 = self._create_feedback_file(tmp_path, [
            {
                "type": "routing",
                "target": "test-model::atomic",
                "action": "disable",  # Different action
                "reason": "updated rule - disable"
            }
        ])
        self._simulate_enforcer(feedback2, self.config_file)
        
        # Verify updated rule is applied
        config = ConfigManager()
        rule = config.get_rule("test-model", "atomic")
        
        # Should have fallback from "disable" action
        assert rule.fallback_model == "claude-haiku"


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
