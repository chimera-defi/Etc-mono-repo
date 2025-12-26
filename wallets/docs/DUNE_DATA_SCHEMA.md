# Dune Analytics Data Schema

**Dashboard:** https://dune.com/obchakevich/crypto-cards-all-chains  
**Last Updated:** January 2025  
**Status:** Schema definition based on expected data structure

---

## Overview

This document defines the expected data structure from the Dune Analytics crypto cards dashboard and maps it to our frontend `CryptoCard` interface.

---

## Expected Dune Query Structure

Based on the dashboard name "crypto-cards-all-chains", we expect queries that track:

1. **Card Information**
   - Card name/provider
   - Card type (credit/debit/prepaid)
   - Provider information

2. **Chain Support**
   - Which blockchains each card supports
   - Number of chains supported
   - Chain-specific metrics

3. **Usage Metrics**
   - Transaction counts
   - Transaction volumes (USD)
   - Active users
   - Time series data

---

## Data Mapping

### Dune Data → Frontend CryptoCard

| Dune Field | Frontend Field | Type | Notes |
|------------|---------------|------|-------|
| `card_name` | `name` | string | Primary identifier |
| `card_provider` | `provider` | string | Card issuer |
| `card_type` | `cardType` | 'credit'\|'debit'\|'prepaid'\|'business' | Normalized |
| `supported_chains` | `duneData.supportedChains` | string[] | Array of chain names |
| `chain_count` | `duneData.chainCount` | number | Total chains supported |
| `total_transactions` | `duneData.totalTransactions` | number | Lifetime transactions |
| `total_volume_usd` | `duneData.totalVolumeUsd` | number | Lifetime volume |
| `active_users` | `duneData.activeUsers` | number | Current active users |
| `date` + `chain` | `duneData.chainMetrics[]` | object[] | Time series per chain |

---

## Extended CryptoCard Interface

```typescript
interface CryptoCard {
  // Existing fields (from markdown)
  id: string;
  name: string;
  score: number;
  cardType: 'credit' | 'debit' | 'prepaid' | 'business';
  businessSupport: 'yes' | 'no' | 'verify';
  region: string;
  regionCode: string;
  cashBack: string;
  cashBackMax: number | null;
  annualFee: string;
  fxFee: string;
  rewards: string;
  provider: string;
  providerUrl: string | null;
  status: 'active' | 'verify' | 'launching';
  bestFor: string;
  recommendation: 'recommended' | 'situational' | 'avoid';
  type: 'card';
  
  // New Dune Analytics fields (optional)
  duneData?: {
    // Chain support
    supportedChains: string[]; // ['ethereum', 'polygon', 'arbitrum', ...]
    chainCount: number;
    
    // Usage metrics
    totalTransactions: number | null;
    totalVolumeUsd: number | null;
    activeUsers: number | null;
    lastUpdated: string; // ISO date
    
    // Chain-specific data
    chainMetrics: {
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
    queryId: number | null;
    dashboardUrl: string;
    lastFetched: string;
  };
}
```

---

## Chain Name Normalization

Dune may use various chain name formats. We'll normalize them:

| Dune Format | Normalized Format | Examples |
|-------------|-------------------|----------|
| Lowercase | Keep as-is | `ethereum`, `polygon` |
| Mixed case | Lowercase | `Ethereum` → `ethereum` |
| Full names | Standardize | `Ethereum Mainnet` → `ethereum` |
| Abbreviations | Expand | `ETH` → `ethereum` |

**Standard Chain Names:**
- `ethereum`
- `polygon`
- `arbitrum`
- `optimism`
- `base`
- `avalanche`
- `bsc` (Binance Smart Chain)
- `fantom`
- `gnosis`
- `zksync`
- `starknet`
- `solana` (if supported)

---

## Data Transformation Logic

### Step 1: Fetch Raw Data
```typescript
const queryResult = await executeQueryAndWait(queryId);
const rawRows = queryResult.result.rows;
```

### Step 2: Group by Card
```typescript
// Group rows by card_name or card_provider
const cardGroups = groupBy(rawRows, 'card_name');
```

