# Model Fallback Configuration

## Top Model Pick 🏆

Based on comprehensive benchmarking:

**Primary:** `qwen2.5:3b` 
- Success rate: 86% (57 total tests)
- Latency p50: 3.2s (fastest)
- Efficiency: Best tokens/time
- Use case: Default operational queries

**Fallback 1:** `gemma2:9b`
- Success rate: 100% (perfect)
- Latency p50: 6.9s (still very fast)
- Use case: When accuracy is critical

**Fallback 2:** `qwen2.5:14b`
- Success rate: 100% (perfect)
- Latency p50: 11.1s
- Use case: Complex reasoning

---

## Routing Strategy

### Current (Sequential)
Model A → fails → Model B → fails → Model C

### Ideal (Smart Fallback)
1. Try primary (qwen2.5:3b) → 86% success, fast
2. If timeout/error → fallback to gemma2:9b (100% reliable)
3. If still fails → final fallback to qwen2.5:14b (perfect)

---

## Implementation

### Option 1: LiteLLM Router Config (RECOMMENDED)
```yaml
# /root/.openclaw/workspace/litellm.config.yaml

model_list:
  - model_name: "qwen-fast"
    litellm_params:
      model: "ollama/qwen2.5:3b"
      api_base: "http://localhost:11434/v1"
    fallbacks:
      - "gemma-perfect"
      - "qwen-balanced"
  
  - model_name: "gemma-perfect"
    litellm_params:
      model: "ollama/gemma2:9b"
      api_base: "http://localhost:11434/v1"
    fallbacks:
      - "qwen-balanced"
  
  - model_name: "qwen-balanced"
    litellm_params:
      model: "ollama/qwen2.5:14b"
      api_base: "http://localhost:11434/v1"

router_settings:
  enable_fallbacks: true
  num_retries: 2
  retry_delay: 1
```

### Option 2: Simple Bash Wrapper
```bash
#!/bin/bash
# model_fallback.sh

MODEL_PRIMARY="qwen2.5:3b"
MODEL_FALLBACK1="gemma2:9b"
MODEL_FALLBACK2="qwen2.5:14b"

query="$1"

# Try primary
curl -X POST http://localhost:4000/v1/completions \
  -H "Content-Type: application/json" \
  -d "{\"model\": \"$MODEL_PRIMARY\", \"prompt\": \"$query\"}" && exit 0

# Fallback 1
echo "[FALLBACK] Trying $MODEL_FALLBACK1" >&2
curl -X POST http://localhost:4000/v1/completions \
  -H "Content-Type: application/json" \
  -d "{\"model\": \"$MODEL_FALLBACK1\", \"prompt\": \"$query\"}" && exit 0

# Fallback 2
echo "[FALLBACK] Trying $MODEL_FALLBACK2" >&2
curl -X POST http://localhost:4000/v1/completions \
  -H "Content-Type: application/json" \
  -d "{\"model\": \"$MODEL_FALLBACK2\", \"prompt\": \"$query\"}"
```

### Option 3: Update OpenClaw Router
Modify `/root/.openclaw/workspace/MODEL_ROUTING.md` to specify:
```
Primary: qwen2.5:3b (fast, default)
Fallback: gemma2:9b (perfect accuracy)
Emergency: qwen2.5:14b (heavy lifting)
```

---

## Testing Fallback

```bash
# Test that falls back:
timeout 2 curl -X POST http://localhost:4000/v1/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen2.5:3b","prompt":"test"}' || \
  curl -X POST http://localhost:4000/v1/completions \
    -H "Content-Type: application/json" \
    -d '{"model":"gemma2:9b","prompt":"test"}'
```

---

## Decision Matrix

| Scenario | Use |
|---|---|
| Speed critical (heartbeat, status) | qwen2.5:3b |
| Accuracy critical (routing, decisions) | gemma2:9b |
| Complex task (long_operator_prompt) | qwen2.5:14b |
| Any fails → retry | gemma2:9b |
| All local fails → remote (haiku/opus) | Anthropic API |

