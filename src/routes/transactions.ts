import { Router, Request, Response } from 'express';
import Transaction from '../models/Transaction';

const router = Router();

/**
 * @swagger
 * /api/payments/transactions:
 *   get:
 *     summary: Retrieve a list of transactions with optional filters
 *     tags:
 *       - Transactions
 *     parameters:
 *       - in: query
 *         name: gateway
 *         schema:
 *           type: string
 *         description: Filter by gateway (stripe, paypal)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status (pending, completed, failed)
 *       - in: query
 *         name: minAmount
 *         schema:
 *           type: integer
 *         description: Minimum amount (in cents)
 *       - in: query
 *         name: maxAmount
 *         schema:
 *           type: integer
 *         description: Maximum amount (in cents)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start of creation date range (ISO format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End of creation date range (ISO format)
 *       - in: query
 *         name: idempotencyKey
 *         schema:
 *           type: string
 *         description: Exact idempotency key to match
 *     responses:
 *       "200":
 *         description: Array of transactions matching filters
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       "500":
 *         description: Internal server error
 */
router.get('/transactions', async (req: Request, res: Response): Promise<void> => {
  try {
    const filters: any = {};
    const {
      gateway,
      status,
      minAmount,
      maxAmount,
      startDate,
      endDate,
      idempotencyKey,
    } = req.query;

    if (gateway) filters.gateway = String(gateway);
    if (status) filters.status = String(status);
    if (minAmount) filters.minAmount = parseInt(String(minAmount), 10);
    if (maxAmount) filters.maxAmount = parseInt(String(maxAmount), 10);
    if (startDate) filters.startDate = String(startDate);
    if (endDate) filters.endDate = String(endDate);
    if (idempotencyKey) filters.idempotencyKey = String(idempotencyKey);

    const transactions = await Transaction.list(filters);
    res.json(transactions);
  } catch (error: any) {
    console.error('Error listing transactions', error);
    res.status(500).json({ error: 'Unable to fetch transactions' });
  }
});

export default router;
