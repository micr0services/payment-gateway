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
  final _phoneController = TextEditingController();
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
          'phone': _phoneController.text,
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
        backgroundColor: const Color(0xFFE05C5C),
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
              colors: [Color(0xFF0A0A0F), Color(0xFF1A1A1A)],
            ),
          ),
          child: Center(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text(
                    '◆',
                    style: TextStyle(
                      color: Color(0xFFC9A84C),
                      fontSize: 24,
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Inquiry Sent',
                    style: TextStyle(
                      fontSize: 12,
                      color: Color(0xFFC9A84C),
                      letterSpacing: 2.5,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Thank You!',
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.w300,
                      color: Color(0xFFE0E0E0),
                      height: 0.9,
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'We\'ve received your integration inquiry and will get back to you within 24 hours.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 14,
                      color: Color(0xFFB0B0B0),
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: 32),
                  TextButton(
                    onPressed: () {
                      Navigator.pushNamed(context, '/dashboard');
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
                          'Back to Home',
                          style: TextStyle(
                            color: Color(0xFFB0B0B0),
                            fontSize: 12,
                            letterSpacing: 1.5,
                          ),
                        ),
                      ],
                    ),
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
            colors: [Color(0xFF0A0A0F), Color(0xFF1A1A1A)],
          ),
        ),
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Container(
              constraints: const BoxConstraints(maxWidth: 600),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  // Header
                  Column(
                    children: [
                      const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
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
                            'Integration Services',
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
                        'Inquire About\nIntegrations',
                        style: TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.w300,
                          color: Color(0xFFE0E0E0),
                          height: 0.9,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Need custom integrations or software services? Let us know your requirements.',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 14,
                          color: Color(0xFFB0B0B0),
                          height: 1.4,
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 48),

                  // Form
                  Container(
                    padding: const EdgeInsets.all(32.0),
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
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Name
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Full Name',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Color(0xFFE0E0E0),
                                  letterSpacing: 2,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const SizedBox(height: 8),
                              TextFormField(
                                controller: _nameController,
                                style: const TextStyle(
                                  color: Color(0xFFE0E0E0),
                                  fontSize: 14,
                                ),
                                decoration: const InputDecoration(
                                  hintText: 'Your full name',
                                  hintStyle: TextStyle(color: Color(0xFF7A7A8A)),
                                  border: OutlineInputBorder(
                                    borderSide: BorderSide(color: Color(0xFF404040)),
                                  ),
                                  enabledBorder: OutlineInputBorder(
                                    borderSide: BorderSide(color: Color(0xFF404040)),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderSide: BorderSide(color: Color(0xFFC9A84C)),
                                  ),
                                  contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                ),
                                validator: (value) {
                                  if (value == null || value.isEmpty) {
                                    return 'Please enter your name';
                                  }
                                  return null;
                                },
                              ),
                            ],
                          ),

                          const SizedBox(height: 24),

                          // Email
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Email Address',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Color(0xFFE0E0E0),
                                  letterSpacing: 2,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const SizedBox(height: 8),
                              TextFormField(
                                controller: _emailController,
                                keyboardType: TextInputType.emailAddress,
                                style: const TextStyle(
                                  color: Color(0xFFE0E0E0),
                                  fontSize: 14,
                                ),
                                decoration: const InputDecoration(
                                  hintText: 'your.email@company.com',
                                  hintStyle: TextStyle(color: Color(0xFF7A7A8A)),
                                  border: OutlineInputBorder(
                                    borderSide: BorderSide(color: Color(0xFF404040)),
                                  ),
                                  enabledBorder: OutlineInputBorder(
                                    borderSide: BorderSide(color: Color(0xFF404040)),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderSide: BorderSide(color: Color(0xFFC9A84C)),
                                  ),
                                  contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                ),
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
                            ],
                          ),

                          const SizedBox(height: 24),

                          // Phone
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Phone Number',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Color(0xFFE0E0E0),
                                  letterSpacing: 2,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const SizedBox(height: 8),
                              TextFormField(
                                controller: _phoneController,
                                keyboardType: TextInputType.phone,
                                style: const TextStyle(
                                  color: Color(0xFFE0E0E0),
                                  fontSize: 14,
                                ),
                                decoration: const InputDecoration(
                                  hintText: '+254 700 000 000',
                                  hintStyle: TextStyle(color: Color(0xFF7A7A8A)),
                                  border: OutlineInputBorder(
                                    borderSide: BorderSide(color: Color(0xFF404040)),
                                  ),
                                  enabledBorder: OutlineInputBorder(
                                    borderSide: BorderSide(color: Color(0xFF404040)),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderSide: BorderSide(color: Color(0xFFC9A84C)),
                                  ),
                                  contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                ),
                                validator: (value) {
                                  if (value == null || value.isEmpty) {
                                    return 'Please enter your phone number';
                                  }
                                  return null;
                                },
                              ),
                            ],
                          ),

                          const SizedBox(height: 24),

                          // Company
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Company',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Color(0xFFE0E0E0),
                                  letterSpacing: 2,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const SizedBox(height: 8),
                              TextFormField(
                                controller: _companyController,
                                style: const TextStyle(
                                  color: Color(0xFFE0E0E0),
                                  fontSize: 14,
                                ),
                                decoration: const InputDecoration(
                                  hintText: 'Company name (optional)',
                                  hintStyle: TextStyle(color: Color(0xFF7A7A8A)),
                                  border: OutlineInputBorder(
                                    borderSide: BorderSide(color: Color(0xFF404040)),
                                  ),
                                  enabledBorder: OutlineInputBorder(
                                    borderSide: BorderSide(color: Color(0xFF404040)),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderSide: BorderSide(color: Color(0xFFC9A84C)),
                                  ),
                                  contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                ),
                              ),
                            ],
                          ),

                          const SizedBox(height: 24),

                          // Service Type
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Service Type',
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
                                  value: _selectedService,
                                  isExpanded: true,
                                  dropdownColor: const Color(0xFF1A1A1A),
                                  style: const TextStyle(color: Color(0xFFE0E0E0)),
                                  underline: const SizedBox(),
                                  items: _services.map((service) {
                                    return DropdownMenuItem(
                                      value: service['value'],
                                      child: Text(service['label']!),
                                    );
                                  }).toList(),
                                  onChanged: (value) {
                                    if (value != null) {
                                      setState(() => _selectedService = value);
                                    }
                                  },
                                ),
                              ),
                            ],
                          ),

                          const SizedBox(height: 24),

                          // Message
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Project Details',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Color(0xFFE0E0E0),
                                  letterSpacing: 2,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const SizedBox(height: 8),
                              TextFormField(
                                controller: _messageController,
                                maxLines: 4,
                                style: const TextStyle(
                                  color: Color(0xFFE0E0E0),
                                  fontSize: 14,
                                ),
                                decoration: const InputDecoration(
                                  hintText: 'Describe your integration needs, timeline, and any specific requirements...',
                                  hintStyle: TextStyle(color: Color(0xFF7A7A8A)),
                                  border: OutlineInputBorder(
                                    borderSide: BorderSide(color: Color(0xFF404040)),
                                  ),
                                  enabledBorder: OutlineInputBorder(
                                    borderSide: BorderSide(color: Color(0xFF404040)),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderSide: BorderSide(color: Color(0xFFC9A84C)),
                                  ),
                                  contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                ),
                                validator: (value) {
                                  if (value == null || value.isEmpty) {
                                    return 'Please describe your project';
                                  }
                                  return null;
                                },
                              ),
                            ],
                          ),

                          const SizedBox(height: 32),

                          // Submit Button
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed: _isSubmitting ? null : _submitInquiry,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFFC9A84C),
                                foregroundColor: const Color(0xFF0A0A0F),
                                padding: const EdgeInsets.symmetric(vertical: 16),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(4),
                                ),
                              ),
                              child: _isSubmitting
                                  ? const SizedBox(
                                      width: 20,
                                      height: 20,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF0A0A0F)),
                                      ),
                                    )
                                  : const Text(
                                      'Send Inquiry',
                                      style: TextStyle(
                                        fontSize: 14,
                                        letterSpacing: 1.5,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                            ),
                          ),
                        ],
                      ),
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

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _companyController.dispose();
    _messageController.dispose();
    super.dispose();
  }
}