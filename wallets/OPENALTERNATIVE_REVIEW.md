# OpenAlternative Review - Wallet Radar Improvement Notes

Date: February 3, 2026

This document summarizes patterns worth adapting from directory-style sites like OpenAlternative and maps them to Wallet Radar improvements across design, functionality, SEO, and monetization.

## Patterns to Adapt

1. **Search-first discovery**
   - Prominent search above the fold.
   - Quick search chips for popular queries.

2. **Category-led navigation**
   - Clear entry points for each category.
   - Fast hops to common comparisons.

3. **Directory-style trust signals**
   - Clear data sources.
   - Updated timestamps and changelog visibility.

4. **Community contributions**
   - Simple paths to submit entries and corrections.
   - Transparent contribution flow.

5. **Monetization with transparency**
   - Sponsorship and data licensing with clear disclosure.
   - Affiliate links allowed with disclosure; no pay-to-win ranking.

## Improvements Implemented (This Update)

- Added a homepage search module that routes directly to the Explore page.
- Added popular search chips for quick discovery.
- Added Explore URL query handling to pre-fill search and category.
- Added Explore URL filter support (features, custody, open source, etc.) for curated collections.
- Added curated collections section with intent-based entry points.
- Added a latest updates section combining docs + articles by recency.
- Added a "Submit" CTA in the navigation.
- Added a Sponsorship & Data Licensing document and footer link.
- Added a homepage sponsorship callout with data partner chips.
- Added a featured directory grid with top wallets and key metrics.
- Added Community & Support section to drive submissions and requests.
- Added SearchAction schema for better SEO discovery.

## Suggested Next Steps

1. **Collections and landing pages**
   - Build "MetaMask alternatives", "Best hardware wallets", etc.

2. **Featured comparisons**
   - Highlight top 3 comparisons on the homepage.

3. **Scannable card layout**
   - Add light card summaries on Explore (scores, license, platforms).

4. **Newsletter or updates**
   - Optional email list for change alerts and releases.

5. **Data API**
   - Public API endpoints for the top-level wallet tables.

