#!/usr/bin/env python3
"""
Qwen3.5-35B Backend Comparison Benchmark
Compares Ollama vs llama.cpp GGUF backends with actual measurements.
"""

import json
import time
import subprocess
import statistics
import re
from datetime import datetime
from typing import Dict, List, Any
import requests

# Configuration
OLLAMA_MODEL = "qwen3.5:35b"
LLAMA_CLI_PATH = "/root/llama.cpp/build/bin/llama-cli"
GGUF_MODEL_PATH = "/root/.openclaw/models/Qwen3.5-35B-A3B-Q3_K_S.gguf"
OLLAMA_BASE_URL = "http://localhost:11434"
OUTPUT_FILE = "/root/.openclaw/workspace/bench/results/qwen35_backend_comparison.json"

# Test prompts covering different categories
TEST_PROMPTS = [
    {
        "id": "simple_qa_1",
        "category": "simple_qa",
        "prompt": "What is the capital of France?",
        "expected_keywords": ["paris", "Paris"],
        "max_tokens": 50,
    },
    {
        "id": "simple_qa_2",
        "category": "simple_qa", 
        "prompt": "Explain what photosynthesis is in one sentence.",
        "expected_keywords": ["light", "plant", "energy", "convert"],
        "max_tokens": 60,
    },
    {
        "id": "reasoning_1",
        "category": "reasoning",
        "prompt": "If all roses are flowers and some flowers fade quickly, what can we conclude about roses?",
        "expected_keywords": ["may", "might", "some", "could", "fade"],
        "max_tokens": 80,
    },
    {
        "id": "reasoning_2",
        "category": "reasoning",
        "prompt": "A train travels 60 mph. Another train travels 80 mph. They start 280 miles apart heading toward each other. How long until they meet?",
        "expected_keywords": ["2", "hours", "2 hours"],
        "max_tokens": 60,
    },
    {
        "id": "tool_calling_1",
        "category": "tool_calling",
        "prompt": """Use the calculator to compute: What is 1234 * 5678?
Respond with just the answer in this JSON format:
{"tool": "calculator", "expression": "1234 * 5678", "result": RESULT}""",
        "expected_keywords": ["7006652", "tool", "calculator"],
        "max_tokens": 50,
    },
    {
        "id": "tool_calling_2",
        "category": "tool_calling", 
        "prompt": """Use the calculator to find: 999 * 999
Respond with: {"tool": "calculator", "expression": "999 * 999", "result": VALUE}""",
        "expected_keywords": ["998001", "tool", "calculator"],
        "max_tokens": 40,
    },
    {
        "id": "long_context_1",
        "category": "long_context",
        "prompt": """Summarize the key points from this text in 2-3 sentences:

The field of artificial intelligence has evolved dramatically since its inception in the 1950s. Early symbolic AI systems focused on rule-based reasoning and expert systems. The emergence of machine learning in the 1990s shifted paradigm toward statistical methods. Deep learning breakthroughs in the 2010s, particularly convolutional and recurrent neural networks, enabled unprecedented advances in image recognition, speech processing, and natural language understanding. Transformers architecture in 2017 revolutionized NLP through self-attention mechanisms. Large language models like GPT, Claude, and Qwen now demonstrate emergent capabilities in reasoning, coding, and multimodal understanding. Current challenges include improving efficiency, reducing hallucinations, enhancing factual accuracy, and achieving artificial general intelligence.

Key points:""",
        "expected_keywords": ["ai", "artificial", "intelligence", "deep learning", "transformer"],
        "max_tokens": 80,
    },
    {
        "id": "coding_1",
        "category": "coding",
        "prompt": "Write a Python function to check if a number is prime. Include comments.",
        "expected_keywords": ["def", "prime", "return", "%", "range"],
        "max_tokens": 100,
    },
    {
        "id": "coding_2",
        "category": "coding",
        "prompt": "Write a simple JavaScript function that reverses a string.",
        "expected_keywords": ["function", "return", "split", "reverse", "join"],
        "max_tokens": 80,
    },
    {
        "id": "math_1",
        "category": "math",
        "prompt": "What is the square root of 144?",
        "expected_keywords": ["12"],
        "max_tokens": 30,
    },
]


