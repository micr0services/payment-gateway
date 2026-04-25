/**
 * Callback utilities for notifying clients of payment status changes
 */

interface CallbackPayload {
  idempotencyKey: string;
  gateway: string;
  status: string;
  transactionId?: string;
  amount: number;
  currency: string;
  timestamp: string;
  error?: string;
  metadata?: any;
}

/**
 * Sends a callback notification to the client's provided callback URL
 * @param callbackUrl - The client's callback URL
 * @param payload - The payment status data to send
 * @param retries - Number of retry attempts on failure
 * @returns true if callback was sent successfully, false otherwise
 */
export async function sendCallback(
  callbackUrl: string,
  payload: CallbackPayload,
  retries: number = 3
): Promise<boolean> {
  if (!callbackUrl) {
    console.warn('No callback URL provided');
    return false;
  }

  // Validate callback URL format
  try {
    new URL(callbackUrl);
  } catch (e) {
    console.error('Invalid callback URL format:', callbackUrl);
    return false;
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(callbackUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Payment-Callback': 'true',
          'X-Callback-Version': '1.0'
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (response.ok) {
        console.log(`Callback sent successfully to ${callbackUrl}`);
        return true;
      } else {
        lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
        console.warn(`Callback failed with status ${response.status}, attempt ${attempt + 1}/${retries}`);
      }
    } catch (error) {
      lastError = error as Error;
      console.warn(`Callback attempt ${attempt + 1}/${retries} failed:`, lastError.message);
      
      // Exponential backoff: wait before retrying
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  console.error(`Callback delivery failed after ${retries} attempts:`, lastError);
  return false;
}

/**
 * Constructs a callback payload from transaction data
 * @param transaction - The transaction data
 * @returns Formatted callback payload
 */
export function constructCallbackPayload(transaction: any): CallbackPayload {
  return {
    idempotencyKey: transaction.idempotency_key,
    gateway: transaction.gateway,
    status: transaction.status,
    transactionId: transaction.transaction_id,
    amount: transaction.amount,
    currency: transaction.currency,
    timestamp: new Date().toISOString(),
    error: transaction.error || undefined,
    metadata: transaction.metadata
  };
}

interface CancelPayload {
  idempotencyKey: string;
  gateway: string;
  transactionId?: string;
  reason: string;
  timestamp: string;
  metadata?: any;
}

/**
 * Sends a cancel notification to the client's provided cancel URL
 * @param cancelUrl - The client's cancel URL
 * @param payload - The cancellation data to send
 * @param retries - Number of retry attempts on failure
 * @returns true if cancel notification was sent successfully, false otherwise
 */
export async function sendCancelNotification(
  cancelUrl: string,
  payload: CancelPayload,
  retries: number = 3
): Promise<boolean> {
  if (!cancelUrl) {
    console.warn('No cancel URL provided');
    return false;
  }

  // Validate cancel URL format
  try {
    new URL(cancelUrl);
  } catch (e) {
    console.error('Invalid cancel URL format:', cancelUrl);
    return false;
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(cancelUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Payment-Cancel': 'true',
          'X-Cancel-Version': '1.0'
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (response.ok) {
        console.log(`Cancel notification sent successfully to ${cancelUrl}`);
        return true;
      } else {
        lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
        console.warn(`Cancel notification failed with status ${response.status}, attempt ${attempt + 1}/${retries}`);
      }
    } catch (error) {
      lastError = error as Error;
      console.warn(`Cancel notification attempt ${attempt + 1}/${retries} failed:`, lastError.message);
      
      // Exponential backoff: wait before retrying
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  console.error(`Cancel notification delivery failed after ${retries} attempts:`, lastError);
  return false;
}

/**
 * Constructs a cancel payload from transaction data
 * @param transaction - The transaction data
 * @param reason - The reason for cancellation
 * @returns Formatted cancel payload
 */
export function constructCancelPayload(transaction: any, reason: string = 'User initiated'): CancelPayload {
  return {
    idempotencyKey: transaction.idempotency_key,
    gateway: transaction.gateway,
    transactionId: transaction.transaction_id,
    reason,
    timestamp: new Date().toISOString(),
    metadata: transaction.metadata
  };
}
