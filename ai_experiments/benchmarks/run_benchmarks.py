#!/usr/bin/env python3
"""
Unified Benchmark Runner for AI Constraint Tools

This script runs the same test prompts against all implemented constraint tools
and collects metrics for comparison.

Usage:
    python run_benchmarks.py --tools all
    python run_benchmarks.py --tools guardrails,outlines --scenarios happy_path
"""

import argparse
import asyncio
import json
import os
import time
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path
from typing import Optional
import statistics


@dataclass
class BenchmarkResult:
    """Result from a single benchmark run."""
    tool: str
    scenario_id: str
    scenario_name: str
    success: bool
    latency_ms: float
    tokens_input: int
    tokens_output: int
    retries: int
    validation_passed: bool
    error: Optional[str] = None
    response: Optional[dict] = None


@dataclass
class AggregateMetrics:
    """Aggregated metrics for a tool across all scenarios."""
    tool: str
    total_scenarios: int
    success_count: int
    success_rate: float
    latency_p50_ms: float
    latency_p95_ms: float
    latency_p99_ms: float
    avg_tokens_input: float
    avg_tokens_output: float
    avg_retries: float
    validation_pass_rate: float


class BenchmarkRunner:
    """Runs benchmarks across all constraint tools."""
    
    SUPPORTED_TOOLS = [
        'spec_kit',
        'guardrails_ai', 
        'microsoft_guidance',
        'outlines',
        'bmad'
    ]
    
    def __init__(self, workspace_root: Path):
        self.workspace_root = workspace_root
        self.common_dir = workspace_root / 'common'
        self.results_dir = workspace_root / 'benchmarks' / 'results'
        self.results_dir.mkdir(parents=True, exist_ok=True)
        
        # Load test data
        with open(self.common_dir / 'test_prompts.json') as f:
            self.test_prompts = json.load(f)
        
        with open(self.common_dir / 'expected_schemas.json') as f:
            self.expected_schema = json.load(f)
    
    def get_tool_runner(self, tool: str):
        """Get the runner for a specific tool."""
        runners = {
            'spec_kit': self._run_spec_kit,
            'guardrails_ai': self._run_guardrails,
            'microsoft_guidance': self._run_guidance,
            'outlines': self._run_outlines,
            'bmad': self._run_bmad,
        }
        return runners.get(tool)
    
    async def run_single(self, tool: str, scenario: dict) -> BenchmarkResult:
        """Run a single scenario against a specific tool."""
        runner = self.get_tool_runner(tool)
        if not runner:
            return BenchmarkResult(
                tool=tool,
                scenario_id=scenario.get('id', 'unknown'),
                scenario_name=scenario.get('name', 'unknown'),
                success=False,
                latency_ms=0,
                tokens_input=0,
                tokens_output=0,
                retries=0,
                validation_passed=False,
                error=f"No runner implemented for {tool}"
            )
        
        start_time = time.time()
        try:
            result = await runner(scenario)
            latency_ms = (time.time() - start_time) * 1000
            return BenchmarkResult(
                tool=tool,
                scenario_id=scenario.get('id', 'unknown'),
                scenario_name=scenario.get('name', 'unknown'),
                success=True,
                latency_ms=latency_ms,
                tokens_input=result.get('tokens_input', 0),
                tokens_output=result.get('tokens_output', 0),
                retries=result.get('retries', 0),
                validation_passed=result.get('validation_passed', False),
                response=result.get('response')
            )
        except Exception as e:
            latency_ms = (time.time() - start_time) * 1000
            return BenchmarkResult(
                tool=tool,
                scenario_id=scenario.get('id', 'unknown'),
                scenario_name=scenario.get('name', 'unknown'),
                success=False,
                latency_ms=latency_ms,
                tokens_input=0,
                tokens_output=0,
                retries=0,
                validation_passed=False,
                error=str(e)
            )
    
    async def _run_spec_kit(self, scenario: dict) -> dict:
        """Run scenario through Spec Kit."""
        # TODO: Implement once spec_kit demo is built
        raise NotImplementedError("Spec Kit demo not yet implemented")
    
    async def _run_guardrails(self, scenario: dict) -> dict:
        """Run scenario through Guardrails AI."""
        # TODO: Implement once guardrails demo is built
        raise NotImplementedError("Guardrails demo not yet implemented")
    
    async def _run_guidance(self, scenario: dict) -> dict:
        """Run scenario through Microsoft Guidance."""
        # TODO: Implement once guidance demo is built
        raise NotImplementedError("Guidance demo not yet implemented")
    
    async def _run_outlines(self, scenario: dict) -> dict:
        """Run scenario through Outlines."""
        # TODO: Implement once outlines demo is built
        raise NotImplementedError("Outlines demo not yet implemented")
    
    async def _run_bmad(self, scenario: dict) -> dict:
        """Run scenario through B-MAD Method."""
        # TODO: Implement once bmad demo is built
        raise NotImplementedError("B-MAD demo not yet implemented")
    
    def aggregate_results(self, results: list[BenchmarkResult]) -> dict[str, AggregateMetrics]:
        """Aggregate results by tool."""
        by_tool = {}
        for result in results:
            if result.tool not in by_tool:
                by_tool[result.tool] = []
            by_tool[result.tool].append(result)
        
        aggregates = {}
        for tool, tool_results in by_tool.items():
            latencies = [r.latency_ms for r in tool_results if r.success]
            
            aggregates[tool] = AggregateMetrics(
                tool=tool,
                total_scenarios=len(tool_results),
                success_count=sum(1 for r in tool_results if r.success),
                success_rate=sum(1 for r in tool_results if r.success) / len(tool_results) if tool_results else 0,
                latency_p50_ms=statistics.median(latencies) if latencies else 0,
                latency_p95_ms=statistics.quantiles(latencies, n=20)[18] if len(latencies) >= 20 else (max(latencies) if latencies else 0),
                latency_p99_ms=statistics.quantiles(latencies, n=100)[98] if len(latencies) >= 100 else (max(latencies) if latencies else 0),
                avg_tokens_input=statistics.mean([r.tokens_input for r in tool_results]) if tool_results else 0,
                avg_tokens_output=statistics.mean([r.tokens_output for r in tool_results]) if tool_results else 0,
                avg_retries=statistics.mean([r.retries for r in tool_results]) if tool_results else 0,
                validation_pass_rate=sum(1 for r in tool_results if r.validation_passed) / len(tool_results) if tool_results else 0,
            )
        
        return aggregates
    
    async def run_all(self, tools: list[str], scenarios: list[str]) -> tuple[list[BenchmarkResult], dict[str, AggregateMetrics]]:
        """Run all benchmarks."""
        results = []
        
        # Get all scenarios to run
        all_scenarios = []
        for scenario_type in scenarios:
            if scenario_type in self.test_prompts['scenarios']:
                all_scenarios.extend(self.test_prompts['scenarios'][scenario_type])
        
        # Run each tool against each scenario
        for tool in tools:
            print(f"\n🔧 Running {tool}...")
            for scenario in all_scenarios:
                print(f"  📋 Scenario: {scenario.get('name', scenario.get('id', 'unknown'))}")
                result = await self.run_single(tool, scenario)
                results.append(result)
                
                if result.success:
                    print(f"    ✅ Success ({result.latency_ms:.0f}ms, {result.retries} retries)")
                else:
                    print(f"    ❌ Failed: {result.error}")
        
        aggregates = self.aggregate_results(results)
        return results, aggregates
    
    def save_results(self, results: list[BenchmarkResult], aggregates: dict[str, AggregateMetrics]):
        """Save benchmark results to files."""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # Save detailed results
        detailed_path = self.results_dir / f'benchmark_detailed_{timestamp}.json'
        with open(detailed_path, 'w') as f:
            json.dump([asdict(r) for r in results], f, indent=2, default=str)
        print(f"\n📊 Detailed results saved to: {detailed_path}")
        
        # Save aggregates
        aggregate_path = self.results_dir / f'benchmark_aggregate_{timestamp}.json'
        with open(aggregate_path, 'w') as f:
            json.dump({k: asdict(v) for k, v in aggregates.items()}, f, indent=2)
        print(f"📊 Aggregate results saved to: {aggregate_path}")
        
        # Generate markdown report
        report = self.generate_report(results, aggregates)
        report_path = self.results_dir / f'benchmark_report_{timestamp}.md'
        with open(report_path, 'w') as f:
            f.write(report)
        print(f"📝 Report saved to: {report_path}")
    
    def generate_report(self, results: list[BenchmarkResult], aggregates: dict[str, AggregateMetrics]) -> str:
        """Generate a markdown report."""
        report = f"""# AI Constraint Tools Benchmark Report

Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Summary

| Tool | Success Rate | Latency (p50) | Latency (p95) | Avg Retries | Validation Rate |
|------|--------------|---------------|---------------|-------------|-----------------|
"""
        for tool, agg in aggregates.items():
            report += f"| {tool} | {agg.success_rate:.1%} | {agg.latency_p50_ms:.0f}ms | {agg.latency_p95_ms:.0f}ms | {agg.avg_retries:.2f} | {agg.validation_pass_rate:.1%} |\n"
        
        report += """
## Detailed Results

"""
        for result in results:
            status = "✅" if result.success else "❌"
            report += f"### {status} {result.tool} - {result.scenario_name}\n\n"
            report += f"- **Scenario ID**: {result.scenario_id}\n"
            report += f"- **Latency**: {result.latency_ms:.0f}ms\n"
            report += f"- **Validation Passed**: {result.validation_passed}\n"
            report += f"- **Retries**: {result.retries}\n"
            if result.error:
                report += f"- **Error**: {result.error}\n"
            report += "\n"
        
        return report


def main():
    parser = argparse.ArgumentParser(description='Run AI constraint tool benchmarks')
    parser.add_argument('--tools', type=str, default='all',
                       help='Comma-separated list of tools to benchmark (or "all")')
    parser.add_argument('--scenarios', type=str, default='all',
                       help='Comma-separated list of scenario types (or "all")')
    args = parser.parse_args()
    
    workspace_root = Path(__file__).parent.parent
    runner = BenchmarkRunner(workspace_root)
    
    # Parse tools
    if args.tools == 'all':
        tools = runner.SUPPORTED_TOOLS
    else:
        tools = [t.strip() for t in args.tools.split(',')]
    
    # Parse scenarios
    if args.scenarios == 'all':
        scenarios = list(runner.test_prompts['scenarios'].keys())
    else:
        scenarios = [s.strip() for s in args.scenarios.split(',')]
    
    print(f"🚀 Starting benchmark run")
    print(f"   Tools: {', '.join(tools)}")
    print(f"   Scenarios: {', '.join(scenarios)}")
    
    results, aggregates = asyncio.run(runner.run_all(tools, scenarios))
    runner.save_results(results, aggregates)
    
    print("\n✨ Benchmark complete!")


if __name__ == '__main__':
    main()
