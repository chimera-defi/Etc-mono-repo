# Dune Analytics Integration Task List

**Target Dashboard:** https://dune.com/obchakevich/crypto-cards-all-chains  
**Integration Goal:** Integrate crypto card data from Dune Analytics into the wallet radar frontend  
**Created:** January 2025

---

## Overview

The Dune Analytics dashboard at `https://dune.com/obchakevich/crypto-cards-all-chains` contains comprehensive data about crypto credit/debit cards across multiple blockchain networks. This task list outlines the steps needed to integrate this data into the existing wallet radar frontend.

### Current State

- Frontend already has crypto card comparison functionality (`CRYPTO_CREDIT_CARD_COMPARISON_TABLE.md`)
- Cards are parsed and displayed in the `/explore` page under the "Cards" tab
- Data structure defined in `src/types/wallets.ts` (`CryptoCard` interface)
- Filtering/sorting implemented in `src/lib/wallet-filtering.ts`

### Integration Goals

1. **Fetch data from Dune Analytics** (API or scraping)
2. **Enrich existing card data** with Dune metrics (chain support, transaction volumes, user counts)
3. **Add new data fields** to card comparison (chain-specific data, usage stats)
4. **Display Dune data** in card details and comparison views
5. **Explore linked dashboards** for additional data sources

---

## Phase 1: Research & Data Access

### Task 1.1: Investigate Dune Analytics API Access
**Priority:** P0 (Critical)  
**Estimated Time:** 2-4 hours

**Actions:**
- [ ] Research Dune Analytics API documentation
  - Check if public API exists: `https://dune.com/api/docs`
  - Look for query execution endpoints
  - Check authentication requirements (API keys)
- [ ] Identify the query ID for the dashboard
  - Dashboard URL: `/obchakevich/crypto-cards-all-chains`
  - Extract query ID from dashboard source or network requests
- [ ] Test API access (if available)
  - Create test script: `scripts/test-dune-api.js`
  - Try unauthenticated access first
  - If auth required, document API key setup process
- [ ] Document API endpoints and data structure
  - Create `docs/DUNE_API.md` with findings
  - Include example responses, rate limits, authentication

**Deliverables:**
- `scripts/test-dune-api.js` - API testing script
- `docs/DUNE_API.md` - API documentation
- `.env.example` update with `DUNE_API_KEY` (if needed)

**Notes:**
- Dune Analytics may require authentication for API access
- Consider rate limiting and caching strategies
- Fallback: Browser automation if API unavailable (already attempted, blocked by Cloudflare)

---

### Task 1.2: Extract Dashboard Structure & Data Schema
**Priority:** P0 (Critical)  
**Estimated Time:** 3-5 hours

**Actions:**
- [ ] Manually inspect dashboard (if accessible)
  - Document all visualizations/charts
  - Identify data columns and metrics
  - Note any filters or time ranges
- [ ] Identify linked dashboards/queries
  - Extract all links from dashboard page
  - Document related dashboards for additional data
  - Create list of URLs to explore
- [ ] Map Dune data fields to existing `CryptoCard` interface
  - Current fields: `id`, `name`, `score`, `cardType`, `region`, `cashBack`, `annualFee`, `fxFee`, `rewards`, `provider`, `status`
  - Identify new fields needed: chain support, transaction volumes, user counts, etc.
- [ ] Create data schema document
  - `docs/DUNE_DATA_SCHEMA.md`
  - Map Dune columns → frontend fields
  - Document data types and transformations needed

**Deliverables:**
- `docs/DUNE_DATA_SCHEMA.md` - Data mapping document
- `docs/DUNE_LINKED_DASHBOARDS.md` - List of related dashboards
- Updated `src/types/wallets.ts` with new fields (if needed)

**Notes:**
- Dashboard may have multiple queries/tables
- Some data may be aggregated (daily/weekly/monthly)
- Consider data freshness (how often Dune updates)

---

### Task 1.3: Explore Linked Dashboards
**Priority:** P1 (High)  
**Estimated Time:** 2-3 hours

**Actions:**
- [ ] Extract all links from main dashboard
  - Look for links to other Dune queries/dashboards
  - Check for related crypto card analyses
  - Document chain-specific dashboards
- [ ] Analyze each linked dashboard
  - Document data available
  - Identify integration opportunities
  - Note any overlapping data with main dashboard
