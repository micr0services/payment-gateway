# Security Best Practices

Comprehensive security guide for integrating the Payment Gateway API.

## Overview

Payment processing involves handling sensitive financial data. This guide outlines security best practices to protect your application and users.

## 1. API Key Management

### Store Securely

Never commit API keys to version control:

```bash
# ✅ Good - Use environment variables
API_KEY=sk_live_... npm start

# ✅ Good - Use .env file (ignored by git)
# .env
API_KEY=sk_live_...

# ❌ Bad - Hardcoded in code
const API_KEY = "sk_live_...";
```

### Environment Configuration

Use environment-specific files:

```javascript
// config.js
const config = {
  development: {
    API_URL: 'https://sandbox.api.example.com',
    API_KEY: process.env.SANDBOX_API_KEY
  },
  production: {
    API_URL: 'https://api.example.com',
    API_KEY: process.env.PRODUCTION_API_KEY
  }
};

module.exports = config[process.env.NODE_ENV];
```

### Rotate Keys Regularly

- Rotate API keys every 90 days
- Immediately revoke compromised keys
- Keep multiple keys for zero-downtime rotation

## 2. HTTPS & TLS

### Always Use HTTPS

```javascript
// ❌ Bad - No encryption
fetch('http://api.example.com/payments');

// ✅ Good - Encrypted connection
fetch('https://api.example.com/payments');
```

### Callback URLs

All callback URLs must use HTTPS:

```json
{
  "callbackUrl": "https://your-app.com/webhooks/payment"
}
```

### Certificate Validation

Validate SSL certificates in production:

```javascript
// Use in production (default in Node.js)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';

// ❌ Never disable in production
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // SECURITY RISK
```

## 3. Input Validation

### Validate All Input

```javascript
function validatePaymentInput(req) {
  const { amount, currency, callbackUrl } = req.body;

  // Validate amount
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    throw new Error('Invalid amount');
  }

  // Validate currency
  const validCurrencies = ['usd', 'eur', 'gbp', 'kes'];
  if (!validCurrencies.includes(currency?.toLowerCase())) {
    throw new Error('Invalid currency');
  }

  // Validate callback URL
  if (callbackUrl) {
    try {
      const url = new URL(callbackUrl);
      if (!url.protocol.startsWith('https')) {
        throw new Error('Callback URL must use HTTPS');
      }
    } catch {
      throw new Error('Invalid callback URL');
    }
  }
}
```

### Sanitize Metadata

```javascript
// ✅ Good - Only store needed fields
const metadata = {
  orderId: sanitize(req.body.orderId),
  userId: sanitize(req.body.userId)
};

// ❌ Bad - Store everything
const metadata = req.body;

function sanitize(input) {
  // Remove any potentially dangerous characters
  return String(input)
    .replace(/[<>]/g, '')
    .substring(0, 255);
}
```

## 4. Authentication & Authorization

### API Key Verification

```javascript
function authenticateRequest(req) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header');
  }

  const apiKey = authHeader.substring(7);
  
  if (!isValidApiKey(apiKey)) {
    throw new Error('Invalid API key');
  }
}

function isValidApiKey(key) {
  // Validate against stored/hashed keys
  return storedKeys.includes(hashKey(key));
}

// Middleware
app.use(authenticateRequest);
```

### Role-Based Access Control

```javascript
function authorizePaymentAmount(req, user) {
  const { amount } = req.body;
  
  // Restrict high-value transactions
  if (amount > user.dailyLimit) {
    throw new Error('Amount exceeds daily limit');
  }
  
  if (user.role !== 'admin' && amount > 10000) {
    throw new Error('User not authorized for high-value transactions');
  }
}
```

## 5. Data Protection

### Encrypt Sensitive Data

```javascript
const crypto = require('crypto');

function encryptSensitiveData(data) {
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return `${iv.toString('hex')}:${encrypted}`;
}

function decryptSensitiveData(encryptedData) {
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  
  const [ivHex, encrypted] = encryptedData.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return JSON.parse(decrypted);
}
```

### Never Log Sensitive Data

```javascript
// ❌ Bad - Logs API key and full card number
console.log(req.body);

// ✅ Good - Logs only safe data
console.log({
  transactionId: req.body.transactionId,
  amount: req.body.amount,
  currency: req.body.currency,
  // API key and card data not logged
});
```

### PCI DSS Compliance

**Do not store:**
- Credit card numbers
- CVV/CVC codes
- Magnetic stripe data
- PIN codes

**Do store:**
- Stripe payment intent IDs
- PayPal order IDs
- M-Pesa transaction IDs
- Last 4 digits of card (for display only)

## 6. Webhook Security

### Verify Webhook Signatures

```javascript
// Stripe
const event = stripe.webhooks.constructEvent(
  body, // Raw body
  sig,  // stripe-signature header
  webhookSecret
);

// PayPal
await client.verifyWebhookSignature({
  webhook_id: webhookId,
  webhook_event: req.body
});

// Custom callbacks - verify headers
if (req.headers['x-payment-callback'] !== 'true') {
  throw new Error('Invalid webhook source');
}
```

### Validate Webhook Source

