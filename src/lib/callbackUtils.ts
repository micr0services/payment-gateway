import { createHmac } from 'crypto';

/**
 * Callback utilities for notifying clients and backend of payment status changes
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
  successRedirectUrl?: string;
  failureRedirectUrl?: string;
  cancelUrl?: string;
}

interface BackendCallbackPayload {
  paymentId: string;
  transactionId?: string;
  status: 'SUCCESS' | 'FAILED';
  provider: string;
  amount: number;
  currency: string;
  reference?: string;
  error?: string;
  timestamp: string;
  metadata?: any;
  successRedirectUrl?: string;
  failureRedirectUrl?: string;
}

function normalizeMetadata(metadata: any): any {
  if (!metadata) {
    return metadata;
  }

  if (typeof metadata === 'string') {
    try {
      return JSON.parse(metadata);
    } catch (error) {
      console.warn('[CallbackUtils] Failed to parse metadata string', {
        metadata,
        error: error instanceof Error ? error.message : String(error)
      });
      return metadata;
    }
  }

  return metadata;
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
      console.log('[Callback] Calling callback', {
        callbackUrl,
        attempt: attempt + 1,
        payload
      });

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

      console.log('[Callback] Response received', {
        callbackUrl,
        status: response.status,
        ok: response.ok
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
 * Sends a backend internal callback notification (gateway → backend)
 * Used for internal payment event notifications with authentication
 * @param callbackUrl - The backend callback URL
 * @param payload - The normalized payment status data
 * @param gatewaySecret - The shared gateway secret for authentication
 * @param retries - Number of retry attempts on failure
 * @returns true if callback was sent successfully, false otherwise
 */
export async function sendBackendCallback(
  callbackUrl: string,
  payload: BackendCallbackPayload,
  gatewaySecret?: string,
  retries: number = 3
): Promise<boolean> {
  if (!callbackUrl) {
    console.warn('No backend callback URL provided');
    return false;
  }

  if (/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?/i.test(callbackUrl)) {
    console.warn('[Backend Callback] Warning: callbackUrl targets localhost, which may be unreachable from Workers', {
      callbackUrl
    });
  }

  // Validate callback URL format
  try {
    new URL(callbackUrl);
  } catch (e) {
    console.error('Invalid backend callback URL format:', callbackUrl);
    return false;
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      console.log('[Backend Callback] Calling callback', {
        callbackUrl,
        attempt: attempt + 1,
        payload
      });

      const body = JSON.stringify(payload);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Payment-Callback': 'true',
        'X-Payment-Provider': payload.provider,
        'X-Callback-Version': '1.0'
      };

      // Add gateway authentication headers if provided
      if (gatewaySecret) {
        headers['x-gateway-secret'] = gatewaySecret;
        headers['Authorization'] = `Bearer ${gatewaySecret}`;
        const signature = createHmac('sha256', gatewaySecret).update(body).digest('hex');
        headers['X-Gateway-Signature'] = `sha256=${signature}`;
      }

      const response = await fetch(callbackUrl, {
        method: 'POST',
        headers,
        body,
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      console.log('[Backend Callback] Response received', {
        callbackUrl,
        status: response.status,
        ok: response.ok
      });

      if (response.ok) {
        console.log(`Backend callback sent successfully to ${callbackUrl} for payment ${payload.paymentId}`);
        return true;
      } else {
        lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
        console.warn(`Backend callback failed with status ${response.status}, attempt ${attempt + 1}/${retries}`);
      }
    } catch (error) {
      lastError = error as Error;
      console.error('[Backend Callback] Fetch error', {
        message: lastError.message,
        stack: lastError.stack
      });
      console.warn(`[Backend Callback] Callback attempt ${attempt + 1}/${retries} failed: ${lastError.message}`);
      
      // Exponential backoff: wait before retrying
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  console.error(`Backend callback delivery failed after ${retries} attempts:`, lastError);
  return false;
}

/**
 * Constructs a backend callback payload from transaction data
 * Normalizes Stripe status to SUCCESS/FAILED for backend consumption
 * @param transaction - The transaction data
 * @param provider - The payment provider
 * @returns Formatted backend callback payload
 */
export function constructBackendCallbackPayload(
  transaction: any,
  provider: 'stripe' | 'paypal' | 'mpesa',
  normalizedStatus?: 'SUCCESS' | 'FAILED'
): BackendCallbackPayload {
  // Normalize status based on provider
  let status: 'SUCCESS' | 'FAILED' = 'FAILED';
  if (normalizedStatus) {
    status = normalizedStatus;
  } else if (transaction.status === 'completed') {
    status = 'SUCCESS';
  }

  const metadata = normalizeMetadata(transaction.metadata);

  return {
    paymentId: transaction.idempotency_key || transaction.transaction_id,
    transactionId: transaction.idempotency_key || transaction.transaction_id,
    status,
    provider,
    amount: transaction.amount,
    currency: transaction.currency,
    reference: transaction.transaction_id,
    timestamp: new Date().toISOString(),
    error: transaction.error || undefined,
    metadata,
    successRedirectUrl: metadata?.successRedirectUrl,
    failureRedirectUrl: metadata?.failureRedirectUrl,
  };
}

/**
 * Constructs a callback payload from transaction data
 * @param transaction - The transaction data
 * @returns Formatted callback payload
 */
export function constructCallbackPayload(transaction: any): CallbackPayload {
  const metadata = normalizeMetadata(transaction.metadata);

  return {
    idempotencyKey: transaction.idempotency_key,
    gateway: transaction.gateway,
    status: transaction.status,
    transactionId: transaction.transaction_id,
    amount: transaction.amount,
    currency: transaction.currency,
    timestamp: new Date().toISOString(),
    error: transaction.error || undefined,
    metadata,
    successRedirectUrl: metadata?.successRedirectUrl,
    failureRedirectUrl: metadata?.failureRedirectUrl,
    cancelUrl: transaction.cancel_url
  };
}

interface CancelPayload {
  idempotencyKey: string;
  gateway: string;
  transactionId?: string;
  reason: string;
  timestamp: string;
  metadata?: any;
  successRedirectUrl?: string;
  failureRedirectUrl?: string;
  cancelUrl?: string;
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
    metadata: transaction.metadata,
    successRedirectUrl: transaction.metadata?.successRedirectUrl,
    failureRedirectUrl: transaction.metadata?.failureRedirectUrl,
    cancelUrl: transaction.cancel_url
  };
}
