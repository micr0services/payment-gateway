# Introduction to Payment Gateway API

## Overview

The Payment Gateway API provides a unified interface to integrate with multiple payment providers (Stripe, PayPal, and M-Pesa) through a single backend service. Built with Cloudflare Workers and Hono.js, it offers high performance, reliability, and comprehensive payment processing capabilities.

## Key Features

### ✅ Multiple Payment Providers
- **Stripe**: Credit cards, digital wallets
- **PayPal**: PayPal accounts, alternative payment methods
- **M-Pesa**: Mobile money for East African markets

### ✅ Robust Features
- **Idempotency Protection**: Prevents duplicate charges
- **Automatic Retries**: Failed requests retry up to 3 times
- **Callback URLs**: Real-time payment status notifications
- **Error Handling**: Comprehensive error codes and messages
- **Transaction Tracking**: Full audit trail of all transactions
- **Multi-Currency Support**: USD, EUR, GBP, CAD, AUD, JPY, INR

### ✅ Production Ready
- **PCI Compliance**: Secure payment processing
- **Webhook Support**: Real-time event notifications
- **Database Persistence**: All transactions stored in PostgreSQL
- **Connection Pooling**: Optimized database performance
- **Global CDN**: Deployed on Cloudflare edge network

## Architecture

```
┌─────────────────────────────────────────────────────┐
│         Client Application                          │
│  (Web, Mobile, or Server-to-Server Integration)    │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│    Payment Gateway API (Cloudflare Workers)         │
│    - Request Validation                             │
│    - Idempotency Middleware                         │
│    - Route Handling                                 │
│    - Error Processing                              │
└──────────────────┬──────────────────────────────────┘
                   │
       ┌───────────┼───────────┐
       │           │           │
       ▼           ▼           ▼
    ┌──────┐  ┌──────┐  ┌──────────┐
    │Stripe│  │PayPal│  │  M-Pesa  │
    └──────┘  └──────┘  └──────────┘
       │           │           │
       └───────────┼───────────┘
                   │
                   ▼
    ┌───────────────────────────────┐
    │   PostgreSQL Database         │
    │   - Transactions              │
    │   - Audit Trail               │
    │   - Provider IDs              │
    │   - Callback URLs             │
    └───────────────────────────────┘
```

## Getting Started

### 1. Prerequisites
- API credentials for at least one payment provider
- Cloudflare Workers account
- PostgreSQL database
- Environment for testing (sandbox/staging)

### 2. Basic Integration Steps

```javascript
// 1. Create a payment
const response = await fetch('https://api.example.com/api/payments/stripe', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    amount: 24.50,
    currency: 'usd',
    callbackUrl: 'https://your-app.com/webhooks/payment',
    metadata: {
      orderId: 'ORD-12345',
      userId: 'user-789'
    }
  })
});

// 2. Handle response
const data = await response.json();
if (data.checkoutUrl) {
  // Redirect user to payment page
  window.location.href = data.checkoutUrl;
}

// 3. Listen for webhook
app.post('/webhooks/payment', (req, res) => {
  const { status, transactionId, amount } = req.body;
  // Handle payment status update
  res.json({ success: true });
});
```

### 3. Provider Comparison

| Feature | Stripe | PayPal | M-Pesa |
|---------|--------|--------|--------|
| **Payment Methods** | Cards, Wallets | PayPal, Cards | Mobile Money |
| **Geography** | Global | Global | East Africa |
| **Min Amount** | $0.50 | $0.01 | KES 1 |
| **Settlement** | 1-2 days | Instant | Variable |
| **Webhook Support** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Refunds** | ✅ Yes | ✅ Yes | ✅ Limited |

## API Response Format

All API responses follow a consistent JSON format:

### Success Response (2xx)
```json
{
  "success": true,
  "data": {
    "transactionId": "txn_12345...",
    "status": "pending",
    "amount": 2450,
    "currency": "USD",
    "createdAt": "2026-05-09T10:30:00Z"
  },
  "timestamp": "2026-05-09T10:30:00Z"
}
```

### Error Response (4xx, 5xx)
```json
{
  "success": false,
  "error": "Invalid amount provided",
  "code": "INVALID_AMOUNT",
  "details": {
    "field": "amount",
    "reason": "Amount must be greater than 0"
  },
  "timestamp": "2026-05-09T10:30:00Z"
}
```

## Transaction Statuses

| Status | Description | Webhook Sent |
|--------|-------------|-------------|
| `pending` | Payment initiated, awaiting user input | ❌ No |
| `processing` | Payment being processed | ✅ Yes |
| `completed` | Payment successful | ✅ Yes |
| `failed` | Payment failed | ✅ Yes |
| `cancelled` | Payment cancelled by user | ✅ Yes |
| `refunded` | Payment refunded | ✅ Yes |

## Idempotency

The API ensures idempotent operations to prevent duplicate charges. All requests should include an idempotency key:

```bash
curl -X POST https://api.example.com/api/payments/stripe \
  -H "Idempotency-Key: unique-key-12345" \
  -H "Content-Type: application/json" \
  -d '{"amount": 24.50, "currency": "usd"}'
```

If the same request is sent twice with the same idempotency key, the API will return the same response without processing payment twice.

## Rate Limiting

API requests are rate limited:
- **Authenticated Requests**: 1000 requests per minute
- **Unauthenticated Requests**: 100 requests per minute
- **Burst Limit**: 10 requests per second

Rate limit info is returned in response headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1620086400
```

## Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_AMOUNT` | 400 | Amount is invalid or missing |
| `INVALID_CURRENCY` | 400 | Currency not supported |
| `DUPLICATE_REQUEST` | 409 | Duplicate idempotency key |
| `PAYMENT_PROVIDER_ERROR` | 400 | Payment provider returned error |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `WEBHOOK_DELIVERY_FAILED` | 200 | Payment succeeded but webhook failed |
| `UNAUTHORIZED` | 401 | Authentication failed |
| `RATE_LIMITED` | 429 | Too many requests |

## Next Steps

1. **Choose your gateway**: [Stripe](./api/stripe/README.md), [PayPal](./api/paypal/README.md), or [M-Pesa](./api/mpesa/README.md)
2. **Read authentication guide**: [Authentication](./guides/AUTHENTICATION.md)
3. **Setup sandbox testing**: [Sandbox Testing](./integration/SANDBOX_TESTING.md)
4. **Implement webhook handling**: [Webhooks](./api/webhooks/README.md)
5. **Review security best practices**: [Security](./integration/SECURITY.md)

## Support Resources

- **Technical Docs**: See the API reference for each provider
- **Troubleshooting**: [Error Handling Guide](./guides/ERROR_HANDLING.md)
- **Code Examples**: Check integration guides for code samples
- **Security**: [Security Best Practices](./integration/SECURITY.md)

---

**Version**: 1.0.0  
**Last Updated**: 2026-05-09
