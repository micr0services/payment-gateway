import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/transaction.dart';
import '../config/config.dart';

class ApiService {
  // Stripe Payment
  Future<Map<String, dynamic>> createStripePayment({
    required int amount,
    required String currency,
    Map<String, dynamic>? metadata,
  }) async {
    final idempotencyKey = 'flutter-${DateTime.now().millisecondsSinceEpoch}-${DateTime.now().microsecond}';

    final response = await http.post(
      Uri.parse('${Config.baseUrl}/api/payments/stripe'),
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: jsonEncode({
        'amount': amount,
        'currency': currency,
        'metadata': metadata,
      }),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception(jsonDecode(response.body)['error'] ?? 'Payment failed');
    }
  }

  // PayPal Payment
  Future<Map<String, dynamic>> createPayPalPayment({
    required int amount,
    required String currency,
    Map<String, dynamic>? metadata,
  }) async {
    final idempotencyKey = 'flutter-${DateTime.now().millisecondsSinceEpoch}-${DateTime.now().microsecond}';

    final response = await http.post(
      Uri.parse('${Config.baseUrl}/api/payments/paypal'),
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: jsonEncode({
        'amount': amount,
        'currency': currency,
        'metadata': metadata,
      }),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception(jsonDecode(response.body)['error'] ?? 'Payment failed');
    }
  }

  // Confirm PayPal Payment
  Future<Map<String, dynamic>> confirmPayPalPayment(String orderId) async {
    final response = await http.post(
      Uri.parse('${Config.baseUrl}/api/payments/paypal/confirm/$orderId'),
      headers: {
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception(jsonDecode(response.body)['error'] ?? 'Confirmation failed');
    }
  }

  // Get Transactions
  Future<List<Transaction>> getTransactions({
    String? gateway,
    String? status,
    int? limit,
  }) async {
    final queryParams = <String, String>{};
    if (gateway != null) queryParams['gateway'] = gateway;
    if (status != null) queryParams['status'] = status;
    if (limit != null) queryParams['limit'] = limit.toString();

    final uri = Uri.parse('${Config.baseUrl}/api/transactions').replace(queryParameters: queryParams);

    print('🔍 API Call: GET $uri');

    final response = await http.get(uri);

    print('📡 API Response: ${response.statusCode}');
    print('📄 Response Body Length: ${response.body.length}');

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      print('✅ Successfully parsed ${data.length} transactions');
      return data.map((json) => Transaction.fromJson(json)).toList();
    } else {
      print('❌ API Error: ${response.statusCode} - ${response.body}');
      throw Exception(jsonDecode(response.body)['error'] ?? 'Failed to fetch transactions');
    }
  }
}