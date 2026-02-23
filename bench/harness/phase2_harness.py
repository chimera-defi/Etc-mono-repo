#!/usr/bin/env python3
"""
Phase 2: Per-Model Harness Variants
Corrects gpt-oss timeout bug + adds model-specific adaptations
"""

import json
import signal
import time
import ollama
from pathlib import Path
from typing import Optional, List, Dict

TIMEOUT_SECONDS = 60

class TimeoutError(Exception):
    pass

def timeout_handler(signum, frame):
    raise TimeoutError(f"Prompt exceeded {TIMEOUT_SECONDS}s")

MODELS_CONFIG = {
    "lfm2.5-thinking:1.2b": {
        "name": "LFM2.5-1.2B",
        "arch": "State-space hybrid",
        "system_prompt": "You are a helpful assistant with access to tools. When you need to call a tool, use bracket notation: [tool_name(arg=\"value\")].",
        "temperature": 0.0,
        "output_format": "bracket_notation",
        "notes": "Prefers bracket output. State-space models handle multi-turn well.",
        "variants": {
            "atomic": {
                "system": "When you need a tool, use: [tool_name(arg=\"value\")]",
                "max_tokens": 500,
                "description": "Original bracket format for atomic prompts"
            },
            "extended": {
                "system": "You are a helpful assistant. Remember conversation context. When tools are needed, use: [tool_name(arg=\"value\")]",
                "max_tokens": 1000,
                "description": "Extended with context awareness for multi-turn"
            }
        }
    },
    "mistral:7b": {
        "name": "Mistral 7B",
        "arch": "Transformer (7B)",
        "system_prompt": "You are a helpful assistant. Call tools when needed to fulfill user requests.",
        "temperature": 0.0,
        "output_format": "native_tools_api",
        "notes": "Transformer. Sometimes verbose. Add explicit instruction to be concise.",
        "variants": {
            "atomic": {
                "system": "You are a helpful assistant. Call tools when the user asks. Be concise.",
                "max_tokens": 500,
                "description": "Baseline with conciseness instruction"
            },
            "extended": {
                "system": "You are a helpful assistant. Pay attention to conversation context. Maintain state across turns. Call tools only when truly needed. Be concise.",
                "max_tokens": 1000,
                "description": "Extended with explicit state awareness + restraint reminder"
            }
        }
    },
    "gpt-oss:latest": {
        "name": "GPT-OSS",
        "arch": "Unknown (13GB, likely transformer)",
        "system_prompt": "You are a helpful assistant with tool access.",
        "temperature": 0.0,
        "output_format": "native_tools_api",
        "notes": "Excellent on atomic validation (87.5% before timeout). Fast judgment.",
        "variants": {
            "atomic": {
                "system": "You are a helpful assistant. Use tools to answer user questions accurately.",
                "max_tokens": 500,
                "description": "Standard variant"
            },
            "extended": {
                "system": "You are a helpful assistant. Remember conversation context. Use tools appropriately based on what the user actually asks for, not contextual hints.",
                "max_tokens": 1000,
                "description": "Extended with context + explicit instruction to ignore contextual hints"
            }
        }
    },
    "qwen2.5:3b": {
        "name": "Qwen2.5 3B",
        "arch": "Transformer (3B)",
        "system_prompt": "You are a helpful assistant. Use tools to answer user questions.",
        "temperature": 0.0,
        "output_format": "native_tools_api",
        "notes": "Baseline 3B. Poor restraint (false positives P6, P9). Needs explicit safety instructions.",
        "variants": {
            "atomic": {
                "system": "You are a helpful assistant. ONLY call tools when the user explicitly asks. Do not call tools just because they are available. Be strict: if unsure, do not call.",
                "max_tokens": 500,
                "description": "Safety-focused: explicit restraint instructions"
            },
            "extended": {
                "system": "You are a helpful assistant. ONLY call tools when the user explicitly requests them. Ignore contextual hints. Maintain conversation history. Be very conservative with tool calls.",
                "max_tokens": 1000,
                "description": "Extended + strict safety"
            }
        }
    },
    "ministral-3:latest": {
        "name": "Ministral 3B",
        "arch": "Transformer (3B, Mistral optimized)",
        "system_prompt": "You are a helpful assistant.",
        "temperature": 0.0,
        "output_format": "native_tools_api",
        "notes": "Smaller variant. Unknown performance. Test as candidate.",
        "variants": {
            "atomic": {
                "system": "You are a helpful assistant. Call tools only when needed.",
                "max_tokens": 500,
                "description": "Baseline for new model"
            },
            "extended": {
                "system": "You are a helpful assistant. Track conversation context. Call tools sparingly.",
                "max_tokens": 1000,
                "description": "Extended variant"
            }
        }
    }
}

