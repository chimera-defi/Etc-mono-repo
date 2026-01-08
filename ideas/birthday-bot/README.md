# Birthday Bot

**Status**: Research Phase | **Last Updated**: Jan 8, 2026
**Agent**: Claude Haiku 4.5 | **Attribution**: See [ATTRIBUTION.md](./ATTRIBUTION.md)

## Problem Statement

People frequently forget their friends' and family members' birthdays. While many social networks and calendar apps exist, they suffer from fragmentation:

- Birthday data scattered across Facebook, Instagram, Google Contacts, phone contacts, and calendars
- Manual entry for birthdays not on social platforms
- Limited ability to prioritize who you care about most
- Inconsistent notification mechanisms across platforms
- No unified interface for viewing, searching, and managing all birthdays

Current solutions lack a way to aggregate birthdays from multiple sources, spotlight the ones that matter most, and provide reliable, customizable notifications across devices.

## Solution Concept

**Birthday Bot** is a unified birthday management app that:

1. **Aggregates** birthdays from multiple sources:
   - Social media (Facebook, Instagram)
   - Google Contacts / Phone Contacts
   - Manually added friends
   - Calendar syncs

2. **Deduplicates & Merges** birthday data across sources, showing conflicts for manual resolution

3. **Prioritization** allows users to:
   - Mark friends as "Important" or "Close"
   - Create custom groups (Family, Best Friends, Coworkers, etc.)
   - Set different notification levels per group

4. **Notifications & Reminders**:
   - Push notifications (configurable: 1 week, 3 days, 1 day before)
   - Calendar integration (Google Calendar, Apple Calendar, Outlook)
   - SMS notifications (optional, paid feature)
   - Email summaries (weekly/monthly)

5. **Discovery & Social Features**:
   - Search birthdays by name or date range
   - "Today's Birthdays" view
   - Upcoming birthday timeline
   - Quick action buttons for greeting suggestions (message templates, gift recommendations)

6. **Multi-Platform**:
   - iOS and Android apps (primary)
   - Web dashboard for management
   - Optional: integrations with messaging apps (WhatsApp, Telegram, Messenger)

## Competitive Landscape

### Existing Solutions

Several birthday reminder apps already exist:

