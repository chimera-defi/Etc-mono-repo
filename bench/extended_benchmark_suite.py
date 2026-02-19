#!/usr/bin/env python3
"""
Extended Benchmark Suite: Multi-turn + Problem-Solving + State Tracking
Designed to test capabilities beyond atomic tool-calling.
"""

# P13-P18: Multi-Turn (Requires Conversation History)
MULTI_TURN_PROMPTS = [
    {
        "id": "P13",
        "turns": [
            {"role": "user", "content": "We're benchmarking tool-calling. What's the weather in Antwerp?"},
            {"role": "assistant", "content": "I'll check that for you."},
            {"role": "user", "content": "And can you search for Q1 reports while you're at it?"}
        ],
        "expected": ["get_weather", "search_files"],
        "category": "Multi-turn context",
        "notes": "Needs to maintain context: weather for Antwerp + search reports"
    },
    {
        "id": "P14",
        "turns": [
            {"role": "user", "content": "Earlier we found bugs in prompts P5 and P7."},
            {"role": "assistant", "content": "Got it, I've noted the bugs."},
            {"role": "user", "content": "Can you schedule a meeting to discuss them?"}
        ],
        "expected": ["schedule_meeting"],
        "category": "State recall",
        "notes": "Must recall that bugs were identified, context matters"
    },
    {
        "id": "P15",
        "turns": [
            {"role": "user", "content": "Don't check the weather tomorrow."},
            {"role": "assistant", "content": "Understood, won't check weather."},
            {"role": "user", "content": "But can you find files about tomorrow's meeting?"}
        ],
        "expected": ["search_files"],
        "category": "Restraint + action",
        "notes": "Earlier instruction (don't check weather) must persist"
    },
    {
        "id": "P16",
        "turns": [
            {"role": "user", "content": "We have 3 stakeholders attending. The weather is important."},
            {"role": "assistant", "content": "Noted: 3 stakeholders, weather matters."},
            {"role": "user", "content": "Now schedule the meeting."}
        ],
        "expected": ["schedule_meeting"],
        "category": "Context-aware judgment",
        "notes": "Context (stakeholders, weather) shouldn't trigger get_weather. Should call schedule only."
    },
    {
        "id": "P17",
        "turns": [
            {"role": "user", "content": "Last time we searched for budget files, remember?"},
            {"role": "assistant", "content": "Yes, I remember."},
            {"role": "user", "content": "Can you search again? And what's the weather?"}
        ],
        "expected": ["search_files", "get_weather"],
        "category": "Multi-tool with context",
        "notes": "Conversation implies continuation of earlier task"
    },
    {
        "id": "P18",
        "turns": [
            {"role": "user", "content": "I said earlier: don't call any tools without asking first."},
            {"role": "assistant", "content": "Understood, I'll ask before using tools."},
            {"role": "user", "content": "What's the weather? Should I schedule a meeting?"}
        ],
        "expected": [],
        "category": "Instruction persistence",
        "notes": "Earlier meta-instruction (ask before calling tools) should prevent calling"
    }
]

# P19-P24: Problem-Solving (Handle Failures, Retry Logic)
PROBLEM_SOLVING_PROMPTS = [
    {
        "id": "P19",
        "turns": [
            {"role": "user", "content": "Call get_weather for Paris"},
            {"role": "assistant", "content": "[Calling get_weather]"},
            {"role": "user", "content": "That returned an error. What should we do?"}
        ],
        "expected": [],
        "category": "Error handling",
        "notes": "Should suggest retry or alternative, not blindly re-call"
    },
    {
        "id": "P20",
        "turns": [
            {"role": "user", "content": "Schedule a meeting with the team"},
            {"role": "assistant", "content": "[Calling schedule_meeting]"},
            {"role": "user", "content": "Missing person name and time. Can you retry with better data?"}
        ],
        "expected": ["schedule_meeting"],
        "category": "Intelligent retry",
        "notes": "Must call schedule_meeting again with corrected parameters"
    },
    {
        "id": "P21",
        "turns": [
            {"role": "user", "content": "Check weather and schedule a meeting"},
            {"role": "assistant", "content": "[Calling both]"},
            {"role": "user", "content": "Oops, we don't need weather for this meeting. What should change?"}
        ],
        "expected": ["schedule_meeting"],
        "category": "Course correction",
        "notes": "Should recognize unnecessary tool call and adjust"
    },
    {
        "id": "P22",
        "turns": [
            {"role": "user", "content": "Search for files matching 'quarterly'"},
            {"role": "assistant", "content": "[Searching]"},
            {"role": "user", "content": "Results are incomplete. Try a broader search?"}
        ],
        "expected": ["search_files"],
        "category": "Refinement",
        "notes": "Must adjust search parameters based on feedback"
    },
    {
        "id": "P23",
        "turns": [
            {"role": "user", "content": "What tools do you have?"},
            {"role": "assistant", "content": "I have get_weather, search_files, schedule_meeting"},
            {"role": "user", "content": "Now get the weather. But wait, actually just find files instead."}
        ],
        "expected": ["search_files"],
        "category": "Changed mind",
        "notes": "Should call the new instruction, not the old one"
    },
    {
        "id": "P24",
        "turns": [
            {"role": "user", "content": "We need both weather and a meeting scheduled."},
            {"role": "assistant", "content": "[Calling both]"},
            {"role": "user", "content": "Actually the meeting is already scheduled. Just get weather."}
        ],
        "expected": ["get_weather"],
        "category": "Partial cancellation",
        "notes": "Should recognize one call succeeded, other should be cancelled"
    }
]

