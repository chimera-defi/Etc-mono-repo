# Birthday Bot - Technical Specification (MVP)

## Overview

This document outlines the technical architecture, stack choices, and implementation details for Birthday Bot MVP.

**Timeline**: 8-10 weeks
**Team Size**: 2-3 engineers (1 backend, 1 iOS, 1 Android) or 1-2 full-stack + contractors
**Target Release**: Q2 2026

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Birthday Bot System                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  iOS Native  │  │  Android     │  │  Web         │      │
│  │  (SwiftUI)   │  │  (Compose)   │  │  Dashboard   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                    ┌───────▼────────┐                        │
│                    │  REST API      │                        │
│                    │  (Node/Express)│                        │
│                    └───────┬────────┘                        │
│                            │                                 │
│         ┌──────────────────┼──────────────────┐             │
│         │                  │                  │             │
│    ┌────▼────┐        ┌────▼────┐       ┌────▼────┐        │
│    │Database │        │Auth     │       │Notify   │        │
│    │(Postgres│        │(JWT)    │       │Service  │        │
│    │)        │        │         │       │(FCM,APNs│        │
│    └────┬────┘        └────┬────┘       └────┬────┘        │
│         │                  │                  │             │
│    ┌────▼──────────────────▼──────────────────▼────┐        │
│    │         External Services                     │        │
│    │ ┌─────────────┐  ┌──────────────┐            │        │
│    │ │Google APIs  │  │ Facebook API │            │        │
│    │ │(Contacts,   │  │(Optional)    │            │        │
│    │ │Calendar)    │  │              │            │        │
│    │ └─────────────┘  └──────────────┘            │        │
│    └─────────────────────────────────────────────┘        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Backend

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Runtime** | Node.js 20 LTS | Fast, good ecosystem, easy async |
| **Framework** | Express.js | Lightweight, flexible, widely used |
| **Language** | TypeScript | Type safety, better DX |
| **Database** | PostgreSQL 15+ | Relational, JSON support, reliable |
| **ORM** | Prisma | Type-safe, great DX, migrations |
| **Auth** | JWT + Refresh tokens | Stateless, scalable |
| **Notifications** | Firebase Cloud Messaging (FCM), APNs | Standard for mobile, free tier available |
| **Task Queue** | Bull (Redis) | Background jobs, notification scheduling |
| **Caching** | Redis | Session cache, rate limiting |
| **Deployment** | Docker + AWS ECS / Render | Containerized, easy scaling |

### Mobile

**iOS**:
- **Language**: Swift 5.10+
- **UI Framework**: SwiftUI
- **Native Frameworks**:
  - `Contacts` (contact import)
  - `EventKit` (calendar access)
  - `UserNotifications` (local notifications)
  - `AuthenticationServices` (Sign in with Apple)
- **HTTP Client**: URLSession + async/await
- **State Management**: @StateObject, @EnvironmentObject
- **Local Storage**: Core Data or UserDefaults
- **Analytics**: Firebase Analytics (optional)

**Android**:
- **Language**: Kotlin
- **UI Framework**: Jetpack Compose
- **Native Frameworks**:
  - `ContactsProvider` (contact import)
  - `CalendarProvider` (calendar access)
  - `NotificationManager` (local notifications)
- **HTTP Client**: OkHttp + Retrofit + Kotlinx Coroutines
- **State Management**: ViewModel, LiveData / StateFlow
- **Local Storage**: Room (SQLite)
- **Analytics**: Firebase Analytics (optional)

### Web Dashboard

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | Next.js 14+ | SSR, SSG, great DX |
| **Language** | TypeScript | Type safety |
| **Styling** | Tailwind CSS | Utility-first, fast development |
| **Components** | Shadcn/ui | Pre-built, accessible components |
| **State** | React Query + Zustand | Data fetching + client state |
| **Auth** | NextAuth.js | OAuth, JWT, session management |

---

## Database Schema

### Core Tables

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url TEXT,
  timezone VARCHAR(50) DEFAULT 'UTC',
  notification_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Birthdays
CREATE TABLE birthdays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  date_of_birth DATE NOT NULL,
  age_known BOOLEAN DEFAULT true,
  photo_url TEXT,
  notes TEXT,
  is_favorite BOOLEAN DEFAULT false,
  source_type VARCHAR(50), -- 'phone', 'google', 'facebook', 'manual'
  source_id VARCHAR(255), -- Reference to source (Google contact ID, etc)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP, -- Soft delete
  UNIQUE(user_id, source_type, source_id)
);

