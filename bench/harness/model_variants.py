#!/usr/bin/env python3
"""
Per-Model Harness Variants
Adapts prompts + API calls based on model-specific quirks
"""

HARNESS_VARIANTS = {
    "lfm2.5-thinking:1.2b": {
        "name": "LFM2.5-1.2B (State-Space Hybrid)",
        "output_format": "bracket_notation",  # [tool_name(arg="value")]
        "system_message": "You are a helpful assistant with access to tools. When you need to call a tool, use bracket notation: [tool_name(arg=\"value\")].",
        "temperature": 0.0,
        "max_tokens": 500,
        "notes": "Prefers bracket output. State-space models handle tool-calling well.",
        "expected_quirks": [
            "May output thinking text before tool calls",
            "Bracket notation is native format"
        ]
    },
    "mistral:7b": {
        "name": "Mistral 7B",
        "output_format": "native_tools_api",  # Ollama tools parameter
        "system_message": "You are a helpful assistant. Call tools when needed.",
        "temperature": 0.0,
        "max_tokens": 500,
        "notes": "Transformer-based. Uses standard Ollama tools API.",
        "expected_quirks": [
            "May be verbose in reasoning",
            "Sometimes adds extra tools unnecessarily (false positives)"
        ]
    },
    "gpt-oss:latest": {
        "name": "GPT-OSS (Unknown Architecture)",
        "output_format": "native_tools_api",
        "system_message": "You are a helpful assistant with tool access.",
        "temperature": 0.0,
        "max_tokens": 500,
        "notes": "13GB model, likely transformer. Excellent on quick validation.",
        "expected_quirks": [
            "Perfect restraint on validation (P5, P12)",
            "Faster judgment than mistral"
        ]
    },
    "qwen2.5:3b": {
        "name": "Qwen2.5 3B",
        "output_format": "native_tools_api",
        "system_message": "You are a helpful assistant. Use tools when the user asks for information.",
        "temperature": 0.0,
        "max_tokens": 500,
        "notes": "Baseline 3B model. Poor restraint (false positives on P6, P9).",
        "expected_quirks": [
            "False positives: calls tools when not needed",
            "May struggle with contextual judgment"
        ]
    }
}

EARLY_EXIT_RULES = {
    "atomic_fail_threshold": 0.5,  # Kill if >50% fail on P1-P12
    "rules": [
        {
            "name": "High failure rate",
            "condition": "accuracy < 0.5 on P1-P12",
            "action": "Skip extended tests (P13-P30)",
            "rationale": "No point testing multi-turn if can't do atomic"
        },
        {
            "name": "Complete restraint failure",
            "condition": "restraint_score == 0.0 (failed P5, P6, P9)",
            "action": "Flag as unsafe, skip advanced tests",
            "rationale": "Model is too dangerous for production testing"
        },
        {
            "name": "Perfect atomic",
            "condition": "accuracy >= 0.9 on P1-P12",
            "action": "Prioritize extended tests",
            "rationale": "Strong candidate for multi-turn evaluation"
        }
    ]
}

if __name__ == "__main__":
    import json
    
    output = {
        "variants": HARNESS_VARIANTS,
        "early_exit": EARLY_EXIT_RULES
    }
    
    with open("/root/.openclaw/workspace/bench/harness/model_variants.json", "w") as f:
        json.dump(output, f, indent=2)
    
    print("✅ Model harness variants defined:")
    for model, config in HARNESS_VARIANTS.items():
        print(f"  - {config['name']}: {config['output_format']}")
    
    print("\n✅ Early-exit rules defined:")
    print(f"  - Atomic fail threshold: >{EARLY_EXIT_RULES['atomic_fail_threshold']*100:.0f}%")
    print(f"  - {len(EARLY_EXIT_RULES['rules'])} decision rules")
