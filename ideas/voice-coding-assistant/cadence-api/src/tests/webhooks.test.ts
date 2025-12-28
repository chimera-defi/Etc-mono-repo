import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
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

  describe('POST /api/webhooks/github', () => {
    it('accepts valid webhook with signature', async () => {
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

    it('rejects invalid signature', async () => {
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
    });

    it('handles pull_request.closed event', async () => {
      const payload = {
        action: 'closed',
        repository: {
          full_name: 'user/repo',
          html_url: 'https://github.com/user/repo',
        },
        pull_request: {
          number: 123,
          html_url: 'https://github.com/user/repo/pull/123',
          title: 'Test PR',
          state: 'closed',
          merged: false,
          head: { ref: 'feature-branch' },
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
      const body = JSON.parse(response.payload);
      expect(body.action).toBe('closed');
    });

    it('handles pull_request.merged event', async () => {
      const payload = {
        action: 'closed',
        repository: {
          full_name: 'user/repo',
          html_url: 'https://github.com/user/repo',
        },
        pull_request: {
          number: 123,
          html_url: 'https://github.com/user/repo/pull/123',
          title: 'Test PR',
          state: 'closed',
          merged: true,
          head: { ref: 'feature-branch' },
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
    });

    it('handles issue_comment event with @cadence-ai mention', async () => {
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
    });

    it('ignores comment without @cadence-ai mention', async () => {
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
    });

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
    });
  });
});
