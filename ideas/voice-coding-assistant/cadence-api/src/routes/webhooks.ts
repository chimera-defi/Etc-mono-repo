import { FastifyPluginAsync } from 'fastify';
import { createHmac, timingSafeEqual } from 'crypto';
import { GitHubWebhookPayload } from '../types.js';
import { tasks } from './tasks.js';
import { streamManager } from '../services/stream-manager.js';

/**
 * GitHub Webhook handlers for PR lifecycle events
 */
export const webhookRoutes: FastifyPluginAsync = async (app) => {
  /**
   * POST /webhooks/github
   * Handle incoming GitHub webhook events
   */
  app.post('/webhooks/github', async (request, reply) => {
    // Verify webhook signature
    const signature = request.headers['x-hub-signature-256'] as string;
    const secret = process.env.GITHUB_WEBHOOK_SECRET;

    if (secret && signature) {
      const payload = JSON.stringify(request.body);
      const expected = `sha256=${createHmac('sha256', secret)
        .update(payload)
        .digest('hex')}`;

      const signatureBuffer = Buffer.from(signature);
      const expectedBuffer = Buffer.from(expected);

      // Check lengths first to prevent timing attacks via RangeError
      if (signatureBuffer.length !== expectedBuffer.length) {
        return reply.status(401).send({ error: 'Invalid signature' });
      }

      // Use timing-safe comparison to prevent timing attacks
      if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
        return reply.status(401).send({ error: 'Invalid signature' });
      }
    } else if (process.env.NODE_ENV === 'production') {
      // In production, require signature verification
      return reply.status(401).send({ error: 'Signature required' });
    }

    const event = request.headers['x-github-event'] as string;
    const body = request.body as GitHubWebhookPayload;

    app.log.info(`Received GitHub webhook: ${event} ${body.action}`);

    try {
      await handleWebhookEvent(event, body);
      return { received: true, event, action: body.action };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      app.log.error(`Webhook handler error: ${message}`);
      return reply.status(500).send({
        error: 'Webhook processing failed',
        message,
      });
    }
  });
};

/**
 * Route webhook events to appropriate handlers
 */
async function handleWebhookEvent(event: string, payload: GitHubWebhookPayload): Promise<void> {
  switch (event) {
    case 'pull_request':
      await handlePullRequestEvent(payload);
      break;
    case 'issue_comment':
      await handleIssueCommentEvent(payload);
      break;
    case 'check_run':
      await handleCheckRunEvent(payload);
      break;
    case 'push':
      await handlePushEvent(payload);
      break;
    default:
      // Ignore other events
      break;
  }
}

/**
 * Handle pull_request events
 */
async function handlePullRequestEvent(payload: GitHubWebhookPayload): Promise<void> {
  const { action, pull_request, repository } = payload;
  if (!pull_request) return;

  const prUrl = pull_request.html_url;

  // Find task associated with this PR
  const task = findTaskByPrUrl(prUrl);
  if (!task) return;

  switch (action) {
    case 'merged':
    case 'closed':
      // Archive the task
      task.status = pull_request.merged ? 'completed' : 'cancelled';
      task.completedAt = new Date().toISOString();
      tasks.set(task.id, task);

      streamManager.emitTaskCompleted(
        task.id,
        pull_request.merged,
        pull_request.merged ? 'PR merged successfully' : 'PR closed without merge',
        prUrl
      );
      break;

    case 'review_submitted':
      // Notify about review
      streamManager.emitOutput(
        task.id,
        `Review submitted on PR #${pull_request.number}`
      );
      break;

    case 'synchronize':
      // New commits pushed to PR
      streamManager.emitOutput(
        task.id,
        `New commits pushed to PR #${pull_request.number}`
      );
      break;
  }
}

/**
 * Handle issue_comment events (for @cadence-ai mentions)
 */
async function handleIssueCommentEvent(payload: GitHubWebhookPayload): Promise<void> {
  const { action, comment, repository } = payload;
  if (action !== 'created' || !comment) return;

  // Check for @cadence-ai mention
  if (!comment.body.includes('@cadence-ai')) return;

  // Parse command from comment
  const command = parseCommentCommand(comment.body);
  if (!command) return;

  // TODO: Handle commands like:
  // @cadence-ai fix the failing test
  // @cadence-ai update the documentation
  // @cadence-ai address review comments

  console.log(`Received @cadence-ai command: ${command}`);
}

/**
 * Handle check_run events (CI status)
 */
async function handleCheckRunEvent(payload: GitHubWebhookPayload): Promise<void> {
  // TODO: Update task with CI status
}

/**
 * Handle push events
 */
async function handlePushEvent(payload: GitHubWebhookPayload): Promise<void> {
  // TODO: Update task with commit info
}

/**
 * Find task by PR URL
 */
function findTaskByPrUrl(prUrl: string) {
  for (const [, task] of tasks) {
    // Check if task output contains the PR URL
    if (task.output?.includes(prUrl)) {
      return task;
    }
  }
  return null;
}

/**
 * Parse command from @cadence-ai mention
 */
function parseCommentCommand(body: string): string | null {
  const match = body.match(/@cadence-ai\s+(.+?)(?:\n|$)/i);
  return match ? match[1].trim() : null;
}
