# PayPal API Integration

Complete guide to integrating PayPal payments into your application.

## Overview

PayPal integration allows customers to pay using their PayPal account or credit card. The API handles order creation, verification, capture, and webhook notifications with built-in retry logic and comprehensive error handling.

### Key Features
- **Automatic Retries**: Failed API calls are automatically retried up to 3 times with exponential backoff
- **Idempotency**: All requests support idempotency keys to prevent duplicate processing
- **Error Handling**: Comprehensive error handling with detailed error messages
- **Webhook Support**: Real-time payment status notifications via webhooks
- **Multi-currency**: Support for major global currencies

### Supported Payment Methods
- PayPal account balance
- PayPal credit line
- Debit cards
- Credit cards (Visa, Mastercard, American Express)
- Bank transfers (varies by country)

### Supported Currencies
USD, EUR, GBP, CAD, AUD, JPY, INR, CNY, and more

## Reliability & Error Handling

### Retry Logic
- **Max Retries**: 3 attempts per request
- **Backoff Strategy**: Exponential backoff (1s, 1.5s, 2.25s)
- **Retryable Errors**: Network timeouts, temporary server errors (5xx)
- **Non-retryable Errors**: Authentication errors, invalid parameters (4xx)

### Error Scenarios
- **Network Issues**: Automatically retried with exponential backoff
- **Rate Limiting**: Respects PayPal's rate limits with automatic retry
- **Invalid Orders**: Immediate failure with detailed error message
- **Insufficient Funds**: Payment declined with specific error code
- **Expired Tokens**: Token refresh with automatic retry

## Quick Start

```bash
# Create an order
curl -X POST https://api.example.com/api/payments/paypal \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: unique-key-123" \
  -d '{
    "amount": 24.50,
    "currency": "USD",
    "callbackUrl": "https://your-app.com/webhooks/paypal",
    "metadata": {
      "orderId": "ORD-12345"
    }
  }'

# Response
{
  "orderId": "4YW53988V0895453J",
  "approvalUrl": "https://www.paypal.com/checkoutnow?token=...",
  "status": "pending"
}
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/payments/paypal` | Create PayPal order |
| `POST` | `/api/payments/paypal/verify` | Verify/capture order |
| `GET` | `/api/payments/paypal/:orderId` | Get order status |

## Detailed Endpoints

### 1. Create PayPal Order

**Endpoint**: `POST /api/payments/paypal`

Creates a new PayPal order and returns an approval URL for user redirection.

#### Request Body
```json
{
  "amount": 24.50,
  "currency": "USD",
  "callbackUrl": "https://your-app.com/webhooks/paypal",
  "cancelUrl": "https://your-app.com/payment/cancel",
  "metadata": {
    "orderId": "ORD-12345",
    "userId": "user-789",
    "description": "Widget purchase"
  }
}
```

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `amount` | number | ✅ Yes | Payment amount (e.g., 24.50) |
| `currency` | string | ❌ No | Currency code, defaults to 'USD' |
| `callbackUrl` | string | ❌ No | URL for payment status notifications |
| `cancelUrl` | string | ❌ No | URL to redirect if user cancels |
| `metadata` | object | ❌ No | Custom metadata for tracking |

#### Response (200 OK)
```json
{
  "orderId": "4YW53988V0895453J",
  "links": [
    {
      "rel": "approve",
      "href": "https://www.paypal.com/checkoutnow?token=EC-..."
    },
    {
      "rel": "capture",
      "href": "https://api.example.com/api/payments/paypal/verify"
    }
  ],
  "approvalUrl": "https://www.paypal.com/checkoutnow?token=EC-...",
  "status": "pending",
  "callbackUrlRegistered": true,
  "cancelUrlRegistered": true
}
```

#### Response Fields

| Field | Description |
|-------|-------------|
| `orderId` | PayPal order ID (used for verification) |
| `links` | Array of related links (approve, capture) |
| `approvalUrl` | URL to redirect user for payment approval |
| `status` | Current order status |
| `callbackUrlRegistered` | Whether callback URL was registered |
| `cancelUrlRegistered` | Whether cancel URL was registered |

#### Error Responses

**400 Bad Request** - Invalid parameters
```json
{
  "error": "Valid amount is required",
  "code": "INVALID_AMOUNT"
}
```

