-- Up migration
CREATE TABLE IF NOT EXISTS payment_transactions (
  id SERIAL PRIMARY KEY,
  idempotency_key TEXT UNIQUE NOT NULL,
  gateway TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  transaction_id TEXT,
  error TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on idempotency_key for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_transactions_idempotency_key ON payment_transactions(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_gateway ON payment_transactions(gateway);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at);