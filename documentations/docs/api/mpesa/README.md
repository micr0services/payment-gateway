# M-Pesa API Integration

Complete guide to integrating M-Pesa mobile money payments into your application.

## Overview

M-Pesa integration enables payment collection from mobile money users in East Africa. Supported transaction types include STK Push, B2C transfers, C2B collections, B2B payments, and transaction reversals with built-in retry logic and comprehensive error handling.

### Key Features
- **Automatic Retries**: Failed API calls are automatically retried with exponential backoff
- **STK Push**: 3 retries for STK push requests, 2 retries for status queries
- **Error Handling**: Comprehensive error handling with detailed error messages
- **Webhook Support**: Real-time payment status notifications via callbacks
- **Multi-region**: Support for Kenya, Tanzania, Uganda, and other East African countries

### Supported Regions
- Kenya
- Tanzania
- Uganda
- Other East African countries via Safaricom network

### Transaction Types
- **STK Push**: Prompt user on phone to enter PIN (with retry logic)
- **B2C**: Business-to-Customer transfers
- **C2B**: Customer-to-Business collections
- **B2B**: Business-to-Business payments
- **Reversal**: Reverse failed or erroneous transactions

### Supported Currencies
- KES (Kenyan Shilling)
- TZS (Tanzanian Shilling)
- UGX (Ugandan Shilling)

## Reliability & Error Handling

### Retry Logic
- **STK Push**: Up to 3 retries with exponential backoff (500ms, 750ms, 1125ms)
- **Status Queries**: Up to 2 retries with exponential backoff (300ms, 450ms)
- **Backoff Strategy**: Exponential backoff with jitter
- **Retryable Errors**: Network timeouts, temporary server errors
- **Non-retryable Errors**: Authentication errors, invalid parameters

### Error Scenarios
- **Network Issues**: Automatically retried with exponential backoff
- **Invalid Phone Numbers**: Immediate validation failure
- **Insufficient Balance**: M-Pesa system handles with user notification
- **Timeout**: Automatic retry with status query fallback
- **Rate Limiting**: Respects M-Pesa API limits

## Quick Start

```bash
# Initiate STK Push (most common)
curl -X POST https://api.example.com/api/payments/mpesa/stk \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: unique-key-123" \
  -d '{
    "mobileNumber": "254712345678",
    "amount": 500,
    "accountReference": "ORD-12345",
    "transactionDesc": "Widget purchase",
    "callbackUrl": "https://your-app.com/webhooks/mpesa"
  }'

# Response
{
  "checkoutRequestId": "ws_CO_DMZ_ID",
  "merchantRequestId": "26439-1234567890",
  "responseCode": "0",
  "responseDescription": "Success. Request accepted for processing",
  "customerMessage": "Prompt has been sent to your phone"
}
```

## API Endpoints

| Method | Endpoint | Description | Use Case |
|--------|----------|-------------|----------|
| `POST` | `/api/payments/mpesa/stk` | Initiate STK Push | Checkout payment |
| `POST` | `/api/payments/mpesa/stk/query` | Query STK Status | Check if user entered PIN |
| `POST` | `/api/payments/mpesa/b2c` | B2C Transfer | Payouts, refunds |
| `POST` | `/api/payments/mpesa/c2b` | C2B Collection | Bill payment |
| `POST` | `/api/payments/mpesa/b2b` | B2B Payment | Business transfer |
| `POST` | `/api/payments/mpesa/reversal` | Reverse Transaction | Undo failed payment |

## Detailed Endpoints

### 1. Initiate STK Push

**Endpoint**: `POST /api/payments/mpesa/stk`

Sends a prompt to user's phone to enter M-Pesa PIN for payment.

#### Request Body
```json
{
  "mobileNumber": "254712345678",
  "amount": 500,
  "accountReference": "ORD-12345",
  "transactionDesc": "Widget purchase",
  "callbackUrl": "https://your-app.com/webhooks/mpesa",
  "cancelUrl": "https://your-app.com/payment/cancel"
}
```

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `mobileNumber` | string | ✅ Yes | Phone number (254712345678 or 0712345678) |
| `amount` | number | ✅ Yes | Amount in KES (must be >= 1) |
| `accountReference` | string | ✅ Yes | Order/reference ID (40 chars max) |
| `transactionDesc` | string | ❌ No | Transaction description (80 chars max) |
| `callbackUrl` | string | ❌ No | URL for status notification |
| `cancelUrl` | string | ❌ No | URL if user cancels |

