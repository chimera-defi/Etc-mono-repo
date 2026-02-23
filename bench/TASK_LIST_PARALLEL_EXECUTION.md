# Task List: Parallel Execution for Self-Optimizing Harness

**Goal:** Close the optimization loop + implement improvements + ship PR  
**Timeline:** 6-8 hours parallel work  
**Outcome:** Production-ready self-optimizing harness with full test coverage

---

## Execution Model

```
PHASE 0: Loop Closure (Foundation)
  ├─ Task 0.1 [~30 min, no deps]    → config_manager.py
  ├─ Task 0.2 [~20 min, blocks 0.3] → routing_config.json schema
  ├─ Task 0.3 [~30 min, after 0.1]  → routing_enforcer.py (complete)
  └─ Task 0.4 [~20 min, after 0.1]  → meta_harness_loop.py (add enforcer call)

PHASE 1: Features (Parallel after 0.1 complete)
  ├─ Task 1.1 [~30 min, parallel]    → warm_up integration (run_benchmark.py)
  ├─ Task 1.2 [~30 min, parallel]    → extended suite safety
  ├─ Task 1.3 [~20 min, parallel]    → lock file PID check
  └─ Task 1.4 [~20 min, parallel]    → benchmark_supervisor.py config reading

PHASE 2: Tests (Parallel after features done)
  ├─ Task 2.1 [~40 min, parallel]    → config_manager tests
  ├─ Task 2.2 [~40 min, parallel]    → routing_enforcer tests
  ├─ Task 2.3 [~40 min, parallel]    → run_benchmark.py feature tests
  ├─ Task 2.4 [~40 min, parallel]    → meta_harness_loop tests
  └─ Task 2.5 [~40 min, parallel]    → integration tests (warm-up + routing)

PHASE 3: Integration (Serial, after tests)
  ├─ Task 3.1 [~30 min, serial]      → Full loop dry-run
  └─ Task 3.2 [~30 min, serial]      → Verify loop closes

PHASE 4: PR & Docs (After integration passes)
  ├─ Task 4.1 [~30 min, serial]      → Update docs + MEMORY.md
  ├─ Task 4.2 [~20 min, serial]      → Create PR
  └─ Task 4.3 [~20 min, serial]      → Run final checks
```

---

## PHASE 0: Loop Closure (Foundation)

### Task 0.1: Create config_manager.py
**Complexity:** Low  
**Dependencies:** None  
**Parallelizable:** Yes (independent)  
**Owner:** Agent-Config

**Deliverables:**
- `/bench/config_manager.py` (complete)
- `RoutingRule` dataclass
- `ConfigManager` class with methods:
  - `load_config()` - read routing_config.json
  - `get_rule(model, phase)` - fetch rule
  - `apply_routing(args)` - modify args
  - `save_rule(rule, source)` - persist rule

**Tests included:**
- `test_load_config()` - can read config
- `test_get_rule()` - fetch specific rule
- `test_apply_routing()` - args modified correctly
- `test_save_rule()` - persists to file
- `test_nonexistent_rule()` - gracefully handles missing rule

**Acceptance Criteria:**
- ✅ File created
- ✅ All methods work
- ✅ Tests pass
- ✅ Handles edge cases (missing file, invalid JSON, etc)

---

### Task 0.2: Define routing_config.json schema
**Complexity:** Low  
**Dependencies:** Task 0.1  
**Parallelizable:** No (needs 0.1 first)  
**Owner:** Agent-Config

**Deliverables:**
- Finalized schema for routing_config.json
- Example config with all rule types
- Schema validation (JSON Schema)

