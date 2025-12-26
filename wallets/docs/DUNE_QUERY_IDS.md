# Finding Dune Query IDs

**Dashboard:** https://dune.com/obchakevich/crypto-cards-all-chains  
**Last Updated:** January 2025

---

## Overview

To fetch data from Dune Analytics, we need the query IDs from the dashboard. This document explains how to find them.

---

## Method 1: Browser DevTools (Recommended)

### Steps

1. **Open the dashboard**
   - Visit: https://dune.com/obchakevich/crypto-cards-all-chains
   - Wait for the page to fully load

2. **Open DevTools**
   - Press `F12` or `Ctrl+Shift+I` (Windows/Linux)
   - Or `Cmd+Option+I` (Mac)

3. **Go to Network Tab**
   - Click on the "Network" tab
   - Filter by "Fetch/XHR" or "All"

4. **Look for API Calls**
   - Look for requests to `api.dune.com`
   - Common patterns:
     - `/api/v1/query/{query-id}/execute`
     - `/api/v1/execution/{execution-id}/results`
     - `/api/v1/dashboard/{dashboard-id}/queries`

5. **Extract Query IDs**
   - Query IDs are numeric (e.g., `3000000`, `3000001`)
   - Dashboard IDs are also numeric
   - Copy the IDs you find

### Example URLs to Look For

```
https://api.dune.com/api/v1/query/3000000/execute
https://api.dune.com/api/v1/dashboard/12345/queries
```

---

## Method 2: Page Source Inspection

1. **View Page Source**
   - Right-click → "View Page Source"
   - Or `Ctrl+U` / `Cmd+U`

2. **Search for Query IDs**
   - Press `Ctrl+F` / `Cmd+F`
   - Search for: `query`, `queryId`, `dashboard`, `dashboardId`
   - Look for numeric IDs near these terms

3. **Check JavaScript Variables**
   - Look in `<script>` tags
   - Search for patterns like:
     - `queryId: 3000000`
     - `"queryId": 3000000`
     - `dashboardId: 12345`

---

## Method 3: Using Our Scripts

Once you have query IDs, use our fetch script:

```bash
cd wallets
node scripts/fetch-crypto-cards-data.js 3000000 3000001
```

This will:
1. Execute each query
2. Wait for completion
3. Fetch results
4. Transform data
5. Save to `.cursor/artifacts/dune-crypto-cards-data.json`

---

## Method 4: Contact Dashboard Owner

If the above methods don't work:

1. **Contact the dashboard creator**
   - Username: `obchakevich`
   - Ask for query IDs or dashboard ID

2. **Check Dashboard Description**
   - Sometimes creators list query IDs in the description
   - Or provide links to individual queries

---

## Known Query IDs

*Add query IDs here once discovered:*

- Query 1: `???` (Main crypto cards data)
- Query 2: `???` (Chain-specific data)
- Query 3: `???` (Usage metrics)

---

## Testing Query IDs

To test if a query ID works:

```bash
DUNE_API_KEY=your-key node scripts/fetch-crypto-cards-data.js 3000000
```

If successful, you'll see:
- Query execution started
- Query completed
- Results with column names and row counts

---

## Next Steps

Once you have query IDs:

1. **Add them to this document** (above)
2. **Run the fetch script** to get data
3. **Inspect the data structure** in `.cursor/artifacts/dune-crypto-cards-data.json`
4. **Update the transformation logic** if needed (in `fetch-crypto-cards-data.js`)
5. **Integrate with frontend** (Phase 3 tasks)

---

*Update this document as you discover query IDs.*
