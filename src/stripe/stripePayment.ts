import Stripe from 'stripe';

// Singleton Stripe client cache
const stripeClients = new Map<string, Stripe>();

function getStripeClient(secretKey: string): Stripe {
  if (!stripeClients.has(secretKey)) {
    stripeClients.set(secretKey, new Stripe(secretKey));
  }
  return stripeClients.get(secretKey)!;
}

interface PaymentResult {
  success: boolean;
  clientSecret?: string | null;
  id?: string;
  paymentIntentId?: string;
  error?: string;
  status?: string;
  checkoutUrl?: string;
}

/**
 * Validates payment amount is in smallest currency unit
 * Note: Conversion from decimal to smallest unit happens in the route handler
 */
function validatePaymentParams(amount: number, currency: string): void {
  if (amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  // Amount should be an integer (already converted to smallest unit in route)
  if (amount !== Math.floor(amount)) {
    throw new Error('Amount must be in smallest currency unit (e.g., cents for USD)');
  }

  const supportedCurrencies = ['usd', 'eur', 'gbp', 'cad', 'aud'];
  if (!supportedCurrencies.includes(currency.toLowerCase())) {
    throw new Error(`Unsupported currency: ${currency}`);
  }
}

/**
 * Processes a payment using Stripe by creating a Checkout Session.
 * @param stripeSecretKey - The Stripe secret key
 * @param amount - The amount in smallest currency unit (cents for USD)
 * @param currency - The currency code (e.g., 'usd')
 * @param metadata - Additional metadata for the payment
 * @param successRedirectUrl - URL to redirect on successful payment (required by Stripe)
 * @param failureRedirectUrl - URL to redirect on failed/cancelled payment (required by Stripe)
 * @param idempotencyKey - Idempotency key for Stripe API calls
 * @returns Promise resolving to payment result
 */
async function processStripePayment(
  stripeSecretKey: string,
  amount: number,
  currency: string,
  metadata: any,
  successRedirectUrl: string,
  failureRedirectUrl: string,
  idempotencyKey?: string
): Promise<PaymentResult> {
  validatePaymentParams(amount, currency);

  // Stripe requires success_url and cancel_url to be valid strings
  if (!successRedirectUrl || successRedirectUrl.trim() === '') {
    throw new Error('successRedirectUrl is required for Stripe checkout');
  }
  if (!failureRedirectUrl || failureRedirectUrl.trim() === '') {
    throw new Error('failureRedirectUrl is required for Stripe checkout');
  }

  try {
    const stripe = getStripeClient(stripeSecretKey);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: 'Payment',
            description: metadata?.description || 'Payment transaction',
          },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: successRedirectUrl,
      cancel_url: failureRedirectUrl,
      metadata,
      payment_intent_data: {
        metadata
      }
    }, {
      idempotencyKey: idempotencyKey || `stripe-${Date.now()}-${Math.random()}`
    });

    const paymentIntentId = typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id;

    return {
      success: true,
      id: session.id,
      paymentIntentId: paymentIntentId ?? undefined,
      checkoutUrl: session.url ?? undefined,
      status: session.status ?? undefined
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Cancels a Stripe PaymentIntent.
 * @param stripeSecretKey - The Stripe secret key
 * @param paymentIntentId - The ID of the PaymentIntent to cancel
 * @returns Promise resolving to cancellation result
 */
async function cancelStripePayment(stripeSecretKey: string, paymentIntentId: string): Promise<PaymentResult> {
  try {
    const stripe = getStripeClient(stripeSecretKey);
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
    return { success: true, status: paymentIntent.status, id: paymentIntent.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Retrieves a Stripe PaymentIntent status.
 * @param stripeSecretKey - The Stripe secret key
 * @param paymentIntentId - The ID of the PaymentIntent to retrieve
 * @returns Promise resolving to payment intent status
 */
async function getStripePaymentStatus(stripeSecretKey: string, paymentIntentId: string): Promise<PaymentResult> {
  try {
    const stripe = getStripeClient(stripeSecretKey);
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return { success: true, status: paymentIntent.status, id: paymentIntent.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Confirms a Stripe PaymentIntent directly (for testing purposes).
 * @param stripeSecretKey - The Stripe secret key
 * @param paymentIntentId - The ID of the PaymentIntent to confirm
 * @param paymentMethodId - Optional payment method ID (defaults to test card)
 * @returns Promise resolving to confirmation result
 */
async function confirmStripePayment(
  stripeSecretKey: string,
  paymentIntentId: string,
  paymentMethodId: string = 'pm_card_visa'
): Promise<PaymentResult> {
  try {
    const stripe = getStripeClient(stripeSecretKey);
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId
    });
    return { success: true, status: paymentIntent.status, id: paymentIntent.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
async function refundStripePayment(
  stripeSecretKey: string,
  paymentIntentId: string,
  amount?: number
): Promise<PaymentResult> {
  try {
    const stripe = getStripeClient(stripeSecretKey);

    const refundParams: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
    };

    if (amount) {
      refundParams.amount = amount;
    }

    const refund = await stripe.refunds.create(refundParams);
    return { success: true, id: refund.id || undefined, status: refund.status || undefined };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export {
  processStripePayment,
  cancelStripePayment,
  getStripePaymentStatus,
  refundStripePayment,
  confirmStripePayment,
  getStripeClient
};