#!/usr/bin/env python3
"""
Social handle availability checker for Aztec liquid staking protocol names.
Uses web search to check availability on various platforms.
"""

import urllib.request
import urllib.error
import json
import sys

# Top 5 candidate names
NAMES = [
    "aztecyield",
    "quetzalstake",
    "ollinstake",
    "cenotestake",
    "aztecflow"
]

def check_url(url):
    """Check if URL exists (returns 200)"""
    try:
        req = urllib.request.Request(url)
        req.add_header('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
        with urllib.request.urlopen(req, timeout=10) as response:
            return response.getcode() == 200
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return False  # Not found = available
        return True  # Other error = might be taken
    except Exception:
        return None  # Unknown

def check_github(name):
    """Check GitHub organization/user availability"""
    url = f"https://github.com/{name}"
    result = check_url(url)
    if result is False:
        return "✅ AVAILABLE"
    elif result is True:
        return "❌ TAKEN"
    else:
        return "🔍 UNKNOWN"

def check_twitter(name):
    """Check Twitter/X handle availability"""
    # Twitter/X doesn't have a public API for this easily
    # We'll provide URLs to check manually
    return f"https://twitter.com/{name}"

def main():
    print("Social Handle Availability Check")
    print("=" * 80)
    print("\nChecking GitHub organizations/users...")
    print("-" * 80)
    
    results = {}
    
    for name in NAMES:
        print(f"\n{name.upper()}:")
        github_status = check_github(name)
        print(f"  GitHub: {github_status}")
        
        # Also check with -protocol suffix
        github_protocol = check_github(f"{name}-protocol")
        print(f"  GitHub (-protocol): {github_protocol}")
        
        results[name] = {
            "github": github_status,
            "github_protocol": github_protocol,
            "twitter_url": check_twitter(name)
        }
    
    print("\n" + "=" * 80)
    print("\nTwitter/X Handles to Check Manually:")
    print("-" * 80)
    for name in NAMES:
        print(f"\n{name.upper()}:")
        print(f"  Primary: {results[name]['twitter_url']}")
        print(f"  Protocol: https://twitter.com/{name}protocol")
        print(f"  Finance: https://twitter.com/{name}fi")
    
    print("\n" + "=" * 80)
    print("\nDiscord Server Names to Check:")
    print("-" * 80)
    for name in NAMES:
        print(f"  - {name}")
        print(f"  - {name}-protocol")
        print(f"  - {name}-staking")
    
    print("\n" + "=" * 80)
    print("\nTelegram Usernames to Check:")
    print("-" * 80)
    for name in NAMES:
        print(f"  - @{name}")
        print(f"  - @{name}_protocol")
        print(f"  - @{name}_staking")
    
    # Summary
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    
    available_github = []
    for name, data in results.items():
        if "AVAILABLE" in data["github"]:
            available_github.append(name)
    
    print(f"\nNames with available GitHub handles: {len(available_github)}")
    for name in available_github:
        print(f"  ✅ {name}")
    
    print("\nNote: Twitter/X, Discord, and Telegram require manual verification.")
    print("Visit the URLs provided above to check availability.")

if __name__ == "__main__":
    main()
