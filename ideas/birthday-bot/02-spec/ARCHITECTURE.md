# Birthday Bot - Backend Architecture & Design

**Status**: Detailed Architecture Design
**Date**: January 8, 2026

---

## Executive Summary

Birthday Bot's backend is built around three core principles:

1. **Privacy-First**: User birthday data is strictly isolated per user. Other users cannot access your birthday information unless you explicitly grant permission.
2. **Multi-Tenant with Data Separation**: Each user's data is logically separated, with granular access controls enforced at the database and API layers.
3. **Browser-Driven Data Collection**: Use Claude Code-style browser automation and message parsing to intelligently gather birthday information from multiple sources while respecting privacy.

---

## Core Architectural Principles

### 1. Privacy as a First-Class Concern

Every design decision prioritizes user privacy:

- **User-Owned Data**: Users own their birthday information. Other users cannot see it unless explicitly shared.
- **Consent Tracking**: We track which integrations users have authorized (Google, Facebook, Apple Calendar, message access).
- **Minimal Data Collection**: We collect only birthday-related information, not full contact details or messages (except for parsing birthday mentions).
- **Audit Logging**: All access to sensitive data is logged.
- **Right to Deletion**: Users can delete all their data immediately (GDPR compliance).

### 2. Multi-Tenant Data Isolation

```
User A's Birthday Data
├── Personal Birthdays (n=150)
├── Shared Birthdays (visible to User B, C only)
├── Private Birthdays (visible to User A only)
└── Access Log (who accessed what, when)

User B's Birthday Data
├── Personal Birthdays (n=200)
├── Shared Birthdays (visible to User A, D only)
├── Private Birthdays
└── Access Log

User C's Birthday Data
├── Personal Birthdays (n=75)
├── Shared Birthdays
├── Private Birthdays
└── Access Log
```

**Key**: Database rows are tagged with `user_id`. API always filters by authenticated user's `user_id`. No query can accidentally return another user's data.

### 3. Browser Automation for Data Gathering

Instead of relying on fragile APIs, Birthday Bot uses Claude Code-style browser automation to gather data where APIs fail:

- **Facebook**: Use browser automation (Selenium/Puppeteer) to log in as user and extract birthday data from visible friends list
- **Apple Calendar**: Native mobile API on iOS (already handled)
- **Messages**: Parse recent messages for birthday mentions ("My birthday is March 15", "Let's celebrate on 3/20", etc.)
- **Browser Extension**: Optional extension for additional data gathering

---

## High-Level Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Registration/Login                      │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   OAuth/Social Sign-In                          │
│  (Google, Apple, Facebook - user grants consent)                │
│  Each sign-in creates audit log entry                           │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│              Permission Request Screen                          │
│  ✓ Google Contacts (read)                                       │
│  ✓ Google Calendar (read/write)                                 │
│  ✓ Apple Contacts (read on iOS)                                 │
│  ✓ Facebook Friends Birthdays (read)                            │
│  ✓ Message Access (limited: birthday mentions only)             │
│  → All stored in user.consent_log                               │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────┬──────────────────────────┬────────────┐
│  Google Contacts Sync    │  Browser Automation      │  Manual    │
│  (via Google API)        │  (Facebook, Apple iCal)  │  Entry     │
└──────────────────┬───────┴──────────────────┬───────┴────────┬───┘
                   │                          │                │
                   ▼                          ▼                ▼
            ┌─────────────────────────────────────────────────────┐
            │      Data Normalization & Deduplication            │
            │  - Parse date formats (MM/DD, DD/MM, etc)          │
            │  - Match fuzzy names (Levenshtein distance)        │
            │  - Flag conflicts for user resolution              │
            │  - Mark data source (google, facebook, manual)      │
            └──────────────────┬──────────────────────────────────┘
                               │
                               ▼
            ┌─────────────────────────────────────────────────────┐
            │      Store in Birthdays Table (user_id scoped)     │
            │  - Each row belongs to exactly one user             │
            │  - Source tracking for re-sync                      │
            │  - Dedup metadata for conflict resolution           │
            └──────────────────┬──────────────────────────────────┘
                               │
                               ▼
            ┌─────────────────────────────────────────────────────┐
            │      Schedule Notifications (if enabled)            │
            │  - 7 days before: bulk notification job             │
            │  - 3 days before: bulk notification job             │
            │  - 1 day before: bulk notification job              │
            │  → Each notification keyed to user + birthday       │
            └─────────────────────────────────────────────────────┘
