#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
import time
import uuid
from collections import defaultdict
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Any, Optional

from selfopt.baseline_tracker import BaselineTracker
from utils.error_recovery import (
    RetryConfig,
    Checkpoint,
    HealthStatus,
    check_ollama_health,
    wait_for_ollama,
    load_checkpoint,
    save_checkpoint,
    clear_checkpoint,
    save_partial_results,
    load_partial_results,
    retry_with_backoff,
    is_retryable_error,
    get_fallback_model,
    find_available_model,
    register_crash_handler,
    format_health_status,
    get_resume_info,
    DEFAULT_TIMEOUT_S,
)

ROOT = Path('/root/.openclaw/workspace/bench')
RUNNER = ROOT / 'core' / 'run_benchmark.py'
RUNS = ROOT / 'supervisor_runs'
ARCHIVE = RUNS / '.archive'
INDEX_PATH = RUNS / 'index.json'
RUNS.mkdir(parents=True, exist_ok=True)
ARCHIVE.mkdir(parents=True, exist_ok=True)

DEFAULT_JOBS = [
    ("lfm2.5-thinking:1.2b", "atomic", "native_api", [""]),
    ("lfm2.5-thinking:1.2b", "extended", "extended", [""]),
    ("qwen2.5:3b", "atomic", "atomic", [""]),
    ("ministral-3:latest", "atomic", "atomic", [""]),
]


@dataclass
class JobSpec:
    model: str
    phase: str
    variant: str
    extra: list[str]


def _slug_model(model: str) -> str:
    return model.replace(':', '-').replace('/', '-')


def _load_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text())
    except Exception:
        return default


