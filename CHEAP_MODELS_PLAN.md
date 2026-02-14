# Cheap/Free Model Additions for Benchmark

## Current Spending
- **Ollama local**: ✅ Free (already testing ~20 models)
- **gpt-5-codex**: ⚠️ Hit rate limiting (quota issue)
- **Anthropic (haiku/opus)**: ⚠️ Via API, costs per token

## Recommended Free/Cheap Additions

### **1. Groq (HIGHLY RECOMMENDED)**
**Cost**: FREE tier available, unlimited calls during free period  
**Speed**: Ultra-fast (2-10x faster than local)  
**Setup**:
```bash
export GROQ_API_KEY="your-key"
```
**Available Models**:
- `groq/mixtral-8x7b-32768` - Free tier favorite
- `groq/llama-3.2-90b-text-preview` - New, very capable
- `groq/llama2-70b-4096`

### **2. HuggingFace Inference (FREE TIER)**
**Cost**: FREE (limited RPM)  
**Setup**:
```bash
export HF_TOKEN="your-token"
```
**Good for**: Small, open models
- `mistral-7b-instruct`
- `neural-chat-7b`
- `zephyr-7b-beta`

### **3. Together.ai (FREE CREDITS)**
**Cost**: $25 free credits (usually lasts weeks)  
**Setup**:
```bash
export TOGETHER_API_KEY="your-key"
```
**Models**:
- `meta-llama/Llama-3-70b-chat-hf`
- `mistralai/Mixtral-8x7B-Instruct-v0.1`
- `NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO`

### **4. Replicate (FREE CREDITS)**
**Cost**: $0.01-0.10 per prediction, but free tier available  
**Good for**: Quick one-off tests  
**Models**: Hundreds available

---

## Quick Setup Plan

1. **Add Groq immediately** (fastest, free, minimal setup)
2. **Skip HuggingFace** (slow inference, overkill for our tests)
3. **Add Together.ai** (free credits, good model variety)
4. **Drop gpt-5-codex from operational tests** (rate limited)

## New Test Config
```json
{
  "targets": [
    "ollama",           // 20 local models (free)
    "groq",             // 3 fast models (free)
    "together"          // 2-3 strong models (credits)
  ],
  "models": {
    "ollama": [...20 existing...],
    "groq": [
      "mixtral-8x7b-32768",
      "llama-3.2-90b-text-preview"
    ],
    "together": [
      "meta-llama/Llama-3-70b-chat-hf",
      "mistralai/Mixtral-8x7B-Instruct-v0.1"
    ]
  }
}
```

## Expected Results
- **Cost**: ~$1-2 for full benchmark run (vs $20+ with API-heavy approach)
- **Coverage**: 25+ models across free/cheap tiers
- **Speed**: Groq will be 10-100x faster than local for same quality
