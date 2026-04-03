## Cannes 2026 Prize Mapping

Source:
- official ETHGlobal Cannes 2026 prizes page: https://ethglobal.com/events/cannes2026/prizes

## Best Fits

### 1. Arc

Strongest fit.

Why:
- the Cannes page explicitly includes:
  - `Best Agentic Economy with Nanopayments`
  - `Best Smart Contracts on Arc with Advanced Stablecoin Logic`
  - `Best Chain Abstracted USDC Apps Using Arc as a Liquidity Hub`

How this variant maps:
- milestone escrow in USDC
- automatic release on accepted output
- gas-free micropayments between agents for tools / services / subtasks
- later path to sourcing USDC across chains without changing UX

Best concrete submission target:
- `Best Agentic Economy with Nanopayments`

Secondary target:
- `Best Smart Contracts on Arc with Advanced Stablecoin Logic`

### 2. World

Strong fit.

Why:
- the Cannes page says World wants agentic experiences where World ID improves safety, fairness, or trust
- it also explicitly rewards products that "break without proof of human"

How this variant maps:
- only verified humans can post funded idea jobs
- only verified humans can operate or back worker agents
- only verified humans can approve milestone release
- reputation is unique and sybil-resistant

Best concrete submission target:
- `Best use of Agent Kit`

Secondary target:
- `Best use of World ID 4.0`

### 3. 0G

Strong fit.

Why:
- the Cannes page includes `Best OpenClaw Agent on 0G`
- it also wants AI-native applications using 0G infrastructure

How this variant maps:
- worker agents are OpenClaw-style builders
- each job stores a persistent build dossier
- memory, artifacts, and acceptance evidence live in 0G-backed storage

Best concrete submission target:
- `Best OpenClaw Agent on 0G`

Secondary target:
- `Wildcard`

## Good Stackable Add-Ons

### ENS

Good additive fit.

How:
- ENS names for worker agents and teams
- stable public identity for builders
- better discoverability and trust UX

### Ledger

Good additive fit.

How:
- hardware-backed approval for high-value payout release
- hardware-backed approval for sensitive repo or deployment actions

### Chainlink

Plausible but secondary.

How:
- trigger settlement conditions
- run acceptance or verification workflows
- bridge offchain evaluation into onchain release conditions

Risk:
- easy to overcomplicate if used just for logo coverage

## Weak Or Opportunistic Fits

### WalletConnect

Usable for wallet UX, but not a core story.

### Dynamic

Useful for onboarding, but not the main differentiator.

### Flare

Only worth chasing if verifiable offchain execution becomes a core part of the demo.

### Hedera / Uniswap Foundation / Unlink

Possible, but weaker for this concept and more likely to create narrative sprawl.

## Recommended Submission Stack

### Primary three

1. Arc
2. World
3. 0G

### Optional add-ons if naturally implemented

4. ENS
5. Ledger

## Anti-Sprawl Rule

Do not integrate a sponsor unless it changes one of these visibly:
- who is allowed to act
- how payment releases
- how agents pay each other
- how build memory / provenance is stored
- how users trust the agent identity

If an integration does not change one of those, it is probably logo theater.
