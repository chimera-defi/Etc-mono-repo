"""LangGraph orchestration over plan → policy → summarize (full-buildout slice).

Run graph programmatically; CLI remains the primary operator surface.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, TypedDict

from langgraph.graph import END, StateGraph

from orbit_pilot.config import load_document
from orbit_pilot.models import LaunchProfile, PlatformRecord
from orbit_pilot.policy import RiskPolicy, bundled_default_policy_path, decide_platform, load_risk_policy
from orbit_pilot.profile_loader import profile_from_parsed_yaml
from orbit_pilot.registry import load_platforms
from orbit_pilot.services.campaigns import build_campaign, create_run_dir, write_run_manifest
from orbit_pilot.services.generation import generate_run


class OrbitPlanState(TypedDict, total=False):
    launch_path: str
    platforms_path: str
    policy_path: str | None
    launch: LaunchProfile
    platforms: list[PlatformRecord]
    policy: RiskPolicy | None
    preview: list[dict[str, Any]]
    error: str


def node_load_inputs(state: OrbitPlanState) -> OrbitPlanState:
    try:
        launch_path = Path(state["launch_path"])
        raw = load_document(launch_path)
        launch = profile_from_parsed_yaml(raw, launch_path)
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


class OrbitGenerateState(TypedDict, total=False):
    launch_path: str
    platforms_path: str
    policy_path: str | None
    resolved_policy_path: str
    out: str
    campaign_name: str | None
    launch: LaunchProfile
    platforms: list[PlatformRecord]
    policy: RiskPolicy | None
    run_dir: str
    generate_results: list[dict[str, Any]]
    error: str


def node_gen_load(state: OrbitGenerateState) -> OrbitGenerateState:
    try:
        launch_path = Path(state["launch_path"])
        raw = load_document(launch_path)
        launch = profile_from_parsed_yaml(raw, launch_path)
        platforms = load_platforms(state["platforms_path"])
        resolved = state.get("policy_path") or bundled_default_policy_path()
        policy = load_risk_policy(resolved)
    except Exception as exc:  # pragma: no cover
        return {**state, "error": str(exc)}
    return {**state, "launch": launch, "platforms": platforms, "policy": policy, "resolved_policy_path": resolved}


def node_gen_write_run(state: OrbitGenerateState) -> OrbitGenerateState:
    if "error" in state:
        return state
    launch = state["launch"]
    out = state.get("out", "out")
    campaign = build_campaign(launch, explicit_name=state.get("campaign_name"))
    run_dir = create_run_dir(out, campaign)
    lp = str(Path(state["launch_path"]).resolve())
    pp = str(Path(state["platforms_path"]).resolve())
    write_run_manifest(run_dir, campaign, lp, pp, policy_path=state["resolved_policy_path"])
    return {**state, "run_dir": str(run_dir)}


def node_gen_generate(state: OrbitGenerateState) -> OrbitGenerateState:
    if "error" in state:
        return state
    run_dir = Path(state["run_dir"])
    results = generate_run(state["launch"], state["platforms"], run_dir, policy=state.get("policy"))
    return {**state, "generate_results": results}


def node_gen_finalize(state: OrbitGenerateState) -> OrbitGenerateState:
    return state


def build_generate_graph():
    g = StateGraph(OrbitGenerateState)
    g.add_node("load", node_gen_load)
    g.add_node("write_run", node_gen_write_run)
    g.add_node("generate", node_gen_generate)
    g.add_node("finalize", node_gen_finalize)
    g.set_entry_point("load")
    g.add_edge("load", "write_run")
    g.add_edge("write_run", "generate")
    g.add_edge("generate", "finalize")
    g.add_edge("finalize", END)
    return g.compile()


def run_generate_graph(
    launch_path: str,
    platforms_path: str,
    out: str = "out",
    policy_path: str | None = None,
    campaign_name: str | None = None,
) -> OrbitGenerateState:
    return build_generate_graph().invoke(
        {
            "launch_path": launch_path,
            "platforms_path": platforms_path,
            "policy_path": policy_path,
            "out": out,
            "campaign_name": campaign_name,
        }
    )