| App | Key Features | Limitations |
|-----|-------------|------------|
| [Birday](https://f-droid.org/packages/com.minar.birday/) | Open source, import from contacts/calendar, stats | Limited social media integration |
| [Birthday Sweet](https://apps.apple.com/us/app/birthday-sweet-birthday-calendar-reminder-for-facebook/id367346406) | Facebook import, greeting cards, iOS-focused | Primarily Facebook-dependent |
| [Hip](https://www.hip.app/) | Social calendar, countdown features | Limited aggregation from multiple sources |
| [Export Facebook Birthdays](https://chromewebstore.google.com/detail/export-facebook-birthdays/) | Quick Chrome export | Browser extension only, one-time export |
| [Birthdays.app](https://birthdays.app/) | Text-based, Google Calendar sync | Manual entry focused |

### Market Gaps

- **Limited multi-source aggregation**: Most apps focus on one platform (Facebook-centric)
- **Poor prioritization**: No way to signal which birthdays matter most
- **Notification fragmentation**: Users still manage reminders across multiple apps
- **Social media API restrictions**: Instagram and newer Facebook restrictions make automatic import harder
- **No monetization**: Existing free apps lack premium features or sustainable models

### Opportunity

Birthday Bot can differentiate by:
- **Smarter aggregation**: Cloud sync across devices, conflict resolution, duplicate detection
- **AI-powered features**: Suggest gift ideas, recommend greeting templates, identify forgotten connections
- **Flexible integrations**: Works with whatever sources users have, not dependent on one platform
- **Premium tier**: SMS notifications, calendar embedding, gift tracking, greeting card sending

## Technical Feasibility & Challenges

### Feasible Elements ✓

1. **Contact & Calendar Sync**
   - Built-in phone contact access (iOS/Android native)
   - Google Calendar API (well-documented, proven)
   - Apple Calendar access (native frameworks)

2. **Push Notifications**
   - Standard iOS/Android capabilities
   - Native SDKs for both platforms

3. **Web Dashboard**
   - Standard web app architecture (React, Vue, etc.)
   - Cloud backend (Node.js, Python, Go)
   - Database (PostgreSQL, Firebase)

4. **Social Media Import (Partial)**
   - Facebook: Requires user authentication via OAuth, but API limitations exist
   - Instagram: Direct birthday data import is **not possible** via official API
   - Workaround: Browser extension to capture visible data, or user manual entry

### Challenging Elements ⚠️

1. **Social Media API Restrictions**
   - **Instagram** has no official API endpoint for birthdays from followers
   - **Facebook** restricts third-party apps from accessing friends' data for privacy reasons
   - Workaround: Browser extension or manual entry only

2. **Cross-Platform Consistency**
   - Keeping data synced across iOS, Android, web
   - Handling offline scenarios

3. **Data Privacy & Compliance**
   - GDPR compliance (EU users)
   - CCPA (US users)
   - COPPA (minors)
   - Privacy shield agreements

4. **Monetization Challenges**
   - Saturated market of free alternatives
   - Requires premium features to sustain development
   - SMS/notification costs add up

### Risk: Market Saturation

The birthday reminder market is mature but fragmented. Success requires:
- Superior UX/design
- Strong feature differentiation (not just aggregation)
- Network effects (sharing groups, coordinated gifting)
- Premium feature monetization

## MVP Specification

### Phase 1: Core MVP (6-8 weeks)

**Platform**: iOS + Android native apps + web dashboard

**Core Features**:
1. Manual birthday entry (name, date, photo, notes)
2. Phone contact import (iOS Contacts, Android Contacts)
3. Google Calendar import/export
4. Push notifications (configurable: 1 day, 3 days, 1 week before)
5. Birthday timeline view
6. Search & filter
7. Custom groups/tags
8. "Mark as favorite" / prioritization
9. Basic dashboard (add/edit/delete birthdays)

**Backend Stack**:
- Database: PostgreSQL
- API: Node.js/Express or Python/Django
- Auth: OAuth (Google, Apple Sign-In)
- Cloud: AWS, GCP, or Azure

**Mobile Stack**:
- iOS: SwiftUI with native Contacts and Calendar frameworks
- Android: Kotlin with Jetpack Compose

**Data Model**:
```
users
  - id, email, password_hash, created_at, updated_at

birthdays
  - id, user_id, name, date_of_birth, notes, photo_url, created_at, updated_at

birthday_groups
  - id, user_id, name (e.g., "Family", "Close Friends")

birthday_group_members
  - id, group_id, birthday_id

notifications
  - id, user_id, birthday_id, notification_type (push/email), send_at
```

**Timeline**:
- Weeks 1-2: Setup, auth, database schema
- Weeks 3-4: Contact import, core UI
- Weeks 5-6: Notifications, calendar sync
- Weeks 7-8: Testing, bug fixes, AppStore prep

### Phase 2: Social Media Integration (Post-MVP)

If Phase 1 succeeds, add:
- Facebook OAuth login + limited birthday fetch (if possible)
- Browser extension for Instagram birthday scraping
- WhatsApp/Messenger integration for quick greetings

### Phase 3: Premium Features (Later)

- SMS reminders
- Gift tracking & wishlists
- AI-powered greeting templates
- Calendar embedding
- Team/family sharing

## Documentation

- **[Research Summary](./RESEARCH_SUMMARY.md)** - Executive summary with key findings and recommendations
- **[API Feasibility Analysis](./01-research/API_FEASIBILITY.md)** - Detailed analysis of each data source (Google, Facebook, Instagram, etc.)
- **[Market Analysis](./01-research/MARKET_ANALYSIS.md)** - Competitive landscape, market size, revenue potential, and go-to-market strategy
- **[Technical Specification](./02-spec/TECHNICAL_SPEC.md)** - MVP tech stack, database schema, API endpoints, deployment strategy
- **[Backend Architecture](./02-spec/ARCHITECTURE.md)** - Privacy-first system design, multi-tenant data isolation, browser automation strategy, message parsing approach, detailed data flows

## Next Steps

1. **Validate demand**: Survey 20-30 people about birthday management pain points
2. **Prototype**: Build a quick web prototype to test UX
3. **Nail the API strategy**: Determine exact approach for social media data (OAuth, browser extension, manual)
4. **Decide on monetization**: Freemium model, ads, subscriptions, or one-time purchase?
5. **Tech stack decision**: Choose native vs. React Native vs. Flutter for mobile

## Research Sources

- [Birday - Open Source Birthday Manager](https://f-droid.org/packages/com.minar.birday/)
- [Birthday Sweet - App Store](https://apps.apple.com/us/app/birthday-sweet-birthday-calendar-reminder-for-facebook/id367346406)
- [Instagram API Limitations 2026](https://tagembed.com/blog/instagram-api/)
- [Facebook API Access Restrictions](https://api7.ai/learning-center/api-101/social-media-apis)
- [Best Birthday Reminder Apps Comparison](https://lovetrackapp.com/articles/birthday-reminder-apps/)
- [Instagram Graph API Developer Guide](https://elfsight.com/blog/instagram-graph-api-complete-developer-guide-for-2025/)

---

## Decision Log

**Jan 8, 2026**:
- Initiated research on birthday bot concept
- Confirmed existing competitors (Birday, Birthday Sweet, Hip)
- Identified API limitations with Instagram (no official birthday endpoint)
- Determined MVP is feasible with 6-8 week timeline
- Recommended focus on multi-source aggregation as key differentiator
- Next: Validate market demand with user interviews
