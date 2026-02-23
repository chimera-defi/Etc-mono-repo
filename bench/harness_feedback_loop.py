#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
from collections import defaultdict

ROOT = Path('/root/.openclaw/workspace/bench')
RUNS = ROOT / 'supervisor_runs'
INDEX = RUNS / 'index.json'
OUT = ROOT / 'harness_feedback.json'


def load_json(path, default):
    try:
        return json.loads(Path(path).read_text())
    except Exception:
        return default


def load_jsonl(path):
    rows = []
    p = Path(path)
    if not p.exists():
        return rows
    for line in p.read_text().splitlines():
        if not line.strip():
            continue
        try:
            rows.append(json.loads(line))
        except Exception:
            pass
    return rows


def main():
    idx = load_json(INDEX, {'runs': []})
    recent = idx.get('runs', [])[:8]

    failures = defaultdict(int)
    model_phase_totals = defaultdict(lambda: {'pass': 0, 'total': 0})

    for r in recent:
        mpath = Path(r.get('run_dir', '')) / 'manifest.json'
        m = load_json(mpath, {})
        for job in m.get('jobs', []):
            key = f"{job.get('model')}::{job.get('phase')}"
            s = job.get('summary', {})
            model_phase_totals[key]['pass'] += int(s.get('passed', 0))
            model_phase_totals[key]['total'] += int(s.get('total', 0))
            for p in s.get('failed_prompts', []) or []:
                failures[f"{key}::{p}"] += 1

    recommendations = []
    for key, v in model_phase_totals.items():
        total = v['total']
        acc = (v['pass'] / total) if total else 0.0
        if '::extended' in key and acc < 0.5:
            recommendations.append({
                'type': 'routing',
                'target': key,
                'action': 'disable_for_stateful',
                'reason': f'low extended accuracy {acc:.2%}',
                'allow': False,
                'fallback': 'mistral:7b',
                'requirements': []
            })
        if '::atomic' in key and acc >= 0.8:
            # For atomic with high accuracy, check if warm-up helps
            reqs = ['warm-up'] if acc < 1.0 else []
            recommendations.append({
                'type': 'routing',
                'target': key,
                'action': 'allow_for_bounded_tasks',
                'reason': f'strong atomic accuracy {acc:.2%}',
                'allow': True,
                'fallback': None,
                'requirements': reqs
            })

    hot_failures = [
        {'key': k, 'count': c}
        for k, c in sorted(failures.items(), key=lambda x: x[1], reverse=True)
        if c >= 2
    ][:20]

    out = {
        'generated_at': __import__('time').time(),
        'recent_runs': len(recent),
        'model_phase_accuracy': {
            k: {
                'passed': v['pass'],
                'total': v['total'],
                'accuracy': round((v['pass'] / v['total']) if v['total'] else 0.0, 4),
            }
            for k, v in model_phase_totals.items()
        },
        'hot_failures': hot_failures,
        'recommendations': recommendations,
    }

    OUT.write_text(json.dumps(out, indent=2))
    print(str(OUT))


if __name__ == '__main__':
    main()
