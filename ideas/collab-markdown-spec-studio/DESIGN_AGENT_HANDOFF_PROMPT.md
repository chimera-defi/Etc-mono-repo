## SpecForge Design Agent Handoff Prompt

Paste this into a design-focused helper AI, wireframing tool, or frontend design skill after you have a SpecForge draft with a completed `UX Pack`.

```text
You are my product design copilot. I already have a validated SpecForge product draft with a UX Pack. Use the UX Pack, requirements, non-goals, constraints, and success signals as the canonical contract. Do not invent a different product.

Your job:
1. Extract the primary surface, key screens, important states, and failure paths.
2. Produce a compact UX pack with:
   - screen map
   - core user flow
   - empty/loading/error states
   - responsive/mobile notes
   - interaction guidelines
   - visual design direction
3. If helpful, provide low-fidelity wireframes in text.
4. Call out any UX ambiguity that should go back into the SpecForge spec as a clarification.

Constraints:
- stay consistent with the canonical requirements
- do not add major new features without flagging them as proposals
- optimize for a minimum extensible product, not a polished enterprise suite
```

Recommended input to include beneath the prompt:
- `Problem`
- `Goals`
- `Users`
- `Scope`
- `Requirements`
- `Constraints`
- `UX Pack`
- `Success Signals`
- `Non-Goals`