#### Phone Number Formats Accepted
- `254712345678` (International with country code)
- `0712345678` (Local format - auto-converted)
- `+254712345678` (With + prefix)

#### Response (200 OK)
```json
{
  "checkoutRequestId": "ws_CO_DMZ_ID",
  "merchantRequestId": "26439-1234567890",
  "responseCode": "0",
  "responseDescription": "Success. Request accepted for processing",
  "customerMessage": "Prompt has been sent to your phone"
}
```

#### Response Fields

| Field | Description |
|-------|-------------|
| `checkoutRequestId` | Used to query payment status |
| `merchantRequestId` | Merchant request identifier |
| `responseCode` | M-Pesa response code (0 = success) |
| `responseDescription` | Human-readable response |
| `customerMessage` | Message shown to customer |

#### Error Responses

**400 Bad Request** - Invalid phone number
```json
{
  "error": "Invalid mobile number format",
  "code": "INVALID_PHONE_NUMBER"
}
```

**400 Bad Request** - Invalid amount
```json
{
  "error": "Amount must be at least 1 KES",
  "code": "INVALID_AMOUNT"
}
```

#### Example Usage

```javascript
// JavaScript
async function initiateSTKPush(phoneNumber, amount, orderId) {
  const response = await fetch('https://api.example.com/api/payments/mpesa/stk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mobileNumber: phoneNumber,
      amount: amount,
      accountReference: orderId,
      transactionDesc: 'Order payment',
      callbackUrl: 'https://your-app.com/webhooks/mpesa'
    })
  });

  const data = await response.json();
  
  if (data.responseCode === '0') {
    console.log('STK prompt sent to phone');
    // Save checkoutRequestId to check status later
    return data.checkoutRequestId;
  } else {
    console.error('STK push failed:', data.responseDescription);
  }
}

// Usage
const checkoutId = await initiateSTKPush('254712345678', 500, 'ORD-12345');
```

```python
# Python
import requests

response = requests.post(
    'https://api.example.com/api/payments/mpesa/stk',
    json={
        'mobileNumber': '254712345678',
        'amount': 500,
        'accountReference': 'ORD-12345',
        'transactionDesc': 'Widget purchase',
        'callbackUrl': 'https://your-app.com/webhooks/mpesa'
    }
)

data = response.json()
if data.get('responseCode') == '0':
    print(f"STK sent, checkout ID: {data['checkoutRequestId']}")
```

### 2. Query STK Status

**Endpoint**: `POST /api/payments/mpesa/stk/query`

Check whether user entered their M-Pesa PIN.

#### Request Body
```json
{
  "checkoutRequestId": "ws_CO_DMZ_ID"
}
```

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `checkoutRequestId` | string | ✅ Yes | From initial STK push response |

#### Response (200 OK) - Payment Completed
```json
{
  "merchantRequestId": "26439-1234567890",
  "checkoutRequestId": "ws_CO_DMZ_ID",
  "responseCode": "0",
  "responseDescription": "The service request has been processed successfully.",
  "resultCode": "0",
  "resultDesc": "The service request has been processed successfully."
}
```

#### Response (200 OK) - Pending/Failed
```json
{
  "merchantRequestId": "26439-1234567890",
  "checkoutRequestId": "ws_CO_DMZ_ID",
  "responseCode": "0",
  "responseDescription": "Success. Request accepted for processing",
  "resultCode": "1",
  "resultDesc": "Timeout in completing the transaction."
}
```

#### Common Result Codes

| Code | Description | Action |
|------|-------------|--------|
| `0` | Success | Payment completed ✅ |
| `1` | Timeout | User took too long - retry |
| `26` | Insufficient balance | User has insufficient funds |
| `1011` | User cancelled | User rejected PIN prompt |

#### Example Usage

```javascript
// Check payment status after 5 seconds
async function checkSTKStatus(checkoutRequestId) {
  // Wait for user to enter PIN
  await new Promise(resolve => setTimeout(resolve, 5000));

  const response = await fetch('https://api.example.com/api/payments/mpesa/stk/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ checkoutRequestId })
  });

  const data = await response.json();
  
  if (data.resultCode === '0') {
    console.log('Payment successful!');
    return 'completed';
  } else if (data.resultCode === '1') {
    console.log('Payment timeout - user may retry');
    return 'timeout';
  } else if (data.resultCode === '26') {
    console.log('User has insufficient balance');
    return 'insufficient_funds';
  } else {
    console.log('Payment failed:', data.resultDesc);
    return 'failed';
  }
}
```

