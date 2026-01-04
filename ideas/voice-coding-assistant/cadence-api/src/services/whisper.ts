import OpenAI from 'openai';
import { TranscribeResponse } from '../types.js';

export class WhisperService {
  private client: OpenAI | null = null;

  private getClient(): OpenAI {
    if (!this.client) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY is not set');
      }
      this.client = new OpenAI({ apiKey });
    }
    return this.client;
  }

  async transcribe(audioBase64: string, format: string): Promise<TranscribeResponse> {
    const client = this.getClient();

    // Convert base64 to buffer
    const audioBuffer = Buffer.from(audioBase64, 'base64');

    // Create a File-like object for the API
    const audioFile = new File([audioBuffer], `audio.${format}`, {
      type: this.getMimeType(format),
    });

    const startTime = Date.now();

    const response = await client.audio.transcriptions.create({
      model: 'whisper-1',
      file: audioFile,
      language: 'en',
    });

    const duration = (Date.now() - startTime) / 1000;

    return {
      text: response.text,
      duration,
    };
  }

  private getMimeType(format: string): string {
    const mimeTypes: Record<string, string> = {
      m4a: 'audio/m4a',
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      webm: 'audio/webm',
    };
    return mimeTypes[format] || 'audio/mpeg';
  }
}
