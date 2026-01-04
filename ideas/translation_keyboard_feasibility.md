# iOS Translation Keyboard Feasibility Research

## 1. Executive Summary

The concept is to build an iOS Custom Keyboard Extension that allows users to:
1.  **Text-to-Text:** Type in a source language (e.g., English) and have it automatically translated and inserted as text in a destination language (e.g., Spanish).
2.  **Voice-to-Text (Translated):** Speak in a source language and have the recognized speech translated and inserted as text in the destination language.

**Verdict:** **Highly Feasible**, but with significant technical constraints and strong existing competition. The "Voice-to-Translated-Text" feature is the primary differentiator but faces the steepest technical hurdles due to iOS keyboard extension memory and hardware limitations.

---

## 2. Technical Implementation (iOS)

### 2.1 Custom Keyboard Extensions
iOS allows developers to create custom keyboards using the `UIInputViewController` class.
-   **Text Input:** The `textDocumentProxy` object is used to insert text into the active field.
-   **UI:** You can build a custom view (SwiftUI or UIKit) for keys, suggestion bars, and translation controls.

### 2.2 Translation (Text-to-Text)
To translate text, the keyboard extension needs to communicate with a translation service (Google Cloud Translation, DeepL, OpenAI, etc.).
-   **Requirement - "Full Access":** By default, keyboard extensions are sandboxed and have no network access. To make API calls, the user **MUST** enable "Allow Full Access" in iOS Settings. This is a high-friction step for users due to the scary privacy warning iOS displays.
-   **Offline Translation:** iOS 15+ introduced system-wide translation, but the `Translation` framework is primarily for app usage. Embedding a full offline translation model (like CoreML) inside a keyboard extension is risky because extensions have a strict memory limit (often around 50MB - 80MB). Exceeding this kills the keyboard process immediately. Cloud-based API is the safer path for stability, despite the network requirement.

### 2.3 Voice-to-Text (Translated Dictation)
This is the most complex feature.
-   **Microphone Access:** Keyboard extensions *can* access the microphone, but it requires "Full Access" and standard permission prompts (`NSMicrophoneUsageDescription`).
-   **Speech Recognition:**
    -   **Apple `SFSpeechRecognizer`:** Can be used for on-device or server-based recognition.
    -   **External APIs (OpenAI Whisper, etc.):** Audio data can be recorded and sent to an API.
-   **Challenges:**
    1.  **Memory Pressure:** Audio processing buffers consume memory.
    2.  **Audio Session Conflicts:** The keyboard must manage the `AVAudioSession` carefully to not interrupt background audio (like music) unnecessarily, or handle the interruption correctly.
    3.  **UI/UX:** The "Dictation" button on the standard iOS keyboard hands off to the *system* dictation UI. A custom implementation would need its own "Press to Speak" UI within the keyboard height constraints.

### 2.4 Workflow
1.  User selects "English -> Spanish".
2.  **Text Mode:** User types "Hello". Keyboard captures keystrokes, sends "Hello" to Translation API, receives "Hola", and inserts "Hola" into `textDocumentProxy`.
    *   *Optimization:* Debounce requests to avoid API spam, or translate word-by-word/sentence-by-sentence.
3.  **Voice Mode:** User holds a mic button. App records audio.
    *   *Path A:* Transcribe (STT) -> Translate -> Insert.
    *   *Path B:* Audio to Translation API (if supported) -> Insert.

---

## 3. Existing Solutions & Competition

This is a mature market. Several major players exist:

1.  **Gboard (Google):**
    *   **Features:** Integrated Google Translate. You type, it translates in real-time.
    *   **Voice:** Uses Google's powerful voice typing, but typically transcribes in the *source* language. The user generally has to translate the text after, or use the translate mode which translates typed text.
2.  **iTranslate Keyboard:**
    *   **Features:** specifically built for this use case. Text-to-text translation.
3.  **SwiftKey (Microsoft):**
    *   **Features:** Integrates Microsoft Translator.
4.  **Grammarly / Other Utilities:**
    *   Often include tone checks, which is adjacent to translation.

**Gap:** While Gboard does this well, a dedicated "Voice-to-Translated-Text" workflow that is seamless (Speak English -> Text appears in Spanish instantly) is often clunky in existing apps or requires multiple steps.

---

## 4. Risks & Challenges

1.  **Memory Limits (The "Crash" Risk):** iOS is ruthless with keyboard extensions. If your memory footprint spikes during voice processing or network requests, the keyboard simply disappears and reverts to the Apple keyboard. This is the #1 complaint for third-party keyboards.
2.  **Privacy Trust:** Users are wary of "Full Access" keyboards because they can technically keylog everything (passwords, etc.). Apple switches to the secure system keyboard for password fields automatically, but the perception remains.
3.  **Latency:** Real-time translation requires good internet.
4.  **API Costs:** High-quality translation APIs (Google, DeepL) are not free at scale. The business model would likely need to be Subscription-based or Freemium.

## 5. Recommendations for MVP

To validate this without building a massive system:
1.  **Platform:** iOS (Swift).
2.  **Tech Stack:**
    *   `UIInputViewController` for the keyboard.
    *   **OpenAI API** (Whisper for audio + GPT-4o-mini for translation) OR **DeepL API** for text translation.
    *   *Note:* Using a single LLM API call for "Audio -> Translated Text" might be slower but simpler to implement than separate STT + Translate steps.
3.  **Focus:** Nail the **Voice-to-Translated-Text** experience.
    *   Button: "Speak English -> Send Spanish".
    *   User holds button -> speak -> release -> text appears in Spanish.
    *   This feels like "magic" compared to typing.

## 6. Next Steps
1.  **Prototype:** Build a basic keyboard extension that requests "Full Access".
2.  **Test:** Implement a simple "Echo" test where typing "A" inserts "B" to verify text proxy control.
3.  **Integrate:** Connect a translation API (e.g., DeepL Free Tier) to verify latency.
4.  **Voice:** Attempt to initialize `SFSpeechRecognizer` inside the extension to check for memory crashes.
