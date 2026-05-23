import { getDbConnection } from '../lib/db';

interface TransactionData {
  id?: number;
  idempotency_key: string;
  gateway: string;
  amount: number;
  currency: string;
  status: string;
  transaction_id?: string;
  stripe_payment_intent_id?: string;
  paypal_order_id?: string;
  callback_url?: string;
  cancel_url?: string;
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
  transactionId?: string;
  stripePaymentIntentId?: string;
  paypalOrderId?: string;
  callbackUrl?: string;
  cancelUrl?: string;
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
    const sql = getDbConnection(databaseUrl);
    try {
      const { idempotencyKey, gateway, amount, currency, status, metadata, transactionId, stripePaymentIntentId, paypalOrderId, callbackUrl, cancelUrl } = params;
      const result = await sql`
        INSERT INTO payment_gateway.payment_transactions (idempotency_key, gateway, amount, currency, status, transaction_id, metadata, stripe_payment_intent_id, paypal_order_id, callback_url, cancel_url, created_at, updated_at)
        VALUES (${idempotencyKey}, ${gateway}, ${amount}, ${currency}, ${status}, ${transactionId || null}, ${JSON.stringify(metadata)}, ${stripePaymentIntentId || null}, ${paypalOrderId || null}, ${callbackUrl || null}, ${cancelUrl || null}, NOW(), NOW())
        ON CONFLICT (idempotency_key) DO NOTHING
        RETURNING *;
      `;
      return result.length > 0 ? result[0] as TransactionData : undefined;
    } finally {
      await sql.end();
    }
  }

  /**
   * Finds a transaction by its ID.
   * @param databaseUrl - PostgreSQL connection string
   * @param id - The transaction ID
   * @returns The transaction data or undefined if not found
   */
  static async findById(databaseUrl: string, id: number): Promise<TransactionData | undefined> {
    const sql = getDbConnection(databaseUrl);
    try {
      const result = await sql`
        SELECT * FROM payment_gateway.payment_transactions WHERE id = ${id};
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
    const sql = getDbConnection(databaseUrl);
    try {
      const result = await sql`
        SELECT * FROM payment_gateway.payment_transactions WHERE idempotency_key = ${idempotencyKey};
      `;
      return result.length > 0 ? result[0] as TransactionData : undefined;
    } finally {
      await sql.end();
    }
  }

  /**
   * Finds a transaction by its Stripe PaymentIntent ID.
   * @param databaseUrl - PostgreSQL connection string
   * @param stripePaymentIntentId - The Stripe PaymentIntent ID
   * @returns The transaction data or undefined if not found
   */
  static async findByStripePaymentIntentId(databaseUrl: string, stripePaymentIntentId: string): Promise<TransactionData | undefined> {
    const sql = getDbConnection(databaseUrl);
    try {
      const result = await sql`
        SELECT * FROM payment_gateway.payment_transactions WHERE stripe_payment_intent_id = ${stripePaymentIntentId};
      `;
      return result.length > 0 ? result[0] as TransactionData : undefined;
    } finally {
      await sql.end();
    }
  }

  /**
   * Finds a transaction by its PayPal Order ID.
   * @param databaseUrl - PostgreSQL connection string
   * @param paypalOrderId - The PayPal Order ID
   * @returns The transaction data or undefined if not found
   */
  static async findByPaypalOrderId(databaseUrl: string, paypalOrderId: string): Promise<TransactionData | undefined> {
    const sql = getDbConnection(databaseUrl);
    try {
      const result = await sql`
        SELECT * FROM payment_gateway.payment_transactions WHERE paypal_order_id = ${paypalOrderId};
      `;
      return result.length > 0 ? result[0] as TransactionData : undefined;
    } finally {
      await sql.end();
    }
  }

  /**
   * Updates a transaction's status and optionally sets transaction_id, payment provider IDs, or error.
   * @param databaseUrl - PostgreSQL connection string
   * @param idempotencyKey - The idempotency key of the transaction to update
   * @param status - The new status
   * @param transactionId - Optional transaction ID from the payment provider
   * @param error - Optional error message if the transaction failed
   * @param stripePaymentIntentId - Optional Stripe PaymentIntent ID
   * @param paypalOrderId - Optional PayPal Order ID
   * @returns The updated transaction data or undefined if not found
   */
  static async updateStatus(
    databaseUrl: string,
    idempotencyKey: string,
    status: string,
    transactionId: string | null = null,
    error: string | null = null,
    stripePaymentIntentId: string | null = null,
    paypalOrderId: string | null = null
  ): Promise<TransactionData | undefined> {
    const sql = getDbConnection(databaseUrl);
    try {
      const result = await sql`
        UPDATE payment_gateway.payment_transactions
        SET status = ${status},
            transaction_id = COALESCE(${transactionId}, transaction_id),
            error = ${error},
            stripe_payment_intent_id = COALESCE(${stripePaymentIntentId}, stripe_payment_intent_id),
            paypal_order_id = COALESCE(${paypalOrderId}, paypal_order_id),
            updated_at = NOW()
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
    const sql = getDbConnection(databaseUrl);
    try {
      let query = sql`SELECT * FROM payment_gateway.payment_transactions`;
      const conditions: any[] = [];

      if (filters.gateway) {
        conditions.push(sql`gateway = ${filters.gateway}`);
      }
      if (filters.status) {
        conditions.push(sql`status = ${filters.status}`);
      }
      if (filters.minAmount !== undefined) {
        conditions.push(sql`amount >= ${filters.minAmount}`);
      }
      if (filters.maxAmount !== undefined) {
        conditions.push(sql`amount <= ${filters.maxAmount}`);
      }
      if (filters.startDate) {
        conditions.push(sql`created_at >= ${filters.startDate}`);
      }
      if (filters.endDate) {
        conditions.push(sql`created_at <= ${filters.endDate}`);
      }
      if (filters.idempotencyKey) {
        conditions.push(sql`idempotency_key = ${filters.idempotencyKey}`);
      }

      if (conditions.length > 0) {
        for (let i = 0; i < conditions.length; i++) {
          if (i === 0) {
            query = sql`${query} WHERE ${conditions[i]}`;
          } else {
            query = sql`${query} AND ${conditions[i]}`;
          }
        }
      }

      query = sql`${query} ORDER BY created_at DESC`;

      const result = await query;
      return result as unknown as TransactionData[];
    } finally {
      await sql.end();
    }
  }
}

export default Transaction;