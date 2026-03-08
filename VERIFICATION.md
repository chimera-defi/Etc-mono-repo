# Verification Checkpoints

**Mandatory validation BEFORE reporting any results.**

## Verification Function (Apply to all outputs)

```python
def verify_output(file_path, expected_size_min=100, json_validate=False):
    """
    Verify output artifact exists and is valid.
    
    Args:
        file_path: Path to check
        expected_size_min: Minimum file size (bytes)
        json_validate: If True, parse as JSON and check for required fields
    
    Returns:
        dict with {success: bool, errors: [list of issues]}
    """
    from pathlib import Path
    import json
    
    errors = []
    path = Path(file_path)
    
    # Check 1: File exists
    if not path.exists():
        return {"success": False, "errors": [f"File does not exist: {file_path}"]}
    
    # Check 2: File size
    size = path.stat().st_size
    if size < expected_size_min:
        errors.append(f"File too small: {size} bytes (min: {expected_size_min})")
    
    # Check 3: Timestamp realistic (within last hour)
    import time
    mtime = path.stat().st_mtime
    now = time.time()
    age_seconds = now - mtime
    if age_seconds > 3600:
        errors.append(f"File too old: {age_seconds/60:.0f} minutes")
    
    # Check 4: JSON validation if requested
    if json_validate:
        try:
            data = json.loads(path.read_text())
            # Check for required fields
            if isinstance(data, dict):
                if not data.get('timestamp'):
                    errors.append("Missing 'timestamp' field")
                if not data.get('results') and not data.get('prompt_results'):
                    errors.append("Missing results data")
            return {"success": len(errors) == 0, "errors": errors, "data": data}
        except json.JSONDecodeError as e:
            return {"success": False, "errors": [f"Invalid JSON: {e}"]}
    
    return {"success": len(errors) == 0, "errors": errors}
```

## Mandatory Checkpoint Pattern

**For every task that produces output:**

1. **Execute work** (benchmark, script, etc.)
2. **Verify immediately** (before any reporting):
   ```bash
   # Check file exists
   ls -lh <output_file>
   
   # Check JSON if applicable
   python3 -m json.tool <output_file> | head -20
   
   # Check specific metrics
   grep -E "tok/s|tokens|success" <output_file>
   ```
3. **Report ONLY if verification passes**
4. **Report verification status** to user (what was checked, what passed/failed)

## Temperature Settings for Accuracy

- **Verification/analysis tasks:** `temperature=0.1` (factual, deterministic)
- **Code generation:** `temperature=0.5` (balanced)
- **Creative writing:** `temperature=0.7` (default, more variable)
- **Reasoning/tool-use:** `temperature=0.3` (careful, less hallucination)

## Red Flags (Hallucination Indicators)

- ❌ Subagent claims completion but file doesn't exist
- ❌ Timestamp in file is older than subagent start time
- ❌ JSON has empty required fields
- ❌ Metrics can't be traced in source code
- ❌ Claimed success but errors reported in output
- ❌ File size is suspiciously small (typically < 500 bytes means fake)

## Subagent Prompt Template (with Verification)

```
[Task description]

CRITICAL: Before reporting success:
1. Verify output file exists: ls -lh <path>
2. Validate JSON if applicable: python3 -m json.tool <path>
3. Check timestamps match execution time
4. Report verification status

DO NOT claim success without this verification.
If verification fails, report the exact error.
```

---

**This is non-negotiable.** Every completion claim must be backed by verified evidence.

## Meta Learnings (Feb 27, 2026 — Phases A/B/C)

1. **Single-entrypoint enforcement works**
   - Consolidating benchmark flows into `bench/core/run_benchmark.py` reduced drift from side scripts.
   - Side scripts should be wrappers/deprecated shims, not alternate sources of truth.

2. **Schema + artifact verification gate is mandatory**
   - Every phase claim must be backed by actual output files, parse checks, and timestamp sanity.
   - PR comments should include explicit validation steps and observed outputs.

3. **Backend benchmarking on CPU-only hosts requires exclusive windows**
   - Running Ollama and llama.cpp concurrently skews/invalidates numbers due to shared CPU saturation.
   - Use dedicated windows or stop competing local inference workloads before backend A/B comparison.

4. **Subagent/Codex execution policy**
   - Long, multi-step coding work can run in ACP/Codex subagents.
   - Final truth still comes from main-session verification after subagent completion.
