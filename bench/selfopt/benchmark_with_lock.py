#!/usr/bin/env python3
"""
Benchmark runner with lock checking for qwen3.5 + glm comparison.
Only runs qwen3.5:35b and glm-4.7-flash (atomic + extended phases).
Uses file-based locking to prevent concurrent runs.
"""

import fcntl
import json
import os
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path

# Configuration
ROOT = Path('/root/.openclaw/workspace/bench')
RESULTS_DIR = ROOT / 'results'
CANONICAL_FILE = RESULTS_DIR / 'canonical.json'
LOCK_FILE = Path('/tmp/benchmark_qwen_glm.lock')
RUNNER = ROOT / 'core' / 'run_benchmark.py'

# Models to test (as specified - only qwen3.5 + glm)
MODELS = ['qwen3.5:35b', 'glm-4.7-flash']
PHASES = ['atomic', 'extended']

# Baseline model for comparison (lfm2.5)
BASELINE_MODEL = 'lfm2.5-thinking:1.2b'
BASELINE_ACCURACY = 0.82  # From canonical.json

# Lock file timeout (seconds)
LOCK_TIMEOUT = 5


def log(msg):
    """Simple timestamped logging."""
    ts = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f'[{ts}] {msg}', flush=True)


def check_processes():
    """
    Check for any running benchmark processes.
    Returns True if a benchmark is already running.
    """
    # Check for python3 processes running benchmark
    try:
        result = subprocess.run(
            ['pgrep', '-f', 'python3.*benchmark'],
            capture_output=True,
            text=True,
            timeout=10
        )
        if result.returncode == 0 and result.stdout.strip():
            pids = result.stdout.strip().split('\n')
            # Filter out our own process
            our_pid = os.getpid()
            other_pids = [p for p in pids if p and int(p) != our_pid]
            if other_pids:
                log(f'Found running benchmark processes: {other_pids}')
                return True
    except Exception as e:
        log(f'Warning: Could not check processes: {e}')

    # Check supervisor_runs for active runs
    supervisor_runs = ROOT / 'supervisor_runs'
    if supervisor_runs.exists():
        for run_dir in supervisor_runs.iterdir():
            if not run_dir.is_dir() or run_dir.name.startswith('.'):
                continue
            manifest = run_dir / 'manifest.json'
            if manifest.exists():
                try:
                    data = json.loads(manifest.read_text())
                    status = data.get('status', 'unknown')
                    if status == 'running':
                        log(f'Found running supervisor run: {run_dir.name} (status: {status})')
                        return True
                except Exception:
                    pass

    return False


