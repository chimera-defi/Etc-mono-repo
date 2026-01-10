import { FastifyPluginAsync } from 'fastify';
import { Task, CreateTaskSchema } from '../types.js';
import { VPSBridge } from '../services/vps-bridge.js';
import { db, schema, useMockStorage } from '../db/index.js';
import { taskService, setTaskDirectly } from '../services/task-service.js';

// Export for testing - backwards compatible Map-like interface
// Uses taskService which provides unified storage for both routes and tests
export const tasks = {
  clear: async () => {
    await taskService.clear();
  },
  get: async (id: string) => {
    return await taskService.get(id);
  },
  set: async (id: string, task: Task) => {
    // Check if task exists
    const existing = await taskService.get(id);
    if (existing) {
      // Update existing task
      await taskService.update(id, {
        status: task.status,
        output: task.output,
        prUrl: task.prUrl,
        prNumber: task.prNumber,
        prBranch: task.prBranch,
        prState: task.prState,
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
      });
    } else {
      // Create new task with specific ID (for tests)
      if (useMockStorage) {
        setTaskDirectly(id, task);
      } else {
        await db!.insert(schema.tasks).values({
          id,
          task: task.task,
          status: task.status,
          output: task.output ?? null,
          repoUrl: task.repoUrl ?? null,
          repoPath: task.repoPath ?? null,
          completedAt: task.completedAt ? new Date(task.completedAt) : null,
        });
      }
    }
  },
  get size() {
    return (async () => {
      const all = await taskService.getAll();
      return all.length;
    })();
  },
};

export const taskRoutes: FastifyPluginAsync = async (app) => {
  const vpsBridge = new VPSBridge();

  // List all tasks
  app.get('/tasks', async (request, reply) => {
    try {
      const taskList = await taskService.getAll();
      // Sort in descending order (newest first)
      taskList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return { tasks: taskList };
    } catch (error) {
      app.log.error(error, 'Failed to fetch tasks');
      return reply.status(500).send({
        error: 'Failed to fetch tasks',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get single task
  app.get<{ Params: { id: string } }>('/tasks/:id', async (request, reply) => {
    try {
      const task = await taskService.get(request.params.id);
      if (!task) {
        return reply.status(404).send({ error: 'Task not found' });
      }
      return task;
    } catch (error) {
      app.log.error(error, 'Failed to fetch task');
      return reply.status(500).send({
        error: 'Failed to fetch task',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Create new task
  app.post('/tasks', async (request, reply) => {
    const parseResult = CreateTaskSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Invalid request',
        details: parseResult.error.issues,
      });
    }

    const { task: taskDescription, repoUrl, repoPath } = parseResult.data;

    try {
      // Create task using taskService
      const task = await taskService.create({
        task: taskDescription,
        repoUrl,
        repoPath,
        status: 'pending',
      });

      // Execute task on VPS asynchronously
      vpsBridge.executeTask(task).then(async (result) => {
        try {
          await taskService.update(task.id, {
            status: result.success ? 'completed' : 'failed',
            output: result.output,
            completedAt: new Date(),
          });
        } catch (error) {
          app.log.error(error, 'Failed to update task after execution');
        }
      }).catch(async (error) => {
        try {
          await taskService.update(task.id, {
            status: 'failed',
            error: error.message,
            completedAt: new Date(),
          });
        } catch (updateError) {
          app.log.error(updateError, 'Failed to update task after error');
        }
      });

      // Mark as running
      const runningTask = await taskService.update(task.id, { status: 'running' });
      return reply.status(201).send(runningTask || task);
    } catch (error) {
      app.log.error(error, 'Failed to create task');
      return reply.status(500).send({
        error: 'Failed to create task',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Cancel task
  app.delete<{ Params: { id: string } }>('/tasks/:id', async (request, reply) => {
    try {
      const task = await taskService.get(request.params.id);
      if (!task) {
        return reply.status(404).send({ error: 'Task not found' });
      }

      if (task.status === 'completed' || task.status === 'failed') {
        return reply.status(400).send({ error: 'Cannot cancel completed task' });
      }

      const cancelledTask = await taskService.update(request.params.id, {
        status: 'cancelled',
        completedAt: new Date(),
      });

      return { success: true, task: cancelledTask || task };
    } catch (error) {
      app.log.error(error, 'Failed to cancel task');
      return reply.status(500).send({
        error: 'Failed to cancel task',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
};
