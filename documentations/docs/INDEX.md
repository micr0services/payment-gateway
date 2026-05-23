# Payment Gateway API Documentation

Complete API reference and integration guides for the Payment Gateway Platform.

## 📚 Table of Contents

### Getting Started
- [Introduction](./INTRODUCTION.md)
- [Authentication](./guides/AUTHENTICATION.md)
- [Error Handling](./guides/ERROR_HANDLING.md)

### API Reference

#### Payment Gateways
- [Stripe Integration](./api/stripe/README.md)
  - [Create Payment Intent](./api/stripe/CREATE_PAYMENT.md)
  - [Get Payment Status](./api/stripe/GET_STATUS.md)
  - [Cancel Payment](./api/stripe/CANCEL_PAYMENT.md)
  - [Refund Payment](./api/stripe/REFUND_PAYMENT.md)

- [PayPal Integration](./api/paypal/README.md)
  - [Create Order](./api/paypal/CREATE_ORDER.md)
  - [Verify Order](./api/paypal/VERIFY_ORDER.md)

- [M-Pesa Integration](./api/mpesa/README.md)
  - [STK Push](./api/mpesa/STK_PUSH.md)
  - [Query STK Status](./api/mpesa/QUERY_STK_STATUS.md)
  - [B2C Transfer](./api/mpesa/B2C.md)
  - [C2B Collection](./api/mpesa/C2B.md)
  - [B2B Payment](./api/mpesa/B2B.md)
  - [Reversal](./api/mpesa/REVERSAL.md)

#### Transaction Management
- [Transactions API](./api/transactions/README.md)
  - [Get All Transactions](./api/transactions/GET_ALL.md)
  - [Get Transaction by ID](./api/transactions/GET_BY_ID.md)
  - [Create Transaction](./api/transactions/CREATE.md)
  - [Update Transaction](./api/transactions/UPDATE.md)

#### Webhooks
- [Webhooks Documentation](./api/webhooks/README.md)
  - [Stripe Webhooks](./api/webhooks/STRIPE_WEBHOOKS.md)
  - [PayPal Webhooks](./api/webhooks/PAYPAL_WEBHOOKS.md)
  - [M-Pesa Webhooks](./api/webhooks/MPESA_WEBHOOKS.md)
  - [Callback URLs](./api/webhooks/CALLBACK_URLS.md)

### Integration Guides
- [Quick Start](./integration/QUICKSTART.md)
- [Sandbox Testing](./integration/SANDBOX_TESTING.md)
- [Production Deployment](./integration/PRODUCTION_DEPLOYMENT.md)
- [Security Best Practices](./integration/SECURITY.md)

### Reference
- [Existing Documentation](./guides/EXISTING_DOCS.md)

## 🚀 Quick Links

| Gateway | Documentation | Status |
|---------|-------------|--------|
| **Stripe** | [View Docs](./api/stripe/README.md) | ✅ Production Ready |
| **PayPal** | [View Docs](./api/paypal/README.md) | ✅ Production Ready |
| **M-Pesa** | [View Docs](./api/mpesa/README.md) | ✅ Production Ready |
| **Transactions** | [View Docs](./api/transactions/README.md) | ✅ Production Ready |
| **Webhooks** | [View Docs](./api/webhooks/README.md) | ✅ Production Ready |

## 📋 API Endpoints Quick Reference

### Payment Endpoints
```
POST   /api/payments/stripe                    # Create Stripe payment
POST   /api/payments/paypal                    # Create PayPal order
POST   /api/payments/paypal/verify             # Verify PayPal order
POST   /api/payments/mpesa/stk                 # Initiate M-Pesa STK push
POST   /api/payments/mpesa/stk/query           # Query STK status
POST   /api/payments/mpesa/b2c                 # M-Pesa B2C transfer
POST   /api/payments/mpesa/c2b                 # M-Pesa C2B collection
POST   /api/payments/mpesa/b2b                 # M-Pesa B2B payment
POST   /api/payments/mpesa/reversal            # M-Pesa transaction reversal
```

### Transaction Endpoints
```
GET    /api/transactions/all                   # Get all transactions
GET    /api/transactions/:id                   # Get transaction by ID
POST   /api/transactions                       # Create transaction
PUT    /api/transactions/:id                   # Update transaction
```

### Webhook Endpoints
```
POST   /api/webhooks/stripe                    # Stripe webhook handler
POST   /api/webhooks/paypal                    # PayPal webhook handler
POST   /api/webhooks/mpesa                     # M-Pesa webhook handler
```

## 🔐 Authentication

All API requests require authentication using an API key or OAuth token. See [Authentication Guide](./guides/AUTHENTICATION.md) for details.

## 💡 Common Use Cases

1. **Simple Payment Processing**: [Create a payment with Stripe](./api/stripe/CREATE_PAYMENT.md)
2. **M-Pesa Mobile Money**: [STK Push Guide](./api/mpesa/STK_PUSH.md)
3. **Webhook Integration**: [Setup Callbacks](./api/webhooks/CALLBACK_URLS.md)
4. **Transaction Tracking**: [Query Transactions](./api/transactions/GET_ALL.md)
5. **Payment Refunds**: [Refund a Payment](./api/stripe/REFUND_PAYMENT.md)

## 🔗 Related Resources

- [Stripe Developer Docs](https://stripe.com/docs/api)
- [PayPal Developer Docs](https://developer.paypal.com/docs/)
- [M-Pesa API Documentation](https://developer.safaricom.co.ke/APIs)
- [Project README](../README.md)
- [Architecture Overview](../ARCHITECTURE.md)

## 📞 Support

For issues, questions, or feature requests, please refer to the main project repository.

---

**Last Updated:** 2026-05-09  
**API Version:** 1.0.0  
**Status:** Production Ready
