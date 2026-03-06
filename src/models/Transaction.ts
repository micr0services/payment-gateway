import pool from '../config/database';

interface TransactionData {
  id?: number;
  idempotency_key: string;
  gateway: string;
  amount: number;
  currency: string;
  status: string;
  transaction_id?: string;
  error?: string;
  metadata: any;
  created_at?: Date;
  updated_at?: Date;
}

interface CreateTransactionParams {
  idempotencyKey: string;
  gateway: string;
  amount: number;
  currency: string;
  status: string;
  metadata: any;
}

/**
 * Transaction model for handling payment transaction records in the database.
 * Provides methods to create, find, and update transactions with idempotency support.
 */
class Transaction {
  /**
   * Creates a new transaction record in the database.
   * Uses ON CONFLICT DO NOTHING to handle idempotency at the database level.
   * @param params - The transaction parameters
   * @returns The created transaction data or undefined if conflict
   */
  static async create(params: CreateTransactionParams): Promise<TransactionData | undefined> {
    const { idempotencyKey, gateway, amount, currency, status, metadata } = params;
    const query = `
      INSERT INTO transactions (idempotency_key, gateway, amount, currency, status, metadata, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      ON CONFLICT (idempotency_key) DO NOTHING
      RETURNING *;
    `;
    const values = [idempotencyKey, gateway, amount, currency, status, JSON.stringify(metadata)];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Finds a transaction by its idempotency key.
   * @param idempotencyKey - The unique idempotency key
   * @returns The transaction data or undefined if not found
   */
  static async findByIdempotencyKey(idempotencyKey: string): Promise<TransactionData | undefined> {
    const query = 'SELECT * FROM transactions WHERE idempotency_key = $1';
    const result = await pool.query(query, [idempotencyKey]);
    return result.rows[0];
  }

  /**
   * Updates the status of a transaction.
   * @param idempotencyKey - The idempotency key of the transaction
   * @param status - The new status
   * @param transactionId - Optional gateway transaction ID
   * @param error - Optional error message
   * @returns The updated transaction data
   */
  static async updateStatus(
    idempotencyKey: string,
    status: string,
    transactionId: string | null = null,
    error: string | null = null
  ): Promise<TransactionData | undefined> {
    const query = `
      UPDATE transactions
      SET status = $1, transaction_id = $2, error = $3, updated_at = NOW()
      WHERE idempotency_key = $4
      RETURNING *;
    `;
    const values = [status, transactionId, error, idempotencyKey];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Lists transactions with optional filters.
   * Supported filters: gateway, status, minAmount, maxAmount,
   * startDate, endDate, idempotencyKey.
   */
  static async list(filters: {
    gateway?: string;
    status?: string;
    minAmount?: number;
    maxAmount?: number;
    startDate?: string; // ISO date
    endDate?: string;   // ISO date
    idempotencyKey?: string;
  }): Promise<TransactionData[]> {
    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (filters.gateway) {
      conditions.push(`gateway = $${idx++}`);
      values.push(filters.gateway);
    }
    if (filters.status) {
      conditions.push(`status = $${idx++}`);
      values.push(filters.status);
    }
    if (filters.minAmount !== undefined) {
      conditions.push(`amount >= $${idx++}`);
      values.push(filters.minAmount);
    }
    if (filters.maxAmount !== undefined) {
      conditions.push(`amount <= $${idx++}`);
      values.push(filters.maxAmount);
    }
    if (filters.startDate) {
      conditions.push(`created_at >= $${idx++}`);
      values.push(filters.startDate);
    }
    if (filters.endDate) {
      conditions.push(`created_at <= $${idx++}`);
      values.push(filters.endDate);
    }
    if (filters.idempotencyKey) {
      conditions.push(`idempotency_key = $${idx++}`);
      values.push(filters.idempotencyKey);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = `SELECT * FROM transactions ${where} ORDER BY created_at DESC`;
    const result = await pool.query(query, values);
    return result.rows;
  }
}

export default Transaction;