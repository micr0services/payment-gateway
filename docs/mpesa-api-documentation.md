# M-Pesa Payment Gateway API Documentation

## Overview

The M-Pesa integration provides comprehensive support for various M-Pesa payment methods including STK Push, C2B, B2C, B2B, and transaction reversals.

## Environment Variables

The following environment variables must be configured for M-Pesa integration:

```toml
# M-Pesa API Credentials
MPESA_CONSUMER_KEY = "your_consumer_key"
MPESA_CONSUMER_SECRET = "your_consumer_secret"
MPESA_SHORTCODE = "your_shortcode"
MPESA_PASSKEY = "your_passkey"

# Environment Settings
MPESA_ENVIRONMENT = "sandbox"  # or "production"

# Callback URLs
MPESA_STK_CALLBACK_URL = "https://your-domain.com/api/webhooks/mpesa/stk"
MPESA_B2B_CALLBACK_URL = "https://your-domain.com/api/webhooks/mpesa/b2b"
MPESA_B2C_CALLBACK_URL = "https://your-domain.com/api/webhooks/mpesa/b2c"
MPESA_B2POCHI_CALLBACK_URL = "https://your-domain.com/api/webhooks/mpesa/b2pochi"
MPESA_REVERSAL_CALLBACK_URL = "https://your-domain.com/api/webhooks/mpesa/reversal"

# B2C/B2B Credentials (for production)
MPESA_INITIATOR_NAME = "your_initiator_name"
MPESA_INITIATOR_PASSWORD = "your_initiator_password"
```

## API Endpoints

### STK Push Endpoints

#### 1. Initiate STK Push Payment
**Endpoint:** `POST /api/stk/push`

Initiates an STK Push payment request to a customer's mobile number.

**Request Body:**
```json
{
  "mobileNumber": "254712345678",
  "amount": 1000,
  "accountReference": "ORDER123",
  "transactionDesc": "Payment for goods"
}
```

**Response:**
```json
{
  "success": true,
  "message": "STK Push initiated successfully",
  "data": {
    "merchantRequestId": "12345-67890-...",
    "checkoutRequestId": "ws_CO_1234567890",
    "responseCode": "0",
    "responseDescription": "Success. Request accepted for processing",
    "customerMessage": "Success. Request accepted for processing"
  }
}
```

**Validation Rules:**
- `mobileNumber`: Required, must be in format 254XXXXXXXXX or 0XXXXXXXXX
- `amount`: Required, number between 1 and 150,000 KES
- `accountReference`: Required, string identifier for the transaction

#### 2. Query STK Push Status
**Endpoint:** `POST /api/stk/query`

Queries the status of an STK Push payment request.

**Request Body:**
```json
{
  "checkoutRequestId": "ws_CO_1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "STK status retrieved successfully",
  "data": {
    "responseCode": "0",
    "responseDescription": "Success",
    "merchantRequestId": "12345-67890-...",
    "checkoutRequestId": "ws_CO_1234567890",
    "resultCode": "0",
    "resultDesc": "The service request is processed successfully"
  }
}
```

#### 3. Get STK Push Status by ID
**Endpoint:** `GET /api/stk/status/{checkoutRequestId}`

Retrieves STK Push status using checkout request ID in URL path.

**Response:**
```json
{
  "success": true,
  "message": "STK status retrieved successfully",
  "data": {
    "merchantRequestId": "12345-67890-...",
    "checkoutRequestId": "ws_CO_1234567890",
    "responseCode": "0",
    "responseDescription": "Success",
    "resultCode": "0",
    "resultDesc": "The service request is processed successfully"
  }
}
```

**Error Responses:**
- `400 Bad Request` when `checkoutRequestId` is missing or invalid
- `500 Internal Server Error` for downstream M-Pesa or server errors

### Legacy M-Pesa Endpoints

#### 4. Initiate M-Pesa STK Push (Legacy)
**Endpoint:** `POST /api/payments/mpesa`

Legacy endpoint for STK Push payments with database transaction tracking.

**Request Body:**
```json
{
  "mobileNumber": "254712345678",
  "amount": 1000,
  "accountReference": "ORDER123",
  "transactionDesc": "Payment for goods",
  "callbackUrl": "https://your-app.com/callback",
  "cancelUrl": "https://your-app.com/cancel"
}
```

**Headers:**
```
Idempotency-Key: unique-key-for-this-request
```

