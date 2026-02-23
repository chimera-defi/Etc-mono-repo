"""
Multi-format tool-call parser for OpenClaw benchmarks.

Supports 5 parsing strategies (in priority order):
1. Native tools API (OpenAI-compatible)
2. Tag-based: <tool_call>{...}</tool_call> or <tool_call>fn(...)</tool_call>
3. Bare JSON: {...} with "name" and "arguments" keys
4. Bracket notation: [fn(key="value", ...)]
5. Positional/bare function calls: fn(arg1, arg2) or fn(key: value, ...)

This library was adapted from the local-agent-bench project.
Reference: /root/.openclaw/workspace/bench/tool-calling-benchmark/lib/
"""

import json
import re
from typing import Optional, Dict, List, Tuple, Any


# ============================================================================
# Known tool definitions for fallback positional argument parsing
# ============================================================================

KNOWN_TOOLS = {
    "get_weather": ["city"],
    "search_files": ["pattern"],
    "schedule_meeting": ["title", "time", "attendees"],
}


# ============================================================================
# Utility: Type checking for avoiding false positives
# ============================================================================

_TYPE_KEYWORDS = {
    "string", "str", "int", "float", "bool", "list", "array",
    "string[]", "number", "object"
}


def _is_type_signature(args: Dict[str, Any]) -> bool:
    """Check if parsed args look like a type signature rather than real values."""
    if not args:
        return False
    for k, v in args.items():
        if not isinstance(v, str):
            return False
        # Value is a type keyword
        if v.lower() in _TYPE_KEYWORDS:
            continue
        # Value equals parameter name (city: city)
        if v.lower() == k.lower():
            continue
        # Value looks like a placeholder
        if k.lower() in v.lower().replace("_", " ").replace("-", " "):
            continue
        return False
    return True


# ============================================================================
# STRATEGY 1: Native Tools API (Ollama, OpenAI-compatible)
# ============================================================================

def parse_native_tool_calls(tool_calls: Optional[List[Any]]) -> Optional[Dict[str, Any]]:
    """
    Parse native tool-calls from OpenAI-compatible API response.
    Input: List of ToolCall objects from resp.message.tool_calls

    Returns first tool call or None.
    """
    if not tool_calls:
        return None
    
    try:
        tc = tool_calls[0]
        fname = tc.function.name
        args = tc.function.arguments
        # Validate args are serializable
        json.dumps(args)
        return {"name": fname, "arguments": args, "valid": True}
    except (AttributeError, TypeError, ValueError):
        return None


def parse_native_all_tool_calls(tool_calls: Optional[List[Any]]) -> List[Dict[str, Any]]:
    """Parse all native tool-calls from API response."""
    if not tool_calls:
        return []
    
    results = []
    for tc in tool_calls:
        try:
            fname = tc.function.name
            args = tc.function.arguments
            json.dumps(args)
            results.append({"name": fname, "arguments": args, "valid": True})
        except (AttributeError, TypeError, ValueError):
            pass
    
    return results


# ============================================================================
# STRATEGY 2: Tag-based parsing (<tool_call> tags)
# ============================================================================

def _parse_tag_json(content: str) -> Optional[Dict[str, Any]]:
    """Parse JSON inside <tool_call> tags."""
    idx = content.find("<tool_call>")
    if idx == -1:
        return None
    
    rest = content[idx + len("<tool_call>"):].lstrip()
    if not rest.startswith("{"):
        return None
    
    # Find matching closing brace
    depth = 0
    end = -1
    for i, c in enumerate(rest):
        if c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                end = i + 1
                break
    
    if end == -1:
        return None
    
    try:
        call = json.loads(rest[:end])
        fname = call.get("name", "")
        args = call.get("arguments", {})
        json.dumps(args)  # validate
        return {"name": fname, "arguments": args, "valid": True}
    except (json.JSONDecodeError, TypeError, ValueError):
        return {"name": None, "arguments": None, "valid": False}


