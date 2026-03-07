import { Hono } from 'hono';
import Transaction from '../models/Transaction';
import { getStripePaymentStatus } from '../lib/stripePayment';

const router = new Hono<{
  Bindings: {
    STRIPE_SECRET_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
    PAYPAL_ENVIRONMENT: string;
    PAYPAL_CLIENT_ID: string;
    PAYPAL_CLIENT_SECRET: string;
    DATABASE_URL: string;
  };
}>();
/**
 * Stripe webhook handler for payment events
 * Handles payment_intent.succeeded, payment_intent.payment_failed, etc.
 */
router.post('/stripe', async (c) => {
  const sig = c.req.header('stripe-signature');
  const body = await c.req.text();

  if (!sig || !c.env.STRIPE_WEBHOOK_SECRET) {
    return c.json({ error: 'Webhook signature verification failed' }, 400);
  }

  try {
    // Import Stripe dynamically to avoid issues
    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(c.env.STRIPE_SECRET_KEY);

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, sig, c.env.STRIPE_WEBHOOK_SECRET);

    console.log(`Received Stripe webhook: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object, c.env.DATABASE_URL);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object, c.env.DATABASE_URL);
        break;

      case 'payment_intent.canceled':
        await handlePaymentIntentCancelled(event.data.object, c.env.DATABASE_URL);
        break;

      case 'payment_intent.processing':
        await handlePaymentIntentProcessing(event.data.object, c.env.DATABASE_URL);
        break;

      case 'charge.dispute.created':
        await handleChargeDispute(event.data.object, c.env.DATABASE_URL);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return c.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return c.json({ error: 'Webhook processing failed' }, 400);
  }
});

async function handlePaymentIntentSucceeded(paymentIntent: any, databaseUrl: string) {
  const transaction = await Transaction.findByStripePaymentIntentId(databaseUrl, paymentIntent.id);
  if (transaction) {
    await Transaction.updateStatus(databaseUrl, transaction.idempotency_key, 'completed', paymentIntent.id);
    console.log(`Payment completed: ${paymentIntent.id}`);
  }
}

async function handlePaymentIntentFailed(paymentIntent: any, databaseUrl: string) {
  const transaction = await Transaction.findByStripePaymentIntentId(databaseUrl, paymentIntent.id);
  if (transaction) {
    const errorMessage = paymentIntent.last_payment_error?.message || 'Payment failed';
    await Transaction.updateStatus(databaseUrl, transaction.idempotency_key, 'failed', null, errorMessage);
    console.log(`Payment failed: ${paymentIntent.id} - ${errorMessage}`);
  }
}

async function handlePaymentIntentCancelled(paymentIntent: any, databaseUrl: string) {
  const transaction = await Transaction.findByStripePaymentIntentId(databaseUrl, paymentIntent.id);
  if (transaction) {
    await Transaction.updateStatus(databaseUrl, transaction.idempotency_key, 'cancelled');
    console.log(`Payment cancelled: ${paymentIntent.id}`);
  }
}

async function handlePaymentIntentProcessing(paymentIntent: any, databaseUrl: string) {
  const transaction = await Transaction.findByStripePaymentIntentId(databaseUrl, paymentIntent.id);
  if (transaction) {
    await Transaction.updateStatus(databaseUrl, transaction.idempotency_key, 'processing');
    console.log(`Payment processing: ${paymentIntent.id}`);
  }
}

async function handleChargeDispute(dispute: any, databaseUrl: string) {
  // Find transaction by charge ID if available, or log for manual handling
  console.log(`Charge dispute created: ${dispute.id} for charge ${dispute.charge}`);
}

export default router;