**500 Internal Server Error** - PayPal API error
```json
{
  "error": "PayPal API error",
  "code": "PAYPAL_API_ERROR",
  "details": {
    "message": "Invalid currency"
  }
}
```

#### Example Usage

```javascript
// JavaScript/Node.js
async function createPayPalOrder() {
  const response = await fetch('https://api.example.com/api/payments/paypal', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': 'unique-key-' + Date.now()
    },
    body: JSON.stringify({
      amount: 24.50,
      currency: 'USD',
      callbackUrl: 'https://your-app.com/webhooks/paypal',
      metadata: {
        orderId: 'ORD-12345'
      }
    })
  });

  const data = await response.json();
  
  if (data.approvalUrl) {
    // Redirect user to PayPal
    window.location.href = data.approvalUrl;
  }
}
```

```python
# Python
import requests

response = requests.post(
    'https://api.example.com/api/payments/paypal',
    json={
        'amount': 24.50,
        'currency': 'USD',
        'callbackUrl': 'https://your-app.com/webhooks/paypal',
        'metadata': {
            'orderId': 'ORD-12345'
        }
    },
    headers={
        'Content-Type': 'application/json',
        'Idempotency-Key': f'unique-key-{time.time()}'
    }
)

data = response.json()
if 'approvalUrl' in data:
    print(data['approvalUrl'])
```

### 2. Verify/Capture PayPal Order

**Endpoint**: `POST /api/payments/paypal/verify`

After user approves payment on PayPal, capture the order to complete the transaction.

#### Request Body
```json
{
  "order_id": "4YW53988V0895453J"
}
```

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `order_id` | string | ✅ Yes | PayPal order ID from previous step |

#### Response (200 OK)
```json
{
  "success": true,
  "status": "COMPLETED",
  "orderId": "4YW53988V0895453J",
  "transactionId": "20G68814VA159382L",
  "amount": 24.50,
  "currency": "USD",
  "payer": {
    "name": {
      "given_name": "John",
      "surname": "Doe"
    },
    "email": "john@example.com"
  },
  "capturedAt": "2026-05-09T10:31:45Z"
}
```

#### Response Fields

| Field | Description |
|-------|-------------|
| `success` | Whether capture was successful |
| `status` | Order status ('COMPLETED', 'PENDING', 'FAILED') |
| `orderId` | PayPal order ID |
| `transactionId` | PayPal transaction ID for settlement |
| `amount` | Captured amount |
| `currency` | Currency code |
| `payer` | Payer information |
| `capturedAt` | Timestamp of capture |

#### Error Responses

**400 Bad Request** - Order not found
```json
{
  "success": false,
  "error": "Order not found or already captured"
}
```

**402 Payment Required** - Order approval pending
```json
{
  "success": false,
  "status": "PENDING",
  "error": "Order not yet approved by user"
}
```

#### Example Usage

```javascript
// After user returns from PayPal
async function capturePayPalOrder(orderId) {
  const response = await fetch('https://api.example.com/api/payments/paypal/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order_id: orderId })
  });

  const data = await response.json();
  
  if (data.success && data.status === 'COMPLETED') {
    console.log('Payment completed!');
    // Update your order status
    updateOrderStatus(orderId, 'completed');
  }
}

// On return from PayPal
const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get('token');
if (orderId) {
  capturePayPalOrder(orderId);
}
```

### 3. Get Order Status

**Endpoint**: `GET /api/payments/paypal/:orderId`

Retrieve current status of a PayPal order.

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `orderId` | string | PayPal order ID |

#### Response (200 OK)
```json
{
  "orderId": "4YW53988V0895453J",
  "status": "COMPLETED",
  "amount": 24.50,
  "currency": "USD",
  "payer": {
    "email": "john@example.com",
    "name": {
      "given_name": "John",
      "surname": "Doe"
    }
  },
  "transactionId": "20G68814VA159382L",
  "createdAt": "2026-05-09T10:30:00Z",
  "completedAt": "2026-05-09T10:31:45Z"
}
```

#### Example Usage

```javascript
async function getOrderStatus(orderId) {
  const response = await fetch(
    `https://api.example.com/api/payments/paypal/${orderId}`,
    { method: 'GET' }
  );

  const data = await response.json();
  console.log(`Order Status: ${data.status}`);
  return data;
}
```

## Payment Flow

### Complete Integration Flow

```
1. User clicks "Pay with PayPal"
        │
        ▼
