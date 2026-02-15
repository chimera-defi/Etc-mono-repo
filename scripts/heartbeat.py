#!/usr/bin/env python3
"""Lean heartbeat checker (<20 lines, <10 sec runtime)"""

import subprocess
import sys

def check_service(name):
    """Check if systemd service is active"""
    result = subprocess.run(
        ["systemctl", "is-active", name],
        capture_output=True, text=True
    )
    return result.returncode == 0

def get_resource_status():
    """Quick resource snapshot"""
    mem = subprocess.run(
        ["free", "-h"], capture_output=True, text=True
    ).stdout.split("\n")[1].split()
    ram_used = mem[2]
    
    disk = subprocess.run(
        ["df", "-h", "/"], capture_output=True, text=True
    ).stdout.split("\n")[1].split()
    disk_use_pct = disk[4]
    
    return ram_used, disk_use_pct

def main():
    # Check services
    gateway = check_service("openclaw-gateway")
    takopi = check_service("takopi")
    ollama = check_service("ollama")
    
    # Check resources
    ram, disk = get_resource_status()
    
    # Alert if anything critical
    if not gateway:
        print("⚠️ gateway DOWN")
    if not takopi:
        print("⚠️ takopi DOWN")
    if disk.rstrip("%") > "85":
        print(f"⚠️ disk {disk} (>85%)")
    
    # All good
    if gateway and takopi and disk.rstrip("%") <= "85":
        print("HEARTBEAT_OK")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
