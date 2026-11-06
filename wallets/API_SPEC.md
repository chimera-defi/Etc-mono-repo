# WalletRadar API Specification

**Product:** WalletRadar API  
**Purpose:** Programmatic access to wallet comparison data  
**Target:** Developers, companies, tools building on wallet data

---

## Value Proposition Analysis

### Who Needs API Access?
1. **Developers building dApps:** Need to recommend wallets to users
2. **Companies building wallet-integrated products:** Need wallet data in their tools
3. **Analysts/researchers:** Need data for reports/analysis
4. **Internal tools:** Companies building internal dashboards
5. **Third-party tools:** Tools that want to include wallet comparisons

### Use Cases

#### Use Case 1: dApp Wallet Recommendation
- **Scenario:** dApp wants to show users "Recommended Wallets"
- **Need:** Get top-scoring wallets, filter by criteria
- **Value:** Better UX, higher wallet connection rates

#### Use Case 2: Internal Dashboard
- **Scenario:** Company tracks wallet ecosystem for decision-making
- **Need:** Real-time wallet data, historical trends
- **Value:** Data-driven decisions, stay informed

#### Use Case 3: Wallet Integration Tool
- **Scenario:** Tool helps developers integrate wallets
- **Need:** Wallet compatibility data, features, status
- **Value:** Accurate integration guidance

#### Use Case 4: Research/Analysis
- **Scenario:** Researcher analyzing wallet ecosystem
- **Need:** Export data, historical trends, custom queries
- **Value:** Comprehensive data for analysis

---

## API Tiers & Pricing

### Free Tier
- **Price:** Free
- **Rate Limit:** 1,000 requests/month
- **Features:**
  - Basic wallet data (name, score, status)
  - Rate limit: 10 requests/minute
  - Requires attribution (link back to WalletRadar)
- **Use Case:** Testing, small projects, personal use

### Pro Tier
- **Price:** $99/month
- **Rate Limit:** 10,000 requests/month
- **Features:**
  - Full wallet data (all fields)
  - Rate limit: 100 requests/minute
  - Webhook support (wallet updates)
  - No attribution required
- **Use Case:** Production apps, moderate traffic

### Enterprise Tier
- **Price:** $499/month
- **Rate Limit:** Unlimited
- **Features:**
  - Everything in Pro
  - Custom fields/endpoints
  - Priority support
  - SLA (99.9% uptime)
  - Dedicated support
- **Use Case:** High-traffic apps, enterprise needs

---

## API Endpoints

### Base URL
```
https://api.walletradar.org/v1
```

### Authentication
- **Method:** API Key (Bearer token)
- **Header:** `Authorization: Bearer YOUR_API_KEY`
- **Key Management:** Dashboard at walletradar.org/api/keys

---

### Endpoint 1: List Wallets

**GET** `/wallets`

List all wallets with optional filtering.

#### Query Parameters
- `status` (string, optional): Filter by status (`active`, `slow`, `inactive`)
- `score_min` (integer, optional): Minimum score (0-100)
- `score_max` (integer, optional): Maximum score (0-100)
- `core` (boolean, optional): Has mobile + browser extension
- `license` (string, optional): License type (`foss`, `partial`, `proprietary`)
- `txsim` (boolean, optional): Has transaction simulation
- `chains_min` (integer, optional): Minimum chain count
- `limit` (integer, optional): Results per page (default: 50, max: 100)
- `offset` (integer, optional): Pagination offset (default: 0)
- `sort` (string, optional): Sort field (`score`, `name`, `chains`) (default: `score`)
- `order` (string, optional): Sort order (`asc`, `desc`) (default: `desc`)

#### Response
```json
{
  "data": [
    {
      "id": "rabby",
      "name": "Rabby",
      "score": 92,
      "status": "active",
      "core": true,
      "releases_per_month": 6,
      "rpc_support": true,
      "chains": 94,
      "devices": ["mobile", "browser", "desktop"],
      "testnets": true,
      "license": "MIT",
      "funding": "sustainable",
      "tx_simulation": true,
      "scam_protection": true,
      "account_types": ["EOA", "Safe"],
      "hardware_wallet_support": true,
      "best_for": "Development",
      "recommendation": "recommended",
      "github_url": "https://github.com/RabbyHub/Rabby",
      "last_commit": "2025-11-21",
      "stars": 1726,
      "issues": 120,
      "issue_ratio": 7.0
    }
  ],
  "pagination": {
    "total": 24,
    "limit": 50,
    "offset": 0,
    "has_more": false
  }
}
```

