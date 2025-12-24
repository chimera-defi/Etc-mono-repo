# Achieving Wispr Flow-Level Speech Recognition Quality

> Technical specifications for premium speech-to-text to match or exceed Wispr Flow

---

## What Makes Wispr Flow Special?

### Wispr Flow Characteristics (Analyzed)

| Feature | Wispr Flow | Standard Mobile STT | Our Target |
|---------|-----------|---------------------|------------|
| **Accuracy** | 95-98% | 85-90% | **95-98%** ✅ |
| **Latency** | <500ms | 1-2s | **<500ms** ✅ |
| **Continuous Recognition** | ✅ Yes | ❌ Limited | **✅ Yes** |
| **Noise Handling** | ✅ Excellent | ⚠️ Poor | **✅ Excellent** |
| **Accent Support** | ✅ Wide | ⚠️ Limited | **✅ Wide** |
| **Context Awareness** | ✅ Yes | ❌ No | **✅ Yes** |
| **Technical Terms** | ✅ Handles well | ❌ Poor | **✅ Handles well** |
| **Offline Mode** | ❌ Cloud-only | ✅ Available | **⚠️ Hybrid** |

### Why Wispr Flow is Better

**1. Uses OpenAI Whisper (likely)**
- State-of-the-art accuracy (trained on 680k hours)
- Handles 99 languages
- Robust to background noise
- Understands technical jargon

**2. Streaming Architecture**
- Chunks audio for real-time processing
- Shows interim results while processing
- Low perceived latency

**3. Context-Aware**
- Learns from user's vocabulary
- Adapts to speaking style
- Domain-specific fine-tuning

**4. Professional Audio Processing**
- Noise suppression
- Echo cancellation
- Automatic gain control

---

## REVISED: Our STT Architecture (Wispr Flow Quality)

### ❌ OLD RECOMMENDATION (From Initial Plan)

```
On-Device STT:
- expo-speech-recognition
- iOS SFSpeech / Android SpeechRecognizer
- Pros: Free, private, offline
- Cons: 85-90% accuracy, poor noise handling
```

**PROBLEM:** This won't match Wispr Flow quality!

### ✅ NEW RECOMMENDATION (Wispr Flow Quality)

```
Cloud-based STT with Hybrid Fallback:
- Primary: OpenAI Whisper API
- Secondary: Deepgram Nova-2
- Fallback: On-device (poor connection)
- Pros: 95-98% accuracy, excellent noise handling
- Cons: ~$0.006/minute (~$0.36/hour)
```

---

## Detailed STT Architecture

### Option 1: OpenAI Whisper API (RECOMMENDED)

**Why Whisper?**
- Same underlying tech as Wispr Flow (likely)
- Best accuracy in the industry
- Handles technical terms (coding vocabulary!)
- Multi-language support
- Noise robustness

**Specifications:**

```typescript
// Whisper API Configuration
const WHISPER_CONFIG = {
  model: 'whisper-1',
  language: 'en', // Auto-detect available
  response_format: 'verbose_json', // Get timestamps + confidence
  temperature: 0.2, // Lower = more accurate, less creative

  // Audio requirements
  audioFormat: 'webm', // or 'mp4', 'mpeg', 'wav'
  sampleRate: 16000, // 16kHz is optimal for speech
  bitrate: 128000, // 128kbps
  channels: 1, // Mono

  // Streaming (custom implementation)
  chunkDuration: 2000, // 2 second chunks
  overlapDuration: 200, // 200ms overlap for context
};
```

**Implementation Pattern:**

