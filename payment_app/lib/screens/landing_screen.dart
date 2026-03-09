import 'package:flutter/material.dart';
import 'dart:async';

class TypewriterLine {
  final String id;
  final String text;
  final TextStyle style;
  final bool prompt;
  final int speed;
  final int? delay;

  TypewriterLine({
    required this.id,
    required this.text,
    required this.style,
    required this.prompt,
    required this.speed,
    this.delay,
  });
}

class LandingScreen extends StatefulWidget {
  const LandingScreen({super.key});

  @override
  State<LandingScreen> createState() => _LandingScreenState();
}

class _LandingScreenState extends State<LandingScreen> with TickerProviderStateMixin {
  final List<TypewriterLine> script = [
    TypewriterLine(
      id: 'init',
      text: 'initializing...',
      style: const TextStyle(color: Color(0xFF6B7280), fontSize: 12, fontFamily: 'monospace'),
      prompt: true,
      speed: 22,
    ),
    TypewriterLine(
      id: 'spacer1',
      text: '',
      style: const TextStyle(),
      prompt: false,
      speed: 0,
      delay: 120,
    ),
    TypewriterLine(
      id: 'hello',
      text: 'HELLO, WORLD.',
      style: const TextStyle(
        color: Color(0xFF4ADE80),
        fontSize: 10,
        fontFamily: 'monospace',
        fontWeight: FontWeight.w500,
        letterSpacing: 2,
      ),
      prompt: true,
      speed: 45,
    ),
    TypewriterLine(
      id: 'spacer2',
      text: '',
      style: const TextStyle(),
      prompt: false,
      speed: 0,
      delay: 180,
    ),
    TypewriterLine(
      id: 'name',
      text: 'I am engineer Wilfred.',
      style: const TextStyle(
        color: Color(0xFFC9A84C),
        fontSize: 18,
        fontFamily: 'monospace',
        fontWeight: FontWeight.bold,
        letterSpacing: 1.5,
      ),
      prompt: true,
      speed: 60,
      delay: 200,
    ),
    TypewriterLine(
      id: 'spacer3',
      text: '',
      style: const TextStyle(),
      prompt: false,
      speed: 0,
      delay: 120,
    ),
    TypewriterLine(
      id: 'bio1',
      text: 'Backend Systems Engineer.',
      style: const TextStyle(
        color: Color(0xFFE0E0E0),
        fontSize: 14,
        fontFamily: 'monospace',
        height: 1.4,
      ),
      prompt: true,
      speed: 38,
    ),
    TypewriterLine(
      id: 'bio2',
      text: 'Building secure, scalable financial infrastructure.',
      style: const TextStyle(
        color: Color(0xFFE0E0E0),
        fontSize: 14,
        fontFamily: 'monospace',
        height: 1.4,
      ),
      prompt: true,
      speed: 38,
    ),
    TypewriterLine(
      id: 'bio3',
      text: 'Expert in modern backend technologies and cloud architecture.',
      style: const TextStyle(
        color: Color(0xFFE0E0E0),
        fontSize: 14,
        fontFamily: 'monospace',
        height: 1.4,
      ),
      prompt: true,
      speed: 38,
    ),
    TypewriterLine(
      id: 'spacer4',
      text: '',
      style: const TextStyle(),
      prompt: false,
      speed: 0,
      delay: 180,
    ),
    TypewriterLine(
      id: 'separator1',
      text: '─────────────────────────────────────────',
      style: const TextStyle(color: Color(0xFF374151), fontFamily: 'monospace'),
      prompt: true,
      speed: 8,
    ),
    TypewriterLine(
      id: 'spacer5',
      text: '',
      style: const TextStyle(),
      prompt: false,
      speed: 0,
      delay: 120,
    ),
    TypewriterLine(
      id: 'project',
      text: 'this is app and web app called pay',
      style: const TextStyle(
        color: Color(0xFF4ADE80),
        fontSize: 10,
        fontFamily: 'monospace',
        fontWeight: FontWeight.w500,
        letterSpacing: 2,
      ),
      prompt: true,
      speed: 35,
    ),
    TypewriterLine(
      id: 'spacer6',
      text: '',
      style: const TextStyle(),
      prompt: false,
      speed: 0,
      delay: 80,
    ),
    TypewriterLine(
      id: 'project_desc1',
      text: 'A comprehensive payment processing platform',
      style: const TextStyle(
        color: Color(0xFFE0E0E0),
        fontSize: 14,
        fontFamily: 'monospace',
        height: 1.4,
      ),
      prompt: true,
      speed: 36,
    ),
    TypewriterLine(
      id: 'project_desc2',
      text: 'with mobile app and web interface',
      style: const TextStyle(
        color: Color(0xFFE0E0E0),
        fontSize: 14,
        fontFamily: 'monospace',
        height: 1.4,
      ),
      prompt: true,
      speed: 36,
    ),
    TypewriterLine(
      id: 'project_desc3',
      text: 'built for seamless financial transactions.',
      style: const TextStyle(
        color: Color(0xFFE0E0E0),
        fontSize: 14,
        fontFamily: 'monospace',
        height: 1.4,
      ),
      prompt: true,
      speed: 36,
    ),
    TypewriterLine(
      id: 'spacer7',
      text: '',
      style: const TextStyle(),
      prompt: false,
      speed: 0,
      delay: 180,
    ),
    TypewriterLine(
      id: 'what_it_does',
      text: 'What it does:',
      style: const TextStyle(
        color: Color(0xFF4ADE80),
        fontSize: 10,
        fontFamily: 'monospace',
        fontWeight: FontWeight.w500,
        letterSpacing: 2,
      ),
      prompt: true,
      speed: 40,
    ),
    TypewriterLine(
      id: 'feature1',
      text: 'Dual payment gateways — Stripe & PayPal integration',
      style: const TextStyle(
        color: Color(0xFFE0E0E0),
        fontSize: 14,
        fontFamily: 'monospace',
        height: 1.4,
      ),
      prompt: false,
      speed: 28,
    ),
    TypewriterLine(
      id: 'feature2',
      text: 'Multi-currency support: USD, EUR, GBP, KES, and more',
      style: const TextStyle(
        color: Color(0xFFE0E0E0),
        fontSize: 14,
        fontFamily: 'monospace',
        height: 1.4,
      ),
      prompt: false,
      speed: 28,
    ),
    TypewriterLine(
      id: 'feature3',
      text: 'Real-time transaction monitoring and analytics',
      style: const TextStyle(
        color: Color(0xFFE0E0E0),
        fontSize: 14,
        fontFamily: 'monospace',
        height: 1.4,
      ),
      prompt: false,
      speed: 28,
    ),
    TypewriterLine(
      id: 'feature4',
      text: 'Advanced filtering by gateway, status, date & amount',
      style: const TextStyle(
        color: Color(0xFFE0E0E0),
        fontSize: 14,
        fontFamily: 'monospace',
        height: 1.4,
      ),
      prompt: false,
      speed: 28,
    ),
    TypewriterLine(
      id: 'feature5',
      text: 'Mobile-first responsive design across all devices',
      style: const TextStyle(
        color: Color(0xFFE0E0E0),
        fontSize: 14,
        fontFamily: 'monospace',
        height: 1.4,
      ),
      prompt: false,
      speed: 28,
    ),
    TypewriterLine(
      id: 'feature6',
      text: 'Secure webhook handling and payment verification',
      style: const TextStyle(
        color: Color(0xFFE0E0E0),
        fontSize: 14,
        fontFamily: 'monospace',
        height: 1.4,
      ),
      prompt: false,
      speed: 28,
    ),
    TypewriterLine(
      id: 'feature7',
      text: 'RESTful API for seamless third-party integrations',
      style: const TextStyle(
        color: Color(0xFFE0E0E0),
        fontSize: 14,
        fontFamily: 'monospace',
        height: 1.4,
      ),
      prompt: false,
      speed: 28,
    ),
    TypewriterLine(
      id: 'feature8',
      text: 'SMS notifications and email confirmations',
      style: const TextStyle(
        color: Color(0xFFE0E0E0),
        fontSize: 14,
        fontFamily: 'monospace',
        height: 1.4,
      ),
      prompt: false,
      speed: 28,
    ),
    TypewriterLine(
      id: 'spacer8',
      text: '',
      style: const TextStyle(),
      prompt: false,
      speed: 0,
      delay: 180,
    ),
    TypewriterLine(
      id: 'stack',
      text: 'Technology Stack:',
      style: const TextStyle(
        color: Color(0xFF4ADE80),
        fontSize: 10,
        fontFamily: 'monospace',
        fontWeight: FontWeight.w500,
        letterSpacing: 2,
      ),
      prompt: true,
      speed: 40,
    ),
    TypewriterLine(
      id: 'stack1',
      text: 'Frontend: Next.js 14, TypeScript, Tailwind CSS, React',
      style: const TextStyle(
        color: Color(0xFFE0E0E0),
        fontSize: 14,
        fontFamily: 'monospace',
        height: 1.4,
      ),
      prompt: false,
      speed: 30,
    ),
    TypewriterLine(
      id: 'stack2',
      text: 'Backend: Cloudflare Workers, Node.js, Express',
      style: const TextStyle(
        color: Color(0xFFE0E0E0),
        fontSize: 14,
        fontFamily: 'monospace',
        height: 1.4,
      ),
      prompt: false,
      speed: 30,
    ),
    TypewriterLine(
      id: 'stack3',
      text: 'Payments: Stripe SDK, PayPal SDK, Webhooks',
      style: const TextStyle(
        color: Color(0xFFE0E0E0),
        fontSize: 14,
        fontFamily: 'monospace',
        height: 1.4,
      ),
      prompt: false,
      speed: 30,
    ),
    TypewriterLine(
      id: 'stack4',
      text: 'Database: PostgreSQL, Prisma ORM, Migrations',
      style: const TextStyle(
        color: Color(0xFFE0E0E0),
        fontSize: 14,
        fontFamily: 'monospace',
        height: 1.4,
      ),
      prompt: false,
      speed: 30,
    ),
    TypewriterLine(
      id: 'stack5',
      text: 'Mobile: Flutter, Dart, Android/iOS deployment',
      style: const TextStyle(
        color: Color(0xFFE0E0E0),
        fontSize: 14,
        fontFamily: 'monospace',
        height: 1.4,
      ),
      prompt: false,
      speed: 30,
    ),
    TypewriterLine(
      id: 'spacer9',
      text: '',
      style: const TextStyle(),
      prompt: false,
      speed: 0,
      delay: 180,
    ),
    TypewriterLine(
      id: 'separator2',
      text: '─────────────────────────────────────────',
      style: const TextStyle(color: Color(0xFF374151), fontFamily: 'monospace'),
      prompt: true,
      speed: 8,
    ),
    TypewriterLine(
      id: 'spacer10',
      text: '',
      style: const TextStyle(),
      prompt: false,
      speed: 0,
      delay: 120,
    ),
    TypewriterLine(
      id: 'philosophy',
      text: '[ PHILOSOPHY ]',
      style: const TextStyle(
        color: Color(0xFF4ADE80),
        fontSize: 10,
        fontFamily: 'monospace',
        fontWeight: FontWeight.w500,
        letterSpacing: 2,
      ),
      prompt: true,
      speed: 40,
    ),
    TypewriterLine(
      id: 'philosophy1',
      text: 'Payments are trust made tangible.',
      style: const TextStyle(
        color: Color(0xFFE0E0E0),
        fontSize: 14,
        fontFamily: 'monospace',
        height: 1.4,
      ),
      prompt: true,
      speed: 40,
    ),
    TypewriterLine(
      id: 'philosophy2',
      text: 'Every transaction is a promise kept — or broken.',
      style: const TextStyle(
        color: Color(0xFFE0E0E0),
        fontSize: 14,
        fontFamily: 'monospace',
        height: 1.4,
      ),
      prompt: true,
      speed: 40,
    ),
    TypewriterLine(
      id: 'philosophy3',
      text: 'This platform is built to keep promises.',
      style: const TextStyle(
        color: Color(0xFFE0E0E0),
        fontSize: 14,
        fontFamily: 'monospace',
        height: 1.4,
      ),
      prompt: true,
      speed: 40,
    ),
    TypewriterLine(
      id: 'philosophy4',
      text: 'Security first. Performance always. Trust forever.',
      style: const TextStyle(
        color: Color(0xFFE0E0E0),
        fontSize: 14,
        fontFamily: 'monospace',
        height: 1.4,
      ),
      prompt: true,
      speed: 40,
    ),
    TypewriterLine(
      id: 'spacer11',
      text: '',
      style: const TextStyle(),
      prompt: false,
      speed: 0,
      delay: 180,
    ),
    TypewriterLine(
      id: 'separator3',
      text: '─────────────────────────────────────────',
      style: const TextStyle(color: Color(0xFF374151), fontFamily: 'monospace'),
      prompt: true,
      speed: 8,
    ),
    TypewriterLine(
      id: 'spacer12',
      text: '',
      style: const TextStyle(),
      prompt: false,
      speed: 0,
      delay: 120,
    ),
    TypewriterLine(
      id: 'stats',
      text: '[ STATISTICS ]',
      style: const TextStyle(
        color: Color(0xFF4ADE80),
        fontSize: 10,
        fontFamily: 'monospace',
        fontWeight: FontWeight.w500,
        letterSpacing: 2,
      ),
      prompt: true,
      speed: 40,
    ),
    TypewriterLine(
      id: 'stat1',
      text: 'Transactions processed: 10,000+',
      style: const TextStyle(
        color: Color(0xFFE0E0E0),
        fontSize: 14,
        fontFamily: 'monospace',
        height: 1.4,
      ),
      prompt: true,
      speed: 35,
    ),
    TypewriterLine(
      id: 'stat2',
      text: 'Uptime: 99.9% availability',
      style: const TextStyle(
        color: Color(0xFFE0E0E0),
        fontSize: 14,
        fontFamily: 'monospace',
        height: 1.4,
      ),
      prompt: true,
      speed: 35,
    ),
    TypewriterLine(
      id: 'stat3',
      text: 'Supported currencies: 15+',
      style: const TextStyle(
        color: Color(0xFFE0E0E0),
        fontSize: 14,
        fontFamily: 'monospace',
        height: 1.4,
      ),
      prompt: true,
      speed: 35,
    ),
    TypewriterLine(
      id: 'stat4',
      text: 'Active users: 500+',
      style: const TextStyle(
        color: Color(0xFFE0E0E0),
        fontSize: 14,
        fontFamily: 'monospace',
        height: 1.4,
      ),
      prompt: true,
      speed: 35,
    ),
    TypewriterLine(
      id: 'spacer13',
      text: '',
      style: const TextStyle(),
      prompt: false,
      speed: 0,
      delay: 180,
    ),
    TypewriterLine(
      id: 'separator4',
      text: '─────────────────────────────────────────',
      style: const TextStyle(color: Color(0xFF374151), fontFamily: 'monospace'),
      prompt: true,
      speed: 8,
    ),
    TypewriterLine(
      id: 'spacer14',
      text: '',
      style: const TextStyle(),
      prompt: false,
      speed: 0,
      delay: 120,
    ),
    TypewriterLine(
      id: 'status',
      text: '[ STATUS ] ready.',
      style: const TextStyle(
        color: Color(0xFF4ADE80),
        fontSize: 10,
        fontFamily: 'monospace',
        fontWeight: FontWeight.w500,
        letterSpacing: 2,
      ),
      prompt: true,
      speed: 45,
    ),
    TypewriterLine(
      id: 'spacer15',
      text: '',
      style: const TextStyle(),
      prompt: false,
      speed: 0,
      delay: 200,
    ),
    TypewriterLine(
      id: 'cursor',
      text: '_',
      style: const TextStyle(color: Color(0xFF374151), fontFamily: 'monospace'),
      prompt: true,
      speed: 80,
    ),
  ];

