# Cloudflare Workers Payment Gateway

A secure, low-latency payment gateway supporting PayPal and Stripe with idempotency and retry logic, deployed on Cloudflare Workers.

## Features

- Support for PayPal and Stripe payments
- Idempotency to prevent double payments
- Retry logic for failed transactions
- Transaction storage in PostgreSQL database
- Low latency with async operations
- Global CDN deployment with Cloudflare Workers

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up a PostgreSQL database:
   ```bash
   # For local development with Docker
   docker run -d --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:15

   # Or use a cloud provider like Supabase, Neon, or Railway
   # Get the connection string from your provider
   ```

3. Apply database migrations:
   ```bash
   npm run migrate
   ```
   This will create the `transactions` table with proper indexes.

4. Configure environment variables in `wrangler.toml`:
   ```toml
   [vars]
   STRIPE_SECRET_KEY = "your_stripe_secret_key_here"
   PAYPAL_ENVIRONMENT = "live"  # or "sandbox"
   PAYPAL_CLIENT_ID = "your_paypal_client_id_here"
   PAYPAL_CLIENT_SECRET = "your_paypal_client_secret_here"
   ```

   For production, use secrets instead:
   ```bash
   wrangler secret put STRIPE_SECRET_KEY
   wrangler secret put PAYPAL_CLIENT_ID
   wrangler secret put PAYPAL_CLIENT_SECRET
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Deploy to production:
   ```bash
   npm run deploy
   ```

## API Endpoints

### Stripe Payment
```
POST /api/payments/stripe
Content-Type: application/json
Idempotency-Key: unique-key

{
  "amount": 1000,
  "currency": "usd",
  "metadata": {}
}
```

### PayPal Payment
```
POST /api/payments/paypal
Content-Type: application/json
Idempotency-Key: unique-key