### 3. B2C Transfer (Payouts)

**Endpoint**: `POST /api/payments/mpesa/b2c`

Send money from business to customer (payouts, refunds, disbursements).

#### Request Body
```json
{
  "mobileNumber": "254712345678",
  "amount": 1000,
  "commandId": "SalaryPayment",
  "remarks": "Monthly salary",
  "callbackUrl": "https://your-app.com/webhooks/mpesa"
}
```

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `mobileNumber` | string | ✅ Yes | Recipient phone number |
| `amount` | number | ✅ Yes | Amount to transfer (KES) |
| `commandId` | string | ✅ Yes | Transaction type (SalaryPayment, BusinessPayment, PromotionPayment) |
| `remarks` | string | ❌ No | Additional remarks (80 chars) |
| `callbackUrl` | string | ❌ No | Status notification URL |

#### Command IDs

| Command | Use Case |
|---------|----------|
| `SalaryPayment` | Employee salary |
| `BusinessPayment` | Vendor/supplier payment |
| `PromotionPayment` | Promotion/loyalty payout |

#### Response (200 OK)
```json
{
  "conversationId": "265-123456789",
  "originatorConversationId": "ORIGIN-12345",
  "responseCode": "0",
  "responseDescription": "Accept the service request successfully.",
  "transactionId": "O5FZJZTZ60",
  "resultDesc": "The service request has been accepted for processing"
}
```

### 4. C2B Collection (Bill Payment)

**Endpoint**: `POST /api/payments/mpesa/c2b`

Collect money from customers (utility bills, subscriptions).

#### Request Body
```json
{
  "mobileNumber": "254712345678",
  "amount": 1500,
  "accountReference": "UTIL-12345",
  "commandDesc": "Water bill payment",
  "transactionDesc": "Monthly water bill",
  "callbackUrl": "https://your-app.com/webhooks/mpesa"
}
```

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `mobileNumber` | string | ✅ Yes | Payer's phone number |
| `amount` | number | ✅ Yes | Amount to collect (KES) |
| `accountReference` | string | ✅ Yes | Account/reference ID |
| `commandDesc` | string | ✅ Yes | Brief description |
| `transactionDesc` | string | ❌ No | Detailed description |
| `callbackUrl` | string | ❌ No | Status notification URL |

### 5. B2B Payment

**Endpoint**: `POST /api/payments/mpesa/b2b`

Transfer between business accounts.

#### Request Body
```json
{
  "recipientShortCode": "600496",
  "amount": 5000,
  "commandId": "BusinessPayment",
  "accountReference": "ACC-12345",
  "remarks": "Goods payment",
  "callbackUrl": "https://your-app.com/webhooks/mpesa"
}
```

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `recipientShortCode` | string | ✅ Yes | Recipient till/shortcode |
| `amount` | number | ✅ Yes | Amount (KES) |
| `commandId` | string | ✅ Yes | BusinessPayment or BusinessBuyGoods |
| `accountReference` | string | ✅ Yes | Reference number |
| `remarks` | string | ❌ No | Additional info |
| `callbackUrl` | string | ❌ No | Callback URL |

### 6. Reversal

**Endpoint**: `POST /api/payments/mpesa/reversal`

Reverse a failed or erroneous transaction.

#### Request Body
```json
{
  "transactionId": "O5FZJZTZ60",
  "amount": 1000,
  "remarks": "Reversal - duplicate payment",
  "callbackUrl": "https://your-app.com/webhooks/mpesa"
}
```

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `transactionId` | string | ✅ Yes | Original M-Pesa transaction ID |
| `amount` | number | ✅ Yes | Amount to reverse (KES) |
| `remarks` | string | ❌ No | Reason for reversal |
| `callbackUrl` | string | ❌ No | Callback URL |

#### Response (200 OK)
```json
{
  "conversationId": "265-123456789",
  "originatorConversationId": "REVERSE-12345",
  "responseCode": "0",
  "responseDescription": "Accept the service request successfully.",
  "resultDesc": "Transaction reversed successfully"
}
```

