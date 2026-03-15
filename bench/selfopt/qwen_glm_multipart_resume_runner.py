#!/usr/bin/env python3
"""
One-shot multipart benchmark runner (qwen3.5 vs glm) with resume + cache-aware behavior.

Design goals:
- Run in ordered parts (generation compare, qwen atomic, glm atomic)
- Resume interrupted atomic runs from checkpoint dirs (run_benchmark --resume)
- Skip already-completed parts when harness signature is unchanged
- Re-run all parts only when harness/config signature changes
"""

from __future__ import annotations

import hashlib
import json
import os
import subprocess
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional

BENCH_ROOT = Path("/root/.openclaw/workspace/bench")
CORE_DIR = BENCH_ROOT / "core"
RUNNER = CORE_DIR / "run_benchmark.py"
STATE_PATH = BENCH_ROOT / "results" / "qwen_glm_multipart_state.json"
GEN_OUTPUT = BENCH_ROOT / "model_compare_generation_qwen3.5_vs_glm-4.7-flash.json"
QWEN_ATOMIC_OUTPUT = BENCH_ROOT / "atomic_result_qwen3.5_atomic.json"
GLM_ATOMIC_OUTPUT = BENCH_ROOT / "atomic_result_glm-4.7-flash_atomic.json"

REQUIRED_LOCAL_MODELS = ["qwen3.5:35b", "glm-4.7-flash:latest"]

SIGNATURE_INPUTS = [
    BENCH_ROOT / "core" / "run_benchmark.py",
    BENCH_ROOT / "harness" / "phase2_config.json",
    BENCH_ROOT / "extended_benchmark_suite.json",
]


def log(msg: str) -> None:
    ts = time.strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{ts}] {msg}", flush=True)


def sh(cmd: List[str], cwd: Optional[Path] = None) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, cwd=str(cwd) if cwd else None, text=True, capture_output=True)


def compute_signature() -> str:
    h = hashlib.sha256()
    for p in SIGNATURE_INPUTS:
        h.update(str(p).encode())
        if p.exists():
            h.update(p.read_bytes())
    return h.hexdigest()


def load_state() -> Dict:
    if STATE_PATH.exists():
        try:
            return json.loads(STATE_PATH.read_text())
        except Exception:
            pass
    return {
        "schema": "qwen_glm_multipart_state.v1",
        "harness_signature": "",
        "parts": {
            "generation_compare": {"status": "pending"},
            "qwen_atomic": {"status": "pending", "resume_dir": ""},
            "glm_atomic": {"status": "pending", "resume_dir": ""},
        },
        "last_update": 0,
    }


def save_state(state: Dict) -> None:
    STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    state["last_update"] = time.time()
    STATE_PATH.write_text(json.dumps(state, indent=2))


def check_local_ollama_models() -> bool:
    """Hard guard: ensure required local Ollama models exist before running benchmark."""
    p = sh(["ollama", "list"])
    if p.returncode != 0:
        log("LOCAL_ONLY_GUARD: failed to query ollama list")
        if p.stderr:
            log(p.stderr[-800:])
        return False

    listed = set()
    for line in (p.stdout or "").splitlines()[1:]:
        line = line.strip()
        if not line:
            continue
        listed.add(line.split()[0])

    missing = [m for m in REQUIRED_LOCAL_MODELS if m not in listed]
    if missing:
        log(f"LOCAL_ONLY_GUARD: missing required local models: {missing}")
        return False

    log(f"LOCAL_ONLY_GUARD: required local models available: {REQUIRED_LOCAL_MODELS}")
    return True


def find_resume_dir(model: str, phase: str) -> Optional[str]:
    model_prefix = model.split(":")[0]
    prefix = f"run_{model_prefix}_{phase}_"
    candidates = []
    for d in BENCH_ROOT.glob(f"{prefix}*"):
        if d.is_dir() and (d / "checkpoint.json").exists():
            candidates.append(d)
    if not candidates:
        return None
    candidates.sort(key=lambda x: x.stat().st_mtime, reverse=True)
    return str(candidates[0])


