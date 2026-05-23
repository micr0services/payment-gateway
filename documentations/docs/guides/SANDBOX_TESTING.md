# Sandbox Testing Guide

Complete guide to testing payments in the sandbox environment.

## Overview

The sandbox environment is a risk-free testing environment where you can develop and test payment integration without processing real transactions.

## Environment Setup

### API Endpoints

| Environment | URL |
|-------------|-----|
| Production | `https://api.payment-gateway.com` |
| Sandbox | `https://sandbox.api.payment-gateway.com` |

### Configuration

```javascript
const env = process.env.NODE_ENV;
const API_URL = env === 'production'
  ? 'https://api.payment-gateway.com'
  : 'https://sandbox.api.payment-gateway.com';

const API_KEY = env === 'production'
  ? process.env.PRODUCTION_API_KEY
  : process.env.SANDBOX_API_KEY;
```

## Sandbox Credentials

### Stripe Sandbox

**Test Card Numbers:**
| Card | Number | CVC | Expires |
|------|--------|-----|---------|
| Visa | 4242 4242 4242 4242 | Any | Any future |
| Mastercard | 5555 5555 5555 4444 | Any | Any future |
| Amex | 3782 822463 10005 | Any | Any future |
| Declined | 4000 0000 0000 0002 | Any | Any future |

**Test Amounts:**
- Amount ending in 0 → Success
- Amount ending in 2 → Declined
- Amount < $0.50 → Insufficient funds

### PayPal Sandbox

Create test accounts at: https://sandbox.paypal.com

**Test Accounts:**
- Buyer: buyer@example.com / password
- Seller: seller@example.com / password

### M-Pesa Sandbox

**Credentials:**
- Business Short Code: 174379
- Consumer Key: [Your sandbox key]
- Consumer Secret: [Your sandbox secret]

**Test Phone Numbers:**
- 254712345678
- 254710000000

## Testing Common Scenarios

### Test Stripe Payment

```javascript
async function testStripePayment() {
  const response = await fetch(
    'https://sandbox.api.payment-gateway.com/api/payments/stripe',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SANDBOX_API_KEY}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `test-${Date.now()}`
      },
      body: JSON.stringify({
        amount: 24.50,
        currency: 'usd',
        callbackUrl: 'https://your-test-app.com/webhooks/stripe'
      })
    }
  );

  const data = await response.json();
  console.log('Checkout URL:', data.checkoutUrl);
  // Use test card: 4242 4242 4242 4242
}
```

### Test PayPal Payment

```javascript
async function testPayPalPayment() {
  const response = await fetch(
    'https://sandbox.api.payment-gateway.com/api/payments/paypal',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SANDBOX_API_KEY}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `test-${Date.now()}`
      },
      body: JSON.stringify({
        amount: 24.50,
        currency: 'USD',
        callbackUrl: 'https://your-test-app.com/webhooks/paypal'
      })
    }
  );

  const data = await response.json();
  console.log('Approval URL:', data.approvalUrl);
  // Login with sandbox account
}
```

### Test M-Pesa STK

```javascript
async function testMpesaSTK() {
  const response = await fetch(
    'https://sandbox.api.payment-gateway.com/api/payments/mpesa/stk',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SANDBOX_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mobileNumber: '254712345678',
        amount: 500,
        accountReference: 'TEST-12345',
        transactionDesc: 'Test payment',
        callbackUrl: 'https://your-test-app.com/webhooks/mpesa'
      })
    }
  );

  const data = await response.json();
  console.log('Checkout Request ID:', data.checkoutRequestId);
  // Check status using checkoutRequestId
}
```

## Webhook Testing

### Option 1: ngrok

Expose local server to internet:

```bash
# Terminal 1: Start your app
npm start

# Terminal 2: Run ngrok
ngrok http 3000

# Use ngrok URL in webhook
https://abc123.ngrok.io/webhooks/stripe
```

### Option 2: Webhook.site

Use free webhook inspection service:

```bash
# Get unique URL
https://webhook.site/unique-id

# Use in payment request
{
  "callbackUrl": "https://webhook.site/unique-id"
}

# View requests at webhook.site
```

### Option 3: Mock Webhooks

Manually test webhook handlers:

```bash
# Simulate Stripe webhook
curl -X POST http://localhost:3000/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{
    "event": "payment.status_changed",
    "status": "completed",
    "transactionId": "txn_test_123",
    "amount": 2450,
    "currency": "USD"
  }'
```

## Test Data

### Valid Test Amounts

| Amount | Result |
|--------|--------|
| $0.51 - $99.99 | Success |
| $100.00 | Visa only |
| $200.00 | Mastercard only |
| $300.00 | Amex only |

### Test Errors

