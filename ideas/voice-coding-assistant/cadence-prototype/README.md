# Cadence Validation Prototype

> **Sprint 0: Prove the concept before building the mobile app**

This is a minimal Node.js CLI to validate the core hypothesis:
**voice → transcription → Claude Agent → code changes** works reliably.

## Prerequisites

- Node.js 20+
- OpenAI API key (for Whisper)
- Anthropic API key (for Claude Agent SDK)

## Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Add your API keys to .env
```

## Environment Variables

```bash
# .env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

## Usage

### Text Mode (test agent without voice)

```bash
npx tsx src/prototype.ts ./path/to/repo
# Then enter your task when prompted
```

### Audio Mode (full voice flow)

```bash
npx tsx src/prototype.ts --audio ./test-recordings/task-1.m4a ./path/to/repo
```

## Test Tasks

Record these 5 tasks for validation:

1. "Add a console.log to the main function in index.ts"
2. "Create a new file called utils.ts with a function that adds two numbers"
3. "Fix the typo in the README"
4. "Add error handling to the fetchData function"
5. "Write a unit test for the calculateTotal function"

## Success Criteria

| Metric | Threshold |
|--------|-----------|
| Voice transcription accuracy | >90% |
| Agent task completion | 4/5 tasks |
| End-to-end latency | <30 seconds |
| Cost per agent | <$0.50 |

## Decision Gate

- **PROCEED** if all criteria pass → Continue to mobile app
- **STOP** if any fail → Investigate and fix before proceeding

## Files

```
cadence-prototype/
├── src/
│   ├── prototype.ts    # Main CLI entry
│   ├── transcribe.ts   # Whisper integration
│   └── agent.ts        # Claude Agent SDK
├── test-recordings/    # Voice test files
├── .env.example
├── package.json
└── README.md
```

---

**Status:** Not Started
**Sprint:** 0 (Days 1-5)
**Owner:** Validation Agent
