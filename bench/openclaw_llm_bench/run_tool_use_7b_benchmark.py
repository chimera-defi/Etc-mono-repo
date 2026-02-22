#!/usr/bin/env python3
"""Tool-Use Benchmark: Test if larger models (7B+) improve tool-detection success.

Hypothesis: 3B models failed at 16.7% success (qwen2.5:3b baseline).
Do 7B+ models succeed better?

Models tested:
1. mistral:7b (4.4 GB)
2. qwen2.5:8b (5.2 GB) 
3. qwen2.5:14b (9.3 GB)
4. glm-4.7-flash:latest (19 GB)

For each model: Run 6 tool-use prompts, measure detection success rate & latency.
"""

import json
import urllib.request
import time
import sys
import re
from typing import Dict, List, Tuple

BASE_URL = "http://localhost:11434/api/generate"

# Tool-use prompts (E0-E5 from enhanced set)
TOOL_USE_PROMPTS = [
    {
        "id": "E0",
        "name": "server_stats",
        "prompt": """Let me think through this step by step.

First, I need to understand what's being asked: Get current server memory status.

Before invoking tools, I will: check the available memory using a system command that shows memory usage in human-readable format.

Available tools:
<tool>
  <name>exec</name>
  <args>command: a shell command to execute</args>
</tool>

Here are examples of correct tool invocations:

Example 1:
Task: Check disk space
Reasoning: I need to see how much disk space is available. The 'df' command with '-h' flag shows this in human-readable format.
Tool call:
<tool_invocation>
  <tool>exec</tool>
  <command>df -h</command>
</tool_invocation>

Example 2:
Task: List files in home directory
Reasoning: I need to see what files are in the home directory. The 'ls' command will list them, and '-la' will show all files with details.
Tool call:
<tool_invocation>
  <tool>exec</tool>
  <command>ls -la ~</command>
</tool_invocation>

Now for the actual task:

Task: Get current server memory status. Call the 'free -h' command and report the available memory in human-readable format.

Reasoning: I need to check the server's memory status. The 'free -h' command shows memory usage in human-readable format (MB, GB). This is the right tool for this task.

Tool call:
<tool_invocation>
  <tool>exec</tool>
  <command>free -h</command>
</tool_invocation>

After getting the output, I will report the available memory clearly.""",
        "expected_tool": "exec",
        "expected_command": "free -h"
    },
    {
        "id": "E1",
        "name": "folder_stats",
        "prompt": """Let me think through this step by step.

First, I need to understand what's being asked: Check the disk usage of the current user's home directory.

Before invoking tools, I will: identify the home directory and use a command that shows the total disk usage in a human-readable format.

Available tools:
<tool>
  <name>exec</name>
  <args>command: a shell command to execute</args>
</tool>

Here are examples of correct tool invocations:

Example 1:
Task: Get current date and time
Reasoning: The 'date' command shows the current date and time on the system.
Tool call:
<tool_invocation>
  <tool>exec</tool>
  <command>date</command>
</tool_invocation>

Example 2:
Task: Check current working directory
Reasoning: The 'pwd' command shows the current working directory path.
Tool call:
<tool_invocation>
  <tool>exec</tool>
  <command>pwd</command>
</tool_invocation>

Now for the actual task:

Task: Check the disk usage of the current user's home directory. Call 'du -sh ~' or 'du -sh /root' and report the total size.

Reasoning: I need to check disk usage in the home directory. The 'du' command with '-s' (summary) and '-h' (human-readable) flags will show the total size of the home directory. This is the standard tool for checking directory sizes.

Tool call:
<tool_invocation>
  <tool>exec</tool>
  <command>du -sh ~</command>
</tool_invocation>

After getting the output, I will report the total disk size clearly.""",
        "expected_tool": "exec",
        "expected_command": "du -sh"
    },
    {
        "id": "E2",
        "name": "process_list",
        "prompt": """Let me think through this step by step.

First, I need to understand what's being asked: List the currently running processes and identify the top 3 by memory usage.

Before invoking tools, I will: use a command that shows all running processes with their memory usage, then sort and filter to find the top consumers.

Available tools:
<tool>
  <name>exec</name>
  <args>command: a shell command to execute</args>
</tool>

Here are examples of correct tool invocations:

Example 1:
Task: Show CPU usage information
Reasoning: The 'top' command displays real-time system statistics including CPU usage.
Tool call:
<tool_invocation>
  <tool>exec</tool>
  <command>top -b -n 1 | head -20</command>
</tool_invocation>

Example 2:
Task: Check system uptime
Reasoning: The 'uptime' command shows how long the system has been running.
Tool call:
<tool_invocation>
  <tool>exec</tool>
  <command>uptime</command>
</tool_invocation>

Now for the actual task:

Task: List the currently running processes. Call 'ps aux' and identify the top 3 processes by memory usage.

Reasoning: The 'ps aux' command shows all running processes with detailed information including memory usage (%MEM column). This will give me the complete process list so I can identify which ones use the most memory.

Tool call:
<tool_invocation>
  <tool>exec</tool>
  <command>ps aux</command>
</tool_invocation>

After getting the output, I will sort by memory usage and report the top 3 processes.""",
        "expected_tool": "exec",
        "expected_command": "ps"
    },
    {
        "id": "E3",
        "name": "file_search",
        "prompt": """Let me think through this step by step.

First, I need to understand what's being asked: Find configuration files in /etc that contain the word 'openssh'.

Before invoking tools, I will: use a recursive search command to find files containing this string, then limit the output to make it readable.

Available tools:
<tool>
  <name>exec</name>
  <args>command: a shell command to execute</args>
</tool>

Here are examples of correct tool invocations:

Example 1:
Task: Find files modified in the last 24 hours
Reasoning: The 'find' command with '-mtime' flag searches for recently modified files, and '-type f' filters for regular files.
Tool call:
<tool_invocation>
  <tool>exec</tool>
  <command>find /tmp -type f -mtime -1</command>
</tool_invocation>

Example 2:
Task: Search for error messages in a log file
Reasoning: The 'grep' command searches file contents for matching patterns. Using '-i' makes it case-insensitive.
Tool call:
<tool_invocation>
  <tool>exec</tool>
  <command>grep -i "error" /var/log/syslog</command>
</tool_invocation>

Now for the actual task:

Task: Find configuration files in /etc that contain the word 'openssh'. Call 'grep -r openssh /etc 2>/dev/null | head -5'.

Reasoning: I need to search recursively through /etc for files containing 'openssh'. The 'grep -r' command does recursive search, '2>/dev/null' suppresses permission errors, and 'head -5' limits output to 5 lines for readability.

Tool call:
<tool_invocation>
  <tool>exec</tool>
  <command>grep -r openssh /etc 2>/dev/null | head -5</command>
</tool_invocation>

After getting the output, I will report the matching configuration files and their content.""",
        "expected_tool": "exec",
        "expected_command": "grep"
    },
    {
        "id": "E4",
        "name": "network_check",
        "prompt": """Let me think through this step by step.

First, I need to understand what's being asked: Check network connectivity to google.com and report ping times.

Before invoking tools, I will: use the ping command with a fixed count to test connectivity and measure response times.

Available tools:
<tool>
  <name>exec</name>
  <args>command: a shell command to execute</args>
</tool>

Here are examples of correct tool invocations:

Example 1:
Task: Check DNS resolution
Reasoning: The 'nslookup' or 'dig' command tests DNS resolution for a domain.
Tool call:
<tool_invocation>
  <tool>exec</tool>
  <command>nslookup google.com</command>
</tool_invocation>

Example 2:
Task: Show network interface information
Reasoning: The 'ifconfig' or 'ip' command displays network interface details.
Tool call:
<tool_invocation>
  <tool>exec</tool>
  <command>ip addr show</command>
</tool_invocation>

Now for the actual task:

Task: Check network connectivity to google.com. Use 'ping -c 3 google.com' and report the ping times.

Reasoning: The ping command with '-c 3' sends exactly 3 ping packets to google.com, measures response times (latency), and helps verify network connectivity. This is the standard tool for checking if a host is reachable.

Tool call:
<tool_invocation>
  <tool>exec</tool>
  <command>ping -c 3 google.com</command>
</tool_invocation>

After getting the output, I will report the ping response times and connectivity status.""",
        "expected_tool": "exec",
        "expected_command": "ping"
    },
    {
        "id": "E5",
        "name": "multi_command",
        "prompt": """Let me think through this step by step.

First, I need to understand what's being asked: Perform a system health check by executing three commands: uptime, whoami, and date.

Before invoking each tool, I will identify what information each command provides:
1. uptime → system load and how long it's been running
2. whoami → current user
3. date → current date and time

Available tools:
<tool>
  <name>exec</name>
  <args>command: a shell command to execute</args>
</tool>

Here are examples of correct tool invocations:

Example 1:
Task: Get system information
Reasoning: The 'uname' command shows system information including kernel name and version.
Tool call:
<tool_invocation>
  <tool>exec</tool>
  <command>uname -a</command>
</tool_invocation>

Example 2:
Task: Check disk and memory together
Reasoning: I can chain multiple commands with ';' separator to execute them in sequence.
Tool call:
<tool_invocation>
  <tool>exec</tool>
  <command>df -h; free -h</command>
</tool_invocation>

Now for the actual task:

Task: Perform a system health check: 1) Call 'uptime' to get system load, 2) Call 'whoami' to show current user, 3) Call 'date' to show current time.

Reasoning: I need three pieces of information:
1. System load (uptime) - tells me how long the system has been running and load average
2. Current user (whoami) - identifies which user is running this
3. Current date/time (date) - shows the system's current date and time

I can execute these as separate commands or chain them together. I'll invoke the exec tool with the chained command for efficiency.

Tool call:
<tool_invocation>
  <tool>exec</tool>
  <command>uptime; whoami; date</command>
</tool_invocation>

After getting the output, I will report all three results clearly showing the system load, current user, and current date/time.""",
        "expected_tool": "exec",
        "expected_command": "uptime"
    }
]

