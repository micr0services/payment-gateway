import { Hono } from 'hono';
import { capturePaypalPayment } from './paypalPayment';

const router = new Hono<{ 
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

router.post('/paypal/confirm/:orderId', async (c) => {
  const { orderId } = c.req.param();

  try {
    const result = await capturePaypalPayment(c.env.PAYPAL_ENVIRONMENT, c.env.PAYPAL_CLIENT_ID, c.env.PAYPAL_CLIENT_SECRET, orderId);
    if (result.success) {
      // Update transaction status
      // Assuming we have a way to find by transaction_id
      // For simplicity, assume it's updated elsewhere
      return c.json({ status: result.status, id: result.id }, 200);
    } else {
      return c.json({ error: result.error }, 500);
    }
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export default router;