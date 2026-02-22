import json
import re
from pathlib import Path

# Load both prompt sets
baseline_file = Path("prompts_tool_use_v1.json")
enhanced_file = Path("prompts_tool_use_enhanced.json")

with open(baseline_file) as f:
    baseline_prompts = json.load(f)

with open(enhanced_file) as f:
    enhanced_prompts = json.load(f)

def detect_tool_calls(text, expected_tools=None):
    """Same detection logic as in run_bench.py"""
    if not text:
        return [], 0, False
    
    detected_tools = []
    
    # Pattern 1: Backtick
    backtick_matches = re.findall(r'`([a-z0-9\-_.]+)', text, re.IGNORECASE)
    detected_tools.extend([m.split()[0] for m in backtick_matches])
    
    # Pattern 2: Quoted
    quoted_matches = re.findall(r'["\']([a-z0-9\-_.]+)\s', text)
    detected_tools.extend([m for m in quoted_matches])
    
    # Pattern 3: Shell
    shell_matches = re.findall(r'[$#]\s+([a-z0-9\-_.]+)', text)
    detected_tools.extend([m for m in shell_matches])
    
    # Pattern 4: XML tool
    xml_matches = re.findall(r'<tool>([a-z0-9\-_.]+)</tool>', text, re.IGNORECASE)
    detected_tools.extend(xml_matches)
    
    # Pattern 5: Bracket
    bracket_matches = re.findall(r'\[(?:tool|TOOL):\s*([a-z0-9\-_.]+)\]', text)
    detected_tools.extend(bracket_matches)
    
    # Pattern 6: Command tags
    command_matches = re.findall(r'<command>([a-z0-9\-_.]+)', text, re.IGNORECASE)
    detected_tools.extend([m.split()[0] for m in command_matches])
    
    normalized = []
    for tool in detected_tools:
        base = tool.split()[0].lower() if tool else ""
        if base and base not in normalized:
            normalized.append(base)
    
    success = False
    if expected_tools:
        expected_set = {t.lower() for t in expected_tools}
        found_set = {t.lower() for t in normalized}
        success = bool(found_set & expected_set)
    else:
        success = len(normalized) > 0
    
    return normalized, len(normalized), success

# Analyze each prompt variant
print("="*70)
print("BASELINE PROMPTS ANALYSIS")
print("="*70)

for p in baseline_prompts:
    expected = p.get("expected_tool_calls", [])
    detected, count, success = detect_tool_calls(p["prompt"], expected)
    print(f"\nPrompt: {p['id']} - {p['name']}")
    print(f"  Expected: {expected}")
    print(f"  Detectable in text: {detected}")
    print(f"  Would detect: {'✅ YES' if success else '❌ NO'}")

print("\n" + "="*70)
print("ENHANCED PROMPTS ANALYSIS")
print("="*70)

for p in enhanced_prompts:
    expected = p.get("expected_tool_calls", [])
    detected, count, success = detect_tool_calls(p["prompt"], expected)
    print(f"\nPrompt: {p['id']} - {p['name']}")
    print(f"  Expected: {expected}")
    print(f"  Detectable in text: {detected}")
    print(f"  Would detect: {'✅ YES' if success else '❌ NO'}")

print("\n" + "="*70)