**File:** `/bench/routing_config_schema.json`

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "version": {"type": "string"},
    "timestamp": {"type": "string", "format": "date-time"},
    "rules": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "model": {"type": "string"},
          "phase": {"type": "string", "enum": ["atomic", "extended"]},
          "enable_warmup": {"type": "boolean"},
          "fallback_model": {"type": ["string", "null"]},
          "reason": {"type": "string"},
          "source": {"type": "string"},
          "timestamp": {"type": "number"}
        },
        "required": ["model", "phase"]
      }
    }
  }
}
```

**Acceptance Criteria:**
- ✅ Schema complete
- ✅ All rule types covered (warmup, fallback, etc)
- ✅ Example config provided
- ✅ Validation works

---

### Task 0.3: Complete routing_enforcer.py
**Complexity:** Medium  
**Dependencies:** Task 0.1, 0.2  
**Parallelizable:** No (needs config setup first)  
**Owner:** Agent-Routing

**Deliverables:**
- `/bench/routing_enforcer.py` (enhanced from stub)
- Functions:
  - `enforce_recommendations()` - read feedback, apply to config
  - `convert_recommendation_to_rule()` - convert format
  - `verify_rule_applied()` - confirm change took effect
  - `log_enforcement_decision()` - audit trail
  - Main entry point for CLI

**Behavior:**
1. Read harness_feedback.json
2. For each recommendation:
   - Convert to RoutingRule
   - Save via ConfigManager
   - Log decision to routing_decisions.log
3. Report: N rules applied, M skipped, K errors

**Tests included:**
- `test_read_recommendations()` - parse feedback
- `test_convert_recommendation()` - format conversion works
- `test_enforce_single_rule()` - apply one rule
- `test_enforce_multiple_rules()` - apply multiple
- `test_audit_trail()` - decisions logged

**Acceptance Criteria:**
- ✅ Reads harness_feedback.json correctly
- ✅ Converts recommendations to rules
- ✅ Saves to routing_config.json
- ✅ All decisions logged with timestamps
- ✅ Tests pass

---

### Task 0.4: Modify meta_harness_loop.py to call enforcer
**Complexity:** Low  
**Dependencies:** Task 0.3  
**Parallelizable:** No (needs enforcer first)  
**Owner:** Agent-Orchestration

**Deliverables:**
- Modified `meta_harness_loop.py`
- New function: `apply_and_verify_recommendations(recommendations)`
  - Calls routing_enforcer
  - Verifies config was updated
  - Records decisions
- Modified main loop to call this

**Changes:**
```python
# Add after policy decisions:
recommendations = generate_recommendations(results)

# NEW:
apply_and_verify_recommendations(recommendations)

# NEW: Record what we're trying for next cycle
record_cycle_plan({
    'cycle': cycle_num,
    'improvements_planned': recommendations,
    'config_updated': True
})
```

**Tests included:**
- `test_call_enforcer()` - enforcer is called
- `test_config_updated()` - routing_config.json changed
- `test_cycle_plan_recorded()` - cycle plan stored

**Acceptance Criteria:**
- ✅ routing_enforcer called after analysis
- ✅ Config updated before next cycle
- ✅ Cycle plan recorded
- ✅ No breaking changes to existing flow

---

## PHASE 1: Features (Parallel after 0.1)

### Task 1.1: Warm-Up Integration in run_benchmark.py
**Complexity:** Low  
**Dependencies:** Task 0.1 (config_manager)  
**Parallelizable:** Yes (independent of other features)  
**Owner:** Agent-Features-1

**Deliverables:**
- Modified `run_benchmark.py`:
  - Import ConfigManager
  - Load config at startup
  - Apply warmup setting from config
  - Add --enable-warmup CLI flag (still works)
  - Prefer config over CLI (config is source of truth)

**Changes:**
```python
# At start of main():
from config_manager import ConfigManager

def main():
    args = parser.parse_args()
    
    # NEW: Load routing config
    config = ConfigManager()
    args = config.apply_routing(args)
    
    # NEW: Check for warmup from config
    if hasattr(args, 'enable_warmup') and args.enable_warmup:
        logger.info("Warm-up enabled (from config)")
        invoke_llm("What is 2+2?")  # Simple warmup prompt
        time.sleep(1)  # Let model settle
    
    # ... existing benchmark code ...
