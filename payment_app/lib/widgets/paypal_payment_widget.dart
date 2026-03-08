import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../providers/payment_provider.dart';

class PayPalPaymentWidget extends StatefulWidget {
  final double amount;
  final String currency;

  const PayPalPaymentWidget({
    super.key,
    required this.amount,
    required this.currency,
  });

  @override
  State<PayPalPaymentWidget> createState() => _PayPalPaymentWidgetState();
}

class _PayPalPaymentWidgetState extends State<PayPalPaymentWidget> {
  @override
  Widget build(BuildContext context) {
    final paymentProvider = Provider.of<PaymentProvider>(context);

    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            border: Border.all(color: Colors.grey.shade300),
            borderRadius: BorderRadius.circular(8),
            color: Colors.blue.shade50,
          ),
          child: const Row(
            children: [
              Icon(Icons.paypal, color: Colors.blue, size: 24),
              SizedBox(width: 12),
              Expanded(
                child: Text(
                  'You will be redirected to PayPal to complete your payment securely.',
                  style: TextStyle(fontSize: 14),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: paymentProvider.isLoading ? null : _handlePayment,
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
              backgroundColor: Colors.blue.shade700,
              foregroundColor: Colors.white,
            ),
            child: paymentProvider.isLoading
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  )
                : Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.paypal),
                      const SizedBox(width: 8),
                      Text('Pay with PayPal - \$${widget.amount.toStringAsFixed(2)}'),
                    ],
                  ),
          ),
        ),
      ],
    );
  }

  Future<void> _handlePayment() async {
    final paymentProvider = Provider.of<PaymentProvider>(context, listen: false);

    try {
      final result = await paymentProvider.createPayPalPayment(
        amount: widget.amount,
        currency: widget.currency,
      );

      if (result != null && result['orderId'] != null) {
        // In a real app, you'd redirect to PayPal approval URL
        // For demo, we'll show the order ID
        _showMessage('PayPal order created: ${result['orderId']}');

        // Simulate approval and confirmation
        await Future.delayed(const Duration(seconds: 2));
        final confirmed = await paymentProvider.confirmPayPalPayment(result['orderId']);

        if (confirmed) {
          _showMessage('Payment completed successfully!');
        } else {
          _showMessage('Payment confirmation failed');
        }
      } else {
        _showMessage('Failed to create PayPal order');
      }
    } catch (e) {
      _showMessage('Payment failed: $e');
    }
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }
}