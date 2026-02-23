#!/usr/bin/env python3
"""
Token Rate Benchmark Harness

A lightweight benchmark tool for measuring token throughput and latency
across different LLM providers (OpenRouter Auto, Minimax M2.5).

Usage:
    python3 token_benchmark.py --mode openrouter --concurrency 1
    python3 token_benchmark.py --mode minimax --concurrency 5
"""

import argparse
import asyncio
import json
import os
import sys
import time
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path
from typing import Optional

# Configuration
CONFIG = {
    "openrouter": {
        "api_base": "https://openrouter.ai/api/v1",
        "model": "openrouter/auto",
        "timeout": 120
    },
    "minimax": {
        "api_base": "https://api.minimax.io/v1",
        "model": "MiniMax-M2.5",
        "timeout": 120
    }
}

# Representative prompt set (~30 prompts)
PROMPTS = [
    # Simple factual questions
    "What is the capital of France?",
    "Who wrote Romeo and Juliet?",
    "What year did World War II end?",
    "What is the chemical symbol for gold?",
    "How many planets are in our solar system?",
    
    # Reasoning tasks
    "If a train travels 60 mph for 2 hours, how far does it go?",
    "What comes next in the sequence: 2, 4, 8, 16, ?",
    "If all roses are flowers and some flowers fade, what can we conclude?",
    
    # Coding tasks
    "Write a Python function to reverse a string.",
    "What is the difference between list and tuple in Python?",
    "How do you handle exceptions in JavaScript?",
    
    # Writing tasks
    "Write a haiku about the ocean.",
    "Summarize the benefits of exercise in 3 sentences.",
    "What are three tips for better sleep?",
    
    # Creative tasks
    "Describe a sunset to someone who has never seen one.",
    "What would happen if gravity reversed for one hour?",
    "Write a one-sentence horror story.",
    
    # Opinion/analysis
    "What are the pros and cons of remote work?",
    "Is artificial intelligence dangerous? Explain your reasoning.",
    "What makes a good leader?",
    
    # Comparison
    "Compare Python and JavaScript for web development.",
    "What's the difference between weather and climate?",
    "Coffee or tea: which is better?",
    
    # Technical explanation
    "Explain how HTTPS works in simple terms.",
    "What is the difference between RAM and storage?",
    "How does a search engine find results so quickly?",
    
    # Edge cases / Harder tasks
    "What is the meaning of life?",
    "If 5 cats can catch 5 mice in 5 minutes, how long do 100 cats take?",
    "Explain quantum entanglement to a 10-year-old.",
    "What would you do if you won the lottery?",
    "Describe the history of the internet in 100 words.",
    "Write a recipe for chocolate chip cookies.",
]


@dataclass
class BenchmarkResult:
    """Single benchmark result for one prompt."""
    prompt_index: int
    prompt_preview: str
    start_time: float
    end_time: float
    latency_ms: float
    input_tokens: int
    output_tokens: int
    total_tokens: int
    tokens_per_second: float
    success: bool
    error: Optional[str] = None


@dataclass
class BenchmarkSummary:
    """Aggregated benchmark results."""
    mode: str
    concurrency: int
    num_prompts: int
    successful_runs: int
    failed_runs: int
    total_time_ms: float
    avg_latency_ms: float
    avg_input_tokens: float
    avg_output_tokens: float
    avg_total_tokens: float
    avg_tokens_per_second: float
    min_latency_ms: float
    max_latency_ms: float
    p50_latency_ms: float
    p95_latency_ms: float
    timestamp: str
    results: list


