# Stripe API Integration

Complete guide to integrating Stripe payments into your application.

## Overview

Stripe integration provides a secure way to process credit card and digital wallet payments. The API handles payment intent creation, status tracking, refunds, and webhook notifications with built-in retry logic and comprehensive error handling.

### Key Features
- **Automatic Retries**: Failed API calls are automatically retried up to 3 times with exponential backoff
- **Idempotency**: All requests support idempotency keys to prevent duplicate processing
- **Error Handling**: Comprehensive error handling with detailed error messages
- **Webhook Support**: Real-time payment status notifications via webhooks
- **Multi-currency**: Support for 130+ currencies with automatic conversion

### Supported Payment Methods
- Credit cards (Visa, Mastercard, American Express, Discover)
- Digital wallets (Apple Pay, Google Pay)
- Bank transfers
- SEPA Direct Debit

### Supported Currencies
USD, EUR, GBP, CAD, AUD, JPY, INR, and 130+ more

## Quick Start

```bash
# Create a payment
curl -X POST https://api.example.com/api/payments/stripe \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: unique-key-123" \
  -d '{
    "amount": 24.50,
    "currency": "usd",
    "callbackUrl": "https://your-app.com/webhooks/stripe",
    "successRedirectUrl": "https://your-app.com/payments/checkout?status=success",
    "failureRedirectUrl": "https://your-app.com/payments/checkout?status=failure",
    "metadata": {
      "orderId": "ORD-12345",
      "userId": "user-789",
      "eventId": "evt-1234",
      "bookingType": "tournament_entry"
    }
  }'

# Response
{
  "checkoutUrl": "https://checkout.stripe.com/...",
  "sessionId": "cs_live_...",
  "status": "pending",
  "amountProcessed": 2450,
  "currency": "USD",
  "callbackUrl": "https://your-app.com/webhooks/stripe",
  "successRedirectUrl": "https://your-app.com/payments/checkout?status=success",
  "failureRedirectUrl": "https://your-app.com/payments/checkout?status=failure",
  "cancelUrl": null,
  "callbackUrlRegistered": true,
  "successRedirectUrlRegistered": true,
  "failureRedirectUrlRegistered": true,
  "cancelUrlRegistered": false
}
```

> Note: `callbackUrl` is optional for server-side webhook notifications. However, `successRedirectUrl` and `failureRedirectUrl` are **required** for Stripe checkout to redirect users after payment. `cancelUrl` is optional. Custom fields such as `userId`, `eventId`, and `bookingType` should be passed inside `metadata`.

> If your database schema is missing `callback_url` or `cancel_url`, run `npm run migrate` to apply all SQL migrations.

## Reliability & Error Handling

### Retry Logic
- **Max Retries**: 3 attempts per request
- **Backoff Strategy**: Exponential backoff (1s, 1.5s, 2.25s)
- **Retryable Errors**: Network timeouts, temporary server errors (5xx)
- **Non-retryable Errors**: Authentication errors, invalid parameters (4xx)

