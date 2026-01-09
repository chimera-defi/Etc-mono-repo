import { FastifyPluginAsync } from 'fastify';
import { TextInputSchema, Task } from '../types.js';
import { CommandParser } from '../services/command-parser.js';
import { VPSBridge } from '../services/vps-bridge.js';
import { streamManager } from '../services/stream-manager.js';
import { taskService } from '../services/task-service.js';

export const inputRoutes: FastifyPluginAsync = async (app) => {
  const parser = new CommandParser();
  const vpsBridge = new VPSBridge();

  /**
   * POST /api/input/text
   * Accept text input directly (keyboard input from iOS app)
   * This bypasses voice transcription but still parses the command
   */
  app.post('/input/text', async (request, reply) => {
    const parseResult = TextInputSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Invalid request',
        details: parseResult.error.issues,
      });
    }

    const { text, repoUrl, repoPath } = parseResult.data;

    try {
      // Parse the text into a command
      const command = await parser.parse(text);

      // If it's a create_task intent, create the task
      if (command.intent === 'create_task') {
        const task = await taskService.create({
          task: command.task || text,
          repoUrl: command.repoUrl || repoUrl,
          repoPath,
          status: 'pending',
        });

        // Start execution with streaming
        executeWithStreaming(task, vpsBridge);

        // Mark as running
        const runningTask = await taskService.update(task.id, { status: 'running' });

        return reply.status(201).send({
          task: runningTask || task,
          command,
          source: 'text',
        });
      }

      // For other intents, just return the parsed command
      return {
        command,
        source: 'text',
      };
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({
        error: 'Failed to process text input',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * POST /api/input/command
   * Direct command execution without parsing
   * Used when the client already knows what action to take
   */
  app.post<{
    Body: {
      action: 'create_task' | 'cancel_task' | 'get_status';
      taskId?: string;
      task?: string;
      repoUrl?: string;
      repoPath?: string;
    };
  }>('/input/command', async (request, reply) => {
    const { action, taskId, task: taskDescription, repoUrl, repoPath } = request.body;

    switch (action) {
      case 'create_task': {
        if (!taskDescription) {
          return reply.status(400).send({ error: 'task is required for create_task action' });
        }

        const task = await taskService.create({
          task: taskDescription,
          repoUrl,
          repoPath,
          status: 'pending',
        });

        // Start execution with streaming
        executeWithStreaming(task, vpsBridge);

        // Mark as running
        const runningTask = await taskService.update(task.id, { status: 'running' });

        return reply.status(201).send({ task: runningTask || task });
      }

      case 'cancel_task': {
        if (!taskId) {
          return reply.status(400).send({ error: 'taskId is required for cancel_task action' });
        }

        const task = await taskService.get(taskId);
        if (!task) {
          return reply.status(404).send({ error: 'Task not found' });
        }

        const cancelledTask = await taskService.update(taskId, {
          status: 'cancelled',
          completedAt: new Date(),
        });

        streamManager.emitTaskCompleted(taskId, false, 'Task cancelled by user');

        return { task: cancelledTask || task };
      }

      case 'get_status': {
        if (!taskId) {
          return reply.status(400).send({ error: 'taskId is required for get_status action' });
        }

        const task = await taskService.get(taskId);
        if (!task) {
          return reply.status(404).send({ error: 'Task not found' });
        }

        return { task };
      }

      default:
        return reply.status(400).send({ error: `Unknown action: ${action}` });
    }
  });
};

/**
 * Execute task with streaming updates
 */
async function executeWithStreaming(
  task: Task,
  vpsBridge: VPSBridge
): Promise<void> {
  const taskId = task.id;

  // Emit start event
  streamManager.emitTaskStarted(taskId, `Starting task: ${task.task}`);

  try {
    // Execute on VPS
    const result = await vpsBridge.executeTaskStreaming(task, (event) => {
      // Forward events to subscribers
      switch (event.type) {
        case 'tool_use':
          if (event.tool) {
            streamManager.emitToolUse(taskId, event.tool, event.input ?? {});
          }
          break;
        case 'file_edit':
          if (event.path && event.action) {
            streamManager.emitFileEdit(taskId, event.path, event.action, event.linesChanged);
          }
          break;
        case 'command_run':
          if (event.command !== undefined) {
            streamManager.emitCommandRun(taskId, event.command, event.exitCode, event.output);
          }
          break;
        case 'output':
          if (event.text) {
            streamManager.emitOutput(taskId, event.text);
          }
          break;
        case 'error':
          if (event.message) {
            streamManager.emitError(taskId, event.message, event.recoverable ?? false);
          }
          break;
      }
    });

    // Update task status
    await taskService.update(taskId, {
      status: result.success ? 'completed' : 'failed',
      output: result.output,
      completedAt: new Date(),
    });

    // Emit completion
    streamManager.emitTaskCompleted(taskId, result.success, result.output, result.prUrl);
  } catch (error) {
    // Update task as failed
    await taskService.update(taskId, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      completedAt: new Date(),
    });

    streamManager.emitError(taskId, error instanceof Error ? error.message : 'Unknown error', false);
    streamManager.emitTaskCompleted(taskId, false, 'Task failed with error');
  }
}
