'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function IntegrationsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          service: '',
          message: ''
        });
      } else {
        alert('Failed to send inquiry. Please try again.');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center p-4 sm:p-8 relative overflow-hidden min-h-[calc(100vh-60px)]">
        <div className="relative z-10 w-full max-w-[600px] text-center px-4 sm:px-0">
          <div className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-gold mb-3 flex items-center justify-center gap-2">
            <span className="text-[0.4rem]">◆</span>
            Inquiry Sent
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-light leading-tight font-serif mb-6">Thank You!</h1>
          <p className="text-text-muted mb-8 text-sm sm:text-base">
            We've received your integration inquiry and will get back to you within 24 hours.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-[0.15em] text-gold hover:text-gold-light transition-colors"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4 sm:p-8 relative overflow-hidden min-h-[calc(100vh-60px)]">
      <div className="relative z-10 w-full max-w-[600px] px-4 sm:px-0">
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <div className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-gold mb-3 flex items-center justify-center gap-2">
            <span className="text-[0.4rem]">◆</span>
            Integration Services
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-light leading-tight font-serif">Inquire About<br />Integrations</h1>
          <p className="text-text-muted mt-3 sm:mt-4 text-sm sm:text-base">
            Need custom integrations or software services? Let us know your requirements.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-sm shadow-[0_0_0_1px_rgba(201,168,76,0.08),0_40px_80px_rgba(0,0,0,0.6),0_0_120px_rgba(201,168,76,0.04)] p-4 sm:p-6 md:p-8">
          <div className="space-y-4 sm:space-y-6">
            {/* Name */}
            <div>
              <label className="block text-[10px] sm:text-xs uppercase tracking-[0.2em] text-text mb-1.5">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-surface-2 border border-border rounded-sm p-3 sm:p-3.5 text-text font-mono text-sm placeholder:text-text-muted focus:outline-none focus:border-[rgba(201,168,76,0.4)] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.15)]"
                placeholder="Your full name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] sm:text-xs uppercase tracking-[0.2em] text-text mb-1.5">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-surface-2 border border-border rounded-sm p-3 sm:p-3.5 text-text font-mono text-sm placeholder:text-text-muted focus:outline-none focus:border-[rgba(201,168,76,0.4)] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.15)]"
                placeholder="your.email@company.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[10px] sm:text-xs uppercase tracking-[0.2em] text-text mb-1.5">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full bg-surface-2 border border-border rounded-sm p-3 sm:p-3.5 text-text font-mono text-sm placeholder:text-text-muted focus:outline-none focus:border-[rgba(201,168,76,0.4)] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.15)]"
                placeholder="+254 700 000 000"
              />
            </div>

            {/* Company */}
            <div>
              <label className="block text-[10px] sm:text-xs uppercase tracking-[0.2em] text-text mb-1.5">Company</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full bg-surface-2 border border-border rounded-sm p-3 sm:p-3.5 text-text font-mono text-sm placeholder:text-text-muted focus:outline-none focus:border-[rgba(201,168,76,0.4)] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.15)]"
                placeholder="Company name (optional)"
              />
            </div>

            {/* Service Type */}
            <div>
              <label className="block text-[10px] sm:text-xs uppercase tracking-[0.2em] text-text mb-1.5">Service Type</label>
              <select
                name="service"
                value={formData.service}
                onChange={handleChange}
                required
                className="w-full bg-surface-2 border border-border rounded-sm p-3 sm:p-3.5 text-text font-mono text-sm focus:outline-none focus:border-[rgba(201,168,76,0.4)] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.15)] appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23c9a84c' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 1rem center',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                <option value="">Select a service</option>
                <option value="api-integration">API Integration</option>
                <option value="payment-gateway">Payment Gateway Setup</option>
                <option value="custom-software">Custom Software Development</option>
                <option value="system-migration">System Migration</option>
                <option value="consulting">Technical Consulting</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="block text-[10px] sm:text-xs uppercase tracking-[0.2em] text-text mb-1.5">Project Details</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={4}
                className="w-full bg-surface-2 border border-border rounded-sm p-3 sm:p-3.5 text-text font-mono text-sm placeholder:text-text-muted focus:outline-none focus:border-[rgba(201,168,76,0.4)] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.15)] resize-none"
                placeholder="Describe your integration needs, timeline, and any specific requirements..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gold hover:bg-gold-light text-obsidian font-mono text-[10px] sm:text-xs uppercase tracking-[0.15em] py-3 sm:py-4 px-4 sm:px-6 rounded-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending...' : 'Send Inquiry'}
            </button>
          </div>
        </form>

        <div className="mt-4 sm:mt-6 md:mt-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-[0.15em] text-text-muted hover:text-text transition-colors">
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}