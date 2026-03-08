'use client';

import { useState } from 'react';
import Link from 'next/link';
import PayPalPayment from '@/components/PayPalPayment';

export default function PayPalPaymentPage() {
  const [amount, setAmount] = useState<number>(10);
  const [currency, setCurrency] = useState<string>('usd');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSuccess = (transactionId: string) => {
    setMessage({ type: 'success', text: `Payment successful! Transaction ID: ${transactionId}` });
  };

  const handleError = (error: string) => {
    setMessage({ type: 'error', text: `Payment failed: ${error}` });
  };

  const currencySymbols: Record<string, string> = { usd: '$', eur: '€', gbp: '£' };

  return (
    <div className="flex items-center justify-center p-8 relative overflow-hidden min-h-[calc(100vh-60px)]">
      <div className="relative z-10 w-full max-w-[460px] bg-surface border border-border rounded-sm shadow-[0_0_0_1px_rgba(201,168,76,0.08),0_40px_80px_rgba(0,0,0,0.6),0_0_120px_rgba(201,168,76,0.04)] animate-[cardIn_0.8s_cubic-bezier(0.16,1,0.3,1)_both]">
        <div className="p-10 pb-8 border-b border-border relative">
          <div className="absolute bottom-0 left-10 w-12 h-px bg-gold" />
          <div className="text-xs uppercase tracking-[0.25em] text-gold mb-3 flex items-center gap-2">
            <span className="text-[0.4rem]">◆</span>
            PayPal Checkout
          </div>
          <h1 className="text-4xl font-light leading-tight font-serif">Make a<br />Payment</h1>
        </div>

        <div className="p-8">
          {/* Switch to Stripe */}
          <div className="mb-6 text-center">
            <Link
              href="/payment/stripe"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-text-muted hover:text-gold transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              Switch to Stripe
            </Link>
          </div>

          {/* Amount */}
          <div className="mb-7 animate-[fadeUp_0.5s_ease_both] animation-delay-100">
            <label className="block text-xs uppercase tracking-[0.2em] text-text mb-1.5">Amount</label>
            <div className="flex items-center bg-surface-2 border border-border rounded-sm transition-all focus-within:border-[rgba(201,168,76,0.4)] focus-within:shadow-[0_0_0_3px_rgba(201,168,76,0.15)]">
              <span className="px-4 text-gold font-serif text-xl font-normal border-r border-border leading-none">{currencySymbols[currency] || '$'}</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min="0.01"
                step="0.01"
                className="flex-1 bg-transparent border-none outline-none p-3.5 text-text font-serif text-xl font-light w-full placeholder:text-text-muted"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Currency */}
          <div className="mb-7 animate-[fadeUp_0.5s_ease_both] animation-delay-200">
            <label className="block text-xs uppercase tracking-[0.2em] text-text mb-1.5">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-surface-2 border border-border rounded-sm p-3.5 text-text font-mono text-xs tracking-[0.05em] appearance-none cursor-pointer bg-no-repeat bg-[right_1rem_center] transition-all focus:outline-none focus:border-[rgba(201,168,76,0.4)] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.15)]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23c9a84c' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`
              }}
            >
              <option value="usd">USD — US Dollar</option>
              <option value="eur">EUR — Euro</option>
              <option value="gbp">GBP — British Pound</option>
            </select>
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-7 p-4 rounded-sm text-xs tracking-[0.04em] leading-relaxed animate-[fadeUp_0.3s_ease_both] ${
              message.type === 'success' ? 'bg-[rgba(76,175,128,0.1)] border border-[rgba(76,175,128,0.3)] text-success' : 'bg-[rgba(224,92,92,0.1)] border border-[rgba(224,92,92,0.3)] text-error'
            }`}>
              {message.text}
            </div>
          )}

          {/* Payment Form */}
          <div className="mt-1 pt-7 border-t border-border">
            <PayPalPayment
              amount={amount}
              currency={currency.toUpperCase()}
              onSuccess={handleSuccess}
              onError={handleError}
            />
          </div>
        </div>

        <div className="p-5 border-t border-border flex items-center justify-center gap-6">
          <div className="flex items-center gap-1 text-[0.6rem] uppercase tracking-[0.12em] text-text">
            <div className="w-1.25 h-1.25 rounded-full bg-gold opacity-60" />
            256-bit SSL
          </div>
          <div className="flex items-center gap-1 text-[0.6rem] uppercase tracking-[0.12em] text-text">
            <div className="w-1.25 h-1.25 rounded-full bg-gold opacity-60" />
            PCI Compliant
          </div>
          <div className="flex items-center gap-1 text-[0.6rem] uppercase tracking-[0.12em] text-text">
            <div className="w-1.25 h-1.25 rounded-full bg-gold opacity-60" />
            Encrypted
          </div>
        </div>
      </div>
    </div>
  );
}