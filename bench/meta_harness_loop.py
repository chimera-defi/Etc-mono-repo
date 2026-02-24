#!/usr/bin/env python3
"""
Meta harness loop: closed-loop benchmark optimization with policy decisions.

Features:
- Runs baseline + candidate matrix for N cycles
- Persists all cycle history
- Computes per-spec medians and variance across cycles
- Uses a policy engine to classify each candidate: promote / hold / reject
- Writes a self-optimizing report
"""

from __future__ import annotations

import argparse
import json
import statistics
import subprocess
import sys
import time
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any
import harness_feedback_loop

WORKDIR = Path('/root/.openclaw/workspace')
BENCH = WORKDIR / 'bench'
RUNNER = BENCH / 'run_benchmark.py'
WORKDIR = Path('/root/.openclaw/workspace')
BENCH = WORKDIR / 'bench'
sys.path.insert(0, str(BENCH))
from routing_enforcer import enforce_recommendations
import harness_feedback_loop
REPORT = BENCH / 'SELF_OPTIMIZING_REPORT.md'
HISTORY = BENCH / 'meta_loop_history.json'
PARSER_BAKEOFF = BENCH / 'parsers' / 'parser_candidate_bakeoff.py'
PARSER_BAKEOFF_JSON = BENCH / 'parser_bakeoff_report.json'


@dataclass(frozen=True)
class RunSpec:
    model: str
    phase: str
    variant: str
    timeout: int
    retries: int
    isolate: bool

    @property
    def slug(self) -> str:
        m = self.model.replace(':', '-').replace('/', '-')
        return f"{self.phase}_{m}_{self.variant}_t{self.timeout}_r{self.retries}_i{int(self.isolate)}"

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> 'RunSpec':
        return cls(
            model=str(data['model']),
            phase=str(data['phase']),
            variant=str(data['variant']),
            timeout=int(data['timeout']),
            retries=int(data['retries']),
            isolate=bool(data['isolate']),
        )


class PolicyEngine:
    """Simple policy gate for candidate promotion decisions."""

    def __init__(self, min_samples: int = 3, promote_margin: float = 0.02, variance_limit: float = 0.02):
        self.min_samples = min_samples
        self.promote_margin = promote_margin
        self.variance_limit = variance_limit

    def decide(self, baseline: dict[str, Any], candidate: dict[str, Any]) -> tuple[str, str]:
        b_samples = baseline.get('samples', 0)
        c_samples = candidate.get('samples', 0)
        b_acc = baseline.get('median_accuracy')
        c_acc = candidate.get('median_accuracy')
        b_res = baseline.get('median_restraint')
        c_res = candidate.get('median_restraint')
        c_var = candidate.get('variance_accuracy')

        if c_acc is None:
            return 'reject', 'no accuracy signal available'
        if c_samples < self.min_samples or b_samples < self.min_samples:
            return 'hold', f'insufficient samples (baseline={b_samples}, candidate={c_samples}, need>={self.min_samples})'

        if c_var is not None and c_var > self.variance_limit:
            return 'reject', f'accuracy variance too high ({c_var:.4f} > {self.variance_limit:.4f})'

        if b_acc is not None and c_acc >= (b_acc + self.promote_margin):
            if b_res is None or c_res is None or c_res >= (b_res - 0.05):
                return 'promote', f'median accuracy improved by {c_acc - b_acc:.3f} with acceptable restraint'

        if b_acc is not None and c_acc < b_acc:
            return 'reject', f'median accuracy lower than baseline ({c_acc:.3f} < {b_acc:.3f})'

        return 'hold', 'no clear improvement over baseline yet'


def _run_spec(spec: RunSpec) -> dict[str, Any]:
    cmd = [
        'python3', str(RUNNER),
        spec.model,
        spec.phase,
        spec.variant,
        '--timeout', str(spec.timeout),
        '--max-retries', str(spec.retries),
    ]
    if spec.isolate:
        cmd.append('--isolate-call')

    started = time.time()
    cp = subprocess.run(cmd, cwd=str(WORKDIR), capture_output=True, text=True)
    elapsed = time.time() - started

    out_file = BENCH / f"{spec.phase}_result_{spec.model.split(':')[0]}_{spec.variant}.json"
    parsed: dict[str, Any] | None = None
    if out_file.exists():
        try:
            parsed = json.loads(out_file.read_text())
        except Exception:
            parsed = None

    return {
        'spec': asdict(spec),
        'ok': cp.returncode == 0,
        'rc': cp.returncode,
        'elapsed_s': round(elapsed, 2),
        'stdout_tail': '\n'.join(cp.stdout.splitlines()[-10:]),
        'stderr_tail': '\n'.join(cp.stderr.splitlines()[-10:]),
        'output_file': str(out_file),
        'parsed': parsed,
    }


