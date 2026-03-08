import 'package:flutter/material.dart';
import 'package:flutter_stripe/flutter_stripe.dart';
import 'package:provider/provider.dart';
import 'providers/payment_provider.dart';
import 'screens/home_screen.dart';
import 'screens/payment_screen.dart';
import 'screens/paypal_payment_screen.dart';
import 'screens/projects_screen.dart';
import 'screens/integrations_screen.dart';
import 'screens/stripe_payment_screen.dart';
import 'screens/payment_success_screen.dart';
import 'screens/payment_cancel_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Stripe
  Stripe.publishableKey = 'pk_test_51RETBFE1RNkEVzu6CowibRGFX3AaY9jbBHBozYv2HVlVEIOAasB3cDvcMZ1NTN06ssF0M8qANm3M8F4fNbARcrDo00YV3x2pr9';

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => PaymentProvider()),
      ],
      child: MaterialApp(
        title: 'PayLedger',
        theme: ThemeData.dark().copyWith(
          colorScheme: const ColorScheme.dark(
            primary: Color(0xFFC9A84C), // Gold color
            secondary: Color(0xFFC9A84C),
            surface: Color(0xFF1A1A1A), // Dark surface
            background: Color(0xFF0A0A0F), // Obsidian background
            onPrimary: Color(0xFF0A0A0F),
            onSecondary: Color(0xFF0A0A0F),
            onSurface: Color(0xFFE0E0E0), // Light text
            onBackground: Color(0xFFE0E0E0),
          ),
          scaffoldBackgroundColor: const Color(0xFF0A0A0F),
          appBarTheme: const AppBarTheme(
            backgroundColor: Color(0xFF0A0A0F),
            foregroundColor: Color(0xFFE0E0E0),
            elevation: 0,
          ),
          elevatedButtonTheme: ElevatedButtonThemeData(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFC9A84C),
              foregroundColor: const Color(0xFF0A0A0F),
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),
          inputDecorationTheme: InputDecorationTheme(
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: Color(0xFFC9A84C)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: Color(0xFF404040)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: Color(0xFFC9A84C)),
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            labelStyle: const TextStyle(color: Color(0xFFE0E0E0)),
            hintStyle: const TextStyle(color: Color(0xFF808080)),
          ),
          textTheme: const TextTheme(
            bodyLarge: TextStyle(color: Color(0xFFE0E0E0)),
            bodyMedium: TextStyle(color: Color(0xFFE0E0E0)),
          ),
        ),
        home: const HomeScreen(),
        routes: {
          '/payment': (context) => PaymentScreen(),
          '/paypal': (context) => PayPalPaymentScreen(),
          '/stripe': (context) => StripePaymentScreen(),
          '/success': (context) => PaymentSuccessScreen(),
          '/cancel': (context) => PaymentCancelScreen(),
          '/projects': (context) => ProjectsScreen(),
          '/integrations': (context) => IntegrationsScreen(),
        },
      ),
    );
  }
}
