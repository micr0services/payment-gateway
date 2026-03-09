import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/payment_provider.dart';
import '../models/transaction.dart';
import 'transaction_details_screen.dart';

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
            colors: [Color(0xFF0A0A0F), Color(0xFF1A1A1A)],
          ),
        ),
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header
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
                          'Dashboard',
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
                      'Transaction\nHistory',
                      style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.w300,
                        color: Color(0xFFE0E0E0),
                        height: 0.9,
                      ),
                    ),
                    const SizedBox(height: 48),

                    // Stats Grid - Responsive
                    LayoutBuilder(
                      builder: (context, constraints) {
                        final isMobile = constraints.maxWidth < 600;
                        return GridView.count(
                          crossAxisCount: isMobile ? 1 : 3,
                          crossAxisSpacing: 1,
                          mainAxisSpacing: 1,
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          childAspectRatio: isMobile ? 3.5 : 1.5,
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
                        );
                      },
                    ),

                    const SizedBox(height: 48),

                    // Filters
                    Container(
                      margin: const EdgeInsets.only(bottom: 24),
                      padding: const EdgeInsets.all(20),
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
                          const Text(
                            'Filters',
                            style: TextStyle(
                              fontSize: 12,
                              color: Color(0xFFC9A84C),
                              letterSpacing: 2,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          const SizedBox(height: 16),
                          LayoutBuilder(
                            builder: (context, constraints) {
                              final isMobile = constraints.maxWidth < 600;
                              return isMobile
                                  ? Column(
                                      children: [
                                        // Gateway Filter
                                        Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            const Text(
                                              'Gateway',
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
                                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                                              decoration: BoxDecoration(
                                                border: Border.all(color: const Color(0xFF404040)),
                                                borderRadius: BorderRadius.circular(4),
                                              ),
                                              child: DropdownButton<String>(
                                                value: _selectedGateway,
                                                isExpanded: true,
                                                dropdownColor: const Color(0xFF1A1A1A),
                                                style: const TextStyle(color: Color(0xFFE0E0E0)),
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
                                        const SizedBox(height: 16),

                                        // Status Filter
                                        Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            const Text(
                                              'Status',
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
                                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                                              decoration: BoxDecoration(
                                                border: Border.all(color: const Color(0xFF404040)),
                                                borderRadius: BorderRadius.circular(4),
                                              ),
                                              child: DropdownButton<String>(
                                                value: _selectedStatus,
                                                isExpanded: true,
                                                dropdownColor: const Color(0xFF1A1A1A),
                                                style: const TextStyle(color: Color(0xFFE0E0E0)),
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
                                        const SizedBox(height: 16),

                                        // Refresh Button
                                        SizedBox(
                                          width: double.infinity,
                                          child: ElevatedButton(
                                            onPressed: _isLoading ? null : _loadTransactions,
                                            style: ElevatedButton.styleFrom(
                                              backgroundColor: const Color(0xFFC9A84C),
                                              foregroundColor: const Color(0xFF0A0A0F),
                                              padding: const EdgeInsets.symmetric(vertical: 16),
                                              shape: RoundedRectangleBorder(
                                                borderRadius: BorderRadius.circular(4),
                                              ),
                                            ),
                                            child: _isLoading
                                                ? const SizedBox(
                                                    width: 20,
                                                    height: 20,
                                                    child: CircularProgressIndicator(
                                                      strokeWidth: 2,
                                                      valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF0A0A0F)),
                                                    ),
                                                  )
                                                : const Text(
                                                    'Refresh',
                                                    style: TextStyle(
                                                      fontSize: 14,
                                                      letterSpacing: 1.5,
                                                      fontWeight: FontWeight.w500,
                                                    ),
                                                  ),
                                          ),
                                        ),
                                      ],
                                    )
                                  : Row(
                                      children: [
                                        // Gateway Filter
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              const Text(
                                                'Gateway',
                                                style: TextStyle(
                                                  fontSize: 12,
                                                  color: Color(0xFFE0E0E0),
                                                  letterSpacing: 2,
                                                  fontWeight: FontWeight.w500,
                                                ),
                                              ),
                                              const SizedBox(height: 8),
                                              Container(
                                                height: 40,
                                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                                                decoration: BoxDecoration(
                                                  border: Border.all(color: const Color(0xFF404040)),
                                                  borderRadius: BorderRadius.circular(4),
                                                ),
                                                child: DropdownButton<String>(
                                                  value: _selectedGateway,
                                                  isExpanded: true,
                                                  dropdownColor: const Color(0xFF1A1A1A),
                                                  style: const TextStyle(color: Color(0xFFE0E0E0)),
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
                                        const SizedBox(width: 16),

                                        // Status Filter
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              const Text(
                                                'Status',
                                                style: TextStyle(
                                                  fontSize: 12,
                                                  color: Color(0xFFE0E0E0),
                                                  letterSpacing: 2,
                                                  fontWeight: FontWeight.w500,
                                                ),
                                              ),
                                              const SizedBox(height: 8),
                                              Container(
                                                height: 40,
                                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                                                decoration: BoxDecoration(
                                                  border: Border.all(color: const Color(0xFF404040)),
                                                  borderRadius: BorderRadius.circular(4),
                                                ),
                                                child: DropdownButton<String>(
                                                  value: _selectedStatus,
                                                  isExpanded: true,
                                                  dropdownColor: const Color(0xFF1A1A1A),
                                                  style: const TextStyle(color: Color(0xFFE0E0E0)),
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
                                        const SizedBox(width: 16),

                                        // Refresh Button
                                        Container(
                                          height: 40,
                                          width: 120,
                                          child: ElevatedButton(
                                            onPressed: _isLoading ? null : _loadTransactions,
                                            style: ElevatedButton.styleFrom(
                                              backgroundColor: const Color(0xFFC9A84C),
                                              foregroundColor: const Color(0xFF0A0A0F),
                                              shape: RoundedRectangleBorder(
                                                borderRadius: BorderRadius.circular(4),
                                              ),
                                              padding: EdgeInsets.zero,
                                            ),
                                            child: _isLoading
                                                ? const SizedBox(
                                                    width: 16,
                                                    height: 16,
                                                    child: CircularProgressIndicator(
                                                      strokeWidth: 2,
                                                      valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF0A0A0F)),
                                                    ),
                                                  )
                                                : const Text(
                                                    'Refresh',
                                                    style: TextStyle(
                                                      fontSize: 12,
                                                      letterSpacing: 1.5,
                                                      fontWeight: FontWeight.w500,
                                                    ),
                                                  ),
                                          ),
                                        ),
                                      ],
                                    );
                            },
                          ),
                        ],
                      ),
                    ),

                    // Conditional Content
                    _buildConditionalContent(),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildConditionalContent() {
    final paymentProvider = Provider.of<PaymentProvider>(context);
    final transactions = paymentProvider.transactions;

    // Error State
    if (paymentProvider.error != null) {
      return Container(
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
      );
    }

    // Loading State
    if (_isLoading) {
      return const Center(
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
      );
    }

    // Empty State
    if (transactions.isEmpty) {
      return Center(
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
      );
    }

    // Transactions List - Responsive
    return LayoutBuilder(
      builder: (context, constraints) {
        final isMobile = constraints.maxWidth < 600;

        if (isMobile) {
          // Mobile: Card-based layout
          return ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: transactions.length,
            itemBuilder: (context, index) {
              final transaction = transactions[index];
              return _buildTransactionCard(transaction);
            },
          );
        } else {
          // Desktop: Table layout
          return Container(
            width: double.infinity,
            decoration: BoxDecoration(
              border: Border.all(color: const Color(0xFF404040)),
            ),
            child: SingleChildScrollView(
              scrollDirection: Axis.vertical,
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
                horizontalMargin: 24,
                columnSpacing: 24,
                dividerThickness: 1,
                border: TableBorder.symmetric(
                  inside: BorderSide(color: const Color(0xFF404040), width: 1),
                ),
                columns: const [
                  DataColumn(
                    label: Text(
                      'Gateway',
                      style: TextStyle(
                        color: Color(0xFFC9A84C),
                        fontSize: 12,
                        letterSpacing: 1,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  DataColumn(
                    label: Text(
                      'Amount',
                      style: TextStyle(
                        color: Color(0xFFC9A84C),
                        fontSize: 12,
                        letterSpacing: 1,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  DataColumn(
                    label: Text(
                      'Status',
                      style: TextStyle(
                        color: Color(0xFFC9A84C),
                        fontSize: 12,
                        letterSpacing: 1,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  DataColumn(
                    label: Text(
                      'Date',
                      style: TextStyle(
                        color: Color(0xFFC9A84C),
                        fontSize: 12,
                        letterSpacing: 1,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
                rows: transactions.map((transaction) {
                  final statusConfig = _getStatusConfig(transaction.status);
                  final formattedAmount = '\$${transaction.amount.toStringAsFixed(2)}';
                  final formattedDate = DateFormat('MMM dd, yyyy\nHH:mm').format(transaction.createdAt);
                  return DataRow(
                    cells: [
                      DataCell(Text(
                        transaction.gateway.toUpperCase(),
                        style: const TextStyle(
                          color: Color(0xFFE0E0E0),
                          fontSize: 14,
                          fontWeight: FontWeight.w300,
                        ),
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
          );
        }
      },
    );
  }

  Widget _buildTransactionCard(Transaction transaction) {
    final statusConfig = _getStatusConfig(transaction.status);
    final formattedAmount = '\$${transaction.amount.toStringAsFixed(2)}';
    final formattedDate = DateFormat('MMM dd, yyyy • HH:mm').format(transaction.createdAt);

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
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
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                formattedAmount,
                style: const TextStyle(
                  color: Color(0xFFE0E0E0),
                  fontSize: 24,
                  fontWeight: FontWeight.w300,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
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
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Text(
                transaction.gateway.toUpperCase(),
                style: const TextStyle(
                  color: Color(0xFFB0B0B0),
                  fontSize: 12,
                  letterSpacing: 1.5,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(width: 16),
              Text(
                transaction.currency.toUpperCase(),
                style: const TextStyle(
                  color: Color(0xFF7A7A8A),
                  fontSize: 12,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            formattedDate,
            style: const TextStyle(
              color: Color(0xFF7A7A8A),
              fontSize: 12,
            ),
          ),
          if (transaction.transactionId != null) ...[
            const SizedBox(height: 4),
            Text(
              'ID: ${transaction.transactionId}',
              style: const TextStyle(
                color: Color(0xFF7A7A8A),
                fontSize: 10,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildStatCard({
    required String title,
    required String value,
    required String subtitle,
    Color? valueColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFF12151F),
        border: Border.all(color: const Color(0xFF404040)),
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
              fontSize: 32,
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
}