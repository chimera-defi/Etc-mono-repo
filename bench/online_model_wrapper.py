#!/usr/bin/env python3
"""
Online Model Wrapper for Benchmark Harness

Provides unified interface for cloud LLM APIs (Minimax, Claude, OpenAI)
with standardized response format matching local Ollama models.

Supports:
- Minimax API
- Anthropic Claude API
- OpenAI-compatible APIs (OpenRouter, etc.)

Features:
- Rate limiting with exponential backoff
- Automatic retries
- Response standardization to match local model format
- Fallback chain support
"""

import json
import os
import time
import logging
from dataclasses import dataclass, field
from typing import Optional, List, Dict, Any
from urllib.parse import urljoin

import requests

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class APIConfig:
    """Configuration for an online model API."""
    name: str
    api_base: str
    api_key: str
    model: str
    timeout: int = 120
    max_retries: int = 3
    retry_delay: float = 1.0
    rate_limit_rpm: int = 60  # requests per minute


@dataclass
class ModelResponse:
    """Standardized response format matching local Ollama models."""
    model: str
    variant: str
    got: List[str] = field(default_factory=list)  # tool names called
    latency_ms: float = 0.0
    error: Optional[str] = None
    timeout: bool = False
    content: Optional[str] = None
    raw_response: Optional[Dict] = None


class RateLimiter:
    """Simple token bucket rate limiter."""
    
    def __init__(self, rpm: int):
        self.rpm = rpm
        self.min_interval = 60.0 / rpm
        self.last_request = 0.0
    
    def wait(self):
        """Wait if necessary to respect rate limits."""
        now = time.time()
        elapsed = now - self.last_request
        if elapsed < self.min_interval:
            time.sleep(self.min_interval - elapsed)
        self.last_request = time.time()


