import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/payment_provider.dart';
import '../models/transaction.dart';

class TransactionsScreen extends StatefulWidget {
  const TransactionsScreen({super.key});

  @override
  State<TransactionsScreen> createState() => _TransactionsScreenState();
}

class _TransactionsScreenState extends State<TransactionsScreen> {
  String _selectedGateway = '';
  String _selectedStatus = '';
  int _limit = 50;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadTransactions();
    });
  }

  Future<void> _loadTransactions() async {
    if (!mounted) return;
    setState(() => _isLoading = true);
    try {
      final paymentProvider = Provider.of<PaymentProvider>(context, listen: false);
      await paymentProvider.loadTransactions(
        gateway: _selectedGateway.isEmpty ? null : _selectedGateway,
        status: _selectedStatus.isEmpty ? null : _selectedStatus,
        limit: _limit,
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final paymentProvider = Provider.of<PaymentProvider>(context);
    final transactions = paymentProvider.transactions;

    final totalTransactions = transactions.length;
    final completedTransactions = transactions.where((t) => t.status == 'completed').length;
    final totalVolume = transactions
        .where((t) => t.status == 'completed')
        .fold(0, (sum, t) => sum + t.amount);

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
        child: Column(
          children: [
            SingleChildScrollView(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  const Row(
                    children: [
                      SizedBox(
                        width: 24,
                        child: Divider(
                          color: Color(0xFFC9A84C),
                          thickness: 1,
                        ),
                      ),
                      SizedBox(width: 12),
                      Text(
                        'Dashboard',
                        style: TextStyle(
                          fontSize: 12,
                          color: Color(0xFFC9A84C),
                          letterSpacing: 3,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Transaction\nHistory',
                    style: TextStyle(
                      fontSize: 48,
                      fontWeight: FontWeight.w300,
                      color: Color(0xFFE0E0E0),
                      height: 0.9,
                    ),
                  ),
                  const SizedBox(height: 48),

                  // Stats Grid
                  Container(
                    margin: const EdgeInsets.only(bottom: 40),
                    child: GridView.count(
                      crossAxisCount: 3,
                      crossAxisSpacing: 1,
                      mainAxisSpacing: 1,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      childAspectRatio: 1.5,
                      children: [
                        _buildStatCard(
                          title: 'Total Transactions',
                          value: totalTransactions.toString(),
                          subtitle: 'All time',
                        ),
                        _buildStatCard(
                          title: 'Completed',
                          value: completedTransactions.toString(),
                          subtitle: transactions.isEmpty
                              ? 'No data'
                              : '${((completedTransactions / totalTransactions) * 100).round()}% success rate',
                          valueColor: const Color(0xFFE8C97A),
                        ),
                        _buildStatCard(
                          title: 'Volume Processed',
                          value: totalVolume > 0 ? '\$${(totalVolume / 100).toStringAsFixed(0)}' : '\$0',
                          subtitle: 'USD equivalent',
                          valueColor: const Color(0xFFE8C97A),
                        ),
                      ],
                    ),
                  ),

                  // Filters
                  Container(
                    margin: const EdgeInsets.only(bottom: 24),
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1A1A1A),
                      border: Border.all(color: const Color(0xFF404040)),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Filters',
                          style: TextStyle(
                            fontSize: 10,
                            color: Color(0xFFC9A84C),
                            letterSpacing: 2,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            // Gateway Filter
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    'Gateway',
                                    style: TextStyle(
                                      fontSize: 8,
                                      color: Color(0xFFB0B0B0),
                                      letterSpacing: 1.5,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  Container(
                                    height: 32,
                                    padding: const EdgeInsets.symmetric(horizontal: 10),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF0A0A0F),
                                      border: Border.all(color: const Color(0xFF404040)),
                                      borderRadius: BorderRadius.circular(2),
                                    ),
                                    child: DropdownButton<String>(
                                      value: _selectedGateway,
                                      isExpanded: true,
                                      dropdownColor: const Color(0xFF1A1A1A),
                                      style: const TextStyle(color: Color(0xFFE0E0E0), fontSize: 10),
                                      underline: const SizedBox(),
                                      items: const [
                                        DropdownMenuItem(value: '', child: Text('All Gateways')),
                                        DropdownMenuItem(value: 'stripe', child: Text('Stripe')),
                                        DropdownMenuItem(value: 'paypal', child: Text('PayPal')),
                                      ],
                                      onChanged: (value) {
                                        setState(() => _selectedGateway = value!);
                                        _loadTransactions();
                                      },
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 12),

                            // Status Filter
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    'Status',
                                    style: TextStyle(
                                      fontSize: 8,
                                      color: Color(0xFFB0B0B0),
                                      letterSpacing: 1.5,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  Container(
                                    height: 32,
                                    padding: const EdgeInsets.symmetric(horizontal: 10),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF0A0A0F),
                                      border: Border.all(color: const Color(0xFF404040)),
                                      borderRadius: BorderRadius.circular(2),
                                    ),
                                    child: DropdownButton<String>(
                                      value: _selectedStatus,
                                      isExpanded: true,
                                      dropdownColor: const Color(0xFF1A1A1A),
                                      style: const TextStyle(color: Color(0xFFE0E0E0), fontSize: 10),
                                      underline: const SizedBox(),
                                      items: const [
                                        DropdownMenuItem(value: '', child: Text('All Statuses')),
                                        DropdownMenuItem(value: 'completed', child: Text('Completed')),
                                        DropdownMenuItem(value: 'pending', child: Text('Pending')),
                                        DropdownMenuItem(value: 'failed', child: Text('Failed')),
                                        DropdownMenuItem(value: 'cancelled', child: Text('Cancelled')),
                                      ],
                                      onChanged: (value) {
                                        setState(() => _selectedStatus = value!);
                                        _loadTransactions();
                                      },
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 12),

                            // Refresh Button
                            Container(
                              height: 32,
                              width: 100,
                              child: ElevatedButton(
                                onPressed: _isLoading ? null : _loadTransactions,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFFC9A84C),
                                  foregroundColor: const Color(0xFF0A0A0F),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(2),
                                  ),
                                  padding: EdgeInsets.zero,
                                ),
                                child: _isLoading
                                    ? const SizedBox(
                                        width: 12,
                                        height: 12,
                                        child: CircularProgressIndicator(strokeWidth: 1.5, color: Color(0xFF0A0A0F)),
                                      )
                                    : const Text('Refresh', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w500)),
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

            // Error State
            if (paymentProvider.error != null)
              Container(
                padding: const EdgeInsets.all(16),
                margin: const EdgeInsets.only(bottom: 24),
                decoration: BoxDecoration(
                  color: const Color(0xFFE05C5C).withOpacity(0.1),
                  border: Border.all(color: const Color(0xFFE05C5C).withOpacity(0.3)),
                ),
                child: Row(
                  children: [
                    const Text('⚠', style: TextStyle(color: Color(0xFFE05C5C))),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        paymentProvider.error!,
                        style: const TextStyle(color: Color(0xFFE05C5C), fontSize: 14),
                      ),
                    ),
                  ],
                ),
              ),

              // Error State
              if (paymentProvider.error != null)
                Container(
                  padding: const EdgeInsets.all(16),
                  margin: const EdgeInsets.only(bottom: 24),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE05C5C).withOpacity(0.1),
                    border: Border.all(color: const Color(0xFFE05C5C).withOpacity(0.3)),
                  ),
                  child: Row(
                    children: [
                      const Text('⚠', style: TextStyle(color: Color(0xFFE05C5C))),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          paymentProvider.error!,
                          style: const TextStyle(color: Color(0xFFE05C5C), fontSize: 14),
                        ),
                      ),
                    ],
                  ),
                ),

            // Loading State
            if (_isLoading)
              Expanded(
                child: const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      SizedBox(
                        width: 40,
                        height: 40,
                        child: CircularProgressIndicator(
                          valueColor: AlwaysStoppedAnimation<Color>(Color(0xFFC9A84C)),
                        ),
                      ),
                      SizedBox(height: 16),
                      Text(
                        'Fetching transactions',
                        style: TextStyle(
                          color: Color(0xFFB0B0B0),
                          fontSize: 14,
                          letterSpacing: 2,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

            // Transactions Table
            if (!_isLoading && transactions.isNotEmpty)
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    border: Border.all(color: const Color(0xFF404040)),
                  ),
                  child: SingleChildScrollView(
                    scrollDirection: Axis.vertical,
                    child: SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: DataTable(
                      headingRowColor: MaterialStateProperty.all(const Color(0xFF1A1A1A)),
                      dataRowColor: MaterialStateProperty.resolveWith<Color?>(
                        (Set<MaterialState> states) {
                          if (states.contains(MaterialState.hovered)) {
                            return const Color(0xFFC9A84C).withOpacity(0.05);
                          }
                          return const Color(0xFF0A0A0F);
                        },
                      ),
                      headingRowHeight: 50,
                      dataRowHeight: 60,
                      horizontalMargin: 0,
                      columnSpacing: 16,
                      dividerThickness: 1,
                      border: TableBorder.symmetric(
                        inside: BorderSide(color: const Color(0xFF404040), width: 1),
                      ),
                      columns: const [
                        DataColumn(
                          label: Text(
                            'Gateway',
                            style: TextStyle(
                              color: Color(0xFFE0E0E0),
                              fontSize: 12,
                              letterSpacing: 2,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                        DataColumn(
                          label: Text(
                            'Amount',
                            style: TextStyle(
                              color: Color(0xFFE0E0E0),
                              fontSize: 12,
                              letterSpacing: 2,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                        DataColumn(
                          label: Text(
                            'Status',
                            style: TextStyle(
                              color: Color(0xFFE0E0E0),
                              fontSize: 12,
                              letterSpacing: 2,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                        DataColumn(
                          label: Text(
                            'Created',
                            style: TextStyle(
                              color: Color(0xFFE0E0E0),
                              fontSize: 12,
                              letterSpacing: 2,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ],
                      rows: transactions.map((transaction) {
                        final statusConfig = _getStatusConfig(transaction.status);
                        final formattedDate = transaction.formattedDate;
                        final formattedAmount = _formatAmount(transaction.amount, transaction.currency);

                        return DataRow(
                          cells: [
                            DataCell(Row(
                              children: [
                                Container(
                                  width: 20,
                                  height: 20,
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF1A1A1A),
                                    border: Border.all(color: const Color(0xFFC9A84C).withOpacity(0.3)),
                                  ),
                                  child: Center(
                                    child: Text(
                                      transaction.gateway == 'stripe' ? 'S' : 'P',
                                      style: const TextStyle(
                                        color: Color(0xFFC9A84C),
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  transaction.gateway,
                                  style: const TextStyle(color: Color(0xFFE0E0E0), fontSize: 12),
                                ),
                              ],
                            )),
                            DataCell(Text(
                              formattedAmount,
                              style: const TextStyle(
                                color: Color(0xFFE0E0E0),
                                fontSize: 14,
                                fontWeight: FontWeight.w300,
                              ),
                            )),
                            DataCell(Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: statusConfig['bg'] as Color,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                transaction.status,
                                style: TextStyle(
                                  color: statusConfig['color'] as Color,
                                  fontSize: 12,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            )),
                            DataCell(Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  formattedDate,
                                  style: const TextStyle(
                                    color: Color(0xFFE0E0E0),
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            )),
                          ],
                        );
                      }).toList(),
                    ),
                  ),
                ),
              ),
            ),

            // Empty State
            if (!_isLoading && transactions.isEmpty)
              Expanded(
                child: Center(
                  child: Padding(
                    padding: const EdgeInsets.all(48.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          '◈',
                          style: TextStyle(
                            fontSize: 48,
                            color: const Color(0xFFB0B0B0).withOpacity(0.3),
                          ),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'No transactions yet',
                          style: TextStyle(
                            color: Color(0xFFB0B0B0),
                            fontSize: 16,
                            fontWeight: FontWeight.w300,
                          ),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'Make a payment to see your transaction history',
                          style: TextStyle(
                            color: Color(0xFF808080),
                            fontSize: 12,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
          ],
        ),
  };

  Widget _buildStatCard({
    required String title,
    required String value,
    required String subtitle,
    Color? valueColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A1A),
        border: Border.all(color: const Color(0xFF404040)),
      ),
      child: FittedBox(
        fit: BoxFit.scaleDown,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(
                color: Color(0xFFE0E0E0),
                fontSize: 12,
                letterSpacing: 2,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              value,
              style: TextStyle(
                color: valueColor ?? const Color(0xFFE0E0E0),
                fontSize: 36,
                fontWeight: FontWeight.w300,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              subtitle,
              style: const TextStyle(
                color: Color(0xFFB0B0B0),
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Map<String, dynamic> _getStatusConfig(String status) {
    final configs = {
      'completed': {
        'color': const Color(0xFF4CAF80),
        'bg': const Color(0xFF4CAF80).withOpacity(0.1),
      },
      'pending': {
        'color': const Color(0xFFE8C97A),
        'bg': const Color(0xFFE8C97A).withOpacity(0.1),
      },
      'failed': {
        'color': const Color(0xFFE05C5C),
        'bg': const Color(0xFFE05C5C).withOpacity(0.1),
      },
      'cancelled': {
        'color': const Color(0xFF7A7A8A),
        'bg': const Color(0xFF7A7A8A).withOpacity(0.1),
      },
    };
    return configs[status.toLowerCase()] ?? configs['pending']!;
  }

  Map<String, String> _formatDate(String dateString) {
    final date = DateTime.parse(dateString);
    return {
      'date': '${date.month.toString().padLeft(2, '0')}/${date.day.toString().padLeft(2, '0')}/${date.year}',
      'time': '${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}',
    };
  }

  String _formatAmount(int amount, String currency) {
    final value = amount / 100;
    return '\$${value.toStringAsFixed(2)}';
  }
}

class TransactionCard extends StatelessWidget {
  final Transaction transaction;

  const TransactionCard({super.key, required this.transaction});

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'completed':
        return Colors.green;
      case 'pending':
        return Colors.orange;
      case 'failed':
        return Colors.red;
      case 'cancelled':
        return Colors.grey;
      default:
        return Colors.blue;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  transaction.formattedAmount,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: _getStatusColor(transaction.status).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: _getStatusColor(transaction.status).withOpacity(0.3),
                    ),
                  ),
                  child: Text(
                    transaction.status.toUpperCase(),
                    style: TextStyle(
                      color: _getStatusColor(transaction.status),
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(
                  transaction.gateway == 'stripe' ? Icons.credit_card : Icons.paypal,
                  size: 20,
                  color: Colors.grey.shade600,
                ),
                const SizedBox(width: 4),
                Text(
                  transaction.gateway.toUpperCase(),
                  style: TextStyle(
                    color: Colors.grey.shade600,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(width: 16),
                Text(
                  transaction.currency.toUpperCase(),
                  style: TextStyle(
                    color: Colors.grey.shade600,
                  ),
                ),
              ],
            ),
            if (transaction.transactionId != null) ...[
              const SizedBox(height: 4),
              Text(
                'ID: ${transaction.transactionId}',
                style: TextStyle(
                  color: Colors.grey.shade500,
                  fontSize: 12,
                ),
              ),
            ],
            const SizedBox(height: 4),
            Text(
              transaction.formattedDate,
              style: TextStyle(
                color: Colors.grey.shade500,
                fontSize: 12,
              ),
            ),
            if (transaction.error != null) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: Colors.red.shade200),
                ),
                child: Text(
                  transaction.error!,
                  style: const TextStyle(
                    color: Colors.red,
                    fontSize: 12,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}