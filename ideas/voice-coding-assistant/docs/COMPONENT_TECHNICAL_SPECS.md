# Component Technical Specifications

> Detailed implementation specifications for all major components and services

---

## Table of Contents

1. [Speech Services](#1-speech-services)
2. [Command Parser](#2-command-parser)
3. [API Services](#3-api-services)
4. [State Management](#4-state-management)
5. [Real-time Services](#5-real-time-services)
6. [Storage Services](#6-storage-services)
7. [Authentication Services](#7-authentication-services)
8. [UI Components](#8-ui-components)

---

## 1. Speech Services

### 1.1 Speech Recognition Service (Revised for Wispr Flow Quality)

**File:** `src/services/speech/SpeechRecognitionService.ts`

**Dependencies:**
```json
{
  "@react-native-community/netinfo": "^11.0.0",
  "expo-av": "~14.0.0",
  "react-native-fs": "^2.20.0"
}
```

**Class Specification:**

```typescript
import * as Audio from 'expo-av';
import NetInfo from '@react-native-community/netinfo';
import { EventEmitter } from 'events';

interface STTConfig {
  provider: 'whisper' | 'deepgram' | 'ondevice';
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  profanityFilter: boolean;
  enhanceAccuracy: boolean;
}

interface TranscriptResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  timestamp: number;
  alternatives?: Array<{
    transcript: string;
    confidence: number;
  }>;
  segments?: Array<{
    text: string;
    start: number;
    end: number;
    confidence: number;
  }>;
}

export class SpeechRecognitionService extends EventEmitter {
  private recording: Audio.Recording | null = null;
  private isRecording = false;
  private config: STTConfig;
  private currentProvider: STTProvider | null = null;
  private audioChunks: Blob[] = [];
  private vad: VoiceActivityDetector;
  private preprocessor: AudioPreProcessor;

  constructor(config: Partial<STTConfig> = {}) {
    super();

    this.config = {
      provider: 'whisper',
      language: 'en-US',
      continuous: true,
      interimResults: true,
      maxAlternatives: 3,
      profanityFilter: false,
      enhanceAccuracy: true,
      ...config,
    };

    this.vad = new VoiceActivityDetector();
    this.preprocessor = new AudioPreProcessor();
  }

  /**
   * Initialize and select best STT provider based on connection
   */
  async initialize(): Promise<void> {
    // Request permissions
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Microphone permission denied');
    }

    // Configure audio session
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    // Select provider based on network
    const provider = await this.selectProvider();
    this.currentProvider = provider;

    this.emit('initialized', { provider: this.config.provider });
  }

  /**
   * Select best STT provider based on connection quality
   */
  private async selectProvider(): Promise<STTProvider> {
    const connection = await NetInfo.fetch();

    // Check if online and connection quality
    if (!connection.isInternetReachable) {
      return new OnDeviceSTTProvider();
    }

    // Measure actual bandwidth
    const bandwidth = await this.measureBandwidth();

    if (connection.type === 'wifi' || bandwidth > 5000) {
      // Excellent connection: Use Deepgram (real-time streaming)
      return new DeepgramSTTProvider({
        apiKey: process.env.DEEPGRAM_API_KEY!,
        model: 'nova-2',
        language: this.config.language,
      });
    }

    if (bandwidth > 1000) {
      // Good connection: Use Whisper (chunked)
      return new WhisperSTTProvider({
        apiKey: process.env.OPENAI_API_KEY!,
        model: 'whisper-1',
        language: this.config.language.split('-')[0], // 'en'
      });
    }

    // Poor connection: Fall back to on-device
    return new OnDeviceSTTProvider();
  }

  /**
   * Start recording and transcription
   */
  async startListening(): Promise<void> {
    if (this.isRecording) {
      console.warn('Already recording');
      return;
    }

    if (!this.currentProvider) {
      await this.initialize();
    }

    // Create recording
    this.recording = new Audio.Recording();

    await this.recording.prepareToRecordAsync({
      android: {
        extension: '.webm',
        outputFormat: Audio.AndroidOutputFormat.WEBM,
        audioEncoder: Audio.AndroidAudioEncoder.OPUS,
        sampleRate: 16000,
        numberOfChannels: 1,
        bitRate: 128000,
      },
      ios: {
        extension: '.wav',
        audioQuality: Audio.IOSAudioQuality.HIGH,
        sampleRate: 16000,
        numberOfChannels: 1,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
      web: {
        mimeType: 'audio/webm',
        bitsPerSecond: 128000,
      },
    });

    await this.recording.startAsync();
    this.isRecording = true;

    this.emit('start');

    // Start processing audio
    if (this.config.continuous) {
      this.startContinuousProcessing();
    }
  }

  /**
   * Process audio in chunks for real-time transcription
   */
  private startContinuousProcessing(): void {
    const CHUNK_INTERVAL = 2000; // 2 seconds

    const interval = setInterval(async () => {
      if (!this.isRecording) {
        clearInterval(interval);
        return;
      }

      try {
        // Get current audio chunk
        const status = await this.recording!.getStatusAsync();
        if (!status.isRecording) return;

        // Stop and restart to get chunk
        const uri = this.recording!.getURI();
        if (!uri) return;

        // Read audio file
        const audioData = await this.readAudioFile(uri);

        // Pre-process audio
        let processedAudio = audioData;
        if (this.config.enhanceAccuracy) {
          processedAudio = await this.preprocessor.process(audioData);
        }

        // Check for voice activity
        const { isSpeaking, confidence } = this.vad.detect(processedAudio);

        if (isSpeaking && confidence > 0.5) {
          // Transcribe chunk
          const result = await this.currentProvider!.transcribe(processedAudio);

          this.emit('transcript', {
            transcript: result.text,
            confidence: result.confidence,
            isFinal: false,
            timestamp: Date.now(),
          } as TranscriptResult);
        }
      } catch (error) {
        this.emit('error', error);
      }
    }, CHUNK_INTERVAL);
  }

  /**
   * Stop recording and get final transcription
   */
  async stopListening(): Promise<TranscriptResult> {
    if (!this.isRecording || !this.recording) {
      throw new Error('Not currently recording');
    }

    await this.recording.stopAndUnloadAsync();
    const uri = this.recording.getURI();

    this.isRecording = false;

    if (!uri) {
      throw new Error('No audio recorded');
    }

    // Get final audio
    const audioData = await this.readAudioFile(uri);

    // Pre-process
    let processedAudio = audioData;
    if (this.config.enhanceAccuracy) {
      processedAudio = await this.preprocessor.process(audioData);
    }

    // Final transcription
    const result = await this.currentProvider!.transcribe(processedAudio);

    const finalResult: TranscriptResult = {
      transcript: result.text,
      confidence: result.confidence,
      isFinal: true,
      timestamp: Date.now(),
      alternatives: result.alternatives,
      segments: result.segments,
    };

    this.emit('finalTranscript', finalResult);
    this.emit('stop');

    // Cleanup
    this.recording = null;

    return finalResult;
  }

  /**
   * Cancel current recording
   */
  async cancel(): Promise<void> {
    if (this.recording) {
      await this.recording.stopAndUnloadAsync();
      this.recording = null;
    }

    this.isRecording = false;
    this.emit('cancel');
  }

  /**
   * Get current recording status
   */
  getStatus(): {
    isRecording: boolean;
    provider: string;
    duration: number;
  } {
    return {
      isRecording: this.isRecording,
      provider: this.config.provider,
      duration: 0, // TODO: Track duration
    };
  }

  /**
   * Measure bandwidth for provider selection
   */
  private async measureBandwidth(): Promise<number> {
    const startTime = Date.now();
    const testSize = 1024 * 10; // 10 KB

    try {
      const response = await fetch(
        `https://httpbin.org/bytes/${testSize}`,
        { method: 'GET' }
      );

      await response.arrayBuffer();

      const duration = Date.now() - startTime;
      const kbps = (testSize * 8) / duration; // kb/s

      return kbps;
    } catch {
      return 0; // Offline or error
    }
  }

  /**
   * Read audio file as ArrayBuffer
   */
  private async readAudioFile(uri: string): Promise<ArrayBuffer> {
    const response = await fetch(uri);
    return response.arrayBuffer();
  }
}
```

**Provider Interfaces:**

```typescript
interface STTProvider {
  transcribe(audio: ArrayBuffer): Promise<STTResponse>;
}

interface STTResponse {
  text: string;
  confidence: number;
  alternatives?: Array<{
    text: string;
    confidence: number;
  }>;
  segments?: Array<{
    text: string;
    start: number;
    end: number;
    confidence: number;
  }>;
  language?: string;
  duration?: number;
}
```

**Whisper Provider Implementation:**

```typescript
class WhisperSTTProvider implements STTProvider {
  constructor(
    private config: {
      apiKey: string;
      model: string;
      language: string;
    }
  ) {}

  async transcribe(audio: ArrayBuffer): Promise<STTResponse> {
    const formData = new FormData();

    // Convert ArrayBuffer to Blob
    const audioBlob = new Blob([audio], { type: 'audio/webm' });
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', this.config.model);
    formData.append('language', this.config.language);
    formData.append('response_format', 'verbose_json');
    formData.append('temperature', '0.2'); // Lower = more accurate

    const response = await fetch(
      'https://api.openai.com/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Whisper API error: ${response.statusText}`);
    }

    const result = await response.json();

    return {
      text: result.text,
      confidence: this.calculateAverageConfidence(result.segments),
      segments: result.segments?.map((seg: any) => ({
        text: seg.text,
        start: seg.start,
        end: seg.end,
        confidence: seg.confidence || 0,
      })),
      language: result.language,
      duration: result.duration,
    };
  }

  private calculateAverageConfidence(segments?: any[]): number {
    if (!segments || segments.length === 0) return 0.95;

    const total = segments.reduce(
      (sum, seg) => sum + (seg.confidence || 0),
      0
    );

    return total / segments.length;
  }
}
```

**Deepgram Provider Implementation:**

```typescript
class DeepgramSTTProvider implements STTProvider {
  private socket: WebSocket | null = null;

  constructor(
    private config: {
      apiKey: string;
      model: string;
      language: string;
    }
  ) {}

  async transcribe(audio: ArrayBuffer): Promise<STTResponse> {
    const response = await fetch(
      `https://api.deepgram.com/v1/listen?` +
        new URLSearchParams({
          model: this.config.model,
          language: this.config.language,
          punctuate: 'true',
          smart_format: 'true',
        }).toString(),
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.config.apiKey}`,
          'Content-Type': 'audio/webm',
        },
        body: audio,
      }
    );

    if (!response.ok) {
      throw new Error(`Deepgram API error: ${response.statusText}`);
    }

    const result = await response.json();
    const channel = result.results.channels[0];
    const alternative = channel.alternatives[0];

    return {
      text: alternative.transcript,
      confidence: alternative.confidence,
      alternatives: channel.alternatives.slice(1).map((alt: any) => ({
        text: alt.transcript,
        confidence: alt.confidence,
      })),
      segments: alternative.words?.map((word: any) => ({
        text: word.word,
        start: word.start,
        end: word.end,
        confidence: word.confidence,
      })),
    };
  }
}
```

---

### 1.2 Text-to-Speech Service

**File:** `src/services/speech/TextToSpeechService.ts`

**Dependencies:**
```json
{
  "expo-speech": "~12.0.0"
}
```

**Class Specification:**

```typescript
import * as Speech from 'expo-speech';

interface TTSConfig {
  language: string;
  pitch: number; // 0.5 - 2.0
  rate: number; // 0.1 - 2.0
  volume: number; // 0.0 - 1.0
  voice?: string;
  quality: 'default' | 'enhanced';
}

interface SpeechQueueItem {
  id: string;
  text: string;
  options?: Partial<TTSConfig>;
  priority: number;
  onStart?: () => void;
  onDone?: () => void;
  onError?: (error: Error) => void;
}

export class TextToSpeechService {
  private isSpeaking = false;
  private queue: SpeechQueueItem[] = [];
  private config: TTSConfig;
  private currentSpeechId: string | null = null;

  constructor(config: Partial<TTSConfig> = {}) {
    this.config = {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.9, // Slightly slower for clarity
      volume: 1.0,
      quality: 'enhanced',
      ...config,
    };
  }

  /**
   * Speak text immediately (interrupts current speech)
   */
  async speak(
    text: string,
    options?: Partial<TTSConfig> & {
      onStart?: () => void;
      onDone?: () => void;
      onError?: (error: Error) => void;
    }
  ): Promise<void> {
    // Stop current speech
    if (this.isSpeaking) {
      await this.stop();
    }

    const mergedOptions = {
      ...this.config,
      ...options,
    };

    this.isSpeaking = true;
    this.currentSpeechId = this.generateId();

    return new Promise((resolve, reject) => {
      Speech.speak(text, {
        language: mergedOptions.language,
        pitch: mergedOptions.pitch,
        rate: mergedOptions.rate,
        volume: mergedOptions.volume,
        voice: mergedOptions.voice,
        onStart: () => {
          options?.onStart?.();
        },
        onDone: () => {
          this.isSpeaking = false;
          this.currentSpeechId = null;
          options?.onDone?.();
          this.processQueue();
          resolve();
        },
        onError: (error) => {
          this.isSpeaking = false;
          this.currentSpeechId = null;
          const err = new Error(error.error);
          options?.onError?.(err);
          reject(err);
        },
        onStopped: () => {
          this.isSpeaking = false;
          this.currentSpeechId = null;
          resolve();
        },
      });
    });
  }

  /**
   * Add text to speech queue (doesn't interrupt)
   */
  queueSpeech(
    text: string,
    options?: Partial<TTSConfig> & {
      priority?: number;
      onStart?: () => void;
      onDone?: () => void;
      onError?: (error: Error) => void;
    }
  ): string {
    const id = this.generateId();

    this.queue.push({
      id,
      text,
      options,
      priority: options?.priority ?? 0,
      onStart: options?.onStart,
      onDone: options?.onDone,
      onError: options?.onError,
    });

    // Sort by priority (higher first)
    this.queue.sort((a, b) => b.priority - a.priority);

    // Start processing if not speaking
    if (!this.isSpeaking) {
      this.processQueue();
    }

    return id;
  }

  /**
   * Process speech queue
   */
  private async processQueue(): Promise<void> {
    if (this.queue.length === 0 || this.isSpeaking) {
      return;
    }

    const item = this.queue.shift()!;

    try {
      await this.speak(item.text, {
        ...item.options,
        onStart: item.onStart,
        onDone: () => {
          item.onDone?.();
          this.processQueue();
        },
        onError: item.onError,
      });
    } catch (error) {
      item.onError?.(error as Error);
      this.processQueue();
    }
  }

  /**
   * Stop current speech
   */
  async stop(): Promise<void> {
    await Speech.stop();
    this.isSpeaking = false;
    this.currentSpeechId = null;
  }

  /**
   * Pause current speech (iOS only)
   */
  async pause(): Promise<void> {
    await Speech.pause();
  }

  /**
   * Resume paused speech (iOS only)
   */
  async resume(): Promise<void> {
    await Speech.resume();
  }

  /**
   * Clear speech queue
   */
  clearQueue(): void {
    this.queue = [];
  }

  /**
   * Remove specific item from queue
   */
  removeFromQueue(id: string): boolean {
    const index = this.queue.findIndex(item => item.id === id);
    if (index !== -1) {
      this.queue.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Get available voices
   */
  async getAvailableVoices(): Promise<Speech.Voice[]> {
    return await Speech.getAvailableVoicesAsync();
  }

  /**
   * Get current status
   */
  getStatus(): {
    isSpeaking: boolean;
    queueLength: number;
    currentSpeechId: string | null;
  } {
    return {
      isSpeaking: this.isSpeaking,
      queueLength: this.queue.length,
      currentSpeechId: this.currentSpeechId,
    };
  }

  /**
   * Set default configuration
   */
  setConfig(config: Partial<TTSConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }

  /**
   * Speak with SSML (if supported)
   */
  async speakSSML(ssml: string): Promise<void> {
    // Convert SSML to plain text for expo-speech
    // (SSML not directly supported, so we strip tags)
    const plainText = this.stripSSML(ssml);
    await this.speak(plainText);
  }

  /**
   * Strip SSML tags
   */
  private stripSSML(ssml: string): string {
    return ssml.replace(/<[^>]*>/g, '');
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `speech-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

**Enhanced TTS with Emotion/Tone Support:**

```typescript
interface EmotionalSpeechOptions extends TTSConfig {
  emotion?: 'neutral' | 'happy' | 'sad' | 'excited' | 'calm' | 'urgent';
}

export class EnhancedTTSService extends TextToSpeechService {
  /**
   * Speak with emotional tone
   */
  async speakWithEmotion(
    text: string,
    emotion: EmotionalSpeechOptions['emotion'] = 'neutral'
  ): Promise<void> {
    const emotionConfig = this.getEmotionConfig(emotion);

    await this.speak(text, emotionConfig);
  }

  /**
   * Get TTS config for emotion
   */
  private getEmotionConfig(
    emotion: EmotionalSpeechOptions['emotion']
  ): Partial<TTSConfig> {
    switch (emotion) {
      case 'happy':
        return { pitch: 1.2, rate: 1.0 }; // Higher pitch, normal speed

      case 'sad':
        return { pitch: 0.8, rate: 0.8 }; // Lower pitch, slower

      case 'excited':
        return { pitch: 1.3, rate: 1.2 }; // Higher pitch, faster

      case 'calm':
        return { pitch: 0.9, rate: 0.8 }; // Slightly lower, slower

      case 'urgent':
        return { pitch: 1.1, rate: 1.3 }; // Slightly higher, much faster

      case 'neutral':
      default:
        return { pitch: 1.0, rate: 0.9 }; // Default
    }
  }

  /**
   * Speak agent status with appropriate emotion
   */
  async speakAgentStatus(status: string, message: string): Promise<void> {
    const emotion = this.getEmotionForStatus(status);
    await this.speakWithEmotion(message, emotion);
  }

  private getEmotionForStatus(status: string): EmotionalSpeechOptions['emotion'] {
    switch (status) {
      case 'FINISHED':
        return 'happy';
      case 'ERROR':
        return 'sad';
      case 'RUNNING':
        return 'calm';
      case 'CREATING':
        return 'neutral';
      default:
        return 'neutral';
    }
  }
}
```

---

## 2. Command Parser

**File:** `src/services/speech/CommandParser.ts`

**Dependencies:**
```json
{
  "natural": "^6.0.0",
  "compromise": "^14.0.0"
}
```

**Implementation:**

```typescript
import nlp from 'compromise';

export type CommandIntent =
  | 'status_query'
  | 'agent_create'
  | 'agent_control'
  | 'repo_query'
  | 'help'
  | 'unknown';

export type CommandAction =
  | 'list'
  | 'start'
  | 'create'
  | 'pause'
  | 'stop'
  | 'resume'
  | 'show'
  | 'cancel';

export interface VoiceCommand {
  intent: CommandIntent;
  action?: CommandAction;
  parameters: {
    repo?: string;
    branch?: string;
    task?: string;
    agentId?: string;
    filter?: 'running' | 'finished' | 'failed' | 'all';
    model?: string;
  };
  confidence: number;
  originalText: string;
  normalizedText: string;
}

export class CommandParser {
  private intentPatterns: Map<CommandIntent, RegExp[]>;
  private actionPatterns: Map<CommandAction, RegExp[]>;
  private recentCommands: VoiceCommand[] = [];
  private userVocabulary: Set<string> = new Set();

  constructor() {
    this.intentPatterns = new Map([
      [
        'status_query',
        [
          /\b(status|state|running|active|working)\b/i,
          /\b(what|show|list|tell).*(agent|task)/i,
          /\b(how|any).*(doing|progress)/i,
        ],
      ],
      [
        'agent_create',
        [
          /\b(start|create|begin|initiate|make).*(agent|task)/i,
          /\b(new agent|build|develop)\b/i,
        ],
      ],
      [
        'agent_control',
        [
          /\b(stop|pause|cancel|kill|terminate|resume|continue)\b/i,
        ],
      ],
      [
        'repo_query',
        [
          /\b(repository|repositories|repo|repos)\b/i,
          /\b(show|list).*(project|repository)/i,
        ],
      ],
      [
        'help',
        [
          /\b(help|what can|commands|how do)\b/i,
        ],
      ],
    ]);

    this.actionPatterns = new Map([
      ['list', [/\b(list|show|display|tell)\b/i]],
      ['start', [/\b(start|create|begin|initiate)\b/i]],
      ['pause', [/\b(pause|hold|suspend)\b/i]],
      ['stop', [/\b(stop|cancel|kill|terminate)\b/i]],
      ['resume', [/\b(resume|continue|restart)\b/i]],
    ]);
  }

  /**
   * Parse voice transcript into structured command
   */
  parse(transcript: string): VoiceCommand {
    const normalized = this.normalizeText(transcript);

    // Detect intent
    const intent = this.detectIntent(normalized);

    // Detect action
    const action = this.detectAction(normalized);

    // Extract parameters
    const parameters = this.extractParameters(normalized, intent);

    // Calculate confidence
    const confidence = this.calculateConfidence(normalized, intent, parameters);

    const command: VoiceCommand = {
      intent,
      action,
      parameters,
      confidence,
      originalText: transcript,
      normalizedText: normalized,
    };

    // Store for context
    this.recentCommands.push(command);
    if (this.recentCommands.length > 10) {
      this.recentCommands.shift();
    }

    return command;
  }

  /**
   * Normalize text for better matching
   */
  private normalizeText(text: string): string {
    let normalized = text.toLowerCase().trim();

    // Fix common speech-to-text errors
    const corrections = {
      'reactor': 'React',
      'type script': 'TypeScript',
      'get hub': 'GitHub',
      'AP I': 'API',
      'jay sun': 'JSON',
      'agent ID': 'agentId',
      'PR': 'pull request',
    };

    for (const [wrong, right] of Object.entries(corrections)) {
      normalized = normalized.replace(
        new RegExp(wrong, 'gi'),
        right
      );
    }

    return normalized;
  }

  /**
   * Detect command intent
   */
  private detectIntent(text: string): CommandIntent {
    let bestMatch: CommandIntent = 'unknown';
    let maxMatches = 0;

    for (const [intent, patterns] of this.intentPatterns.entries()) {
      const matches = patterns.filter(pattern => pattern.test(text)).length;

      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = intent;
      }
    }

    return bestMatch;
  }

  /**
   * Detect command action
   */
  private detectAction(text: string): CommandAction | undefined {
    for (const [action, patterns] of this.actionPatterns.entries()) {
      if (patterns.some(pattern => pattern.test(text))) {
        return action;
      }
    }

    return undefined;
  }

  /**
   * Extract parameters from command
   */
  private extractParameters(
    text: string,
    intent: CommandIntent
  ): VoiceCommand['parameters'] {
    const params: VoiceCommand['parameters'] = {};

    // Use NLP to parse the sentence
    const doc = nlp(text);

    switch (intent) {
      case 'agent_create':
        // Extract repository name
        // Patterns: "on wallet-frontend", "for api-service", "in auth-service"
        const repoMatch = text.match(
          /\b(?:on|for|in|to)\s+([a-z0-9\-_]+(?:\/[a-z0-9\-_]+)?)\b/i
        );
        if (repoMatch) {
          params.repo = repoMatch[1];
        }

        // Extract branch
        const branchMatch = text.match(
          /\b(?:branch|on branch)\s+([a-z0-9\-_\/]+)\b/i
        );
        if (branchMatch) {
          params.branch = branchMatch[1];
        }

        // Extract task (everything after "to" or "for")
        const taskMatch = text.match(/\b(?:to|for)\s+(.+?)(?:\s+on|\s+in|$)/i);
        if (taskMatch) {
          params.task = taskMatch[1].trim();
        }

        // Extract model if mentioned
        const modelMatch = text.match(
          /\busing\s+(claude|sonnet|opus|gpt|o1)\b/i
        );
        if (modelMatch) {
          params.model = this.normalizeModelName(modelMatch[1]);
        }

        break;

      case 'agent_control':
        // Extract agent identifier
        const agentMatch = text.match(
          /\b(?:agent|the)\s+([a-z0-9\-]+)\s+(?:agent|on|in)\b/i
        );
        if (agentMatch) {
          params.agentId = agentMatch[1];
        }

        // If no specific agent, check for "all"
        if (/\ball\s+agents?\b/i.test(text)) {
          params.agentId = 'all';
        }

        break;

      case 'status_query':
        // Extract filter
        if (/\brunning\b/i.test(text)) {
          params.filter = 'running';
        } else if (/\bfinished\b/i.test(text)) {
          params.filter = 'finished';
        } else if (/\bfailed\b/i.test(text)) {
          params.filter = 'failed';
        } else {
          params.filter = 'all';
        }

        break;

      case 'repo_query':
        // Extract repo name if specified
        const repQueryMatch = text.match(
          /\b(?:for|on)\s+([a-z0-9\-_]+)\b/i
        );
        if (repQueryMatch) {
          params.repo = repQueryMatch[1];
        }

        break;
    }

    return params;
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(
    text: string,
    intent: CommandIntent,
    parameters: VoiceCommand['parameters']
  ): number {
    let score = 0.5; // Base confidence

    // Intent match boosts confidence
    if (intent !== 'unknown') {
      score += 0.2;
    }

    // Parameter extraction boosts confidence
    const paramCount = Object.keys(parameters).filter(
      key => parameters[key as keyof typeof parameters] != null
    ).length;

    score += paramCount * 0.1;

    // Recent similar commands boost confidence
    const similarRecent = this.recentCommands.filter(
      cmd => cmd.intent === intent
    ).length;

    if (similarRecent > 0) {
      score += 0.1;
    }

    // Cap at 1.0
    return Math.min(score, 1.0);
  }

  /**
   * Normalize model names
   */
  private normalizeModelName(model: string): string {
    const normalized = model.toLowerCase();

    const modelMap: Record<string, string> = {
      'claude': 'claude-3.5-sonnet',
      'sonnet': 'claude-3.5-sonnet',
      'opus': 'claude-opus-4',
      'gpt': 'gpt-4',
      'o1': 'o1-preview',
    };

    return modelMap[normalized] || 'claude-3.5-sonnet';
  }

  /**
   * Get suggestions for low confidence commands
   */
  getSuggestions(command: VoiceCommand): string[] {
    if (command.confidence >= 0.7) {
      return [];
    }

    const suggestions: string[] = [
      "Try: 'List my agents'",
      "Try: 'Start an agent on wallet-frontend to add dark mode'",
      "Try: 'What's the status of my agents?'",
      "Try: 'Pause the agent on api-service'",
    ];

    // Add context-specific suggestions
    if (command.intent === 'agent_create' && !command.parameters.repo) {
      suggestions.unshift(
        "I didn't catch the repository name. Try: 'Start an agent on [repo-name] to [task]'"
      );
    }

    return suggestions;
  }

  /**
   * Learn from user feedback
   */
  learnFromCorrection(
    command: VoiceCommand,
    correctedCommand: Partial<VoiceCommand>
  ): void {
    // Update vocabulary with new terms
    const newTerms = [
      correctedCommand.parameters?.repo,
      correctedCommand.parameters?.task,
    ].filter(Boolean) as string[];

    newTerms.forEach(term => this.userVocabulary.add(term));

    // TODO: Implement ML-based learning (future enhancement)
  }

  /**
   * Get command history
   */
  getHistory(): VoiceCommand[] {
    return [...this.recentCommands];
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.recentCommands = [];
  }
}
```

---

**Continue in next section with API Services, State Management, etc...**

**Document Version:** 1.0 (Part 1 of 3)
**Last Updated:** 2024-12-18
**Status:** Component Specs - Speech Services Complete ✅
