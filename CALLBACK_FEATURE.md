# Payment Gateway Callback URL Feature

## Overview

All three payment gateways (Stripe, PayPal, and M-Pesa) now support callback URLs. When you initiate a payment with a callback URL, the gateway will send a POST request to your callback URL when the payment status changes (e.g., completed, failed, cancelled).

---

## Features

✅ **All Payment Gateways Supported**: Stripe, PayPal, M-Pesa  
✅ **Automatic Retry Logic**: Failed callbacks retry up to 3 times with exponential backoff  
✅ **Idempotent**: Callbacks are sent only once per status change  
✅ **Secure Headers**: Includes `X-Payment-Callback` and `X-Callback-Version` headers  
✅ **10s Timeout**: Prevents hanging requests  
✅ **Fire and Forget**: Non-blocking callback delivery (doesn't hold up API response)  

---

## API Request Format

### Stripe Payments

```bash
curl -X POST http://localhost:3000/stripe \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 24.50,
    "currency": "usd",
    "callbackUrl": "https://your-app.com/webhooks/stripe",
    "metadata": {
      "orderId": "ORD-12345",
      "userId": "user-789"
    }
  }'
```

**Response:**
```json
{
  "checkoutUrl": "https://checkout.stripe.com/...",
  "sessionId": "cs_...",
  "status": "pending",
  "amountProcessed": 2450,
  "currency": "USD",
  "callbackUrlRegistered": true
}
```

### PayPal Payments

```bash
curl -X POST http://localhost:3000/paypal \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 24.50,
    "currency": "USD",
    "callbackUrl": "https://your-app.com/webhooks/paypal",
    "metadata": {
      "orderId": "ORD-12345",
      "userId": "user-789"
    }
  }'
```

**Response:**
```json
{
  "orderId": "6LT22949D...",
  "links": [...],
  "approvalUrl": "https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=...",
  "status": "pending",
  "callbackUrlRegistered": true
}
```

### M-Pesa STK Push

```bash
curl -X POST http://localhost:3000/api/stk/push \
  -H "Content-Type: application/json" \
  -d '{
    "mobileNumber": "254712345678",
    "amount": 500,
    "accountReference": "ORD-12345",
    "transactionDescription": "Payment for order",
    "callbackUrl": "https://your-app.com/webhooks/mpesa"
  }'
```

---

## Callback Payload Format

When a payment completes, your callback URL will receive a POST request with this structure:

```json
{
  "idempotencyKey": "550e8400-e29b-41d4-a716-446655440000",
  "gateway": "stripe",
  "status": "completed",
  "transactionId": "ch_1Nk7L0D...",
  "amount": 2450,
  "currency": "USD",
  "timestamp": "2026-04-25T14:30:00.000Z",
  "error": null,
  "metadata": {
    "orderId": "ORD-12345",
    "userId": "user-789"
  }
}
```

**Callback Headers:**
```
Content-Type: application/json
X-Payment-Callback: true
X-Callback-Version: 1.0
```

**Possible Status Values:**
- `pending` - Payment initiated
- `completed` - Payment successful
- `failed` - Payment failed
- `cancelled` - Payment cancelled by user

---

## Implementing a Callback Handler

### Node.js/Express Example

```javascript
app.post('/webhooks/stripe', express.json(), (req, res) => {
  const payload = req.body;
  const { idempotencyKey, status, transactionId, amount, currency, error } = payload;

  // Verify headers
  if (req.get('X-Payment-Callback') !== 'true') {
    return res.status(401).send('Unauthorized');
  }

  // Log the callback
  console.log(`Payment ${status}: ${transactionId} for ${amount} ${currency}`);

  // Handle different statuses
  switch (status) {
    case 'completed':
      // Update your database
      updateOrderStatus(idempotencyKey, 'paid');
      // Send email confirmation
      sendConfirmationEmail(idempotencyKey);
      break;

    case 'failed':
      // Update your database
      updateOrderStatus(idempotencyKey, 'payment_failed');
      // Log error
      console.error('Payment error:', error);
      // Send failure notification
      sendFailureEmail(idempotencyKey, error);
      break;

    case 'cancelled':
      updateOrderStatus(idempotencyKey, 'cancelled');
      break;
  }

  // Always respond with 200 OK
  res.status(200).json({ success: true });
});
```

### Python/Flask Example

```python
@app.route('/webhooks/paypal', methods=['POST'])
def paypal_webhook():
    payload = request.get_json()
    
    # Verify callback header
    if request.headers.get('X-Payment-Callback') != 'true':
        return 'Unauthorized', 401
    
    idempotency_key = payload['idempotencyKey']
    status = payload['status']
    amount = payload['amount']
    
    # Handle the callback
    if status == 'completed':
        # Update order in database
        order = Order.query.filter_by(
            idempotency_key=idempotency_key
        ).first()
        if order:
            order.status = 'paid'
            order.transaction_id = payload['transactionId']
            db.session.commit()
            
            # Send confirmation
            send_confirmation_email(order.email)
    
    return jsonify({'success': True}), 200
```

### PHP Example

```php
<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Get JSON payload
$payload = json_decode(file_get_contents('php://input'), true);

// Verify callback header
if ($_SERVER['HTTP_X_PAYMENT_CALLBACK'] !== 'true') {
    http_response_code(401);
    die('Unauthorized');
}

$idempotencyKey = $payload['idempotencyKey'];
$status = $payload['status'];
$transactionId = $payload['transactionId'];

// Handle callback
switch ($status) {
    case 'completed':
        // Update database
        $stmt = $pdo->prepare('UPDATE orders SET status = ?, transaction_id = ? WHERE idempotency_key = ?');
        $stmt->execute(['paid', $transactionId, $idempotencyKey]);
        
        // Send email
        mail($user['email'], 'Payment Confirmed', 'Your payment has been received.');
        break;
        
    case 'failed':
        $stmt = $pdo->prepare('UPDATE orders SET status = ?, error = ? WHERE idempotency_key = ?');
        $stmt->execute(['failed', $payload['error'], $idempotencyKey]);
        break;
}

// Always respond with 200 OK
http_response_code(200);
echo json_encode(['success' => true]);
?>
```

---

## Best Practices

### 1. **Verify the Callback**
```javascript
// Verify callback came from payment gateway (add HMAC signature in future)
if (req.get('X-Payment-Callback') !== 'true') {
  return res.status(401).send('Unauthorized');
}
```

### 2. **Be Idempotent**
Always check if you've already processed this callback before updating your database:
```javascript
const transaction = await db.getTransaction(idempotencyKey);
if (transaction.processed) {
  return res.status(200).json({ success: true }); // Already processed
}
```

### 3. **Always Return 200 OK**
Your callback handler should always return `200 OK` to acknowledge receipt:
```javascript
res.status(200).json({ success: true });
```

### 4. **Use HTTPS**
Always provide HTTPS callback URLs in production:
```
✅ https://api.example.com/webhooks/stripe
❌ http://api.example.com/webhooks/stripe
```

### 5. **Log Everything**
```javascript
console.log('Callback received:', {
  gateway: payload.gateway,
  idempotencyKey: payload.idempotencyKey,
  status: payload.status,
  timestamp: new Date().toISOString()
});
```

### 6. **Set Appropriate Timeout**
Your callback handler should complete within 10 seconds (the timeout configured in the payment gateway).

### 7. **Handle Retries**
Callbacks may be retried 3 times. Make sure your handler is idempotent and won't double-charge or create duplicate orders.

---

## Testing Callbacks Locally

### Using ngrok for Local Testing

```bash
# Start ngrok tunnel (requires ngrok installed)
ngrok http 3000

# Use the provided URL as your callback URL
# Example: https://abc123.ngrok.io/webhooks/stripe
```

### Using a Webhook Testing Service

Services like [webhook.site](https://webhook.site) or [requestbin.com](https://requestbin.com) can be used to inspect callbacks:

```bash
curl -X POST http://localhost:3000/stripe \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 24.50,
    "currency": "usd",
    "callbackUrl": "https://webhook.site/your-unique-id",
    "metadata": {"test": true}
  }'
```

---

## Troubleshooting

### Callback Not Received?

1. **Check HTTPS**: Ensure callback URL is HTTPS (not HTTP)
2. **Check Firewall**: Ensure your server can receive incoming requests
3. **Check Logs**: Enable callback logging to see delivery attempts:
   ```javascript
   console.log(`Callback sent to ${callbackUrl}`);
   console.log(`Callback response status: ${response.status}`);
   ```

### Callback Delivery Failed?

- Callbacks retry 3 times with exponential backoff (1s, 2s, 4s)
- Check your callback handler's response status (should be 200)
- Check timeout isn't being exceeded (10 second limit)
- Monitor error logs for any exceptions

### Testing with Your Local Server?

Use ngrok to expose your local server:
```bash
# Terminal 1: Start your server
npm run dev

# Terminal 2: Start ngrok tunnel
ngrok http 3000

# Terminal 3: Make test request
curl -X POST http://localhost:3000/stripe \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 24.50,
    "currency": "usd",
    "callbackUrl": "https://YOUR_NGROK_URL/webhooks/stripe"
  }'
```

---

## Database Changes

The `transactions` table now includes a `callback_url` column:

```sql
ALTER TABLE transactions ADD COLUMN callback_url TEXT;
CREATE INDEX idx_transactions_callback_url ON transactions(callback_url);
```

Run the migration:
```bash
npm run migrate
```

---

## Callback Flow Diagram

```
┌─────────────────┐
│  Client App     │
└────────┬────────┘
         │
         │ POST /stripe
         │ { amount, callbackUrl, ... }
         │
         ▼
┌─────────────────┐
│ Payment Gateway │
│  (Stripe API)   │
└────────┬────────┘
         │
         │ Payment processed
         │ Status: completed
         │
         ▼
┌──────────────────────────────┐
│ Payment Gateway Wrapper      │
│ (Our API)                    │
│                              │
│ 1. Update DB status          │
│ 2. POST to callbackUrl       │ ◄── Fire and forget (async)
│ 3. Retry up to 3 times       │
└──────────────────────────────┘
         │
         │ Callback payload
         │ { status, transactionId, ... }
         │
         ▼
    ┌────────────────┐
    │ Client App     │
    │ Webhook        │
    │ Handler        │
    └────────────────┘
```

---

## Callback Status Codes

| Code | Meaning | Retry? |
|------|---------|--------|
| 200  | Success | No |
| 201-299 | Success | No |
| 400  | Bad Request | No |
| 401  | Unauthorized | No |
| 403  | Forbidden | No |
| 404  | Not Found | No |
| 500+ | Server Error | Yes |
| Timeout | Connection timeout | Yes |
| Network Error | Connection failed | Yes |

---

## Security Considerations

1. **Always use HTTPS** for callback URLs
2. **Verify callback headers** to ensure requests come from the payment gateway
3. **Use idempotency keys** to prevent duplicate processing
4. **Implement request signing** (recommended for future enhancement)
5. **Rate limiting** on callback endpoints to prevent abuse
6. **Log all callbacks** for audit trails
