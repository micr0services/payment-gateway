import { b2cService } from '../b2c/b2c.service';
import { Env } from '../../index';

export async function handleB2CRoutes(request: Request, env: Env, path: string): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Handle B2C send endpoint
  if (request.method === 'POST' && path === '/api/b2c/send') {
    try {
      const body = await request.json();
      const { mobileNumber, amount, description, callbackUrl, cancelUrl } = body;

      if (!mobileNumber || !amount) {
        return new Response(JSON.stringify({
          error: 'Validation Error',
          message: 'Mobile number and amount are required',
          required: ['mobileNumber', 'amount']
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Validate mobile number format
      if (!/^254[0-9]{9}$/.test(mobileNumber) && !/^0[0-9]{9}$/.test(mobileNumber)) {
        return new Response(JSON.stringify({
          error: 'Validation Error',
          message: 'Invalid mobile number format. Use 254XXXXXXXXX or 0XXXXXXXXX',
          example: '254712345678'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Validate amount
      if (amount <= 0 || amount > 150000) {
        return new Response(JSON.stringify({
          error: 'Validation Error',
          message: 'Amount must be between 1 and 150,000 KES',
          min: 1,
          max: 150000
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Validate callback URL if provided
      if (callbackUrl) {
        try {
          new URL(callbackUrl);
        } catch (e) {
          return new Response(JSON.stringify({
            error: 'Validation Error',
            message: 'Invalid callback URL format',
            example: 'https://your-app.com/webhooks/mpesa'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      // Validate cancel URL if provided
      if (cancelUrl) {
        try {
          new URL(cancelUrl);
        } catch (e) {
          return new Response(JSON.stringify({
            error: 'Validation Error',
            message: 'Invalid cancel URL format',
            example: 'https://your-app.com/webhooks/mpesa/cancel'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      const result = await b2cService.sendMoney(env, {
        mobileNumber,
        amount,
        description: description || 'Payment',
        callbackUrl,
        cancelUrl
      }, request);

      return new Response(JSON.stringify({
        success: true,
        message: 'B2C transaction initiated successfully',
        data: result,
        callbackUrlRegistered: !!callbackUrl,
        cancelUrlRegistered: !!cancelUrl,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('B2C route error:', error);

      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to process B2C transaction',
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // Handle B2C status query endpoint
  if (request.method === 'GET' && path.startsWith('/api/b2c/status/')) {
    try {
      const conversationId = path.split('/api/b2c/status/')[1];

      if (!conversationId) {
        return new Response(JSON.stringify({
          error: 'Validation Error',
          message: 'Conversation ID is required',
          example: '/api/b2c/status/ABC123'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // For now, return mock status since we don't have database integration
      // In production, this would query the database for transaction status
      const mockStatus = {
        conversationId,
        status: 'PENDING', // SUCCESS, FAILED, PENDING
        responseCode: '0',
        responseDescription: 'Transaction initiated successfully',
        timestamp: new Date().toISOString(),
        note: 'Database integration required for real status queries'
      };

      return new Response(JSON.stringify({
        success: true,
        message: 'B2C transaction status retrieved',
        data: mockStatus,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('B2C status error:', error);

      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to query B2C status',
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // Method not allowed for this path
  return new Response(JSON.stringify({
    error: 'Method not allowed',
    message: `Method ${request.method} not allowed for ${path}. Supported: POST /api/b2c/send, GET /api/b2c/status/:conversationId`
  }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
