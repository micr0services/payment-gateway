-- Up migration
-- Add cancel_url column to payment_transactions table for storing client cancel URLs
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS cancel_url TEXT;

-- Create index on cancel_url for any future lookups
CREATE INDEX IF NOT EXISTS idx_payment_transactions_cancel_url ON payment_transactions(cancel_url);

-- Down migration
-- ALTER TABLE payment_transactions DROP COLUMN cancel_url;
-- DROP INDEX idx_payment_transactions_cancel_url;
