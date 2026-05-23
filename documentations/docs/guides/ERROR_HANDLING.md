# Error Handling Guide

Complete guide to handling API errors and debugging payment issues.

## Error Response Format

All API errors follow a consistent format:

```json
{
  "success": false,
  "error": "Invalid amount provided",
  "code": "INVALID_AMOUNT",
  "details": {
    "field": "amount",
    "reason": "Amount must be greater than 0",
    "value": 0
  },
  "timestamp": "2026-05-09T14:30:00Z"
}
```

### Response Fields

| Field | Description |
|-------|-------------|
| `success` | Always `false` for errors |
| `error` | Human-readable error message |
| `code` | Machine-readable error code |
| `details` | Additional context (optional) |
| `timestamp` | When error occurred |

## HTTP Status Codes

| Status | Meaning | Common Causes |
|--------|---------|---------------|
| `400` | Bad Request | Invalid parameters, validation errors |
| `401` | Unauthorized | Missing/invalid authentication |
| `402` | Payment Required | Payment hasn't been approved yet |
| `409` | Conflict | Duplicate request/transaction |
| `429` | Rate Limited | Too many requests |
| `500` | Internal Server Error | Server-side issue |
| `502` | Bad Gateway | Payment provider API error |
| `503` | Service Unavailable | Temporary service outage |

## Error Codes

### Validation Errors (400)

| Code | Message | Solution |
|------|---------|----------|
| `INVALID_AMOUNT` | "Valid amount is required" | Amount must be > 0 |
| `INVALID_CURRENCY` | "Currency not supported" | Use supported currency code |
| `INVALID_PHONE_NUMBER` | "Invalid phone number format" | Use format 254712345678 |
| `INVALID_EMAIL` | "Invalid email format" | Provide valid email |
| `INVALID_URL` | "Invalid callback URL" | Use valid HTTPS URL |

### Business Logic Errors (400-409)

| Code | Message | Solution |
|------|---------|----------|
| `DUPLICATE_REQUEST` | "Transaction already exists" | Use unique idempotency key |
| `DUPLICATE_TRANSACTION` | "A transaction with this ID already exists" | Different transaction already created |
| `PAYMENT_PROVIDER_ERROR` | "Payment provider returned error" | Check provider-specific error details |
| `INSUFFICIENT_FUNDS` | "User has insufficient balance" | Request user to top up |
| `PAYMENT_DECLINED` | "Payment was declined" | Card/account issue, user should retry |
| `PAYMENT_EXPIRED` | "Payment link has expired" | Redirect user to create new payment |
| `PAYMENT_CANCELLED` | "Payment was cancelled by user" | Allow user to retry |

### Database Errors (500)

| Code | Message | Solution |
|------|---------|----------|
| `DATABASE_ERROR` | "Database operation failed" | Retry request, contact support if persists |
| `DATABASE_CONNECTION_ERROR` | "Failed to connect to database" | Service temporarily unavailable |

### Authentication Errors (401)

| Code | Message | Solution |
|------|---------|----------|
| `UNAUTHORIZED` | "Authentication required" | Include valid API key |
| `INVALID_API_KEY` | "Invalid or expired API key" | Check API key configuration |
| `MISSING_API_KEY` | "API key not provided" | Include Authorization header |

### Rate Limiting (429)

| Code | Message | Solution |
|------|---------|----------|
| `RATE_LIMITED` | "Too many requests" | Implement exponential backoff |
| `QUOTA_EXCEEDED` | "Monthly quota exceeded" | Upgrade plan or wait for reset |

### Provider-Specific Errors (400-502)

#### Stripe Errors

```json
{
  "code": "STRIPE_ERROR",
  "error": "Stripe API error",
  "details": {
    "type": "card_error",
    "charge": "ch_1234567890",
    "message": "Your card has insufficient funds",
    "param": "card"
  }
}
```

| Stripe Code | Solution |
|-------------|----------|
| `card_declined` | Card was declined, use different card |
| `expired_card` | Card is expired |
| `incorrect_cvc` | CVC is incorrect |
| `processing_error` | Stripe internal error, retry |
| `rate_limit` | Stripe rate limit, retry with backoff |

#### PayPal Errors

```json
{
  "code": "PAYPAL_ERROR",
  "error": "PayPal API error",
  "details": {
    "name": "VALIDATION_ERROR",
    "message": "Invalid request - see details",
    "details": [{
      "field": "amount",
      "issue": "Amount must be greater than 0"
    }]
  }
}
```

#### M-Pesa Errors

```json
{
  "responseCode": "1",
  "responseDescription": "The system is unable to process your transaction.",
  "resultCode": "26",
  "resultDesc": "Insufficient balance"
}
```

| M-Pesa Result Code | Solution |
|------------------|----------|
| `0` | Success |
| `1` | Timeout, user took too long |
| `26` | Insufficient balance |
| `1011` | User cancelled |
| `1001` | Unable to lock subscriber record |

## Error Handling Examples

### JavaScript/Node.js

