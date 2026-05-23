-- Up migration
-- Add callback_url column to payment_transactions table for storing client callback URLs
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS callback_url TEXT;

-- Create index on callback_url for any future lookups
CREATE INDEX IF NOT EXISTS idx_payment_transactions_callback_url ON payment_transactions(callback_url);

-- Down migration
-- ALTER TABLE payment_transactions DROP COLUMN callback_url;
-- DROP INDEX idx_payment_transactions_callback_url;
