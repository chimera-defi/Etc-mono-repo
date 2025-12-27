# Cadence - GitHub Integration & Workflow Automation

> **Real-time GitHub integration for autonomous agent workflows**
>
> Last Updated: December 27, 2025 | Status: Design Phase
>
> Inspired by Cursor's Background Agents + Linear Integration patterns

---

## Overview

This document defines how Cadence integrates with GitHub to provide:
- **Real-time event reactions** - Respond to PR merges, closes, comments
- **Automatic archiving** - Move completed/closed work out of active view
- **Issue tracker integration** - Start agents from Linear, GitHub Issues, etc.
- **Background agent lifecycle** - Full lifecycle from issue → agent → PR → merge

### Key Insight from Cursor

Cursor's approach that we're reverse-engineering:
1. **Start from anywhere**: Slack, Linear, mobile, browser
2. **Work happens in background**: Agents run in remote environments
3. **PR lifecycle management**: Bot notifies when merged/approved
4. **Auto-cleanup**: Merged/closed items move to archive, not cluttering active view

---

## 1. GitHub Event System

### Webhook Events We Handle

| Event | Trigger | Action |
|-------|---------|--------|
| `pull_request.merged` | PR merged to base branch | Archive agent session, notify user |
| `pull_request.closed` | PR closed without merge | Archive agent, mark as "Closed" |
| `pull_request.review_submitted` | Review added to PR | Notify user, update agent status |
| `issue_comment.created` | Comment on PR/issue | Parse for @cadence-ai mentions |
| `check_run.completed` | CI checks finish | Update agent with CI status |
| `push` | New commits pushed | Update agent with commit info |

### Webhook Handler Architecture

```typescript
// backend/src/routes/webhooks.ts
import { FastifyInstance } from 'fastify';
import crypto from 'crypto';

export async function webhookRoutes(fastify: FastifyInstance) {
  fastify.post('/webhooks/github', async (request, reply) => {
    // Verify webhook signature
    const signature = request.headers['x-hub-signature-256'] as string;
    const payload = JSON.stringify(request.body);
    const expected = `sha256=${crypto
      .createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET!)
      .update(payload)
      .digest('hex')}`;

    if (signature !== expected) {
      return reply.status(401).send({ error: 'Invalid signature' });
    }

    const event = request.headers['x-github-event'] as string;
    const body = request.body as GitHubWebhookPayload;

    await webhookDispatcher.dispatch(event, body);
    return { received: true };
  });
}
```

### Webhook Dispatcher

```typescript
// backend/src/services/webhooks/GitHubWebhookDispatcher.ts
export class GitHubWebhookDispatcher {
  private handlers: Map<string, WebhookHandler[]> = new Map();

  constructor() {
    this.register('pull_request', new PREventHandler());
    this.register('issue_comment', new CommentEventHandler());
    this.register('check_run', new CheckRunHandler());
  }

  async dispatch(event: string, payload: GitHubWebhookPayload) {
    const handlers = this.handlers.get(event) || [];

    for (const handler of handlers) {
      await handler.handle(payload);
    }
  }
}
```

---

## 2. Agent Lifecycle & Auto-Archiving

### Agent States with Archive Transition

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AGENT LIFECYCLE                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ACTIVE STATES (Visible in main view):                                       │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ PENDING  │───>│ RUNNING  │───>│  REVIEW  │───>│ APPROVED │              │
│  │          │    │          │    │  READY   │    │          │              │
│  └──────────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘              │
│                       │               │               │                      │
│                       ▼               ▼               ▼                      │
│                  ┌──────────┐                                               │
│                  │  PAUSED  │                                               │
│                  └──────────┘                                               │
│                                                                              │
│  ════════════════════════════════════════════════════════════════════════   │
│                                                                              │
│  ARCHIVED STATES (Moved to Archive section):                                 │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                              │
│  │ COMPLETED│    │  CLOSED  │    │  FAILED  │                              │
│  │ (Merged) │    │(PR close)│    │ (Error)  │                              │
│  └──────────┘    └──────────┘    └──────────┘                              │
│                                                                              │
│  Archiving triggers:                                                         │
│  • PR merged → COMPLETED (auto-archive)                                      │
│  • PR closed without merge → CLOSED (auto-archive)                          │
│  • Agent error → FAILED (auto-archive after 24h)                            │
│  • User manually archives                                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Auto-Archive Logic

