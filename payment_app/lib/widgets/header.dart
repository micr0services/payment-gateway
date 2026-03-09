import 'package:flutter/material.dart';

class Header extends StatelessWidget implements PreferredSizeWidget {
  const Header({super.key});

  @override
  Size get preferredSize => const Size.fromHeight(60);

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 60,
      decoration: BoxDecoration(
        color: const Color(0xFF0A0A0F).withOpacity(0.88),
        border: const Border(
          bottom: BorderSide(
            color: Color(0xFF404040),
            width: 1,
          ),
        ),
      ),
      child: Stack(
        children: [
          // Atmospheric layers
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    const Color(0xFFC9A84C).withOpacity(0.02),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
          // Grid overlay
          Positioned.fill(
            child: Opacity(
              opacity: 0.015,
              child: Container(
                decoration: BoxDecoration(
                  backgroundBlendMode: BlendMode.overlay,
                  image: const DecorationImage(
                    image: AssetImage('assets/grid.png'), // You'll need to add this asset
                    repeat: ImageRepeat.repeat,
                  ),
                ),
              ),
            ),
          ),

          // Content
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              children: [
                // Logo
                Row(
                  children: [
                    Container(
                      width: 28,
                      height: 28,
                      decoration: BoxDecoration(
                        border: Border.all(
                          color: const Color(0xFFC9A84C).withOpacity(0.35),
                          width: 1,
                        ),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Icon(
                        Icons.diamond,
                        color: Color(0xFFC9A84C),
                        size: 14,
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      'PayLedger',
                      style: TextStyle(
                        color: Color(0xFFE0E0E0),
                        fontSize: 18,
                        fontWeight: FontWeight.w300,
                        letterSpacing: 0.08,
                      ),
                    ),
                  ],
                ),

                const Spacer(),

                // Navigation items
                Row(
                  children: [
                    _NavItem(
                      icon: Icons.payment,
                      label: 'Make Payment',
                      onTap: () => Navigator.pushNamed(context, '/payment'),
                    ),
                    _NavItem(
                      icon: Icons.history,
                      label: 'Transactions',
                      isActive: true,
                      onTap: () => Navigator.pushNamed(context, '/dashboard'),
                    ),
                    _NavItem(
                      icon: Icons.integration_instructions,
                      label: 'Integrations',
                      onTap: () => Navigator.pushNamed(context, '/integrations'),
                    ),
                    _NavItem(
                      icon: Icons.work,
                      label: 'Projects',
                      onTap: () => Navigator.pushNamed(context, '/projects'),
                    ),
                  ],
                ),

                const Spacer(),

                // Status indicator
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF4CAF50),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Text(
                        'Live Data',
                        style: TextStyle(
                          color: Colors.black,
                          fontSize: 10,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Row(
                      children: [
                        Container(
                          width: 6,
                          height: 6,
                          decoration: const BoxDecoration(
                            color: Color(0xFF4CAF50),
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 6),
                        const Text(
                          'Systems Operational',
                          style: TextStyle(
                            color: Color(0xFFE0E0E0),
                            fontSize: 10,
                            letterSpacing: 0.06,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(width: 12),
                    Container(
                      width: 1,
                      height: 18,
                      color: const Color(0xFF404040),
                    ),
                    const SizedBox(width: 12),
                    Text(
                      DateTime.now().toString().split(' ')[0].split('-').reversed.join('/'),
                      style: const TextStyle(
                        color: Color(0xFF7A7A8A),
                        fontSize: 10,
                        letterSpacing: 0.04,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isActive;
  final VoidCallback onTap;

  const _NavItem({
    required this.icon,
    required this.label,
    this.isActive = false,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              children: [
                Icon(
                  icon,
                  size: 16,
                  color: isActive ? const Color(0xFFE8C97A) : const Color(0xFF7A7A8A),
                ),
                const SizedBox(width: 6),
                Text(
                  label,
                  style: TextStyle(
                    color: isActive ? const Color(0xFFE8C97A) : const Color(0xFF7A7A8A),
                    fontSize: 10,
                    letterSpacing: 0.18,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                if (isActive) ...[
                  const SizedBox(width: 4),
                  Container(
                    width: 4,
                    height: 4,
                    decoration: const BoxDecoration(
                      color: Color(0xFFC9A84C),
                      shape: BoxShape.circle,
                    ),
                  ),
                ],
              ],
            ),
            if (isActive) ...[
              const SizedBox(height: 4),
              Container(
                height: 1,
                width: 60,
                color: const Color(0xFFC9A84C),
              ),
            ],
          ],
        ),
      ),
    );
  }
}