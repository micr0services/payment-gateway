import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { apiReference } from '@scalar/hono-api-reference';
import stripeRouter from './routes/stripe';
import paypalRouter from './routes/paypal';
import paypalConfirmRouter from './routes/paypalConfirm';
import transactionsRouter from './routes/transactions';
import webhooksRouter from './routes/webhooks';

const app = new Hono<{
  Bindings: {
    STRIPE_SECRET_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
    PAYPAL_ENVIRONMENT: string;
    PAYPAL_CLIENT_ID: string;
    PAYPAL_CLIENT_SECRET: string;
    DATABASE_URL: string;
  };
  Variables: {
    idempotencyKey: string;
  };
}>();

// Middleware
app.use('*', cors());

// API Documentation
app.get('/api-docs', apiReference({
  url: '/api/openapi.json',
}));

// Routes
app.route('/api/payments', stripeRouter);
app.route('/api/payments', paypalRouter);
app.route('/api/payments', paypalConfirmRouter);
app.route('/api', transactionsRouter);
app.route('/api/webhooks', webhooksRouter);

// OpenAPI specification
app.get('/api/openapi.json', (c) => {
  return c.json({
    openapi: '3.0.0',
    info: {
      title: 'Payment Gateway API',
      version: '1.0.0',
      description: 'A secure payment gateway supporting PayPal and Stripe with idempotency and retry logic',
    },
    servers: [
      {
        url: 'https://payment-gateway.kimaniwilfred95.workers.dev',
        description: 'Production server',
      },
    ],
    paths: {
      '/api/payments/stripe': {
        post: {
          summary: 'Create Stripe Payment Intent',
          description: 'Creates a new Stripe payment intent with idempotency support',
          tags: ['Payments'],
          security: [],
          parameters: [
            {
              name: 'Idempotency-Key',
              in: 'header',
              required: true,
              schema: { type: 'string' },
              description: 'Unique key to prevent duplicate payments',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    amount: { type: 'integer', description: 'Payment amount in cents (e.g., 50 for $0.50)' },
                    currency: { type: 'string', default: 'usd', description: 'Currency code' },
                    metadata: { type: 'object', description: 'Additional metadata' },
                  },
                  required: ['amount'],
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Payment intent created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      clientSecret: { type: 'string' },
                      transactionId: { type: 'string' },
                    },
                  },
                },
              },
            },
            '400': { description: 'Bad request' },
            '409': { description: 'Transaction already exists' },
            '500': { description: 'Internal server error' },
          },
        },
      },
      '/api/payments/paypal': {
        post: {
          summary: 'Create PayPal Order',
          description: 'Creates a new PayPal order with idempotency support',
          tags: ['Payments'],
          parameters: [
            {
              name: 'Idempotency-Key',
              in: 'header',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    amount: { type: 'integer', description: 'Payment amount in cents' },
                    currency: { type: 'string', default: 'USD' },
                    metadata: { type: 'object' },
                  },
                  required: ['amount'],
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'PayPal order created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      orderId: { type: 'string' },
                      links: { type: 'array' },
                    },
                  },
                },
              },
            },
            '400': { description: 'Bad request' },
            '409': { description: 'Transaction already exists' },
            '500': { description: 'Internal server error' },
          },
        },
      },
      '/api/payments/paypal/confirm/{orderId}': {
        post: {
          summary: 'Confirm PayPal Payment',
          description: 'Captures a PayPal order after user approval',
          tags: ['Payments'],
          parameters: [
            {
              name: 'orderId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'Payment captured successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string' },
                      id: { type: 'string' },
                    },
                  },
                },
              },
            },
            '500': { description: 'Internal server error' },
          },
        },
      },
      '/api/transactions': {
        get: {
          summary: 'List Transactions',
          description: 'Retrieve a list of transactions with optional filtering',
          tags: ['Transactions'],
          parameters: [
            { name: 'gateway', in: 'query', schema: { type: 'string' } },
            { name: 'status', in: 'query', schema: { type: 'string' } },
            { name: 'minAmount', in: 'query', schema: { type: 'string' } },
            { name: 'maxAmount', in: 'query', schema: { type: 'string' } },
            { name: 'startDate', in: 'query', schema: { type: 'string' } },
            { name: 'endDate', in: 'query', schema: { type: 'string' } },
            { name: 'idempotencyKey', in: 'query', schema: { type: 'string' } },
          ],
          responses: {
            '200': {
              description: 'List of transactions',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'number' },
                        idempotency_key: { type: 'string' },
                        gateway: { type: 'string' },
                        amount: { type: 'number' },
                        currency: { type: 'string' },
                        status: { type: 'string' },
                        transaction_id: { type: 'string' },
                        error: { type: 'string' },
                        metadata: { type: 'object' },
                        created_at: { type: 'string' },
                        updated_at: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
            '500': { description: 'Internal server error' },
          },
        },
      },
      '/api/payments/stripe/{paymentIntentId}': {
        get: {
          summary: 'Get Stripe Payment Status',
          description: 'Retrieve the status of a Stripe payment intent',
          tags: ['Payments'],
          parameters: [
            {
              name: 'paymentIntentId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Stripe payment intent ID'
            }
          ],
          responses: {
            '200': {
              description: 'Payment status retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      paymentIntentId: { type: 'string' },
                      status: { type: 'string' },
                      transaction: { type: 'object' }
                    }
                  }
                }
              }
            },
            '400': { description: 'Bad request' },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/api/payments/stripe/{paymentIntentId}/cancel': {
        post: {
          summary: 'Cancel Stripe Payment',
          description: 'Cancel a pending Stripe payment intent',
          tags: ['Payments'],
          parameters: [
            {
              name: 'paymentIntentId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Stripe payment intent ID'
            }
          ],
          responses: {
            '200': {
              description: 'Payment cancelled successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      paymentIntentId: { type: 'string' },
                      status: { type: 'string' },
                      message: { type: 'string' }
                    }
                  }
                }
              }
            },
            '400': { description: 'Bad request' },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/api/payments/stripe/{paymentIntentId}/refund': {
        post: {
          summary: 'Refund Stripe Payment',
          description: 'Process a refund for a completed Stripe payment',
          tags: ['Payments'],
          parameters: [
            {
              name: 'paymentIntentId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Stripe payment intent ID'
            }
          ],
          requestBody: {
            required: false,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    amount: { type: 'integer', description: 'Refund amount in cents (optional, full refund if not specified)' }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Refund processed successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      refundId: { type: 'string' },
                      status: { type: 'string' },
                      message: { type: 'string' }
                    }
                  }
                }
              }
            },
            '400': { description: 'Bad request' },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/api/payments/stripe/{paymentIntentId}/confirm': {
        post: {
          summary: 'Confirm Stripe Payment',
          description: 'Confirm a Stripe PaymentIntent directly using a test payment method (for testing purposes)',
          tags: ['Payments'],
          parameters: [
            {
              name: 'paymentIntentId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Stripe payment intent ID'
            }
          ],
          requestBody: {
            required: false,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    paymentMethodId: { type: 'string', default: 'pm_card_visa', description: 'Payment method ID (defaults to test card)' }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Payment confirmed successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      paymentIntentId: { type: 'string' },
                      status: { type: 'string' },
                      message: { type: 'string' }
                    }
                  }
                }
              }
            },
            '400': { description: 'Bad request' },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/api/webhooks/stripe': {
        post: {
          summary: 'Stripe Webhook',
          description: 'Handle Stripe webhook events for payment updates',
          tags: ['Webhooks'],
          parameters: [
            {
              name: 'stripe-signature',
              in: 'header',
              required: true,
              schema: { type: 'string' },
              description: 'Stripe webhook signature for verification'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'object' }
              }
            }
          },
          responses: {
            '200': {
              description: 'Webhook received',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      received: { type: 'boolean' }
                    }
                  }
                }
              }
            },
            '400': { description: 'Webhook verification failed' }
          }
        }
      },
    },
  });
});

export default app;