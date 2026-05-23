import { Hono } from 'hono';
import Transaction from '../models/Transaction';
import {
  processStripePayment,
  cancelStripePayment,
  getStripePaymentStatus,
  refundStripePayment,
  confirmStripePayment,
  getStripeClient
} from './stripePayment';
import { convertToSmallestUnit, validatePaymentAmount } from '../lib/paymentUtils';
import { sendCallback, constructCallbackPayload, sendCancelNotification, constructCancelPayload } from '../lib/callbackUtils';
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
  const { amount, currency = 'usd', callbackUrl, cancelUrl, successRedirectUrl, failureRedirectUrl, metadata = {} } = await c.req.json();

  // Validate and convert amount from dollars to cents (or appropriate smallest unit)
  if (!amount || amount <= 0) {
    return c.json({ error: 'Valid amount is required' }, 400);
  }

  try {
    // Convert from decimal (e.g., 24.50) to smallest unit (e.g., 2450 cents)
    const amountInSmallestUnit = convertToSmallestUnit(currency, amount);

    // Create transaction record with pending status
    const transactionMetadata = {
      ...metadata,
      transactionId: c.get('idempotencyKey'),
      originalAmount: amount,
      conversionNote: `Converted from ${amount} to ${amountInSmallestUnit} smallest units`,
      successRedirectUrl,
      failureRedirectUrl
    };

    const transaction = await Transaction.create(c.env.DATABASE_URL, {
      idempotencyKey: c.get('idempotencyKey'),
      gateway: 'stripe',
      amount: amountInSmallestUnit,
      currency: currency.toUpperCase(),
      status: 'pending',
      transactionId: c.get('idempotencyKey'),
      callbackUrl,
      cancelUrl,
      metadata: transactionMetadata
    });

    if (!transaction) {
      return c.json({ error: 'Transaction already exists' }, 409);
    }

    // Process payment with retry and idempotency
    const result = await retry(async (bail) => {
      const paymentResult = await processStripePayment(
        c.env.STRIPE_SECRET_KEY,
        amountInSmallestUnit,
        currency,
        transactionMetadata,
        successRedirectUrl,
        failureRedirectUrl,
        c.get('idempotencyKey')
      );
      if (!paymentResult.success) {
        throw new Error(paymentResult.error);
      }
      return paymentResult;
    }, { retries: 3 });

    // Update transaction with Stripe Checkout session and PaymentIntent IDs.
    await Transaction.updateStatus(
      c.env.DATABASE_URL,
      c.get('idempotencyKey'),
      'pending',
      null,
      null,
      result.paymentIntentId ?? null
    );

    return c.json({
      checkoutUrl: result.checkoutUrl,
      sessionId: result.id,
      paymentIntentId: result.paymentIntentId || null,
      transactionId: c.get('idempotencyKey'),
      status: 'pending',
      amountProcessed: amountInSmallestUnit,
      currency: currency.toUpperCase(),
      callbackUrl: callbackUrl || null,
      successRedirectUrl: successRedirectUrl || null,
      failureRedirectUrl: failureRedirectUrl || null,
      cancelUrl: cancelUrl || null,
      callbackUrlRegistered: !!callbackUrl,
      successRedirectUrlRegistered: !!successRedirectUrl,
      failureRedirectUrlRegistered: !!failureRedirectUrl,
      cancelUrlRegistered: !!cancelUrl
    });
  } catch (error: any) {
    await Transaction.updateStatus(c.env.DATABASE_URL, c.get('idempotencyKey'), 'failed', null, error.message);
    return c.json({ error: error.message }, 400);
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
  const { reason = 'User initiated' } = await c.req.json();

  try {
    const result = await cancelStripePayment(c.env.STRIPE_SECRET_KEY, paymentIntentId);
    if (!result.success) {
      return c.json({ error: result.error }, 400);
    }

    // Update transaction status
    const transaction = await Transaction.findByStripePaymentIntentId(c.env.DATABASE_URL, paymentIntentId);
    if (transaction) {
      await Transaction.updateStatus(c.env.DATABASE_URL, transaction.idempotency_key, 'cancelled');

      // Send cancel notification if cancel URL is registered
      if (transaction.cancel_url) {
        const payload = constructCancelPayload({
          ...transaction,
          transaction_id: result.id,
          status: 'cancelled'
        }, reason);
        // Send cancel notification asynchronously (fire and forget)
        sendCancelNotification(transaction.cancel_url, payload).catch(err => 
          console.error('Cancel notification delivery failed:', err)
        );
      }
    }

    return c.json({
      paymentIntentId: result.id,
      status: result.status,
      message: 'Payment cancelled successfully',
      cancelNotificationSent: !!transaction?.cancel_url
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

      // Send callback if callback URL is registered
      if (transaction.callback_url) {
        const payload = constructCallbackPayload({
          ...transaction,
          transaction_id: result.id,
          status: 'completed'
        });
        // Send callback asynchronously (fire and forget)
        sendCallback(transaction.callback_url, payload).catch(err => 
          console.error('Callback delivery failed:', err)
        );
      }
    }

    return c.json({
      paymentIntentId: result.id,
      status: result.status,
      message: 'Payment confirmed successfully',
      callbackSent: !!transaction?.callback_url
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Verify Stripe session
router.post('/stripe/verify', async (c) => {
  const { session_id } = await c.req.json();

  if (!session_id) {
    return c.json({ success: false, error: 'Session ID is required' }, 400);
  }

  try {
    const stripe = getStripeClient(c.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid') {
      const paymentIntentId = typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id;

      // Update transaction status if found
      const transaction = paymentIntentId
        ? await Transaction.findByStripePaymentIntentId(c.env.DATABASE_URL, paymentIntentId)
        : await Transaction.findByStripePaymentIntentId(c.env.DATABASE_URL, session.id);

      if (transaction && transaction.status !== 'completed') {
        await Transaction.updateStatus(c.env.DATABASE_URL, transaction.idempotency_key, 'completed');
      }

      return c.json({
        success: true,
        session: {
          id: session.id,
          payment_status: session.payment_status,
          amount_total: session.amount_total,
          currency: session.currency,
          paymentIntentId: paymentIntentId || null
        }
      });
    } else {
      return c.json({ success: false, error: 'Payment not completed' });
    }
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

export default router;