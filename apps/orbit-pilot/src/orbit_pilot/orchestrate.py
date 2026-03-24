"""LangGraph orchestration over plan → policy → summarize (full-buildout slice).

Run graph programmatically; CLI remains the primary operator surface.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, TypedDict

from langgraph.graph import END, StateGraph

from orbit_pilot.config import load_document
from orbit_pilot.models import LaunchProfile, PlatformRecord
from orbit_pilot.policy import RiskPolicy, decide_platform, load_risk_policy
from orbit_pilot.registry import load_platforms


class OrbitPlanState(TypedDict, total=False):
    launch_path: str
    platforms_path: str
    policy_path: str | None
    launch: LaunchProfile
    platforms: list[PlatformRecord]
    policy: RiskPolicy | None
    preview: list[dict[str, Any]]
    error: str


def _load_launch_dict(raw: dict[str, Any], base: Path) -> LaunchProfile:
    path = Path(base)
    assets = raw.get("assets", {})
    logo = assets.get("logo")
    if logo:
        assets["logo"] = str((path.parent / logo).resolve())
    screenshots = [str((path.parent / item).resolve()) for item in assets.get("screenshots", [])]
    if screenshots:
        assets["screenshots"] = screenshots
    return LaunchProfile(
        product_name=raw.get("product_name", ""),
        website_url=raw.get("website_url", ""),
        tagline=raw.get("tagline", ""),
        summary=raw.get("summary", ""),
        descriptions=raw.get("descriptions", {}),
        features=raw.get("features", []),
        assets=assets,
        company=raw.get("company", {}),
        publish=raw.get("publish", {}),
    )


def node_load_inputs(state: OrbitPlanState) -> OrbitPlanState:
    try:
        launch_path = Path(state["launch_path"])
        raw = load_document(launch_path)
        launch = _load_launch_dict(raw, launch_path)
        platforms = load_platforms(state["platforms_path"])
        policy = load_risk_policy(state.get("policy_path"))
    except Exception as exc:  # pragma: no cover - surfaced to caller
        return {**state, "error": str(exc)}
    return {**state, "launch": launch, "platforms": platforms, "policy": policy}


def node_apply_plan(state: OrbitPlanState) -> OrbitPlanState:
    if "error" in state:
        return state
    launch = state["launch"]
    platforms = state["platforms"]
    policy = state.get("policy")
    preview: list[dict[str, Any]] = []
    for record in platforms:
        d = decide_platform(record, launch, policy)
        preview.append(
            {
                "slug": record.slug,
                "planned_mode": d.mode,
                "risk": d.risk_level,
                "reason": d.reason,
            }
        )
    return {**state, "preview": preview}


def node_finalize(state: OrbitPlanState) -> OrbitPlanState:
    return state


def build_plan_graph():
    g = StateGraph(OrbitPlanState)
    g.add_node("load_inputs", node_load_inputs)
    g.add_node("apply_plan", node_apply_plan)
    g.add_node("finalize", node_finalize)
    g.set_entry_point("load_inputs")
    g.add_edge("load_inputs", "apply_plan")
    g.add_edge("apply_plan", "finalize")
    g.add_edge("finalize", END)
    return g.compile()


def run_plan_graph(
    launch_path: str,
    platforms_path: str,
    policy_path: str | None = None,
) -> OrbitPlanState:
    graph = build_plan_graph()
    return graph.invoke(
        {
            "launch_path": launch_path,
            "platforms_path": platforms_path,
            "policy_path": policy_path,
        }
    )
