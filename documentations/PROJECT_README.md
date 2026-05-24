# Payment Gateway Project

A complete payment processing solution with Cloudflare Workers backend, Next.js web frontend, and Flutter mobile app.

## Project Structure

```
payment-gateway/
├── src/                    # Cloudflare Worker backend
├── migrations/            # Database migrations
├── scripts/               # Utility scripts
├── wrangler.toml         # Cloudflare Worker config
├── web/                  # Next.js web application
│   └── src/
│       ├── app/          # Next.js app router
│       ├── components/   # React components
│       └── lib/          # Utilities
└── flutter_app/          # Flutter mobile application
    └── payment_app/
        └── lib/          # Flutter app code
```

## Components

### 1. Backend (Cloudflare Workers)
- **Location**: `src/`
- **Technology**: Hono.js, TypeScript
- **Features**:
  - Stripe & PayPal payment processing
  - Idempotency support
  - Transaction storage in PostgreSQL
  - Webhook handling
  - OpenAPI documentation

### 2. Web Frontend (Next.js)
- **Location**: `web/`
- **Technology**: Next.js 14, TypeScript, Tailwind CSS
- **Features**:
  - Payment forms for Stripe & PayPal
  - Transaction history viewer
  - Responsive design
  - API integration

### 3. Mobile App (Flutter)
- **Location**: `flutter_app/payment_app/`
- **Technology**: Flutter, Dart
- **Features**:
  - Native mobile payment UI
  - Stripe Elements integration
  - PayPal payment flow
  - Transaction management
  - Cross-platform (Android & iOS)

## Quick Start

### Prerequisites
- Node.js 18+
- Flutter SDK
- PostgreSQL database
- Cloudflare account (for deployment)

### Backend Setup
```bash
# Install dependencies
npm install

# Set up database
npm run migrate

# Configure environment variables in wrangler.toml
# Deploy to Cloudflare
npm run deploy
```

### Web Frontend Setup
```bash
cd web
npm install
cp .env.example .env.local
# Edit .env.local with your configuration
npm run dev
```

### Mobile App Setup
```bash
cd flutter_app/payment_app
flutter pub get
flutter run
```

## API Endpoints

### Payments
- `POST /api/payments/stripe` - Create Stripe payment intent
- `POST /api/payments/paypal` - Create PayPal order
- `POST /api/payments/paypal/confirm/{orderId}` - Confirm PayPal payment
- `GET /api/payments/stripe/{paymentIntentId}` - Get payment status
- `POST /api/payments/stripe/{paymentIntentId}/cancel` - Cancel payment
- `POST /api/payments/stripe/{paymentIntentId}/refund` - Refund payment
- `POST /api/payments/stripe/{paymentIntentId}/confirm` - Confirm payment (testing)

### Transactions
- `GET /api/transactions` - List transactions with filters

### Webhooks
- `POST /api/webhooks/stripe` - Stripe webhook handler

## Environment Variables

### Backend (wrangler.toml)
```toml
[vars]
DATABASE_URL = "postgresql://..."
STRIPE_SECRET_KEY = "sk_test_..."
STRIPE_PUBLISHABLE_KEY = "pk_test_..."
STRIPE_WEBHOOK_SECRET = "whsec_..."
PAYPAL_CLIENT_ID = "AS3Vq..."
PAYPAL_CLIENT_SECRET = "EOm43..."
PAYPAL_ENVIRONMENT = "live"
```

### Web Frontend (.env.local)
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_PAYPAL_CLIENT_ID=AS3Vq...
NEXT_PUBLIC_WORKER_URL=https://your-worker.workers.dev
```

## Development

### Testing Payments
1. Use Stripe test cards: `4242 4242 4242 4242`
2. Use PayPal sandbox accounts
3. Check transaction history in both web and mobile apps

### Database
- Uses PostgreSQL with migrations
- **Schema**: `vico_payment_schema` - Dedicated payment processing schema
- **Table**: `vico_payment_schema.payment_transactions` - Stores all payment data
  - Tracks transaction status and metadata
  - Stores payment provider IDs (Stripe, PayPal)
  - Manages callback and cancel URLs
- Idempotency keys prevent duplicate processing
- Comprehensive indexing for optimized query performance

### Security
- All sensitive operations server-side
- Webhook signature verification
- Input validation and sanitization
- HTTPS required for production

## Deployment

### Backend
```bash
npm run deploy  # Deploys to Cloudflare Workers
```

### Web Frontend
```bash
cd web
npm run build
npm run start  # Or deploy to Vercel, Netlify, etc.
```

### Mobile App
```bash
cd flutter_app/payment_app
flutter build apk  # Android
flutter build ios  # iOS
```

## Contributing

1. Follow existing code patterns
2. Add tests for new features
3. Update documentation
4. Test on all platforms (web, Android, iOS)

## License

MIT License - see LICENSE file for details