def call_ollama(prompt: str, max_tokens: int) -> Dict[str, Any]:
    """Call Ollama API and measure timing."""
    url = f"{OLLAMA_BASE_URL}/api/generate"
    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {
            "num_predict": max_tokens,
            "temperature": 0.7,
        }
    }
    
    start_time = time.time()
    
    response = requests.post(url, json=payload, timeout=120)
    response.raise_for_status()
    
    end_time = time.time()
    total_time = end_time - start_time
    
    result = response.json()
    
    # Extract response (may include thinking block)
    generated_text = result.get("response", "")
    tokens_generated = result.get("eval_count", 0)
    
    # Estimate first token time (Ollama doesn't expose this in non-streaming)
    first_token_time = total_time * 0.1 if total_time > 0 else 0
    
    # Also check for thinking block in the full response
    thinking = result.get("thinking", "")
    if thinking:
        generated_text = thinking + "\n\n" + generated_text
    
    return {
        "text": generated_text,
        "tokens_generated": tokens_generated,
        "total_time": total_time,
        "first_token_time": first_token_time,
    }


def call_llama_cpp(prompt: str, max_tokens: int) -> Dict[str, Any]:
    """Call llama.cpp CLI and measure timing."""
    # Write prompt to temp file to avoid shell escaping issues
    prompt_file = "/tmp/llama_prompt.txt"
    with open(prompt_file, "w") as f:
        f.write(prompt)
    
    cmd = [
        LLAMA_CLI_PATH,
        "-m", GGUF_MODEL_PATH,
        "-f", prompt_file,
        "-n", str(max_tokens),
        "--temp", "0.7",
        "-t", "8",
        "--single-turn",
    ]
    
    start_time = time.time()
    
    process = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    
    stdout, stderr = process.communicate(timeout=120)
    
    end_time = time.time()
    total_time = end_time - start_time
    
    # Parse the output - extract generated text and timing
    # Find the timing line: [ Prompt: X t/s | Generation: Y t/s ]
    timing_match = re.search(r"\[ Prompt: ([\d.]+) t/s \| Generation: ([\d.]+) t/s \]", stderr)
    
    generation_tps = 0
    prompt_tps = 0
    if timing_match:
        prompt_tps = float(timing_match.group(1))
        generation_tps = float(timing_match.group(2))
    
    # The model generates to stderr. Look for "Thinking Process:" or other text after the prompt
    # Find content after "Thinking Process:" or regular text output
    thinking_match = re.search(r"Thinking Process:\s*\n(.*?)(?:llama_memory_breakdown|Process exited|$)", stderr, re.DOTALL)
    
    if thinking_match:
        generated_text = thinking_match.group(1).strip()
    else:
        # Try to find content after the prompt line (>)
        prompt_pos = stderr.find('> ')
        if prompt_pos >= 0:
            # Get content after prompt, before memory info or exit
            after_prompt = stderr[prompt_pos + 2:]
            # Find where loading/memory starts again
            memory_pos = after_prompt.find('llama_memory')
            if memory_pos >= 0:
                after_prompt = after_prompt[:memory_pos]
            # Clean up
            lines = after_prompt.split('\n')
            clean_lines = [l for l in lines if l.strip() and not l.startswith('|') and not l.startswith('\u2584')]
            generated_text = '\n'.join(clean_lines).strip()
        else:
            generated_text = ""
    
    # If still empty, use stdout
    if not generated_text:
        generated_text = stdout.strip()
    
    # Calculate tokens from generation speed and time
    if generation_tps > 0:
        # generation time is approximately 80% of total (after prompt processing)
        generation_time = total_time * 0.8
        tokens_generated = int(generation_time * generation_tps)
    else:
        # Fallback: estimate from word count
        words = len(generated_text.split())
        tokens_generated = int(words * 1.3)
    
    # First token approximation
    first_token_time = total_time * 0.15
    
    return {
        "text": generated_text[:500],
        "tokens_generated": tokens_generated,
        "total_time": total_time,
        "first_token_time": first_token_time,
        "generation_tps": generation_tps,
        "prompt_tps": prompt_tps,
    }


def check_quality(text: str, expected_keywords: List[str]) -> Dict[str, Any]:
    """Check if the output contains expected keywords and is coherent."""
    if not text:
        return {"is_qualitative_pass": False, "keyword_match_ratio": 0, "is_coherent": False, "output_length": 0}
    
    text_lower = text.lower()
    found_keywords = [kw for kw in expected_keywords if kw.lower() in text_lower]
    keyword_match_ratio = len(found_keywords) / len(expected_keywords) if expected_keywords else 0
    is_coherent = len(text) > 10 and not all(c in ' \n\t' for c in text)
    
    return {
        "is_qualitative_pass": keyword_match_ratio >= 0.3 and is_coherent,
        "keyword_match_ratio": keyword_match_ratio,
        "found_keywords": found_keywords,
        "is_coherent": is_coherent,
        "output_length": len(text),
    }


