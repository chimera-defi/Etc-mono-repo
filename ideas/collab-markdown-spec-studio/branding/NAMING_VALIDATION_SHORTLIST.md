# Naming Validation Report

- Generated (UTC): 2026-04-08T11:40:17+00:00
- Methodology: `2026-04-idea-strict-naming-v1`
- Hard constraint: `<= 2` semantic words (including fused compounds)
- Domain checks: `.com`, `.org`, `.net`, `.xyz`, `.finance` via RDAP

## Summary

- Clear: **1**
- Watch: **14**
- Reject: **1**

## Ranked Candidates

| Rank | Name | Score | Decision | Avail | Taken | Unknown | Notes |
|------|------|-------|----------|-------|-------|---------|-------|
| 1 | `ScopeSpec` | 91 | clear | 3 | 1 | 1 | - |
| 2 | `SpecScope` | 86 | watch | 2 | 0 | 3 | - |
| 3 | `BuildSpec` | 83 | watch | 1 | 1 | 3 | - |
| 4 | `PlanSpec` | 82 | watch | 1 | 1 | 3 | - |
| 5 | `TaskSpec` | 82 | watch | 1 | 0 | 4 | - |
| 6 | `FrameSpec` | 77 | watch | 1 | 0 | 4 | - |
| 7 | `PilotSpec` | 77 | watch | 0 | 0 | 5 | - |
| 8 | `SpecBridge` | 77 | watch | 1 | 1 | 3 | - |
| 9 | `SpecFrame` | 77 | watch | 0 | 0 | 5 | - |
| 10 | `SpecPilot` | 77 | watch | 0 | 1 | 4 | - |
| 11 | `SpecTrack` | 77 | watch | 0 | 0 | 5 | - |
| 12 | `FlowSpec` | 76 | watch | 0 | 1 | 4 | - |
| 13 | `SpecGrid` | 76 | watch | 0 | 0 | 5 | - |
| 14 | `SpecLoom` | 70 | watch | 0 | 0 | 5 | - |
| 15 | `SpecPath` | 70 | watch | 0 | 0 | 5 | - |
| 16 | `LaunchSpec` | 0 | reject | 0 | 0 | 5 | low_pronounceability |

## Domain Matrix (Top 20)

- **ScopeSpec**: .com=registered, .org=available, .net=unknown, .xyz=available, .finance=available
- **SpecScope**: .com=unknown, .org=available, .net=unknown, .xyz=unknown, .finance=available
- **BuildSpec**: .com=unknown, .org=unknown, .net=registered, .xyz=available, .finance=unknown
- **PlanSpec**: .com=unknown, .org=registered, .net=unknown, .xyz=available, .finance=unknown
- **TaskSpec**: .com=unknown, .org=unknown, .net=unknown, .xyz=unknown, .finance=available
- **FrameSpec**: .com=unknown, .org=unknown, .net=unknown, .xyz=unknown, .finance=available
- **PilotSpec**: .com=unknown, .org=unknown, .net=unknown, .xyz=unknown, .finance=unknown
- **SpecBridge**: .com=registered, .org=unknown, .net=unknown, .xyz=unknown, .finance=available
- **SpecFrame**: .com=unknown, .org=unknown, .net=unknown, .xyz=unknown, .finance=unknown
- **SpecPilot**: .com=unknown, .org=unknown, .net=unknown, .xyz=registered, .finance=unknown
- **SpecTrack**: .com=unknown, .org=unknown, .net=unknown, .xyz=unknown, .finance=unknown
- **FlowSpec**: .com=unknown, .org=unknown, .net=unknown, .xyz=registered, .finance=unknown
- **SpecGrid**: .com=unknown, .org=unknown, .net=unknown, .xyz=unknown, .finance=unknown
- **SpecLoom**: .com=unknown, .org=unknown, .net=unknown, .xyz=unknown, .finance=unknown
- **SpecPath**: .com=unknown, .org=unknown, .net=unknown, .xyz=unknown, .finance=unknown
- **LaunchSpec**: .com=unknown, .org=unknown, .net=unknown, .xyz=unknown, .finance=unknown

## Notes

- `clear` means high score with enough domain headroom to proceed.
- `watch` means viable but with ambiguity (domain/noise/fit).
- `reject` means failed hard filters or weak composite score.

