## Orbit Pilot PRD

**Status:** Living product doc (V1 CLI shipped in `apps/orbit-pilot/`; see [`V1_SHIPPED.md`](./V1_SHIPPED.md)) | **Last Updated:** 2026-03-24

### Problem
Launching across many websites is operationally fragmented:
1. the same product facts are re-entered manually,
2. content becomes repetitive or inconsistent,
3. links are not tagged consistently,
4. there is no durable status tracker,
5. teams misuse browser automation because they lack safer defaults.

### Product Thesis
Create a launch ops control plane that converts one structured launch payload into:
1. platform-native submission drafts,
2. official API publishes where permitted,
3. manual-ready queues where automation is unclear,
4. explicit high-risk browser fallback only when enabled.

### Core Users
1. founders launching new SaaS products,
2. growth operators doing directory and backlink campaigns,
3. agencies or consultants managing repeated launches,
4. internal product-marketing teams.

### Non-Goals
1. black-hat link spam tooling,
2. CAPTCHA/MFA bypass,
3. unlimited mass-posting automation,
4. fake engagement or account farming.

### MVP Scope
1. Launch profile editor and YAML import.
2. Platform registry with automation mode and risk metadata.
3. Per-platform content and image adaptation.
4. UTM link processor.
5. Duplicate detection and cooldowns.
6. Manual queue and audit logging.
7. Official API support for a small initial set.

### Initial Official-API Candidates
1. Medium with existing integration token only.
2. GitHub releases/discussions.
3. LinkedIn member posting where valid scopes exist.
4. Forem / DEV.
5. X, if the user already has approved access.

### Manual-First Candidates
1. Crunchbase.
2. Product Hunt unless approved automation path is confirmed.
3. Hacker News.
4. Tiny Startups.
5. TrustMRR.
6. any niche directory with unclear write support.

### Primary Success Metrics
1. median time saved per launch campaign,
2. completion rate of target-site submissions,
3. percentage of links correctly tagged,
4. duplicate-submission avoidance rate,
5. percentage of platforms handled without policy incidents.

### GTM
1. launch operators and indie hackers first,
2. "launch once, distribute safely" positioning,
3. content around directory submission ops and launch checklists,
4. case studies using real launch packs.

### Kill Criteria
1. platform churn makes maintenance unworkable,
2. users primarily demand out-of-bounds automation,
3. launch teams do not value structured registry and audit features,
4. the product becomes a brittle browser-bot maintenance project.
