import { FastifyPluginAsync } from 'fastify';
import { eq } from 'drizzle-orm';
import { Task, CreateTaskSchema } from '../types.js';
import { VPSBridge } from '../services/vps-bridge.js';
import { db, schema, useMockStorage } from '../db/index.js';

// In-memory storage for tests
const inMemoryTasks = new Map<string, Task>();

// Helper function to convert database record to Task type
function toTask(record: typeof schema.tasks.$inferSelect): Task {
  return {
    id: record.id,
    task: record.task,
    repoUrl: record.repoUrl ?? undefined,
    repoPath: record.repoPath ?? undefined,
    status: record.status,
    output: record.output ?? undefined,
    createdAt: record.createdAt.toISOString(),
    completedAt: record.completedAt?.toISOString(),
  };
}

// Export for testing - backwards compatible Map-like interface
// Uses in-memory storage when db is not available (tests)
export const tasks = {
  clear: async () => {
    if (useMockStorage) {
      inMemoryTasks.clear();
    } else {
      await db!.delete(schema.tasks);
    }
  },
  get: async (id: string) => {
    if (useMockStorage) {
      return inMemoryTasks.get(id);
    }
    const records = await db!
      .select()
      .from(schema.tasks)
      .where(eq(schema.tasks.id, id))
      .limit(1);
    return records.length > 0 ? toTask(records[0]) : undefined;
  },
  set: async (id: string, task: Task) => {
    if (useMockStorage) {
      inMemoryTasks.set(id, task);
      return;
    }
    // For backwards compatibility with tests
    const existing = await db!
      .select()
      .from(schema.tasks)
      .where(eq(schema.tasks.id, id))
      .limit(1);

    if (existing.length > 0) {
      await db!
        .update(schema.tasks)
        .set({
          task: task.task,
          status: task.status,
          output: task.output ?? null,
          repoUrl: task.repoUrl ?? null,
          repoPath: task.repoPath ?? null,
          completedAt: task.completedAt ? new Date(task.completedAt) : null,
          updatedAt: new Date(),
        })
        .where(eq(schema.tasks.id, id));
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
  },
  get size() {
    if (useMockStorage) {
      return Promise.resolve(inMemoryTasks.size);
    }
    return (async () => {
      const records = await db!.select().from(schema.tasks);
      return records.length;
    })();
  },
};

export const taskRoutes: FastifyPluginAsync = async (app) => {
  const vpsBridge = new VPSBridge();

  // Helper to generate UUID for mock storage
  const generateId = () => crypto.randomUUID();

  // List all tasks
  app.get('/tasks', async (request, reply) => {
    try {
      if (useMockStorage) {
        const taskList = Array.from(inMemoryTasks.values())
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return { tasks: taskList };
      }

      const records = await db!
        .select()
        .from(schema.tasks)
        .orderBy(schema.tasks.createdAt);

      // Sort in descending order (newest first)
      const taskList = records
        .map(toTask)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
      if (useMockStorage) {
        const task = inMemoryTasks.get(request.params.id);
        if (!task) {
          return reply.status(404).send({ error: 'Task not found' });
        }
        return task;
      }

      const records = await db!
        .select()
        .from(schema.tasks)
        .where(eq(schema.tasks.id, request.params.id))
        .limit(1);

      if (records.length === 0) {
        return reply.status(404).send({ error: 'Task not found' });
      }

      return toTask(records[0]);
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
      let task: Task;

      if (useMockStorage) {
        // Create task in memory
        task = {
          id: generateId(),
          task: taskDescription,
          repoUrl: repoUrl ?? undefined,
          repoPath: repoPath ?? undefined,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        inMemoryTasks.set(task.id, task);
      } else {
        // Create task in database
        const [record] = await db!
          .insert(schema.tasks)
          .values({
            task: taskDescription,
            repoUrl: repoUrl ?? null,
            repoPath: repoPath ?? null,
            status: 'pending',
          })
          .returning();
        task = toTask(record);
      }

      // Execute task on VPS asynchronously
      vpsBridge.executeTask(task).then(async (result) => {
        try {
          if (useMockStorage) {
            const existingTask = inMemoryTasks.get(task.id);
            if (existingTask) {
              existingTask.status = result.success ? 'completed' : 'failed';
              existingTask.output = result.output;
              existingTask.completedAt = new Date().toISOString();
            }
          } else {
            await db!
              .update(schema.tasks)
              .set({
                status: result.success ? 'completed' : 'failed',
                output: result.output,
                completedAt: new Date(),
                updatedAt: new Date(),
              })
              .where(eq(schema.tasks.id, task.id));
          }
        } catch (error) {
          app.log.error(error, 'Failed to update task after execution');
        }
      }).catch(async (error) => {
        try {
          if (useMockStorage) {
            const existingTask = inMemoryTasks.get(task.id);
            if (existingTask) {
              existingTask.status = 'failed';
              existingTask.completedAt = new Date().toISOString();
            }
          } else {
            await db!
              .update(schema.tasks)
              .set({
                status: 'failed',
                error: error.message,
                completedAt: new Date(),
                updatedAt: new Date(),
              })
              .where(eq(schema.tasks.id, task.id));
          }
        } catch (updateError) {
          app.log.error(updateError, 'Failed to update task after error');
        }
      });

      // Mark as running
      if (useMockStorage) {
        task.status = 'running';
        return reply.status(201).send(task);
      }

      const [updatedRecord] = await db!
        .update(schema.tasks)
        .set({
          status: 'running',
          updatedAt: new Date(),
        })
        .where(eq(schema.tasks.id, task.id))
        .returning();

      return reply.status(201).send(toTask(updatedRecord));
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
      if (useMockStorage) {
        const task = inMemoryTasks.get(request.params.id);
        if (!task) {
          return reply.status(404).send({ error: 'Task not found' });
        }
        if (task.status === 'completed' || task.status === 'failed') {
          return reply.status(400).send({ error: 'Cannot cancel completed task' });
        }
        task.status = 'cancelled';
        task.completedAt = new Date().toISOString();
        return { success: true, task };
      }

      const records = await db!
        .select()
        .from(schema.tasks)
        .where(eq(schema.tasks.id, request.params.id))
        .limit(1);

      if (records.length === 0) {
        return reply.status(404).send({ error: 'Task not found' });
      }

      const task = toTask(records[0]);

      if (task.status === 'completed' || task.status === 'failed') {
        return reply.status(400).send({ error: 'Cannot cancel completed task' });
      }

      const [updatedRecord] = await db!
        .update(schema.tasks)
        .set({
          status: 'cancelled',
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(schema.tasks.id, request.params.id))
        .returning();

      return { success: true, task: toTask(updatedRecord) };
    } catch (error) {
      app.log.error(error, 'Failed to cancel task');
      return reply.status(500).send({
        error: 'Failed to cancel task',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
};
