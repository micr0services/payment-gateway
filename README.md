# Payment Gateway Platform

A comprehensive, multi-platform payment processing solution built with modern web technologies. This project provides a complete payment gateway ecosystem supporting multiple payment providers, real-time notifications, and cross-platform applications.

## 🎯 What This Project Covers

### Core Payment Processing
- **Dual Payment Provider Support**: Full integration with both Stripe and PayPal
- **Multi-Currency Transactions**: Support for USD, EUR, GBP, and other major currencies
- **Idempotency Protection**: Prevents duplicate transactions with unique request keys
- **Automatic Retry Logic**: Failed payments are retried up to 3 times with exponential backoff
- **Webhook Handling**: Real-time payment status updates from payment providers
- **Transaction Persistence**: All transactions stored in PostgreSQL with full audit trail

### Platform Coverage
- **Cloudflare Workers Backend**: Serverless API with global CDN deployment and low latency
- **Next.js Web Application**: Modern React-based frontend with responsive design and dark theme
- **Flutter Mobile App**: Native Android and iOS applications with platform-specific optimizations
- **SMS Notifications**: Automated SMS alerts for payment confirmations and admin notifications
- **Integration Services**: Contact forms with SMS notifications for business inquiries

### Security & Reliability
- **PCI Compliance**: Secure payment processing with encrypted data transmission
- **Input Validation**: Comprehensive validation and sanitization of all user inputs
- **Environment-Based Configuration**: Separate sandbox and production environments
- **Error Handling**: Robust error handling with detailed logging and user-friendly messages
- **SSL/TLS Encryption**: All communications secured with HTTPS

### User Experience Features
- **Responsive Design**: Mobile-first design that works seamlessly across all devices
- **Dark Theme**: Modern dark UI with custom color scheme (obsidian, gold, surface colors)
- **Real-time Updates**: Live transaction status updates and payment confirmations
- **Multi-language Support**: Internationalization ready with proper currency formatting
- **Accessibility**: WCAG compliant design with proper contrast ratios and keyboard navigation

