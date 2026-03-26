from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Literal

Mode = Literal[
    "official_api",
    "manual",
    "browser_fallback_opt_in",
    "skipped",
    "browser_fallback",
    "browser_assisted",
]


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
    publish: dict[str, Any] = field(default_factory=dict)
    # default_include_link: if false, omit primary URL from generated bodies (per-platform override in registry)
    cta_policy: dict[str, Any] = field(default_factory=dict)


@dataclass
class PlatformRecord:
    name: str
    slug: str
    category: str
    official_url: str
    submit_url: str
    mode: str
    risk: str
    priority: int = 50
    cooldown_seconds: int = 3600
    image_max_width: int | None = None
    image_max_height: int | None = None
    cta_in_body: bool = True
    # Optional Playwright autofill (CSS selectors); only used if policy + env allow
    browser_form_selectors: dict[str, str] = field(default_factory=dict)


@dataclass
class Campaign:
    id: str
    name: str
    created_at: str


@dataclass
class SubmissionDecision:
    platform: str
    mode: Mode
    risk_level: str
    reason: str
    payload: dict[str, Any] | None = None
    result: dict[str, Any] | None = None


REQUIRED_LAUNCH_FIELDS = ("product_name", "website_url", "tagline", "summary")
