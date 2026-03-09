'use client';

import { useEffect, useState } from 'react';

interface TypewriterLine {
  id: string;
  text: string;
  className: string;
  prompt: boolean;
  speed: number;
  delay?: number;
}

const SCRIPT: TypewriterLine[] = [
  { id: 'init', text: 'initializing...', className: 'text-gray-500 text-sm', prompt: true, speed: 22 },
  { id: 'spacer1', text: '', className: '', prompt: false, speed: 0, delay: 120 },
  { id: 'hello', text: 'HELLO, WORLD.', className: 'text-green-400 text-xs uppercase tracking-widest', prompt: true, speed: 45 },
  { id: 'spacer2', text: '', className: '', prompt: false, speed: 0, delay: 180 },
  { id: 'name', text: 'I am Engineer Wilfred.', className: 'text-xl sm:text-2xl md:text-3xl font-bold text-gold tracking-wider', prompt: true, speed: 60, delay: 200 },
  { id: 'spacer3', text: '', className: '', prompt: false, speed: 0, delay: 120 },
  { id: 'bio1', text: 'Backend Systems Engineer.', className: 'text-sm md:text-base text-text leading-relaxed', prompt: true, speed: 38 },
  { id: 'bio2', text: 'Building secure, scalable financial infrastructure.', className: 'text-sm md:text-base text-text leading-relaxed', prompt: true, speed: 38 },
  { id: 'bio3', text: 'Expert in modern backend technologies and cloud architecture.', className: 'text-sm md:text-base text-text leading-relaxed', prompt: true, speed: 38 },
  { id: 'spacer4', text: '', className: '', prompt: false, speed: 0, delay: 180 },
  { id: 'separator1', text: '─────────────────────────────────────────', className: 'text-gray-700', prompt: true, speed: 8 },
  { id: 'spacer5', text: '', className: '', prompt: false, speed: 0, delay: 120 },
  { id: 'project', text: 'this is app and web app called pay', className: 'text-green-400 text-xs uppercase tracking-widest', prompt: true, speed: 35 },
  { id: 'spacer6', text: '', className: '', prompt: false, speed: 0, delay: 80 },
  { id: 'project_desc1', text: 'A comprehensive payment processing platform', className: 'text-sm md:text-base text-text leading-relaxed', prompt: true, speed: 36 },
  { id: 'project_desc2', text: 'with mobile app and web interface', className: 'text-sm md:text-base text-text leading-relaxed', prompt: true, speed: 36 },
  { id: 'project_desc3', text: 'built for seamless financial transactions.', className: 'text-sm md:text-base text-text leading-relaxed', prompt: true, speed: 36 },
  { id: 'spacer7', text: '', className: '', prompt: false, speed: 0, delay: 180 },
  { id: 'what_it_does', text: 'What it does:', className: 'text-green-400 text-xs uppercase tracking-widest', prompt: true, speed: 40 },
  { id: 'feature1', text: 'Dual payment gateways — Stripe & PayPal integration', className: 'text-sm md:text-base text-text leading-relaxed', prompt: false, speed: 28 },
  { id: 'feature2', text: 'Multi-currency support: USD, EUR, GBP, KES, and more', className: 'text-sm md:text-base text-text leading-relaxed', prompt: false, speed: 28 },
  { id: 'feature3', text: 'Real-time transaction monitoring and analytics', className: 'text-sm md:text-base text-text leading-relaxed', prompt: false, speed: 28 },
  { id: 'feature4', text: 'Advanced filtering by gateway, status, date & amount', className: 'text-sm md:text-base text-text leading-relaxed', prompt: false, speed: 28 },
  { id: 'feature5', text: 'Mobile-first responsive design across all devices', className: 'text-sm md:text-base text-text leading-relaxed', prompt: false, speed: 28 },
  { id: 'feature6', text: 'Secure webhook handling and payment verification', className: 'text-sm md:text-base text-text leading-relaxed', prompt: false, speed: 28 },
  { id: 'feature7', text: 'RESTful API for seamless third-party integrations', className: 'text-sm md:text-base text-text leading-relaxed', prompt: false, speed: 28 },
  { id: 'feature8', text: 'SMS notifications and email confirmations', className: 'text-sm md:text-base text-text leading-relaxed', prompt: false, speed: 28 },
  { id: 'spacer8', text: '', className: '', prompt: false, speed: 0, delay: 180 },
  { id: 'stack', text: 'Technology Stack:', className: 'text-green-400 text-xs uppercase tracking-widest', prompt: true, speed: 40 },
  { id: 'stack1', text: 'Frontend: Next.js 14, TypeScript, Tailwind CSS, React', className: 'text-sm md:text-base text-text leading-relaxed', prompt: false, speed: 30 },
  { id: 'stack2', text: 'Backend: Cloudflare Workers, Node.js, Express', className: 'text-sm md:text-base text-text leading-relaxed', prompt: false, speed: 30 },
  { id: 'stack3', text: 'Payments: Stripe SDK, PayPal SDK, Webhooks', className: 'text-sm md:text-base text-text leading-relaxed', prompt: false, speed: 30 },
  { id: 'stack4', text: 'Database: PostgreSQL, Prisma ORM, Migrations', className: 'text-sm md:text-base text-text leading-relaxed', prompt: false, speed: 30 },
  { id: 'stack5', text: 'Mobile: Flutter, Dart, Android/iOS deployment', className: 'text-sm md:text-base text-text leading-relaxed', prompt: false, speed: 30 },
  { id: 'spacer9', text: '', className: '', prompt: false, speed: 0, delay: 180 },
  { id: 'separator2', text: '─────────────────────────────────────────', className: 'text-gray-700', prompt: true, speed: 8 },
  { id: 'spacer10', text: '', className: '', prompt: false, speed: 0, delay: 120 },
  { id: 'philosophy', text: '[ PHILOSOPHY ]', className: 'text-green-400 text-xs uppercase tracking-widest', prompt: true, speed: 40 },
  { id: 'philosophy1', text: 'Payments are trust made tangible.', className: 'text-sm md:text-base text-text leading-relaxed', prompt: true, speed: 40 },
  { id: 'philosophy2', text: 'Every transaction is a promise kept — or broken.', className: 'text-sm md:text-base text-text leading-relaxed', prompt: true, speed: 40 },
  { id: 'philosophy3', text: 'This platform is built to keep promises.', className: 'text-sm md:text-base text-text leading-relaxed', prompt: true, speed: 40 },
  { id: 'philosophy4', text: 'Security first. Performance always. Trust forever.', className: 'text-sm md:text-base text-text leading-relaxed', prompt: true, speed: 40 },
  { id: 'spacer11', text: '', className: '', prompt: false, speed: 0, delay: 180 },
  { id: 'separator3', text: '─────────────────────────────────────────', className: 'text-gray-700', prompt: true, speed: 8 },
  { id: 'spacer12', text: '', className: '', prompt: false, speed: 0, delay: 120 },
  { id: 'stats', text: '[ STATISTICS ]', className: 'text-green-400 text-xs uppercase tracking-widest', prompt: true, speed: 40 },
  { id: 'stat1', text: 'Transactions processed: 10,000+', className: 'text-sm md:text-base text-text leading-relaxed', prompt: true, speed: 35 },
  { id: 'stat2', text: 'Uptime: 99.9% availability', className: 'text-sm md:text-base text-text leading-relaxed', prompt: true, speed: 35 },
  { id: 'stat3', text: 'Supported currencies: 15+', className: 'text-sm md:text-base text-text leading-relaxed', prompt: true, speed: 35 },
  { id: 'stat4', text: 'Active users: 500+', className: 'text-sm md:text-base text-text leading-relaxed', prompt: true, speed: 35 },
  { id: 'spacer13', text: '', className: '', prompt: false, speed: 0, delay: 180 },
  { id: 'separator4', text: '─────────────────────────────────────────', className: 'text-gray-700', prompt: true, speed: 8 },
  { id: 'spacer14', text: '', className: '', prompt: false, speed: 0, delay: 120 },
  { id: 'status', text: '[ STATUS ] ready.', className: 'text-green-400 text-xs uppercase tracking-widest', prompt: true, speed: 45 },
  { id: 'spacer15', text: '', className: '', prompt: false, speed: 0, delay: 200 },
  { id: 'cursor', text: '_', className: 'text-gray-700', prompt: true, speed: 80 },
];