### Business Features
- **Transaction Dashboard**: Comprehensive transaction history with filtering and search
- **Payment Analytics**: Transaction volume, success rates, and revenue tracking
- **Admin Notifications**: SMS alerts to administrators for new integrations and payments
- **Customer Communication**: Automated email and SMS confirmations
- **Integration Management**: Contact forms for business development and partnerships

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Frontend  │    │ Mobile App      │    │   Admin Panel   │
│   (Next.js)     │    │   (Flutter)     │    │   (Next.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │ Cloudflare     │
                    │ Workers API    │
                    │ (Hono.js)      │
                    └─────────────────┘
                             │
                    ┌─────────────────┐
                    │ PostgreSQL     │
                    │ Database       │
                    └─────────────────┘
                             │
                ┌────────────────────┐
                │ Payment Providers │
                │ Stripe │ PayPal   │
                └────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Flutter SDK (for mobile development)
- PostgreSQL database
- Cloudflare account (for deployment)
- Stripe and PayPal developer accounts

### Backend Setup
```bash
# Install dependencies
npm install

# Set up database
npm run migrate

# Configure environment variables
# Edit wrangler.toml with your API keys

# Start development server
npm run dev

# Deploy to production
npm run deploy
```

### Web Frontend Setup
```bash
cd payment_web
npm install
npm run dev
```

### Mobile App Setup
```bash
cd payment_app
flutter pub get
flutter run
```

## 📱 Platform-Specific Features

### Web Application (`payment_web/`)
- **Payment Forms**: Dedicated pages for Stripe and PayPal payments
- **Transaction History**: Filterable table with responsive mobile design
- **Integration Contact**: SMS-enabled contact forms for business inquiries
- **Success/Cancel Pages**: Branded confirmation pages with dark theme
- **Admin Dashboard**: Transaction monitoring and analytics

### Mobile Application (`payment_app/`)
- **Native Payment UI**: Platform-optimized payment interfaces
- **Offline Support**: Basic functionality without internet connection
- **Push Notifications**: Real-time payment status updates
- **Biometric Authentication**: Secure payment confirmation
- **Transaction History**: Native mobile-optimized transaction lists

### Backend API (`src/`)
- **RESTful Endpoints**: Clean API design with OpenAPI documentation
- **Webhook Processing**: Secure webhook handling with signature verification
- **SMS Integration**: HTTP SMS provider for notifications
- **Database Abstraction**: TypeORM-based data access layer
- **Global Deployment**: Cloudflare Workers for worldwide low-latency access

## 🔧 Technology Stack

### Backend
- **Runtime**: Cloudflare Workers (V8 isolates)
- **Framework**: Hono.js (fast, lightweight web framework)
- **Language**: TypeScript
- **Database**: PostgreSQL with connection pooling
- **ORM**: TypeORM with migrations
- **Payments**: Stripe SDK, PayPal SDK
- **SMS**: HTTP SMS provider integration

### Web Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom dark theme
- **State Management**: React hooks and context
- **Payment Integration**: Stripe Elements, PayPal Buttons
- **Fonts**: Geist Sans and Geist Mono

### Mobile App
- **Framework**: Flutter with Dart
- **Architecture**: Provider pattern for state management
- **Platform Support**: Android (API 21+) and iOS (12+)
- **Payment Integration**: Stripe SDK, PayPal SDK
- **UI Components**: Material Design and Cupertino widgets

## 📊 API Endpoints

### Payment Processing
- `POST /api/payments/stripe` - Create Stripe payment intent
- `POST /api/payments/paypal` - Create PayPal order
- `POST /api/payments/paypal/confirm/{orderId}` - Capture PayPal payment
- `GET /api/transactions` - List transactions with filtering
- `GET /api/transactions/{id}` - Get specific transaction details

### Business Integration
- `POST /api/integrations` - Submit integration inquiries with SMS notifications
- `POST /api/sms` - Send SMS messages (admin notifications)

### Webhooks
- `POST /api/webhooks/stripe` - Handle Stripe webhook events
- `POST /api/webhooks/paypal` - Handle PayPal webhook events

## 🔒 Security Features

- **API Key Management**: Secure storage of payment provider credentials
- **Request Signing**: Webhook signature verification
- **Input Sanitization**: XSS and injection protection
- **Rate Limiting**: DDoS protection with request throttling
- **Audit Logging**: Complete transaction and API call logging
- **Environment Isolation**: Separate configurations for development/staging/production

## 📈 Monitoring & Analytics

- **Transaction Metrics**: Success rates, failure analysis, revenue tracking
- **Performance Monitoring**: API response times and error rates
- **Payment Analytics**: Provider comparison, currency analysis
- **User Behavior**: Conversion funnel analysis and drop-off points
- **System Health**: Database performance and API availability monitoring

## 🚀 Deployment

### Backend (Cloudflare Workers)
```bash
npm run deploy
```
Deploys globally with zero cold starts and automatic scaling.

### Web Frontend (Vercel/Netlify)
```bash
cd payment_web
npm run build
# Deploy build/ directory to your hosting provider
```

### Mobile Apps (App Stores)
```bash
cd payment_app
flutter build apk  # Android APK
flutter build ios  # iOS archive
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Ensure all platforms build successfully
5. Submit a pull request with detailed description

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: Comprehensive API docs and integration guides
- **Issues**: GitHub issues for bug reports and feature requests
- **Discussions**: GitHub discussions for questions and community support
- **Security**: security@example.com for security-related concerns
POST /api/payments/stripe/{paymentIntentId}/refund

### PayPal Payment
POST /api/payments/paypal
Headers: Idempotency-Key
Body: { "amount": 1000, "currency": "USD", "metadata": {} }

POST /api/payments/paypal/confirm/:orderId

### Transactions
GET /api/transactions

### Webhooks
POST /api/webhooks/stripe

## Security

- Use HTTPS in production
- Validate all inputs
- Use strong secrets
- Monitor for anomalies

## Database Schema

Migrations are managed under `src/migration` using TypeORM. Run the
`typeorm:migrate` script to apply any pending migrations:

```bash
npm run typeorm:migrate
```

The initial schema is created by the TypeORM migration in
`src/migration/1688612345678-CreateTransactions.ts`.
