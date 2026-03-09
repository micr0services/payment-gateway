import { Suspense } from 'react';
import PaypalSuccessContent from './PaypalSuccessContent';

export default function PaypalSuccessPage() {
  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Suspense fallback={<div>Loading...</div>}>
          <PaypalSuccessContent />
        </Suspense>
      </div>
    </div>
  );
}