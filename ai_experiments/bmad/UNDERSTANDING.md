# Understanding: B-MAD Method Track

## Context
- B-MAD Method is fundamentally different from other tools in this evaluation—it's a complete development methodology rather than a constraint/validation library
- Built on B-MAD Core (CORE: Collaboration Optimized Reflection Engine), providing a universal framework for human-AI collaboration
- Focuses on process constraints and workflow enforcement rather than runtime output validation
- Particularly strong for teams wanting structured AI-assisted development from planning to implementation
- v6 represents a major architectural overhaul with scale-adaptive intelligence and visual workflows

## Assumptions
- Development team is comfortable with Node.js/TypeScript ecosystem
- Team uses compatible IDE (Claude Code, Cursor, Windsurfer, VS Code)
- Willingness to adopt a methodology-driven approach rather than just adding validation layers
- Project can benefit from specialized agent workflows (PM, Architect, Developer, UX, etc.)
- Team values structured development lifecycle over ad-hoc AI assistance

## Unknowns
1. How does B-MAD Method compare to using constraint tools (Guardrails, Outlines) alongside standard development workflows?
2. Can B-MAD workflows be integrated with runtime validation tools, or are they complementary but separate?
3. What is the learning curve for teams adopting the B-MAD methodology vs. adding validation libraries?
4. How does B-MAD's scale-adaptive planning compare to manual prompt engineering for different project sizes?
5. Can B-MAD Builder create custom workflows that enforce specific constraint policies (e.g., compliance, security)?

## Notes
- B-MAD Method is more of a "development framework" than a "constraint tool"—it guides the development process rather than validating outputs
- The 19 specialized agents could potentially be configured to enforce domain-specific constraints during development
- Document sharding feature (90% token savings) is valuable for large projects but doesn't directly relate to output validation
- B-MAD Builder module allows creating custom agents/workflows, which could potentially integrate constraint validation
- v6 alpha introduces visual workflows and scale-adaptive intelligence—worth evaluating if these features align with our needs
- Unlike other tools that validate LLM outputs, B-MAD focuses on structuring the development process itself
