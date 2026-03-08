import 'package:flutter/material.dart';

class PaymentScreen extends StatelessWidget {
  const PaymentScreen({super.key});

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
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
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
                          'Choose Payment Method',
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
                      'Select Your\nPayment Gateway',
                      style: TextStyle(
                        fontSize: 36,
                        fontWeight: FontWeight.w300,
                        color: Color(0xFFE0E0E0),
                        height: 0.9,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
                const SizedBox(height: 64),

                // Payment Method Cards
                Row(
                  children: [
                    // PayPal Card
                    Expanded(
                      child: _buildPaymentCard(
                        context: context,
                        icon: Icons.paypal,
                        iconColor: const Color(0xFF0070BA),
                        title: 'PayPal',
                        description: 'Secure payment processing through PayPal. Pay with your PayPal account or credit card.',
                        onTap: () {
                          Navigator.of(context).pushNamed('/paypal');
                        },
                      ),
                    ),
                    const SizedBox(width: 24),

                    // Stripe Card
                    Expanded(
                      child: _buildPaymentCard(
                        context: context,
                        icon: Icons.credit_card,
                        iconColor: const Color(0xFF635BFF),
                        title: 'Stripe',
                        description: 'Fast and secure credit card payments powered by Stripe. Supports all major cards.',
                        onTap: () {
                          Navigator.of(context).pushNamed('/stripe');
                        },
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 48),

                // Back to Home
                TextButton(
                  onPressed: () {
                    // Navigate back to home (transactions)
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
          ),
        ),
      ),
    );
  }

  Widget _buildPaymentCard({
    required BuildContext context,
    required IconData icon,
    required Color iconColor,
    required String title,
    required String description,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
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
        child: Column(
          children: [
            // Icon
            Container(
              width: 48,
              height: 48,
              margin: const EdgeInsets.only(bottom: 24),
              child: Icon(
                icon,
                color: iconColor,
                size: 48,
              ),
            ),

            // Title
            Text(
              title,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w300,
                color: Color(0xFFE0E0E0),
              ),
            ),
            const SizedBox(height: 16),

            // Description
            Text(
              description,
              style: const TextStyle(
                fontSize: 14,
                color: Color(0xFFB0B0B0),
                height: 1.5,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),

            // CTA
            Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  'Proceed with $title',
                  style: const TextStyle(
                    fontSize: 12,
                    color: Color(0xFFE8C97A),
                    letterSpacing: 1.5,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 4),
                Icon(
                  Icons.arrow_forward,
                  color: const Color(0xFFE8C97A),
                  size: 16,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}