import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/payment_provider.dart';
import '../widgets/header.dart';
import 'payment_screen.dart';
import 'transactions_screen.dart';
import 'integrations_screen.dart';
import 'projects_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;
  bool _isMenuOpen = false;

  static final List<Widget> _screens = [
    TransactionsScreen(),
    PaymentScreen(),
    ProjectsScreen(),
    IntegrationsScreen(),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
      _isMenuOpen = false; // Close menu when navigating
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const Header(),
      body: Stack(
        children: [
          // Background effects
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    const Color(0xFF0A0A0F),
                    const Color(0xFF1A1A1A),
                  ],
                ),
              ),
            ),
          ),

          // Main content
          _screens[_selectedIndex],

          // Mobile Menu Button (only show on mobile)
          if (MediaQuery.of(context).size.width < 768) ...[
            Positioned(
              top: 16,
              right: 16,
              child: Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  border: Border.all(
                    color: const Color(0xFFC9A84C).withOpacity(0.3),
                    width: 1,
                  ),
                  color: const Color(0xFF0A0A0F).withOpacity(0.9),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: IconButton(
                  onPressed: () => setState(() => _isMenuOpen = !_isMenuOpen),
                  icon: AnimatedIcon(
                    icon: AnimatedIcons.menu_close,
                    progress: _isMenuOpen
                        ? const AlwaysStoppedAnimation(1.0)
                        : const AlwaysStoppedAnimation(0.0),
                    color: const Color(0xFFC9A84C),
                    size: 20,
                  ),
                ),
              ),
            ),

            // Mobile Dropdown Menu
            if (_isMenuOpen)
              Positioned(
                top: 72,
                right: 16,
                child: Container(
                  width: 200,
                  decoration: BoxDecoration(
                    color: const Color(0xFF0A0A0F).withOpacity(0.95),
                    border: Border.all(
                      color: const Color(0xFFC9A84C).withOpacity(0.3),
                      width: 1,
                    ),
                    borderRadius: BorderRadius.circular(8),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.5),
                        blurRadius: 20,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      _MenuItem(
                        icon: Icons.history,
                        label: 'Dashboard',
                        isSelected: _selectedIndex == 0,
                        onTap: () => _onItemTapped(0),
                      ),
                      _MenuItem(
                        icon: Icons.integration_instructions,
                        label: 'Integrations',
                        isSelected: _selectedIndex == 3,
                        onTap: () => _onItemTapped(3),
                      ),
                      const Divider(color: Color(0xFF404040), height: 1),
                      _MenuItem(
                        icon: Icons.payment,
                        label: 'Pay Stripe',
                        onTap: () => Navigator.pushNamed(context, '/stripe'),
                      ),
                      _MenuItem(
                        icon: Icons.account_balance_wallet,
                        label: 'Pay PayPal',
                        onTap: () => Navigator.pushNamed(context, '/paypal'),
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ],
      ),

      // Desktop Bottom Navigation
      bottomNavigationBar: MediaQuery.of(context).size.width >= 768
          ? BottomNavigationBar(
              items: const <BottomNavigationBarItem>[
                BottomNavigationBarItem(
                  icon: Icon(Icons.history),
                  label: 'Transactions',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.payment),
                  label: 'Pay',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.work),
                  label: 'Projects',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.integration_instructions),
                  label: 'Integrations',
                ),
              ],
              currentIndex: _selectedIndex,
              selectedItemColor: const Color(0xFFC9A84C),
              unselectedItemColor: const Color(0xFFB0B0B0),
              backgroundColor: const Color(0xFF1A1A1A),
              showSelectedLabels: true,
              showUnselectedLabels: true,
              onTap: _onItemTapped,
            )
          : null,
    );
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _MenuItem({
    required this.icon,
    required this.label,
    this.isSelected = false,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            Icon(
              icon,
              size: 18,
              color: isSelected ? const Color(0xFFC9A84C) : const Color(0xFFE0E0E0),
            ),
            const SizedBox(width: 12),
            Text(
              label,
              style: TextStyle(
                color: isSelected ? const Color(0xFFC9A84C) : const Color(0xFFE0E0E0),
                fontSize: 14,
                fontFamily: 'monospace',
                letterSpacing: 0.02,
              ),
            ),
          ],
        ),
      ),
    );
  }
}