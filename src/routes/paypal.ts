import { Hono } from 'hono';
import Transaction from '../models/Transaction';
import { processPaypalPayment } from '../lib/paypalPayment';
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

router.post('/paypal', idempotencyMiddleware, async (c) => {
  const { amount, currency = 'USD', metadata = {} } = await c.req.json();

  try {
    const transaction = await Transaction.create(c.env.DATABASE_URL, {
      idempotencyKey: c.get('idempotencyKey'),
      gateway: 'paypal',
      amount,
      currency,
      status: 'pending',
      metadata
    });

    if (!transaction) {
      return c.json({ error: 'Transaction already exists' }, 409);
    }

    const result = await retry(async (bail) => {
      const paymentResult = await processPaypalPayment(c.env.PAYPAL_ENVIRONMENT, c.env.PAYPAL_CLIENT_ID, c.env.PAYPAL_CLIENT_SECRET, amount, currency);
      if (!paymentResult.success) {
        throw new Error(paymentResult.error);
      }
      return paymentResult;
    }, { retries: 3 });

    await Transaction.updateStatus(c.env.DATABASE_URL, c.get('idempotencyKey'), 'completed', result.orderId);

    return c.json({ orderId: result.orderId, links: result.links });
  } catch (error: any) {
    await Transaction.updateStatus(c.env.DATABASE_URL, c.get('idempotencyKey'), 'failed', null, error.message);
    return c.json({ error: error.message }, 500);
  }
});

export default router;