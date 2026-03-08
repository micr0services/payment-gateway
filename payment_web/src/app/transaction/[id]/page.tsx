import { Suspense } from 'react';
import TransactionDetailsContent from './TransactionDetailsContent';

interface PageProps {
  params: {
    id: string;
  };
}

export default function TransactionDetailsPage({ params }: PageProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="text-center py-12">Loading transaction details...</div>}>
          <TransactionDetailsContent transactionId={params.id} />
        </Suspense>
      </div>
    </div>
  );
}