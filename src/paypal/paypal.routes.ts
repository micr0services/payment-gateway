import { Hono } from 'hono';
import Transaction from '../models/Transaction';
import { processPaypalPayment, capturePaypalPayment } from './paypalPayment';
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
    FRONTEND_BASE_URL: string;
  };
  Variables: {
    idempotencyKey: string;
  };
}>();

router.post('/paypal', idempotencyMiddleware, async (c) => {
  const { amount, currency = 'USD', callbackUrl, cancelUrl, metadata = {} } = await c.req.json();

  // Validate input
  if (!amount || amount <= 0) {
    return c.json({ error: 'Valid amount is required' }, 400);
  }

  try {
    const transaction = await Transaction.create(c.env.DATABASE_URL, {
      idempotencyKey: c.get('idempotencyKey'),
      gateway: 'paypal',
      amount,
      currency,
      status: 'pending',
      callbackUrl,
      cancelUrl,
      metadata
    });

    if (!transaction) {
      return c.json({ error: 'Transaction already exists' }, 409);
    }

    const result = await retry(async (bail) => {
      const paymentResult = await processPaypalPayment(c.env.PAYPAL_ENVIRONMENT, c.env.PAYPAL_CLIENT_ID, c.env.PAYPAL_CLIENT_SECRET, amount, currency, c.env.FRONTEND_BASE_URL);
      if (!paymentResult.success) {
        throw new Error(paymentResult.error);
      }
      return paymentResult;
    }, { retries: 3 });

    // Update transaction with PayPal Order ID
    await Transaction.updateStatus(
      c.env.DATABASE_URL,
      c.get('idempotencyKey'),
      'pending', // Status remains pending until webhook confirms
      null, // transaction_id - will be set on capture
      null,
      null, // stripe_payment_intent_id
      result.orderId // paypal_order_id
    );

    return c.json({
      orderId: result.orderId,
      links: result.links,
      approvalUrl: result.approvalUrl,
      status: 'pending',
      callbackUrlRegistered: !!callbackUrl,
      cancelUrlRegistered: !!cancelUrl
    });
  } catch (error: any) {
    await Transaction.updateStatus(c.env.DATABASE_URL, c.get('idempotencyKey'), 'failed', null, error.message);
    return c.json({ error: error.message }, 500);
  }
});

// Verify PayPal order
router.post('/paypal/verify', async (c) => {
  const { order_id } = await c.req.json();

  if (!order_id) {
    return c.json({ success: false, error: 'Order ID is required' }, 400);
  }

  try {
    const result = await capturePaypalPayment(c.env.PAYPAL_ENVIRONMENT, c.env.PAYPAL_CLIENT_ID, c.env.PAYPAL_CLIENT_SECRET, order_id);

    if (result.success && result.status === 'COMPLETED') {
      // Update transaction status
      const transaction = await Transaction.findByPaypalOrderId(c.env.DATABASE_URL, order_id);
      if (transaction && transaction.status !== 'completed') {
        await Transaction.updateStatus(c.env.DATABASE_URL, transaction.idempotency_key, 'completed', result.id);

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
        success: true,
        order: {
          id: result.id,
          status: result.status,
          amount: result.result.purchase_units[0].amount,
        },
        callbackSent: !!transaction?.callback_url
      });
    } else {
      return c.json({ success: false, error: result.error || 'Payment not completed' });
    }
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Cancel PayPal order
router.post('/paypal/:orderId/cancel', async (c) => {
  const { orderId } = c.req.param();
  const { reason = 'User initiated' } = await c.req.json();

  try {
    // Find transaction and update status to cancelled
    const transaction = await Transaction.findByPaypalOrderId(c.env.DATABASE_URL, orderId);
    if (!transaction) {
      return c.json({ error: 'Transaction not found' }, 404);
    }

    await Transaction.updateStatus(c.env.DATABASE_URL, transaction.idempotency_key, 'cancelled');

    // Send cancel notification if cancel URL is registered
    if (transaction.cancel_url) {
      const payload = constructCancelPayload({
        ...transaction,
        transaction_id: orderId,
        status: 'cancelled'
      }, reason);
      // Send cancel notification asynchronously (fire and forget)
      sendCancelNotification(transaction.cancel_url, payload).catch(err => 
        console.error('Cancel notification delivery failed:', err)
      );
    }

    return c.json({
      success: true,
      orderId: orderId,
      status: 'cancelled',
      message: 'Order cancelled successfully',
      cancelNotificationSent: !!transaction.cancel_url
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

export default router;