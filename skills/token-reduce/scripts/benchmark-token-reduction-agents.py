#!/usr/bin/env python3
"""Benchmark fresh agent behavior for token-reduction discovery prompts."""
from __future__ import annotations

import argparse
import json
import subprocess
from pathlib import Path


PROMPTS = [
    {
        "name": "benchmark_script",
        "prompt": "Find the script that benchmarks the token reduction workflow in this repo. Use the minimum context possible and return only the path.",
        "expect": "benchmark-token-reduction-workflow.py",
    },
    {
        "name": "measure_script",
        "prompt": "Find the Python script that measures token reduction adoption for this repo. Use the minimum context possible and return only the path.",
        "expect": "measure_token_reduction.py",
    },
    {
        "name": "bash_hook",
        "prompt": "Find the Python hook script that blocks broad exploratory Bash scans for the token reduction workflow. Use the minimum context possible and return only the path.",
        "expect": "advise-token-reduction.py",
    },
]


def run_command(cmd: list[str], repo_root: Path, timeout_s: int) -> tuple[int, str, str, bool]:
    try:
        proc = subprocess.run(
            cmd,
            cwd=repo_root,
            capture_output=True,
            text=True,
            check=False,
            timeout=timeout_s,
        )
        return proc.returncode, proc.stdout, proc.stderr, False
    except subprocess.TimeoutExpired as exc:
        return 124, exc.stdout or "", (exc.stderr or "").strip(), True


def run_claude(repo_root: Path, prompt: str, timeout_s: int) -> tuple[int, list[dict], str, bool]:
    return_code, stdout, stderr, timed_out = run_command(
        ["claude", "-p", prompt, "--output-format", "stream-json", "--verbose"],
        repo_root,
        timeout_s,
    )
    events = []
    for line in stdout.splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            events.append(json.loads(line))
        except json.JSONDecodeError:
            continue
    return return_code, events, stderr, timed_out


def analyze_claude(events: list[dict], expect: str) -> dict[str, object]:
    first_tool = None
    used_helper = False
    used_skill = False
    broad_scan = False
    final_text = ""

    for event in events:
        if event.get("type") == "assistant":
            message = event.get("message", {})
            for item in message.get("content", []):
                if item.get("type") == "tool_use":
                    name = item.get("name", "")
                    if first_tool is None:
                        first_tool = name
                    if name == "Skill":
                        used_skill = True
                    if name == "Bash":
                        cmd = (item.get("input") or {}).get("command", "")
                        if "token-reduce-paths.sh" in cmd or "token-reduce-snippet.sh" in cmd:
                            used_helper = True
                        if "find " in cmd or "ls -R" in cmd or "grep -R" in cmd:
                            broad_scan = True
                elif item.get("type") == "text":
                    final_text = item.get("text", final_text)
        elif event.get("type") == "result":
            final_text = event.get("result", final_text)

    return {
        "first_tool": first_tool,
        "used_helper": used_helper,
        "used_skill": used_skill,
        "broad_scan_attempt": broad_scan,
        "returned_expected": expect in final_text,
        "final_text": final_text.strip(),
    }


def run_codex(repo_root: Path, prompt: str, timeout_s: int) -> tuple[int, str, str, bool]:
    return run_command(
        [
            "codex",
            "--model",
            "gpt-5.4",
            "exec",
            "--skip-git-repo-check",
            "--color=never",
            prompt,
        ],
        repo_root,
        timeout_s,
    )


def analyze_codex(stdout: str, expect: str) -> dict[str, object]:
    return {
        "used_helper": "token-reduce-paths.sh" in stdout or "token-reduce-snippet.sh" in stdout,
        "broad_scan_attempt": "find " in stdout or "ls -R" in stdout or "grep -R" in stdout,
        "returned_expected": expect in stdout,
        "final_text": stdout.strip().splitlines()[-1] if stdout.strip() else "",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo-root", default=str(Path(__file__).resolve().parents[3]))
    parser.add_argument("--timeout-seconds", type=int, default=60)
    parser.add_argument("--agents", choices=["claude", "codex", "both"], default="claude")
    args = parser.parse_args()

    repo_root = Path(args.repo_root).resolve()
    results: dict[str, object] = {}
    if args.agents in {"claude", "both"}:
        results["claude"] = {}
    if args.agents in {"codex", "both"}:
        results["codex"] = {}

    for case in PROMPTS:
        name = case["name"]
        prompt = case["prompt"]
        expect = case["expect"]

        if args.agents in {"claude", "both"}:
            claude_code, claude_events, claude_err, claude_timed_out = run_claude(repo_root, prompt, args.timeout_seconds)
            results["claude"][name] = {
                "exit_code": claude_code,
                "stderr": claude_err.strip(),
                "timed_out": claude_timed_out,
                **analyze_claude(claude_events, expect),
            }

        if args.agents in {"codex", "both"}:
            codex_code, codex_out, codex_err, codex_timed_out = run_codex(repo_root, prompt, args.timeout_seconds)
            results["codex"][name] = {
                "exit_code": codex_code,
                "stderr": codex_err.strip(),
                "timed_out": codex_timed_out,
                **analyze_codex(codex_out, expect),
            }

    print(json.dumps(results, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
