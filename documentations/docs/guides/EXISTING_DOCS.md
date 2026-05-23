# Existing Documentation

All existing documentation files have been organized into the `docs/` folder. Below is a mapping of the original files to their new locations.

## Documentation Files

| Original Location | New Location | Purpose |
|------------------|--------------|---------|
| `/README.md` | `/docs/guides/EXISTING_DOCS.md` | Project overview |
| `/PROJECT_README.md` | `/docs/guides/PROJECT_STRUCTURE.md` | Project structure |
| `/CALLBACK_FEATURE.md` | `/docs/api/webhooks/CALLBACK_URLS_DETAILS.md` | Callback feature details |
| `/CALLBACK_IMPLEMENTATION.md` | `/docs/api/webhooks/IMPLEMENTATION.md` | Implementation guide |
| `/CALLBACK_QUICK_REFERENCE.md` | `/docs/api/webhooks/QUICK_REFERENCE.md` | Quick reference |
| `/OPTIMIZATION_SUMMARY.md` | `/docs/integration/OPTIMIZATION_NOTES.md` | Optimization notes |

## Quick Links

- **Getting Started**: [Introduction](../INTRODUCTION.md)
- **API Reference**: [Index](../INDEX.md)
- **Security**: [Security Best Practices](SECURITY.md)
- **Testing**: [Sandbox Testing](SANDBOX_TESTING.md)
- **Errors**: [Error Handling](ERROR_HANDLING.md)

## Content Overview

### Original README.md Contents
- Project overview and features
- Architecture diagram
- Quick start instructions
- Platform coverage details
- Security and reliability information

**Location**: See [INTRODUCTION.md](../INTRODUCTION.md) for similar content

### Original PROJECT_README.md Contents
- Project structure breakdown
- Component descriptions (Backend, Web, Mobile)
- Quick start guides
- API endpoints list

**Location**: See [API Reference](../INDEX.md) for endpoint documentation

### Original Callback Files Contents
- Callback URL feature overview
- Implementation details
- Quick reference guide
- Retry logic and error handling

**Location**: See [Webhooks Guide](../api/webhooks/README.md) for comprehensive documentation

### Original OPTIMIZATION_SUMMARY.md Contents
- Bug fixes and optimizations
- Amount conversion details
- Database performance improvements
- Currency support information

**Location**: See [Introduction](../INTRODUCTION.md) for features, or specific API guides for implementation details

## How to Use This Documentation

### For New Developers
1. Start with [Introduction](../INTRODUCTION.md)
2. Review your provider: [Stripe](../api/stripe/README.md), [PayPal](../api/paypal/README.md), or [M-Pesa](../api/mpesa/README.md)
3. Setup webhooks: [Webhooks Guide](../api/webhooks/README.md)
4. Review security: [Security Best Practices](SECURITY.md)

### For Integration
1. Review [Authentication](AUTHENTICATION.md)
2. Check [Sandbox Testing](SANDBOX_TESTING.md)
3. Implement error handling: [Error Handling](ERROR_HANDLING.md)
4. Set up production: [Production Deployment](PRODUCTION_DEPLOYMENT.md)

### For Operations
1. Monitor [Transactions API](../api/transactions/README.md)
2. Review [Webhooks](../api/webhooks/README.md)
3. Check [Troubleshooting](TROUBLESHOOTING.md)
4. Reference [Security](SECURITY.md)

## Search Index

**Payment Gateways**
- Stripe: [API Docs](../api/stripe/README.md)
- PayPal: [API Docs](../api/paypal/README.md)
- M-Pesa: [API Docs](../api/mpesa/README.md)

**Core Concepts**
- Callbacks: [Webhooks](../api/webhooks/README.md)
- Authentication: [Auth Guide](AUTHENTICATION.md)
- Transactions: [Transactions API](../api/transactions/README.md)

**Guides**
- Security: [Best Practices](SECURITY.md)
- Testing: [Sandbox Guide](SANDBOX_TESTING.md)
- Errors: [Troubleshooting](ERROR_HANDLING.md)

---

**Last Updated**: 2026-05-09