```typescript
// backend/src/services/agent/AgentArchiver.ts
export class AgentArchiver {

  /**
   * Auto-archive based on GitHub events
   */
  async onPRMerged(prUrl: string, mergeCommit: string) {
    const agent = await db.query.agents.findFirst({
      where: eq(agents.prUrl, prUrl),
    });

    if (!agent) return;

    await db.update(agents).set({
      status: 'completed',
      archivedAt: new Date(),
      completedAt: new Date(),
      metadata: {
        ...agent.metadata,
        mergeCommit,
        mergedAt: new Date().toISOString(),
      },
    }).where(eq(agents.id, agent.id));

    // Notify user
    await pushService.notifyAgentMerged(agent);

    // Emit SSE for real-time UI update
    sseManager.emit(agent.userId, {
      type: 'agent_archived',
      agentId: agent.id,
      reason: 'merged',
    });
  }

  async onPRClosed(prUrl: string) {
    const agent = await db.query.agents.findFirst({
      where: eq(agents.prUrl, prUrl),
    });

    if (!agent) return;

    await db.update(agents).set({
      status: 'closed',
      archivedAt: new Date(),
      metadata: {
        ...agent.metadata,
        closedAt: new Date().toISOString(),
        closedWithoutMerge: true,
      },
    }).where(eq(agents.id, agent.id));

    await pushService.notifyAgentClosed(agent);

    sseManager.emit(agent.userId, {
      type: 'agent_archived',
      agentId: agent.id,
      reason: 'closed',
    });
  }

  /**
   * Cleanup old failed agents (archive after 24h)
   */
  async archiveOldFailedAgents() {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

    await db.update(agents).set({
      archivedAt: new Date(),
    }).where(
      and(
        eq(agents.status, 'failed'),
        isNull(agents.archivedAt),
        lt(agents.failedAt, cutoff)
      )
    );
  }
}
```

---

## 3. Mobile UI: Active vs Archived

### Agents List with Sections

```
┌────────────────────────────────────────────┐
│  ← Back                          🔍  +     │
├────────────────────────────────────────────┤
│                                            │
│              My Agents                     │
│                                            │
│  [Active] [Review Ready] [Archived]        │
│                                            │
│  ═══════════════════════════════════════   │
│  IN PROGRESS (2)                           │
│  ═══════════════════════════════════════   │
│                                            │
│ ┌────────────────────────────────────────┐ │
│ │ ● wallet-frontend                      │ │
│ │   Add dark mode theme support          │ │
│ │   Status: RUNNING • 67%                │ │
│ │   [View Details →]                     │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ ┌────────────────────────────────────────┐ │
│ │ ● api-service                          │ │
│ │   Implement caching layer              │ │
│ │   Status: RUNNING • 23%                │ │
│ │   [View Details →]                     │ │
│ └────────────────────────────────────────┘ │
│                                            │
│  ═══════════════════════════════════════   │
│  READY FOR REVIEW (1)                      │
│  ═══════════════════════════════════════   │
│                                            │
│ ┌────────────────────────────────────────┐ │
│ │ ◐ mobile-app                           │ │
│ │   Add push notification support        │ │
│ │   PR #189 • Waiting for review         │ │
│ │   [View PR →]                          │ │
│ └────────────────────────────────────────┘ │
│                                            │
└────────────────────────────────────────────┘
```

### Archived View

```
┌────────────────────────────────────────────┐
│  ← Back                    Filter ▼  Clear │
├────────────────────────────────────────────┤
│                                            │
│            Archived Agents                 │
│                                            │
│  [All] [Merged] [Closed] [Failed]          │
│                                            │
│ ┌────────────────────────────────────────┐ │
│ │ ✓ auth-service                         │ │
│ │   Fix JWT token expiration bug         │ │
│ │   MERGED • PR #234                     │ │
│ │   Completed: Dec 26, 2025              │ │
│ │                                        │ │
│ │   [View PR]  [View Logs]  [Restart]    │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ ┌────────────────────────────────────────┐ │
│ │ ✕ data-pipeline                        │ │
│ │   Add streaming support                │ │
│ │   CLOSED • PR #220                     │ │
│ │   Closed: Dec 25, 2025                 │ │
│ │                                        │ │
│ │   [View PR]  [View Logs]  [Restart]    │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ ┌────────────────────────────────────────┐ │
│ │ ⚠ logging-service         [dim/gray]  │ │
│ │   Implement structured logging         │ │
│ │   FAILED • Build error                 │ │
│ │   Failed: Dec 24, 2025                 │ │
│ │                                        │ │
│ │   [View Error]  [Retry]  [Delete]      │ │
│ └────────────────────────────────────────┘ │
│                                            │
└────────────────────────────────────────────┘
```

---

## 4. Issue Tracker Integration (Linear-style)

