import { FastifyPluginAsync } from 'fastify';
import { createHmac, timingSafeEqual, randomUUID } from 'crypto';
import { GitHubWebhookPayload, Task } from '../types.js';
import { tasks } from './tasks.js';
import { streamManager } from '../services/stream-manager.js';

/**
 * GitHub Webhook handlers for PR lifecycle events
 *
 * Implemented:
 * - pull_request: merged/closed updates task status
 * - issue_comment: @cadence-ai mentions create tasks
 *
 * Not implemented:
 * - check_run: CI status updates (would need PR-to-task mapping)
 * - push: commit notifications (would need branch-to-task mapping)
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
      const result = await handleWebhookEvent(event, body, app.log);
      return { received: true, event, action: body.action, ...result };
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

interface WebhookResult {
  handled: boolean;
  taskId?: string;
  action?: string;
}

/**
 * Route webhook events to appropriate handlers
 */
async function handleWebhookEvent(
  event: string,
  payload: GitHubWebhookPayload,
  log: { info: (msg: string) => void }
): Promise<WebhookResult> {
  switch (event) {
    case 'pull_request':
      return handlePullRequestEvent(payload);
    case 'issue_comment':
      return handleIssueCommentEvent(payload, log);
    default:
      // Ignore unhandled events (check_run, push, etc.)
      return { handled: false };
  }
}

/**
 * Handle pull_request events
 */
function handlePullRequestEvent(payload: GitHubWebhookPayload): WebhookResult {
  const { action, pull_request } = payload;
  if (!pull_request) return { handled: false };

  const prUrl = pull_request.html_url;

  // Find task associated with this PR
  const task = findTaskByPrUrl(prUrl);
  if (!task) return { handled: false };

  switch (action) {
    case 'closed':
      // Archive the task (merged = true if PR was merged, false if just closed)
      task.status = pull_request.merged ? 'completed' : 'cancelled';
      task.completedAt = new Date().toISOString();
      tasks.set(task.id, task);

      streamManager.emitTaskCompleted(
        task.id,
        pull_request.merged,
        pull_request.merged ? 'PR merged successfully' : 'PR closed without merge',
        prUrl
      );
      return { handled: true, taskId: task.id, action: pull_request.merged ? 'completed' : 'cancelled' };

    case 'review_submitted':
      // Notify about review
      streamManager.emitOutput(
        task.id,
        `Review submitted on PR #${pull_request.number}`
      );
      return { handled: true, taskId: task.id, action: 'review_notified' };

    case 'synchronize':
      // New commits pushed to PR
      streamManager.emitOutput(
        task.id,
        `New commits pushed to PR #${pull_request.number}`
      );
      return { handled: true, taskId: task.id, action: 'sync_notified' };

    default:
      return { handled: false };
  }
}

/**
 * Handle issue_comment events (for @cadence-ai mentions)
 * Creates a new task when someone mentions @cadence-ai in a comment
 */
function handleIssueCommentEvent(
  payload: GitHubWebhookPayload,
  log: { info: (msg: string) => void }
): WebhookResult {
  const { action, comment, repository, issue } = payload;
  if (action !== 'created' || !comment) return { handled: false };

  // Check for @cadence-ai mention
  if (!comment.body.includes('@cadence-ai')) return { handled: false };

  // Parse command from comment
  const command = parseCommentCommand(comment.body);
  if (!command) return { handled: false };

  log.info(`Creating task from @cadence-ai mention: ${command}`);

  // Create a new task from the command
  const task: Task = {
    id: randomUUID(),
    task: command,
    repoUrl: repository.html_url,
    status: 'pending',
    createdAt: new Date().toISOString(),
    output: `Created from GitHub comment by ${comment.user.login}${issue ? ` on issue #${issue.number}` : ''}`,
  };

  tasks.set(task.id, task);

  // Emit task started event
  streamManager.emitTaskStarted(task.id, `Task created from @cadence-ai mention: ${command}`);

  return { handled: true, taskId: task.id, action: 'task_created' };
}

/**
 * Find task by PR URL
 */
function findTaskByPrUrl(prUrl: string): Task | null {
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
