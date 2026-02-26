#!/usr/bin/env python3
"""
Result Cache for Benchmark Harness
Caches benchmark results to avoid re-running identical prompts.
"""

import json
import hashlib
import time
from pathlib import Path
from typing import Optional, Dict, Any, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime


# =============================================================================
# CONFIGURATION
# =============================================================================

CACHE_DIR = Path("/root/.openclaw/workspace/bench/.cache")
CONFIG_PATH = Path("/root/.openclaw/workspace/bench/config/phase2_config.json")
SUITE_PATH = Path("/root/.openclaw/workspace/bench/config/extended_benchmark_suite.json")

# Ensure cache directory exists
CACHE_DIR.mkdir(parents=True, exist_ok=True)


# =============================================================================
# DATA MODELS
# =============================================================================

@dataclass
class CacheStats:
    """Cache statistics"""
    hits: int = 0
    misses: int = 0
    saves: int = 0
    
    @property
    def total(self) -> int:
        return self.hits + self.misses
    
    @property
    def hit_rate(self) -> float:
        return self.hits / self.total if self.total > 0 else 0.0
    
    @property
    def savings_seconds(self) -> float:
        return self.saves


# =============================================================================
# HASHING
# =============================================================================

def compute_config_hash() -> str:
    """Compute hash of config files to detect changes"""
    hashes = []
    
    for path in [CONFIG_PATH, SUITE_PATH]:
        if path.exists():
            content = path.read_text()
            h = hashlib.sha256(content.encode()).hexdigest()[:16]
            hashes.append(f"{path.name}={h}")
    
    return "|".join(hashes)


def compute_prompt_hash(prompts: list) -> str:
    """Compute hash of prompt list for cache key"""
    # Sort to ensure consistent ordering
    prompt_str = json.dumps(prompts, sort_keys=True)
    return hashlib.sha256(prompt_str.encode()).hexdigest()[:16]


def compute_result_hash(model: str, phase: str, variant: str, prompt_hash: str) -> str:
    """Compute cache key for a benchmark run"""
    key = f"{model}|{phase}|{variant}|{prompt_hash}"
    return hashlib.sha256(key.encode()).hexdigest()


# =============================================================================
# CACHE FUNCTIONS
# =============================================================================

