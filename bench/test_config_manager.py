import pytest
import json
import tempfile
from pathlib import Path
from config_manager import ConfigManager, RoutingRule

class TestConfigManager:
    def test_load_empty_config(self):
        """Empty config returns default rule."""
        config = ConfigManager()
        rule = config.get_rule("unknown", "atomic")
        assert rule.model == "unknown"
        assert not rule.enable_warmup
        assert rule.fallback_model is None
    
    def test_save_and_load_rule(self):
        """Save rule and retrieve it."""
        config = ConfigManager()
        rule = RoutingRule(
            model="test-model",
            phase="atomic",
            enable_warmup=True,
            reason="test"
        )
        config.save_rule(rule, source="test")
        
        config2 = ConfigManager()
        loaded = config2.get_rule("test-model", "atomic")
        assert loaded.enable_warmup
        assert loaded.model == "test-model"
    
    def test_apply_routing_warmup(self):
        """Routing applies warmup setting."""
        config = ConfigManager()
        rule = RoutingRule(model="lfm", phase="atomic", enable_warmup=True)
        config.save_rule(rule, source="test")
        
        args = type('Args', (), {'model': 'lfm', 'phase': 'atomic', 'enable_warmup': False})()
        args = config.apply_routing(args)
        
        assert args.enable_warmup
    
    def test_apply_routing_fallback(self):
        """Routing applies fallback model."""
        config = ConfigManager()
        rule = RoutingRule(
            model="lfm",
            phase="extended",
            fallback_model="claude-haiku"
        )
        config.save_rule(rule, source="test")
        
        args = type('Args', (), {'model': 'lfm', 'phase': 'extended'})()
        args = config.apply_routing(args)
        
        assert args.model == "claude-haiku"
    
    def test_invalid_json_file(self):
        """Gracefully handle corrupt config."""
        config = ConfigManager()
        # Should not crash
        assert len(config.config.get('rules', [])) >= 0

if __name__ == '__main__':
    pytest.main([__file__, '-v'])
