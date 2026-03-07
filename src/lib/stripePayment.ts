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
  error?: string;
  status?: string;
}

/**
 * Validates payment amount and currency
 */
function validatePaymentParams(amount: number, currency: string): void {
  if (amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  // Stripe requires amounts in smallest currency unit (cents for USD)
  if (amount !== Math.floor(amount)) {
    throw new Error('Amount must be in smallest currency unit (e.g., cents for USD)');
  }

  const supportedCurrencies = ['usd', 'eur', 'gbp', 'cad', 'aud'];
  if (!supportedCurrencies.includes(currency.toLowerCase())) {
    throw new Error(`Unsupported currency: ${currency}`);
  }
}

/**
 * Processes a payment using Stripe by creating a PaymentIntent.
 * @param stripeSecretKey - The Stripe secret key
 * @param amount - The amount in smallest currency unit (cents for USD)
 * @param currency - The currency code (e.g., 'usd')
 * @param metadata - Additional metadata for the payment
 * @param idempotencyKey - Idempotency key for Stripe API calls
 * @returns Promise resolving to payment result
 */
async function processStripePayment(
  stripeSecretKey: string,
  amount: number,
  currency: string,
  metadata: any,
  idempotencyKey?: string
): Promise<PaymentResult> {
  try {
    validatePaymentParams(amount, currency);

    const stripe = getStripeClient(stripeSecretKey);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: currency.toLowerCase(),
      metadata,
      automatic_payment_methods: { enabled: true },
    }, {
      idempotencyKey: idempotencyKey || `stripe-${Date.now()}-${Math.random()}`
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
      status: paymentIntent.status
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
  confirmStripePayment
};