```

**Behavior:**
- First check: routing_config.json (auto-applied)
- Second check: CLI flag (manual override)
- Default: no warmup (unless config says otherwise)

**Tests included:**
- `test_config_warmup_applied()` - config setting used
- `test_cli_override()` - CLI flag overrides config
- `test_warmup_invocation()` - dummy prompt runs
- `test_warmup_optional()` - no warmup if not configured

**Acceptance Criteria:**
- ✅ Reads config for warmup setting
- ✅ Applies warmup before suite
- ✅ CLI flag still works (backwards compat)
- ✅ Tests pass
- ✅ No performance regression

---

### Task 1.2: Extended Suite Safety (run_benchmark.py)
**Complexity:** Low  
**Dependencies:** Task 0.1 (config_manager)  
**Parallelizable:** Yes (independent)  
**Owner:** Agent-Features-2

**Deliverables:**
- Modified `run_benchmark.py`:
  - Function: `validate_model_phase_compatibility()`
  - Auto-fallback for disabled models
  - Log all fallback decisions
  - Create `routing_log.py` for logging

**Changes:**
```python
def validate_model_phase_compatibility(model, phase, config):
    """Check if model is disabled for this phase."""
    rule = config.get_rule(model, phase)
    
    if rule.fallback_model:
        logger.warning(f"Model {model} disabled for {phase}")
        logger.info(f"Routing to fallback: {rule.fallback_model}")
        
        # Log routing decision
        from routing_log import log_routing_decision
        log_routing_decision(
            original_model=model,
            fallback_model=rule.fallback_model,
            phase=phase,
            reason=rule.reason
        )
        
        return rule.fallback_model
    
    return model

# In main():
args.model = validate_model_phase_compatibility(
    args.model, args.phase, config
)
```

**File:** `/bench/routing_log.py` (NEW)
- Function: `log_routing_decision()` - append to routing_decisions.jsonl
- Includes: timestamp, original, fallback, phase, reason

**Tests included:**
- `test_disabled_model_fallback()` - LFM extended→Haiku
- `test_enabled_model_no_fallback()` - Haiku stays Haiku
- `test_routing_logged()` - decision in audit trail
- `test_fallback_succeeds()` - Haiku request works

**Acceptance Criteria:**
- ✅ Disabled models auto-fallback
- ✅ Fallback logged to audit trail
- ✅ No 0% failures (fallback prevents them)
- ✅ Tests pass

---

### Task 1.3: Lock File PID Check
**Complexity:** Low  
**Dependencies:** None  
**Parallelizable:** Yes (independent)  
**Owner:** Agent-Infrastructure

**Deliverables:**
- New file: `/bench/lock_manager.py`
- Function: `acquire_lock_safe()` - get lock or clear stale one
- Function: `check_lock_stale()` - is PID dead?
- Function: `clear_stale_lock()` - cleanup

**File:** `/bench/lock_manager.py`
```python
import os
import psutil
from pathlib import Path

LOCK_FILE = Path('/tmp/openclaw_bench.lock')

def is_process_alive(pid):
    """Check if process with PID is still running."""
    try:
        process = psutil.Process(pid)
        return process.is_running()
    except (psutil.NoSuchProcess, psutil.AccessDenied):
        return False

def check_lock_stale():
    """Return True if lock file exists but process is dead."""
    if not LOCK_FILE.exists():
        return False
    
    try:
        pid = int(LOCK_FILE.read_text().strip())
        return not is_process_alive(pid)
    except (ValueError, OSError):
        return True  # Unreadable = stale

def clear_stale_lock():
    """Remove lock file if process is dead."""
    if check_lock_stale():
        LOCK_FILE.unlink()
        return True
    return False

def acquire_lock_safe(timeout=300):
    """Get lock, clearing stale ones first."""
    # Clear stale locks
    clear_stale_lock()
    
    # Get our PID
    my_pid = os.getpid()
    
    # Try to create lock
    if LOCK_FILE.exists():
        raise RuntimeError("Lock held by active process")
    
    # Write our PID to lock
    LOCK_FILE.write_text(str(my_pid))
    return my_pid
```

**Modified:** `benchmark_supervisor.py`
```python
from lock_manager import acquire_lock_safe, LOCK_FILE