**Response:**
```json
{
  "success": true,
  "message": "M-Pesa STK push initiated successfully",
  "data": {
    "merchantRequestId": "12345-67890-...",
    "checkoutRequestId": "ws_CO_1234567890",
    "responseCode": "0",
    "responseDescription": "Success. Request accepted for processing",
    "customerMessage": "Success. Request accepted for processing"
  },
  "callbackUrlRegistered": true,
  "cancelUrlRegistered": true
}
```

#### 5. Query M-Pesa STK Status (Legacy)
**Endpoint:** `POST /api/payments/mpesa/query`

Legacy endpoint for querying STK status.

**Request Body:**
```json
{
  "checkoutRequestId": "ws_CO_1234567890"
}
```

#### 6. Get M-Pesa STK Status by ID (Legacy)
**Endpoint:** `GET /api/payments/mpesa/status/{checkoutRequestId}`

Retrieves M-Pesa STK status using checkout request ID with the payments-style API.

**Response:**
```json
{
  "success": true,
  "data": {
    "merchantRequestId": "12345-67890-...",
    "checkoutRequestId": "ws_CO_1234567890",
    "responseCode": "0",
    "responseDescription": "Success",
    "resultCode": "0",
    "resultDesc": "The service request is processed successfully"
  }
}
```

**Error Responses:**
- `400 Bad Request` when `checkoutRequestId` is missing or invalid
- `500 Internal Server Error` for downstream M-Pesa or server errors

### B2C (Business-to-Customer) Endpoints

#### 7. Send B2C Transfer
**Endpoint:** `POST /api/b2c/send`

Transfer funds from business account to customer mobile number (e.g., refunds, payouts, salary transfers).

**Request Body:**
```json
{
  "mobileNumber": "254712345678",
  "amount": 5000,
  "description": "Salary payment",
  "callbackUrl": "https://your-app.com/webhooks/b2c",
  "cancelUrl": "https://your-app.com/webhooks/b2c/cancel"
}
```

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `mobileNumber` | string | ✅ Yes | Recipient phone number (254XXXXXXXXX or 0XXXXXXXXX) |
| `amount` | number | ✅ Yes | Transfer amount in KES (1-150,000) |
| `description` | string | ❌ No | Transaction description/purpose |
| `callbackUrl` | string | ❌ No | Webhook URL for status updates |
| `cancelUrl` | string | ❌ No | URL for cancellation notification |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "B2C transaction initiated successfully",
  "data": {
    "conversationId": "AG_20231212_1234567890",
    "responseCode": "0",
    "responseDescription": "Accept the service request successfully."
  },
  "callbackUrlRegistered": true,
  "cancelUrlRegistered": false,
  "timestamp": "2023-12-12T10:30:45Z"
}
```

**Error Responses:**

**400 Bad Request** - Missing/Invalid parameters
```json
{
  "error": "Validation Error",
  "message": "Mobile number and amount are required",
  "required": ["mobileNumber", "amount"]
}
```

**400 Bad Request** - Invalid phone format
```json
{
  "error": "Validation Error",
  "message": "Invalid mobile number format. Use 254XXXXXXXXX or 0XXXXXXXXX",
  "example": "254712345678"
}
```

**400 Bad Request** - Amount out of range
```json
{
  "error": "Validation Error",
  "message": "Amount must be between 1 and 150,000 KES",
  "min": 1,
  "max": 150000
}
```

**500 Internal Server Error**
```json
{
  "error": "Internal Server Error",
  "message": "Failed to process B2C transaction",
  "timestamp": "2023-12-12T10:30:45Z"
}
```

#### 8. Query B2C Transfer Status
**Endpoint:** `GET /api/b2c/status/{conversationId}`

Check the status of a B2C transfer transaction.

**Response (200 OK) - Success:**
```json
{
  "success": true,
  "message": "B2C transaction status retrieved",
  "data": {
    "conversationId": "AG_20231212_1234567890",
    "status": "SUCCESS",
    "responseCode": "0",
    "responseDescription": "Transaction completed successfully",
    "timestamp": "2023-12-12T10:31:45Z"
  }
}
```

**Response (200 OK) - Pending/Failed:**
```json
{
  "success": true,
  "message": "B2C transaction status retrieved",
  "data": {
    "conversationId": "AG_20231212_1234567890",
    "status": "PENDING",
    "responseCode": "2",
    "responseDescription": "Transaction in progress",
    "timestamp": "2023-12-12T10:30:45Z"
  }
}
```

**Error Responses:**

**400 Bad Request** - Missing conversation ID
```json
{
  "error": "Validation Error",
  "message": "Conversation ID is required",
  "example": "/api/b2c/status/ABC123"
}
```

**500 Internal Server Error**
```json
{
  "error": "Internal Server Error",
  "message": "Failed to query B2C status",
  "timestamp": "2023-12-12T10:30:45Z"
}
```

### C2B (Customer-to-Business) Endpoints

#### 9. Register C2B URLs
**Endpoint:** `POST /api/c2b/register`

Register confirmation and validation URLs for C2B payments. M-Pesa will call these URLs for payment validations.

**Request Body:**
```json
{
  "shortCode": "600496",
  "responseType": "Completed",
  "confirmationUrl": "https://your-app.com/webhooks/c2b/confirm",
  "validationUrl": "https://your-app.com/webhooks/c2b/validate"
}
```

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `shortCode` | string | ✅ Yes | M-Pesa business short code |
| `responseType` | string | ✅ Yes | `Completed` or `Cancelled` - callback preference |
| `confirmationUrl` | string | ✅ Yes | URL for payment confirmations |
| `validationUrl` | string | ✅ Yes | URL for payment validation requests |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "C2B URLs registered successfully",
  "data": {
    "shortCode": "600496",
    "responseType": "Completed",
    "confirmationUrl": "https://your-app.com/webhooks/c2b/confirm",
    "validationUrl": "https://your-app.com/webhooks/c2b/validate",
    "responseCode": "0",
    "responseDescription": "Success"
  },
  "timestamp": "2023-12-12T10:30:45Z"
}
```