## Callback URLs

### Setup Callback

Include `callbackUrl` in any M-Pesa request:

```json
{
  "mobileNumber": "254712345678",
  "amount": 500,
  "accountReference": "ORD-12345",
  "callbackUrl": "https://your-app.com/webhooks/mpesa"
}
```

### Receive Callback

M-Pesa sends status update to your callback URL:

```json
POST https://your-app.com/webhooks/mpesa
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

### Respond to Callback

```javascript
app.post('/webhooks/mpesa', (req, res) => {
  const { Body } = req.body;
  const { stkCallback } = Body;
  
  if (stkCallback.ResultCode === 0) {
    console.log(`Payment successful: ${stkCallback.MpesaReceiptNumber}`);
    // Update your order
  } else {
    console.log(`Payment failed: ${stkCallback.ResultDesc}`);
  }
  
  // Always respond with 200
  res.status(200).json({});
});
```

## Payment Flow

### STK Push Flow (Most Common)

```
1. User clicks "Pay with M-Pesa"
        │
        ▼
2. Call POST /api/payments/mpesa/stk
   Get checkoutRequestId
        │
        ▼
3. M-Pesa prompt appears on user's phone
        │
        ▼
4. User enters PIN
        │
        ├─── Success ──→ Callback received ──→ Confirm payment
        │
        └─── Failed  ──→ Callback received ──→ Show error
```

## Testing

### Test Environment

Use sandbox credentials:

```
Business Short Code: 174379
PassKey: bfb279f9ba9b9d4aded00264d1014cdd
Consumer Key: [Your sandbox key]
Consumer Secret: [Your sandbox secret]
```

### Test Phone Numbers

Use these test numbers in sandbox:
- `254712345678` - Test user
- `254710000000` - Another test user

### Webhook Testing with ngrok

```bash
# Terminal 1: Start your webhook receiver
node webhook-server.js

# Terminal 2: Start ngrok
ngrok http 3000

# Use ngrok URL in callback
{
  "callbackUrl": "https://abc123.ngrok.io/webhooks/mpesa"
}
```

## Phone Number Handling

The API handles multiple phone number formats:

```javascript
// All these are converted to same format internally
"254712345678"   // International
"0712345678"     // Local
"+254712345678"  // With +
```

## Error Handling

```javascript
async function handleMpesaError(error) {
  if (error.code === 'INVALID_PHONE_NUMBER') {
    console.error('Invalid phone number format');
  } else if (error.code === 'INVALID_AMOUNT') {
    console.error('Amount must be >= 1 KES');
  } else if (error.responseCode !== '0') {
    console.error('M-Pesa error:', error.responseDescription);
  } else if (error.resultCode === '26') {
    console.error('User has insufficient balance');
  } else if (error.resultCode === '1011') {
    console.error('User cancelled payment');
  }
}
```

## Best Practices

1. **Validate Phone Numbers**: Ensure valid format before sending
2. **Handle Timeouts**: STK may timeout, implement retry logic
3. **Use Callbacks**: Don't rely on polling; use webhooks
4. **Store Transaction IDs**: Save M-Pesa transaction IDs for reconciliation
5. **Implement Polling Fallback**: In case webhooks fail, poll status
6. **Test Thoroughly**: Use sandbox environment first
7. **Handle Reversals**: Implement reversal mechanism for failed payments

## Troubleshooting

### Issue: "Invalid phone number"
**Solution**: Use format `254712345678` (country code + 9-digit number)

### Issue: "STK timeout"
**Solution**: Implement retry logic or let user retry manually

### Issue: "Insufficient balance"
**Cause**: User doesn't have enough M-Pesa balance  
**Solution**: Show error message and suggest topping up

### Issue: "Webhook not received"
**Solution**: Ensure callback URL is publicly accessible and responds with 2xx

## Next Steps

- [M-Pesa Webhooks](../webhooks/MPESA_WEBHOOKS.md)
- [Error Handling Guide](../guides/ERROR_HANDLING.md)
- [Testing Guide](../integration/SANDBOX_TESTING.md)
- [Security Best Practices](../integration/SECURITY.md)

---

**API Version**: 1.0.0  
**Last Updated**: 2026-05-09  
**Status**: Production Ready