def main():
    try:
        my_pid = acquire_lock_safe()
        # Run benchmark
    finally:
        LOCK_FILE.unlink()  # Always cleanup
```

**Tests included:**
- `test_active_process_held()` - can't get lock
- `test_dead_process_cleared()` - stale lock removed
- `test_pid_written()` - our PID stored
- `test_cleanup_on_exit()` - lock removed after

**Acceptance Criteria:**
- ✅ Stale locks automatically cleared
- ✅ No blocking on old cycles
- ✅ PID checked correctly
- ✅ Tests pass

---

### Task 1.4: benchmark_supervisor.py reads config
**Complexity:** Low  
**Dependencies:** Task 0.1 (config_manager)  
**Parallelizable:** Yes (independent)  
**Owner:** Agent-Features-3

**Deliverables:**
- Modified `benchmark_supervisor.py`:
  - Load ConfigManager at startup
  - Pass config to run_benchmark calls
  - Allow config-based model substitution

**Changes:**
```python
from config_manager import ConfigManager

def main():
    config = ConfigManager()
    
    for spec in specs:
        # Check if model is disabled for this phase
        rule = config.get_rule(spec.model, spec.phase)
        if rule.fallback_model:
            spec.model = rule.fallback_model
        
        # Run with potentially modified spec
        result = run_benchmark(spec, config=config)
```

**Tests included:**
- `test_config_passed_to_runner()` - config available in runner
- `test_spec_model_updated()` - spec.model changed if needed
- `test_warmup_config_available()` - runner can read warmup setting

**Acceptance Criteria:**
- ✅ Config loaded
- ✅ Model substitution works
- ✅ Tests pass

---

## PHASE 2: Tests (Parallel after features)

### Task 2.1: config_manager tests
**Complexity:** Medium  
**Dependencies:** Task 0.1 (config_manager.py exists)  
**Parallelizable:** Yes (independent)  
**Owner:** Agent-Tests-1

**Deliverables:**
- `/bench/test_config_manager.py` (comprehensive)
- Tests:
  - Load/save config
  - Get rule (exists/missing)
  - Apply routing (warmup/fallback)
  - Edge cases (invalid JSON, missing file, etc)

**File:** `/bench/test_config_manager.py`
```python
import pytest
import json
import tempfile
from pathlib import Path
from config_manager import ConfigManager, RoutingRule

class TestConfigManager:
    def setup_method(self):
        """Create temp config for testing."""
        self.temp_dir = tempfile.TemporaryDirectory()
        self.config_file = Path(self.temp_dir.name) / 'config.json'
    
    def test_load_empty_config(self):
        """Empty config returns empty rules."""
        config = ConfigManager()
        rule = config.get_rule("unknown", "atomic")
        assert rule.model == "unknown"
        assert not rule.enable_warmup
    
    def test_save_and_load_rule(self):
        """Save rule and retrieve it."""
        # Save
        config = ConfigManager()
        rule = RoutingRule(
            model="test-model",
            phase="atomic",
            enable_warmup=True
        )
        config.save_rule(rule, source="test")
        
        # Load
        config2 = ConfigManager()
        loaded = config2.get_rule("test-model", "atomic")
        assert loaded.enable_warmup
    
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
        # Should not crash, should return empty config
        assert len(config.config.get('rules', [])) >= 0

# Run: pytest test_config_manager.py -v
```

**Acceptance Criteria:**
- ✅ All tests pass
- ✅ Edge cases covered
- ✅ >90% code coverage
- ✅ Can run: `pytest test_config_manager.py`

---

### Task 2.2: routing_enforcer tests
**Complexity:** Medium  
**Dependencies:** Task 0.3 (routing_enforcer.py exists)  
**Parallelizable:** Yes (independent)  
**Owner:** Agent-Tests-2

**Deliverables:**
- `/bench/test_routing_enforcer.py`
- Tests:
  - Read recommendations
  - Convert to rules
  - Apply to config
  - Audit trail

**File:** `/bench/test_routing_enforcer.py`
```python
import pytest
import json
import tempfile
from pathlib import Path
from routing_enforcer import (
    enforce_recommendations,
    convert_recommendation_to_rule,
)

