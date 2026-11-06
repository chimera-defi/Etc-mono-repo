# Cursor Agents Website Analysis

## Summary

**cursor.com/agents** is a **web-based dashboard** for managing and monitoring Cursor's "Cloud Agents" (also called "Background Agents"). It is NOT a mobile app - it's a **Next.js Progressive Web App (PWA)** hosted on Vercel.

## What Is It?

### Product Description
- **"Cursor Agents"** is a feature that allows users to run AI coding agents in the cloud
- Agents can work autonomously on GitHub repositories in the background
- Users can monitor progress, pause agents, and review results via the web dashboard
- It's part of Cursor's paid product offering (Pro, Ultra, Business tiers)

### Key Capabilities (from code analysis)
1. **Repository Selection** - Connect GitHub repositories
2. **Branch Selection** - Choose which branch agents work on
3. **Model Selection** - Choose AI models (Claude, GPT, etc.)
4. **Real-time Progress** - Monitor agent status (CREATING, RUNNING, FINISHED, ERROR, EXPIRED)
5. **Follow-up Requests** - Send additional instructions to running agents
6. **Privacy Controls** - User privacy mode settings

## Technology Stack

### Frontend
| Technology | Evidence | Purpose |
|------------|----------|---------|
| **Next.js 14+** | `/_next/static/`, App Router paths | Framework |
| **React 18+** | RSC, Server Components | UI Library |
| **TypeScript** | `.tsx` file patterns | Type Safety |
| **Tailwind CSS** | `className` patterns like `flex`, `bg-`, `text-` | Styling |
| **Radix UI** | References in HTML | Accessible components |
| **React Query** | `queryKey`, `queryFn` hooks | Data fetching |
| **Lucide Icons** | Icon component patterns | Icons |

### Infrastructure
| Technology | Evidence | Purpose |
|------------|----------|---------|
| **Vercel** | `server: Vercel`, `x-vercel-cache` headers, `dpl_` hashes | Hosting |
| **Cloudflare** | Turnstile CAPTCHA on auth page | Security/CDN |
| **AWS S3** | `cloud-agent-artifacts.s3.us-east-1.amazonaws.com` | Artifact storage |
| **Pusher** | CSP allows `*.pusher.com`, `wss://*.pusher.com` | Real-time updates |

### Authentication & Services
| Service | Domain | Purpose |
|---------|--------|---------|
| **WorkOS** | `workoscdn.com` | Enterprise SSO |
| **Authenticator** | `authenticator.cursor.sh` | Auth gateway |
| **PostHog** | `*.posthog.com` | Analytics |
| **Datadog** | `browser-intake-us5-datadoghq.com` | Monitoring |
| **Sanity** | `cdn.sanity.io` | CMS for marketing content |
| **Basehub** | `*.basehub.earth`, `*.basehub.com` | Content/Media |

### Cloud Agent Infrastructure
| Component | Domain/Pattern | Purpose |
|-----------|---------------|---------|
| **Agent VMs** | `*.agent.cvm.dev` | Cloud VMs for running agents |
| **Localhost Proxy** | `*.lclhst.build` | Local development proxy |
| **Cursor API** | `*.cursor.sh`, `*.cursor.com` | Backend services |

## Is It a PWA?

**Yes, cursor.com is a PWA** (Progressive Web App).

### PWA Manifest
```json
{
    "name": "Cursor",
    "short_name": "Cursor",
    "icons": [
      {"src": "/marketing-static/icon-192x192.png", "type": "image/png", "sizes": "192x192"},
      {"src": "/marketing-static/icon-512x512.png", "type": "image/png", "sizes": "512x512"}
    ],
    "start_url": "/",
    "display": "standalone",
    "theme_color": "#000000",
    "background_color": "#000000"
}
```

### PWA Meta Tags
- `apple-mobile-web-app-capable: yes`
- `apple-mobile-web-app-status-bar-style: default`
- `apple-mobile-web-app-title: Cursor`
- `theme-color: #17191d`
- Apple touch icons

**Note**: While it has PWA capabilities, no service worker was detected in the source, suggesting offline functionality may be limited.

## API Endpoints (Discovered)

```
/api/auth/login
/api/auth/list-jwt-public-keys
/api/auth/addAsyncFollowupBackgroundComposer
/api/auth/notifyBackgroundComposerShown
/api/auth/registerPushNotificationToken
/api/auth/startBackgroundComposerFromSnapshot
/api/auth/startParallelAgentWorkflow
/api/background-composer/get-detailed-composer
/api/background-composer/pause
/api/dashboard/get-user-privacy-mode
/api/dashboard/set-user-privacy-mode
/api/bugbotDeeplinkEvent
/api/bugbot/encrypted-data
```

## Agent Status States

From the code, agents have the following states:
- `UNSPECIFIED` - Initial/unknown state
- `CREATING` - Being set up
- `RUNNING` - Actively working
- `FINISHED` - Completed
- `ERROR` - Failed
- `EXPIRED` - Timed out

## Agent Sources

Agents can be started from:
- `WEBSITE` - cursor.com/agents web interface
- `IOS_APP` - Cursor iOS companion app

## Internationalization

The site supports multiple languages:
- `en-US` (English)
- `zh-CN` / `cn` (Chinese Simplified)
- `ja` (Japanese)
- `zh-Hant` (Chinese Traditional)

## Security

- **Cloudflare Protection** - Bot detection on auth pages
- **JWT Auth** - Token-based authentication
- **CSP Headers** - Strict content security policy
- **HTTPS Only** - HSTS enabled with 31536000 max-age

## Mobile App Connection

### ⚠️ Correction
The code contains an `IOS_APP` source enum, but **no public Cursor iOS app exists** in the App Store. This could indicate:
- An internal/beta feature
- Future-proofing for a planned app
- An employee-only companion app

The API is *prepared* for mobile clients with:
- Push notification registration endpoint
- Source enum supporting `IOS_APP` and `WEBSITE`
- But no publicly available iOS app was found

## Business Model Indicators

From the code analysis:
- **Free tier** has limited agent usage
- **Trial users** have restrictions
- **"Running on Auto"** - fallback when limits reached
- **Team admin controls** - can restrict/allow agent usage
- **Payment required** errors for premium features

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    cursor.com (Vercel)                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Next.js App (RSC + Client)                │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │ │
│  │  │ Marketing│  │  /agents │  │   /api/* (Edge)     │  │ │
│  │  │  Pages   │  │ Dashboard│  │   Backend Routes    │  │ │
│  │  └──────────┘  └──────────┘  └──────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           │
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │ WorkOS Auth  │ │  Pusher RT   │ │ Agent VMs    │
    │ cursor.sh    │ │  WebSocket   │ │ *.cvm.dev    │
    └──────────────┘ └──────────────┘ └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   GitHub     │
                    │   Repos      │
                    └──────────────┘
```

## Screenshots

See `cursor_agents_screenshot.png` and `cursor_main_screenshot.png` in this directory.

## Key Findings

1. **Not a mobile app** - It's a web app with PWA capabilities
2. **Cloud-based agents** - Runs in remote VMs, not locally
3. **GitHub-centric** - Agents work on GitHub repos
4. **Subscription-based** - Different tiers for different usage limits
5. **Real-time updates** - Via Pusher WebSocket connections
6. **Multi-model support** - Supports multiple AI models (referred to as "parallel agent workflow")
7. **Enterprise features** - Team management, privacy controls, admin restrictions

## Date of Analysis
December 8, 2025