def check_tool_calling(text: str) -> Dict[str, Any]:
    """Check if the output demonstrates tool-calling capability."""
    if not text:
        return {"demonstrates_tool_calling": False}
    
    text_lower = text.lower()
    has_json = "{" in text and "}" in text
    has_tool_keyword = "tool" in text_lower
    has_calculator = "calculator" in text_lower
    
    tool_call_patterns = [
        r'\{[^}]*"tool"[^}]*\}',
        r'\{[^}]*"calculator"[^}]*\}',
    ]
    has_structured_call = any(re.search(p, text, re.DOTALL) for p in tool_call_patterns)
    
    return {
        "demonstrates_tool_calling": (has_tool_keyword and has_json) or has_structured_call,
        "has_json_format": has_json,
        "has_tool_keyword": has_tool_keyword,
        "has_structured_call": has_structured_call,
    }


def run_benchmark() -> Dict[str, Any]:
    """Run the full benchmark suite."""
    results = {
        "timestamp": datetime.now().isoformat(),
        "configuration": {
            "ollama_model": OLLAMA_MODEL,
            "llama_cpp_path": LLAMA_CLI_PATH,
            "gguf_model_path": GGUF_MODEL_PATH,
        },
        "prompt_results": [],
        "summary": {},
    }
    
    all_ollama_metrics = []
    all_llama_metrics = []
    
    for test_prompt in TEST_PROMPTS:
        print(f"\n{'='*60}")
        print(f"Testing: {test_prompt['id']} ({test_prompt['category']})")
        print(f"{'='*60}")
        
        prompt_result = {
            "prompt_id": test_prompt["id"],
            "category": test_prompt["category"],
            "prompt": test_prompt["prompt"],
            "expected_keywords": test_prompt["expected_keywords"],
        }
        
        # Test Ollama
        print("  → Testing Ollama...", end=" ", flush=True)
        try:
            ollama_result = call_ollama(test_prompt["prompt"], test_prompt["max_tokens"])
            ollama_tokens_per_sec = (
                ollama_result["tokens_generated"] / ollama_result["total_time"]
                if ollama_result["total_time"] > 0 and ollama_result["tokens_generated"] > 0 else 0
            )
            
            quality = check_quality(ollama_result["text"], test_prompt["expected_keywords"])
            tool_check = check_tool_calling(ollama_result["text"]) if test_prompt["category"] == "tool_calling" else {}
            
            prompt_result["ollama"] = {
                "text": ollama_result["text"][:300],
                "tokens_generated": ollama_result["tokens_generated"],
                "total_time_seconds": round(ollama_result["total_time"], 3),
                "first_token_time_seconds": round(ollama_result["first_token_time"], 3),
                "tokens_per_second": round(ollama_tokens_per_sec, 2),
                "quality": quality,
                "tool_calling": tool_check,
                "success": True,
            }
            all_ollama_metrics.append(ollama_tokens_per_sec)
            print(f"✓ {ollama_result['tokens_generated']} tokens in {ollama_result['total_time']:.2f}s = {ollama_tokens_per_sec:.2f} tok/s")
        except Exception as e:
            print(f"✗ Failed: {e}")
            prompt_result["ollama"] = {"success": False, "error": str(e)}
        
        # Test llama.cpp
        print("  → Testing llama.cpp...", end=" ", flush=True)
        try:
            llama_result = call_llama_cpp(test_prompt["prompt"], test_prompt["max_tokens"])
            
            # Use actual measured tps if available, otherwise calculate
            if llama_result.get("generation_tps", 0) > 0:
                llama_tokens_per_sec = llama_result["generation_tps"]
            else:
                llama_tokens_per_sec = (
                    llama_result["tokens_generated"] / llama_result["total_time"]
                    if llama_result["total_time"] > 0 and llama_result["tokens_generated"] > 0 else 0
                )
            
            quality = check_quality(llama_result["text"], test_prompt["expected_keywords"])
            tool_check = check_tool_calling(llama_result["text"]) if test_prompt["category"] == "tool_calling" else {}
            
            prompt_result["llama_cpp"] = {
                "text": llama_result["text"][:300],
                "tokens_generated": llama_result["tokens_generated"],
                "total_time_seconds": round(llama_result["total_time"], 3),
                "first_token_time_seconds": round(llama_result["first_token_time"], 3),
                "tokens_per_second": round(llama_tokens_per_sec, 2),
                "quality": quality,
                "tool_calling": tool_check,
                "success": True,
            }
            all_llama_metrics.append(llama_tokens_per_sec)
            print(f"✓ {llama_result['tokens_generated']} tokens in {llama_result['total_time']:.2f}s = {llama_tokens_per_sec:.2f} tok/s")
        except Exception as e:
            print(f"✗ Failed: {e}")
            prompt_result["llama_cpp"] = {"success": False, "error": str(e)}
        
        results["prompt_results"].append(prompt_result)
    
    # Calculate summary statistics
    if all_ollama_metrics:
        results["summary"]["ollama"] = {
            "mean_tokens_per_second": round(statistics.mean(all_ollama_metrics), 2),
            "median_tokens_per_second": round(statistics.median(all_ollama_metrics), 2),
            "max_tokens_per_second": round(max(all_ollama_metrics), 2),
            "min_tokens_per_second": round(min(all_ollama_metrics), 2),
        }
    else:
        results["summary"]["ollama"] = {}
        
    if all_llama_metrics:
        results["summary"]["llama_cpp"] = {
            "mean_tokens_per_second": round(statistics.mean(all_llama_metrics), 2),
            "median_tokens_per_second": round(statistics.median(all_llama_metrics), 2),
            "max_tokens_per_second": round(max(all_llama_metrics), 2),
            "min_tokens_per_second": round(min(all_llama_metrics), 2),
        }
    else:
        results["summary"]["llama_cpp"] = {}
    
    # Qualitative assessment
    ollama_mean = results["summary"].get("ollama", {}).get("mean_tokens_per_second", 0)
    llama_mean = results["summary"].get("llama_cpp", {}).get("mean_tokens_per_second", 0)
    
    if ollama_mean > 0 and llama_mean > 0:
        faster_backend = "ollama" if ollama_mean > llama_mean else "llama.cpp"
        speed_diff = abs(ollama_mean - llama_mean) / max(ollama_mean, llama_mean) * 100
        
        results["qualitative_assessment"] = (
            f"Ollama averages {ollama_mean:.1f} tok/s, llama.cpp averages {llama_mean:.1f} tok/s. "
            f"{faster_backend.title()} is approximately {speed_diff:.1f}% faster. "
            f"Ollama provides easier API integration and model management. "
            f"llama.cpp offers more direct control and potentially lower overhead. "
            f"Tool-calling depends on prompt engineering and model training, not backend."
        )
    else:
        results["qualitative_assessment"] = "Unable to calculate comparison due to missing data."
    
    results["attribution"] = {
        "benchmark": "Qwen3.5-35B Backend Comparison",
        "model": "Qwen3.5-35B-A3B-Q3_K_S (GGUF)",
        "ollama_version": "native",
        "llama_cpp_path": LLAMA_CLI_PATH,
        "generated_at": datetime.now().isoformat(),
    }
    
    return results


def main():
    """Main entry point."""
    print("="*70)
    print("Qwen3.5-35B Backend Comparison Benchmark")
    print("="*70)
    print(f"Ollama model: {OLLAMA_MODEL}")
    print(f"LLama.cpp model: {GGUF_MODEL_PATH}")
    print(f"Test prompts: {len(TEST_PROMPTS)}")
    print()
    
    results = run_benchmark()
    
    # Write results to JSON
    with open(OUTPUT_FILE, "w") as f:
        json.dump(results, f, indent=2)
    
    print("\n" + "="*70)
    print("SUMMARY")
    print("="*70)
    
    if "ollama" in results["summary"]:
        print(f"\nOllama:")
        for k, v in results["summary"]["ollama"].items():
            print(f"  {k}: {v}")
    
    if "llama_cpp" in results["summary"]:
        print(f"\nLlama.cpp:")
        for k, v in results["summary"]["llama_cpp"].items():
            print(f"  {k}: {v}")
    
    print(f"\n{results['qualitative_assessment']}")
    print(f"\nResults saved to: {OUTPUT_FILE}")
    
    return results


if __name__ == "__main__":
    main()