def _load_jsonl(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    if not path.exists():
        return rows
    for line in path.read_text().splitlines():
        if not line.strip():
            continue
        try:
            rows.append(json.loads(line))
        except json.JSONDecodeError:
            continue
    return rows


def _is_retryable_failure(stderr_tail: str) -> bool:
    text = (stderr_tail or '').lower()
    tokens = ('timeout', 'timed out', 'connection reset', 'connection refused', 'unavailable', 'broken pipe')
    return any(tok in text for tok in tokens)


def _archive_legacy_and_old_runs(retain_days: int) -> dict[str, int]:
    now = time.time()
    max_age_s = max(0, retain_days) * 86400
    moved_legacy = 0
    moved_old = 0

    for p in RUNS.iterdir():
        if p.name.startswith('.archive'):
            continue
        if p.is_file() and ('_manifest.json' in p.name or '_job' in p.name):
            dst = ARCHIVE / p.name
            if dst.exists():
                dst = ARCHIVE / f'{int(now)}_{p.name}'
            shutil.move(str(p), str(dst))
            moved_legacy += 1

    for p in RUNS.iterdir():
        if not p.is_dir() or p.name.startswith('.'):
            continue
        age = now - p.stat().st_mtime
        if max_age_s > 0 and age > max_age_s:
            dst = ARCHIVE / p.name
            if dst.exists():
                dst = ARCHIVE / f'{int(now)}_{p.name}'
            shutil.move(str(p), str(dst))
            moved_old += 1

    return {'archived_legacy_files': moved_legacy, 'archived_old_runs': moved_old}


def _run_once(run_dir: Path, run_id: str, idx: int, spec: JobSpec, timeout_s: int, retries: int, suite: str | None, enable_warmup: bool = False) -> dict[str, Any]:
    jobs_dir = run_dir / 'jobs'
    jobs_dir.mkdir(parents=True, exist_ok=True)

    model_slug = _slug_model(spec.model)
    base = f'job{idx}_{model_slug}_{spec.phase}_{spec.variant}'
    dbg = jobs_dir / f'{base}.jsonl'
    stdout_path = jobs_dir / f'{base}.stdout.log'
    stderr_path = jobs_dir / f'{base}.stderr.log'
    hb = jobs_dir / f'{base}.heartbeat.txt'

    cmd = [
        'python3', str(RUNNER), spec.model, spec.phase, spec.variant,
        '--timeout', str(timeout_s), '--max-retries', str(retries), '', str(dbg),
    ]
    if enable_warmup:
        cmd.append('--enable-warmup')
    if suite and spec.phase == 'extended':
        cmd.extend(['--suite', suite])
    cmd.extend(spec.extra)

    started = time.time()
    hb.write_text(str(started))
    cp = subprocess.run(cmd, cwd='/root/.openclaw/workspace', capture_output=True, text=True)
    ended = time.time()
    hb.write_text(str(ended))
    stdout_path.write_text(cp.stdout)
    stderr_path.write_text(cp.stderr)

    events = _load_jsonl(dbg)
    total = len(events)
    passed = sum(1 for r in events if r.get('correct'))
    failed_prompts = sorted({r.get('prompt_id') for r in events if not r.get('correct') and r.get('prompt_id')})

    return {
        'job_index': idx,
        'model': spec.model,
        'phase': spec.phase,
        'variant': spec.variant,
        'run_id': run_id,
        'cmd': cmd,
        'rc': cp.returncode,
        'elapsed_s': round(ended - started, 2),
        'debug_log': str(dbg),
        'stdout_log': str(stdout_path),
        'stderr_log': str(stderr_path),
        'stdout_tail': '\n'.join(cp.stdout.splitlines()[-20:]),
        'stderr_tail': '\n'.join(cp.stderr.splitlines()[-20:]),
        'summary': {
            'passed': passed,
            'total': total,
            'accuracy': round(passed / total, 4) if total else 0.0,
            'failed_prompts': failed_prompts,
        },
        'started_at': started,
        'ended_at': ended,
        'timestamp': time.strftime('%Y%m%d-%H%M%S'),
    }


def _run_job_with_recovery(run_dir: Path, run_id: str, idx: int, spec: JobSpec, timeout_s: int, retries: int, recover_once: bool, suite: str | None, enable_warmup: bool = False) -> dict[str, Any]:
    result = _run_once(run_dir, run_id, idx, spec, timeout_s, retries, suite, enable_warmup)
    result['warmup_enabled'] = enable_warmup
    if enable_warmup:
        # Check if warm-up was successful by looking at stdout
        stdout = result.get('stdout_tail', '')
        if 'Warm-up complete' in stdout:
            result['warmup_result'] = 'success'
        elif 'Warm-up failed' in stdout or result.get('rc', 0) != 0:
            result['warmup_result'] = 'failed'
        else:
            result['warmup_result'] = 'unknown'
    
    if result['rc'] == 0 or not recover_once:
        result['attempts'] = 1
        return result

    if _is_retryable_failure(result.get('stderr_tail', '')):
        recover_spec = JobSpec(spec.model, spec.phase, spec.variant, list(dict.fromkeys(spec.extra + [''])))
        retry = _run_once(run_dir, run_id, idx, recover_spec, timeout_s, max(retries, 2), suite)
        retry['recovered_from_failure'] = True
        retry['initial_failure_rc'] = result['rc']
        retry['attempts'] = 2
        return retry

    result['attempts'] = 1
    return result


def _collect_variance(history_runs: list[dict[str, Any]]) -> dict[str, Any]:
    outcomes: dict[tuple[str, str, str], list[bool]] = defaultdict(list)
    for run in history_runs:
        run_dir = Path(run.get('run_dir', ''))
        for job in run.get('jobs', []):
            for row in _load_jsonl(Path(job.get('debug_log', ''))):
                key = (job.get('model', ''), job.get('phase', ''), row.get('prompt_id', ''))
                if key[2]:
                    outcomes[key].append(bool(row.get('correct')))

    inconsistent = []
    for (model, phase, prompt_id), vals in outcomes.items():
        if len(vals) < 2:
            continue
        if any(v != vals[0] for v in vals[1:]):
            inconsistent.append({
                'model': model,
                'phase': phase,
                'prompt_id': prompt_id,
                'runs': len(vals),
                'pass_rate': round(sum(vals) / len(vals), 3),
                'outcomes': vals,
            })

    inconsistent.sort(key=lambda x: (x['model'], x['phase'], x['prompt_id']))
    return {
        'inconsistent_prompt_count': len(inconsistent),
        'inconsistent_prompts': inconsistent,
    }


def _update_index(run_manifest: dict[str, Any]) -> None:
    index = _load_json(INDEX_PATH, {'runs': []})
    runs = [r for r in index.get('runs', []) if r.get('run_id') != run_manifest['run_id']]
    runs.append({
        'run_id': run_manifest['run_id'],
        'run_dir': run_manifest['run_dir'],
        'started_at': run_manifest['started_at'],
        'ended_at': run_manifest.get('ended_at'),
        'status': run_manifest.get('status', 'unknown'),
        'job_count': len(run_manifest.get('jobs', [])),
        'suite': run_manifest.get('suite'),
    })
    index['runs'] = sorted(runs, key=lambda r: r.get('started_at', 0), reverse=True)
    INDEX_PATH.write_text(json.dumps(index, indent=2))


def _is_local_model(model: str) -> bool:
    m = (model or '').lower()
    return not (m.startswith('openai') or m.startswith('anthropic') or m.startswith('claude') or 'gpt-' in m)


def main():
    parser = argparse.ArgumentParser(description='Benchmark supervisor with recovery + variance detection')
    parser.add_argument('--timeout', type=int, default=60)
    parser.add_argument('--max-retries', type=int, default=1)
    parser.add_argument('--retain-days', type=int, default=7)
    parser.add_argument('--recover-once', action='store_true', help='Retry failed retryable jobs one time')
    parser.add_argument('--suite', default='', help='Custom suite path forwarded to extended jobs')
    parser.add_argument('--models', default='', help='Comma-separated model allowlist (e.g. lfm2.5-thinking:1.2b,qwen2.5:3b)')
    parser.add_argument('--phases', default='', help='Comma-separated phase allowlist (atomic,extended)')
    parser.add_argument('--enable-warmup', action='store_true', help='Enable model warm-up before first run')
    parser.add_argument('--resume', type=str, default='', help='Resume an interrupted run from the specified run directory')
    parser.add_argument('--health-check', action='store_true', default=True, help='Verify Ollama is healthy before running (default: true)')
    parser.add_argument('--no-health-check', dest='health_check', action='store_false', help='Skip Ollama health check')
    args = parser.parse_args()
    # Alias max_retries to retries for backward compatibility
    args.retries = args.max_retries

    # Health check: verify Ollama is running before starting
    if args.health_check:
        print("[health] Checking Ollama status...")
        health = check_ollama_health()
        print(format_health_status(health))
        if not health.healthy:
            print("[health] WARNING: Ollama is not healthy, but proceeding anyway...", file=sys.stderr)
        # Wait for Ollama if not ready (up to 30 seconds)
        if not health.ollama_running:
            print("[health] Waiting for Ollama to become available...")
            if not wait_for_ollama(timeout_s=30):
                print("[health] ERROR: Ollama did not become available in time", file=sys.stderr)

    # Handle resume mode
    resume_checkpoint: Optional[Checkpoint] = None
    if args.resume:
        resume_dir = Path(args.resume)
        if not resume_dir.exists():
            raise SystemExit(f"Resume directory not found: {resume_dir}")
        resume_info = get_resume_info(resume_dir)
        if not resume_info:
            raise SystemExit(f"No valid checkpoint found in: {resume_dir}")
        print(f"[resume] Resuming run {resume_info['run_id']} from job {resume_info['job_index']}, prompt {resume_info['prompt_index']}")
        # Use the same run_id to continue
        run_id = resume_info['run_id']
        run_dir = resume_dir
        manifest_path = run_dir / 'manifest.json'
        
        # Load checkpoint
        resume_checkpoint = load_checkpoint(run_dir)
        if not resume_checkpoint:
            resume_checkpoint = Checkpoint(run_id=run_id)
    else:
        run_id = uuid.uuid4().hex[:10]

    archive_stats = _archive_legacy_and_old_runs(args.retain_days)

    if not args.resume:
        run_dir = RUNS / run_id
        run_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = run_dir / 'manifest.json'

    manifest: dict[str, Any] = {
        'run_id': run_id,
        'run_dir': str(run_dir),
        'started_at': time.time(),
        'status': 'running',
        'suite': args.suite or None,
        'archive': archive_stats,
        'jobs': [],
    }
    manifest_path.write_text(json.dumps(manifest, indent=2))

    jobs = [JobSpec(*j) for j in DEFAULT_JOBS]

    # Policy gates / filtering
    jobs = [j for j in jobs if _is_local_model(j.model)]

    if args.models.strip():
        allow_models = {m.strip() for m in args.models.split(',') if m.strip()}
        jobs = [j for j in jobs if j.model in allow_models]

    if args.phases.strip():
        allow_phases = {p.strip().lower() for p in args.phases.split(',') if p.strip()}
        jobs = [j for j in jobs if j.phase.lower() in allow_phases]

    if not jobs:
        raise SystemExit('No runnable jobs after policy/filters (local-only + allowlists).')

    # Initialize baseline tracker for regression detection
    tracker = BaselineTracker()
    regression_alerts = []

    # Initialize checkpoint for crash recovery
    if resume_checkpoint is None:
        checkpoint = Checkpoint(run_id=run_id)
    else:
        checkpoint = resume_checkpoint
    
    # Register crash handler
    register_crash_handler(run_dir, checkpoint)

    try:
        for i, spec in enumerate(jobs, start=1):
            # Skip jobs that were already completed in resume mode
            if resume_checkpoint and i <= resume_checkpoint.job_index:
                print(f"[resume] Skipping job {i} ({spec.model}, {spec.phase}) - already completed")
                continue
            
            # Save checkpoint before running each job
            checkpoint.job_index = i
            checkpoint.prompt_index = 0
            save_checkpoint(run_dir, checkpoint)
            
            # Enable warm-up only on first run (i == 1)
            enable_warmup = args.enable_warmup and (i == 1)
            
            # Run with retry with backoff
            retry_config = RetryConfig(max_retries=max(args.max_retries, 1), backoff_base=2.0, backoff_max=30.0)
            
            try:
                res = retry_with_backoff(
                    lambda: _run_job_with_recovery(
                        run_dir=run_dir,
                        run_id=run_id,
                        idx=i,
                        spec=spec,
                        timeout_s=args.timeout,
                        retries=args.retries,
                        recover_once=args.recover_once,
                        suite=args.suite or None,
                        enable_warmup=enable_warmup,
                    ),
                    config=retry_config,
                    on_retry=lambda e, attempt: print(f"[retry] Job {i} failed: {e}, attempt {attempt}", file=sys.stderr)
                )
            except Exception as job_error:
                # If job fails with retryable error, try fallback model
                fallback_model = get_fallback_model(spec.model)
                if fallback_model:
                    print(f"[fallback] Primary model {spec.model} failed, trying fallback: {fallback_model}", file=sys.stderr)
                    health = check_ollama_health()
                    available = find_available_model(fallback_model, health.available_models)
                    
                    if available:
                        fallback_spec = JobSpec(available, spec.phase, spec.variant, spec.extra)
                        try:
                            res = _run_job_with_recovery(
                                run_dir=run_dir,
                                run_id=run_id,
                                idx=i,
                                spec=fallback_spec,
                                timeout_s=args.timeout,
                                retries=args.retries,
                                recover_once=args.recover_once,
                                suite=args.suite or None,
                                enable_warmup=False,  # Skip warmup for fallback
                            )
                            res['used_fallback'] = True
                            res['original_model'] = spec.model
                            res['fallback_model'] = available
                        except Exception as fallback_error:
                            print(f"[fallback] Fallback also failed: {fallback_error}", file=sys.stderr)
                            res = {
                                'job_index': i,
                                'model': spec.model,
                                'phase': spec.phase,
                                'variant': spec.variant,
                                'run_id': run_id,
                                'rc': -1,
                                'error': str(job_error),
                                'fallback_error': str(fallback_error),
                                'attempts': args.retries + 1,
                            }
                    else:
                        res = {
                            'job_index': i,
                            'model': spec.model,
                            'phase': spec.phase,
                            'variant': spec.variant,
                            'run_id': run_id,
                            'rc': -1,
                            'error': str(job_error),
                            'fallback_available': False,
                            'attempts': args.retries + 1,
                        }
                else:
                    res = {
                        'job_index': i,
                        'model': spec.model,
                        'phase': spec.phase,
                        'variant': spec.variant,
                        'run_id': run_id,
                        'rc': -1,
                        'error': str(job_error),
                        'attempts': args.retries + 1,
                    }
            
            # Check for regression and update baseline
            summary = res.get('summary', {})
            accuracy = summary.get('accuracy', 0)
            job_results = {
                'model': spec.model,
                'phase': spec.phase,
                'variant': spec.variant,
                'accuracy': accuracy,
                'passed': summary.get('passed', 0),
                'total': summary.get('total', 0),
                'run_id': run_id,
            }
            
            # Check regression before updating baseline
            regression_check = tracker.check_regression(job_results)
            res['regression_check'] = {
                'regressed': regression_check.regressed,
                'regression_pct': regression_check.regression_pct,
                'accuracy_change': regression_check.accuracy_change,
                'baseline_accuracy': regression_check.baseline_accuracy,
                'message': regression_check.message,
            }
            
            if regression_check.regressed:
                regression_alerts.append({
                    'model': spec.model,
                    'phase': spec.phase,
                    'variant': spec.variant,
                    'regression_pct': regression_check.regression_pct,
                    'message': regression_check.message,
                })
            
            # Update baseline with new results
            tracker.update_baseline(job_results)
            
            manifest['jobs'].append(res)
            manifest_path.write_text(json.dumps(manifest, indent=2))
            
            # Update checkpoint: mark job as completed
            checkpoint.job_index = i
            checkpoint.completed_prompts.append(f"job_{i}_{spec.model}_{spec.phase}")
            checkpoint.partial_results.append(res)
            save_checkpoint(run_dir, checkpoint)
            
            # Save partial results for crash recovery
            save_partial_results(run_dir, checkpoint.partial_results)

        # Clear checkpoint on successful completion
        clear_checkpoint(run_dir)
        manifest['status'] = 'completed'
    except KeyboardInterrupt:
        manifest['status'] = 'interrupted'
        manifest['error'] = 'KeyboardInterrupt'
        # Save checkpoint on interrupt
        save_checkpoint(run_dir, checkpoint)
        save_partial_results(run_dir, checkpoint.partial_results)
    except Exception as exc:
        manifest['status'] = 'failed'
        manifest['error'] = str(exc)
        # Save checkpoint on failure
        save_checkpoint(run_dir, checkpoint)
        save_partial_results(run_dir, checkpoint.partial_results)
    finally:
        manifest['ended_at'] = time.time()

    historical = []
    index = _load_json(INDEX_PATH, {'runs': []})
    for run in index.get('runs', [])[:20]:
        run_manifest = Path(run.get('run_dir', '')) / 'manifest.json'
        if run_manifest.exists():
            historical.append(_load_json(run_manifest, {}))
    historical.append(manifest)

    manifest['variance'] = _collect_variance(historical)
    manifest['regression_alerts'] = regression_alerts
    manifest_path.write_text(json.dumps(manifest, indent=2))
    _update_index(manifest)

    summary_path = run_dir / 'summary.json'
    summary = {
        'run_id': run_id,
        'status': manifest['status'],
        'job_summaries': [
            {
                'job_index': j['job_index'],
                'model': j['model'],
                'phase': j['phase'],
                'variant': j['variant'],
                'rc': j['rc'],
                **j.get('summary', {}),
            }
            for j in manifest.get('jobs', [])
        ],
        'variance': manifest.get('variance', {}),
        'regression_alerts': regression_alerts,
        'archive': manifest.get('archive', {}),
    }
    summary_path.write_text(json.dumps(summary, indent=2))

    # Auto-feedback loop from recent debug/manifests
    feedback_path = ROOT / 'harness_feedback.json'
    try:
        subprocess.run(
            ['python3', str(ROOT / 'harness_feedback_loop.py')],
            cwd='/root/.openclaw/workspace',
            capture_output=True,
            text=True,
            timeout=30,
            check=False,
        )
    except Exception:
        pass

    print(f'SUPERVISOR_DONE {manifest_path}')
    print(f'SUPERVISOR_SUMMARY {summary_path}')
    if feedback_path.exists():
        print(f'SUPERVISOR_FEEDBACK {feedback_path}')


if __name__ == '__main__':
    main()
