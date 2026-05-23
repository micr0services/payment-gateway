import { Hono } from 'hono';
import Transaction from '../models/Transaction';
import { getStripePaymentStatus } from '../stripe/stripePayment';
import { sendBackendCallback, constructBackendCallbackPayload } from '../lib/callbackUtils';

const router = new Hono<{
  Bindings: {
    STRIPE_SECRET_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
    GATEWAY_SECRET: string;
    PAYPAL_ENVIRONMENT: string;
    PAYPAL_CLIENT_ID: string;
    PAYPAL_CLIENT_SECRET: string;
    DATABASE_URL: string;
  };
}>();

/**
 * Stripe webhook handler for payment events
 * Core responsibilities:
 * 1. Verify webhook signature (trust boundary)
 * 2. Normalize event to internal format
 * 3. Send callback to backend (source of truth)
 * 4. Return 200 OK immediately (no blocking)
 * 
 * Webhook URL: POST /api/webhooks/stripe
 */
router.post('/stripe', async (c) => {
  const sig = c.req.header('stripe-signature');
  const body = await c.req.text();
  const timestamp = new Date().toISOString();

  console.log('═══════════════════════════════════════════════════════════');
  console.log('[Stripe Webhook] *** REQUEST RECEIVED ***');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('[Stripe Webhook] Timestamp:', timestamp);
  console.log('[Stripe Webhook] Request Headers:', {
    signature: sig ? `${sig.substring(0, 50)}...` : 'MISSING',
    contentType: c.req.header('content-type'),
    userAgent: c.req.header('user-agent')
  });
  console.log('[Stripe Webhook] Body Length:', body.length, 'bytes');
  console.log('[Stripe Webhook] Body Preview:', body.substring(0, 200));

  if (!sig || !c.env.STRIPE_WEBHOOK_SECRET) {
    console.error('[Stripe Webhook] *** VERIFICATION FAILED ***');
    console.error('[Stripe Webhook] Missing signature or secret', {
      hasSig: !!sig,
      hasSecret: !!c.env.STRIPE_WEBHOOK_SECRET
    });
    return c.json({ error: 'Webhook signature verification failed' }, 400);
  }

  try {
    // Import Stripe dynamically to avoid issues
    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(c.env.STRIPE_SECRET_KEY);

    console.log('[Stripe Webhook] Verifying signature...');
    
    // Verify webhook signature using Cloudflare Workers-compatible async crypto
    const event = await stripe.webhooks.constructEventAsync(body, sig, c.env.STRIPE_WEBHOOK_SECRET);

    console.log('[Stripe Webhook] *** SIGNATURE VERIFIED ***');
    console.log('[Stripe Webhook] Event verified and parsed', {
      type: event.type,
      id: event.id,
      created: new Date(event.created * 1000).toISOString(),
      dataObjectType: event.data?.object?.object,
      dataObjectId: (event.data?.object as any)?.id
    });

    console.log('[Stripe Webhook] Full event data:', {
      type: event.type,
      id: event.id,
      object: JSON.stringify(event.data?.object).substring(0, 500)
    });

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('[Stripe Webhook] Processing payment_intent.succeeded', { id: event.data.object.id });
        await handlePaymentIntentSucceeded(event.data.object, c.env.DATABASE_URL, c.env.GATEWAY_SECRET, c.executionCtx);
        break;

      case 'checkout.session.completed':
        console.log('[Stripe Webhook] Processing checkout.session.completed', { id: event.data.object.id });
        await handleCheckoutSessionCompleted(event.data.object, c.env.DATABASE_URL, c.env.GATEWAY_SECRET, c.executionCtx);
        break;

      case 'payment_intent.payment_failed':
        console.log('[Stripe Webhook] Processing payment_intent.payment_failed', { id: event.data.object.id });
        await handlePaymentIntentFailed(event.data.object, c.env.DATABASE_URL, c.env.GATEWAY_SECRET, c.executionCtx);
        break;

      case 'payment_intent.canceled':
        console.log('[Stripe Webhook] Processing payment_intent.canceled', { id: event.data.object.id });
        await handlePaymentIntentCancelled(event.data.object, c.env.DATABASE_URL, c.env.GATEWAY_SECRET, c.executionCtx);
        break;

      case 'payment_intent.processing':
        console.log('[Stripe Webhook] Processing payment_intent.processing', { id: event.data.object.id });
        await handlePaymentIntentProcessing(event.data.object, c.env.DATABASE_URL, c.env.GATEWAY_SECRET, c.executionCtx);
        break;

      case 'charge.dispute.created':
        console.log('[Stripe Webhook] Processing charge.dispute.created', { id: event.data.object.id });
        await handleChargeDispute(event.data.object, c.env.DATABASE_URL, c.env.GATEWAY_SECRET);
        break;

      default:
        console.log('[Stripe Webhook] Unhandled event type', {
          type: event.type,
          id: event.id,
          timestamp: new Date(event.created * 1000).toISOString()
        });
    }

    console.log('[Stripe Webhook] *** EVENT PROCESSED SUCCESSFULLY ***');
    console.log('[Stripe Webhook] Event processed successfully', {
      type: event.type,
      id: event.id,
      timestamp
    });
    console.log('═══════════════════════════════════════════════════════════');

    return c.json({ received: true });
  } catch (error: any) {
    console.error('═══════════════════════════════════════════════════════════');
    console.error('[Stripe Webhook] *** PROCESSING ERROR ***');
    console.error('[Stripe Webhook] Processing error', {
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
      timestamp
    });
    console.error('[Stripe Webhook] Stack trace:', error.stack);
    console.error('═══════════════════════════════════════════════════════════');
    return c.json({ error: 'Webhook processing failed' }, 400);
  }
});

