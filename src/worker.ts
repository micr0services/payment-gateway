import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { apiReference } from 'hono/api-reference';
import stripeRouter from './routes/stripe';
import paypalRouter from './routes/paypal';
import paypalConfirmRouter from './routes/paypalConfirm';
import transactionsRouter from './routes/transactions';

const app = new Hono<{
  Bindings: {
    STRIPE_SECRET_KEY: string;
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

// OpenAPI specification
app.get('/api/openapi.json', (c: { json: (arg0: { openapi: string; info: { title: string; version: string; description: string; }; servers: { url: string; description: string; }[]; paths: { '/api/payments/stripe': { post: { summary: string; description: string; tags: string[]; security: never[]; parameters: { name: string; in: string; required: boolean; schema: { type: string; }; description: string; }[]; requestBody: { required: boolean; content: { 'application/json': { schema: { type: string; properties: { amount: { type: string; description: string; }; currency: { type: string; default: string; description: string; }; metadata: { type: string; description: string; }; }; required: string[]; }; }; }; }; responses: { '200': { description: string; content: { 'application/json': { schema: { type: string; properties: { clientSecret: { type: string; }; transactionId: { type: string; }; }; }; }; }; }; '400': { description: string; }; '409': { description: string; }; '500': { description: string; }; }; }; }; '/api/payments/paypal': { post: { summary: string; description: string; tags: string[]; parameters: { name: string; in: string; required: boolean; schema: { type: string; }; }[]; requestBody: { required: boolean; content: { 'application/json': { schema: { type: string; properties: { amount: { type: string; description: string; }; currency: { type: string; default: string; }; metadata: { type: string; }; }; required: string[]; }; }; }; }; responses: { '200': { description: string; content: { 'application/json': { schema: { type: string; properties: { orderId: { type: string; }; links: { type: string; }; }; }; }; }; }; '400': { description: string; }; '409': { description: string; }; '500': { description: string; }; }; }; }; '/api/payments/paypal/confirm/{orderId}': { post: { summary: string; description: string; tags: string[]; parameters: { name: string; in: string; required: boolean; schema: { type: string; }; }[]; responses: { '200': { description: string; content: { 'application/json': { schema: { type: string; properties: { status: { type: string; }; id: { type: string; }; }; }; }; }; }; '500': { description: string; }; }; }; }; '/api/transactions': { get: { summary: string; description: string; tags: string[]; parameters: { name: string; in: string; schema: { type: string; }; }[]; responses: { '200': { description: string; content: { 'application/json': { schema: { type: string; items: { type: string; properties: { id: { type: string; }; idempotency_key: { type: string; }; gateway: { type: string; }; amount: { type: string; }; currency: { type: string; }; status: { type: string; }; transaction_id: { type: string; }; error: { type: string; }; metadata: { type: string; }; created_at: { type: string; }; updated_at: { type: string; }; }; }; }; }; }; }; '500': { description: string; }; }; }; }; }; }) => any; }) => {
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
                    amount: { type: 'integer', description: 'Payment amount in cents' },
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
    },
  });
});

export default app;