import { Hono } from 'hono';
import Transaction from '../models/Transaction';
import { processStripePayment } from '../lib/stripePayment';
import idempotencyMiddleware from '../middleware/idempotency';
import retry from 'async-retry';

const router = new Hono<{ 
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
}>();

router.post('/stripe', idempotencyMiddleware, async (c) => {
  const { amount, currency = 'usd', metadata = {} } = await c.req.json();

  try {
    // Create transaction record
    const transaction = await Transaction.create(c.env.DATABASE_URL, {
      idempotencyKey: c.get('idempotencyKey'),
      gateway: 'stripe',
      amount,
      currency: currency.toUpperCase(),
      status: 'pending',
      metadata
    });

    if (!transaction) {
      return c.json({ error: 'Transaction already exists' }, 409);
    }

    // Process payment with retry
    const result = await retry(async (bail) => {
      const paymentResult = await processStripePayment(c.env.STRIPE_SECRET_KEY, amount, currency, metadata);
      if (!paymentResult.success) {
        throw new Error(paymentResult.error);
      }
      return paymentResult;
    }, { retries: 3 });

    // Update transaction
    await Transaction.updateStatus(c.env.DATABASE_URL, c.get('idempotencyKey'), 'completed', result.id);

    return c.json({ clientSecret: result.clientSecret, transactionId: result.id });
  } catch (error: any) {
    await Transaction.updateStatus(c.env.DATABASE_URL, c.get('idempotencyKey'), 'failed', null, error.message);
    return c.json({ error: error.message }, 500);
  }
});

export default router;