class OnlineModelWrapper:
    """
    Unified wrapper for online LLM APIs.
    
    Provides standardized interface matching local Ollama models:
    - call_model_with_timeout() returns same format as phase2_harness.py
    - Handles rate limiting, retries, and error recovery
    """
    
    # Default API configurations
    DEFAULT_CONFIGS = {
        "minimax": {
            "api_base": "https://api.minimax.io/v1",
            "model": "MiniMax-M2.5",
            "timeout": 120,
            "rate_limit_rpm": 60
        },
        "claude": {
            "api_base": "https://api.anthropic.com/v1",
            "model": "claude-sonnet-4-20250514",
            "timeout": 120,
            "rate_limit_rpm": 50
        },
        "claude-haiku": {
            "api_base": "https://api.anthropic.com/v1",
            "model": "claude-3-haiku-20240307",
            "timeout": 60,
            "rate_limit_rpm": 50
        },
        "openrouter": {
            "api_base": "https://openrouter.ai/api/v1",
            "model": "openrouter/auto",
            "timeout": 120,
            "rate_limit_rpm": 60
        }
    }
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize the online model wrapper.
        
        Args:
            config: Optional configuration dict. If not provided, reads from
                   environment variables and DEFAULT_CONFIGS.
        """
        self.configs: Dict[str, APIConfig] = {}
        self.rate_limiters: Dict[str, RateLimiter] = {}
        self._load_configs(config or {})
    
    def _load_configs(self, config: Dict[str, Any]):
        """Load API configurations from config dict or environment."""
        
        # Load Minimax config
        minimax_cfg = config.get("minimax", self.DEFAULT_CONFIGS["minimax"])
        self.configs["minimax"] = APIConfig(
            name="minimax",
            api_base=minimax_cfg.get("api_base", self.DEFAULT_CONFIGS["minimax"]["api_base"]),
            api_key=minimax_cfg.get("api_key") or os.environ.get("MINIMAX_API_KEY", ""),
            model=minimax_cfg.get("model", "MiniMax-M2.5"),
            timeout=minimax_cfg.get("timeout", 120),
            max_retries=minimax_cfg.get("max_retries", 3),
            retry_delay=minimax_cfg.get("retry_delay", 1.0),
            rate_limit_rpm=minimax_cfg.get("rate_limit_rpm", 60)
        )
        
        # Load Claude config
        claude_cfg = config.get("claude", self.DEFAULT_CONFIGS["claude"])
        self.configs["claude"] = APIConfig(
            name="claude",
            api_base=claude_cfg.get("api_base", self.DEFAULT_CONFIGS["claude"]["api_base"]),
            api_key=claude_cfg.get("api_key") or os.environ.get("ANTHROPIC_API_KEY", ""),
            model=claude_cfg.get("model", "claude-sonnet-4-20250514"),
            timeout=claude_cfg.get("timeout", 120),
            max_retries=claude_cfg.get("max_retries", 3),
            retry_delay=claude_cfg.get("retry_delay", 1.0),
            rate_limit_rpm=claude_cfg.get("rate_limit_rpm", 50)
        )
        
        # Initialize rate limiters
        for name, cfg in self.configs.items():
            self.rate_limiters[name] = RateLimiter(cfg.rate_limit_rpm)
    
    def _convert_to_ollama_format(self, messages: List[Dict], tools: Optional[List[Dict]] = None) -> Dict:
        """
        Convert messages and tools to API-specific format.
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            tools: Optional list of tool definitions
            
        Returns:
            Formatted request body for the API
        """
        # Base messages
        formatted = {"messages": messages}
        
        if tools:
            # Convert tools to API format
            formatted["tools"] = tools
        
        return formatted
    
    def _call_minimax(
        self,
        messages: List[Dict],
        tools: Optional[List[Dict]] = None,
        system_prompt: Optional[str] = None,
        temperature: float = 0.0,
        max_tokens: int = 1000
    ) -> ModelResponse:
        """Call Minimax API."""
        cfg = self.configs.get("minimax")
        if not cfg or not cfg.api_key:
            return ModelResponse(
                model="minimax",
                error="Minimax API key not configured"
            )
        
        self.rate_limiters["minimax"].wait()
        
        # Build request
        url = urljoin(cfg.api_base, "/text/chatcompletion_v2")
        
        headers = {
            "Authorization": f"Bearer {cfg.api_key}",
            "Content-Type": "application/json"
        }
        
        # Add system prompt to messages if provided
        all_messages = messages.copy()
        if system_prompt:
            all_messages = [{"role": "system", "content": system_prompt}] + all_messages
        
        payload = {
            "model": cfg.model,
            "messages": all_messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        if tools:
            payload["tools"] = tools
        
        start_time = time.time()
        
        for attempt in range(cfg.max_retries):
            try:
                response = requests.post(
                    url,
                    headers=headers,
                    json=payload,
                    timeout=cfg.timeout
                )
                response.raise_for_status()
                
                data = response.json()
                
                # Parse response
                msg = data.get("choices", [{}])[0].get("message", {})
                content = msg.get("content", "")
                tool_calls = msg.get("tool_calls", []) or []
                got = [tc.get("function", {}).get("name") for tc in tool_calls if tc.get("function")]
                
                return ModelResponse(
                    model=cfg.model,
                    variant="online",
                    got=got,
                    latency_ms=(time.time() - start_time) * 1000,
                    content=content,
                    raw_response=data
                )
                
            except requests.exceptions.Timeout:
                if attempt < cfg.max_retries - 1:
                    wait_time = cfg.retry_delay * (2 ** attempt)
                    logger.warning(f"Minimax timeout, retrying in {wait_time}s...")
                    time.sleep(wait_time)
                else:
                    return ModelResponse(
                        model=cfg.model,
                        error="Timeout",
                        timeout=True,
                        latency_ms=(time.time() - start_time) * 1000
                    )
                    
            except requests.exceptions.RequestException as e:
                if attempt < cfg.max_retries - 1:
                    wait_time = cfg.retry_delay * (2 ** attempt)
                    logger.warning(f"Minimax error: {e}, retrying in {wait_time}s...")
                    time.sleep(wait_time)
                else:
                    return ModelResponse(
                        model=cfg.model,
                        error=str(e)[:100],
                        latency_ms=(time.time() - start_time) * 1000
                    )
        
        return ModelResponse(model=cfg.model, error="Max retries exceeded")
    
    def _call_claude(
        self,
        messages: List[Dict],
        tools: Optional[List[Dict]] = None,
        system_prompt: Optional[str] = None,
        temperature: float = 0.0,
        max_tokens: int = 1000
    ) -> ModelResponse:
        """Call Anthropic Claude API."""
        cfg = self.configs.get("claude")
        if not cfg or not cfg.api_key:
            return ModelResponse(
                model="claude",
                error="Anthropic API key not configured"
            )
        
        self.rate_limiters["claude"].wait()
        
        url = urljoin(cfg.api_base, "/messages")
        
        headers = {
            "x-api-key": cfg.api_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json"
        }
        
        # Build messages (Claude uses top-level system, not in messages)
        all_messages = messages.copy()
        
        # Claude system prompt handling
        if system_prompt:
            payload = {
                "model": cfg.model,
                "max_tokens": max_tokens,
                "system": system_prompt,
                "messages": all_messages
            }
        else:
            payload = {
                "model": cfg.model,
                "max_tokens": max_tokens,
                "messages": all_messages
            }
        
        if tools:
            # Convert tools to Claude format
            payload["tools"] = tools
        
        start_time = time.time()
        
        for attempt in range(cfg.max_retries):
            try:
                response = requests.post(
                    url,
                    headers=headers,
                    json=payload,
                    timeout=cfg.timeout
                )
                response.raise_for_status()
                
                data = response.json()
                
                # Parse response
                content_blocks = data.get("content", [])
                content = ""
                tool_calls = []
                
                for block in content_blocks:
                    if block.get("type") == "text":
                        content += block.get("text", "")
                    elif block.get("type") == "tool_use":
                        tool_calls.append({
                            "function": {
                                "name": block.get("name"),
                                "arguments": block.get("input", {})
                            }
                        })
                
                got = [tc.get("function", {}).get("name") for tc in tool_calls if tc.get("function")]
                
                return ModelResponse(
                    model=cfg.model,
                    variant="online",
                    got=got,
                    latency_ms=(time.time() - start_time) * 1000,
                    content=content,
                    raw_response=data
                )
                
            except requests.exceptions.Timeout:
                if attempt < cfg.max_retries - 1:
                    wait_time = cfg.retry_delay * (2 ** attempt)
                    logger.warning(f"Claude timeout, retrying in {wait_time}s...")
                    time.sleep(wait_time)
                else:
                    return ModelResponse(
                        model=cfg.model,
                        error="Timeout",
                        timeout=True,
                        latency_ms=(time.time() - start_time) * 1000
                    )
                    
            except requests.exceptions.RequestException as e:
                if attempt < cfg.max_retries - 1:
                    wait_time = cfg.retry_delay * (2 ** attempt)
                    logger.warning(f"Claude error: {e}, retrying in {wait_time}s...")
                    time.sleep(wait_time)
                else:
                    return ModelResponse(
                        model=cfg.model,
                        error=str(e)[:100],
                        latency_ms=(time.time() - start_time) * 1000
                    )
        
        return ModelResponse(model=cfg.model, error="Max retries exceeded")
    
    def call_model_with_timeout(
        self,
        model: str,
        messages: List[Dict],
        tools: Optional[List[Dict]] = None,
        system_prompt: Optional[str] = None,
        variant: str = "atomic"
    ) -> ModelResponse:
        """
        Call an online model with standardized response format.
        
        This method provides the same interface as phase2_harness.py's
        call_model_with_timeout() for seamless integration.
        
        Args:
            model: Model identifier (e.g., "minimax/MiniMax-M2.5", "anthropic/claude-sonnet-4")
            messages: List of message dicts with 'role' and 'content'
            tools: Optional list of tool definitions
            system_prompt: Optional system prompt
            variant: Model variant ("atomic" or "extended")
            
        Returns:
            ModelResponse with standardized format matching local models
        """
        # Map model names to wrapper configs
        model_lower = model.lower()
        
        # Determine which API to use based on model name
        if "minimax" in model_lower or "minimax" in model_lower:
            return self._call_minimax(messages, tools, system_prompt)
        elif "claude" in model_lower or "anthropic" in model_lower:
            return self._call_claude(messages, tools, system_prompt)
        else:
            # Default to Minimax for unknown models
            logger.warning(f"Unknown model {model}, defaulting to Minimax")
            return self._call_minimax(messages, tools, system_prompt)
    
    def call_with_fallback(
        self,
        primary_model: str,
        fallback_model: str,
        messages: List[Dict],
        tools: Optional[List[Dict]] = None,
        system_prompt: Optional[str] = None,
        variant: str = "atomic"
    ) -> ModelResponse:
        """
        Call model with automatic fallback on failure.
        
        Args:
            primary_model: Primary model to try first
            fallback_model: Fallback model if primary fails
            messages: Message list
            tools: Optional tool definitions
            system_prompt: Optional system prompt
            variant: Model variant
            
        Returns:
            ModelResponse from primary or fallback model
        """
        # Try primary
        result = self.call_model_with_timeout(
            primary_model, messages, tools, system_prompt, variant
        )
        
        # If successful, return
        if not result.error and not result.timeout:
            return result
        
        logger.warning(f"Primary model {primary_model} failed: {result.error}")
        
        # Try fallback
        result = self.call_model_with_timeout(
            fallback_model, messages, tools, system_prompt, variant
        )
        
        # Mark which tier this came from
        result.error = f"[fallback] {result.error}" if result.error else result.error
        
        return result


def create_online_wrapper(config_path: Optional[str] = None) -> OnlineModelWrapper:
    """
    Factory function to create an OnlineModelWrapper.
    
    Args:
        config_path: Optional path to JSON config file
        
    Returns:
        Configured OnlineModelWrapper instance
    """
    if config_path and os.path.exists(config_path):
        with open(config_path) as f:
            config = json.load(f)
        return OnlineModelWrapper(config)
    
    return OnlineModelWrapper()


# Example usage and testing
if __name__ == "__main__":
    # Test the wrapper
    wrapper = OnlineModelWrapper()
    
    # Test messages
    messages = [
        {"role": "user", "content": "What is 2+2?"}
    ]
    
    print("Online Model Wrapper initialized")
    print(f"Configured APIs: {list(wrapper.configs.keys())}")
    
    # Check if API keys are set
    for name, cfg in wrapper.configs.items():
        status = "✓ configured" if cfg.api_key else "✗ missing API key"
        print(f"  {name}: {status}")
