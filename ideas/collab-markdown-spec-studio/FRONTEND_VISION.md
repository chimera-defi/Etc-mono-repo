## Frontend Vision (SpecForge)

## IA and Core Surfaces
1. Workspace list
2. Spec editor
3. Patch review queue
4. Decision and recap panel
5. Export/repo generation panel
6. Audit/history viewer

## Primary Screen Model
1. Left rail: section tree + status badges (draft/review/blocked/final).
2. Main pane: markdown editor with inline comments and provenance markers.
3. Right rail tabs:
   - Agent chat
   - Patch queue
   - Open questions
   - Recap

## Interaction Model
1. Agents cannot directly overwrite finalized sections by default.
2. Every agent patch has:
   - diff preview
   - rationale
   - confidence/risk signal
3. Recap updates are generated on major state transitions.

## MVP Frontend Scope
1. Desktop-first web app.
2. Mobile review mode:
   - approve/reject patches
   - comment
   - read recap
3. No advanced whiteboard/diagram editor in MVP.

## Accessibility and Usability
1. Keyboard-first editing and review commands.
2. High-contrast diff mode.
3. Explicit unsaved-change and conflict states.
