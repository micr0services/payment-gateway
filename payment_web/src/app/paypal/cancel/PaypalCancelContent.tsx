'use client';

export default function PaypalCancelContent() {
  return (
    <div>
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
        <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 className="mt-6 text-3xl font-extrabold text-gray-900">PayPal Payment Cancelled</h2>
      <p className="mt-2 text-sm text-gray-600">
        Your PayPal payment has been cancelled. No charges have been made to your account.
      </p>
      <div className="mt-6">
        <a
          href="/"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
}