# Models to test
MODELS = [
    "mistral:7b",
    "qwen2.5:8b",
    "qwen2.5:14b",
    "glm-4.7-flash:latest",
]

def detect_tool_invocation(response: str) -> Tuple[bool, str]:
    """Detect if response contains proper tool invocation format.
    
    Returns: (success: bool, detail: str)
    """
    # Look for <tool_invocation> ... </tool_invocation> pattern
    if not re.search(r'<tool_invocation>.*?</tool_invocation>', response, re.DOTALL):
        return False, "no_tool_invocation"
    
    # Look for <tool> and <command> or other tags
    if not re.search(r'<tool>', response):
        return False, "missing_tool_tag"
    
    # Count how many tool invocations found
    invocations = re.findall(r'<tool_invocation>.*?</tool_invocation>', response, re.DOTALL)
    if not invocations:
        return False, "empty_invocation"
    
    return True, f"found_{len(invocations)}"

def test_model_prompt(model: str, prompt: Dict, timeout: int = 180) -> Tuple[float, bool, str]:
    """Test one model with one tool-use prompt.
    
    Returns: (latency_ms, success, detail)
    """
    try:
        payload = {
            "model": model,
            "prompt": prompt["prompt"],
            "stream": False,
            "temperature": 0.3,
            "top_p": 0.9,
        }
        
        req = urllib.request.Request(
            BASE_URL,
            data=json.dumps(payload).encode('utf-8'),
            headers={"Content-Type": "application/json"},
        )
        
        start = time.perf_counter()
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            result = json.loads(resp.read().decode('utf-8'))
            elapsed = (time.perf_counter() - start) * 1000  # ms
            
            response_text = result.get("response", "").strip()
            success, detail = detect_tool_invocation(response_text)
            
            return elapsed, success, detail
    
    except urllib.error.URLError as e:
        if "refused" in str(e).lower() or "connection" in str(e).lower():
            return -1, False, "model_unavailable"
        return -1, False, f"error: {str(e)[:30]}"
    except urllib.error.HTTPError as e:
        return -1, False, f"http_{e.code}"
    except Exception as e:
        return -1, False, f"exception: {str(e)[:30]}"

