# Open Questions

## Technical

1. **Benchmark job determinism:** How do we ensure benchmark prompts have objectively correct outputs for generative models (e.g., creative writing)? Should we restrict benchmarks to deterministic tasks (code, math, classification)?
2. **Slashing proof:** What exactly constitutes onchain-provable evidence that a provider served a different model than attested? Hash of output? Signature of oracle witness?
3. **Channel batching threshold:** Should batch settlement be time-based (every N hours), gas-price-based, or amount-based (batch when aggregate gas cost < X% of total value)?
4. **Mesh bootstrap:** Who runs the initial relay nodes? Are they incentivized? Can they censor?
5. **Encryption overhead:** Noise cipher vs TLS over QUIC — which has lower latency for small prompts (~1KB)?

## Economic

6. **VIEM tokenomics:** What is the total supply, initial distribution, and emission curve? Should there be a cap or ongoing emissions tied to protocol revenue?
7. **ve lock minimum:** What is the minimum ve lock duration to vote? What is the early exit penalty?
8. **Fee split:** What percentage of channel fees go to veVIEM holders vs protocol treasury vs burned?
9. **Oracle node incentives:** How are quality oracle nodes paid? From protocol fees or a dedicated oracle reward pool?
10. **Provider minimum stake:** Should stake be a flat minimum or proportional to compute capacity / model size?

## Legal / Compliance

11. **Model liability:** If a provider serves a model that generates illegal content, is the staked provider liable? Is the protocol liable?
12. **KYC avoidance:** Does adding ve-style governance and fee sharing trigger securities law considerations in any jurisdiction?
13. **Data privacy:** Are buyer prompts stored anywhere (oracle logs, mesh relay nodes)? If so, for how long?

## Market

14. **AntSeed relationship:** Is this a hostile fork, friendly fork, or complementary layer? Should we airdrop VIEM to ANTS holders?
15. **Model provider licensing:** Do popular model creators (OpenAI, Anthropic, Meta) have terms that prohibit P2P redistribution? How does the fork handle this?
16. **Demand estimation:** What is the realistic TAM for uncensorable AI inference vs. centralized APIs? Is this a niche or a wedge?

## Product

17. **Buyer UX:** Should the client SDK abstract channels entirely (buyer just sees "pay per prompt") or expose channel mechanics for power users?
18. **Provider tooling:** What is the minimal viable provider setup? Docker container? Native binary? Cloud VM template?
19. **Multi-model routing:** Should buyers be able to request "any model that can do X" and let the mesh route, or must they specify model_hash exactly?