### Step 3: Aggregate Metrics
```typescript
// Sum transactions, volumes, users per card
// Collect unique chains
// Build chainMetrics array
```

### Step 4: Match with Existing Cards
```typescript
// Match Dune card names with existing CryptoCard names
// Handle name variations:
// - "Coinbase Card" vs "Coinbase"
// - "Binance Card" vs "Binance"
// - Case differences
```

### Step 5: Merge Data
```typescript
// Merge Dune data into existing CryptoCard objects
// Preserve existing markdown data
// Add Dune data as optional fields
```

---

## Example Data Structure

### Raw Dune Query Result
```json
{
  "rows": [
    {
      "card_name": "Coinbase Card",
      "card_provider": "Coinbase",
      "card_type": "debit",
      "chain": "ethereum",
      "transactions": 125000,
      "volume_usd": 5000000,
      "users": 5000,
      "date": "2025-01-15"
    },
    {
      "card_name": "Coinbase Card",
      "card_provider": "Coinbase",
      "card_type": "debit",
      "chain": "polygon",
      "transactions": 45000,
      "volume_usd": 1200000,
      "users": 2000,
      "date": "2025-01-15"
    }
  ]
}
```

### Transformed Frontend Data
```typescript
{
  name: "Coinbase Card",
  // ... existing fields ...
  duneData: {
    supportedChains: ["ethereum", "polygon"],
    chainCount: 2,
    totalTransactions: 170000,
    totalVolumeUsd: 6200000,
    activeUsers: 5000, // Latest count
    chainMetrics: [
      {
        chain: "ethereum",
        transactions: 125000,
        volume: 5000000,
        users: 5000
      },
      {
        chain: "polygon",
        transactions: 45000,
        volume: 1200000,
        users: 2000
      }
    ],
    lastUpdated: "2025-01-15T00:00:00Z"
  },
  duneSource: {
    queryId: 123456,
    dashboardUrl: "https://dune.com/obchakevich/crypto-cards-all-chains",
    lastFetched: "2025-01-15T12:00:00Z"
  }
}
```

---

## Card Name Matching

Since Dune card names may not exactly match our markdown card names, we need fuzzy matching:

### Matching Rules

1. **Exact Match** (highest priority)
   - "Coinbase Card" === "Coinbase Card"

2. **Provider Match**
   - "Coinbase Card" → "Coinbase"
   - "Binance Card" → "Binance"

3. **Normalized Match**
   - Remove "Card", "Visa", "Debit", etc.
   - Case-insensitive comparison
   - "coinbase card" === "Coinbase Card"

4. **Fuzzy Match** (fallback)
   - Levenshtein distance < 3
   - Use string similarity

### Example Matches

| Dune Name | Markdown Name | Match Type |
|-----------|---------------|------------|
| Coinbase Card | Coinbase Card | Exact |
| Binance Card | Binance Card | Exact |
| Wirex Card | Wirex | Provider |
| crypto.com visa | Crypto.com Visa | Normalized |
| Plutus Card | Plutus Card | Exact |

---

## Data Validation

### Required Fields (for Dune integration)
- `card_name` or `card_provider` (at least one)

### Optional Fields (nice to have)
- `supported_chains` or `chain_count`
- `total_transactions`
- `total_volume_usd`
- `active_users`

### Validation Rules
1. Card names must be non-empty strings
2. Chain counts must be non-negative integers
3. Metrics must be non-negative numbers
4. Dates must be valid ISO strings
5. Chain names must be from standard list

---

## Error Handling

### Missing Data
- If Dune data unavailable, fall back to static markdown data
- Show "Data unavailable" message in UI
- Don't break existing functionality

### Data Mismatches
- Log warnings for unmatched card names
- Allow manual mapping configuration
- Show "Unknown" for unmatched cards

### API Failures
- Cache last successful fetch
- Show "Last updated: [date]" with stale data warning
- Retry with exponential backoff

---

## Next Steps

1. ✅ Define schema (this document)
2. ⏳ Get actual query structure from dashboard
3. ⏳ Implement data transformation
4. ⏳ Add card name matching logic
5. ⏳ Test with real data

---

*This schema will be updated once we have access to actual Dune query results.*
