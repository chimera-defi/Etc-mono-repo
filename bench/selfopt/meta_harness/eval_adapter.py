#!/usr/bin/env python3
from __future__ import annotations

import copy
import json
import os
import re
import subprocess
import time
from pathlib import Path
from typing import Any

RESULTS_RE = re.compile(r"Results:\s*(\d+)\s*/\s*(\d+)\s*passed", re.IGNORECASE)
FAILED_RE = re.compile(r"Failed:\s*([^\n]+)", re.IGNORECASE)
PROMPT_ID_RE = re.compile(r"P\d+")
RESTRAINT_RE = re.compile(
    r"Restraint(?:\s+Score)?\s*:\s*([0-9]*\.?[0-9]+)", re.IGNORECASE
)


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def _bench_root(repo_root: Path) -> Path:
    return repo_root / "bench"


def _load_phase2_config(bench_root: Path) -> dict[str, Any]:
    config_path = bench_root / "harness" / "phase2_config.json"
    return json.loads(config_path.read_text(encoding="utf-8"))


def _apply_patch_to_config(
    config: dict[str, Any], candidate: dict[str, Any]
) -> tuple[dict[str, Any], list[str]]:
    model = str(candidate["target"]["model"])
    variant = str(candidate["target"]["variant"])
    patch = candidate.get("patch") or {}

    patched = copy.deepcopy(config)
    notes: list[str] = []

    model_cfg = patched.get("models", {}).get(model)
    if not isinstance(model_cfg, dict):
        raise ValueError(f"Unknown model in candidate target: {model}")

    variants = model_cfg.get("variants", {})
    if variant not in variants:
        raise ValueError(f"Unknown variant '{variant}' for model '{model}'")

    if "system_prompt" in patch:
        variants[variant]["system"] = patch["system_prompt"]
        notes.append("patched variants.<variant>.system")

    if "timeout_seconds" in patch:
        model_cfg["timeout_seconds"] = int(patch["timeout_seconds"])
        notes.append("patched model.timeout_seconds")

    if "temperature" in patch:
        model_cfg["temperature"] = float(patch["temperature"])
        notes.append("patched model.temperature")

    return patched, notes


def _parse_stdout(stdout: str) -> dict[str, Any]:
    passed = 0
    total = 0
    failed_prompts: list[str] = []
    restraint_score: float | None = None

    m = RESULTS_RE.search(stdout)
    if m:
        passed = int(m.group(1))
        total = int(m.group(2))

    m_failed = FAILED_RE.search(stdout)
    if m_failed:
        raw = m_failed.group(1).strip()
        if raw and raw.upper() != "NONE":
            ids = PROMPT_ID_RE.findall(raw)
            failed_prompts = sorted(set(ids if ids else [raw]))

    m_restraint = RESTRAINT_RE.search(stdout)
    if m_restraint:
        restraint_score = float(m_restraint.group(1))

    accuracy = (passed / total) if total else 0.0
    return {
        "passed": passed,
        "total": total,
        "accuracy": round(accuracy, 6),
        "failed_prompts": failed_prompts,
        "restraint_score": restraint_score,
    }


def evaluate_candidate(
    candidate: dict[str, Any],
    logs_dir: Path,
    *,
    repo_root: Path | None = None,
) -> dict[str, Any]:
    repo_root = repo_root or _repo_root()
    bench_root = _bench_root(repo_root)
    runner = bench_root / "core" / "run_benchmark.py"
    suite_path = bench_root / "extended_benchmark_suite.json"

    base_config = _load_phase2_config(bench_root)
    config, patch_notes = _apply_patch_to_config(base_config, candidate)

    config_dir = logs_dir / "configs"
    config_dir.mkdir(parents=True, exist_ok=True)
    config_path = config_dir / f"{candidate['name']}.phase2_config.json"
    config_path.write_text(json.dumps(config, indent=2), encoding="utf-8")

    target = candidate["target"]
    cmd = [
        "python3",
        str(runner),
        str(target["model"]),
        str(target["phase"]),
        str(target["variant"]),
        "--no-cache",
        "--no-save",
    ]

    started = time.time()
    env = os.environ.copy()
    env["BENCH_PHASE2_CONFIG_PATH"] = str(config_path)
    env["BENCH_EXTENDED_SUITE_PATH"] = str(suite_path)

    cp = subprocess.run(
        cmd,
        cwd=str(repo_root),
        capture_output=True,
        text=True,
        env=env,
    )
    ended = time.time()

    summary = _parse_stdout(cp.stdout)
    return {
        "candidate": candidate["name"],
        "target": target,
        "hypothesis": candidate.get("hypothesis", ""),
        "changes": candidate.get("changes", ""),
        "expected_delta": candidate.get("expected_delta", ""),
        "patch_notes": patch_notes,
        "command": cmd,
        "rc": cp.returncode,
        "elapsed_s": round(ended - started, 3),
        "started_at": started,
        "ended_at": ended,
        "summary": summary,
        "stdout_tail": "\n".join(cp.stdout.splitlines()[-25:]),
        "stderr_tail": "\n".join(cp.stderr.splitlines()[-25:]),
        "config_path": str(config_path),
    }