**Error Responses:**

**400 Bad Request** - Missing fields
```json
{
  "error": "Validation Error",
  "message": "All fields are required",
  "required": ["shortCode", "responseType", "confirmationUrl", "validationUrl"]
}
```

**400 Bad Request** - Invalid response type
```json
{
  "error": "Validation Error",
  "message": "Response type must be either \"Completed\" or \"Cancelled\"",
  "allowed": ["Completed", "Cancelled"]
}
```

**500 Internal Server Error**
```json
{
  "error": "Internal Server Error",
  "message": "Failed to register C2B URLs",
  "timestamp": "2023-12-12T10:30:45Z"
}
```

#### 10. Simulate C2B Payment
**Endpoint:** `POST /api/c2b/simulate`

Simulate a customer-to-business payment for testing purposes.

**Request Body:**
```json
{
  "mobileNumber": "254712345678",
  "amount": 2000,
  "description": "Product purchase"
}
```

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `mobileNumber` | string | ✅ Yes | Customer phone number (254XXXXXXXXX or 0XXXXXXXXX) |
| `amount` | number | ✅ Yes | Payment amount in KES |
| `description` | string | ❌ No | Payment description/reference |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "C2B transaction simulated successfully",
  "data": {
    "conversationId": "CC_20231212_1234567890",
    "responseCode": "0",
    "responseDescription": "C2B simulation successful"
  },
  "timestamp": "2023-12-12T10:30:45Z"
}
```

**Error Responses:**

**400 Bad Request** - Missing parameters
```json
{
  "error": "Validation Error",
  "message": "Mobile number and amount are required",
  "required": ["mobileNumber", "amount"]
}
```

**400 Bad Request** - Invalid amount
```json
{
  "error": "Validation Error",
  "message": "Amount must be a number greater than 0",
  "example": { "amount": 100 }
}
```

**400 Bad Request** - Invalid phone number
```json
{
  "error": "Validation Error",
  "message": "Invalid mobile number format. Use format: 254712345678 or 0712345678",
  "example": "254712345678"
}
```

**500 Internal Server Error**
```json
{
  "error": "Internal Server Error",
  "message": "Failed to simulate C2B transaction",
  "timestamp": "2023-12-12T10:30:45Z"
}
```

#### 11. Query C2B Transaction Status
**Endpoint:** `GET /api/c2b/status/{conversationId}`

Check the status of a C2B payment simulation or transaction.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "C2B transaction status retrieved",
  "data": {
    "conversationId": "CC_20231212_1234567890",
    "status": "PENDING",
    "responseCode": "0",
    "responseDescription": "Transaction initiated successfully",
    "timestamp": "2023-12-12T10:30:45Z"
  }
}
```

**Error Responses:**

**400 Bad Request** - Missing conversation ID
```json
{
  "error": "Validation Error",
  "message": "Conversation ID is required",
  "example": "/api/c2b/status/ABC123"
}
```

