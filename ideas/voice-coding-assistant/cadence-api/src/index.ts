import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import { config } from 'dotenv';

import { taskRoutes } from './routes/tasks.js';
import { voiceRoutes } from './routes/voice.js';
import { healthRoutes } from './routes/health.js';
import { inputRoutes } from './routes/input.js';
import { websocketRoutes } from './routes/websocket.js';
import { webhookRoutes } from './routes/webhooks.js';
import { authRoutes } from './routes/auth.js';

config();

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '100', 10);

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

  // Register rate limiting
  await app.register(rateLimit, {
    global: true,
    max: RATE_LIMIT_MAX,
    timeWindow: '1 minute',
    errorResponseBuilder: (request, context) => ({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Try again in ${context.after}`,
      statusCode: 429,
    }),
    onExceeding: (request, key) => {
      app.log.warn(`Rate limit approaching for ${request.ip}`);
    },
    onExceeded: (request, key) => {
      app.log.warn(`Rate limit exceeded for ${request.ip}`);
    },
  });

  // Register JWT plugin (if JWT_SECRET is configured)
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret) {
    await app.register(jwt, {
      secret: jwtSecret,
    });
  }

  // Register routes
  await app.register(authRoutes, { prefix: '/api' });
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
