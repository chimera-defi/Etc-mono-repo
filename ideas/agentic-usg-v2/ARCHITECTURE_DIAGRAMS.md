# Architecture Diagrams

## System Map

```text
User Wallet
  -> Identity Gate (World ID / Agent Kit)
  -> Frontend
      -> Agent Controller
         -> 0G Decision Memory / Scoring
      -> Stablecoin Engine
      -> Tranche Vault
      -> Collateral Vault
          -> Yield Source Adapter: Mock LP/PT
          -> Yield Source Adapter: Prediction Arb
      -> Oracle / Resolution Adapter
      -> Emissions / Bonding
```

## Agent Action Flow

```text
observe yield + peg + tranche imbalance
  -> score candidate routes + write decision dossier to 0G
  -> create proposed action
  -> check policy + identity gate
  -> approve
  -> execute on adapter/vault
  -> emit action log
  -> update dashboard + prize mapping + dossier link
```

## Demo Deployment Shape

```text
Frontend (Next.js or Vite)
  -> API / Agent service
  -> EVM contracts on selected chain
  -> Arc / 0G / World integration wrappers
  -> 0G-backed decision dossier storage
  -> Mocked market/oracle fixtures for deterministic demo
```
