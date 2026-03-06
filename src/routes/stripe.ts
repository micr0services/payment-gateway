import { Router, Request, Response } from 'express';
import Transaction from '../models/Transaction';
import { processStripePayment } from '../lib/stripePayment';
import idempotencyMiddleware from '../middleware/idempotency';
import retry from 'async-retry';

const router = Router();

/**
 * @swagger
 * /api/payments/stripe:
 *   post:
 *     summary: Create a Stripe payment intent
 *     tags:
 *       - Stripe
 *     parameters:
 *       - in: header
 *         name: Idempotency-Key
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique key used to make the request idempotent
 *     requestBody:
 *       description: Payment information
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
 *                 description: Currency code (e.g. usd)
 *               metadata:
 *                 type: object
 *                 description: Optional metadata
 *     responses:
 *       "200":
 *         description: Payment intent created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clientSecret:
 *                   type: string
 *                 transactionId:
 *                   type: string
 *       "409":
 *         description: Transaction already exists (idempotency key reused)
 *       "500":
 *         description: Internal server error
 */
router.post('/stripe', idempotencyMiddleware, async (req: Request, res: Response): Promise<void> => {
  const { amount, currency = 'usd', metadata = {} } = req.body;

  try {
    // Create transaction record
    const transaction = await Transaction.create({
      idempotencyKey: (req as any).idempotencyKey,
      gateway: 'stripe',
      amount,
      currency: currency.toUpperCase(),
      status: 'pending',
      metadata
    });

    if (!transaction) {
      res.status(409).json({ error: 'Transaction already exists' });
      return;
    }

    // Process payment with retry
    const result = await retry(async (bail) => {
      const paymentResult = await processStripePayment(amount, currency, metadata);
      if (!paymentResult.success) {
        throw new Error(paymentResult.error);
      }
      return paymentResult;
    }, { retries: 3 });

    // Update transaction
    await Transaction.updateStatus((req as any).idempotencyKey, 'completed', result.id);

    res.json({ clientSecret: result.clientSecret, transactionId: result.id });
  } catch (error: any) {
    await Transaction.updateStatus((req as any).idempotencyKey, 'failed', null, error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;