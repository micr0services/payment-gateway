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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Verifying your PayPal payment...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="text-center">
        <div className="rounded-full h-12 w-12 bg-red-100 flex items-center justify-center mx-auto">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="mt-4 text-xl font-semibold text-gray-900">Payment Failed</h2>
        <p className="mt-2 text-gray-600">{message}</p>
        <button
          onClick={() => window.location.href = '/'}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="rounded-full h-12 w-12 bg-green-100 flex items-center justify-center mx-auto">
        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="mt-4 text-xl font-semibold text-gray-900">Payment Successful!</h2>
      <p className="mt-2 text-gray-600">{message}</p>
      <p className="mt-2 text-sm text-gray-500">Order ID: {orderId}</p>
      <button
        onClick={() => window.location.href = '/'}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Continue
      </button>
    </div>
  );
}