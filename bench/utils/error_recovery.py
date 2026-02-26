#!/usr/bin/env python3
"""
Error Recovery Module for Benchmark Harness

Provides:
1. Timeout handling for long-running benchmarks
2. Retry logic with exponential backoff
3. Graceful degradation: if model fails, try fallback
4. Save partial results on crash
5. Resume interrupted runs
6. Health check: verify Ollama is running before starting
"""

import json
import signal
import subprocess
import time
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Any, Callable, Optional
import sys


# =============================================================================
# Configuration
# =============================================================================

DEFAULT_TIMEOUT_S = 120
DEFAULT_MAX_RETRIES = 3
DEFAULT_BACKOFF_BASE = 2.0  # seconds
DEFAULT_BACKOFF_MAX = 30.0  # seconds
CHECKPOINT_FILE = "checkpoint.json"


# =============================================================================
# Data Classes
# =============================================================================

@dataclass
class RetryConfig:
    """Configuration for retry behavior."""
    max_retries: int = DEFAULT_MAX_RETRIES
    backoff_base: float = DEFAULT_BACKOFF_BASE
    backoff_max: float = DEFAULT_BACKOFF_MAX
    retryable_errors: tuple = (
        "timeout",
        "timed out",
        "connection reset",
        "connection refused",
        "unavailable",
        "broken pipe",
        "ollama service error",
        "model not found",
        "no such file or directory",
    )


@dataclass
class Checkpoint:
    """State checkpoint for resuming interrupted runs."""
    run_id: str = ""
    job_index: int = 0
    prompt_index: int = 0
    completed_prompts: list[str] = field(default_factory=list)
    partial_results: list[dict] = field(default_factory=list)
    last_update: float = field(default_factory=time.time)
    metadata: dict = field(default_factory=dict)


@dataclass
class HealthStatus:
    """Health check result."""
    ollama_running: bool = False
    ollama_version: str = ""
    available_models: list[str] = field(default_factory=list)
    disk_space_ok: bool = False
    memory_ok: bool = False
    healthy: bool = False
    errors: list[str] = field(default_factory=list)


# =============================================================================
# Timeout Handling
# =============================================================================

class TimeoutError(Exception):
    """Raised when an operation times out."""
    pass


class TimeoutHandler:
    """Context manager for timeout handling."""
    
    def __init__(self, timeout_s: int, message: str = "Operation timed out"):
        self.timeout_s = timeout_s
        self.message = message
        self.original_handler: Optional[signal.Handler] = None
    
    def __enter__(self):
        def handler(signum, frame):
            raise TimeoutError(self.message)
        
        if signal.signal(signal.SIGALRM, signal.SIG_DFL) != signal.SIG_DFL:
            self.original_handler = signal.signal(signal.SIGALRM, handler)
        signal.alarm(self.timeout_s)
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        signal.alarm(0)
        if self.original_handler:
            signal.signal(signal.SIGALRM, self.original_handler)
        return False


# =============================================================================
# Retry Logic with Exponential Backoff
# =============================================================================

def retry_with_backoff(
    func: Callable,
    config: Optional[RetryConfig] = None,
    on_retry: Optional[Callable[[Exception, int], None]] = None,
) -> Any:
    """
    Execute a function with exponential backoff retry logic.
    
    Args:
        func: Function to execute
        config: Retry configuration
        on_retry: Optional callback called on each retry (receives exception, attempt number)
    
    Returns:
        Result of successful function execution
    
    Raises:
        The last exception if all retries fail
    """
    if config is None:
        config = RetryConfig()
    
    last_exception = None
    for attempt in range(1, config.max_retries + 1):
        try:
            return func()
        except Exception as e:
            last_exception = e
            error_text = str(e).lower()
            
            # Check if error is retryable
            is_retryable = any(
                err in error_text 
                for err in config.retryable_errors
            )
            
            if not is_retryable and attempt > 1:
                # First failure - might be non-retryable, but try once more
                pass
            elif not is_retryable:
                # Non-retryable error on first attempt
                raise
            
            if attempt == config.max_retries:
                break
            
            # Calculate backoff
            backoff = min(
                config.backoff_base ** (attempt - 1),
                config.backoff_max
            )
            
            if on_retry:
                on_retry(e, attempt)
            
            print(f"[retry] Attempt {attempt} failed: {e}. Retrying in {backoff:.1f}s...", 
                  file=sys.stderr)
            time.sleep(backoff)
    
    raise last_exception


def is_retryable_error(error: str | Exception) -> bool:
    """Check if an error is retryable."""
    text = str(error).lower()
    retryable_tokens = (
        "timeout",
        "timed out",
        "connection reset",
        "connection refused",
        "unavailable",
        "broken pipe",
        "ollama service error",
        "model not found",
        "no such file or directory",
        "context deadline exceeded",
        "stream error",
    )
    return any(token in text for token in retryable_tokens)


