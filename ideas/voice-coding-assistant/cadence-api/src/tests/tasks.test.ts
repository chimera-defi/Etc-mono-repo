import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { buildApp } from '../index.js';
import { FastifyInstance } from 'fastify';
import { tasks } from '../routes/tasks.js';

describe('Task Routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    // Clear tasks before each test
    tasks.clear();
  });

  describe('POST /api/tasks', () => {
    it('creates a new task', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/tasks',
        payload: {
          task: 'Add dark mode to the app',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload);
      expect(body.id).toBeDefined();
      expect(body.task).toBe('Add dark mode to the app');
      expect(body.status).toBe('running');
      expect(body.createdAt).toBeDefined();
    });

    it('returns 400 for empty task', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/tasks',
        payload: {
          task: '',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('accepts optional repoUrl', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/tasks',
        payload: {
          task: 'Fix the bug',
          repoUrl: 'https://github.com/user/repo',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload);
      expect(body.repoUrl).toBe('https://github.com/user/repo');
    });
  });

  describe('GET /api/tasks', () => {
    it('returns empty list initially', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/tasks',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.tasks).toEqual([]);
    });

    it('returns created tasks', async () => {
      // Create a task first
      await app.inject({
        method: 'POST',
        url: '/api/tasks',
        payload: { task: 'Test task' },
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/tasks',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.tasks).toHaveLength(1);
      expect(body.tasks[0].task).toBe('Test task');
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('returns 404 for non-existent task', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/tasks/non-existent-id',
      });

      expect(response.statusCode).toBe(404);
    });

    it('returns task by id', async () => {
      // Create a task first
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/tasks',
        payload: { task: 'Find me' },
      });
      const created = JSON.parse(createResponse.payload);

      const response = await app.inject({
        method: 'GET',
        url: `/api/tasks/${created.id}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.task).toBe('Find me');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('cancels a running task', async () => {
      // Create a task first
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/tasks',
        payload: { task: 'Cancel me' },
      });
      const created = JSON.parse(createResponse.payload);

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/tasks/${created.id}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.task.status).toBe('cancelled');
    });

    it('returns 404 for non-existent task', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/tasks/non-existent-id',
      });

      expect(response.statusCode).toBe(404);
    });
  });
});
