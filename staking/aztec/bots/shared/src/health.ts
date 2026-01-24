import { createServer, IncomingMessage, ServerResponse, Server } from 'http';
import { getMetrics } from './metrics';
import { Logger } from './logger';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Record<string, boolean>;
  uptime: number;
  timestamp: string;
}

export interface HealthServerConfig {
  port: number;
  checks?: Record<string, () => Promise<boolean>>;
}

export function createHealthServer(
  config: HealthServerConfig,
  logger: Logger
): Server {
  const startTime = Date.now();

  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    try {
      if (req.url === '/health' || req.url === '/healthz') {
        const checkResults: Record<string, boolean> = {};

        if (config.checks) {
          for (const [name, check] of Object.entries(config.checks)) {
            try {
              checkResults[name] = await check();
            } catch {
              checkResults[name] = false;
            }
          }
        }

        const allHealthy = Object.values(checkResults).every((v) => v);
        const status: HealthStatus = {
          status: allHealthy ? 'healthy' : 'unhealthy',
          checks: checkResults,
          uptime: (Date.now() - startTime) / 1000,
          timestamp: new Date().toISOString(),
        };

        res.writeHead(allHealthy ? 200 : 503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(status));
      } else if (req.url === '/ready' || req.url === '/readyz') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ready: true }));
      } else if (req.url === '/metrics') {
        const metricsData = await getMetrics();
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(metricsData);
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    } catch (error) {
      logger.error('Health server error', error as Error);
      res.writeHead(500);
      res.end('Internal Server Error');
    }
  });

  return server;
}

export function startHealthServer(
  config: HealthServerConfig,
  logger: Logger
): Promise<Server> {
  return new Promise((resolve, reject) => {
    const server = createHealthServer(config, logger);
    
    server.on('error', reject);
    
    server.listen(config.port, () => {
      logger.info(`Health server listening on port ${config.port}`);
      resolve(server);
    });
  });
}
