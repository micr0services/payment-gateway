-- Up migration
ALTER TABLE payment_transactions ADD COLUMN stripe_payment_intent_id TEXT;
ALTER TABLE payment_transactions ADD COLUMN paypal_order_id TEXT;

-- Create indexes for the new columns
CREATE INDEX idx_payment_transactions_stripe_payment_intent_id ON payment_transactions(stripe_payment_intent_id);
CREATE INDEX idx_payment_transactions_paypal_order_id ON payment_transactions(paypal_order_id);

-- Down migration
-- ALTER TABLE payment_transactions DROP COLUMN stripe_payment_intent_id;
-- ALTER TABLE payment_transactions DROP COLUMN paypal_order_id;