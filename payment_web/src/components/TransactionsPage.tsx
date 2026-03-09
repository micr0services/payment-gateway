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
        <div className="mb-8 sm:mb-12 animate-[fadeUp_0.6s_ease_both]">
          <div className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-gold mb-2 sm:mb-3 flex items-center gap-2 sm:gap-3">
            <div className="text-gold">◆</div>
            Dashboard
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-[0.02em] leading-none">Transaction<br />History</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 mb-6 sm:mb-10 animate-[fadeUp_0.6s_0.1s_ease_both]">
          <div className="bg-[#12151F] border border-[#404040] p-4 sm:p-6 relative overflow-hidden shadow-2xl"
               style={{
                 boxShadow: '0 40px 40px rgba(201, 168, 76, 0.08), 0 0 80px rgba(0, 0, 0, 0.6)'
               }}>
            <div className="text-[0.5rem] sm:text-[0.58rem] uppercase tracking-[0.2em] text-text mb-2 sm:mb-3">Total Transactions</div>
            <div className="font-serif text-2xl sm:text-3xl font-light text-text leading-none">{transactions.length}</div>
            <div className="text-[10px] sm:text-xs text-text mt-1 tracking-[0.08em]">All time</div>
          </div>
          <div className="bg-[#12151F] border border-[#404040] p-4 sm:p-6 relative overflow-hidden shadow-2xl"
               style={{
                 boxShadow: '0 40px 40px rgba(201, 168, 76, 0.08), 0 0 80px rgba(0, 0, 0, 0.6)'
               }}>
            <div className="text-[0.5rem] sm:text-[0.58rem] uppercase tracking-[0.2em] text-text mb-2 sm:mb-3">Completed</div>
            <div className="font-serif text-2xl sm:text-3xl font-light text-gold-light leading-none">{completedCount}</div>
            <div className="text-[10px] sm:text-xs text-text mt-1 tracking-[0.08em]">
              {transactions.length > 0
                ? `${Math.round((completedCount / transactions.length) * 100)}% success rate`
                : 'No data'}
            </div>
          </div>
          <div className="bg-[#12151F] border border-[#404040] p-4 sm:p-6 relative overflow-hidden shadow-2xl"
               style={{
                 boxShadow: '0 40px 40px rgba(201, 168, 76, 0.08), 0 0 80px rgba(0, 0, 0, 0.6)'
               }}>
            <div className="text-[0.5rem] sm:text-[0.58rem] uppercase tracking-[0.2em] text-text mb-2 sm:mb-3">Volume Processed</div>
            <div className="font-serif text-2xl sm:text-3xl font-light text-gold-light leading-none">
              {totalVolume > 0
                ? `$${(totalVolume / 100).toFixed(0)}`
                : '$0'}
            </div>
            <div className="text-[10px] sm:text-xs text-text mt-1 tracking-[0.08em]">USD equivalent</div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 sm:mb-10 animate-[fadeUp_0.6s_0.2s_ease_both]">
          <div className="bg-[#12151F] border border-[#404040] p-4 sm:p-6 shadow-2xl"
               style={{
                 boxShadow: '0 40px 40px rgba(201, 168, 76, 0.08), 0 0 80px rgba(0, 0, 0, 0.6)'
               }}>
            <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-gold mb-4">Filters</div>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="flex-1 min-w-0">
                <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-text mb-2">Gateway</div>
                <select
                  value={filters.gateway}
                  onChange={(e) => setFilters({ ...filters, gateway: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-[#404040] text-text font-mono text-xs sm:text-sm tracking-[0.06em] py-3 px-4 rounded-none appearance-none cursor-pointer"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23c9a84c' stroke-width='1.2' fill='none'/%3E%3C/svg%3E")`, backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat' }}
                >
                  <option value="">All Gateways</option>
                  <option value="stripe">Stripe</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-text mb-2">Status</div>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-[#404040] text-text font-mono text-xs sm:text-sm tracking-[0.06em] py-3 px-4 rounded-none appearance-none cursor-pointer"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23c9a84c' stroke-width='1.2' fill='none'/%3E%3C/svg%3E")`, backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat' }}
                >
                  <option value="">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <button
                onClick={fetchAllTransactions}
                disabled={loading}
                className="bg-gold border border-gold text-obsidian font-mono text-[10px] sm:text-xs uppercase tracking-[0.15em] py-3 px-6 cursor-pointer rounded-none transition-all duration-200 hover:bg-gold-light flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-4 h-4 border border-obsidian/30 border-t-obsidian rounded-full animate-spin" />
                ) : (
                  <span className="transition-transform duration-400 hover:rotate-180">↻</span>
                )}
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-[#E05C5C]/10 border border-[#E05C5C]/30 p-4 mb-6 animate-[fadeUp_0.4s_ease_both]">
            <div className="flex items-center gap-3">
              <span className="text-[#E05C5C]">⚠</span>
              <span className="text-[#E05C5C] text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center py-12 gap-4 animate-[fadeUp_0.4s_ease_both]">
            <div className="w-10 h-10 relative">
              <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto" />
            </div>
            <span className="text-sm uppercase tracking-[0.2em] text-[#B0B0B0]">Fetching transactions</span>
          </div>
        )}

        {/* Table */}
        {!loading && transactions.length > 0 && (
          <>
            {/* Mobile Card Layout */}
            <div className="md:hidden space-y-4 animate-[fadeUp_0.6s_0.3s_ease_both]">
              {transactions.map((tx, i) => {
                const s = getStatus(tx.status);
                const d = formatDate(tx.created_at);
                return (
                  <Link key={tx.id} href={`/transaction/${tx.id}`} className="block">
                    <div className="bg-[#12151F] border border-[#404040] p-5 rounded-[4px] shadow-2xl flex flex-col gap-2"
                         style={{ boxShadow: '0 40px 40px rgba(201, 168, 76, 0.08), 0 0 80px rgba(0, 0, 0, 0.6)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[24px] font-light text-[#E0E0E0]">{formatAmount(tx.amount, tx.currency)}</span>
                        <span className="px-3 py-1.5 rounded-full text-xs uppercase tracking-[0.1em] font-medium" style={{ backgroundColor: s.bg, color: s.color }}>
                          {tx.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mb-1">
                        <span className="text-xs uppercase tracking-[1.5px] text-[#B0B0B0] font-medium">{tx.gateway.toUpperCase()}</span>
                        <span className="text-xs text-[#7A7A8A] uppercase">{tx.currency.toUpperCase()}</span>
                      </div>
                      <div className="text-xs text-[#7A7A8A]">{d.date} • {d.time}</div>
                      {tx.transaction_id && (
                        <div className="text-[10px] text-[#7A7A8A] mt-1">ID: {tx.transaction_id}</div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden md:block border border-border overflow-hidden animate-[fadeUp_0.6s_0.3s_ease_both] w-full">
              <table className="w-full border-collapse table-fixed">
                <thead>
                  <tr className="bg-obsidian border-b border-border">
                    <th className="w-1/6 py-4 px-5 text-left text-[0.58rem] uppercase tracking-[0.2em] text-text font-normal whitespace-nowrap">ID</th>
                    <th className="w-1/7 py-4 px-5 text-left text-[0.58rem] uppercase tracking-[0.2em] text-text font-normal whitespace-nowrap">Gateway</th>
                    <th className="w-1/7 py-4 px-5 text-left text-[0.58rem] uppercase tracking-[0.2em] text-text font-normal whitespace-nowrap">Amount</th>
                    <th className="w-1/7 py-4 px-5 text-left text-[0.58rem] uppercase tracking-[0.2em] text-text font-normal whitespace-nowrap">Status</th>
                    <th className="w-1/7 py-4 px-5 text-left text-[0.58rem] uppercase tracking-[0.2em] text-text font-normal whitespace-nowrap">Transaction ID</th>
                    <th className="w-1/7 py-4 px-5 text-right text-[0.58rem] uppercase tracking-[0.2em] text-text font-normal whitespace-nowrap">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, i) => {
                    const s = getStatus(tx.status);
                    const d = formatDate(tx.created_at);
                    return (
                      <tr key={tx.id} className="border-b border-white/3 transition-colors duration-150 cursor-pointer hover:bg-gold/5 last:border-b-0" style={{ animationDelay: `${i * 0.03}s` }}>
                        <td className="w-1/6 py-4 px-5">
                          <span className="font-mono text-sm text-text">#{String(tx.id).padStart(6, '0')}</span>
                        </td>
                        <td className="w-1/6 py-4 px-5">
                          <span className="inline-flex items-center gap-1 tracking-[0.06em] capitalize">
                            <span className="w-5 h-5 rounded bg-surface-3 inline-flex items-center justify-center text-xs text-gold border border-gold/20">
                              {tx.gateway === 'stripe' ? 'S' : 'P'}
                            </span>
                            <span className="text-text">{tx.gateway}</span>
                          </span>
                        </td>
                        <td className="w-1/6 py-4 px-5">
                          <span className="font-serif text-lg font-normal text-text">
                            {formatAmount(tx.amount, tx.currency)}
                          </span>
                        </td>
                        <td className="w-1/6 py-4 px-5">
                          <span
                            className="inline-flex items-center gap-1 py-1 px-3 rounded text-xs uppercase tracking-[0.1em]"
                            style={{ backgroundColor: s.bg, color: s.color }}
                          >
                            <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: s.dot }} />
                            {tx.status}
                          </span>
                        </td>
                        <td className="w-1/6 py-4 px-5">
                          <span className="text-sm text-text tracking-[0.03em]  overflow-hidden text-ellipsis whitespace-nowrap">
                            {tx.transaction_id || '—'}
                          </span>
                        </td>
                        <td className="w-1/6 py-4 px-5 text-right">
                          <div className="flex flex-col gap-1 items-end">
                            <span className="text-sm text-text">{d.date}</span>
                            <span className="text-xs text-text">{d.time}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Empty */}
        {!loading && transactions.length === 0 && (
          <div className="text-center py-12 animate-[fadeUp_0.4s_ease_both]">
            <div className="text-5xl opacity-30 text-[#B0B0B0] mb-4">◈</div>
            <div className="font-serif text-xl font-light text-[#B0B0B0] mb-2">No transactions yet</div>
            <div className="text-sm text-[#808080]">Make a payment to see your transaction history</div>
          </div>
        )}
      </main>
    </div>
  );
}