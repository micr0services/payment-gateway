# Webhooks & Callback URLs

Complete guide to webhook integration and payment status notifications.

## Overview

Webhooks enable your application to receive real-time notifications when payment status changes. Instead of polling for status updates, webhooks push notifications to your application.

## Webhook Types

The API supports two webhook mechanisms:

### 1. Callback URLs (Custom Webhooks)
- **How it works**: You provide a callback URL when creating a payment
- **Trigger**: Payment status changes
- **Format**: Custom JSON payload
- **Reliability**: Automatic retry with exponential backoff
- **Verification**: Custom headers for authentication

### 2. Provider Webhooks
- **How it works**: Payment provider sends events to your webhook endpoint
- **Trigger**: Provider-specific events
- **Format**: Provider-specific JSON
- **Verification**: Provider signature verification

## Callback URLs

### Setup

When creating any payment, include a `callbackUrl`:

```json
{
  "amount": 24.50,
  "currency": "usd",
  "callbackUrl": "https://your-app.com/webhooks/payment-status"
}
```

### Webhook Request

The API sends a POST request to your callback URL with payment status:

```json
POST https://your-app.com/webhooks/payment-status
Content-Type: application/json
X-Payment-Callback: true
X-Callback-Version: 1.0

{
  "event": "payment.status_changed",
  "status": "completed",
  "transactionId": "txn_12345",
  "amount": 2450,
  "currency": "USD",
  "gateway": "stripe",
  "metadata": {
    "orderId": "ORD-12345"
  },
  "timestamp": "2026-05-09T14:30:00Z"
}
```

### Required Response

Your webhook handler must respond with HTTP 2xx status code:

```javascript
app.post('/webhooks/payment-status', (req, res) => {
  const { status, transactionId, amount } = req.body;
  
  // Process payment
  console.log(`Payment ${transactionId}: ${status}`);
  
  // Important: Always respond with 2xx
  res.status(200).json({ success: true });
});
```

**If you don't respond with 2xx, the API will retry the callback.**

### Callback Retry Logic

Failed callbacks are retried with exponential backoff:

| Attempt | Delay | Timeout |
|---------|-------|---------|
| 1 | 0s | 10s |
| 2 | 1s | 10s |
| 3 | 2s | 10s |
| 4 | 4s | 10s |

**Total time**: Up to ~7 seconds of delays + 40 seconds of timeouts

### Webhook Headers

