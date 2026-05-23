import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { apiReference } from '@scalar/hono-api-reference';
import stripeRouter from './stripe/stripe.routes';
import paypalRouter from './paypal/paypal.routes';
import paypalConfirmRouter from './paypal/paypalConfirm.routes';
import mpesaRouter from './mpesa/routes/mpesa.routes';
import stkRouter from './mpesa/stk/stk.routes';
import transactionsRouter from './routes/transactions';
import webhooksRouter from './routes/webhooks';
import smsRouter from './routes/sms';
import { Env } from './index';

const app = new Hono<{
  Bindings: Env;
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
app.route('/api/payments', mpesaRouter);
app.route('/api/stk', stkRouter);
app.route('/api', transactionsRouter);
app.route('/api/webhooks', webhooksRouter);
app.route('/api', smsRouter);

// OpenAPI specification
app.get('/api/openapi.json', (c) => {
  const productionUrl = c.env.API_BASE_URL || 'https://payment-gateway.kimaniwilfred95.workers.dev';
  const developmentUrl = c.env.DEVELOPMENT_API_URL || 'http://localhost:8787';
  
  return c.json({
    openapi: '3.0.0',
    info: {
      title: 'Payment Gateway API',
      version: '1.0.0',
      description: 'A secure payment gateway supporting PayPal and Stripe with idempotency and retry logic',
    },
    servers: [
      {
        url: productionUrl,
        description: 'Production server',
      },
      {
        url: developmentUrl,
        description: 'Development server',
      },
    ],
    paths: {
      '/api/payments/stripe': {
        post: {
          summary: 'Create Stripe Payment Intent',
          description: 'Creates a new Stripe payment intent with idempotency support and optional callback/redirect URLs',
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
                    amount: { type: 'number', description: 'Payment amount in decimal format (e.g., 24.50 for $24.50)' },
                    currency: { type: 'string', default: 'usd', description: 'Currency code (usd, eur, gbp, cad, aud, jpy, inr)' },
                    successRedirectUrl: { type: 'string', description: 'Frontend URL where user redirects after successful payment (REQUIRED)' },
                    failureRedirectUrl: { type: 'string', description: 'Frontend URL where user redirects after failed payment (REQUIRED)' },
                    callbackUrl: { type: 'string', description: 'Server-side webhook URL for payment status updates' },
                    cancelUrl: { type: 'string', description: 'URL to redirect the user if they cancel during checkout' },
                    metadata: { type: 'object', description: 'Custom metadata for tracking (orderId, userId, eventId, etc.)' },
                  },
                  required: ['amount', 'successRedirectUrl', 'failureRedirectUrl'],
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
                      checkoutUrl: { type: 'string', description: 'Stripe Checkout URL to redirect user' },
                      sessionId: { type: 'string', description: 'Stripe checkout session ID' },
                      status: { type: 'string', description: 'Current payment status' },
                      amountProcessed: { type: 'integer', description: 'Amount in smallest currency unit (cents for USD)' },
                      currency: { type: 'string', description: 'ISO 4217 currency code' },
                      callbackUrl: { type: 'string', description: 'Server-side webhook URL (or null)' },
                      successRedirectUrl: { type: 'string', description: 'Success redirect URL (or null)' },
                      failureRedirectUrl: { type: 'string', description: 'Failure redirect URL (or null)' },
                      cancelUrl: { type: 'string', description: 'Cancel redirect URL (or null)' },
                      callbackUrlRegistered: { type: 'boolean', description: 'Whether callback URL was registered' },
                      successRedirectUrlRegistered: { type: 'boolean', description: 'Whether success redirect URL was registered' },
                      failureRedirectUrlRegistered: { type: 'boolean', description: 'Whether failure redirect URL was registered' },
                      cancelUrlRegistered: { type: 'boolean', description: 'Whether cancel URL was registered' },
                    },
                  },
                },
              },
            },
            '400': { description: 'Bad request - invalid parameters or missing required redirect URLs' },
            '409': { description: 'Conflict - Transaction already exists' },
            '500': { description: 'Internal server error' },
          },
        },
      },
      '/api/payments/paypal': {
        post: {
          summary: 'Create PayPal Order',
          description: 'Creates a new PayPal order with idempotency support and optional callback/cancel URLs',
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
                    callbackUrl: { type: 'string', description: 'Webhook URL to notify on payment completion' },
                    cancelUrl: { type: 'string', description: 'Webhook URL to notify on payment cancellation' },
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
                      approvalUrl: { type: 'string' },
                      status: { type: 'string' },
                      callbackUrlRegistered: { type: 'boolean' },
                      cancelUrlRegistered: { type: 'boolean' },
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
          description: 'Captures a PayPal order after user approval and sends callback notification',
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
                      success: { type: 'boolean' },
                      order: { type: 'object' },
                      callbackSent: { type: 'boolean' },
                    },
                  },
                },
              },
            },
            '500': { description: 'Internal server error' },
          },
        },
      },
      '/api/payments/paypal/{orderId}/cancel': {
        post: {
          summary: 'Cancel PayPal Order',
          description: 'Cancel a pending PayPal order and notify via cancel URL',
          tags: ['Payments'],
          parameters: [
            {
              name: 'orderId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'PayPal order ID'
            }
          ],
          requestBody: {
            required: false,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    reason: { type: 'string', default: 'User initiated', description: 'Reason for cancellation' }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Order cancelled successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      orderId: { type: 'string' },
                      status: { type: 'string' },
                      message: { type: 'string' },
                      cancelNotificationSent: { type: 'boolean' }
                    }
                  }
                }
              }
            },
            '404': { description: 'Transaction not found' },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/api/payments/mpesa': {
        post: {
          summary: 'Initiate M-Pesa STK Push',
          description: 'Start an M-Pesa STK push payment via the payments API with idempotency support',
          tags: ['Payments', 'M-Pesa'],
          parameters: [
            {
              name: 'Idempotency-Key',
              in: 'header',
              required: true,
              schema: { type: 'string' },
              description: 'Unique key to prevent duplicate transactions'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    mobileNumber: { type: 'string', description: 'Customer phone number in 254XXXXXXXXX or 0XXXXXXXXX format' },
                    amount: { type: 'number', description: 'Transaction amount in KES' },
                    accountReference: { type: 'string', description: 'Merchant account or order reference' },
                    transactionDesc: { type: 'string', description: 'Transaction description' },
                    callbackUrl: { type: 'string', description: 'Optional webhook callback URL' },
                    cancelUrl: { type: 'string', description: 'Optional cancel URL' }
                  },
                  required: ['mobileNumber', 'amount', 'accountReference']
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'M-Pesa STK push initiated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                      data: { type: 'object' },
                      callbackUrlRegistered: { type: 'boolean' },
                      cancelUrlRegistered: { type: 'boolean' }
                    }
                  }
                }
              }
            },
            '400': { description: 'Validation error or bad request' },
            '409': { description: 'Transaction already exists' },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/api/payments/mpesa/query': {
        post: {
          summary: 'Query M-Pesa STK Status',
          description: 'Query the status of an M-Pesa STK push request via checkoutRequestId',
          tags: ['Payments', 'M-Pesa'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    checkoutRequestId: { type: 'string', description: 'Checkout request ID returned by the STK push' }
                  },
                  required: ['checkoutRequestId']
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'M-Pesa STK status retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { type: 'object' }
                    }
                  }
                }
              }
            },
            '400': { description: 'Validation error or bad request' },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/api/payments/mpesa/status/{checkoutRequestId}': {
        get: {
          summary: 'Get M-Pesa STK Status by ID',
          description: 'Retrieve an M-Pesa STK push status using a checkout request ID',
          tags: ['Payments', 'M-Pesa'],
          parameters: [
            {
              name: 'checkoutRequestId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Checkout request ID returned by the STK push'
            }
          ],
          responses: {
            '200': {
              description: 'M-Pesa STK status retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { type: 'object' }
                    }
                  }
                }
              }
            },
            '400': { description: 'Validation error or bad request' },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/api/stk/push': {
        post: {
          summary: 'Initiate STK Push',
          description: 'Start an M-Pesa STK push payment request directly via the STK API',
          tags: ['Payments', 'M-Pesa'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    mobileNumber: { type: 'string', description: 'Customer phone number in 254XXXXXXXXX or 0XXXXXXXXX format' },
                    amount: { type: 'number', description: 'Transaction amount in KES' },
                    accountReference: { type: 'string', description: 'Merchant account or order reference' },
                    transactionDesc: { type: 'string', description: 'Transaction description' }
                  },
                  required: ['mobileNumber', 'amount', 'accountReference']
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'STK push initiated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                      data: { type: 'object' }
                    }
                  }
                }
              }
            },
            '400': { description: 'Validation error or bad request' },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/api/stk/query': {
        post: {
          summary: 'Query STK Push Status',
          description: 'Query the status of an STK push request using checkoutRequestId',
          tags: ['Payments', 'M-Pesa'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    checkoutRequestId: { type: 'string', description: 'Checkout request ID returned by the STK push' }
                  },
                  required: ['checkoutRequestId']
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'STK status retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                      data: { type: 'object' }
                    }
                  }
                }
              }
            },
            '400': { description: 'Validation error or bad request' },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/api/stk/status/{checkoutRequestId}': {
        get: {
          summary: 'Get STK Push Status by ID',
          description: 'Retrieve the STK push status by checkout request ID',
          tags: ['Payments', 'M-Pesa'],
          parameters: [
            {
              name: 'checkoutRequestId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Checkout request ID returned by the STK push'
            }
          ],
          responses: {
            '200': {
              description: 'STK status retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                      data: { type: 'object' }
                    }
                  }
                }
              }
            },
            '400': { description: 'Validation error or bad request' },
            '500': { description: 'Internal server error' }
          }
        }
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
          description: 'Retrieve the current status of a Stripe payment by session ID or payment intent ID',
          tags: ['Payments'],
          parameters: [
            {
              name: 'paymentIntentId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Stripe payment intent ID or session ID'
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
                      paymentIntentId: { type: 'string', description: 'Stripe payment intent ID' },
                      status: { type: 'string', enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'], description: 'Current payment status' },
                      transaction: { 
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          idempotencyKey: { type: 'string' },
                          amount: { type: 'integer' },
                          currency: { type: 'string' },
                          gatewayStatus: { type: 'string' },
                          createdAt: { type: 'string', format: 'date-time' }
                        }
                      }
                    }
                  }
                }
              }
            },
            '400': { description: 'Bad request' },
            '404': { description: 'Payment not found' },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/api/payments/stripe/{paymentIntentId}/cancel': {
        post: {
          summary: 'Cancel Stripe Payment',
          description: 'Cancel a pending Stripe payment and optionally notify via cancel URL',
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
                    reason: { type: 'string', default: 'User initiated', description: 'Reason for cancellation' }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Payment cancelled successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      paymentIntentId: { type: 'string' },
                      status: { type: 'string', enum: ['cancelled'] },
                      cancelledAt: { type: 'string', format: 'date-time' },
                      reason: { type: 'string' }
                    }
                  }
                }
              }
            },
            '400': { description: 'Bad request' },
            '404': { description: 'Payment not found' },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/api/payments/stripe/{paymentIntentId}/refund': {
        post: {
          summary: 'Refund Stripe Payment',
          description: 'Process a full or partial refund for a completed Stripe payment',
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
                    amount: { type: 'integer', description: 'Refund amount in smallest currency unit (optional for full refund)' },
                    reason: { type: 'string', enum: ['duplicate', 'fraudulent', 'requested_by_customer'], description: 'Reason for refund' }
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
                      id: { type: 'string', description: 'Refund ID' },
                      paymentIntentId: { type: 'string' },
                      status: { type: 'string', enum: ['succeeded', 'pending', 'failed'] },
                      amount: { type: 'integer', description: 'Refunded amount' },
                      currency: { type: 'string' },
                      reason: { type: 'string' },
                      createdAt: { type: 'string', format: 'date-time' }
                    }
                  }
                }
              }
            },
            '400': { description: 'Bad request' },
            '404': { description: 'Payment not found' },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/api/payments/stripe/{paymentIntentId}/confirm': {
        post: {
          summary: 'Confirm Stripe Payment (Testing)',
          description: 'Confirm a payment in test mode. Used for testing webhook flows and payment processing',
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
                      status: { type: 'string', enum: ['completed'] },
                      message: { type: 'string' },
                      timestamp: { type: 'string', format: 'date-time' }
                    }
                  }
                }
              }
            },
            '400': { description: 'Bad request' },
            '404': { description: 'Payment not found' },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/api/b2c/send': {
        post: {
          summary: 'Send B2C Transfer',
          description: 'Transfer funds from business to customer (refunds, payouts, salary)',
          tags: ['Payments', 'M-Pesa'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    mobileNumber: { type: 'string', description: 'Recipient phone number (254XXXXXXXXX or 0XXXXXXXXX)' },
                    amount: { type: 'number', description: 'Transfer amount in KES (1-150,000)' },
                    description: { type: 'string', description: 'Transaction description' },
                    callbackUrl: { type: 'string', description: 'Webhook URL for status updates' },
                    cancelUrl: { type: 'string', description: 'URL for cancellation notification' }
                  },
                  required: ['mobileNumber', 'amount']
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'B2C transaction initiated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                      data: { type: 'object' },
                      callbackUrlRegistered: { type: 'boolean' }
                    }
                  }
                }
              }
            },
            '400': { description: 'Validation error' },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/api/b2c/status/{conversationId}': {
        get: {
          summary: 'Get B2C Transfer Status',
          description: 'Check the status of a B2C transfer transaction',
          tags: ['Payments', 'M-Pesa'],
          parameters: [
            {
              name: 'conversationId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Conversation ID from the B2C send response'
            }
          ],
          responses: {
            '200': { description: 'B2C transaction status retrieved' },
            '400': { description: 'Bad request' },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/api/c2b/register': {
        post: {
          summary: 'Register C2B URLs',
          description: 'Register confirmation and validation URLs for C2B payments',
          tags: ['Payments', 'M-Pesa'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    shortCode: { type: 'string', description: 'M-Pesa business short code' },
                    responseType: { type: 'string', enum: ['Completed', 'Cancelled'], description: 'Callback preference' },
                    confirmationUrl: { type: 'string', description: 'URL for payment confirmations' },
                    validationUrl: { type: 'string', description: 'URL for payment validation requests' }
                  },
                  required: ['shortCode', 'responseType', 'confirmationUrl', 'validationUrl']
                }
              }
            }
          },
          responses: {
            '200': { description: 'C2B URLs registered successfully' },
            '400': { description: 'Validation error' },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/api/c2b/simulate': {
        post: {
          summary: 'Simulate C2B Payment',
          description: 'Simulate a customer-to-business payment for testing',
          tags: ['Payments', 'M-Pesa'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    mobileNumber: { type: 'string', description: 'Customer phone number (254XXXXXXXXX or 0XXXXXXXXX)' },
                    amount: { type: 'number', description: 'Payment amount in KES' },
                    description: { type: 'string', description: 'Payment description/reference' }
                  },
                  required: ['mobileNumber', 'amount']
                }
              }
            }
          },
          responses: {
            '200': { description: 'C2B transaction simulated successfully' },
            '400': { description: 'Validation error' },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/api/c2b/status/{conversationId}': {
        get: {
          summary: 'Get C2B Transaction Status',
          description: 'Check the status of a C2B payment transaction',
          tags: ['Payments', 'M-Pesa'],
          parameters: [
            {
              name: 'conversationId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Conversation ID from the C2B simulate response'
            }
          ],
          responses: {
            '200': { description: 'C2B transaction status retrieved' },
            '400': { description: 'Bad request' },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/api/b2b/send': {
        post: {
          summary: 'Send B2B Payment',
          description: 'Transfer funds from business account to another business account',
          tags: ['Payments', 'M-Pesa'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    receiverPartyPublicID: { type: 'string', description: 'Receiver M-Pesa business public ID' },
                    amount: { type: 'number', description: 'Transaction amount in KES (1-150,000)' },
                    description: { type: 'string', description: 'Transaction description' },
                    accountReference: { type: 'string', description: 'Account/invoice reference' }
                  },
                  required: ['receiverPartyPublicID', 'amount']
                }
              }
            }
          },
          responses: {
            '200': { description: 'B2B transaction initiated successfully' },
            '400': { description: 'Validation error' },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/api/b2pochi/send': {
        post: {
          summary: 'Send B2Pochi Payment',
          description: 'Transfer funds from business to Pochi (MPESA ATM) machine or agent',
          tags: ['Payments', 'M-Pesa'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    mobileNumber: { type: 'string', description: 'Pochi/Agent phone number (254XXXXXXXXX or 0XXXXXXXXX)' },
                    amount: { type: 'number', description: 'Payout amount in KES (1-150,000)' },
                    description: { type: 'string', description: 'Payout purpose/description' }
                  },
                  required: ['mobileNumber', 'amount']
                }
              }
            }
          },
          responses: {
            '200': { description: 'B2Pochi transaction initiated successfully' },
            '400': { description: 'Validation error' },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/api/b2pochi/status/{conversationId}': {
        get: {
          summary: 'Get B2Pochi Transfer Status',
          description: 'Check the status of a B2Pochi transfer',
          tags: ['Payments', 'M-Pesa'],
          parameters: [
            {
              name: 'conversationId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Conversation ID from the B2Pochi send response'
            }
          ],
          responses: {
            '200': { description: 'B2Pochi transaction status retrieved' },
            '400': { description: 'Bad request' },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/api/reversal/request': {
        post: {
          summary: 'Request Transaction Reversal',
          description: 'Reverse a previous M-Pesa transaction (erroneous or duplicate)',
          tags: ['Payments', 'M-Pesa'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    transactionId: { type: 'string', description: 'Original M-Pesa receipt/transaction ID' },
                    amount: { type: 'number', description: 'Amount to reverse in KES (1-150,000)' },
                    receiverParty: { type: 'string', description: 'Original receiver phone or account identifier' },
                    remarks: { type: 'string', description: 'Reason for reversal' },
                    occasion: { type: 'string', description: 'Occasion/category for reversal' }
                  },
                  required: ['transactionId', 'amount', 'receiverParty']
                }
              }
            }
          },
          responses: {
            '200': { description: 'Reversal request initiated successfully' },
            '400': { description: 'Validation error' },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/api/reversal/status/{conversationId}': {
        get: {
          summary: 'Get Reversal Status',
          description: 'Check the status of a reversal request',
          tags: ['Payments', 'M-Pesa'],
          parameters: [
            {
              name: 'conversationId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Conversation ID from the reversal request response'
            }
          ],
          responses: {
            '200': { description: 'Reversal status retrieved successfully' },
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