import { mpesaService } from '../../services/mpesa.service';
import { Env } from '../../index';

interface B2BRequest {
  receiverPartyPublicID: string;
  amount: number;
  description?: string;
  accountReference?: string;
}

class B2BService {
  /**
   * Initiate B2B transaction (Business to Business)
   * Send money from business account to another business account
   */
  async initiateB2B(env: Env, request: B2BRequest): Promise<any> {
    try {
      const conversationId = crypto.randomUUID();
      const timestamp = mpesaService.generateTimestamp();
      const shortcode = env.MPESA_SHORTCODE;

      const payload = {
        Initiator: env.MPESA_INITIATOR_NAME,
        SecurityCredential: this.encryptSecurityCredential(env.MPESA_INITIATOR_PASSWORD),
        CommandID: 'BusinessPayBill',
        SenderIdentifierType: '4', // 4 = Short Code
        ReceiverIdentifierType: '4', // 4 = Short Code
        Amount: Math.floor(request.amount),
        PartyA: shortcode,
        PartyB: request.receiverPartyPublicID,
        AccountReference: request.accountReference || 'B2B Payment',
        Remarks: request.description || 'B2B Transfer',
        QueueTimeOutURL: env.MPESA_B2B_CALLBACK_URL,
        ResultURL: env.MPESA_B2B_CALLBACK_URL,
      };

      const response = await mpesaService.makeRequest(env, 'b2b', payload);

      return {
        conversationId,
        responseCode: response.ResponseCode,
        responseDescription: response.ResponseDescription,
        originatorConversationId: response.OriginatorConversationID,
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      console.error('B2B Service Error:', error);
      throw new Error(`B2B transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Encrypt security credential for B2B transactions
   */
  private encryptSecurityCredential(credential: string): string {
    // For Workers, we'll use a simple base64 encoding
    // In production, you should implement proper encryption
    return btoa(credential);
  }
}

export const b2bService = new B2BService();
