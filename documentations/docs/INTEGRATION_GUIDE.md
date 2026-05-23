# Payment Gateway Integration Guide

This document provides a comprehensive guide for integrating with our Payment Gateway API, which supports multiple payment providers: Stripe, PayPal, and M-Pesa STK Push. All integrations use the same base URL with different endpoints.

## Base URL

All API endpoints share the same base URL. For Cloudflare Workers deployment, this will be your worker's URL:

```
https://your-worker-name.workers.dev
```

**Important**: All payment providers use this single base URL. Only the endpoint path changes for each provider.

## Authentication

All requests require proper environment variables to be set in your Cloudflare Worker:

- **Stripe**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- **PayPal**: `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_ENVIRONMENT`
- **M-Pesa**: `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`, `MPESA_PASSKEY`, `MPESA_ENVIRONMENT`, `MPESA_STK_CALLBACK_URL`

## Payment Initiation Endpoints

### 1. Stripe Payment

**Endpoint**: `POST /api/payments/stripe`

**Request Body**:
```json
{
  "amount": 24.50,
  "currency": "usd",
  "callbackUrl": "https://your-app.com/callback",
  "cancelUrl": "https://your-app.com/cancel",
  "metadata": {
    "orderId": "12345"
  }
}
```

**Response**:
```json
{
  "success": true,
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

### 2. PayPal Payment

**Endpoint**: `POST /api/payments/paypal`

**Request Body**:
```json
{
  "amount": 24.50,
  "currency": "USD",
  "callbackUrl": "https://your-app.com/callback",
  "cancelUrl": "https://your-app.com/cancel",
  "metadata": {
    "orderId": "12345"
  }
}
```

**Response**:
```json
{
  "success": true,
  "approvalUrl": "https://www.paypal.com/cgi-bin/webscr?cmd=_express-checkout...",
  "orderId": "5O190127TN364715T"
}
```

### 3. M-Pesa STK Push

**Endpoint**: `POST /api/payments/mpesa`

**Request Body**:
```json
{
  "mobileNumber": "254712345678",
  "amount": 100,
  "accountReference": "Order123",
  "transactionDesc": "Payment for order",
  "callbackUrl": "https://your-app.com/callback",
  "cancelUrl": "https://your-app.com/cancel"
}
```

**Response**:
```json
{
  "success": true,
  "checkoutRequestId": "ws_CO_xxx",
  "responseCode": "0",
  "responseDescription": "Success. Request accepted for processing",
  "customerMessage": "Success. Request accepted for processing"
}
```

## Callback and Webhook Handling

### Stripe Webhooks

**Endpoint**: `POST /api/webhooks/stripe`

Stripe sends webhooks to this endpoint for payment events. Configure this URL in your Stripe dashboard.

**Supported Events**:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `payment_intent.canceled`
- `payment_intent.processing`
- `charge.dispute.created`

### PayPal Confirmation

**Endpoint**: `POST /api/payments/paypal/confirm/{orderId}`

After user approves PayPal payment, redirect them to complete the capture:

```javascript
// After user returns from PayPal approval
const response = await fetch('/api/payments/paypal/confirm/' + orderId, {
  method: 'POST'
});
```

### M-Pesa Callbacks

**Configuration**: Set `MPESA_STK_CALLBACK_URL` environment variable to:

```
https://your-worker-name.workers.dev/api/webhooks/mpesa
```

**Note**: You need to implement the `/api/webhooks/mpesa` endpoint to receive M-Pesa STK push callbacks.

**Callback Payload Example**:
```json
{
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "29115-34620561-1",
      "CheckoutRequestID": "ws_CO_xxx",
      "ResultCode": 0,
      "ResultDesc": "The service request is processed successfully.",
      "CallbackMetadata": {
        "Item": [
          {
            "Name": "Amount",
            "Value": 1
          },
          {
            "Name": "MpesaReceiptNumber",
            "Value": "NLJ7RT61SV"
          },
          {
            "Name": "TransactionDate",
            "Value": 20170727154800
          },
          {
            "Name": "PhoneNumber",
            "Value": 254708374149
          }
        ]
      }
    }
  }
}
```

## Common Integration Steps

1. **Set Environment Variables**: Configure all required API keys and secrets
2. **Deploy Worker**: Deploy to Cloudflare Workers
3. **Configure Webhooks**:
   - Stripe: Set webhook URL in Stripe dashboard
   - PayPal: Handle approval flow
   - M-Pesa: Set callback URL in environment
4. **Handle Callbacks**: Implement callback handlers to update your system
5. **Test**: Use sandbox/test environments for all providers

## Error Handling

All endpoints return standard HTTP status codes:
- `200`: Success
- `400`: Bad Request (validation errors)
- `409`: Conflict (idempotency key already used)
- `500`: Internal Server Error

## Idempotency

All payment initiation requests support idempotency using the `Idempotency-Key` header to prevent duplicate transactions.

## Security Notes

- Always use HTTPS
- Validate callback/webhook signatures when possible
- Store sensitive data securely
- Use environment variables for secrets
- Implement proper error handling without exposing sensitive information</content>
<parameter name="filePath">/home/wilfred/payment-gateway/documentations/docs/INTEGRATION_GUIDE.md