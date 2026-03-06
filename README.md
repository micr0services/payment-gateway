# Node.js Payment Gateway

A secure, low-latency payment gateway supporting PayPal and Stripe with idempotency and retry logic.

## Features

- Support for PayPal and Stripe payments
- Idempotency to prevent double payments
- Retry logic for failed transactions
- Transaction storage in PostgreSQL
- Low latency with async operations
- Security with Helmet and CORS

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up a PostgreSQL database. You can either run a local Postgres instance or use Supabase (preferred).
   * For Supabase, go to your project dashboard → Settings → Database → Connection Pooling and copy the connection string (e.g. `postgresql://postgres:...@xyz.supabase.co:5432/postgres`).
   * Paste the value into `.env` as `DATABASE_URL`.
   * If your database requires SSL/TLS (Supabase does), also add `DATABASE_SSL=true`.

3. Apply database migrations. The project now uses TypeORM for schema
   management; run the migration script instead of raw SQL. Make sure the
   `DATABASE_SSL` variable is set to `true` if your host requires TLS (e.g.
   Supabase). Then execute:
   ```bash
   npm run migrate
   ```
   This will create the `transactions` table and record applied migrations.

4. Update `.env` with your Stripe and PayPal credentials.

5. Start the server:
   ```bash
   npm start
   ```

## API Documentation

The API is fully documented with Swagger/OpenAPI. After starting the server, visit:
```
http://localhost:3000/api-docs
```

This provides an interactive UI to explore and test all endpoints.

The specification currently documents the following operations:

- **POST /api/payments/stripe** – create a Stripe payment intent
- **POST /api/payments/paypal** – create a PayPal order
- **POST /api/payments/paypal/confirm/{orderId}** – capture a PayPal order
- **GET /api/payments/transactions** – list transactions with optional query filters


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
   curl -X POST http://localhost:3000/api/payments/stripe \
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
   curl -X POST http://localhost:3000/api/payments/paypal \
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
   curl -X POST http://localhost:3000/api/payments/paypal/confirm/5O190127TN364715T
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

## API Endpoints

### Stripe Payment
POST /api/payments/stripe
Headers: Idempotency-Key
Body: { "amount": 1000, "currency": "usd", "metadata": {} }

### PayPal Payment
POST /api/payments/paypal
Headers: Idempotency-Key
Body: { "amount": 1000, "currency": "USD", "metadata": {} }

POST /api/payments/paypal/confirm/:orderId

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
