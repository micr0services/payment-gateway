'use client';

import { useState } from 'react';
import axios from 'axios';

interface PayPalPaymentProps {
  amount: number;
  currency?: string;
  onSuccess: (transactionId: string) => void;
  onError: (error: string) => void;
}

export default function PayPalPayment({ amount, currency = 'USD', onSuccess, onError }: PayPalPaymentProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await axios.post<{ approvalUrl: string; orderId: string }>('/api/payments/paypal', {
        amount: Math.round(amount * 100),
        currency,
      }, {
        headers: { 'Idempotency-Key': `paypal-${Date.now()}-${Math.random()}` },
      });

      const { approvalUrl, orderId } = response.data;
      if (approvalUrl) {
        // Redirect to PayPal approval page
        window.location.href = approvalUrl;
      } else {
        onError('Failed to create PayPal order');
      }
    } catch (error: any) {
      onError(error.response?.data?.error || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="text-center p-3 bg-[rgba(201,168,76,0.06)] border border-[rgba(201,168,76,0.15)] mb-2">
        <span className="font-serif text-4xl font-light text-gold-light tracking-[0.02em]">
          {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}
          {amount.toFixed(2)}
        </span>
        <span className="block text-[0.58rem] uppercase tracking-[0.15em] text-text-muted font-mono mt-1">Due today · {currency}</span>
      </div>

      <button
        onClick={handlePayment}
        disabled={loading}
        className="relative overflow-hidden bg-transparent border border-gold text-gold font-mono text-[0.7rem] uppercase tracking-[0.22em] p-4 cursor-pointer transition-colors mt-1 disabled:opacity-35 disabled:cursor-not-allowed disabled:border-[rgba(201,168,76,0.3)] hover:text-obsidian before:absolute before:inset-0 before:bg-gold before:transform before:-translate-x-full before:transition-transform before:duration-350 before:ease-out hover:before:translate-x-0"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading && <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />}
          {loading ? 'Creating Order...' : `Pay with PayPal ${currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}${amount.toFixed(2)}`}
        </span>
      </button>

      <div className="flex items-center justify-center gap-1 text-[0.58rem] uppercase tracking-[0.1em] text-text-muted font-mono mt-1">
        <span>🔒</span>
        Secured by PayPal
      </div>
    </div>
  );
}