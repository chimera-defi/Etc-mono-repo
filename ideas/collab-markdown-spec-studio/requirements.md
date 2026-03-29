# SpecForge Requirements

## Problem Statement

Teams doing startup/product planning draft PRD/spec/design docs in fragmented tools:
1. Chat in one place (Slack, Discord)
2. Docs in another (Google Docs, Notion)
3. AI output pasted manually without attribution
4. Poor provenance and messy merges
5. No review controls for AI-generated content

This leads to lost context, unclear decisions, and specs that don't match what was actually built.

## User Stories

### Primary Users

- **As a startup founder**, I want to collaboratively draft a PRD with AI assistance so that I can quickly validate my idea with my team without losing track of who suggested what

- **As an engineering lead**, I want to review and approve AI-generated spec sections so that I maintain control over technical decisions and can trace them back to their source

- **As a product manager**, I want to export an approved spec into executable tasks so that I can hand off to implementation teams with clear acceptance criteria

- **As a team member**, I want to see who wrote each section (human or AI) so that I can trace decisions back to their source and understand the rationale

### Secondary Users

- **As a design lead**, I want to propose UX changes as reviewable patches so that the team can discuss them before committing

- **As a security reviewer**, I want to flag security concerns in spec sections so that they're addressed before implementation

## Acceptance Criteria

### Feature: Multiplayer Editing
- [ ] Given two users in the same document, when one types, then the other sees changes in <250ms (P95, same region)
- [ ] Given a user disconnects, when they reconnect within 5 minutes, then their local edits are preserved and synced
- [ ] Given conflicting edits from two users, when both save, then CRDT resolves without data loss
- [ ] Given a user is typing, when another user views the document, then they see the typing user's cursor position and name

### Feature: Agent Patch Proposals
- [ ] Given an AI suggests an edit, when the user reviews it, then they can accept/reject/cherry-pick at block level
- [ ] Given a stale patch (base version changed), when user tries to apply, then system rejects with error "Patch is stale: base version mismatch"
- [ ] Given an accepted patch, when applied, then attribution records AI actor ID and timestamp
- [ ] Given a rejected patch, when logged, then rationale is stored for audit trail

### Feature: Export Bundle
- [ ] Given an approved spec, when user exports, then bundle contains PRD.md, SPEC.md, TASKS.md, agent_spec.json
- [ ] Given identical document version and template version, when exported twice, then output is byte-identical (SHA256 match)
- [ ] Given export includes completed planning stages, then DESIGN_SYSTEM.md and SECURITY.md are included
- [ ] Given export is triggered, when generation completes, then user receives download link within 5 seconds

### Feature: Version History
- [ ] Given a document with 10 edits, when user views history, then all 10 versions are listed with timestamps and authors
- [ ] Given a user selects a past version, when they restore it, then document reverts and new version is created
- [ ] Given a patch is accepted, when applied, then a snapshot is created automatically

### Feature: Comments & Clarifications
- [ ] Given a user selects text, when they add a comment, then it anchors to the block ID
- [ ] Given a comment thread exists, when another user replies, then all participants are notified
- [ ] Given an ambiguous section, when AI detects it, then a clarification question is generated

## Correctness Properties

### Property 1: CRDT Convergence
**Invariant**: All connected clients converge to identical document state after quiescence (no new edits for 1 second)

**Test Strategy**: 
- Generate random edit sequences (insert, delete, replace) from 2-5 concurrent clients
- Apply edits with random network delays (0-500ms)
- Wait for quiescence
- Verify all clients have identical Yjs doc state (byte-level comparison)

### Property 2: Patch Idempotency
**Invariant**: Applying the same accepted patch twice produces identical result as applying once

**Test Strategy**:
- Generate patch proposals (insert, replace, delete)
- Accept and apply patch
- Record document version and block fingerprints
- Apply same patch again
- Verify document version unchanged and fingerprints match

### Property 3: Export Determinism
**Invariant**: Exporting the same document version with same template version produces byte-identical output

**Test Strategy**:
- Create document with mixed content (headings, lists, code blocks)
- Export 100 times
- Compute SHA256 hash of each export
- Verify all hashes match

### Property 4: Attribution Completeness
**Invariant**: Every block has exactly one author (human or AI) and a valid timestamp

**Test Strategy**:
- Generate documents with mixed authorship (human edits, AI patches, imports)
- Query all blocks
- Verify each block has non-null authorType, authorId, timestamp
- Verify timestamps are monotonically increasing within document

### Property 5: Stale Patch Rejection
**Invariant**: Patches with mismatched base_version or target_fingerprint are rejected with specific error code

**Test Strategy**:
- Create patch proposal for block X at version N
- Modify block X (version becomes N+1, fingerprint changes)
- Attempt to apply original patch
- Verify rejection with error code PATCH_STALE
- Verify document unchanged

## Non-Functional Requirements

### Performance
- P95 collaborative update latency < 250ms (same region)
- P99 collaborative update latency < 500ms (same region)
- Export generation < 2s for documents up to 10k blocks
- Patch proposal generation < 5s for sections up to 500 words
- Document load time < 1s for documents up to 5k blocks

### Security
- All API endpoints require authentication except /auth/register, /auth/login, /auth/callback
- Workspace-scoped authorization: users can only access documents in their workspaces
- Role-based permissions: Owner (full control), Editor (edit + review), Agent (propose only), Viewer (read + comment)
- GitHub OAuth for pilot mode
- Local dev bypass (email-only, no password) for MVP testing
- JWT tokens expire after 1 hour, refresh tokens after 7 days
- Room tokens for collab server expire after 1 hour

### Reliability
- No document loss on reconnect (Yjs state persisted to Postgres)
- Snapshot restore succeeds for any accepted patch decision
- Patch decision auditability: all accept/reject actions logged with actor and timestamp
- Collab server reconnect within 30 seconds on network failure
- Database backups every 6 hours (pilot), every 1 hour (production)

### Scalability
- Support 10 concurrent users per document (MVP)
- Support 100 concurrent users per document (Phase 2)
- Support 1000 documents per workspace (MVP)
- Support 10k documents per workspace (Phase 2)

