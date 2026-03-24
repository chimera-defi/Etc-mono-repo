# SpecForge Implementation Tasks

## Phase 1: Foundation (Weeks 1-2)

- [ ] 1.1 Setup monorepo structure
  - Done: `web/`, `collab-server/`, `cli/` packages exist, bun workspaces configured, all packages install successfully
  - Property: N/A (infrastructure)

- [ ] 1.2 Setup Postgres schema
  - Done: Documents, Blocks, PatchProposals, Snapshots, Users, Workspaces, WorkspaceMembers tables created, migrations run without errors
  - Property: N/A (infrastructure)

- [ ] 1.3 Implement local auth bypass
  - Done: User can create session with email only, JWT issued and validated, session persists across page reloads
  - Property: N/A (pilot-only feature)

- [ ] 1.4 Setup GitHub OAuth (pilot)
  - Done: User can sign in with GitHub, profile fetched, session created, JWT issued
  - Property: N/A (pilot-only feature)

- [ ] 1.5 Implement workspace CRUD
  - Done: User can create workspace, list workspaces, add/remove members, delete workspace
  - Property: N/A (CRUD)

## Phase 2: Core Editing (Weeks 3-4)

- [ ] 2.1 Implement Tiptap editor
  - Done: Markdown editor renders, basic formatting works (bold, italic, headings, lists, code blocks)
  - Property: N/A (UI)

- [ ] 2.2 Integrate Yjs CRDT
  - Done: Two clients in same document see each other's edits in <250ms (P95), no data loss on concurrent edits
  - Property: Property 1 (CRDT convergence)

- [ ] 2.3 Setup Hocuspocus server
  - Done: Collab server runs on port 1234, clients connect via room tokens, Yjs doc persists to Postgres
  - Property: N/A (infrastructure)

- [ ] 2.4 Implement presence indicators
  - Done: Users see each other's cursors and names, presence updates in <500ms
  - Property: N/A (UI)

- [ ] 2.5 Implement document CRUD
  - Done: User can create document, load document, update title, delete document
  - Property: N/A (CRUD)

## Phase 3: Patch Workflow (Weeks 5-6)

- [ ] 3.1 Implement block index extraction
  - Done: Yjs doc converts to block array, each block has id/type/content/fingerprint/author/timestamp
  - Property: Property 4 (attribution completeness)

- [ ] 3.2 Implement patch proposal API
  - Done: AI can submit patch (insert/replace/delete), patch stored with status=pending
  - Property: Property 4 (attribution completeness)

- [ ] 3.3 Implement stale patch detection
  - Done: Patches with mismatched base_version or target_fingerprint are rejected with error code PATCH_STALE
  - Property: Property 5 (stale patch rejection)

- [ ] 3.4 Implement patch review UI
  - Done: User sees pending patches, can view diff, can accept/reject/cherry-pick
  - Property: N/A (UI)

- [ ] 3.5 Implement patch application
  - Done: Accepted patches update Yjs doc, rejected patches logged, snapshots created on accept
  - Property: Property 2 (patch idempotency)

- [ ] 3.6 Implement audit trail
  - Done: All patch decisions logged with actor/timestamp/decision, queryable via API
  - Property: N/A (audit)

## Phase 4: Export (Week 7)

- [ ] 4.1 Implement markdown export
  - Done: Documents export to PRD.md, SPEC.md, TASKS.md with correct section extraction
  - Property: Property 3 (export determinism)

- [ ] 4.2 Implement JSON export
  - Done: agent_spec.json includes all metadata (blocks, authors, timestamps, version)
  - Property: Property 3 (export determinism)

- [ ] 4.3 Implement export bundle API
  - Done: POST /api/documents/:id/export returns all files, generation completes in <2s for 10k blocks
  - Property: Property 3 (export determinism)

- [ ] 4.4 Implement ZIP download
  - Done: User can download export bundle as .zip file
  - Property: N/A (UI)

## Phase 5: Version History (Week 8)

- [ ] 5.1 Implement snapshot creation
  - Done: Snapshots created on patch accept, manual save, milestone; stored with reason/actor/timestamp
  - Property: N/A (versioning)

- [ ] 5.2 Implement version list API
  - Done: GET /api/documents/:id/versions returns all snapshots with metadata
  - Property: N/A (versioning)

- [ ] 5.3 Implement version restore
  - Done: User can restore past version, new snapshot created, document version increments
  - Property: N/A (versioning)

## Phase 6: Comments & Clarifications (Week 9)

