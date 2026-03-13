#!/usr/bin/env python3
"""
Weather API client — check current conditions and forecasts.

Non-canonical utility/demo script kept for convenience. It is not part of the
benchmark execution path and currently has no in-repo callers.

No API key required (uses wttr.in + Open-Meteo).

Usage:
  python weather_check.py Berlin
  python weather_check.py "New York" --format json
  python weather_check.py Amsterdam --forecast
"""

import json
import argparse
import requests
from datetime import datetime
from typing import Optional, Dict, Any


class WeatherClient:
    """Multi-backend weather client (wttr.in + Open-Meteo)."""
    
    WTTR_BASE = "https://wttr.in"
    METEO_BASE = "https://api.open-meteo.com/v1/forecast"
    
    def __init__(self, timeout: int = 10):
        self.timeout = timeout
    
    def get_wttr(self, city: str, format_code: str = "3") -> str:
        """Get weather from wttr.in (simple format).
        
        format_code:
          "3" = one-liner (default)
          "0" = detailed
          "j1" = JSON
          "v2" = extended forecast
        """
        try:
            url = f"{self.WTTR_BASE}/{city}?format={format_code}"
            resp = requests.get(url, timeout=self.timeout)
            resp.raise_for_status()
            return resp.text.strip()
        except requests.RequestException as e:
            return f"Error fetching weather: {e}"
    
    def get_meteo(self, city: str, latitude: Optional[float] = None, 
                   longitude: Optional[float] = None) -> Dict[str, Any]:
        """Get weather from Open-Meteo (requires lat/lon).
        
        For this demo, we'll use approximate coordinates for major cities.
        """
        # Common city coordinates (you'd replace with geocoding API for prod)
        CITIES = {
            "berlin": (52.52, 13.40),
            "amsterdam": (52.37, 4.89),
            "brussels": (50.85, 4.35),
            "antwerp": (51.22, 4.40),
            "london": (51.51, -0.13),
            "paris": (48.86, 2.35),
            "new york": (40.71, -74.01),
        }
        
        lat, lon = latitude, longitude
        if not (lat and lon):
            key = city.lower()
            if key not in CITIES:
                return {"error": f"City '{city}' coordinates not found"}
            lat, lon = CITIES[key]
        
        try:
            params = {
                "latitude": lat,
                "longitude": lon,
                "current": "temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m",
                "forecast_days": 1,
            }
            resp = requests.get(self.METEO_BASE, params=params, timeout=self.timeout)
            resp.raise_for_status()
            return resp.json()
        except requests.RequestException as e:
            return {"error": str(e)}
    
    def parse_meteo(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Parse Open-Meteo JSON into readable format."""
        if "error" in data:
            return data
        
        current = data.get("current", {})
        return {
            "source": "open-meteo",
            "temperature_c": current.get("temperature_2m"),
            "wind_speed_kmh": current.get("wind_speed_10m"),
            "humidity_percent": current.get("relative_humidity_2m"),
            "timestamp": current.get("time"),
        }


def main():
    parser = argparse.ArgumentParser(description="Check weather for any city")
    parser.add_argument("city", help="City name (e.g., Berlin, Amsterdam)")
    parser.add_argument("--format", choices=["simple", "json", "meteo"], default="simple",
                        help="Output format")
    parser.add_argument("--forecast", action="store_true", help="Show extended forecast")
    
    args = parser.parse_args()
    
    client = WeatherClient()
    
    if args.format == "meteo":
        # Use Open-Meteo backend
        data = client.get_meteo(args.city)
        parsed = client.parse_meteo(data)
        print(json.dumps(parsed, indent=2))
    
    elif args.format == "json":
        # Get JSON from wttr.in
        result = client.get_wttr(args.city, format_code="j1")
        try:
            data = json.loads(result)
            print(json.dumps(data, indent=2))
        except json.JSONDecodeError:
            print(result)
    
    else:
        # Simple one-liner (default)
        if args.forecast:
            result = client.get_wttr(args.city, format_code="v2")
        else:
            result = client.get_wttr(args.city, format_code="3")
        print(result)


if __name__ == "__main__":
    main()
