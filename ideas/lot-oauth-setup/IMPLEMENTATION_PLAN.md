# LOT Implementation Plan

## Overview

This document outlines the concrete steps to build LOT (Linked OAuth Tooling) as an MCP server with IDE integration.

---

## Phase 1: Foundation (Weeks 1-3)

### Week 1: Project Setup

- [ ] Initialize TypeScript MCP server project
  ```bash
  mkdir lot-mcp-server && cd lot-mcp-server
  npm init -y
  npm install @modelcontextprotocol/sdk zod
  npm install -D typescript @types/node
  ```

- [ ] Set up project structure
  ```
  lot-mcp-server/
  ├── src/
  │   ├── index.ts           # MCP server entry
  │   ├── tools/             # MCP tools
  │   │   ├── initiate-oauth.ts
  │   │   ├── complete-oauth.ts
  │   │   └── generate-integration.ts
  │   ├── providers/         # Provider adapters
  │   │   ├── base.ts
  │   │   ├── google-analytics.ts
  │   │   └── stripe.ts
  │   ├── generators/        # Code generators
  │   │   ├── nextjs.ts
  │   │   ├── express.ts
  │   │   └── remix.ts
  │   └── utils/
  │       ├── oauth.ts
  │       ├── tokens.ts
  │       └── detection.ts
  ├── templates/             # Code templates
  │   ├── google-analytics/
  │   │   ├── nextjs/
  │   │   └── express/
  │   └── stripe/
  │       ├── nextjs/
  │       └── express/
  ├── package.json
  └── tsconfig.json
  ```

- [ ] Configure build and development scripts
- [ ] Set up testing framework (Vitest or Jest)

### Week 2: OAuth Infrastructure

- [ ] Implement base OAuth handler
  ```typescript
  // src/utils/oauth.ts
  export interface OAuthConfig {
    authUrl: string;
    tokenUrl: string;
    clientId: string;
    clientSecret: string;
    scopes: string[];
    redirectUri: string;
  }

  export async function generateAuthUrl(config: OAuthConfig, state: string): Promise<string>;
  export async function exchangeCode(config: OAuthConfig, code: string): Promise<Tokens>;
  export async function refreshToken(config: OAuthConfig, refreshToken: string): Promise<Tokens>;
  ```

- [ ] Implement secure token storage (using OS keychain via `keytar`)
- [ ] Create OAuth state management (PKCE support)
- [ ] Build callback server for local OAuth flow

### Week 3: MCP Tools Foundation

- [ ] Implement `lot_list_providers` tool
  ```typescript
  server.tool("lot_list_providers", {}, async () => {
    return {
      providers: Object.keys(providers).map(key => ({
        id: key,
        name: providers[key].displayName,
        description: providers[key].description,
        category: providers[key].category
      }))
    };
  });
  ```

- [ ] Implement `lot_initiate_oauth` tool
- [ ] Implement `lot_check_oauth_status` tool
- [ ] Implement `lot_detect_project` tool (detect Next.js, Express, etc.)
- [ ] Write unit tests for all tools

---

## Phase 2: First Providers (Weeks 4-6)

### Week 4: Google Analytics Provider

**Why first:** Common need, straightforward OAuth, clear config extraction.

- [ ] Implement Google OAuth flow
- [ ] Implement GA4 Admin API integration
  - Fetch account summaries
  - Fetch property details
  - Extract measurement ID
- [ ] Create Next.js templates
  - `.env.local` template
  - `components/Analytics.tsx` component
  - `app/layout.tsx` integration snippet
- [ ] Create Express templates
- [ ] Write integration tests with mock APIs