### Error Scenarios
- **Network Issues**: Automatically retried with exponential backoff
- **Rate Limiting**: Respects Stripe's rate limits with automatic retry
- **Invalid Cards**: Immediate failure with detailed error message
- **Insufficient Funds**: Payment declined with specific error code
- **Expired Cards**: Validation error with card expiry details

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/payments/stripe` | Create payment intent |
| `GET` | `/api/payments/stripe/:paymentIntentId` | Get payment status |
| `POST` | `/api/payments/stripe/:paymentIntentId/cancel` | Cancel payment |
| `POST` | `/api/payments/stripe/:paymentIntentId/refund` | Refund payment |
| `POST` | `/api/payments/stripe/:paymentIntentId/confirm` | Confirm payment (testing) |

## Detailed Endpoints

### 1. Create Payment Intent

**Endpoint**: `POST /api/payments/stripe`

Creates a new Stripe payment intent and returns a checkout URL.

#### Request Body
```json
{
  "amount": 24.50,
  "currency": "usd",
  "callbackUrl": "https://your-app.com/webhooks/stripe",
  "successRedirectUrl": "https://your-app.com/payments/checkout?status=success",
  "failureRedirectUrl": "https://your-app.com/payments/checkout?status=failure",
  "metadata": {
    "orderId": "ORD-12345",
    "userId": "user-789",
    "eventId": "evt-1234",
    "bookingType": "tournament_entry",
    "description": "Widget purchase"
  }
}
```

Fields like `userId`, `eventId`, `bookingType`, `accountReference`, and `transactionDesc` belong inside `metadata` because the route only accepts the top-level payment fields listed above.

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `amount` | number | ✅ Yes | Payment amount (e.g., 24.50 for $24.50) |
| `currency` | string | ❌ No | Currency code, defaults to 'usd' |
| `successRedirectUrl` | string | ✅ Yes | Frontend URL where the user redirects after successful payment (required by Stripe) |
| `failureRedirectUrl` | string | ✅ Yes | Frontend URL where the user redirects after failed payment (required by Stripe) |
| `callbackUrl` | string | ❌ No | Server-side webhook URL to receive normalized payment status updates |
| `cancelUrl` | string | ❌ No | URL to redirect the user if they cancel during checkout |
| `metadata` | object | ❌ No | Custom metadata for tracking |

#### Response (200 OK)
```json
{
  "checkoutUrl": "https://checkout.stripe.com/pay/cs_live_...",
  "sessionId": "cs_live_...",
  "status": "pending",
  "amountProcessed": 2450,
  "currency": "USD",
  "callbackUrl": "https://your-app.com/webhooks/stripe",
  "successRedirectUrl": "https://your-app.com/payments/checkout?status=success",
  "failureRedirectUrl": "https://your-app.com/payments/checkout?status=failure",
  "cancelUrl": null,
  "callbackUrlRegistered": true,
  "successRedirectUrlRegistered": true,
  "failureRedirectUrlRegistered": true,
  "cancelUrlRegistered": false
}
```

#### Response Fields

| Field | Description |
|-------|-------------|
| `checkoutUrl` | URL to redirect user for payment |
| `sessionId` | Stripe checkout session ID |
| `status` | Current payment status |
| `amountProcessed` | Amount in smallest currency unit (cents for USD) |
| `currency` | Currency code |
| `callbackUrl` | Server-side webhook URL for payment status updates (or `null` if not provided) |
| `successRedirectUrl` | Frontend URL for successful payment redirect (or `null` if not provided) |
| `failureRedirectUrl` | Frontend URL for failed payment redirect (or `null` if not provided) |
| `cancelUrl` | Frontend URL for cancelled payment redirect (or `null` if not provided) |
| `callbackUrlRegistered` | Whether callback URL was registered |
| `successRedirectUrlRegistered` | Whether success redirect URL was registered |
| `failureRedirectUrlRegistered` | Whether failure redirect URL was registered |
| `cancelUrlRegistered` | Whether cancel URL was registered |

### Callback and redirect flow

This integration separates two channels:

1. **System channel** (truth)
   - Stripe webhook verifies and normalizes the event
   - Worker posts to `callbackUrl`
   - Backend updates DB and runs business logic

2. **User channel** (UX)
   - Stripe redirects the browser to `successRedirectUrl` or `failureRedirectUrl`
   - Frontend reads `session_id` from the query string
   - Frontend calls the backend status endpoint to confirm final payment state

#### Important rules
- `callbackUrl` is the server-side notification endpoint.
- `successRedirectUrl` / `failureRedirectUrl` are frontend URLs only.
- The webhook must not perform business logic or DB writes directly.
- The frontend should remain on the page where payment started and then confirm status after Stripe redirects back.

#### Callback payload example
```json
{
  "paymentId": "unique-key-123",
  "status": "SUCCESS",
  "amount": 2450,
  "currency": "USD",
  "provider": "stripe",
  "reference": "pi_abc123",
  "metadata": {
    "orderId": "ORD-12345",
    "userId": "user-789",
    "eventId": "evt-1234",
    "bookingType": "tournament_entry"
  },
  "successRedirectUrl": "https://your-app.com/payments/checkout?status=success",
  "failureRedirectUrl": "https://your-app.com/payments/checkout?status=failure",
  "error": null,
  "timestamp": "2026-05-09T10:31:45.000Z"
}
```

#### Frontend flow on the same page
If the user started payment from a page like `/payments/checkout`, keep them on that page and use redirect URLs back to it.

1. User clicks pay on `/payments/checkout`
2. API returns `checkoutUrl`
3. Browser redirects to Stripe Checkout
4. Stripe redirects back to `successRedirectUrl` or `failureRedirectUrl`
5. Frontend reads `session_id` from the query string
6. Frontend calls backend status endpoint to confirm the final state

The page where the user paid should be the same page used in `successRedirectUrl`/`failureRedirectUrl`, not a different workflow page.

#### Frontend status check example
```javascript
const params = new URLSearchParams(window.location.search);
const sessionId = params.get('session_id');
if (sessionId) {
  const response = await fetch(`/api/payments/stripe/${sessionId}`);
  const statusData = await response.json();
  if (statusData.status === 'completed') {
    // show success state or navigate to clean URL
  } else if (statusData.status === 'failed') {
    // show failure state
  }
}
```

#### Error Responses

**400 Bad Request** - Invalid parameters
```json
{
  "error": "Valid amount is required",
  "code": "INVALID_AMOUNT"
}
```

**400 Bad Request** - Missing required redirect URLs
```json
{
  "error": "successRedirectUrl is required for Stripe checkout",
  "code": "MISSING_SUCCESS_URL"
}
```

**400 Bad Request** - Empty redirect URL strings
```json
{
  "error": "You passed an empty string for 'success_url'. We assume empty values are null",
  "code": "STRIPE_EMPTY_URL"
}
```

**409 Conflict** - Duplicate request
```json
{
  "error": "Transaction already exists",
  "code": "DUPLICATE_TRANSACTION"
}
```

#### Example Usage

```javascript
// JavaScript/Node.js
async function createStripePayment() {
  const response = await fetch('https://api.example.com/api/payments/stripe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': 'unique-key-' + Date.now()
    },
    body: JSON.stringify({
      amount: 24.50,
      currency: 'usd',
      callbackUrl: 'https://your-app.com/webhooks/stripe',
      successRedirectUrl: 'https://your-app.com/payments/checkout?status=success',
      failureRedirectUrl: 'https://your-app.com/payments/checkout?status=failure',
      metadata: {
        orderId: 'ORD-12345',
        userId: 'user-789'
      }
    })
  });

  const data = await response.json();
  
  if (data.checkoutUrl) {
    // Redirect user to Stripe Checkout
    window.location.href = data.checkoutUrl;
  }
}
```

```python
# Python
import requests