- [ ] Prioritize dashboards by value
  - Which provide unique data?
  - Which complement existing card comparison?
  - Which are most up-to-date?
- [ ] Create integration plan for top 3-5 dashboards
  - Add to task list below
  - Document data access method for each

**Deliverables:**
- `docs/DUNE_LINKED_DASHBOARDS.md` - Analysis of linked dashboards
- Updated task list with additional integration tasks

---

## Phase 2: Data Integration

### Task 2.1: Create Dune Data Fetcher Module
**Priority:** P0 (Critical)  
**Estimated Time:** 4-6 hours

**Actions:**
- [ ] Create `src/lib/dune.ts` module
  - API client functions (if API available)
  - Data fetching logic
  - Error handling and retries
  - Rate limiting
- [ ] Implement data fetching function
  ```typescript
  async function fetchCryptoCardsData(): Promise<DuneCardData[]>
  ```
- [ ] Add caching layer
  - Use Next.js cache or file-based cache
  - Cache duration: 1-6 hours (configurable)
  - Cache invalidation strategy
- [ ] Add data transformation
  - Map Dune data → `CryptoCard` format
  - Handle missing/null values
  - Normalize data types
- [ ] Add error handling
  - API failures → fallback to static data
  - Logging for debugging
  - User-friendly error messages

**Deliverables:**
- `src/lib/dune.ts` - Dune API client module
- `src/lib/dune-types.ts` - TypeScript types for Dune responses
- Error handling and logging

**Dependencies:**
- Task 1.1 (API access method)
- Task 1.2 (Data schema)

**Notes:**
- Consider using `node-fetch` or `axios` for HTTP requests
- Implement exponential backoff for retries
- Add request timeout (30-60 seconds)

---

### Task 2.2: Extend CryptoCard Type with Dune Data
**Priority:** P0 (Critical)  
**Estimated Time:** 2-3 hours

**Actions:**
- [ ] Review current `CryptoCard` interface (`src/types/wallets.ts`)
- [ ] Add new optional fields for Dune data:
  ```typescript
  interface CryptoCard {
    // ... existing fields ...
    
    // Dune Analytics data (optional)
    duneData?: {
      // Chain support
      supportedChains?: string[]; // ['ethereum', 'polygon', 'arbitrum', ...]
      chainCount?: number;
      
      // Usage metrics
      totalTransactions?: number;
      totalVolume?: number; // USD
      activeUsers?: number;
      lastUpdated?: string; // ISO date
      
      // Chain-specific data
      chainMetrics?: {
        chain: string;
        transactions: number;
        volume: number;
        users: number;
      }[];
      
      // Time series (if available)
      volumeHistory?: {
        date: string;
        volume: number;
      }[];
    };
    
    // Dune source metadata
    duneSource?: {
      queryId?: string;
      dashboardUrl?: string;
      lastFetched?: string;
    };
  }
  ```
- [ ] Update `parseCryptoCards()` function (`src/lib/wallet-data.ts`)
  - Handle new optional fields
  - Preserve backward compatibility
- [ ] Update TypeScript types in all relevant files
- [ ] Run type checking: `npm run type-check`

**Deliverables:**
- Updated `src/types/wallets.ts`
- Updated `src/lib/wallet-data.ts` parser
- All types passing type check

**Notes:**
- Keep Dune data optional to maintain compatibility with static markdown data
- Consider using discriminated unions if Dune data becomes required

---

### Task 2.3: Create Data Sync Script
**Priority:** P1 (High)  
**Estimated Time:** 3-4 hours

**Actions:**
- [ ] Create `scripts/sync-dune-data.js`
  - Fetch data from Dune Analytics
  - Transform to match existing card data
  - Merge with existing markdown data
  - Update markdown files or create JSON cache
