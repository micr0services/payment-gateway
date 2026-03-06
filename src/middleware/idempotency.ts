import { Request, Response, NextFunction } from 'express';
import Transaction from '../models/Transaction';

/**
 * Middleware to enforce idempotency for payment requests.
 * Checks if a transaction with the given Idempotency-Key already exists.
 * If it does, returns the existing transaction status.
 * Otherwise, attaches the key to the request and proceeds.
 */
const idempotencyMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const idempotencyKey = req.headers['idempotency-key'] as string;
  if (!idempotencyKey) {
    res.status(400).json({ error: 'Idempotency-Key header is required' });
    return;
  }

  try {
    const existingTransaction = await Transaction.findByIdempotencyKey(idempotencyKey);
    if (existingTransaction) {
      // Return the existing transaction status
      res.status(200).json({
        status: existingTransaction.status,
        transactionId: existingTransaction.transaction_id,
        message: 'Transaction already processed'
      });
      return;
    }
    // Attach to req for later use
    (req as any).idempotencyKey = idempotencyKey;
    next();
  } catch (error) {
    console.error('Idempotency check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default idempotencyMiddleware;