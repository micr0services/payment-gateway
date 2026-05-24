-- ================================================================
-- Migration: Create Vico Payment Schema and Payment Transactions
-- ================================================================
-- This is a consolidated migration that:
-- 1. Creates the vico_payment_schema schema
-- 2. Creates the payment_transactions table in the schema
-- 3. Includes all payment provider IDs columns
-- 4. Includes callback and cancel URLs
-- 5. Creates all necessary indexes for performance
-- ================================================================

-- Create the vico_payment_schema schema
CREATE SCHEMA IF NOT EXISTS vico_payment_schema;

-- Create the payment_transactions table in the vico_payment_schema
CREATE TABLE IF NOT EXISTS vico_payment_schema.payment_transactions (
  id SERIAL PRIMARY KEY,
  idempotency_key TEXT UNIQUE NOT NULL,
  gateway TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  transaction_id TEXT,
  error TEXT,
  metadata JSONB,
  -- Payment provider IDs
  stripe_payment_intent_id TEXT,
  paypal_order_id TEXT,
  -- Callback URLs
  callback_url TEXT,
  cancel_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes on the payment_transactions table for performance optimization
CREATE INDEX IF NOT EXISTS idx_payment_transactions_idempotency_key ON vico_payment_schema.payment_transactions(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_gateway ON vico_payment_schema.payment_transactions(gateway);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON vico_payment_schema.payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON vico_payment_schema.payment_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_stripe_payment_intent_id ON vico_payment_schema.payment_transactions(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_paypal_order_id ON vico_payment_schema.payment_transactions(paypal_order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_callback_url ON vico_payment_schema.payment_transactions(callback_url);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_cancel_url ON vico_payment_schema.payment_transactions(cancel_url);

-- ================================================================
-- Down Migration (for reference - rollback would drop the schema)
-- ================================================================
-- DROP SCHEMA IF EXISTS vico_payment_schema CASCADE;
-- ================================================================
