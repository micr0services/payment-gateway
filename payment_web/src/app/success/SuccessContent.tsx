'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        if (sessionId) {
          // Verify Stripe payment
          const response = await fetch('/api/payments/stripe/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: sessionId }),
          });
          const data = await response.json();
          if (data.success) {
            setStatus('success');
            setMessage('Your Stripe payment was successful!');
          } else {
            setStatus('error');
            setMessage('Payment verification failed.');
          }
        } else if (orderId) {
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
          setMessage('No payment session or order found.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred while verifying payment.');
      }
    };

    verifyPayment();
  }, [sessionId, orderId]);

  if (status === 'loading') {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
        <p className="mt-4 text-text-muted">Verifying payment...</p>
      </div>
    );
  }

  return (
    <div className="text-center bg-surface border border-border rounded-sm shadow-[0_0_0_1px_rgba(201,168,76,0.08),0_40px_80px_rgba(0,0,0,0.6),0_0_120px_rgba(201,168,76,0.04)] p-8">
      {status === 'success' ? (
        <div>
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[rgba(76,175,128,0.1)] border border-success">
            <svg className="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-light font-serif text-text">Payment Successful!</h2>
          <p className="mt-2 text-sm text-text-muted">{message}</p>
          <div className="mt-6">
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 bg-gold hover:bg-gold-light text-obsidian font-mono text-xs uppercase tracking-[0.15em] rounded-sm transition-colors"
            >
              Return to Home
            </a>
          </div>
        </div>
      ) : (
        <div>
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[rgba(224,92,92,0.1)] border border-error">
            <svg className="h-6 w-6 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-light font-serif text-text">Payment Failed</h2>
          <p className="mt-2 text-sm text-text-muted">{message}</p>
          <div className="mt-6">
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 bg-gold hover:bg-gold-light text-obsidian font-mono text-xs uppercase tracking-[0.15em] rounded-sm transition-colors"
            >
              Try Again
            </a>
          </div>
        </div>
      )}
    </div>
  );
}