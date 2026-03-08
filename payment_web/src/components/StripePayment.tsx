'use client';

import { useState } from 'react';
import axios from 'axios';

interface PaymentFormProps {
  amount: number;
  currency: string;
  onSuccess: (transactionId: string) => void;
  onError: (error: string) => void;
}

function StripePaymentForm({ amount, currency, onSuccess, onError }: PaymentFormProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post<{ checkoutUrl: string; sessionId: string }>('/api/payments/stripe', {
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
      }, {
        headers: { 'Idempotency-Key': `stripe-${Date.now()}-${Math.random()}` },
      });

      const { checkoutUrl, sessionId } = response.data;
      if (checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = checkoutUrl;
      } else {
        onError('Failed to create checkout session');
      }
    } catch (error: any) {
      onError(error.response?.data?.error || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const currencySymbols: Record<string, string> = { usd: '$', eur: '€', gbp: '£' };
  const symbol = currencySymbols[currency.toLowerCase()] || '$';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <button type="submit" disabled={loading} className="relative overflow-hidden bg-transparent border border-gold text-gold font-mono text-[0.7rem] uppercase tracking-[0.22em] p-4 cursor-pointer transition-colors mt-1 disabled:opacity-35 disabled:cursor-not-allowed disabled:border-[rgba(201,168,76,0.3)] hover:text-obsidian before:absolute before:inset-0 before:bg-gold before:transform before:-translate-x-full before:transition-transform before:duration-350 before:ease-out hover:before:translate-x-0">
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading && <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />}
          {loading ? 'Creating Checkout...' : `Pay with Stripe ${symbol}${amount.toFixed(2)}`}
        </span>
      </button>

      <div className="flex items-center justify-center gap-1 text-[0.58rem] uppercase tracking-[0.1em] text-text-muted mt-1">
        <span className="opacity-50">🔒</span>
        Secured by Stripe
      </div>
    </form>
  );
}

interface StripePaymentProps {
  amount: number;
  currency?: string;
  onSuccess: (transactionId: string) => void;
  onError: (error: string) => void;
}

export default function StripePayment({ amount, currency = 'usd', onSuccess, onError }: StripePaymentProps) {
  return (
    <StripePaymentForm amount={amount} currency={currency} onSuccess={onSuccess} onError={onError} />
  );
}