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

    // Update transaction with PayPal Order ID
    await Transaction.updateStatus(
      c.env.DATABASE_URL,
      c.get('idempotencyKey'),
      'pending', // Status remains pending until webhook confirms
      result.orderId,
      null,
      null, // stripe_payment_intent_id
      result.orderId // paypal_order_id
    );

    return c.json({
      orderId: result.orderId,
      links: result.links,
      approvalUrl: result.approvalUrl,
      status: 'pending'
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
    const paypal = require('@paypal/paypal-server-sdk')(c.env.PAYPAL_ENVIRONMENT, c.env.PAYPAL_CLIENT_ID, c.env.PAYPAL_CLIENT_SECRET);
    const ordersController = paypal.ordersController;

    const captureRequest = new paypal.orders.OrdersCaptureRequest(order_id);
    const captureResponse = await ordersController.ordersCapture(captureRequest);

    if (captureResponse.result.status === 'COMPLETED') {
      // Update transaction status
      const transaction = await Transaction.findByPaypalOrderId(c.env.DATABASE_URL, order_id);
      if (transaction && transaction.status !== 'completed') {
        await Transaction.updateStatus(c.env.DATABASE_URL, transaction.idempotency_key, 'completed');
      }

      return c.json({
        success: true,
        order: {
          id: captureResponse.result.id,
          status: captureResponse.result.status,
          amount: captureResponse.result.purchase_units[0].amount,
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