Your callback URL receives these headers for verification:

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Payment-Callback` | `true` | Identifies as payment callback |
| `X-Callback-Version` | `1.0` | Callback format version |
| `Content-Type` | `application/json` | Always JSON |

### Callback Payload Format

```json
{
  "event": "payment.status_changed",
  "status": "completed",
  "transactionId": "txn_12345...",
  "amount": 2450,
  "currency": "USD",
  "gateway": "stripe",
  "metadata": {
    "orderId": "ORD-12345",
    "userId": "user-789"
  },
  "timestamp": "2026-05-09T14:30:00Z"
}
```

### Possible Status Values

| Status | Meaning |
|--------|---------|
| `pending` | Payment initiated |
| `processing` | Payment being processed |
| `completed` | Payment successful |
| `failed` | Payment failed |
| `cancelled` | Payment cancelled |
| `refunded` | Payment refunded |

## Provider Webhooks

### Stripe Webhooks

**Endpoint**: `POST /api/webhooks/stripe`

Stripe sends webhook events when payment status changes.

#### Stripe Verification

```javascript
app.post('/api/webhooks/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const body = req.rawBody; // Must be raw body, not parsed JSON
  
  try {
    // Verify using Stripe SDK
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    // Handle event
    switch (event.type) {
      case 'payment_intent.succeeded':
        handlePaymentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        handlePaymentFailed(event.data.object);
        break;
    }
    
    res.json({ received: true });
  } catch (error) {
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});
```

#### Stripe Events

| Event | Trigger |
|-------|---------|
| `payment_intent.succeeded` | Payment completed |
| `payment_intent.payment_failed` | Payment failed |
| `payment_intent.canceled` | Payment cancelled |
| `payment_intent.processing` | Payment processing |
| `charge.dispute.created` | Chargeback initiated |

### PayPal Webhooks

**Endpoint**: `POST /api/webhooks/paypal`

PayPal sends webhook events for order status changes.

#### PayPal Verification

```javascript
app.post('/api/webhooks/paypal', async (req, res) => {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  
  try {
    // Verify using PayPal SDK
    await client.verifyWebhookSignature({
      webhook_id: webhookId,
      webhook_event: req.body
    });
    
    // Handle event
    const event = req.body;
    switch (event.event_type) {
      case 'CHECKOUT.ORDER.APPROVED':
        handleOrderApproved(event.resource);
        break;
      case 'CHECKOUT.ORDER.COMPLETED':
        handleOrderCompleted(event.resource);
        break;
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

#### PayPal Events

| Event | Trigger |
|-------|---------|
| `CHECKOUT.ORDER.CREATED` | Order created |
| `CHECKOUT.ORDER.APPROVED` | Order approved by user |
| `CHECKOUT.ORDER.COMPLETED` | Order completed |

### M-Pesa Webhooks

**Endpoint**: `POST /api/webhooks/mpesa`

M-Pesa sends callback data to your registered callback URL.

#### M-Pesa Callback Format

```json
POST /api/webhooks/mpesa
{
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "26439-1234567890",
      "CheckoutRequestID": "ws_CO_DMZ_ID",
      "ResultCode": 0,
      "ResultDesc": "The service request has been processed successfully.",
      "Amount": 500,
      "MpesaReceiptNumber": "MK451H35ZB",
      "TransactionDate": 20260509103145,
      "PhoneNumber": 254712345678
    }
  }
}
```

#### M-Pesa Result Codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | Timeout |
| `26` | Insufficient balance |
| `1011` | User cancelled |

## Webhook Implementation Best Practices

### 1. Verify Before Processing

Always verify webhook signatures:

```javascript
// Stripe
const event = stripe.webhooks.constructEvent(body, sig, secret);

// PayPal
await client.verifyWebhookSignature({ webhook_id, webhook_event });

// Custom callbacks - check X-Payment-Callback header
if (req.headers['x-payment-callback'] !== 'true') {
  return res.status(401).json({ error: 'Invalid webhook' });
}
```

### 2. Idempotent Processing

Webhooks may be delivered multiple times. Ensure idempotent processing:

```javascript
app.post('/webhooks/payment', async (req, res) => {
  const { transactionId, status } = req.body;
  
  // Check if already processed
  const existing = await Transaction.findById(transactionId);
  if (existing && existing.status === status) {
    // Already processed, return success
    return res.status(200).json({ success: true });
  }
  
  // Process new status
  await Transaction.updateStatus(transactionId, status);
  res.status(200).json({ success: true });
});
```

### 3. Respond Quickly

Respond with 2xx immediately, process asynchronously:

```javascript
app.post('/webhooks/payment', async (req, res) => {
  // Respond immediately
  res.status(200).json({ success: true });
  
  // Process asynchronously
  setImmediate(async () => {
    await processPayment(req.body);
  });
});
```

### 4. Use Queue/Job System

For critical operations, use a queue:

```javascript
app.post('/webhooks/payment', async (req, res) => {
  // Add to queue
  await paymentQueue.add(req.body);
  
  // Respond immediately
  res.status(200).json({ success: true });
});

// Process in background
paymentQueue.process(async (job) => {
  await processPayment(job.data);
});
```

### 5. Log All Webhooks

Always log for debugging:

```javascript
app.post('/webhooks/payment', async (req, res) => {
  console.log('Webhook received:', {
    timestamp: new Date().toISOString(),
    transactionId: req.body.transactionId,
    status: req.body.status,
    amount: req.body.amount
  });
  
  // ... process
});
```

### 6. Handle Webhook Failures

Implement retry logic on your end:

```javascript
async function processPaymentWithRetry(paymentData, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await updateTransaction(paymentData);
      return;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      
      if (i < maxRetries - 1) {
        // Exponential backoff
        await sleep(Math.pow(2, i) * 1000);
      }
    }
  }
  
  // Log for manual review
  console.error('Failed to process payment after retries:', paymentData);
}
```

## Testing Webhooks Locally

### Option 1: ngrok

```bash
# Terminal 1: Start your server
npm start

# Terminal 2: Expose with ngrok
ngrok http 3000

# Use ngrok URL in payment request
{
  "callbackUrl": "https://abc123.ngrok.io/webhooks/payment"
}
```

### Option 2: Webhook Testing Service

Use services like Webhook.cool or Webhook.site:

```bash
# Get unique URL
https://webhook.site/unique-id

# Use in payment request
{
  "callbackUrl": "https://webhook.site/unique-id"
}

# View requests at: https://webhook.site/unique-id
```

### Option 3: Mock Webhook

Test webhook handling manually:

```bash
curl -X POST http://localhost:3000/webhooks/payment \
  -H "Content-Type: application/json" \
  -H "X-Payment-Callback: true" \
  -d '{
    "event": "payment.status_changed",
    "status": "completed",
    "transactionId": "txn_test_123",
    "amount": 2450,
    "currency": "USD"
  }'
```

## Webhook Event Flow Examples

### Stripe Payment Flow

```
1. User submits payment
        │
        ▼
2. POST /api/payments/stripe
        │
        ▼
3. Return checkoutUrl
        │
        ▼
4. User redirected to Stripe Checkout
        │
        ▼
5. User completes payment on Stripe
        │
        ▼
6. Stripe sends webhook to /api/webhooks/stripe
        │
        ▼
7. API processes webhook and sends callback to your callbackUrl
        │
        ▼
8. Your app receives status update at /webhooks/payment
```

### M-Pesa Payment Flow

```
1. User clicks Pay
        │
        ▼
2. POST /api/payments/mpesa/stk
        │
        ▼
3. Return checkoutRequestId
        │
        ▼
4. M-Pesa prompt on user's phone
        │
        ▼
5. User enters PIN
        │
        ▼
6. M-Pesa sends callback to /api/webhooks/mpesa
        │
        ▼
7. API forwards to your callbackUrl
        │
        ▼
8. Your app processes status at /webhooks/payment
```

## Webhook Security

### 1. Verify Signatures

Always verify webhook signatures from providers.

### 2. Use HTTPS

Always use HTTPS for webhook URLs:

```json
{
  "callbackUrl": "https://your-app.com/webhooks/payment"
}
```

### 3. Validate Source

Check webhook headers and source IP.

### 4. Rate Limiting

Implement rate limiting on webhook endpoints:

```javascript
const rateLimit = require('express-rate-limit');

const webhookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per 15 minutes
});

app.post('/webhooks/payment', webhookLimiter, async (req, res) => {
  // ... handle webhook
});
```

## Common Issues

### Issue: Webhooks not received
**Solution**: 
- Ensure callback URL is publicly accessible
- Check firewall/security groups
- Verify HTTPS certificate
- Check application logs

### Issue: Duplicate webhook processing
**Solution**: 
- Implement idempotent handlers
- Use unique transaction IDs
- Check for existing records before updating

### Issue: Webhook timeout
**Solution**:
- Respond with 2xx immediately
- Process asynchronously
- Don't make long-running operations in webhook handler

## Next Steps

- [Error Handling Guide](../guides/ERROR_HANDLING.md)
- [Security Best Practices](../integration/SECURITY.md)
- [Troubleshooting](../guides/TROUBLESHOOTING.md)

---

**API Version**: 1.0.0  
**Last Updated**: 2026-05-09  
**Status**: Production Ready
