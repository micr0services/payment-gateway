import { describe, it, expect, vi } from 'vitest';
import { initiateMpesaSTKPush, queryMpesaSTKStatus } from '../src/mpesa/mpesaPayment';

// Mock fetch globally
global.fetch = vi.fn();

describe('M-Pesa Payment Functions', () => {
  const mockEnv = {
    MPESA_CONSUMER_KEY: 'test_key',
    MPESA_CONSUMER_SECRET: 'test_secret',
    MPESA_SHORTCODE: '123456',
    MPESA_PASSKEY: 'test_passkey',
    MPESA_ENVIRONMENT: 'sandbox',
    MPESA_STK_CALLBACK_URL: 'https://example.com/callback'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initiateMpesaSTKPush', () => {
    it('should initiate STK push successfully', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ access_token: 'test_token' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            ResponseCode: '0',
            MerchantRequestID: 'MR123',
            CheckoutRequestID: 'CR123',
            ResponseDescription: 'Success',
            CustomerMessage: 'Enter PIN to complete transaction'
          })
        });

      const result = await initiateMpesaSTKPush(mockEnv, {
        mobileNumber: '254712345678',
        amount: 100,
        accountReference: 'TEST123',
        transactionDesc: 'Test payment'
      });

      expect(result).toEqual({
        merchantRequestId: 'MR123',
        checkoutRequestId: 'CR123',
        responseCode: '0',
        responseDescription: 'Success',
        customerMessage: 'Enter PIN to complete transaction'
      });
    });

    it('should handle M-Pesa API errors with retry', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ access_token: 'test_token' })
        })
        .mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ errorCode: '500', errorMessage: 'Internal server error' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ access_token: 'test_token' })
        })
        .mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ errorCode: '500', errorMessage: 'Timeout' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ access_token: 'test_token' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            ResponseCode: '0',
            MerchantRequestID: 'MR123',
            CheckoutRequestID: 'CR123',
            ResponseDescription: 'Success',
            CustomerMessage: 'Enter PIN to complete transaction'
          })
        });

      const result = await initiateMpesaSTKPush(mockEnv, {
        mobileNumber: '254712345678',
        amount: 100,
        accountReference: 'TEST123'
      });

      expect(result.checkoutRequestId).toBe('CR123');
      expect(global.fetch).toHaveBeenCalledTimes(6); // 3 token requests + 3 STK push attempts
    });

    it('should fail after all retries are exhausted', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ errorCode: '500', errorMessage: 'Persistent error' })
      });

      await expect(initiateMpesaSTKPush(mockEnv, {
        mobileNumber: '254712345678',
        amount: 100,
        accountReference: 'TEST123'
      })).rejects.toThrow('M-Pesa stk_push request failed');
    });

    it('should validate required parameters', async () => {
      await expect(initiateMpesaSTKPush(mockEnv, {
        mobileNumber: '',
        amount: 100,
        accountReference: 'TEST123'
      })).rejects.toThrow('mobileNumber, amount, and accountReference are required');
    });
  });

  describe('queryMpesaSTKStatus', () => {
    it('should query STK status successfully', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ access_token: 'test_token' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            MerchantRequestID: 'MR123',
            CheckoutRequestID: 'CR123',
            ResponseCode: '0',
            ResponseDescription: 'Success',
            ResultCode: '0',
            ResultDesc: 'The service request is processed successfully'
          })
        });

      const result = await queryMpesaSTKStatus(mockEnv, 'CR123');

      expect(result).toEqual({
        merchantRequestId: 'MR123',
        checkoutRequestId: 'CR123',
        responseCode: '0',
        responseDescription: 'Success',
        resultCode: '0',
        resultDesc: 'The service request is processed successfully'
      });
    });

    it('should handle query errors with retry', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ access_token: 'test_token' })
        })
        .mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ errorCode: '404', errorMessage: 'Not found' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ access_token: 'test_token' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            MerchantRequestID: 'MR123',
            CheckoutRequestID: 'CR123',
            ResponseCode: '0',
            ResponseDescription: 'Success',
            ResultCode: '0',
            ResultDesc: 'The service request is processed successfully'
          })
        });

      const result = await queryMpesaSTKStatus(mockEnv, 'CR123');

      expect(result.resultCode).toBe('0');
      expect(global.fetch).toHaveBeenCalledTimes(4); // 2 token requests + 2 query attempts
    });

    it('should validate checkoutRequestId parameter', async () => {
      await expect(queryMpesaSTKStatus(mockEnv, '')).rejects.toThrow('checkoutRequestId is required');
    });
  });
});