### Flow: Issue → Agent → PR → Merge

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ISSUE → AGENT → PR WORKFLOW                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. CREATE ISSUE (Any source)                                                │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Linear: "Add dark mode support"  @cadence-ai                           │   │
│  │  GitHub Issue: "Fix auth bug" → assign to cadence-bot                │   │
│  │  Cadence App: Voice command or manual creation                       │   │
│  │  Slack: "@cadence-ai implement feature X on repo Y"                     │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                        │                                     │
│                                        ▼                                     │
│  2. AGENT STARTS                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  • Clone repository                                                   │   │
│  │  • Create feature branch: claude/dark-mode-x7f2a9                    │   │
│  │  • Analyze codebase                                                   │   │
│  │  • Begin implementation                                               │   │
│  │  • Update issue: "In Progress"                                        │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                        │                                     │
│                                        ▼                                     │
│  3. PR CREATED                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  • Create PR with summary                                             │   │
│  │  • Link to original issue                                             │   │
│  │  • Run CI/tests                                                       │   │
│  │  • Request review (optional)                                          │   │
│  │  • Update issue: "In Review"                                          │   │
│  │  • Notify user: "PR ready for review"                                │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                        │                                     │
│                                        ▼                                     │
│  4. HUMAN REVIEW                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Developer reviews PR:                                                │   │
│  │  • Approve → Merge → Issue auto-closes                               │   │
│  │  • Request changes → Agent responds with follow-up commit            │   │
│  │  • Comment "@cadence-ai fix the test" → Agent makes changes             │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                        │                                     │
│                                        ▼                                     │
│  5. MERGE & ARCHIVE                                                          │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  • PR merged → Webhook fires                                          │   │
│  │  • Issue auto-closed (if linked)                                      │   │
│  │  • Agent session archived                                             │   │
│  │  • Branch deleted (if configured)                                     │   │
│  │  • Notification: "Your dark mode feature is live!"                   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Linear Integration (Future)

```typescript
// backend/src/integrations/linear/LinearWebhookHandler.ts
export class LinearWebhookHandler {
  async handleIssueCreated(payload: LinearWebhookPayload) {
    const issue = payload.data;

    // Check if @cadence-ai mentioned or assigned
    if (!this.shouldProcess(issue)) return;

    // Parse configuration from issue
    const config = this.parseIssueConfig(issue);

    // Create agent
    const agent = await agentService.create({
      userId: config.userId,
      repoUrl: config.repoUrl,
      branch: config.branch || 'main',
      taskDescription: issue.title + '\n\n' + issue.description,
      model: config.model || 'claude-sonnet-4-20250514',
      externalSource: {
        type: 'linear',
        issueId: issue.id,
        issueUrl: issue.url,
      },
    });

    // Update Linear issue with agent status
    await linearClient.updateIssue(issue.id, {
      state: 'in_progress',
      comment: `🤖 Cadence agent started working on this issue.\n\nBranch: \`${agent.branch}\`\nAgent ID: ${agent.id}`,
    });
  }

  private parseIssueConfig(issue: LinearIssue): AgentConfig {
    // Parse [key=value] syntax from description or comments
    const configRegex = /\[(\w+)=([^\]]+)\]/g;
    const config: Record<string, string> = {};

    let match;
    while ((match = configRegex.exec(issue.description)) !== null) {
      config[match[1]] = match[2];
    }

    return {
      repoUrl: config.repo || this.inferRepoFromProject(issue.project),
      branch: config.branch,
      model: config.model,
      userId: issue.assignee?.id,
    };
  }
}
```

### GitHub Issues Integration

```typescript
// backend/src/integrations/github/GitHubIssueHandler.ts
export class GitHubIssueHandler {
  async handleIssueAssigned(payload: GitHubWebhookPayload) {
    const issue = payload.issue;
    const assignee = payload.assignee;

    // Check if assigned to cadence-bot or @cadence-ai mentioned
    if (assignee.login !== 'cadence-bot' && !this.hasCadenceMention(issue)) {
      return;
    }

    // Create agent
    const agent = await agentService.create({
      userId: await this.getUserId(payload.sender),
      repoUrl: payload.repository.html_url,
      branch: 'main',
      taskDescription: issue.title + '\n\n' + issue.body,
      externalSource: {
        type: 'github_issue',
        issueNumber: issue.number,
        issueUrl: issue.html_url,
      },
    });

    // Comment on issue
    await githubClient.createIssueComment(
      payload.repository.owner.login,
      payload.repository.name,
      issue.number,
      `🤖 **Cadence Agent Started**\n\nI'm working on this issue now.\n\n**Branch:** \`${agent.branch}\`\n**Status:** In Progress\n\nI'll update this issue when I create a PR.`
    );

    // Add label
    await githubClient.addLabels(
      payload.repository.owner.login,
      payload.repository.name,
      issue.number,
      ['cadence-in-progress']
    );
  }
}
```

---

## 5. PR Comment Interaction

### @cadence-ai Mentions in PRs

```typescript
// backend/src/services/webhooks/CommentEventHandler.ts
export class CommentEventHandler implements WebhookHandler {
  async handle(payload: GitHubWebhookPayload) {
    const comment = payload.comment;

    if (!comment.body.includes('@cadence-ai')) return;

    // Find associated agent
    const agent = await db.query.agents.findFirst({
      where: eq(agents.prUrl, payload.pull_request.html_url),
    });

    if (!agent) {
      // Respond that no agent is associated
      await this.replyToComment(payload,
        "I don't see an active agent for this PR. Create one with `/cadence start`");
      return;
    }

    // Parse the instruction
    const instruction = this.parseInstruction(comment.body);

    switch (instruction.type) {
      case 'fix':
        await this.handleFixRequest(agent, instruction, payload);
        break;
      case 'update':
        await this.handleUpdateRequest(agent, instruction, payload);
        break;
      case 'status':
        await this.handleStatusRequest(agent, payload);
        break;
    }
  }

