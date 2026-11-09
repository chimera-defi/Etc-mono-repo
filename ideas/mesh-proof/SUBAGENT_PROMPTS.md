# Subagent Prompts

## Prompt: Explore AntSeed Contracts
**Task:** Read AntSeedDeposits, AntseedChannels, and AntseedStaking on Base Mainnet via basescan.org. Summarize:
- Exact storage variables and mappings
- Event signatures
- External functions we should preserve, modify, or replace
- Any slashing or dispute mechanisms

**Deliverable:** Markdown summary with block links and function signatures.

## Prompt: Design Tokenomics Model
**Task:** Design a spreadsheet model for $VIEM tokenomics given:
- Total supply: 1B (tentative)
- Initial allocation: 40% emissions to providers, 20% treasury, 15% team (4y vest), 10% seed, 10% community, 5% oracle incentives
- Emissions decay: 20% per year
- Fee split: 50% to ve holders, 30% burned, 20% treasury

**Deliverable:** Google Sheets or CSV with year-1 through year-5 projections for provider APY, ve holder yield, and treasury runway.

## Prompt: libp2p Discovery Benchmark
**Task:** Write a minimal Node.js script that:
1. Spins up 2 libp2p nodes (one with relay, one behind local NAT simulation)
2. Joins a gossipsub topic
3. Measures time from node-2 start until node-1 receives the first message
4. Runs 100 iterations and reports p50, p99, and failure rate

**Deliverable:** Working script + results markdown.

## Prompt: Quality Oracle Architecture
**Task:** Design the offchain quality oracle architecture in detail:
- Database schema (Postgres)
- BullMQ job definitions
- REST/gRPC API between oracle nodes
- Consensus algorithm for score updates
- Failover / deadlock handling

**Deliverable:** ARCHITECTURE_DECISIONS.md section + ERD diagram (text or mermaid).

## Prompt: Frontend Wireframes
**Task:** Produce low-fidelity wireframes for:
1. Discovery page (provider grid)
2. Job console (prompt → output)
3. Provider dashboard
4. veVIEM governance page

**Deliverable:** ASCII art or Excalidraw-compatible JSON for each screen.