export default function Home() {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [displayedLines, setDisplayedLines] = useState<Record<string, string>>({});
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);

  useEffect(() => {
    // Initialize audio context on first interaction
    const initAudio = () => {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass && !audioContext) {
        const ctx = new AudioContextClass();
        setAudioContext(ctx);
      }
    };

    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('keydown', initAudio, { once: true });
    
    const timeout = setTimeout(() => {
      try {
        initAudio();
      } catch (e) {
        // Ignore
      }
    }, 300);

    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('keydown', initAudio);
      clearTimeout(timeout);
    };
  }, [audioContext]);

  const playClick = (freq = 420, dur = 0.032) => {
    if (!audioContext) return;
    try {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq + Math.random() * 60 - 30, audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, audioContext.currentTime + dur);
      gain.gain.setValueAtTime(0.04, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + dur);
      osc.start(audioContext.currentTime);
      osc.stop(audioContext.currentTime + dur);
    } catch (e) {
      // Ignore audio errors
    }
  };

  useEffect(() => {
    if (currentLineIndex >= SCRIPT.length) {
      setShowNavigation(true);
      return;
    }

    const currentLine = SCRIPT[currentLineIndex];
    
    if (currentLine.text === '') {
      // Spacer line
      setTimeout(() => {
        setCurrentLineIndex(prev => prev + 1);
        setCurrentCharIndex(0);
      }, currentLine.delay || 120);
      return;
    }

    if (currentCharIndex < currentLine.text.length) {
      setIsTyping(true);
      const timer = setTimeout(() => {
        const newText = currentLine.text.slice(0, currentCharIndex + 1);
        setDisplayedLines(prev => ({
          ...prev,
          [currentLine.id]: newText
        }));
        
        if (currentLine.text[currentCharIndex] !== ' ' && currentLine.text[currentCharIndex] !== '\n') {
          playClick();
        }
        
        setCurrentCharIndex(prev => prev + 1);
      }, currentLine.speed);
      
      return () => clearTimeout(timer);
    } else {
      // Line completed
      setIsTyping(false);
      setTimeout(() => {
        setCurrentLineIndex(prev => prev + 1);
        setCurrentCharIndex(0);
      }, currentLine.delay || 180);
    }
  }, [currentLineIndex, currentCharIndex, audioContext]);

  const renderLine = (line: TypewriterLine) => {
    if (line.text === '') {
      return <div key={line.id} className="h-6" />;
    }

    const displayedText = displayedLines[line.id] || '';
    const isCurrentLine = currentLineIndex === SCRIPT.indexOf(line) && isTyping;
    
    return (
      <div key={line.id} className="flex gap-1.5 sm:gap-2.5 mb-1.5 sm:mb-2 justify-center">
        {line.prompt && <span className="text-gold flex-shrink-0 text-sm sm:text-base">▸</span>}
        {!line.prompt && <span className="text-gray-500 flex-shrink-0 ml-2 sm:ml-4 text-sm sm:text-base">▸</span>}
        <span className={`${line.className} text-xs sm:text-sm md:text-base`}>
          {displayedText}
          {isCurrentLine && <span className="animate-pulse">|</span>}
        </span>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-obsidian font-mono text-text overflow-x-hidden">
      {/* Scanlines */}
      <div className="fixed inset-0 pointer-events-none opacity-5 z-100" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
      }} />
      
      {/* Blue scan line moving up and down - continuous during typing */}
      <div className="fixed left-0 right-0 h-[4px] pointer-events-none z-101 animate-[blueScan_2s_ease-in-out_infinite]" style={{
        background: 'linear-gradient(90deg, transparent, #3b82f6, #1d4ed8, #2563eb, #3b82f6, transparent)',
        boxShadow: '0 0 30px rgba(59, 130, 246, 1), 0 0 60px rgba(59, 130, 246, 0.6), 0 0 100px rgba(59, 130, 246, 0.3)',
      }} />

      <div className="relative z-10 w-full mx-auto px-3 sm:px-4 md:px-6 lg:px-12 py-6 sm:py-8 md:py-10 lg:py-20 flex flex-col items-center justify-center min-h-screen text-center">
        {/* Render all lines */}
        {SCRIPT.map(line => renderLine(line))}

        {/* Navigation Links - show after typing is complete */}
        {showNavigation && (
          <>
            {/* Top Navigation - Dashboard & Integrations */}
            <div className="w-full max-w-xs mx-auto mb-4 sm:hidden">
              <div className="flex justify-between items-center">
                <a href="/dashboard" className="flex flex-col items-center gap-1 text-gold hover:text-gold-light transition-colors group">
                  <div className="w-8 h-8 rounded-full border border-gold/30 flex items-center justify-center group-hover:border-gold/60 transition-colors">
                    <span className="text-xs">📊</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider">Dashboard</span>
                </a>
                <a href="/integrations" className="flex flex-col items-center gap-1 text-gold hover:text-gold-light transition-colors group">
                  <div className="w-8 h-8 rounded-full border border-gold/30 flex items-center justify-center group-hover:border-gold/60 transition-colors">
                    <span className="text-xs">🔗</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider">Integrations</span>
                </a>
              </div>
            </div>

            <div className="h-4 sm:h-8" />
            <div className="flex gap-1.5 sm:gap-2.5 mb-6 sm:mb-8">
              <span className="text-gold flex-shrink-0 text-sm sm:text-base">▸</span>
              <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
                <a href="/dashboard" className="text-gold hover:text-gold-light transition-colors underline hidden sm:inline">
                  dashboard
                </a>
                <a href="/payment/stripe" className="text-gold hover:text-gold-light transition-colors underline">
                  pay_stripe
                </a>
                <a href="/payment/paypal" className="text-gold hover:text-gold-light transition-colors underline">
                  pay_paypal
                </a>
                <a href="/integrations" className="text-gold hover:text-gold-light transition-colors underline hidden sm:inline">
                  integrations
                </a>
              </div>
            </div>

            {/* Bottom Navigation - Payment Methods */}
            <div className="w-full max-w-xs mx-auto mt-4 sm:hidden">
              <div className="flex justify-between items-center">
                <a href="/payment/stripe" className="flex flex-col items-center gap-1 text-gold hover:text-gold-light transition-colors group">
                  <div className="w-8 h-8 rounded-full border border-gold/30 flex items-center justify-center group-hover:border-gold/60 transition-colors bg-gold/5 group-hover:bg-gold/10">
                    <span className="text-xs">💳</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-medium">Stripe</span>
                </a>
                <a href="/payment/paypal" className="flex flex-col items-center gap-1 text-gold hover:text-gold-light transition-colors group">
                  <div className="w-8 h-8 rounded-full border border-gold/30 flex items-center justify-center group-hover:border-gold/60 transition-colors">
                    <span className="text-xs">💰</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider">PayPal</span>
                </a>
              </div>
            </div>

            <div className="h-3 sm:h-4" />
            <div className="flex gap-1.5 sm:gap-2.5">
              <span className="text-gray-700 text-sm sm:text-base">▸</span>
              <span className="text-gray-700">_</span>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes blueScan {
          0%, 100% { top: -5px; transform: scaleY(1); }
          25% { top: 25vh; transform: scaleY(1.2); }
          50% { top: 50vh; transform: scaleY(1.5); }
          75% { top: 75vh; transform: scaleY(1.2); }
        }
      `}</style>
    </main>
  );
}