  private async handleFixRequest(
    agent: Agent,
    instruction: ParsedInstruction,
    payload: GitHubWebhookPayload
  ) {
    // Resume agent with new instructions
    await agentService.addFollowUp(agent.id, {
      type: 'fix_request',
      instruction: instruction.content,
      commentUrl: payload.comment.html_url,
    });

    // Reply
    await this.replyToComment(payload,
      `🔧 Working on it! I'll push the fix shortly.`);
  }
}
```

### Supported Commands

| Command | Description | Example |
|---------|-------------|---------|
| `@cadence-ai fix [instruction]` | Make changes based on feedback | `@cadence-ai fix the failing test` |
| `@cadence-ai update` | Pull latest changes, re-run checks | `@cadence-ai update` |
| `@cadence-ai status` | Get current agent status | `@cadence-ai status` |
| `@cadence-ai stop` | Cancel the agent | `@cadence-ai stop` |
| `@cadence-ai restart` | Restart agent from scratch | `@cadence-ai restart` |

---

## 6. Real-time UI Updates

### SSE Event Types

```typescript
interface AgentEvent {
  type:
    | 'agent_started'
    | 'agent_progress'
    | 'agent_pr_created'
    | 'agent_review_received'
    | 'agent_merged'
    | 'agent_closed'
    | 'agent_archived'
    | 'agent_failed';
  agentId: string;
  data: Record<string, any>;
  timestamp: Date;
}
```

### Mobile App Event Handling

```typescript
// mobile/src/services/AgentEventStream.ts
export class AgentEventStream {
  private eventSource: EventSource;

  connect(userId: string) {
    this.eventSource = new EventSource(
      `${API_URL}/api/users/${userId}/events`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    this.eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data) as AgentEvent;
      this.handleEvent(data);
    };
  }

  private handleEvent(event: AgentEvent) {
    switch (event.type) {
      case 'agent_merged':
        // Move to archived section with animation
        agentStore.archiveAgent(event.agentId, 'merged');
        // Show success notification
        showToast(`🎉 ${event.data.repoName} PR merged!`);
        break;

      case 'agent_closed':
        // Move to archived section
        agentStore.archiveAgent(event.agentId, 'closed');
        showToast(`PR closed for ${event.data.repoName}`);
        break;

      case 'agent_progress':
        agentStore.updateProgress(event.agentId, event.data.progress);
        break;

      case 'agent_pr_created':
        agentStore.updateStatus(event.agentId, 'review_ready');
        showNotification({
          title: 'PR Ready for Review',
          body: `${event.data.repoName}: ${event.data.prTitle}`,
        });
        break;
    }
  }
}
```

---

## 7. Database Schema Updates

### Updated Agents Table

```typescript
// db/schema.ts - additions for GitHub integration
export const agentStatusEnum = pgEnum('agent_status', [
  // Active states
  'pending',
  'queued',
  'running',
  'paused',
  'review_ready',  // PR created, waiting for review
  'changes_requested',  // Review requested changes

  // Archived states
  'completed',  // PR merged
  'closed',     // PR closed without merge
  'failed',     // Agent error
  'cancelled',  // User cancelled
]);

