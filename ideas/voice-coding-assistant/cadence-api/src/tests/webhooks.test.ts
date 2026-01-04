import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { buildApp } from '../index.js';
import { FastifyInstance } from 'fastify';
import { tasks } from '../routes/tasks.js';
import { createHmac } from 'crypto';

describe('Webhook Routes', () => {
  let app: FastifyInstance;
  const webhookSecret = 'test-webhook-secret';

  beforeAll(async () => {
    process.env.GITHUB_WEBHOOK_SECRET = webhookSecret;
    app = await buildApp();
  });

  afterAll(async () => {
    delete process.env.GITHUB_WEBHOOK_SECRET;
    await app.close();
  });

  beforeEach(() => {
    tasks.clear();
  });

  function createSignature(payload: object): string {
    const body = JSON.stringify(payload);
    return `sha256=${createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex')}`;
  }

  describe('Signature Verification', () => {
    it('accepts valid webhook with correct signature', async () => {
      const payload = {
        action: 'opened',
        repository: {
          full_name: 'user/repo',
          html_url: 'https://github.com/user/repo',
        },
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/webhooks/github',
        headers: {
          'x-github-event': 'pull_request',
          'x-hub-signature-256': createSignature(payload),
        },
        payload,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.received).toBe(true);
      expect(body.event).toBe('pull_request');
    });

    it('rejects invalid signature with 401', async () => {
      const payload = {
        action: 'opened',
        repository: {
          full_name: 'user/repo',
          html_url: 'https://github.com/user/repo',
        },
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/webhooks/github',
        headers: {
          'x-github-event': 'pull_request',
          'x-hub-signature-256': 'sha256=invalid',
        },
        payload,
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.payload);
      expect(body.error).toBe('Invalid signature');
    });

    it('rejects signature with wrong length', async () => {
      const payload = { action: 'opened' };

      const response = await app.inject({
        method: 'POST',
        url: '/api/webhooks/github',
        headers: {
          'x-github-event': 'pull_request',
          'x-hub-signature-256': 'sha256=tooshort',
        },
        payload,
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('Pull Request Events - Side Effects', () => {
    it('updates task status to completed when PR is merged', async () => {
      const prUrl = 'https://github.com/user/repo/pull/123';

      // Create a task that references this PR in its output
      const taskId = 'task-for-pr-123';
      tasks.set(taskId, {
        id: taskId,
        task: 'Add feature X',
        status: 'running',
        createdAt: new Date().toISOString(),
        output: `Created PR: ${prUrl}`,
      });

      const payload = {
        action: 'closed',
        repository: {
          full_name: 'user/repo',
          html_url: 'https://github.com/user/repo',
        },
        pull_request: {
          number: 123,
          html_url: prUrl,
          title: 'Add feature X',
          state: 'closed',
          merged: true,
          head: { ref: 'feature-x' },
          base: { ref: 'main' },
        },
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/webhooks/github',
        headers: {
          'x-github-event': 'pull_request',
          'x-hub-signature-256': createSignature(payload),
        },
        payload,
      });

      expect(response.statusCode).toBe(200);

      // Verify task was updated
      const updatedTask = tasks.get(taskId);
      expect(updatedTask).toBeDefined();
      expect(updatedTask!.status).toBe('completed');
      expect(updatedTask!.completedAt).toBeDefined();
    });

    it('updates task status to cancelled when PR is closed without merge', async () => {
      const prUrl = 'https://github.com/user/repo/pull/456';

      // Create a task that references this PR
      const taskId = 'task-for-pr-456';
      tasks.set(taskId, {
        id: taskId,
        task: 'Fix bug Y',
        status: 'running',
        createdAt: new Date().toISOString(),
        output: `PR created: ${prUrl}`,
      });

      const payload = {
        action: 'closed',
        repository: {
          full_name: 'user/repo',
          html_url: 'https://github.com/user/repo',
        },
        pull_request: {
          number: 456,
          html_url: prUrl,
          title: 'Fix bug Y',
          state: 'closed',
          merged: false,
          head: { ref: 'fix-bug-y' },
          base: { ref: 'main' },
        },
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/webhooks/github',
        headers: {
          'x-github-event': 'pull_request',
          'x-hub-signature-256': createSignature(payload),
        },
        payload,
      });

      expect(response.statusCode).toBe(200);

      // Verify task was cancelled (not completed)
      const updatedTask = tasks.get(taskId);
      expect(updatedTask).toBeDefined();
      expect(updatedTask!.status).toBe('cancelled');
      expect(updatedTask!.completedAt).toBeDefined();
    });

    it('does not modify tasks when no matching task found', async () => {
      const prUrl = 'https://github.com/user/repo/pull/789';

      // Create a task that does NOT reference this PR
      const taskId = 'unrelated-task';
      tasks.set(taskId, {
        id: taskId,
        task: 'Some other task',
        status: 'running',
        createdAt: new Date().toISOString(),
        output: 'Some output without PR URL',
      });

      const payload = {
        action: 'closed',
        repository: {
          full_name: 'user/repo',
          html_url: 'https://github.com/user/repo',
        },
        pull_request: {
          number: 789,
          html_url: prUrl,
          title: 'Unrelated PR',
          state: 'closed',
          merged: true,
          head: { ref: 'some-branch' },
          base: { ref: 'main' },
        },
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/webhooks/github',
        headers: {
          'x-github-event': 'pull_request',
          'x-hub-signature-256': createSignature(payload),
        },
        payload,
      });

      expect(response.statusCode).toBe(200);

      // Task should remain unchanged
      const task = tasks.get(taskId);
      expect(task!.status).toBe('running');
      expect(task!.completedAt).toBeUndefined();
    });
  });

  describe('Issue Comment Events - Side Effects', () => {
    it('creates task from @cadence-ai mention', async () => {
      const taskCountBefore = tasks.size;

      const payload = {
        action: 'created',
        repository: {
          full_name: 'user/repo',
          html_url: 'https://github.com/user/repo',
        },
        comment: {
          body: '@cadence-ai fix the failing tests',
          user: { login: 'testuser' },
        },
        issue: {
          number: 123,
          title: 'Test Issue',
          body: 'Test body',
        },
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/webhooks/github',
        headers: {
          'x-github-event': 'issue_comment',
          'x-hub-signature-256': createSignature(payload),
        },
        payload,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.received).toBe(true);
      expect(body.handled).toBe(true);
      expect(body.taskId).toBeDefined();
      expect(body.action).toBe('task_created');

      // Verify a task was actually created
      expect(tasks.size).toBe(taskCountBefore + 1);

      // Verify task content
      const createdTask = tasks.get(body.taskId);
      expect(createdTask).toBeDefined();
      expect(createdTask!.task).toBe('fix the failing tests');
      expect(createdTask!.repoUrl).toBe('https://github.com/user/repo');
      expect(createdTask!.status).toBe('pending');
      expect(createdTask!.output).toContain('testuser');
      expect(createdTask!.output).toContain('issue #123');
    });

    it('ignores comments without @cadence-ai mention', async () => {
      const taskCountBefore = tasks.size;

      const payload = {
        action: 'created',
        repository: {
          full_name: 'user/repo',
          html_url: 'https://github.com/user/repo',
        },
        comment: {
          body: 'Just a regular comment',
          user: { login: 'testuser' },
        },
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/webhooks/github',
        headers: {
          'x-github-event': 'issue_comment',
          'x-hub-signature-256': createSignature(payload),
        },
        payload,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.handled).toBe(false);

      // No task should be created
      expect(tasks.size).toBe(taskCountBefore);
    });

    it('ignores non-created actions', async () => {
      const taskCountBefore = tasks.size;

      const payload = {
        action: 'deleted',
        repository: {
          full_name: 'user/repo',
          html_url: 'https://github.com/user/repo',
        },
        comment: {
          body: '@cadence-ai do something',
          user: { login: 'testuser' },
        },
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/webhooks/github',
        headers: {
          'x-github-event': 'issue_comment',
          'x-hub-signature-256': createSignature(payload),
        },
        payload,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.handled).toBe(false);

      // No task should be created for deleted comments
      expect(tasks.size).toBe(taskCountBefore);
    });
  });

  describe('Unknown Events', () => {
    it('handles unknown event types gracefully', async () => {
      const payload = {
        action: 'unknown',
        repository: {
          full_name: 'user/repo',
          html_url: 'https://github.com/user/repo',
        },
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/webhooks/github',
        headers: {
          'x-github-event': 'unknown_event',
          'x-hub-signature-256': createSignature(payload),
        },
        payload,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.received).toBe(true);
    });
  });
});