```

---

## Data Model Deep Dive

### User Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),

  -- Profile
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url TEXT,

  -- Settings
  timezone VARCHAR(50) DEFAULT 'UTC',
  notification_enabled BOOLEAN DEFAULT true,
  notification_preferences JSONB, -- {days: [7,3,1], time: "09:00"}

  -- Privacy
  allow_birthday_discovery BOOLEAN DEFAULT true, -- Can others find & add our birthday?
  allow_sharing BOOLEAN DEFAULT true,            -- Can we share birthday lists with others?

  -- Audit
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  last_login TIMESTAMP,
  deleted_at TIMESTAMP -- Soft delete for GDPR
);
```

### Birthdays Table (Core - Privacy Critical)

```sql
CREATE TABLE birthdays (
  id UUID PRIMARY KEY,

  -- Ownership (critical for privacy)
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Birthday Information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  date_of_birth DATE NOT NULL,
  age_known BOOLEAN DEFAULT true,
  photo_url TEXT,
  notes TEXT,

  -- Metadata
  is_favorite BOOLEAN DEFAULT false,
  priority SMALLINT DEFAULT 0, -- 0: normal, 1: important, -1: archive

  -- Source Tracking (for re-sync and update detection)
  source_type VARCHAR(50), -- 'phone', 'google', 'facebook', 'manual', 'message_parse'
  source_id VARCHAR(255), -- Reference to original source (e.g., Google contact ID)

  -- Visibility Control
  visibility VARCHAR(50) DEFAULT 'private', -- 'private', 'friends', 'public'
  shared_with_user_ids UUID[] DEFAULT '{}', -- Explicit sharing for specific users

  -- Audit
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP,

  -- Constraint: Every birthday belongs to exactly one user
  UNIQUE(user_id, source_type, source_id),

  -- Index for fast queries by user
  INDEX idx_user_birthdays (user_id, deleted_at)
);
```

**Key Privacy Features**:
- `user_id` on every row ensures user isolation
- `visibility` field controls who can see this birthday
- `shared_with_user_ids` array tracks explicit sharing
- Soft deletes for audit trail and recovery

### Consent & Integration Log

```sql
CREATE TABLE integrations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Provider Information
  provider VARCHAR(50) NOT NULL, -- 'google', 'facebook', 'apple', 'messages'
  provider_user_id VARCHAR(255), -- Their ID in their system

  -- Authorization
  access_token_encrypted TEXT, -- Encrypted with key derivation from user password
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMP,

  -- Consent Tracking
  scopes_granted TEXT[], -- ['contacts:read', 'calendar:read']
  consent_given_at TIMESTAMP,
  consent_version INT, -- If consent terms change, bump version

  -- Sync Status
  last_synced_at TIMESTAMP,
  sync_enabled BOOLEAN DEFAULT true,
  sync_error_message TEXT,

  -- Audit
  created_at TIMESTAMP,
  updated_at TIMESTAMP,

  UNIQUE(user_id, provider)
);
```

### Audit Log (For Transparency)

```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- What happened
  action VARCHAR(50), -- 'birthday_created', 'birthday_updated', 'birthday_shared', 'integration_authorized', 'data_exported'
  resource_type VARCHAR(50), -- 'birthday', 'integration', 'user'
  resource_id UUID,

  -- Context
  details JSONB, -- {old_value, new_value, shared_with_user_id, reason}
  ip_address INET,
  user_agent TEXT,

  -- Timestamp
  created_at TIMESTAMP,

  INDEX idx_user_audit (user_id, created_at)
);
```

---

## Data Collection Strategies

### Strategy 1: Google Contacts (API-Based)