def _parse_funcall(text: str) -> Optional[Dict[str, Any]]:
    """Parse a single function call: fn(args)."""
    m = re.match(r"(\w+)\(", text.strip())
    if not m:
        return None
    
    fname = m.group(1)
    paren_start = m.end()
    
    # Find matching closing paren
    pdepth = 1
    in_str = False
    str_ch = None
    paren_end = -1
    
    for j in range(paren_start, len(text)):
        c = text[j]
        if in_str:
            if c == str_ch:
                in_str = False
        else:
            if c in ('"', "'"):
                in_str = True
                str_ch = c
            elif c == "(":
                pdepth += 1
            elif c == ")":
                pdepth -= 1
                if pdepth == 0:
                    paren_end = j
                    break
    
    if paren_end == -1:
        return None
    
    args_str = text[paren_start:paren_end]
    param_names = KNOWN_TOOLS.get(fname)
    parsed_args = _parse_bracket_args(args_str, param_names=param_names)
    
    return {"name": fname, "arguments": parsed_args, "valid": True}


def _parse_tag_funcall(content: str) -> Optional[Dict[str, Any]]:
    """Parse function-call syntax inside <tool_call> tags."""
    idx = content.find("<tool_call>")
    if idx == -1:
        return None
    
    rest = content[idx + len("<tool_call>"):].lstrip()
    close = rest.find("</tool_call>")
    if close != -1:
        rest = rest[:close].rstrip()
    
    return _parse_funcall(rest)


def _parse_all_tag_funcalls(content: str) -> List[Dict[str, Any]]:
    """Parse all function-call syntax inside <tool_call> tags."""
    results = []
    search_start = 0
    
    while True:
        idx = content.find("<tool_call>", search_start)
        if idx == -1:
            break
        
        rest = content[idx + len("<tool_call>"):].lstrip()
        
        # Find boundary: next <tool_call> or </tool_call>
        close = rest.find("</tool_call>")
        next_open = rest.find("<tool_call>")
        
        if close != -1 and (next_open == -1 or close < next_open):
            segment = rest[:close].rstrip()
            search_start = idx + len("<tool_call>") + close + len("</tool_call>")
        elif next_open != -1:
            segment = rest[:next_open].rstrip()
            search_start = idx + len("<tool_call>") + next_open
        else:
            segment = rest.rstrip()
            search_start = len(content)
        
        parsed = _parse_funcall(segment)
        if parsed:
            results.append(parsed)
    
    return results


def parse_tag_based(content: str) -> Optional[Dict[str, Any]]:
    """Parse tag-based tool calls: first JSON, then function-call syntax."""
    result = _parse_tag_json(content)
    if result:
        return result
    
    result = _parse_tag_funcall(content)
    if result:
        return result
    
    return None


def parse_all_tag_based(content: str) -> List[Dict[str, Any]]:
    """Parse all tag-based tool calls."""
    results = []
    
    # Try JSON inside tags first
    search_start = 0
    while True:
        idx = content.find("<tool_call>", search_start)
        if idx == -1:
            break
        
        rest = content[idx + len("<tool_call>"):].lstrip()
        if not rest.startswith("{"):
            search_start = idx + len("<tool_call>")
            continue
        
        depth = 0
        end = -1
        for i, c in enumerate(rest):
            if c == "{":
                depth += 1
            elif c == "}":
                depth -= 1
                if depth == 0:
                    end = i + 1
                    break
        
        if end == -1:
            search_start = idx + len("<tool_call>")
            continue
        
        try:
            call = json.loads(rest[:end])
            fname = call.get("name", "")
            args = call.get("arguments", {})
            json.dumps(args)
            results.append({"name": fname, "arguments": args, "valid": True})
        except (json.JSONDecodeError, TypeError, ValueError):
            pass
        
        search_start = idx + len("<tool_call>") + end
    
    if results:
        return results
    
    # Try function-call syntax in tags
    return _parse_all_tag_funcalls(content)


# ============================================================================
# STRATEGY 3: Bare JSON (no tags)
# ============================================================================

def parse_bare_json(content: str) -> Optional[Dict[str, Any]]:
    """Parse bare JSON object with 'name' and 'arguments' keys."""
    idx = 0
    
    while idx < len(content):
        brace = content.find("{", idx)
        if brace == -1:
            break
        
        depth = 0
        end = -1
        for i in range(brace, len(content)):
            if content[i] == "{":
                depth += 1
            elif content[i] == "}":
                depth -= 1
                if depth == 0:
                    end = i + 1
                    break
        
        if end == -1:
            break
        
        try:
            call = json.loads(content[brace:end])
            if isinstance(call, dict) and "name" in call and "arguments" in call:
                args = call["arguments"]
                json.dumps(args)  # validate
                return {"name": call["name"], "arguments": args, "valid": True}
        except (json.JSONDecodeError, TypeError, ValueError):
            pass
        
        idx = brace + 1
    
    return None