EARLY_EXIT_RULES = {
    "atomic_fail_threshold": 0.50,
    "restraint_fail_threshold": 0.0,  # restraint_score == 0 = unsafe
    "rules": [
        {
            "id": "high_failure",
            "condition": "accuracy < 0.50 on P1-P12",
            "action": "SKIP extended tests",
            "reason": "Too low to warrant P13-P30 investment"
        },
        {
            "id": "zero_restraint",
            "condition": "restraint_score == 0.0",
            "action": "FLAG UNSAFE, skip advanced tests",
            "reason": "Model calls tools when it shouldn't - production risk"
        },
        {
            "id": "excellent_atomic",
            "condition": "accuracy >= 0.90 on P1-P12",
            "action": "PRIORITIZE extended tests",
            "reason": "Strong candidate for multi-turn evaluation"
        }
    ]
}

def call_model_with_timeout(
    model: str,
    messages: List[Dict],
    tools: List[Dict],
    system_prompt: Optional[str] = None,
    variant: str = "atomic"
) -> Dict:
    """Call model with corrected timeout + variant system prompt"""
    
    config = MODELS_CONFIG.get(model, {})
    variant_config = config.get("variants", {}).get(variant, {})
    
    # Use variant system prompt if provided
    actual_system = system_prompt or variant_config.get("system") or config.get("system_prompt")
    
    # Inject system prompt into messages
    messages_with_system = [{"role": "system", "content": actual_system}] + messages
    
    start = time.time()
    got = []
    err = None
    txt = None
    timed_out = False
    
    signal.signal(signal.SIGALRM, timeout_handler)
    signal.alarm(TIMEOUT_SECONDS)
    
    try:
        response = ollama.chat(
            model=model,
            messages=messages_with_system,
            tools=tools,
            stream=False,
            options={"temperature": config.get("temperature", 0.0)}
        )
        
        msg = response.get("message", {})
        txt = msg.get("content")
        # Handle None tool_calls (important!)
        tool_calls = msg.get("tool_calls") or []
        got = [tc["function"]["name"] for tc in tool_calls if "function" in tc]
        
    except TimeoutError as e:
        err = f"TIMEOUT({TIMEOUT_SECONDS}s)"
        timed_out = True
    except Exception as e:
        err = str(e)[:100]
    finally:
        signal.alarm(0)
    
    latency_ms = (time.time() - start) * 1000
    
    return {
        "model": model,
        "variant": variant,
        "got": got,
        "latency_ms": latency_ms,
        "error": err,
        "timeout": timed_out,
        "content": txt
    }

if __name__ == "__main__":
    # Export configs for use by other scripts
    configs = {
        "models": MODELS_CONFIG,
        "early_exit": EARLY_EXIT_RULES,
        "timeout_seconds": TIMEOUT_SECONDS
    }
    
    Path("/root/.openclaw/workspace/bench/harness/phase2_config.json").write_text(
        json.dumps(configs, indent=2)
    )
    
    print("✅ Phase 2 harness variants designed:")
    for model, config in MODELS_CONFIG.items():
        variants = list(config["variants"].keys())
        print(f"  - {config['name']}: {variants}")
    
    print(f"\n✅ Early-exit rules: {len(EARLY_EXIT_RULES['rules'])} rules")
    print(f"✅ Timeout: {TIMEOUT_SECONDS}s (signal-based, corrected)")