def valid_generation_output() -> bool:
    if not GEN_OUTPUT.exists():
        return False
    try:
        d = json.loads(GEN_OUTPUT.read_text())
        s = d.get("summary", {})
        return "qwen3.5:35b" in s and "glm-4.7-flash:latest" in s
    except Exception:
        return False


def valid_atomic_output(path: Path) -> bool:
    if not path.exists():
        return False
    try:
        d = json.loads(path.read_text())
        s = d.get("summary", {})
        required = ["avg_tps", "median_tps", "total_tokens_generated", "passed", "total"]
        return all(k in s for k in required)
    except Exception:
        return False


def run_generation_part() -> bool:
    log("Part 1/3: generation compare (qwen3.5 vs glm)")
    cmd = [
        sys.executable,
        str(RUNNER),
        "qwen3.5:35b,glm-4.7-flash:latest",
        "--mode",
        "model-compare",
        "--model-compare-style",
        "generation",
        "--backend-url",
        "http://127.0.0.1:11434",
        "--timeout",
        "120",
    ]
    p = sh(cmd, cwd=CORE_DIR)
    if p.returncode != 0:
        log(f"generation compare failed rc={p.returncode}")
        log(p.stderr[-1200:])
        return False
    return valid_generation_output()


def run_atomic_part(model: str, output_path: Path, timeout_s: int, resume_dir: Optional[str]) -> tuple[bool, bool, Optional[str]]:
    label = f"{model} atomic"
    log(f"Part: {label}")
    cmd = [
        sys.executable,
        str(RUNNER),
        model,
        "atomic",
        "atomic",
        "--output",
        "json",
        "--timeout",
        str(timeout_s),
    ]

    # Resume only when checkpoint exists
    resume_candidate = resume_dir if (resume_dir and Path(resume_dir, "checkpoint.json").exists()) else find_resume_dir(model, "atomic")
    resumed = bool(resume_candidate)
    if resume_candidate:
        cmd += ["--resume", resume_candidate]
        log(f"Resuming {label} from {resume_candidate}")

    p = sh(cmd, cwd=CORE_DIR)
    if p.returncode != 0:
        log(f"{label} failed rc={p.returncode}")
        log((p.stderr or p.stdout)[-1200:])
        # Store latest checkpoint dir if any
        latest_resume = find_resume_dir(model, "atomic")
        return False, resumed, latest_resume

    ok = valid_atomic_output(output_path)
    return ok, resumed, None


def report_outputs(skipped_parts: List[str], resumed_parts: List[str]) -> None:
    def summarize(path: Path, name: str):
        if not path.exists():
            print(f"- {name}: MISSING ({path})")
            return
        d = json.loads(path.read_text())
        s = d.get("summary", {})
        print(
            f"- {name}: passed={s.get('passed')}/{s.get('total')} "
            f"avg_tps={s.get('avg_tps')} median_tps={s.get('median_tps')} "
            f"tokens={s.get('total_tokens_generated')}"
        )

    print("\n=== Multipart benchmark outputs ===")
    if GEN_OUTPUT.exists():
        d = json.loads(GEN_OUTPUT.read_text())
        ss = d.get("summary", {})
        q = ss.get("qwen3.5:35b", {})
        g = ss.get("glm-4.7-flash:latest", {})
        print(f"- generation compare: qwen mean_tps={q.get('mean_tps')} | glm mean_tps={g.get('mean_tps')}")
    else:
        print(f"- generation compare: MISSING ({GEN_OUTPUT})")

    summarize(QWEN_ATOMIC_OUTPUT, "qwen atomic")
    summarize(GLM_ATOMIC_OUTPUT, "glm atomic")

    print("\nOutput file paths:")
    print(f"- generation compare: {GEN_OUTPUT}")
    print(f"- qwen atomic: {QWEN_ATOMIC_OUTPUT}")
    print(f"- glm atomic: {GLM_ATOMIC_OUTPUT}")

    skipped = skipped_parts if skipped_parts else ["none"]
    resumed = resumed_parts if resumed_parts else ["none"]
    print("\nResume/caching status:")
    print(f"- skipped_cached_parts: {', '.join(skipped)}")
    print(f"- resumed_from_checkpoint: {', '.join(resumed)}")


