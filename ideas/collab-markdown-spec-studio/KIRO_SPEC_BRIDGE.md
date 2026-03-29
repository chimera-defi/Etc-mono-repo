# SpecForge - Kiro Spec Bridge

**Status**: Maps SpecForge idea pack to Kiro executable spec format
**Source Docs**: PRD.md, SPEC.md, TASKS.md, ARCHITECTURE_DECISIONS.md

---

## Requirements Mapping (→ requirements.md)

### Problem Statement
**Source**: PRD.md "Problem" section

Teams doing startup/product planning draft PRD/spec/design docs in fragmented tools with poor provenance and messy merges. AI output is pasted manually without attribution or review controls.

### User Stories
**Source**: PRD.md "Core Users" + use cases

- **As a startup founder**, I want to collaboratively draft a PRD with AI assistance so that I can quickly validate my idea with my team
- **As an engineering lead**, I want to review and approve AI-generated spec sections so that I maintain control over technical decisions
- **As a product manager**, I want to export an approved spec into executable tasks so that I can hand off to implementation teams
- **As a team member**, I want to see who wrote each section (human or AI) so that I can trace decisions back to their source

### Acceptance Criteria
**Source**: ACCEPTANCE_TEST_MATRIX.md, VALIDATION_PLAN.md

#### Feature: Multiplayer Editing
- [ ] Given two users in the same document, when one types, then the other sees changes in <250ms
- [ ] Given a user disconnects, when they reconnect, then their local edits are preserved
- [ ] Given conflicting edits, when both users save, then CRDT resolves without data loss

#### Feature: Agent Patch Proposals
- [ ] Given an AI suggests an edit, when the user reviews it, then they can accept/reject/cherry-pick at block level
- [ ] Given a stale patch (base version changed), when user tries to apply, then system rejects with clear error
- [ ] Given an accepted patch, when applied, then attribution records AI actor and timestamp

#### Feature: Export Bundle
- [ ] Given an approved spec, when user exports, then bundle contains PRD.md, SPEC.md, TASKS.md, agent_spec.json
- [ ] Given identical document version, when exported twice, then output is byte-identical
- [ ] Given export includes planning stages, then DESIGN_SYSTEM.md and SECURITY.md are included if completed

### Correctness Properties (PBT)

#### Property 1: CRDT Convergence
**Invariant**: All connected clients converge to identical document state after quiescence
**Test Strategy**: Generate random edit sequences, apply to multiple clients, verify final state matches

#### Property 2: Patch Idempotency
**Invariant**: Applying the same accepted patch twice produces identical result as applying once
**Test Strategy**: Generate patches, apply twice, verify document state and version are identical

#### Property 3: Export Determinism
**Invariant**: Exporting the same document version produces byte-identical output
**Test Strategy**: Export same document 100 times, verify SHA256 hashes match

#### Property 4: Attribution Completeness
**Invariant**: Every block has exactly one author (human or AI) and timestamp
**Test Strategy**: Generate documents with mixed authorship, verify all blocks have valid attribution

#### Property 5: Stale Patch Rejection
**Invariant**: Patches with mismatched base_version or target_fingerprint are rejected
**Test Strategy**: Generate patches, modify document, verify stale patches fail with specific error

### Non-Functional Requirements
**Source**: SPEC.md "Initial NFR Targets"

#### Performance
- P95 collaborative update latency < 250ms (same region)
- Export generation < 2s for documents up to 10k blocks
- Patch proposal generation < 5s for sections up to 500 words