### B2B (Business-to-Business) Endpoints

#### 12. Send B2B Payment
**Endpoint:** `POST /api/b2b/send`

Transfer funds from one business account to another business account.

**Request Body:**
```json
{
  "receiverPartyPublicID": "600496",
  "amount": 50000,
  "description": "Bulk goods purchase",
  "accountReference": "INV-2023-001"
}
```

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `receiverPartyPublicID` | string | ✅ Yes | Receiver's M-Pesa business public ID/short code |
| `amount` | number | ✅ Yes | Transaction amount in KES (1-150,000) |
| `description` | string | ❌ No | Transaction description/purpose |
| `accountReference` | string | ❌ No | Your account/invoice reference |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "B2B transaction initiated successfully",
  "data": {
    "conversationId": "BB_20231212_1234567890",
    "responseCode": "0",
    "responseDescription": "Accept the service request successfully."
  },
  "timestamp": "2023-12-12T10:30:45Z"
}
```

**Error Responses:**

**400 Bad Request** - Missing required fields
```json
{
  "error": "Validation Error",
  "message": "Receiver party ID and amount are required",
  "required": ["receiverPartyPublicID", "amount"]
}
```

**400 Bad Request** - Amount out of range
```json
{
  "error": "Validation Error",
  "message": "Amount must be between 1 and 150,000 KES",
  "min": 1,
  "max": 150000
}
```

**500 Internal Server Error**
```json
{
  "error": "Internal Server Error",
  "message": "Failed to process B2B transaction",
  "timestamp": "2023-12-12T10:30:45Z"
}
```

### B2Pochi (Business-to-Pochi) Endpoints

#### 13. Send B2Pochi Payment
**Endpoint:** `POST /api/b2pochi/send`

Transfer funds from business account to a Pochi (MPESA ATM) machine or agent.

**Request Body:**
```json
{
  "mobileNumber": "254712345678",
  "amount": 10000,
  "description": "Agent payout"
}
```

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `mobileNumber` | string | ✅ Yes | Pochi/Agent phone number (254XXXXXXXXX or 0XXXXXXXXX) |
| `amount` | number | ✅ Yes | Payout amount in KES (1-150,000) |
| `description` | string | ❌ No | Payout purpose/description |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "B2Pochi transaction initiated successfully",
  "data": {
    "conversationId": "BP_20231212_1234567890",
    "responseCode": "0",
    "responseDescription": "Pochi transfer successful"
  },
  "timestamp": "2023-12-12T10:30:45Z"
}
```

**Error Responses:**

**400 Bad Request** - Missing parameters
```json
{
  "error": "Validation Error",
  "message": "Mobile number and amount are required",
  "required": ["mobileNumber", "amount"]
}
```

**400 Bad Request** - Invalid phone number
```json
{
  "error": "Validation Error",
  "message": "Invalid mobile number format. Use 254XXXXXXXXX or 0XXXXXXXXX",
  "example": "254712345678"
}
```

**400 Bad Request** - Amount out of range
```json
{
  "error": "Validation Error",
  "message": "Amount must be a number between 1 and 150,000 KES",
  "min": 1,
  "max": 150000
}
```

**500 Internal Server Error**
```json
{
  "error": "Internal Server Error",
  "message": "Failed to process B2Pochi transaction",
  "timestamp": "2023-12-12T10:30:45Z"
}
```

#### 14. Query B2Pochi Transaction Status
**Endpoint:** `GET /api/b2pochi/status/{conversationId}`

Check the status of a B2Pochi transfer.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "B2Pochi transaction status retrieved",
  "data": {
    "conversationId": "BP_20231212_1234567890",
    "status": "SUCCESS",
    "responseCode": "0",
    "responseDescription": "Transaction completed successfully",
    "timestamp": "2023-12-12T10:31:45Z"
  }
}
```

**Error Responses:**

**400 Bad Request** - Missing conversation ID
```json
{
  "error": "Validation Error",
  "message": "Conversation ID is required",
  "example": "/api/b2pochi/status/ABC123"
}
```

### Reversal Endpoints

#### 15. Request Transaction Reversal
**Endpoint:** `POST /api/reversal/request`

Reverse a previous M-Pesa transaction (e.g., erroneous or duplicate payment).

**Request Body:**
```json
{
  "transactionId": "NLJ7RT61SV",
  "amount": 5000,
  "receiverParty": "254712345678",
  "remarks": "Duplicate transaction",
  "occasion": "Correcting payment error"
}
```

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `transactionId` | string | ✅ Yes | Original M-Pesa receipt number/transaction ID |
| `amount` | number | ✅ Yes | Amount to reverse in KES (1-150,000) |
| `receiverParty` | string | ✅ Yes | Original receiver phone or account identifier |
| `remarks` | string | ❌ No | Reason for reversal |
| `occasion` | string | ❌ No | Occasion/category for reversal |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Reversal request initiated successfully",
  "data": {
    "conversationId": "RV_20231212_1234567890",
    "responseCode": "0",
    "responseDescription": "Request accepted for processing"
  },
  "timestamp": "2023-12-12T10:30:45Z"
}
```