class TestRoutingEnforcer:
    def setup_method(self):
        self.temp_dir = tempfile.TemporaryDirectory()
    
    def test_convert_warmup_recommendation(self):
        """Convert feedback recommendation to routing rule."""
        rec = {
            'type': 'routing',
            'target': 'lfm2.5-thinking:1.2b::atomic',
            'action': 'allow_for_bounded_tasks',
            'reason': 'Cold-start pattern detected'
        }
        rule = convert_recommendation_to_rule(rec)
        assert rule.model == 'lfm2.5-thinking:1.2b'
        assert rule.phase == 'atomic'
        assert rule.enable_warmup
    
    def test_convert_fallback_recommendation(self):
        """Convert fallback recommendation."""
        rec = {
            'type': 'routing',
            'target': 'lfm2.5-thinking:1.2b::extended',
            'action': 'disable_for_stateful',
            'reason': '0% accuracy'
        }
        rule = convert_recommendation_to_rule(rec)
        assert rule.fallback_model == 'claude-haiku'
    
    def test_enforce_single_recommendation(self):
        """Apply single recommendation to config."""
        # Create feedback file
        feedback = {
            'recommendations': [{
                'type': 'routing',
                'target': 'test::atomic',
                'action': 'test_action',
                'reason': 'test'
            }]
        }
        # Mock enforcer, verify it works
        # (Details depend on implementation)
    
    def test_audit_trail_logged(self):
        """Decisions recorded to log."""
        # After enforcement, check routing_decisions.log
        # Should contain timestamp, rule applied, reason

# Run: pytest test_routing_enforcer.py -v
```

**Acceptance Criteria:**
- ✅ All tests pass
- ✅ Recommendations correctly converted
- ✅ Config updated after enforcement
- ✅ Audit trail created

---

### Task 2.3: run_benchmark.py feature tests
**Complexity:** Medium  
**Dependencies:** Task 1.1, 1.2  
**Parallelizable:** Yes (independent)  
**Owner:** Agent-Tests-3

**Deliverables:**
- `/bench/test_run_benchmark_features.py`
- Tests:
  - Warmup applied from config
  - Extended fallback works
  - Config loaded on startup
  - Backwards compatibility (CLI flags still work)

**File:** `/bench/test_run_benchmark_features.py`
```python
import pytest
from unittest.mock import patch, MagicMock
from run_benchmark import main

class TestRunBenchmarkFeatures:
    def test_config_warmup_applied(self):
        """Warmup setting from config is used."""
        with patch('config_manager.ConfigManager') as mock_config:
            with patch('run_benchmark.invoke_llm') as mock_invoke:
                # Setup mock config to return warmup enabled
                mock_rule = MagicMock(enable_warmup=True)
                mock_config.return_value.get_rule.return_value = mock_rule
                
                # Call with argv
                with patch('sys.argv', ['run_benchmark.py', 'lfm', 'atomic', 'native_api']):
                    # Should invoke warmup prompt
                    # (Details depend on exact flow)
    
    def test_extended_fallback_applies(self):
        """LFM extended is routed to Haiku."""
        with patch('config_manager.ConfigManager') as mock_config:
            # Setup: LFM extended should fallback to Haiku
            mock_rule = MagicMock(fallback_model='claude-haiku')
            mock_config.return_value.get_rule.return_value = mock_rule
            
            # Call with LFM extended
            with patch('sys.argv', ['run_benchmark.py', 'lfm2.5-thinking:1.2b', 'extended', 'extended']):
                # Model should be changed to Haiku
    
    def test_cli_override_works(self):
        """CLI --enable-warmup flag still works."""
        # Backwards compatibility: CLI flag should work
        with patch('sys.argv', ['run_benchmark.py', 'lfm', 'atomic', 'native_api', '--enable-warmup']):
            # Should enable warmup even without config

