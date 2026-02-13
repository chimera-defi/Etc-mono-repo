#!/usr/bin/env python3
"""Minimal LLM benchmark harness for OpenClaw.

Targets:
- Ollama via OpenAI-compatible endpoint (default http://localhost:11434/v1)
- OpenAI (Codex) via Responses API (https://api.openai.com/v1/responses)
- Claude via Claude Code CLI (best-effort; otherwise skipped_unavailable)

Outputs (under bench/openclaw_llm_bench/runs/<run_id>/):
- config.json
- inventory.json
- results.jsonl
- summary.json
- summary.md

Dependencies: Python 3 stdlib only.
"""

from __future__ import annotations

import argparse
import datetime as _dt
import json
import math
import os
import re
import statistics
import subprocess
import sys
import time
import urllib.error
import urllib.request
from dataclasses import dataclass
from typing import Any, Dict, Iterable, List, Optional, Tuple


def now_ms() -> int:
    return time.time_ns() // 1_000_000


def perf_ms() -> int:
    return time.perf_counter_ns() // 1_000_000


def mkdir_p(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def write_json(path: str, obj: Any) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2, sort_keys=True)
        f.write("\n")


def read_json(path: str) -> Any:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def append_jsonl(path: str, obj: Any) -> None:
    with open(path, "a", encoding="utf-8") as f:
        f.write(json.dumps(obj, ensure_ascii=False))
        f.write("\n")


def http_json(url: str, payload: Dict[str, Any], headers: Dict[str, str], timeout_s: int = 300) -> Dict[str, Any]:
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, method="POST")
    req.add_header("Content-Type", "application/json")
    for k, v in headers.items():
        req.add_header(k, v)
    with urllib.request.urlopen(req, timeout=timeout_s) as resp:
        body = resp.read().decode("utf-8", errors="replace")
    return json.loads(body)


def http_sse(
    url: str,
    payload: Dict[str, Any],
    headers: Dict[str, str],
    *,
    timeout_s: int,
) -> Iterable[Dict[str, Any]]:
    """Yield parsed JSON objects from a Server-Sent Events response.

    Expects `data: <json>` lines and terminates on `data: [DONE]`.
    """
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, method="POST")
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept", "text/event-stream")
    for k, v in headers.items():
        req.add_header(k, v)

    with urllib.request.urlopen(req, timeout=timeout_s) as resp:
        # resp is a file-like object; iterate by lines
        for raw in resp:
            try:
                line = raw.decode("utf-8", errors="replace").strip()
            except Exception:
                continue
            if not line:
                continue
            if not line.startswith("data:"):
                continue
            datum = line[len("data:") :].strip()
            if datum == "[DONE]":
                return
            try:
                yield json.loads(datum)
            except Exception:
                continue


def run_cmd(cmd: List[str], timeout_s: int = 60) -> Tuple[int, str, str]:
    try:
        p = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout_s)
        return p.returncode, p.stdout, p.stderr
    except FileNotFoundError as e:
        return 127, "", str(e)
    except subprocess.TimeoutExpired as e:
        out = (e.stdout or "")
        err = (e.stderr or "")
        return 124, out, err + "\nTIMEOUT"


# ---------------------------
# Validators (objective checks)


def _strip(s: str) -> str:
    return s.strip(" \t\r\n")


