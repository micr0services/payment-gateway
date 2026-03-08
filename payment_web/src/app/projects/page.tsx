'use client';

import Link from 'next/link';

const projects = [
  {
    id: 'payledger',
    title: 'PayLedger',
    description: 'A comprehensive payment gateway supporting multiple providers including PayPal and Stripe with advanced features like idempotency, webhooks, and transaction management.',
    technologies: ['TypeScript', 'Hono', 'Cloudflare Workers', 'Next.js', 'Tailwind CSS'],
    features: [
      'Multi-provider payment processing',
      'Idempotent transactions',
      'Webhook handling',
      'Transaction history',
      'Real-time status updates'
    ],
    status: 'Active',
    github: 'https://github.com/kimaniwilfred95/payment-gateway',
    demo: 'https://payment-gateway.kimaniwilfred95.workers.dev'
  },
  {
    id: 'flutter-payment-app',
    title: 'Flutter Payment App',
    description: 'A mobile payment application built with Flutter, providing a seamless payment experience across different platforms.',
    technologies: ['Flutter', 'Dart', 'Android', 'iOS'],
    features: [
      'Cross-platform mobile app',
      'Payment integration',
      'Transaction tracking',
      'User authentication',
      'Offline support'
    ],
    status: 'In Development',
    github: 'https://github.com/kimaniwilfred95/payment-gateway',
    demo: null
  },
  {
    id: 'payment-analytics',
    title: 'Payment Analytics Dashboard',
    description: 'A comprehensive analytics platform for payment data visualization, reporting, and business intelligence.',
    technologies: ['React', 'D3.js', 'Node.js', 'PostgreSQL'],
    features: [
      'Real-time analytics',
      'Custom dashboards',
      'Export capabilities',
      'Multi-tenant support',
      'API integrations'
    ],
    status: 'Planned',
    github: null,
    demo: null
  },
  {
    id: 'crypto-payment-gateway',
    title: 'Cryptocurrency Payment Gateway',
    description: 'A payment gateway supporting various cryptocurrencies with automatic conversion and wallet management.',
    technologies: ['Node.js', 'Web3.js', 'MongoDB', 'Express'],
    features: [
      'Multi-crypto support',
      'Automatic conversion',
      'Wallet management',
      'Security features',
      'Transaction monitoring'
    ],
    status: 'Research',
    github: null,
    demo: null
  }
];

export default function ProjectsPage() {
  return (
    <div className="p-8 relative overflow-hidden min-h-[calc(100vh-60px)]">
      <div className="relative z-10 w-full max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <div className="text-xs uppercase tracking-[0.25em] text-gold mb-3 flex items-center justify-center gap-2">
            <span className="text-[0.4rem]">◆</span>
            Portfolio
          </div>
          <h1 className="text-4xl font-light leading-tight font-serif">Other Projects</h1>
          <p className="text-text-muted mt-4 max-w-2xl mx-auto">
            A collection of software projects and applications I've developed, showcasing various technologies and problem-solving approaches.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-surface border border-border rounded-sm shadow-[0_0_0_1px_rgba(201,168,76,0.08),0_40px_80px_rgba(0,0,0,0.6),0_0_120px_rgba(201,168,76,0.04)] p-8 hover:border-[rgba(201,168,76,0.3)] transition-all duration-300 hover:transform hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-serif font-light">{project.title}</h3>
                <span className={`px-3 py-1 text-xs uppercase tracking-[0.1em] rounded-sm ${
                  project.status === 'Active'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : project.status === 'In Development'
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : project.status === 'Planned'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                }`}>
                  {project.status}
                </span>
              </div>

              <p className="text-text-muted text-sm leading-relaxed mb-6">
                {project.description}
              </p>

              <div className="mb-6">
                <h4 className="text-xs uppercase tracking-[0.2em] text-gold mb-3">Technologies</h4>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-surface-2 border border-border rounded-sm text-xs font-mono text-text-muted"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-xs uppercase tracking-[0.2em] text-gold mb-3">Key Features</h4>
                <ul className="space-y-1">
                  {project.features.map((feature, index) => (
                    <li key={index} className="text-sm text-text-muted flex items-center gap-2">
                      <span className="w-1 h-1 bg-gold rounded-full flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-4">
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-gold hover:text-gold-light transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    View Code
                  </a>
                )}
                {project.demo && (
                  <a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-gold hover:text-gold-light transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Live Demo
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="mb-8">
            <h2 className="text-2xl font-serif font-light mb-4">Interested in Collaboration?</h2>
            <p className="text-text-muted max-w-2xl mx-auto">
              I'm always open to discussing new projects, partnerships, or technical challenges.
              Whether you need custom software development, API integrations, or technical consulting,
              let's explore how we can work together.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/integrations"
              className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-obsidian font-mono text-xs uppercase tracking-[0.15em] py-3 px-6 rounded-sm transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Start a Project
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-text-muted hover:text-text transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}