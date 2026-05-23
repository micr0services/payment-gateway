import { describe, it, expect, vi } from 'vitest';
import { processPaypalPayment, capturePaypalPayment } from '../src/paypal/paypalPayment';

// Mock fetch globally
global.fetch = vi.fn();

describe('PayPal Payment Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('processPaypalPayment', () => {
    it('should create a successful PayPal order', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ access_token: 'test_token' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            id: 'ORDER_123',
            status: 'CREATED',
            links: [
              { rel: 'approve', href: 'https://www.paypal.com/checkoutnow?token=ORDER_123' }
            ]
          })
        });

      const result = await processPaypalPayment(
        'sandbox',
        'client_id',
        'client_secret',
        10.00,
        'USD',
        'http://localhost:3000'
      );

      expect(result.success).toBe(true);
      expect(result.orderId).toBe('ORDER_123');
      expect(result.approvalUrl).toBe('https://www.paypal.com/checkoutnow?token=ORDER_123');
      expect(result.status).toBe('CREATED');
    });

    it('should handle PayPal API errors', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ access_token: 'test_token' })
        })
        .mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ error: 'Invalid request' })
        });

      const result = await processPaypalPayment(
        'sandbox',
        'client_id',
        'client_secret',
        10.00,
        'USD',
        'http://localhost:3000'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('{"error":"Invalid request"}');
    });

    it('should validate payment parameters', async () => {
      await expect(processPaypalPayment('sandbox', 'client_id', 'client_secret', -10, 'USD', 'http://localhost:3000')).rejects.toThrow('Amount must be greater than 0');
      await expect(processPaypalPayment('sandbox', 'client_id', 'client_secret', 0.005, 'USD', 'http://localhost:3000')).rejects.toThrow('Amount must be at least 0.01');
      await expect(processPaypalPayment('sandbox', 'client_id', 'client_secret', 10, 'XYZ', 'http://localhost:3000')).rejects.toThrow('Unsupported currency');
    });
  });

  describe('capturePaypalPayment', () => {
    it('should capture PayPal payment successfully', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ access_token: 'test_token' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            id: 'CAPTURE_123',
            status: 'COMPLETED'
          })
        });

      const result = await capturePaypalPayment(
        'sandbox',
        'client_id',
        'client_secret',
        'ORDER_123'
      );

      expect(result.success).toBe(true);
      expect(result.status).toBe('COMPLETED');
      expect(result.id).toBe('CAPTURE_123');
    });

    it('should handle capture errors', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ access_token: 'test_token' })
        })
        .mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ error: 'Order already captured' })
        });

      const result = await capturePaypalPayment(
        'sandbox',
        'client_id',
        'client_secret',
        'ORDER_123'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('{"error":"Order already captured"}');
    });
  });
});