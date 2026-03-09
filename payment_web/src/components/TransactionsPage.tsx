'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';

interface Transaction {
  id: number;
  idempotency_key: string;
  gateway: string;
  amount: number;
  currency: string;
  status: string;
  transaction_id: string;
  error: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ gateway: '', status: '', limit: 50 });

  useEffect(() => {
    fetchAllTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, allTransactions]);

  const fetchAllTransactions = async () => {
    try {
      setLoading(true);
      const response = await axios.get<Transaction[]>('/api/transactions');
      setAllTransactions(response.data);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allTransactions];

    if (filters.gateway) {
      filtered = filtered.filter(tx => tx.gateway === filters.gateway);
    }

    if (filters.status) {
      filtered = filtered.filter(tx => tx.status === filters.status);
    }

    if (filters.limit && filters.limit > 0) {
      filtered = filtered.slice(0, filters.limit);
    }

    setTransactions(filtered);
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const formatAmount = (amount: number, currency: string) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(amount / 100);

  const statusConfig: Record<string, { color: string; bg: string; dot: string }> = {
    completed: { color: '#4caf80', bg: 'rgba(76,175,128,0.1)', dot: '#4caf80' },
    pending:   { color: '#e8c97a', bg: 'rgba(232,201,122,0.1)', dot: '#e8c97a' },
    failed:    { color: '#e05c5c', bg: 'rgba(224,92,92,0.1)', dot: '#e05c5c' },
    cancelled: { color: '#7a7a8a', bg: 'rgba(122,122,138,0.1)', dot: '#7a7a8a' },
  };

  const getStatus = (s: string) => statusConfig[s.toLowerCase()] || { color: '#c9a84c', bg: 'rgba(201,168,76,0.1)', dot: '#c9a84c' };

  const totalVolume = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const completedCount = transactions.filter(t => t.status === 'completed').length;

  return (
    <div className="min-h-screen bg-obsidian font-mono text-text p-0">
      <div className="fixed top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-40" />



      <main className="max-w-full mx-auto p-12">
        {/* Header */}
        <div className="mb-12 animate-[fadeUp_0.6s_ease_both]">
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-3 flex items-center gap-3">
            <div className="w-6 h-px bg-gold" />
            Dashboard
          </div>
          <h1 className="font-serif text-5xl font-light tracking-[0.02em] leading-none">Transaction<br />History</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-px bg-border border border-border mb-10 animate-[fadeUp_0.6s_0.1s_ease_both]">
          <div className="bg-surface p-6 relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-gold before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300">
            <div className="text-[0.58rem] uppercase tracking-[0.2em] text-text mb-3">Total Transactions</div>
            <div className="font-serif text-3xl font-light text-text leading-none">{transactions.length}</div>
            <div className="text-xs text-text mt-1 tracking-[0.08em]">All time</div>
          </div>
          <div className="bg-surface p-6 relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-gold before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300">
            <div className="text-[0.58rem] uppercase tracking-[0.2em] text-text mb-3">Completed</div>
            <div className="font-serif text-3xl font-light text-gold-light leading-none">{completedCount}</div>
            <div className="text-xs text-text mt-1 tracking-[0.08em]">
              {transactions.length > 0
                ? `${Math.round((completedCount / transactions.length) * 100)}% success rate`
                : 'No data'}
            </div>
          </div>
          <div className="bg-surface p-6 relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-gold before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300">
            <div className="text-[0.58rem] uppercase tracking-[0.2em] text-text mb-3">Volume Processed</div>
            <div className="font-serif text-3xl font-light text-gold-light leading-none">
              {totalVolume > 0
                ? `$${(totalVolume / 100).toFixed(0)}`
                : '$0'}
            </div>
            <div className="text-xs text-text mt-1 tracking-[0.08em]">USD equivalent</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 items-center mb-6 flex-wrap animate-[fadeUp_0.6s_0.2s_ease_both]">
          <span className="text-xs uppercase tracking-[0.2em] text-text mr-1">Filter by</span>

          <select
            value={filters.gateway}
            onChange={(e) => setFilters({ ...filters, gateway: e.target.value })}
            className="bg-surface-2 border border-border text-text font-mono text-sm tracking-[0.06em] py-2 px-3 pr-8 rounded-none appearance-none cursor-pointer bg-no-repeat bg-right bg-[length:10px_6px] transition-colors focus:outline-none focus:border-gold/40"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23c9a84c' stroke-width='1.2' fill='none'/%3E%3C/svg%3E")` }}
          >
            <option value="">All Gateways</option>
            <option value="stripe">Stripe</option>
            <option value="paypal">PayPal</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="bg-surface-2 border border-border text-text font-mono text-sm tracking-[0.06em] py-2 px-3 pr-8 rounded-none appearance-none cursor-pointer bg-no-repeat bg-right bg-[length:10px_6px] transition-colors focus:outline-none focus:border-gold/40"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23c9a84c' stroke-width='1.2' fill='none'/%3E%3C/svg%3E")` }}
          >
            <option value="">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            onClick={fetchAllTransactions}
            disabled={loading}
            className="ml-auto bg-transparent border border-border text-text font-mono text-xs uppercase tracking-[0.15em] py-2 px-4 cursor-pointer rounded-none transition-all duration-200 hover:border-gold hover:text-gold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="transition-transform duration-400 hover:rotate-180">↻</span>
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/8 border border-red-500/25 text-red-400 p-4 text-sm tracking-[0.04em] mb-6">
            ⚠ {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center py-24 gap-6 animate-[fadeUp_0.4s_ease_both]">
            <div className="w-10 h-10 relative">
              <div className="absolute inset-0 rounded-full border border-transparent border-t-gold animate-spin" />
              <div className="absolute inset-0 rounded-full border border-transparent border-b-gold/30 animate-spin animation-reverse animation-duration-1500ms" />
            </div>
            <span className="text-sm uppercase tracking-[0.2em] text-text-muted">Fetching transactions</span>
          </div>
        )}

        {/* Table */}
        {!loading && transactions.length > 0 && (
          <div className="border border-border overflow-hidden animate-[fadeUp_0.6s_0.3s_ease_both] w-full">
            <table className="w-full border-collapse table-fixed">
              <thead>
                <tr className="bg-obsidian border-b border-border">
                  <th className="hidden md:table-cell md:w-1/6 py-4 px-5 text-left text-[0.58rem] uppercase tracking-[0.2em] text-text font-normal whitespace-nowrap">ID</th>
                  <th className="w-1/4 md:w-1/6 py-4 px-5 text-left text-[0.58rem] uppercase tracking-[0.2em] text-text font-normal whitespace-nowrap">Gateway</th>
                  <th className="w-1/4 md:w-1/6 py-4 px-5 text-left text-[0.58rem] uppercase tracking-[0.2em] text-text font-normal whitespace-nowrap">Amount</th>
                  <th className="w-1/4 md:w-1/6 py-4 px-5 text-left text-[0.58rem] uppercase tracking-[0.2em] text-text font-normal whitespace-nowrap">Status</th>
                  <th className="hidden md:table-cell md:w-1/6 py-4 px-5 text-left text-[0.58rem] uppercase tracking-[0.2em] text-text font-normal whitespace-nowrap">Transaction ID</th>
                  <th className="w-1/4 md:w-1/6 py-4 px-5 text-right text-[0.58rem] uppercase tracking-[0.2em] text-text font-normal whitespace-nowrap">Created</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, i) => {
                  const s = getStatus(tx.status);
                  const d = formatDate(tx.created_at);
                  return (
                    <tr key={tx.id} className="border-b border-white/3 transition-colors duration-150 cursor-pointer hover:bg-gold/5 last:border-b-0" style={{ animationDelay: `${i * 0.03}s` }}>
                      <td className="hidden md:table-cell md:w-1/6 py-4 px-5">
                        <Link href={`/transaction/${tx.id}`} className="block">
                          <span className="font-mono text-sm text-text">#{String(tx.id).padStart(6, '0')}</span>
                        </Link>
                      </td>
                      <td className="w-1/4 md:w-1/6 py-4 px-5">
                        <Link href={`/transaction/${tx.id}`} className="block">
                          <span className="inline-flex items-center gap-1 tracking-[0.06em] capitalize">
                            <span className="w-5 h-5 rounded bg-surface-3 inline-flex items-center justify-center text-xs text-gold border border-gold/20">
                              {tx.gateway === 'stripe' ? 'S' : 'P'}
                            </span>
                            <span className="text-text">{tx.gateway}</span>
                          </span>
                        </Link>
                      </td>
                      <td className="w-1/4 md:w-1/6 py-4 px-5">
                        <Link href={`/transaction/${tx.id}`} className="block">
                          <span className="font-serif text-lg font-normal text-text">
                            {formatAmount(tx.amount, tx.currency)}
                          </span>
                        </Link>
                      </td>
                      <td className="w-1/4 md:w-1/6 py-4 px-5">
                        <Link href={`/transaction/${tx.id}`} className="block">
                          <span
                            className="inline-flex items-center gap-1 py-1 px-3 rounded text-xs uppercase tracking-[0.1em]"
                            style={{ backgroundColor: s.bg, color: s.color }}
                          >
                            <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: s.dot }} />
                            {tx.status}
                          </span>
                        </Link>
                      </td>
                      <td className="hidden md:table-cell md:w-1/6 py-4 px-5">
                        <Link href={`/transaction/${tx.id}`} className="block">
                          <span className="text-sm text-text tracking-[0.03em] max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap">
                            {tx.transaction_id || '—'}
                          </span>
                        </Link>
                      </td>
                      <td className="w-1/6 py-4 px-5 text-right">
                        <Link href={`/transaction/${tx.id}`} className="block">
                          <div className="flex flex-col gap-1 items-end">
                            <span className="text-sm text-text">{d.date}</span>
                            <span className="text-xs text-text">{d.time}</span>
                          </div>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty */}
        {!loading && transactions.length === 0 && (
          <div className="text-center py-24 border border-border animate-[fadeUp_0.4s_ease_both]">
            <div className="text-4xl mb-4 opacity-30">◈</div>
            <div className="font-serif text-2xl font-light text-text-muted mb-2">No transactions found</div>
            <div className="text-sm tracking-[0.1em] text-text-dim">Try adjusting your filters</div>
          </div>
        )}
      </main>
    </div>
  );
}