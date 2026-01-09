# GitHub OAuth Authentication

This document describes the GitHub OAuth authentication system implemented for the Cadence API.

## Overview

The API now supports GitHub OAuth authentication using JWT tokens. The authentication system is optional and doesn't break existing unauthenticated routes.

## Setup

### 1. Environment Variables

Add the following environment variables to your `.env` file:

```bash
# GitHub OAuth Application credentials
# Get these from https://github.com/settings/developers
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# JWT secret for signing tokens
# Generate a secure random string: openssl rand -base64 32
JWT_SECRET=your_jwt_secret_here

# Optional: JWT expiration time (default: 7d)
# Formats: 60 (seconds), 2m, 24h, 7d
JWT_EXPIRATION=7d
```

### 2. GitHub OAuth Application

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - **Application name:** Cadence Voice Assistant
   - **Homepage URL:** Your app URL (e.g., http://localhost:3000)
   - **Authorization callback URL:** Your frontend callback URL (e.g., http://localhost:3000/auth/callback)
4. Copy the Client ID and Client Secret to your `.env` file

## Authentication Flow

### 1. Client-Side: Redirect to GitHub

```javascript
const GITHUB_CLIENT_ID = 'your_client_id';
const REDIRECT_URI = 'http://localhost:3000/auth/callback';

// Redirect user to GitHub OAuth
window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=user:email`;
```

### 2. Client-Side: Handle Callback

```javascript
// In your callback route (e.g., /auth/callback)
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

if (code) {
  // Exchange code for JWT
  const response = await fetch('http://localhost:3001/api/auth/github', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  });

  const data = await response.json();

  if (response.ok) {
    // Store JWT in localStorage or cookie
    localStorage.setItem('accessToken', data.tokens.accessToken);

    // User info is available in data.user
    console.log('Logged in as:', data.user.username);
  }
}
```

### 3. Client-Side: Use JWT for Authenticated Requests

```javascript
const accessToken = localStorage.getItem('accessToken');

const response = await fetch('http://localhost:3001/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const data = await response.json();
console.log('Current user:', data.user);
```

## API Endpoints

### POST /api/auth/github

Exchange GitHub authorization code for JWT tokens.

**Request:**
```json
{
  "code": "github_authorization_code"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "123456",
    "username": "johndoe",
    "email": "john@example.com",
    "avatarUrl": "https://avatars.githubusercontent.com/u/123456",
    "githubId": 123456
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 604800
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid request body
- `401 Unauthorized`: Invalid authorization code
- `500 Internal Server Error`: Server or GitHub API error

### GET /api/auth/me

Get current authenticated user information.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "123456",
    "username": "johndoe",
    "email": "john@example.com",
    "avatarUrl": "https://avatars.githubusercontent.com/u/123456",
    "githubId": 123456
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing, invalid, or expired token

### POST /api/auth/refresh

Refresh JWT token (not yet implemented).

**Response (501 Not Implemented):**
```json
{
  "error": "Not Implemented",
  "message": "Token refresh is not yet implemented. Please re-authenticate."
}
```

## Using Authentication Middleware

### Protecting Routes

To require authentication on a route, use the `authenticateJWT` middleware:

```typescript
import { authenticateJWT } from '../middleware/auth.js';

app.get(
  '/api/protected-route',
  {
    preHandler: authenticateJWT,
  },
  async (request, reply) => {
    // Access authenticated user info
    const userId = request.jwtUser?.sub;
    const username = request.jwtUser?.username;

    return { message: `Hello ${username}!` };
  }
);
```

### Optional Authentication

For routes that should work with or without authentication:

```typescript
import { optionalAuthenticateJWT } from '../middleware/auth.js';

app.get(
  '/api/optional-auth-route',
  {
    preHandler: optionalAuthenticateJWT,
  },
  async (request, reply) => {
    if (request.jwtUser) {
      return { message: `Hello ${request.jwtUser.username}!` };
    } else {
      return { message: 'Hello guest!' };
    }
  }
);
```

## JWT Payload Structure

The JWT contains the following claims:

```typescript
{
  sub: string;        // GitHub user ID
  username: string;   // GitHub username
  email: string | null;  // GitHub email (if available)
  avatarUrl: string;  // GitHub avatar URL
  iat: number;        // Issued at (timestamp)
  exp: number;        // Expiration (timestamp)
}
```

Access these in your routes via `request.jwtUser`.

## Security Considerations

1. **HTTPS Only**: Use HTTPS in production to prevent token interception
2. **Secure Storage**: Store JWTs securely (httpOnly cookies preferred over localStorage)
3. **Token Expiration**: Tokens expire based on JWT_EXPIRATION setting (default: 7 days)
4. **Secret Management**: Keep JWT_SECRET and GitHub credentials secure
5. **Scope Limitation**: Only request necessary GitHub OAuth scopes

## Files Created

- `src/types/auth.ts` - Type definitions for authentication
- `src/middleware/auth.ts` - JWT verification middleware
- `src/routes/auth.ts` - Authentication endpoints
- `src/types/fastify.d.ts` - TypeScript declarations for Fastify JWT
- Updated `src/index.ts` - Registered JWT plugin and auth routes
- Updated `.env.example` - Added authentication environment variables

## Testing

To test the authentication flow manually:

1. Start the API: `npm run dev`
2. Open your browser to GitHub OAuth authorize URL (with your client ID)
3. Authorize the application
4. Copy the `code` parameter from the redirect URL
5. Make a POST request to `/api/auth/github` with the code
6. Use the returned JWT to access protected routes

Example with curl:

```bash
# Exchange code for JWT
curl -X POST http://localhost:3001/api/auth/github \
  -H "Content-Type: application/json" \
  -d '{"code":"YOUR_GITHUB_CODE"}'

# Use JWT to get user info
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Future Enhancements

- [ ] Implement refresh token rotation
- [ ] Add rate limiting to auth endpoints
- [ ] Store user sessions in database
- [ ] Add OAuth for other providers (Google, GitLab, etc.)
- [ ] Implement token revocation
- [ ] Add 2FA support
