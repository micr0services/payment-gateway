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
    }).format(amount / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-success bg-success/10 border border-success/20';
      case 'pending':
        return 'text-gold bg-gold/10 border border-gold/20';
      case 'failed':
        return 'text-error bg-error/10 border border-error/20';
      case 'cancelled':
        return 'text-text-muted bg-text-muted/10 border border-text-muted/20';
      default:
        return 'text-text-muted bg-text-muted/10 border border-text-muted/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian font-mono text-text p-0">
        <div className="fixed top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-40" />
        <main className="max-w-full mx-auto p-4 sm:p-6 md:p-12">
          <div className="flex items-center justify-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-6 sm:h-8 w-6 sm:w-8 border-b-2 border-gold"></div>
            <span className="ml-2 text-sm sm:text-base text-text">Loading transaction details...</span>
          </div>
        </main>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen bg-obsidian font-mono text-text p-0">
        <div className="fixed top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-40" />
        <main className="max-w-full mx-auto p-4 sm:p-6 md:p-12">
          <div className="text-center py-8 sm:py-12">
            <div className="text-error text-base sm:text-lg font-semibold mb-3 sm:mb-4">Error</div>
            <p className="text-text-muted mb-4 sm:mb-6 text-sm sm:text-base">{error || 'Transaction not found'}</p>
            <button
              onClick={() => router.back()}
              className="bg-gold text-obsidian px-4 sm:px-6 py-2 sm:py-3 rounded-none hover:bg-gold-light transition-colors duration-200 text-[10px] sm:text-sm uppercase tracking-[0.2em]"
            >
              Go Back
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian font-mono text-text p-0">
      <div className="fixed top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-40" />

      <main className="max-w-full mx-auto p-4 sm:p-6 md:p-12">
        {/* Header */}
        <div className="mb-8 sm:mb-12 animate-[fadeUp_0.6s_ease_both]">
          <div className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-gold mb-2 sm:mb-3 flex items-center gap-2 sm:gap-3">
            <div className="w-4 sm:w-6 h-px bg-gold" />
            Transaction Details
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-[0.02em] leading-none">Transaction<br />#{transaction.id}</h1>
        </div>

        <div className="space-y-4 sm:space-y-6 md:space-y-8">
          {/* Back Button */}
          <div className="animate-[fadeUp_0.6s_0.1s_ease_both]">
            <button
              onClick={() => router.back()}
              className="text-text-muted hover:text-gold transition-colors duration-200 flex items-center gap-2 text-[10px] sm:text-sm uppercase tracking-[0.2em]"
            >
              ← Back to Transactions
            </button>
          </div>

          {/* Row 1 — Status / Amount / Gateway */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border animate-[fadeUp_0.6s_0.2s_ease_both]">
            <div className="bg-surface p-4 sm:p-6 relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-gold before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300">
              <div className="text-[0.58rem] uppercase tracking-[0.2em] text-text mb-2 sm:mb-3">Status</div>
              <span className={`inline-flex w-fit px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                {transaction.status.toUpperCase()}
              </span>
            </div>
            <div className="bg-surface p-4 sm:p-6 relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-gold before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300">
              <div className="text-[0.58rem] uppercase tracking-[0.2em] text-text mb-2 sm:mb-3">Amount</div>
              <div className="font-serif text-2xl sm:text-3xl font-light text-gold-light leading-none">
                {formatAmount(transaction.amount, transaction.currency)}
              </div>
            </div>
            <div className="bg-surface p-4 sm:p-6 relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-gold before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 sm:col-span-2 lg:col-span-1">
              <div className="text-[0.58rem] uppercase tracking-[0.2em] text-text mb-2 sm:mb-3">Gateway</div>
              <div className="text-base sm:text-lg font-semibold text-text capitalize">{transaction.gateway}</div>
            </div>
          </div>

          {/* Row 2 — Internal ID / Idempotency Key / Created At */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border animate-[fadeUp_0.6s_0.3s_ease_both]">
            <div className="bg-surface p-4 sm:p-6 relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-gold before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300">
              <div className="text-[0.58rem] uppercase tracking-[0.2em] text-text mb-2 sm:mb-3">Transaction ID</div>
              <div className="text-xs sm:text-sm text-text font-mono">{transaction.id}</div>
            </div>
            <div className="bg-surface p-4 sm:p-6 relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-gold before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300">
              <div className="text-[0.58rem] uppercase tracking-[0.2em] text-text mb-2 sm:mb-3">Idempotency Key</div>
              <div className="text-xs sm:text-sm text-text font-mono break-all">{transaction.idempotency_key}</div>
            </div>
            <div className="bg-surface p-4 sm:p-6 relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-gold before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 sm:col-span-2 lg:col-span-1">
              <div className="text-[0.58rem] uppercase tracking-[0.2em] text-text mb-2 sm:mb-3">Created At</div>
              <div className="text-xs sm:text-sm text-text">{formatDate(transaction.created_at)}</div>
            </div>
          </div>

          {/* Row 3 — Gateway ID / External Transaction ID / Updated At */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border animate-[fadeUp_0.6s_0.4s_ease_both]">
            <div className="bg-surface p-4 sm:p-6 relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-gold before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300">
              {transaction.gateway === 'stripe' && transaction.stripe_payment_intent_id && (
                <>
                  <div className="text-[0.58rem] uppercase tracking-[0.2em] text-text mb-2 sm:mb-3">Stripe Payment Intent ID</div>
                  <div className="text-xs sm:text-sm text-text font-mono break-all">{transaction.stripe_payment_intent_id}</div>
                </>
              )}
              {transaction.gateway === 'paypal' && transaction.paypal_order_id && (
                <>
                  <div className="text-[0.58rem] uppercase tracking-[0.2em] text-text mb-2 sm:mb-3">PayPal Order ID</div>
                  <div className="text-xs sm:text-sm text-text font-mono break-all">{transaction.paypal_order_id}</div>
                </>
              )}
              {!((transaction.gateway === 'stripe' && transaction.stripe_payment_intent_id) || (transaction.gateway === 'paypal' && transaction.paypal_order_id)) && (
                <div className="text-[0.58rem] uppercase tracking-[0.2em] text-text-muted mb-2 sm:mb-3">Gateway ID</div>
              )}
            </div>

            <div className="bg-surface p-4 sm:p-6 relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-gold before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300">
              <div className="text-[0.58rem] uppercase tracking-[0.2em] text-text mb-2 sm:mb-3">External Transaction ID</div>
              {transaction.transaction_id ? (
                <div className="text-xs sm:text-sm text-text font-mono">{transaction.transaction_id}</div>
              ) : (
                <div className="text-xs sm:text-sm text-text-muted italic">—</div>
              )}
            </div>

            <div className="bg-surface p-4 sm:p-6 relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-gold before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 sm:col-span-2 lg:col-span-1">
              <div className="text-[0.58rem] uppercase tracking-[0.2em] text-text mb-2 sm:mb-3">Updated At</div>
              <div className="text-xs sm:text-sm text-text">{formatDate(transaction.updated_at)}</div>
            </div>
          </div>

          {/* Error — full width, only when present */}
          {transaction.error && (
            <div className="bg-error/10 border border-error/20 rounded-lg p-4 sm:p-6 animate-[fadeUp_0.6s_0.5s_ease_both]">
              <div className="text-[0.58rem] uppercase tracking-[0.2em] text-error mb-2 sm:mb-3">Error</div>
              <div className="text-sm sm:text-base text-text">{transaction.error}</div>
            </div>
          )}

          {/* Metadata — full width */}
          {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
            <div className="bg-surface border border-border rounded-lg p-4 sm:p-6 animate-[fadeUp_0.6s_0.6s_ease_both]">
              <h2 className="text-[0.58rem] uppercase tracking-[0.2em] text-text mb-3 sm:mb-4">Metadata</h2>
              <div className="bg-surface-2 rounded-md p-3 sm:p-4">
                <pre className="text-xs sm:text-sm text-text whitespace-pre-wrap">
                  {JSON.stringify(transaction.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}