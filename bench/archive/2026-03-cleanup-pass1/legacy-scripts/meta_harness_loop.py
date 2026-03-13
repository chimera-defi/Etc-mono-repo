#!/usr/bin/env python3
"""
Meta Harness Loop - iterative optimization and comparison
"""

import json
import subprocess
import sys
from pathlib import Path
from datetime import datetime

WORKSPACE = Path("/root/.openclaw/workspace/bench")
RESULTS_DIR = WORKSPACE / "results"
REPORTS_DIR = WORKSPACE / "reports"

def load_canonical_results():
    """Load canonical benchmark results"""
    canonical_path = RESULTS_DIR / "canonical.json"
    if canonical_path.exists():
        return json.loads(canonical_path.read_text())
    return {}

def load_diagnostic_results():
    """Load diagnostic/fail-fast results"""
    diagnostic_path = RESULTS_DIR / "diagnostic.json"
    if diagnostic_path.exists():
        return json.loads(diagnostic_path.read_text())
    return {}

def save_canonical(results):
    """Save canonical results"""
    canonical_path = RESULTS_DIR / "canonical.json"
    canonical_path.write_text(json.dumps(results, indent=2))

def get_stable_candidates():
    """Get stable candidate models for comparison"""
    # Load from previous canonical results
    canonical = load_canonical_results()
    if canonical:
        return list(canonical.keys())
    return ["lfm2.5-thinking:1.2b", "mistral:7b"]

def run_comparison(model):
    """Run comparison benchmark for a model"""
    cmd = [
        sys.executable,
        str(WORKSPACE / "harness" / "run_with_variants.py"),
        model, "atomic", "1"
    ]
    
    result = subprocess.run(
        cmd,
        cwd=str(WORKSPACE),
        capture_output=True,
        text=True,
        timeout=300
    )
    
    return result.returncode == 0

def generate_report(canonical, diagnostic, candidates):
    """Generate self-optimizing report"""
    report = {
        "generated_at": datetime.now().isoformat(),
        "canonical_models": list(canonical.keys()),
        "diagnostic_models": list(diagnostic.keys()),
        "stable_candidates": candidates,
        "summary": {
            "total_canonical": len(canonical),
            "total_diagnostic": len(diagnostic)
        },
        "recommendations": []
    }
    
    # Add recommendations based on results
    if len(canonical) > 0:
        report["recommendations"].append("Canonical results available for comparison")
    
    return report

def main():
    print("=== Meta Harness Loop ===")
    print(f"Time: {datetime.now().isoformat()}")
    
    # Load existing results
    canonical = load_canonical_results()
    diagnostic = load_diagnostic_results()
    
    print(f"Loaded {len(canonical)} canonical results")
    print(f"Loaded {len(diagnostic)} diagnostic results")
    
    # Get stable candidates
    candidates = get_stable_candidates()
    print(f"Stable candidates: {candidates}")
    
    # Run comparison for stable candidates
    print("\nRunning comparison benchmarks...")
    new_canonical = {}
    for model in candidates:
        print(f"  Running {model}...")
        if run_comparison(model):
            # Load result
            result_file = WORKSPACE / f"phase2_results_{model.replace(':', '_')}_atomic.json"
            if result_file.exists():
                try:
                    data = json.loads(result_file.read_text())
                    new_canonical[model] = data
                    print(f"    ✓ {model}: completed")
                except:
                    print(f"    ✓ {model}: completed (not parseable)")
            else:
                new_canonical[model] = {"status": "completed"}
                print(f"    ✓ {model}: completed")
        else:
            print(f"    ✗ {model}: failed")
    
    # Generate report
    report = generate_report(new_canonical, diagnostic, candidates)
    
    # Save report
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    report_path = REPORTS_DIR / "SELF_OPTIMIZING_REPORT.md"
    
    # Write markdown report
    md_content = f"""# Self-Optimizing Report

**Generated:** {report['generated_at']}

## Summary

- Canonical Models: {report['summary']['total_canonical']}
- Diagnostic Models: {report['summary']['total_diagnostic']}
- Stable Candidates: {', '.join(report['stable_candidates'])}

## Recommendations

"""
    for rec in report['recommendations']:
        md_content += f"- {rec}\n"
    
    md_content += f"""
## Canonical Results

| Model | Status |
|-------|--------|
"""
    for model, data in new_canonical.items():
        status = data.get("status", "completed")
        md_content += f"| {model} | {status} |\n"
    
    report_path.write_text(md_content)
    print(f"\n✓ Report saved: {report_path}")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
