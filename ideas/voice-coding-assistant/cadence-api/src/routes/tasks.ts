import { FastifyPluginAsync } from 'fastify';
import { randomUUID } from 'crypto';
import { Task, CreateTaskSchema, TaskStatus } from '../types.js';
import { VPSBridge } from '../services/vps-bridge.js';

// In-memory store (replace with database in production)
const tasks = new Map<string, Task>();

export const taskRoutes: FastifyPluginAsync = async (app) => {
  const vpsBridge = new VPSBridge();

  // List all tasks
  app.get('/tasks', async () => {
    return {
      tasks: Array.from(tasks.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    };
  });

  // Get single task
  app.get<{ Params: { id: string } }>('/tasks/:id', async (request, reply) => {
    const task = tasks.get(request.params.id);
    if (!task) {
      return reply.status(404).send({ error: 'Task not found' });
    }
    return task;
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

    const task: Task = {
      id: randomUUID(),
      task: taskDescription,
      repoUrl,
      repoPath,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    tasks.set(task.id, task);

    // Execute task on VPS asynchronously
    vpsBridge.executeTask(task).then((result) => {
      const updatedTask = tasks.get(task.id);
      if (updatedTask) {
        updatedTask.status = result.success ? 'completed' : 'failed';
        updatedTask.output = result.output;
        updatedTask.completedAt = new Date().toISOString();
        tasks.set(task.id, updatedTask);
      }
    }).catch((error) => {
      const updatedTask = tasks.get(task.id);
      if (updatedTask) {
        updatedTask.status = 'failed';
        updatedTask.output = error.message;
        updatedTask.completedAt = new Date().toISOString();
        tasks.set(task.id, updatedTask);
      }
    });

    // Mark as running
    task.status = 'running';
    tasks.set(task.id, task);

    return reply.status(201).send(task);
  });

  // Cancel task
  app.delete<{ Params: { id: string } }>('/tasks/:id', async (request, reply) => {
    const task = tasks.get(request.params.id);
    if (!task) {
      return reply.status(404).send({ error: 'Task not found' });
    }

    if (task.status === 'completed' || task.status === 'failed') {
      return reply.status(400).send({ error: 'Cannot cancel completed task' });
    }

    task.status = 'cancelled';
    task.completedAt = new Date().toISOString();
    tasks.set(task.id, task);

    return { success: true, task };
  });
};

// Export for testing
export { tasks };
