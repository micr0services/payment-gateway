'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Transaction {
  id: number;
  idempotency_key: string;
  gateway: string;
  amount: number;
  currency: string;
  status: string;
  transaction_id?: string;
  stripe_payment_intent_id?: string;
  paypal_order_id?: string;
  error?: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export default function TransactionDetailsContent({ transactionId }: { transactionId: string }) {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await fetch(`/api/transactions/${transactionId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch transaction details');
        }
        const data = await response.json();
        setTransaction(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [transactionId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Assuming amount is in cents
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'cancelled':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading transaction details...</span>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg font-semibold mb-4">Error</div>
        <p className="text-gray-600 mb-6">{error || 'Transaction not found'}</p>
        <button
          onClick={() => router.back()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Transaction Details
          </h1>
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Back to Transactions
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Basic Information
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                <p className="mt-1 text-sm text-gray-900 font-mono">{transaction.id}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Idempotency Key</label>
                <p className="mt-1 text-sm text-gray-900 font-mono break-all">{transaction.idempotency_key}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Gateway</label>
                <p className="mt-1 text-sm text-gray-900 capitalize">{transaction.gateway}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {formatAmount(transaction.amount, transaction.currency)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                  {transaction.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Gateway Specific Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Gateway Details
            </h2>

            <div className="space-y-3">
              {transaction.gateway === 'stripe' && transaction.stripe_payment_intent_id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stripe Payment Intent ID</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">{transaction.stripe_payment_intent_id}</p>
                </div>
              )}

              {transaction.gateway === 'paypal' && transaction.paypal_order_id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">PayPal Order ID</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">{transaction.paypal_order_id}</p>
                </div>
              )}

              {transaction.transaction_id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">{transaction.transaction_id}</p>
                </div>
              )}

              {transaction.error && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Error</label>
                  <p className="mt-1 text-sm text-red-600">{transaction.error}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Metadata */}
        {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
              Metadata
            </h2>
            <div className="bg-gray-50 rounded-md p-4">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                {JSON.stringify(transaction.metadata, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Created At</label>
            <p className="mt-1 text-sm text-gray-900">{formatDate(transaction.created_at)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Updated At</label>
            <p className="mt-1 text-sm text-gray-900">{formatDate(transaction.updated_at)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}