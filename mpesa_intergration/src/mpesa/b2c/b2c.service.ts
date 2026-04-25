import { mpesaService } from '../../services/mpesa.service';
import { B2CRequest, MpesaB2CResponse } from '../../types/mpesa.types';

import { formatPhoneNumber } from '../../utils/phone.utils';
import { Env } from '../../index';

class B2CService {
  /**
   * Initiate B2C transaction (Business to Consumer)
   * Send money from business account to customer
   */
  async sendMoney(env: Env, request: B2CRequest, httpRequest?: globalThis.Request): Promise<any> {
    try {
      const conversationId = crypto.randomUUID();
      const timestamp = mpesaService.generateTimestamp();
      const shortcode = env.MPESA_SHORTCODE;
      const passkey = env.MPESA_PASSKEY;

      // Create password from shortcode + passkey + timestamp
      const password = btoa(shortcode + passkey + timestamp);

      const payload = {
        OriginatorConversationID: conversationId,
        InitiatorName: env.MPESA_INITIATOR_NAME,
        SecurityCredential: this.encryptSecurityCredential(env.MPESA_INITIATOR_PASSWORD),
        // use BusinessPayment for regular B2C disbursement
        CommandID: 'BusinessPayment',
        Amount: Math.floor(request.amount),
        PartyA: shortcode,
        PartyB: formatPhoneNumber(request.mobileNumber),
        Remarks: request.description || 'B2C Payment',
        QueueTimeOutURL: env.MPESA_B2C_CALLBACK_URL,
        ResultURL: env.MPESA_B2C_CALLBACK_URL,
        Occasion: 'Payment',
      };

      const response = await mpesaService.makeRequest(env, 'b2c', payload);

      // For Workers, we'll return the response without database storage
      // Database integration can be added later with D1 or external API
      return {
        conversationId,
        responseCode: response.ResponseCode,
        responseDescription: response.ResponseDescription,
        originatorConversationId: response.OriginatorConversationID,
        timestamp: new Date().toISOString(),
        // Note: Database storage removed for Worker compatibility
        // Add D1 or external database integration as needed
      };

    } catch (error) {
      console.error('B2C Service Error:', error);
      throw new Error(`B2C transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Encrypt security credential for B2C transactions
   */
  private encryptSecurityCredential(credential: string): string {
    // For Workers, we'll use a simple base64 encoding
    // In production, you should implement proper encryption
    // This is a placeholder - implement proper RSA encryption for production
    return btoa(credential);
  }
}

export const b2cService = new B2CService();
