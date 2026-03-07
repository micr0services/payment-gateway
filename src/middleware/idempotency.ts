import { MiddlewareHandler } from 'hono';
import { v4 as uuidv4 } from 'uuid';
import Transaction from '../models/Transaction';

/**
 * Middleware to enforce idempotency for payment requests.
 * Checks if a transaction with the given Idempotency-Key already exists.
 * If it does, returns the existing transaction status.
 * If no Idempotency-Key is provided, auto-generates one using current timestamp and UUID.
 * Otherwise, attaches the key to the context and proceeds.
 */
const idempotencyMiddleware: MiddlewareHandler<{ 
  Bindings: { 
    STRIPE_SECRET_KEY: string;
    PAYPAL_ENVIRONMENT: string;
    PAYPAL_CLIENT_ID: string;
    PAYPAL_CLIENT_SECRET: string;
    DATABASE_URL: string;
  };
  Variables: {
    idempotencyKey: string;
  };
}> = async (c, next) => {
  let idempotencyKey = c.req.header('Idempotency-Key');
  
  // Auto-generate idempotency key if not provided
  if (!idempotencyKey) {
    idempotencyKey = `auto-${Date.now()}-${uuidv4()}`;
  }

  try {
    const existingTransaction = await Transaction.findByIdempotencyKey(c.env.DATABASE_URL, idempotencyKey);
    if (existingTransaction) {
      // Return the existing transaction status
      return c.json({
        status: existingTransaction.status,
        transactionId: existingTransaction.transaction_id,
        message: 'Transaction already processed'
      });
    }
    // Attach to context for later use
    c.set('idempotencyKey', idempotencyKey);
    await next();
  } catch (error) {
    console.error('Idempotency check error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

export default idempotencyMiddleware;