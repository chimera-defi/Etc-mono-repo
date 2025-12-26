# Dune Analytics API Documentation

**Last Updated:** January 2025  
**Status:** Research in Progress

---

## API Access Investigation

### Attempted Endpoints

1. **`https://dune.com/api/docs`**
   - Status: ❌ Blocked by Cloudflare
   - Response: Cloudflare challenge page

2. **`https://api.dune.com/api/docs`**
   - Status: ❌ Not found
   - Response: `{"error":"URL not found"}`

3. **`https://docs.dune.com/api-reference`**
   - Status: ✅ Accessible (documentation site)
   - Note: This is documentation, not API endpoint

### Official Documentation

Dune Analytics has API documentation at: `https://docs.dune.com/api-reference`

**Key Findings:**
- Dune Analytics provides a REST API
- API requires authentication via API key
- Base URL: `https://api.dune.com/api/v1`
- API keys can be generated from Dune dashboard settings

### API Endpoints (From Documentation)

#### Authentication
- API key required in headers: `X-Dune-API-Key: <your-api-key>`

#### Query Execution
- **Execute Query:** `POST /query/{query_id}/execute`
- **Get Query Results:** `GET /query/{query_id}/results`
- **Get Query Status:** `GET /execution/{execution_id}/status`

#### Dashboard
- **Get Dashboard:** `GET /dashboard/{dashboard_id}`
- **Get Dashboard Queries:** `GET /dashboard/{dashboard_id}/queries`

### Dashboard Information

**Target Dashboard:** `https://dune.com/obchakevich/crypto-cards-all-chains`

**Extracted Information:**
- Username: `obchakevich`
- Dashboard slug: `crypto-cards-all-chains`

**Note:** To get the dashboard ID and query IDs, we need to:
1. Access the dashboard (blocked by Cloudflare)
2. Or use the API with authentication
3. Or manually inspect the dashboard URL structure

### API Key Setup

To use the Dune API:

1. **Create Dune Account** (if needed)
   - Sign up at https://dune.com
   - Free tier available

2. **Generate API Key**
   - Go to Settings → API Keys
   - Create new API key
   - Copy the key (shown only once)

3. **Set Environment Variable**
   ```bash
   export DUNE_API_KEY=your-api-key-here
   ```

### Rate Limits

- **Free Tier:** Limited requests per day
- **Paid Tiers:** Higher rate limits
- Check current limits in API documentation

### Next Steps

1. ✅ Document API structure (this file)
2. ⏳ Get API key (requires manual setup)
3. ⏳ Test API access with authentication
4. ⏳ Extract dashboard ID and query IDs
5. ⏳ Fetch query results
6. ⏳ Map data to frontend format

---

## Alternative Approaches

### Option 1: Use Official API (Recommended)
- **Pros:** Reliable, official, structured data
- **Cons:** Requires API key, may have rate limits
- **Status:** ✅ Available, needs API key

### Option 2: Browser Automation (Current Attempt)
- **Pros:** No API key needed
- **Cons:** Blocked by Cloudflare, unreliable
- **Status:** ❌ Blocked

### Option 3: Manual Data Export
- **Pros:** No technical barriers
- **Cons:** Not scalable, manual updates needed
- **Status:** ⚠️ Fallback option

### Option 4: Web Scraping with Better Headers
- **Pros:** Might bypass Cloudflare
- **Cons:** Fragile, may break, against ToS
- **Status:** ⏳ Not attempted yet

---

## Implementation Plan

### Phase 1: API Setup
1. Create Dune account (if needed)
2. Generate API key
3. Add to environment variables
4. Test API connectivity

### Phase 2: Dashboard Discovery
1. Use API to find dashboard by username/slug
2. Extract dashboard ID
3. Get list of queries in dashboard
4. Identify query IDs for crypto cards data

### Phase 3: Data Fetching
1. Execute queries via API
2. Poll for results
3. Parse response data
4. Transform to frontend format

### Phase 4: Integration
1. Create data fetcher module
2. Add caching layer
3. Integrate with frontend
4. Handle errors gracefully

---

## References

- **Dune API Docs:** https://docs.dune.com/api-reference
- **Dune Dashboard:** https://dune.com/obchakevich/crypto-cards-all-chains
- **API Base URL:** `https://api.dune.com/api/v1`

---

*This document will be updated as we progress with API integration.*
