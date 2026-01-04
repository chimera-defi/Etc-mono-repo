import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../index.js';
import { FastifyInstance } from 'fastify';

describe('Voice Routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/voice/transcribe', () => {
    it('rejects request without audio', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/voice/transcribe',
        payload: {},
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.error).toBe('Invalid request');
    });

    it('rejects request with invalid format', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/voice/transcribe',
        payload: {
          audio: 'base64data',
          format: 'invalid',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('accepts valid request structure', async () => {
      // Without OPENAI_API_KEY, this will fail at transcription step
      // but we can verify the request validation passes
      const response = await app.inject({
        method: 'POST',
        url: '/api/voice/transcribe',
        payload: {
          audio: 'SGVsbG8gV29ybGQ=', // base64 "Hello World"
          format: 'm4a',
        },
      });

      // Will be 500 because OPENAI_API_KEY not set, but validation passed
      expect(response.statusCode).toBe(500);
      const body = JSON.parse(response.payload);
      expect(body.error).toBe('Transcription failed');
      expect(body.message).toContain('OPENAI_API_KEY');
    });
  });

  describe('POST /api/voice/parse', () => {
    it('rejects request without text', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/voice/parse',
        payload: {},
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.error).toBe('text is required');
    });

    it('parses create_task intent', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/voice/parse',
        payload: { text: 'add a dark mode toggle' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.intent).toBe('create_task');
      expect(body.task).toBeDefined();
      expect(body.confidence).toBeGreaterThan(0);
    });

    it('parses check_status intent', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/voice/parse',
        payload: { text: "what's the status" },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.intent).toBe('check_status');
    });

    it('parses list_tasks intent', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/voice/parse',
        payload: { text: 'list all tasks' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.intent).toBe('list_tasks');
    });

    it('parses cancel_task intent', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/voice/parse',
        payload: { text: 'cancel the task' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.intent).toBe('cancel_task');
    });

    it('returns unknown for unrecognized commands', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/voice/parse',
        payload: { text: 'hello world' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.intent).toBe('unknown');
    });
  });

  describe('POST /api/voice/command', () => {
    it('rejects request without audio', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/voice/command',
        payload: {},
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.error).toBe('Invalid request');
    });

    it('accepts valid request structure', async () => {
      // Without OPENAI_API_KEY, this will fail at transcription step
      const response = await app.inject({
        method: 'POST',
        url: '/api/voice/command',
        payload: {
          audio: 'SGVsbG8gV29ybGQ=',
          format: 'mp3',
        },
      });

      // Will be 500 because OPENAI_API_KEY not set
      expect(response.statusCode).toBe(500);
      const body = JSON.parse(response.payload);
      expect(body.error).toBe('Voice command processing failed');
    });
  });
});
