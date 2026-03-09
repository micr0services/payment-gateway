'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  return (
    <>
      {/* Atmospheric layers */}
      <div className="fixed top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold via-gold-light via-gold to-transparent opacity-50 z-[200]" />
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none z-0" />
      <div className="fixed -top-[30%] -left-[10%] w-[60%] h-[60%] bg-[radial-gradient(ellipse,rgba(201,168,76,0.04)_0%,transparent_70%)] pointer-events-none z-0" />
      <div className="fixed -bottom-[30%] -right-[10%] w-[50%] h-[50%] bg-[radial-gradient(ellipse,rgba(40,60,140,0.07)_0%,transparent_70%)] pointer-events-none z-0" />

      {/* Navbar */}
      <nav className="sticky top-0 z-[100] bg-[rgba(10,10,15,0.88)] backdrop-blur-[24px] border-b border-border flex flex-col sm:flex-row sm:items-center px-4 sm:px-6 lg:px-10 py-2 sm:py-0 gap-2 sm:gap-4 lg:gap-12">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center gap-2 no-underline flex-shrink-0">
            <div className="w-7 h-7 border border-gold/35 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-[3px] bg-gold-glow clip-path-triangle" />
              <span className="text-[0.55rem] text-gold relative z-10">◆</span>
            </div>
            <span className="font-serif text-lg font-normal tracking-[0.08em] text-text">
              Pay<span className="text-gold font-normal">Ledger</span>
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <div className="rounded-full bg-green-500 shadow-[0_0_6px_#4caf80] animate-pulse text-[8px] sm:text-[10px] px-1 sm:px-2 py-0.5 text-white font-mono">
              Live Data
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1 text-[8px] sm:text-[0.58rem] uppercase tracking-[0.15em] text-text-dim">
              <div className="w-1 h-1 sm:w-1.25 sm:h-1.25 rounded-full bg-green-500 shadow-[0_0_6px_rgba(76,175,128,0.7)] animate-pulse" />
              <span className="hidden sm:inline">Systems Operational</span>
            </div>
            <div className="w-px h-[12px] sm:h-[18px] bg-border hidden sm:block" />
            <div className="text-[8px] sm:text-[0.58rem] tracking-[0.1em] text-text-dim hidden lg:block">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
            </div>
          </div>
        </div>

        <div className="flex items-stretch h-full gap-0 overflow-x-auto sm:flex-1">
          <Link
            href="/payment"
            className={`relative flex items-center gap-2 px-3 sm:px-5 bg-transparent border-none cursor-pointer font-mono text-xs uppercase tracking-[0.18em] transition-colors duration-200 hover:text-text whitespace-nowrap ${
              pathname === '/payment' || pathname?.startsWith('/payment/') 
                ? 'text-gold-light' 
                : 'text-text-muted'
            }`}
          >
            <svg className="w-4 h-4 opacity-60 transition-opacity duration-200" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="1" y="3" width="14" height="10" rx="1" />
              <path d="M1 6.5h14" />
              <path d="M4 10h3" strokeLinecap="round" />
            </svg>
            <span className="text-[10px] sm:text-xs">
              <span className="sm:hidden">Pay</span>
              <span className="hidden sm:inline">Make Payment</span>
            </span>
            {pathname === '/payment' || pathname?.startsWith('/payment/') ? (
              <>
                <span className="w-1 h-1 rounded-full bg-gold opacity-100" />
                <div className="absolute bottom-0 left-3 sm:left-5 right-3 sm:right-5 h-px bg-gold scale-x-100" />
              </>
            ) : null}
          </Link>

          <Link
            href="/dashboard"
            className={`relative flex items-center gap-2 px-3 sm:px-5 bg-transparent border-none cursor-pointer font-mono text-xs uppercase tracking-[0.18em] transition-colors duration-200 hover:text-text whitespace-nowrap ${
              pathname === '/dashboard' || pathname?.startsWith('/transaction') 
                ? 'text-gold-light' 
                : 'text-text-muted'
            }`}
          >
            <svg className="w-4 h-4 opacity-60 transition-opacity duration-200" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M2 4h12M2 8h8M2 12h10" strokeLinecap="round" />
            </svg>
            <span className="text-[10px] sm:text-xs">
              <span className="sm:hidden">Trans</span>
              <span className="hidden sm:inline">Transactions</span>
            </span>
            {pathname === '/dashboard' || pathname?.startsWith('/transaction') ? (
              <>
                <span className="w-1 h-1 rounded-full bg-gold opacity-100" />
                <div className="absolute bottom-0 left-3 sm:left-5 right-3 sm:right-5 h-px bg-gold scale-x-100" />
              </>
            ) : null}
          </Link>

          <Link
            href="/integrations"
            className={`relative flex items-center gap-2 px-3 sm:px-5 bg-transparent border-none cursor-pointer font-mono text-xs uppercase tracking-[0.18em] transition-colors duration-200 hover:text-text whitespace-nowrap ${
              pathname === '/integrations' 
                ? 'text-gold-light' 
                : 'text-text-muted'
            }`}
          >
            <svg className="w-4 h-4 opacity-60 transition-opacity duration-200" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M8 1v6m0 0v6m0-6h6m-6 0H2" strokeLinecap="round" />
            </svg>
            <span className="text-[9px] sm:text-xs">
              <span className="sm:hidden">Intergrate</span>
              <span className="hidden sm:inline">Integrations</span>
            </span>
            {pathname === '/integrations' ? (
              <>
                <span className="w-1 h-1 rounded-full bg-gold opacity-100" />
                <div className="absolute bottom-0 left-3 sm:left-5 right-3 sm:right-5 h-px bg-gold scale-x-100" />
              </>
            ) : null}
          </Link>

          <Link
            href="/projects"
            className={`relative flex items-center gap-2 px-3 sm:px-5 bg-transparent border-none cursor-pointer font-mono text-xs uppercase tracking-[0.18em] transition-colors duration-200 hover:text-text whitespace-nowrap ${
              pathname === '/projects' 
                ? 'text-gold-light' 
                : 'text-text-muted'
            }`}
          >
            <svg className="w-4 h-4 opacity-60 transition-opacity duration-200" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M2 3h12v11H2zM7 8l3 3m0 0l3-3m-3 3V3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[9px] sm:text-xs">
              <span className="sm:hidden">Project</span>
              <span className="hidden sm:inline">Projects</span>
            </span>
            {pathname === '/projects' ? (
              <>
                <span className="w-1 h-1 rounded-full bg-gold opacity-100" />
                <div className="absolute bottom-0 left-3 sm:left-5 right-3 sm:right-5 h-px bg-gold scale-x-100" />
              </>
            ) : null}
          </Link>
        </div>
      </nav>
    </>
  );
}