def _score(parsed: dict[str, Any] | None) -> tuple[float | None, float | None]:
    if not parsed:
        return None, None
    s = parsed.get('summary', {})
    acc = s.get('accuracy')
    restraint = s.get('restraint_score')
    if not isinstance(acc, (int, float)):
        acc = None
    else:
        acc = float(acc)
    if not isinstance(restraint, (int, float)):
        restraint = None
    else:
        restraint = float(restraint)
    return acc, restraint


def _load_history() -> list[dict[str, Any]]:
    if not HISTORY.exists():
        return []
    try:
        data = json.loads(HISTORY.read_text())
        return data if isinstance(data, list) else []
    except Exception:
        return []


def _save_history(history: list[dict[str, Any]]) -> None:
    HISTORY.write_text(json.dumps(history, indent=2))


def _build_candidates(args: argparse.Namespace) -> list[RunSpec]:
    candidates: list[RunSpec] = []
    for m in args.models:
        for v in args.variants:
            for t in args.timeouts:
                for r in args.retries_list:
                    for i in args.isolate_modes:
                        candidates.append(RunSpec(m, args.phase, v, t, r, bool(i)))

    # Optional candidate set presets, additive to explicit matrix above.
    presets: dict[str, list[RunSpec]] = {
        'default': [],
        'stability': [
            RunSpec(args.baseline_model, args.phase, 'native_api', args.baseline_timeout, 2, True),
            RunSpec(args.baseline_model, args.phase, 'atomic', args.baseline_timeout, 2, True),
        ],
        'explore': [
            RunSpec(args.baseline_model, args.phase, 'native_api', max(30, args.baseline_timeout // 2), 1, True),
            RunSpec(args.baseline_model, args.phase, 'native_api', args.baseline_timeout, 3, True),
            RunSpec(args.baseline_model, args.phase, 'atomic', args.baseline_timeout, 3, True),
        ],
    }
    for name in args.candidate_set:
        candidates.extend(presets.get(name, []))

    # Deduplicate by slug while preserving order.
    seen: set[str] = set()
    uniq: list[RunSpec] = []
    for c in candidates:
        if c.slug in seen:
            continue
        seen.add(c.slug)
        uniq.append(c)
    return uniq


def _aggregate_stats(history: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    samples: dict[str, dict[str, Any]] = {}

    for cycle in history:
        runs = []
        if 'baseline' in cycle and cycle['baseline']:
            runs.append(cycle['baseline'])
        runs.extend(cycle.get('rows', []))

        for run in runs:
            spec = RunSpec.from_dict(run['spec'])
            slot = samples.setdefault(spec.slug, {
                'spec': asdict(spec),
                'acc': [],
                'restraint': [],
                'elapsed': [],
                'rc': [],
            })
            acc, res = _score(run.get('parsed'))
            if acc is not None:
                slot['acc'].append(acc)
            if res is not None:
                slot['restraint'].append(res)
            slot['elapsed'].append(float(run.get('elapsed_s', 0.0)))
            slot['rc'].append(int(run.get('rc', 1)))

    out: dict[str, dict[str, Any]] = {}
    for slug, data in samples.items():
        accs = data['acc']
        restraints = data['restraint']
        out[slug] = {
            'spec': data['spec'],
            'samples': len(data['rc']),
            'success_rate': (sum(1 for rc in data['rc'] if rc == 0) / len(data['rc'])) if data['rc'] else 0.0,
            'median_accuracy': statistics.median(accs) if accs else None,
            'variance_accuracy': statistics.pvariance(accs) if len(accs) > 1 else 0.0 if accs else None,
            'median_restraint': statistics.median(restraints) if restraints else None,
            'median_elapsed_s': statistics.median(data['elapsed']) if data['elapsed'] else None,
        }
    return out


def _run_parser_bakeoff(max_files: int = 16) -> tuple[bool, str]:
    if not PARSER_BAKEOFF.exists():
        return False, f'missing parser bakeoff script: {PARSER_BAKEOFF}'
    cp = subprocess.run(
        ['python3', str(PARSER_BAKEOFF), '--max-files', str(max_files)],
        cwd=str(BENCH),
        capture_output=True,
        text=True,
    )
    if cp.returncode != 0:
        tail = '\n'.join(cp.stderr.splitlines()[-5:] or cp.stdout.splitlines()[-5:])
        return False, tail or f'parser bakeoff failed rc={cp.returncode}'
    return True, 'ok'


def _load_parser_bakeoff_summary() -> dict[str, Any] | None:
    if not PARSER_BAKEOFF_JSON.exists():
        return None
    try:
        data = json.loads(PARSER_BAKEOFF_JSON.read_text())
        if not isinstance(data, dict):
            return None
        return data
    except Exception:
        return None


def _write_report(
    baseline_spec: RunSpec,
    candidate_specs: list[RunSpec],
    recent_cycles: list[dict[str, Any]],
    all_stats: dict[str, dict[str, Any]],
    decisions: list[dict[str, Any]],
    parser_bakeoff: dict[str, Any] | None = None,
) -> None:
    lines = [
        '# Self-Optimizing Harness Report',
        '',
        f"- Generated: {time.strftime('%Y-%m-%d %H:%M:%S')}",
        f"- Cycles in this run: {len(recent_cycles)}",
        f"- Total historical cycles: {len(_load_history())}",
        '',
        '## Baseline',
        f"- {baseline_spec.model} / {baseline_spec.phase} / {baseline_spec.variant} / t{baseline_spec.timeout} r{baseline_spec.retries} i{int(baseline_spec.isolate)}",
        '',
        f"## Candidate Matrix ({len(candidate_specs)} specs)",
    ]
    for c in candidate_specs:
        lines.append(f"- {c.model} / {c.phase} / {c.variant} / t{c.timeout} r{c.retries} i{int(c.isolate)}")

    lines += [
        '',
        '## Aggregated Metrics (median / variance)',
        '',
        '| Spec | Samples | Success | MedAcc | VarAcc | MedRestraint | MedElapsed(s) |',
        '|---|---:|---:|---:|---:|---:|---:|',
    ]

    for slug, stat in sorted(all_stats.items()):
        s = stat['spec']
        label = f"{s['model']} {s['phase']}/{s['variant']} t{s['timeout']} r{s['retries']} i{int(s['isolate'])}"
        lines.append(
            f"| {label} | {stat['samples']} | {stat['success_rate']:.2f} | "
            f"{stat['median_accuracy'] if stat['median_accuracy'] is not None else 'n/a'} | "
            f"{stat['variance_accuracy'] if stat['variance_accuracy'] is not None else 'n/a'} | "
            f"{stat['median_restraint'] if stat['median_restraint'] is not None else 'n/a'} | "
            f"{stat['median_elapsed_s'] if stat['median_elapsed_s'] is not None else 'n/a'} |"
        )

    lines += ['', '## Policy Decisions', '', '| Candidate | Decision | Reason |', '|---|---|---|']
    for d in decisions:
        lines.append(f"| {d['candidate']} | {d['decision']} | {d['reason']} |")

    promoted = [d for d in decisions if d['decision'] == 'promote']
    lines += ['', '## Closed-Loop Outcome']
    if promoted:
        lines.append(f"- Promote: {promoted[0]['candidate']}")
    else:
        lines.append('- No candidate promoted this run.')

    if parser_bakeoff:
        rec = parser_bakeoff.get('recommendation', {})
        metrics = parser_bakeoff.get('metrics', {})
        lines += ['', '## Parser Candidate Bake-off']
        lines.append(f"- Rows evaluated: {parser_bakeoff.get('rows_evaluated', 0)}")
        lines.append(f"- Recommended strategy: {rec.get('strategy', 'n/a')} ({rec.get('reason', 'n/a')})")
        m = metrics.get(rec.get('strategy', ''), {}) if isinstance(metrics, dict) else {}
        if m:
            lines.append(
                f"- Recommended metrics: acc={m.get('accuracy', 0):.4f}, restraint={m.get('restraint_score', 0):.4f}, precision={m.get('precision', 0):.4f}"
            )

    REPORT.write_text('\n'.join(lines) + '\n')


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument('--baseline-model', default='lfm2.5-thinking:1.2b')
    p.add_argument('--baseline-phase', default='atomic')
    p.add_argument('--baseline-variant', default='native_api')
    p.add_argument('--baseline-timeout', type=int, default=60)
    p.add_argument('--baseline-retries', type=int, default=1)
    p.add_argument('--baseline-isolate', action='store_true')

    p.add_argument('--models', nargs='+', default=['lfm2.5-thinking:1.2b'])
    p.add_argument('--phase', default='atomic')
    p.add_argument('--variants', nargs='+', default=['native_api', 'atomic'])
    p.add_argument('--timeouts', nargs='+', type=int, default=[60])
    p.add_argument('--retries-list', nargs='+', type=int, default=[1, 2])
    p.add_argument('--isolate-modes', nargs='+', type=int, default=[1])

    # New closed-loop controls.
    p.add_argument('--cycles', type=int, default=3, help='How many baseline+candidate cycles to run')
    p.add_argument('--candidate-set', nargs='*', default=['default'], choices=['default', 'stability', 'explore'])
    p.add_argument('--parser-bakeoff', action='store_true', help='Run parser strategy bake-off after cycles')
    p.add_argument('--parser-bakeoff-max-files', type=int, default=16)

    args = p.parse_args()

    history = _load_history()
    baseline_spec = RunSpec(
        model=args.baseline_model,
        phase=args.baseline_phase,
        variant=args.baseline_variant,
        timeout=args.baseline_timeout,
        retries=args.baseline_retries,
        isolate=args.baseline_isolate,
    )
    candidate_specs = _build_candidates(args)

    recent_cycles: list[dict[str, Any]] = []
    for i in range(args.cycles):
        baseline = _run_spec(baseline_spec)
        rows = [_run_spec(spec) for spec in candidate_specs]
        cycle = {
            'ts': int(time.time()),
            'cycle_index': i + 1,
            'baseline': baseline,
            'rows': rows,
        }
        history.append(cycle)
        recent_cycles.append(cycle)
        _save_history(history)
        
        # Auto-routing enforcement after each cycle
        # Generate feedback and apply routing rules
        try:
            harness_feedback_loop.main()
            enforce_recommendations()
            print(f"🔄 Cycle {i+1}: Routing enforcement applied")
        except Exception as e:
            print(f"⚠️  Cycle {i+1}: Routing enforcement failed: {e}")

    all_stats = _aggregate_stats(history)
    baseline_stats = all_stats.get(baseline_spec.slug, {'samples': 0, 'median_accuracy': None, 'median_restraint': None})

    engine = PolicyEngine()
    decisions: list[dict[str, Any]] = []
    for spec in candidate_specs:
        stat = all_stats.get(spec.slug, {'samples': 0, 'median_accuracy': None, 'median_restraint': None, 'variance_accuracy': None})
        decision, reason = engine.decide(baseline_stats, stat)
        decisions.append({
            'candidate': f"{spec.model} {spec.phase}/{spec.variant} t{spec.timeout} r{spec.retries} i{int(spec.isolate)}",
            'decision': decision,
            'reason': reason,
            'slug': spec.slug,
        })

    # Rank promote first, then hold, then reject.
    rank = {'promote': 0, 'hold': 1, 'reject': 2}
    decisions.sort(key=lambda d: (rank.get(d['decision'], 9), d['candidate']))

    parser_bakeoff_summary: dict[str, Any] | None = None
    if args.parser_bakeoff:
        ok, detail = _run_parser_bakeoff(max_files=args.parser_bakeoff_max_files)
        if ok:
            parser_bakeoff_summary = _load_parser_bakeoff_summary()
        else:
            print(f'Parser bakeoff failed: {detail}')

    _write_report(baseline_spec, candidate_specs, recent_cycles, all_stats, decisions, parser_bakeoff_summary)
    print(f'Wrote {REPORT}')
    print(f'Wrote {HISTORY}')
    if args.parser_bakeoff:
        print(f'Parser bakeoff: {PARSER_BAKEOFF_JSON}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
