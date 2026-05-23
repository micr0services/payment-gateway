# Transactions API

Complete guide to querying and managing payment transactions.

## Overview

The Transactions API provides endpoints to retrieve transaction history, get details of specific transactions, and manage transaction metadata. All payments (Stripe, PayPal, M-Pesa) are recorded in the transaction log.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/transactions/all` | Get all transactions with filtering |
| `GET` | `/api/transactions/:id` | Get single transaction by ID |
| `POST` | `/api/transactions` | Create transaction record |
| `PUT` | `/api/transactions/:id` | Update transaction |

## Detailed Endpoints

### 1. Get All Transactions

**Endpoint**: `GET /api/transactions/all`

Retrieve paginated list of all transactions with optional filtering.

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `skip` | number | Number of records to skip (pagination) |
| `take` | number | Number of records to return (default: 10) |
| `type` | string | Filter by transaction type (STK_PUSH, B2C, STRIPE, PAYPAL) |
| `status` | string | Filter by status (PENDING, SUCCESS, FAILED, CANCELLED) |
| `gateway` | string | Filter by payment gateway (stripe, paypal, mpesa) |
| `startDate` | string | Filter from date (ISO 8601) |
| `endDate` | string | Filter to date (ISO 8601) |

#### Example Requests

```bash
# Get first 10 transactions
GET /api/transactions/all

# Get transactions 20-30
GET /api/transactions/all?skip=20&take=10

# Filter by status
GET /api/transactions/all?status=SUCCESS

# Filter by gateway
GET /api/transactions/all?gateway=stripe

# Filter by type and status
GET /api/transactions/all?type=STK_PUSH&status=SUCCESS

# Filter by date range
GET /api/transactions/all?startDate=2026-05-01&endDate=2026-05-09

# Complex filter
GET /api/transactions/all?gateway=mpesa&status=SUCCESS&take=50&skip=0
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Transactions retrieved successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "transactionType": "STK_PUSH",
      "status": "SUCCESS",
      "gateway": "mpesa",
      "mobileNumber": "254712345678",
      "amount": 1000,
      "currency": "KES",
      "description": "Payment for services",
      "conversationId": "conv-123456",
      "mpesaTransactionId": "KBL29WVKE0",
      "mpesaReceiptNumber": "LHM7DUVEMP",
      "resultCode": 0,
      "resultDesc": "The service request has been processed successfully.",
      "createdAt": "2026-03-13T10:30:00Z",
      "updatedAt": "2026-03-13T10:31:45Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "transactionType": "STRIPE",
      "status": "SUCCESS",
      "gateway": "stripe",
      "amount": 2450,
      "currency": "USD",
      "description": "Widget purchase",
      "stripePaymentIntentId": "pi_1234567890",
      "stripeChargeId": "ch_1234567890",
      "metadata": {
        "orderId": "ORD-12345",
        "userId": "user-789"
      },
      "createdAt": "2026-03-13T11:00:00Z",
      "updatedAt": "2026-03-13T11:01:30Z"
    }
  ],
  "pagination": {
    "total": 245,
    "skip": 0,
    "take": 10,
    "pages": 25
  },
  "timestamp": "2026-05-09T14:30:00Z"
}
```

#### Response Fields

| Field | Description |
|-------|-------------|
| `data` | Array of transaction objects |
| `pagination` | Pagination information |
| `pagination.total` | Total number of matching transactions |
| `pagination.skip` | Records skipped |
| `pagination.take` | Records returned |
| `pagination.pages` | Total number of pages |

#### Example Usage

```javascript
// JavaScript
async function getTransactions(filters = {}) {
  const params = new URLSearchParams({
    skip: filters.skip || 0,
    take: filters.take || 10,
    status: filters.status || 'SUCCESS',
    gateway: filters.gateway || 'stripe'
  });

  const response = await fetch(
    `https://api.example.com/api/transactions/all?${params}`,
    { method: 'GET' }
  );

  return await response.json();
}

// Usage
const result = await getTransactions({
  status: 'SUCCESS',
  gateway: 'mpesa',
  skip: 0,
  take: 20
});