def parse_all_bare_json(content: str) -> List[Dict[str, Any]]:
    """Parse all bare JSON tool call objects."""
    results = []
    idx = 0
    
    while idx < len(content):
        brace = content.find("{", idx)
        if brace == -1:
            break
        
        depth = 0
        end = -1
        for i in range(brace, len(content)):
            if content[i] == "{":
                depth += 1
            elif content[i] == "}":
                depth -= 1
                if depth == 0:
                    end = i + 1
                    break
        
        if end == -1:
            break
        
        try:
            call = json.loads(content[brace:end])
            if isinstance(call, dict) and "name" in call and "arguments" in call:
                args = call["arguments"]
                json.dumps(args)
                results.append({"name": call["name"], "arguments": args, "valid": True})
                idx = end
                continue
        except (json.JSONDecodeError, TypeError, ValueError):
            pass
        
        idx = brace + 1
    
    return results


# ============================================================================
# STRATEGY 4: Bracket notation [fn(args), ...]
# ============================================================================

def _parse_positional_value(args_str: str, pos: int) -> Tuple[Any, int]:
    """Parse a single positional value. Returns (value, end_pos) or (None, pos)."""
    if pos >= len(args_str):
        return None, pos
    
    ch = args_str[pos]
    
    if ch in ('"', "'"):
        end = pos + 1
        while end < len(args_str) and args_str[end] != ch:
            end += 1
        return args_str[pos + 1:end], end + 1 if end < len(args_str) else end
    
    if ch == "[":
        depth = 1
        end = pos + 1
        while end < len(args_str) and depth > 0:
            if args_str[end] == "[":
                depth += 1
            elif args_str[end] == "]":
                depth -= 1
            end += 1
        arr_str = args_str[pos:end]
        try:
            return json.loads(arr_str), end
        except json.JSONDecodeError:
            return arr_str, end
    
    # Bare value — read until comma or end
    end = pos
    while end < len(args_str) and args_str[end] not in ",)":
        end += 1
    val = args_str[pos:end].strip()
    
    if not val:
        return None, pos
    
    try:
        return int(val), end
    except ValueError:
        try:
            return float(val), end
        except ValueError:
            return val, end


def _parse_bracket_args(args_str: str, param_names: Optional[List[str]] = None) -> Dict[str, Any]:
    """Parse keyword arguments from: key="value", key: val, etc.
    Also handles positional arguments when param_names provided."""
    args = {}
    pos = 0
    positional_idx = 0
    
    while pos < len(args_str):
        # Skip whitespace and commas
        while pos < len(args_str) and args_str[pos] in " ,\t\n":
            pos += 1
        
        if pos >= len(args_str):
            break
        
        # Match key= or key:
        km = re.match(r"(\w+)\s*[=:]\s*", args_str[pos:])
        if not km:
            # Try positional argument
            val, end = _parse_positional_value(args_str, pos)
            if val is not None and param_names and positional_idx < len(param_names):
                args[param_names[positional_idx]] = val
                positional_idx += 1
                pos = end
                continue
            break
        
        key = km.group(1)
        pos += km.end()
        
        if pos >= len(args_str):
            break
        
        ch = args_str[pos]
        
        if ch in ('"', "'"):
            # Quoted string
            end = pos + 1
            while end < len(args_str) and args_str[end] != ch:
                end += 1
            args[key] = args_str[pos + 1:end]
            pos = end + 1 if end < len(args_str) else end
        elif ch == "[":
            # Array
            depth = 1
            end = pos + 1
            while end < len(args_str) and depth > 0:
                if args_str[end] == "[":
                    depth += 1
                elif args_str[end] == "]":
                    depth -= 1
                end += 1
            arr_str = args_str[pos:end]
            try:
                args[key] = json.loads(arr_str)
            except json.JSONDecodeError:
                args[key] = arr_str
            pos = end
        else:
            # Bare value
            end = pos
            while end < len(args_str) and args_str[end] not in ",)":
                end += 1
            val = args_str[pos:end].strip()
            try:
                args[key] = int(val)
            except ValueError:
                try:
                    args[key] = float(val)
                except ValueError:
                    args[key] = val
            pos = end
    
    return args


