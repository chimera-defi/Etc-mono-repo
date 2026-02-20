# Tool-Call Parser Guide

## Overview

The multi-format parser library (`tool_call_parsers.py`) supports 5 different tool-call formats:

1. **Native Tools API** - OpenAI-compatible native tool-call objects
2. **Tag-based** - `<tool_call>{...}</tool_call>` or `<tool_call>fn(...)</tool_call>`
3. **Bare JSON** - Standalone `{"name": "...", "arguments": {...}}`
4. **Bracket notation** - `[fn(arg="val", ...)]`
5. **Bare function calls** - `fn(city: Antwerp)` or `fn("value")`

All strategies use a **fallback chain**: if the first doesn't match, try the next one.

---

## Strategy Details

### 1. Native Tools API

**What it is:**
API objects from OpenAI-compatible endpoints (Ollama, OpenAI, etc.) that have native `tool_calls` support.

**Format:**
```python
tool_call = {
    "name": "get_weather",
    "arguments": {"city": "Antwerp"}
}
```

**Models that use this:**
- ✅ llama3.2 (Ollama native tools)
- ✅ qwen2.5 (Ollama native tools)
- ✅ qwen3 (Ollama native tools)
- ✅ phi3 (Ollama native tools)
- ✅ gemma2 (Ollama native tools)
- ✅ mistral (Ollama native tools)
- ✅ ministral (Ollama native tools)

**Implementation:**
```python
from parsers import parse_native_tool_calls, parse_native_all_tool_calls

# From Ollama/OpenAI API response
result = parse_native_tool_calls(resp.message.tool_calls)  # First call
all_calls = parse_native_all_tool_calls(resp.message.tool_calls)  # All calls
```

**Pros:** Structured, reliable, no parsing needed
**Cons:** Requires backend support

---

### 2. Tag-based

**What it is:**
Tool calls wrapped in XML-like tags. Can contain either JSON or function-call syntax.

**Formats:**
```
<tool_call>{"name": "get_weather", "arguments": {"city": "Antwerp"}}</tool_call>
<tool_call>get_weather(city="Antwerp")</tool_call>
```

**Models that use this:**
- 🔧 Bitnet (llama-server with system prompt)
- 🔧 Some Ollama models configured with system prompts
- 🔧 Models instructed to use specific formats

**Implementation:**
```python
from parsers import parse_tag_based, parse_all_tag_based

result = parse_tag_based(text_content)  # First call
all_calls = parse_all_tag_based(text_content)  # All calls
```

**Pros:** Works with both JSON and function syntax, easy to distinguish from other text
**Cons:** Requires model cooperation

---

### 3. Bare JSON

**What it is:**
Plain JSON objects in the response with `name` and `arguments` keys, no tags.

**Format:**
```
The result is: {"name": "get_weather", "arguments": {"city": "Antwerp"}}
```

**Models that use this:**
- ✅ gemma3 (often outputs bare JSON)
- ✅ granite (sometimes outputs bare JSON)
- 🔧 Models fine-tuned for JSON output

**Implementation:**
```python
from parsers import parse_bare_json, parse_all_bare_json

result = parse_bare_json(text_content)  # First match
all_calls = parse_all_bare_json(text_content)  # All matches
```

**Pros:** No special formatting required, natural JSON syntax
**Cons:** Could match false positives (e.g., JSON in explanations)

---

### 4. Bracket Notation

**What it is:**
Function calls inside brackets, often with keyword arguments.

**Format:**
```
[get_weather(city="Antwerp")]
[search_files(pattern="*.py"), get_weather(city="Paris")]
```

**Models that use this:**
- ✅ **LFM2.5-thinking:1.2b** (primary format)
- ✅ Some reasoning models that use bracket notation

**Implementation:**
```python
from parsers import parse_bracket_notation, parse_all_bracket_notation

result = parse_bracket_notation(text_content)  # First call
all_calls = parse_all_bracket_notation(text_content)  # All calls
```

**Pros:** Human-readable, avoids JSON edge cases
**Cons:** Requires specific format compliance

---

### 5. Bare Function Calls

**What it is:**
Function calls with no tags or brackets, just the function syntax.