```javascript
app.post('/webhooks/payment', (req, res) => {
  // 1. Verify signature
  if (!isValidWebhookSignature(req)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // 2. Check timestamp (prevent replay attacks)
  const timestamp = parseInt(req.headers['x-timestamp']);
  const now = Date.now();
  if (Math.abs(now - timestamp) > 5 * 60 * 1000) { // 5 minute window
    return res.status(401).json({ error: 'Request too old' });
  }

  // 3. Process webhook
  res.json({ success: true });
});
```

## 7. Rate Limiting

### Implement Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

// General API limit
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many requests, please try again later'
});

// Strict limit for payment endpoint
const paymentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many payment attempts, please try again later'
});

app.use('/api/payments', paymentLimiter);
app.use('/api', generalLimiter);
```

### IP-Based Rate Limiting

```javascript
const ipLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => {
    // Use real IP (accounting for proxies)
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  }
});

app.use(ipLimiter);
```

## 8. Error Handling

### Don't Expose Internal Details

```javascript
// ❌ Bad - Exposes database structure
catch (error) {
  res.status(500).json({
    error: error.message,
    stack: error.stack,
    query: error.query
  });
}

// ✅ Good - Generic error message
catch (error) {
  console.error('Error:', error); // Log internally
  res.status(500).json({
    error: 'An error occurred processing your request',
    code: 'INTERNAL_ERROR'
  });
}
```

## 9. CORS Configuration

### Restrict Origins

```javascript
const cors = require('cors');

// ❌ Bad - Allow all origins
app.use(cors());

// ✅ Good - Whitelist origins
const allowedOrigins = [
  'https://your-app.com',
  'https://www.your-app.com'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

## 10. Idempotency

### Use Idempotency Keys

Always include idempotency keys to prevent accidental duplicate charges:

```javascript
// ✅ Good - Unique key per request
const idempotencyKey = `${userId}-${Date.now()}-${Math.random()}`;

fetch('https://api.example.com/api/payments/stripe', {
  method: 'POST',
  headers: {
    'Idempotency-Key': idempotencyKey,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ amount, currency })
});
```

## 11. Monitoring & Logging

### Log Important Events

```javascript
const logger = {
  payment: (data) => {
    console.log({
      timestamp: new Date().toISOString(),
      event: 'payment_initiated',
      transactionId: data.transactionId,
      amount: data.amount,
      status: data.status
      // Never log: apiKey, cardNumber, cvv
    });
  },
  
  webhook: (data) => {
    console.log({
      timestamp: new Date().toISOString(),
      event: 'webhook_received',
      type: data.event,
      transactionId: data.transactionId
    });
  },
  
  error: (error) => {
    console.error({
      timestamp: new Date().toISOString(),
      event: 'error',
      message: error.message,
      code: error.code
      // Never log: stack traces with sensitive data
    });
  }
};
```

### Set Up Alerts

```javascript
const alerts = {
  highValueTransaction: (amount) => {
    if (amount > 100000) {
      notify('admin@company.com', 
        `High value transaction: ${amount}`);
    }
  },
  
  failureRate: (failures, total) => {
    const rate = failures / total;
    if (rate > 0.1) { // 10% failure rate
      notify('ops@company.com', 
        `Payment failure rate: ${(rate * 100).toFixed(1)}%`);
    }
  },
  
  apiErrors: (count) => {
    if (count > 10) { // More than 10 errors in 5 minutes
      notify('devops@company.com', 
        `High API error rate detected`);
    }
  }
};
```

## 12. Deployment Security

### Environment Variables Checklist

```bash
# Required environment variables for production
PRODUCTION_MODE=true
API_URL=https://api.example.com
API_KEY=sk_live_... (never commit)
ENCRYPTION_KEY=... (never commit)
STRIPE_SECRET_KEY=... (never commit)
PAYPAL_CLIENT_SECRET=... (never commit)
MPESA_CONSUMER_SECRET=... (never commit)
DATABASE_URL=... (never commit)
```

### Secrets Management

Use secrets management service:

```javascript
// ✅ Good - Using AWS Secrets Manager
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

async function getSecret(secretName) {
  const secret = await secretsManager.getSecretValue({ 
    SecretId: secretName 
  }).promise();
  
  return JSON.parse(secret.SecretString);
}

const apiKey = await getSecret('payment-gateway/api-key');
```

## Compliance Checklist

- [ ] All API endpoints use HTTPS
- [ ] API keys stored in environment variables, not code
- [ ] Sensitive data (card numbers) never logged
- [ ] All user inputs validated and sanitized
- [ ] Webhook signatures verified
- [ ] Rate limiting implemented
- [ ] CORS properly configured
- [ ] Error messages don't expose internals
- [ ] Idempotency keys used for all payments
- [ ] Audit logs maintained
- [ ] Regular security audits performed
- [ ] PCI DSS compliance maintained

## Next Steps

- [Error Handling Guide](ERROR_HANDLING.md)
- [Testing Guide](SANDBOX_TESTING.md)
- [Troubleshooting](TROUBLESHOOTING.md)

---

**Last Updated**: 2026-05-09
