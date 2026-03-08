import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class IntegrationsScreen extends StatefulWidget {
  const IntegrationsScreen({super.key});

  @override
  State<IntegrationsScreen> createState() => _IntegrationsScreenState();
}

class _IntegrationsScreenState extends State<IntegrationsScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _companyController = TextEditingController();
  final _messageController = TextEditingController();
  String _selectedService = 'api-integration';
  bool _isSubmitting = false;
  bool _submitted = false;

  final List<Map<String, String>> _services = [
    {'value': 'api-integration', 'label': 'API Integration'},
    {'value': 'payment-gateway', 'label': 'Payment Gateway Setup'},
    {'value': 'custom-software', 'label': 'Custom Software Development'},
    {'value': 'system-migration', 'label': 'System Migration'},
    {'value': 'consulting', 'label': 'Technical Consulting'},
    {'value': 'other', 'label': 'Other'},
  ];

  Future<void> _submitInquiry() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);

    try {
      final response = await http.post(
        Uri.parse('https://payment-gateway.kimaniwilfred95.workers.dev/api/integrations'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'name': _nameController.text,
          'email': _emailController.text,
          'company': _companyController.text,
          'service': _selectedService,
          'message': _messageController.text,
        }),
      );

      if (response.statusCode == 200) {
        setState(() => _submitted = true);
      } else {
        _showError('Failed to send inquiry. Please try again.');
      }
    } catch (e) {
      _showError('Network error. Please check your connection and try again.');
    } finally {
      setState(() => _isSubmitting = false);
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_submitted) {
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
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.check_circle,
                    size: 80,
                    color: Color(0xFFC9A84C),
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'Thank You!',
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFFE0E0E0),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'We\'ve received your integration inquiry and will get back to you within 24 hours.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 16,
                      color: Color(0xFFB0B0B0),
                    ),
                  ),
                  const SizedBox(height: 32),
                  ElevatedButton(
                    onPressed: () {
                      setState(() => _submitted = false);
                      _nameController.clear();
                      _emailController.clear();
                      _companyController.clear();
                      _messageController.clear();
                    },
                    child: const Text('Submit Another Inquiry'),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    }

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
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Choose Payment Method',
                style: TextStyle(
                  fontSize: 12,
                  color: Color(0xFFC9A84C),
                  letterSpacing: 2,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Integration Services',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFFE0E0E0),
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Need custom integrations or software services? Let us know your requirements.',
                style: TextStyle(
                  fontSize: 16,
                  color: Color(0xFFB0B0B0),
                ),
              ),
              const SizedBox(height: 32),
              Card(
                color: const Color(0xFF1A1A1A),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: const BorderSide(color: Color(0xFF404040)),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Name
                        TextFormField(
                          controller: _nameController,
                          decoration: const InputDecoration(
                            labelText: 'Full Name',
                            hintText: 'Your full name',
                          ),
                          style: const TextStyle(color: Color(0xFFE0E0E0)),
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Please enter your name';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 16),

                        // Email
                        TextFormField(
                          controller: _emailController,
                          decoration: const InputDecoration(
                            labelText: 'Email Address',
                            hintText: 'your.email@company.com',
                          ),
                          keyboardType: TextInputType.emailAddress,
                          style: const TextStyle(color: Color(0xFFE0E0E0)),
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Please enter your email';
                            }
                            if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value)) {
                              return 'Please enter a valid email';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 16),

                        // Company
                        TextFormField(
                          controller: _companyController,
                          decoration: const InputDecoration(
                            labelText: 'Company',
                            hintText: 'Company name (optional)',
                          ),
                          style: const TextStyle(color: Color(0xFFE0E0E0)),
                        ),
                        const SizedBox(height: 16),

                        // Service Type
                        DropdownButtonFormField<String>(
                          initialValue: _selectedService,
                          decoration: const InputDecoration(
                            labelText: 'Service Type',
                          ),
                          dropdownColor: const Color(0xFF1A1A1A),
                          style: const TextStyle(color: Color(0xFFE0E0E0)),
                          items: _services.map((service) {
                            return DropdownMenuItem(
                              value: service['value'],
                              child: Text(service['label']!),
                            );
                          }).toList(),
                          onChanged: (value) {
                            setState(() => _selectedService = value!);
                          },
                        ),
                        const SizedBox(height: 16),

                        // Message
                        TextFormField(
                          controller: _messageController,
                          decoration: const InputDecoration(
                            labelText: 'Project Details',
                            hintText: 'Describe your integration needs, timeline, and any specific requirements...',
                          ),
                          maxLines: 5,
                          style: const TextStyle(color: Color(0xFFE0E0E0)),
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Please describe your project';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 32),

                        // Submit Button
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: _isSubmitting ? null : _submitInquiry,
                            child: _isSubmitting
                                ? const CircularProgressIndicator()
                                : const Text('Send Inquiry'),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _companyController.dispose();
    _messageController.dispose();
    super.dispose();
  }
}