-- Birthday Groups
CREATE TABLE birthday_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color_hex VARCHAR(7),
  notification_days INT[] DEFAULT ARRAY[7, 3, 1],
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Birthday Group Memberships
CREATE TABLE birthday_group_members (
  group_id UUID NOT NULL REFERENCES birthday_groups(id) ON DELETE CASCADE,
  birthday_id UUID NOT NULL REFERENCES birthdays(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (group_id, birthday_id)
);

-- Notifications Sent (audit log)
CREATE TABLE notifications_sent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  birthday_id UUID NOT NULL REFERENCES birthdays(id),
  notification_type VARCHAR(50), -- 'push', 'email', 'sms'
  scheduled_at TIMESTAMP NOT NULL,
  sent_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Social Media Integrations
CREATE TABLE social_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50), -- 'google', 'facebook', 'apple'
  provider_user_id VARCHAR(255),
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  last_synced_at TIMESTAMP,
  sync_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Duplicate Candidates (for conflict resolution)
CREATE TABLE duplicate_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  birthday_id_1 UUID NOT NULL REFERENCES birthdays(id) ON DELETE CASCADE,
  birthday_id_2 UUID NOT NULL REFERENCES birthdays(id) ON DELETE CASCADE,
  similarity_score FLOAT, -- 0-1
  status VARCHAR(20) DEFAULT 'unresolved', -- 'unresolved', 'merged', 'rejected'
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);
```

### Indexes

```sql
CREATE INDEX idx_birthdays_user_id ON birthdays(user_id);
CREATE INDEX idx_birthdays_date ON birthdays(date_of_birth);
CREATE INDEX idx_birthdays_is_favorite ON birthdays(user_id, is_favorite);
CREATE INDEX idx_groups_user_id ON birthday_groups(user_id);
CREATE INDEX idx_notifications_user_id ON notifications_sent(user_id, scheduled_at);
CREATE INDEX idx_integrations_user_id ON social_integrations(user_id);
```

---

## API Endpoints (REST)

### Authentication
```
POST   /auth/register          - Register new user
POST   /auth/login             - Login with email/password
POST   /auth/refresh           - Refresh access token
POST   /auth/logout            - Logout
GET    /auth/google            - Initiate Google OAuth
GET    /auth/google/callback   - Google OAuth callback
GET    /auth/apple             - Initiate Apple Sign-In
```

### Birthdays
```
GET    /api/birthdays                    - List all birthdays (with pagination, filters)
POST   /api/birthdays                    - Create new birthday
GET    /api/birthdays/:id                - Get birthday details
PUT    /api/birthdays/:id                - Update birthday
DELETE /api/birthdays/:id                - Delete birthday
GET    /api/birthdays/upcoming           - Upcoming birthdays (next 30 days)
GET    /api/birthdays/today              - Today's birthdays
GET    /api/birthdays/search?q=<name>    - Search birthdays
```

### Groups
```
GET    /api/groups                       - List all groups
POST   /api/groups                       - Create new group
PUT    /api/groups/:id                   - Update group
DELETE /api/groups/:id                   - Delete group
GET    /api/groups/:id/members           - Get group members
POST   /api/groups/:id/members           - Add member to group
DELETE /api/groups/:id/members/:birthdayId - Remove member from group
```

### Integrations
```
GET    /api/integrations                 - List connected integrations
POST   /api/integrations/google/import   - Import from Google Contacts
POST   /api/integrations/google/sync     - Sync Google Calendar
POST   /api/integrations/facebook        - Connect Facebook (if approved)
DELETE /api/integrations/:provider       - Disconnect integration
```

### Notifications
```
GET    /api/notifications                - Notification history
PUT    /api/notifications/settings       - Update notification settings
POST   /api/notifications/test           - Send test notification
```

### User Settings
```
GET    /api/user                         - Get user profile
PUT    /api/user                         - Update user profile
GET    /api/user/settings                - Get notification settings
PUT    /api/user/settings                - Update notification settings
```

---

## Frontend Views (Mobile + Web)

### iOS App

1. **Onboarding Flow**
   - Welcome screen
   - Permission requests (Contacts, Calendar, Notifications)
   - Choose sync sources

2. **Home Tab**
   - Today's birthdays (prominent)
   - Upcoming week countdown
   - Quick actions (call, text, browse)

3. **Search/Browse Tab**
   - Search by name
   - Filter by group/favorite
   - List view with birthday dates

4. **Add Birthday Modal**
   - Name, date, optional photo
   - Assign to group(s)
   - Mark as favorite

5. **Birthday Detail View**
   - Full info, notes
   - Action buttons (add to calendar, send message)
   - Edit/delete options

6. **Settings Tab**
   - Notification preferences (days, time, type)
   - Integrations status
   - Profile settings
   - Privacy/data management

### Android App
(Same structure as iOS, native Compose UI)

### Web Dashboard

1. **Login/Signup**
2. **Dashboard**
   - Calendar view of upcoming birthdays
   - Stats (total contacts, upcoming this month)
   - Quick add birthday form

3. **Birthdays List**
   - Table view with sorting/filtering
   - Bulk actions
   - Import/export options

4. **Groups Management**
   - CRUD for groups
   - Manage members per group

5. **Settings**
   - Notification preferences
   - Connected integrations
   - Data export/import

---

## Notification System

### Architecture

```
Scheduled Task (Bull/Redis)
        ↓
Check birthdays happening in:
  - 7 days
  - 3 days
  - 1 day
        ↓