**Flow**:
1. User clicks "Sync Google Contacts"
2. OAuth flow → User grants `contacts:read` scope
3. Backend calls `people.connections.list()` API
4. Parse birthdays from contacts
5. Store in `birthdays` table with `source_type='google'`, `source_id=<google_contact_id>`
6. Log integration in `integrations` table

**Privacy**:
- Only birthdays are stored (not full contact data)
- User can revoke access at any time
- Original Google IDs kept for re-sync

---

### Strategy 2: Facebook (Browser Automation)

**Problem**: Facebook API is restricted, no official endpoint for friends' birthdays

**Solution**: Use Claude Code-style browser automation (Puppeteer/Playwright)

**How it Works**:

```
Backend Worker Process:
  1. Receive request: "User X wants to sync Facebook"
  2. Check integrations table for stored Facebook tokens
  3. Start headless browser session (Puppeteer/Playwright)
  4. Authenticate with user's Facebook credentials (encrypted tokens)
  5. Navigate to Facebook friends list
  6. Iterate through visible friends
  7. Extract visible birthday information where available
  8. Parse dates and names
  9. Check for duplicates (already in system?)
 10. Store with source_type='facebook', source_id=<facebook_uid>
 11. Return summary: "Added 47 birthdays, updated 12, 3 conflicts"
```

**Privacy Considerations**:
- Browser automation runs on our backend (not exposing user credentials to third parties)
- We only extract birthday data (not scraping messages, photos, etc.)
- User explicitly authorizes this sync
- Logged in audit trail

**Technical Implementation**:
- Use Puppeteer or Playwright for headless browser control
- Run in isolated Docker container per user
- Timeout after 5 minutes (prevent hanging)
- Retry logic with exponential backoff
- Log all steps for debugging

---

### Strategy 3: Apple Calendar (Native iOS)

**How it Works**:
1. iOS app uses native `EventKit` framework
2. Request `calendarAccess` permission from OS
3. Read local "Birthdays" calendar
4. Sync selected birthdays to backend
5. Store with `source_type='apple_calendar'`

**Privacy**:
- Happens on device (no secrets sent to backend)
- User controls which calendars to sync
- Can revoke at OS level

---

### Strategy 4: Message Parsing (Limited)

**Problem**: Birthday information is often mentioned in messages ("My birthday is..." or "Let's celebrate on March 15")

**Solution**: Parse recent messages for birthday mentions (with strict privacy controls)

**How it Works**:

```
Message Parsing Worker:
  Input: User grants "message access" permission

  1. Check integrations: does user have message access authorized?
  2. Connect to message service (WhatsApp/iMessage via secure API)
  3. Retrieve recent messages (last 6 months only)
  4. Parse for birthday patterns:
     - "my birthday is [date]"
     - "turn [age] on [date]"
     - "celebrate on [date]"
     - "[name]'s birthday [date]"
  5. Extract: (name, date, confidence_score)
  6. Filter: only high-confidence matches (>80%)
  7. Store with source_type='message_parse', confidence_score field
  8. Mark as "suggested" (requires user approval before locking in)

  Privacy Measures:
  - Only parse recent messages (6 months)
  - Only extract birthday mentions (don't store message content)
  - Log every access attempt
  - User can opt-out at any time
  - Automatic deletion of parsed data after 30 days if not approved
```

**Implementation Approach**:
- Use regex patterns for common birthday phrases
- Use NLP library (spaCy/NLTK) for confidence scoring
- Store extracted data separately (not in main birthdays table initially)
- Require explicit user approval before migrating to `birthdays` table
- Provide UI to review and approve before committing

---

### Strategy 5: Browser Extension (Optional MVP+)

**For technical users who want maximum automation**:

```
Browser Extension:
  - Installed on user's browser
  - Passive monitoring (no active scraping)
  - Detects when user visits social networks
  - Extracts visible birthday data from:
    * Facebook friends list
    * LinkedIn profile pages
    * Instagram bio sections
  - Syncs extracted data to Birthday Bot backend
  - User reviews before commit

Privacy:
  - Extension runs on user's machine (not our servers)
  - User controls what data gets sent
  - Data sent only to Birthday Bot servers (not third parties)
  - Full audit trail of what was captured
```

**Note**: Browser extension is **post-MVP** feature.