response = requests.post(
    'https://api.example.com/api/payments/stripe',
    json={
        'amount': 24.50,
        'currency': 'usd',
        'callbackUrl': 'https://your-app.com/webhooks/stripe',
        'successRedirectUrl': 'https://your-app.com/payments/checkout?status=success',
        'failureRedirectUrl': 'https://your-app.com/payments/checkout?status=failure',
        'metadata': {
            'orderId': 'ORD-12345',
            'userId': 'user-789'
        }
    },
    headers={
        'Content-Type': 'application/json',
        'Idempotency-Key': f'unique-key-{time.time()}'
    }
)

data = response.json()
if 'checkoutUrl' in data:
    # Redirect user
    print(data['checkoutUrl'])
```

### 2. Get Payment Status

**Endpoint**: `GET /api/payments/stripe/:paymentIntentId`

Retrieves the current status of a payment.

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `paymentIntentId` | string | Stripe payment intent or session ID |

#### Response (200 OK)
```json
{
  "id": "cs_live_...",
  "status": "completed",
  "amount": 2450,
  "currency": "USD",
  "paymentMethod": "card",
  "paymentMethodDetails": {
    "type": "card",
    "card": {
      "brand": "visa",
      "last4": "4242"
    }
  },
  "metadata": {
    "orderId": "ORD-12345"
  },
  "createdAt": "2026-05-09T10:30:00Z",
  "completedAt": "2026-05-09T10:31:45Z"
}
```

#### Example Usage

```javascript
async function getPaymentStatus(sessionId) {
  const response = await fetch(
    `https://api.example.com/api/payments/stripe/${sessionId}`,
    { method: 'GET' }
  );
  
  const data = await response.json();
  console.log(`Payment Status: ${data.status}`);
  return data;
}
```

### 3. Cancel Payment

**Endpoint**: `POST /api/payments/stripe/:paymentIntentId/cancel`

Cancels a pending payment.

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `paymentIntentId` | string | Stripe payment intent ID |

#### Response (200 OK)
```json
{
  "id": "cs_live_...",
  "status": "cancelled",
  "cancelledAt": "2026-05-09T10:35:00Z"
}
```

#### Example Usage

```javascript
async function cancelPayment(paymentIntentId) {
  const response = await fetch(
    `https://api.example.com/api/payments/stripe/${paymentIntentId}/cancel`,
    { method: 'POST' }
  );
  
  const data = await response.json();
  console.log(`Payment cancelled: ${data.id}`);
}
```

### 4. Refund Payment

**Endpoint**: `POST /api/payments/stripe/:paymentIntentId/refund`

Refunds a completed payment.

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `paymentIntentId` | string | Stripe payment intent ID |

#### Request Body (Optional)
```json
{
  "amount": 1225,
  "reason": "customer_request"
}
```

#### Request Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `amount` | number | Amount to refund (in smallest currency unit). Defaults to full amount |
| `reason` | string | Reason for refund: `duplicate`, `fraudulent`, `requested_by_customer` |

#### Response (200 OK)
```json
{
  "id": "re_...",
  "paymentIntentId": "cs_live_...",
  "status": "succeeded",
  "amount": 2450,
  "currency": "USD",
  "reason": "customer_request",
  "createdAt": "2026-05-09T10:35:00Z"
}
```

#### Example Usage

```javascript
// Full refund
async function refundPayment(paymentIntentId) {
  const response = await fetch(
    `https://api.example.com/api/payments/stripe/${paymentIntentId}/refund`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reason: 'customer_request'
      })
    }
  );
  
  return await response.json();
}