class TokenBenchmark:
    """Benchmark harness for token rate testing."""
    
    def __init__(self, mode: str = "openrouter", concurrency: int = 1, 
                 api_key: Optional[str] = None):
        self.mode = mode
        self.concurrency = concurrency
        self.config = CONFIG.get(mode, CONFIG["openrouter"])
        # Use mode-specific API key env var
        if mode == "minimax":
            self.api_key = api_key or os.getenv("MINIMAX_API_KEY", "")
        else:
            self.api_key = api_key or os.getenv("OPENROUTER_API_KEY", "")
        
    async def call_api(self, prompt: str) -> tuple[dict, float]:
        """Make a single API call and return response and latency."""
        start_time = time.perf_counter()
        
        try:
            if self.mode == "openrouter":
                result = await self._call_openrouter(prompt)
            elif self.mode == "minimax":
                result = await self._call_minimax(prompt)
            else:
                raise ValueError(f"Unknown mode: {self.mode}")
                
            end_time = time.perf_counter()
            latency_ms = (end_time - start_time) * 1000
            
            return result, latency_ms
            
        except Exception as e:
            end_time = time.perf_counter()
            latency_ms = (end_time - start_time) * 1000
            raise
    
    async def _call_openrouter(self, prompt: str) -> dict:
        """Call OpenRouter API."""
        import aiohttp
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://openclaw.local",
            "X-Title": "TokenBenchmark"
        }
        
        payload = {
            "model": self.config["model"],
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 256
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.config['api_base']}/chat/completions",
                headers=headers,
                json=payload,
                timeout=aiohttp.ClientTimeout(total=self.config["timeout"])
            ) as resp:
                if resp.status != 200:
                    text = await resp.text()
                    raise Exception(f"API error {resp.status}: {text}")
                data = await resp.json()
                
        # Extract token usage
        usage = data.get("usage", {})
        return {
            "content": data["choices"][0]["message"]["content"],
            "input_tokens": usage.get("prompt_tokens", 0),
            "output_tokens": usage.get("completion_tokens", 0),
            "total_tokens": usage.get("total_tokens", 0)
        }
    
    async def _call_minimax(self, prompt: str) -> dict:
        """Call Minimax M2.5 API."""
        import aiohttp
        
        # Minimax uses Anthropic-compatible API with Bearer auth
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        payload = {
            "model": self.config["model"],
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 256
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.config['api_base']}/chat/completions",
                headers=headers,
                json=payload,
                timeout=aiohttp.ClientTimeout(total=self.config["timeout"])
            ) as resp:
                if resp.status != 200:
                    text = await resp.text()
                    raise Exception(f"API error {resp.status}: {text}")
                data = await resp.json()
        
        # Extract token usage
        usage = data.get("usage", {})
        return {
            "content": data["choices"][0]["message"]["content"],
            "input_tokens": usage.get("prompt_tokens", 0),
            "output_tokens": usage.get("completion_tokens", 0),
            "total_tokens": usage.get("total_tokens", 0)
        }
    
    async def run_single(self, prompt: str, index: int) -> BenchmarkResult:
        """Run a single benchmark iteration."""
        start_time = time.time()
        
        try:
            result, latency_ms = await self.call_api(prompt)
            
            tokens_per_sec = result["total_tokens"] / (latency_ms / 1000) if latency_ms > 0 else 0
            
            return BenchmarkResult(
                prompt_index=index,
                prompt_preview=prompt[:50] + "..." if len(prompt) > 50 else prompt,
                start_time=start_time,
                end_time=time.time(),
                latency_ms=latency_ms,
                input_tokens=result["input_tokens"],
                output_tokens=result["output_tokens"],
                total_tokens=result["total_tokens"],
                tokens_per_second=tokens_per_sec,
                success=True
            )
        except Exception as e:
            return BenchmarkResult(
                prompt_index=index,
                prompt_preview=prompt[:50] + "..." if len(prompt) > 50 else prompt,
                start_time=start_time,
                end_time=time.time(),
                latency_ms=latency_ms if 'latency_ms' in dir() else 0,
                input_tokens=0,
                output_tokens=0,
                total_tokens=0,
                tokens_per_second=0,
                success=False,
                error=str(e)
            )
    
    async def run_benchmark(self, num_prompts: int = None) -> BenchmarkSummary:
        """Run the full benchmark suite."""
        prompts = PROMPTS[:num_prompts] if num_prompts else PROMPTS
        results = []
        
        # Create semaphore for concurrency control
        semaphore = asyncio.Semaphore(self.concurrency)
        
        async def bounded_run(prompt: str, idx: int):
            async with semaphore:
                return await self.run_single(prompt, idx)
        
        # Run all prompts
        tasks = [bounded_run(prompt, idx) for idx, prompt in enumerate(prompts)]
        results = await asyncio.gather(*tasks)
        
        # Calculate statistics
        successful = [r for r in results if r.success]
        failed = [r for r in results if not r.success]
        
        if successful:
            latencies = sorted([r.latency_ms for r in successful])
            total_time = sum(r.latency_ms for r in successful)
            total_input = sum(r.input_tokens for r in successful)
            total_output = sum(r.output_tokens for r in successful)
            total_tokens = sum(r.total_tokens for r in successful)
            total_tps = sum(r.tokens_per_second for r in successful)
            
            return BenchmarkSummary(
                mode=self.mode,
                concurrency=self.concurrency,
                num_prompts=len(prompts),
                successful_runs=len(successful),
                failed_runs=len(failed),
                total_time_ms=total_time,
                avg_latency_ms=total_time / len(successful),
                avg_input_tokens=total_input / len(successful),
                avg_output_tokens=total_output / len(successful),
                avg_total_tokens=total_tokens / len(successful),
                avg_tokens_per_second=total_tps / len(successful),
                min_latency_ms=min(latencies),
                max_latency_ms=max(latencies),
                p50_latency_ms=latencies[len(latencies) // 2],
                p95_latency_ms=latencies[int(len(latencies) * 0.95)],
                timestamp=datetime.now().isoformat(),
                results=[asdict(r) for r in results]
            )
        else:
            return BenchmarkSummary(
                mode=self.mode,
                concurrency=self.concurrency,
                num_prompts=len(prompts),
                successful_runs=0,
                failed_runs=len(failed),
                total_time_ms=0,
                avg_latency_ms=0,
                avg_input_tokens=0,
                avg_output_tokens=0,
                avg_total_tokens=0,
                avg_tokens_per_second=0,
                min_latency_ms=0,
                max_latency_ms=0,
                p50_latency_ms=0,
                p95_latency_ms=0,
                timestamp=datetime.now().isoformat(),
                results=[asdict(r) for r in results]
            )


def main():
    parser = argparse.ArgumentParser(description="Token Rate Benchmark Harness")
    parser.add_argument("--mode", choices=["openrouter", "minimax"], default="openrouter",
                        help="API mode to benchmark")
    parser.add_argument("--concurrency", type=int, default=1,
                        help="Number of concurrent requests")
    parser.add_argument("--prompts", type=int, default=None,
                        help="Number of prompts to run (default: all ~30)")
    parser.add_argument("--output", type=str, default=None,
                        help="Output JSON file path")
    parser.add_argument("--api-key", type=str, default=None,
                        help="API key (or set OPENROUTER_API_KEY env var)")
    
    args = parser.parse_args()
    
    print(f"Starting benchmark: mode={args.mode}, concurrency={args.concurrency}")
    print(f"Prompts: {args.prompts or len(PROMPTS)}")
    print()
    
    benchmark = TokenBenchmark(
        mode=args.mode,
        concurrency=args.concurrency,
        api_key=args.api_key
    )
    
    # Run benchmark
    summary = asyncio.run(benchmark.run_benchmark(args.prompts))
    
    # Output results
    output = asdict(summary)
    
    if args.output:
        with open(args.output, "w") as f:
            json.dump(output, f, indent=2)
        print(f"Results saved to: {args.output}")
    else:
        print(json.dumps(output, indent=2))
    
    # Print summary
    print()
    print("=" * 50)
    print("SUMMARY")
    print("=" * 50)
    print(f"Mode:           {summary.mode}")
    print(f"Concurrency:    {summary.concurrency}")
    print(f"Successful:     {summary.successful_runs}/{summary.num_prompts}")
    print(f"Avg Latency:    {summary.avg_latency_ms:.1f} ms")
    print(f"Avg TPS:        {summary.avg_tokens_per_second:.1f} tok/s")
    print(f"P50 Latency:    {summary.p50_latency_ms:.1f} ms")
    print(f"P95 Latency:    {summary.p95_latency_ms:.1f} ms")


if __name__ == "__main__":
    main()
