-- Up migration
ALTER TABLE transactions ADD COLUMN stripe_payment_intent_id TEXT;
ALTER TABLE transactions ADD COLUMN paypal_order_id TEXT;

-- Create indexes for the new columns
CREATE INDEX idx_transactions_stripe_payment_intent_id ON transactions(stripe_payment_intent_id);
CREATE INDEX idx_transactions_paypal_order_id ON transactions(paypal_order_id);

-- Down migration
-- ALTER TABLE transactions DROP COLUMN stripe_payment_intent_id;
-- ALTER TABLE transactions DROP COLUMN paypal_order_id;