console.log(`Found ${result.pagination.total} transactions`);
result.data.forEach(tx => {
  console.log(`${tx.id}: ${tx.status} - ${tx.amount} ${tx.currency}`);
});
```

```python
# Python
import requests

response = requests.get(
    'https://api.example.com/api/transactions/all',
    params={
        'status': 'SUCCESS',
        'gateway': 'stripe',
        'skip': 0,
        'take': 10
    }
)

data = response.json()
print(f"Total transactions: {data['pagination']['total']}")
for tx in data['data']:
    print(f"{tx['id']}: {tx['status']}")
```

### 2. Get Single Transaction

**Endpoint**: `GET /api/transactions/:id`

Retrieve detailed information about a specific transaction.

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Transaction ID (UUID) |

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "idempotencyKey": "unique-key-12345",
    "transactionType": "STK_PUSH",
    "status": "SUCCESS",
    "gateway": "mpesa",
    "mobileNumber": "254712345678",
    "amount": 1000,
    "currency": "KES",
    "description": "Payment for services",
    "conversationId": "conv-123456",
    "merchantRequestId": "26439-1234567890",
    "checkoutRequestId": "ws_CO_DMZ_ID",
    "mpesaTransactionId": "KBL29WVKE0",
    "mpesaReceiptNumber": "LHM7DUVEMP",
    "resultCode": 0,
    "resultDesc": "The service request has been processed successfully.",
    "callbackUrl": "https://your-app.com/webhooks/mpesa",
    "cancelUrl": "https://your-app.com/cancel",
    "metadata": {
      "orderId": "ORD-12345",
      "userId": "user-789"
    },
    "createdAt": "2026-03-13T10:30:00Z",
    "updatedAt": "2026-03-13T10:31:45Z",
    "completedAt": "2026-03-13T10:31:45Z"
  },
  "timestamp": "2026-05-09T14:30:00Z"
}
```

#### Error Response (404 Not Found)

```json
{
  "success": false,
  "error": "Transaction not found",
  "code": "NOT_FOUND",
  "timestamp": "2026-05-09T14:30:00Z"
}
```

#### Example Usage

```javascript
async function getTransaction(transactionId) {
  const response = await fetch(
    `https://api.example.com/api/transactions/${transactionId}`,
    { method: 'GET' }
  );

  if (response.ok) {
    const data = await response.json();
    console.log(`Transaction: ${data.data.status}`);
    console.log(`Amount: ${data.data.amount} ${data.data.currency}`);
    return data.data;
  } else {
    console.error('Transaction not found');
  }
}
```

### 3. Create Transaction

**Endpoint**: `POST /api/transactions`

Manually create a transaction record (usually done automatically).

#### Request Body

```json
{
  "gateway": "stripe",
  "amount": 2450,
  "currency": "USD",
  "status": "pending",
  "description": "Widget purchase",
  "callbackUrl": "https://your-app.com/webhooks/stripe",
  "metadata": {
    "orderId": "ORD-12345",
    "userId": "user-789"
  }
}
```

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `gateway` | string | ✅ Yes | Payment gateway (stripe, paypal, mpesa) |
| `amount` | number | ✅ Yes | Transaction amount |
| `currency` | string | ✅ Yes | Currency code (USD, KES, etc) |
| `status` | string | ✅ Yes | Initial status (pending, processing, etc) |
| `description` | string | ❌ No | Transaction description |
| `callbackUrl` | string | ❌ No | Callback URL for status updates |
| `metadata` | object | ❌ No | Custom metadata |

#### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "gateway": "stripe",
    "amount": 2450,
    "currency": "USD",
    "status": "pending",
    "description": "Widget purchase",
    "metadata": {
      "orderId": "ORD-12345",
      "userId": "user-789"
    },
    "createdAt": "2026-05-09T14:30:00Z"
  }
}
```

### 4. Update Transaction

**Endpoint**: `PUT /api/transactions/:id`

Update transaction details (usually done automatically).

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Transaction ID |

#### Request Body