def parse_bracket_notation(content: str) -> Optional[Dict[str, Any]]:
    """Parse bracket notation: [fn(arg="val")]."""
    m = re.search(r"\[(\w+)\(", content)
    if not m:
        return None
    
    start = m.start()
    
    # Find matching closing bracket
    depth = 0
    end = -1
    in_str = False
    str_ch = None
    
    for i in range(start, len(content)):
        c = content[i]
        if in_str:
            if c == str_ch:
                in_str = False
        else:
            if c in ('"', "'"):
                in_str = True
                str_ch = c
            elif c == "[":
                depth += 1
            elif c == "]":
                depth -= 1
                if depth == 0:
                    end = i
                    break
    
    if end == -1:
        return None
    
    inner = content[start + 1:end]
    
    # Find first function_name(args)
    call_re = re.compile(r"(\w+)\(")
    cm = call_re.search(inner)
    
    if not cm:
        return None
    
    fname = cm.group(1)
    paren_start = cm.end()
    
    # Find matching closing paren
    pdepth = 1
    in_s = False
    s_ch = None
    paren_end = -1
    
    for j in range(paren_start, len(inner)):
        c = inner[j]
        if in_s:
            if c == s_ch:
                in_s = False
        else:
            if c in ('"', "'"):
                in_s = True
                s_ch = c
            elif c == "(":
                pdepth += 1
            elif c == ")":
                pdepth -= 1
                if pdepth == 0:
                    paren_end = j
                    break
    
    if paren_end == -1:
        return None
    
    args_str = inner[paren_start:paren_end]
    parsed_args = _parse_bracket_args(args_str)
    
    return {"name": fname, "arguments": parsed_args, "valid": True}


def parse_all_bracket_notation(content: str) -> List[Dict[str, Any]]:
    """Parse all bracket notation tool calls."""
    m = re.search(r"\[(\w+)\(", content)
    if not m:
        return []
    
    start = m.start()
    
    # Find matching closing bracket
    depth = 0
    end = -1
    in_str = False
    str_ch = None
    
    for i in range(start, len(content)):
        c = content[i]
        if in_str:
            if c == str_ch:
                in_str = False
        else:
            if c in ('"', "'"):
                in_str = True
                str_ch = c
            elif c == "[":
                depth += 1
            elif c == "]":
                depth -= 1
                if depth == 0:
                    end = i
                    break
    
    if end == -1:
        return []
    
    inner = content[start + 1:end]
    
    # Find all function_name(args) calls
    results = []
    call_re = re.compile(r"(\w+)\(")
    pos = 0
    
    while pos < len(inner):
        cm = call_re.search(inner, pos)
        if not cm:
            break
        
        fname = cm.group(1)
        paren_start = cm.end()
        
        # Find matching closing paren
        pdepth = 1
        in_s = False
        s_ch = None
        paren_end = -1
        
        for j in range(paren_start, len(inner)):
            c = inner[j]
            if in_s:
                if c == s_ch:
                    in_s = False
            else:
                if c in ('"', "'"):
                    in_s = True
                    s_ch = c
                elif c == "(":
                    pdepth += 1
                elif c == ")":
                    pdepth -= 1
                    if pdepth == 0:
                        paren_end = j
                        break
        
        if paren_end == -1:
            pos = paren_start
            continue
        
        args_str = inner[paren_start:paren_end]
        parsed_args = _parse_bracket_args(args_str)
        results.append({"name": fname, "arguments": parsed_args, "valid": True})
        pos = paren_end + 1
    
    return results


# ============================================================================
# STRATEGY 5: Bare function calls (fallback)
# ============================================================================

def _strip_code_fences(content: str) -> str:
    """Strip markdown code fence markers."""
    return re.sub(r"```\w*\s*\n?", "", content)


def _remove_code_blocks(content: str) -> str:
    """Remove entire fenced code blocks."""
    return re.sub(r"```\w*\n.*?```", "", content, flags=re.DOTALL)


def parse_bare_funcall(content: str) -> Optional[Dict[str, Any]]:
    """Parse bare function calls like fn(city: Antwerp)."""
    no_code = _remove_code_blocks(content)
    pattern = re.compile(r"\b(" + "|".join(re.escape(t) for t in KNOWN_TOOLS) + r")\(")
    
    pos = 0
    while pos < len(no_code):
        m = pattern.search(no_code, pos)
        if not m:
            break
        
        # Skip if preceded by 'def ', '.', or '= ' (Python code patterns)
        prefix_start = max(0, m.start() - 4)
        prefix = no_code[prefix_start:m.start()]
        if prefix.endswith("def ") or prefix.endswith(".") or prefix.endswith("= "):
            pos = m.end()
            continue
        
        parsed = _parse_funcall(no_code[m.start():])
        if parsed and not _is_type_signature(parsed["arguments"]) and parsed["arguments"]:
            return parsed
        
        pos = m.start() + 1
    
    return None


