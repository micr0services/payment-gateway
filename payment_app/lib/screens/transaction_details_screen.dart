import 'package:flutter/material.dart';
import '../models/transaction.dart';

class TransactionDetailsScreen extends StatelessWidget {
  final Transaction transaction;

  const TransactionDetailsScreen({super.key, required this.transaction});

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
        child: SafeArea(
          child: Column(
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.all(24.0),
                child: Row(
                  children: [
                    IconButton(
                      onPressed: () => Navigator.of(context).pop(),
                      icon: const Icon(Icons.arrow_back, color: Color(0xFFE0E0E0)),
                    ),
                    const SizedBox(width: 16),
                    const Text(
                      'Transaction Details',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w300,
                        color: Color(0xFFE0E0E0),
                      ),
                    ),
                  ],
                ),
              ),

              // Content
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 24.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Status Card
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1A1A1A),
                          border: Border.all(color: const Color(0xFF404040)),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Column(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: _getStatusColor(transaction.status),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                transaction.status.toUpperCase(),
                                style: const TextStyle(
                                  color: Color(0xFF0A0A0F),
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                  letterSpacing: 1,
                                ),
                              ),
                            ),
                            const SizedBox(height: 16),
                            Text(
                              _formatAmount(transaction.amount, transaction.currency),
                              style: const TextStyle(
                                fontSize: 32,
                                fontWeight: FontWeight.w300,
                                color: Color(0xFFE0E0E0),
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 32),

                      // Basic Information
                      const Text(
                        'Basic Information',
                        style: TextStyle(
                          fontSize: 16,
                          color: Color(0xFFC9A84C),
                          letterSpacing: 2,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 16),

                      _buildInfoCard('Transaction ID', '#${transaction.id.toString().padLeft(6, '0')}'),
                      _buildInfoCard('Gateway', transaction.gateway.toUpperCase()),
                      _buildInfoCard('Created', transaction.formattedDate),

                      const SizedBox(height: 32),

                      // Gateway Specific Information
                      const Text(
                        'Gateway Details',
                        style: TextStyle(
                          fontSize: 16,
                          color: Color(0xFFC9A84C),
                          letterSpacing: 2,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 16),

                      if (transaction.gateway == 'stripe' && transaction.stripePaymentIntentId != null)
                        _buildInfoCard('Stripe Payment Intent ID', transaction.stripePaymentIntentId!),

                      if (transaction.gateway == 'paypal' && transaction.paypalOrderId != null)
                        _buildInfoCard('PayPal Order ID', transaction.paypalOrderId!),

                      if (transaction.transactionId != null)
                        _buildInfoCard('Transaction ID', transaction.transactionId!),

                      if (transaction.error != null)
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: const Color(0xFFE05C5C).withOpacity(0.1),
                            border: Border.all(color: const Color(0xFFE05C5C).withOpacity(0.3)),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Error',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Color(0xFFE05C5C),
                                  letterSpacing: 1.5,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                transaction.error!,
                                style: const TextStyle(
                                  color: Color(0xFFE0E0E0),
                                  fontSize: 14,
                                ),
                              ),
                            ],
                          ),
                        ),

                      const SizedBox(height: 32),

                      // Metadata
                      if (transaction.metadata != null && transaction.metadata!.isNotEmpty)
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Metadata',
                              style: TextStyle(
                                fontSize: 16,
                                color: Color(0xFFC9A84C),
                                letterSpacing: 2,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            const SizedBox(height: 16),
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: const Color(0xFF1A1A1A),
                                border: Border.all(color: const Color(0xFF404040)),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                transaction.metadata.toString(),
                                style: const TextStyle(
                                  color: Color(0xFFB0B0B0),
                                  fontSize: 12,
                                  fontFamily: 'monospace',
                                ),
                              ),
                            ),
                          ],
                        ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoCard(String label, String value) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A1A),
        border: Border.all(color: const Color(0xFF404040)),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              color: Color(0xFFB0B0B0),
              letterSpacing: 1.5,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(
              color: Color(0xFFE0E0E0),
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'completed':
        return const Color(0xFF4CAF50);
      case 'pending':
        return const Color(0xFFFF9800);
      case 'failed':
        return const Color(0xFFF44336);
      case 'cancelled':
        return const Color(0xFF9E9E9E);
      default:
        return const Color(0xFF9E9E9E);
    }
  }

  String _formatAmount(int amount, String currency) {
    final value = amount / 100.0;
    return '${currency.toUpperCase()} ${value.toStringAsFixed(2)}';
  }
}