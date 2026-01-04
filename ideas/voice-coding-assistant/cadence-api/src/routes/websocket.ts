import { FastifyPluginAsync } from 'fastify';
import { randomUUID } from 'crypto';
import { streamManager } from '../services/stream-manager.js';

export const websocketRoutes: FastifyPluginAsync = async (app) => {
  // WebSocket endpoint for real-time task streaming
  app.get('/ws/stream', { websocket: true }, (socket, request) => {
    const connectionId = randomUUID();

    app.log.info(`WebSocket connection opened: ${connectionId}`);

    // Register with stream manager
    streamManager.addConnection(connectionId, socket);

    // Send welcome message
    socket.send(JSON.stringify({
      type: 'connected',
      connectionId,
      message: 'Connected to Cadence stream. Send { "type": "subscribe", "taskId": "..." } to subscribe to task events.',
    }));

    socket.on('close', () => {
      app.log.info(`WebSocket connection closed: ${connectionId}`);
    });

    socket.on('error', (error: Error) => {
      app.log.error(`WebSocket error for ${connectionId}: ${error.message}`);
    });
  });

  // Health check for WebSocket connections
  app.get('/ws/health', async () => {
    return {
      connections: streamManager.getConnectionCount(),
      status: 'ok',
    };
  });
};
