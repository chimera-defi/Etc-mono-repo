# Ollama Model Latency Benchmark - Tool Calling

Tested: 2026-02-26
Method: Single `get_weather("Berlin")` call via Ollama native `tools` API

## Results Summary

| Model | Size | Latency | Tools Work |
|-------|------|---------|-----------|
| **lfm2.5-thinking:1.2b** | 731 MB | **4,979ms** | ✅ |
| llama3.2:3b | 2.0 GB | 7,325ms | ✅ |
| mistral:7b | 4.1 GB | 10,455ms | ✅ |
| qwen2.5:14b | 9.0 GB | 25,063ms | ✅ |
| qwen3:8b | 5.2 GB | 27,674ms | ✅ |
| **qwen3.5:35b** | 23 GB | **33,828ms** | ✅ |
| ministral-3:latest | 2.0 GB | 37,771ms | ✅ |
| qwen3:14b | 9.3 GB | 44,599ms | ✅ |
| mistral-small3.2 | 15 GB | 96,911ms | ✅ |
| glm-4.7-flash | 6.3 GB | 99,473ms | ✅ |
| devstral-small-2 | 15 GB | 104,119ms | ✅ |
| gemma2:9b | 5.4 GB | ❌ | No tools support |

## Key Findings

1. **lfm2.5 is 5× faster** than anything else for tool calls (4.9s vs next fastest at 7.3s)
2. **qwen3.5:35b works!** - but uses native API only (not bracket notation)
3. **glm-4.7-flash is slow** (99s) despite being marketed as "flash"
4. **gemma2:9b does NOT support tools** - same issue as phi3
5. **All 11 working models** support Ollama native tool calling

## Notes

- qwen3.5:35b requires Ollama v0.17.1+ (pre-release model)
- Models that don't support tools via Ollama: phi3, gemma2, phi
- Benchmark harness uses bracket notation by default - some models may need native API variant