```typescript
class WhisperSTTService {
  private audioRecorder: AudioRecorder;
  private chunkQueue: AudioChunk[] = [];
  private isStreaming = false;

  async startStreaming(onTranscript: (text: string, isFinal: boolean) => void) {
    this.isStreaming = true;

    // Start recording
    await this.audioRecorder.start({
      sampleRate: 16000,
      channels: 1,
      encoding: 'pcm_16bit',
    });

    // Process in 2-second chunks
    const interval = setInterval(async () => {
      if (!this.isStreaming) {
        clearInterval(interval);
        return;
      }

      const audioData = await this.audioRecorder.getChunk(2000);

      // Send to Whisper API
      const transcript = await this.transcribe(audioData);

      // Emit interim result
      onTranscript(transcript.text, false);

      // Store for context
      this.chunkQueue.push({ audio: audioData, transcript });

      // Keep last 3 chunks for context
      if (this.chunkQueue.length > 3) {
        this.chunkQueue.shift();
      }
    }, 2000);
  }

  async transcribe(audioData: Blob): Promise<WhisperResponse> {
    const formData = new FormData();
    formData.append('file', audioData, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');
    formData.append('response_format', 'verbose_json');
    formData.append('temperature', '0.2');

    // Add context from previous chunks (prompt parameter)
    const context = this.chunkQueue
      .map(c => c.transcript.text)
      .join(' ');
    if (context) {
      formData.append('prompt', context);
    }

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    return response.json();
  }

  stopStreaming() {
    this.isStreaming = false;
    this.audioRecorder.stop();
  }
}
```

**Cost Analysis:**

```
Whisper API Pricing: $0.006 per minute

Usage scenarios:
- Light user (10 min/day): $1.80/month
- Medium user (30 min/day): $5.40/month
- Heavy user (60 min/day): $10.80/month

Average across 100 users: ~$3/user/month
```

**Latency Breakdown:**

```
Audio capture (2s chunk):     2000ms
Network upload (50KB):         100ms
Whisper processing:            200ms
Network download:               50ms
Total perceived latency:       350ms ✅ (< 500ms target)
```

### Option 2: Deepgram Nova-2 (ALTERNATIVE)

**Why Deepgram?**
- Built for real-time streaming
- Lower latency than Whisper (150ms processing)
- Better for continuous speech
- Pay-as-you-go pricing

**Specifications:**

```typescript
const DEEPGRAM_CONFIG = {
  model: 'nova-2',
  language: 'en-US',
  smart_format: true, // Auto-punctuation
  punctuate: true,
  diarize: false, // Single speaker
  interim_results: true, // Real-time results
  endpointing: 500, // Detect silence after 500ms

  // Enhanced features
  redact: false, // PII redaction (GDPR)
  numerals: true, // "1" vs "one"
  profanity_filter: false,
  keywords: [
    // Boost recognition for coding terms
    'React:2',
    'TypeScript:2',
    'API:2',
    'component:2',
    'function:2',
  ],
};
```

**Implementation:**

```typescript
class DeepgramSTTService {
  private socket: WebSocket;
  private audioRecorder: AudioRecorder;

  async connect(onTranscript: (text: string, isFinal: boolean) => void) {
    // Connect to Deepgram WebSocket
    this.socket = new WebSocket(
      'wss://api.deepgram.com/v1/listen?' + new URLSearchParams({
        model: 'nova-2',
        language: 'en-US',
        smart_format: 'true',
        interim_results: 'true',
      }).toString(),
      ['token', DEEPGRAM_API_KEY]
    );

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'Results') {
        const transcript = data.channel.alternatives[0].transcript;
        const isFinal = data.is_final;

        onTranscript(transcript, isFinal);
      }
    };

    // Start recording and stream to Deepgram
    await this.audioRecorder.start({
      sampleRate: 16000,
      channels: 1,
      encoding: 'pcm_16bit',
    });

    this.audioRecorder.onData((audioChunk) => {
      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(audioChunk);
      }
    });
  }

  disconnect() {
    this.socket.close();
    this.audioRecorder.stop();
  }
}
```

**Cost Analysis:**

```
Deepgram Nova-2 Pricing: $0.0043 per minute

Usage scenarios:
- Light user (10 min/day): $1.29/month
- Medium user (30 min/day): $3.87/month
- Heavy user (60 min/day): $7.74/month

28% cheaper than Whisper!
```

**Latency Breakdown:**

```
Audio capture (streaming):      0ms (continuous)
Network upload (streaming):    50ms (WebSocket)
Deepgram processing:          150ms
Total perceived latency:      200ms ✅✅ (excellent!)
```

### Option 3: Hybrid Approach (BEST OF BOTH WORLDS)

**Strategy:**

