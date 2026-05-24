# Database Schema Documentation

## Overview

The Payment Gateway uses PostgreSQL with the **`vico_payment_schema`** schema to organize and manage all payment transaction data. This dedicated schema ensures data isolation, better security, and organized database structure.

## Schema Architecture

```
PostgreSQL Database
└── vico_payment_schema/
    └── payment_transactions (Main transaction table)
        ├── Columns (15 total)
        └── Indexes (8 total)
```

## Schema Creation

The schema is automatically created during database migration:

```sql
CREATE SCHEMA IF NOT EXISTS vico_payment_schema;
```

All tables and indexes are created within this schema to maintain separation from other database objects.

## payment_transactions Table

### Complete Column Reference

#### Primary Key & Identification
- **id** (SERIAL PRIMARY KEY)
  - Unique identifier for each transaction
  - Auto-incrementing integer
  - Used as primary reference

- **idempotency_key** (TEXT UNIQUE NOT NULL)
  - Prevents duplicate payment processing
  - Must be unique across all transactions
  - Recommended format: `{timestamp}-{random_uuid}`
  - Example: `1620086400-a1b2c3d4-e5f6-7890-abcd-ef1234567890`

#### Payment Provider & Amount
- **gateway** (TEXT NOT NULL)
  - Payment provider identifier
  - Allowed values: `stripe`, `paypal`, `mpesa`
  - Used for routing and provider-specific processing

- **amount** (INTEGER NOT NULL)
  - Transaction amount in cents (for consistency)
  - Always store as integer to avoid floating-point issues
  - Example: $24.50 → 2450

- **currency** (TEXT NOT NULL)
  - ISO 4217 currency code
  - Supported: USD, EUR, GBP, CAD, AUD, JPY, INR, KES, etc.
  - Example: 'USD', 'EUR', 'KES'

#### Transaction Status & Results
- **status** (TEXT NOT NULL)
  - Current transaction state
  - Values: `pending`, `processing`, `completed`, `failed`, `cancelled`, `refunded`
  - Updated when status changes

- **transaction_id** (TEXT)
  - Payment provider's transaction reference
  - Provider-specific format
  - Stripe: `pi_` prefix, PayPal: order ID, M-Pesa: receipt number
  - Used to track transaction in provider's system

- **error** (TEXT)
  - Error message if transaction failed
  - Stores HTTP error response or provider error message
  - NULL if transaction successful
  - Example: "Card declined", "Insufficient funds"

#### Provider-Specific IDs
- **stripe_payment_intent_id** (TEXT)
  - Stripe's payment intent identifier
  - Format: `pi_1234567890abcdef...`
  - Only populated for Stripe transactions
  - NULL for non-Stripe transactions

- **paypal_order_id** (TEXT)
  - PayPal's order identifier
  - Format: `5O190127545062533`
  - Only populated for PayPal transactions
  - NULL for non-PayPal transactions

#### Callback & Redirect URLs
- **callback_url** (TEXT)
  - Webhook URL for payment status notifications
  - Client-provided URL where payment updates are sent
  - Must be HTTPS in production
  - Example: `https://app.example.com/webhooks/payment`

- **cancel_url** (TEXT)
  - Redirect URL if user cancels payment
  - Client-provided URL for payment cancellation
  - Used for PayPal and Stripe redirects
  - Example: `https://app.example.com/payment/cancelled`

#### Flexible Data Storage
- **metadata** (JSONB)
  - Additional transaction metadata
  - Flexible key-value storage
  - Examples:
    ```json
    {
      "orderId": "ORD-12345",
      "userId": "user-789",
      "email": "customer@example.com",
      "customField": "customValue"
    }
    ```
  - Query-able with PostgreSQL JSONB operators

#### Timestamps
- **created_at** (TIMESTAMP WITH TIME ZONE DEFAULT NOW())
  - Transaction creation timestamp
  - Automatically set when record is inserted
  - Format: ISO 8601 with timezone

- **updated_at** (TIMESTAMP WITH TIME ZONE DEFAULT NOW())
  - Last transaction update timestamp
  - Set to current time on insert and update
  - Used to track transaction lifecycle

## Indexes for Performance

The schema includes 8 strategic indexes to optimize query performance:

### 1. Idempotency Key Index
```sql
CREATE INDEX idx_payment_transactions_idempotency_key 
  ON vico_payment_schema.payment_transactions(idempotency_key);
```
- **Purpose**: Fast duplicate detection
- **Queries**: Checking for duplicate payments
- **Impact**: O(1) duplicate detection instead of full table scan

### 2. Gateway Index
```sql
CREATE INDEX idx_payment_transactions_gateway 
  ON vico_payment_schema.payment_transactions(gateway);
```
- **Purpose**: Filter transactions by payment provider
- **Queries**: "Get all Stripe transactions" or "Get all PayPal transactions"
- **Impact**: Efficient provider-based filtering and analytics

### 3. Status Index
```sql
CREATE INDEX idx_payment_transactions_status 
  ON vico_payment_schema.payment_transactions(status);
```
- **Purpose**: Fast status-based queries
- **Queries**: "Get all pending payments", "Get all failed transactions"
- **Impact**: Efficient dashboard and reporting queries

