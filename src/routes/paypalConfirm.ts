import { Router, Request, Response } from 'express';
import { capturePaypalPayment } from '../lib/paypalPayment';

const router = Router();

/**
 * @swagger
 * /api/payments/paypal/confirm/{orderId}:
 *   post:
 *     summary: Capture a PayPal order after approval
 *     tags:
 *       - PayPal
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: PayPal order ID to capture
 *     responses:
 *       "200":
 *         description: Order captured successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 id:
 *                   type: string
 *       "500":
 *         description: Failed to capture order
 */
router.post('/paypal/confirm/:orderId', async (req: Request, res: Response): Promise<void> => {
  const { orderId } = req.params;

  try {
    const result = await capturePaypalPayment(orderId as string);
    if (result.success) {
      // Update transaction status
      // Assuming we have a way to find by transaction_id
      // For simplicity, assume it's updated elsewhere
      res.json({ status: result.status, id: result.id });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;