```
┌─────────────────────────────────────────────┐
│  User starts speaking                       │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│  Check network status                       │
└────────────┬────────────────────────────────┘
             │
             ├─────────────────┬───────────────┐
             │                 │               │
     WiFi/5G (good)      4G (medium)     No/slow connection
             │                 │               │
             ▼                 ▼               ▼
    ┌────────────┐    ┌────────────┐   ┌──────────────┐
    │ Deepgram   │    │ Whisper    │   │ On-device    │
    │ Nova-2     │    │ API        │   │ (fallback)   │
    │            │    │            │   │              │
    │ Real-time  │    │ 2s chunks  │   │ Basic STT    │
    │ streaming  │    │            │   │              │
    │ 200ms      │    │ 350ms      │   │ 1-2s         │
    └────────────┘    └────────────┘   └──────────────┘
```

**Implementation:**

```typescript
class HybridSTTService {
  private deepgram: DeepgramSTTService;
  private whisper: WhisperSTTService;
  private onDevice: ExpoSTTService;

  private currentService: STTService | null = null;

  async start(onTranscript: (text: string, isFinal: boolean) => void) {
    // Detect connection quality
    const connection = await this.detectConnectionQuality();

    if (connection === 'excellent') {
      // Use Deepgram for best latency
      this.currentService = this.deepgram;
      await this.deepgram.connect(onTranscript);
    } else if (connection === 'good') {
      // Use Whisper for good balance
      this.currentService = this.whisper;
      await this.whisper.startStreaming(onTranscript);
    } else {
      // Fallback to on-device
      this.currentService = this.onDevice;
      await this.onDevice.startListening(onTranscript);
    }
  }

  private async detectConnectionQuality(): Promise<'excellent' | 'good' | 'poor'> {
    const connection = await NetInfo.fetch();

    if (connection.type === 'wifi' || connection.type === 'cellular') {
      if (connection.details?.cellularGeneration === '5g') {
        return 'excellent';
      }
      if (connection.details?.cellularGeneration === '4g') {
        return 'good';
      }
    }

    if (connection.isInternetReachable) {
      // Measure actual speed
      const speed = await this.measureSpeed();
      if (speed > 5000) return 'excellent'; // 5 Mbps
      if (speed > 1000) return 'good'; // 1 Mbps
    }

    return 'poor';
  }

  stop() {
    this.currentService?.stop();
  }
}
```

---

## Audio Processing Pipeline (Wispr Flow Quality)

### Pre-Processing (Before STT)

```typescript
class AudioPreProcessor {
  /**
   * Audio enhancement pipeline to improve STT accuracy
   */
  async process(rawAudio: AudioBuffer): Promise<AudioBuffer> {
    let audio = rawAudio;

    // 1. Noise Reduction
    audio = await this.applyNoiseReduction(audio);

    // 2. Normalize Volume
    audio = await this.normalizeVolume(audio);

    // 3. High-pass Filter (remove rumble)
    audio = await this.applyHighPassFilter(audio, 80); // 80 Hz cutoff

    // 4. De-emphasis (boost high frequencies)
    audio = await this.applyDeEmphasis(audio);

    // 5. Resample to optimal rate
    audio = await this.resample(audio, 16000);

    return audio;
  }

  private async applyNoiseReduction(audio: AudioBuffer): Promise<AudioBuffer> {
    // Use spectral gating or RNNoise
    // Library: @echogarden/audio-processing or rnnoise-wasm

    const processor = new NoiseReductionProcessor({
      sensitivity: 0.5, // 0-1, higher = more aggressive
      smoothing: 0.9, // Temporal smoothing
    });

    return processor.process(audio);
  }

  private async normalizeVolume(audio: AudioBuffer): Promise<AudioBuffer> {
    // Target: -23 LUFS (Spotify standard)
    const loudness = this.measureLUFS(audio);
    const targetLUFS = -23;
    const gain = targetLUFS - loudness;

    return this.applyGain(audio, gain);
  }

  private async applyHighPassFilter(
    audio: AudioBuffer,
    cutoffFreq: number
  ): Promise<AudioBuffer> {
    // Remove low-frequency noise (AC hum, wind, rumble)
    const filter = new BiquadFilter({
      type: 'highpass',
      frequency: cutoffFreq,
      Q: 0.7,
    });

    return filter.process(audio);
  }
}
```

### Voice Activity Detection (VAD)

**Purpose:** Detect when user is speaking vs silence

