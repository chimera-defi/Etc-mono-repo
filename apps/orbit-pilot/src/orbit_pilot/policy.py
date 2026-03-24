from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from orbit_pilot.config import load_document
from orbit_pilot.models import PlatformRecord, SubmissionDecision


@dataclass
class RiskPolicy:
    tolerance: str = "low"
    allow_browser_fallback: bool = False
    platform_overrides: dict[str, dict[str, Any]] = field(default_factory=dict)


RISK_SCORE = {
    "low": 1,
    "low_medium": 2,
    "medium": 3,
    "medium_high": 4,
    "high": 5,
}

TOLERANCE_MAX = {
    "low": 2,
    "medium": 4,
    "high": 5,
}


def load_risk_policy(path: str | Path | None) -> RiskPolicy:
    if path is None:
        return RiskPolicy()
    raw = load_document(path)
    risk = raw.get("risk", {})
    return RiskPolicy(
        tolerance=str(risk.get("tolerance", "low")).lower(),
        allow_browser_fallback=bool(risk.get("allow_browser_fallback", False)),
        platform_overrides={k: dict(v) for k, v in (raw.get("platforms") or {}).items()},
    )


def tolerance_allows_risk(tolerance: str, platform_risk: str) -> bool:
    cap = TOLERANCE_MAX.get(tolerance, 2)
    score = RISK_SCORE.get(platform_risk, 3)
    return score <= cap


def apply_risk_policy(
    decision: SubmissionDecision,
    record: PlatformRecord,
    policy: RiskPolicy | None,
) -> SubmissionDecision:
    """Downgrade or skip when operator policy disallows automation for this risk level."""
    if policy is None:
        return decision

    override = policy.platform_overrides.get(record.slug, {})
    if override.get("enabled") is False:
        return SubmissionDecision(
            record.slug,
            "skipped",
            record.risk,
            f"Disabled by policy for platform `{record.slug}`",
        )

    registry_mode = record.mode.lower().replace("-", "_")
    if registry_mode == "browser_fallback_opt_in":
        if policy.allow_browser_fallback:
            return SubmissionDecision(
                record.slug,
                "browser_fallback",
                record.risk,
                "High-risk browser path; manual pack only — no automation",
            )
        return SubmissionDecision(
            record.slug,
            "skipped",
            record.risk,
            "browser_fallback_opt_in blocked: allow_browser_fallback is false in policy",
        )

    if decision.mode == "official_api" and not tolerance_allows_risk(policy.tolerance, record.risk):
        return SubmissionDecision(
            record.slug,
            "manual",
            record.risk,
            f"Downgraded to manual: platform risk `{record.risk}` exceeds policy tolerance `{policy.tolerance}`",
        )

    return decision