# =============================================================================
# Health Check
# =============================================================================

def check_ollama_health() -> HealthStatus:
    """
    Verify Ollama is running and healthy.
    
    Returns:
        HealthStatus with detailed health information
    """
    status = HealthStatus()
    
    # Check Ollama service
    try:
        result = subprocess.run(
            ['ollama', 'list'],
            capture_output=True,
            text=True,
            timeout=10,
        )
        if result.returncode == 0:
            status.ollama_running = True
            # Parse available models
            lines = result.stdout.strip().splitlines()
            for line in lines[1:]:  # Skip header
                if line.strip():
                    model_name = line.split()[0]
                    status.available_models.append(model_name)
    except FileNotFoundError:
        status.errors.append("ollama command not found")
    except subprocess.TimeoutExpired:
        status.errors.append("ollama list timed out")
    except Exception as e:
        status.errors.append(f"ollama check failed: {e}")
    
    # Get Ollama version
    if status.ollama_running:
        try:
            result = subprocess.run(
                ['ollama', '--version'],
                capture_output=True,
                text=True,
                timeout=5,
            )
            if result.returncode == 0:
                status.ollama_version = result.stdout.strip()
        except Exception:
            pass
    
    # Check disk space
    try:
        result = subprocess.run(
            ['df', '-h', '/'],
            capture_output=True,
            text=True,
            timeout=5,
        )
        if result.returncode == 0:
            lines = result.stdout.strip().splitlines()
            if len(lines) >= 2:
                parts = lines[1].split()
                if len(parts) >= 5:
                    avail = parts[3]
                    # Simple check - if we have any space, it's ok for benchmarks
                    status.disk_space_ok = True
    except Exception:
        pass
    
    # Overall health
    status.healthy = status.ollama_running and status.disk_space_ok
    
    return status


def wait_for_ollama(timeout_s: int = 60, check_interval: float = 2.0) -> bool:
    """
    Wait for Ollama to become available.
    
    Args:
        timeout_s: Maximum time to wait
        check_interval: Time between checks
    
    Returns:
        True if Ollama became available, False if timeout
    """
    start = time.time()
    while time.time() - start < timeout_s:
        status = check_ollama_health()
        if status.healthy:
            return True
        time.sleep(check_interval)
    return False


# =============================================================================
# Checkpoint / Resume
# =============================================================================

def load_checkpoint(run_dir: Path) -> Optional[Checkpoint]:
    """
    Load checkpoint from disk if it exists.
    
    Args:
        run_dir: Directory containing the run
    
    Returns:
        Checkpoint if found, None otherwise
    """
    checkpoint_path = run_dir / CHECKPOINT_FILE
    if not checkpoint_path.exists():
        return None
    
    try:
        data = json.loads(checkpoint_path.read_text())
        return Checkpoint(
            run_id=data.get('run_id', ''),
            job_index=data.get('job_index', 0),
            prompt_index=data.get('prompt_index', 0),
            completed_prompts=data.get('completed_prompts', []),
            partial_results=data.get('partial_results', []),
            last_update=data.get('last_update', time.time()),
            metadata=data.get('metadata', {}),
        )
    except Exception as e:
        print(f"[checkpoint] Failed to load checkpoint: {e}", file=sys.stderr)
        return None


def save_checkpoint(run_dir: Path, checkpoint: Checkpoint) -> None:
    """
    Save checkpoint to disk.
    
    Args:
        run_dir: Directory containing the run
        checkpoint: Checkpoint data to save
    """
    checkpoint_path = run_dir / CHECKPOINT_FILE
    checkpoint.last_update = time.time()
    
    try:
        checkpoint_path.write_text(json.dumps(asdict(checkpoint), indent=2))
    except Exception as e:
        print(f"[checkpoint] Failed to save checkpoint: {e}", file=sys.stderr)


def clear_checkpoint(run_dir: Path) -> None:
    """Remove checkpoint file when run completes."""
    checkpoint_path = run_dir / CHECKPOINT_FILE
    if checkpoint_path.exists():
        checkpoint_path.unlink()


# =============================================================================
# Graceful Degradation / Fallback
# =============================================================================