# P25-P30: State Tracking (Recall + Judgment Across Turns)
STATE_TRACKING_PROMPTS = [
    {
        "id": "P25",
        "turns": [
            {"role": "user", "content": "Remember: we found bugs in 5 areas during testing."},
            {"role": "assistant", "content": "Noted: 5 areas with bugs."},
            {"role": "user", "content": "Schedule a meeting to address them. Also check the weather."}
        ],
        "expected": ["schedule_meeting"],
        "category": "Context-aware judgment",
        "notes": "Bug context shouldn't trigger extra tools. Only schedule."
    },
    {
        "id": "P26",
        "turns": [
            {"role": "user", "content": "Earlier run: P1✓ P2✓ P3✓ P4✗ P5✓"},
            {"role": "assistant", "content": "I see: 4/5 passed on atomic tests."},
            {"role": "user", "content": "Now let's test multi-turn. What's weather and schedule a meeting?"}
        ],
        "expected": ["get_weather", "schedule_meeting"],
        "category": "History recall",
        "notes": "Recall of benchmark history shouldn't affect current decisions"
    },
    {
        "id": "P27",
        "turns": [
            {"role": "user", "content": "Status: 3 models tested (LFM✓ mistral⏳ gpt-oss⏳)"},
            {"role": "assistant", "content": "I see: 1 done, 2 pending."},
            {"role": "user", "content": "While we wait, can you search for budget files?"}
        ],
        "expected": ["search_files"],
        "category": "Task awareness",
        "notes": "Know we're in benchmark work, but independent request"
    },
    {
        "id": "P28",
        "turns": [
            {"role": "user", "content": "Key constraint: Don't call get_weather for cities we've already checked."},
            {"role": "assistant", "content": "Understood: skip weather for known cities."},
            {"role": "user", "content": "Check weather in Amsterdam. (We checked Antwerp already.)"}
        ],
        "expected": ["get_weather"],
        "category": "Stateful constraint",
        "notes": "Must track checked cities, but Amsterdam is new"
    },
    {
        "id": "P29",
        "turns": [
            {"role": "user", "content": "Successful calls so far: weather×2, search×1, schedule×0"},
            {"role": "assistant", "content": "Tracking: 2 weather, 1 search, 0 schedule calls."},
            {"role": "user", "content": "Now schedule a meeting and check weather again."}
        ],
        "expected": ["schedule_meeting", "get_weather"],
        "category": "Call tracking",
        "notes": "Should know call history but not let it prevent new calls"
    },
    {
        "id": "P30",
        "turns": [
            {"role": "user", "content": "Progress: Fixed P7 bug, still debugging P12."},
            {"role": "assistant", "content": "Got it: P7 fixed, P12 in progress."},
            {"role": "user", "content": "While debugging, can you search for error logs and schedule a debug session?"}
        ],
        "expected": ["search_files", "schedule_meeting"],
        "category": "Background awareness",
        "notes": "Parallel debugging context shouldn't affect current requests"
    }
]

if __name__ == "__main__":
    all_prompts = {
        "multi_turn": MULTI_TURN_PROMPTS,
        "problem_solving": PROBLEM_SOLVING_PROMPTS,
        "state_tracking": STATE_TRACKING_PROMPTS
    }
    
    import json
    with open("/root/.openclaw/workspace/bench/extended_benchmark_suite.json", "w") as f:
        json.dump(all_prompts, f, indent=2)
    
    print("✅ Extended benchmark suite generated:")
    print(f"  - Multi-turn (P13-P18): {len(MULTI_TURN_PROMPTS)}")
    print(f"  - Problem-solving (P19-P24): {len(PROBLEM_SOLVING_PROMPTS)}")
    print(f"  - State tracking (P25-P30): {len(STATE_TRACKING_PROMPTS)}")
    print(f"Total new prompts: {len(MULTI_TURN_PROMPTS) + len(PROBLEM_SOLVING_PROMPTS) + len(STATE_TRACKING_PROMPTS)}")
