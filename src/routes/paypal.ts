import { Router, Request, Response } from 'express';
import Transaction from '../models/Transaction';
import { processPaypalPayment } from '../lib/paypalPayment';
import idempotencyMiddleware from '../middleware/idempotency';
import retry from 'async-retry';

const router = Router();

/**
 * @swagger
 * /api/payments/paypal:
 *   post:
 *     summary: Create a PayPal order
 *     tags:
 *       - PayPal
 *     parameters:
 *       - in: header
 *         name: Idempotency-Key
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique key to prevent duplicate orders
 *     requestBody:
 *       description: Order details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: integer
 *                 description: Amount in cents
 *               currency:
 *                 type: string
 *                 description: Currency code, default USD
 *               metadata:
 *                 type: object
 *                 description: Optional metadata
 *     responses:
 *       "200":
 *         description: Order created successfully. The response includes a
 *           list of HATEOAS links; the `approve` link (approvalUrl) is what the
 *           frontend should redirect the buyer to.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orderId:
 *                   type: string
 *                 approvalUrl:
 *                   type: string
 *                   description: URL where the customer must approve the order
 *                 links:
 *                   type: array
 *                   items:
 *                     type: object
 *       "409":
 *         description: Transaction already exists
 *       "500":
 *         description: Internal server error
 */
router.post('/paypal', idempotencyMiddleware, async (req: Request, res: Response): Promise<void> => {
  const { amount, currency = 'USD', metadata = {} } = req.body;

  try {
    const transaction = await Transaction.create({
      idempotencyKey: (req as any).idempotencyKey,
      gateway: 'paypal',
      amount,
      currency,
      status: 'pending',
      metadata
    });

    if (!transaction) {
      res.status(409).json({ error: 'Transaction already exists' });
      return;
    }

    const result = await retry(async (bail) => {
      const paymentResult = await processPaypalPayment(amount, currency);
      if (!paymentResult.success) {
        throw new Error(paymentResult.error);
      }
      return paymentResult;
    }, { retries: 3 });

    await Transaction.updateStatus((req as any).idempotencyKey, 'completed', result.orderId);

    res.json({ orderId: result.orderId, links: result.links });
  } catch (error: any) {
    await Transaction.updateStatus((req as any).idempotencyKey, 'failed', null, error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;