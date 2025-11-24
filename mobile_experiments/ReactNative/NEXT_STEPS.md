# Next Steps

1. **Verify Environment** – Finish every prerequisite in `SETUP.md`, documenting OS versions, Node/npm versions, and emulator availability in `DOCUMENTATION.md`.
2. **Doctor + Artifacts** – Run `npx react-native doctor`, resolve failures, and store the output in `.cursor/artifacts/react-native-doctor.md`.
3. **Project Scaffolding (when permitted)** – Use the TypeScript template to initialize `app/ValdiParity`, keeping code uncommitted until explicitly allowed.
4. **Hello World Build** – Once coding is greenlit, implement the experience described in `HELLO_WORLD_PLAN.md` and verify it on both platforms.
5. **Insight Capture** – Update `UNDERSTANDING.md` with comparisons to Valdi and Flutter (setup friction, hot reload behavior, build times).

## Open Questions
- Should we adopt Expo for faster onboarding and then eject later, or stay on bare React Native from day one?
- What package manager (npm vs. Yarn vs. PNPM) best fits our tooling stack? Document the decision before scaffolding.
- Do we integrate Fastlane / Gradle tasks into CI during this experiment, or leave builds manual?

Record answers in `UNDERSTANDING.md` as decisions are made.
