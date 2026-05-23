import { mpesaService } from '../../services/mpesa.service';
import { Env } from '../../index';
import { formatPhoneNumber } from '../../utils/phone.utils';

interface B2PochiRequest {
  mobileNumber: string;
  amount: number;
  description?: string;
}

class B2PochiService {
  /**
   * Send money from business to Pochi account
   * B2Pochi is a direct customer payment for goods and services
   */
  async sendToPochi(env: Env, request: B2PochiRequest): Promise<any> {
    try {
      const conversationId = crypto.randomUUID();
      const timestamp = mpesaService.generateTimestamp();
      const shortcode = env.MPESA_SHORTCODE;

      // Create password from shortcode + passkey + timestamp
      const password = btoa(shortcode + env.MPESA_PASSKEY + timestamp);

      const payload = {
        OriginatorConversationID: conversationId,
        InitiatorName: env.MPESA_INITIATOR_NAME,
        SecurityCredential: this.encryptSecurityCredential(env.MPESA_INITIATOR_PASSWORD),
        CommandID: 'BusinessPayment',
        Amount: Math.floor(request.amount),
        PartyA: shortcode,
        PartyB: formatPhoneNumber(request.mobileNumber),
        Remarks: request.description || 'B2Pochi Payment',
        QueueTimeOutURL: env.MPESA_B2POCHI_CALLBACK_URL,
        ResultURL: env.MPESA_B2POCHI_CALLBACK_URL,
        Occasion: 'Payment',
      };

      const response = await mpesaService.makeRequest(env, 'b2c', payload);

      return {
        conversationId,
        responseCode: response.ResponseCode,
        responseDescription: response.ResponseDescription,
        originatorConversationId: response.OriginatorConversationID,
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      console.error('B2Pochi Service Error:', error);
      throw new Error(`B2Pochi transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Encrypt security credential for B2Pochi transactions
   */
  private encryptSecurityCredential(credential: string): string {
    // For Workers, we'll use a simple base64 encoding
    // In production, you should implement proper encryption
    // This is a placeholder - implement proper RSA encryption for production
    return btoa(credential);
  }
}

export const b2pochiService = new B2PochiService();
