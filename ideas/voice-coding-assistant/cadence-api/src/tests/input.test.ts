import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { buildApp } from '../index.js';
import { FastifyInstance } from 'fastify';
import { tasks } from '../routes/tasks.js';

describe('Input Routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    tasks.clear();
  });

  describe('POST /api/input/text', () => {
    it('accepts text input and creates task for create_task intent', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/input/text',
        payload: {
          text: 'add dark mode to the settings page',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload);
      expect(body.task).toBeDefined();
      expect(body.command.intent).toBe('create_task');
      expect(body.source).toBe('text');
    });

    it('returns command for non-create intents', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/input/text',
        payload: {
          text: 'what is the status',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.command.intent).toBe('check_status');
      expect(body.task).toBeUndefined();
    });

    it('returns 400 for empty text', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/input/text',
        payload: {
          text: '',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('accepts optional repoUrl', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/input/text',
        payload: {
          text: 'fix the bug',
          repoUrl: 'https://github.com/user/repo',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload);
      expect(body.task.repoUrl).toBe('https://github.com/user/repo');
    });
  });

  describe('POST /api/input/command', () => {
    it('creates task with create_task action', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/input/command',
        payload: {
          action: 'create_task',
          task: 'implement feature X',
          repoUrl: 'https://github.com/user/repo',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload);
      expect(body.task.task).toBe('implement feature X');
      expect(body.task.status).toBe('running');
    });

    it('returns 400 for create_task without task', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/input/command',
        payload: {
          action: 'create_task',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('cancels task with cancel_task action', async () => {
      // Create a task first
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/tasks',
        payload: { task: 'test task' },
      });
      const created = JSON.parse(createResponse.payload);

      // Cancel it
      const response = await app.inject({
        method: 'POST',
        url: '/api/input/command',
        payload: {
          action: 'cancel_task',
          taskId: created.id,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.task.status).toBe('cancelled');
    });

    it('gets status with get_status action', async () => {
      // Create a task first
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/tasks',
        payload: { task: 'test task' },
      });
      const created = JSON.parse(createResponse.payload);

      // Get status
      const response = await app.inject({
        method: 'POST',
        url: '/api/input/command',
        payload: {
          action: 'get_status',
          taskId: created.id,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.task.id).toBe(created.id);
    });

    it('returns 400 for unknown action', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/input/command',
        payload: {
          action: 'unknown_action',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
