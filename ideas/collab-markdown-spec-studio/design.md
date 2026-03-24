# SpecForge Design

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  Frontend (Next.js + Tiptap + Yjs)                      │
│  - Editor UI (Tiptap + ProseMirror)                     │
│  - Patch review queue                                    │
│  - Export orchestration                                  │
│  - Presence indicators                                   │
└────────────────┬────────────────────────────────────────┘
                 │ HTTP + WebSocket
┌────────────────▼────────────────────────────────────────┐
│  API Backend (Next.js API routes)                       │
│  - Auth (GitHub OAuth / local bypass)                   │
│  - Document CRUD                                         │
│  - Patch proposal lifecycle                             │
│  - Export generation                                     │
│  - Version snapshots                                     │
└────────────────┬────────────────────────────────────────┘
                 │ WebSocket (room tokens)
┌────────────────▼────────────────────────────────────────┐
│  Collaboration Service (Hocuspocus + Yjs)               │
│  - CRDT sync (Yjs)                                       │
│  - Presence broadcasting                                 │
│  - Room token validation                                 │
│  - Persistence hooks                                     │
└────────────────┬────────────────────────────────────────┘
                 │ SQL
┌────────────────▼────────────────────────────────────────┐
│  Storage (Postgres / PGlite)                            │
│  - Canonical doc state (Yjs binary)                     │
│  - Patch proposals + decisions                          │
│  - Version snapshots                                     │
│  - Audit trail                                           │
│  - User sessions                                         │
└─────────────────────────────────────────────────────────┘
```

## Component Design

### Component: Realtime Editor Layer
**Responsibility**: Multiplayer markdown editing with CRDT sync

**Interfaces**:
```typescript
// React context provider
<EditorProvider documentId={string}>
  {children}
</EditorProvider>

// Hooks
useEditor(): Editor | null
usePresence(): { users: User[], localUser: User }
useYjsDoc(): Y.Doc | null
```

**Dependencies**: 
- Tiptap (editor framework)
- Yjs (CRDT)
- Hocuspocus client (WebSocket sync)
- React 19

**Key Behaviors**:
- Connects to Hocuspocus server on mount
- Syncs local edits via Yjs
- Renders remote cursors and selections
- Persists to Postgres on save

### Component: Agent Patch Engine
**Responsibility**: Propose, review, and apply structured patches

**Interfaces**:
```typescript
// API endpoints
POST /api/documents/:id/patches
  Request: PatchProposal
  Response: { id: string, status: 'pending' }

POST /api/patches/:id/decision
  Request: { decision: 'accept' | 'reject' | 'cherry-pick', hunks?: number[] }
  Response: { status: 'accepted' | 'rejected', newVersion?: number }

GET /api/documents/:id/patches
  Response: PatchProposal[]
```

**Dependencies**:
- Document store (Postgres)
- Block index (derived from Yjs doc)
- Version control (snapshot creation)

**Key Behaviors**:
- Validates patch against current document version
- Rejects stale patches (base_version or fingerprint mismatch)
- Creates snapshot on accept
- Logs all decisions to audit trail

### Component: Document Model
**Responsibility**: Canonical document state + block-level index

**Interfaces**:
```typescript
class DocumentStore {
  async getDocument(id: string): Promise<Document>
  async updateDocument(id: string, yjsState: Uint8Array): Promise<void>
  async getBlocks(documentId: string): Promise<Block[]>
  async getBlockFingerprint(blockId: string): Promise<string>
  async createSnapshot(documentId: string, reason: string): Promise<Snapshot>
}
```

**Dependencies**:
- Postgres/PGlite
- Yjs (doc serialization)
- SHA256 (fingerprint generation)

**Key Behaviors**:
- Stores Yjs doc as binary blob
- Derives block index on read (ProseMirror JSON → blocks)
- Computes fingerprints (SHA256 of block content)
- Creates snapshots on major events (patch accept, manual save)

### Component: Export Layer
**Responsibility**: Generate deterministic markdown + JSON bundle

**Interfaces**:
```typescript
class ExportService {
  async exportBundle(documentId: string): Promise<ExportBundle>
  async exportToMarkdown(doc: Y.Doc, template: 'PRD' | 'SPEC' | 'TASKS'): Promise<string>
  async exportToJSON(doc: Y.Doc): Promise<AgentSpec>
}

