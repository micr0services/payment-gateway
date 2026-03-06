import { Hono } from 'hono';
import { cors } from 'hono/cors';
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

// Routes
app.route('/api/payments', stripeRouter);
app.route('/api/payments', paypalRouter);
app.route('/api/payments', paypalConfirmRouter);
app.route('/api', transactionsRouter);

export default app;