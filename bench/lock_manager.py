#!/usr/bin/env python3
"""Stale lock detection and cleanup."""

import os
from pathlib import Path

LOCK_FILE = Path('/tmp/openclaw_bench.lock')

def is_process_alive(pid):
    """Check if process with PID is still running."""
    try:
        os.kill(pid, 0)  # Signal 0 doesn't kill, just checks
        return True
    except (OSError, ProcessLookupError):
        return False

def check_lock_stale():
    """Return True if lock file exists but process is dead."""
    if not LOCK_FILE.exists():
        return False
    
    try:
        pid = int(LOCK_FILE.read_text().strip())
        is_alive = is_process_alive(pid)
        if not is_alive:
            print(f"🔍 Lock PID {pid} not alive - stale lock detected")
        return not is_alive
    except (ValueError, OSError):
        return True  # Unreadable = stale

def clear_stale_lock():
    """Remove lock file if process is dead."""
    if check_lock_stale():
        LOCK_FILE.unlink()
        print(f"🧹 Cleared stale lock")
        return True
    return False

def acquire_lock_safe(timeout=300):
    """Get lock, clearing stale ones first."""
    # Clear stale locks
    clear_stale_lock()
    
    # Get our PID
    my_pid = os.getpid()
    
    # Try to create lock
    if LOCK_FILE.exists():
        raise RuntimeError("Lock held by active process")
    
    # Write our PID to lock
    LOCK_FILE.write_text(str(my_pid))
    print(f"🔒 Lock acquired (PID {my_pid})")
    return my_pid

if __name__ == '__main__':
    my_pid = acquire_lock_safe()
    LOCK_FILE.unlink()
    print("✅ lock_manager.py working")
