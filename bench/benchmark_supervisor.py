#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import time
import uuid
from collections import defaultdict
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Any

ROOT = Path('/root/.openclaw/workspace/bench')
RUNNER = ROOT / 'run_benchmark.py'
RUNS = ROOT / 'supervisor_runs'
ARCHIVE = RUNS / '.archive'
INDEX_PATH = RUNS / 'index.json'
RUNS.mkdir(parents=True, exist_ok=True)
ARCHIVE.mkdir(parents=True, exist_ok=True)

DEFAULT_JOBS = [
    ("lfm2.5-thinking:1.2b", "atomic", "native_api", ["--isolate-call"]),
    ("lfm2.5-thinking:1.2b", "extended", "extended", ["--isolate-call"]),
    ("qwen2.5:3b", "atomic", "atomic", ["--fail-fast"]),
    ("ministral-3:latest", "atomic", "atomic", ["--fail-fast"]),
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
        '--timeout', str(timeout_s), '--retries', str(retries), '--debug-log', str(dbg),
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
        recover_spec = JobSpec(spec.model, spec.phase, spec.variant, list(dict.fromkeys(spec.extra + ['--isolate-call'])))
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
    parser.add_argument('--retries', type=int, default=1)
    parser.add_argument('--retain-days', type=int, default=7)
    parser.add_argument('--recover-once', action='store_true', help='Retry failed retryable jobs one time')
    parser.add_argument('--suite', default='', help='Custom suite path forwarded to extended jobs')
    parser.add_argument('--models', default='', help='Comma-separated model allowlist (e.g. lfm2.5-thinking:1.2b,qwen2.5:3b)')
    parser.add_argument('--phases', default='', help='Comma-separated phase allowlist (atomic,extended)')
    parser.add_argument('--enable-warmup', action='store_true', help='Enable model warm-up before first run')
    args = parser.parse_args()

    archive_stats = _archive_legacy_and_old_runs(args.retain_days)

    run_id = uuid.uuid4().hex[:10]
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

    try:
        for i, spec in enumerate(jobs, start=1):
            # Enable warm-up only on first run (i == 1)
            enable_warmup = args.enable_warmup and (i == 1)
            res = _run_job_with_recovery(
                run_dir=run_dir,
                run_id=run_id,
                idx=i,
                spec=spec,
                timeout_s=args.timeout,
                retries=args.retries,
                recover_once=args.recover_once,
                suite=args.suite or None,
                enable_warmup=enable_warmup,
            )
            manifest['jobs'].append(res)
            manifest_path.write_text(json.dumps(manifest, indent=2))

        manifest['status'] = 'completed'
    except KeyboardInterrupt:
        manifest['status'] = 'interrupted'
        manifest['error'] = 'KeyboardInterrupt'
    except Exception as exc:
        manifest['status'] = 'failed'
        manifest['error'] = str(exc)
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
