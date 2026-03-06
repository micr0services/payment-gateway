import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

interface PaymentResult {
  success: boolean;
  clientSecret?: string | null;
  id?: string;
  error?: string;
  status?: string;
}

/**
 * Processes a payment using Stripe by creating a PaymentIntent.
 * @param amount - The amount in cents
 * @param currency - The currency code (e.g., 'usd')
 * @param metadata - Additional metadata for the payment
 * @returns Promise resolving to payment result
 */
async function processStripePayment(amount: number, currency: string, metadata: any): Promise<PaymentResult> {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
      automatic_payment_methods: { enabled: true },
    });
    return { success: true, clientSecret: paymentIntent.client_secret, id: paymentIntent.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Confirms a Stripe PaymentIntent.
 * @param paymentIntentId - The ID of the PaymentIntent to confirm
 * @returns Promise resolving to confirmation result
 */
async function confirmStripePayment(paymentIntentId: string): Promise<PaymentResult> {
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
    return { success: true, status: paymentIntent.status, id: paymentIntent.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export { processStripePayment, confirmStripePayment };