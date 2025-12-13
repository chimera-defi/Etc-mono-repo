# LOT Provider Templates

## Overview

This document catalogs provider integrations that LOT can automate, organized by category. Each provider includes:
- Authentication method (OAuth vs API Key)
- Setup complexity (what makes it painful today)
- Configuration data to extract
- Framework-specific templates

---

## Table of Contents

1. [Google Services](#google-services)
   - [Google Analytics (GA4)](#google-analytics-ga4)
   - [Gmail API](#gmail-api)
   - [Google OAuth (Sign in with Google)](#google-oauth-sign-in-with-google)
   - [Google Maps](#google-maps)
   - [Google Cloud Storage](#google-cloud-storage)
   - [Firebase](#firebase)
2. [Email Services](#email-services)
3. [Authentication Providers](#authentication-providers)
4. [Payment Processors](#payment-processors)
5. [Databases & Backend](#databases--backend)
6. [Monitoring & Analytics](#monitoring--analytics)
7. [AI/ML APIs](#aiml-apis)
8. [Communication](#communication)
9. [CMS & Content](#cms--content)
10. [Search](#search)
11. [Cloud Infrastructure](#cloud-infrastructure)
12. [Provider Priority Matrix](#provider-priority-matrix)

---

# Google Services

Google services are notoriously complex to set up due to:
- Google Cloud Console navigation
- Multiple credential types (OAuth, Service Account, API Key)
- Scope management
- Project/property selection
- Verification requirements

## Google Analytics (GA4)

### Current Pain Points
```
Time to set up manually: 15-25 minutes

Steps today:
1. Go to Google Analytics → Find property → Copy Measurement ID
2. Go to Google Cloud Console → Create project (or find existing)
3. Enable Analytics API
4. Create OAuth credentials OR just use Measurement ID
5. Figure out which approach is right (client-side vs server-side)
6. Install package (@next/third-parties or custom)
7. Configure environment variables
8. Add to layout/app
9. Test that events are firing
10. Realize you need Google Tag Manager instead... start over
```

### LOT Automation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ GOOGLE ANALYTICS SETUP FLOW                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─ User ────────────────────────────────────────────────────────────────┐   │
│ │ Add Google Analytics to my Next.js site                                │   │
│ └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│ ┌─ AI ──────────────────────────────────────────────────────────────────┐   │
│ │                                                                        │   │
│ │ I'll set up Google Analytics (GA4) for your Next.js project.          │   │
│ │                                                                        │   │
│ │ **Quick question first:** What do you need?                           │   │
│ │                                                                        │   │
│ │ ┌────────────────────────────────────────────────────────────────┐    │   │
│ │ │                                                                 │    │   │
│ │ │  ○ **Basic Analytics** (Recommended for most sites)            │    │   │
│ │ │    Page views, sessions, user metrics                          │    │   │
│ │ │    → Uses Measurement ID only (simpler)                        │    │   │
│ │ │                                                                 │    │   │
│ │ │  ○ **Advanced Analytics**                                       │    │   │
│ │ │    Custom events, server-side tracking, Data API access        │    │   │
│ │ │    → Uses OAuth + Service Account (more setup)                 │    │   │
│ │ │                                                                 │    │   │
│ │ └────────────────────────────────────────────────────────────────┘    │   │
│ │                                                                        │   │
│ └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Path A: Basic Analytics (Measurement ID Only)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ BASIC ANALYTICS FLOW                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─ User selects "Basic Analytics" ──────────────────────────────────────┐   │
│ └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│ ┌─ AI ──────────────────────────────────────────────────────────────────┐   │
│ │                                                                        │   │
│ │ For basic analytics, I just need your GA4 Measurement ID.             │   │
│ │                                                                        │   │
│ │ **Option 1: I'll fetch it automatically**                             │   │
│ │                                                                        │   │
│ │ [🔗 Sign in with Google]                                              │   │
│ │     I'll show you your GA4 properties to choose from                  │   │
│ │                                                                        │   │
│ │ **Option 2: Enter it manually**                                       │   │
│ │                                                                        │   │
│ │ Your Measurement ID looks like: `G-XXXXXXXXXX`                        │   │
│ │ Find it at: Analytics → Admin → Data Streams → Your stream            │   │
│ │                                                                        │   │
│ │ [Enter Measurement ID manually]                                        │   │
│ │                                                                        │   │
│ └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│ ═══════════════════════════════════════════════════════════════════════════ │
│                                                                             │
│ ┌─ If user clicks "Sign in with Google" ────────────────────────────────┐   │
│ └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│ [Browser opens to Google OAuth]                                             │
│                                                                             │
│ Scopes requested:                                                           │
│ • https://www.googleapis.com/auth/analytics.readonly                       │
│                                                                             │
│ ┌─ After OAuth success ─────────────────────────────────────────────────┐   │
│ │                                                                        │   │
│ │ ✅ Connected to Google Analytics!                                      │   │
│ │                                                                        │   │
│ │ I found **3 GA4 properties** in your account:                         │   │
│ │                                                                        │   │
│ │ ┌────────────────────────────────────────────────────────────────┐    │   │
│ │ │                                                                 │    │   │
│ │ │  ○ **My Portfolio Site**                                       │    │   │
│ │ │    G-ABC123XYZ · portfolio.dev · 1.2k users/month              │    │   │
│ │ │                                                                 │    │   │
│ │ │  ● **Acme Corp Website**                                       │    │   │
│ │ │    G-DEF456UVW · acmecorp.com · 45k users/month                │    │   │
│ │ │                                                                 │    │   │
│ │ │  ○ **Side Project**                                            │    │   │
│ │ │    G-GHI789RST · sideproject.io · 200 users/month              │    │   │
│ │ │                                                                 │    │   │
│ │ │  ○ **Create new property...**                                   │    │   │
│ │ │                                                                 │    │   │
│ │ └────────────────────────────────────────────────────────────────┘    │   │
│ │                                                                        │   │
│ │ [Use Selected Property]                                                │   │
│ │                                                                        │   │
│ └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Path A: Generated Files (Basic)

```typescript
// .env.local
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-DEF456UVW

// components/Analytics.tsx
'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useEffect } from 'react';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || !window.gtag) return;
    
    const url = pathname + (searchParams?.toString() ? `?${searchParams}` : '');
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }, [pathname, searchParams]);

  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}

// Optional: Event tracking helper
export function trackEvent(action: string, category: string, label?: string, value?: number) {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
}

// types/gtag.d.ts
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}
export {};

// app/layout.tsx (addition)
import { Analytics } from '@/components/Analytics';

// Add inside <body>:
<Analytics />
```

### Path B: Advanced Analytics (OAuth + Service Account)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ADVANCED ANALYTICS FLOW                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─ User selects "Advanced Analytics" ───────────────────────────────────┐   │
│ └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│ ┌─ AI ──────────────────────────────────────────────────────────────────┐   │
│ │                                                                        │   │
│ │ Advanced analytics requires a few more steps:                         │   │
│ │                                                                        │   │
│ │ 1. **GA4 Property** - For the Measurement ID                         │   │
│ │ 2. **Google Cloud Project** - For API access                         │   │
│ │ 3. **Service Account** - For server-side data fetching               │   │
│ │                                                                        │   │
│ │ I'll guide you through each step.                                     │   │
│ │                                                                        │   │
│ │ [🔗 Sign in with Google]                                              │   │
│ │     Permissions: Analytics (read), Cloud Platform (project access)   │   │
│ │                                                                        │   │
│ └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│ [After OAuth - more complex flow with project selection, service account   │
│  creation, and JSON key generation]                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Provider Configuration

```typescript
const googleAnalyticsProvider = {
  id: 'google_analytics',
  name: 'Google Analytics',
  category: 'analytics',
  
  variants: {
    basic: {
      name: 'Basic Analytics',
      description: 'Page views and standard metrics',
      authMethod: 'oauth_or_manual',
      oauth: {
        scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
      },
      manual: {
        fields: [
          {
            key: 'measurementId',
            label: 'Measurement ID',
            format: /^G-[A-Z0-9]+$/,
            placeholder: 'G-XXXXXXXXXX',
            helpUrl: 'https://support.google.com/analytics/answer/9539598',
          }
        ]
      },
      configExtraction: async (tokens) => {
        // Fetch GA4 properties via Analytics Admin API
        const response = await fetch(
          'https://analyticsadmin.googleapis.com/v1beta/accountSummaries',
          { headers: { Authorization: `Bearer ${tokens.access_token}` } }
        );
        const data = await response.json();
        
        // Return list of properties for user selection
        return data.accountSummaries.flatMap(account => 
          account.propertySummaries.map(prop => ({
            id: prop.property,
            name: prop.displayName,
            measurementId: prop.property.replace('properties/', 'G-'),
            account: account.displayName,
          }))
        );
      },
    },
    
    advanced: {
      name: 'Advanced Analytics',
      description: 'Custom events, server-side tracking, Data API',
      authMethod: 'oauth',
      oauth: {
        scopes: [
          'https://www.googleapis.com/auth/analytics.readonly',
          'https://www.googleapis.com/auth/cloud-platform',
        ],
      },
      // More complex setup...
    }
  },
  
  templates: {
    nextjs: {
      files: [/* as shown above */],
      dependencies: [],  // No external deps needed for basic
    },
    remix: { /* ... */ },
    express: { /* ... */ },
  }
};
```

---

## Gmail API

### Current Pain Points
```
Time to set up manually: 30-45 minutes

Steps today:
1. Google Cloud Console → Create/select project
2. Enable Gmail API
3. Configure OAuth consent screen (internal vs external)
4. Add scopes (confusing list of 50+ options)
5. Create OAuth credentials
6. Download client secret JSON
7. Figure out where to put the JSON file
8. Install googleapis package
9. Implement OAuth flow in your app
10. Handle token refresh
11. Store refresh tokens securely
12. Finally write the email sending code
```

### LOT Automation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ GMAIL API SETUP FLOW                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─ User ────────────────────────────────────────────────────────────────┐   │
│ │ I want to send emails from my app using Gmail                          │   │
│ └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│ ┌─ AI ──────────────────────────────────────────────────────────────────┐   │
│ │                                                                        │   │
│ │ I'll set up Gmail API for sending emails from your application.       │   │
│ │                                                                        │   │
│ │ **What type of email sending do you need?**                           │   │
│ │                                                                        │   │
│ │ ┌────────────────────────────────────────────────────────────────┐    │   │
│ │ │                                                                 │    │   │
│ │ │  ○ **Send as yourself** (Personal/Small projects)              │    │   │
│ │ │    Emails come from your Gmail address                         │    │   │
│ │ │    Good for: Contact forms, notifications to yourself          │    │   │
│ │ │    Limit: 500 emails/day                                        │    │   │
│ │ │                                                                 │    │   │
│ │ │  ○ **Send as service account** (Business/Production)           │    │   │
│ │ │    Requires Google Workspace domain                            │    │   │
│ │ │    Good for: Transactional emails, automated notifications     │    │   │
│ │ │    Limit: Based on Workspace plan                               │    │   │
│ │ │                                                                 │    │   │
│ │ │  ○ **Just reading emails** (Automation/Integration)            │    │   │
│ │ │    Read inbox, process emails, create drafts                   │    │   │
│ │ │                                                                 │    │   │
│ │ └────────────────────────────────────────────────────────────────┘    │   │
│ │                                                                        │   │
│ │ 💡 **Alternative:** For high-volume transactional email, consider    │   │
│ │    SendGrid, Resend, or AWS SES instead (easier setup, better        │   │
│ │    deliverability). Want me to set one of those up instead?          │   │
│ │                                                                        │   │
│ └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Send as Yourself Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ GMAIL "SEND AS YOURSELF" FLOW                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ [User selects "Send as yourself"]                                           │
│                                                                             │
│ ┌─ AI ──────────────────────────────────────────────────────────────────┐   │
│ │                                                                        │   │
│ │ I'll set up Gmail API for personal sending.                           │   │
│ │                                                                        │   │
│ │ **What will happen:**                                                 │   │
│ │ 1. You'll sign in with Google                                         │   │
│ │ 2. I'll create a Cloud project for you (or use existing)             │   │
│ │ 3. Gmail API will be enabled automatically                            │   │
│ │ 4. Your app will be able to send emails as you                       │   │
│ │                                                                        │   │
│ │ [🔗 Set up Gmail API]                                                 │   │
│ │                                                                        │   │
│ │ Permissions requested:                                                │   │
│ │ • Send email on your behalf                                           │   │
│ │ • (Optional) Read email - only if you need it                        │   │
│ │                                                                        │   │
│ └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│ [After OAuth]                                                               │
│                                                                             │
│ ┌─ AI ──────────────────────────────────────────────────────────────────┐   │
│ │                                                                        │   │
│ │ ✅ Gmail API connected!                                                │   │
│ │                                                                        │   │
│ │ **Account:** developer@gmail.com                                      │   │
│ │ **Project:** lot-gmail-setup-abc123 (auto-created)                   │   │
│ │                                                                        │   │
│ │ **Important:** This setup uses OAuth refresh tokens, which means:     │   │
│ │ • Tokens are stored securely on your machine                          │   │
│ │ • You may need to re-authenticate every 7 days during development    │   │
│ │ • For production, consider Google Workspace service account          │   │
│ │                                                                        │   │
│ │ Here's what I'll create:                                              │   │
│ │                                                                        │   │
│ │ ┌─ .env.local ───────────────────────────────────────────────────┐    │   │
│ │ │ GMAIL_CLIENT_ID=xxxxx.apps.googleusercontent.com               │    │   │
│ │ │ GMAIL_CLIENT_SECRET=GOCSPX-xxxxx                               │    │   │
│ │ │ GMAIL_REFRESH_TOKEN=1//xxxxx                                   │    │   │
│ │ │ GMAIL_USER_EMAIL=developer@gmail.com                           │    │   │
│ │ └────────────────────────────────────────────────────────────────┘    │   │
│ │                                                                        │   │
│ │ ┌─ lib/gmail.ts ─────────────────────────────────────────────────┐    │   │
│ │ │ [Gmail client with send function]                               │    │   │
│ │ └────────────────────────────────────────────────────────────────┘    │   │
│ │                                                                        │   │
│ │ [Review Changes] [Apply All]                                          │   │
│ │                                                                        │   │
│ └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Generated Code: Gmail

```typescript
// lib/gmail.ts
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
);

oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

interface EmailOptions {
  to: string;
  subject: string;
  body: string;
  html?: string;
}

export async function sendEmail({ to, subject, body, html }: EmailOptions) {
  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
  
  const messageParts = [
    `From: ${process.env.GMAIL_USER_EMAIL}`,
    `To: ${to}`,
    `Subject: ${utf8Subject}`,
    'MIME-Version: 1.0',
    `Content-Type: ${html ? 'text/html' : 'text/plain'}; charset=utf-8`,
    '',
    html || body,
  ];
  
  const message = messageParts.join('\n');
  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const response = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage,
    },
  });

  return response.data;
}

// Usage example:
// await sendEmail({
//   to: 'recipient@example.com',
//   subject: 'Hello from my app!',
//   body: 'This is a test email.',
// });
```

---

## Google OAuth (Sign in with Google)

### Current Pain Points
```
Time to set up manually: 20-30 minutes

Steps today:
1. Google Cloud Console → Create project
2. Configure OAuth consent screen
3. Add scopes (email, profile)
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs (easy to mess up)
6. Download client secret
7. Install next-auth or passport-google-oauth
8. Configure provider with correct callback URL
9. Handle session management
10. Debug redirect URI mismatch errors (everyone hits this)
```

### LOT Automation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ GOOGLE OAUTH SETUP FLOW                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─ User ────────────────────────────────────────────────────────────────┐   │
│ │ Add "Sign in with Google" to my Next.js app                            │   │
│ └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│ ┌─ AI ──────────────────────────────────────────────────────────────────┐   │
│ │                                                                        │   │
│ │ I'll set up Google OAuth for your Next.js app.                        │   │
│ │                                                                        │   │
│ │ **Which auth library are you using (or want to use)?**                │   │
│ │                                                                        │   │
│ │ ┌────────────────────────────────────────────────────────────────┐    │   │
│ │ │                                                                 │    │   │
│ │ │  ● **NextAuth.js** (Auth.js) - Most popular for Next.js        │    │   │
│ │ │  ○ **Clerk** - Hosted auth with UI components                   │    │   │
│ │ │  ○ **Supabase Auth** - If using Supabase                       │    │   │
│ │ │  ○ **Custom OAuth** - Roll your own                            │    │   │
│ │ │                                                                 │    │   │
│ │ └────────────────────────────────────────────────────────────────┘    │   │
│ │                                                                        │   │
│ │ **Your app's URLs** (I'll configure these in Google):                │   │
│ │                                                                        │   │
│ │ Development: `http://localhost:3000`                                  │   │
│ │ Production:  _______________________________ (optional for now)       │   │
│ │                                                                        │   │
│ └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│ [After OAuth setup with Google]                                             │
│                                                                             │
│ ┌─ AI ──────────────────────────────────────────────────────────────────┐   │
│ │                                                                        │   │
│ │ ✅ Google OAuth credentials created!                                   │   │
│ │                                                                        │   │
│ │ **Authorized redirect URIs configured:**                              │   │
│ │ • http://localhost:3000/api/auth/callback/google                     │   │
│ │ • https://yourdomain.com/api/auth/callback/google (if provided)      │   │
│ │                                                                        │   │
│ │ Here's the complete NextAuth.js setup:                                │   │
│ │                                                                        │   │
│ │ ┌─ .env.local ───────────────────────────────────────────────────┐    │   │
│ │ │ GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com              │    │   │
│ │ │ GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx                              │    │   │
│ │ │ NEXTAUTH_SECRET=xxxxx (auto-generated)                         │    │   │
│ │ │ NEXTAUTH_URL=http://localhost:3000                             │    │   │
│ │ └────────────────────────────────────────────────────────────────┘    │   │
│ │                                                                        │   │
│ │ ┌─ app/api/auth/[...nextauth]/route.ts ──────────────────────────┐    │   │
│ │ │ [NextAuth configuration]                                        │    │   │
│ │ └────────────────────────────────────────────────────────────────┘    │   │
│ │                                                                        │   │
│ │ ┌─ components/AuthButton.tsx ────────────────────────────────────┐    │   │
│ │ │ [Sign in/out button component]                                  │    │   │
│ │ └────────────────────────────────────────────────────────────────┘    │   │
│ │                                                                        │   │
│ └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Generated Code: NextAuth.js + Google

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // Add user ID to session
      if (session.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };

// components/AuthButton.tsx
'use client';

import { signIn, signOut, useSession } from 'next-auth/react';

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <button disabled>Loading...</button>;
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span>Welcome, {session.user?.name}</span>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn('google')}
      className="flex items-center gap-2 px-4 py-2 bg-white border rounded shadow hover:bg-gray-50"
    >
      <GoogleIcon />
      Sign in with Google
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

// app/layout.tsx (wrap with SessionProvider)
import { SessionProvider } from 'next-auth/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
```

---

## Google Maps

### Current Pain Points
```
Time to set up manually: 15-20 minutes

Steps today:
1. Google Cloud Console → Enable Maps JavaScript API
2. Enable additional APIs (Places, Geocoding, Directions)
3. Create API key
4. Restrict API key (HTTP referrers, API restrictions)
5. Set up billing (required for Maps)
6. Install @react-google-maps/api or similar
7. Configure loading strategy
8. Handle API key exposure (client-side is visible)
```

### LOT Setup

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ GOOGLE MAPS SETUP FLOW                                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─ User ────────────────────────────────────────────────────────────────┐   │
│ │ Add Google Maps to my React app                                        │   │
│ └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│ ┌─ AI ──────────────────────────────────────────────────────────────────┐   │
│ │                                                                        │   │
│ │ I'll set up Google Maps for your React app.                           │   │
│ │                                                                        │   │
│ │ **Which Maps features do you need?**                                  │   │
│ │                                                                        │   │
│ │ ┌────────────────────────────────────────────────────────────────┐    │   │
│ │ │ ☑ Maps JavaScript API (required)                               │    │   │
│ │ │ ☐ Places API (search, autocomplete)                            │    │   │
│ │ │ ☐ Geocoding API (address ↔ coordinates)                        │    │   │
│ │ │ ☐ Directions API (routes, navigation)                          │    │   │
│ │ │ ☐ Distance Matrix API (travel times)                           │    │   │
│ │ └────────────────────────────────────────────────────────────────┘    │   │
│ │                                                                        │   │
│ │ **Your domains** (for API key restriction):                           │   │
│ │                                                                        │   │
│ │ ☑ localhost (development)                                             │   │
│ │ ☐ ________________________________ (production domain)                │   │
│ │                                                                        │   │
│ │ ⚠️ **Note:** Google Maps requires billing to be enabled. You get     │   │
│ │    $200/month free credit (~28k map loads).                           │   │
│ │                                                                        │   │
│ │ [🔗 Set up Google Maps]                                               │   │
│ │                                                                        │   │
│ └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# Email Services

## Provider Comparison

| Provider | Auth Method | Best For | Pricing |
|----------|-------------|----------|---------|
| **SendGrid** | API Key | High volume, marketing | Free: 100/day |
| **Resend** | API Key | Developers, modern DX | Free: 3k/month |
| **Postmark** | API Key | Transactional, deliverability | Free: 100/month |
| **Mailgun** | API Key | High volume, EU compliance | Free: 5k/month |
| **AWS SES** | IAM | Cost-effective at scale | $0.10/1k emails |
| **Gmail API** | OAuth | Personal, small volume | Free: 500/day |

## Resend (Recommended for Developers)

```typescript
const resendProvider = {
  id: 'resend',
  name: 'Resend',
  category: 'email',
  
  manual: {
    dashboardUrl: 'https://resend.com/api-keys',
    keyFormat: 're_xxxxxxxxxx',
    keyValidation: /^re_[a-zA-Z0-9_]+$/,
    instructions: [
      'Click "Create API Key"',
      'Name: "MyProject-Development"',
      'Permission: "Sending access" (default)',
      'Click "Create"',
      'Copy the key immediately (shown once)',
    ],
    additionalConfig: [
      {
        key: 'fromEmail',
        label: 'From Email',
        validation: /^.+@.+\..+$/,
        helpText: 'Must be from a verified domain or onboarding@resend.dev for testing',
      }
    ],
  },
  
  templates: {
    nextjs: {
      files: [
        {
          path: '.env.local',
          content: `# Resend Configuration
RESEND_API_KEY={{apiKey}}
RESEND_FROM_EMAIL={{fromEmail}}`,
        },
        {
          path: 'lib/email.ts',
          content: `import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  react?: React.ReactElement;
}

export async function sendEmail({ to, subject, html, text, react }: SendEmailOptions) {
  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject,
    html,
    text,
    react,
  });

  if (error) {
    throw new Error(\`Failed to send email: \${error.message}\`);
  }

  return data;
}`,
        },
      ],
      dependencies: ['resend'],
    },
  },
};
```

## Postmark

```typescript
const postmarkProvider = {
  id: 'postmark',
  name: 'Postmark',
  category: 'email',
  
  manual: {
    dashboardUrl: 'https://account.postmarkapp.com/servers',
    keyFormat: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    keyValidation: /^[a-f0-9-]{36}$/,
    instructions: [
      'Select your Server (or create one)',
      'Go to "API Tokens" tab',
      'Copy the "Server API Token"',
    ],
  },
  
  templates: {
    nextjs: {
      files: [
        {
          path: '.env.local',
          content: `POSTMARK_API_KEY={{apiKey}}
POSTMARK_FROM_EMAIL={{fromEmail}}`,
        },
        {
          path: 'lib/email.ts',
          content: `import { ServerClient } from 'postmark';

const client = new ServerClient(process.env.POSTMARK_API_KEY!);

export async function sendEmail({
  to,
  subject,
  htmlBody,
  textBody,
}: {
  to: string;
  subject: string;
  htmlBody?: string;
  textBody?: string;
}) {
  return client.sendEmail({
    From: process.env.POSTMARK_FROM_EMAIL!,
    To: to,
    Subject: subject,
    HtmlBody: htmlBody,
    TextBody: textBody,
  });
}`,
        },
      ],
      dependencies: ['postmark'],
    },
  },
};
```

---

# Authentication Providers

## Auth0

### Current Pain Points
```
Time to set up: 25-35 minutes

Steps:
1. Create Auth0 account/tenant
2. Create Application
3. Configure allowed callbacks, origins, logout URLs
4. Note domain, client ID, client secret
5. Install @auth0/nextjs-auth0
6. Create API route handlers
7. Configure middleware
8. Set up session handling
```

### LOT Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ AUTH0 SETUP FLOW                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─ User ────────────────────────────────────────────────────────────────┐   │
│ │ Add Auth0 authentication to my Next.js app                             │   │
│ └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│ ┌─ AI ──────────────────────────────────────────────────────────────────┐   │
│ │                                                                        │   │
│ │ I'll set up Auth0 for your Next.js application.                       │   │
│ │                                                                        │   │
│ │ **Do you have an Auth0 account?**                                     │   │
│ │                                                                        │   │
│ │ [🔗 Sign in to Auth0] - I'll configure your existing tenant           │   │
│ │ [📝 I need to create an account first]                                │   │
│ │                                                                        │   │
│ └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│ [After Auth0 OAuth - using Auth0 Management API]                           │
│                                                                             │
│ ┌─ AI ──────────────────────────────────────────────────────────────────┐   │
│ │                                                                        │   │
│ │ ✅ Connected to Auth0!                                                 │   │
│ │                                                                        │   │
│ │ **Tenant:** dev-abc123.us.auth0.com                                   │   │
│ │                                                                        │   │
│ │ I'll create a new application for this project:                       │   │
│ │                                                                        │   │
│ │ **Application Name:** My Next.js App                                  │   │
│ │ **Type:** Regular Web Application                                     │   │
│ │                                                                        │   │
│ │ **URLs to configure:**                                                │   │
│ │ • Callback: http://localhost:3000/api/auth/callback                  │   │
│ │ • Logout: http://localhost:3000                                       │   │
│ │ • Web Origins: http://localhost:3000                                  │   │
│ │                                                                        │   │
│ │ Add production URL? ________________________________                   │   │
│ │                                                                        │   │
│ │ [Create Application & Generate Config]                                │   │
│ │                                                                        │   │
│ └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Clerk (Simpler Alternative)

```typescript
const clerkProvider = {
  id: 'clerk',
  name: 'Clerk',
  category: 'auth',
  
  manual: {
    dashboardUrl: 'https://dashboard.clerk.com',
    instructions: [
      'Create or select your application',
      'Go to "API Keys" in the sidebar',
      'Copy "Publishable key" (starts with pk_)',
      'Copy "Secret key" (starts with sk_)',
    ],
    fields: [
      {
        key: 'publishableKey',
        label: 'Publishable Key',
        format: /^pk_(test|live)_[a-zA-Z0-9]+$/,
        public: true,
      },
      {
        key: 'secretKey',
        label: 'Secret Key',
        format: /^sk_(test|live)_[a-zA-Z0-9]+$/,
        public: false,
      },
    ],
  },
  
  templates: {
    nextjs: {
      files: [
        {
          path: '.env.local',
          content: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY={{publishableKey}}
CLERK_SECRET_KEY={{secretKey}}`,
        },
        {
          path: 'middleware.ts',
          content: `import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};`,
        },
      ],
      dependencies: ['@clerk/nextjs'],
    },
  },
};
```

---

# Payment Processors

## Stripe (Detailed)

Already covered in previous documents, but adding:

```typescript
const stripeProvider = {
  id: 'stripe',
  name: 'Stripe',
  category: 'payments',
  
  oauth: {
    // Stripe Connect OAuth for fetching keys
    authUrl: 'https://connect.stripe.com/oauth/authorize',
    tokenUrl: 'https://connect.stripe.com/oauth/token',
    scopes: ['read_only'],
  },
  
  manual: {
    dashboardUrl: 'https://dashboard.stripe.com/apikeys',
    instructions: [
      'Toggle "Test mode" for development keys',
      'Copy "Publishable key" (starts with pk_)',
      'Click "Reveal" and copy "Secret key" (starts with sk_)',
      'For webhooks: Developers → Webhooks → Add endpoint',
    ],
    fields: [
      { key: 'publishableKey', format: /^pk_(test|live)_[a-zA-Z0-9]+$/, public: true },
      { key: 'secretKey', format: /^sk_(test|live)_[a-zA-Z0-9]+$/, public: false },
      { key: 'webhookSecret', format: /^whsec_[a-zA-Z0-9]+$/, public: false, optional: true },
    ],
  },
  
  configVariants: {
    testOnly: {
      description: 'Development with test keys only',
      env: 'development',
    },
    liveOnly: {
      description: 'Production with live keys only',
      env: 'production',
    },
    both: {
      description: 'Both environments with switching logic',
      env: 'both',
    },
  },
};
```

## LemonSqueezy (Indie Dev Favorite)

```typescript
const lemonSqueezyProvider = {
  id: 'lemonsqueezy',
  name: 'Lemon Squeezy',
  category: 'payments',
  
  manual: {
    dashboardUrl: 'https://app.lemonsqueezy.com/settings/api',
    instructions: [
      'Go to Settings → API',
      'Click "Create API key"',
      'Name it and copy the key',
      'For webhooks: Settings → Webhooks → Add endpoint',
    ],
    fields: [
      { key: 'apiKey', format: /^[a-zA-Z0-9_]+$/, public: false },
      { key: 'webhookSecret', format: /^.+$/, public: false, optional: true },
      { key: 'storeId', label: 'Store ID', format: /^\d+$/, public: true },
    ],
  },
  
  templates: {
    nextjs: {
      files: [
        {
          path: '.env.local',
          content: `LEMONSQUEEZY_API_KEY={{apiKey}}
LEMONSQUEEZY_STORE_ID={{storeId}}
LEMONSQUEEZY_WEBHOOK_SECRET={{webhookSecret}}`,
        },
        {
          path: 'lib/lemonsqueezy.ts',
          content: `import { lemonSqueezySetup, createCheckout, getSubscription } from '@lemonsqueezy/lemonsqueezy.js';

lemonSqueezySetup({
  apiKey: process.env.LEMONSQUEEZY_API_KEY!,
});

export async function createCheckoutSession(variantId: number, email: string) {
  const checkout = await createCheckout(process.env.LEMONSQUEEZY_STORE_ID!, variantId, {
    checkoutData: {
      email,
    },
  });
  return checkout.data?.data.attributes.url;
}

export { getSubscription };`,
        },
      ],
      dependencies: ['@lemonsqueezy/lemonsqueezy.js'],
    },
  },
};
```

---

# Databases & Backend

## Supabase

```typescript
const supabaseProvider = {
  id: 'supabase',
  name: 'Supabase',
  category: 'database',
  
  oauth: {
    // Supabase has OAuth for dashboard access
    available: true,
    scopes: ['projects:read'],
  },
  
  manual: {
    dashboardUrl: 'https://supabase.com/dashboard/project/_/settings/api',
    instructions: [
      'Select your project (or create one)',
      'Go to Settings → API',
      'Copy "Project URL"',
      'Copy "anon public" key (safe for client)',
      'Copy "service_role" key (server-only, keep secret!)',
    ],
    fields: [
      { key: 'url', label: 'Project URL', format: /^https:\/\/[a-z]+\.supabase\.co$/, public: true },
      { key: 'anonKey', label: 'Anon Key', format: /^eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/, public: true },
      { key: 'serviceRoleKey', label: 'Service Role Key', format: /^eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/, public: false },
    ],
  },
  
  templates: {
    nextjs: {
      files: [
        {
          path: '.env.local',
          content: `NEXT_PUBLIC_SUPABASE_URL={{url}}
NEXT_PUBLIC_SUPABASE_ANON_KEY={{anonKey}}
SUPABASE_SERVICE_ROLE_KEY={{serviceRoleKey}}`,
        },
        {
          path: 'lib/supabase/client.ts',
          content: `import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}`,
        },
        {
          path: 'lib/supabase/server.ts',
          content: `import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}`,
        },
        {
          path: 'lib/supabase/admin.ts',
          content: `import { createClient } from '@supabase/supabase-js';

// WARNING: Only use on server-side!
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);`,
        },
      ],
      dependencies: ['@supabase/supabase-js', '@supabase/ssr'],
    },
  },
};
```

## PlanetScale

```typescript
const planetscaleProvider = {
  id: 'planetscale',
  name: 'PlanetScale',
  category: 'database',
  
  manual: {
    dashboardUrl: 'https://app.planetscale.com',
    instructions: [
      'Select your database',
      'Click "Connect"',
      'Select "Prisma" (or your ORM)',
      'Copy the connection string',
      'Note: Contains username and password',
    ],
    fields: [
      {
        key: 'databaseUrl',
        label: 'Database URL',
        format: /^mysql:\/\/.+:.+@.+\.psdb\.cloud\/.+\?ssl=/,
        public: false,
        helpText: 'Full connection string from PlanetScale Connect dialog',
      },
    ],
  },
};
```

## Neon (Serverless Postgres)

```typescript
const neonProvider = {
  id: 'neon',
  name: 'Neon',
  category: 'database',
  
  manual: {
    dashboardUrl: 'https://console.neon.tech',
    instructions: [
      'Select your project',
      'Go to "Connection Details"',
      'Copy the connection string',
      'Choose "Pooled" for serverless environments',
    ],
    fields: [
      {
        key: 'databaseUrl',
        label: 'Database URL',
        format: /^postgres(ql)?:\/\/.+@.+\.neon\.tech\/.+/,
        public: false,
      },
    ],
  },
  
  templates: {
    nextjs: {
      files: [
        {
          path: '.env.local',
          content: `DATABASE_URL={{databaseUrl}}`,
        },
        {
          path: 'lib/db.ts',
          content: `import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);`,
        },
      ],
      dependencies: ['@neondatabase/serverless', 'drizzle-orm'],
    },
  },
};
```

---

# Monitoring & Analytics

## Sentry

```typescript
const sentryProvider = {
  id: 'sentry',
  name: 'Sentry',
  category: 'monitoring',
  
  manual: {
    dashboardUrl: 'https://sentry.io/settings/projects/',
    instructions: [
      'Select your project (or create one)',
      'Go to Settings → Client Keys (DSN)',
      'Copy the DSN',
    ],
    fields: [
      {
        key: 'dsn',
        label: 'DSN',
        format: /^https:\/\/[a-f0-9]+@[a-z0-9]+\.ingest\.sentry\.io\/\d+$/,
        public: true,  // DSN is safe to expose
        helpText: 'Found in Project Settings → Client Keys',
      },
    ],
  },
  
  templates: {
    nextjs: {
      files: [
        {
          path: '.env.local',
          content: `NEXT_PUBLIC_SENTRY_DSN={{dsn}}`,
        },
        {
          path: 'sentry.client.config.ts',
          content: `import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});`,
        },
        {
          path: 'sentry.server.config.ts',
          content: `import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
});`,
        },
      ],
      dependencies: ['@sentry/nextjs'],
      setupCommand: 'npx @sentry/wizard@latest -i nextjs',
    },
  },
};
```

## Mixpanel

```typescript
const mixpanelProvider = {
  id: 'mixpanel',
  name: 'Mixpanel',
  category: 'analytics',
  
  manual: {
    dashboardUrl: 'https://mixpanel.com/settings/project',
    instructions: [
      'Go to Settings → Project Settings',
      'Copy your "Project Token"',
    ],
    fields: [
      {
        key: 'projectToken',
        label: 'Project Token',
        format: /^[a-f0-9]{32}$/,
        public: true,
      },
    ],
  },
  
  templates: {
    nextjs: {
      files: [
        {
          path: '.env.local',
          content: `NEXT_PUBLIC_MIXPANEL_TOKEN={{projectToken}}`,
        },
        {
          path: 'lib/analytics.ts',
          content: `import mixpanel from 'mixpanel-browser';

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

export const initMixpanel = () => {
  if (MIXPANEL_TOKEN && typeof window !== 'undefined') {
    mixpanel.init(MIXPANEL_TOKEN, {
      debug: process.env.NODE_ENV === 'development',
      track_pageview: true,
      persistence: 'localStorage',
    });
  }
};

export const trackEvent = (name: string, properties?: Record<string, any>) => {
  if (MIXPANEL_TOKEN) {
    mixpanel.track(name, properties);
  }
};

export const identifyUser = (userId: string, traits?: Record<string, any>) => {
  if (MIXPANEL_TOKEN) {
    mixpanel.identify(userId);
    if (traits) {
      mixpanel.people.set(traits);
    }
  }
};`,
        },
      ],
      dependencies: ['mixpanel-browser'],
    },
  },
};
```

## PostHog (Open Source Alternative)

```typescript
const posthogProvider = {
  id: 'posthog',
  name: 'PostHog',
  category: 'analytics',
  
  manual: {
    dashboardUrl: 'https://app.posthog.com/project/settings',
    instructions: [
      'Go to Project Settings',
      'Copy your "Project API Key"',
      'Note your instance URL (app.posthog.com or self-hosted)',
    ],
    fields: [
      { key: 'apiKey', label: 'Project API Key', format: /^phc_[a-zA-Z0-9]+$/, public: true },
      { key: 'host', label: 'Host', format: /^https:\/\/.+$/, public: true, default: 'https://app.posthog.com' },
    ],
  },
};
```

---

# AI/ML APIs

## OpenAI

```typescript
const openaiProvider = {
  id: 'openai',
  name: 'OpenAI',
  category: 'ai',
  
  manual: {
    dashboardUrl: 'https://platform.openai.com/api-keys',
    instructions: [
      'Click "Create new secret key"',
      'Name it (e.g., "MyProject")',
      'Copy immediately (shown once)',
      'Note: Set usage limits in Settings → Limits',
    ],
    fields: [
      {
        key: 'apiKey',
        label: 'API Key',
        format: /^sk-[a-zA-Z0-9-_]+$/,
        public: false,
      },
    ],
  },
  
  templates: {
    nextjs: {
      files: [
        {
          path: '.env.local',
          content: `OPENAI_API_KEY={{apiKey}}`,
        },
        {
          path: 'lib/openai.ts',
          content: `import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper for chat completions
export async function chat(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  options?: Partial<OpenAI.Chat.ChatCompletionCreateParams>
) {
  return openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages,
    ...options,
  });
}`,
        },
      ],
      dependencies: ['openai'],
    },
  },
};
```

## Anthropic

```typescript
const anthropicProvider = {
  id: 'anthropic',
  name: 'Anthropic (Claude)',
  category: 'ai',
  
  manual: {
    dashboardUrl: 'https://console.anthropic.com/settings/keys',
    instructions: [
      'Click "Create Key"',
      'Name it descriptively',
      'Copy immediately',
    ],
    fields: [
      {
        key: 'apiKey',
        label: 'API Key',
        format: /^sk-ant-[a-zA-Z0-9-]+$/,
        public: false,
      },
    ],
  },
  
  templates: {
    nextjs: {
      files: [
        {
          path: '.env.local',
          content: `ANTHROPIC_API_KEY={{apiKey}}`,
        },
        {
          path: 'lib/anthropic.ts',
          content: `import Anthropic from '@anthropic-ai/sdk';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function chat(
  userMessage: string,
  systemPrompt?: string
) {
  return anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });
}`,
        },
      ],
      dependencies: ['@anthropic-ai/sdk'],
    },
  },
};
```

## Replicate

```typescript
const replicateProvider = {
  id: 'replicate',
  name: 'Replicate',
  category: 'ai',
  
  manual: {
    dashboardUrl: 'https://replicate.com/account/api-tokens',
    instructions: [
      'Copy your API token',
      'Or create a new one with "Create token"',
    ],
    fields: [
      {
        key: 'apiToken',
        label: 'API Token',
        format: /^r8_[a-zA-Z0-9]+$/,
        public: false,
      },
    ],
  },
};
```

---

# Communication

## Twilio (SMS)

```typescript
const twilioProvider = {
  id: 'twilio',
  name: 'Twilio',
  category: 'communication',
  
  manual: {
    dashboardUrl: 'https://console.twilio.com',
    instructions: [
      'From Console dashboard, copy "Account SID"',
      'Copy "Auth Token" (click to reveal)',
      'Get a phone number: Phone Numbers → Manage → Buy a number',
      'Copy your Twilio phone number',
    ],
    fields: [
      { key: 'accountSid', label: 'Account SID', format: /^AC[a-f0-9]{32}$/, public: false },
      { key: 'authToken', label: 'Auth Token', format: /^[a-f0-9]{32}$/, public: false },
      { key: 'phoneNumber', label: 'Twilio Phone Number', format: /^\+\d{10,15}$/, public: false },
    ],
  },
  
  templates: {
    nextjs: {
      files: [
        {
          path: '.env.local',
          content: `TWILIO_ACCOUNT_SID={{accountSid}}
TWILIO_AUTH_TOKEN={{authToken}}
TWILIO_PHONE_NUMBER={{phoneNumber}}`,
        },
        {
          path: 'lib/sms.ts',
          content: `import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendSMS(to: string, body: string) {
  return client.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
  });
}`,
        },
      ],
      dependencies: ['twilio'],
    },
  },
};
```

## Slack (Webhooks/Bot)

```typescript
const slackProvider = {
  id: 'slack',
  name: 'Slack',
  category: 'communication',
  
  variants: {
    webhook: {
      name: 'Incoming Webhook',
      description: 'Send messages to a channel',
      manual: {
        dashboardUrl: 'https://api.slack.com/apps',
        instructions: [
          'Create a new app (or select existing)',
          'Go to "Incoming Webhooks"',
          'Toggle "Activate Incoming Webhooks" ON',
          'Click "Add New Webhook to Workspace"',
          'Select a channel and authorize',
          'Copy the Webhook URL',
        ],
        fields: [
          {
            key: 'webhookUrl',
            label: 'Webhook URL',
            format: /^https:\/\/hooks\.slack\.com\/services\/T[A-Z0-9]+\/B[A-Z0-9]+\/[a-zA-Z0-9]+$/,
            public: false,
          },
        ],
      },
    },
    bot: {
      name: 'Bot Token',
      description: 'Full Slack API access',
      // OAuth flow for bot token
    },
  },
};
```

---

# CMS & Content

## Contentful

```typescript
const contentfulProvider = {
  id: 'contentful',
  name: 'Contentful',
  category: 'cms',
  
  manual: {
    dashboardUrl: 'https://app.contentful.com',
    instructions: [
      'Go to Settings → API keys',
      'Create or select an API key',
      'Copy "Space ID"',
      'Copy "Content Delivery API - access token"',
      'For preview: Copy "Content Preview API - access token"',
    ],
    fields: [
      { key: 'spaceId', label: 'Space ID', format: /^[a-z0-9]+$/, public: true },
      { key: 'accessToken', label: 'Delivery Access Token', format: /^[a-zA-Z0-9_-]+$/, public: true },
      { key: 'previewToken', label: 'Preview Access Token', format: /^[a-zA-Z0-9_-]+$/, public: false, optional: true },
    ],
  },
};
```

## Sanity

```typescript
const sanityProvider = {
  id: 'sanity',
  name: 'Sanity',
  category: 'cms',
  
  manual: {
    dashboardUrl: 'https://sanity.io/manage',
    instructions: [
      'Select your project',
      'Go to API → Tokens',
      'Create a new token (Viewer for read-only)',
      'Copy Project ID from project settings',
    ],
    fields: [
      { key: 'projectId', label: 'Project ID', format: /^[a-z0-9]+$/, public: true },
      { key: 'dataset', label: 'Dataset', format: /^[a-z0-9-]+$/, public: true, default: 'production' },
      { key: 'token', label: 'API Token', format: /^sk[a-zA-Z0-9]+$/, public: false, optional: true },
    ],
  },
};
```

---

# Search

## Algolia

```typescript
const algoliaProvider = {
  id: 'algolia',
  name: 'Algolia',
  category: 'search',
  
  manual: {
    dashboardUrl: 'https://dashboard.algolia.com/account/api-keys',
    instructions: [
      'Copy "Application ID"',
      'Copy "Search-Only API Key" (safe for frontend)',
      'Copy "Admin API Key" (server-only, for indexing)',
    ],
    fields: [
      { key: 'appId', label: 'Application ID', format: /^[A-Z0-9]+$/, public: true },
      { key: 'searchKey', label: 'Search-Only API Key', format: /^[a-f0-9]+$/, public: true },
      { key: 'adminKey', label: 'Admin API Key', format: /^[a-f0-9]+$/, public: false },
    ],
  },
};
```

---

# Provider Priority Matrix

## By Setup Time Saved

| Provider | Current Time | With LOT | Time Saved | Priority |
|----------|-------------|----------|------------|----------|
| **Google OAuth** | 30 min | 2 min | 28 min | 🔴 P0 |
| **Gmail API** | 45 min | 3 min | 42 min | 🔴 P0 |
| **Auth0** | 35 min | 3 min | 32 min | 🔴 P0 |
| **Stripe** | 30 min | 2 min | 28 min | 🔴 P0 |
| **Supabase** | 20 min | 2 min | 18 min | 🔴 P0 |
| **Google Analytics** | 20 min | 1 min | 19 min | 🟡 P1 |
| **Firebase** | 25 min | 3 min | 22 min | 🟡 P1 |
| **Sentry** | 15 min | 1 min | 14 min | 🟡 P1 |
| **SendGrid** | 15 min | 1 min | 14 min | 🟡 P1 |
| **OpenAI** | 10 min | 1 min | 9 min | 🟢 P2 |
| **Clerk** | 10 min | 1 min | 9 min | 🟢 P2 |
| **Resend** | 8 min | 1 min | 7 min | 🟢 P2 |

## By Developer Demand

Based on npm downloads, GitHub stars, and survey data:

| Tier | Providers |
|------|-----------|
| **Must Have** | Stripe, Google OAuth, NextAuth/Auth.js, Supabase |
| **High Demand** | Google Analytics, Sentry, OpenAI, Vercel |
| **Growing Fast** | Clerk, Resend, PlanetScale, Neon, PostHog |
| **Niche but Loyal** | Auth0, Sanity, Contentful, Algolia |

## Recommended Implementation Order

### Phase 1: Core (Weeks 1-4)
1. Google Analytics (basic)
2. Stripe
3. Supabase
4. Google OAuth + NextAuth.js

### Phase 2: Auth & Email (Weeks 5-8)
5. Clerk
6. Auth0
7. SendGrid
8. Resend
9. Gmail API

### Phase 3: Monitoring & AI (Weeks 9-12)
10. Sentry
11. OpenAI
12. Anthropic
13. PostHog

### Phase 4: Expansion (Weeks 13-16)
14. Google Maps
15. Twilio
16. Contentful/Sanity
17. Algolia
18. Firebase

---

## Template Structure

Every provider follows this structure:

```typescript
interface ProviderConfig {
  id: string;
  name: string;
  category: 'analytics' | 'email' | 'auth' | 'payments' | 'database' | 'monitoring' | 'ai' | 'communication' | 'cms' | 'search' | 'cloud';
  
  // OAuth configuration (if supported)
  oauth?: {
    authUrl: string;
    tokenUrl: string;
    scopes: string[];
    configExtraction: (tokens: Tokens) => Promise<ExtractedConfig>;
  };
  
  // Manual setup configuration
  manual: {
    dashboardUrl: string;
    instructions: string[];
    fields: FieldConfig[];
  };
  
  // Framework-specific templates
  templates: {
    nextjs?: TemplateConfig;
    remix?: TemplateConfig;
    express?: TemplateConfig;
    astro?: TemplateConfig;
  };
  
  // Variants (e.g., basic vs advanced)
  variants?: Record<string, VariantConfig>;
}
```

This modular structure allows easy addition of new providers!
