#!/usr/bin/env python3
"""
Verify warm-up effectiveness for LFM 2.5 1.2B.

Test: Run same 3 prompts (P6, P7, P9) with vs without warm-up.
Expected: Without warm-up = 71.4%, With warm-up = 100%
"""

import json
import subprocess
from pathlib import Path


def run_test(enable_warmup: bool) -> dict:
    """Run prompts P6, P7, P9 with/without warm-up."""
    
    cmd = [
        'python3', 'bench/run_benchmark.py',
        'lfm2.5-thinking:1.2b',
        'atomic',
        'native_api',
        '--prompts', 'P6,P7,P9'
    ]
    
    if enable_warmup:
        cmd.append('--enable-warmup')
    
    result = subprocess.run(cmd, capture_output=True, text=True, cwd='/root/.openclaw/workspace')
    
    # Parse output - look for accuracy in stdout
    try:
        # Try to find JSON output in stdout
        for line in result.stdout.splitlines():
            try:
                output = json.loads(line)
                if 'accuracy' in output or 'summary' in output:
                    return {
                        'warmup': enable_warmup,
                        'accuracy': output.get('accuracy', output.get('summary', {}).get('accuracy', 0)),
                        'passed': output.get('passed', output.get('summary', {}).get('passed', 0)),
                        'total': output.get('total', output.get('summary', {}).get('total', 0))
                    }
            except json.JSONDecodeError:
                continue
        
        # Fallback: parse from text output
        return {'warmup': enable_warmup, 'error': f"No JSON found: {result.stdout[:500]}"}
    except Exception as e:
        return {'warmup': enable_warmup, 'error': str(e)}


def main():
    print("🔥 Warm-Up Effectiveness Test\n")
    
    # Note: Due to cold-start pattern, we expect:
    # Without warm-up: ~71.4% (5/7) - first 2 runs fail
    # With warm-up: 100% (7/7) - model already loaded
    
    print("Running test WITHOUT warm-up (baseline)...")
    without = run_test(enable_warmup=False)
    print(f"Result: {without}")
    
    print("\nRunning test WITH warm-up...")
    with_warmup = run_test(enable_warmup=True)
    print(f"Result: {with_warmup}")
    
    if 'error' in without or 'error' in with_warmup:
        print("\n⚠️ Test encountered errors - cannot verify improvement")
        results = {
            'without_warmup': without,
            'with_warmup': with_warmup,
            'verdict': 'ERROR'
        }
    else:
        improvement = (with_warmup['accuracy'] - without['accuracy']) * 100
        print(f"\nWithout warm-up: {without['accuracy']*100:.1f}% ({without['passed']}/{without['total']})")
        print(f"With warm-up:    {with_warmup['accuracy']*100:.1f}% ({with_warmup['passed']}/{with_warmup['total']})")
        print(f"\nImprovement: +{improvement:.1f}% points")
        
        # Save results
        results = {
            'without_warmup': without,
            'with_warmup': with_warmup,
            'improvement_percent': improvement,
            'verdict': 'PASS' if improvement >= 20 else 'FAIL'
        }
        
        print(f"\n✅ Results saved to warm_up_effectiveness_report.json")
    
    Path('/root/.openclaw/workspace/bench/warm_up_effectiveness_report.json').write_text(json.dumps(results, indent=2))
    print(f"\nVerdict: {results['verdict']}")

if __name__ == '__main__':
    main()
