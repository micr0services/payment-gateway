import { describe, it, expect, vi } from 'vitest';
const mockStripeClient = {
    checkout: {
        sessions: {
            create: vi.fn()
        }
    },
    paymentIntents: {
        retrieve: vi.fn(),
        cancel: vi.fn()
    },
    refunds: {
        create: vi.fn()
    }
};
// Mock Stripe at the module level with a shared client instance
vi.mock('stripe', () => ({
    default: vi.fn().mockImplementation(() => mockStripeClient)
}));
import { processStripePayment, cancelStripePayment, getStripePaymentStatus, refundStripePayment } from '../src/stripe/stripePayment';
describe('Stripe Payment Functions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    afterEach(() => {
        vi.clearAllMocks();
    });
    describe('processStripePayment', () => {
        it('should create a successful payment session', async () => {
            mockStripeClient.checkout.sessions.create.mockResolvedValue({
                id: 'cs_test_123',
                url: 'https://checkout.stripe.com/pay/cs_test_123',
                status: 'open'
            });
            const result = await processStripePayment('sk_test_dummy', 1000, // $10.00 in cents
            'usd', { description: 'Test payment' }, 'https://example.com/success', 'https://example.com/cancel', 'test-idempotency');
            expect(result.success).toBe(true);
            expect(result.id).toBe('cs_test_123');
            expect(result.checkoutUrl).toBe('https://checkout.stripe.com/pay/cs_test_123');
            expect(result.status).toBe('open');
            expect(mockStripeClient.checkout.sessions.create).toHaveBeenCalledWith({
                payment_method_types: ['card'],
                line_items: [{
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: 'Payment',
                                description: 'Test payment'
                            },
                            unit_amount: 1000
                        },
                        quantity: 1
                    }],
                mode: 'payment',
                success_url: 'https://example.com/success',
                cancel_url: 'https://example.com/cancel',
                metadata: { description: 'Test payment' }
            }, { idempotencyKey: 'test-idempotency' });
        });
        it('should handle Stripe API errors', async () => {
            mockStripeClient.checkout.sessions.create.mockRejectedValue(new Error('Network error'));
            const result = await processStripePayment('sk_test_dummy', 1000, 'usd', {}, 'https://example.com/success', 'https://example.com/cancel');
            expect(result.success).toBe(false);
            expect(result.error).toBe('Network error');
        });
        it('should validate payment parameters', async () => {
            await expect(processStripePayment('sk_test_dummy', -100, 'usd', {}, 'https://example.com/success', 'https://example.com/cancel')).rejects.toThrow('Amount must be greater than 0');
            await expect(processStripePayment('sk_test_dummy', 100.5, 'usd', {}, 'https://example.com/success', 'https://example.com/cancel')).rejects.toThrow('Amount must be in smallest currency unit');
            await expect(processStripePayment('sk_test_dummy', 100, 'xyz', {}, 'https://example.com/success', 'https://example.com/cancel')).rejects.toThrow('Unsupported currency');
        });
    });
    describe('getStripePaymentStatus', () => {
        it('should retrieve payment status successfully', async () => {
            mockStripeClient.paymentIntents.retrieve.mockResolvedValue({
                id: 'pi_123',
                status: 'succeeded'
            });
            const result = await getStripePaymentStatus('sk_test_dummy', 'pi_123');
            expect(result.success).toBe(true);
            expect(result.status).toBe('succeeded');
            expect(result.id).toBe('pi_123');
        });
        it('should handle payment retrieval errors', async () => {
            mockStripeClient.paymentIntents.retrieve.mockRejectedValue(new Error('Payment not found'));
            const result = await getStripePaymentStatus('sk_test_dummy', 'pi_invalid');
            expect(result.success).toBe(false);
            expect(result.error).toBe('Payment not found');
        });
    });
    describe('cancelStripePayment', () => {
        it('should cancel payment successfully', async () => {
            mockStripeClient.paymentIntents.cancel.mockResolvedValue({
                id: 'pi_123',
                status: 'canceled'
            });
            const result = await cancelStripePayment('sk_test_dummy', 'pi_123');
            expect(result.success).toBe(true);
            expect(result.status).toBe('canceled');
            expect(result.id).toBe('pi_123');
        });
        it('should handle cancellation errors', async () => {
            mockStripeClient.paymentIntents.cancel.mockRejectedValue(new Error('Payment already processed'));
            const result = await cancelStripePayment('sk_test_dummy', 'pi_123');
            expect(result.success).toBe(false);
            expect(result.error).toBe('Payment already processed');
        });
    });
    describe('refundStripePayment', () => {
        it('should refund payment successfully', async () => {
            mockStripeClient.refunds.create.mockResolvedValue({
                id: 'rf_123',
                status: 'succeeded'
            });
            const result = await refundStripePayment('sk_test_dummy', 'pi_123', 500);
            expect(result.success).toBe(true);
            expect(result.id).toBe('rf_123');
            expect(result.status).toBe('succeeded');
            expect(mockStripeClient.refunds.create).toHaveBeenCalledWith({
                payment_intent: 'pi_123',
                amount: 500
            });
        });
        it('should refund full amount when no amount specified', async () => {
            mockStripeClient.refunds.create.mockResolvedValue({
                id: 'rf_123',
                status: 'succeeded'
            });
            const result = await refundStripePayment('sk_test_dummy', 'pi_123');
            expect(result.success).toBe(true);
            expect(mockStripeClient.refunds.create).toHaveBeenCalledWith({
                payment_intent: 'pi_123'
            });
        });
        it('should handle refund errors', async () => {
            mockStripeClient.refunds.create.mockRejectedValue(new Error('Refund failed'));
            const result = await refundStripePayment('sk_test_dummy', 'pi_123');
            expect(result.success).toBe(false);
            expect(result.error).toBe('Refund failed');
        });
    });
});
