# Launchpad Architecture Diagrams (Human-Friendly)

**Last Updated**: Feb 8, 2026

These diagrams explain how **Clawdbot Launchpad** is built and how it works at a high level. They are intentionally **implementation-agnostic**, but map cleanly to the current PRD/SPEC/TASKS.

## If you can’t see the diagrams

Some markdown viewers don’t render Mermaid (` ```mermaid `) and will show only the diagram source code.

- **Best viewer**: GitHub file view usually renders Mermaid automatically.
- **Fallback**: use the ASCII “picture” blocks below (and/or paste the Mermaid blocks into the [Mermaid Live Editor](https://mermaid.live/)).

## 1) System Overview (Control Plane vs Data Plane)

### 1a) ASCII overview (fallback)

```text
                ┌─────────────────────────── Control Plane (SaaS) ───────────────────────────┐
User/Browser →  │  Web/Dashboard → API → DB                                                 │
                │                    │                                                       │
                │                    ├→ Billing (webhooks)                                   │
                │                    ├→ Provisioning Queue → Workers                         │
                │                    └→ Audit Logs                                            │
                └─────────────────────────────────────────────────────────────────────────────┘

                                   Workers drive lifecycle actions

                ┌────────────────────────── Data Plane (Customer Runtime) ───────────────────┐
                │  Orchestrator/VPS Fleet → Tenant Bot Process → Tenant Volume/Storage        │
                │                │                    │                                       │
                │                ├→ Signed Images      ├→ Secrets injection (KMS/Secrets)     │
                │                └→ Logs/Metrics       └→ Egress controls + quotas            │
                └─────────────────────────────────────────────────────────────────────────────┘
```

```mermaid
flowchart LR
  U[User] -->|Browser| WEB[Web App / Dashboard]
  WEB --> API[Control Plane API]
  API --> DB[(Postgres)]
  API --> BILLING[Billing Provider\n(e.g. Stripe)]
  BILLING -->|webhooks| API
  API --> Q[(Provisioning Queue)]
  Q --> W[Provisioning Workers]

  subgraph DataPlane[Data Plane (Customer Runtime)]
    RT[Runtime Orchestrator\n(ECS/K8s/Nomad or VPS fleet)]
    REG[Image Registry\n(signed images)]
    SEC[Secrets Manager / KMS]
    LOG[Logs/Metrics]
    PV[(Persistent Storage\n(volumes/snapshots))]
  end

  W --> RT
  W --> REG
  W --> SEC
  RT --> LOG
  RT --> PV

  API --> LOGA[Audit Logs]
```

**Key idea**:
- **Control plane** is multi-tenant SaaS logic: auth, billing, deployments, config versions, and audit trails.
- **Data plane** is where customer bots run: containers/VPS + storage + secrets injection + observability.

## 2) MVP Runtime Options (Pilot vs Managed MVP vs Phase 2)

### 2a) Pilot (single VPS, fast learning)

```mermaid
flowchart TB
  API[Control Plane API] --> VPS[VPS: Docker + Reverse Proxy]
  VPS --> T1[Tenant Container A + Volume]
  VPS --> T2[Tenant Container B + Volume]
  VPS --> T3[Tenant Container C + Volume]
  VPS --> LOGS[Container Logs + Basic Alerts]
```

**When**: first 10–50 customers or concierge migration cohort.  
**Risk**: single point of failure + weaker multi-tenant isolation.

### 2b) Managed MVP (shared containers)

```mermaid
flowchart TB
  W[Workers] --> ORCH[Orchestrator\n(ECS/Fargate or managed K8s)]
  ORCH --> NS1[Tenant Namespace/Service A]
  ORCH --> NS2[Tenant Namespace/Service B]
  ORCH --> PV1[(Tenant PV A)]
  ORCH --> PV2[(Tenant PV B)]
  ORCH --> OBS[Central Logs/Metrics\n(per-tenant scoped)]
  ORCH --> NET[Network Policies / Egress Controls]
```

**Goal**: good unit economics + automated lifecycle + quotas + better isolation.

### 2c) Phase 2 (dedicated VPS tier)

```mermaid
flowchart TB
  W[Workers] --> VM1[Dedicated VM A<br/>Docker+systemd]
  W --> VM2[Dedicated VM B<br/>Docker+systemd]
  VM1 --> SNAP1[(Encrypted Disk + Snapshots)]
  VM2 --> SNAP2[(Encrypted Disk + Snapshots)]
```

**Goal**: strongest isolation + predictable performance for Team/enterprise tiers.

## 3) Provisioning Sequence (One-click deploy)

### 3a) ASCII provisioning sequence (fallback)

```text
User → Checkout → Billing webhook → Provisioning job queued → Worker allocates runtime/storage
  → secrets stored/encrypted → signed image pulled → bot started w/ config+secrets
  → health checks pass → deployment marked running + LKG set → user sees Ready + test action
```

```mermaid
sequenceDiagram
  participant User
  participant Web as Dashboard
  participant API as Control Plane API
  participant Billing as Billing
  participant Q as Queue
  participant W as Worker
  participant Or as Runtime
  participant Sec as Secrets/KMS
  participant Reg as Registry

  User->>Web: Choose plan + checkout
  Web->>API: Create checkout session
  API->>Billing: Create subscription
  Billing-->>API: Webhook: payment confirmed
  API->>Q: Enqueue provisioning job
  Q->>W: Deliver job
  W->>Or: Allocate tenant runtime + storage
  W->>Sec: Store/encrypt secrets + metadata
  W->>Reg: Pull signed image tag
  W->>Or: Start bot + inject secrets/config
  Or-->>W: Health check OK
  W-->>API: Mark deployment running + set LKG
  API-->>Web: Status=running + endpoint
  Web-->>User: Ready + “send test message”
```

## 4) Deployment State Machine (Lifecycle)

```mermaid
stateDiagram-v2
  [*] --> requested
  requested --> provisioning
  provisioning --> configuring
  configuring --> starting
  starting --> running

  running --> updating
  updating --> running

  running --> failed
  failed --> restarting
  restarting --> running

  running --> suspended
  suspended --> running

  running --> terminated
  terminated --> [*]
```

## 5) Configuration & Upgrade/Rollback (the moat UX)

```mermaid
sequenceDiagram
  participant User
  participant Web
  participant API
  participant W as Worker
  participant Or as Runtime

  User->>Web: Change config / click upgrade
  Web->>API: POST config (new config_version)
  API->>API: Validate + create config_version (pending)
  API->>W: Enqueue rollout job
  W->>Or: Roll out config + (optional) new image tag
  Or-->>W: Health check OK
  W-->>API: Mark config_version active + set LKG

  alt Rollout fails
    Or-->>W: Health check fails
    W-->>API: Mark failed + keep LKG
    User->>Web: Click rollback
    Web->>API: POST rollback to LKG
    API->>W: Enqueue rollback job
    W->>Or: Roll back to LKG
  end
```

## 6) Migration (Concierge + Self-serve)

```mermaid
flowchart LR
  A[Existing Self-hosted Bot] -->|Export config + data| I[Import Pipeline]
  A -->|Concierge access (temporary)| C[Concierge Migration]
  I --> D[Dry-run Deployment]
  C --> D
  D -->|Automated checks pass| CUT[Cutover]
  CUT -->|Keep old host warm| ROLLBACK[Rollback window]
  CUT --> RUN[Launchpad Running + Managed Upgrades]
```

## 7) Security Boundaries (what to keep strict in MVP)

```mermaid
flowchart TB
  subgraph CP[Control Plane]
    API[API]
    DB[(DB)]
    AUD[Audit Logs]
  end

  subgraph DP[Data Plane]
    OR[Runtime]
    TEN[Tenant Bot Process]
    PV[(Tenant Storage)]
  end

  API --> OR
  API --> AUD
  OR --> TEN
  TEN --> PV

  classDef danger fill:#ffd6d6,stroke:#cc0000,color:#000;
  classDef safe fill:#d6ffe6,stroke:#00aa44,color:#000;

  TEN:::danger
  API:::safe

  NOTE["Tenant runtime is hostile by default:\n- signed images only (MVP)\n- egress controls\n- least-privilege secrets injection\n- quotas + isolation"]
  NOTE -.-> TEN
```

## 8) Optional: Daytona for Ephemeral Workspaces (Non-Production)

```mermaid
flowchart LR
  API[Control Plane] --> Q[(Jobs)]
  Q --> W[Worker]
  W --> D[Daytona Workspace\n(ephemeral)]
  D --> A[Artifacts\n(SBOM/test logs)]
  A --> S3[(Object Storage)]
```

**Use cases**: image build/test sandboxes, support reproduction, untrusted plugin validation.  
**Non-goal**: hosting customer bots on Daytona unless a POC proves persistence + ingress + isolation + ops hooks.