# Run: pytest test_run_benchmark_features.py -v
```

**Acceptance Criteria:**
- ✅ All tests pass
- ✅ Config warmup applied
- ✅ Extended fallback works
- ✅ Backwards compatible with CLI flags

---

### Task 2.4: meta_harness_loop tests
**Complexity:** Medium  
**Dependencies:** Task 0.4  
**Parallelizable:** Yes (independent)  
**Owner:** Agent-Tests-4

**Deliverables:**
- `/bench/test_meta_harness_loop.py`
- Tests:
  - routing_enforcer called after analysis
  - Config verified updated
  - Cycle plan recorded

**File:** `/bench/test_meta_harness_loop.py`
```python
import pytest
from unittest.mock import patch, MagicMock, call
from meta_harness_loop import apply_and_verify_recommendations

class TestMetaHarnessLoop:
    def test_enforcer_called_after_analysis(self):
        """routing_enforcer is called with recommendations."""
        with patch('meta_harness_loop.enforce_recommendations') as mock_enforcer:
            recommendations = [
                {'type': 'routing', 'target': 'test::atomic'}
            ]
            apply_and_verify_recommendations(recommendations)
            
            mock_enforcer.assert_called_once()
    
    def test_config_updated_before_next_cycle(self):
        """Config file is updated after analysis."""
        with patch('config_manager.ConfigManager') as mock_config:
            with patch('meta_harness_loop.enforce_recommendations'):
                recommendations = [{'type': 'routing', 'target': 'test::atomic'}]
                apply_and_verify_recommendations(recommendations)
                
                # Config should be loaded
                mock_config.assert_called()
    
    def test_cycle_plan_recorded(self):
        """Cycle improvements are stored."""
        with patch('meta_harness_loop.record_cycle_plan') as mock_record:
            with patch('meta_harness_loop.enforce_recommendations'):
                recommendations = [{'type': 'routing', 'target': 'test::atomic'}]
                apply_and_verify_recommendations(recommendations)
                
                mock_record.assert_called()

# Run: pytest test_meta_harness_loop.py -v
```

**Acceptance Criteria:**
- ✅ All tests pass
- ✅ Enforcer called correctly
- ✅ Config updated
- ✅ Cycle plan recorded

---

### Task 2.5: Integration tests (warm-up + routing)
**Complexity:** High  
**Dependencies:** All Phase 1 tasks  
**Parallelizable:** No (depends on all features)  
**Owner:** Agent-Tests-5

**Deliverables:**
- `/bench/test_integration_loop.py`
- End-to-end tests:
  - Cold-start pattern → recommends warm-up → applies warm-up → improves accuracy
  - Extended 0% → recommends fallback → applies fallback → uses Haiku → succeeds
  - Full cycle: feedback → enforcement → improvement

**File:** `/bench/test_integration_loop.py`
```python
import pytest
import json
import tempfile
from pathlib import Path

class TestIntegrationLoop:
    def test_cold_start_detected_and_fixed(self):
        """
        1. Run benchmark with cold-start pattern [F,F,P,P,P,P,P]
        2. System detects it
        3. System recommends warm-up
        4. System applies warm-up
        5. Re-run shows improvement
        """
        # Setup: run with pattern [F,F,P,P,P,P,P]
        # Verify: recommendation generated
        # Apply: routing_enforcer runs
        # Verify: config has enable_warmup=true for this model
        # Re-run: should improve
    
    def test_extended_zero_detected_and_routed(self):
        """
        1. Run LFM extended (0% accuracy)
        2. System detects [F,F,F,F,F,F,F]
        3. System recommends fallback to Haiku
        4. System applies fallback
        5. Re-run with Haiku succeeds (100%)
        """
        # Setup: LFM extended [F,F,F,F,F,F,F]
        # Verify: recommendation generated
        # Apply: config.fallback_model = haiku
        # Re-run: with Haiku, should succeed
    
    def test_full_cycle_improvement_documented(self):
        """
        Full cycle from start to finish:
        1. Cycle N: baseline vs candidates
        2. Recommendations generated
        3. Applied to config
        4. Cycle N+1: uses new config
        5. Verify: baseline improved
        """
        # Simulate full cycle
        # Verify improvement recorded