### 4. Creation Date Index
```sql
CREATE INDEX idx_payment_transactions_created_at 
  ON vico_payment_schema.payment_transactions(created_at);
```
- **Purpose**: Time-based transaction queries
- **Queries**: "Get transactions from last 7 days", "Get today's revenue"
- **Impact**: Efficient date range filtering for reports

### 5. Stripe Payment Intent ID Index
```sql
CREATE INDEX idx_payment_transactions_stripe_payment_intent_id 
  ON vico_payment_schema.payment_transactions(stripe_payment_intent_id);
```
- **Purpose**: Fast Stripe transaction lookups
- **Queries**: "Find transaction for Stripe payment intent X"
- **Impact**: Efficient Stripe webhook handling

### 6. PayPal Order ID Index
```sql
CREATE INDEX idx_payment_transactions_paypal_order_id 
  ON vico_payment_schema.payment_transactions(paypal_order_id);
```
- **Purpose**: Fast PayPal transaction lookups
- **Queries**: "Find transaction for PayPal order X"
- **Impact**: Efficient PayPal webhook handling

### 7. Callback URL Index
```sql
CREATE INDEX idx_payment_transactions_callback_url 
  ON vico_payment_schema.payment_transactions(callback_url);
```
- **Purpose**: Find transactions by callback URL
- **Queries**: "Find all transactions for webhook URL Y"
- **Impact**: Webhook management and debugging

### 8. Cancel URL Index
```sql
CREATE INDEX idx_payment_transactions_cancel_url 
  ON vico_payment_schema.payment_transactions(cancel_url);
```
- **Purpose**: Track cancellation redirects
- **Queries**: "Find all cancelled transactions for URL Z"
- **Impact**: Cancellation analytics and tracking

## Migration History

### Latest Migration
- **File**: `0001_create_vico_payment_schema_and_tables.sql`
- **Date**: May 23, 2026
- **Changes**: 
  - Created `vico_payment_schema` schema
  - Created `payment_transactions` table with all columns
  - Added all 8 performance indexes
  - Full consolidated migration (replaces previous 4 migrations)

## Sample Queries

### Find a Transaction by Idempotency Key
```sql
SELECT * FROM vico_payment_schema.payment_transactions
WHERE idempotency_key = 'your-idempotency-key';
```

### Get All Stripe Transactions
```sql
SELECT * FROM vico_payment_schema.payment_transactions
WHERE gateway = 'stripe'
ORDER BY created_at DESC;
```

### Get Pending Transactions
```sql
SELECT * FROM vico_payment_schema.payment_transactions
WHERE status = 'pending'
AND created_at > NOW() - INTERVAL '1 hour';
```

### Find PayPal Transaction by Order ID
```sql
SELECT * FROM vico_payment_schema.payment_transactions
WHERE paypal_order_id = 'your-paypal-order-id';
```

### Get Today's Revenue
```sql
SELECT SUM(amount) as total_revenue
FROM vico_payment_schema.payment_transactions
WHERE status = 'completed'
AND DATE(created_at) = CURRENT_DATE;
```

### Get Failed Transactions for Debugging
```sql
SELECT id, gateway, error, created_at
FROM vico_payment_schema.payment_transactions
WHERE status = 'failed'
AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

## Database Connection

### Connection String Format
```
postgresql://username:password@host:port/database
```

### Example with vico_payment_schema
```javascript
import postgres from 'postgres';

const db = postgres(process.env.DATABASE_URL, {
  max: 1,
  idle_timeout: 5,
  max_lifetime: 30,
});

// Query from vico_payment_schema
const transaction = await db`
  SELECT * FROM vico_payment_schema.payment_transactions 
  WHERE id = ${transactionId}
`;
```

## Data Types Reference

| Type | PostgreSQL Type | JavaScript Type | Examples |
|------|-----------------|-----------------|----------|
| ID | SERIAL | number | 1, 2, 3 |
| Text | TEXT | string | "completed", "stripe", "pi_1234..." |
| Money | INTEGER | number | 2450 (for $24.50) |
| JSON | JSONB | object | `{orderId: "ORD-123"}` |
| Timestamp | TIMESTAMP WITH TIME ZONE | Date | 2026-05-23T10:30:00Z |

## Best Practices

### When Querying the Schema
1. **Always use the schema prefix**: `vico_payment_schema.payment_transactions`
2. **Use indexes**: Filter by indexed columns for better performance
3. **Limit results**: Use pagination for large result sets
4. **Use JSONB operators**: Efficiently query metadata

### When Inserting Data
1. **Generate unique idempotency keys**: Use UUID + timestamp format
2. **Store amounts in cents**: Avoid floating-point precision issues
3. **Include metadata**: Store relevant transaction context
4. **Set callback_url**: For webhook updates

### When Updating Status
1. **Use transaction IDs**: Update via provider-specific IDs
2. **Preserve history**: Don't overwrite error messages
3. **Update timestamps**: Let `updated_at` update automatically
4. **Validate status transitions**: pending → processing → completed

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | May 23, 2026 | Initial schema with vico_payment_schema |

---

**Last Updated**: May 23, 2026  
**Database**: PostgreSQL 12+  
**Schema Version**: 1.0
