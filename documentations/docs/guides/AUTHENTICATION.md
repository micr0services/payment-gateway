# Authentication Guide

Complete guide to authenticating API requests.

## Overview

The Payment Gateway API uses bearer token authentication for API requests. All requests must include a valid API key in the Authorization header.

## Getting Your API Key

1. Log in to the developer dashboard
2. Navigate to Settings → API Keys
3. Click "Generate New Key"
4. Copy and store securely (only shown once)

## Authentication Methods

### Method 1: Bearer Token (Recommended)

Include API key in Authorization header:

```bash
curl -H "Authorization: Bearer sk_live_..." \
  https://api.example.com/api/payments/stripe
```

### Method 2: API Key Header

Some endpoints accept API key as custom header:

```bash
curl -H "X-API-Key: sk_live_..." \
  https://api.example.com/api/payments/stripe
```

## Authenticated Requests

### Request Format

```http
POST /api/payments/stripe HTTP/1.1
Host: api.example.com
Authorization: Bearer sk_live_1234567890abcdef
Content-Type: application/json
Idempotency-Key: unique-key-12345

{
  "amount": 24.50,
  "currency": "usd"
}
```

### JavaScript/Node.js

```javascript
const apiKey = process.env.PAYMENT_GATEWAY_API_KEY;

const response = await fetch('https://api.example.com/api/payments/stripe', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 24.50,
    currency: 'usd'
  })
});
```

### Python

```python
import os
import requests

api_key = os.getenv('PAYMENT_GATEWAY_API_KEY')

headers = {
    'Authorization': f'Bearer {api_key}',
    'Content-Type': 'application/json'
}

response = requests.post(
    'https://api.example.com/api/payments/stripe',
    json={
        'amount': 24.50,
        'currency': 'usd'
    },
    headers=headers
)
```

### PHP

```php
<?php
$apiKey = getenv('PAYMENT_GATEWAY_API_KEY');

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => 'https://api.example.com/api/payments/stripe',
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json'
    ],
    CURLOPT_POSTFIELDS => json_encode([
        'amount' => 24.50,
        'currency' => 'usd'
    ])
]);

$response = curl_exec($ch);
?>
```

## API Key Types

### Live Keys

Used in production. Real transactions are processed.

```
sk_live_1234567890abcdefghijklmnop  # Live key format
```

**Security**: Treat as sensitive as a password

### Sandbox Keys

Used for testing. Transactions don't process real payments.

```
sk_test_1234567890abcdefghijklmnop  # Test key format
```

**Usage**: For development and testing only

## API Key Security

### Best Practices

1. **Store Securely**
   - Use environment variables
   - Never commit to version control
   - Store in secure credential manager

2. **Rotate Regularly**
   - Rotate keys every 90 days
   - Maintain multiple keys for zero-downtime rotation
   - Revoke compromised keys immediately

3. **Limit Scope**
   - Create separate keys for different applications
   - Use least privilege principle
   - Restrict to necessary operations

4. **Monitor Usage**
   - Review API key activity logs
   - Set up alerts for unusual patterns
   - Audit key access regularly

### Storing in Environment Variables

Create `.env` file:

```bash
# .env (never commit this file)
PAYMENT_GATEWAY_API_KEY=sk_live_...
PAYMENT_GATEWAY_WEBHOOK_SECRET=whsec_...
DATABASE_URL=postgresql://...
```

Add to `.gitignore`:

```bash
# .gitignore
.env
.env.local
.env.production
*.key
```

Access in code:

```javascript
// Node.js
const apiKey = process.env.PAYMENT_GATEWAY_API_KEY;

// Python
import os
api_key = os.getenv('PAYMENT_GATEWAY_API_KEY')

// PHP
$apiKey = getenv('PAYMENT_GATEWAY_API_KEY');
```

## Idempotency Key Header

All POST requests should include an Idempotency-Key header to prevent duplicate processing:

```bash
curl -X POST https://api.example.com/api/payments/stripe \
  -H "Authorization: Bearer sk_live_..." \
  -H "Idempotency-Key: unique-key-12345" \
  -d '{"amount": 24.50}'
```

### Generating Unique Keys

```javascript
// Using UUID
const { v4: uuidv4 } = require('uuid');
const idempotencyKey = uuidv4();

// Using timestamp + random
const idempotencyKey = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Using order ID
const idempotencyKey = `order-${orderId}-${timestamp}`;
```

## Authentication Errors

### 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "code": "UNAUTHORIZED",
  "message": "Authentication required"
}
```

**Causes**:
- Missing Authorization header
- Invalid API key
- Expired API key

**Solution**: Include valid API key in Authorization header

### 403 Forbidden

```json
{
  "error": "Forbidden",
  "code": "FORBIDDEN",
  "message": "API key doesn't have permission for this action"
}
```

**Causes**:
- API key doesn't have required permissions
- API key restricted to different environment

**Solution**: Use correct API key with appropriate permissions

## Testing Authentication

### Test with cURL

```bash
# Test with valid key
curl -i -H "Authorization: Bearer sk_test_..." \
  https://api.example.com/api/payments/stripe

# Should return 200 or 400 (for missing required params)

# Test with invalid key
curl -i -H "Authorization: Bearer invalid_key" \
  https://api.example.com/api/payments/stripe

# Should return 401 Unauthorized
```

### Test with Postman

1. Create new request
2. Go to "Headers" tab
3. Add header:
   - Key: `Authorization`
   - Value: `Bearer sk_test_...`
4. Send request

## Rate Limits

Rate limits are based on authentication:

| Type | Limit | Reset |
|------|-------|-------|
| Authenticated | 1000 req/min | Every minute |
| Unauthenticated | 100 req/min | Every minute |
| Burst | 10 req/sec | Every second |

### Rate Limit Headers

Responses include rate limit information:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1620086400
```

## OAuth 2.0 (Future)

OAuth 2.0 support coming soon for third-party integrations.

```javascript
// OAuth 2.0 flow (future)
const token = await getOAuthToken({
  client_id: 'your_client_id',
  client_secret: 'your_client_secret',
  grant_type: 'client_credentials'
});

// Use token
fetch('https://api.example.com/api/payments/stripe', {
  headers: {
    'Authorization': `Bearer ${token.access_token}`
  }
});
```

## Common Issues

### Issue: "Invalid API key"
**Cause**: API key format incorrect or typo  
**Solution**: Copy key exactly from dashboard, check for extra spaces

### Issue: "Unauthorized"
**Cause**: Missing or malformed Authorization header  
**Solution**: Include header as `Authorization: Bearer sk_...`

### Issue: "Forbidden - insufficient permissions"
**Cause**: API key doesn't have required scope  
**Solution**: Use API key with appropriate permissions

### Issue: "Rate limited"
**Cause**: Too many requests  
**Solution**: Implement exponential backoff, respect rate limit headers

## Security Checklist

- [ ] API key stored in environment variable, not code
- [ ] .env file added to .gitignore
- [ ] API key never logged or exposed
- [ ] HTTPS used for all requests
- [ ] Idempotency-Key included in POST requests
- [ ] Rate limit headers monitored
- [ ] Key rotation scheduled quarterly
- [ ] Webhook signatures verified
- [ ] Multiple keys created for different environments

## Next Steps

- [Security Best Practices](SECURITY.md)
- [Error Handling](ERROR_HANDLING.md)
- [Sandbox Testing](SANDBOX_TESTING.md)

---

**Last Updated**: 2026-05-09