export const agents = pgTable('agents', {
  // ... existing fields ...

  // GitHub integration
  prUrl: text('pr_url'),
  prNumber: integer('pr_number'),
  prState: text('pr_state'),  // 'open' | 'merged' | 'closed'

  // External source (Linear, GitHub Issue, etc.)
  externalSource: jsonb('external_source').$type<{
    type: 'linear' | 'github_issue' | 'slack' | 'voice';
    issueId?: string;
    issueNumber?: number;
    issueUrl?: string;
    channelId?: string;
    messageTs?: string;
  }>(),

  // Archive metadata
  archivedAt: timestamp('archived_at'),
  archivedReason: text('archived_reason'),  // 'merged' | 'closed' | 'failed' | 'cancelled' | 'manual'

  // Merge metadata
  mergeCommit: text('merge_commit'),
  mergedAt: timestamp('merged_at'),
  mergedBy: text('merged_by'),
});

// GitHub webhook events log (for debugging)
export const webhookEvents = pgTable('webhook_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  event: text('event').notNull(),  // 'pull_request.merged', etc.
  payload: jsonb('payload'),
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

---

## 8. API Endpoints

### Agent Endpoints (Updated)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/agents` | List active agents (excludes archived) |
| `GET` | `/api/agents/archived` | List archived agents |
| `GET` | `/api/agents/:id` | Get agent detail (any status) |
| `POST` | `/api/agents/:id/archive` | Manually archive an agent |
| `POST` | `/api/agents/:id/unarchive` | Restore archived agent |
| `DELETE` | `/api/agents/archived` | Bulk delete old archived agents |

### Webhook Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/webhooks/github` | GitHub webhook receiver |
| `POST` | `/webhooks/linear` | Linear webhook receiver |
| `GET` | `/webhooks/health` | Webhook service health check |

---

## 9. Configuration

### GitHub App Setup

```yaml
# Required GitHub App permissions
permissions:
  contents: write        # Read/write repo contents
  pull_requests: write   # Create/manage PRs
  issues: write          # Comment on issues
  checks: read           # Read CI status
  metadata: read         # Read repo metadata

# Webhook events to subscribe
events:
  - pull_request
  - pull_request_review
  - issue_comment
  - check_run
  - push
```

### Environment Variables

```bash
# GitHub Integration
GITHUB_APP_ID=123456
GITHUB_APP_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----...
GITHUB_WEBHOOK_SECRET=your-webhook-secret
GITHUB_BOT_USERNAME=cadence-bot

# Linear Integration (Optional)
LINEAR_API_KEY=lin_api_...
LINEAR_WEBHOOK_SECRET=...

# Auto-Archive Settings
AUTO_ARCHIVE_FAILED_AFTER_HOURS=24
AUTO_DELETE_ARCHIVED_AFTER_DAYS=90
```

---

## 10. Implementation Phases

### Phase 1: Basic Webhook Support (Week 1)

| Task | Priority | Est. |
|------|----------|------|
| Set up GitHub webhook endpoint | P0 | 2h |
| Verify webhook signatures | P0 | 1h |
| Handle `pull_request.merged` event | P0 | 2h |
| Handle `pull_request.closed` event | P0 | 2h |
| Update agent status on events | P0 | 2h |

### Phase 2: Auto-Archiving (Week 2)

| Task | Priority | Est. |
|------|----------|------|
| Add `archivedAt` field to schema | P0 | 1h |
| Implement AgentArchiver service | P0 | 3h |
| Update mobile UI with archived section | P0 | 4h |
| Add SSE events for archive transitions | P0 | 2h |
| Implement manual archive/unarchive | P1 | 2h |

### Phase 3: PR Interactions (Week 3)

| Task | Priority | Est. |
|------|----------|------|
| Handle `issue_comment` events | P0 | 3h |
| Parse @cadence-ai mentions | P0 | 2h |
| Implement fix/update commands | P0 | 4h |
| Add review notification handling | P1 | 2h |

### Phase 4: Issue Integration (Week 4)

| Task | Priority | Est. |
|------|----------|------|
| GitHub Issues integration | P1 | 4h |
| Linear integration | P2 | 6h |
| Slack integration | P2 | 6h |

---

## 11. Related Documents

| Document | Purpose |
|----------|---------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture overview |
| [IMPLEMENTATION.md](./IMPLEMENTATION.md) | Implementation task breakdown |
| [UI_WIREFRAMES.md](./04-design/UI_WIREFRAMES.md) | Mobile UI mockups |

---

**Document Version:** 1.0
**Created:** December 27, 2025
**Status:** Design Phase - Ready for Implementation