#### Security
- All API endpoints require authentication except /auth/*
- Workspace-scoped authorization (owner/editor/viewer roles)
- GitHub OAuth for pilot, local dev bypass for MVP

#### Reliability
- No document loss on reconnect
- Snapshot restore succeeds for any accepted patch decision
- Patch decision auditability for all agent edits

---

## Design Mapping (→ design.md)

### Architecture Overview
**Source**: SPEC.md "Architecture" + ARCHITECTURE_DIAGRAMS.md

```
┌─────────────────────────────────────────────────────────┐
│  Frontend (Next.js + Tiptap + Yjs)                      │
│  - Editor UI                                             │
│  - Patch review queue                                    │
│  - Export orchestration                                  │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│  API Backend (Next.js API routes)                       │
│  - Auth (GitHub OAuth / local bypass)                   │
│  - Document metadata                                     │
│  - Patch proposals                                       │
│  - Export generation                                     │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│  Collaboration Service (Hocuspocus + Yjs)               │
│  - CRDT sync                                             │
│  - Presence                                              │
│  - Room tokens                                           │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│  Storage (Postgres / PGlite)                            │
│  - Canonical doc state                                   │
│  - Patch logs                                            │
│  - Snapshots                                             │
│  - Audit trail                                           │
└─────────────────────────────────────────────────────────┘
```

### Component Design
**Source**: SPEC.md "Core Components"

#### Component: Realtime Editor Layer
**Responsibility**: Multiplayer markdown editing with CRDT sync
**Interfaces**: 
- `EditorProvider` - React context for editor state
- `useEditor()` - Hook for editor instance
- `usePresence()` - Hook for collaborator awareness
**Dependencies**: Tiptap, Yjs, Hocuspocus client

#### Component: Agent Patch Engine
**Responsibility**: Propose, review, apply structured patches
**Interfaces**:
- `POST /api/documents/:id/patches` - Submit patch proposal
- `POST /api/patches/:id/decision` - Accept/reject/cherry-pick
**Dependencies**: Document store, block index, version control

#### Component: Document Model
**Responsibility**: Canonical document state + block index
**Interfaces**:
- `getDocument(id)` - Fetch document with blocks
- `updateBlock(id, content)` - Update single block
- `getBlockFingerprint(id)` - Get block hash for stale detection
**Dependencies**: Postgres/PGlite, Yjs doc serialization

#### Component: Export Layer
**Responsibility**: Generate deterministic markdown + JSON bundle
**Interfaces**:
- `POST /api/documents/:id/export` - Generate export bundle
- `exportToMarkdown(doc)` - Convert to markdown
- `exportToJSON(doc)` - Convert to agent_spec.json
**Dependencies**: Document model, template engine

### Data Models
**Source**: SPEC.md "Data Model (MVP)"

```typescript
interface Document {
  id: string;
  workspaceId: string;
  title: string;
  version: number;
  yjsState: Uint8Array; // Canonical Yjs doc
  createdAt: Date;
  updatedAt: Date;
}

interface Block {
  id: string;
  documentId: string;
  type: 'heading' | 'paragraph' | 'list' | 'code';
  content: string;
  fingerprint: string; // SHA256 of content
  authorType: 'human' | 'ai';
  authorId: string;
  timestamp: Date;
}

interface PatchProposal {
  id: string;
  documentId: string;
  blockId: string;
  baseVersion: number;
  targetFingerprint: string;
  patchType: 'insert' | 'replace' | 'delete';
  payload: any;
  rationale: string;
  actorId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'stale';
}
```

### API Contracts
**Source**: SPEC.md "APIs (MVP)"

#### POST /api/documents
**Request**:
```json
{
  "workspaceId": "uuid",
  "title": "string"
}
```
**Response**:
```json
{
  "id": "uuid",
  "workspaceId": "uuid",
  "title": "string",
  "version": 1,
  "createdAt": "ISO8601"
}
```

#### POST /api/documents/:id/patches
**Request**:
```json
{
  "blockId": "uuid",
  "baseVersion": 5,
  "targetFingerprint": "sha256",
  "patchType": "replace",
  "payload": { "content": "new text" },
  "rationale": "Improved clarity"
}
```
**Response**:
```json
{
  "id": "uuid",
  "status": "pending",
  "createdAt": "ISO8601"
}
```

### Technology Stack
**Source**: SPEC.md "Default Stack"

#### Backend
- Runtime: Node.js 20
- Framework: Next.js 16 (App Router)
- Language: TypeScript 5.6
- Database: Postgres 15 (hosted) / PGlite (local)
- ORM: Prisma (optional, direct SQL for MVP)

#### Frontend
- Framework: Next.js 16 + React 19
- Editor: Tiptap + ProseMirror
- CRDT: Yjs
- Collaboration: Hocuspocus
- State: Zustand + React Query

#### Infrastructure
- Hosting: Vercel (web) + Railway (collab server)
- CI/CD: GitHub Actions
- Monitoring: Vercel Analytics

### Security Design
**Source**: SPEC.md "Auth Default" + "Permissions (MVP)"

#### Authentication
- Pilot: GitHub OAuth
- Local: Dev bypass (email-only, no password)
- Tokens: JWT (1hr) + refresh (7d)

#### Authorization
- Owner: Full control (delete workspace, manage members)
- Editor: Edit docs + review patches
- Agent: Propose patches only
- Viewer: Read + comment

#### Data Protection
- HTTPS only (TLS 1.3)
- Workspace-scoped access (no cross-workspace reads)
- Room tokens for collab server (short-lived, minted by API)

---

## Tasks Mapping (→ tasks.md)

**Source**: TASKS.md + SPEC.md phase plan

### Phase 1: Foundation (Weeks 1-2)

- [ ] 1.1 Setup monorepo structure
  - Done: `web/`, `collab-server/`, `cli/` packages exist, bun workspaces configured
  - Property: N/A (infrastructure)

- [ ] 1.2 Implement local auth bypass
  - Done: Users can create session with email only, JWT issued
  - Property: N/A (pilot-only feature)

- [ ] 1.3 Setup Postgres schema
  - Done: Documents, Blocks, PatchProposals tables created, migrations run
  - Property: N/A (infrastructure)

### Phase 2: Core Editing (Weeks 3-4)

- [ ] 2.1 Implement Tiptap editor
  - Done: Markdown editor renders, basic formatting works
  - Property: N/A (UI)

- [ ] 2.2 Integrate Yjs CRDT
  - Done: Two clients see each other's edits in <250ms
  - Property: Property 1 (CRDT convergence)

- [ ] 2.3 Setup Hocuspocus server
  - Done: Collab server runs, clients connect via room tokens
  - Property: N/A (infrastructure)

### Phase 3: Patch Workflow (Weeks 5-6)

- [ ] 3.1 Implement patch proposal API
  - Done: AI can submit patches, humans can review
  - Property: Property 4 (attribution completeness)

- [ ] 3.2 Implement stale patch detection
  - Done: Patches with mismatched fingerprints are rejected
  - Property: Property 5 (stale patch rejection)

- [ ] 3.3 Implement patch application
  - Done: Accepted patches update document, rejected patches are logged
  - Property: Property 2 (patch idempotency)

### Phase 4: Export (Week 7)

- [ ] 4.1 Implement markdown export
  - Done: Documents export to PRD.md, SPEC.md, TASKS.md
  - Property: Property 3 (export determinism)

- [ ] 4.2 Implement JSON export
  - Done: agent_spec.json includes all metadata
  - Property: Property 3 (export determinism)

### Phase 5: Testing (Week 8)

- [ ] 5.1 Property-based tests
  - Done: All 5 correctness properties have passing PBT suites
  - Property: All properties

- [ ] 5.2 Integration tests
  - Done: End-to-end flows pass for all user stories
  - Property: N/A (integration)

### Phase 6: Deployment (Week 9-10)

- [ ] 6.1 Deploy to Vercel + Railway
  - Done: App accessible at specforge.dev, health checks passing
  - Property: N/A (deployment)

- [ ] 6.2 Setup monitoring
  - Done: Metrics, logs, alerts configured
  - Property: N/A (ops)

---

## Notes

- This bridge focuses on MVP scope only (Phase 1 from SPEC.md)
- Phase 2+ features (repo generation, deeper planning stages) deferred
- Property-based testing is the key differentiator from the idea pack SPEC.md
- Tasks include explicit "Property" mappings to trace implementation to correctness

