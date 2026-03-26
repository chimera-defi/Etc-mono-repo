from __future__ import annotations

from dataclasses import dataclass, field
from importlib import resources
from pathlib import Path
from typing import Any

from orbit_pilot.config import load_document
from orbit_pilot.graph import plan_platform
from orbit_pilot.models import LaunchProfile, PlatformRecord, SubmissionDecision


def bundled_default_policy_path() -> str:
    """Path to packaged risk.defaults.yaml (CLI, LangGraph, webhooks)."""
    return str(resources.files("orbit_pilot.bundled").joinpath("risk.defaults.yaml"))


@dataclass
class RiskPolicy:
    tolerance: str = "low"
    allow_browser_fallback: bool = False
    # V1: opt-in Playwright assist for browser_fallback_opt_in (still requires env confirmation at publish time)
    allow_browser_automation: bool = False
    # Optional: allow typing into registry-provided selectors (human still reviews/submits)
    allow_browser_autofill: bool = False
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
        allow_browser_automation=bool(risk.get("allow_browser_automation", False)),
        allow_browser_autofill=bool(risk.get("allow_browser_autofill", False)),
        platform_overrides={k: dict(v) for k, v in (raw.get("platforms") or {}).items()},
    )


def platform_policy_override(record: PlatformRecord, policy: RiskPolicy | None) -> dict[str, Any]:
    if policy is None:
        return {}
    return dict(policy.platform_overrides.get(record.slug, {}))


def is_platform_disabled_by_policy(record: PlatformRecord, policy: RiskPolicy | None) -> bool:
    ov = platform_policy_override(record, policy)
    return ov.get("enabled") is False


def record_for_planning(record: PlatformRecord, policy: RiskPolicy | None) -> PlatformRecord:
    """Registry row with optional policy `platforms.<slug>.mode` (SPEC config contract)."""
    ov = platform_policy_override(record, policy)
    mode = ov.get("mode")
    if mode is None or str(mode).strip() == "":
        return record
    return PlatformRecord(
        name=record.name,
        slug=record.slug,
        category=record.category,
        official_url=record.official_url,
        submit_url=record.submit_url,
        mode=str(mode),
        risk=record.risk,
        priority=record.priority,
        cooldown_seconds=record.cooldown_seconds,
        image_max_width=record.image_max_width,
        image_max_height=record.image_max_height,
        cta_in_body=record.cta_in_body,
        browser_form_selectors=dict(record.browser_form_selectors),
    )


def decide_platform(
    record: PlatformRecord,
    launch: LaunchProfile,
    policy: RiskPolicy | None,
) -> SubmissionDecision:
    """Plan + apply risk policy using effective registry mode (policy override first)."""
    planning = record_for_planning(record, policy)
    return apply_risk_policy(plan_platform(planning, launch), record, policy, planning_record=planning)


def tolerance_allows_risk(tolerance: str, platform_risk: str) -> bool:
    cap = TOLERANCE_MAX.get(tolerance, 2)
    score = RISK_SCORE.get(platform_risk, 3)
    return score <= cap


def apply_risk_policy(
    decision: SubmissionDecision,
    record: PlatformRecord,
    policy: RiskPolicy | None,
    planning_record: PlatformRecord | None = None,
) -> SubmissionDecision:
    """Downgrade or skip when operator policy disallows automation for this risk level."""
    if policy is None:
        return decision

    planning = planning_record or record
    override = policy.platform_overrides.get(record.slug, {})
    if override.get("enabled") is False:
        return SubmissionDecision(
            record.slug,
            "skipped",
            record.risk,
            f"Disabled by policy for platform `{record.slug}`",
        )

    plan_mode = planning.mode.lower().replace("-", "_")
    if plan_mode == "browser_fallback_opt_in":
        if not policy.allow_browser_fallback:
            return SubmissionDecision(
                record.slug,
                "skipped",
                record.risk,
                "browser_fallback_opt_in blocked: allow_browser_fallback is false in policy",
            )
        if policy.allow_browser_automation:
            return SubmissionDecision(
                record.slug,
                "browser_assisted",
                record.risk,
                "browser_fallback_opt_in with policy allow_browser_automation: Playwright assist at publish --execute "
                "(requires ORBIT_ALLOW_BROWSER_AUTOMATION=1 and ORBIT_BROWSER_AUTOMATION_CONFIRM)",
            )
        return SubmissionDecision(
            record.slug,
            "browser_fallback",
            record.risk,
            "High-risk browser path; manual pack only — no automation (enable allow_browser_automation for assist)",
        )

    if decision.mode == "official_api" and not tolerance_allows_risk(policy.tolerance, record.risk):
        return SubmissionDecision(
            record.slug,
            "manual",
            record.risk,
            f"Downgraded to manual: platform risk `{record.risk}` exceeds policy tolerance `{policy.tolerance}`",
        )

    return decision