**Template Example:**
```typescript
// templates/google-analytics/nextjs/Analytics.tsx.template
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;

export function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;
    
    const url = pathname + searchParams.toString();
    window.gtag?.('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }, [pathname, searchParams]);

  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `,
        }}
      />
    </>
  );
}
```

### Week 5: Stripe Provider

**Why second:** High-value integration, complex setup with multiple keys.

- [ ] Implement Stripe OAuth (Connect)
- [ ] Implement direct API key retrieval flow (for simpler cases)
- [ ] Extract configuration:
  - Publishable key
  - Secret key (store securely)
  - Webhook signing secret
- [ ] Create Next.js templates
  - `.env.local` with all keys
  - `lib/stripe.ts` server-side client
  - `components/StripeProvider.tsx`
  - `app/api/webhooks/stripe/route.ts`
- [ ] Create Express templates
- [ ] Handle test vs. live mode

### Week 6: Supabase Provider

**Why third:** Popular full-stack solution, multiple config values.

- [ ] Implement Supabase OAuth (or API key flow)
- [ ] Extract configuration:
  - Project URL
  - Anon key
  - Service role key
- [ ] Create Next.js templates
  - `.env.local` setup
  - `lib/supabase/client.ts`
  - `lib/supabase/server.ts`
  - `middleware.ts` for auth
- [ ] Create Express templates

---

## Phase 3: IDE Integration (Weeks 7-9)

### Week 7: VS Code/Cursor Extension Foundation

- [ ] Initialize extension project
  ```bash
  npx yo code  # VS Code extension generator
  ```

- [ ] Implement webview for OAuth popup
- [ ] Implement file operation commands:
  - `lot.writeFile` - with diff preview
  - `lot.updateEnv` - smart env file updates
  - `lot.installDependency` - npm/yarn/pnpm detection

### Week 8: Extension UX

- [ ] Build setup wizard UI
  ```
  ┌─────────────────────────────────────────┐
  │ LOT: Set up Google Analytics            │
  ├─────────────────────────────────────────┤
  │                                         │
  │ Step 1: Authenticate with Google   ✓    │
  │ Step 2: Select GA4 Property        →    │
  │ Step 3: Configure project               │
  │ Step 4: Verify setup                    │
  │                                         │
  │ [Back]                    [Continue]    │
  └─────────────────────────────────────────┘
  ```

- [ ] Implement file change preview
- [ ] Add rollback functionality
- [ ] Create verification checklist UI

### Week 9: MCP Client Integration

- [ ] Connect extension to LOT MCP server
- [ ] Implement response streaming for progress updates
- [ ] Add error handling and recovery
- [ ] Test with Cursor and Claude Desktop

---

## Phase 4: Additional Providers (Weeks 10-14)

### Provider Implementation Template

For each provider, implement:

1. **OAuth/Auth Flow**
2. **Config Extraction API Calls**
3. **Templates for Each Supported Framework**
4. **Tests**

### Week 10: Auth Providers
- [ ] Auth0
- [ ] Clerk

### Week 11: Monitoring/Analytics
- [ ] Sentry
- [ ] Mixpanel

### Week 12: Email Services
- [ ] SendGrid
- [ ] Resend

### Week 13: Cloud Services
- [ ] AWS (IAM-based, not OAuth)
- [ ] Vercel

### Week 14: Databases
- [ ] PlanetScale
- [ ] Neon

---

## Phase 5: Polish & Launch (Weeks 15-16)

### Week 15: Documentation & Testing

- [ ] Write comprehensive README
- [ ] Create video demos
- [ ] Write provider documentation
- [ ] Add contribution guidelines
- [ ] Perform security audit
- [ ] Load testing

### Week 16: Launch

- [ ] Publish MCP server to npm
- [ ] Publish VS Code extension
- [ ] Submit to MCP Registry
- [ ] Write launch blog post
- [ ] Share on social media, HN, Reddit

---

## Technical Decisions

### MCP Server Implementation

**Language:** TypeScript (aligns with MCP SDK, wide adoption)

**Key Dependencies:**
```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "zod": "^3.22.0",
    "keytar": "^7.9.0",
    "node-fetch": "^3.3.0"
  }
}
```

### OAuth Callback Handling

**Option A: Local HTTP Server**
- Spin up temporary server on random port
- Register `http://localhost:{port}/callback` as redirect URI
- Works offline, secure

**Option B: Cloud Callback Relay**
- Use `https://lot.example.com/callback`
- Relay tokens securely to local client
- Simpler OAuth app setup

**Decision:** Start with Option A for security, add Option B as alternative.

### Token Storage

**Strategy:** Use OS keychain via `keytar`
```typescript
import * as keytar from 'keytar';

const SERVICE_NAME = 'lot-oauth-setup';

export async function storeTokens(provider: string, tokens: Tokens) {
  await keytar.setPassword(SERVICE_NAME, provider, JSON.stringify(tokens));
}

export async function getTokens(provider: string): Promise<Tokens | null> {
  const stored = await keytar.getPassword(SERVICE_NAME, provider);
  return stored ? JSON.parse(stored) : null;
}
```

### Project Detection

**Strategy:** File-based heuristics
```typescript
export async function detectProjectType(cwd: string): Promise<ProjectType> {
  const files = await fs.readdir(cwd);
  
  if (files.includes('next.config.js') || files.includes('next.config.ts')) {
    return 'nextjs';
  }
  if (files.includes('remix.config.js')) {
    return 'remix';
  }
  if (files.includes('nuxt.config.ts')) {
    return 'nuxt';
  }
  // ... more detection
  
  // Fallback to package.json analysis
  const pkg = await readPackageJson(cwd);
  if (pkg.dependencies?.express) return 'express';
  if (pkg.dependencies?.fastify) return 'fastify';
  
  return 'unknown';
}
```

---

## Testing Strategy

### Unit Tests
- OAuth flow logic
- Token encryption/decryption
- Template rendering
- Project detection

### Integration Tests
- Full provider flows with mock APIs
- MCP tool invocations
- File operations

### E2E Tests
- Full setup flow with real providers (using test accounts)
- VS Code extension UI tests

---

## Security Considerations

1. **Never log tokens** - Use placeholders in logs
2. **Encrypt at rest** - OS keychain + additional encryption
3. **Short-lived tokens** - Prefer access tokens over storing secrets
4. **Scope minimization** - Request only necessary OAuth scopes
5. **User confirmation** - Always show what files will be created/modified
6. **Audit trail** - Log setup actions (not credentials)

---

## Open Questions

1. **Provider priority:** Survey needed to validate ordering
2. **Pricing model:** Free? Freemium? Open source with hosted option?
3. **Team features:** How to handle shared credentials?
4. **CI/CD integration:** How to run LOT in non-interactive environments?

---

## Resources

- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [VS Code Extension API](https://code.visualstudio.com/api)
- [OAuth 2.0 PKCE](https://oauth.net/2/pkce/)
- [Keytar (OS Keychain)](https://github.com/atom/node-keytar)