class ResultCache:
    """File-based cache for benchmark results"""
    
    def __init__(self, cache_dir: Path = CACHE_DIR):
        self.cache_dir = cache_dir
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.stats = CacheStats()
        self._config_hash = None
    
    def _get_cache_path(self, cache_key: str) -> Path:
        """Get path for cache file"""
        return self.cache_dir / f"{cache_key}.json"
    
    def _load_cache_entry(self, cache_key: str) -> Optional[Dict]:
        """Load a cache entry if it exists and is valid"""
        cache_path = self._get_cache_path(cache_key)
        if not cache_path.exists():
            return None
        
        try:
            data = json.loads(cache_path.read_text())
            
            # Validate config hash hasn't changed
            if data.get("config_hash") != self._config_hash:
                # Config changed, invalidate this entry
                cache_path.unlink()
                return None
            
            return data
        except (json.JSONDecodeError, OSError):
            return None
    
    def _save_cache_entry(self, cache_key: str, result_data: Dict) -> None:
        """Save result to cache"""
        cache_path = self._get_cache_path(cache_key)
        
        # Add metadata
        result_data["cached_at"] = time.time()
        result_data["config_hash"] = self._config_hash
        
        cache_path.write_text(json.dumps(result_data, indent=2))
    
    def check(
        self,
        model: str,
        phase: str,
        variant: str,
        prompts: list
    ) -> Tuple[bool, Optional[Dict], float]:
        """
        Check if cached result exists.
        
        Returns:
            (is_cached, cached_result, time_saved_seconds)
        """
        # Load config hash
        self._config_hash = compute_config_hash()
        
        # Compute hashes
        prompt_hash = compute_prompt_hash(prompts)
        result_hash = compute_result_hash(model, phase, variant, prompt_hash)
        
        # Check cache
        cached = self._load_cache_entry(result_hash)
        
        if cached is not None:
            self.stats.hits += 1
            # Estimate time saved (sum of latencies in cached result)
            time_saved = sum(
                r.get("latency_ms", 0) for r in cached.get("results", [])
            ) / 1000.0  # Convert to seconds
            self.stats.saves += time_saved
            print(f"💨 Cache HIT! Loading cached result ({time_saved:.1f}s saved)")
            return True, cached, time_saved
        
        self.stats.misses += 1
        print(f"🔄 Cache MISS. Running benchmark...")
        return False, None, 0.0
    
    def save(self, model: str, phase: str, variant: str, prompts: list, result: Dict) -> None:
        """Save benchmark result to cache"""
        # Ensure config hash is set
        if self._config_hash is None:
            self._config_hash = compute_config_hash()
        
        # Compute hashes
        prompt_hash = compute_prompt_hash(prompts)
        result_hash = compute_result_hash(model, phase, variant, prompt_hash)
        
        # Create cacheable result
        cache_data = {
            "model": model,
            "phase": phase,
            "variant": variant,
            "prompt_hash": prompt_hash,
            "summary": result.get("summary", {}),
            "results": result.get("results", []),
            "failed_prompts": result.get("failed_prompts", []),
            "by_category": result.get("by_category"),
        }
        
        self._save_cache_entry(result_hash, cache_data)
        print(f"💾 Cached result for {model}/{phase}/{variant}")
    
    def print_stats(self) -> None:
        """Print cache statistics"""
        total = self.stats.total
        hit_rate = self.stats.hit_rate * 100
        
        print(f"""
╔════════════════════════════════════════════════════════════════════════════╗
║ CACHE STATISTICS                                                           ║
╠════════════════════════════════════════════════════════════════════════════╣
║ Hits:        {self.stats.hits:>5d}                                                     ║
║ Misses:      {self.stats.misses:>5d}                                                     ║
║ Hit Rate:    {hit_rate:>5.1f}%                                                   ║
║ Time Saved:  {self.stats.savings_seconds:>5.1f}s                                                   ║
╚════════════════════════════════════════════════════════════════════════════╝
""")
    
    def clear(self) -> None:
        """Clear all cache entries"""
        count = 0
        for f in self.cache_dir.glob("*.json"):
            f.unlink()
            count += 1
        print(f"🗑️  Cleared {count} cache entries")


# =============================================================================
# CLI INTEGRATION
# =============================================================================

def get_prompts_for_phase(phase: str) -> list:
    """Get the prompts list for a given phase (for hashing)"""
    if phase == "atomic":
        # P1-P12 prompts
        return [
            ("P1", "What's the weather in Antwerp?", ["get_weather"]),
            ("P2", "Search for all Python files in the project.", ["search_files"]),
            ("P3", "Schedule a meeting with John at 3 PM tomorrow.", ["schedule_meeting"]),
            ("P4", "I'm heading to Brussels tomorrow, anything I should know?", ["get_weather"]),
            ("P5", "What tools do you have access to?", []),
            ("P6", "What's the weather in the city where we have our next sprint review?", []),
            ("P7", "Next Tuesday at 2pm, I need a meeting about Q1 planning and weather for outdoor venue.", ["schedule_meeting"]),
            ("P8", "Search for budget files and tell me weather in Amsterdam.", ["search_files", "get_weather"]),
            ("P9", "Can you write a Python script that checks the weather using an API?", []),
            ("P10", "I have meeting with client in Bruges next Thursday. Take train or cycle?", ["get_weather"]),
            ("P11", "Don't check weather in Antwerp, find quarterly report.", ["search_files"]),
            ("P12", "Weather is 8°C and rainy. Can you schedule a meeting with John tomorrow at 2pm?", ["schedule_meeting"]),
        ]
    elif phase == "extended":
        # Load from extended suite
        if SUITE_PATH.exists():
            suite = json.loads(SUITE_PATH.read_text())
            prompts = []
            for category, items in suite.items():
                for item in items:
                    prompts.append((item["id"], item["turns"], item["expected"]))
            return prompts
    return []


# Singleton instance
_cache: Optional[ResultCache] = None

def get_cache() -> ResultCache:
    """Get or create the cache instance"""
    global _cache
    if _cache is None:
        _cache = ResultCache()
    return _cache
