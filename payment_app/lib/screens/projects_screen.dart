import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class ProjectsScreen extends StatelessWidget {
  const ProjectsScreen({super.key});

  final List<Map<String, dynamic>> projects = const [
    {
      'id': 'vico',
      'title': 'Vico',
      'description': 'A comprehensive sports ecosystem platform designed to serve tennis players, coaches, referees, staff, and organizations. Built as a full-stack application combining Next.js web interface, Flutter mobile app, Prisma ORM backend, and gRPC communication.',
      'technologies': ['Next.js', 'Flutter', 'Prisma', 'PostgreSQL', 'gRPC', 'TypeScript'],
      'features': [
        'Multi-role authentication (Players, Coaches, Referees, Organizations)',
        'Club and organization management with RBAC',
        'Membership tiers and ranking system',
        'Tournament and event management',
        'Court booking and inventory tracking',
        'Real-time chat and analytics',
        'Financial accounting and gamification'
      ],
      'status': 'In Development',
      'github': 'https://github.com/kimaniwilfred95/payment-gateway',
      'demo': null
    },
    {
      'id': 'payledger',
      'title': 'PayLedger',
      'description': 'A comprehensive payment gateway supporting multiple providers including PayPal and Stripe with advanced features like idempotency, webhooks, and transaction management.',
      'technologies': ['TypeScript', 'Hono', 'Cloudflare Workers', 'Next.js', 'Tailwind CSS'],
      'features': [
        'Multi-provider payment processing',
        'Idempotent transactions',
        'Webhook handling',
        'Transaction history',
        'Real-time status updates'
      ],
      'status': 'Active',
      'github': 'https://github.com/kimaniwilfred95/payment-gateway',
      'demo': 'https://payment-gateway.kimaniwilfred95.workers.dev'
    },
    {
      'id': 'flutter-payment-app',
      'title': 'Flutter Payment App',
      'description': 'A mobile payment application built with Flutter, providing a seamless payment experience across different platforms.',
      'technologies': ['Flutter', 'Dart', 'Android', 'iOS'],
      'features': [
        'Cross-platform mobile app',
        'Payment integration',
        'Transaction tracking',
        'User authentication',
        'Offline support'
      ],
      'status': 'In Development',
      'github': 'https://github.com/kimaniwilfred95/payment-gateway',
      'demo': null
    },
    {
      'id': 'payment-analytics',
      'title': 'Payment Analytics Dashboard',
      'description': 'A comprehensive analytics platform for payment data visualization, reporting, and business intelligence.',
      'technologies': ['React', 'D3.js', 'Node.js', 'PostgreSQL'],
      'features': [
        'Real-time analytics',
        'Custom dashboards',
        'Export capabilities',
        'Multi-tenant support',
        'API integrations'
      ],
      'status': 'Planned',
      'github': null,
      'demo': null
    },
    {
      'id': 'crypto-payment-gateway',
      'title': 'Cryptocurrency Payment Gateway',
      'description': 'A payment gateway supporting various cryptocurrencies with automatic conversion and wallet management.',
      'technologies': ['Node.js', 'Web3.js', 'MongoDB', 'Express'],
      'features': [
        'Multi-crypto support',
        'Automatic conversion',
        'Wallet management',
        'Security features',
        'Transaction monitoring'
      ],
      'status': 'Research',
      'github': null,
      'demo': null
    },
    {
      'id': 'wilcache',
      'title': 'Wilcache',
      'description': 'A high-performance, multi-layered caching microservice designed for modern applications. It provides a simple HTTP(S) API for storing and retrieving cached data with advanced features like multi-tier caching, API key management, rate limiting, and automatic compression.',
      'technologies': ['Node.js', 'TypeScript', 'Redis', 'LevelDB', 'Fastify'],
      'features': [
        'Multi-tier caching (L1 memory, L2 Redis, persistent LevelDB)',
        'RESTful HTTP API with JSON support',
        'API key authentication and rate limiting',
        'Automatic data compression',
        'Hotkey detection and stale-while-revalidate',
        'Singleflight requests to prevent cache stampedes',
        'Admin endpoints for key management',
        'Comprehensive metrics and monitoring'
      ],
      'status': 'Active',
      'github': 'https://github.com/kimaniwilfred95/payment-gateway',
      'demo': null
    },
    {
      'id': 'kafka-notification-service',
      'title': 'Kafka Notification Service',
      'description': 'A comprehensive Docker-based notification service built with Node.js, TypeScript, and Kafka for handling real-time notifications across multiple channels including email, SMS, and more. It features robust integration with various providers, database persistence, caching, template rendering, and a REST API for seamless notification management.',
      'technologies': ['Node.js', 'TypeScript', 'Kafka', 'Docker', 'PostgreSQL', 'Redis'],
      'features': [
        'Kafka integration with producer and consumer implementations',
        'REST API with endpoints for single and batch notifications',
        'Multi-channel support (email, SMS, push, in-app, webhook)',
        'Integration with multiple email and SMS providers',
        'PostgreSQL database with connection pooling',
        'Redis-based caching with retry mechanisms',
        'Dynamic template rendering system',
        'Comprehensive logging with Winston',
        'Docker Compose setup with full containerization',
        'Swagger API documentation'
      ],
      'status': 'Active',
      'github': 'https://github.com/kimaniwilfred95/payment-gateway',
      'demo': null
    },
    {
      'id': 'anchor-routine',
      'title': 'Anchor Routine — Personal Productivity Dashboard',
      'description': 'A comprehensive personal productivity and routine management application built with Next.js, designed to help you maintain daily routines, track coding activities, manage notifications, and achieve your goals.',
      'technologies': ['Next.js', 'TypeScript', 'PostgreSQL', 'Prisma', 'Tailwind CSS', 'Docker'],
      'features': [
        'Routine management with customizable time blocks and strict mode',
        'Coding session tracking with language logging and achievement system',
        'Smart notifications via email and SMS with template customization',
        'Quick actions for frequent tasks with activity logging',
        'Note taking with rich coding notes and tagging system',
        'Activity analytics with weekly statistics and habit tracking',
        'Automated scheduling via cron jobs for timely reminders',
        'Docker containerization with docker-compose deployment'
      ],
      'status': 'Active',
      'github': 'https://github.com/kimaniwilfred95/payment-gateway',
      'demo': null
    }
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF0A0A0F),
              Color(0xFF1A1A1A),
            ],
          ),
        ),
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            children: [
              // Header
              Column(
                children: [
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        '◆',
                        style: TextStyle(
                          color: Color(0xFFC9A84C),
                          fontSize: 6,
                        ),
                      ),
                      SizedBox(width: 8),
                      Text(
                        'Portfolio',
                        style: TextStyle(
                          fontSize: 12,
                          color: Color(0xFFC9A84C),
                          letterSpacing: 2.5,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Other Projects',
                    style: TextStyle(
                      fontSize: 36,
                      fontWeight: FontWeight.w300,
                      color: Color(0xFFE0E0E0),
                      height: 0.9,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'A collection of software projects and applications I\'ve developed, showcasing various technologies and problem-solving approaches.',
                    style: TextStyle(
                      fontSize: 14,
                      color: Color(0xFFB0B0B0),
                      height: 1.5,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
              const SizedBox(height: 64),

              // Projects Grid
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 1,
                  crossAxisSpacing: 24,
                  mainAxisSpacing: 24,
                  mainAxisExtent: 500, // Fixed height for each card
                ),
                itemCount: projects.length,
                itemBuilder: (context, index) {
                  final project = projects[index];
                  return _buildProjectCard(context, project);
                },
              ),

              const SizedBox(height: 64),

              // Collaboration Section
              Column(
                children: [
                  const Text(
                    'Interested in Collaboration?',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w300,
                      color: Color(0xFFE0E0E0),
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'I\'m always open to discussing new projects, partnerships, or technical challenges. Whether you need custom software development, API integrations, or technical consulting, let\'s explore how we can work together.',
                    style: TextStyle(
                      fontSize: 14,
                      color: Color(0xFFB0B0B0),
                      height: 1.5,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 32),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      ElevatedButton(
                        onPressed: () {
                          // Navigate to integrations
                          Navigator.of(context).pushNamed('/integrations');
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFC9A84C),
                          foregroundColor: const Color(0xFF0A0A0F),
                          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.message, size: 16),
                            SizedBox(width: 8),
                            Text(
                              'Start a Project',
                              style: TextStyle(
                                fontSize: 12,
                                letterSpacing: 1.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 16),
                      TextButton(
                        onPressed: () {
                          Navigator.of(context).pop();
                        },
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.arrow_back,
                              color: Color(0xFFB0B0B0),
                              size: 16,
                            ),
                            SizedBox(width: 8),
                            Text(
                              'Back to Home',
                              style: TextStyle(
                                color: Color(0xFFB0B0B0),
                                fontSize: 12,
                                letterSpacing: 1.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProjectCard(BuildContext context, Map<String, dynamic> project) {
    return Container(
      height: 500, // Match GridView mainAxisExtent
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A1A),
        border: Border.all(color: const Color(0xFF404040)),
        borderRadius: BorderRadius.circular(4),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFC9A84C).withOpacity(0.08),
            blurRadius: 40,
            spreadRadius: 0,
            offset: const Offset(0, 40),
          ),
          BoxShadow(
            color: Colors.black.withOpacity(0.6),
            blurRadius: 80,
            spreadRadius: 0,
            offset: const Offset(0, 0),
          ),
          BoxShadow(
            color: const Color(0xFFC9A84C).withOpacity(0.04),
            blurRadius: 120,
            spreadRadius: 0,
            offset: const Offset(0, 0),
          ),
        ],
      ),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Title and Status
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Text(
                    project['title'],
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w300,
                      color: Color(0xFFE0E0E0),
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: _getStatusColor(project['status']).withOpacity(0.2),
                    border: Border.all(color: _getStatusColor(project['status']).withOpacity(0.3)),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    project['status'],
                    style: TextStyle(
                      fontSize: 10,
                      color: _getStatusColor(project['status']),
                      letterSpacing: 1,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Description
            Text(
              project['description'],
              style: const TextStyle(
                fontSize: 14,
                color: Color(0xFFB0B0B0),
                height: 1.5,
              ),
            ),
            const SizedBox(height: 24),

            // Technologies
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Technologies',
                  style: TextStyle(
                    fontSize: 12,
                    color: Color(0xFFC9A84C),
                    letterSpacing: 2,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: (project['technologies'] as List<String>).map((tech) {
                    return Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFF2A2A2A),
                        border: Border.all(color: const Color(0xFF404040)),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        tech,
                        style: const TextStyle(
                          fontSize: 10,
                          color: Color(0xFFB0B0B0),
                          fontFamily: 'monospace',
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Features
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Key Features',
                  style: TextStyle(
                    fontSize: 12,
                    color: Color(0xFFC9A84C),
                    letterSpacing: 2,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 12),
                Column(
                  children: (project['features'] as List<String>).map((feature) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            '•',
                            style: TextStyle(
                              color: Color(0xFFC9A84C),
                              fontSize: 12,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              feature,
                              style: const TextStyle(
                                fontSize: 12,
                                color: Color(0xFFB0B0B0),
                                height: 1.4,
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Links
            Wrap(
              spacing: 16,
              runSpacing: 8,
              children: [
                if (project['github'] != null)
                  TextButton(
                    onPressed: () => _launchUrl(project['github']),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.code,
                          color: Color(0xFFC9A84C),
                          size: 16,
                        ),
                        SizedBox(width: 8),
                        Text(
                          'View Code',
                          style: TextStyle(
                            fontSize: 12,
                            color: Color(0xFFC9A84C),
                            letterSpacing: 1.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                if (project['demo'] != null)
                  TextButton(
                    onPressed: () => _launchUrl(project['demo']),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.launch,
                          color: Color(0xFFC9A84C),
                          size: 16,
                        ),
                        SizedBox(width: 8),
                        Text(
                          'Live Demo',
                          style: TextStyle(
                            fontSize: 12,
                            color: Color(0xFFC9A84C),
                            letterSpacing: 1.5,
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'Active':
        return Colors.green;
      case 'In Development':
        return Colors.yellow;
      case 'Planned':
        return Colors.blue;
      case 'Research':
        return Colors.grey;
      default:
        return Colors.grey;
    }
  }

  Future<void> _launchUrl(String url) async {
    if (await canLaunch(url)) {
      await launch(url);
    }
  }
}