Send to Notification Service
        ↓
┌─────────────────────────┐
│ Platform Notification   │
├─────────────────────────┤
│ iOS: APNs               │
│ Android: FCM            │
│ Web: WebPush            │
│ Email: SendGrid/AWS SES │
└─────────────────────────┘
        ↓
Log in database
        ↓
Update status (sent/failed)
```

### Notification Content

**Format**:
```
Title: "[Name]'s birthday is in [X] days"
Body: "[Name] turns [age] on [date]"
Image: [Contact photo if available]
CTA: "Set reminder" → Opens app
```

**Timing**:
- User selects: 7 days before, 3 days before, 1 day before
- Time: User's timezone, default 9 AM
- Customizable per group

---

## Security Considerations

### Authentication & Authorization
- JWT tokens with 1-hour expiry
- Refresh tokens with 7-day expiry, stored in secure HTTP-only cookies (web) or secure enclave (mobile)
- All endpoints require auth (except public endpoints: /auth/register, /auth/login)

### Data Protection
- HTTPS only, TLS 1.3+
- Database encryption at rest
- Sensitive fields encrypted: phone numbers, social auth tokens
- GDPR-compliant data deletion

### Rate Limiting
- 100 requests/minute per user for general endpoints
- 5 requests/minute for auth endpoints
- 1 request/second for notification endpoints

### Input Validation
- All inputs validated server-side
- SQL injection prevention via parameterized queries (ORM)
- XSS prevention via output encoding
- CSRF tokens for state-changing operations (web)

---

## Development Timeline

### Week 1-2: Setup & Infrastructure
- [ ] Git repo, project management setup
- [ ] Database schema design & migration setup
- [ ] Backend project setup (Express + TypeScript)
- [ ] Authentication system (JWT, refresh tokens)

### Week 3-4: Core API Development
- [ ] CRUD endpoints for birthdays, groups
- [ ] Birthday import from contacts (mock data)
- [ ] Search and filter endpoints
- [ ] Notification scheduling system

### Week 5: Mobile Setup
- [ ] iOS: Project setup, auth flow, basic UI
- [ ] Android: Project setup, auth flow, basic UI
- [ ] Contact permission handling (both platforms)

### Week 6: Mobile Features Part 1
- [ ] Contact import on both platforms
- [ ] Birthday list view
- [ ] Add birthday form
- [ ] Local notification setup

### Week 7: Mobile Features Part 2
- [ ] API integration
- [ ] Notification testing
- [ ] Settings screen
- [ ] Basic styling

### Week 8: Polish & Testing
- [ ] Bug fixes, UI polish
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Accessibility review (a11y)

### Week 9-10: Pre-Launch
- [ ] App Store / Play Store submission
- [ ] Web dashboard (basic version)
- [ ] Documentation
- [ ] Launch prep

---

## Deployment

### Backend
- **Environment**: AWS ECS (Fargate) or Render
- **Database**: Amazon RDS PostgreSQL
- **Cache**: Amazon ElastiCache Redis
- **Storage**: Amazon S3 (for photos)
- **Task Queue**: AWS SQS or self-hosted Redis with Bull
- **Monitoring**: CloudWatch or New Relic
- **CI/CD**: GitHub Actions

### Mobile
- **iOS**: TestFlight beta → App Store
- **Android**: Firebase App Distribution → Google Play Store

### Web Dashboard
- **Hosting**: Vercel or AWS Amplify
- **CDN**: CloudFront
- **Database**: Same RDS instance as API

---

## Estimated Costs (Monthly, at 100K users)

| Service | Cost | Notes |
|---------|------|-------|
| AWS ECS | $200-500 | 2-4 task instances |
| RDS PostgreSQL | $100-200 | Multi-AZ, backups |
| ElastiCache Redis | $50-100 | Cache layer |
| S3 Storage | $50-100 | User photos |
| APNs/FCM | ~$0 | Free tier |
| SES Email | $50-100 | Transactional + marketing |
| CloudFront CDN | $50-100 | Image delivery |
| Monitoring/Analytics | $100 | New Relic or similar |
| **Total** | **$600-1,200** | ~$0.006-0.012 per user |

---

## Future Enhancements (Post-MVP)

1. **Premium Features**
   - SMS reminders ($0.01 per message)
   - Gift tracking & wishlists
   - Greeting card sending
   - Advanced analytics

2. **Social Features**
   - Birthday group sharing
   - Coordinated gift organizing
   - Birthday board / wall

3. **AI Features**
   - Gift recommendations
   - Greeting message templates
   - Birthday trend analysis

4. **B2B**
   - Team/company birthday calendar
   - HR integrations
   - Event planning tools

---

## Success Criteria (MVP)

- [ ] 100% uptime
- [ ] < 200ms API response time (p95)
- [ ] 0 critical bugs at launch
- [ ] 30% day-1 retention
- [ ] 50% 7-day retention
- [ ] Contact import working for 90%+ of users
- [ ] Notification delivery > 95%

