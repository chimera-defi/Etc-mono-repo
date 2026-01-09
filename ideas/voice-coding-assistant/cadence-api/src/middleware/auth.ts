import { FastifyRequest, FastifyReply } from 'fastify';
import { JWTPayload } from '../types/auth.js';

// Extend FastifyRequest to include jwtUser property (avoid conflict with existing 'user')
declare module 'fastify' {
  interface FastifyRequest {
    jwtUser?: JWTPayload;
  }
}

/**
 * JWT authentication middleware
 * Verifies the JWT token in the Authorization header
 * and attaches the decoded user info to the request
 */
export async function authenticateJWT(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Missing Authorization header',
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Invalid Authorization header format. Expected: Bearer <token>',
      });
    }

    const token = authHeader.substring(7);

    if (!token) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Missing token',
      });
    }

    // Verify and decode the JWT
    try {
      const decoded = await request.server.jwt.verify<JWTPayload>(token);
      request.jwtUser = decoded;
    } catch (err) {
      const error = err as Error;
      if (error.message.includes('expired')) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'Token expired',
        });
      }

      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Invalid token',
      });
    }
  } catch (err) {
    request.log.error(err, 'Authentication error');
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Authentication failed',
    });
  }
}

/**
 * Optional JWT authentication middleware
 * Tries to authenticate but doesn't fail if token is missing/invalid
 * Useful for routes that have optional authentication
 */
export async function optionalAuthenticateJWT(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return;
    }

    const token = authHeader.substring(7);

    if (!token) {
      return;
    }

    try {
      const decoded = await request.server.jwt.verify<JWTPayload>(token);
      request.jwtUser = decoded;
    } catch {
      // Silently fail - this is optional auth
      return;
    }
  } catch (err) {
    request.log.error(err, 'Optional authentication error');
    // Don't fail the request
  }
}