**Formats:**
```
get_weather(city: Antwerp)
search_files("*.py")
schedule_meeting(title="Meeting", time="2025-02-10T14:00:00")
```

**Models that use this:**
- 🔧 phi4-mini (sometimes)
- 🔧 jan-v3 (sometimes)
- 🔧 smollm3 (sometimes)
- 🔧 Models with minimal formatting

**Implementation:**
```python
from parsers import parse_bare_funcall, parse_all_bare_funcall

result = parse_bare_funcall(text_content)  # First match
all_calls = parse_all_bare_funcall(text_content)  # All matches
```

**Pros:** Simple, minimal formatting
**Cons:** Risk of false positives on Python code; need to skip code blocks

---

## Unified Fallback Chain

Use the unified interface for automatic fallback:

```python
from parsers import parse_tool_call, parse_all_tool_calls

# Single call
result = parse_tool_call(response_text)
# Returns: {"name": "...", "arguments": {...}, "valid": True} or None

# All calls
all_calls = parse_all_tool_calls(response_text)
# Returns: List[{"name": "...", "arguments": {...}, "valid": True}]
```

**Priority order:**
1. Tag-based (most reliable, intentional)
2. Bare JSON
3. Bracket notation
4. Bare function calls (fallback of last resort)

---

## Model-Specific Hints

The library includes a `MODEL_PARSER_HINT` dict and `get_parser_hint()` function to suggest the best parser for each model:

```python
from parsers import get_parser_hint, MODEL_PARSER_HINT

hint = get_parser_hint("qwen2.5:3b")  # Returns "native"
hint = get_parser_hint("lfm2.5-thinking:1.2b")  # Returns "bracket"

# Full mapping
for model_name, hint in MODEL_PARSER_HINT.items():
    print(f"{model_name} -> {hint}")
```

---

## Integration with Benchmark Harness

### In `run_bench.py`

When running Ollama with `raw` mode (no native tools):

```python
def run_one_ollama_raw(model: str, prompt: str) -> dict:
    """Run prompt without native tool API."""
    from parsers import parse_all_tool_calls
    
    resp = ollama.chat(model=model, messages=messages, tools=TOOLS)
    content = resp.message.content or ""
    
    all_parsed = parse_all_tool_calls(content)
    parsed = all_parsed[0] if all_parsed else None
    
    if not parsed:
        return {"tool_called": False, ...}
    
    return {
        "tool_called": True,
        "tool_name": parsed["name"],
        "valid_args": True,
        "all_tool_calls": all_parsed,
    }
```

### Scoring Tool Calls

After parsing, use the structured result:

```python
result = parse_tool_call(response_text)

if result and result["valid"]:
    tool_name = result["name"]
    arguments = result["arguments"]
    # Score this as a successful tool call
else:
    # Score as failed or no call
```

---

## Testing Parsers

Each strategy has fallback-safe tests:

```python
# Test individual parsers
assert parse_bare_json('{"name": "fn", "arguments": {}}') is not None
assert parse_bracket_notation("[fn(arg=val)]") is not None

# Test unified chain
result = parse_tool_call(text)  # Always safe, returns None if no match
assert result is None or result["name"] in ["get_weather", ...]
```

---

## Known Limitations & Future Improvements

1. **Nested functions:** Only first function call is parsed in some modes
2. **Complex arguments:** Very nested JSON or arrays might fail in bracket notation
3. **Python code false positives:** Could match legitimate code with models that output explanations
4. **Custom tool names:** Only KNOWN_TOOLS are recognized in bare funcall mode

**Mitigations:**
- Use tag-based format when possible (avoids ambiguity)
- Strip code blocks before parsing bare funcalls
- Validate tool names against expected set
- Use `valid_args` flag to catch malformed arguments

---

## References

- Source: `/root/.openclaw/workspace/bench/tool-calling-benchmark/lib/bitnet_backend.py`
- Integration: `/root/.openclaw/workspace/bench/openclaw_llm_bench/run_bench.py`
- Docs: `/root/.openclaw/workspace/bench/TOOL_CALLING_METHODOLOGY.md`
