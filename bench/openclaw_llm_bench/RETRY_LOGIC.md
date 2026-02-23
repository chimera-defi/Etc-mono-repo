# Exponential Backoff Retry Logic - Phase 2A

## Overview

The benchmark harness has been updated with exponential backoff retry logic to handle rate limiting (HTTP 429) and transient service unavailability (HTTP 503) from the OpenAI API.

## Changes Made

### Modified Functions

#### 1. `http_json()` - HTTP JSON requests with retry

**Location:** `run_bench.py:66-103`

**Retry Logic:**
- Max retries: 5 attempts (6 total with initial request)
- Base delay: 1 second
- Exponential backoff formula: `delay = 1.0 * (2 ** attempt)`
- Delays: 1s, 2s, 4s, 8s, 16s, 32s
- **Respects `Retry-After` header** from HTTP responses
- Retryable error codes: 429 (rate limited), 503 (service unavailable)
- Non-retryable errors: 401/403 (auth errors), other HTTP errors

**Key Features:**
- Logs retry attempts to stderr with delay and attempt number
- Maintains original error handling for non-retryable errors
- Fully backward compatible

#### 2. `http_sse()` - Server-Sent Events with retry

**Location:** `run_bench.py:105-160`

**Retry Logic:**
- Same exponential backoff strategy as `http_json()`
- Properly yields streamed JSON events from OpenAI Responses API
- Handles connection failures gracefully
- Respects streaming format (`data: <json>` lines and `[DONE]` terminator)

## Behavior on Rate Limiting

When a 429 (rate limited) response is received:

1. **Initial request** → HTTP 429 received
2. **Check for Retry-After header**:
   - If present: Use its value (in seconds)
   - If absent: Use exponential backoff (1s * 2^attempt)
3. **Sleep & retry**:
   - Log: `[http_json] Rate limited (HTTP 429), retrying in Xs (attempt 1/5)`
   - Wait `X` seconds
   - Send request again
4. **Repeat** until:
   - Request succeeds (HTTP 200)
   - Max retries exceeded (5 retries after initial attempt)
   - Non-retryable error encountered

## Example Output

```
[http_json] Rate limited (HTTP 429), retrying in 1.0s (attempt 1/5)
[http_json] Rate limited (HTTP 429), retrying in 2.0s (attempt 2/5)
[http_json] Rate limited (HTTP 429), retrying in 4.0s (attempt 3/5)
[http_sse] Rate limited (HTTP 503), retrying in 8.0s (attempt 4/5)
✓ Request successful on attempt 5
```

## Testing

### Prerequisites

```bash
export OPENAI_API_KEY="sk-..."  # Your OpenAI API key
```

### Run OpenAI Models Only

```bash
cd bench/openclaw_llm_bench
python3 run_bench.py \
  --targets openai_responses \
  --openai-model gpt-5-codex \
  --timeout-s 300 \
  --resume
```

### Run with High Thinking

```bash
python3 run_bench.py \
  --run-id "codex_high_thinking_retry" \
  --targets openai_responses \
  --openai-model gpt-5-codex \
  --timeout-s 300
```

### Use Provided Script

```bash
./run_openai_retry.sh "sk-..."
# or
export OPENAI_API_KEY="sk-..."
./run_openai_retry.sh
```

## Expected Improvements

### Before (Phase 1)
```
| Provider | Model | Thinking | n(total) | n(success) | n(rate_limited) |
|---|---|---|---|---|---|
| openai_responses | gpt-5-codex | high | 5 | 0 | 5 |
| openai_responses | gpt-5-codex | low | 5 | 0 | 5 |
| openai_responses | openai-codex/gpt-5.3-codex | high | 5 | 0 | 0 (5 errors) |
| openai_responses | openai-codex/gpt-5.3-codex | low | 5 | 0 | 0 (5 errors) |
```

### Expected After (Phase 2A)
- Higher success rate due to automatic retries
- Better latency percentiles (p50, p95) as transient failures are recovered
- More accurate billing (fewer failed attempts)
- Log file showing retry behavior for debugging

## Backward Compatibility

- No breaking changes to function signatures
- Existing code that calls `http_json()` and `http_sse()` works unchanged
- Retry logic is transparent to callers
- Added stderr logging does not interfere with stdout results

## API Quota Considerations

- Exponential backoff reduces burst load
- Respecting `Retry-After` header helps stay within quotas
- Max ~30 seconds total delay per request (1+2+4+8+16 seconds)
- Consider spacing out multiple benchmark runs if quota is tight

## Future Improvements

1. **Jitter**: Add random jitter to backoff delays to prevent thundering herd
2. **Circuit breaker**: Track consecutive failures and back off harder after 3+ consecutive rate limits
3. **Adaptive backoff**: Learn optimal delays from repeated Retry-After values
4. **Metrics**: Collect retry statistics in results.jsonl for analysis
5. **Configurable limits**: Make max_retries and base_delay configurable via CLI args

## Files Modified

- `run_bench.py`: Added exponential backoff retry logic to `http_json()` and `http_sse()`

## Files Added

- `RETRY_LOGIC.md`: This documentation
- `run_openai_retry.sh`: Convenience script for running OpenAI benchmarks with retries

## Verification

To verify the changes are in place:

```bash
python3 -c "
import run_bench
import inspect
print('http_json retry logic:', 'max_retries' in inspect.getsource(run_bench.http_json))
print('http_sse retry logic:', 'max_retries' in inspect.getsource(run_bench.http_sse))
"
```

Expected output:
```
http_json retry logic: True
http_sse retry logic: True
```
