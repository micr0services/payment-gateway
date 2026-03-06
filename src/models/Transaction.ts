import postgres from 'postgres';

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
  created_at?: string;
  updated_at?: string;
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
   * @param databaseUrl - PostgreSQL connection string
   * @param params - The transaction parameters
   * @returns The created transaction data or undefined if conflict
   */
  static async create(databaseUrl: string, params: CreateTransactionParams): Promise<TransactionData | undefined> {
    const { idempotencyKey, gateway, amount, currency, status, metadata } = params;
    const sql = postgres(databaseUrl);
    try {
      const result = await sql`
        INSERT INTO transactions (idempotency_key, gateway, amount, currency, status, metadata, created_at, updated_at)
        VALUES (${idempotencyKey}, ${gateway}, ${amount}, ${currency}, ${status}, ${JSON.stringify(metadata)}, NOW(), NOW())
        ON CONFLICT (idempotency_key) DO NOTHING
        RETURNING *;
      `;
      return result.length > 0 ? result[0] as TransactionData : undefined;
    } finally {
      await sql.end();
    }
  }

  /**
   * Finds a transaction by its idempotency key.
   * @param databaseUrl - PostgreSQL connection string
   * @param idempotencyKey - The unique idempotency key
   * @returns The transaction data or undefined if not found
   */
  static async findByIdempotencyKey(databaseUrl: string, idempotencyKey: string): Promise<TransactionData | undefined> {
    const sql = postgres(databaseUrl);
    try {
      const result = await sql`
        SELECT * FROM transactions WHERE idempotency_key = ${idempotencyKey};
      `;
      return result.length > 0 ? result[0] as TransactionData : undefined;
    } finally {
      await sql.end();
    }
  }

  /**
   * Updates a transaction's status and optionally sets transaction_id or error.
   * @param databaseUrl - PostgreSQL connection string
   * @param idempotencyKey - The idempotency key of the transaction to update
   * @param status - The new status
   * @param transactionId - Optional transaction ID from the payment provider
   * @param error - Optional error message if the transaction failed
   * @returns The updated transaction data or undefined if not found
   */
  static async updateStatus(
    databaseUrl: string,
    idempotencyKey: string,
    status: string,
    transactionId: string | null = null,
    error: string | null = null
  ): Promise<TransactionData | undefined> {
    const sql = postgres(databaseUrl);
    try {
      const result = await sql`
        UPDATE transactions
        SET status = ${status}, transaction_id = ${transactionId}, error = ${error}, updated_at = NOW()
        WHERE idempotency_key = ${idempotencyKey}
        RETURNING *;
      `;
      return result.length > 0 ? result[0] as TransactionData : undefined;
    } finally {
      await sql.end();
    }
  }

  /**
   * Lists transactions with optional filters.
   * Supported filters: gateway, status, minAmount, maxAmount,
   * startDate, endDate, idempotencyKey.
   * @param databaseUrl - PostgreSQL connection string
   * @param filters - Optional filters to apply
   * @returns Array of transaction data
   */
  static async list(databaseUrl: string, filters: {
    gateway?: string;
    status?: string;
    minAmount?: number;
    maxAmount?: number;
    startDate?: string;
    endDate?: string;
    idempotencyKey?: string;
  } = {}): Promise<TransactionData[]> {
    const sql = postgres(databaseUrl);
    try {
      let conditions: string[] = [];
      let values: any[] = [];

      if (filters.gateway) {
        conditions.push('gateway = ?');
        values.push(filters.gateway);
      }
      if (filters.status) {
        conditions.push('status = ?');
        values.push(filters.status);
      }
      if (filters.minAmount !== undefined) {
        conditions.push('amount >= ?');
        values.push(filters.minAmount);
      }
      if (filters.maxAmount !== undefined) {
        conditions.push('amount <= ?');
        values.push(filters.maxAmount);
      }
      if (filters.startDate) {
        conditions.push('created_at >= ?');
        values.push(filters.startDate);
      }
      if (filters.endDate) {
        conditions.push('created_at <= ?');
        values.push(filters.endDate);
      }
      if (filters.idempotencyKey) {
        conditions.push('idempotency_key = ?');
        values.push(filters.idempotencyKey);
      }

      const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      const query = `SELECT * FROM transactions ${whereClause} ORDER BY created_at DESC`;

      const result = await sql.unsafe(query, values);
      return result as unknown as TransactionData[];
    } finally {
      await sql.end();
    }
  }
}

export default Transaction;