def validate_output(text: str, validator: Dict[str, Any]) -> Tuple[Optional[bool], Optional[str], Optional[Any]]:
    """Returns (objective_pass, violation, parsed_output)."""
    vtype = (validator or {}).get("type", "noop")

    if vtype == "noop":
        return None, None, None

    out = _strip(text)

    if vtype == "exact":
        want = validator.get("value", "")
        ok = out == want
        return ok, None if ok else f"exact_mismatch want={want!r}", out

    if vtype == "one_of":
        vals = validator.get("values", [])
        ok = out in vals
        return ok, None if ok else f"not_one_of {vals}", out

    if vtype == "regex_fullmatch":
        pat = validator.get("pattern", "")
        ok = bool(re.fullmatch(pat, out))
        return ok, None if ok else f"regex_fullmatch_failed pattern={pat!r}", out

    if vtype == "max_words":
        n = int(validator.get("value", 0))
        words = [w for w in re.split(r"\s+", out) if w]
        ok = len(words) <= n
        return ok, None if ok else f"too_many_words got={len(words)} limit={n}", {"words": len(words), "text": out}

    if vtype == "max_sentences":
        n = int(validator.get("value", 1))
        # naive sentence splitter; good enough for objective constraint
        sentences = [s for s in re.split(r"(?<=[.!?])\s+", out) if s.strip()]
        ok = len(sentences) <= n
        return ok, None if ok else f"too_many_sentences got={len(sentences)} limit={n}", {"sentences": len(sentences), "text": out}

    if vtype == "exact_bullets":
        n = int(validator.get("value", 0))
        lines = [ln.rstrip() for ln in out.splitlines() if ln.strip()]
        bullets = [ln for ln in lines if ln.lstrip().startswith("-")]
        ok = len(bullets) == n
        return ok, None if ok else f"bullet_count got={len(bullets)} want={n}", {"bullets": len(bullets), "lines": lines[:20]}

    if vtype == "json_keys":
        try:
            parsed = json.loads(out)
        except Exception as e:
            return False, f"json_parse_error: {e}", None
        if not isinstance(parsed, dict):
            return False, "json_not_object", parsed

        required = validator.get("required_keys", [])
        for k in required:
            if k not in parsed:
                return False, f"missing_key:{k}", parsed

        rules = validator.get("key_rules", {})
        for k, rule in rules.items():
            if k not in parsed:
                continue
            rtype = rule.get("type")
            if rtype == "one_of":
                if parsed[k] not in rule.get("values", []):
                    return False, f"key_rule_one_of_failed:{k}", parsed
            elif rtype == "number":
                if not isinstance(parsed[k], (int, float)) or isinstance(parsed[k], bool):
                    return False, f"key_rule_number_failed:{k}", parsed
        return True, None, parsed

    return None, f"unknown_validator:{vtype}", None


# ---------------------------
# Provider clients


@dataclass
class CallResult:
    availability_status: str  # ok|skipped_unavailable|auth_error|rate_limited|error
    success: bool
    failure_type: Optional[str]
    raw_output: str
    ttft_ms: Optional[int] = None
    input_tokens: Optional[int] = None
    output_tokens: Optional[int] = None


class Provider:
    name: str

    def supports_streaming(self) -> bool:
        return False

    def call(
        self,
        *,
        model: str,
        prompt: str,
        thinking_level: Optional[str],
        timeout_s: int,
        stream: bool,
    ) -> CallResult:
        raise NotImplementedError


class OllamaOpenAIProvider(Provider):
    name = "ollama_openai"

    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip("/")

    def supports_streaming(self) -> bool:
        return True

    def call(
        self,
        *,
        model: str,
        prompt: str,
        thinking_level: Optional[str],
        timeout_s: int,
        stream: bool,
    ) -> CallResult:
        url = f"{self.base_url}/chat/completions"
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": "You are a helpful assistant. Follow instructions exactly."},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0,
            "stream": False,
        }
        try:
            payload["stream"] = bool(stream)
            if not stream:
                resp = http_json(url, payload, headers={}, timeout_s=timeout_s)
                content = (((resp.get("choices") or [{}])[0]).get("message") or {}).get("content")
                if content is None:
                    return CallResult("error", False, "empty_response", "")
                usage = resp.get("usage") or {}
                return CallResult(
                    "ok",
                    True,
                    None,
                    str(content),
                    ttft_ms=None,
                    input_tokens=usage.get("prompt_tokens"),
                    output_tokens=usage.get("completion_tokens"),
                )

            # Streaming: parse OpenAI-style SSE from Ollama.
            started = perf_ms()
            ttft: Optional[int] = None
            chunks: List[str] = []
            for evt in http_sse(url, payload, headers={}, timeout_s=timeout_s):
                choice0 = (evt.get("choices") or [{}])[0]
                delta = choice0.get("delta") or {}
                piece = delta.get("content")
                if piece:
                    if ttft is None:
                        ttft = max(0, perf_ms() - started)
                    chunks.append(str(piece))
            text = "".join(chunks).strip()
            if not text:
                return CallResult("error", False, "empty_response", "", ttft_ms=ttft)
            return CallResult("ok", True, None, text, ttft_ms=ttft)
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="replace") if hasattr(e, "read") else str(e)
            status = "error"
            failure = f"http_{getattr(e, 'code', 'unknown')}"
            return CallResult(status, False, failure, body)
        except Exception as e:
            return CallResult("error", False, "exception", str(e))


