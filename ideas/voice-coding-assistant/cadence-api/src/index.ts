import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { config } from 'dotenv';

import { taskRoutes } from './routes/tasks.js';
import { voiceRoutes } from './routes/voice.js';
import { healthRoutes } from './routes/health.js';
import { inputRoutes } from './routes/input.js';
import { websocketRoutes } from './routes/websocket.js';
import { webhookRoutes } from './routes/webhooks.js';

config();

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
    },
  });

  // Register plugins
  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  await app.register(websocket);

  // Register routes
  await app.register(healthRoutes, { prefix: '/api' });
  await app.register(taskRoutes, { prefix: '/api' });
  await app.register(voiceRoutes, { prefix: '/api' });
  await app.register(inputRoutes, { prefix: '/api' });
  await app.register(websocketRoutes, { prefix: '/api' });
  await app.register(webhookRoutes, { prefix: '/api' });

  return app;
}

async function start() {
  const app = await buildApp();

  try {
    await app.listen({ port: PORT, host: HOST });
    console.log(`Cadence API running at http://${HOST}:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

// Only start if this is the main module
if (process.argv[1]?.endsWith('index.ts') || process.argv[1]?.endsWith('index.js')) {
  start();
}
