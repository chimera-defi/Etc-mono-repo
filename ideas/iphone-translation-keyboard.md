# iPhone Translation Keyboard (Text + Voice) — Feasibility Research

> **Status:** Research / feasibility
>
> **Last updated:** 2026-01-04

## Idea
Build an iOS **custom keyboard** that lets a user:
- Type in a **source language** (e.g., English)
- Choose a **destination language** (e.g., Spanish)
- The keyboard **inserts translated text** into the active text field (WhatsApp, iMessage, Signal, etc.)

Stretch: voice-to-text → translate → insert, so you can speak English and send Spanish anywhere.

---

## Does this already exist?
**Yes, in some form.** There are (at least) three common patterns in the market today:

1. **Keyboards with built-in translation**
   - Examples you’ll find in the ecosystem include third‑party keyboards and “translator keyboard” apps that ship a keyboard extension.
   - Keywords to search on the App Store: “translate keyboard”, “translator keyboard”, “iTranslate keyboard”, “keyboard translator”.

2. **Translation inside specific messaging apps**
   - Some chat apps implement translation inline (app-specific, not system-wide).
   - This doesn’t solve “works in any app,” but it reduces demand for a keyboard in those apps.

3. **Share-sheet / copy‑paste workflows**
   - User types/speaks in a translator app → copies translated output → pastes into any app.
   - Lower engineering friction, but worse UX than an in-keyboard flow.

**Takeaway:** A translation keyboard is not novel; the differentiator would be **quality, speed, privacy options, and voice workflow**.

---

## Core feasibility: text translation keyboard on iOS
**Feasible, with important constraints.**

### What iOS keyboard extensions can do
- Provide a custom keyboard UI via a Keyboard Extension.
- Read user keystrokes *that the keyboard itself receives*.
- Insert text into the active app using the system text proxy (i.e., “type” programmatically into the current input field).
- Maintain local settings (chosen languages, tone, formality, etc.).

### What iOS keyboard extensions cannot reliably do
- **See arbitrary text** already in the host app (beyond limited cursor-adjacent context).
- **Guarantee network access** unless the user enables “Allow Full Access”.
- Run long background tasks freely (extension lifecycle is constrained).
- Access many device resources due to privacy sandboxing.

### Network access & “Allow Full Access” (critical)
If translation is powered by a cloud API (DeepL / Google / OpenAI / your own service), iOS typically requires the user to enable **Allow Full Access** for the keyboard.

- **UX impact:** Some users will refuse Full Access, especially for a keyboard, because it implies the keyboard *could* transmit what you type.
- **Product implication:** You likely need two modes:
  - **Offline mode** (limited language set / heavier app size) *or* a “no translation” fallback without Full Access
  - **Online mode** (best quality, widest language coverage) requiring Full Access + transparent privacy posture

---

## MVP UX proposal (text)
Goal: deliver “type English → insert Spanish” with minimal friction.

### Recommended flow
- Default behavior: user types normally.
- When user hits **Translate**:
  1. Keyboard takes the most recent input (either since last send, or a user-selected range via your own input buffer)
  2. Calls translation
  3. Replaces the buffer in the text field with the translated version (or inserts below)

### Practical detail: “replace what I typed”
iOS keyboard extensions can insert text, but **deleting/replacing** depends on what you can infer from the text proxy and your own buffer.
- Best practice: maintain an **internal buffer** of what the user typed *through your keyboard* so you can undo/replace reliably.
- Edge cases: cursor movement, user edits with selection handles, host-app formatting, autocorrect changes, etc.

---

## Voice-to-text → translate → insert (the hard part)
**This is much less straightforward than text translation**.

### Why it’s hard
iOS is intentionally restrictive about keyboards accessing sensitive input sources.
- The system dictation experience is controlled by iOS.
- Third-party keyboards generally **cannot implement a true “dictation key”** that records audio inside the keyboard in the same way the system keyboard does.

### Feasible alternative architectures
If “voice anywhere” is a must-have, plan for a **companion app**:

#### Option A: Companion app + clipboard + “Paste translated”
1. User taps a “Voice” button in the container app (or via a widget / shortcut).
2. App records audio → speech-to-text → translate.
3. App copies translated text to clipboard.
4. Keyboard shows a prominent **Paste** button to insert the clipboard contents.

- **Pros:** Works around keyboard mic limitations; easier permissions story.
- **Cons:** Not as seamless as in-keyboard dictation; users bounce between apps (unless improved with Shortcuts).

#### Option B: Companion app + share extension
Useful when the user already has text selected/copied.
- User shares text to your app/extension → translates → copies back.

#### Option C: Use on-device speech recognition (in app), not in keyboard
Keeps audio private, but increases app size and complexity; still avoids keyboard mic constraints.

**Takeaway:** “Voice dictation inside the keyboard” is likely a non-starter; “voice via companion app + paste” is realistic.

---

## Technical approach (high level)

### Components
- **Container iOS app**
  - Onboarding + settings (languages, tone, “auto-translate on send”, privacy)
  - Account/auth if needed
  - Voice capture (if pursuing voice)
  - Provider selection (BYO API key vs your hosted API)

- **Keyboard extension**
  - Keyboard UI + language picker
  - Local buffer management
  - Translation call (online) or local model inference (offline)
  - Insert/replace logic via text proxy

- **Translation service (optional)**
  - If you don’t want keys on device: route requests through your API
  - Must be designed with strong privacy guarantees (and ideally an option for “no logging”)

### Privacy posture (make-or-break)
If you require Full Access, you need:
- Clear, minimal data handling policy
- A “never store typed text” stance (and architecture to support it)
- Optional BYO key mode (so requests go directly to the provider from device, if feasible)

---

## Risks / constraints to call out early
- **Adoption friction:** users must install/enable a third-party keyboard + often enable Full Access.
- **Trust:** keyboards are the most sensitive app category; users will assume you can see everything they type.
- **Performance:** translation latency must feel instant (< ~300–800ms perceived). Network variance will hurt.
- **UX edge cases:** text replacement, cursor moves, autocorrect interactions, emoji, RTL languages.
- **Policy risk:** App Review scrutiny for keyboards that transmit keystrokes; you’ll need tight disclosures and a legitimate, user-initiated translation action (avoid “always-on” sending).

---

## Recommendation
- **Text translation keyboard:** **Yes, feasible** and can be a strong product if it’s fast and trustworthy.
- **Voice dictation inside keyboard:** **Not reliably feasible** as a pure keyboard-extension feature; plan for a **companion-app workflow** and make “Paste translated” excellent.

---

## Next steps (concrete)
1. **Competitive scan (App Store)**: shortlist 5–10 existing “translate keyboard” apps; capture their UX, pricing, and whether they require Full Access.
2. **Define MVP UX**: translate-on-demand (button) vs “auto translate as you type” (higher risk + more latency).
3. **Decide privacy model**:
   - BYO API key only
   - Your hosted API
   - Offline-only (likely limited)
4. **Prototype spike**:
   - Keyboard extension that buffers typed text and inserts a “translated” placeholder result
   - Then wire a real translation provider behind a feature flag
5. **Voice spike (companion app)**:
   - Record → STT → translate → copy to clipboard
   - Keyboard “Paste translated” button with history (last 5 items)