- [ ] Implement merge strategy
  - Dune data takes precedence for metrics
  - Static markdown data for descriptions/details
  - Handle conflicts (e.g., card names don't match)
- [ ] Add data validation
  - Verify card names match existing entries
  - Check data types and ranges
  - Log warnings for mismatches
- [ ] Add CLI options
  ```bash
  node scripts/sync-dune-data.js --dry-run  # Preview changes
  node scripts/sync-dune-data.js --force   # Overwrite existing
  node scripts/sync-dune-data.js --update  # Update only changed
  ```
- [ ] Add to package.json scripts
  ```json
  "sync-dune": "node scripts/sync-dune-data.js"
  ```

**Deliverables:**
- `scripts/sync-dune-data.js` - Data sync script
- `scripts/dune-data-cache.json` - Cached Dune data (gitignored)
- Updated `package.json` scripts

**Dependencies:**
- Task 2.1 (Dune fetcher module)
- Task 2.2 (Extended types)

**Notes:**
- Consider using JSON files for cache instead of updating markdown
- Add data validation to catch errors early
- Create backup before overwriting data

---

## Phase 3: Frontend Integration

### Task 3.1: Add Dune Data Display to Card Details
**Priority:** P1 (High)  
**Estimated Time:** 4-5 hours

**Actions:**
- [ ] Update `WalletCard` component (`src/components/WalletCard.tsx`)
  - Add Dune metrics section (if `duneData` exists)
  - Display chain support count
  - Show transaction volume/user counts
  - Add "View on Dune" link
- [ ] Create `DuneMetricsCard` component
  - Reusable component for displaying Dune data
  - Show chain list, metrics table, charts (if data available)
  - Handle loading/error states
- [ ] Add to card detail view
  - Integrate into `WalletTable` component
  - Show in expanded card view or modal
- [ ] Style Dune data section
  - Match existing design system
  - Use badges for chains
  - Format numbers (commas, currency symbols)
- [ ] Add "Data Source" attribution
  - "Data from Dune Analytics" footer
  - Link to original dashboard

**Deliverables:**
- Updated `WalletCard.tsx` component
- New `DuneMetricsCard.tsx` component
- Styled Dune data display

**Dependencies:**
- Task 2.2 (Extended types)
- Task 2.3 (Data sync)

**Notes:**
- Keep Dune data optional (don't break if unavailable)
- Consider lazy loading Dune data (fetch on expand)

---

### Task 3.2: Add Chain Filtering to Card Comparison
**Priority:** P1 (High)  
**Estimated Time:** 3-4 hours

**Actions:**
- [ ] Update `WalletFilters` component (`src/components/WalletFilters.tsx`)
  - Add "Supported Chains" filter (multi-select)
  - Filter options: Ethereum, Polygon, Arbitrum, Base, Optimism, etc.
  - Show chain count badge on filter
- [ ] Update `wallet-filtering.ts` (`src/lib/wallet-filtering.ts`)
  - Add `supportedChains` filter option
  - Implement filtering logic
  - Handle cards without Dune data (show all or filter out)
- [ ] Update `FilterOptions` interface
  ```typescript
  interface FilterOptions {
    // ... existing ...
    supportedChains?: string[]; // ['ethereum', 'polygon', ...]
  }
  ```
- [ ] Add chain filter to UI
  - Multi-select dropdown or checkboxes
  - Show count of cards per chain
  - Clear/reset functionality

**Deliverables:**
- Updated `WalletFilters.tsx`
- Updated `wallet-filtering.ts`
- Chain filtering UI

**Dependencies:**
- Task 2.2 (Extended types)
- Task 3.1 (Dune data display)

**Notes:**
- Consider showing cards without Dune data separately
- Add "Unknown" option for cards without chain data

---

### Task 3.3: Add Chain Support Column to Card Table
**Priority:** P2 (Medium)  
**Estimated Time:** 2-3 hours

**Actions:**
- [ ] Update `WalletTable` component (`src/components/WalletTable.tsx`)
  - Add "Chains" column to card table view
  - Display chain count or chain list
  - Make sortable by chain count
- [ ] Add chain badges/icons
  - Show chain logos or abbreviations
  - Tooltip with full chain names
  - Limit display (e.g., "5+ chains" if many)
- [ ] Update sorting logic
  - Add `chainCount` to `SortField` type
  - Implement sorting by chain count
- [ ] Add column toggle (if table has column visibility)
  - Allow hiding chain column
  - Save preference in localStorage

**Deliverables:**
- Updated `WalletTable.tsx`
- Chain column with badges
- Sorting by chain count

**Dependencies:**
- Task 3.2 (Chain filtering)

**Notes:**
- Consider responsive design (hide on mobile if too wide)
- Use chain logos from existing icon library or add new ones

---

### Task 3.4: Add Usage Metrics Visualization
**Priority:** P2 (Medium)  
**Estimated Time:** 5-6 hours

**Actions:**
- [ ] Research charting library
  - Consider: Recharts, Chart.js, Victory, or native SVG
  - Check bundle size and Next.js compatibility
  - Prefer lightweight option
- [ ] Create `UsageMetricsChart` component
  - Display transaction volume over time (if time series available)
  - Show chain distribution (pie/bar chart)
  - Display user growth (if available)
- [ ] Add to card detail view
  - Show in expanded card or separate tab
  - Add loading states
  - Handle missing data gracefully
- [ ] Style charts
  - Match design system colors
  - Responsive sizing
  - Accessible (ARIA labels, keyboard navigation)

**Deliverables:**
- `UsageMetricsChart.tsx` component
- Chart visualizations in card details
- Chart library added to dependencies

**Dependencies:**
- Task 3.1 (Dune data display)
- Task 2.2 (Extended types with time series)

**Notes:**
- Only show charts if time series data available
- Consider lazy loading charts (load on scroll/view)
- Keep bundle size small (prefer lightweight chart library)

---

## Phase 4: Additional Data Sources

### Task 4.1: Integrate Chain-Specific Dashboards
**Priority:** P2 (Medium)  
**Estimated Time:** 4-5 hours per dashboard

**Actions:**
- [ ] Identify top 3-5 chain-specific dashboards from Task 1.3
- [ ] For each dashboard:
  - [ ] Extract query ID and data structure
  - [ ] Add to `dune.ts` fetcher module
  - [ ] Map data to card format
  - [ ] Merge with main card data
- [ ] Create dashboard registry
  - `src/lib/dune-dashboards.ts`
  - List of all integrated dashboards
  - Query IDs and data mappings
- [ ] Add dashboard attribution
  - Show source dashboard links
  - Credit original creators

**Deliverables:**
- Updated `dune.ts` with multiple dashboard support
- `dune-dashboards.ts` registry
- Integrated chain-specific data

**Dependencies:**
- Task 1.3 (Linked dashboards analysis)
- Task 2.1 (Dune fetcher module)

**Notes:**
- Prioritize dashboards with unique data
- Consider rate limits when fetching multiple dashboards
- Cache results per dashboard

---

### Task 4.2: Add Real-Time Data Updates (Optional)
**Priority:** P3 (Low)  
**Estimated Time:** 6-8 hours

**Actions:**
- [ ] Research Dune Analytics real-time capabilities
  - Check if API supports WebSocket/SSE
  - Determine update frequency
  - Check rate limits
- [ ] Implement polling mechanism
  - Fetch updates every X minutes (configurable)
  - Use React Query or SWR for caching
  - Show "Last updated" timestamp
- [ ] Add update notifications
  - Toast notification when data refreshes
  - Visual indicator for stale data
  - Manual refresh button
- [ ] Optimize performance
  - Only fetch changed data (if API supports)
  - Debounce rapid updates
  - Background updates (don't block UI)

**Deliverables:**
- Real-time data polling
- Update notifications
- Performance optimizations

**Dependencies:**
- Task 2.1 (Dune fetcher module)
- Task 3.1 (Frontend display)

**Notes:**
- Only implement if Dune API supports frequent updates
- Consider user's data usage (mobile users)
- Add toggle to disable auto-updates

---

## Phase 5: Testing & Validation

### Task 5.1: Add Unit Tests for Dune Integration
**Priority:** P1 (High)  
**Estimated Time:** 3-4 hours

**Actions:**
- [ ] Create test file: `src/lib/__tests__/dune.test.ts`
  - Test data fetching (mock API responses)
  - Test data transformation
  - Test error handling
- [ ] Create test file: `src/lib/__tests__/wallet-filtering-dune.test.ts`
  - Test chain filtering logic
  - Test sorting by chain count
  - Test edge cases (missing data, null values)
- [ ] Add mock data fixtures
  - `__tests__/fixtures/dune-response.json`
  - `__tests__/fixtures/dune-cards.json`
- [ ] Run tests: `npm test`
- [ ] Achieve >80% code coverage for Dune modules

**Deliverables:**
- Test files for Dune integration
- Mock data fixtures
- Passing test suite

**Dependencies:**
- Task 2.1 (Dune fetcher module)
- Task 2.2 (Extended types)
- Task 3.2 (Chain filtering)

---

### Task 5.2: Add Integration Tests
**Priority:** P1 (High)  
**Estimated Time:** 2-3 hours

**Actions:**
- [ ] Update `scripts/smoke-test-wallet-data.js`
  - Add Dune data validation
  - Check for required fields
  - Verify data types
- [ ] Test data sync script
  - Run `sync-dune-data.js` in test mode
  - Verify output format
  - Check for data conflicts
- [ ] Test frontend rendering
  - Verify Dune data displays correctly
  - Check filtering/sorting works
  - Test error states (API failure)
- [ ] Add E2E test (if using Playwright/Cypress)
  - Test card filtering by chain
  - Test Dune metrics display
  - Test "View on Dune" links

**Deliverables:**
- Updated smoke tests
- Integration test suite
- E2E tests (if applicable)

**Dependencies:**
- All Phase 2 & 3 tasks

---

### Task 5.3: Validate Data Accuracy
**Priority:** P1 (High)  
**Estimated Time:** 2-3 hours

**Actions:**
- [ ] Compare Dune data with existing markdown data
  - Card names should match
  - Verify chain counts are reasonable
  - Check for data inconsistencies
- [ ] Manual spot checks
  - Pick 5-10 cards
  - Verify Dune data matches official sources
  - Check transaction volumes are plausible
- [ ] Document data discrepancies
  - Create `docs/DUNE_DATA_VALIDATION.md`
  - Note any cards with mismatched data
  - Document resolution process
- [ ] Add data quality checks to sync script
  - Warn on suspicious values
  - Flag cards with missing data
  - Log validation errors

**Deliverables:**
- Data validation report
- `DUNE_DATA_VALIDATION.md` document
- Data quality checks in sync script

**Dependencies:**
- Task 2.3 (Data sync script)

---

## Phase 6: Documentation & Deployment

### Task 6.1: Update Documentation
**Priority:** P1 (High)  
**Estimated Time:** 2-3 hours

**Actions:**
- [ ] Update `README.md`
  - Add Dune Analytics integration section
  - Document environment variables (`DUNE_API_KEY`)
  - Add data sync instructions
- [ ] Create `docs/DUNE_INTEGRATION.md`
  - Overview of integration
  - How to set up API access
  - How data sync works
  - Troubleshooting guide
- [ ] Update `CONTRIBUTING.md`
  - Document how to add new Dune dashboards
  - Explain data mapping process
- [ ] Add code comments
  - Document Dune API functions
  - Explain data transformation logic
  - Add JSDoc comments

**Deliverables:**
- Updated README
- `DUNE_INTEGRATION.md` guide
- Updated CONTRIBUTING.md
- Code documentation

**Dependencies:**
- All previous tasks

---

### Task 6.2: Add CI/CD Integration
**Priority:** P2 (Medium)  
**Estimated Time:** 2-3 hours

**Actions:**
- [ ] Create GitHub Actions workflow
  - `.github/workflows/sync-dune-data.yml`
  - Run `sync-dune-data.js` on schedule (daily/weekly)
  - Create PR with updated data
  - Add Dune API key to GitHub Secrets
- [ ] Add workflow for manual trigger
  - Allow manual sync via GitHub Actions
  - Add workflow_dispatch trigger
- [ ] Add data validation to CI
  - Run smoke tests in CI
  - Fail build if data validation fails
  - Check for data freshness
- [ ] Document CI setup
  - How to add `DUNE_API_KEY` secret
  - How to trigger manual sync
  - How to review PRs

**Deliverables:**
- GitHub Actions workflow
- CI integration
- Documentation

**Dependencies:**
- Task 2.3 (Data sync script)
- Task 5.2 (Integration tests)

**Notes:**
- Keep API key secure (use GitHub Secrets)
- Consider rate limits when scheduling syncs
- Add notifications for sync failures

---

### Task 6.3: Performance Optimization
**Priority:** P2 (Medium)  
**Estimated Time:** 3-4 hours

**Actions:**
- [ ] Optimize data fetching
  - Implement request batching
  - Add request deduplication
  - Cache aggressively
- [ ] Optimize frontend rendering
  - Lazy load Dune data
  - Virtualize long lists (if needed)
  - Memoize expensive computations
- [ ] Add performance monitoring
  - Measure API response times
  - Track render performance
  - Log slow operations
- [ ] Optimize bundle size
  - Code split Dune components
  - Lazy load chart libraries
  - Remove unused dependencies

**Deliverables:**
- Performance optimizations
- Monitoring/logging
- Bundle size reduction

**Dependencies:**
- All Phase 3 tasks

---

## Summary

### Priority Breakdown

**P0 (Critical - Must Have):**
- Task 1.1: Investigate Dune Analytics API Access
- Task 1.2: Extract Dashboard Structure & Data Schema
- Task 2.1: Create Dune Data Fetcher Module
- Task 2.2: Extend CryptoCard Type with Dune Data
- Task 2.3: Create Data Sync Script

**P1 (High - Should Have):**
- Task 1.3: Explore Linked Dashboards
- Task 3.1: Add Dune Data Display to Card Details
- Task 3.2: Add Chain Filtering to Card Comparison
- Task 5.1: Add Unit Tests
- Task 5.2: Add Integration Tests
- Task 5.3: Validate Data Accuracy
- Task 6.1: Update Documentation

**P2 (Medium - Nice to Have):**
- Task 3.3: Add Chain Support Column to Card Table
- Task 3.4: Add Usage Metrics Visualization
- Task 4.1: Integrate Chain-Specific Dashboards
- Task 6.2: Add CI/CD Integration
- Task 6.3: Performance Optimization

**P3 (Low - Optional):**
- Task 4.2: Add Real-Time Data Updates

### Estimated Total Time

- **P0 Tasks:** 15-22 hours
- **P1 Tasks:** 20-28 hours
- **P2 Tasks:** 16-22 hours
- **P3 Tasks:** 6-8 hours

**Total:** 57-80 hours (approximately 1.5-2 weeks of focused work)

### Key Dependencies

```
Task 1.1 (API Access) → Task 2.1 (Fetcher Module)
Task 1.2 (Data Schema) → Task 2.2 (Extended Types)
Task 2.1 + 2.2 → Task 2.3 (Sync Script)
Task 2.2 + 2.3 → Task 3.1 (Frontend Display)
Task 3.1 → Task 3.2 (Filtering)
Task 3.2 → Task 3.3 (Table Column)
All Tasks → Task 5.x (Testing)
All Tasks → Task 6.1 (Documentation)
```

### Next Steps

1. **Start with Phase 1** - Research Dune API and data structure
2. **Validate feasibility** - Confirm API access before proceeding
3. **Prototype data fetching** - Build minimal fetcher to test approach
4. **Iterate** - Build incrementally, test frequently

---

## Notes & Considerations

### API Access Challenges

- **Cloudflare Protection:** Dune Analytics uses Cloudflare, which blocks automated access
- **Solution Options:**
  1. Use official Dune API (if available)
  2. Use authenticated requests with API key
  3. Manual data export (not scalable)
  4. Browser automation with proper headers (may still fail)

### Data Freshness

- Dune Analytics queries may update on different schedules
- Consider caching strategy (1-6 hours)
- Add "Last updated" timestamps
- Allow manual refresh

### Rate Limiting

- Dune API may have rate limits
- Implement exponential backoff
- Cache aggressively
- Consider batch requests

### Data Quality

- Dune data may have inconsistencies
- Card names may not match exactly
- Some cards may be missing from Dune
- Implement validation and fallback to static data

### User Experience

- Don't break existing functionality if Dune data unavailable
- Show loading states
- Handle errors gracefully
- Provide fallback to static data

---

## Questions to Resolve

1. **Does Dune Analytics have a public API?**
   - If yes, what's the authentication process?
   - If no, what's the best alternative?

2. **What's the exact data structure of the dashboard?**
   - What columns/metrics are available?
   - What's the update frequency?

3. **Are there other related dashboards worth integrating?**
   - Chain-specific analyses?
   - Historical trend data?
   - User behavior metrics?

4. **How should we handle data conflicts?**
   - Dune data vs. static markdown data
   - Which takes precedence?
   - How to merge?

5. **What's the performance impact?**
   - How much data will we fetch?
   - How often will we update?
   - What's the bundle size impact?

---

*Last Updated: January 2025*