```javascript
async function handlePayment(amount, currency) {
  try {
    const response = await fetch('https://api.example.com/api/payments/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': 'unique-key-' + Date.now()
      },
      body: JSON.stringify({ amount, currency })
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle error response
      switch (data.code) {
        case 'INVALID_AMOUNT':
          console.error('Amount must be greater than 0');
          break;
        case 'DUPLICATE_REQUEST':
          console.log('Transaction already exists');
          break;
        case 'PAYMENT_PROVIDER_ERROR':
          console.error('Payment provider error:', data.details);
          break;
        default:
          console.error('Unknown error:', data.error);
      }
      throw new Error(data.error);
    }

    // Success
    return data;

  } catch (error) {
    console.error('Payment error:', error);
    throw error;
  }
}
```

### With Retry Logic

```javascript
async function handlePaymentWithRetry(amount, currency, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await handlePayment(amount, currency);
    } catch (error) {
      // Don't retry for validation errors
      if (error.code === 'INVALID_AMOUNT' || 
          error.code === 'INVALID_CURRENCY') {
        throw error;
      }

      // Retry for transient errors
      if (i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; // Exponential backoff
        console.log(`Retry attempt ${i + 1} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}
```

### Python

```python
import requests
import time

def handle_payment_with_retry(amount, currency, max_retries=3):
    for attempt in range(max_retries):
        try:
            response = requests.post(
                'https://api.example.com/api/payments/stripe',
                json={'amount': amount, 'currency': currency},
                headers={'Idempotency-Key': f'unique-key-{time.time()}'}
            )
            
            if response.status_code >= 400:
                data = response.json()
                
                # Don't retry validation errors
                if data['code'] in ['INVALID_AMOUNT', 'INVALID_CURRENCY']:
                    raise ValueError(data['error'])
                
                # Log error
                print(f"API Error: {data['code']} - {data['error']}")
                
                # Retry for transient errors
                if attempt < max_retries - 1:
                    delay = 2 ** attempt
                    print(f"Retrying after {delay}s...")
                    time.sleep(delay)
                    continue
                else:
                    raise Exception(data['error'])
            
            return response.json()
            
        except Exception as error:
            print(f"Attempt {attempt + 1} failed: {error}")
            if attempt == max_retries - 1:
                raise
```

## Debugging Strategies

### 1. Enable Logging

Log all API requests and responses:

```javascript
async function loggedFetch(url, options = {}) {
  const startTime = Date.now();
  console.log(`[API] ${options.method || 'GET'} ${url}`);
  console.log(`[API] Request body:`, options.body);

  const response = await fetch(url, options);
  const duration = Date.now() - startTime;

  console.log(`[API] Response ${response.status} (${duration}ms)`);
  console.log(`[API] Response body:`, await response.clone().json());

  return response;
}
```

### 2. Check Headers

Verify correct headers are being sent:

```javascript
const headers = {
  'Content-Type': 'application/json',
  'Idempotency-Key': 'unique-key-12345',
  'Authorization': 'Bearer YOUR_API_KEY'
};

console.log('Headers:', headers);
// Ensure all required headers are present
```

### 3. Validate Input

Always validate before sending:

```javascript
function validatePaymentInput(amount, currency) {
  if (!amount || amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }
  
  const validCurrencies = ['usd', 'eur', 'gbp', 'kes'];
  if (!validCurrencies.includes(currency.toLowerCase())) {
    throw new Error(`Currency must be one of: ${validCurrencies.join(', ')}`);
  }
}

// Use before sending
try {
  validatePaymentInput(24.50, 'usd');
  await handlePayment(24.50, 'usd');
} catch (error) {
  console.error('Validation failed:', error);
}
```

### 4. Check Webhook Logs

Monitor webhook delivery:

```javascript
// Log all webhook activity
app.post('/webhooks/payment', (req, res) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    headers: req.headers,
    body: req.body,
    ip: req.ip
  };
  
  console.log('[WEBHOOK]', JSON.stringify(logEntry, null, 2));
  
  // Process webhook
  res.json({ success: true });
});
```

### 5. Use Sandbox Environment

Test thoroughly in sandbox before production:

```javascript
const ENV = process.env.NODE_ENV;
const API_URL = ENV === 'production'
  ? 'https://api.payment-gateway.com'
  : 'https://sandbox.payment-gateway.com';

console.log(`Using API endpoint: ${API_URL}`);
```

## Common Issues and Solutions

### Issue: "Amount must be greater than 0"
**Cause**: Sending 0 or negative amount  
**Solution**: Validate amount before sending, ensure it's > 0

### Issue: "Duplicate transaction"
**Cause**: Same idempotency key sent twice  
**Solution**: Use unique idempotency keys, this is expected behavior for retries

### Issue: "Insufficient balance" (M-Pesa)
**Cause**: User doesn't have enough M-Pesa balance  
**Solution**: Show user error message, suggest topping up

### Issue: "Card declined"
**Cause**: Card issue or fraud detection  
**Solution**: User should try different card or contact bank

### Issue: "Webhook not received"
**Cause**: Callback URL not accessible or returning error  
**Solution**: Ensure HTTPS, publicly accessible, responds with 2xx

### Issue: "Rate limited"
**Cause**: Too many requests in short time  
**Solution**: Implement exponential backoff, cache results

### Issue: "Invalid phone number"
**Cause**: Wrong format  
**Solution**: Use format 254712345678 (country code + 9 digits)

## Support Resources

- **API Documentation**: See [API Reference](../INDEX.md)
- **Webhook Troubleshooting**: See [Webhooks Guide](../api/webhooks/README.md)
- **Security Issues**: See [Security Guide](../integration/SECURITY.md)

---

**Last Updated**: 2026-05-09