#### Example Request
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "https://api.walletradar.org/v1/wallets?status=active&score_min=80&core=true"
```

---

### Endpoint 2: Get Wallet Details

**GET** `/wallets/{id}`

Get detailed information about a specific wallet.

#### Path Parameters
- `id` (string, required): Wallet ID (e.g., `rabby`, `trust`, `metamask`)

#### Response
```json
{
  "data": {
    "id": "rabby",
    "name": "Rabby",
    "score": 92,
    "score_breakdown": {
      "platform_coverage": 20,
      "developer_experience": 20,
      "activity": 15,
      "open_source": 10,
      "security": 5,
      "stability": 15,
      "ecosystem": 15
    },
    "status": "active",
    "core": true,
    "releases_per_month": 6,
    "rpc_support": true,
    "chains": 94,
    "devices": ["mobile", "browser", "desktop"],
    "testnets": true,
    "license": "MIT",
    "audits": [
      {
        "year": 2023,
        "firm": "Mob",
        "url": "https://..."
      }
    ],
    "funding": "sustainable",
    "tx_simulation": true,
    "scam_protection": true,
    "account_types": ["EOA", "Safe"],
    "eip_support": {
      "eip_712": true,
      "eip_2612": true,
      "eip_4337": false,
      "eip_5792": false,
      "eip_7702": false
    },
    "hardware_wallet_support": true,
    "best_for": "Development",
    "recommendation": "recommended",
    "github_url": "https://github.com/RabbyHub/Rabby",
    "github_metrics": {
      "last_commit": "2025-11-21",
      "stars": 1726,
      "issues": 120,
      "issue_ratio": 7.0,
      "stability": "⭐⭐⭐⭐"
    },
    "known_quirks": [
      "ENS import only (can't send to .eth addresses)",
      "Transaction simulation requires Rabby-specific API"
    ]
  }
}
```

#### Example Request
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "https://api.walletradar.org/v1/wallets/rabby"
```

---

### Endpoint 3: Get Wallet History (Pro+)

**GET** `/wallets/{id}/history`

Get historical score and status data for a wallet.

#### Path Parameters
- `id` (string, required): Wallet ID

#### Query Parameters
- `start_date` (string, optional): Start date (YYYY-MM-DD, default: 6 months ago)
- `end_date` (string, optional): End date (YYYY-MM-DD, default: today)

#### Response
```json
{
  "data": {
    "wallet_id": "rabby",
    "wallet_name": "Rabby",
    "history": [
      {
        "date": "2025-06-01",
        "score": 90,
        "status": "active",
        "chains": 92,
        "releases_per_month": 5
      },
      {
        "date": "2025-07-01",
        "score": 91,
        "status": "active",
        "chains": 93,
        "releases_per_month": 6
      },
      {
        "date": "2025-08-01",
        "score": 92,
        "status": "active",
        "chains": 94,
        "releases_per_month": 6
      }
    ]
  }
}
```

---

### Endpoint 4: List Hardware Wallets

**GET** `/hardware`

List all hardware wallets.

#### Query Parameters
- `air_gap` (boolean, optional): Has air-gap support
- `open_source` (boolean, optional): Is open source
- `secure_element` (boolean, optional): Has secure element
- `price_min` (integer, optional): Minimum price (USD)
- `price_max` (integer, optional): Maximum price (USD)
- `limit` (integer, optional): Results per page (default: 50)
- `offset` (integer, optional): Pagination offset

#### Response
```json
{
  "data": [
    {
      "id": "trezor-safe-5",
      "name": "Trezor Safe 5",
      "score": 94,
      "air_gap": false,
      "open_source": true,
      "secure_element": "Optiga",
      "display": "Touch Color",
      "price": 169,
      "connection": "USB-C",
      "status": "active",
      "github_url": "https://github.com/trezor/trezor-firmware",
      "recommendation": "recommended"
    }
  ],
  "pagination": {
    "total": 23,
    "limit": 50,
    "offset": 0
  }
}
```