```javascript
// Simulate insufficient funds
{
  "amount": 0.49,
  "currency": "usd"
}

// Simulate invalid amount
{
  "amount": -10,
  "currency": "usd"
}

// Simulate invalid currency
{
  "amount": 50,
  "currency": "xyz"
}
```

## Testing Webhooks Locally

### Complete Test Flow

```javascript
// 1. Start local webhook server
app.post('/webhooks/test', (req, res) => {
  console.log('Webhook received:', req.body);
  res.json({ success: true });
});

app.listen(3000);

// 2. Start ngrok in another terminal
// ngrok http 3000

// 3. Create payment with ngrok URL
fetch('https://sandbox.api.payment-gateway.com/api/payments/stripe', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SANDBOX_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 24.50,
    currency: 'usd',
    callbackUrl: 'https://abc123.ngrok.io/webhooks/test'
  })
});

// 4. Complete payment in browser

// 5. Check webhook server logs for callback
```

## Test Checklist

- [ ] API key configured for sandbox
- [ ] API endpoint set to sandbox URL
- [ ] HTTPS used for all requests
- [ ] Idempotency keys included
- [ ] Test cards valid in sandbox
- [ ] Payment succeeds with valid test card
- [ ] Payment fails with declined card
- [ ] Webhook delivery works locally
- [ ] Callback URL responds with 2xx
- [ ] Transaction recorded in database
- [ ] Error handling works correctly
- [ ] Retry logic functions properly
- [ ] Rate limiting doesn't trigger

## Common Test Scenarios

### Scenario 1: Successful Payment

```javascript
const payment = {
  amount: 50.00,
  currency: 'usd',
  callbackUrl: webhook_url
};
// Use test card: 4242 4242 4242 4242
// Expected: Payment succeeds, webhook received
```

### Scenario 2: Declined Card

```javascript
const payment = {
  amount: 50.00,
  currency: 'usd',
  callbackUrl: webhook_url
};
// Use test card: 4000 0000 0000 0002
// Expected: Payment fails, error received
```

### Scenario 3: Insufficient Funds

```javascript
const payment = {
  amount: 0.49,
  currency: 'usd'
};
// Expected: Error - amount too small
```

### Scenario 4: Duplicate Request

```javascript
const key = 'idempotency-key-123';
// Send same payment twice with same key
// Expected: First succeeds, second returns same result (no duplicate charge)
```

### Scenario 5: Webhook Retry

```javascript
// Configure webhook to return 500 on first attempt
// Expected: API retries webhook up to 3 times
// Then webhook receives successful callback
```

## Performance Testing

### Load Testing

```bash
# Test with Apache Bench
ab -n 100 -c 10 https://sandbox.api.payment-gateway.com/api/transactions/all

# Test with wrk
wrk -t4 -c100 -d30s https://sandbox.api.payment-gateway.com/api/transactions/all
```

## Debugging Tips

### Enable Detailed Logging

```javascript
// Log all requests/responses
fetch(url, options)
  .then(async (res) => {
    console.log('Status:', res.status);
    console.log('Headers:', Object.fromEntries(res.headers));
    const data = await res.json();
    console.log('Body:', JSON.stringify(data, null, 2));
    return res;
  });
```

### Check Webhook Delivery

```javascript
// Log incoming webhooks
app.post('/webhooks/*', (req, res) => {
  console.log({
    timestamp: new Date().toISOString(),
    path: req.path,
    headers: req.headers,
    body: req.body
  });
  res.json({ success: true });
});
```

## Migration to Production

### Pre-Production Checklist

- [ ] All tests pass
- [ ] Error handling tested
- [ ] Webhooks working
- [ ] Security review completed
- [ ] Rate limiting configured
- [ ] Monitoring enabled
- [ ] Alerts configured
- [ ] Backup strategy in place
- [ ] Rollback plan documented

### Data Migration

```javascript
// Get all sandbox transactions (optional)
const response = await fetch(
  'https://sandbox.api.payment-gateway.com/api/transactions/all?take=1000',
  { headers: { 'Authorization': `Bearer ${SANDBOX_API_KEY}` } }
);
const sandboxData = await response.json();
// Archive or migrate as needed
```

### Configuration Switch

```javascript
// Before going live
process.env.NODE_ENV = 'production';
process.env.API_KEY = process.env.PRODUCTION_API_KEY;
// Restart application
```

## Troubleshooting

### Test Payment Not Processing

1. Check API key is for sandbox
2. Verify endpoint is sandbox URL
3. Check test card is valid
4. Look for validation errors in response

### Webhook Not Received

1. Ensure callback URL is publicly accessible
2. Check webhook server is running
3. Verify ngrok/webhook service is active
4. Check firewall/security groups

### Duplicate Payment Prevention

1. Verify idempotency key is unique
2. Check key is sent in all requests
3. Confirm database constraint exists

---

**Last Updated**: 2026-05-09