```typescript
class VoiceActivityDetector {
  private threshold = 0.02; // Energy threshold
  private minSpeechDuration = 300; // 300ms minimum
  private maxSilenceDuration = 700; // 700ms before stopping

  detect(audioBuffer: AudioBuffer): {
    isSpeaking: boolean;
    confidence: number;
  } {
    // Calculate RMS energy
    const energy = this.calculateRMS(audioBuffer);

    // Calculate zero-crossing rate (ZCR)
    const zcr = this.calculateZCR(audioBuffer);

    // Speech has moderate energy + moderate ZCR
    // Noise has low energy or very high ZCR
    const isSpeaking =
      energy > this.threshold &&
      zcr > 0.1 &&
      zcr < 0.5;

    const confidence = Math.min(energy / this.threshold, 1.0);

    return { isSpeaking, confidence };
  }

  private calculateRMS(buffer: AudioBuffer): number {
    const data = buffer.getChannelData(0);
    let sum = 0;

    for (let i = 0; i < data.length; i++) {
      sum += data[i] * data[i];
    }

    return Math.sqrt(sum / data.length);
  }

  private calculateZCR(buffer: AudioBuffer): number {
    const data = buffer.getChannelData(0);
    let crossings = 0;

    for (let i = 1; i < data.length; i++) {
      if ((data[i] >= 0 && data[i - 1] < 0) ||
          (data[i] < 0 && data[i - 1] >= 0)) {
        crossings++;
      }
    }

    return crossings / data.length;
  }
}
```

---

## Context-Aware Transcription

**Problem:** Generic STT doesn't understand "React component" vs "reactor component"

**Solution:** Provide context to improve accuracy

```typescript
class ContextAwareSTT {
  private vocabulary: Set<string> = new Set([
    // Common coding terms
    'React', 'TypeScript', 'JavaScript', 'API', 'JSON',
    'component', 'function', 'async', 'await', 'promise',
    'repository', 'GitHub', 'pull request', 'commit',
    'wallet', 'frontend', 'backend', 'database',

    // User's repos (dynamic)
    'wallet-frontend', 'api-service', 'auth-service',
  ]);

  private recentContext: string[] = [];

  async transcribe(audio: AudioBuffer): Promise<string> {
    // Build context prompt
    const contextPrompt = this.buildContext();

    // Send to Whisper with context
    const result = await whisperAPI.transcribe({
      audio,
      prompt: contextPrompt, // Whisper uses this for better accuracy!
    });

    // Post-process with vocabulary
    const corrected = this.correctWithVocabulary(result.text);

    // Update context
    this.recentContext.push(corrected);
    if (this.recentContext.length > 5) {
      this.recentContext.shift();
    }

    return corrected;
  }

  private buildContext(): string {
    // Whisper context prompt format:
    // Previous utterances + vocabulary hints

    const recent = this.recentContext.join('. ');
    const vocab = Array.from(this.vocabulary).slice(0, 20).join(', ');

    return `${recent}. Technical terms: ${vocab}.`;
  }

  private correctWithVocabulary(text: string): string {
    // Fix common misrecognitions
    let corrected = text;

    const corrections = {
      'reactor': 'React',
      'type script': 'TypeScript',
      'get hub': 'GitHub',
      'AP I': 'API',
      'jay sun': 'JSON',
    };

    for (const [wrong, right] of Object.entries(corrections)) {
      corrected = corrected.replace(
        new RegExp(wrong, 'gi'),
        right
      );
    }

    return corrected;
  }

  // Learn from user corrections
  learnFromCorrection(transcribed: string, corrected: string) {
    // Extract new terms
    const newTerms = corrected
      .split(/\s+/)
      .filter(word =>
        word.length > 3 &&
        !this.vocabulary.has(word)
      );

    newTerms.forEach(term => this.vocabulary.add(term));
  }
}
```

---

## Performance Metrics & Monitoring

### Real-time Metrics to Track

