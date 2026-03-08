import 'package:flutter/foundation.dart';
import '../models/transaction.dart';
import '../services/api_service.dart';

class PaymentProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

  bool _isLoading = false;
  String? _error;
  List<Transaction> _transactions = [];
  String? _lastTransactionId;

  bool get isLoading => _isLoading;
  String? get error => _error;
  List<Transaction> get transactions => _transactions;
  String? get lastTransactionId => _lastTransactionId;

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String? error) {
    _error = error;
    notifyListeners();
  }

  Future<String> createStripePayment({
    required double amount,
    required String currency,
    Map<String, dynamic>? metadata,
  }) async {
    _setLoading(true);
    _setError(null);

    try {
      final result = await _apiService.createStripePayment(
        amount: (amount * 100).toInt(), // Convert to cents
        currency: currency,
        metadata: metadata,
      );
      _lastTransactionId = result['sessionId'] ?? result['transactionId'] ?? 'unknown';
      _setLoading(false);
      // Return the checkout URL for redirection
      return result['checkoutUrl'] ?? '';
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
      return '';
    }
  }

  Future<String> createPayPalPayment({
    required double amount,
    required String currency,
    Map<String, dynamic>? metadata,
  }) async {
    _setLoading(true);
    _setError(null);

    try {
      final result = await _apiService.createPayPalPayment(
        amount: (amount * 100).toInt(), // Convert to cents
        currency: currency,
        metadata: metadata,
      );
      _lastTransactionId = result['orderId'] ?? result['transactionId'] ?? 'unknown';
      _setLoading(false);
      // Return the approval URL for redirection
      return result['approvalUrl'] ?? '';
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
      return '';
    }
  }

  Future<bool> confirmPayPalPayment(String orderId) async {
    _setLoading(true);
    _setError(null);

    try {
      final result = await _apiService.confirmPayPalPayment(orderId);
      _setLoading(false);
      return true;
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
      return false;
    }
  }

  Future<void> loadTransactions({
    String? gateway,
    String? status,
    int? limit = 50,
  }) async {
    print('🚀 PaymentProvider: loadTransactions called with gateway=$gateway, status=$status, limit=$limit');
    _setLoading(true);
    _setError(null);

    try {
      final transactions = await _apiService.getTransactions(
        gateway: gateway,
        status: status,
        limit: limit,
      );
      _transactions = transactions;
      print('✅ PaymentProvider: Successfully loaded ${transactions.length} transactions');
      _setLoading(false);
    } catch (e) {
      print('❌ PaymentProvider: Error loading transactions: $e');
      _setError(e.toString());
      _setLoading(false);
    }
  }

  void clearError() {
    _setError(null);
  }
}