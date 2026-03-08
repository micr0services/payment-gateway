import 'dart:convert';

class Transaction {
  final int id;
  final String idempotencyKey;
  final String gateway;
  final int amount;
  final String currency;
  final String status;
  final String? transactionId;
  final String? error;
  final Map<String, dynamic>? metadata;
  final DateTime createdAt;
  final DateTime updatedAt;

  Transaction({
    required this.id,
    required this.idempotencyKey,
    required this.gateway,
    required this.amount,
    required this.currency,
    required this.status,
    this.transactionId,
    this.error,
    this.metadata,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Transaction.fromJson(Map<String, dynamic> json) {
    Map<String, dynamic>? metadata;
    if (json['metadata'] != null && json['metadata'] != 'null') {
      if (json['metadata'] is String) {
        try {
          metadata = jsonDecode(json['metadata']);
        } catch (e) {
          metadata = {};
        }
      } else if (json['metadata'] is Map) {
        metadata = Map<String, dynamic>.from(json['metadata']);
      }
    }

    return Transaction(
      id: json['id'],
      idempotencyKey: json['idempotency_key'],
      gateway: json['gateway'],
      amount: json['amount'],
      currency: json['currency'],
      status: json['status'],
      transactionId: json['transaction_id'],
      error: json['error'],
      metadata: metadata,
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }

  String get formattedAmount {
    final amountInDollars = amount / 100;
    return '\$${amountInDollars.toStringAsFixed(2)}';
  }

  String get formattedDate {
    return '${createdAt.month}/${createdAt.day}/${createdAt.year} ${createdAt.hour}:${createdAt.minute.toString().padLeft(2, '0')}';
  }
}