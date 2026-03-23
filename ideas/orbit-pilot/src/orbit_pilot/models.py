from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Literal

Mode = Literal["official_api", "manual", "browser_fallback_opt_in", "skipped"]


@dataclass
class LaunchProfile:
    product_name: str
    website_url: str
    tagline: str
    summary: str
    descriptions: dict[str, str] = field(default_factory=dict)
    features: list[str] = field(default_factory=list)
    assets: dict[str, Any] = field(default_factory=dict)
    company: dict[str, Any] = field(default_factory=dict)


@dataclass
class PlatformRecord:
    name: str
    slug: str
    category: str
    official_url: str
    submit_url: str
    mode: str
    risk: str


@dataclass
class SubmissionDecision:
    platform: str
    mode: Mode
    risk_level: str
    reason: str
    payload: dict[str, Any] | None = None
    result: dict[str, Any] | None = None


REQUIRED_LAUNCH_FIELDS = ("product_name", "website_url", "tagline", "summary")