// Partial refund
async function partialRefund(paymentIntentId, amountInCents) {
  const response = await fetch(
    `https://api.example.com/api/payments/stripe/${paymentIntentId}/refund`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amountInCents,
        reason: 'requested_by_customer'
      })
    }
  );
  
  return await response.json();
}
```

### 5. Confirm Payment (Testing)

**Endpoint**: `POST /api/payments/stripe/:paymentIntentId/confirm`

Confirms a payment in test mode. Used for testing webhook flows.

#### Response (200 OK)
```json
{
  "id": "cs_live_...",
  "status": "completed",
  "message": "Payment confirmed for testing"
}
```

## Callback URLs

### Setup Payment Callback

Include a `callbackUrl` when creating a payment to receive status updates:

```json
{
  "amount": 24.50,
  "currency": "usd",
  "callbackUrl": "https://your-app.com/webhooks/stripe"
}
```

### Receive Callback

When payment status changes, the API sends a POST request to your callback URL:

```json
POST https://your-app.com/webhooks/stripe
{
  "event": "payment.status_changed",
  "status": "completed",
  "transactionId": "txn_...",
  "amount": 2450,
  "currency": "USD",
  "metadata": {
    "orderId": "ORD-12345"
  },
  "timestamp": "2026-05-09T10:31:45Z"
}
```

### Respond to Callback

Always respond with 2xx status to confirm receipt:

```javascript
app.post('/webhooks/stripe', (req, res) => {
  const { status, transactionId, amount } = req.body;
  
  // Process payment status update
  console.log(`Payment ${transactionId}: ${status}`);
  
  // Respond with 2xx to acknowledge
  res.status(200).json({ success: true });
});
```

## Amount Conversion

The API automatically handles currency conversions from decimal to smallest unit:

| Currency | Example Input | Converted Value | Unit |
|----------|---------------|-----------------|------|
| USD | `24.50` | `2450` | Cents |
| EUR | `19.99` | `1999` | Cents |
| GBP | `15.50` | `1550` | Pence |
| JPY | `1000` | `1000` | Yen (no decimals) |

**No manual conversion needed** - just send the decimal amount and the API handles it.

## Testing

### Test Cards

Use these card numbers in sandbox:

| Card Type | Number | CVC | Expires |
|-----------|--------|-----|---------|
| Visa | `4242 4242 4242 4242` | Any | Any future date |
| Mastercard | `5555 5555 5555 4444` | Any | Any future date |
| Amex | `3782 822463 10005` | Any | Any future date |

### Webhook Testing

Test callbacks locally using ngrok:

```bash
# Start ngrok
ngrok http 3000

