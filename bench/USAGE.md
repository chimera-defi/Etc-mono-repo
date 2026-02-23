# Online Model Integration

This document covers using cloud-based LLMs (Minimax, Claude) in the benchmark harness.

## Overview

The benchmark supports both local (Ollama) and online (API-based) models. Online models offer:
- **Higher performance** - Larger models (Minimax M2.5, Claude Sonnet 4)
- **200k context window** - Much larger than local models
- **Better reasoning** - Cloud APIs generally outperform local 7B-14B models
- **Automatic fallback** - Falls back to local models if API fails

## Setup

### API Keys

Set the following environment variables:

```bash
# Minimax (required for minimax/MiniMax-M2.5)
export MINIMAX_API_KEY="your-minimax-api-key"

# Anthropic Claude (required for claude models)
export ANTHROPIC_API_KEY="your-anthropic-api-key"

# Optional: OpenRouter
export OPENROUTER_API_KEY="your-openrouter-key"
```

### Configuration

Online model settings are in `routing_config.json`:

```json
{
  "online_apis": {
    "minimax": {
      "api_base": "https://api.minimax.io/v1",
      "model": "MiniMax-M2.5",
      "timeout": 120,
      "max_retries": 3,
      "rate_limit_rpm": 60
    },
    "claude": {
      "api_base": "https://api.anthropic.com/v1", 
      "model": "claude-sonnet-4-20250514",
      "timeout": 120,
      "max_retries": 3,
      "rate_limit_rpm": 50
    }
  }
}
```

## Usage

### Using the Online Model Wrapper

```python
from online_model_wrapper import OnlineModelWrapper, create_online_wrapper

# Create wrapper (reads config from routing_config.json)
wrapper = create_online_wrapper()

# Or with custom config
wrapper = OnlineModelWrapper({
    "minimax": {"api_key": "your-key"},
    "claude": {"api_key": "your-key"}
})

# Call a model (same interface as phase2_harness.py)
result = wrapper.call_model_with_timeout(
    model="minimax/MiniMax-M2.5",
    messages=[{"role": "user", "content": "What is 2+2?"}],
    tools=[...],  # Optional tool definitions
    system_prompt="You are a helpful assistant.",
    variant="atomic"
)

# Result has standardized format:
# {
#   "model": "MiniMax-M2.5",
#   "variant": "online", 
#   "got": ["tool_name"],  # tools called
#   "latency_ms": 1234.5,
#   "error": None,
#   "timeout": False,
#   "content": "The answer is 4."
# }
```

### With Fallback Chain

```python
# Automatically falls back if primary fails
result = wrapper.call_with_fallback(
    primary_model="minimax/MiniMax-M2.5",
    fallback_model="lfm2.5-thinking:1.2b",
    messages=[...],
    tools=[...]
)
```

### Running Benchmark with Online Models

```bash
# The routing system automatically routes to online models
# based on routing_config.json priority settings

# Run with online-first priority
python3 run_benchmark.py --model "minimax/MiniMax-M2.5"

# Run with auto-routing (online → local fallback)
python3 run_benchmark.py --auto-route
```

## Fallback Chains

The system defines fallback chains in `phase2_config.json`:

```json
{
  "fallback_chains": {
    "online_primary": [
      "minimax/MiniMax-M2.5",
      "anthropic/claude-haiku", 
      "anthropic/claude-sonnet-4"
    ],
    "online_to_local": [
      "minimax/MiniMax-M2.5",
      "anthropic/claude-haiku",
      "lfm2.5-thinking:1.2b",
      "mistral:7b"
    ]
  }
}
```

## Rate Limiting & Retries

The wrapper handles:
- **Rate limiting**: Configurable RPM (requests per minute)
- **Exponential backoff**: Retry delays increase 2x each attempt
- **Timeout handling**: Configurable timeouts per API
- **Error recovery**: Automatic fallback to local models on failure

## Troubleshooting

### "API key not configured"

Set the required environment variable:
```bash
export MINIMAX_API_KEY="your-key"
export ANTHROPIC_API_KEY="your-key"
```

### Rate limit errors

The wrapper automatically retries with backoff. If persistent:
- Lower `rate_limit_rpm` in config
- Add delay between calls in your code

### Timeout errors

Increase timeout in `routing_config.json`:
```json
{
  "online_apis": {
    "minimax": {
      "timeout": 180
    }
  }
}
```

## Cost Considerations

| Model | Approximate Cost (per 1K prompts) |
|-------|----------------------------------|
| minimax/MiniMax-M2.5 | ~$0.50 |
| claude-sonnet-4 | ~$3.00 |
| claude-haiku | ~$0.25 |
| local (lfm2.5) | $0 (GPU only) |

Use local models for:
- Development/testing
- High-volume runs
- When API is unavailable

Use online models for:
- Production evaluation
- Complex reasoning tasks
- When best accuracy is required