interface ExportBundle {
  'PRD.md': string
  'SPEC.md': string
  'TASKS.md': string
  'agent_spec.json': string
  'DESIGN_SYSTEM.md'?: string
  'SECURITY.md'?: string
}
```

**Dependencies**:
- Document model
- Template engine (Handlebars or similar)
- Planning session store (for optional docs)

**Key Behaviors**:
- Converts Yjs doc to ProseMirror JSON
- Extracts sections by heading level
- Applies templates to generate markdown
- Ensures byte-identical output for same input

### Component: Collaboration Service
**Responsibility**: Real-time sync and presence

**Interfaces**:
```typescript
// Hocuspocus server
const server = Server.configure({
  port: 1234,
  async onAuthenticate(data) {
    // Validate room token
  },
  async onLoadDocument(data) {
    // Load Yjs doc from Postgres
  },
  async onStoreDocument(data) {
    // Save Yjs doc to Postgres
  }
})
```

**Dependencies**:
- Hocuspocus (WebSocket server)
- Yjs (CRDT)
- Postgres (persistence)

**Key Behaviors**:
- Validates room tokens (minted by API backend)
- Loads Yjs doc from Postgres on first client connect
- Broadcasts edits to all connected clients
- Persists Yjs doc to Postgres on debounced save (5s)

## Data Models

### Document
```typescript
interface Document {
  id: string
  workspaceId: string
  title: string
  version: number
  yjsState: Uint8Array  // Canonical Yjs doc
  createdAt: Date
  updatedAt: Date
}
```

### Block
```typescript
interface Block {
  id: string
  documentId: string
  type: 'heading' | 'paragraph' | 'list' | 'code' | 'blockquote'
  content: string
  fingerprint: string  // SHA256 of content
  authorType: 'human' | 'ai'
  authorId: string
  timestamp: Date
  metadata?: Record<string, any>
}
```

### PatchProposal
```typescript
interface PatchProposal {
  id: string
  documentId: string
  blockId: string
  baseVersion: number
  targetFingerprint: string
  patchType: 'insert' | 'replace' | 'delete'
  payload: {
    content?: string
    position?: number
    newBlockId?: string
  }
  rationale: string
  actorId: string
  actorType: 'human' | 'ai'
  status: 'pending' | 'accepted' | 'rejected' | 'stale'
  createdAt: Date
  decidedAt?: Date
  decidedBy?: string
}
```

### Snapshot
```typescript
interface Snapshot {
  id: string
  documentId: string
  version: number
  yjsState: Uint8Array
  reason: 'patch_accept' | 'manual_save' | 'milestone'
  createdAt: Date
  createdBy: string
}
```

### User
```typescript
interface User {
  id: string
  email: string
  name?: string
  avatarUrl?: string
  provider: 'github' | 'local'
  createdAt: Date
}
```

### Workspace
```typescript
interface Workspace {
  id: string
  name: string
  ownerId: string
  createdAt: Date
}
```

### WorkspaceMember
```typescript
interface WorkspaceMember {
  workspaceId: string
  userId: string
  role: 'owner' | 'editor' | 'viewer'
  joinedAt: Date
}
```

## API Contracts

### POST /api/documents
**Request**:
```json
{
  "workspaceId": "uuid",
  "title": "My Product Spec"
}
```
**Response**:
```json
{
  "id": "uuid",
  "workspaceId": "uuid",
  "title": "My Product Spec",
  "version": 1,
  "createdAt": "2026-03-24T10:00:00Z"
}
```
**Errors**:
- 401: Unauthorized
- 403: Not a workspace member
- 400: Invalid workspaceId

### GET /api/documents/:id
**Response**:
```json
{
  "id": "uuid",
  "workspaceId": "uuid",
  "title": "My Product Spec",
  "version": 5,
  "yjsState": "base64-encoded-binary",
  "createdAt": "2026-03-24T10:00:00Z",
  "updatedAt": "2026-03-24T12:30:00Z"
}
```
**Errors**:
- 401: Unauthorized
- 403: Not a workspace member
- 404: Document not found

### POST /api/documents/:id/patches
**Request**:
```json
{
  "blockId": "uuid",
  "baseVersion": 5,
  "targetFingerprint": "sha256-hash",
  "patchType": "replace",
  "payload": {
    "content": "Updated section text"
  },
  "rationale": "Improved clarity based on user feedback"
}
```
**Response**:
```json
{
  "id": "uuid",
  "status": "pending",
  "createdAt": "2026-03-24T12:35:00Z"
}
```
**Errors**:
- 401: Unauthorized
- 403: Not authorized to propose patches
- 404: Document or block not found
- 409: Patch is stale (base version or fingerprint mismatch)

### POST /api/patches/:id/decision
**Request**:
```json
{
  "decision": "accept"
}
```
**Response**:
```json
{
  "status": "accepted",
  "newVersion": 6,
  "snapshotId": "uuid"
}
```
**Errors**:
- 401: Unauthorized
- 403: Not authorized to review patches
- 404: Patch not found
- 409: Patch already decided or stale

### POST /api/documents/:id/export
**Response**:
```json
{
  "bundle": {
    "PRD.md": "# Product Requirements...",
    "SPEC.md": "# Technical Specification...",
    "TASKS.md": "# Implementation Tasks...",
    "agent_spec.json": "{...}"
  },
  "generatedAt": "2026-03-24T12:40:00Z"
}
```
**Errors**:
- 401: Unauthorized
- 403: Not a workspace member
- 404: Document not found

## Technology Stack

### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.6
- **Database**: Postgres 15 (hosted) / PGlite (local MVP)
- **ORM**: Direct SQL (Postgres client) for MVP, Prisma optional for Phase 2

### Frontend
- **Framework**: Next.js 16 + React 19
- **Editor**: Tiptap 2.x + ProseMirror
- **CRDT**: Yjs 13.x
- **Collaboration**: Hocuspocus 2.x
- **State**: Zustand 4.x (client state) + React Query 5.x (server state)
- **Styling**: Tailwind CSS 4.x

### Infrastructure
- **Hosting**: Vercel (web app) + Railway (collab server)
- **CI/CD**: GitHub Actions
- **Monitoring**: Vercel Analytics + Sentry (errors)
- **Secrets**: Vercel env vars (hosted) + .env.local (local)

## Security Design

### Authentication
**Pilot Mode**: GitHub OAuth
- User clicks "Sign in with GitHub"
- Redirected to GitHub OAuth consent
- Callback receives code, exchanges for access token
- User profile fetched, session created
- JWT issued (1hr expiry) + refresh token (7d expiry)

**Local Mode**: Dev bypass
- User enters email only (no password)
- Session created immediately
- JWT issued (no expiry for local dev)

### Authorization
**Role-based access control**:
- **Owner**: Full control (delete workspace, manage members, all editor permissions)
- **Editor**: Edit documents, review patches, export bundles
- **Agent**: Propose patches only (no direct edits)
- **Viewer**: Read documents, add comments

**Workspace scoping**:
- All API endpoints check workspace membership
- Users can only access documents in their workspaces
- Cross-workspace reads are blocked

### Data Protection
- **Transport**: HTTPS only (TLS 1.3)
- **Storage**: Postgres encryption at rest (provider-managed)
- **Secrets**: GitHub OAuth client secret in env vars (never in code)
- **Room tokens**: Short-lived (1hr), signed with workspace secret
- **Session tokens**: JWT signed with app secret, httpOnly cookies

### Audit Trail
- All patch decisions logged (actor, timestamp, decision)
- All document exports logged (actor, timestamp)
- All workspace member changes logged (actor, timestamp, action)