class OpenAIResponsesProvider(Provider):
    name = "openai_responses"

    def __init__(self, api_key: str, base_url: str = "https://api.openai.com/v1"):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")

    def supports_streaming(self) -> bool:
        return True

    def call(
        self,
        *,
        model: str,
        prompt: str,
        thinking_level: Optional[str],
        timeout_s: int,
        stream: bool,
    ) -> CallResult:
        url = f"{self.base_url}/responses"

        # Best-effort mapping; adjust if your OpenAI org uses different params.
        reasoning: Optional[Dict[str, Any]] = None
        if thinking_level in ("low", "medium", "high", "xhigh"):
            effort = thinking_level
            if effort == "medium":
                effort = "medium"
            reasoning = {"effort": effort}

        payload: Dict[str, Any] = {
            "model": model,
            "input": [
                {
                    "role": "user",
                    "content": [{"type": "input_text", "text": prompt}],
                }
            ],
        }
        if reasoning is not None:
            payload["reasoning"] = reasoning

        headers = {"Authorization": f"Bearer {self.api_key}"}

        try:
            if not stream:
                resp = http_json(url, payload, headers=headers, timeout_s=timeout_s)
                # Extract text from output[] content blocks
                out_text = ""
                for item in resp.get("output", []) or []:
                    for c in item.get("content", []) or []:
                        if c.get("type") in ("output_text", "text") and "text" in c:
                            out_text += c.get("text", "")
                out_text = out_text.strip()
                usage = resp.get("usage") or {}
                input_tokens = usage.get("input_tokens")
                output_tokens = usage.get("output_tokens")
                if not out_text:
                    return CallResult("error", False, "empty_response", json.dumps(resp)[:2000])
                return CallResult(
                    "ok",
                    True,
                    None,
                    out_text,
                    ttft_ms=None,
                    input_tokens=input_tokens,
                    output_tokens=output_tokens,
                )

            # Streaming Responses API (SSE). Capture TTFT from first output_text delta.
            payload2 = dict(payload)
            payload2["stream"] = True
            started = perf_ms()
            ttft: Optional[int] = None
            out_chunks: List[str] = []
            input_tokens: Optional[int] = None
            output_tokens: Optional[int] = None

            for evt in http_sse(url, payload2, headers=headers, timeout_s=timeout_s):
                etype = evt.get("type")
                if etype == "response.output_text.delta":
                    delta = evt.get("delta")
                    if delta:
                        if ttft is None:
                            ttft = max(0, perf_ms() - started)
                        out_chunks.append(str(delta))
                elif etype == "response.completed":
                    usage = (evt.get("response") or {}).get("usage") or evt.get("usage") or {}
                    input_tokens = usage.get("input_tokens")
                    output_tokens = usage.get("output_tokens")

            out_text = "".join(out_chunks).strip()
            if not out_text:
                return CallResult("error", False, "empty_response", "", ttft_ms=ttft)
            return CallResult(
                "ok",
                True,
                None,
                out_text,
                ttft_ms=ttft,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
            )
        except urllib.error.HTTPError as e:
            code = getattr(e, "code", None)
            body = e.read().decode("utf-8", errors="replace") if hasattr(e, "read") else str(e)
            if code in (401, 403):
                return CallResult("auth_error", False, f"http_{code}", body)
            if code == 429:
                return CallResult("rate_limited", False, "http_429", body)
            return CallResult("error", False, f"http_{code}", body)
        except Exception as e:
            return CallResult("error", False, "exception", str(e))


class ClaudeCodeCLIProvider(Provider):
    name = "claude_code_cli"

    def supports_streaming(self) -> bool:
        # We do not attempt to implement TTFT for CLI streaming in this minimal harness.
        return False

    def call(
        self,
        *,
        model: str,
        prompt: str,
        thinking_level: Optional[str],
        timeout_s: int,
        stream: bool,
    ) -> CallResult:
        # Best-effort. If claude isn't installed/logged in, we mark skipped_unavailable.
        cmd = ["claude", "-p", prompt, "--model", model]
        rc, out, err = run_cmd(cmd, timeout_s=timeout_s)
        if rc == 127:
            return CallResult("skipped_unavailable", False, "claude_cli_missing", err)
        if rc != 0:
            # Treat auth/credits issues as skipped_unavailable to support reruns.
            combined = (out + "\n" + err).strip()
            low = combined.lower()
            if "not logged" in low or "auth" in low or "login" in low:
                return CallResult("skipped_unavailable", False, "claude_auth", combined)
            if "credit" in low or "quota" in low or "rate" in low:
                return CallResult("skipped_unavailable", False, "claude_quota", combined)
            return CallResult("error", False, "claude_cli_error", combined)

        text = out.strip()
        if not text:
            return CallResult("error", False, "empty_response", err.strip())
        return CallResult("ok", True, None, text)