  Map<String, String> displayedLines = {};
  int currentLineIndex = 0;
  int currentCharIndex = 0;
  bool isTyping = false;
  bool showNavigation = false;
  Timer? typingTimer;
  late AnimationController _scanLineController;
  late Animation<double> _scanLineAnimation;

  @override
  void initState() {
    super.initState();
    _scanLineController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    )..repeat(reverse: true);

    _scanLineAnimation = Tween<double>(
      begin: -10.0,
      end: MediaQuery.of(context).size.height,
    ).animate(CurvedAnimation(
      parent: _scanLineController,
      curve: Curves.easeInOut,
    ));

    startTyping();
  }

  @override
  void dispose() {
    typingTimer?.cancel();
    _scanLineController.dispose();
    super.dispose();
  }

  void startTyping() {
    if (currentLineIndex >= script.length) {
      setState(() {
        showNavigation = true;
      });
      return;
    }

    final currentLine = script[currentLineIndex];

    if (currentLine.text.isEmpty) {
      // Spacer line
      Future.delayed(Duration(milliseconds: currentLine.delay ?? 120), () {
        setState(() {
          currentLineIndex++;
          currentCharIndex = 0;
        });
        startTyping();
      });
      return;
    }

    if (currentCharIndex < currentLine.text.length) {
      setState(() {
        isTyping = true;
      });

      typingTimer = Timer(Duration(milliseconds: currentLine.speed), () {
        setState(() {
          final newText = currentLine.text.substring(0, currentCharIndex + 1);
          displayedLines[currentLine.id] = newText;
          currentCharIndex++;
        });
        startTyping();
      });
    } else {
      // Line completed
      setState(() {
        isTyping = false;
      });
      Future.delayed(Duration(milliseconds: currentLine.delay ?? 180), () {
        setState(() {
          currentLineIndex++;
          currentCharIndex = 0;
        });
        startTyping();
      });
    }
  }

  Widget buildLine(TypewriterLine line) {
    if (line.text.isEmpty) {
      return const SizedBox(height: 24);
    }

    final displayedText = displayedLines[line.id] ?? '';
    final isCurrentLine = currentLineIndex == script.indexOf(line) && isTyping;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (line.prompt)
            Text(
              '▸',
              style: TextStyle(
                color: const Color(0xFFC9A84C),
                fontSize: 14,
                fontFamily: 'monospace',
              ),
            )
          else
            Padding(
              padding: const EdgeInsets.only(left: 16),
              child: Text(
                '▸',
                style: TextStyle(
                  color: const Color(0xFF6B7280),
                  fontSize: 14,
                  fontFamily: 'monospace',
                ),
              ),
            ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              '$displayedText${isCurrentLine ? '|' : ''}',
              style: line.style,
              textAlign: TextAlign.center,
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0F),
      body: Stack(
        children: [
          // Scanlines background
          Positioned.fill(
            child: Opacity(
              opacity: 0.05,
              child: CustomPaint(
                painter: ScanlinesPainter(),
              ),
            ),
          ),

          // Blue scan line
          AnimatedBuilder(
            animation: _scanLineAnimation,
            builder: (context, child) {
              return Positioned(
                left: 0,
                right: 0,
                top: _scanLineAnimation.value,
                height: 4,
                child: Container(
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [
                        Colors.transparent,
                        Color(0xFF3B82F6),
                        Color(0xFF1D4ED8),
                        Color(0xFF2563EB),
                        Color(0xFF3B82F6),
                        Colors.transparent,
                      ],
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF3B82F6).withOpacity(1.0),
                        blurRadius: 30,
                        spreadRadius: 0,
                      ),
                      BoxShadow(
                        color: const Color(0xFF3B82F6).withOpacity(0.6),
                        blurRadius: 60,
                        spreadRadius: 0,
                      ),
                      BoxShadow(
                        color: const Color(0xFF3B82F6).withOpacity(0.3),
                        blurRadius: 100,
                        spreadRadius: 0,
                      ),
                    ],
                  ),
                ),
              );
            },
          ),

          // Main content
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
              child: Column(
                children: [
                  // Terminal lines
                  ...script.map(buildLine),

                  // Navigation (shown after typing completes)
                  if (showNavigation) ...[
                    const SizedBox(height: 32),

                    // Top Navigation - Dashboard & Integrations (Mobile only)
                    if (MediaQuery.of(context).size.width < 600) ...[
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          _buildNavButton(
                            icon: '📊',
                            label: 'Dashboard',
                            onTap: () => Navigator.pushNamed(context, '/dashboard'),
                          ),
                          _buildNavButton(
                            icon: '🔗',
                            label: 'Integrations',
                            onTap: () => Navigator.pushNamed(context, '/integrations'),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                    ],

                    // Main navigation links
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          '▸',
                          style: TextStyle(
                            color: const Color(0xFFC9A84C),
                            fontSize: 14,
                            fontFamily: 'monospace',
                          ),
                        ),
                        const SizedBox(width: 8),
                        Wrap(
                          alignment: WrapAlignment.center,
                          spacing: 16,
                          runSpacing: 8,
                          children: [
                            if (MediaQuery.of(context).size.width >= 600)
                              _buildNavLink('dashboard', () => Navigator.pushNamed(context, '/dashboard')),
                            _buildNavLink('pay_stripe', () => Navigator.pushNamed(context, '/stripe')),
                            _buildNavLink('pay_paypal', () => Navigator.pushNamed(context, '/paypal')),
                            if (MediaQuery.of(context).size.width >= 600)
                              _buildNavLink('integrations', () => Navigator.pushNamed(context, '/integrations')),
                          ],
                        ),
                      ],
                    ),

                    // Bottom Navigation - Payment Methods (Mobile only)
                    if (MediaQuery.of(context).size.width < 600) ...[
                      const SizedBox(height: 24),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          _buildNavButton(
                            icon: '💳',
                            label: 'Stripe',
                            onTap: () => Navigator.pushNamed(context, '/stripe'),
                            highlighted: true,
                          ),
                          _buildNavButton(
                            icon: '💰',
                            label: 'PayPal',
                            onTap: () => Navigator.pushNamed(context, '/paypal'),
                          ),
                        ],
                      ),
                    ],

                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          '▸',
                          style: TextStyle(
                            color: const Color(0xFF6B7280),
                            fontSize: 14,
                            fontFamily: 'monospace',
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          '_',
                          style: TextStyle(
                            color: Color(0xFF6B7280),
                            fontFamily: 'monospace',
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNavLink(String text, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Text(
        text,
        style: const TextStyle(
          color: Color(0xFFC9A84C),
          fontSize: 12,
          fontFamily: 'monospace',
          decoration: TextDecoration.underline,
        ),
      ),
    );
  }

  Widget _buildNavButton({
    required String icon,
    required String label,
    required VoidCallback onTap,
    bool highlighted = false,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(
                color: const Color(0xFFC9A84C).withOpacity(0.3),
              ),
              color: highlighted ? const Color(0xFFC9A84C).withOpacity(0.1) : null,
            ),
            child: Center(
              child: Text(
                icon,
                style: const TextStyle(fontSize: 16),
              ),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              color: const Color(0xFFC9A84C),
              fontSize: 10,
              fontFamily: 'monospace',
              fontWeight: highlighted ? FontWeight.w600 : FontWeight.normal,
              letterSpacing: 1,
            ),
          ),
        ],
      ),
    );
  }
}