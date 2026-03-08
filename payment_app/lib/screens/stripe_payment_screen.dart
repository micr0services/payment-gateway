import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../providers/payment_provider.dart';

class StripePaymentScreen extends StatefulWidget {
  const StripePaymentScreen({super.key});

  @override
  State<StripePaymentScreen> createState() => _StripePaymentScreenState();
}

class _StripePaymentScreenState extends State<StripePaymentScreen> {
  final _formKey = GlobalKey<FormState>();
  double _amount = 10.0;
  String _currency = 'USD';
  bool _isProcessing = false;
  String? _message;

  final Map<String, String> _currencySymbols = {
    'USD': '\$',
    'EUR': '€',
    'GBP': '£',
  };

  @override
  Widget build(BuildContext context) {
    final paymentProvider = Provider.of<PaymentProvider>(context);

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
                              'Stripe Checkout',
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
                          'Make a\nPayment',
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

                  Padding(
                    padding: const EdgeInsets.all(32),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Switch to PayPal
                          Center(
                            child: TextButton(
                              onPressed: () {
                                Navigator.of(context).pushReplacementNamed('/paypal');
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
                                    'Switch to PayPal',
                                    style: TextStyle(
                                      color: Color(0xFFB0B0B0),
                                      fontSize: 12,
                                      letterSpacing: 1.5,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),

                          const SizedBox(height: 28),

                          // Amount
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
                                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                                      decoration: const BoxDecoration(
                                        border: Border(
                                          right: BorderSide(color: Color(0xFF404040)),
                                        ),
                                      ),
                                      child: Text(
                                        _currencySymbols[_currency] ?? '\$',
                                        style: const TextStyle(
                                          color: Color(0xFFC9A84C),
                                          fontSize: 20,
                                          fontWeight: FontWeight.w300,
                                        ),
                                      ),
                                    ),
                                    Expanded(
                                      child: TextFormField(
                                        initialValue: _amount.toString(),
                                        decoration: const InputDecoration(
                                          border: InputBorder.none,
                                          contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                                          hintText: '0.00',
                                          hintStyle: TextStyle(color: Color(0xFF808080)),
                                        ),
                                        style: const TextStyle(
                                          color: Color(0xFFE0E0E0),
                                          fontSize: 20,
                                          fontWeight: FontWeight.w300,
                                        ),
                                        keyboardType: TextInputType.number,
                                        validator: (value) {
                                          if (value == null || value.isEmpty) {
                                            return 'Please enter an amount';
                                          }
                                          final amount = double.tryParse(value);
                                          if (amount == null || amount <= 0) {
                                            return 'Please enter a valid amount';
                                          }
                                          return null;
                                        },
                                        onChanged: (value) {
                                          final amount = double.tryParse(value);
                                          if (amount != null) {
                                            setState(() => _amount = amount);
                                          }
                                        },
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),

                          const SizedBox(height: 28),

                          // Currency
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
                                decoration: BoxDecoration(
                                  border: Border.all(color: const Color(0xFF404040)),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: DropdownButtonFormField<String>(
                                  value: _currency,
                                  decoration: const InputDecoration(
                                    border: InputBorder.none,
                                    contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                                  ),
                                  dropdownColor: const Color(0xFF1A1A1A),
                                  style: const TextStyle(
                                    color: Color(0xFFE0E0E0),
                                    fontSize: 12,
                                    fontFamily: 'monospace',
                                  ),
                                  items: const [
                                    DropdownMenuItem(value: 'USD', child: Text('USD — US Dollar')),
                                    DropdownMenuItem(value: 'EUR', child: Text('EUR — Euro')),
                                    DropdownMenuItem(value: 'GBP', child: Text('GBP — British Pound')),
                                  ],
                                  onChanged: (value) {
                                    setState(() => _currency = value!);
                                  },
                                ),
                              ),
                            ],
                          ),

                          // Message
                          if (_message != null) ...[
                            const SizedBox(height: 28),
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: _message!.startsWith('Payment successful')
                                    ? const Color(0xFF4CAF50).withOpacity(0.1)
                                    : const Color(0xFFF44336).withOpacity(0.1),
                                border: Border.all(
                                  color: _message!.startsWith('Payment successful')
                                      ? const Color(0xFF4CAF50).withOpacity(0.3)
                                      : const Color(0xFFF44336).withOpacity(0.3),
                                ),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                _message!,
                                style: TextStyle(
                                  fontSize: 12,
                                  color: _message!.startsWith('Payment successful')
                                      ? const Color(0xFF4CAF50)
                                      : const Color(0xFFF44336),
                                  height: 1.4,
                                ),
                              ),
                            ),
                          ],

                          const SizedBox(height: 32),

                          // Stripe Payment Button
                          Container(
                            padding: const EdgeInsets.only(top: 28),
                            decoration: const BoxDecoration(
                              border: Border(
                                top: BorderSide(color: Color(0xFF404040)),
                              ),
                            ),
                            child: SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                onPressed: _isProcessing ? null : _processPayment,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF635BFF),
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(vertical: 16),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                ),
                                child: _isProcessing
                                    ? const CircularProgressIndicator(color: Colors.white)
                                    : const Text(
                                        'Pay with Stripe',
                                        style: TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Footer
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: const BoxDecoration(
                      border: Border(
                        top: BorderSide(color: Color(0xFF404040)),
                      ),
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Column(
                          children: [
                            Icon(Icons.security, color: Color(0xFFC9A84C), size: 12),
                            SizedBox(height: 4),
                            Text(
                              '256-bit SSL',
                              style: TextStyle(
                                fontSize: 6,
                                color: Color(0xFFB0B0B0),
                                letterSpacing: 0.6,
                              ),
                            ),
                          ],
                        ),
                        SizedBox(width: 24),
                        Column(
                          children: [
                            Icon(Icons.verified, color: Color(0xFFC9A84C), size: 12),
                            SizedBox(height: 4),
                            Text(
                              'PCI Compliant',
                              style: TextStyle(
                                fontSize: 6,
                                color: Color(0xFFB0B0B0),
                                letterSpacing: 0.6,
                              ),
                            ),
                          ],
                        ),
                        SizedBox(width: 24),
                        Column(
                          children: [
                            Icon(Icons.lock, color: Color(0xFFC9A84C), size: 12),
                            SizedBox(height: 4),
                            Text(
                              'Encrypted',
                              style: TextStyle(
                                fontSize: 6,
                                color: Color(0xFFB0B0B0),
                                letterSpacing: 0.6,
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

  Future<void> _processPayment() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isProcessing = true);

    try {
      final paymentProvider = Provider.of<PaymentProvider>(context, listen: false);
      final checkoutUrl = await paymentProvider.createStripePayment(
        amount: _amount,
        currency: _currency,
      );

      if (checkoutUrl.isNotEmpty) {
        // Launch the checkout URL in external browser
        if (await canLaunchUrl(Uri.parse(checkoutUrl))) {
          await launchUrl(Uri.parse(checkoutUrl), mode: LaunchMode.externalApplication);
          setState(() {
            _message = 'Redirecting to Stripe checkout...';
          });
        } else {
          setState(() {
            _message = 'Failed to open checkout URL';
          });
        }
      } else {
        setState(() {
          _message = 'Failed to create checkout session';
        });
      }
    } catch (error) {
      setState(() {
        _message = 'Payment failed: ${error.toString()}';
      });
    } finally {
      if (mounted) {
        setState(() => _isProcessing = false);
      }
    }
  }
}