# ---------------------------
# Benchmark runner


def percentile(xs: List[float], p: float) -> Optional[float]:
    if not xs:
        return None
    xs = sorted(xs)
    if len(xs) == 1:
        return float(xs[0])
    k = (len(xs) - 1) * (p / 100.0)
    f = math.floor(k)
    c = math.ceil(k)
    if f == c:
        return float(xs[int(k)])
    d0 = xs[f] * (c - k)
    d1 = xs[c] * (k - f)
    return float(d0 + d1)


def load_existing_keys(results_path: str) -> set:
    keys = set()
    if not os.path.exists(results_path):
        return keys
    with open(results_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except Exception:
                continue
            if obj.get("record_type") != "result":
                continue
            keys.add(
                (
                    obj.get("provider"),
                    obj.get("model"),
                    obj.get("thinking_level"),
                    obj.get("prompt_id"),
                )
            )
    return keys


def parse_ollama_ps_models(ollama_ps_output: str) -> List[str]:
    lines = [ln.rstrip() for ln in (ollama_ps_output or "").splitlines() if ln.strip()]
    if not lines:
        return []
    # Expect a header like: NAME ID SIZE ...
    if lines and lines[0].lower().startswith("name"):
        lines = lines[1:]
    models: List[str] = []
    for ln in lines:
        # best-effort: first whitespace-separated token is model name
        parts = ln.split()
        if parts:
            models.append(parts[0])
    # de-dup while preserving order
    seen = set()
    out: List[str] = []
    for m in models:
        if m not in seen:
            seen.add(m)
            out.append(m)
    return out


def ensure_ollama_idle(out_dir: str, tag: str) -> None:
    """Best-effort: ensure no old model is still running before we start a new suite."""
    results_path = os.path.join(out_dir, "results.jsonl")

    rc, ps_out, ps_err = run_cmd(["ollama", "ps"], timeout_s=10)
    if rc != 0:
        append_jsonl(results_path, {
            "record_type": "event",
            "tag": tag,
            "event": "ollama_ps_failed",
            "error": ps_err.strip(),
        })
        return

    running = parse_ollama_ps_models(ps_out)
    if not running:
        return

    # Try stopping each running model.
    for m in running:
        rc2, _, err2 = run_cmd(["ollama", "stop", m], timeout_s=30)
        append_jsonl(results_path, {
            "record_type": "event",
            "tag": tag,
            "event": "ollama_stop",
            "model": m,
            "ok": rc2 == 0,
            "error": err2.strip() if rc2 != 0 else None,
        })

    # Re-check with a short backoff loop: stop may be asynchronous.
    for attempt in range(1, 6):
        time.sleep(0.5 * attempt)
        rc3, ps2_out, ps2_err = run_cmd(["ollama", "ps"], timeout_s=10)
        if rc3 != 0:
            append_jsonl(results_path, {
                "record_type": "event",
                "tag": tag,
                "event": "ollama_ps_failed_after_stop",
                "attempt": attempt,
                "error": ps2_err.strip(),
            })
            return
        still = parse_ollama_ps_models(ps2_out)
        if not still:
            append_jsonl(results_path, {
                "record_type": "event",
                "tag": tag,
                "event": "ollama_idle_confirmed",
                "attempt": attempt,
            })
            return

    append_jsonl(results_path, {
        "record_type": "event",
        "tag": tag,
        "event": "ollama_still_running",
        "models": still,
    })


def capture_resources(out_dir: str, tag: str) -> Dict[str, str]:
    mkdir_p(out_dir)
    res: Dict[str, str] = {}

    rc, free_out, _ = run_cmd(["free", "-h"], timeout_s=10)
    rc2, df_out, _ = run_cmd(["df", "-h", "/"], timeout_s=10)
    rc3, ollama_out, _ = run_cmd(["ollama", "ps"], timeout_s=10)

    res_path = os.path.join(out_dir, f"resources_{tag}.txt")
    with open(res_path, "w", encoding="utf-8") as f:
        f.write("# free -h\n")
        f.write(free_out if rc == 0 else "(free failed)\n")
        f.write("\n# df -h /\n")
        f.write(df_out if rc2 == 0 else "(df failed)\n")
        f.write("\n# ollama ps\n")
        f.write(ollama_out if rc3 == 0 else "(ollama ps failed)\n")

    res["resources_path"] = res_path
    return res


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--run-id", default=None, help="Run id folder name (default: timestamp)")
    ap.add_argument("--prompts", default="prompts_v1.json", help="Path to prompts JSON")
    ap.add_argument(
        "--prompt-ids",
        default=None,
        help="Comma-separated prompt ids to run (e.g., P0,P1,P2). Default: run all prompts in the suite.",
    )
    ap.add_argument(
        "--targets",
        default="ollama,openai_low,openai_high,claude_haiku,claude_opus",
        help="Comma-separated targets to run (subset allowed)",
    )
    ap.add_argument("--ollama-base", default=os.environ.get("OLLAMA_OPENAI_BASE", "http://localhost:11434/v1"))
    ap.add_argument("--openai-base", default=os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1"))
    ap.add_argument("--openai-model", default=os.environ.get("OPENAI_CODEX_MODEL", "openai-codex/gpt-5.3-codex"))
    ap.add_argument("--claude-haiku-model", default=os.environ.get("CLAUDE_HAIKU_MODEL", "claude-haiku"))
    ap.add_argument("--claude-opus-model", default=os.environ.get("CLAUDE_OPUS_MODEL", "claude-opus-4.6"))
    ap.add_argument(
        "--ollama-models",
        default=os.environ.get(
            "OLLAMA_MODELS",
            "qwen2.5:3b,qwen3:4b,qwen3:8b,qwen3:14b,llama3.2:3b,gemma2:2b,phi3:3.8b,glm-4.7-flash:latest,gpt-oss:latest,devstral-small-2:latest,ministral-3:latest,mistral-small3.2:latest",
        ),
        help="Comma-separated Ollama models",
    )
    ap.add_argument("--timeout-s", type=int, default=300)
    ap.add_argument("--resume", action="store_true", help="Skip model×prompt pairs already in results.jsonl")
    ap.add_argument(
        "--stream",
        action="store_true",
        help="Enable streaming + TTFT capture. Aborts unless *all* targets in the run support streaming.",
    )
    ap.add_argument(
        "--allow-concurrent-ollama",
        action="store_true",
        help="Do NOT stop other Ollama runners between model suites. Use only for contention-mode experiments.",
    )

    args = ap.parse_args()

    here = os.path.dirname(os.path.abspath(__file__))
    prompts_path = args.prompts
    if not os.path.isabs(prompts_path):
        prompts_path = os.path.join(here, prompts_path)

    prompts = read_json(prompts_path)

    if args.prompt_ids:
        want = [x.strip() for x in args.prompt_ids.split(",") if x.strip()]
        want_set = set(want)
        prompts = [p for p in prompts if p.get("id") in want_set]
        missing = [pid for pid in want if pid not in {p.get('id') for p in prompts}]
        if missing:
            raise SystemExit(f"Unknown prompt ids in --prompt-ids: {', '.join(missing)}")

    run_id = args.run_id or _dt.datetime.now().strftime("%Y%m%d_%H%M%S")
    runs_root = os.path.join(here, "runs")
    out_dir = os.path.join(runs_root, run_id)
    mkdir_p(out_dir)

    results_path = os.path.join(out_dir, "results.jsonl")

    targets = [t.strip() for t in args.targets.split(",") if t.strip()]

    # Build provider/model matrix
    tasks: List[Dict[str, Any]] = []

    # Ollama models
    ollama_models = [m.strip() for m in args.ollama_models.split(",") if m.strip()]
    if "ollama" in targets:
        for m in ollama_models:
            tasks.append({"provider": "ollama_openai", "model": m, "thinking_level": None})

    # OpenAI Codex
    if "openai_low" in targets:
        tasks.append({"provider": "openai_responses", "model": args.openai_model, "thinking_level": "low"})
    if "openai_high" in targets:
        tasks.append({"provider": "openai_responses", "model": args.openai_model, "thinking_level": "high"})

    # Claude via CLI
    if "claude_haiku" in targets:
        tasks.append({"provider": "claude_code_cli", "model": args.claude_haiku_model, "thinking_level": None})
    if "claude_opus" in targets:
        tasks.append({"provider": "claude_code_cli", "model": args.claude_opus_model, "thinking_level": None})

    # Provider instances
    providers: Dict[str, Provider] = {
        "ollama_openai": OllamaOpenAIProvider(args.ollama_base),
        "claude_code_cli": ClaudeCodeCLIProvider(),
    }

    openai_key = os.environ.get("OPENAI_API_KEY")
    if openai_key:
        providers["openai_responses"] = OpenAIResponsesProvider(openai_key, base_url=args.openai_base)
    else:
        # keep placeholder; calls will be marked auth_error
        providers["openai_responses"] = None  # type: ignore

    if args.stream:
        # Streaming TTFT is only allowed if ALL targets in this run support it.
        unsupported = []
        for task in tasks:
            prov = providers.get(task["provider"]) if providers else None
            if prov is None or not prov.supports_streaming():
                unsupported.append(f"{task['provider']}:{task['model']}")
        if unsupported:
            raise SystemExit(
                "--stream requested but not all targets support streaming/TTFT in this minimal harness. "
                f"Unsupported: {', '.join(unsupported)}"
            )

    existing_keys = load_existing_keys(results_path) if args.resume else set()

    # Capture inventory (ollama list + tool versions)
    inv: Dict[str, Any] = {
        "run_id": run_id,
        "created_at": _dt.datetime.now(_dt.timezone.utc).isoformat(),
        "host": {
            "uname": " ".join(os.uname()),
            "python": sys.version,
        },
    }
    rc, ollama_list_out, ollama_list_err = run_cmd(["ollama", "list"], timeout_s=30)
    inv["ollama_list"] = ollama_list_out if rc == 0 else {"error": ollama_list_err.strip()}
    rc, claude_ver, claude_ver_err = run_cmd(["claude", "--version"], timeout_s=10)
    inv["claude_version"] = claude_ver.strip() if rc == 0 else {"error": claude_ver_err.strip()}
    write_json(os.path.join(out_dir, "inventory.json"), inv)

    config = {
        "run_id": run_id,
        "prompts_path": os.path.relpath(prompts_path, out_dir),
        "targets": targets,
        "ollama_base": args.ollama_base,
        "openai_base": args.openai_base,
        "openai_model": args.openai_model,
        "ollama_models": ollama_models,
        "claude_haiku_model": args.claude_haiku_model,
        "claude_opus_model": args.claude_opus_model,
        "timeout_s": args.timeout_s,
        "stream": bool(args.stream),
    }
    write_json(os.path.join(out_dir, "config.json"), config)

    # Run sequentially to avoid contention skew.
    for task in tasks:
        provider_name = task["provider"]
        model = task["model"]
        thinking = task.get("thinking_level")

        prov = providers.get(provider_name)

        # Resource snapshots per model suite
        model_tag = f"{provider_name}__{model}__{thinking or 'none'}"
        model_tag_safe = re.sub(r"[^A-Za-z0-9_.-]+", "_", model_tag)

        # Prevent cross-model interference: stop any old Ollama runners before starting a new model suite.
        if provider_name == "ollama_openai" and (not args.allow_concurrent_ollama):
            ensure_ollama_idle(out_dir, tag=f"{model_tag_safe}_pre")

        capture_resources(out_dir, f"{model_tag_safe}_before")

        for p in prompts:
            pid = p["id"]
            key = (provider_name, model, thinking, pid)
            if key in existing_keys:
                continue

            started_wall_ms = now_ms()
            started_perf_ms = perf_ms()

            if prov is None:
                call_res = CallResult("auth_error", False, "openai_api_key_missing", "", ttft_ms=None)
            else:
                call_res = prov.call(
                    model=model,
                    prompt=p["prompt"],
                    thinking_level=thinking,
                    timeout_s=args.timeout_s,
                    stream=bool(args.stream),
                )

            ended_wall_ms = now_ms()
            ended_perf_ms = perf_ms()
            e2e_ms = max(0, ended_perf_ms - started_perf_ms)

            objective_pass, violation, parsed = validate_output(call_res.raw_output, p.get("validator") or {})

            rec = {
                "record_type": "result",
                "run_id": run_id,
                "provider": provider_name,
                "model": model,
                "thinking_level": thinking,
                "prompt_id": pid,
                "prompt_name": p.get("name"),
                "availability_status": call_res.availability_status,
                "started_at_ms": started_wall_ms,
                "ended_at_ms": ended_wall_ms,
                "e2e_ms": e2e_ms,
                "ttft_ms": call_res.ttft_ms,
                "success": bool(call_res.success),
                "failure_type": call_res.failure_type,
                "objective_pass": objective_pass,
                "violation": violation,
                "input_tokens": call_res.input_tokens,
                "output_tokens": call_res.output_tokens,
                "raw_output": call_res.raw_output,
                "parsed_output": parsed,
            }
            append_jsonl(results_path, rec)

        capture_resources(out_dir, f"{model_tag_safe}_after")

    # Generate summaries
    summarize(out_dir)
    return 0


def summarize(out_dir: str) -> None:
    results_path = os.path.join(out_dir, "results.jsonl")
    rows: List[Dict[str, Any]] = []
    with open(results_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            obj = json.loads(line)
            if obj.get("record_type") == "result":
                rows.append(obj)

    # group by provider/model/thinking
    groups: Dict[Tuple[str, str, Optional[str]], List[Dict[str, Any]]] = {}
    for r in rows:
        k = (r.get("provider"), r.get("model"), r.get("thinking_level"))
        groups.setdefault(k, []).append(r)

    summary_models: List[Dict[str, Any]] = []
    for (prov, model, thinking), rs in sorted(groups.items(), key=lambda x: (x[0][0], x[0][1], str(x[0][2]))):
        e2es = [float(r["e2e_ms"]) for r in rs if r.get("availability_status") == "ok" and r.get("success") and r.get("e2e_ms") is not None]
        succ = [r for r in rs if r.get("availability_status") == "ok" and r.get("success")]
        ok = [r for r in rs if r.get("availability_status") == "ok"]
        skipped = [r for r in rs if r.get("availability_status") == "skipped_unavailable"]

        obj_checked = [r for r in rs if r.get("objective_pass") is not None and r.get("availability_status") == "ok" and r.get("success")]
        obj_pass = [r for r in obj_checked if r.get("objective_pass") is True]

        m = {
            "provider": prov,
            "model": model,
            "thinking_level": thinking,
            "n_total": len(rs),
            "n_ok": len(ok),
            "n_success": len(succ),
            "n_skipped_unavailable": len(skipped),
            "success_rate_ok": (len(succ) / len(ok)) if ok else None,
            "objective_pass_rate": (len(obj_pass) / len(obj_checked)) if obj_checked else None,
            "latency_ms": {
                "p50": percentile(e2es, 50),
                "p95": percentile(e2es, 95),
                "p99": percentile(e2es, 99),
                "mean": (statistics.mean(e2es) if e2es else None),
            },
        }
        summary_models.append(m)

    summary = {
        "generated_at": _dt.datetime.now(_dt.timezone.utc).isoformat(),
        "run_dir": os.path.abspath(out_dir),
        "models": summary_models,
    }

    write_json(os.path.join(out_dir, "summary.json"), summary)

    # summary.md
    md_lines = []
    md_lines.append(f"# OpenClaw LLM Bench Summary\n")
    md_lines.append(f"Run: `{os.path.basename(out_dir)}`\n")
    md_lines.append("\n| Provider | Model | Thinking | n(ok) | success% (ok) | obj pass% | p50 ms | p95 ms | p99 ms |")
    md_lines.append("|---|---|---:|---:|---:|---:|---:|---:|---:|")
    for m in summary_models:
        lat = m["latency_ms"]
        def fmt(x: Any) -> str:
            if x is None:
                return ""
            if isinstance(x, float):
                return f"{x:.0f}"
            return str(x)

        def pct(x: Any) -> str:
            if x is None:
                return ""
            return f"{100.0 * float(x):.1f}%"

        md_lines.append(
            "| {prov} | {model} | {think} | {n_ok} | {succ} | {obj} | {p50} | {p95} | {p99} |".format(
                prov=m["provider"],
                model=m["model"],
                think=(m["thinking_level"] or ""),
                n_ok=m["n_ok"],
                succ=pct(m["success_rate_ok"]),
                obj=pct(m["objective_pass_rate"]),
                p50=fmt(lat["p50"]),
                p95=fmt(lat["p95"]),
                p99=fmt(lat["p99"]),
            )
        )

    with open(os.path.join(out_dir, "summary.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(md_lines))
        f.write("\n")


if __name__ == "__main__":
    raise SystemExit(main())
