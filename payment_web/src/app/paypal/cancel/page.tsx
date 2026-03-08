import { Suspense } from 'react';
import PaypalCancelContent from './PaypalCancelContent';

export default function PaypalCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Suspense fallback={<div>Loading...</div>}>
          <PaypalCancelContent />
        </Suspense>
      </div>
    </div>
  );
}