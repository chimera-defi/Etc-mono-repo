import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import {
  GitHubOAuthRequestSchema,
  GitHubTokenResponse,
  GitHubUserResponse,
  User,
  AuthResponse,
  AuthTokens,
  JWTPayload,
} from '../types/auth.js';
import { authenticateJWT } from '../middleware/auth.js';

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '7d'; // Default 7 days

/**
 * Exchange GitHub authorization code for access token
 */
async function exchangeCodeForToken(code: string): Promise<string> {
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    throw new Error('GitHub OAuth credentials not configured');
  }

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub OAuth token exchange failed: ${response.statusText}`);
  }

  const data = (await response.json()) as GitHubTokenResponse;

  if (!data.access_token) {
    throw new Error('No access token in GitHub response');
  }

  return data.access_token;
}

/**
 * Fetch user information from GitHub API
 */
async function fetchGitHubUser(accessToken: string): Promise<User> {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch GitHub user: ${response.statusText}`);
  }

  const githubUser = (await response.json()) as GitHubUserResponse;

  return {
    id: githubUser.id.toString(),
    username: githubUser.login,
    email: githubUser.email,
    avatarUrl: githubUser.avatar_url,
    githubId: githubUser.id,
  };
}

/**
 * Create JWT tokens for authenticated user
 */
function createTokens(app: FastifyInstance, user: User): AuthTokens {
  const payload: JWTPayload = {
    sub: user.id,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl,
  };

  const accessToken = app.jwt.sign(payload, {
    expiresIn: JWT_EXPIRATION,
  });

  // Calculate expiration in seconds
  const expiresIn = parseExpiration(JWT_EXPIRATION);

  return {
    accessToken,
    expiresIn,
  };
}

/**
 * Parse expiration string to seconds
 */
function parseExpiration(expiration: string): number {
  const match = expiration.match(/^(\d+)([smhd])$/);
  if (!match) {
    return 7 * 24 * 60 * 60; // Default 7 days
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 24 * 60 * 60;
    default:
      return 7 * 24 * 60 * 60;
  }
}

/**
 * Auth routes
 */
export async function authRoutes(
  app: FastifyInstance,
  _options: FastifyPluginOptions
): Promise<void> {
  /**
   * POST /api/auth/github
   * Exchange GitHub authorization code for JWT tokens
   */
  app.post<{
    Body: { code: string };
  }>('/auth/github', async (request, reply) => {
    try {
      // Validate request body
      const { code } = GitHubOAuthRequestSchema.parse(request.body);

      // Exchange code for GitHub access token
      const githubAccessToken = await exchangeCodeForToken(code);

      // Fetch user information from GitHub
      const user = await fetchGitHubUser(githubAccessToken);

      // Create our JWT tokens
      const tokens = createTokens(app, user);

      // Return auth response
      const response: AuthResponse = {
        user,
        tokens,
      };

      return reply.status(200).send(response);
    } catch (err) {
      const error = err as Error;
      request.log.error(err, 'GitHub OAuth error');

      if (error.message.includes('not configured')) {
        return reply.status(500).send({
          error: 'Configuration Error',
          message: 'GitHub OAuth is not properly configured',
        });
      }

      if (error.message.includes('GitHub')) {
        return reply.status(401).send({
          error: 'Authentication Failed',
          message: 'Invalid authorization code or GitHub authentication failed',
        });
      }

      if (error.name === 'ZodError') {
        return reply.status(400).send({
          error: 'Validation Error',
          message: 'Invalid request body',
        });
      }

      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Authentication failed',
      });
    }
  });

  /**
   * POST /api/auth/refresh
   * Refresh JWT token (placeholder for future implementation)
   */
  app.post('/auth/refresh', async (request, reply) => {
    // Placeholder for refresh token implementation
    // For now, users will need to re-authenticate when token expires
    return reply.status(501).send({
      error: 'Not Implemented',
      message: 'Token refresh is not yet implemented. Please re-authenticate.',
    });
  });

  /**
   * GET /api/auth/me
   * Get current authenticated user information
   */
  app.get(
    '/auth/me',
    {
      preHandler: authenticateJWT,
    },
    async (request, reply) => {
      try {
        if (!request.jwtUser) {
          return reply.status(401).send({
            error: 'Unauthorized',
            message: 'User not authenticated',
          });
        }

        const user: User = {
          id: request.jwtUser.sub,
          username: request.jwtUser.username,
          email: request.jwtUser.email,
          avatarUrl: request.jwtUser.avatarUrl,
          githubId: parseInt(request.jwtUser.sub, 10),
        };

        return reply.status(200).send({ user });
      } catch (err) {
        request.log.error(err, 'Get user error');
        return reply.status(500).send({
          error: 'Internal Server Error',
          message: 'Failed to get user information',
        });
      }
    }
  );
}
