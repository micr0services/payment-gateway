import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import * as dotenv from 'dotenv';
import stripeRouter from './routes/stripe';
import paypalRouter from './routes/paypal';
import paypalConfirmRouter from './routes/paypalConfirm';
import transactionsRouter from './routes/transactions';

dotenv.config();

const app: Application = express();

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Payment Gateway API',
    version: '1.0.0',
    description: 'A secure payment gateway supporting PayPal and Stripe with idempotency and retry logic',
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 3000}`,
      description: 'Development server',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts'], // Paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/api/payments', stripeRouter);
app.use('/api/payments', paypalRouter);
app.use('/api/payments', paypalConfirmRouter);
app.use('/api/payments', transactionsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});


export default app;