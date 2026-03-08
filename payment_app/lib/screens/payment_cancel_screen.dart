import 'package:flutter/material.dart';

class PaymentCancelScreen extends StatelessWidget {
  const PaymentCancelScreen({super.key});

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
            child: Container(
              constraints: const BoxConstraints(maxWidth: 460),
              decoration: BoxDecoration(
                color: const Color(0xFF1A1A1A),
                border: Border.all(color: const Color(0xFF404040)),
                borderRadius: BorderRadius.circular(4),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFFFF6B6B).withOpacity(0.08),
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
                    color: const Color(0xFFFF6B6B).withOpacity(0.04),
                    blurRadius: 120,
                    spreadRadius: 0,
                    offset: const Offset(0, 0),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  Container(
                    padding: const EdgeInsets.all(40),
                    decoration: const BoxDecoration(
                      border: Border(
                        bottom: BorderSide(color: Color(0xFF404040)),
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: 48,
                          height: 1,
                          color: const Color(0xFFFF6B6B),
                          margin: const EdgeInsets.only(bottom: 16),
                        ),
                        const Row(
                          children: [
                            Text(
                              '◆',
                              style: TextStyle(
                                color: Color(0xFFFF6B6B),
                                fontSize: 6,
                              ),
                            ),
                            SizedBox(width: 8),
                            Text(
                              'Payment Cancelled',
                              style: TextStyle(
                                fontSize: 12,
                                color: Color(0xFFFF6B6B),
                                letterSpacing: 2.5,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'Payment\nCancelled',
                          style: TextStyle(
                            fontSize: 36,
                            fontWeight: FontWeight.w300,
                            color: Color(0xFFE0E0E0),
                            height: 0.9,
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Content
                  Padding(
                    padding: const EdgeInsets.all(40),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        // Cancel Icon
                        Container(
                          width: 64,
                          height: 64,
                          decoration: BoxDecoration(
                            color: const Color(0xFFFF6B6B).withOpacity(0.1),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.cancel,
                            color: Color(0xFFFF6B6B),
                            size: 32,
                          ),
                        ),
                        const SizedBox(height: 24),

                        // Cancel Message
                        const Text(
                          'Your payment has been cancelled. No charges have been made to your account.',
                          style: TextStyle(
                            fontSize: 16,
                            color: Color(0xFFE0E0E0),
                            height: 1.5,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 24),

                        // Action Buttons
                        Row(
                          children: [
                            Expanded(
                              child: OutlinedButton(
                                onPressed: () {
                                  Navigator.of(context).pop();
                                },
                                style: OutlinedButton.styleFrom(
                                  side: const BorderSide(color: Color(0xFF404040)),
                                  padding: const EdgeInsets.symmetric(vertical: 12),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                ),
                                child: const Text(
                                  'Back to Payment',
                                  style: TextStyle(
                                    color: Color(0xFFE0E0E0),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: ElevatedButton(
                                onPressed: () {
                                  Navigator.of(context).pushNamedAndRemoveUntil(
                                    '/payment',
                                    (route) => false,
                                  );
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFFC9A84C),
                                  foregroundColor: const Color(0xFF0A0A0F),
                                  padding: const EdgeInsets.symmetric(vertical: 12),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                ),
                                child: const Text('Try Again'),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
