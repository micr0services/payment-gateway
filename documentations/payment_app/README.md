# Payment App (Flutter)

A Flutter mobile application that integrates with the Payment Gateway API to process payments via Stripe and PayPal.

## Features

- **Stripe Payments**: Secure credit card payments with Stripe Elements
- **PayPal Payments**: PayPal checkout integration
- **Transaction History**: View all payment transactions with filtering
- **Cross-platform**: Works on Android and iOS
- **Real-time Updates**: Live transaction status updates

## Setup

1. **Install Flutter** (if not already installed):
   ```bash
   # Download from https://flutter.dev/docs/get-started/install
   flutter doctor
   ```

2. **Install Dependencies**:
   ```bash
   cd flutter_app/payment_app
   flutter pub get
   ```

3. **Configure Stripe**:
   - The Stripe publishable key is already configured in `lib/main.dart`
   - For production, update with your live keys

4. **Run the App**:
   ```bash
   flutter run
   ```

## Project Structure

```
lib/
├── models/
│   └── transaction.dart          # Transaction data model
├── providers/
│   └── payment_provider.dart     # State management for payments
├── screens/
│   ├── home_screen.dart          # Main navigation screen
│   ├── payment_screen.dart       # Payment form and methods
│   └── transactions_screen.dart  # Transaction history
├── services/
│   └── api_service.dart          # API communication service
├── widgets/
│   ├── stripe_payment_widget.dart # Stripe payment UI
│   └── paypal_payment_widget.dart # PayPal payment UI
└── main.dart                     # App entry point
```

## API Integration

The app communicates with the Cloudflare Worker API at:
`https://payment-gateway.kimaniwilfred95.workers.dev`

### Endpoints Used:
- `POST /api/payments/stripe` - Create Stripe payment intent
- `POST /api/payments/paypal` - Create PayPal order
- `POST /api/payments/paypal/confirm/{orderId}` - Confirm PayPal payment
- `GET /api/transactions` - Fetch transaction history

## Payment Flow

### Stripe Payment:
1. User enters amount and card details
2. App creates payment intent via API
3. Stripe processes the payment
4. Transaction status updates in real-time

### PayPal Payment:
1. User selects PayPal payment
2. App creates PayPal order via API
3. User would be redirected to PayPal (simulated in demo)
4. App confirms payment after approval

## Building for Production

### Android:
```bash
flutter build apk --release
```

### iOS:
```bash
flutter build ios --release
```

## Environment Configuration

For different environments, you can create flavor configurations:

1. Create `lib/config/` directory
2. Add environment-specific config files
3. Update `main.dart` to load appropriate config based on flavor

## Security Notes

- Never store secret keys in the app
- All payment processing happens server-side
- Use HTTPS for all API communications
- Validate all user inputs

## Troubleshooting

### Common Issues:

1. **Stripe Payment Fails**: Check Stripe dashboard for error details
2. **PayPal Not Working**: Verify PayPal credentials in the worker
3. **Network Errors**: Ensure device has internet connection
4. **Build Issues**: Run `flutter clean` and `flutter pub get`

### Debug Mode:
```bash
flutter run --debug
```

## Contributing

1. Follow Flutter best practices
2. Use Provider for state management
3. Write clean, readable code
4. Test on both Android and iOS