---

## API Security & Data Access Control

### Authentication & Authorization

Every API request must include a JWT token:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

JWT Payload:
{
  "sub": "user_uuid",
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234571490,
  "roles": ["user"]
}
```

### Database Query Filtering (Row-Level Security)

Every query to the `birthdays` table includes this filter:

```sql
-- ALWAYS applied, cannot be bypassed
WHERE user_id = <authenticated_user_id>
OR user_id IN (
  SELECT shared_with_user_ids FROM shared_birthday_records
  WHERE user_id = <authenticated_user_id>
)
```

**Implementation in ORM (Prisma)**:
```typescript
// Pseudo-code - never do this:
birthdays.findMany({}) // ❌ Would expose all users' birthdays

// Always do this:
birthdays.findMany({
  where: {
    OR: [
      { user_id: authenticatedUserId },
      { shared_with_user_ids: { has: authenticatedUserId } }
    ]
  }
})
```

### API Endpoints with Access Control

```
GET /api/birthdays
  → Returns only current user's birthdays
  → Filters: user_id = auth.userId

GET /api/birthdays/:id
  → Only allowed if:
    - Birthday.user_id == auth.userId, OR
    - auth.userId in Birthday.shared_with_user_ids
  → Returns 404 if access denied (don't leak existence)

PUT /api/birthdays/:id
  → Only allowed if Birthday.user_id == auth.userId
  → Cannot modify someone else's birthday

DELETE /api/birthdays/:id
  → Only allowed if Birthday.user_id == auth.userId

POST /api/birthdays/:id/share
  → Only allowed if Birthday.user_id == auth.userId
  → Adds user to shared_with_user_ids
  → Logs in audit trail
```

---

## Backend Architecture - System Components

### 1. Core API Service (Node.js + Express)

**Responsibilities**:
- Request handling and routing
- JWT authentication/authorization
- Birthday CRUD operations
- Data normalization
- Sync coordination

**Tech Stack**:
- Node.js 20 LTS + Express.js
- TypeScript for type safety
- Prisma ORM (enforces migrations, type-safe queries)
- Input validation (Zod or Joi)

**Design Pattern**: Clean architecture with separation of concerns
```
routes/
├── auth.ts           (login, register, oauth)
├── birthdays.ts      (CRUD operations)
├── integrations.ts   (manage connected services)
└── audit.ts          (view audit logs)

services/
├── birthday.service.ts     (business logic)
├── integration.service.ts  (coordinate syncs)
├── dedup.service.ts        (conflict resolution)
└── auth.service.ts         (JWT, OAuth)

models/
├── user.ts
├── birthday.ts
└── integration.ts

middleware/
├── auth.ts           (JWT validation)
├── errorHandler.ts
└── logging.ts
```

### 2. Data Sync Engine (Background Workers)

**Responsibilities**:
- Coordinate multi-source syncs
- Handle scheduling and retries
- Manage deduplication conflicts
- Store dedup metadata

**Tech**: Bull job queue + Redis

**Job Types**:
```
sync_google_contacts
  - Triggered by user action
  - Fetches from Google API
  - Stores with source_type='google'
  - Marks completed

sync_facebook_birthdays
  - Triggered by user action
  - Starts browser automation worker
  - Parses visible birthday data
  - Flags duplicates

sync_parse_messages
  - Triggered by user action
  - Processes recent messages
  - Extracts birthday mentions
  - Stores as "suggested" (not committed)

send_notifications
  - Runs daily
  - Checks birthdays for next 7, 3, 1 days
  - Queues FCM/APNs payloads
  - Logs sent notifications

dedup_resolution
  - Monitors duplicate_candidates table
  - Prompts user for conflict resolution
  - Merges or rejects
  - Cleans up dedup metadata
```

### 3. Browser Automation Service

**Responsibilities**:
- Launch headless browser sessions
- Authenticate with Facebook/other services
- Extract birthday data
- Parse and validate
- Return structured data

**Tech**: Puppeteer or Playwright

**Error Handling**:
- Rate limiting detection → backoff
- CAPTCHA detection → pause and notify user
- Session timeout → retry with fresh login
- Data parsing errors → log and continue
- All failures logged for debugging

**Isolation**:
- Each sync runs in isolated container
- Timeout: 5 minutes max per session
- Memory limit: 512MB
- Network isolation (only to required domains)

### 4. Notification Service

**Responsibilities**:
- Queue notifications (FCM, APNs, email)
- Track delivery status
- Handle bounces/failures
- Provide delivery metrics

**Tech**: Firebase Cloud Messaging (FCM) + APNs SDK

**Flow**:
```
1. Daily job: Find birthdays in [tomorrow-7, tomorrow-3, tomorrow-1]
2. For each match:
   - Create notification_job record
   - Queue to FCM/APNs
   - Track status (pending → sent → delivered/failed)
3. Retry failed notifications 3x with backoff
4. Update notification_sent audit log
```

### 5. Data Storage & Querying

**Database**: PostgreSQL 15+

**Key Design Principles**:
- Strong schema (not schema-less) for data integrity
- JSONB columns for flexible metadata (notification_preferences)
- Full-text search for birthday names
- Efficient indexes for common queries

**Backup & Recovery**:
- Daily automated backups (S3)
- Point-in-time recovery (14-day window)
- Encryption at rest
- Immutable audit log (cannot be deleted)

---

## Deduplication & Conflict Resolution

### The Problem

When importing from multiple sources, you often get duplicates:

```
Google Contacts:
  - John Smith, 03/15/1990

Facebook:
  - Johnny Smith, March 15

Message Parse:
  - John turns 34 on 3/15

Database should have: 1 record, not 3
```

### Solution: Smart Dedup Pipeline

```
New Birthday Added
  ↓
Check Dedup Candidates
  - Exact match: same name + same date → Auto-merge
  - Fuzzy match: similar name + same date → Flag for user decision
  - Partial match: same date, different names → Ask user
  - No match → Create new record
  ↓
If Conflict:
  - Show user: "Is John Smith (Google) same as Johnny Smith (Facebook)?"
  - Provide: Keep separately, merge, or delete one
  - Log decision in dedup_metadata table
  ↓
If Merged:
  - Consolidate source_type array (e.g., ['google', 'facebook'])
  - Link both source_ids
  - Next sync checks source_id array to avoid re-duping
```

### Dedup Database Tables

```sql
CREATE TABLE dedup_candidates (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  birthday_id_1 UUID NOT NULL REFERENCES birthdays(id),
  birthday_id_2 UUID NOT NULL REFERENCES birthdays(id),

  -- Matching confidence
  match_type VARCHAR(50), -- 'exact', 'fuzzy', 'partial'
  similarity_score FLOAT, -- 0-1

  -- Resolution
  status VARCHAR(20) DEFAULT 'unresolved', -- 'unresolved', 'merged', 'kept_separate'
  user_decision_at TIMESTAMP,

  created_at TIMESTAMP,

  INDEX (user_id, status)
);

CREATE TABLE dedup_metadata (
  id UUID PRIMARY KEY,
  birthday_id UUID NOT NULL UNIQUE REFERENCES birthdays(id),

  -- Linked sources
  source_ids JSONB, -- {google: "...", facebook: "...", message: "..."}
  canonical_name VARCHAR(100), -- Which name version is authoritative?
  canonical_date DATE,

  -- Dedup history
  merged_from_ids UUID[], -- IDs of deleted duplicates
  dedup_history JSONB[], -- [{date, action, source}, ...]

  updated_at TIMESTAMP
);
```

---

## Extensibility & Future Improvements

### Phase 1 (MVP): Minimal but Solid

- Google Contacts & Calendar APIs
- Manual entry
- Basic notifications
- Simple privacy model
- Desktop web dashboard only

### Phase 2: Browser Automation

- Facebook browser automation (Puppeteer)
- Message parsing for birthday extraction
- Browser extension (optional, for power users)
- Advanced deduplication UI

### Phase 3: AI & Intelligence

- **Gift Recommendations**: Given birthday date, suggest gifts via ML
- **Greeting Templates**: Generate personalized messages
- **Relationship Analysis**: Detect important people based on message frequency
- **Forgotten Connections**: Identify people you haven't talked to in months

### Phase 4: Social & B2B

- **Shared Lists**: Create group birthday calendars
- **Coordinated Gifting**: Multiple people chip in for one gift
- **Team Calendar**: HR tool for company birthday management
- **Public Birthdays**: Opt-in birthday board (Instagram-style)

### Phase 5: Advanced Privacy Features

- **End-to-End Encryption**: Encrypt birthdays client-side, only encrypted values stored server-side
- **Zero-Knowledge Sharing**: Share birthday lists without revealing full birthdays
- **Privacy Budget**: Rate-limit who can query your birthday
- **Data Residency**: Store data in specific regions (GDPR)

---

## Data Flow Examples

### Use Case 1: User Syncs Google Contacts

```
1. User clicks "Sync Google Contacts" in app
2. App shows OAuth login screen for Google
3. User grants contacts:read permission
4. Backend receives auth code
5. Backend exchanges for access + refresh token
6. Tokens stored encrypted in integrations table
7. Sync job queued: sync_google_contacts_for_user_X
8. Worker fetches from Google People API
9. Parses birthdates, handles formatting variations
10. Creates birthday records with source_type='google'
11. Runs dedup check
12. Returns: "Added 45, Updated 3, Conflicts: 2"
13. User sees pending conflicts, resolves them
14. Next sync will skip already-processed contacts (source_id already exists)
```

### Use Case 2: User Syncs Facebook via Browser Automation

```
1. User clicks "Sync Facebook" in app
2. Backend receives request, checks authorization
3. Browser automation worker starts (Puppeteer)
4. Authenticates with user's Facebook tokens
5. Navigates to friends list page
6. Extracts visible birthday info from each friend card
7. Parses dates in various formats
8. Creates birthday records with source_type='facebook'
9. Dedup check
10. Returns summary with conflicts
11. User reviews and approves
12. Birthdays committed to database
13. Next sync checks source_id='facebook_<uid>' to avoid re-processing same friend
```

### Use Case 3: User Enables Message Parsing

```
1. User clicks "Parse Messages for Birthdays"
2. Grant permission for message access
3. Worker connects to message service (iMessage/WhatsApp)
4. Fetches recent messages (6 months)
5. Runs regex patterns and NLP for birthday mentions
6. Extracts: (name, date, confidence_score)
7. Creates draft records in birthday_suggestions table
8. User sees suggestions: "Found 12 birthday mentions"
9. User reviews each suggestion, can approve/reject
10. Approved suggestions moved to birthdays table
11. Rejected suggestions deleted
12. Audit log records every approval/rejection
```

### Use Case 4: Birthday Notification (Daily Job)

```
00:00 UTC: Daily job starts
  1. Find all birthdays where date_of_birth matches:
     - Tomorrow (1 day before)
     - 3 days from now
     - 7 days from now
  2. For each matching birthday:
     - Load user preferences (notifications enabled? timezone?)
     - Queue FCM/APNs notification
     - Create notification_job record (status: queued)
  3. Background worker picks up queue
     - Sends to FCM service
     - Sends to APNs service
     - Updates status: sent
  4. Logs in notifications_sent table
  5. Monitor delivery confirmation
     - If failed, retry 3x with exponential backoff
     - Log final status (delivered/failed)
  6. Update notification_sent audit log
```

---

## Security Checkpoints

### Authentication Layer
- ✅ All endpoints require valid JWT
- ✅ JWT refresh tokens stored in secure HTTP-only cookies (web) or secure storage (mobile)
- ✅ Token expiry: 1 hour (access), 7 days (refresh)
- ✅ Rate limiting: 100 req/min per user

### Authorization Layer
- ✅ Every database query filtered by user_id
- ✅ Row-level security enforced at ORM level (Prisma)
- ✅ Cannot modify other users' birthdays
- ✅ Cannot access other users' audit logs

### Data Protection
- ✅ All passwords hashed with bcrypt (cost factor 12)
- ✅ Sensitive tokens encrypted at rest (with key derivation from user credentials)
- ✅ HTTPS only (TLS 1.3+)
- ✅ Database connections use SSL
- ✅ GDPR right to deletion (all data purged within 24 hours)

### Audit & Monitoring
- ✅ Immutable audit log (cannot be deleted)
- ✅ All data access logged (who, what, when, why)
- ✅ Alerting on suspicious patterns (mass data access, unusual times)
- ✅ Monthly audit reports exportable by users

---

## Deployment Architecture

### Development → Staging → Production

```
Local Development
  ├─ Node.js backend
  ├─ PostgreSQL (Docker)
  ├─ Redis (Docker)
  └─ Puppeteer for Facebook automation

Staging Environment
  ├─ AWS ECS (2 task instances)
  ├─ RDS PostgreSQL (multi-AZ)
  ├─ ElastiCache Redis
  ├─ S3 for backups
  └─ CloudFront for static assets

Production Environment
  ├─ AWS ECS (4-8 task instances, auto-scaling)
  ├─ RDS PostgreSQL (multi-AZ, encrypted, automated backups)
  ├─ ElastiCache Redis (cluster mode enabled)
  ├─ S3 (versioned, MFA delete enabled)
  ├─ CloudFront with WAF
  ├─ VPC with private subnets
  └─ Monitoring: CloudWatch, New Relic, Sentry
```

**CI/CD Pipeline**:
```
Push to main
  ↓
GitHub Actions Workflow
  ├─ Lint (ESLint, TypeScript)
  ├─ Unit Tests (Jest)
  ├─ Integration Tests (test DB + API)
  ├─ Build (Docker image)
  └─ Push to ECR
  ↓
Deploy to Staging
  ├─ Run smoke tests
  ├─ Check performance
  └─ Manual QA
  ↓
Approve → Deploy to Production
  ├─ Blue-green deployment
  ├─ Health checks
  └─ Rollback if needed
```

---

## Simple but Extensible Design

### Core Principle: KISS (Keep It Simple, Stupid)

**MVP Design Choices**:
- REST API (not GraphQL) - simpler for mobile, sufficient for our queries
- PostgreSQL (not NoSQL) - relational integrity for birthday data
- Bull job queue (not Kafka) - overkill for current scale
- No caching layer initially (add Redis later if needed)
- No real-time sync (daily batch is fine for birthdays)

**Why Not?**:
- GraphQL adds complexity without benefit for our query patterns
- NoSQL loses relational integrity (birthdays must link to users)
- Kafka is for streaming data we don't have
- Caching can wait until bottleneck appears
- Real-time sync unnecessary for birthdays (once per day is OK)

### Easy Upgrades Later

```
As we grow:

Initial:
  REST API → Direct DB queries

Scale 1:
  Add caching layer (Redis)
  REST API → Redis cache → DB

Scale 2:
  Add search service (Elasticsearch)
  REST API → Redis → Elasticsearch for full-text search

Scale 3:
  Add read replicas (PostgreSQL)
  Split writes (primary) from reads (replicas)

Scale 4:
  Consider GraphQL for complex client queries
  But only if needed

Scale 5:
  Consider CQRS if event sourcing becomes important
  (Audit trail already suggests event architecture)
```

---

## Testing Strategy

### Unit Tests
- Service layer logic (dedup, date parsing)
- Authorization checks
- Error handling

### Integration Tests
- API endpoints with test database
- Multi-source sync coordination
- Birthday dedup with real data

### End-to-End Tests
- Full user flow: register → sync Google → get notification
- Conflict resolution flow
- Data deletion & GDPR compliance

### Security Tests
- SQL injection attempts
- JWT token tampering
- Cross-user data access
- Rate limiting enforcement

---

## Conclusion

Birthday Bot's backend is designed with **privacy as a first-class concern**. Every design decision prioritizes user data isolation and transparency. We use the simplest tools that work (REST, PostgreSQL, Bull queue) and avoid premature optimization.

Browser automation enables data gathering where APIs fail (Facebook), while message parsing discovers birthdays mentioned in messages. The architecture is easily extensible to advanced features (gifting, social sharing, B2B) without rearchitecting the core.

**Next phase**: Implement Phase 1 with Google + manual entry, then add Facebook automation and message parsing.