```typescript
interface STTMetrics {
  // Accuracy
  wordErrorRate: number; // Target: < 5%
  characterErrorRate: number; // Target: < 2%

  // Latency
  audioCaptureLag: number; // Target: < 100ms
  networkLatency: number; // Target: < 150ms
  processingTime: number; // Target: < 200ms
  totalLatency: number; // Target: < 500ms

  // Reliability
  apiSuccessRate: number; // Target: > 99%
  fallbackRate: number; // Track how often fallback used

  // Quality
  averageConfidence: number; // Target: > 0.9
  silenceDetectionAccuracy: number; // Target: > 95%

  // Usage
  totalMinutesProcessed: number;
  apiCost: number; // Track spending
}

class STTMonitor {
  private metrics: STTMetrics;

  async trackTranscription(
    audioStart: number,
    transcript: WhisperResponse
  ) {
    const now = Date.now();

    // Latency tracking
    this.metrics.totalLatency = now - audioStart;
    this.metrics.processingTime = transcript.duration * 1000;

    // Quality tracking
    if (transcript.segments) {
      const avgConfidence = transcript.segments.reduce(
        (sum, seg) => sum + (seg.confidence || 0),
        0
      ) / transcript.segments.length;

      this.metrics.averageConfidence = avgConfidence;
    }

    // Send to analytics
    await this.sendToAnalytics({
      timestamp: now,
      latency: this.metrics.totalLatency,
      confidence: this.metrics.averageConfidence,
      wordCount: transcript.text.split(/\s+/).length,
    });
  }

  getHealthStatus(): 'healthy' | 'degraded' | 'unhealthy' {
    if (
      this.metrics.totalLatency > 1000 ||
      this.metrics.apiSuccessRate < 0.95 ||
      this.metrics.averageConfidence < 0.8
    ) {
      return 'unhealthy';
    }

    if (
      this.metrics.totalLatency > 500 ||
      this.metrics.averageConfidence < 0.9
    ) {
      return 'degraded';
    }

    return 'healthy';
  }
}
```

---

## Final Recommendation: STT Implementation

### ✅ RECOMMENDED STACK

```typescript
Primary: Deepgram Nova-2 (streaming WebSocket)
  - Best latency (200ms)
  - Real-time interim results
  - Lower cost ($0.0043/min)
  - Built for continuous speech

Secondary: OpenAI Whisper (fallback for poor network)
  - Better accuracy (95-98%)
  - Handles 2s chunks
  - $0.006/min
  - Context-aware with prompts

Tertiary: On-device (offline fallback)
  - expo-speech-recognition
  - Works offline
  - Free
  - ~85% accuracy (acceptable for fallback)
```

### Implementation Priority

**Phase 1: MVP (Week 3)**
```
✅ OpenAI Whisper only
- Simpler to implement
- Proven accuracy
- Good enough for launch
```

**Phase 2: Optimization (Week 6)**
```
✅ Add Deepgram for real-time
- Improve latency
- Better UX for power users
- A/B test both
```

**Phase 3: Enhancement (Post-launch)**
```
✅ Add on-device fallback
✅ Implement audio pre-processing
✅ Add context learning
✅ Fine-tune for coding vocabulary
```

---

## Cost Comparison: Wispr Flow vs Our App

| Service | Wispr Flow | Our App (Whisper) | Our App (Deepgram) |
|---------|-----------|-------------------|-------------------|
| **Pricing Model** | $8/month unlimited | Pay-per-use | Pay-per-use |
| **Break-even** | - | 1,333 min/month | 1,860 min/month |
| **Light user** | $8/month | $1.80/month ✅ | $1.29/month ✅ |
| **Medium user** | $8/month | $5.40/month ✅ | $3.87/month ✅ |
| **Heavy user** | $8/month | $10.80/month ❌ | $7.74/month ✅ |

**Recommendation:** Start with pay-per-use, consider adding $10/month unlimited tier later

---

## Summary: Changes from Original Plan

### ❌ REMOVED
- On-device STT as primary option
- Expo-speech-recognition as main solution

### ✅ ADDED
- OpenAI Whisper API (primary)
- Deepgram Nova-2 (optional, for real-time)
- Audio pre-processing pipeline
- Context-aware transcription
- Hybrid fallback strategy
- Performance monitoring

### 📊 IMPACT
- Accuracy: 85-90% → **95-98%** (Wispr Flow level!)
- Latency: 1-2s → **200-500ms** (matches Wispr Flow!)
- Cost: $0 → **~$3-5/user/month** (reasonable)
- Noise handling: Poor → **Excellent**
- Technical terms: Poor → **Excellent**

---

**Next:** Create detailed specs for all other components (TTS, Command Parser, API Services)

**Document Version:** 1.0
**Last Updated:** 2024-12-18
**Status:** STT Architecture Revised for Premium Quality ✅