---

### Endpoint 5: Register Webhook (Pro+)

**POST** `/webhooks`

Register a webhook to receive wallet update notifications.

#### Request Body
```json
{
  "url": "https://your-app.com/webhooks/walletradar",
  "events": ["wallet.status_change", "wallet.score_change", "wallet.new"],
  "wallet_ids": ["rabby", "trust"] // Optional: specific wallets, or null for all
}
```

#### Response
```json
{
  "data": {
    "webhook_id": "wh_abc123",
    "url": "https://your-app.com/webhooks/walletradar",
    "events": ["wallet.status_change", "wallet.score_change"],
    "wallet_ids": ["rabby", "trust"],
    "created_at": "2025-12-08T10:00:00Z"
  }
}
```

#### Webhook Payload Example
```json
{
  "event": "wallet.status_change",
  "wallet_id": "block",
  "wallet_name": "Block Wallet",
  "previous_status": "active",
  "new_status": "inactive",
  "timestamp": "2025-12-08T10:00:00Z"
}
```

---

## Rate Limiting

### Free Tier
- **Monthly Limit:** 1,000 requests
- **Per-Minute Limit:** 10 requests/minute
- **Headers:** 
  - `X-RateLimit-Limit: 1000`
  - `X-RateLimit-Remaining: 999`
  - `X-RateLimit-Reset: 1733616000` (Unix timestamp)

### Pro Tier
- **Monthly Limit:** 10,000 requests
- **Per-Minute Limit:** 100 requests/minute

### Enterprise Tier
- **Monthly Limit:** Unlimited
- **Per-Minute Limit:** 1,000 requests/minute

### Rate Limit Exceeded Response
```json
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Rate limit exceeded. Upgrade to Pro for higher limits.",
    "retry_after": 60
  }
}
```

---

## Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "error_code",
    "message": "Human-readable error message",
    "details": {} // Optional additional details
  }
}
```

### Error Codes
- `invalid_api_key`: API key is invalid or missing
- `rate_limit_exceeded`: Rate limit exceeded
- `wallet_not_found`: Wallet ID not found
- `invalid_parameters`: Invalid query parameters
- `server_error`: Internal server error

### Example Error Response
```json
{
  "error": {
    "code": "wallet_not_found",
    "message": "Wallet 'invalid-wallet' not found"
  }
}
```

---

## Attribution Requirements (Free Tier)

Free tier users must include attribution when displaying WalletRadar data:

- **Required:** "Data from WalletRadar" with link to walletradar.org
- **Placement:** Visible on same page/screen where data is displayed
- **Format:** Text link or logo + text

---

## API Documentation

### Interactive API Docs
- **Swagger UI:** https://api.walletradar.org/docs
- **OpenAPI Spec:** https://api.walletradar.org/openapi.json

### Code Examples

#### JavaScript (Fetch)
```javascript
const response = await fetch('https://api.walletradar.org/v1/wallets?status=active&score_min=80', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});
const data = await response.json();
console.log(data.data);
```

#### Python (Requests)
```python
import requests

headers = {'Authorization': 'Bearer YOUR_API_KEY'}
response = requests.get(
    'https://api.walletradar.org/v1/wallets',
    params={'status': 'active', 'score_min': 80},
    headers=headers
)
data = response.json()
print(data['data'])
```

#### cURL
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "https://api.walletradar.org/v1/wallets?status=active&score_min=80"
```

---

## Success Metrics

### Adoption Metrics
- **API users:** Target 10-50 users (Year 1)
- **API requests:** Target 100K-500K requests/month
- **Upsell rate:** % of Pro subscribers who use API

### Revenue Metrics
- **MRR:** Target $500-3,000/month (5-30 API customers)
- **ARPU:** ~$99/month (Pro tier average)
- **Churn rate:** Target <5% monthly

### Technical Metrics
- **Uptime:** Target 99.9%
- **Response time:** Target <200ms (p95)
- **Error rate:** Target <0.1%

---

*Last updated: December 2025*