- [ ] 6.1 Implement comment threads
  - Done: User can add comment anchored to block, replies work, participants notified
  - Property: N/A (collaboration)

- [ ] 6.2 Implement clarification detection
  - Done: AI detects ambiguous sections, generates clarifying questions
  - Property: N/A (AI assist)

- [ ] 6.3 Implement clarification resolution
  - Done: User answers clarification, answer written back to doc, decision logged
  - Property: N/A (AI assist)

## Phase 7: Property-Based Testing (Week 10)

- [ ] 7.1 PBT: CRDT Convergence
  - Done: Test suite generates random edit sequences from 2-5 clients, verifies convergence after quiescence, 100 test cases pass
  - Property: Property 1

- [ ] 7.2 PBT: Patch Idempotency
  - Done: Test suite applies patches twice, verifies document state unchanged, 100 test cases pass
  - Property: Property 2

- [ ] 7.3 PBT: Export Determinism
  - Done: Test suite exports same document 100 times, verifies SHA256 hashes match, all test cases pass
  - Property: Property 3

- [ ] 7.4 PBT: Attribution Completeness
  - Done: Test suite generates documents with mixed authorship, verifies all blocks have valid attribution, 100 test cases pass
  - Property: Property 4

- [ ] 7.5 PBT: Stale Patch Rejection
  - Done: Test suite creates stale patches, verifies rejection with correct error code, 100 test cases pass
  - Property: Property 5

## Phase 8: Integration Testing (Week 11)

- [ ] 8.1 E2E: Multiplayer editing flow
  - Done: Two users can edit same document concurrently, see each other's changes, no data loss
  - Property: Property 1 (CRDT convergence)

- [ ] 8.2 E2E: Patch proposal flow
  - Done: AI proposes patch, human reviews, accepts, patch applied, attribution recorded
  - Property: Property 2, 4, 5

- [ ] 8.3 E2E: Export flow
  - Done: User creates document, exports bundle, downloads ZIP, files are valid markdown
  - Property: Property 3

- [ ] 8.4 E2E: Version restore flow
  - Done: User edits document, restores past version, document reverts correctly
  - Property: N/A (integration)

## Phase 9: Performance Testing (Week 12)

- [ ] 9.1 Load test: Collaborative editing
  - Done: 10 concurrent users per document, P95 latency <250ms, no errors
  - Property: N/A (performance)

- [ ] 9.2 Load test: Patch proposals
  - Done: 100 patches submitted concurrently, all processed within 5s, no errors
  - Property: N/A (performance)

- [ ] 9.3 Load test: Export generation
  - Done: Export 10k block document, completes in <2s, output is valid
  - Property: Property 3

## Phase 10: Deployment (Week 13)

- [ ] 10.1 Deploy web app to Vercel
  - Done: App accessible at specforge.dev, health check passes, GitHub OAuth works
  - Property: N/A (deployment)

- [ ] 10.2 Deploy collab server to Railway
  - Done: Collab server accessible, room tokens validated, Yjs sync works
  - Property: N/A (deployment)

- [ ] 10.3 Setup monitoring
  - Done: Vercel Analytics configured, Sentry error tracking active, alerts configured
  - Property: N/A (ops)

- [ ] 10.4 Setup backups
  - Done: Postgres backups every 6 hours, restore tested successfully
  - Property: N/A (ops)

## Phase 11: Documentation (Week 14)

- [ ] 11.1 Write user guide
  - Done: Guide covers account creation, document creation, editing, patch review, export
  - Property: N/A (docs)

- [ ] 11.2 Write API documentation
  - Done: All endpoints documented with request/response schemas, error codes
  - Property: N/A (docs)

- [ ] 11.3 Write deployment guide
  - Done: Guide covers local setup, Vercel deployment, Railway deployment, env vars
  - Property: N/A (docs)

## Phase 12: Launch Prep (Week 15-16)

- [ ] 12.1 Security audit
  - Done: OWASP Top 10 checked, no critical vulnerabilities, auth flows reviewed
  - Property: N/A (security)

- [ ] 12.2 Performance optimization
  - Done: All NFRs met (latency, throughput, export time)
  - Property: N/A (performance)

- [ ] 12.3 Bug bash
  - Done: Team tests all flows, bugs triaged, P0/P1 bugs fixed
  - Property: N/A (QA)

- [ ] 12.4 Launch checklist
  - Done: All tests pass, docs complete, monitoring active, backups tested
  - Property: All properties

