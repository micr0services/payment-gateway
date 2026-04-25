import { mpesaService } from '../../services/mpesa.service';
import { STKPushRequest, STKQueryRequest } from '../../types/mpesa.types';

import { formatPhoneNumber } from '../../utils/phone.utils';
import { Env } from '../../index';

class STKService {
  /**
   * Initiate STK Push
   * Prompt customer to enter M-Pesa PIN on their phone
   */
  async initiateSTKPush(env: Env, request: STKPushRequest, httpRequest?: globalThis.Request): Promise<any> {
    try {
      const timestamp = mpesaService.generateTimestamp();
      const shortcode = env.MPESA_SHORTCODE;
      const passkey = env.MPESA_PASSKEY;

      // Create password from shortcode + passkey + timestamp
      const password = btoa(shortcode + passkey + timestamp);

      const payload = {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.floor(request.amount),
        PartyA: formatPhoneNumber(request.mobileNumber),
        PartyB: shortcode,
        PhoneNumber: formatPhoneNumber(request.mobileNumber),
        CallBackURL: env.MPESA_STK_CALLBACK_URL,
        AccountReference: request.accountReference,
        TransactionDesc: request.transactionDesc || 'STK Push Payment',
      };

      const response = await mpesaService.makeRequest(env, 'stk_push', payload);

      return {
        merchantRequestId: response.MerchantRequestID,
        checkoutRequestId: response.CheckoutRequestID,
        responseCode: response.ResponseCode,
        responseDescription: response.ResponseDescription,
        customerMessage: response.CustomerMessage,
        // Note: Database storage removed for Worker compatibility
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('STK Service Error:', error);
      throw new Error(`STK push failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Query STK Push status
   */
  async querySTKStatus(env: Env, request: STKQueryRequest): Promise<any> {
    try {
      const timestamp = mpesaService.generateTimestamp();
      const shortcode = env.MPESA_SHORTCODE;
      const passkey = env.MPESA_PASSKEY;

      // Create password from shortcode + passkey + timestamp
      const password = btoa(shortcode + passkey + timestamp);

      const payload = {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: request.checkoutRequestId,
      };

      const response = await mpesaService.makeRequest(env, 'stk_query', payload);

      return {
        responseCode: response.ResponseCode,
        responseDescription: response.ResponseDescription,
        merchantRequestId: response.MerchantRequestID,
        checkoutRequestId: response.CheckoutRequestID,
        resultCode: response.ResultCode,
        resultDesc: response.ResultDesc,
        // Note: Database storage removed for Worker compatibility
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('STK Query Error:', error);
      throw new Error(`STK query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Query STK Push status (alias for querySTKStatus)
   */
  async querySTKPush(env: Env, request: STKQueryRequest): Promise<any> {
    return this.querySTKStatus(env, request);
  }

  /**
   * Query STK transaction status by conversation ID
   */
  async queryStatus(env: Env, conversationId: string): Promise<any> {
    try {
      // For now, return mock status since we don't have database integration
      // In production, this would query the database for transaction status using conversationId
      const mockStatus = {
        conversationId,
        status: 'PENDING', // SUCCESS, FAILED, PENDING
        responseCode: '0',
        responseDescription: 'The service request is processed successfully.',
        timestamp: new Date().toISOString(),
        note: 'Database integration required for real status queries'
      };

      return {
        success: true,
        message: 'STK transaction status retrieved',
        data: mockStatus
      };

    } catch (error) {
      console.error('STK Status Query Error:', error);
      return {
        success: false,
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to query STK status'
      };
    }
  }
}

export const stkService = new STKService();
