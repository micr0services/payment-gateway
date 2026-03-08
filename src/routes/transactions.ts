import { Hono } from 'hono';
import Transaction from '../models/Transaction';

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

router.get('/transactions', async (c) => {
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
    } = c.req.query();

    if (gateway) filters.gateway = String(gateway);
    if (status) filters.status = String(status);
    if (minAmount) filters.minAmount = parseInt(String(minAmount), 10);
    if (maxAmount) filters.maxAmount = parseInt(String(maxAmount), 10);
    if (startDate) filters.startDate = String(startDate);
    if (endDate) filters.endDate = String(endDate);
    if (idempotencyKey) filters.idempotencyKey = String(idempotencyKey);

    const transactions = await Transaction.list(c.env.DATABASE_URL, filters);
    return c.json(transactions);
  } catch (error: any) {
    console.error('Error listing transactions', error);
    return c.json({ error: 'Unable to fetch transactions' }, 500);
  }
});

router.get('/transactions/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'), 10);
    if (isNaN(id)) {
      return c.json({ error: 'Invalid transaction ID' }, 400);
    }

    const transaction = await Transaction.findById(c.env.DATABASE_URL, id);
    if (!transaction) {
      return c.json({ error: 'Transaction not found' }, 404);
    }

    return c.json(transaction);
  } catch (error: any) {
    console.error('Error fetching transaction', error);
    return c.json({ error: 'Unable to fetch transaction' }, 500);
  }
});

export default router;
