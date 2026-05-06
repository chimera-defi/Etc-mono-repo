# Meta Learnings

## From AntSeed Analysis

1. **P2P inference is viable but brittle:** WebRTC NAT traversal is the #1 support burden. QUIC + relay fallback is not optional at scale.
2. **Gasless payments are table stakes:** Buyers will not pay per-prompt gas. EIP-712 signatures + batch settlement must be the default.
3. **Open source wins trust:** AntSeed's full open-source monorepo (SDK, CLI, contracts) is a competitive advantage. Viem Derivative must match or exceed this transparency.
4. **Activity-only emissions misalign:** $ANTS rewards volume over quality. A fork that does not fix this will converge on lowest-common-denominator providers.

## From Spec Writing

5. **Model attestation is harder than it looks:** Hashing a model checkpoint is easy; proving a provider served that exact model is hard. We need a concrete slashing proof mechanism before writing the Registry contract.
6. **Batch settlement UX is critical:** Providers will not adopt if they must manually trigger batches. Auto-batch with configurable thresholds is the minimum.
7. **Quality oracle trust assumptions are unavoidable:** Some offchain component must judge inference quality. The design goal is to make bribery costlier than honesty.

## From Market Analysis

8. **No direct competitor combines P2P + quality + governance:** This is the wedge. Venice is centralized; Morpheus is agent-centric; Gensyn is not live.
9. **Open-weight model licensing is a landmine:** Must restrict MVP to unambiguously open models (Llama, Mistral, Qwen) and avoid models with redistribution restrictions.

## From Risk Analysis

10. **Legal risks are the real blocker:** Technical risks (R1-R5) are solvable with engineering. Legal risks (R6, R8) can kill the project regardless of code quality. Prioritize legal opinion before mainnet deployment.