def parse_all_bare_funcall(content: str) -> List[Dict[str, Any]]:
    """Parse all bare function calls."""
    no_code = _remove_code_blocks(content)
    pattern = re.compile(r"\b(" + "|".join(re.escape(t) for t in KNOWN_TOOLS) + r")\(")
    
    results = []
    pos = 0
    
    while pos < len(no_code):
        m = pattern.search(no_code, pos)
        if not m:
            break
        
        # Skip if preceded by 'def ', '.', or '= '
        prefix_start = max(0, m.start() - 4)
        prefix = no_code[prefix_start:m.start()]
        if prefix.endswith("def ") or prefix.endswith(".") or prefix.endswith("= "):
            pos = m.end()
            continue
        
        parsed = _parse_funcall(no_code[m.start():])
        if parsed and not _is_type_signature(parsed["arguments"]) and parsed["arguments"]:
            results.append(parsed)
            # Skip ahead to next potential tool
            pos = m.start() + 1
        else:
            pos = m.start() + 1
    
    return results


# ============================================================================
# Unified fallback chain
# ============================================================================

def parse_tool_call(content: str) -> Optional[Dict[str, Any]]:
    """
    Parse a single tool call from text using fallback chain:
    1. Tag-based (<tool_call> tags)
    2. Bare JSON
    3. Bracket notation
    4. Bare function calls
    """
    # Strip code fences for JSON parsing
    stripped = _strip_code_fences(content)
    
    result = parse_tag_based(content)
    if result:
        return result
    
    result = parse_bare_json(stripped)
    if result:
        return result
    
    result = parse_bracket_notation(content)
    if result:
        return result
    
    result = parse_bare_funcall(content)
    if result:
        return result
    
    return None


def parse_all_tool_calls(content: str) -> List[Dict[str, Any]]:
    """
    Parse ALL tool calls from text using fallback chain.
    Returns list of parsed tool call dicts.
    """
    stripped = _strip_code_fences(content)
    
    # Try tag-based first
    results = parse_all_tag_based(content)
    if results:
        return results
    
    # Try bare JSON
    results = parse_all_bare_json(stripped)
    if results:
        return results
    
    # Try bracket notation
    results = parse_all_bracket_notation(content)
    if results:
        return results
    
    # Try bare function calls
    results = parse_all_bare_funcall(content)
    if results:
        return results
    
    return []


# ============================================================================
# Model-specific format mapping
# ============================================================================

MODEL_PARSER_HINT = {
    # Ollama with native tools API (preferred)
    "llama3.2": "native",
    "qwen2.5": "native",
    "qwen3": "native",
    "phi3": "native",
    "gemma2": "native",
    "mistral": "native",
    "ministral": "native",
    
    # Models that output bracket notation
    "lfm2.5-thinking": "bracket",
    
    # Models that output raw text format
    "deepseek-r1": "tag_or_bare",
    "gemma3": "bare_json",
    "phi4-mini": "bare_funcall",
    "jan-v3": "bare_funcall",
    "smollm3": "bare_funcall",
    "granite": "bare_json",
    
    # Bitnet models
    "bitnet": "tag_or_bare",
}


def get_parser_hint(model_name: str) -> str:
    """Get the preferred parser strategy for a model."""
    model_name_lower = model_name.lower()
    for key, hint in MODEL_PARSER_HINT.items():
        if key in model_name_lower:
            return hint
    return "native"  # Default fallback


__all__ = [
    # Strategy functions
    "parse_native_tool_calls",
    "parse_native_all_tool_calls",
    "parse_tag_based",
    "parse_all_tag_based",
    "parse_bare_json",
    "parse_all_bare_json",
    "parse_bracket_notation",
    "parse_all_bracket_notation",
    "parse_bare_funcall",
    "parse_all_bare_funcall",
    # Unified interface
    "parse_tool_call",
    "parse_all_tool_calls",
    "get_parser_hint",
    "MODEL_PARSER_HINT",
]