router.get('/stripe', async (c) => {
  const webhookUrl = `${c.req.header('x-forwarded-proto') || 'http'}://${c.req.header('host') || 'localhost:8787'}/api/webhooks/stripe`;
  console.log('[Stripe Webhook] GET /api/webhooks/stripe received', {
    webhookUrl,
    timestamp: new Date().toISOString()
  });
  return c.json({
    status: 'ok',
    message: 'Stripe webhook endpoint is live. Send a POST request to trigger the webhook.',
    webhookUrl,
    method: 'POST'
  });
});

/**
 * Health check endpoint to verify webhook service is running
 * Returns the expected webhook URL
 */
router.get('/stripe/health', async (c) => {
  const baseUrl = c.req.header('host') || 'localhost:8787';
  const protocol = c.req.header('x-forwarded-proto') || 'http';
  const webhookUrl = `${protocol}://${baseUrl}/api/webhooks/stripe`;

  console.log('[Stripe Webhook Health] Check received', {
    timestamp: new Date().toISOString(),
    expectedWebhookUrl: webhookUrl
  });

  return c.json({
    status: 'ok',
    service: 'stripe-webhook-handler',
    webhookUrl,
    timestamp: new Date().toISOString(),
    instructions: 'Configure Stripe to send webhooks to the webhookUrl above'
  });
});

function getStripeMetadataTransactionId(object: any): string | undefined {
  if (!object || typeof object !== 'object') {
    return undefined;
  }
  if (object.metadata && typeof object.metadata.transactionId === 'string') {
    return object.metadata.transactionId;
  }
  if (object.metadata && typeof object.metadata.transaction_id === 'string') {
    return object.metadata.transaction_id;
  }
  return undefined;
}

async function findStripeTransaction(object: any, databaseUrl: string) {
  const transactionId = getStripeMetadataTransactionId(object);
  if (transactionId) {
    const transaction = await Transaction.findByIdempotencyKey(databaseUrl, transactionId);
    if (transaction) {
      return transaction;
    }
  }

  if (object?.id && typeof object.id === 'string') {
    return Transaction.findByStripePaymentIntentId(databaseUrl, object.id);
  }

  return undefined;
}

