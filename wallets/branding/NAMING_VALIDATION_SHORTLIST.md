# Naming Validation Report

- Generated (UTC): 2026-04-08T11:16:44+00:00
- Methodology: `2026-04-strict-naming-v1`
- Hard constraint: `<= 2` semantic words (including fused compounds)
- Domain checks: `.com`, `.org`, `.net`, `.xyz`, `.finance` via RDAP

## Summary

- Clear: **4**
- Watch: **8**
- Reject: **0**

## Ranked Candidates

| Rank | Name | Score | Decision | Avail | Taken | Unknown | Notes |
|------|------|-------|----------|-------|-------|---------|-------|
| 1 | `AccessBench` | 90 | clear | 4 | 0 | 1 | - |
| 2 | `WalletBench` | 88 | clear | 3 | 2 | 0 | - |
| 3 | `RailBench` | 86 | clear | 3 | 0 | 2 | - |
| 4 | `AccessAtlas` | 85 | clear | 2 | 3 | 0 | - |
| 5 | `WalletKernel` | 81 | watch | 2 | 0 | 3 | - |
| 6 | `AccessScope` | 79 | watch | 1 | 0 | 4 | - |
| 7 | `AccessSignal` | 78 | watch | 0 | 0 | 5 | - |
| 8 | `GatewayBench` | 78 | watch | 0 | 0 | 5 | - |
| 9 | `RampRank` | 78 | watch | 0 | 0 | 5 | - |
| 10 | `WalletSignal` | 78 | watch | 0 | 0 | 5 | - |
| 11 | `GatewaySignal` | 76 | watch | 0 | 0 | 5 | - |
| 12 | `PaymentSignal` | 76 | watch | 1 | 0 | 4 | - |

## Domain Matrix (Top 12)

- **AccessBench**: .com=available, .org=available, .net=unknown, .xyz=available, .finance=available
- **WalletBench**: .com=registered, .org=available, .net=available, .xyz=registered, .finance=available
- **RailBench**: .com=available, .org=unknown, .net=available, .xyz=unknown, .finance=available
- **AccessAtlas**: .com=registered, .org=registered, .net=registered, .xyz=available, .finance=available
- **WalletKernel**: .com=available, .org=unknown, .net=unknown, .xyz=unknown, .finance=available
- **AccessScope**: .com=unknown, .org=unknown, .net=available, .xyz=unknown, .finance=unknown
- **AccessSignal**: .com=unknown, .org=unknown, .net=unknown, .xyz=unknown, .finance=unknown
- **GatewayBench**: .com=unknown, .org=unknown, .net=unknown, .xyz=unknown, .finance=unknown
- **RampRank**: .com=unknown, .org=unknown, .net=unknown, .xyz=unknown, .finance=unknown
- **WalletSignal**: .com=unknown, .org=unknown, .net=unknown, .xyz=unknown, .finance=unknown
- **GatewaySignal**: .com=unknown, .org=unknown, .net=unknown, .xyz=unknown, .finance=unknown
- **PaymentSignal**: .com=unknown, .org=unknown, .net=unknown, .xyz=available, .finance=unknown

## Notes

- `clear` means high score with enough domain headroom to proceed.
- `watch` means viable but with ambiguity (domain/noise/fit).
- `reject` means failed hard filters or weak composite score.

