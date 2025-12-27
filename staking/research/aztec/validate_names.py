#!/usr/bin/env python3
"""
Name validation script for Aztec liquid staking protocol.
Checks domain availability and provides validation results.
"""

import socket
import sys

# Top 20 candidate names
NAMES = [
    "quetzal",
    "ollin",
    "cenote",
    "aztlan",
    "azteca",
    "aztecflow",
    "aztecyield",
    "aztecstream",
    "aztecfi",
    "aztecprime",
    "tonal",
    "nahui",
    "xiuh",
    "tenoch",
    "meso",
    "quetzalstake",
    "ollinstake",
    "cenotestake",
    "aztlanstake",
    "aztecastake",
]

TLDS = [".com", ".xyz", ".io"]

def check_domain(domain):
    """Check if domain resolves (taken) or not (potentially available)"""
    try:
        socket.gethostbyname(domain)
        return "TAKEN"
    except socket.gaierror:
        return "AVAILABLE"
    except Exception:
        return "UNKNOWN"

def main():
    print("Name Validation Results\n")
    print("=" * 80)
    print(f"{'Name':<20} {'Domain .com':<15} {'Domain .xyz':<15} {'Domain .io':<15}")
    print("=" * 80)
    
    results = []
    
    for name in NAMES:
        row = {"name": name, "domains": {}}
        
        for tld in TLDS:
            domain = f"{name}{tld}"
            status = check_domain(domain)
            row["domains"][tld] = status
            print(f"{name:<20} {status:<15}", end="")
        
        print()
        results.append(row)
    
    print("\n" + "=" * 80)
    print("\nNote: 'AVAILABLE' means domain doesn't resolve, but may still be")
    print("registered. 'TAKEN' means domain resolves. Verify availability")
    print("through registrar (Namecheap, GoDaddy, etc.) before purchase.")
    
    # Summary
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    
    available_names = []
    for row in results:
        available_count = sum(1 for status in row["domains"].values() if status == "AVAILABLE")
        if available_count >= 2:  # At least 2 TLDs available
            available_names.append(row["name"])
    
    print(f"\nNames with 2+ available TLDs: {len(available_names)}")
    for name in available_names:
        print(f"  - {name}")

if __name__ == "__main__":
    main()
