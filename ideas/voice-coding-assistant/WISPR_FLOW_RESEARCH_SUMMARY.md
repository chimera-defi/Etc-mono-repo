# Wispr Flow Research Summary

## 1. Executive Summary

**Wispr Flow** is a desktop-native voice dictation tool designed specifically for coding. It is known for its high accuracy (95-98%) and low latency.

*   **Open API Status:** Based on current research, Wispr Flow does **not** offer a public API for third-party developers. It is a closed-source consumer product.
*   **Reverse Engineering Findings:** Our analysis suggests Wispr Flow is likely a highly optimized wrapper around **OpenAI Whisper**, enhanced with aggressive context injection (using active window context) and a streaming architecture to reduce latency.

## 2. Reverse Engineered Architecture

To replicate Wispr Flow's "magic" for the Cadence agent, we have identified the following key components that must be built:

### A. The Core Engine (Likely OpenAI Whisper)
Wispr Flow's accuracy profile matches OpenAI's Whisper model (large-v3 or similar).
*   **Recommendation:** Use **OpenAI Whisper API** (or Deepgram Nova-2) as the transcription engine.
*   **Why:** On-device models (like standard mobile STT) only achieve 85-90% accuracy, which is insufficient for code. Wispr Flow achieves 95-98% by using cloud-grade models.

### B. Context Injection (The "Secret Sauce")
Wispr Flow excels because it "knows" what you are working on. It likely injects context into the model's prompt.
*   **Mechanism:**
    1.  Read the active file's content (or clipboard/window title).
    2.  Extract keywords (variable names, libraries, imports).
    3.  Pass these keywords as the `prompt` or `keywords` parameter to the STT engine.
    4.  **Result:** The model correctly transcribes `useEffect` instead of "use effect" because it sees `React` in the context.

### C. Streaming Architecture
To achieve sub-500ms latency:
*   **Mechanism:**
    1.  Audio is chunked into small segments (e.g., 200ms - 2s).
    2.  Chunks are streamed via WebSocket to the server.
    3.  Interim results are displayed immediately (to make it feel instant).
    4.  Final corrections are applied when the sentence is complete.

## 3. Implementation Strategy for Cadence

To achieve parity with Wispr Flow for the "text inscription work" (transcription), we will implement the **Hybrid STT Architecture** defined in `_archive/STT_WISPR_FLOW_QUALITY.md`:

1.  **Primary Engine:** **OpenAI Whisper API** (for accuracy) or **Deepgram Nova-2** (for speed).
2.  **Context Awareness:** Implement a `CodebaseAnalyzer` that extracts symbols from the user's active file and passes them as context to the STT engine.
3.  **Voice Activity Detection (VAD):** Use on-device VAD to detect when the user stops speaking to cut latency.

## 4. Conclusion

We cannot use Wispr Flow's API directly as it does not exist. However, we have effectively "reverse engineered" its success factors and have a clear technical path to build a matching (or better) solution using **OpenAI Whisper + Context Injection**.

**Reference:** See `_archive/STT_WISPR_FLOW_QUALITY.md` for the detailed technical specification.
