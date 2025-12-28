import { FastifyPluginAsync } from 'fastify';
import { randomUUID } from 'crypto';
import { TextInputSchema, Task } from '../types.js';
import { CommandParser } from '../services/command-parser.js';
import { VPSBridge } from '../services/vps-bridge.js';
import { streamManager } from '../services/stream-manager.js';
import { tasks } from './tasks.js';

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
        const task: Task = {
          id: randomUUID(),
          task: command.task || text,
          repoUrl: command.repoUrl || repoUrl,
          repoPath,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        tasks.set(task.id, task);

        // Start execution with streaming
        executeWithStreaming(task, vpsBridge);

        task.status = 'running';
        tasks.set(task.id, task);

        return reply.status(201).send({
          task,
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
      gitConfig?: {
        branch?: string;
        autoCommit?: boolean;
        autoPR?: boolean;
      };
    };
  }>('/input/command', async (request, reply) => {
    const { action, taskId, task: taskDescription, repoUrl, repoPath, gitConfig } = request.body;

    switch (action) {
      case 'create_task': {
        if (!taskDescription) {
          return reply.status(400).send({ error: 'task is required for create_task action' });
        }

        const task: Task = {
          id: randomUUID(),
          task: taskDescription,
          repoUrl,
          repoPath,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        tasks.set(task.id, task);

        // Start execution with streaming
        executeWithStreaming(task, vpsBridge, gitConfig);

        task.status = 'running';
        tasks.set(task.id, task);

        return reply.status(201).send({ task });
      }

      case 'cancel_task': {
        if (!taskId) {
          return reply.status(400).send({ error: 'taskId is required for cancel_task action' });
        }

        const task = tasks.get(taskId);
        if (!task) {
          return reply.status(404).send({ error: 'Task not found' });
        }

        task.status = 'cancelled';
        task.completedAt = new Date().toISOString();
        tasks.set(taskId, task);

        streamManager.emitTaskCompleted(taskId, false, 'Task cancelled by user');

        return { task };
      }

      case 'get_status': {
        if (!taskId) {
          return reply.status(400).send({ error: 'taskId is required for get_status action' });
        }

        const task = tasks.get(taskId);
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
  vpsBridge: VPSBridge,
  gitConfig?: { branch?: string; autoCommit?: boolean; autoPR?: boolean }
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
    const updatedTask = tasks.get(taskId);
    if (updatedTask) {
      updatedTask.status = result.success ? 'completed' : 'failed';
      updatedTask.output = result.output;
      updatedTask.completedAt = new Date().toISOString();
      tasks.set(taskId, updatedTask);
    }

    // Emit completion
    streamManager.emitTaskCompleted(taskId, result.success, result.output, result.prUrl);
  } catch (error) {
    // Update task as failed
    const updatedTask = tasks.get(taskId);
    if (updatedTask) {
      updatedTask.status = 'failed';
      updatedTask.output = error instanceof Error ? error.message : 'Unknown error';
      updatedTask.completedAt = new Date().toISOString();
      tasks.set(taskId, updatedTask);
    }

    streamManager.emitError(taskId, error instanceof Error ? error.message : 'Unknown error', false);
    streamManager.emitTaskCompleted(taskId, false, 'Task failed with error');
  }
}
