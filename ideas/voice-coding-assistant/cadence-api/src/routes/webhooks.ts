import { FastifyPluginAsync } from 'fastify';
import { createHmac, timingSafeEqual } from 'crypto';
import { GitHubWebhookPayload, Task } from '../types.js';
import { taskService } from '../services/task-service.js';
import { streamManager } from '../services/stream-manager.js';

/**
 * GitHub Webhook handlers for PR lifecycle events
 *
 * Implemented:
 * - pull_request: merged/closed updates task status, opened links task to PR
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
 * Supports full PR lifecycle: opened → synchronize → closed (merged/cancelled)
 */
async function handlePullRequestEvent(payload: GitHubWebhookPayload): Promise<WebhookResult> {
  const { action, pull_request, repository } = payload;
  if (!pull_request) return { handled: false };

  const prUrl = pull_request.html_url;
  const prNumber = pull_request.number;
  const prBranch = pull_request.head.ref;
  const isMerged = pull_request.merged;

  // Find task associated with this PR
  let task = await findTaskByPrUrl(prUrl);

  switch (action) {
    case 'opened':
      // PR was just opened - find running task for this repo and link it to PR
      if (!task) {
        task = await findRunningTaskForRepo(repository.html_url);
      }
      if (!task) return { handled: false };

      // Update task with PR info and transition to pr_open status
      await taskService.update(task.id, {
        prUrl,
        prNumber,
        prBranch,
        prState: 'open',
        status: 'pr_open',
      });

      streamManager.emitOutput(
        task.id,
        `PR #${prNumber} opened: ${pull_request.title}`
      );
      return { handled: true, taskId: task.id, action: 'pr_opened' };

    case 'closed':
      if (!task) return { handled: false };

      // Archive the task (merged = true if PR was merged, false if just closed)
      await taskService.update(task.id, {
        status: isMerged ? 'completed' : 'cancelled',
        prState: isMerged ? 'merged' : 'closed',
        completedAt: new Date(),
      });

      streamManager.emitTaskCompleted(
        task.id,
        isMerged,
        isMerged ? 'PR merged successfully' : 'PR closed without merge',
        prUrl
      );
      return { handled: true, taskId: task.id, action: isMerged ? 'completed' : 'cancelled' };

    case 'reopened':
      if (!task) return { handled: false };

      // PR reopened - move back to pr_open status
      await taskService.update(task.id, {
        status: 'pr_open',
        prState: 'open',
        completedAt: undefined,
      });

      streamManager.emitOutput(
        task.id,
        `PR #${prNumber} reopened`
      );
      return { handled: true, taskId: task.id, action: 'pr_reopened' };

    case 'review_submitted':
      if (!task) return { handled: false };

      // Notify about review
      streamManager.emitOutput(
        task.id,
        `Review submitted on PR #${prNumber}`
      );
      return { handled: true, taskId: task.id, action: 'review_notified' };

    case 'synchronize':
      if (!task) return { handled: false };

      // New commits pushed to PR
      streamManager.emitOutput(
        task.id,
        `New commits pushed to PR #${prNumber}`
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
async function handleIssueCommentEvent(
  payload: GitHubWebhookPayload,
  log: { info: (msg: string) => void }
): Promise<WebhookResult> {
  const { action, comment, repository, issue } = payload;
  if (action !== 'created' || !comment) return { handled: false };

  // Check for @cadence-ai mention
  if (!comment.body.includes('@cadence-ai')) return { handled: false };

  // Parse command from comment
  const command = parseCommentCommand(comment.body);
  if (!command) return { handled: false };

  log.info(`Creating task from @cadence-ai mention: ${command}`);

  // Create a new task from the command
  const task = await taskService.create({
    task: command,
    repoUrl: repository.html_url,
    status: 'pending',
    output: `Created from GitHub comment by ${comment.user.login}${issue ? ` on issue #${issue.number}` : ''}`,
  });

  // Emit task started event
  streamManager.emitTaskStarted(task.id, `Task created from @cadence-ai mention: ${command}`);

  return { handled: true, taskId: task.id, action: 'task_created' };
}

/**
 * Find task by PR URL (checks prUrl field directly)
 */
async function findTaskByPrUrl(prUrl: string): Promise<Task | null> {
  // First try finding by prUrl field
  const byPrUrl = await taskService.findByPrUrl(prUrl);
  if (byPrUrl) return byPrUrl;

  // Fallback: check output for PR URL (legacy)
  return await taskService.findByOutput(prUrl);
}

/**
 * Find a running task for a given repository URL
 * Used to link newly opened PRs to their originating task
 */
async function findRunningTaskForRepo(repoUrl: string): Promise<Task | null> {
  return await taskService.findRunningTaskForRepo(repoUrl);
}

/**
 * Parse command from @cadence-ai mention
 */
function parseCommentCommand(body: string): string | null {
  const match = body.match(/@cadence-ai\s+(.+?)(?:\n|$)/i);
  return match ? match[1].trim() : null;
}
