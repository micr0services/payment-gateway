# Callback URL Quick Reference

## TL;DR - Getting Started in 2 Minutes

### Step 1: Add callback URL to payment request
```json
{
  "amount": 24.50,
  "currency": "usd",
  "callbackUrl": "https://your-app.com/webhooks/stripe"
}
```

### Step 2: Set up webhook handler
```javascript
app.post('/webhooks/stripe', (req, res) => {
  console.log(req.body.status); // "completed", "failed", etc
  res.status(200).json({ success: true });
});
```

### Step 3: Listen for updates
```
POST https://your-app.com/webhooks/stripe
{
  "status": "completed",
  "transactionId": "...",
  "amount": 2450,
  ...
}
```

---

## Endpoint Examples

### Stripe
```bash
POST /stripe
{
  "amount": 24.50,
  "currency": "usd",
  "callbackUrl": "https://your-app.com/webhooks/stripe"
}
```

### PayPal
```bash
POST /paypal
{
  "amount": 24.50,
  "currency": "USD",
  "callbackUrl": "https://your-app.com/webhooks/paypal"
}
```

### M-Pesa STK
```bash
POST /api/stk/push
{
  "mobileNumber": "254712345678",
  "amount": 500,
  "accountReference": "ORD-123",
  "callbackUrl": "https://your-app.com/webhooks/mpesa"
}
```

### M-Pesa B2C
```bash
POST /api/b2c/send
{
  "mobileNumber": "254712345678",
  "amount": 500,
  "callbackUrl": "https://your-app.com/webhooks/mpesa"
}
```

---

## Callback Payload

Every callback includes:
```json
{
  "idempotencyKey": "unique-id",
  "gateway": "stripe|paypal|mpesa",
  "status": "completed|failed|cancelled|pending",
  "transactionId": "provider-id",
  "amount": 2450,
  "currency": "USD",
  "timestamp": "2026-04-25T14:30:00Z"
}
```

---

## Webhook Handler Template

### Node.js
```javascript
app.post('/webhooks/payment', express.json(), (req, res) => {
  // 1. Verify callback header
  if (req.get('X-Payment-Callback') !== 'true') return res.status(401).end();
  
  // 2. Extract data
  const { idempotencyKey, status, transactionId, amount } = req.body;
  
  // 3. Update database
  switch(status) {
    case 'completed':
      db.markOrderPaid(idempotencyKey, transactionId);
      break;
    case 'failed':
      db.markOrderFailed(idempotencyKey);
      break;
  }
  
  // 4. Return 200 OK (required!)
  res.status(200).json({ success: true });
});
```

### Python
```python
@app.route('/webhooks/payment', methods=['POST'])
def payment_webhook():
    # Verify header
    if request.headers.get('X-Payment-Callback') != 'true':
        return abort(401)
    
    payload = request.get_json()
    status = payload['status']
    
    if status == 'completed':
        Order.update_status(payload['idempotencyKey'], 'paid')
    
    return jsonify({'success': True}), 200
```

### PHP
```php
<?php
if ($_SERVER['HTTP_X_PAYMENT_CALLBACK'] !== 'true') {
    http_response_code(401);
    exit;
}

$payload = json_decode(file_get_contents('php://input'), true);
$status = $payload['status'];

if ($status === 'completed') {
    updateOrderStatus($payload['idempotencyKey'], 'paid');
}

http_response_code(200);
echo json_encode(['success' => true]);
?>
```

---

## Common Patterns

### 1. Mark Order as Paid
```javascript
if (payload.status === 'completed') {
  await db.order.update(
    { where: { idempotencyKey: payload.idempotencyKey } },
    { status: 'paid', transactionId: payload.transactionId }
  );
}
```

### 2. Send Confirmation Email
```javascript
if (payload.status === 'completed') {
  const order = await db.order.findOne({ 
    where: { idempotencyKey: payload.idempotencyKey } 
  });
  await sendEmail(order.email, 'Payment Confirmed', {...});
}
```

### 3. Log All Callbacks
```javascript
console.log(`[${payload.gateway}] ${payload.status}`, {
  amount: payload.amount,
  currency: payload.currency,
  timestamp: payload.timestamp
});
```

### 4. Handle Retries (Idempotent)
```javascript
// Callbacks may be retried - this handler must be idempotent
const alreadyProcessed = await db.callback.findOne({
  where: { idempotencyKey: payload.idempotencyKey }
});
if (alreadyProcessed) return res.status(200).json({ success: true });

// Process callback
// ... do work ...

// Mark as processed
await db.callback.create({ idempotencyKey: payload.idempotencyKey });
```

---

## Verification Checklist

- [ ] Callback URL uses HTTPS (not HTTP)
- [ ] Webhook handler returns 200 OK
- [ ] Handler is idempotent (can be called multiple times)
- [ ] Handler completes within 10 seconds
- [ ] Handler verifies `X-Payment-Callback` header
- [ ] Database is updated before returning response
- [ ] All errors are logged

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Callback not received | Use HTTPS, check firewall, verify URL is correct |
| Callback returns 404 | Check webhook path matches your route |
| Callback returns 5xx | Check error logs, callback handler is crashing |
| Duplicate callbacks | Make handler idempotent, check for duplicates in DB |
| Slow callback processing | Process callbacks async, don't block response |

---

## Optional: Local Testing

```bash
# Install ngrok
brew install ngrok

# In terminal 1: Start your server
npm start

# In terminal 2: Start ngrok tunnel
ngrok http 3000

# In terminal 3: Make test payment
curl -X POST http://localhost:3000/stripe \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 24.50,
    "currency": "usd",
    "callbackUrl": "https://abc123.ngrok.io/webhooks/stripe"
  }'
```

---

## API Responses

All endpoints respond with `callbackUrlRegistered: true/false`:

```json
{
  "status": "pending",
  "callbackUrlRegistered": true
}
```

This tells you the callback URL was accepted and will be called.

---

## Callback Retry Behavior

Callbacks retry automatically:
- Attempt 1: Immediate
- Attempt 2: After 1 second
- Attempt 3: After 2 seconds
- Attempt 4: After 4 seconds

If all retries fail, callback is abandoned (logged for monitoring).

---

## Need Help?

- Full guide: See `CALLBACK_FEATURE.md`
- Implementation details: See `CALLBACK_IMPLEMENTATION.md`
- Code examples: See `CALLBACK_FEATURE.md` → Implementation section

---

## Key Points to Remember

1. **Always return 200 OK** from your webhook handler
2. **Use HTTPS** for callback URLs in production
3. **Be idempotent** - handle duplicate callbacks gracefully
4. **Verify headers** - check `X-Payment-Callback: true`
5. **Log everything** - for debugging and audit trails
6. **Test locally** - use ngrok for local webhook testing
7. **Handle errors** - log and retry as needed
8. **Complete quickly** - 10 second timeout limit

---

## Response Time Expectations

- Payment initiated → Response: ~500ms
- Callback sent to your handler: ~100-500ms later
- Retries: Up to 10 seconds total if initial attempt fails

The callback is sent **after** the API response, so it doesn't affect response time.

---

*Last updated: April 25, 2026*
