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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Verifying payment...</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      {status === 'success' ? (
        <div>
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Payment Successful!</h2>
          <p className="mt-2 text-sm text-gray-600">{message}</p>
          <div className="mt-6">
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Return to Home
            </a>
          </div>
        </div>
      ) : (
        <div>
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Payment Failed</h2>
          <p className="mt-2 text-sm text-gray-600">{message}</p>
          <div className="mt-6">
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Try Again
            </a>
          </div>
        </div>
      )}
    </div>
  );
}