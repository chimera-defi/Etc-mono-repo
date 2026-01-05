import { z } from 'zod';

// User interface
export interface User {
  id: string;
  username: string;
  email: string | null;
  avatarUrl: string;
  githubId: number;
}

// JWT payload interface
export interface JWTPayload {
  sub: string; // GitHub user ID
  username: string;
  email: string | null;
  avatarUrl: string;
  iat?: number;
  exp?: number;
}

// Auth tokens
export interface AuthTokens {
  accessToken: string; // Our JWT
  refreshToken?: string; // For future refresh token implementation
  expiresIn: number; // Seconds until expiration
}

// GitHub OAuth schemas
export const GitHubOAuthRequestSchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
});
export type GitHubOAuthRequest = z.infer<typeof GitHubOAuthRequestSchema>;

export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});
export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;

// GitHub API response types
export interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

export interface GitHubUserResponse {
  id: number;
  login: string;
  email: string | null;
  avatar_url: string;
  name: string | null;
}

// Auth response
export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}