**Error Responses:**

**400 Bad Request** - Missing required fields
```json
{
  "error": "Validation Error",
  "message": "Transaction ID, amount, and receiver party are required",
  "required": ["transactionId", "amount", "receiverParty"]
}
```

**400 Bad Request** - Amount out of range
```json
{
  "error": "Validation Error",
  "message": "Amount must be a number between 1 and 150,000 KES",
  "min": 1,
  "max": 150000
}
```

**500 Internal Server Error**
```json
{
  "error": "Internal Server Error",
  "message": "Failed to process reversal request",
  "timestamp": "2023-12-12T10:30:45Z"
}
```

#### 16. Query Reversal Status
**Endpoint:** `GET /api/reversal/status/{conversationId}`

Check the status of a reversal request.

**Response (200 OK) - Success:**
```json
{
  "success": true,
  "message": "Reversal status retrieved",
  "data": {
    "conversationId": "RV_20231212_1234567890",
    "status": "SUCCESS",
    "responseCode": "0",
    "responseDescription": "Transaction reversed successfully",
    "timestamp": "2023-12-12T10:31:45Z"
  }
}
```

**Response (200 OK) - Pending:**
```json
{
  "success": true,
  "message": "Reversal status retrieved",
  "data": {
    "conversationId": "RV_20231212_1234567890",
    "status": "PENDING",
    "responseCode": "0",
    "responseDescription": "Reversal in progress",
    "timestamp": "2023-12-12T10:30:45Z"
  }
}
```

**Error Responses:**

**400 Bad Request** - Missing conversation ID
```json
{
  "error": "Validation Error",
  "message": "Conversation ID is required",
  "example": "/api/reversal/status/ABC123"
}
```

**500 Internal Server Error**
```json
{
  "error": "Internal Server Error",
  "message": "Failed to query reversal status",
  "timestamp": "2023-12-12T10:30:45Z"
}
```

## Error Handling

All endpoints return standardized error responses:

```json
{
  "error": "Error Type",
  "message": "Detailed error message"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Validation error or bad request
- `409`: Transaction already exists (idempotency conflict)
- `500`: Internal server error

## Transaction States

M-Pesa transactions can have the following states:
- `pending`: Payment initiated, awaiting user confirmation
- `completed`: Payment successful
- `failed`: Payment failed or was cancelled
- `cancelled`: Payment was cancelled by user

## Callback Handling

M-Pesa sends callback notifications to the configured callback URLs when payment status changes. The callback data includes:

```json
{
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "12345-67890-...",
      "CheckoutRequestID": "ws_CO_1234567890",
      "ResultCode": 0,
      "ResultDesc": "The service request is processed successfully",
      "CallbackMetadata": {
        "Item": [
          {
            "Name": "Amount",
            "Value": 1000
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

## Testing

For sandbox testing, use these test credentials:

```toml
MPESA_CONSUMER_KEY = "your_sandbox_consumer_key"
MPESA_CONSUMER_SECRET = "your_sandbox_consumer_secret"
MPESA_SHORTCODE = "174379"
MPESA_PASSKEY = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"
MPESA_ENVIRONMENT = "sandbox"
```

**Test Phone Numbers:**
- Success: `254708374149`
- Insufficient Balance: `254708374148`
- Cancel: `254708374147`

## Rate Limits

M-Pesa has rate limits on API calls:
- STK Push: 5 requests per minute per phone number
- Status queries: 10 requests per minute
- General API calls: 100 requests per minute

## Security Considerations

1. Always validate input data on both client and server side
2. Use HTTPS for all API communications
3. Implement proper authentication and authorization
4. Store sensitive credentials securely
5. Validate callback signatures when implemented
6. Use idempotency keys to prevent duplicate transactions</content>
<parameter name="filePath">/home/wilfred/payment-gateway/docs/mpesa-api-documentation.md