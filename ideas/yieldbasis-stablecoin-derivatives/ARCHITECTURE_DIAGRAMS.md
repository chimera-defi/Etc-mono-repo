# Architecture Diagrams

## Value Flow

```text
user stable deposit
  -> tranche vault
    -> protocol allocator
      -> YieldBasis adapter + other stable-yield sleeves
    -> senior/junior split
    -> redemption queue + lock manager
```

## Fault Flow

```text
protocol state changes
  -> allocator reads TRD / cap / reward / lock state
    -> risk oracle updates tranche health
      -> UI + redemption policy update
```
