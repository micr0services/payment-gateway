import { mpesaService } from '../../services/mpesa.service';
import { C2BRequest, MpesaC2BResponse } from '../../types/mpesa.types';

import { Env } from '../../index';

class C2BService {
  /**
   * Register C2B URLs (Customer to Business)
   * Register validation and confirmation URLs for C2B transactions
   */
  async registerUrls(env: Env, request: C2BRequest): Promise<any> {
    try {
      const timestamp = mpesaService.generateTimestamp();
      const shortcode = env.MPESA_SHORTCODE;
      const passkey = env.MPESA_PASSKEY;

      // Create password from shortcode + passkey + timestamp
      const password = btoa(shortcode + passkey + timestamp);

      const payload = {
        ShortCode: request.shortCode,
        ResponseType: request.responseType,
        ConfirmationURL: request.confirmationUrl,
        ValidationURL: request.validationUrl,
      };

      const response = await mpesaService.makeRequest(env, 'c2b_register', payload);

      // For Workers, we'll return the response without database storage
      // Database integration can be added later with D1 or external API
      return {
        responseCode: response.ResponseCode,
        responseDescription: response.ResponseDescription,
        originatorConversationId: response.OriginatorConversationID,
        conversationId: response.ConversationID,
        timestamp: new Date().toISOString(),
        // Note: Database storage removed for Worker compatibility
        // Add D1 or external database integration as needed
      };

    } catch (error) {
      console.error('C2B Service Error:', error);
      throw new Error(`C2B URL registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Simulate C2B transaction (for testing)
   */
  async simulateC2B(env: Env, request: any): Promise<any> {
    try {
      const conversationId = crypto.randomUUID();
      const timestamp = mpesaService.generateTimestamp();

      const payload = {
        ShortCode: env.MPESA_SHORTCODE,
        CommandID: 'CustomerPayBillOnline',
        Amount: Math.floor(request.amount),
        Msisdn: request.mobileNumber,
        BillRefNumber: request.accountReference || 'Test',
      };

      const response = await mpesaService.makeRequest(env, 'c2b_simulate', payload);

      // For Workers, we'll return the response without database storage
      // Database integration can be added later with D1 or external API
      return {
        conversationId,
        responseCode: response.ResponseCode,
        responseDescription: response.ResponseDescription,
        originatorConversationId: response.OriginatorConversationID,
        mpesaResponse: response,
        // Note: Database storage removed for Worker compatibility
      };
    } catch (error) {
      console.error('C2B Simulation Error:', error);
      throw new Error(`Failed to simulate C2B transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const c2bService = new C2BService();