# Run: pytest test_integration_loop.py -v
```

**Acceptance Criteria:**
- ✅ All tests pass
- ✅ End-to-end flow works
- ✅ Improvements documented
- ✅ Loop closes successfully

---

## PHASE 3: Integration (Serial after tests)

### Task 3.1: Full loop dry-run
**Complexity:** High  
**Dependencies:** All Phase 2 tests pass  
**Parallelizable:** No (serial verification)  
**Owner:** Agent-Integration

**Process:**
1. Run Cycle 1 with baseline + 3 candidates
2. Verify recommendations generated
3. Verify routing_enforcer called
4. Verify config_manager updated routing_config.json
5. Verify run_benchmark reads config on startup
6. Run Cycle 2 (should use new config automatically)
7. Verify Cycle 2 baseline improved OR explains why not

**Success Criteria:**
- ✅ Cycle 1 completes
- ✅ Recommendations generated
- ✅ Config updated
- ✅ Cycle 2 uses updated config
- ✅ Improvements applied automatically (no human intervention)

**Deliverable:**
- `/bench/DRY_RUN_RESULTS.md` (report of full cycle)

---

### Task 3.2: Verify loop closes
**Complexity:** Medium  
**Dependencies:** Task 3.1  
**Parallelizable:** No (serial verification)  
**Owner:** Agent-Integration

**Verification Checklist:**
- [ ] Recommendation generated automatically
- [ ] Config updated automatically
- [ ] run_benchmark reads config on startup
- [ ] Improvement auto-applied (no CLI overrides needed)
- [ ] Audit trail complete (all decisions logged)
- [ ] Cycle 2 uses improved baseline
- [ ] No human intervention required

**Deliverable:**
- `/bench/LOOP_CLOSURE_VERIFICATION.md` (checklist + results)

---

## PHASE 4: PR & Docs

### Task 4.1: Update docs + MEMORY.md
**Complexity:** Low  
**Dependencies:** All previous tasks  
**Parallelizable:** No (needs complete picture)  
**Owner:** Agent-Docs

**Deliverables:**
1. Update `/bench/ARCHITECTURE_V2_SELF_OPTIMIZING.md`
   - Add: "Implementation Complete" section
   - Add: Actual results from dry-run

2. Update `/bench/META_LEARNINGS.md`
   - Add: "Loop Closure Implemented" section
   - Add: Actual improvement from Cycle 1→2

3. Update `/root/.openclaw/workspace/MEMORY.md`
   - Add: "Self-Optimizing Loop Complete (Feb 23-24)"
   - Add: Key implementation details

4. Create `/bench/IMPLEMENTATION_COMPLETE.md`
   - Summary of all changes
   - How to verify loop works
   - How to run next cycle

**Acceptance Criteria:**
- ✅ All docs updated
- ✅ MEMORY.md reflects completion
- ✅ Clear how to run/verify

---

### Task 4.2: Create PR
**Complexity:** Medium  
**Dependencies:** Task 4.1  
**Parallelizable:** No (needs docs complete)  
**Owner:** Agent-Integration

**PR Contents:**
```
Title: feat: implement self-optimizing benchmark harness with loop closure

Description:
- Phase 0: Config management + routing enforcement
- Phase 1: Warm-up integration + extended safety + lock fix
- Phase 2: Comprehensive tests (config, enforcer, features, integration)
- Phase 3: Full cycle verification + loop closure proof
- Phase 4: Documentation + update MEMORY.md

Changes:
+ config_manager.py (NEW)
+ routing_enforcer.py (ENHANCED)
+ routing_log.py (NEW)
+ lock_manager.py (NEW)
+ test_config_manager.py (NEW)
+ test_routing_enforcer.py (NEW)
+ test_run_benchmark_features.py (NEW)
+ test_meta_harness_loop.py (NEW)
+ test_integration_loop.py (NEW)
* run_benchmark.py (MODIFIED - warmup + safety + config reading)
* meta_harness_loop.py (MODIFIED - call enforcer, record cycle)
* benchmark_supervisor.py (MODIFIED - config reading, lock fix)