def main():
    print("\n" + "="*90)
    print("TOOL-USE BENCHMARK: 7B+ Models vs 3B Baseline")
    print("Hypothesis: Can larger models (7B+) improve tool-use detection success?")
    print("="*90)
    print(f"Baseline (qwen2.5:3b):    16.7% success rate")
    print(f"Testing {len(MODELS)} models × {len(TOOL_USE_PROMPTS)} prompts = {len(MODELS) * len(TOOL_USE_PROMPTS)} tests")
    print("="*90 + "\n")
    
    results = []
    test_count = 0
    total = len(MODELS) * len(TOOL_USE_PROMPTS)
    
    # Test each model
    for model in MODELS:
        print(f"\n[MODEL] {model}")
        print("-" * 90)
        
        model_results = []
        model_latencies = []
        
        # Test each prompt
        for prompt in TOOL_USE_PROMPTS:
            test_count += 1
            name = f"  {prompt['id']:3s} {prompt['name']:18s}"
            print(f"[{test_count:2d}/{total}] {name}... ", end="", flush=True)
            
            latency_ms, success, detail = test_model_prompt(model, prompt, timeout=180)
            
            results.append({
                "model": model,
                "prompt_id": prompt["id"],
                "prompt_name": prompt["name"],
                "latency_ms": latency_ms,
                "success": success,
                "detail": detail
            })
            
            model_results.append(success)
            if latency_ms > 0:
                model_latencies.append(latency_ms)
            
            if success:
                print(f"✓ {latency_ms:7.1f} ms")
            else:
                print(f"✗ {latency_ms:7.1f} ms ({detail})")
            
            time.sleep(0.5)  # Pause between tests
        
        # Model summary
        success_count = sum(1 for r in model_results if r)
        success_pct = (success_count / len(model_results) * 100) if model_results else 0
        avg_latency = sum(model_latencies) / len(model_latencies) if model_latencies else 0
        
        print(f"\n  SUCCESS RATE: {success_count}/{len(model_results)} = {success_pct:.1f}%")
        print(f"  AVG LATENCY:  {avg_latency:.1f} ms")
    
    # Final summary
    print("\n" + "="*90)
    print("FINAL RESULTS")
    print("="*90 + "\n")
    
    # Summary table
    print("| Model                   | Success Rate | Avg Latency (ms) | Improvement over 3B |")
    print("|-------------------------|--------------|------------------|---------------------|")
    
    for model in MODELS:
        model_res = [r for r in results if r["model"] == model]
        success_count = sum(1 for r in model_res if r["success"])
        success_pct = (success_count / len(model_res) * 100) if model_res else 0
        
        latencies = [r["latency_ms"] for r in model_res if r["latency_ms"] > 0]
        avg_latency = sum(latencies) / len(latencies) if latencies else 0
        
        improvement = success_pct - 16.7  # vs 3B baseline
        
        print(f"| {model:23s} | {success_pct:11.1f}% | {avg_latency:16.1f} | {improvement:+18.1f}% |")
    
    print("\n" + "="*90)
    print("ANALYSIS")
    print("="*90 + "\n")
    
    # Check hypothesis
    model_success_rates = {}
    for model in MODELS:
        model_res = [r for r in results if r["model"] == model]
        success_count = sum(1 for r in model_res if r["success"])
        success_pct = (success_count / len(model_res) * 100) if model_res else 0
        model_success_rates[model] = success_pct
    
    max_model = max(model_success_rates.items(), key=lambda x: x[1])
    
    print(f"Best performing model: {max_model[0]} at {max_model[1]:.1f}% success rate")
    
    if max_model[1] > 30:
        print("✓ HYPOTHESIS SUPPORTED: Model size DOES help tool-use detection")
        print(f"  7B+ models show {max_model[1] - 16.7:.1f}% improvement over 3B baseline")
    elif max_model[1] >= 20:
        print("⚠ MIXED RESULTS: Some improvement over baseline, but still challenging")
        print(f"  7B+ models show {max_model[1] - 16.7:.1f}% improvement over 3B baseline")
    else:
        print("✗ HYPOTHESIS NOT SUPPORTED: Tool-use is fundamentally hard for Ollama models")
        print(f"  7B+ models show only {max_model[1] - 16.7:.1f}% improvement over 3B baseline")
    
    # Save results
    csv_file = "tool_use_7b_results.csv"
    with open(csv_file, "w") as f:
        f.write("model,prompt_id,prompt_name,latency_ms,success,detail\n")
        for r in results:
            f.write(f"{r['model']},{r['prompt_id']},{r['prompt_name']},{r['latency_ms']},{r['success']},{r['detail']}\n")
    
    print(f"\n✓ Results saved to {csv_file}")
    
    # Save JSON
    json_file = "tool_use_7b_results.json"
    with open(json_file, "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"✓ Detailed results saved to {json_file}")

if __name__ == "__main__":
    main()