{
  "amount": 1000,
  "currency": "USD",
  "metadata": {}
}
```

### PayPal Confirm
```
POST /api/payments/paypal/confirm/{orderId}
```

### List Transactions
```
GET /api/transactions?gateway=stripe&status=completed
```

The specification currently documents the following operations:

- **POST /api/payments/stripe** – create a Stripe payment intent
- **GET /api/payments/stripe/{paymentIntentId}** – get payment status
- **POST /api/payments/stripe/{paymentIntentId}/cancel** – cancel payment
- **POST /api/payments/stripe/{paymentIntentId}/confirm** – confirm payment (testing)
- **POST /api/payments/stripe/{paymentIntentId}/refund** – refund payment
- **POST /api/payments/paypal** – create a PayPal order
- **POST /api/payments/paypal/confirm/{orderId}** – capture a PayPal order
- **GET /api/transactions** – list transactions with optional query filters
- **POST /api/webhooks/stripe** – handle Stripe webhooks


## API Usage Guide

### Authentication & Headers

All payment endpoints require an `Idempotency-Key` header to prevent duplicate transactions. This key should be unique per payment attempt.

**Example header:**
```
Idempotency-Key: unique-payment-id-12345
```

### Stripe Payment Flow

1. **Create Payment Intent**
   ```bash
   curl -X POST https://your-worker-url.workers.dev/api/payments/stripe \
     -H "Content-Type: application/json" \
     -H "Idempotency-Key: stripe-payment-001" \
     -d '{
       "amount": 1000,
       "currency": "usd",
       "metadata": {
         "order_id": "order-123",
         "customer_email": "user@example.com"
       }
     }'
   ```

2. **Response:**
   ```json
   {
     "clientSecret": "pi_xxx_secret_xxx",
     "transactionId": "pi_xxx"
   }
   ```

3. **Frontend Integration:** Use the `clientSecret` with Stripe.js to complete the payment.

### PayPal Payment Flow

PayPal orders are created and then approved by the payer before they can be
captured. The backend returns a special approval URL the frontend must
navigate to – attempting a capture before approval results in the familiar
`ORDER_NOT_APPROVED` error.

1. **Create Order**
   ```bash
   curl -X POST https://your-worker-url.workers.dev/api/payments/paypal \
     -H "Content-Type: application/json" \
     -H "Idempotency-Key: paypal-payment-001" \
     -d '{
       "amount": 1000,
       "currency": "USD",
       "metadata": {
         "order_id": "order-456",
         "customer_email": "user@example.com"
       }
     }'
   ```

2. **Typical response:**
   ```json
   {
     "orderId": "5O190127TN364715T",
     "approvalUrl": "https://www.sandbox.paypal.com/checkoutnow?token=5O190127TN364715T",
     "links": [
       {
         "href": "https://www.sandbox.paypal.com/checkoutnow?token=5O190127TN364715T",
         "rel": "approve",
         "method": "GET"
       }
     ]
   }
   ```
   The `approvalUrl` field is also provided for convenience; navigate the
   buyer there next.

3. **User approves payment.** PayPal redirects the browser to your
   return URL (e.g. `/paypal/success?token=ORDER_ID`).

4. **Capture Order** after approval:
   ```bash
   curl -X POST https://your-worker-url.workers.dev/api/payments/paypal/confirm/5O190127TN364715T
   ```

If you try to capture before approval the API will return an error similar
to the one you saw; that's normal and indicates the flow hasn't been
completed yet.

### Error Handling

- **400 Bad Request:** Missing or invalid Idempotency-Key
- **409 Conflict:** Transaction already exists (idempotency in action)
- **500 Internal Server Error:** Payment processing failed (check logs)

### Idempotency

The system ensures that identical requests with the same Idempotency-Key won't create duplicate transactions. If a payment is retried with the same key, it returns the original transaction status.

### Retry Logic

Failed payments are automatically retried up to 3 times with exponential backoff. If all retries fail, the transaction is marked as 'failed' in the database.

## Testing Stripe Payments

For testing purposes, you can confirm PaymentIntents directly without a frontend:

### Direct Payment Confirmation

1. **Create Payment Intent** (as usual):
   ```bash
   curl -X POST https://your-worker-url.workers.dev/api/payments/stripe \
     -H "Content-Type: application/json" \
     -H "Idempotency-Key: test-payment-001" \
     -d '{
       "amount": 5000,
       "currency": "usd"
     }'
   ```

2. **Confirm Payment Directly** (bypasses frontend):
   ```bash
   curl -X POST https://your-worker-url.workers.dev/api/payments/stripe/{paymentIntentId}/confirm \
     -H "Content-Type: application/json" \
     -d '{
       "paymentMethodId": "pm_card_visa"
     }'
   ```

3. **Webhook Trigger**: After confirmation, your webhook endpoint will receive `payment_intent.succeeded`

### Test Payment Methods

Stripe provides several test payment methods:
- `pm_card_visa` - Visa test card
- `pm_card_mastercard` - Mastercard test card
- `pm_card_amex` - American Express test card

### Using Stripe CLI for Webhook Testing

1. Install Stripe CLI
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to https://your-worker-url.workers.dev/api/webhooks/stripe`
4. Use the webhook signing secret in your environment variables

## API Endpoints

### Stripe Payment
POST /api/payments/stripe
Headers: Idempotency-Key
Body: { "amount": 1000, "currency": "usd", "metadata": {} }

GET /api/payments/stripe/{paymentIntentId}
POST /api/payments/stripe/{paymentIntentId}/cancel
POST /api/payments/stripe/{paymentIntentId}/confirm
POST /api/payments/stripe/{paymentIntentId}/refund

### PayPal Payment
POST /api/payments/paypal
Headers: Idempotency-Key
Body: { "amount": 1000, "currency": "USD", "metadata": {} }

POST /api/payments/paypal/confirm/:orderId

### Transactions
GET /api/transactions

### Webhooks
POST /api/webhooks/stripe

## Security

- Use HTTPS in production
- Validate all inputs
- Use strong secrets
- Monitor for anomalies

## Database Schema

Migrations are managed under `src/migration` using TypeORM. Run the
`typeorm:migrate` script to apply any pending migrations:

```bash
npm run typeorm:migrate
```

The initial schema is created by the TypeORM migration in
`src/migration/1688612345678-CreateTransactions.ts`.
