import 'package:flutter/material.dart';

class PaymentSuccessScreen extends StatelessWidget {
  final String? transactionId;
  final String? orderId;
  final String? sessionId;

  const PaymentSuccessScreen({
    super.key,
    this.transactionId,
    this.orderId,
    this.sessionId,
  });

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
                          color: const Color(0xFFC9A84C),
                          margin: const EdgeInsets.only(bottom: 16),
                        ),
                        const Row(
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
                              'Payment Successful',
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
                          'Payment\nCompleted',
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
                        // Success Icon
                        Container(
                          width: 64,
                          height: 64,
                          decoration: BoxDecoration(
                            color: const Color(0xFFC9A84C).withOpacity(0.1),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.check_circle,
                            color: Color(0xFFC9A84C),
                            size: 32,
                          ),
                        ),
                        const SizedBox(height: 24),

                        // Success Message
                        const Text(
                          'Your payment has been processed successfully!',
                          style: TextStyle(
                            fontSize: 16,
                            color: Color(0xFFE0E0E0),
                            height: 1.5,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 16),

                        // Transaction Details
                        if (transactionId != null || orderId != null || sessionId != null) ...[
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: const Color(0xFF252525),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: const Color(0xFF404040)),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Transaction Details',
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w500,
                                    color: Color(0xFFE0E0E0),
                                  ),
                                ),
                                const SizedBox(height: 8),
                                if (transactionId != null)
                                  Text(
                                    'Transaction ID: $transactionId',
                                    style: const TextStyle(
                                      fontSize: 12,
                                      color: Color(0xFFB0B0B0),
                                      fontFamily: 'monospace',
                                    ),
                                  ),
                                if (orderId != null)
                                  Text(
                                    'Order ID: $orderId',
                                    style: const TextStyle(
                                      fontSize: 12,
                                      color: Color(0xFFB0B0B0),
                                      fontFamily: 'monospace',
                                    ),
                                  ),
                                if (sessionId != null)
                                  Text(
                                    'Session ID: $sessionId',
                                    style: const TextStyle(
                                      fontSize: 12,
                                      color: Color(0xFFB0B0B0),
                                      fontFamily: 'monospace',
                                    ),
                                  ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 24),
                        ],

                        // Action Buttons
                        Row(
                          children: [
                            Expanded(
                              child: OutlinedButton(
                                onPressed: () {
                                  Navigator.of(context).pushNamedAndRemoveUntil(
                                    '/',
                                    (route) => false,
                                  );
                                },
                                style: OutlinedButton.styleFrom(
                                  side: const BorderSide(color: Color(0xFF404040)),
                                  padding: const EdgeInsets.symmetric(vertical: 12),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                ),
                                child: const Text(
                                  'View Transactions',
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
                                child: const Text('Make Another Payment'),
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