function queueBackendCallback(
  executionCtx: any | undefined,
  callbackUrl: string,
  payload: any,
  gatewaySecret?: string,
  context: any = {}
) {
  const task = (async () => {
    try {
      const success = await sendBackendCallback(callbackUrl, payload, gatewaySecret);
      console.log('[Handler] Backend callback delivery result', {
        callbackUrl,
        paymentId: payload.paymentId,
        success,
        ...context
      });
    } catch (err) {
      console.error('[Handler] Backend callback delivery failed', {
        callbackUrl,
        paymentId: payload.paymentId,
        error: err instanceof Error ? err.message : String(err),
        ...context
      });
    }
  })();

  if (executionCtx && typeof executionCtx.waitUntil === 'function') {
    executionCtx.waitUntil(task);
  } else {
    void task;
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: any, databaseUrl: string, gatewaySecret?: string, executionCtx?: any) {
  console.log('[Handler] handlePaymentIntentSucceeded started', {
    paymentIntentId: paymentIntent.id,
    status: paymentIntent.status,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency
  });

  const transaction = await findStripeTransaction(paymentIntent, databaseUrl);
  
  console.log('[Handler] Transaction lookup result', {
    found: !!transaction,
    foundByMetadata: !!getStripeMetadataTransactionId(paymentIntent),
    paymentIntentId: paymentIntent.id,
    transactionId: transaction?.idempotency_key,
    currentStatus: transaction?.status,
    hasCallbackUrl: !!transaction?.callback_url
  });

  if (transaction) {
    // Update transaction status
    const updateResult = await Transaction.updateStatus(databaseUrl, transaction.idempotency_key, 'completed');
    console.log('[Handler] Transaction status updated', {
      idempotencyKey: transaction.idempotency_key,
      newStatus: 'completed',
      updateResult: !!updateResult
    });
    
    if (transaction.callback_url) {
      // Construct and send normalized backend callback
      const payload = constructBackendCallbackPayload(
        {
          ...transaction,
          transaction_id: paymentIntent.id,
          status: 'completed'
        },
        'stripe',
        'SUCCESS'
      );
      
      console.log('[Handler] Sending backend callback', {
        callbackUrl: transaction.callback_url,
        paymentId: payload.paymentId,
        status: payload.status
      });

      queueBackendCallback(executionCtx, transaction.callback_url, payload, gatewaySecret, { paymentIntentId: paymentIntent.id });
      
      console.log(`Payment success callback queued: ${paymentIntent.id}`);
    } else {
      console.log('[Handler] No callback URL for transaction', {
        idempotencyKey: transaction.idempotency_key
      });
    }
  } else {
    console.warn('[Handler] No transaction found for payment intent', {
      paymentIntentId: paymentIntent.id
    });
  }
}

async function handlePaymentIntentFailed(paymentIntent: any, databaseUrl: string, gatewaySecret?: string, executionCtx?: any) {
  console.log('[Handler] handlePaymentIntentFailed started', {
    paymentIntentId: paymentIntent.id,
    status: paymentIntent.status,
    lastError: paymentIntent.last_payment_error?.message
  });

  const transaction = await findStripeTransaction(paymentIntent, databaseUrl);
  
  console.log('[Handler] Transaction lookup result', {
    found: !!transaction,
    foundByMetadata: !!getStripeMetadataTransactionId(paymentIntent),
    paymentIntentId: paymentIntent.id,
    transactionId: transaction?.idempotency_key,
    currentStatus: transaction?.status,
    hasCallbackUrl: !!transaction?.callback_url
  });

  if (transaction) {
    const errorMessage = paymentIntent.last_payment_error?.message || 'Payment failed';
    
    // Update transaction status
    const updateResult = await Transaction.updateStatus(databaseUrl, transaction.idempotency_key, 'failed', null, errorMessage);
    console.log('[Handler] Transaction status updated to failed', {
      idempotencyKey: transaction.idempotency_key,
      error: errorMessage,
      updateResult: !!updateResult
    });
    
    if (transaction.callback_url) {
      // Construct and send normalized backend callback with error
      const payload = constructBackendCallbackPayload(
        {
          ...transaction,
          transaction_id: paymentIntent.id,
          status: 'failed',
          error: errorMessage
        },
        'stripe',
        'FAILED'
      );
      
      console.log('[Handler] Sending backend callback for failed payment', {
        callbackUrl: transaction.callback_url,
        paymentId: payload.paymentId,
        status: payload.status,
        error: payload.error
      });

      queueBackendCallback(executionCtx, transaction.callback_url, payload, gatewaySecret, { paymentIntentId: paymentIntent.id });

      console.log(`Payment failure callback queued: ${paymentIntent.id} - ${errorMessage}`);
    } else {
      console.log('[Handler] No callback URL for failed transaction', {
        idempotencyKey: transaction.idempotency_key
      });
    }
  } else {
    console.warn('[Handler] No transaction found for failed payment intent', {
      paymentIntentId: paymentIntent.id
    });
  }
}

async function handlePaymentIntentCancelled(paymentIntent: any, databaseUrl: string, gatewaySecret?: string, executionCtx?: any) {
  console.log('[Handler] handlePaymentIntentCancelled started', {
    paymentIntentId: paymentIntent.id,
    status: paymentIntent.status
  });

  const transaction = await findStripeTransaction(paymentIntent, databaseUrl);
  
  console.log('[Handler] Transaction lookup result', {
    found: !!transaction,
    foundByMetadata: !!getStripeMetadataTransactionId(paymentIntent),
    paymentIntentId: paymentIntent.id,
    transactionId: transaction?.idempotency_key,
    currentStatus: transaction?.status,
    hasCallbackUrl: !!transaction?.callback_url
  });

  if (transaction) {
    // Update transaction status
    const updateResult = await Transaction.updateStatus(databaseUrl, transaction.idempotency_key, 'cancelled');
    console.log('[Handler] Transaction status updated to cancelled', {
      idempotencyKey: transaction.idempotency_key,
      updateResult: !!updateResult
    });
    
    if (transaction.callback_url) {
      // Construct and send normalized backend callback
      const payload = constructBackendCallbackPayload(
        {
          ...transaction,
          transaction_id: paymentIntent.id,
          status: 'cancelled'
        },
        'stripe',
        'FAILED'
      );
      
      console.log('[Handler] Sending backend callback for cancelled payment', {
        callbackUrl: transaction.callback_url,
        paymentId: payload.paymentId,
        status: payload.status
      });

      queueBackendCallback(executionCtx, transaction.callback_url, payload, gatewaySecret, { paymentIntentId: paymentIntent.id });

      console.log(`Payment cancellation callback queued: ${paymentIntent.id}`);
    } else {
      console.log('[Handler] No callback URL for cancelled transaction', {
        idempotencyKey: transaction.idempotency_key
      });
    }
  } else {
    console.warn('[Handler] No transaction found for cancelled payment intent', {
      paymentIntentId: paymentIntent.id
    });
  }
}

async function handlePaymentIntentProcessing(paymentIntent: any, databaseUrl: string, gatewaySecret?: string, executionCtx?: any) {
  console.log('[Handler] handlePaymentIntentProcessing started', {
    paymentIntentId: paymentIntent.id,
    status: paymentIntent.status
  });

  const transaction = await findStripeTransaction(paymentIntent, databaseUrl);
  
  console.log('[Handler] Transaction lookup result', {
    found: !!transaction,
    foundByMetadata: !!getStripeMetadataTransactionId(paymentIntent),
    paymentIntentId: paymentIntent.id,
    transactionId: transaction?.idempotency_key,
    currentStatus: transaction?.status,
    hasCallbackUrl: !!transaction?.callback_url
  });

  if (transaction && transaction.callback_url) {
    // Send processing status callback
    const payload = constructBackendCallbackPayload(
      {
        ...transaction,
        transaction_id: paymentIntent.id,
        status: 'pending'
      },
      'stripe'
    );
    
    console.log('[Handler] Sending backend callback for processing status', {
      callbackUrl: transaction.callback_url,
      paymentId: payload.paymentId,
      status: payload.status
    });

    queueBackendCallback(executionCtx, transaction.callback_url, payload, gatewaySecret, { paymentIntentId: paymentIntent.id });

    console.log(`Payment processing callback queued: ${paymentIntent.id}`);
  } else {
    console.log('[Handler] No callback URL for processing transaction', {
      found: !!transaction,
      idempotencyKey: transaction?.idempotency_key
    });
  }
}

async function handleCheckoutSessionCompleted(session: any, databaseUrl: string, gatewaySecret?: string, executionCtx?: any) {
  const paymentIntentId = typeof session.payment_intent === 'string'
    ? session.payment_intent
    : session.payment_intent?.id;

  console.log('[Handler] handleCheckoutSessionCompleted started', {
    sessionId: session.id,
    paymentIntentId,
    paymentStatus: session.payment_status,
    customerEmail: session.customer_email
  });

  const transaction = await findStripeTransaction(session, databaseUrl);

  console.log('[Handler] Transaction lookup result', {
    found: !!transaction,
    lookupBy: getStripeMetadataTransactionId(session) ? 'metadata.transactionId' : (paymentIntentId ? 'paymentIntentId' : 'sessionId'),
    lookupValue: getStripeMetadataTransactionId(session) || paymentIntentId || session.id,
    transactionId: transaction?.idempotency_key,
    currentStatus: transaction?.status,
    hasCallbackUrl: !!transaction?.callback_url
  });

  if (transaction && transaction.status !== 'completed') {
    const updateResult = await Transaction.updateStatus(databaseUrl, transaction.idempotency_key, 'completed', paymentIntentId ?? null);
    console.log('[Handler] Transaction status updated to completed', {
      idempotencyKey: transaction.idempotency_key,
      updateResult: !!updateResult
    });

    if (transaction.callback_url) {
      const payload = constructBackendCallbackPayload(
        {
          ...transaction,
          transaction_id: paymentIntentId ?? null,
          status: 'completed'
        },
        'stripe',
        'SUCCESS'
      );
      
      console.log('[Handler] Sending backend callback for checkout session completion', {
        callbackUrl: transaction.callback_url,
        paymentId: payload.paymentId,
        status: payload.status
      });

      queueBackendCallback(executionCtx, transaction.callback_url, payload, gatewaySecret, {
        sessionId: session.id,
        paymentIntentId
      });

      console.log(`Checkout session completion callback queued: ${paymentIntentId || session.id}`);
    } else {
      console.log('[Handler] No callback URL for completed session transaction', {
        idempotencyKey: transaction.idempotency_key
      });
    }
  } else {
    console.log('[Handler] Transaction already completed or not found', {
      found: !!transaction,
      status: transaction?.status,
      sessionId: session.id,
      paymentIntentId
    });
  }
}

async function handleChargeDispute(dispute: any, databaseUrl: string, gatewaySecret?: string) {
  console.log('[Handler] handleChargeDispute started', {
    disputeId: dispute.id,
    chargeId: dispute.charge,
    amount: dispute.amount,
    reason: dispute.reason,
    status: dispute.status
  });
}

/**
 * Sends normalized callback to backend (source of truth)
 * Uses standardized callback utilities with retry logic
 * Does NOT wait for response - returns immediately after sending
 */

export default router;