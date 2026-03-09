export default function CancelPage() {
  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="bg-surface border border-border rounded-sm shadow-[0_0_0_1px_rgba(201,168,76,0.08),0_40px_80px_rgba(0,0,0,0.6),0_0_120px_rgba(201,168,76,0.04)] p-6 sm:p-8">
          <div className="mx-auto flex items-center justify-center h-10 sm:h-12 w-10 sm:w-12 rounded-full bg-[rgba(201,168,76,0.1)] border border-gold">
            <svg className="h-5 sm:h-6 w-5 sm:w-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-light font-serif text-text">Payment Cancelled</h2>
          <p className="mt-2 text-sm sm:text-base text-text-muted">
            Your payment has been cancelled. No charges have been made to your account.
          </p>
          <div className="mt-4 sm:mt-6">
            <a
              href="/dashboard"
              className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gold hover:bg-gold-light text-obsidian font-mono text-[10px] sm:text-xs uppercase tracking-[0.15em] rounded-sm transition-colors"
            >
              Return to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}