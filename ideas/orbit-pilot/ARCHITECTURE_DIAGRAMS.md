## Orbit Pilot Architecture Diagrams

### 1) Launch Orchestration Overview

```mermaid
flowchart TD
    A[Webhook / CLI / Scheduler Trigger] --> B[Config Loader]
    B --> C[Secure Credential Resolver]
    C --> D[Launch Intake]
    D --> E[Policy + Risk Gate]
    E --> F[Platform Planner]
    F --> G[Content Strategy]
    G --> H[Variation Generator]
    H --> I[UTM Appender]
    H --> J[Image Processor]
    I --> K[Duplicate Detection]
    J --> K
    K --> L[Rate Limit Gate]
    L --> M[Publisher Router]
    M --> N[Official APIs]
    M --> O[Manual Queue]
    M --> P[Browser Fallback Opt-In]
    N --> Q[Audit Log]
    O --> Q
    P --> Q
```

### 2) Submission Mode Decision

```text
platform selected
   -> official write path confirmed?
      -> yes -> official_api
      -> no -> manual
         -> browser fallback enabled + allowlisted + accepted risk?
            -> yes -> browser_fallback_opt_in
            -> no -> stay manual
```

### 3) Data Flow

```text
LaunchProfile + PlatformRecord
   -> SubmissionDraft
      -> Duplicate + Cooldown Checks
         -> SubmissionDecision
            -> Attempt
               -> Result + AuditEvent
```
