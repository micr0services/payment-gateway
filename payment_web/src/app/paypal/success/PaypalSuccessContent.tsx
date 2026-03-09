'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PaypalSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('token'); // PayPal returns token parameter
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        if (orderId) {
          // Verify PayPal payment
          const response = await fetch('/api/payments/paypal/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: orderId }),
          });
          const data = await response.json();
          if (data.success) {
            setStatus('success');
            setMessage('Your PayPal payment was successful!');
          } else {
            setStatus('error');
            setMessage('Payment verification failed.');
          }
        } else {
          setStatus('error');
          setMessage('No PayPal order found.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred while verifying payment.');
      }
    };

    if (orderId) {
      verifyPayment();
    } else {
      setStatus('error');
      setMessage('No PayPal order found.');
    }
  }, [orderId]);

  if (status === 'loading') {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
        <p className="mt-4 text-text-muted">Verifying your PayPal payment...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="text-center bg-surface border border-border rounded-sm shadow-[0_0_0_1px_rgba(201,168,76,0.08),0_40px_80px_rgba(0,0,0,0.6),0_0_120px_rgba(201,168,76,0.04)] p-8">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[rgba(224,92,92,0.1)] border border-error">
          <svg className="h-6 w-6 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="mt-4 text-xl font-light font-serif text-text">Payment Failed</h2>
        <p className="mt-2 text-text-muted">{message}</p>
        <button
          onClick={() => window.location.href = '/payment/paypal'}
          className="mt-4 bg-gold hover:bg-gold-light text-obsidian font-mono text-xs uppercase tracking-[0.15em] px-4 py-2 rounded-sm transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="text-center bg-surface border border-border rounded-sm shadow-[0_0_0_1px_rgba(201,168,76,0.08),0_40px_80px_rgba(0,0,0,0.6),0_0_120px_rgba(201,168,76,0.04)] p-8">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[rgba(76,175,128,0.1)] border border-success">
        <svg className="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="mt-4 text-xl font-light font-serif text-text">Payment Successful!</h2>
      <p className="mt-2 text-text-muted">{message}</p>
      <p className="mt-2 text-sm text-text-muted">Order ID: {orderId}</p>
      <button
        onClick={() => window.location.href = '/'}
        className="mt-4 bg-gold hover:bg-gold-light text-obsidian font-mono text-xs uppercase tracking-[0.15em] px-4 py-2 rounded-sm transition-colors"
      >
        Continue
      </button>
    </div>
  );
}