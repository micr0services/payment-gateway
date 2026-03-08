import 'package:flutter/material.dart';
import 'package:flutter_stripe/flutter_stripe.dart';
import 'package:provider/provider.dart';
import '../providers/payment_provider.dart';

class StripePaymentWidget extends StatefulWidget {
  final double amount;
  final String currency;

  const StripePaymentWidget({
    super.key,
    required this.amount,
    required this.currency,
  });

  @override
  State<StripePaymentWidget> createState() => _StripePaymentWidgetState();
}

class _StripePaymentWidgetState extends State<StripePaymentWidget> {
  final _formKey = GlobalKey<FormState>();
  final _card = CardFieldInputDetails(complete: false);

  @override
  Widget build(BuildContext context) {
    final paymentProvider = Provider.of<PaymentProvider>(context);

    return Form(
      key: _formKey,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey.shade300),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const CardField(
              decoration: InputDecoration(
                border: InputBorder.none,
                labelText: 'Card Details',
              ),
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: paymentProvider.isLoading ? null : _handlePayment,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                backgroundColor: Colors.blue,
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
                  : Text('Pay \$${widget.amount.toStringAsFixed(2)}'),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _handlePayment() async {
    if (!_formKey.currentState!.validate()) return;

    final paymentProvider = Provider.of<PaymentProvider>(context, listen: false);

    try {
      // Create payment intent
      final success = await paymentProvider.createStripePayment(
        amount: widget.amount,
        currency: widget.currency.toLowerCase(),
      );

      if (!success || paymentProvider.error != null) {
        _showMessage('Payment failed: ${paymentProvider.error}');
        return;
      }

      // For demo purposes, we'll show success
      // In a real app, you'd handle the payment intent client secret
      _showMessage('Payment intent created successfully!');

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