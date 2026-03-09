import 'package:flutter/material.dart';

class PaymentScreen extends StatefulWidget {
  const PaymentScreen({super.key});

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  double amount = 10.0;
  String currency = 'usd';
  String paymentMethod = 'stripe';
  String? message;
  bool isProcessing = false;

  final Map<String, String> currencySymbols = {
    'usd': '\$',
    'eur': '€',
    'gbp': '£',
  };

  void _handlePayment() async {
    setState(() {
      isProcessing = true;
      message = null;
    });

    try {
      // Navigate to the appropriate payment screen
      if (paymentMethod == 'stripe') {
        Navigator.pushNamed(
          context,
          '/stripe',
          arguments: {'amount': amount, 'currency': currency},
        );
      } else {
        Navigator.pushNamed(
          context,
          '/paypal',
          arguments: {'amount': amount, 'currency': currency},
        );
      }
    } catch (e) {
      setState(() {
        message = 'Payment failed: $e';
        isProcessing = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF0A0A0F), Color(0xFF1A1A1A)],
          ),
        ),
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Container(
              constraints: const BoxConstraints(maxWidth: 460),
              padding: const EdgeInsets.all(32.0),
              decoration: BoxDecoration(
                color: const Color(0xFF12151F),
                border: Border.all(color: const Color(0xFF404040)),
                borderRadius: BorderRadius.circular(4),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFFC9A84C).withOpacity(0.08),
                    blurRadius: 40,
                    offset: const Offset(0, 40),
                  ),
                  BoxShadow(
                    color: Colors.black.withOpacity(0.6),
                    blurRadius: 80,
                    offset: const Offset(0, 0),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  Container(
                    paddingBottom: 24,
                    decoration: const BoxDecoration(
                      border: Border(
                        bottom: BorderSide(color: Color(0xFF404040)),
                      ),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 12,
                          height: 1,
                          color: const Color(0xFFC9A84C),
                        ),
                        const SizedBox(width: 12),
                        const Text(
                          'SECURE CHECKOUT',
                          style: TextStyle(
                            fontSize: 12,
                            color: Color(0xFFC9A84C),
                            letterSpacing: 2.5,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 8),

                  const Text(
                    'Make a\nPayment',
                    style: TextStyle(
                      fontSize: 36,
                      fontWeight: FontWeight.w300,
                      color: Color(0xFFE0E0E0),
                      height: 0.9,
                    ),
                  ),

                  const SizedBox(height: 32),

                  // Amount Input
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Amount',
                        style: TextStyle(
                          fontSize: 12,
                          color: Color(0xFFE0E0E0),
                          letterSpacing: 2,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        decoration: BoxDecoration(
                          border: Border.all(color: const Color(0xFF404040)),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                              decoration: const BoxDecoration(
                                border: Border(
                                  right: BorderSide(color: Color(0xFF404040)),
                                ),
                              ),
                              child: Text(
                                currencySymbols[currency] ?? '\$',
                                style: const TextStyle(
                                  color: Color(0xFFC9A84C),
                                  fontSize: 18,
                                  fontWeight: FontWeight.w300,
                                ),
                              ),
                            ),
                            Expanded(
                              child: TextField(
                                keyboardType: TextInputType.number,
                                style: const TextStyle(
                                  color: Color(0xFFE0E0E0),
                                  fontSize: 18,
                                  fontWeight: FontWeight.w300,
                                ),
                                decoration: const InputDecoration(
                                  border: InputBorder.none,
                                  contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                  hintText: '0.00',
                                  hintStyle: TextStyle(
                                    color: Color(0xFF7A7A8A),
                                    fontSize: 18,
                                  ),
                                ),
                                onChanged: (value) {
                                  final parsed = double.tryParse(value);
                                  if (parsed != null) {
                                    setState(() => amount = parsed);
                                  }
                                },
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 24),

                  // Currency Selection
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Currency',
                        style: TextStyle(
                          fontSize: 12,
                          color: Color(0xFFE0E0E0),
                          letterSpacing: 2,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        decoration: BoxDecoration(
                          border: Border.all(color: const Color(0xFF404040)),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: DropdownButton<String>(
                          value: currency,
                          isExpanded: true,
                          dropdownColor: const Color(0xFF1A1A1A),
                          style: const TextStyle(color: Color(0xFFE0E0E0)),
                          underline: const SizedBox(),
                          items: const [
                            DropdownMenuItem(value: 'usd', child: Text('USD — US Dollar')),
                            DropdownMenuItem(value: 'eur', child: Text('EUR — Euro')),
                            DropdownMenuItem(value: 'gbp', child: Text('GBP — British Pound')),
                          ],
                          onChanged: (value) {
                            if (value != null) {
                              setState(() => currency = value);
                            }
                          },
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 24),

                  // Payment Method Selection
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Payment Method',
                        style: TextStyle(
                          fontSize: 12,
                          color: Color(0xFFE0E0E0),
                          letterSpacing: 2,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Expanded(
                            child: GestureDetector(
                              onTap: () => setState(() => paymentMethod = 'stripe'),
                              child: Container(
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  border: Border.all(
                                    color: paymentMethod == 'stripe'
                                        ? const Color(0xFFC9A84C)
                                        : const Color(0xFF404040),
                                  ),
                                  borderRadius: BorderRadius.circular(4),
                                  color: paymentMethod == 'stripe'
                                      ? const Color(0xFFC9A84C).withOpacity(0.1)
                                      : Colors.transparent,
                                ),
                                child: Column(
                                  children: [
                                    Icon(
                                      Icons.credit_card,
                                      color: paymentMethod == 'stripe'
                                          ? const Color(0xFFC9A84C)
                                          : const Color(0xFFE0E0E0),
                                      size: 24,
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      'Credit Card',
                                      style: TextStyle(
                                        color: paymentMethod == 'stripe'
                                            ? const Color(0xFFC9A84C)
                                            : const Color(0xFFE0E0E0),
                                        fontSize: 12,
                                        letterSpacing: 0.6,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: GestureDetector(
                              onTap: () => setState(() => paymentMethod = 'paypal'),
                              child: Container(
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  border: Border.all(
                                    color: paymentMethod == 'paypal'
                                        ? const Color(0xFFC9A84C)
                                        : const Color(0xFF404040),
                                  ),
                                  borderRadius: BorderRadius.circular(4),
                                  color: paymentMethod == 'paypal'
                                      ? const Color(0xFFC9A84C).withOpacity(0.1)
                                      : Colors.transparent,
                                ),
                                child: Column(
                                  children: [
                                    Icon(
                                      Icons.account_balance_wallet,
                                      color: paymentMethod == 'paypal'
                                          ? const Color(0xFFC9A84C)
                                          : const Color(0xFFE0E0E0),
                                      size: 24,
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      'PayPal',
                                      style: TextStyle(
                                        color: paymentMethod == 'paypal'
                                            ? const Color(0xFFC9A84C)
                                            : const Color(0xFFE0E0E0),
                                        fontSize: 12,
                                        letterSpacing: 0.6,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),

                  // Error/Success Message
                  if (message != null) ...[
                    const SizedBox(height: 24),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: message!.contains('failed')
                            ? const Color(0xFFE05C5C).withOpacity(0.1)
                            : const Color(0xFF4CAF80).withOpacity(0.1),
                        border: Border.all(
                          color: message!.contains('failed')
                              ? const Color(0xFFE05C5C).withOpacity(0.3)
                              : const Color(0xFF4CAF80).withOpacity(0.3),
                        ),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        message!,
                        style: TextStyle(
                          color: message!.contains('failed')
                              ? const Color(0xFFE05C5C)
                              : const Color(0xFF4CAF80),
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ],

                  const SizedBox(height: 32),

                  // Pay Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: isProcessing ? null : _handlePayment,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        foregroundColor: const Color(0xFFC9A84C),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(4),
                          side: const BorderSide(color: Color(0xFFC9A84C)),
                        ),
                      ),
                      child: isProcessing
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(Color(0xFFC9A84C)),
                              ),
                            )
                          : Text(
                              'Pay ${currencySymbols[currency]}${amount.toStringAsFixed(2)}',
                              style: const TextStyle(
                                fontSize: 14,
                                letterSpacing: 2.2,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Security indicators
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _buildSecurityIndicator('256-bit SSL'),
                      const SizedBox(width: 16),
                      _buildSecurityIndicator('PCI Compliant'),
                      const SizedBox(width: 16),
                      _buildSecurityIndicator('Encrypted'),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSecurityIndicator(String text) {
    return Row(
      children: [
        Container(
          width: 4,
          height: 4,
          decoration: const BoxDecoration(
            color: Color(0xFFC9A84C),
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 6),
        Text(
          text,
          style: const TextStyle(
            color: Color(0xFFE0E0E0),
            fontSize: 10,
            letterSpacing: 0.6,
          ),
        ),
      ],
    );
  }
}
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