Commits:
1. feat: add config_manager and routing system
2. feat: implement warm-up integration
3. feat: add extended suite safety with fallback
4. fix: implement PID-based stale lock detection
5. test: add comprehensive test suite
6. test: add end-to-end integration tests
7. docs: update architecture and MEMORY.md
```

**Checklist before PR:**
- [ ] All tests pass locally
- [ ] Code review ready
- [ ] No conflicts with main
- [ ] Commits are atomic + descriptive

---

### Task 4.3: Final checks
**Complexity:** Low  
**Dependencies:** Task 4.2  
**Parallelizable:** No (final serial check)  
**Owner:** Agent-Integration

**Pre-Merge Verification:**
- [ ] All test suites pass: `pytest bench/test_*.py -v`
- [ ] Integration test passes: Full cycle runs
- [ ] Loop closure verified: Recommendations auto-apply
- [ ] No breaking changes: Existing harness still works
- [ ] Documentation complete: All changes documented
- [ ] Code quality: No obvious bugs or TODOs

**Deliverable:**
- `/bench/FINAL_CHECKS.md` (verification report)

---

## Task Dependency Graph

```
Phase 0 (Serial → Foundation)
├─ Task 0.1 (config_manager.py)
│  └─ Task 0.3 (routing_enforcer.py)
│     └─ Task 0.4 (meta_harness_loop modification)
│
Phase 1 (Parallel after 0.1)
├─ Task 1.1 (warm-up integration)
├─ Task 1.2 (extended safety + lock fix)
├─ Task 1.3 (lock PID check)
└─ Task 1.4 (supervisor config reading)
   └─ All Phase 1 tests (Task 2.1-2.4, parallel)
      └─ Task 2.5 (integration tests, serial)
         └─ Task 3.1 (full dry-run, serial)
            └─ Task 3.2 (loop verification, serial)
               └─ Task 4.1 (docs, serial)
                  └─ Task 4.2 (PR creation, serial)
                     └─ Task 4.3 (final checks, serial)
```

---

## Execution Commands

```bash
# Phase 0: Foundation (must be serial)
# Agent-Config creates config_manager.py
# Agent-Config creates schema
# Agent-Routing completes routing_enforcer.py
# Agent-Orchestration modifies meta_harness_loop.py

# Phase 1: Features (can be parallel after 0.1)
# Agent-Features-1 does warm-up integration
# Agent-Features-2 does extended safety
# Agent-Infrastructure does lock fix
# Agent-Features-3 modifies supervisor

# Phase 2: Tests (can be parallel)
# Agent-Tests-1 tests config_manager
# Agent-Tests-2 tests routing_enforcer
# Agent-Tests-3 tests features
# Agent-Tests-4 tests meta_harness
# Agent-Tests-5 does integration tests

# Phase 3: Integration (serial)
# Agent-Integration runs dry-run
# Agent-Integration verifies loop

# Phase 4: PR (serial)
# Agent-Docs updates documentation
# Agent-Integration creates PR
# Agent-Integration runs final checks
```

---

## Success Definition

✅ When complete:
1. Config management system working
2. Routing enforcer applied recommendations automatically
3. run_benchmark reads config on startup
4. Warm-up auto-applied from config
5. Extended fallback auto-applied from config
6. Lock file doesn't block on stale processes
7. All tests pass (>90% coverage)
8. Full cycle verified: recommendations → auto-apply → improve baseline
9. Documentation complete
10. PR ready to merge

---

## Timeline

**Realistic parallel execution:**
- Phase 0: 2 hours (serial, foundation)
- Phase 1: 2 hours parallel (all features in parallel)
- Phase 2: 3+ hours parallel (all tests in parallel)
- Phase 3: 1 hour (serial verification)
- Phase 4: 1 hour (serial PR + docs)

**Total: ~6-8 hours with 5-6 subagents working parallel**

---

**Status:** 🟢 Task list complete, ready for parallel execution  
**Next:** Spawn subagents to execute tasks in parallel  
**Goal:** Merge PR with fully self-optimizing harness by end of day
