import { Hono } from 'hono';
import { stkService } from './stk.service';
import idempotencyMiddleware from '../../middleware/idempotency';
import { Env } from '../../index';

const router = new Hono<{
  Bindings: Env;
  Variables: {
    idempotencyKey: string;
  };
}>();

/**
 * POST /api/stk/push
 * Initiate STK Push payment request
 */
router.post('/push', async (c) => {
  try {
    const { mobileNumber, amount, accountReference, transactionDesc } = await c.req.json();

    // Validation
    if (!mobileNumber || !amount || !accountReference) {
      return c.json(
        {
          error: 'Validation Error',
          message: 'mobileNumber, amount, and accountReference are required',
        },
        400
      );
    }

    if (typeof amount !== 'number' || amount <= 0 || amount > 150000) {
      return c.json(
        {
          error: 'Validation Error',
          message: 'Amount must be a positive number up to 150000',
        },
        400
      );
    }

    const result = await stkService.initiateSTKPush(c.env, {
      mobileNumber,
      amount,
      accountReference,
      transactionDesc,
    });

    return c.json({
      success: true,
      message: 'STK Push initiated successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('STK Push error:', error);
    return c.json({ error: error.message || 'STK push failed' }, 500);
  }
});

/**
 * POST /api/stk/query
 * Query STK Push status
 */
router.post('/query', async (c) => {
  try {
    const { checkoutRequestId } = await c.req.json();

    if (!checkoutRequestId) {
      return c.json(
        {
          error: 'Validation Error',
          message: 'checkoutRequestId is required',
        },
        400
      );
    }

    const result = await stkService.querySTKStatus(c.env, {
      checkoutRequestId,
    });

    return c.json({
      success: true,
      message: 'STK status retrieved successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('STK Query error:', error);
    return c.json({ error: error.message || 'STK query failed' }, 500);
  }
});

/**
 * GET /api/stk/status/:checkoutRequestId
 * Get STK Push status by ID
 */
router.get('/status/:checkoutRequestId', async (c) => {
  try {
    const checkoutRequestId = c.req.param('checkoutRequestId');

    if (!checkoutRequestId) {
      return c.json(
        {
          error: 'Validation Error',
          message: 'checkoutRequestId is required in path',
        },
        400
      );
    }

    const result = await stkService.querySTKStatus(c.env, {
      checkoutRequestId,
    });

    return c.json({
      success: true,
      message: 'STK status retrieved successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('STK Status error:', error);
    return c.json({ error: error.message || 'STK status retrieval failed' }, 500);
  }
});

export default router;
