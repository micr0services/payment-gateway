'use client';

import Link from 'next/link';

export default function PaymentSelectionPage() {
  return (
    <div className="flex items-center justify-center p-8 relative overflow-hidden min-h-[calc(100vh-60px)]">
      <div className="relative z-10 w-full max-w-[800px]">
        <div className="text-center mb-12">
          <div className="text-xs uppercase tracking-[0.25em] text-gold mb-3 flex items-center justify-center gap-2">
            <span className="text-[0.4rem]">◆</span>
            Choose Payment Method
          </div>
          <h1 className="text-4xl font-light leading-tight font-serif">Select Your<br />Payment Gateway</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* PayPal Card */}
          <Link href="/payment/paypal" className="block group">
            <div className="bg-surface border border-border rounded-sm shadow-[0_0_0_1px_rgba(201,168,76,0.08),0_40px_80px_rgba(0,0,0,0.6),0_0_120px_rgba(201,168,76,0.04)] p-8 hover:border-[rgba(201,168,76,0.3)] transition-all duration-300 hover:shadow-[0_0_0_1px_rgba(201,168,76,0.15),0_40px_80px_rgba(0,0,0,0.6),0_0_120px_rgba(201,168,76,0.08)] hover:transform hover:scale-[1.02]">
              <div className="flex items-center justify-center mb-6">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="text-blue-500">
                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.59 3.025-2.566 6.082-8.558 6.082H9.625l-1.32 8.35h3.878c.455 0 .84-.33.912-.78l.038-.195.723-4.58.046-.254c.071-.45.456-.78.912-.78h.574c3.717 0 6.627-1.51 7.48-5.875.357-1.832.18-3.362-.646-4.681z"/>
                </svg>
              </div>
              <h3 className="text-xl font-serif font-light text-center mb-4">PayPal</h3>
              <p className="text-sm text-text-muted text-center leading-relaxed">
                Secure payment processing through PayPal. Pay with your PayPal account or credit card.
              </p>
              <div className="mt-6 text-center">
                <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-gold group-hover:text-gold-light transition-colors">
                  Proceed with PayPal
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>

          {/* Stripe Card */}
          <Link href="/payment/stripe" className="block group">
            <div className="bg-surface border border-border rounded-sm shadow-[0_0_0_1px_rgba(201,168,76,0.08),0_40px_80px_rgba(0,0,0,0.6),0_0_120px_rgba(201,168,76,0.04)] p-8 hover:border-[rgba(201,168,76,0.3)] transition-all duration-300 hover:shadow-[0_0_0_1px_rgba(201,168,76,0.15),0_40px_80px_rgba(0,0,0,0.6),0_0_120px_rgba(201,168,76,0.08)] hover:transform hover:scale-[1.02]">
              <div className="flex items-center justify-center mb-6">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="text-purple-500">
                  <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.573 0c-6.02 0-9.396 3.475-9.396 8.415 0 4.63 3.935 7.093 9.793 8.874 2.467.763 3.293 1.26 3.293 2.13 0 1.063-1.233 1.531-2.977 1.531-2.83 0-5.697-1.048-7.692-2.599l.88 5.388c1.894.891 4.751 1.511 7.403 1.511 6.446 0 10.019-3.497 10.019-8.631 0-4.39-3.581-6.912-8.876-8.58z"/>
                </svg>
              </div>
              <h3 className="text-xl font-serif font-light text-center mb-4">Stripe</h3>
              <p className="text-sm text-text-muted text-center leading-relaxed">
                Fast and secure credit card payments powered by Stripe. Supports all major cards.
              </p>
              <div className="mt-6 text-center">
                <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-gold group-hover:text-gold-light transition-colors">
                  Proceed with Stripe
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-text-muted hover:text-text transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}