FALLBACK_MODELS = {
    'lfm2.5-thinking:1.2b': ['glm-4.7-flash:latest', 'qwen3.5:35b', 'qwen2.5:3b'],
    'glm-4.7-flash:latest': ['lfm2.5-thinking:1.2b', 'qwen3.5:35b', 'qwen2.5:3b'],
    'qwen3.5:35b': ['glm-4.7-flash:latest', 'lfm2.5-thinking:1.2b'],
    'lfm2.5:latest': ['glm-4.7-flash:latest', 'qwen2.5:3b'],
    'qwen2.5:3b': ['glm-4.7-flash:latest', 'mistral:7b'],
    'ministral-3:latest': ['glm-4.7-flash:latest', 'mistral:7b'],
    'mistral:7b': ['glm-4.7-flash:latest'],
    'llama3.2:3b': [],
}


def get_fallback_model(model: str) -> Optional[str]:
    """
    Get a fallback model if the primary model fails.
    
    Args:
        model: The primary model that failed
    
    Returns:
        Fallback model name or None if no fallback available
    """
    return FALLBACK_MODELS.get(model, [])


def find_available_model(preferred: str, available: list[str]) -> Optional[str]:
    """
    Find the best available model from a list.
    
    Args:
        preferred: Preferred model name
        available: List of available model names
    
    Returns:
        Available model that matches or None
    """
    # Exact match
    if preferred in available:
        return preferred
    
    # Partial match (e.g., "lfm2.5" matches "lfm2.5:latest")
    preferred_base = preferred.split(':')[0]
    for model in available:
        if model.startswith(preferred_base):
            return model
    
    return None


# =============================================================================
# Partial Results
# =============================================================================

def save_partial_results(run_dir: Path, results: list[dict]) -> None:
    """
    Save partial results to allow recovery on crash.
    
    Args:
        run_dir: Directory containing the run
        results: List of result dictionaries
    """
    partial_path = run_dir / 'partial_results.json'
    try:
        partial_path.write_text(json.dumps(results, indent=2))
    except Exception as e:
        print(f"[partial] Failed to save partial results: {e}", file=sys.stderr)


def load_partial_results(run_dir: Path) -> list[dict]:
    """
    Load partial results from a previous run.
    
    Args:
        run_dir: Directory containing the run
    
    Returns:
        List of partial results
    """
    partial_path = run_dir / 'partial_results.json'
    if not partial_path.exists():
        return []
    
    try:
        return json.loads(partial_path.read_text())
    except Exception:
        return []


# =============================================================================
# Crash Recovery
# =============================================================================

def register_crash_handler(run_dir: Path, checkpoint: Checkpoint) -> None:
    """
    Register signal handlers for crash recovery.
    
    Args:
        run_dir: Directory containing the run
        checkpoint: Current checkpoint state
    """
    def handler(signum, frame):
        print(f"\n[crash] Caught signal {signum}, saving checkpoint...", 
              file=sys.stderr)
        save_checkpoint(run_dir, checkpoint)
        save_partial_results(run_dir, checkpoint.partial_results)
        sys.exit(1)
    
    signal.signal(signal.SIGINT, handler)
    signal.signal(signal.SIGTERM, handler)


# =============================================================================
# Utility Functions
# =============================================================================

def format_health_status(status: HealthStatus) -> str:
    """Format health status for display."""
    lines = [
        f"Ollama: {'✓' if status.ollama_running else '✗'} ({status.ollama_version})",
        f"Disk: {'✓' if status.disk_space_ok else '✗'}",
        f"Models: {', '.join(status.available_models[:5])}{'...' if len(status.available_models) > 5 else ''}",
    ]
    if status.errors:
        lines.append(f"Errors: {', '.join(status.errors)}")
    lines.append(f"Overall: {'HEALTHY' if status.healthy else 'UNHEALTHY'}")
    return '\n'.join(lines)


# =============================================================================
# CLI Helper
# =============================================================================

def add_resume_parser(parser: Any) -> None:
    """Add --resume argument to an argument parser."""
    parser.add_argument(
        '--resume',
        type=str,
        default='',
        help='Resume an interrupted run from the specified run directory'
    )


def get_resume_info(run_dir: Path) -> Optional[dict]:
    """
    Get information about a run that can be resumed.
    
    Args:
        run_dir: Path to the run directory
    
    Returns:
        Dictionary with run info or None if not resumable
    """
    checkpoint = load_checkpoint(run_dir)
    if not checkpoint:
        return None
    
    manifest_path = run_dir / 'manifest.json'
    if not manifest_path.exists():
        return None
    
    try:
        manifest = json.loads(manifest_path.read_text())
        return {
            'run_id': checkpoint.run_id,
            'job_index': checkpoint.job_index,
            'prompt_index': checkpoint.prompt_index,
            'completed_prompts': checkpoint.completed_prompts,
            'manifest': manifest,
        }
    except Exception:
        return None


if __name__ == '__main__':
    # Quick health check when run directly
    status = check_ollama_health()
    print(format_health_status(status))
    sys.exit(0 if status.healthy else 1)
