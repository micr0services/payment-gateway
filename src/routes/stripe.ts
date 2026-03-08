import { Hono } from 'hono';
import Transaction from '../models/Transaction';
import {
  processStripePayment,
  cancelStripePayment,
  getStripePaymentStatus,
  refundStripePayment,
  confirmStripePayment
} from '../lib/stripePayment';
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

  // Validate input
  if (!amount || amount <= 0) {
    return c.json({ error: 'Valid amount is required' }, 400);
  }

  try {
    // Create transaction record with pending status
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

    // Process payment with retry and idempotency
    const result = await retry(async (bail) => {
      const paymentResult = await processStripePayment(
        c.env.STRIPE_SECRET_KEY,
        amount,
        currency,
        metadata,
        c.get('idempotencyKey')
      );
      if (!paymentResult.success) {
        throw new Error(paymentResult.error);
      }
      return paymentResult;
    }, { retries: 3 });

    // Update transaction with Stripe Checkout Session ID
    await Transaction.updateStatus(
      c.env.DATABASE_URL,
      c.get('idempotencyKey'),
      'pending', // Status remains pending until webhook confirms
      result.id,
      null,
      result.id // stripe_payment_intent_id (using for session ID)
    );

    return c.json({
      checkoutUrl: result.checkoutUrl,
      sessionId: result.id,
      status: 'pending'
    });
  } catch (error: any) {
    await Transaction.updateStatus(c.env.DATABASE_URL, c.get('idempotencyKey'), 'failed', null, error.message);
    return c.json({ error: error.message }, 500);
  }
});

// Get payment status
router.get('/stripe/:paymentIntentId', async (c) => {
  const { paymentIntentId } = c.req.param();

  try {
    const result = await getStripePaymentStatus(c.env.STRIPE_SECRET_KEY, paymentIntentId);
    if (!result.success) {
      return c.json({ error: result.error }, 400);
    }

    // Also get transaction from database
    const transaction = await Transaction.findByStripePaymentIntentId(c.env.DATABASE_URL, paymentIntentId);

    return c.json({
      paymentIntentId: result.id,
      status: result.status,
      transaction: transaction ? {
        id: transaction.id,
        idempotencyKey: transaction.idempotency_key,
        amount: transaction.amount,
        currency: transaction.currency,
        gatewayStatus: transaction.status,
        createdAt: transaction.created_at
      } : null
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Cancel payment
router.post('/stripe/:paymentIntentId/cancel', async (c) => {
  const { paymentIntentId } = c.req.param();

  try {
    const result = await cancelStripePayment(c.env.STRIPE_SECRET_KEY, paymentIntentId);
    if (!result.success) {
      return c.json({ error: result.error }, 400);
    }

    // Update transaction status
    const transaction = await Transaction.findByStripePaymentIntentId(c.env.DATABASE_URL, paymentIntentId);
    if (transaction) {
      await Transaction.updateStatus(c.env.DATABASE_URL, transaction.idempotency_key, 'cancelled');
    }

    return c.json({
      paymentIntentId: result.id,
      status: result.status,
      message: 'Payment cancelled successfully'
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Refund payment
router.post('/stripe/:paymentIntentId/refund', async (c) => {
  const { paymentIntentId } = c.req.param();
  const { amount } = await c.req.json();

  try {
    const result = await refundStripePayment(c.env.STRIPE_SECRET_KEY, paymentIntentId, amount);
    if (!result.success) {
      return c.json({ error: result.error }, 400);
    }

    return c.json({
      refundId: result.id,
      status: result.status,
      message: 'Refund processed successfully'
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Confirm payment (for testing purposes)
router.post('/stripe/:paymentIntentId/confirm', async (c) => {
  const { paymentIntentId } = c.req.param();
  const { paymentMethodId = 'pm_card_visa' } = await c.req.json();

  try {
    const result = await confirmStripePayment(c.env.STRIPE_SECRET_KEY, paymentIntentId, paymentMethodId);
    if (!result.success) {
      return c.json({ error: result.error }, 400);
    }

    // Update transaction status
    const transaction = await Transaction.findByStripePaymentIntentId(c.env.DATABASE_URL, paymentIntentId);
    if (transaction) {
      await Transaction.updateStatus(c.env.DATABASE_URL, transaction.idempotency_key, 'completed');
    }

    return c.json({
      paymentIntentId: result.id,
      status: result.status,
      message: 'Payment confirmed successfully'
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export default router;