# Your callback URL becomes
https://abc123.ngrok.io/webhooks/stripe

# Include in payment request
{
  "callbackUrl": "https://abc123.ngrok.io/webhooks/stripe"
}
```

## Error Handling

Common error scenarios and how to handle them:

```javascript
async function handlePaymentError(error) {
  if (error.code === 'INVALID_AMOUNT') {
    console.error('Amount must be greater than 0.50');
  } else if (error.code === 'DUPLICATE_REQUEST') {
    console.log('This payment was already created');
  } else if (error.code === 'PAYMENT_PROVIDER_ERROR') {
    console.error('Stripe API error:', error.details);
  } else {
    console.error('Unknown error:', error);
  }
}
```

## Best Practices

1. **Always Include Redirect URLs**: `successRedirectUrl` and `failureRedirectUrl` are required for Stripe checkout
   ```json
   {
     "successRedirectUrl": "https://your-app.com/payments/checkout?status=success",
     "failureRedirectUrl": "https://your-app.com/payments/checkout?status=failure"
   }
   ```

2. **Always use Idempotency Keys**: Prevent accidental duplicate charges
   ```bash
   -H "Idempotency-Key: unique-key-12345"
   ```

3. **Handle Webhooks**: Don't rely solely on redirect; use webhooks for payment confirmation

4. **Store Transaction IDs**: Save Stripe payment intent IDs for troubleshooting

5. **Use Correct Currencies**: Verify user's currency preference

6. **Test Thoroughly**: Use sandbox environment before going live

7. **Monitor Webhook Failures**: Implement retry logic for failed callbacks

## Troubleshooting

### Issue: "You passed an empty string for 'success_url'"
**Cause**: `successRedirectUrl` or `failureRedirectUrl` is empty or missing  
**Solution**: Both redirect URLs are required and must be valid URLs:
```json
{
  "amount": 100.00,
  "currency": "usd",
  "successRedirectUrl": "https://your-app.com/payments/checkout?status=success",
  "failureRedirectUrl": "https://your-app.com/payments/checkout?status=failure"
}
```

### Issue: "Checkout Session's total amount due must add up to at least $0.50"
**Cause**: Amount too small or not converted to cents  
**Solution**: Ensure amount is >= 0.50 and in correct currency unit

### Issue: "Payment intent not found"
**Cause**: Invalid or expired payment intent ID  
**Solution**: Check session ID, ensure it's not from different environment

### Issue: "Duplicate transaction"
**Cause**: Same idempotency key used twice  
**Solution**: This is expected behavior; idempotency keys should be unique per transaction

## Next Steps

- [Webhooks Integration](../webhooks/STRIPE_WEBHOOKS.md)
- [Error Handling Guide](../guides/ERROR_HANDLING.md)
- [Security Best Practices](../integration/SECURITY.md)
- [Testing Guide](../integration/SANDBOX_TESTING.md)

---

**API Version**: 1.0.0  
**Last Updated**: 2026-05-09  
**Status**: Production Ready
