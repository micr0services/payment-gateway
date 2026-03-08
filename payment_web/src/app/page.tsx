'use client';

import TransactionsPage from '@/components/TransactionsPage';

export default function Home() {
  return (
    <main className="relative z-10 animate-[pageIn_0.5s_cubic-bezier(0.16,1,0.3,1)_both]">
      <TransactionsPage />
    </main>
  );
}