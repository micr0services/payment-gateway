import { mpesaService } from '../../services/mpesa.service';
import { Env } from '../../index';

interface ReversalRequest {
  transactionId: string;
  amount: number;
  receiverParty: string;
  remarks?: string;
  occasion?: string;
}

class ReversalService {
  /**
   * Initiate a transaction reversal
   * Reverse a completed M-Pesa transaction
   */
  async initiateReversal(env: Env, request: ReversalRequest): Promise<any> {
    try {
      const conversationId = crypto.randomUUID();
      const timestamp = mpesaService.generateTimestamp();

      const payload = {
        Initiator: env.MPESA_INITIATOR_NAME,
        SecurityCredential: this.encryptSecurityCredential(env.MPESA_INITIATOR_PASSWORD),
        CommandID: 'TransactionReversal',
        TransactionID: request.transactionId,
        Amount: Math.floor(request.amount),
        ReceiverParty: request.receiverParty,
        RecieverIdentifierType: '4', // Always 4 for shortcode reversals
        QueueTimeOutURL: env.MPESA_REVERSAL_CALLBACK_URL,
        ResultURL: env.MPESA_REVERSAL_CALLBACK_URL,
        Remarks: request.remarks || 'Transaction Reversal',
        Occasion: request.occasion || 'Reversal',
      };

      const response = await mpesaService.makeRequest(env, 'reversal', payload);

      return {
        conversationId,
        responseCode: response.ResponseCode,
        responseDescription: response.ResponseDescription,
        originatorConversationId: response.OriginatorConversationID,
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      console.error('Reversal Service Error:', error);
      throw new Error(`Reversal transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Encrypt security credential for reversal transactions
   */
  private encryptSecurityCredential(credential: string): string {
    // For Workers, we'll use a simple base64 encoding
    // In production, you should implement proper encryption
    // This is a placeholder - implement proper RSA encryption for production
    return btoa(credential);
  }
}

export const reversalService = new ReversalService();
