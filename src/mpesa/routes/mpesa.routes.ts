import { Hono } from 'hono';
import Transaction from '../../models/Transaction';
import { initiateMpesaSTKPush, queryMpesaSTKStatus } from '../mpesaPayment';
import idempotencyMiddleware from '../../middleware/idempotency';

const router = new Hono<{ Bindings: { DATABASE_URL: string; MPESA_CONSUMER_KEY: string; MPESA_CONSUMER_SECRET: string; MPESA_SHORTCODE: string; MPESA_PASSKEY: string; MPESA_ENVIRONMENT: string; MPESA_STK_CALLBACK_URL: string; }; Variables: { idempotencyKey: string; }; }>();

router.post('/mpesa', idempotencyMiddleware, async (c) => {
  const { mobileNumber, amount, accountReference, transactionDesc, callbackUrl, cancelUrl } = await c.req.json();

  if (!mobileNumber || !amount || !accountReference) {
    return c.json({ error: 'Validation Error', message: 'mobileNumber, amount, and accountReference are required' }, 400);
  }

  const formattedNumber = mobileNumber.startsWith('254') ? mobileNumber : mobileNumber.replace(/^0/, '254');
  if (!/^254\d{9}$/.test(formattedNumber)) {
    return c.json({ error: 'Validation Error', message: 'Invalid mobile number format. Use 254XXXXXXXXX or 0XXXXXXXXX' }, 400);
  }

  if (typeof amount !== 'number' || amount <= 0 || amount > 150000) {
    return c.json({ error: 'Validation Error', message: 'Amount must be a positive number up to 150000' }, 400);
  }

  try {
    const transaction = await Transaction.create(c.env.DATABASE_URL, {
      idempotencyKey: c.get('idempotencyKey'),
      gateway: 'mpesa',
      amount: Math.floor(amount),
      currency: 'KES',
      status: 'pending',
      callbackUrl,
      cancelUrl,
      metadata: { mobileNumber: formattedNumber, accountReference, transactionDesc }
    });

    if (!transaction) {
      return c.json({ error: 'Transaction already exists' }, 409);
    }

    const result = await initiateMpesaSTKPush(c.env, {
      mobileNumber: formattedNumber,
      amount: Math.floor(amount),
      accountReference,
      transactionDesc,
      callbackUrl,
      cancelUrl,
    });

    await Transaction.updateStatus(c.env.DATABASE_URL, c.get('idempotencyKey'), 'pending', result.checkoutRequestId);

    return c.json({
      success: true,
      message: 'M-Pesa STK push initiated successfully',
      data: result,
      callbackUrlRegistered: !!callbackUrl,
      cancelUrlRegistered: !!cancelUrl,
    });
  } catch (error: any) {
    await Transaction.updateStatus(c.env.DATABASE_URL, c.get('idempotencyKey'), 'failed', null, error.message);
    return c.json({ error: error.message || 'M-Pesa STK push failed' }, 500);
  }
});

router.post('/mpesa/query', async (c) => {
  const { checkoutRequestId } = await c.req.json();
  if (!checkoutRequestId) {
    return c.json({ error: 'Validation Error', message: 'checkoutRequestId is required' }, 400);
  }

  try {
    const result = await queryMpesaSTKStatus(c.env, checkoutRequestId);
    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ error: error.message || 'M-Pesa status query failed' }, 500);
  }
});

router.get('/mpesa/status/:checkoutRequestId', async (c) => {
  const checkoutRequestId = c.req.param('checkoutRequestId');
  if (!checkoutRequestId) {
    return c.json({ error: 'Validation Error', message: 'checkoutRequestId is required in path' }, 400);
  }

  try {
    const result = await queryMpesaSTKStatus(c.env, checkoutRequestId);
    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ error: error.message || 'M-Pesa status query failed' }, 500);
  }
});

export default router;