def main() -> int:
    sig = compute_signature()
    state = load_state()
    skipped_parts: List[str] = []
    resumed_parts: List[str] = []

    if not check_local_ollama_models():
        log("Aborting: local model guard failed")
        return 2

    if state.get("harness_signature") != sig:
        log("Harness signature changed: resetting part status to pending")
        state["harness_signature"] = sig
        state["parts"] = {
            "generation_compare": {"status": "pending"},
            "qwen_atomic": {"status": "pending", "resume_dir": ""},
            "glm_atomic": {"status": "pending", "resume_dir": ""},
        }
        save_state(state)

    # Part 1: generation compare
    if state["parts"]["generation_compare"]["status"] != "done":
        if valid_generation_output():
            log("Skipping generation compare (cached output valid)")
            state["parts"]["generation_compare"]["status"] = "done"
            skipped_parts.append("generation_compare")
        else:
            ok = run_generation_part()
            state["parts"]["generation_compare"]["status"] = "done" if ok else "failed"
            save_state(state)
            if not ok:
                report_outputs(skipped_parts, resumed_parts)
                return 1

    # Part 2: qwen atomic
    if state["parts"]["qwen_atomic"]["status"] != "done":
        if valid_atomic_output(QWEN_ATOMIC_OUTPUT):
            log("Skipping qwen atomic (cached output valid)")
            state["parts"]["qwen_atomic"]["status"] = "done"
            state["parts"]["qwen_atomic"]["resume_dir"] = ""
            skipped_parts.append("qwen_atomic")
        else:
            ok, resumed, resume_dir = run_atomic_part(
                "qwen3.5:35b",
                QWEN_ATOMIC_OUTPUT,
                timeout_s=120,
                resume_dir=state["parts"]["qwen_atomic"].get("resume_dir") or None,
            )
            if resumed:
                resumed_parts.append("qwen_atomic")
            state["parts"]["qwen_atomic"]["status"] = "done" if ok else "failed"
            state["parts"]["qwen_atomic"]["resume_dir"] = resume_dir or ""
            save_state(state)
            if not ok:
                report_outputs(skipped_parts, resumed_parts)
                return 1

    # Part 3: glm atomic
    if state["parts"]["glm_atomic"]["status"] != "done":
        if valid_atomic_output(GLM_ATOMIC_OUTPUT):
            log("Skipping glm atomic (cached output valid)")
            state["parts"]["glm_atomic"]["status"] = "done"
            state["parts"]["glm_atomic"]["resume_dir"] = ""
            skipped_parts.append("glm_atomic")
        else:
            ok, resumed, resume_dir = run_atomic_part(
                "glm-4.7-flash:latest",
                GLM_ATOMIC_OUTPUT,
                timeout_s=90,
                resume_dir=state["parts"]["glm_atomic"].get("resume_dir") or None,
            )
            if resumed:
                resumed_parts.append("glm_atomic")
            state["parts"]["glm_atomic"]["status"] = "done" if ok else "failed"
            state["parts"]["glm_atomic"]["resume_dir"] = resume_dir or ""
            save_state(state)
            if not ok:
                report_outputs(skipped_parts, resumed_parts)
                return 1

    save_state(state)
    report_outputs(skipped_parts, resumed_parts)
    print("\nMULTIPART_BENCHMARK_DONE")
    return 0


if __name__ == "__main__":
    sys.exit(main())
