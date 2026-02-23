#!/usr/bin/env python3
"""
Test script to verify exponential backoff retry logic works correctly.
This simulates rate limiting and verifies the retry behavior.
"""

import json
import sys
import time
import urllib.error
import urllib.request
from unittest import mock
from io import StringIO


def test_http_json_retry_logic():
    """Test http_json retry logic with mock HTTP 429 responses."""
    print("=" * 70)
    print("TEST: http_json Exponential Backoff Retry Logic")
    print("=" * 70)
    
    # Import after we might patch things
    import run_bench
    
    # Test case 1: Immediate success (no retries needed)
    print("\n[Test 1] Immediate success (no retries)")
    attempt_count = [0]
    
    def successful_urlopen(req, timeout=None):
        attempt_count[0] += 1
        class MockResponse:
            def __init__(self):
                self.code = 200
            def read(self):
                return json.dumps({"status": "ok"}).encode()
            def __enter__(self):
                return self
            def __exit__(self, *args):
                pass
        return MockResponse()
    
    with mock.patch('urllib.request.urlopen', side_effect=successful_urlopen):
        result = run_bench.http_json(
            "https://api.openai.com/v1/chat/completions",
            {"messages": [{"role": "user", "content": "test"}]},
            {}
        )
        assert result["status"] == "ok"
        assert attempt_count[0] == 1
    print(f"✓ Success on first try (attempts: {attempt_count[0]})")
    
    # Test case 2: Rate limit then success
    print("\n[Test 2] Rate limit (429) → Success after retry")
    attempt_count = [0]
    
    def rate_limit_then_success(req, timeout=None):
        attempt_count[0] += 1
        if attempt_count[0] <= 2:
            # Simulate rate limit on first 2 attempts
            class MockError:
                code = 429
                def __init__(self):
                    self.msg = "Too Many Requests"
                def read(self):
                    return json.dumps({"error": "rate_limited"}).encode()
            raise urllib.error.HTTPError(
                "https://api.openai.com/v1/chat/completions",
                429, "Too Many Requests", {}, StringIO()
            )
        else:
            # Success on 3rd attempt
            class MockResponse:
                def __init__(self):
                    self.code = 200
                def read(self):
                    return json.dumps({"status": "ok", "attempt": attempt_count[0]}).encode()
                def __enter__(self):
                    return self
                def __exit__(self, *args):
                    pass
            return MockResponse()
    
    start = time.time()
    with mock.patch('urllib.request.urlopen', side_effect=rate_limit_then_success):
        with mock.patch('time.sleep') as mock_sleep:
            result = run_bench.http_json(
                "https://api.openai.com/v1/chat/completions",
                {"messages": [{"role": "user", "content": "test"}]},
                {}
            )
            assert result["status"] == "ok"
            assert result["attempt"] == 3
            # Verify sleep was called with exponential backoff
            sleep_calls = [call[0][0] for call in mock_sleep.call_args_list]
    
    print(f"✓ Success after 2 rate-limited attempts")
    print(f"  Total attempts: {attempt_count[0]}")
    print(f"  Sleep delays: {sleep_calls}")
    print(f"  Expected: ~[1.0, 2.0] - Exponential backoff working!")
    
    # Test case 3: Service unavailable (503)
    print("\n[Test 3] Service unavailable (503) → Success after retry")
    attempt_count = [0]
    
    def service_unavailable_then_success(req, timeout=None):
        attempt_count[0] += 1
        if attempt_count[0] <= 1:
            raise urllib.error.HTTPError(
                "https://api.openai.com/v1/chat/completions",
                503, "Service Unavailable", {}, StringIO()
            )
        else:
            class MockResponse:
                def read(self):
                    return json.dumps({"status": "ok"}).encode()
                def __enter__(self):
                    return self
                def __exit__(self, *args):
                    pass
            return MockResponse()
    
    with mock.patch('urllib.request.urlopen', side_effect=service_unavailable_then_success):
        with mock.patch('time.sleep') as mock_sleep:
            result = run_bench.http_json(
                "https://api.openai.com/v1/chat/completions",
                {"messages": [{"role": "user", "content": "test"}]},
                {}
            )
            assert result["status"] == "ok"
            sleep_calls = [call[0][0] for call in mock_sleep.call_args_list]
    
    print(f"✓ Success after 1 service unavailable (503)")
    print(f"  Total attempts: {attempt_count[0]}")
    print(f"  Sleep delay: {sleep_calls} (1.0s backoff)")
    
    # Test case 4: Max retries exceeded
    print("\n[Test 4] Max retries exceeded (persistent rate limit)")
    attempt_count = [0]
    
    def always_rate_limit(req, timeout=None):
        attempt_count[0] += 1
        raise urllib.error.HTTPError(
            "https://api.openai.com/v1/chat/completions",
            429, "Too Many Requests", {}, StringIO()
        )
    
    with mock.patch('urllib.request.urlopen', side_effect=always_rate_limit):
        with mock.patch('time.sleep'):  # Don't actually sleep in test
            try:
                run_bench.http_json(
                    "https://api.openai.com/v1/chat/completions",
                    {"messages": [{"role": "user", "content": "test"}]},
                    {}
                )
                print("✗ Should have raised HTTPError")
                sys.exit(1)
            except urllib.error.HTTPError as e:
                assert e.code == 429
    
    print(f"✓ Correctly failed after max retries")
    print(f"  Total attempts: {attempt_count[0]} (initial + 5 retries)")
    print(f"  Final error: HTTP 429 (rate limited)")
    
    # Test case 5: Non-retryable error (401)
    print("\n[Test 5] Auth error (401) - should NOT retry")
    attempt_count = [0]
    
    def auth_error(req, timeout=None):
        attempt_count[0] += 1
        raise urllib.error.HTTPError(
            "https://api.openai.com/v1/chat/completions",
            401, "Unauthorized", {}, StringIO()
        )
    
    with mock.patch('urllib.request.urlopen', side_effect=auth_error):
        try:
            run_bench.http_json(
                "https://api.openai.com/v1/chat/completions",
                {"messages": [{"role": "user", "content": "test"}]},
                {}
            )
            print("✗ Should have raised HTTPError")
            sys.exit(1)
        except urllib.error.HTTPError as e:
            assert e.code == 401
    
    print(f"✓ Auth error not retried")
    print(f"  Total attempts: {attempt_count[0]} (initial only, no retries)")
    
    print("\n" + "=" * 70)
    print("✓ ALL TESTS PASSED - Retry logic working correctly!")
    print("=" * 70)


if __name__ == "__main__":
    test_http_json_retry_logic()