```json
{
  "status": "completed",
  "metadata": {
    "orderId": "ORD-12345",
    "processedAt": "2026-05-09T14:30:00Z"
  }
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "status": "completed",
    "metadata": {
      "orderId": "ORD-12345",
      "processedAt": "2026-05-09T14:30:00Z"
    },
    "updatedAt": "2026-05-09T14:31:00Z"
  }
}
```

## Transaction Types

### M-Pesa Types
| Type | Description |
|------|-------------|
| `STK_PUSH` | STK Push payment |
| `B2C` | Business-to-Customer transfer |
| `C2B` | Customer-to-Business collection |
| `B2B` | Business-to-Business payment |
| `REVERSAL` | Transaction reversal |

### Stripe Types
| Type | Description |
|------|-------------|
| `STRIPE` | Stripe Checkout/Payment Intent |
| `STRIPE_CARD` | Direct card payment |

### PayPal Types
| Type | Description |
|------|-------------|
| `PAYPAL` | PayPal checkout |
| `PAYPAL_CAPTURE` | PayPal order capture |

## Transaction Statuses

| Status | Description |
|--------|-------------|
| `PENDING` | Payment initiated, awaiting processing |
| `PROCESSING` | Payment being processed |
| `SUCCESS` | Payment completed successfully |
| `FAILED` | Payment failed |
| `CANCELLED` | Payment cancelled |
| `REFUNDED` | Payment refunded |
| `EXPIRED` | Payment link expired |

## Filtering Examples

### By Status

```bash
# Get successful transactions
GET /api/transactions/all?status=SUCCESS

# Get pending transactions
GET /api/transactions/all?status=PENDING
```

### By Gateway

```bash
# M-Pesa only
GET /api/transactions/all?gateway=mpesa

# Stripe only
GET /api/transactions/all?gateway=stripe
```

### By Amount Range

```bash
# Since the API doesn't have direct amount filtering,
# you can retrieve all and filter client-side:

GET /api/transactions/all?take=1000
# then filter: data.filter(t => t.amount >= 1000 && t.amount <= 5000)
```

### By Date Range

```bash
# Last 7 days
GET /api/transactions/all?startDate=2026-05-02&endDate=2026-05-09
```

## Pagination Best Practices

```javascript
async function getAllTransactionsWithPagination() {
  const allTransactions = [];
  let page = 0;
  const pageSize = 50;

  let hasMore = true;
  while (hasMore) {
    const response = await fetch(
      `https://api.example.com/api/transactions/all?skip=${page * pageSize}&take=${pageSize}`,
      { method: 'GET' }
    );

    const data = await response.json();
    allTransactions.push(...data.data);

    // Check if there are more pages
    if (data.data.length < pageSize) {
      hasMore = false;
    }

    page++;
  }

  return allTransactions;
}
```

## Common Queries

### Revenue Report
```javascript
async function getRevenueReport(dateStart, dateEnd, currency = 'USD') {
  let skip = 0;
  let total = 0;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(
      `https://api.example.com/api/transactions/all?status=SUCCESS&skip=${skip}&take=100`
    );
    const data = await response.json();

    total += data.data
      .filter(t => t.currency === currency && t.status === 'SUCCESS')
      .reduce((sum, t) => sum + t.amount, 0);

    hasMore = data.data.length === 100;
    skip += 100;
  }

  return total;
}
```

### Failed Transactions Report
```javascript
async function getFailedTransactions() {
  const response = await fetch(
    'https://api.example.com/api/transactions/all?status=FAILED&take=1000'
  );
  const data = await response.json();
  return data.data;
}
```

## Error Handling

```javascript
async function handleTransactionError(error) {
  if (error.code === 'NOT_FOUND') {
    console.error('Transaction not found');
  } else if (error.code === 'INVALID_FILTER') {
    console.error('Invalid filter parameters');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Next Steps

- [Webhooks Documentation](../webhooks/README.md)
- [Error Handling Guide](../guides/ERROR_HANDLING.md)
- [Query Examples](../guides/QUERY_EXAMPLES.md)

---

**API Version**: 1.0.0  
**Last Updated**: 2026-05-09  
**Status**: Production Ready
