import { Suspense } from 'react';
import TransactionDetailsContent from './TransactionDetailsContent';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TransactionDetailsPage({ params }: PageProps) {
  const resolvedParams = await params;
  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className="w-full ">
        <Suspense fallback={<div className="text-center py-8 sm:py-12 text-sm sm:text-base">Loading transaction details...</div>}>
          <TransactionDetailsContent transactionId={resolvedParams.id} />
        </Suspense>
      </div>
    </div>
  );
}