def acquire_lock():
    """
    Acquire exclusive lock using file-based locking.
    Returns lock file handle if successful, None otherwise.
    """
    try:
        # Ensure parent directory exists
        LOCK_FILE.parent.mkdir(parents=True, exist_ok=True)
        
        # Open lock file (create if doesn't exist)
        lock_fd = open(LOCK_FILE, 'w')
        
        # Try non-blocking lock
        fcntl.flock(lock_fd.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
        
        # Write PID to lock file
        lock_fd.write(str(os.getpid()))
        lock_fd.flush()
        
        log(f'Lock acquired (PID: {os.getpid()})')
        return lock_fd
    except (IOError, OSError) as e:
        log(f'Could not acquire lock: {e}')
        if lock_fd:
            lock_fd.close()
        return None


def release_lock(lock_fd):
    """Release the lock file."""
    if lock_fd:
        try:
            fcntl.flock(lock_fd.fileno(), fcntl.LOCK_UN)
            lock_fd.close()
            if LOCK_FILE.exists():
                LOCK_FILE.unlink()
            log('Lock released')
        except Exception as e:
            log(f'Warning: Error releasing lock: {e}')


def run_benchmark(model, phase, variant='atomic', timeout=120):
    """
    Run a single benchmark for the given model/phase.
    Returns the result dictionary.
    """
    log(f'Running benchmark: {model} / {phase} ({variant})')
    
    start_time = time.time()
    
    cmd = [
        'python3', str(RUNNER),
        model, phase, variant,
        '--timeout', str(timeout),
        '--max-retries', '1'
    ]
    
    try:
        result = subprocess.run(
            cmd,
            cwd='/root/.openclaw/workspace',
            capture_output=True,
            text=True,
            timeout=timeout + 30
        )
        
        elapsed = time.time() - start_time
        
        # Try to parse results from the output
        # The run_benchmark.py should output JSON results
        # Let's check for result file or parse from stdout
        results = {
            'model': model,
            'phase': phase,
            'variant': variant,
            'returncode': result.returncode,
            'elapsed_s': round(elapsed, 2),
            'timestamp': time.time(),
        }
        
        # Look for results in stdout (last JSON object)
        stdout = result.stdout
        stderr = result.stderr
        
        # Try to extract JSON from stdout
        last_json = None
        for line in stdout.strip().split('\n'):
            line = line.strip()
            if line.startswith('{') and line.endswith('}'):
                try:
                    last_json = json.loads(line)
                except json.JSONDecodeError:
                    pass
        
        if last_json:
            results.update(last_json)
        
        results['stdout_tail'] = '\n'.join(stdout.splitlines()[-10:]) if stdout else ''
        results['stderr_tail'] = '\n'.join(stderr.splitlines()[-10:]) if stderr else ''
        
        return results
        
    except subprocess.TimeoutExpired:
        elapsed = time.time() - start_time
        log(f'TIMEOUT: {model} / {phase} after {elapsed:.1f}s')
        return {
            'model': model,
            'phase': phase,
            'variant': variant,
            'returncode': -1,
            'error': 'timeout',
            'elapsed_s': round(elapsed, 2),
            'timestamp': time.time(),
        }
    except Exception as e:
        elapsed = time.time() - start_time
        log(f'ERROR: {model} / {phase}: {e}')
        return {
            'model': model,
            'phase': phase,
            'variant': variant,
            'returncode': -1,
            'error': str(e),
            'elapsed_s': round(elapsed, 2),
            'timestamp': time.time(),
        }


def save_results(results, timestamp):
    """
    Save results to timestamped file and update canonical.json.
    """
    # Save timestamped results
    results_file = RESULTS_DIR / f'qwen35_glm_comparison_{timestamp}.json'
    results_file.write_text(json.dumps(results, indent=2))
    log(f'Results saved to: {results_file}')
    
    # Update canonical.json
    canonical = {}
    if CANONICAL_FILE.exists():
        try:
            canonical = json.loads(CANONICAL_FILE.read_text())
        except Exception as e:
            log(f'Warning: Could not read canonical.json: {e}')
    
    # Add/update models from this run (don't overwrite old models)
    for model_key, model_results in results.get('models', {}).items():
        if model_key not in canonical:
            canonical[model_key] = {
                'accuracy': model_results.get('accuracy', 0),
                'restraint_score': model_results.get('restraint_score', 0),
                'latencies': model_results.get('latencies', []),
                'variant': model_results.get('variant', 'atomic'),
                'status': 'canonical'
            }
        else:
            # Update if this is a newer result
            existing = canonical[model_key]
            new_acc = model_results.get('accuracy', 0)
            if new_acc > existing.get('accuracy', 0):
                log(f'Updating {model_key} accuracy: {existing.get("accuracy")} -> {new_acc}')
                existing['accuracy'] = new_acc
                existing['restraint_score'] = model_results.get('restraint_score', 0)
                existing['latencies'] = model_results.get('latencies', [])
    
    CANONICAL_FILE.write_text(json.dumps(canonical, indent=2))
    log(f'Canonical results updated: {CANONICAL_FILE}')
    
    return results_file, canonical


def generate_comparison_summary(results, canonical):
    """
    Generate comparison summary vs lfm2.5 baseline.
    """
    summary = {
        'timestamp': results.get('timestamp'),
        'baseline_model': BASELINE_MODEL,
        'baseline_accuracy': BASELINE_ACCURACY,
        'models_tested': [],
        'comparisons': []
    }
    
    for model_key, model_data in results.get('models', {}).items():
        acc = model_data.get('accuracy', 0)
        comparison = {
            'model': model_key,
            'accuracy': acc,
            'delta_vs_baseline': acc - BASELINE_ACCURACY,
            'phase': model_data.get('phase', 'unknown'),
        }
        summary['models_tested'].append(model_key)
        summary['comparisons'].append(comparison)
    
    return summary


def create_pr(results_file, summary):
    """
    Create or update PR on etc-mono-repo with results.
    Uses gh CLI to create PR.
    """
    repo = os.environ.get('BENCHMARK_REPO', 'etc-mono-repo')
    
    # Prepare PR content
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    pr_body = f"""# Benchmark Results: qwen3.5 + glm-4.7-flash

**Timestamp:** {timestamp}

## Models Tested
- qwen3.5:35b (atomic + extended)
- glm-4.7-flash (atomic + extended)

## Comparison vs lfm2.5-thinking:1.2b Baseline

| Model | Phase | Accuracy | Delta vs Baseline |
|-------|-------|----------|-------------------|
"""
    
    for comp in summary.get('comparisons', []):
        delta = comp.get('delta_vs_baseline', 0)
        delta_str = f'+{delta:.2%}' if delta >= 0 else f'{delta:.2%}'
        pr_body += f"| {comp['model']} | {comp['phase']} | {comp['accuracy']:.2%} | {delta_str} |\n"
    
    pr_body += f"""
## Results File
See: `{results_file.name}`

## Attribution
- **Agent:** OpenClaw (qwen3.5 + glm benchmark runner)
- **Human:** Owner/operator of this OpenClaw instance
"""
    
    # Try to create PR using gh CLI
    try:
        # Check if gh is available and authenticated
        check = subprocess.run(['gh', 'auth', 'status'], capture_output=True, timeout=10)
        if check.returncode != 0:
            log('gh not authenticated, skipping PR creation')
            return None
        
        # Create a branch for the results
        branch_name = f'benchmark/qwen-glm-{datetime.now().strftime("%Y%m%d-%H%M%S")}'
        
        # Check if there's an existing PR branch
        existing_branch = None
        pr_list = subprocess.run(
            ['gh', 'pr', 'list', '--head', 'benchmark/qwen-glm', '--state', 'open'],
            capture_output=True, text=True, timeout=10
        )
        
        if pr_list.returncode == 0 and pr_list.stdout.strip():
            # Found existing PR, get branch name
            first_line = pr_list.stdout.split('\n')[0]
            existing_branch = first_line.split('\t')[0] if '\t' in first_line else None
        
        if existing_branch:
            # Update existing PR
            log(f'Updating existing PR branch: {existing_branch}')
            # Commit and push changes
            subprocess.run(['git', 'add', str(results_file)], cwd='/root/.openclaw/workspace', check=False)
            subprocess.run(
                ['git', 'commit', '-m', f'Update benchmark results: qwen3.5 + glm\n\n{timestamp}'],
                cwd='/root/.openclaw/workspace', check=False
            )
            subprocess.run(
                ['git', 'push', 'origin', existing_branch],
                cwd='/root/.openclaw/workspace', check=False
            )
            return f'PR updated: {existing_branch}'
        else:
            # Create new PR
            log('Creating new PR for benchmark results')
            # Create branch
            subprocess.run(['git', 'checkout', '-b', branch_name], cwd='/root/.openclaw/workspace', check=False)
            subprocess.run(['git', 'add', str(results_file)], cwd='/root/.openclaw/workspace', check=False)
            subprocess.run(
                ['git', 'commit', '-m', f'Add benchmark results: qwen3.5 + glm\n\n{timestamp}'],
                cwd='/root/.openclaw/workspace', check=False
            )
            subprocess.run(['git', 'push', '-u', 'origin', branch_name], cwd='/root/.openclaw/workspace', check=False)
            
            # Create PR
            pr_result = subprocess.run(
                [
                    'gh', 'pr', 'create',
                    '--title', f'Benchmark: qwen3.5 + glm-4.7-flash ({timestamp})',
                    '--body', pr_body,
                    '--base', 'main'
                ],
                cwd='/root/.openclaw/workspace',
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if pr_result.returncode == 0:
                log(f'PR created: {pr_result.stdout.strip()}')
                return pr_result.stdout.strip()
            else:
                log(f'PR creation failed: {pr_result.stderr}')
                return None
                
    except FileNotFoundError:
        log('gh CLI not found, skipping PR creation')
        return None
    except Exception as e:
        log(f'PR creation error: {e}')
        return None


def main():
    """Main entry point."""
    log('=== Starting qwen3.5 + glm Benchmark ===')
    
    # Step 1: Check for running benchmark processes
    if check_processes():
        print('Benchmark already in progress, skipping', flush=True)
        sys.exit(0)
    
    # Step 2: Acquire lock
    lock_fd = acquire_lock()
    if lock_fd is None:
        print('Benchmark already in progress, skipping', flush=True)
        sys.exit(0)
    
    try:
        # Step 3: Run benchmarks
        timestamp = datetime.now().strftime('%Y%m%d-%H%M%S')
        all_results = {
            'timestamp': time.time(),
            'timestamp_iso': timestamp,
            'models': {}
        }
        
        for model in MODELS:
            for phase in PHASES:
                result = run_benchmark(model, phase, timeout=120)
                
                # Extract accuracy from result
                summary = result.get('summary', {})
                accuracy = summary.get('accuracy', 0)
                
                # Store model results
                model_key = f'{model}:{phase}'
                all_results['models'][model_key] = {
                    'model': model,
                    'phase': phase,
                    'accuracy': accuracy,
                    'passed': summary.get('passed', 0),
                    'total': summary.get('total', 0),
                    'restraint_score': summary.get('restraint_score', 0),
                    'elapsed_s': result.get('elapsed_s', 0),
                    'returncode': result.get('returncode', -1),
                    'variant': 'atomic' if phase == 'atomic' else 'extended',
                }
                
                # Collect latencies if available
                if 'results' in result:
                    latencies = [
                        r.get('latency_ms', 0) 
                        for r in result['results'] 
                        if r.get('latency_ms')
                    ]
                    all_results['models'][model_key]['latencies'] = latencies
        
        # Step 4: Save results
        results_file, canonical = save_results(all_results, timestamp)
        
        # Step 5: Generate comparison summary
        summary = generate_comparison_summary(all_results, canonical)
        
        # Step 6: Create PR (if enabled)
        pr_url = None
        if os.environ.get('BENCHMARK_CREATE_PR', '').lower() == 'true':
            pr_url = create_pr(results_file, summary)
        
        log('=== Benchmark Complete ===')
        log(f'Results: {results_file}')
        if pr_url:
            log(f'PR: {pr_url}')
        
        # Print summary for cron to capture
        print(f'BENCHMARK_DONE: {results_file}', flush=True)
        if pr_url:
            print(f'PR_CREATED: {pr_url}', flush=True)
        
    finally:
        release_lock(lock_fd)


if __name__ == '__main__':
    main()
