'use client';

import { useState } from 'react';
import StripePayment from '@/components/StripePayment';
import PayPalPayment from '@/components/PayPalPayment';

export default function PaymentPage() {
  const [amount, setAmount] = useState<number>(10);
  const [currency, setCurrency] = useState<string>('usd');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSuccess = (transactionId: string) => {
    setMessage({ type: 'success', text: `Payment successful! Transaction ID: ${transactionId}` });
  };

  const handleError = (error: string) => {
    setMessage({ type: 'error', text: `Payment failed: ${error}` });
  };

  const currencySymbols: Record<string, string> = { usd: '$', eur: '€', gbp: '£' };

  return (
    <div className="min-h-screen bg-obsidian font-mono text-text flex items-center justify-center p-8 relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="fixed top-[-40%] left-[-20%] w-[80%] h-[80%] bg-[radial-gradient(ellipse,rgba(201,168,76,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="fixed bottom-[-40%] right-[-20%] w-[70%] h-[70%] bg-[radial-gradient(ellipse,rgba(60,80,160,0.08)_0%,transparent_70%)] pointer-events-none" />

      {/* Grid overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[460px] bg-surface border border-border rounded-sm shadow-[0_0_0_1px_rgba(201,168,76,0.08),0_40px_80px_rgba(0,0,0,0.6),0_0_120px_rgba(201,168,76,0.04)] animate-[cardIn_0.8s_cubic-bezier(0.16,1,0.3,1)_both]">
        <div className="p-10 pb-8 border-b border-border relative">
          <div className="absolute bottom-0 left-10 w-12 h-px bg-gold" />
          <div className="text-xs uppercase tracking-[0.25em] text-gold mb-3 flex items-center gap-2">
            <span className="text-[0.4rem]">◆</span>
            Secure Checkout
          </div>
          <h1 className="text-4xl font-light leading-tight font-serif">Make a<br />Payment</h1>
        </div>

        <div className="p-8">
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

          {/* Payment Method */}
          <div className="mb-7 animate-[fadeUp_0.5s_ease_both] animation-delay-300">
            <label className="block text-xs uppercase tracking-[0.2em] text-text mb-1.5">Payment Method</label>
            <div className="grid grid-cols-2 gap-0 border border-border rounded-sm overflow-hidden">
              <button
                className={`relative p-3.5 bg-surface-2 border-none cursor-pointer font-mono text-[0.72rem] uppercase tracking-[0.12em] text-text transition-all flex items-center justify-center gap-2 ${
                  paymentMethod === 'stripe' ? 'bg-[rgba(201,168,76,0.15)] text-gold-light border-transparent after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-gold' : 'hover:text-text hover:bg-[rgba(255,255,255,0.04)]'
                }`}
                onClick={() => setPaymentMethod('stripe')}
              >
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                  <rect width="14" height="10" rx="1" fill="currentColor" opacity="0.2"/>
                  <rect x="1" y="2.5" width="12" height="1.5" fill="currentColor"/>
                  <rect x="1" y="6" width="4" height="1.5" rx="0.5" fill="currentColor"/>
                </svg>
                Credit Card
              </button>
              <button
                className={`relative p-3.5 bg-surface-2 border-l border-border border-none cursor-pointer font-mono text-[0.72rem] uppercase tracking-[0.12em] text-text transition-all flex items-center justify-center gap-2 ${
                  paymentMethod === 'paypal' ? 'bg-[rgba(201,168,76,0.15)] text-gold-light border-transparent after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-gold' : 'hover:text-text hover:bg-[rgba(255,255,255,0.04)]'
                }`}
                onClick={() => setPaymentMethod('paypal')}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.59 3.025-2.566 6.082-8.558 6.082H9.625l-1.32 8.35h3.878c.455 0 .84-.33.912-.78l.038-.195.723-4.58.046-.254c.071-.45.456-.78.912-.78h.574c3.717 0 6.627-1.51 7.48-5.875.357-1.832.18-3.362-.646-4.681z"/>
                </svg>
                PayPal
              </button>
            </div>
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
            {paymentMethod === 'stripe' ? (
              <StripePayment
                amount={amount}
                currency={currency}
                onSuccess={handleSuccess}
                onError={handleError}
              />
            ) : (
              <PayPalPayment
                amount={amount}
                currency={currency.toUpperCase()}
                onSuccess={handleSuccess}
                onError={handleError}
              />
            )}
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