2. Create Order (POST /api/payments/paypal)
   Response: approvalUrl
        │
        ▼
3. Redirect to approvalUrl
   User approves on PayPal
        │
        ▼
4. User redirected back to your app
   with order_id in URL
        │
        ▼
5. Capture Order (POST /api/payments/paypal/verify)
   with order_id
        │
        ▼
6. Callback URL receives notification
   (if configured)
        │
        ▼
7. Payment Complete
```

## Callback URLs

### Setup Payment Callback

Include a `callbackUrl` when creating an order:

```json
{
  "amount": 24.50,
  "currency": "USD",
  "callbackUrl": "https://your-app.com/webhooks/paypal"
}
```

### Receive Callback

When order status changes, the API sends a POST request:

```json
POST https://your-app.com/webhooks/paypal
{
  "event": "order.status_changed",
  "status": "COMPLETED",
  "orderId": "4YW53988V0895453J",
  "transactionId": "20G68814VA159382L",
  "amount": 24.50,
  "currency": "USD",
  "timestamp": "2026-05-09T10:31:45Z"
}
```

### Respond to Callback

```javascript
app.post('/webhooks/paypal', (req, res) => {
  const { status, orderId, amount } = req.body;
  
  console.log(`Order ${orderId}: ${status}`);
  
  // Always respond with 2xx
  res.status(200).json({ success: true });
});
```

## Testing

### Sandbox Environment

Use sandbox credentials for testing:

**Sandbox URLs**:
- API: `https://api.sandbox.paypal.com`
- Web: `https://www.sandbox.paypal.com`

### Test Accounts

Create test accounts in PayPal Sandbox Dashboard:
- Personal account (buyer)
- Business account (seller)

### Test Payments

Use these dummy cards in sandbox:

| Card Type | Number |
|-----------|--------|
| Visa | `4111 1111 1111 1111` |
| Mastercard | `5555 5555 5555 4444` |
| Amex | `3782 822463 10005` |

Any future expiry and CVV work in sandbox.

## Error Handling

Common error scenarios:

```javascript
async function handlePayPalError(error) {
  if (error.code === 'INVALID_AMOUNT') {
    console.error('Amount must be greater than 0.01');
  } else if (error.status === 'PENDING') {
    console.log('Order pending user approval');
  } else if (error.error === 'Order not found') {
    console.error('Invalid or expired order ID');
  } else if (error.code === 'PAYPAL_API_ERROR') {
    console.error('PayPal API error:', error.details);
  } else {
    console.error('Unknown error:', error);
  }
}
```

## Best Practices

1. **Always Use Idempotency Keys**: Prevent duplicate orders
   ```bash
   -H "Idempotency-Key: unique-key-12345"
   ```

2. **Handle Return Flow**: User may not return from PayPal
   - Implement order polling
   - Use webhooks for confirmation

3. **Store Order IDs**: Save PayPal order IDs for reconciliation

4. **Verify Before Capturing**: Check order details before capture

5. **Use Callbacks**: Don't rely solely on redirect; use webhooks

6. **Test Currency Exchange**: PayPal may adjust amounts for currency conversion

## Troubleshooting

### Issue: "Approval URL shows error page"
**Cause**: Invalid amount or currency  
**Solution**: Verify amount >= 0.01 and currency code is valid

### Issue: "Order not found on verification"
**Cause**: Order ID invalid or expired  
**Solution**: Ensure correct order ID passed, order IDs expire after 3 hours

### Issue: "Duplicate order creation"
**Cause**: Same idempotency key used twice  
**Solution**: This is expected; use unique idempotency keys per order

### Issue: "Webhook not received"
**Cause**: Callback URL not responding with 2xx  
**Solution**: Ensure endpoint responds with HTTP 200+

## Next Steps

- [Webhooks Integration](../webhooks/PAYPAL_WEBHOOKS.md)
- [Error Handling Guide](../guides/ERROR_HANDLING.md)
- [Security Best Practices](../integration/SECURITY.md)
- [Testing Guide](../integration/SANDBOX_TESTING.md)

---

**API Version**: 1.0.0  
**Last Updated**: 2026-05-09  
**Status**: Production Ready
