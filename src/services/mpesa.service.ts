import { MpesaTokenResponse } from '../types/mpesa.types';
import { Env } from '../index';

class MpesaService {
  private accessToken: string = '';
  private tokenExpiry: number = 0;

  /**
   * Get M-Pesa access token
   */
  async getAccessToken(env: Env): Promise<string> {
    try {
      // Return cached token if still valid (with 5 minute buffer)
      if (this.accessToken && Date.now() < this.tokenExpiry - 300000) {
        return this.accessToken;
      }

      const auth = btoa(`${env.MPESA_CONSUMER_KEY}:${env.MPESA_CONSUMER_SECRET}`);

      const baseUrl = env.MPESA_ENVIRONMENT === 'production'
        ? 'https://api.safaricom.co.ke'
        : 'https://sandbox.safaricom.co.ke';

      const response = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
        method: 'GET',
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => 'Unable to read body');
        throw new Error(`Failed to get access token: ${response.status} ${response.statusText} ${errorBody}`);
      }

      const data: MpesaTokenResponse = await response.json();

      this.accessToken = data.access_token;
      // Token expires in 3600 seconds (1 hour), cache for 50 minutes
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);

      return this.accessToken;

    } catch (error) {
      console.error('Error getting M-Pesa access token:', error);
      throw new Error(`Failed to authenticate with M-Pesa: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Make authenticated request to M-Pesa API
   */
  async makeRequest(env: Env, endpoint: string, payload: any): Promise<any> {
    try {
      const token = await this.getAccessToken(env);

      const baseUrl = env.MPESA_ENVIRONMENT === 'production'
        ? 'https://api.safaricom.co.ke'
        : 'https://sandbox.safaricom.co.ke';

      const endpointMap: { [key: string]: string } = {
        'b2c': '/mpesa/b2c/v1/paymentrequest',
        'c2b_register': '/mpesa/c2b/v1/registerurl',
        'c2b_simulate': '/mpesa/c2b/v1/simulate',
        'b2b': '/mpesa/b2b/v1/paymentrequest',
        'stk_push': '/mpesa/stkpush/v1/processrequest',
        'stk_query': '/mpesa/stkpushquery/v1/query',
        'reversal': '/mpesa/reversal/v1/request',
      };

      const apiEndpoint = endpointMap[endpoint];
      if (!apiEndpoint) {
        throw new Error(`Unknown endpoint: ${endpoint}`);
      }

      const response = await fetch(`${baseUrl}${apiEndpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(`M-Pesa API error: ${response.status} - ${JSON.stringify(responseData)}`);
      }

      return responseData;

    } catch (error) {
      console.error(`M-Pesa ${endpoint} request failed:`, error);
      throw error;
    }
  }

  /**
   * Generate timestamp for M-Pesa requests
   */
  generateTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hour}${minute}${second}`;
  }
}

export const mpesaService = new MpesaService();
