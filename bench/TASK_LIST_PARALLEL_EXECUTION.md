# Task List: Parallel Execution

> **Note:** Detailed implementation guide → See `IMPLEMENTATION_CHECKLIST.md`

**Goal:** Close the optimization loop + implement improvements + ship PR  
**Timeline:** 6-8 hours parallel work  
**Outcome:** Production-ready self-optimizing harness with full test coverage

---

## Quick Reference

| Phase | Description | Duration |
|-------|-------------|----------|
| 0 | Loop Closure (Foundation) | 2 hours |
| 1 | Features (Parallel) | 2 hours |
| 2 | Tests (Parallel) | 3+ hours |
| 3 | Integration (Serial) | 1 hour |
| 4 | PR & Docs (Serial) | 1 hour |

**Total:** ~6-8 hours with 5-6 subagents

---

## Phase 0: Foundation (Serial)

| Task | Description | Dependencies |
|------|-------------|--------------|
| 0.1 | Create `config_manager.py` | None |
| 0.2 | Define `routing_config.json` schema | 0.1 |
| 0.3 | Complete `routing_enforcer.py` | 0.1, 0.2 |
| 0.4 | Modify `meta_harness_loop.py` to call enforcer | 0.3 |

---

## Phase 1: Features (Parallel after 0.1)

| Task | Description | Dependencies |
|------|-------------|--------------|
| 1.1 | Warm-up integration in `run_benchmark.py` | 0.1 |
| 1.2 | Extended suite safety (auto-fallback) | 0.1 |
| 1.3 | Lock file PID check (`lock_manager.py`) | None |
| 1.4 | `benchmark_supervisor.py` reads config | 0.1 |

---

## Phase 2: Tests (Parallel after features)

| Task | Description | Dependencies |
|------|-------------|--------------|
| 2.1 | `test_config_manager.py` | 0.1 |
| 2.2 | `test_routing_enforcer.py` | 0.3 |
| 2.3 | `test_run_benchmark_features.py` | 1.1, 1.2 |
| 2.4 | `test_meta_harness_loop.py` | 0.4 |
| 2.5 | Integration tests (warm-up + routing) | All Phase 1 |

---

## Phase 3: Integration (Serial)

| Task | Description | Dependencies |
|------|-------------|--------------|
| 3.1 | Full loop dry-run | All Phase 2 |
| 3.2 | Verify loop closes | 3.1 |

---

## Phase 4: PR & Docs (Serial)

| Task | Description | Dependencies |
|------|-------------|--------------|
| 4.1 | Update docs + MEMORY.md | All |
| 4.2 | Create PR | 4.1 |
| 4.3 | Run final checks | 4.2 |

---

## Dependency Graph

```
Phase 0 (Serial)
├─ 0.1 → 0.3 → 0.4

Phase 1 (Parallel after 0.1)
├─ 1.1, 1.2, 1.3, 1.4

Phase 2 (Parallel)
├─ 2.1, 2.2, 2.3, 2.4 → 2.5

Phase 3 (Serial)
├─ 3.1 → 3.2 → 4.1 → 4.2 → 4.3
```

---

## Execution Commands

```bash
# Phase 0: Foundation (serial)
Agent-Config creates config_manager.py
Agent-Config creates schema
Agent-Routing completes routing_enforcer.py
Agent-Orchestration modifies meta_harness_loop.py

# Phase 1: Features (parallel after 0.1)
Agent-Features-1 does warm-up integration
Agent-Features-2 does extended safety
Agent-Infrastructure does lock fix
Agent-Features-3 modifies supervisor

# Phase 2: Tests (parallel)
Agent-Tests-1 tests config_manager
Agent-Tests-2 tests routing_enforcer
Agent-Tests-3 tests features
Agent-Tests-4 tests meta_harness
Agent-Tests-5 does integration tests

# Phase 3: Integration (serial)
Agent-Integration runs dry-run
Agent-Integration verifies loop

# Phase 4: PR (serial)
Agent-Docs updates documentation
Agent-Integration creates PR
Agent-Integration runs final checks
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

## Files Reference

### Core Python Scripts
- `run_benchmark.py` - Main runner
- `benchmark_supervisor.py` - Variance detection
- `meta_harness_loop.py` - Cycle orchestration
- `config_manager.py` - Config system
- `routing_enforcer.py` - Auto-apply recommendations
- `harness_feedback_loop.py` - Recommendations
- `self_optimizing_policy.py` - Decision gates
- `lock_manager.py` - Stale lock handling
- `routing_log.py` - Audit trail

### Tests
- `test_config_manager.py`
- `test_integration_loop.py`
- `test_warmup_invoked_when_config_enabled.py`

### Documentation
- `IMPLEMENTATION_CHECKLIST.md` - **Detailed implementation guide**
- `ARCHITECTURE_V2_SELF_OPTIMIZING.md` - System architecture
- `EXECUTE_LOCALLY.md` - How to run
- `META_LEARNINGS.md` - Learnings
- `ROUTING_DECISIONS.md` - Routing logic

---

**Status:** 🟢 Ready for parallel execution  
**Next:** Spawn subagents to execute tasks in parallel  
**Goal:** Merge PR with fully self-optimizing harness by end of day
