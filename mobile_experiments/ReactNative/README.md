# React Native Experiment

React Native ranks immediately after Flutter in our comparison for cross-platform native performance, offering a mature ecosystem, a vast library surface, and teams' familiarity with JavaScript/TypeScript. This folder captures planning artifacts so the next agent can bootstrap a React Native "Hello World" parity build without additional context.

## Scope
- Validate tooling via `npx react-native doctor` and simulator runs on iOS/Android.
- Scaffold a TypeScript template with `npx react-native init ValdiParity --template react-native-template-typescript` (actual code generation deferred).
- Document the developer experience versus Valdi and Flutter, including bundler speed, metro logs, and native build requirements.

## Contents
- `HELLO_WORLD_PLAN.md` – blueprint for the sample app.
- `SETUP.md` – environment prep (Node, JDK, watchman, Cocoapods/Gradle).
- `DOCUMENTATION.md` – curated highlights from https://reactnative.dev.
- `TASKS.md`, `NEXT_STEPS.md`, `UNDERSTANDING.md` – backlog, priorities, and research context.
- `HANDOFF.md`, `README_AGENT.md` – quick start instructions.
- `app/README.md` – directions for where the actual project will live once created.

Status: documentation only; no source code has been generated yet per experiment guidelines.
